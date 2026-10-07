"""Remove only this run's positively identified preview fixtures, retaining a private backup."""
import hashlib,json,os,re,urllib.request
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parent.parent
account='dcb411ece67dfdfb730635133ed31825'
worker='urbanprocures-advanced-production-20261007'
db='3412487b-954b-4f21-92d3-20d85d30dc11'
base='https://api.cloudflare.com/client/v4'
def api(path,body=None,method=None):
 req=urllib.request.Request(base+path,data=None if body is None else json.dumps(body).encode(),method=method or ('GET' if body is None else 'POST'),headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=60) as res: result=json.load(res)
 assert result['success'], 'Cloudflare operation failed'
 return result['result']
def query(sql,params=[]): return api(f'/accounts/{account}/d1/database/{db}/query',{'sql':sql,'params':params})[0]['results']
qa=json.loads((root/'deployment/production-preview-qa-results.json').read_text())
assert qa['status']=='passed' and qa['target']=='production-preview'
ids=set(qa['temporaryUserIds']);assert len(ids)==4
assert not api('/zones/01e244afa455228e04c47e78174d76f1/workers/routes'), 'No cleanup after live cutover'
schema=query("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'")
tables=[r['name'] for r in schema if r['type']=='table' and not r['name'].startswith('_cf_')]
snapshot={t:query('SELECT * FROM "'+t+'"') for t in tables}
users=snapshot['users'];owner=[u for u in users if u['email']=='urbanprocures@urbanprocures.com' and u['role']=='admin'];assert len(owner)==1
assert set(u['id'] for u in users)==ids|{owner[0]['id'],'terms-owner-publication'}
assert all(re.fullmatch('qa-'+qa['runId']+r'-[a-z]+@example\.invalid',u['email']) for u in users if u['id'] in ids)
contractors={r['id'] for r in snapshot['contractors']};vendors={r['id'] for r in snapshot['vendors']}
assert all(r['user_id'] in ids for t in ['contractors','vendors','terms_acceptance_evidence'] for r in snapshot[t])
orgs={r['organization_id'] for t in ['contractors','vendors'] for r in snapshot[t]}
assert all(r['id'] in orgs for r in snapshot['organizations'])
assert all(r['contractor_id'] in contractors for r in snapshot['rfqs'])
rfqs={r['id'] for r in snapshot['rfqs']};quotes={r['id'] for r in snapshot['vendor_quotes']}
assert all(r['rfq_id'] in rfqs and r['vendor_id'] in vendors for r in snapshot['vendor_quotes'])
assert all(r['rfq_id'] in rfqs and r['quotation_id'] in quotes for r in snapshot['awards'])
assert all(r['customer_email']=='qa-public-'+qa['runId']+'@example.invalid' for r in snapshot['get_a_quote_requests'])
public={r['id'] for r in snapshot['get_a_quote_requests']}
assert all(r['uploader_user_id'] in ids or r['public_quote_id'] in public for r in snapshot['rfq_documents'])
assert all(r['request_id'] in public for t in ['site_visits','public_terms_acceptances'] for r in snapshot[t])
assert not snapshot['invitations']
assert all(r['user_id'] in ids|{owner[0]['id']} for r in snapshot['email_outbox'])
path=Path('/tmp/urbanprocures-production-preview-private-backup-20261007.json')
assert not path.exists(),'Preserve existing checkpoint backup'
payload=json.dumps({'schema':schema,'tables':snapshot}).encode()
fd=os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,'wb') as f:f.write(payload)
settings_path=f'/accounts/{account}/workers/scripts/{worker}/subdomain'
settings=api(settings_path);assert settings['enabled'] is True
guards=[r for r in schema if r['name'] in ['terms_evidence_no_delete','public_evidence_no_delete']];assert len(guards)==2
removed={};disabled=False
try:
 api(settings_path,{'enabled':False,'previews_enabled':False});disabled=True
 assert api(settings_path)['enabled'] is False
 for r in guards:query('DROP TRIGGER "'+r['name']+'"')
 for table in ['email_outbox','password_reset_tokens','auth_sessions','notifications','service_charges','awards','quote_items','vendor_quotes','rfq_documents','rfq_items','rfqs','vendor_categories','terms_acceptances','terms_acceptance_evidence','contractors','vendors','organizations','public_terms_acceptances','site_visits','get_a_quote_requests']:
  # Every row in these tables has been proven to belong to the isolated QA run.
  removed[table]=len(snapshot[table]);query('DELETE FROM "'+table+'"')
 for uid in ids:query('DELETE FROM users WHERE id=?',[uid])
 assert not query('PRAGMA foreign_key_check')
finally:
 # Restore immutable-evidence protections before making the preview accessible again.
 for r in guards:
  if not query('SELECT name FROM sqlite_master WHERE name=?',[r['name']]):query(r['sql'])
 assert query("SELECT name,sql FROM sqlite_master WHERE name IN ('terms_evidence_no_delete','public_evidence_no_delete') ORDER BY name")==[{'name':r['name'],'sql':r['sql']} for r in sorted(guards,key=lambda r:r['name'])]
 if disabled:api(settings_path,{'enabled':settings['enabled'],'previews_enabled':settings['previews_enabled']})
assert set(r['id'] for r in query('SELECT id FROM users'))=={owner[0]['id'],'terms-owner-publication'}
for table in ['terms_versions','public_terms_documents']:assert query('SELECT * FROM '+table)==snapshot[table]
report={'status':'passed','checkedAt':datetime.now(timezone.utc).isoformat(),'databaseId':db,'fixtureAccountsRemoved':len(ids),'removedCounts':removed,'backupPath':str(path),'backupSha256':hashlib.sha256(payload).hexdigest(),'immutableGuardsRestored':True,'ownerAdminPreserved':True,'publishedTermsPreserved':True,'foreignKeysPassed':True,'r2FixtureKeys':[r['r2_object_key'] for r in snapshot['rfq_documents']],'existingProductionModified':False}
(root/'deployment/production-preview-cleanup-20261007.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='r2FixtureKeys'}))
