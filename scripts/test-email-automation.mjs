import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {applyMigrations} from './local-worker-test.mjs';
import {createHash} from 'node:crypto';
const source=`
import {generateInvitations,dispatchInvitations,emailAutomationRoute,uaeDay,validBusinessEmail} from './urbanprocures advanced/workers/emailAutomation.ts';
import {actorFor} from './urbanprocures advanced/workers/auth.ts';
import {recoveryRoute} from './urbanprocures advanced/workers/recovery.ts';
import {ZohoDeliveryError} from './urbanprocures advanced/workers/zohoMail.ts';
export default {async fetch(request,env){const u=new URL(request.url);const time=Date.parse(u.searchParams.get('time')||'2026-10-13T05:00:00Z');
if(u.pathname==='/api/auth/forgot-password')return recoveryRoute(request,{...env,ZOHO_CLIENT_ID:'fixture',ZOHO_CLIENT_SECRET:'fixture',ZOHO_REFRESH_TOKEN:'fixture',ZOHO_MAIL_ACCOUNT_ID:'123',ZOHO_MAIL_FROM_ADDRESS:'fixture@example.com',ZOHO_MAIL_API_ORIGIN:'https://mail.zoho.com'});
const active={...env,INVITATION_OUTREACH_ENABLED:'true',EMAIL_AUTOMATION_VALIDATED:'true',EMAIL_DELIVERY_ENABLED:'true'};
if(u.pathname==='/generate')return Response.json(await generateInvitations(u.searchParams.has('disabled')?env:active,time));
if(u.pathname==='/dispatch'){let calls=0;const result=await dispatchInvitations(active,async(_,m)=>{calls++;if(u.searchParams.has('rate'))throw new ZohoDeliveryError(429,'LIMIT_EXCEEDED');if(u.searchParams.has('ambiguous'))throw Error('timeout');return {messageId:'provider-fixture',acceptedAt:new Date(time).toISOString(),providerStatus:200};},time);return Response.json({calls,result});}
const response=await emailAutomationRoute(request,env,await actorFor(request,env));return response||new Response('Not found',{status:404});}};`;
const bundled=await build({stdin:{contents:source,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'browser'});
const mf=new Miniflare(convertV4MiniflareOptions({cf:false,modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-10-01',d1Databases:['DB'],outboundService:()=>Response.json({error:'invalid_grant'},{status:400}),bindings:{ENVIRONMENT:'advanced-development',PUBLIC_APP_ORIGIN:'https://fixture.example',EMAIL_DELIVERY_ENABLED:'false'}}));
let checks=0;const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 const db=await mf.getD1Database('DB');await applyMigrations(db);const stamp=new Date().toISOString();
 for(const role of ['admin','vendor']){
  await db.prepare('INSERT INTO users(id,email,password_hash,salt,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(role,role+'@example.com','fixture-nonlogin','fixture',role,'active',stamp,stamp).run();
  await db.prepare('INSERT INTO auth_sessions(token,user_id,role,created_at,expires_at) VALUES(?,?,?,?,?)').bind(createHash('sha256').update(createHash('sha256').update(role).digest('hex')).digest('hex'),role,role,stamp,'2099-01-01T00:00:00Z').run();
 }
 const call=(path,role,body,method=body?'POST':'GET')=>mf.dispatchFetch('http://localhost'+path,{method,headers:{...(role?{Authorization:'Bearer '+createHash('sha256').update(role).digest('hex')}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 equal((await call('/api/admin/email/automation')).status,401);equal((await call('/api/admin/email/automation','vendor')).status,403);
 let r=await call('/api/admin/email/automation','admin');equal(r.status,200);const initial=(await r.json()).data;equal(initial.settings.status,'paused');equal(initial.settings.daily_limit,100);equal(initial.eligibleRecipients.length,0);equal(initial.activationAllowed,false);
 equal((await call('/api/admin/email/automation/resume','admin',{})).status,409);
 equal((await call('/api/admin/email/automation/settings','admin',{dailyLimit:3,contractorLimit:2,vendorLimit:2,scheduleHour:9},'PATCH')).status,400);
 equal((await call('/api/admin/email/automation/settings','admin',{dailyLimit:4,contractorLimit:2,vendorLimit:2,scheduleHour:9,ownerLimitConfirmed:true},'PATCH')).status,200);
 const make=(email,role='vendor',addressVerified=true)=>({email,company:'Fixture Business',role,trade:'Joinery',emirate:'Dubai',sourceUrl:'https://fixture.example/contact',contactBasis:'explicit_consent',basisEvidence:'Fixture consent evidence, not real recipients',addressVerified});
 equal((await call('/api/admin/email/automation/prospects','admin',make('bad@example.invalid'))).status,400);
 equal((await call('/api/admin/email/automation/prospects','admin',make('vendor@example.com'))).status,409);
 equal((await call('/api/admin/email/automation/prospects','admin',{...make('missing@example.com'),basisEvidence:''})).status,400);
 for(const [email,role,verified] of [['one@example.com','vendor',true],['two@example.com','vendor',true],['three@example.com','vendor',true],['c1@example.com','contractor',true],['c2@example.com','contractor',true],['c3@example.com','contractor',true],['unverified@example.com','vendor',false]])equal((await call('/api/admin/email/automation/prospects','admin',make(email,role,verified))).status,200);
 equal((await call('/api/admin/email/automation/prospects','admin',make('ONE@example.com'))).status,409);
 equal((await (await call('/generate?disabled=1')).json()).enabled,false);
 await db.prepare("UPDATE email_campaign_settings SET status='active',provider_daily_limit=100,source_approved=1,validation_evidence='explicit isolated fixture' WHERE id=1").run();
 await db.prepare("UPDATE email_sender_identities SET verified=1,account_id='fixture',verification_evidence='explicit provider double' WHERE purpose='onboarding'").run();
 const before=await (await call('/generate?time=2026-10-13T04:59:00Z')).json();equal(before.queued,0);
 const concurrent=await Promise.all([call('/generate'),call('/generate')]);const results=await Promise.all(concurrent.map(r=>r.json()));equal(results.reduce((n,r)=>n+r.queued,0),4);
 equal((await db.prepare('SELECT role,count(*) AS n FROM email_campaign_messages GROUP BY role ORDER BY role').all()).results,[{role:'contractor',n:2},{role:'vendor',n:2}]);
 equal((await (await call('/generate')).json()).queued,0);
 const send=await Promise.all([call('/dispatch'),call('/dispatch')]);const sent=await Promise.all(send.map(r=>r.json()));equal(sent.reduce((n,r)=>n+r.calls,0),1);equal(sent.reduce((n,r)=>n+r.result.accepted,0),1);
 equal((await db.prepare("SELECT count(*) AS n FROM email_delivery_evidence WHERE outcome='accepted'").first()).n,1);
 equal((await db.prepare("SELECT count(*) AS n FROM email_delivery_evidence WHERE outcome='delivered'").first()).n,0);
 const accepted=await db.prepare("SELECT content,email FROM email_campaign_messages WHERE status='accepted'").first();equal(accepted.content.includes('Private client'),false);
 const unsub=accepted.content.match(/unsubscribe#([a-f0-9]{64})/)[1];equal((await call('/api/email/unsubscribe',null,{token:unsub})).status,200);equal((await call('/api/email/unsubscribe',null,{token:unsub})).status,200);equal(!!await db.prepare('SELECT email FROM email_suppressions WHERE email=?').bind(accepted.email).first(),true);
 equal((await call('/email/unsubscribe')).status,200);
 const ambiguous=await (await call('/dispatch?ambiguous=1&time=2026-10-13T05:05:00Z')).json();equal(ambiguous.calls,1);equal(ambiguous.result.error,'AMBIGUOUS_DELIVERY');equal((await db.prepare('SELECT status FROM email_campaign_settings').first()).status,'paused');
 equal((await (await call('/dispatch?time=2026-10-13T05:10:00Z')).json()).calls,0);
 await db.prepare("UPDATE email_campaign_settings SET status='active'").run();
 const rate=await (await call('/dispatch?rate=1&time=2026-10-13T05:15:00Z')).json();equal(rate.result.error,'RATE_LIMITED');equal((await db.prepare("SELECT status FROM email_campaign_messages WHERE error_code='RATE_LIMITED'").first()).status,'queued');
 equal((await db.prepare('PRAGMA foreign_key_check').all()).results,[]);
 const known=await call('/api/auth/forgot-password',null,{email:'vendor@example.com'}),unknown=await call('/api/auth/forgot-password',null,{email:'absent@example.com'});
 equal(known.status,200);equal(unknown.status,200);equal(await known.json(),await unknown.json());equal((await db.prepare('SELECT count(*) AS n FROM password_reset_tokens').first()).n,0);
 equal((await db.prepare("SELECT count(*) AS n FROM audit_logs WHERE action_type='PASSWORD_RESET_DELIVERY_FAILED'").first()).n,1);
 console.log(JSON.stringify({checksPassed:checks,runtime:'actual local workerd/D1',provider:'explicit double',externalEmailSent:false,productionModified:false}));
}finally{await mf.dispose();}
