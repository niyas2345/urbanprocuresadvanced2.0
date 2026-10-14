from cf import cf,ACCOUNT
from pathlib import Path
import json,uuid,hashlib,secrets,datetime,urllib.error,sys
P=Path(__file__).resolve().parent
name='urbanprocures-quotation-validation-20261014'
state=P/'build/staging-state.json'
if state.exists(): cfg=json.loads(state.read_text())
else:
 d=json.loads(cf(f'/accounts/{ACCOUNT}/d1/database','POST',{'name':name}))
 cfg={'worker':name,'database':d['result']['uuid'],'bucket':name+'-documents'}
 state.write_text(json.dumps(cfg));cf(f'/accounts/{ACCOUNT}/r2/buckets','POST',{'name':cfg['bucket']})
def query(sql,params=[]):
 r=json.loads(cf(f'/accounts/{ACCOUNT}/d1/database/{cfg["database"]}/query','POST',{'sql':sql,'params':params}))
 if not r.get('success'):raise RuntimeError('Staging SQL failed')
 return r['result']
fixture=json.loads((P/'build/staging-fixtures.json').read_text())
for schema in fixture['schema']:query(schema.replace('CREATE TABLE ','CREATE TABLE IF NOT EXISTS ',1))
query((P/'quotation-schema.sql').read_text())
for table,rows in fixture['rows'].items():
 for row in rows:
  query(f'INSERT OR IGNORE INTO {table} ({",".join(row)}) VALUES ({",".join("?" for _ in row)})',list(row.values()))
for row in fixture['rows']['rfq_workbook_revisions']:
 query('UPDATE rfq_workbook_revisions SET content_json=?,file_sha256=?,content_sha256=? WHERE id=?',[row['content_json'],row['file_sha256'],row['content_sha256'],row['id']])
# Synthetic fixture sessions only. Never print credentials or place them in version control.
if 'tokens' not in cfg:
 cfg['tokens']={role:secrets.token_hex(32) for role in ['admin','vendor','contractor','outsider']}
 state.write_text(json.dumps(cfg))
for role,token in cfg['tokens'].items():
 user={'admin':'admin','vendor':'vendor-user','contractor':'contractor-user','outsider':'other-contractor'}[role]
 expiry=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=4)).isoformat().replace('+00:00','Z')
 query('INSERT OR REPLACE INTO auth_sessions(token,user_id,role,expires_at,created_at) VALUES(?,?,?,?,?)',[hashlib.sha256(token.encode()).hexdigest(),user,'contractor' if role=='outsider' else role,expiry,datetime.datetime.now(datetime.timezone.utc).isoformat()])
sub=json.loads(cf(f'/accounts/{ACCOUNT}/workers/subdomain'))['result']['subdomain'];host=name+'.'+sub+'.workers.dev';cfg['origin']='https://'+host;state.write_text(json.dumps(cfg))
metadata={'main_module':'worker.mjs','compatibility_date':'2026-10-01','compatibility_flags':['nodejs_compat'],'bindings':[{'name':'DB','type':'d1','id':cfg['database']},{'name':'DOCUMENTS_BUCKET','type':'r2_bucket','bucket_name':cfg['bucket']},{'name':'ENVIRONMENT','type':'plain_text','text':'advanced-staging'},{'name':'PLATFORM_DOMAIN','type':'plain_text','text':host},{'name':'PUBLIC_APP_ORIGIN','type':'plain_text','text':'https://'+host},{'name':'EXCEL_RFQ_ENABLED','type':'plain_text','text':'true'},{'name':'EMAIL_DELIVERY_ENABLED','type':'plain_text','text':'false'}]}
if '--ai' in sys.argv:metadata['bindings'].append({'name':'AI','type':'ai'})
boundary='up-'+uuid.uuid4().hex
body=(f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n'+json.dumps(metadata)+f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="worker.mjs"; filename="worker.mjs"\r\nContent-Type: application/javascript+module\r\n\r\n').encode()+(P/'build/worker.mjs').read_bytes()+f'\r\n--{boundary}--\r\n'.encode()
try:r=json.loads(cf(f'/accounts/{ACCOUNT}/workers/scripts/{name}','PUT',body,'multipart/form-data; boundary='+boundary));print('Isolated Worker upload',r.get('success'))
except urllib.error.HTTPError as e:
 data=json.loads(e.read());print('Staging upload failed',e.code,data.get('errors'));raise SystemExit(1)
cf(f'/accounts/{ACCOUNT}/workers/scripts/{name}/subdomain','POST',{'enabled':True,'previews_enabled':False})
print('Isolated staging ready',cfg['origin'])
