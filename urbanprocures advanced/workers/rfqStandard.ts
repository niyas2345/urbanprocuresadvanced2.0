import type {Env} from './index.ts';
import type {Actor} from './terms.ts';
import {organizationFor,termsGate} from './terms.ts';
import {maskedText} from './privacy.ts';
import {normalizeStandard,standardHolds,type StandardRFQ} from '../shared/rfqStandard.ts';
import {renderStandardHTML,renderStandardPDF} from './rfqStandardRenderer.ts';
const reply=(data:unknown,status=200)=>Response.json({success:status<400,...(status<400?{data}:{error:data})},{status,headers:{'Cache-Control':'no-store'}});
const audit=(env:Env,actor:Actor,action:string,id:string,payload:unknown={})=>env.DB.prepare('INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor.id,actor.role,action,'rfq',id,JSON.stringify(payload),new Date().toISOString());
const safeId=(s:string)=>/^[a-zA-Z0-9_-]{1,128}$/.test(s);
async function identityFor(env:Env,id:string){return env.DB.prepare('SELECT c.company_name,c.contact_person,c.contact_phone,c.trade_license_number,c.address,u.email FROM rfqs r JOIN contractors c ON c.id=r.contractor_id JOIN users u ON u.id=c.user_id WHERE r.id=?').bind(id).first<Record<string,unknown>>();}
export async function standardDraft(env:Env,id:string){return env.DB.prepare("SELECT * FROM rfq_standard_revisions WHERE rfq_id=? AND status IN ('draft','pending_clarification','reviewed') ORDER BY revision DESC LIMIT 1").bind(id).first<any>();}
export async function createStandardDraft(env:Env,actor:Actor,id:string,raw:any){
 const rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=? AND deleted_at IS NULL').bind(id).first<any>();if(!rfq||['awarded','closed','cancelled'].includes(rfq.status))throw Error('RFQ_NOT_REVISABLE');
 const previous=await standardDraft(env,id);if(previous&&raw.expectedRevision!==previous.revision)throw Error('DRAFT_REVISION_REQUIRED');
 const identity=await identityFor(env,id),revision=previous?.revision??(await env.DB.prepare('SELECT coalesce(max(revision),0)+1 AS n FROM rfq_standard_revisions WHERE rfq_id=?').bind(id).first<{n:number}>())!.n,now=new Date().toISOString();
 const sensitive=Array.isArray(raw.sensitiveStrings)?Object.fromEntries(raw.sensitiveStrings.filter((s:unknown)=>typeof s==='string'&&s.length>=3).slice(0,100).map((s:string,i:number)=>['source'+i,s])):{};
 const content=normalizeStandard(raw,{reference:rfq.reference_code,revision,issueDate:now},s=>maskedText(s,{...identity,...sensitive})??'');
 const holds=standardHolds(content,{hasPrivateContact:!!identity?.email||!!identity?.contact_phone,unreadableAttachments:raw.unreadableAttachments===true,quantityConflict:raw.quantityConflict===true});
 const docs=await env.DB.prepare('SELECT id FROM rfq_documents WHERE rfq_id=? AND quotation_id IS NULL').bind(id).all<{id:string}>();if(content.attachments.some(a=>!docs.results.some(d=>d.id===a.documentId)))throw Error('FOREIGN_ATTACHMENT_REFERENCE');
 const held=holds.hard.length||holds.soft.length;
 if(previous){await env.DB.batch([env.DB.prepare("UPDATE rfq_standard_revisions SET content_json=?,status=?,hold_reasons_json=?,created_at=?,created_by=?,previewed_by=NULL,previewed_at=NULL WHERE rfq_id=? AND revision=? AND status IN ('draft','pending_clarification','reviewed')").bind(JSON.stringify(content),held?'pending_clarification':'draft',JSON.stringify(holds),now,actor.id,id,previous.revision),audit(env,actor,'RFQ_STANDARD_DRAFT_CORRECTION',id,{revision,holds})]);return {content,holds};}
 const result=await env.DB.batch([env.DB.prepare('INSERT INTO rfq_standard_revisions(rfq_id,revision,content_json,status,hold_reasons_json,created_at,created_by,clarification_requested_at,reminder_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,revision,JSON.stringify(content),held?'pending_clarification':'draft',JSON.stringify(holds),now,actor.id,held?now:null,held?new Date(Date.now()+48*3600000).toISOString():null,held?new Date(Date.now()+7*86400000).toISOString():null),audit(env,actor,'RFQ_STANDARD_DRAFT',id,{revision,holds})]);
 if(!result[0].meta.changes)throw Error('RFQ_REVISION_CONFLICT');return {content,holds};
}
export async function defaultStandardContent(env:Env,id:string){
 const rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(id).first<any>();if(!rfq)throw Error('RFQ_NOT_FOUND');
 const docs=await env.DB.prepare("SELECT * FROM rfq_documents WHERE rfq_id=? AND quotation_id IS NULL AND document_purpose!='trade_license' ORDER BY created_at,id").bind(id).all<any>();
 const extracted=docs.results.map(d=>{try{return {...d,content:JSON.parse(d.standardized_content_json||'{}')};}catch{return {...d,content:{}};}});
 const primary=[...extracted].sort((a,b)=>(b.content.rows?.length||0)-(a.content.rows?.length||0))[0];
 const legacy=await env.DB.prepare('SELECT * FROM rfq_items WHERE rfq_id=? ORDER BY item_number').bind(id).all<any>();
 const rows=primary?.content.rows?.length?primary.content.rows.map((r:any,i:number)=>({id:crypto.randomUUID(),description:r.description,specRef:'ATT-'+String(extracted.findIndex(d=>d.id===primary.id)+1).padStart(2,'0'),unit:r.unit,quantity:/^\d+(?:\.\d+)?$/.test(String(r.quantity))?Number(r.quantity):null,quantitySource:'Stated',remarks:''})):legacy.results.map(i=>({id:i.id,description:i.description,specRef:i.specifications||'',unit:i.unit,quantity:i.quantity>0?i.quantity:null,quantitySource:'Stated',remarks:''}));
 return {title:rfq.category+' works',category:rfq.category,location:rfq.location_emirate,quotationDeadline:rfq.submission_deadline,requiredBy:rfq.target_completion_date,requestType:'Itemized BOQ',overview:primary?.content.summary||rfq.scope_description,scope:[primary?.content.summary||rfq.scope_description],siteConditions:'Not provided',workingHours:'Not provided',materialSupply:'Not provided',items:rows,attachments:extracted.map((d,i)=>({documentId:d.id,title:d.content.title||'Technical supporting document',type:d.content.rows?.length?'BOQ':d.file_type.startsWith('image/')?'Photo':'Other',pages:null,revision:'Not provided',linkedItems:d.id===primary?.id?rows.map((_:unknown,j:number)=>j+1):[],referenceOnly:d.id!==primary?.id})),clarifications:[{topic:'Source review',status:'Open',statement:'Confirm extracted items against original documents, reconcile overlapping sources and verify required commercial information.'}],instructions:{validityDays:30,paymentTerms:'Not provided',dlp:'Not provided',warranty:'Not provided'},siteVisitOption:false,changeSummary:'Standardization of existing request; original submissions retained',unreadableAttachments:extracted.some(d=>d.standardization_status==='needs_manual_review')};
}
async function checkVendor(env:Env,request:Request,actor:Actor,rfq:any){
 const gate=await termsGate(request,env,actor,'vendor');if(gate)return gate;
 const org=await organizationFor(env,actor),v=await env.DB.prepare("SELECT id FROM vendors WHERE id=? AND verification_status='verified'").bind(org?.id??'').first();
 if(!v||rfq.deleted_at||!['reviewed_published','receiving_quotations'].includes(rfq.status)||Date.parse(rfq.submission_deadline)<=Date.now())return reply('RFQ_NOT_AVAILABLE',404);return null;
}
export async function standardRFQRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null>{
 const url=new URL(request.url),path=url.pathname;
 const admin=path.match(/^\/api\/admin\/rfqs\/([^/]+)\/standard(?:\/(preview|publish|generate))?$/);
 const virtual=path.match(/^\/api\/documents\/rfqpkg-([^/]+)\/(?:standardized\/)?(view|download)$/);
 const questions=path.match(/^\/api\/(vendor|admin)\/rfqs\/([^/]+)\/questions$/);
 if(!admin&&!virtual&&!questions)return null;
 if(!actor||actor.status!=='active')return reply('AUTHENTICATION_REQUIRED',401);
 const id=admin?.[1]??virtual?.[1]??questions?.[2]??'';if(!safeId(id))return reply('INVALID_RFQ_ID',400);
 const rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(id).first<any>();if(!rfq)return reply('RFQ_NOT_FOUND',404);
 if(admin&&actor.role!=='admin')return reply('ADMIN_REQUIRED',403);
 if(virtual||questions){if(actor.role==='vendor'){const denied=await checkVendor(env,request,actor,rfq);if(denied)return denied;}else if(actor.role!=='admin')return reply('ADMIN_OR_VENDOR_REQUIRED',403);}
 if(questions){
  if(request.method==='GET'){const rows=await env.DB.prepare('SELECT id,revision,question,answer,status,created_at,answered_at FROM rfq_shared_questions WHERE rfq_id=?'+(actor.role==='admin'?'':" AND status IN ('approved','answered')")+' ORDER BY created_at').bind(id).all();return reply(rows.results);}
  if(request.method==='POST'&&actor.role==='vendor'){const body:any=await request.json();if(typeof body.question!=='string'||!body.question.trim()||body.question.length>3000)return reply('INVALID_QUESTION',400);const identity=await env.DB.prepare('SELECT company_name,contact_person,contact_phone FROM vendors WHERE user_id=?').bind(actor.id).first<Record<string,unknown>>();const qid=crypto.randomUUID(),now=new Date().toISOString();await env.DB.batch([env.DB.prepare("INSERT INTO rfq_shared_questions(id,rfq_id,revision,vendor_user_id,question,status,created_at) VALUES(?,?,?,?,?,'pending',?)").bind(qid,id,rfq.standard_revision,actor.id,maskedText(body.question,{...identity,email:actor.email}),now),audit(env,actor,'RFQ_QUESTION_SUBMIT',id,{questionId:qid})]);return reply({id:qid,status:'pending'},201);}
  if(request.method==='PUT'&&actor.role==='admin'){const body:any=await request.json();if(!safeId(body.id||'')||!['approved','answered','rejected'].includes(body.status)||body.identityReviewConfirmed!==true)return reply('QUESTION_REVIEW_REQUIRED',400);if(body.status==='answered'&&(typeof body.answer!=='string'||!body.answer.trim()||body.answer.length>5000))return reply('ANSWER_REQUIRED',400);const r=await env.DB.batch([env.DB.prepare('UPDATE rfq_shared_questions SET status=?,answer=?,reviewed_by=?,answered_at=? WHERE id=? AND rfq_id=?').bind(body.status,typeof body.answer==='string'?maskedText(body.answer,await identityFor(env,id)):null,actor.id,new Date().toISOString(),body.id,id),audit(env,actor,'RFQ_QUESTION_REVIEW',id,{questionId:body.id})]);return r[0].meta.changes?reply({id:body.id,status:body.status}):reply('QUESTION_NOT_FOUND',404);}
  return reply('METHOD_NOT_ALLOWED',405);
 }
 const draft=await standardDraft(env,id);
 if(admin&&!admin[2]&&request.method==='GET')return reply({draft:draft?{...draft,content:JSON.parse(draft.content_json),holds:JSON.parse(draft.hold_reasons_json)}:null,published:rfq.standard_published_json?JSON.parse(rfq.standard_published_json):null});
 if(admin&&['generate',undefined].includes(admin[2])&&['POST','PUT'].includes(request.method)){
  try{const raw=request.method==='PUT'?await request.json():await defaultStandardContent(env,id);return reply(await createStandardDraft(env,actor,id,raw),201);}catch(e){return reply(e instanceof Error?e.message:'INVALID_STANDARD_PACKAGE',409);}
 }
 if((admin?.[2]==='preview'||virtual)&&request.method==='GET'){
  const content:StandardRFQ|null=actor.role==='admin'&&draft?JSON.parse(draft.content_json):rfq.standard_published_json?JSON.parse(rfq.standard_published_json):null;if(!content)return reply('STANDARD_PACKAGE_NOT_READY',409);
  const html=url.searchParams.get('format')==='html',bytes=html?renderStandardHTML(content,actor.role==='admin'&&!!draft):await renderStandardPDF(content,actor.role==='admin'&&!!draft);
  if(actor.role==='admin'&&draft)await env.DB.batch([env.DB.prepare('UPDATE rfq_standard_revisions SET previewed_by=?,previewed_at=? WHERE rfq_id=? AND revision=?').bind(actor.id,new Date().toISOString(),id,draft.revision),audit(env,actor,'RFQ_STANDARD_PREVIEW',id,{revision:draft.revision})]);
  return new Response(bytes as BodyInit,{headers:{'Content-Type':html?'text/html; charset=utf-8':'application/pdf','Cache-Control':'private, no-store','Content-Disposition':`${virtual?.[2]==='download'?'attachment':'inline'}; filename="Urban-Procures-${rfq.reference_code.replace(/[^a-zA-Z0-9_-]/g,'')}-Rev-${content.revision}.${html?'html':'pdf'}"`,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'; style-src 'unsafe-inline'"}});
 }
 if(admin?.[2]==='publish'&&request.method==='POST'){
  const body:any=await request.json();if(body.identityReviewConfirmed!==true||body.technicalReviewConfirmed!==true)return reply('IDENTITY_AND_TECHNICAL_REVIEW_REQUIRED',409);
  if(!draft||draft.previewed_by!==actor.id||!draft.previewed_at)return reply('OPEN_STANDARD_PREVIEW_BEFORE_PUBLISH',409);
  if(!['submitted','reviewed_published','receiving_quotations','under_evaluation'].includes(rfq.status)||rfq.deleted_at)return reply('RFQ_NOT_PUBLISHABLE',409);
  const content:StandardRFQ=JSON.parse(draft.content_json),holds=JSON.parse(draft.hold_reasons_json);const fresh=standardHolds(content,{hasPrivateContact:!!(await identityFor(env,id))?.email});
  if(!content.quotationDeadline)return reply('QUOTATION_DEADLINE_REQUIRED',409);
  if(holds.hard.length||fresh.hard.length)return reply('HARD_HOLD_PENDING_CLARIFICATION',409);
  if((holds.soft.length||fresh.soft.length)&&!(content.requestType==='Preliminary Quotation'&&body.preliminaryApproved===true))return reply('SOFT_HOLD_OR_EXPLICIT_PRELIMINARY_APPROVAL_REQUIRED',409);
  for(const a of content.attachments){const d=await env.DB.prepare("SELECT standardized_r2_key FROM rfq_documents WHERE id=? AND rfq_id=? AND quotation_id IS NULL AND vendor_access_approved=1 AND standardization_status='approved'").bind(a.documentId,id).first<any>();if(!d?.standardized_r2_key||!await env.DOCUMENTS_BUCKET.head(d.standardized_r2_key))return reply('REVIEWED_ATTACHMENT_REQUIRED',409);}
  const now=new Date().toISOString();const results=await env.DB.batch([
   env.DB.prepare("UPDATE rfqs SET standard_revision=?,standard_published_json=?,status='reviewed_published',published_at=?,submission_deadline=? WHERE id=? AND standard_revision=? AND deleted_at IS NULL AND status IN ('submitted','reviewed_published','receiving_quotations','under_evaluation') AND NOT EXISTS(SELECT 1 FROM awards WHERE rfq_id=rfqs.id)").bind(content.revision,JSON.stringify(content),now,content.quotationDeadline,id,rfq.standard_revision),
   env.DB.prepare("UPDATE rfq_standard_revisions SET status='superseded' WHERE rfq_id=? AND status='published' AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND standard_revision=?)").bind(id,id,content.revision),
   env.DB.prepare("UPDATE rfq_standard_revisions SET status='published',published_at=? WHERE rfq_id=? AND revision=? AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND standard_revision=?)").bind(now,id,content.revision,id,content.revision),
   env.DB.prepare("INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,'admin','RFQ_STANDARD_PUBLISH','rfq',id,?,? FROM rfqs WHERE id=? AND standard_revision=?").bind(crypto.randomUUID(),actor.id,JSON.stringify({revision:content.revision,previousRevision:rfq.standard_revision,preliminary:content.requestType==='Preliminary Quotation',identityReviewConfirmed:true,technicalReviewConfirmed:true}),now,id,content.revision),
   env.DB.prepare("INSERT INTO notifications(id,user_id,role,title,message,notification_type,link,created_at) SELECT ?,u.id,'contractor','RFQ revision published',?,'info','/contractor',? FROM users u JOIN contractors c ON c.user_id=u.id JOIN rfqs r ON r.contractor_id=c.id WHERE r.id=? AND r.standard_revision=?").bind(crypto.randomUUID(),'Revision '+content.revision+' is available. Earlier quotations retain their original revision; review the deadline.',now,id,content.revision)
  ]);
  return results[0].meta.changes?reply({id,revision:content.revision,status:'reviewed_published',preliminary:content.requestType==='Preliminary Quotation'}):reply('RFQ_REVISION_CONFLICT',409);
 }
 return reply('METHOD_NOT_ALLOWED',405);
}
export function standardDTO(rfq:any,base:any){
 if(!rfq.standard_published_json)return base;const p:StandardRFQ=JSON.parse(rfq.standard_published_json);
 return {...base,title:p.title,scopeDescription:p.overview,standardPackage:p,revision:p.revision,preliminary:p.requestType==='Preliminary Quotation',items:p.items.map(i=>({...i,specifications:i.specRef})),documents:[{id:'rfqpkg-'+rfq.id,fileName:'Urban-Procures-'+rfq.reference_code+'-Rev-'+p.revision+'.pdf',fileType:'application/pdf',fileSizeBytes:0,documentPurpose:'boq',createdAt:rfq.published_at},...base.documents.map((d:any)=>{const a=p.attachments.find(a=>a.documentId===d.id);return a?{...d,fileName:a.id+'-'+a.title.replace(/[^a-zA-Z0-9 -]/g,'').slice(0,70)+'.'+(d.fileType==='application/pdf'?'pdf':d.fileType==='image/png'?'png':d.fileType==='image/jpeg'?'jpg':'html')}:d;})]};
}
export async function processStandardHolds(env:Env){
 const now=new Date().toISOString();
 await env.DB.batch([
 env.DB.prepare("INSERT OR IGNORE INTO email_outbox(id,event_key,user_id,subject,content) SELECT lower(hex(randomblob(16))),'rfq-standard-reminder:'||s.rfq_id||':'||s.revision,u.id,'Urban Procures RFQ clarification reminder','Your RFQ requires clarification before release. Please review your request in Urban Procures.' FROM rfq_standard_revisions s JOIN rfqs r ON r.id=s.rfq_id JOIN contractors c ON c.id=r.contractor_id JOIN users u ON u.id=c.user_id WHERE s.status='pending_clarification' AND s.reminder_at<=? AND s.expires_at>? AND u.status='active' AND r.deleted_at IS NULL").bind(now,now),
 env.DB.prepare("UPDATE rfq_standard_revisions SET status='expired' WHERE status='pending_clarification' AND expires_at<=?").bind(now)
 ]);
}
