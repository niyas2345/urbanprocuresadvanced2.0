"""Attach the approved routes; keep Advanced routing on failure per owner instruction."""
import json,os,subprocess,urllib.request
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parent.parent
zone='01e244afa455228e04c47e78174d76f1'
worker='urbanprocures-advanced-production-20261007'
def api(path,body=None,method=None):
 req=urllib.request.Request('https://api.cloudflare.com/client/v4'+path,data=None if body is None else json.dumps(body).encode(),method=method or ('GET' if body is None else 'POST'),headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=60) as response:data=json.load(response)
 assert data['success'],'Cloudflare operation failed'
 return data['result']
def run(args):subprocess.run(args,cwd=root,check=True)
run(['node','scripts/check-production-isolation.mjs','--cutover'])
inventory=json.loads((root/'deployment/production-cutover-readonly-inventory-20261007.json').read_text())
assert not api(f'/zones/{zone}/workers/routes'),'Do not overwrite existing routes'
for expected in inventory['dns']:
 actual=api(f'/zones/{zone}/dns_records/'+expected['id'])
 assert all(actual[k]==expected[k] for k in ['id','name','type','content','proxied','ttl'])
assert api(f'/zones/{zone}/settings/always_use_https')['value']=='on'
report={'startedAt':datetime.now(timezone.utc).isoformat(),'worker':worker,'zoneId':zone,'routes':[],'dnsModified':False,'pagesModified':False,'status':'in-progress'}
report_path=root/'deployment/production-domain-cutover-20261007.json'
def save():report_path.write_text(json.dumps(report,indent=2)+'\n')
try:
 for pattern in ['urbanprocures.com/*','www.urbanprocures.com/*']:
  route=api(f'/zones/{zone}/workers/routes',{'pattern':pattern,'script':worker})
  report['routes'].append({'id':route['id'],'pattern':pattern,'script':worker});save()
 for args in [[],['--www']]:run(['node','scripts/check-production-preview.mjs','--live',*args])
 report['status']='passed';report['fallbackPolicy']='Owner requires Advanced only; retire the legacy site after successful live verification.'
except BaseException:
 report['status']='verification-failed';report['legacyFallbackRestored']=False
 raise
finally:
 report['completedAt']=datetime.now(timezone.utc).isoformat();save()
print(json.dumps(report))
