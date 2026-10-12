import type {Env} from './index.ts';
import {sendZohoMail, ZohoDeliveryError, ZohoOAuthError} from './zohoMail.ts';

type Actor={id:string;role:string;status:string};
type Settings={status:'paused'|'active';daily_limit:number;contractor_limit:number;vendor_limit:number;schedule_hour:number;provider_daily_limit:number;owner_limit_confirmed:number;source_approved:number;validation_evidence:string};
type Prospect={id:string;email:string;company:string;role:'contractor'|'vendor'};
type Message={id:string;email:string;subject:string;content:string;attempts:number;day:string;prospect_id:string};
const nowISO=()=>new Date().toISOString();
export const uaeDay=(time=Date.now())=>new Date(time+4*3600000).toISOString().slice(0,10);
export const validBusinessEmail=(email:string)=>email.length<=254&&/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)&&!/(?:\.invalid|\.test|\.localhost|@localhost)$/i.test(email);
const digest=async(token:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const eligible=`p.verified_at IS NOT NULL AND p.opted_out_at IS NULL AND length(p.basis_evidence)>0
 AND NOT EXISTS(SELECT 1 FROM email_suppressions s WHERE s.email=p.email COLLATE NOCASE)
 AND NOT EXISTS(SELECT 1 FROM users u WHERE u.email=p.email COLLATE NOCASE)
 AND NOT EXISTS(SELECT 1 FROM email_campaign_messages m WHERE m.prospect_id=p.id)`;
const settings=(env:Env)=>env.DB.prepare('SELECT * FROM email_campaign_settings WHERE id=1').first<Settings>();
const audit=(env:Env,actor:Actor|null,action:string,id:string,details:unknown)=>env.DB.prepare('INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor?.id??null,actor?.role??'system',action,'email_automation',id,JSON.stringify(details),nowISO());
const evidence=(env:Env,id:string,outcome:string,providerId:string|null=null,detail='')=>env.DB.prepare('INSERT OR IGNORE INTO email_delivery_evidence(id,message_id,channel,outcome,provider_message_id,evidence,created_at) VALUES(?,?,\'onboarding\',?,?,?,?)').bind(crypto.randomUUID(),id,outcome,providerId,detail,nowISO());

// Both an independently validated release switch and an audited owner confirmation are required.
// This branch never enables either switch in production configuration.
export function activationAllowed(env:Env,s:Settings|null) {
 return !!s&&env.INVITATION_OUTREACH_ENABLED==='true'&&env.EMAIL_AUTOMATION_VALIDATED==='true'&&env.EMAIL_DELIVERY_ENABLED==='true'&&s.owner_limit_confirmed===1&&s.source_approved===1&&s.provider_daily_limit>=s.daily_limit&&s.daily_limit>0&&s.validation_evidence.length>0;
}
export async function reserveProviderSlot(env:Env,time=Date.now()) {
 // Shared across concurrent invitation drains; at most one onboarding send per minute.
 const slot=Math.floor(time/60000);
 const result=await env.DB.prepare('INSERT OR IGNORE INTO email_provider_slots(slot,claimed_at) VALUES(?,?)').bind(slot,new Date(time).toISOString()).run();
 if(slot%60===0)await env.DB.prepare('DELETE FROM email_provider_slots WHERE slot<?').bind(slot-1440).run();
 return result.meta.changes===1;
}

export async function generateInvitations(env:Env,time=Date.now()) {
 const s=await settings(env);
 if(!activationAllowed(env,s)||s!.status!=='active')return {enabled:false,queued:0};
 const hour=new Date(time+4*3600000).getUTCHours();
 if(hour<s!.schedule_hour)return {enabled:true,queued:0};
 const now=new Date(time).toISOString(),day=uaeDay(time),lease=crypto.randomUUID();
 const claimed=await env.DB.prepare(`INSERT INTO email_campaign_runs(day,lease_until,lease_id,status,started_at) VALUES(?,?,?,'running',?)
 ON CONFLICT(day) DO UPDATE SET lease_until=excluded.lease_until,lease_id=excluded.lease_id,status='running'
 WHERE email_campaign_runs.status!='completed' AND email_campaign_runs.lease_until<excluded.started_at`).bind(day,new Date(time+10*60000).toISOString(),lease,now).run();
 if(!claimed.meta.changes)return {enabled:true,queued:0};
 let queued=0;
 try {
  const origin=new URL(env.PUBLIC_APP_ORIGIN!);
  if(origin.protocol!=='https:'&&env.ENVIRONMENT!=='advanced-development')throw Error('INVALID_APP_ORIGIN');
  for(const role of ['contractor','vendor'] as const){
   const cap=role==='contractor'?s!.contractor_limit:s!.vendor_limit;
   const pool=await env.DB.prepare(`SELECT p.id,p.email,p.company,p.role FROM email_prospects p WHERE p.role=? AND ${eligible} ORDER BY p.created_at,p.id LIMIT ?`).bind(role,cap).all<Prospect>();
   const template=await env.DB.prepare('SELECT subject,content FROM email_templates WHERE role=?').bind(role).first<{subject:string;content:string}>();
   if(!template)throw Error('TEMPLATE_UNAVAILABLE');
   for(const p of pool.results){
    if(!validBusinessEmail(p.email))continue;
    const unsub=token(),id=crypto.randomUUID(),unsubHash=await digest(unsub);
    const link=origin.origin+'/'+role;
    const content=template.content+'\n\n'+link+'\n\nUnsubscribe: '+origin.origin+'/email/unsubscribe#'+unsub;
    const inserted=await env.DB.prepare(`INSERT OR IGNORE INTO email_campaign_messages(id,prospect_id,role,day,email,subject,content,unsubscribe_digest,created_at)
     SELECT ?,p.id,p.role,?,p.email,?,?,?,? FROM email_prospects p WHERE p.id=? AND ${eligible}
     AND EXISTS(SELECT 1 FROM email_campaign_runs WHERE day=? AND lease_id=? AND status='running' AND lease_until>?)
     AND (SELECT count(*) FROM email_campaign_messages WHERE day=?)<?
     AND (SELECT count(*) FROM email_campaign_messages WHERE day=? AND role=?)<?`).bind(id,day,template.subject,content,unsubHash,now,p.id,day,lease,now,day,s!.daily_limit,day,role,cap).run();
    queued+=inserted.meta.changes;
   }
  }
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_runs SET status='completed',completed_at=? WHERE day=? AND lease_id=?").bind(nowISO(),day,lease),audit(env,null,'INVITATION_GENERATION',day,{queued})]);
  return {enabled:true,queued};
 }catch{
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_runs SET status='failed',error_code='GENERATION_FAILED' WHERE day=? AND lease_id=?").bind(day,lease),audit(env,null,'INVITATION_GENERATION_FAILED',day,{queued})]);
  return {enabled:true,queued,error:'GENERATION_FAILED'};
 }
}

export async function dispatchInvitations(env:Env,send=sendZohoMail,time=Date.now()) {
 const s=await settings(env);
 if(!activationAllowed(env,s)||s!.status!=='active')return {accepted:0,enabled:false};
 const sender=await env.DB.prepare("SELECT address,account_id,reply_to FROM email_sender_identities WHERE purpose='onboarding' AND verified=1 AND length(verification_evidence)>0 AND length(account_id)>0").first<{address:string;account_id:string;reply_to:string}>();
 if(!sender)return {accepted:0,enabled:false,error:'SENDER_NOT_VERIFIED'};
 const m=await env.DB.prepare("SELECT * FROM email_campaign_messages WHERE status='queued' AND (next_attempt_at IS NULL OR next_attempt_at<=?) ORDER BY created_at,id LIMIT 1").bind(new Date(time).toISOString()).first<Message>();
 if(!m)return {accepted:0,enabled:true};
 const prospect=await env.DB.prepare(`SELECT p.id FROM email_prospects p WHERE p.id=? AND p.verified_at IS NOT NULL AND p.opted_out_at IS NULL
 AND NOT EXISTS(SELECT 1 FROM users u WHERE u.email=p.email COLLATE NOCASE)
 AND NOT EXISTS(SELECT 1 FROM email_suppressions s WHERE s.email=p.email COLLATE NOCASE)`).bind(m.prospect_id).first();
 if(!prospect||!validBusinessEmail(m.email)||m.day!==uaeDay(time)){
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_messages SET status='suppressed',completed_at=? WHERE id=? AND status='queued'").bind(nowISO(),m.id),evidence(env,m.id,'suppressed')]);return {accepted:0,enabled:true};
 }
 if(!await reserveProviderSlot(env,time))return {accepted:0,enabled:true};
 const claimed=await env.DB.prepare("UPDATE email_campaign_messages SET status='sending',attempts=attempts+1 WHERE id=? AND status='queued' AND EXISTS(SELECT 1 FROM email_campaign_settings WHERE id=1 AND status='active')").bind(m.id).run();
 if(!claimed.meta.changes)return {accepted:0,enabled:true};
 try {
  const result=await send({...env,ZOHO_MAIL_FROM_ADDRESS:sender.address,ZOHO_MAIL_ACCOUNT_ID:sender.account_id},{toAddress:m.email,subject:m.subject,content:m.content,replyTo:sender.reply_to});
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_messages SET status='accepted',completed_at=?,provider_message_id=? WHERE id=? AND status='sending'").bind(nowISO(),result?.messageId??null,m.id),evidence(env,m.id,'accepted',result?.messageId??null)]);
  return {accepted:1,enabled:true};
 }catch(error){
  // Retry only an explicit provider rate-limit rejection. Network timeouts may have sent mail.
  const rejected=error instanceof ZohoDeliveryError&&(error.providerStatus===429||error.providerCode==='LIMIT_EXCEEDED');
  const serious=error instanceof ZohoOAuthError||error instanceof ZohoDeliveryError&&[401,403].includes(error.providerStatus??0);
  const retry=rejected&&m.attempts<2;
  const code=rejected?'RATE_LIMITED':serious?'PROVIDER_AUTHENTICATION_FAILED':'AMBIGUOUS_DELIVERY';
  const status=retry?'queued':rejected?'failed':'review_required';
  await env.DB.batch([env.DB.prepare('UPDATE email_campaign_messages SET status=?,error_code=?,next_attempt_at=? WHERE id=?').bind(status,code,retry?new Date(time+60000*2**(m.attempts+1)).toISOString():null,m.id),
   ...(retry?[]:[evidence(env,m.id,status,null,code)]),
   env.DB.prepare("UPDATE email_campaign_settings SET status='paused',updated_at=? WHERE id=1").bind(nowISO()),audit(env,null,'INVITATION_DELIVERY_PAUSED',m.id,{code,status})]);
  return {accepted:0,enabled:true,error:code};
 }
}

export async function emailAutomationRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null>{
 const path=new URL(request.url).pathname,method=request.method;
 const ok=(data:unknown)=>Response.json({success:true,data},{headers:{'Cache-Control':'no-store'}});
 const fail=(error:string,status=400)=>Response.json({success:false,error},{status,headers:{'Cache-Control':'no-store'}});
 if(path==='/email/unsubscribe'&&method==='GET')return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Urban Procures invitation preferences</title><body><h1>Urban Procures invitation preferences</h1><p>Use the button to stop onboarding invitations. Account and security emails remain available.</p><button id="unsubscribe">Unsubscribe</button><p id="result" role="status"></p><script>document.getElementById('unsubscribe').onclick=async()=>{const token=location.hash.slice(1);const button=document.getElementById('unsubscribe');button.disabled=true;try{const response=await fetch('/api/email/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(!response.ok)throw Error();document.getElementById('result').textContent='Your invitation preference has been recorded.';history.replaceState(null,'','/email/unsubscribe');}catch{document.getElementById('result').textContent='Unable to update your preference. Please contact urbanprocures@urbanprocures.com.';button.disabled=false;}};</script></body></html>`,{headers:{'Content-Type':'text/html; charset=utf-8','Referrer-Policy':'no-referrer','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});
 if(path==='/api/email/unsubscribe'&&method==='POST'){
  let body:{token?:string};try{body=await request.json();}catch{return fail('INVALID_REQUEST');}
  if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))return fail('INVALID_REQUEST');
  const m=await env.DB.prepare('SELECT email,prospect_id FROM email_campaign_messages WHERE unsubscribe_digest=?').bind(await digest(body.token)).first<{email:string;prospect_id:string}>();
  if(m)await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO email_suppressions VALUES(?,?,?)').bind(m.email,'unsubscribe',nowISO()),env.DB.prepare('UPDATE email_prospects SET opted_out_at=? WHERE id=?').bind(nowISO(),m.prospect_id),env.DB.prepare("UPDATE email_campaign_messages SET status='suppressed',completed_at=? WHERE email=? COLLATE NOCASE AND status='queued'").bind(nowISO(),m.email),audit(env,null,'EMAIL_UNSUBSCRIBE',m.prospect_id,{})]);
  return ok({message:'Your invitation preference has been recorded.'});
 }
 if(!path.startsWith('/api/admin/email/automation'))return null;
 if(!actor||actor.status!=='active')return fail('AUTHENTICATION_REQUIRED',401);
 if(actor.role!=='admin')return fail('ADMIN_REQUIRED',403);
 if(path==='/api/admin/email/automation'&&method==='GET'){
  const s=await settings(env),day=uaeDay();
  const [counts,pool,senders,templates,runs,delivery,outbox,audits]=await Promise.all([
   env.DB.prepare('SELECT status,count(*) AS count FROM email_campaign_messages GROUP BY status').all(),
   env.DB.prepare(`SELECT p.role,count(*) AS count FROM email_prospects p WHERE ${eligible} GROUP BY p.role`).all(),
   env.DB.prepare('SELECT * FROM email_sender_identities').all(),env.DB.prepare('SELECT * FROM email_templates').all(),
   env.DB.prepare('SELECT * FROM email_campaign_runs ORDER BY day DESC LIMIT 10').all(),env.DB.prepare('SELECT outcome,count(*) AS count FROM email_delivery_evidence GROUP BY outcome').all(),
   env.DB.prepare('SELECT status,count(*) AS count FROM email_outbox GROUP BY status').all(),env.DB.prepare("SELECT action_type,payload_json,timestamp,actor_user_id FROM audit_logs WHERE resource_type='email_automation' ORDER BY timestamp DESC LIMIT 50").all()
  ]);
  const today=await env.DB.prepare('SELECT count(*) AS count FROM email_campaign_messages WHERE day=?').bind(day).first<{count:number}>();
  return ok({settings:s,activationAllowed:activationAllowed(env,s),counts:counts.results,eligibleRecipients:pool.results,senders:senders.results,templates:templates.results,runs:runs.results,delivery:delivery.results,transactionalOutbox:outbox.results,audits:audits.results,day,allocatedToday:today?.count??0,remainingAllowance:Math.max(0,(s?.daily_limit??0)-(today?.count??0)),registeredFromInvitations:null});
 }
 let body:Record<string,unknown>;try{const text=await request.text();if(text.length>20000)return fail('REQUEST_TOO_LARGE',413);body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))return fail('INVALID_REQUEST');}catch{return fail('INVALID_REQUEST');}
 if(path.endsWith('/settings')&&method==='PATCH'){
  const s=await settings(env);if(!s)return fail('SETTINGS_UNAVAILABLE',503);
  const daily=body.dailyLimit,contractor=body.contractorLimit,vendor=body.vendorLimit,hour=body.scheduleHour;
  if(![daily,contractor,vendor,hour].every(Number.isSafeInteger)||Number(daily)<0||Number(daily)>100||Number(contractor)<0||Number(vendor)<0||Number(contractor)+Number(vendor)!==daily||Number(hour)<0||Number(hour)>23)return fail('INVALID_SETTINGS');
  const confirmed=body.ownerLimitConfirmed===true?1:0;
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_settings SET daily_limit=?,contractor_limit=?,vendor_limit=?,schedule_hour=?,owner_limit_confirmed=?,status='paused',updated_at=? WHERE id=1").bind(daily,contractor,vendor,hour,confirmed,nowISO()),audit(env,actor,'EMAIL_SETTINGS_CHANGE','1',{before:s,after:{daily,contractor,vendor,hour,confirmed}})]);
  return ok({saved:true,status:'paused'});
 }
 if(path.endsWith('/pause')&&method==='POST'){
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_settings SET status='paused',updated_at=? WHERE id=1").bind(nowISO()),audit(env,actor,'EMAIL_CAMPAIGN_PAUSE','1',{})]);return ok({status:'paused'});
 }
 if(path.endsWith('/resume')&&method==='POST'){
  const s=await settings(env);if(!activationAllowed(env,s))return fail('ACTIVATION_GATES_NOT_VERIFIED',409);
  const sender=await env.DB.prepare("SELECT address FROM email_sender_identities WHERE purpose='onboarding' AND verified=1 AND length(verification_evidence)>0 AND length(account_id)>0").first();if(!sender)return fail('SENDER_NOT_VERIFIED',409);
  const count=await env.DB.prepare(`SELECT count(*) AS n FROM email_prospects p WHERE ${eligible}`).first<{n:number}>();if(!count?.n)return fail('NO_ELIGIBLE_RECIPIENTS',409);
  await env.DB.batch([env.DB.prepare("UPDATE email_campaign_settings SET status='active',updated_at=? WHERE id=1").bind(nowISO()),audit(env,actor,'EMAIL_CAMPAIGN_RESUME','1',{})]);return ok({status:'active'});
 }
 if(path.endsWith('/prospects')&&method==='POST'){
  const email=String(body.email??'').trim().toLowerCase(),company=String(body.company??'').trim(),trade=String(body.trade??'').trim(),emirate=String(body.emirate??'').trim(),source=String(body.sourceUrl??''),basis=String(body.contactBasis??''),proof=String(body.basisEvidence??'').trim(),role=body.role;
  if(!validBusinessEmail(email)||!company||company.length>250||!trade||trade.length>250||!['Dubai','Abu Dhabi','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'].includes(emirate)||!['contractor','vendor'].includes(String(role))||!['explicit_consent','existing_business_relationship'].includes(basis)||proof.length<10||proof.length>2000||source.length>2000)return fail('ELIGIBLE_CONTACT_EVIDENCE_REQUIRED');
  try{if(new URL(source).protocol!=='https:')return fail('INVALID_SOURCE');}catch{return fail('INVALID_SOURCE');}
  if(await env.DB.prepare('SELECT id FROM users WHERE email=? COLLATE NOCASE').bind(email).first())return fail('EXISTING_REGISTERED_USER',409);
  if(await env.DB.prepare('SELECT email FROM email_suppressions WHERE email=? COLLATE NOCASE').bind(email).first())return fail('RECIPIENT_SUPPRESSED',409);
  const id=crypto.randomUUID();try{await env.DB.batch([env.DB.prepare('INSERT INTO email_prospects(id,email,company,role,trade,emirate,source_url,contact_basis,basis_evidence,verified_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,email,company,role,trade,emirate,source,basis,proof,body.addressVerified===true?nowISO():null,nowISO()),audit(env,actor,'EMAIL_PROSPECT_ADD',id,{role,trade,emirate,basis,addressVerified:body.addressVerified===true})]);}catch{return fail('DUPLICATE_OR_INVALID_PROSPECT',409);}
  return ok({id,queued:false});
 }
 if(path.endsWith('/templates')&&method==='PATCH'){
  const role=String(body.role),subject=String(body.subject??''),content=String(body.content??'');
  if(!['contractor','vendor'].includes(role)||!subject.trim()||subject.length>150||/[\r\n]/.test(subject)||!content.trim()||content.length>4000)return fail('INVALID_TEMPLATE');
  await env.DB.batch([env.DB.prepare('UPDATE email_templates SET subject=?,content=? WHERE role=?').bind(subject,content,role),audit(env,actor,'EMAIL_TEMPLATE_CHANGE',role,{subject,content})]);return ok({saved:true});
 }
 if(path.endsWith('/suppress')&&method==='POST'){
  const email=String(body.email??'').trim().toLowerCase(),reason=String(body.reason??'').trim();if(!validBusinessEmail(email)||reason.length<3||reason.length>250)return fail('INVALID_SUPPRESSION');
  await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO email_suppressions VALUES(?,?,?)').bind(email,reason,nowISO()),env.DB.prepare("UPDATE email_campaign_messages SET status='suppressed',completed_at=? WHERE email=? COLLATE NOCASE AND status='queued'").bind(nowISO(),email),audit(env,actor,'EMAIL_SUPPRESS',email,{reason})]);return ok({suppressed:true});
 }
 return fail('AUTOMATION_ROUTE_NOT_FOUND',404);
}
