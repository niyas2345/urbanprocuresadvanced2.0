import {decodeDocuments} from './documentValidation.ts';
import type { Env } from './index.ts';
import type { Actor } from './terms.ts';
import {maskedText} from './privacy.ts';
import {storedUpload} from './operations.ts';
import { organizationFor, acceptanceFor } from './terms.ts';
export async function rfqDto(env:Env,rfq:any,forVendor=false) {
  if(forVendor){const identity=await env.DB.prepare('SELECT c.company_name,c.contact_person,c.contact_phone,c.trade_license_number,c.address,u.email FROM contractors c JOIN users u ON u.id=c.user_id WHERE c.id=?').bind(rfq.contractor_id).first<Record<string,unknown>>();rfq={...rfq,title:maskedText(rfq.title,identity),scope_description:maskedText(rfq.scope_description,identity)};
    const rows=await env.DB.prepare('SELECT id,description,specifications FROM rfq_items WHERE rfq_id=?').bind(rfq.id).all<any>();rfq.maskedItems=new Map(rows.results.map(i=>[i.id,{description:maskedText(i.description,identity),specifications:maskedText(i.specifications,identity)}]));}
  const count=await env.DB.prepare('SELECT count(*) AS count FROM vendor_quotes WHERE withdrawn_at IS NULL AND deleted_at IS NULL AND rfq_id=?').bind(rfq.id).first<{count:number}>();
  const rows=await env.DB.prepare('SELECT id,item_number,description,quantity,unit,specifications FROM rfq_items WHERE rfq_id=? ORDER BY item_number').bind(rfq.id).all<any>();
  const docs=await env.DB.prepare('SELECT id,file_name,file_type,file_size_bytes,document_purpose,sha256_hash,created_at FROM rfq_documents WHERE rfq_id=? AND quotation_id IS NULL'+(forVendor?' AND vendor_access_approved=1':'')).bind(rfq.id).all<any>();
  const documents=docs.results.map(d=>({id:d.id,fileName:forVendor?`Document ${d.id.slice(0,8)}.${d.file_name.split('.').pop()}`:d.file_name,fileType:d.file_type,fileSizeBytes:d.file_size_bytes,documentPurpose:d.document_purpose,sha256Hash:d.sha256_hash,createdAt:d.created_at}));
  return {id:rfq.id,quotesCount:forVendor?undefined:count?.count,manpowerPersons:rfq.manpower_persons,manpowerHoursPerPersonPerDay:rfq.manpower_hours_per_person_per_day,manpowerDays:rfq.manpower_days,totalPersonHours:rfq.approved_manpower_quantity,procurementType:rfq.procurement_type,referenceCode:rfq.reference_code,title:rfq.title,category:rfq.category,projectName:forVendor?rfq.reference_code:rfq.project_name,locationEmirate:rfq.location_emirate,submissionDeadline:rfq.submission_deadline,scopeDescription:rfq.scope_description,removedAt:rfq.deleted_at,status:rfq.status,createdAt:rfq.created_at,contractorDisplayName:`Client #${rfq.reference_code}`,items:rows.results.map(item=>({id:item.id,itemNumber:item.item_number,description:rfq.maskedItems?.get(item.id)?.description??item.description,quantity:item.quantity,unit:item.unit,specifications:rfq.maskedItems?.get(item.id)?.specifications??item.specifications})),documents,estimatedBudgetAed:forVendor?undefined:rfq.estimated_budget_aed};
}
async function quoteDto(env:Env,q:any,forVendor:boolean) {
  const items=await env.DB.prepare('SELECT * FROM quote_items WHERE quotation_id=?').bind(q.id).all<any>();
  const documents=await env.DB.prepare('SELECT id,file_name,file_type,file_size_bytes,document_purpose,created_at FROM rfq_documents WHERE quotation_id=?'+(forVendor?'':' AND (vendor_access_approved=1 OR EXISTS(SELECT 1 FROM awards WHERE quotation_id=rfq_documents.quotation_id))')).bind(q.id).all<any>();
  const result:any={pricingMode:q.pricing_mode,notes:q.notes,documents:documents.results.map(d=>({id:d.id,fileName:forVendor?d.file_name:`Quotation ${d.id.slice(0,8)}.${d.file_name.split('.').pop()}`,fileType:d.file_type,fileSizeBytes:d.file_size_bytes,documentPurpose:d.document_purpose,createdAt:d.created_at})),id:q.id,referenceCode:q.reference_code,rfqId:q.rfq_id,totalAmountAed:q.total_amount_aed,leadTimeDays:q.lead_time_days,validityDays:q.validity_days,paymentTerms:q.payment_terms,withdrawnAt:q.withdrawn_at,removedAt:q.deleted_at,status:q.withdrawn_at?'withdrawn':q.status,submittedAt:q.submitted_at,vendorDisplayName:`Vendor #${q.reference_code}`,items:items.results.map(i=>({id:i.id,rfqItemId:i.rfq_item_id,unitRateAed:i.unit_rate_aed,totalPriceAed:i.total_price_aed}))};
  const award=await env.DB.prepare('SELECT id FROM awards WHERE rfq_id=? AND quotation_id=?').bind(q.rfq_id,q.id).first();
  if(!forVendor&&!award){const identity=await env.DB.prepare('SELECT v.company_name,v.contact_person,v.contact_phone,v.trade_license_number,u.email FROM vendors v JOIN users u ON u.id=v.user_id WHERE v.id=?').bind(q.vendor_id).first<Record<string,unknown>>();result.paymentTerms=maskedText(result.paymentTerms,identity);result.notes=maskedText(result.notes,identity);}
  if(award) {
    result.serviceCharge=await env.DB.prepare('SELECT id,award_id,total_charge_aed,status FROM service_charges WHERE award_id=? AND vendor_id=?').bind(award.id,q.vendor_id).first();
    if(forVendor)result.contractorContact=await env.DB.prepare('SELECT c.company_name AS companyName,c.trade_license_number AS tradeLicenseNumber,c.emirate,c.address,c.contact_person AS contactPerson,c.contact_phone AS contactPhone,u.email FROM awards a JOIN contractors c ON c.id=a.contractor_id JOIN users u ON u.id=c.user_id WHERE a.rfq_id=? AND a.quotation_id=? AND a.vendor_id=?').bind(q.rfq_id,q.id,q.vendor_id).first();
    else result.vendorContact=await env.DB.prepare('SELECT v.company_name AS companyName,v.trade_license_number AS tradeLicenseNumber,v.contact_person AS contactPerson,v.contact_phone AS contactPhone,u.email FROM vendors v JOIN users u ON u.id=v.user_id WHERE v.id=?').bind(q.vendor_id).first();
  }
  return result;
}
export async function procurementRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null> {
  const path=new URL(request.url).pathname,profile=actor?await organizationFor(env,actor):null;
  if(!actor || !profile)return null;
  if(actor.role==='contractor' && path==='/api/contractor/rfqs' && request.method==='GET') {
    const rows=await env.DB.prepare('SELECT * FROM rfqs WHERE contractor_id=? AND deleted_at IS NULL ORDER BY created_at DESC').bind(profile.id).all();
    return Response.json({success:true,data:await Promise.all(rows.results.map(r=>rfqDto(env,r)))});
  }
  const match=path.match(/^\/api\/contractor\/rfqs\/([^/]+)\/quotations$/);
  if(actor.role==='contractor' && match && request.method==='GET') {
    const owned=await env.DB.prepare('SELECT id FROM rfqs WHERE id=? AND contractor_id=?').bind(match[1],profile.id).first();
    if(!owned)return Response.json({success:false,error:'RFQ_NOT_FOUND'},{status:404});
    const quotes=await env.DB.prepare('SELECT * FROM vendor_quotes WHERE withdrawn_at IS NULL AND deleted_at IS NULL AND rfq_id=?').bind(match[1]).all();
    return Response.json({success:true,data:await Promise.all(quotes.results.map(q=>quoteDto(env,q,false)))});
  }
  if(actor.role!=='vendor' || !path.startsWith('/api/vendor/'))return null;
  const vendor=await env.DB.prepare('SELECT * FROM vendors WHERE id=?').bind(profile.id).first<any>();
  if(vendor?.verification_status!=='verified')return Response.json({success:false,error:'VENDOR_VERIFICATION_REQUIRED',code:'VENDOR_VERIFICATION_REQUIRED'},{status:403});
  const categories=JSON.parse(vendor.trade_categories) as string[];
  if(path==='/api/vendor/rfqs' && request.method==='GET') {
    const rows=await env.DB.prepare("SELECT * FROM rfqs WHERE deleted_at IS NULL AND status IN ('reviewed_published','receiving_quotations') AND submission_deadline>? ORDER BY created_at DESC").bind(new Date().toISOString()).all<any>();
    const matching=new URL(request.url).searchParams.get('scope')!=='matching'||categories.some(c=>/technical services/i.test(c))?rows.results:rows.results.filter(r=>categories.includes(r.category));
    return Response.json({success:true,data:await Promise.all(matching.map(r=>rfqDto(env,r,true)))});
  }
  if(path==='/api/vendor/my-quotes' && request.method==='GET') {
    const quotes=await env.DB.prepare('SELECT * FROM vendor_quotes WHERE deleted_at IS NULL AND vendor_id=?').bind(profile.id).all<any>();
    const data=[];
    for(const q of quotes.results) {
      const rfq=await env.DB.prepare('SELECT * FROM rfqs WHERE id=?').bind(q.rfq_id).first();
      data.push({...await quoteDto(env,q,true),rfq:rfq?await rfqDto(env,rfq,true):null});
    }
    return Response.json({success:true,data});
  }
  const withdraw=path.match(/^\/api\/vendor\/quotations\/([^/]+)\/(recall|remove)$/);
  if(withdraw && request.method==='POST') {
    const now=new Date().toISOString(),revision=crypto.randomUUID(),removing=withdraw[2]==='remove';
    const results=await env.DB.batch([
      env.DB.prepare(`UPDATE vendor_quotes SET status='declined',withdrawn_at=coalesce(withdrawn_at,?),deleted_at=?,revision_nonce=? WHERE id=? AND vendor_id=? AND deleted_at IS NULL AND status<>'awarded' AND NOT EXISTS(SELECT 1 FROM awards WHERE rfq_id=vendor_quotes.rfq_id)`).bind(now,removing?now:null,revision,withdraw[1],profile.id),
      env.DB.prepare(`INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,'vendor',?,'quotation',id,'{}',? FROM vendor_quotes WHERE id=? AND revision_nonce=?`).bind(crypto.randomUUID(),actor.id,removing?'QUOTATION_REMOVE':'QUOTATION_RECALL',now,withdraw[1],revision)
    ]);
    return Response.json(results[0].meta.changes?{success:true,data:{id:withdraw[1],withdrawn:true,removed:removing}}:{success:false,error:'QUOTATION_NOT_WITHDRAWABLE'},{status:results[0].meta.changes?200:409});
  }
  const bid=path.match(/^\/api\/vendor\/rfqs\/([^/]+)\/quote$/);
  if(bid && ['POST','PUT'].includes(request.method)) {
    let body:any;try{const raw=await request.text();if(raw.length>30000000)return Response.json({success:false,error:'REQUEST_TOO_LARGE'},{status:413});body=JSON.parse(raw);}catch{return Response.json({success:false,error:'INVALID_QUOTATION'},{status:400});}
    const rfq=await env.DB.prepare("SELECT * FROM rfqs WHERE id=? AND status IN ('reviewed_published','receiving_quotations') AND submission_deadline>?").bind(bid[1],new Date().toISOString()).first<any>();
    if(!rfq)return Response.json({success:false,error:'RFQ_NOT_AVAILABLE'},{status:403});
    const pricingMode=body?.pricingMode??'itemized';
    if(!['itemized','total','file'].includes(pricingMode)|| (pricingMode==='itemized'&&(!Array.isArray(body?.items)||!body.items.length||body.items.length>500)) || !Number.isSafeInteger(body.leadTimeDays) || body.leadTimeDays<1 || !Number.isSafeInteger(body.validityDays) || body.validityDays<1 || typeof body.paymentTerms!=='string' || !body.paymentTerms.trim() || body.paymentTerms.length>3000)return Response.json({success:false,error:'INVALID_QUOTATION'},{status:400});
    const boq=await env.DB.prepare('SELECT id,quantity FROM rfq_items WHERE rfq_id=?').bind(rfq.id).all<any>();
    const seen=new Set();const validated=[];let totalCents=0;
    for(const item of pricingMode==='itemized'?body.items:[]) {
      const original=boq.results.find(i=>i.id===item.rfqItemId);
      if(!original || !Number.isFinite(original.quantity) || original.quantity<=0 || seen.has(item.rfqItemId) || !Number.isFinite(item.unitRateAed) || item.unitRateAed<=0 || item.unitRateAed>1e9)return Response.json({success:false,error:'INVALID_BOQ_ITEM'},{status:400});
      seen.add(item.rfqItemId);const cents=Math.round(original.quantity*item.unitRateAed*100);totalCents+=cents;
      validated.push({...item,totalPriceAed:cents/100});
    }
    if(pricingMode!=='itemized'){if(typeof body.totalAmountAed!=='number'||!Number.isFinite(body.totalAmountAed)||body.totalAmountAed<=0)return Response.json({success:false,error:'INVALID_TOTAL'},{status:400});totalCents=Math.round(body.totalAmountAed*100);}
    if((pricingMode==='itemized'&&seen.size!==boq.results.length) || !Number.isSafeInteger(totalCents)||totalCents<=0||totalCents>1e14)return Response.json({success:false,error:'INCOMPLETE_QUOTATION'},{status:400});
    const revision=crypto.randomUUID();
    const previous=request.method==='PUT'?await env.DB.prepare("SELECT * FROM vendor_quotes WHERE rfq_id=? AND vendor_id=? AND status='submitted'").bind(rfq.id,profile.id).first<any>():null;
    if(request.method==='PUT'&&!previous)return Response.json({success:false,error:'QUOTATION_NOT_EDITABLE'},{status:409});
    if(body.attachments!==undefined&&(!Array.isArray(body.attachments)||body.attachments.length>5||(previous&&body.attachments.length)))return Response.json({success:false,error:'INVALID_QUOTATION_ATTACHMENTS'},{status:400});
    let decoded;try{decoded=decodeDocuments(body.attachments??[]);}catch{return Response.json({success:false,error:'INVALID_QUOTATION_ATTACHMENT'},{status:400});}
    if(pricingMode==='file'&&!(body.attachments??[]).length&&!(previous&&await env.DB.prepare('SELECT id FROM rfq_documents WHERE quotation_id=? LIMIT 1').bind(previous.id).first()))return Response.json({success:false,error:'QUOTATION_FILE_REQUIRED'},{status:400});
    const id=previous?.id??crypto.randomUUID(),now=new Date().toISOString(),reference='QTE-'+crypto.randomUUID();
    const accepted=await acceptanceFor(env,actor);
    if(!accepted)return Response.json({success:false,error:'TERMS_ACCEPTANCE_REQUIRED',code:'TERMS_ACCEPTANCE_REQUIRED'},{status:403});
    const statements=[env.DB.prepare(`INSERT INTO vendor_quotes (id,reference_code,rfq_id,vendor_id,total_amount_aed,lead_time_days,validity_days,payment_terms,notes,status,submitted_at,pricing_mode)
      SELECT ?,?,r.id,v.id,?,?,?,?,?,'submitted',?,? FROM rfqs r JOIN vendors v ON v.id=? JOIN users u ON u.id=v.user_id
      WHERE r.id=? AND r.status IN ('reviewed_published','receiving_quotations') AND r.submission_deadline>?
      AND v.verification_status='verified' AND u.status='active'
      AND EXISTS(SELECT 1 FROM terms_acceptance_evidence e JOIN terms_versions t ON t.id=e.terms_version_id
        WHERE e.acceptance_id=? AND e.user_id=u.id AND t.status IN ('published','retired')
        AND NOT EXISTS(SELECT 1 FROM terms_versions n WHERE n.role='vendor' AND n.status IN ('published','retired') AND n.mandatory=1 AND n.published_at>t.published_at))`)
      .bind(id,reference,totalCents/100,body.leadTimeDays,body.validityDays,body.paymentTerms,typeof body.notes==='string'?body.notes.slice(0,5000):null,now,pricingMode,profile.id,rfq.id,now,accepted.acceptance_id)];
    if(previous){statements.length=0;statements.push(env.DB.prepare(`UPDATE vendor_quotes SET pricing_mode=?,total_amount_aed=?,lead_time_days=?,validity_days=?,payment_terms=?,notes=?,submitted_at=?,revision_nonce=? WHERE id=? AND vendor_id=? AND status='submitted' AND EXISTS(SELECT 1 FROM rfqs WHERE id=? AND status IN ('reviewed_published','receiving_quotations') AND submission_deadline>?)`).bind(pricingMode,totalCents/100,body.leadTimeDays,body.validityDays,body.paymentTerms,typeof body.notes==='string'?body.notes.slice(0,5000):null,now,revision,id,profile.id,rfq.id,now));statements.push(env.DB.prepare('DELETE FROM quote_items WHERE quotation_id=? AND EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND revision_nonce=?)').bind(id,id,revision));}
    let uploads;try{uploads=await Promise.all((body.attachments??[]).map((file:any,index:number)=>storedUpload(env,actor,file,rfq.id,id,decoded[index])));}catch{return Response.json({success:false,error:'INVALID_QUOTATION_ATTACHMENT'},{status:400});}
    for(const i of validated)statements.push(env.DB.prepare('INSERT INTO quote_items (id,quotation_id,rfq_item_id,unit_rate_aed,total_price_aed) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND (? IS NULL OR revision_nonce=?))').bind(crypto.randomUUID(),id,i.rfqItemId,i.unitRateAed,i.totalPriceAed,id,previous?revision:null,revision));
    statements.push(env.DB.prepare("UPDATE rfqs SET status='receiving_quotations' WHERE id=? AND status='reviewed_published' AND EXISTS(SELECT 1 FROM vendor_quotes WHERE id=?)").bind(rfq.id,id));
    for(const upload of uploads)statements.push(upload.statement);
    statements.push(env.DB.prepare('INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),actor.id,'vendor',previous?'QUOTATION_UPDATE':'QUOTATION_SUBMIT','quotation',id,JSON.stringify({previousTotal:previous?.total_amount_aed??null,totalAmountAed:totalCents/100}),now));
    try{for(const upload of uploads)await env.DOCUMENTS_BUCKET.put(upload.key,upload.parsed.bytes,{httpMetadata:{contentType:upload.parsed.type}});const results=await env.DB.batch(statements);if(!results[0].meta.changes)throw Error('Quotation conflict');}catch{await Promise.allSettled(uploads.map(u=>env.DOCUMENTS_BUCKET.delete(u.key)));return Response.json({success:false,error:'QUOTATION_CONFLICT'},{status:409});}
    return Response.json({success:true,data:{id,referenceCode:reference,totalAmountAed:totalCents/100}},{status:201});
  }
  return null;
}
