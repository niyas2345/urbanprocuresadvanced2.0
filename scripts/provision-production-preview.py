"""Create new Advanced resources only after recorded staging acceptance."""
import json,os,subprocess,urllib.request
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parent.parent
path=root/'deployment/advanced-production-resources.json'
assert not path.exists(),'Production preview manifest already exists; inspect, never recreate'
subprocess.run(['node','scripts/check-production-isolation.mjs','--provision'],cwd=root,check=True)
account='dcb411ece67dfdfb730635133ed31825'
base='https://api.cloudflare.com/client/v4/accounts/'+account
def api(endpoint,body=None):
 req=urllib.request.Request(base+endpoint,headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'},method='GET' if body is None else 'POST',data=None if body is None else json.dumps(body).encode())
 with urllib.request.urlopen(req,timeout=30) as response:d=json.load(response)
 assert d['success'],'Cloudflare operation rejected; response withheld'
 return d['result']
record={'accountId':account,'workerName':'urbanprocures-advanced-production-20261007','databaseName':'urbanprocures-advanced-production-20261007-db','bucketName':'urbanprocures-advanced-production-20261007-documents','createdNew':True,'createdAt':datetime.now(timezone.utc).isoformat(),'existingProductionModified':False,'stagingBindingsModified':False,'domainCutover':False}
assert not any(r['id']==record['workerName'] for r in api('/workers/scripts'))
assert not any(r['name']==record['databaseName'] for r in api('/d1/database?per_page=100'))
assert not any(r['name']==record['bucketName'] for r in api('/r2/buckets?per_page=1000')['buckets'])
path.write_text(json.dumps(record,indent=2)+'\n')
created=api('/d1/database',{'name':record['databaseName']});record['databaseId']=created['uuid'];path.write_text(json.dumps(record,indent=2)+'\n')
assert record['databaseId'] not in ['eb82db72-864e-4835-b230-3903f77706f2','15f861d6-4a86-445e-b56a-66d1b3bc04ba','cc56fc57-e3cf-43cf-831d-7820c9ca15ae']
api('/r2/buckets',{'name':record['bucketName']});record['bucketCreated']=True;path.write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record))
