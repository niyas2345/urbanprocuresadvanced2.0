import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {applyMigrations} from './local-worker-test.mjs';
const bundle=await build({stdin:{resolveDir:process.cwd(),contents:`
import {dispatchNotifications} from './urbanprocures advanced/workers/notifications.ts';
export default {async fetch(request,env){
 const mode=new URL(request.url).pathname;
 let calls=0;
 const result=await dispatchNotifications({...env,EMAIL_DELIVERY_ENABLED:mode==='/disabled'?'false':'true'},async(_env,message)=>{
  calls++;if(message.toAddress.endsWith('.invalid'))throw Error('QA recipient leaked');
  if(mode==='/failure')throw Error('Uncertain provider result');
 },mode==='/selected'?'selected':undefined);return Response.json({result,calls});
}};`},bundle:true,write:false,format:'esm',platform:'browser'});
const mf=new Miniflare(convertV4MiniflareOptions({cf:false,modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-01',d1Databases:['DB']}));
let checks=0;
const equal=(a,b)=>{assert.equal(a,b);checks++;};
try {
 const db=await mf.getD1Database('DB');await applyMigrations(db);
 const now=new Date().toISOString();
 for(const [id,email,status] of [['qa','qa@example.invalid','active'],['active','fixture@example.com','active'],['suspended','suspended@example.com','suspended']]){
  await db.prepare('INSERT INTO users(id,email,password_hash,salt,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,email,'nonlogin','fixture','vendor',status,now,now).run();
  await db.prepare('INSERT INTO email_outbox(id,event_key,user_id,subject,content) VALUES (?,?,?,?,?)').bind(id,id,id,'Fixture','Generic content').run();
 }
 const call=async(path)=>(await mf.dispatchFetch('http://localhost'+path)).json();
 let result=await call('/disabled');equal(result.calls,0);equal(result.result.enabled,false);
 equal((await db.prepare("SELECT count(*) AS n FROM email_outbox WHERE status='pending'").first()).n,3);
 result=await call('/enabled');equal(result.calls,1);equal(result.result.sent,1);equal(result.result.suppressed,2);
 result=await call('/enabled');equal(result.calls,0);
 await db.prepare("INSERT INTO email_outbox(id,event_key,user_id,subject,content) VALUES ('failure','failure','active','Fixture','Fixture')").run();
 result=await call('/failure');equal(result.result.reviewRequired,1);
 result=await call('/enabled');equal(result.calls,0);
 equal((await db.prepare("SELECT status FROM email_outbox WHERE id='failure'").first()).status,'review_required');
 await db.prepare("INSERT INTO email_outbox(id,event_key,user_id,subject,content) VALUES ('concurrent','concurrent','active','Fixture','Fixture')").run();
 const concurrent=await Promise.all([call('/enabled'),call('/enabled')]);equal(concurrent.reduce((n,r)=>n+r.calls,0),1);
 await db.prepare("INSERT INTO email_outbox(id,event_key,user_id,subject,content) VALUES ('selected','selected','active','Fixture','Fixture'),('unselected','unselected','active','Fixture','Fixture')").run();
 result=await call('/selected');equal(result.calls,1);equal(result.result.sent,1);
 equal((await db.prepare("SELECT status FROM email_outbox WHERE id='unselected'").first()).status,'pending');
 result=await call('/selected');equal(result.calls,0);
 // Exercise publication recipient selection with real schema and trigger execution.
 await db.prepare("INSERT INTO organizations(id,name,org_type,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES ('org','Fixture','contractor','fixture','Dubai','Fixture','Fixture','Fixture',?)").bind(now).run();
 await db.prepare("INSERT INTO contractors(id,user_id,organization_id,company_name,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES ('contractor','active','org','Private client','fixture','Dubai','Private address','Private person','Private phone',?)").bind(now).run();
 await db.prepare("INSERT INTO vendors(id,user_id,company_name,trade_license_number,trade_categories,emirates_serviced,verification_status,contact_person,contact_phone,created_at) VALUES ('vendor','qa','Fixture','fixture','[\"Joinery\"]','[\"Dubai\"]','verified','Fixture','Fixture',?)").bind(now).run();
 await db.prepare("INSERT INTO rfqs(id,reference_code,contractor_id,title,category,project_name,location_emirate,scope_description,submission_deadline,status,created_at) VALUES ('rfq','RFQ-FIXTURE','contractor','Private title','Joinery','Private project','Dubai','Private scope','2099-01-01','submitted',?)").bind(now).run();
 await db.prepare("UPDATE rfqs SET status='reviewed_published' WHERE id='rfq'").run();
 const notice=await db.prepare("SELECT * FROM email_outbox WHERE event_key='rfq:rfq:qa'").first();equal(!!notice,true);equal(notice.content.includes('Private'),false);
 console.log(JSON.stringify({checksPassed:checks,runtime:'actual workerd and D1',provider:'explicit send double',externalEmailSent:false}));
}finally{await mf.dispose();}
