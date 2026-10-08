import type { Env } from './index.ts';
import {verifyZohoAuthentication,ZohoOAuthError,ZohoDeliveryError,sendZohoMail} from './zohoMail.ts';
import {rateAllowed} from './recovery.ts';
import {dispatchNotifications} from './notifications.ts';
import type { Actor } from './terms.ts';
import { organizationFor, termsGate } from './terms.ts';
import { rfqDto } from './procurement.ts';
import { ServiceChargeEngine } from './serviceChargeEngine.ts';
import {decodeDocument,decodeDocuments} from './documentValidation.ts';
export {decodeDocument} from './documentValidation.ts';
const fail=(error:string,status=400)=>Response.json({success:false,error},{status});
const ok=(data:unknown,status=200)=>Response.json({success:true,data},{status});
const camel=(row:any)=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),value]));
export function documentDto(row:any,admin=false) { const result=camel(row); if(!admin){delete result.r2ObjectKey;delete result.uploaderUserId;}return result; }
function audit(env:Env,actor:Actor,action:string,type:string,id:string,payload:unknown={}) {
 return env.DB.prepare('INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor.id,actor.role,action,type,id,JSON.stringify(payload),new Date().toISOString());
}
export async function storedUpload(env:Env,actor:Actor,file:any,rfqId:string|null,quotationId:string|null=null,decoded?:ReturnType<typeof decodeDocument>) {
 const parsed=decoded??decodeDocument(file),id=crypto.randomUUID(),key='private/'+crypto.randomUUID(),now=new Date().toISOString();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',parsed.bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 return {id,key,parsed,statement:env.DB.prepare('INSERT INTO rfq_documents (id,rfq_id,quotation_id,uploader_user_id,file_name,file_type,file_size_bytes,r2_object_key,document_purpose,sha256_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,rfqId,quotationId,actor.id,parsed.name,parsed.type,parsed.bytes.length,key,parsed.purpose,hash,now)};
}
export async function operationsRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null> {
 const path=new URL(request.url).pathname,method=request.method;
 if(!path.startsWith('/api/account/') && !path.startsWith('/api/admin/') && !path.startsWith('/api/documents/') && !(path.startsWith('/api/contractor/rfqs')&&method!=='GET'))return null;
 if(!actor)return fail('AUTHENTICATION_REQUIRED',401);
 if(path.startsWith('/api/admin/') && actor.role!=='admin')return fail('ADMIN_REQUIRED',403);
 let body:any={};if(['POST','PUT','PATCH'].includes(method)){try{const raw=await request.text();if(raw.length>30000000)return fail('REQUEST_TOO_LARGE',413);body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))return fail('INVALID_REQUEST');}catch{return fail('INVALID_REQUEST');}}
 if(path==='/api/account/directory'&&method==='PATCH'){
  if(!['contractor','vendor'].includes(actor.role))return fail('BUSINESS_ACCOUNT_REQUIRED',403);
  if(typeof body.visible!=='boolean')return fail('INVALID_DIRECTORY_CONSENT');
  const table=actor.role==='vendor'?'vendors':'contractors';await env.DB.batch([env.DB.prepare(`UPDATE ${table} SET directory_visible=? WHERE user_id=?`).bind(body.visible?1:0,actor.id),audit(env,actor,'DIRECTORY_CONSENT','user',actor.id,{visible:body.visible})]);return ok({visible:body.visible});
 }
 const editMatch=path.match(/^\/api\/contractor\/rfqs\/([^/]+)$/);
 if((path==='/api/contractor/rfqs'&&method==='POST')||(editMatch&&method==='PUT')) {
  if(actor.role!=='contractor')return fail('CONTRACTOR_REQUIRED',403);
  const profile=await organizationFor(env,actor);
  if(!profile)return fail('ORGANIZATION_REQUIRED',403);
  if(['title','category','projectName','locationEmirate','scopeDescription'].some(k=>typeof body[k]!=='string'||!body[k].trim()||body[k].length>(k==='scopeDescription'?10000:250)))return fail('INVALID_RFQ');
  if(!['draft','submitted'].includes(body.status)||!Number.isFinite(Date.parse(body.submissionDeadline))||Date.parse(body.submissionDeadline)<=Date.now())return fail('INVALID_RFQ_DEADLINE_OR_STATE');
  if(body.documents!==undefined&&(!Array.isArray(body.documents)||body.documents.length>5))return fail('INVALID_DOCUMENTS');
  if(body.boqMode==='file') {
   const existing=editMatch?await env.DB.prepare("SELECT id FROM rfq_documents WHERE rfq_id=? AND document_purpose='boq' AND quotation_id IS NULL").bind(editMatch[1]).first():null;
   if(!(body.documents??[]).some((d:any)=>d.documentPurpose==='boq')&&!existing)return fail('BOQ_DOCUMENT_REQUIRED');
   body.items=[{description:'Complete works as specified in attached BOQ',quantity:1,unit:'lump_sum',specifications:'Price the complete attached BOQ package.'}];
  }else if(body.boqMode!==undefined&&body.boqMode!=='itemized')return fail('INVALID_BOQ_MODE');
  if(!Array.isArray(body.items)||body.items.length>500||(body.status==='submitted'&&!body.items.length))return fail('BOQ_REQUIRED');
  if(body.items.some((i:any)=>!i||typeof i.description!=='string'||!i.description.trim()||i.description.length>3000||!Number.isFinite(i.quantity)||i.quantity<=0||i.quantity>1e9||typeof i.unit!=='string'||!i.unit.trim()||i.unit.length>50|| (i.specifications!=null && (typeof i.specifications!=='string'||i.specifications.length>5000))))return fail('INVALID_BOQ');
  const type=body.procurementType??(/manpower|labou?r/i.test(body.category)?'manpower':'standard');
  if(!['standard','manpower'].includes(type)||(/manpower|labou?r/i.test(body.category)&&type!=='manpower'))return fail('INVALID_PROCUREMENT_TYPE');
  let quantity:number|null=null;
  if(type==='manpower'){try{quantity=ServiceChargeEngine.calculateAward({awardValueAed:1,awardType:'manpower',manpowerPersons:body.manpowerPersons,manpowerHoursPerPersonPerDay:body.manpowerHoursPerPersonPerDay,manpowerDays:body.manpowerDays}).manpowerQuantity!;}catch{return fail('INVALID_MANPOWER_PERSON_HOURS');}}
  const previous=editMatch?await env.DB.prepare("SELECT * FROM rfqs WHERE id=? AND contractor_id=? AND status='draft' AND deleted_at IS NULL").bind(editMatch[1],profile.id).first<any>():null;
  if(editMatch&&!previous)return fail('RFQ_NOT_EDITABLE',404);
  if(previous&&(body.documents??[]).length)return fail('UPLOAD_DOCUMENTS_SEPARATELY');
  const creationKey=previous?null:(body.creationKey??null);
  if(creationKey!==null&&(typeof creationKey!=='string'||!/^[a-f0-9-]{36}$/i.test(creationKey)))return fail('INVALID_CREATION_KEY');
  const canonical=(value:any):any=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).filter(k=>k!=='creationKey').sort().map(k=>[k,canonical(value[k])])):value;
  const fingerprint=creationKey?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical(body))))),b=>b.toString(16).padStart(2,'0')).join(''):null;
  const existingCreation=async()=>creationKey?await env.DB.prepare('SELECT * FROM rfqs WHERE contractor_id=? AND creation_key=?').bind(profile.id,creationKey).first<any>():null;
  const duplicate=await existingCreation();
  if(duplicate)return duplicate.creation_fingerprint===fingerprint?ok(await rfqDto(env,duplicate),201):fail('CREATION_KEY_CONFLICT',409);
  let decoded;try{decoded=decodeDocuments(body.documents??[]);}catch{return fail('INVALID_DOCUMENT');}
  const id=previous?.id??crypto.randomUUID(),now=new Date().toISOString(),reference=previous?.reference_code??('RFQ-'+crypto.randomUUID()),revision=crypto.randomUUID();
  let uploads;try{uploads=await Promise.all((body.documents??[]).map((f:any,index:number)=>storedUpload(env,actor,f,id,null,decoded[index])));}catch{return fail('INVALID_DOCUMENT');}
  const statements=[env.DB.prepare(`INSERT INTO rfqs (id,reference_code,contractor_id,title,category,project_name,location_emirate,submission_deadline,target_completion_date,scope_description,estimated_budget_aed,status,created_at,procurement_type,approved_manpower_quantity,manpower_persons,manpower_hours_per_person_per_day,manpower_days,creation_key,creation_fingerprint) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,reference,profile.id,body.title.trim(),body.category.trim(),body.projectName.trim(),body.locationEmirate.trim(),new Date(body.submissionDeadline).toISOString(),typeof body.targetCompletionDate==='string'?body.targetCompletionDate:null,body.scopeDescription.trim(),Number.isFinite(body.estimatedBudgetAed)&&body.estimatedBudgetAed>=0?body.estimatedBudgetAed:null,body.status,now,type,quantity,type==='manpower'?body.manpowerPersons:null,type==='manpower'?body.manpowerHoursPerPersonPerDay:null,type==='manpower'?body.manpowerDays:null,creationKey,fingerprint)];
  if(previous){statements.length=0;statements.push(env.DB.prepare(`UPDATE rfqs SET title=?,category=?,project_name=?,location_emirate=?,submission_deadline=?,target_completion_date=?,scope_description=?,estimated_budget_aed=?,status=?,procurement_type=?,approved_manpower_quantity=?,manpower_persons=?,manpower_hours_per_person_per_day=?,manpower_days=?,revision_nonce=? WHERE id=? AND contractor_id=? AND status='draft' AND deleted_at IS NULL`).bind(body.title.trim(),body.category.trim(),body.projectName.trim(),body.locationEmirate.trim(),new Date(body.submissionDeadline).toISOString(),typeof body.targetCompletionDate==='string'?body.targetCompletionDate:null,body.scopeDescription.trim(),Number.isFinite(body.estimatedBudgetAed)&&body.estimatedBudgetAed>=0?body.estimatedBudgetAed:null,body.status,type,quantity,type==='manpower'?body.manpowerPersons:null,type==='manpower'?body.manpowerHoursPerPersonPerDay:null,type==='manpower'?body.manpowerDays:null,revision,id,profile.id));statements.push(env.DB.prepare('DELETE FROM rfq_items WHERE rfq_id=? AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND revision_nonce=?)').bind(id,id,revision));}
  for(const [index,item]of body.items.entries())statements.push(env.DB.prepare('INSERT INTO rfq_items (id,rfq_id,item_number,description,quantity,unit,specifications) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rfqs WHERE id=? AND (? IS NULL OR revision_nonce=?))').bind(crypto.randomUUID(),id,index+1,item.description.trim(),item.quantity,item.unit.trim(),item.specifications??null,id,previous?revision:null,revision));
  for(const upload of uploads)statements.push(upload.statement);
  statements.push(audit(env,actor,previous?'RFQ_UPDATE':'RFQ_CREATE','rfq',id,{status:body.status,procurementType:type,totalPersonHours:quantity}));
  try{for(const upload of uploads)await env.DOCUMENTS_BUCKET.put(upload.key,upload.parsed.bytes,{httpMetadata:{contentType:upload.parsed.type}});const results=await env.DB.batch(statements);if(!results[0].meta.changes)return fail('RFQ_CONFLICT',409);}catch{await Promise.allSettled(uploads.map(u=>env.DOCUMENTS_BUCKET.delete(u.key)));const winner=await existingCreation();if(winner)return winner.creation_fingerprint===fingerprint?ok(await rfqDto(env,winner),201):fail('CREATION_KEY_CONFLICT',409);return fail('RFQ_PERSISTENCE_FAILED',500);}
  return ok(await rfqDto(env,await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(id).first()),201);
 }
 const transition=path.match(/^\/api\/contractor\/rfqs\/([^/]+)\/status$/);
 if((transition&&method==='PATCH')||(editMatch&&method==='DELETE')) {
  if(actor.role!=='contractor')return fail('CONTRACTOR_REQUIRED',403);
  const profile=await organizationFor(env,actor),row=await env.DB.prepare('SELECT * FROM rfqs WHERE id=? AND contractor_id=? AND deleted_at IS NULL').bind((transition??editMatch)![1],profile?.id??'').first<any>();
  if(!row)return fail('RFQ_NOT_FOUND',404);
  const removing=method==='DELETE',target=removing?'cancelled':body.status;
  const allowed:Record<string,string[]>={draft:['submitted','cancelled'],submitted:['draft','cancelled'],reviewed_published:['cancelled'],receiving_quotations:['under_evaluation','cancelled'],under_evaluation:['receiving_quotations','cancelled'],awarded:['closed']};
  if(removing?['awarded','closed'].includes(row.status):!(allowed[row.status]??[]).includes(target))return fail('INVALID_STATE_TRANSITION',409);
  if(target==='submitted'&&(!await env.DB.prepare('SELECT id FROM rfq_items WHERE rfq_id=? LIMIT 1').bind(row.id).first()||Date.parse(row.submission_deadline)<=Date.now()))return fail('RFQ_NOT_READY',409);
  const revision=crypto.randomUUID(),now=new Date().toISOString();
  const result=await env.DB.batch([
   env.DB.prepare(`UPDATE rfqs SET status=?,deleted_at=?,revision_nonce=? WHERE id=? AND contractor_id=? AND status=? AND deleted_at IS NULL
    AND (?='closed' OR NOT EXISTS(SELECT 1 FROM awards WHERE rfq_id=rfqs.id))
    AND (?<>'draft' OR NOT EXISTS(SELECT 1 FROM vendor_quotes WHERE rfq_id=rfqs.id))`).bind(target,removing?now:null,revision,row.id,profile!.id,row.status,target,target),
   env.DB.prepare('INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM rfqs WHERE id=? AND revision_nonce=?)').bind(crypto.randomUUID(),actor.id,actor.role,removing?'RFQ_REMOVE':'RFQ_STATUS','rfq',row.id,JSON.stringify({from:row.status,to:target}),now,row.id,revision),
   env.DB.prepare("UPDATE email_outbox SET status='suppressed',completed_at=? WHERE status='pending' AND (? IN ('draft','cancelled')) AND (instr(event_key,?)=1 OR instr(event_key,?)=1) AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND revision_nonce=?)").bind(now,target,'admin-rfq:'+row.id+':','rfq:'+row.id+':',row.id,revision)
  ]);
  return result[0].meta.changes?ok({id:row.id,status:target,removed:removing}):fail('RFQ_CONFLICT',409);
 }
 if(path==='/api/documents/upload'&&method==='POST') {
  if(actor.role!=='admin'){const denied=await termsGate(request,env,actor,actor.role);if(denied)return denied;}
  const rfqId=typeof body.rfqId==='string'?body.rfqId:null;
  if(body.publicQuoteId||body.quotationId)return fail('UNSUPPORTED_DOCUMENT_TARGET');
  if(rfqId){const profile=await organizationFor(env,actor),owned=await env.DB.prepare("SELECT id FROM rfqs WHERE id=? AND contractor_id=? AND status='draft' AND deleted_at IS NULL").bind(rfqId,profile?.id??'').first();if(actor.role!=='contractor'||!owned)return fail('DOCUMENT_TARGET_NOT_AVAILABLE',403);}
  if(!rfqId&&body.documentPurpose!=='trade_license'&&body.documentPurpose!=='other')return fail('DOCUMENT_TARGET_REQUIRED');
  let upload;try{upload=await storedUpload(env,actor,body,rfqId);}catch{return fail('INVALID_DOCUMENT');}
  try{await env.DOCUMENTS_BUCKET.put(upload.key,upload.parsed.bytes,{httpMetadata:{contentType:upload.parsed.type}});await env.DB.batch([upload.statement,audit(env,actor,'DOCUMENT_UPLOAD','document',upload.id)]);}catch{await env.DOCUMENTS_BUCKET.delete(upload.key);return fail('DOCUMENT_PERSISTENCE_FAILED',500);}
  const doc=documentDto(await env.DB.prepare('SELECT * FROM rfq_documents WHERE id=?').bind(upload.id).first(),actor.role==='admin');return Response.json({success:true,document:doc},{status:201});
 }
 const docAccess=path.match(/^\/api\/documents\/([^/]+)\/(view|download)$/);
 if(docAccess&&method==='GET') {
  const doc=await env.DB.prepare('SELECT * FROM rfq_documents WHERE id=?').bind(docAccess[1]).first<any>();if(!doc)return fail('DOCUMENT_NOT_FOUND',404);
  let permitted=actor.role==='admin'||doc.uploader_user_id===actor.id;
  if(actor.role!=='admin'){const denied=await termsGate(request,env,actor,actor.role);if(denied)return denied;}
  if(!permitted&&doc.quotation_id&&actor.role==='contractor'){const profile=await organizationFor(env,actor);permitted=!!await env.DB.prepare("SELECT q.id FROM vendor_quotes q JOIN rfqs r ON r.id=q.rfq_id WHERE q.id=? AND r.contractor_id=? AND q.withdrawn_at IS NULL AND q.deleted_at IS NULL AND r.deleted_at IS NULL AND r.status NOT IN ('draft','cancelled') AND (?=1 OR EXISTS(SELECT 1 FROM awards a WHERE a.quotation_id=q.id))").bind(doc.quotation_id,profile?.id??'',doc.vendor_access_approved).first();}
  if(!permitted&&doc.rfq_id&&!doc.quotation_id&&actor.role==='vendor'&&doc.vendor_access_approved===1){
   const profile=await organizationFor(env,actor),vendor=await env.DB.prepare('SELECT * FROM vendors WHERE id=?').bind(profile?.id??'').first<any>(),rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(doc.rfq_id).first<any>();
   permitted=vendor?.verification_status==='verified'&&rfq&&JSON.parse(vendor.trade_categories).includes(rfq.category)&&['reviewed_published','receiving_quotations'].includes(rfq.status)&&Date.parse(rfq.submission_deadline)>Date.now();
   if(!permitted)permitted=!!await env.DB.prepare('SELECT id FROM awards WHERE rfq_id=? AND vendor_id=?').bind(doc.rfq_id,profile?.id??'').first();
  }
  if(!permitted)return fail('DOCUMENT_NOT_AVAILABLE',404);
  const object=await env.DOCUMENTS_BUCKET.get(doc.r2_object_key);if(!object)return fail('DOCUMENT_PAYLOAD_UNAVAILABLE',404);
  await audit(env,actor,'DOCUMENT_ACCESS','document',doc.id).run();
  return new Response(object.body,{headers:{'Content-Type':doc.file_type,'Content-Disposition':`${docAccess[2]==='download'?'attachment':'inline'}; filename="${doc.file_name.replace(/[\r\n"\\]/g,'_')}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});
 }
 if(actor.role!=='admin')return null;
 if(path==='/api/admin/email/workflow-test'&&method==='POST'){
  // Explicit owner-only staging test of the real outbox claim/send/completion.
  // The global delivery switch stays off and no other pending event is drained.
  if(env.ENVIRONMENT!=='advanced-staging'||actor.email.toLowerCase()!=='urbanprocures@urbanprocures.com')return fail('OWNER_STAGING_TEST_REQUIRED',403);
  if(body.confirmOwnerOnlyTest!==true)return fail('EXPLICIT_TEST_CONFIRMATION_REQUIRED');
  if(!await rateAllowed(env,'owner-outbox-test',1,3600000))return fail('TRY_AGAIN_LATER',429);
  const id=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO email_outbox(id,event_key,user_id,subject,content) VALUES (?,?,?,?,?)').bind(id,'owner-test:'+id,actor.id,'Urban Procures staging outbox workflow test','Owner-authorized staging notification workflow test. No customer recipients or production resources were used.').run();
  const result=await dispatchNotifications({...env,EMAIL_DELIVERY_ENABLED:'true'},sendZohoMail,id);
  await audit(env,actor,'OWNER_STAGING_OUTBOX_TEST','email',id).run();
  return result.sent===1?ok({providerAccepted:true,outboxStatus:'sent',inboxDeliveryVerified:false}):fail('EMAIL_DELIVERY_UNAVAILABLE',503);
 }
 if(path==='/api/admin/email/test'&&method==='POST'){
  // Owner-approved staging-only test: never accepts a recipient from the browser.
  if(env.ENVIRONMENT!=='advanced-staging'||actor.email.toLowerCase()!=='urbanprocures@urbanprocures.com')return fail('OWNER_STAGING_TEST_REQUIRED',403);
  if(body.confirmOwnerOnlyTest!==true)return fail('EXPLICIT_TEST_CONFIRMATION_REQUIRED');
  if(!await rateAllowed(env,'owner-mail-test',1,3600000))return fail('TRY_AGAIN_LATER',429);
  try{
   await sendZohoMail(env,{toAddress:'urbanprocures@urbanprocures.com',subject:'Urban Procures staging email delivery test',content:'Owner-authorized staging delivery test. No production resources or customer accounts were changed.'});
  }catch(error){return Response.json({success:false,error:'EMAIL_DELIVERY_UNAVAILABLE',phase:error instanceof ZohoOAuthError?'oauth':'mail',providerStatus:error instanceof ZohoOAuthError||error instanceof ZohoDeliveryError?error.providerStatus??null:null,providerCode:error instanceof ZohoOAuthError||error instanceof ZohoDeliveryError?error.providerCode??null:'internal_configuration_failure',mailStatus:error instanceof ZohoDeliveryError?error.mailStatus??null:null},{status:503,headers:{'Cache-Control':'no-store'}});}
  await audit(env,actor,'OWNER_STAGING_EMAIL_TEST','email','owner-test').run();
  return ok({providerAccepted:true,inboxDeliveryVerified:false});
 }
 if(path==='/api/admin/email/outbox'&&method==='GET'){
  const rows=await env.DB.prepare('SELECT status,count(*) AS count FROM email_outbox GROUP BY status').all();return ok(rows.results);
 }
 if(path==='/api/admin/email/health'&&method==='POST'){
  try{await verifyZohoAuthentication(env);return ok({authenticated:true,emailSent:false});}
  catch(error){return Response.json({success:false,error:'EMAIL_AUTHENTICATION_UNAVAILABLE',providerStatus:error instanceof ZohoOAuthError?error.providerStatus??null:null,providerCode:error instanceof ZohoOAuthError?error.providerCode??null:error instanceof Error&&['EMAIL_NOT_CONFIGURED','EMAIL_CONFIGURATION_INVALID'].includes(error.message)?error.message:'internal_configuration_failure'},{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 const listing:Record<string,string>={users:'SELECT id,email,role,status,created_at FROM users WHERE role IN (\'admin\',\'contractor\',\'vendor\')',contractors:'SELECT * FROM contractors',vendors:'SELECT * FROM vendors',documents:`SELECT d.* FROM rfq_documents d LEFT JOIN rfqs r ON r.id=d.rfq_id LEFT JOIN vendor_quotes q ON q.id=d.quotation_id WHERE (d.rfq_id IS NULL OR (r.deleted_at IS NULL AND r.status NOT IN ('draft','cancelled'))) AND (d.quotation_id IS NULL OR (q.withdrawn_at IS NULL AND q.deleted_at IS NULL))`,'site-visits':'SELECT * FROM site_visits',awards:'SELECT * FROM awards',quotations:`SELECT q.* FROM vendor_quotes q JOIN rfqs r ON r.id=q.rfq_id WHERE q.withdrawn_at IS NULL AND q.deleted_at IS NULL AND r.deleted_at IS NULL AND r.status NOT IN ('draft','cancelled')`,'service-charges':'SELECT * FROM service_charges','audit-logs':'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 500',invitations:'SELECT * FROM invitations'};
 if(path==='/api/admin/quotations/history'&&method==='GET'){const rows=await env.DB.prepare('SELECT * FROM vendor_quotes').all();return ok(rows.results.map(camel));}
 if(path==='/api/admin/revision'&&method==='GET'){const row=await env.DB.prepare('SELECT coalesce(max(rowid),0) AS revision FROM audit_logs').first();return ok(row);}
 if(path==='/api/admin/notifications'&&method==='GET'){const rows=await env.DB.prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 30").bind(actor.id).all();return ok(rows.results.map(camel));}
 if(path==='/api/admin/documents/history'&&method==='GET'){const rows=await env.DB.prepare('SELECT * FROM rfq_documents').all();return ok(rows.results.map(r=>documentDto(r,true)));}
 if(path==='/api/admin/rfqs/history'&&method==='GET'){const rows=await env.DB.prepare('SELECT * FROM rfqs ORDER BY created_at DESC').all();return ok(await Promise.all(rows.results.map(r=>rfqDto(env,r))));}
 const resource=path.slice('/api/admin/'.length);
 if(method==='GET'&&listing[resource]){const rows=await env.DB.prepare(listing[resource]).all<any>();return ok(rows.results.map(r=>{const result=resource==='documents'?documentDto(r,true):camel(r);if(resource==='vendors'){result.tradeCategories=JSON.parse(r.trade_categories);result.emiratesServiced=JSON.parse(r.emirates_serviced);}return result;}));}
 if(path==='/api/admin/rfqs'&&method==='GET'){const rows=await env.DB.prepare('SELECT * FROM rfqs WHERE deleted_at IS NULL AND status NOT IN (\'draft\',\'cancelled\') ORDER BY created_at DESC').all();return ok(await Promise.all(rows.results.map(r=>rfqDto(env,r))));}
 if(path==='/api/admin/public-quotes'&&method==='GET'){const rows=await env.DB.prepare('SELECT * FROM get_a_quote_requests ORDER BY created_at DESC').all<any>();const data=[];for(const row of rows.results){const attachments=await env.DB.prepare('SELECT * FROM rfq_documents WHERE public_quote_id=?').bind(row.id).all();data.push({...camel(row),siteVisitRequested:!!row.site_visit_requested,attachments:attachments.results.map(d=>documentDto(d,true))});}return ok(data);}
 const publish=path.match(/^\/api\/admin\/rfqs\/([^/]+)\/publish$/);
 if(publish&&method==='POST') {
  const row=await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(publish[1]).first<any>();if(!row)return fail('RFQ_NOT_FOUND',404);
  if(row.deleted_at||row.status!=='submitted'||Date.parse(row.submission_deadline)<=Date.now())return fail('RFQ_NOT_READY',409);
  if(body.identityReviewConfirmed!==true)return fail('IDENTITY_REVIEW_REQUIRED',409);
  const results=await env.DB.batch([env.DB.prepare("UPDATE rfqs SET status='reviewed_published',published_at=? WHERE id=? AND status='submitted' AND deleted_at IS NULL").bind(new Date().toISOString(),row.id),audit(env,actor,'RFQ_PUBLISH','rfq',row.id,{identityReviewConfirmed:true})]);return results[0].meta.changes?ok({id:row.id,status:'reviewed_published'}):fail('RFQ_CONFLICT',409);
 }
 const verify=path.match(/^\/api\/admin\/vendors\/([^/]+)\/verification$/);
 if(verify&&method==='PATCH') {
  if(!['verified','rejected','pending'].includes(body.status))return fail('INVALID_VERIFICATION_STATUS');
  const vendor=await env.DB.prepare('SELECT * FROM vendors WHERE id=?').bind(verify[1]).first<any>();if(!vendor)return fail('VENDOR_NOT_FOUND',404);
  if(body.status==='verified'&&!await env.DB.prepare("SELECT id FROM rfq_documents WHERE uploader_user_id=? AND document_purpose='trade_license'").bind(vendor.user_id).first())return fail('TRADE_LICENSE_REVIEW_REQUIRED',409);
  await env.DB.batch([env.DB.prepare('UPDATE vendors SET verification_status=? WHERE id=?').bind(body.status,vendor.id),audit(env,actor,'VENDOR_VERIFICATION','vendor',vendor.id,{status:body.status})]);return ok({id:vendor.id,status:body.status});
 }
 const contractorVerify=path.match(/^\/api\/admin\/contractors\/([^/]+)\/verification$/);
 if(contractorVerify&&method==='PATCH'){const c=await env.DB.prepare('SELECT * FROM contractors WHERE id=?').bind(contractorVerify[1]).first<any>();if(!c)return fail('CONTRACTOR_NOT_FOUND',404);if(body.verified!==true)return fail('EXPLICIT_VERIFICATION_REQUIRED');if(!await env.DB.prepare("SELECT id FROM rfq_documents WHERE uploader_user_id=? AND document_purpose='trade_license'").bind(c.user_id).first())return fail('TRADE_LICENSE_REVIEW_REQUIRED',409);const now=new Date().toISOString();await env.DB.batch([env.DB.prepare('UPDATE contractors SET verified_at=? WHERE id=?').bind(now,c.id),audit(env,actor,'CONTRACTOR_VERIFICATION','contractor',c.id)]);return ok({id:c.id,verifiedAt:now});}
 const approval=path.match(/^\/api\/admin\/documents\/([^/]+)\/release$/);
 if(approval&&method==='POST') {
  if(body.identityReviewConfirmed!==true)return fail('IDENTITY_REVIEW_REQUIRED',409);
  const doc=await env.DB.prepare("SELECT d.id FROM rfq_documents d JOIN rfqs r ON r.id=d.rfq_id LEFT JOIN vendor_quotes q ON q.id=d.quotation_id WHERE d.id=? AND r.deleted_at IS NULL AND r.status NOT IN ('draft','cancelled') AND (d.quotation_id IS NULL OR (q.withdrawn_at IS NULL AND q.deleted_at IS NULL)) AND d.document_purpose!='trade_license'").bind(approval[1]).first();if(!doc)return fail('DOCUMENT_NOT_FOUND',404);
  const results=await env.DB.batch([env.DB.prepare(`UPDATE rfq_documents SET vendor_access_approved=1 WHERE id=? AND EXISTS(SELECT 1 FROM rfqs r WHERE r.id=rfq_documents.rfq_id AND r.deleted_at IS NULL AND r.status NOT IN ('draft','cancelled')) AND (quotation_id IS NULL OR EXISTS(SELECT 1 FROM vendor_quotes q WHERE q.id=quotation_id AND q.withdrawn_at IS NULL AND q.deleted_at IS NULL))`).bind(approval[1]),audit(env,actor,'DOCUMENT_IDENTITY_REVIEW','document',approval[1])]);return results[0].meta.changes?ok({id:approval[1]}):fail('DOCUMENT_NOT_AVAILABLE',409);
 }
 const user=path.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
 if(user&&method==='PATCH') {
  if(!['active','suspended','pending'].includes(body.status)||user[1]===actor.id)return fail('INVALID_ACCOUNT_STATUS');
  const target=await env.DB.prepare("SELECT id FROM users WHERE id=? AND role IN ('vendor','contractor')").bind(user[1]).first();if(!target)return fail('ACCOUNT_NOT_FOUND',404);
  await env.DB.batch([env.DB.prepare('UPDATE users SET status=?,updated_at=? WHERE id=?').bind(body.status,new Date().toISOString(),user[1]),env.DB.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(user[1]),audit(env,actor,'ACCOUNT_STATUS','user',user[1],{status:body.status})]);return ok({id:user[1],status:body.status});
 }
 const publicUpdate=path.match(/^\/api\/admin\/public-quotes\/([^/]+)$/);
 if(publicUpdate&&method==='PATCH') {
  const row=await env.DB.prepare('SELECT * FROM get_a_quote_requests WHERE id=?').bind(publicUpdate[1]).first<any>();if(!row)return fail('REQUEST_NOT_FOUND',404);
  const transitions:Record<string,string[]>={received:['under_review','cancelled'],under_review:['site_visit_scheduled','dispatched_to_vendors','completed','cancelled'],site_visit_scheduled:['under_review','completed','cancelled'],dispatched_to_vendors:['completed','cancelled']};
  if(!(transitions[row.status]??[]).includes(body.status))return fail('INVALID_STATE_TRANSITION',409);
  if(body.status==='dispatched_to_vendors')return fail('VENDOR_DISPATCH_NOT_CONFIGURED',503);
  const statements=[env.DB.prepare('UPDATE get_a_quote_requests SET status=? WHERE id=? AND status=?').bind(body.status,row.id,row.status),audit(env,actor,'PUBLIC_QUOTE_STATUS','public_quote',row.id,{status:body.status})];
  if(body.status==='site_visit_scheduled'){
   if(!row.site_visit_requested||!Number.isFinite(Date.parse(body.scheduledDate))||Date.parse(body.scheduledDate)<=Date.now()||typeof body.inspectorName!=='string'||!body.inspectorName.trim())return fail('SITE_VISIT_DETAILS_REQUIRED');
   statements.push(env.DB.prepare("UPDATE site_visits SET status='scheduled',scheduled_date=?,inspector_name=? WHERE request_id=? AND status='pending'").bind(new Date(body.scheduledDate).toISOString(),body.inspectorName.slice(0,250),row.id));
  }
  const results=await env.DB.batch(statements);return results[0].meta.changes?ok({id:row.id,status:body.status}):fail('REQUEST_CONFLICT',409);
 }
 return null;
}
