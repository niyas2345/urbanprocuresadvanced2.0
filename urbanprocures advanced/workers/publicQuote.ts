import {rateAllowed} from './recovery.ts';
import type { Env } from './index.ts';
import { publicTerms, auditStatement } from './terms.ts';
export async function publicQuoteRoute(request:Request,env:Env):Promise<Response|null> {
  if(new URL(request.url).pathname!=='/api/quotes/public' || request.method!=='POST')return null;
  const fail=(error:string,status=400)=>Response.json({success:false,error,code:error},{status});
  if(!await rateAllowed(env,'public-quote:'+request.headers.get('CF-Connecting-IP'),20))return fail('TRY_AGAIN_LATER',429);
  let body:any;
  try { const raw=await request.text();if(raw.length>12000000)return fail('REQUEST_TOO_LARGE',413);body=JSON.parse(raw); }catch{return fail('INVALID_REQUEST');}
  if(!body || body.acceptTerms!==true)return fail('TERMS_ACCEPTANCE_REQUIRED',403);
  const terms=await publicTerms(env);
  if(!terms)return fail('PUBLISHED_TERMS_UNAVAILABLE',503);
  if(body.termsVersionId!==terms.id)return fail('CURRENT_PUBLIC_TERMS_REQUIRED',403);
  const fields=['customerName','customerPhone','customerEmail','description','locationEmirate','locationCommunity','workCategory'];
  if(fields.some(k=>typeof body[k]!=='string' || !body[k].trim() || body[k].length>(k==='description'?10000:250)))return fail('INVALID_QUOTE_DETAILS');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail) || !['villa','apartment','townhouse','commercial_personal'].includes(body.propertyType))return fail('INVALID_QUOTE_DETAILS');
  if(typeof body.siteVisitRequested!=='boolean')return fail('INVALID_SITE_VISIT_SELECTION');
  if(body.attachments!==undefined && (!Array.isArray(body.attachments) || body.attachments.length>3))return fail('INVALID_ATTACHMENTS');
  const uploads:Array<{id:string;key:string;name:string;type:string;bytes:Uint8Array;hash:string}>=[];
  try {
    for(const file of body.attachments||[]) {
      if(typeof file.fileName!=='string' || file.fileName.length>180 || typeof file.dataUrl!=='string')return fail('INVALID_ATTACHMENT');
      const match=file.dataUrl.match(/^data:(application\/pdf|image\/png|image\/jpeg);base64,([A-Za-z0-9+/=]+)$/);
      if(!match)return fail('UNSUPPORTED_ATTACHMENT_TYPE');
      const extension=file.fileName.split('.').pop().toLowerCase();if(!(match[1]==='application/pdf'?extension==='pdf':match[1]==='image/png'?extension==='png':['jpg','jpeg'].includes(extension)))return fail('ATTACHMENT_EXTENSION_MISMATCH');
      if(file.fileType&&file.fileType!==match[1])return fail('ATTACHMENT_TYPE_MISMATCH');
      const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));
      if(!bytes.length || bytes.length>3000000)return fail('ATTACHMENT_TOO_LARGE',413);
      const valid=match[1]==='application/pdf'?new TextDecoder().decode(bytes.slice(0,5))==='%PDF-':match[1]==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
      if(!valid)return fail('ATTACHMENT_CONTENT_MISMATCH');
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      uploads.push({id:crypto.randomUUID(),key:'public-quotes/'+crypto.randomUUID(),name:file.fileName.replace(/[\r\n"\\/]/g,'_'),type:match[1],bytes,hash});
    }
  }catch{return fail('INVALID_ATTACHMENT');}
  const id=crypto.randomUUID(),referenceCode='GAQ-'+new Date().getUTCFullYear()+'-'+crypto.randomUUID().replace(/-/g,'').toUpperCase(),now=new Date().toISOString(),auditId=crypto.randomUUID();
  const statements=[env.DB.prepare(`INSERT INTO get_a_quote_requests (id,reference_code,customer_name,customer_phone,customer_email,property_type,location_emirate,location_community,work_category,description,budget_bracket,site_visit_requested,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id,referenceCode,body.customerName.trim(),body.customerPhone.trim(),body.customerEmail.trim(),body.propertyType,body.locationEmirate.trim(),body.locationCommunity.trim(),body.workCategory.trim(),body.description.trim(),typeof body.budgetBracket==='string'?body.budgetBracket.slice(0,250):null,body.siteVisitRequested?1:0,'received',now),
    env.DB.prepare("INSERT INTO public_terms_acceptances (id,request_id,terms_document_id,terms_version,content_hash_at_acceptance,accepted_at,acceptance_method,audit_reference) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,terms.id,terms.terms_version,terms.content_sha256,now,'explicit_clickwrap',auditId),
    auditStatement(env,null,'GET_A_QUOTE_TERMS_ACCEPTED',terms,null,auditId)
  ];
  if(body.siteVisitRequested)statements.push(env.DB.prepare("INSERT INTO site_visits (id,request_id,fee_aed,status,notes,created_at) VALUES (?,?,100,'pending',?,?)").bind(crypto.randomUUID(),id,'Optional AED 100 site visit requested; not paid or scheduled',now));
  for(const u of uploads)statements.push(env.DB.prepare('INSERT INTO rfq_documents (id,public_quote_id,file_name,file_type,file_size_bytes,r2_object_key,document_purpose,sha256_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(u.id,id,u.name,u.type,u.bytes.length,u.key,u.type.startsWith('image/')?'photo':'drawing',u.hash,now));
  try {
    for(const u of uploads)await env.DOCUMENTS_BUCKET.put(u.key,u.bytes,{httpMetadata:{contentType:u.type}});
    await env.DB.batch(statements);
  }catch {
    await Promise.allSettled(uploads.map(u=>env.DOCUMENTS_BUCKET.delete(u.key)));
    return fail('QUOTE_PERSISTENCE_FAILED',500);
  }
  return Response.json({success:true,data:{id,referenceCode,customerName:body.customerName.trim(),propertyType:body.propertyType,locationEmirate:body.locationEmirate,locationCommunity:body.locationCommunity,siteVisitRequested:body.siteVisitRequested,siteVisitFeeAed:body.siteVisitRequested?100:0,status:'received',createdAt:now}},{status:201});
}
