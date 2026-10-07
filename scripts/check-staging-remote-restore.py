"""One-shot isolated recovery drill; never attaches resources to an application."""
import hashlib,json,os,sqlite3,subprocess,urllib.request,uuid,sys
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
ACCOUNT='dcb411ece67dfdfb730635133ed31825'
BASE='https://api.cloudflare.com/client/v4/accounts/'+ACCOUNT
REPORT=ROOT/'deployment/staging-remote-restore-verification-20261007.json'
BACKUP=Path('/tmp/urbanprocures-advanced-staging-checkpoint-20261007.sql')
FILES=Path('/tmp/urbanprocures-advanced-staging-r2-backup-20261007')
resume='--resume-created-database' in sys.argv
assert resume or not REPORT.exists(), 'Existing recovery drill requires inspection, not recreation'
sql=BACKUP.read_bytes()
evidence=json.loads((ROOT/'deployment/staging-backup-verification-20261007.json').read_text())
assert hashlib.sha256(sql).hexdigest()==evidence['sha256']
assert evidence['databaseId']=='eb82db72-864e-4835-b230-3903f77706f2'
db=sqlite3.connect(':memory:');db.executescript(sql.decode())
suffix=uuid.uuid4().hex[:10]
name='urbanprocures-advanced-staging-recovery-20261007-'+suffix
report=json.loads(REPORT.read_text()) if resume else {'startedAt':datetime.now(timezone.utc).isoformat(),'databaseName':name+'-db','bucketName':'upa-staging-recovery-20261007-'+suffix+'-docs','productionModified':False,'applicationBindingsModified':False,'snapshotSha256':evidence['sha256'],'status':'started'}
if resume:
 assert report['status']=='failed' and report.get('databaseId')
 assert report['snapshotSha256']==evidence['sha256']
 assert report['databaseName'].startswith('urbanprocures-advanced-staging-recovery-20261007-')
 report['bucketName']='upa-staging-recovery-20261007-'+report['databaseName'].split('-')[-2]+'-docs'
def save(): REPORT.write_text(json.dumps(report,indent=2)+'\n')
def api(path,method='GET',body=None):
 request=urllib.request.Request(BASE+path,method=method,headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'},data=None if body is None else json.dumps(body).encode())
 with urllib.request.urlopen(request,timeout=60) as response: result=json.load(response)
 assert result['success'], 'Cloudflare operation rejected; provider body withheld'
 return result['result']
env=dict(os.environ,CLOUDFLARE_ACCOUNT_ID=ACCOUNT,XDG_CONFIG_HOME='/workspace/.config',WRANGLER_SEND_METRICS='false')
def wrangler(*args):
 result=subprocess.run(['npx','--no-install','wrangler',*args],cwd=ROOT,env=env,capture_output=True)
 assert result.returncode==0,'Recovery command failed; raw output withheld'
 return result.stdout

try:
 wrangler_config='urbanprocures advanced/workers/wrangler.staging.toml'
 subprocess.run(['node','scripts/check-isolation.mjs','--remote','--config',wrangler_config],cwd=ROOT,check=True,capture_output=True)
 existing=api('/d1/database?per_page=100')
 if resume:
  assert any(row['name']==report['databaseName'] and row['uuid']==report['databaseId'] for row in existing)
  tables=api('/d1/database/'+report['databaseId']+'/query','POST',{'sql':"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%'"})
  assert not tables[0]['results'], 'Recovery database must still be empty before import'
 else: assert all(row['name']!=report['databaseName'] for row in existing)
 buckets=api('/r2/buckets?per_page=1000')['buckets']
 if report.get('bucketCreated'): assert any(row['name']==report['bucketName'] for row in buckets)
 else: assert all(row['name']!=report['bucketName'] for row in buckets)
 save()
 if not resume:
  created=api('/d1/database','POST',{'name':report['databaseName']})
  report['databaseId']=created['uuid'];save()
 assert report['databaseId']!=evidence['databaseId']
 if not report.get('bucketCreated'):
  api('/r2/buckets','POST',{'name':report['bucketName']});report['bucketCreated']=True;save()
 # Wrangler's bulk import reset currently fails with D1_RESET_DO. Restore the
 # verified SQLite snapshot through D1's supported parameterized query API.
 # All writes remain restricted to the manifest's newly-created empty DB.
 query_path='/d1/database/'+report['databaseId']+'/query'
 tables=[t for (t,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'")]
 for table in tables:
  assert table.replace('_','').isalnum()
  ddl=db.execute('SELECT sql FROM sqlite_master WHERE type=\'table\' AND name=?',(table,)).fetchone()[0]
  api(query_path,'POST',{'sql':ddl})
 remaining=set(tables);loaded=set()
 while remaining:
  eligible=sorted(t for t in remaining if set(row[2] for row in db.execute('PRAGMA foreign_key_list("'+t+'")'))<=loaded)
  assert eligible,'Snapshot contains cyclic foreign-key dependencies'
  for table in eligible:
   rows=db.execute('SELECT * FROM "'+table+'"').fetchall()
   cols=len(db.execute('PRAGMA table_info("'+table+'")').fetchall())
   batch_size=max(1,90//cols)
   for start in range(0,len(rows),batch_size):
    batch=rows[start:start+batch_size]
    statement='INSERT INTO "'+table+'" VALUES '+','.join('('+','.join('?' for _ in range(cols))+')' for _ in batch)
    api(query_path,'POST',{'sql':statement,'params':[value for row in batch for value in row]})
   loaded.add(table);remaining.remove(table)
 for (ddl,) in db.execute("SELECT sql FROM sqlite_master WHERE type IN ('index','trigger') AND sql IS NOT NULL"):
  api(query_path,'POST',{'sql':ddl})
 assert not api(query_path,'POST',{'sql':'PRAGMA foreign_key_check'})[0]['results']
 report['restoreMethod']='D1 parameterized query API; tables, dependency-ordered data, indexes and triggers'
 expected={t:db.execute('SELECT COUNT(*) FROM '+t).fetchone()[0] for (t,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'")}
 for table,count in expected.items():
  # Only names obtained from the verified backup schema enter SQL.
  assert table.replace('_','').isalnum()
  result=api('/d1/database/'+report['databaseId']+'/query','POST',{'sql':'SELECT COUNT(*) AS n FROM "'+table+'"'})
  assert result[0]['results'][0]['n']==count
 report['remoteTableCountsMatched']=len(expected);save()
 count=0
 for ident,key,size,digest,content_type in db.execute('SELECT id,r2_object_key,file_size_bytes,sha256_hash,file_type FROM rfq_documents'):
  data=(FILES/ident).read_bytes();assert len(data)==size
  if digest: assert hashlib.sha256(data).hexdigest()==digest
  target=report['bucketName']+'/'+key
  wrangler('r2','object','put',target,'--remote','--file',str(FILES/ident),'--content-type',content_type,'--config',wrangler_config)
  restored=FILES/(ident+'.restored')
  wrangler('r2','object','get',target,'--remote','--file',str(restored),'--config',wrangler_config)
  os.chmod(restored,0o600);assert restored.read_bytes()==data;count+=1
  report['remoteObjectsRestoredAndMatched']=count;save()
 report['status']='passed'
except Exception as error:
 report['status']='failed';report['errorType']=type(error).__name__
 raise
finally:
 report['completedAt']=datetime.now(timezone.utc).isoformat();save()
 print(json.dumps({key:report.get(key) for key in ['status','databaseName','databaseId','bucketName','remoteTableCountsMatched','remoteObjectsRestoredAndMatched','productionModified','applicationBindingsModified']}))
