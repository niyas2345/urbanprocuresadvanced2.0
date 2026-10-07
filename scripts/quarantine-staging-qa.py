"""Disable reserved-address QA accounts while preserving immutable test evidence."""
import json,os,re,subprocess,urllib.request
from datetime import datetime,timezone
from pathlib import Path
root=Path(__file__).resolve().parent.parent
subprocess.run(['node','scripts/check-isolation.mjs','--remote','--config','urbanprocures advanced/workers/wrangler.staging.toml'],cwd=root,check=True)
url='https://api.cloudflare.com/client/v4/accounts/dcb411ece67dfdfb730635133ed31825/d1/database/eb82db72-864e-4835-b230-3903f77706f2/query'
def query(sql,params=[]):
 request=urllib.request.Request(url,method='POST',headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'Content-Type':'application/json'},data=json.dumps({'sql':sql,'params':params}).encode())
 with urllib.request.urlopen(request,timeout=30) as response:d=json.load(response)
 assert d['success'];return d['result'][0]
fixtures=query("SELECT id,email,status FROM users WHERE email LIKE 'qa-%@example.invalid' AND role IN ('admin','vendor','contractor')")['results']
assert all(re.fullmatch(r'qa-[A-Za-z0-9-]+@example\.invalid',r['email']) for r in fixtures)
now=datetime.now(timezone.utc).isoformat()
owner=query("SELECT id,status FROM users WHERE email='urbanprocures@urbanprocures.com' AND role='admin'")['results'];assert len(owner)==1 and owner[0]['status']=='active'
suppressed=0
for fixture in fixtures:
 query("UPDATE users SET status='suspended',updated_at=? WHERE id=? AND email LIKE 'qa-%@example.invalid'",[now,fixture['id']])
 query('DELETE FROM auth_sessions WHERE user_id=?',[fixture['id']])
 suppressed+=query("UPDATE email_outbox SET status='suppressed',completed_at=? WHERE status='pending' AND (user_id=? OR instr(event_key,?)=1)",[now,fixture['id'],'admin-registration:'+fixture['id']+':'])['meta']['changes']
 rfqs=query('SELECT r.id FROM rfqs r JOIN contractors c ON c.id=r.contractor_id WHERE c.user_id=?',[fixture['id']])['results']
 for rfq in rfqs:
  suppressed+=query("UPDATE email_outbox SET status='suppressed',completed_at=? WHERE status='pending' AND instr(event_key,?)=1",[now,'admin-rfq:'+rfq['id']+':'])['meta']['changes']
assert query("SELECT COUNT(*) AS n FROM users WHERE email LIKE 'qa-%@example.invalid' AND role IN ('admin','vendor','contractor') AND status!='suspended'")['results'][0]['n']==0
assert query("SELECT status FROM users WHERE id=?",[owner[0]['id']])['results'][0]['status']=='active'
report={'checkedAt':now,'databaseId':'eb82db72-864e-4835-b230-3903f77706f2','qaAccountsSuspended':len(fixtures),'qaAccountIds':[r['id'] for r in fixtures],'pendingFixtureEmailsSuppressed':suppressed,'fixtureSessionsRevoked':True,'ownerAdminPreserved':True,'immutableEvidenceRetained':True,'productionDataModified':False,'retentionReason':'Private staging regression fixtures retained under master-handoff exception: immutable Terms/audit and rollback evidence. Accounts are suspended, sessions revoked and fixture notices suppressed. No fixture data copied to production.'}
(root/'deployment/staging-qa-quarantine-20261007.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['qaAccountIds','retentionReason']}))
