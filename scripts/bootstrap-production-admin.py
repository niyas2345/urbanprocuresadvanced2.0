"""Bootstrap exactly the approved owner in the new empty production database."""
import hashlib,json,os,secrets,subprocess,urllib.request,uuid
from datetime import datetime,timezone
from pathlib import Path
root=Path(__file__).resolve().parent.parent
subprocess.run(['node','scripts/check-production-isolation.mjs'],cwd=root,check=True)
record_path=root/'deployment/advanced-production-resources.json'
record=json.loads(record_path.read_text());assert record['createdNew'] and not record.get('ownerAdminBootstrapped')
assert record['databaseId']=='3412487b-954b-4f21-92d3-20d85d30dc11'
email=os.environ.get('ADMIN_BOOTSTRAP_EMAIL');password=os.environ.get('ADMIN_INITIAL_PASSWORD')
assert email=='urbanprocures@urbanprocures.com' and password and 16<=len(password)<=128,'Required approved Admin runtime bindings unavailable'
url='https://api.cloudflare.com/client/v4/accounts/'+record['accountId']+'/d1/database/'+record['databaseId']+'/query'
def query(sql,params=[]):
 req=urllib.request.Request(url,method='POST',headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'},data=json.dumps({'sql':sql,'params':params}).encode())
 with urllib.request.urlopen(req,timeout=30) as response:d=json.load(response)
 assert d['success'],'Bootstrap rejected; provider body withheld'
 return d['result'][0]['results']
assert query('SELECT COUNT(*) AS n FROM d1_migrations')[0]['n']==10
assert query("SELECT COUNT(*) AS n FROM users WHERE role IN ('admin','vendor','contractor')")[0]['n']==0
salt=secrets.token_hex(32);digest=hashlib.pbkdf2_hmac('sha256',password.encode(),salt.encode(),100000,32).hex()
ident=str(uuid.uuid4());now=datetime.now(timezone.utc).isoformat()
query('INSERT INTO users(id,email,password_hash,salt,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',[ident,email,digest,salt,'admin','active',now,now])
query('INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES(?,?,?,?,?,?,?,?)',[str(uuid.uuid4()),ident,'admin','OWNER_ADMIN_BOOTSTRAP','user',ident,'{}',now])
record.update(ownerAdminBootstrapped=True,migrationsApplied=10,qaDataCopied=False)
record_path.write_text(json.dumps(record,indent=2)+'\n')
print('Approved production owner Admin bootstrapped; no credential values displayed or stored in Git.')
