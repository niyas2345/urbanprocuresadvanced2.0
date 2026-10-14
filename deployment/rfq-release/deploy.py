from cf import cf,query,ACCOUNT,WORKER
from pathlib import Path
from email.parser import BytesParser
from email.policy import default
import json,subprocess,hashlib,uuid,urllib.error
P=Path(__file__).resolve().parent
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=P).decode().strip()
if subprocess.check_output(['git','status','--porcelain','--untracked-files=no'],cwd=P).strip():raise RuntimeError('Commit release changes before deployment')
base=f'/accounts/{ACCOUNT}/workers/scripts/{WORKER}'
current=cf(base)
# Compare the known recovered module bytes without printing any source or document contents.
# The GET response is multipart; the module byte sequence must be unchanged.
expected=(P/'recovery/pre-refresh-worker.mjs').read_bytes()
if expected not in current:raise RuntimeError('Production changed since recovery. Reinspect before deployment.')
settings=json.loads(cf(base+'/settings'))['result']
byname={b['name']:b for b in settings['bindings']}
assert byname['DB']['id']=='3412487b-954b-4f21-92d3-20d85d30dc11'
assert byname['DOCUMENTS_BUCKET']['bucket_name']=='urbanprocures-advanced-production-20261007-documents'
assert byname['SOURCE_COMMIT']['text']=='d3b1c24bc3c4bb8aac26ba54ce468244c4080f72'
schedules=json.loads(cf(base+'/schedules'))
bindings=[]
for b in settings['bindings']:
 t=b['type'];name=b['name']
 if t in ['secret_text','assets']:continue
 if t=='plain_text':bindings.append({**b,'text':commit if name=='SOURCE_COMMIT' else b['text']})
 elif t=='ai':bindings.append({'name':name,'type':t})
 elif t=='d1':bindings.append({'name':name,'type':t,'id':b['id']})
 elif t=='r2_bucket':bindings.append({'name':name,'type':t,'bucket_name':b['bucket_name']})
 else:raise RuntimeError('Unexpected binding type; inspect before deploy: '+t)
metadata={k:settings[k] for k in ['compatibility_date','compatibility_flags','usage_model','tags','tail_consumers','logpush','observability','limits'] if k in settings}
metadata.update({'main_module':'worker.mjs','bindings':bindings,'keep_assets':True,'keep_bindings':['secret_text','assets'],'annotations':{'workers/message':'Fix portal statistics and accepting-bids filter; owner-authorized RFQ removal'}})
# Additive schema only. No direct publication, approval or business-state mutation.
query((P/'quotation-schema.sql').read_text())
boundary='up-'+uuid.uuid4().hex
body=(f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n'+json.dumps(metadata)+f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="worker.mjs"; filename="worker.mjs"\r\nContent-Type: application/javascript+module\r\n\r\n').encode()+(P/'build/worker.mjs').read_bytes()+f'\r\n--{boundary}--\r\n'.encode()
try:r=json.loads(cf(base,'PUT',body,'multipart/form-data; boundary='+boundary))
except urllib.error.HTTPError as e:print('Production upload rejected',e.code,json.loads(e.read()).get('errors'));raise SystemExit(1)
if not r.get('success'):raise RuntimeError('Production upload failed')
after=json.loads(cf(base+'/settings'))['result'];afterNames={b['name']:b for b in after['bindings']}
assert set(afterNames)==set(byname)
for name,b in byname.items():
 if name=='SOURCE_COMMIT':assert afterNames[name]['text']==commit
 else:assert afterNames[name]==b,(name,'binding changed')
assert json.loads(cf(base+'/schedules'))==schedules
remote=cf(base);assert (P/'build/worker.mjs').read_bytes() in remote
result={'commit':commit,'deployment':json.loads(cf(base+'/deployments'))['result']['deployments'][0],'workerSha256':hashlib.sha256((P/'build/worker.mjs').read_bytes()).hexdigest(),'bindingsPreserved':True,'schedulesPreserved':True}
(P/'build/production-deployment.json').write_text(json.dumps(result,indent=2));print('Deployed commit',commit);print('Preserved all bindings, secrets, assets and schedule; source read-back matches')
