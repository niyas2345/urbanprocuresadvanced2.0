// All quotation derivatives are rebuilt documents, never redacted source pages.
async function quotationIdentity(env, doc) {
  return await env.DB.prepare("SELECT u.email,v.company_name,v.contact_person,v.contact_phone,v.trade_license_number FROM users u LEFT JOIN vendors v ON v.user_id=u.id WHERE u.id=?").bind(doc.uploader_user_id).first() ?? {};
}
// Shield explicitly labelled money from generic phone-number masking.
function quotationMask(value,identity){
  const protectedAmounts=[];
  const shielded=value.replace(/(?:\bAED\s*[+-]?[\d,.]+|[+-]?[\d,.]+\s*AED\b)/gi,m=>{protectedAmounts.push(m);return 'UPMONEYTOKEN'+String(protectedAmounts.length-1)+'TOKEN';});
  return (maskedText(shielded,identity)??'').replace(/UPMONEYTOKEN(\d+)TOKEN/g,(_,n)=>protectedAmounts[Number(n)]);
}
function quotationFinancial(value,identity={}){
  const s=String(value??'');if(s.length>200)throw Error('QUOTATION_FIELD_TOO_LONG');
  return /^(?:(?:AED)\s*)?[+-]?\d[\d,]*(?:\.\d+)?(?:\s*(?:AED|%))?$/i.test(s.trim())?s:quotationMask(s,identity);
}
function quotationFields(raw, identity = {}) {
  const clean = (value, max = 12000) => {
    if (value == null) return '';
    if (typeof value !== 'string' && !(typeof value === 'number' && Number.isFinite(value))) throw Error('QUOTATION_FIELD_INVALID');
    value = String(value);
    if (value.length > max) throw Error('QUOTATION_FIELD_TOO_LONG');
    return quotationMask(value, identity);
  };
  const totals = raw.totals ?? [];
  if (!Array.isArray(totals) || totals.length > 40) throw Error('QUOTATION_TOTALS_INVALID');
  return { totals: totals.map(t => ({ label: clean(t.label, 200), value: quotationFinancial(t.value,identity) })),
    commercialTerms:clean(raw.commercialTerms),totalAmount: quotationFinancial(raw.totalAmount,identity), currency: clean(raw.currency, 100), exclusions: clean(raw.exclusions), validity: clean(raw.validity), paymentTerms: clean(raw.paymentTerms),
    leadTime: clean(raw.leadTime), dlp: clean(raw.dlp), warranty: clean(raw.warranty), notes: clean(raw.notes),
    rows: raw.rows.map(r => ({ description: clean(r.description, 3000), unit: clean(r.unit, 100), quantity: quotationFinancial(r.quantity,identity), rate: quotationFinancial(r.rate,identity), amount: quotationFinancial(r.amount,identity), remarks: clean(r.remarks, 1000) })) };
}
async function renderCorporateQuotation(content, reference) {
  const pdf = await PDFDocument_default.create();
  pdf.setTitle('Urban Procures | Quotation'); pdf.setAuthor('Urban Procures'); pdf.setCreator('Urban Procures');
  pdf.registerFontkit(quotationFontkit);
  const font = await pdf.embedFont(quotationRegularFont, { subset: true });
  const bold = await pdf.embedFont(quotationBoldFont, { subset: true });
  const logo = await pdf.embedPng(quotationLogo);
  const ink = rgb(0x17/255,0x3e/255,0x45/255), orange = rgb(0xed/255,0x79/255,0x2c/255), grid = rgb(.83,.87,.87), white=rgb(1,1,1);
  const meta = content.quotationMeta ?? {};
  const allowed = new Set(font.getCharacterSet());
  const checked = value => {
    const s = String(value ?? '');
    for (const c of s) if (!['\n','\r','\t'].includes(c) && !allowed.has(c.codePointAt(0))) throw Error('QUOTATION_UNSUPPORTED_CHARACTER_REVIEW');
    return s.replace(/\r\n?/g,'\n').replace(/\t/g,'    ');
  };
  const wrap = (value, width, size, f=font) => {
    const lines=[];
    for (const para of checked(value).split('\n')) {
      let line='';
      for (const word of para.split(/(\s+)/)) {
        if(line && f.widthOfTextAtSize(line+word,size)>width){lines.push(line.trimEnd());line='';}
        if(!line && /^\s+$/.test(word))continue;
        for(const c of word){if(line&&f.widthOfTextAtSize(line+c,size)>width){lines.push(line);line='';}line+=c;}
      }
      lines.push(line);
    }
    return lines;
  };
  let page,y;
  const newPage=()=>{
    page=pdf.addPage([841.89,595.28]);
    const dim=logo.scaleToFit(48,48); page.drawImage(logo,{x:30,y:525,width:dim.width,height:dim.height});
    page.drawText('URBAN PROCURES',{x:90,y:549,size:15,font:bold,color:ink});
    page.drawText('QUOTATION',{x:550,y:549,size:20,font:bold,color:ink});
    page.drawText(checked(meta.reference || reference),{x:30,y:510,size:8,font,color:ink});
    page.drawRectangle({x:30,y:500,width:782,height:2,color:orange}); y=479;
  };
  const textLine=(value,size=9)=>{ for(const line of wrap(value,782,size)){if(y<55)newPage();page.drawText(line,{x:30,y,size,font,color:ink});y-=size+4;}y-=4; };
  const heading=label=>{if(y<85)newPage();page.drawRectangle({x:30,y:y-22,width:782,height:22,color:ink});page.drawText(label,{x:38,y:y-15,size:10,font:bold,color:white});y-=32;};
  const widths=[36,271,50,60,90,100,175];
  const headers=['Item','Description','Unit','Quantity','Unit Rate','Amount','Remarks / Ref'];
  const tableRow=(cells,header=false)=>{
    const lines=cells.map((c,i)=>wrap(c,widths[i]-10,8,header?bold:font));
    let offset=0,remaining=Math.max(...lines.map(a=>a.length));
    while(remaining>0){
      if(y<80){newPage();if(!header)tableRow(headers,true);}
      const count=Math.min(remaining,Math.floor((y-50-10)/11));
      if(count<1)throw Error('QUOTATION_LAYOUT_REVIEW');
      const h=count*11+10;let xx=30;
      cells.forEach((_,i)=>{page.drawRectangle({x:xx,y:y-h,width:widths[i],height:h,borderWidth:.5,borderColor:grid,...header?{color:ink}:{}});lines[i].slice(offset,offset+count).forEach((l,j)=>page.drawText(l,{x:xx+5,y:y-13-j*11,size:8,font:header?bold:font,color:header?white:ink}));xx+=widths[i];});
      y-=h;offset+=count;remaining-=count;
    }
  };
  newPage();heading('1. Quotation Overview');
  for(const [label,val] of [['Quotation reference',meta.reference],['Quotation revision',meta.revision],['RFQ reference',meta.rfqReference],['RFQ revision',meta.rfqRevision],['Submitted',meta.submittedAt],['Currency',content.currency]]) if(val!==undefined&&val!=='')textLine(label+': '+val);
  textLine(content.title || ''); textLine(content.summary || '');
  heading('2. Scope and Pricing Schedule');tableRow(headers,true);
  content.rows.forEach((r,i)=>tableRow([i+1,r.description,r.unit,r.quantity,r.rate,r.amount,r.remarks??'']));
  heading('3. Quotation Totals');
  if(!content.totals?.length)textLine(content.totalAmount?'Final payable total: '+content.totalAmount:'Not provided');else for(const t of content.totals)textLine(t.label+': '+t.value);
  heading('4. Commercial Terms');
  for(const [label,val] of [['Commercial terms',content.commercialTerms],['Payment terms',content.paymentTerms],['Validity',content.validity],['Lead time',content.leadTime],['Warranty',content.warranty],['Defects liability period',content.dlp]]) if(val)textLine(label+': '+val);
  heading('5. Clarifications and Exclusions');textLine(content.exclusions||'Not provided');if(content.notes)textLine(content.notes);
  heading('6. Quotation Review and Confidentiality');textLine('Vendor identity and contacts are confidential before authorized award. This PDF contains the reviewed quotation content. Original vendor files are retained privately for audit.');
  const pages=pdf.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:30,y:36},end:{x:812,y:36},thickness:.5,color:grid});p.drawText('Urban Procures | Quotation | '+(meta.revision?'Rev '+meta.revision+' | ':'')+'Page '+(i+1)+' of '+pages.length,{x:30,y:22,size:8,font,color:ink});});
  return {bytes:await pdf.save(),type:'application/pdf',extension:'pdf'};
}
async function quotationMetaFor(env, doc) {
  const q=await env.DB.prepare('SELECT * FROM vendor_quotes WHERE id=?').bind(doc.quotation_id).first();
  const rev=await env.DB.prepare('SELECT p.*,w.content_json FROM quotation_pdf_revisions p JOIN rfq_workbook_revisions w ON w.id=p.workbook_id WHERE p.document_id=?').bind(doc.id).first();
  const w=rev?JSON.parse(rev.content_json):null;
  return {reference:q?.reference_code??'Quotation',revision:rev?.revision_number??1,rfqReference:w?.reference??'',rfqRevision:w?.revision??'',submittedAt:doc.created_at};
}
async function quotationReleaseCheck(env, actor, doc) {
  const rev=await env.DB.prepare('SELECT p.*,q.revision_nonce AS current_nonce FROM quotation_pdf_revisions p JOIN vendor_quotes q ON q.id=p.quotation_id WHERE p.document_id=?').bind(doc.id).first();
  if(rev&&rev.revision_nonce!==rev.current_nonce)throw Error('QUOTATION_REVISION_SUPERSEDED');
  if(doc.standardized_file_type!=='application/pdf')throw Error('QUOTATION_PDF_REQUIRED');
  const c=JSON.parse(doc.standardized_content_json??'null');
  if(!c||!Array.isArray(c.rows)||!c.rows.length||c.rows.some(r=>!r.description.trim()))throw Error('QUOTATION_CONTENT_REVIEW_REQUIRED');
  if(c.warnings?.length)throw Error('QUOTATION_WARNINGS_REQUIRE_CORRECTION');
  const q=await env.DB.prepare('SELECT total_amount_aed FROM vendor_quotes WHERE id=?').bind(doc.quotation_id).first();
  if(!/^(?:AED|UAE Dirhams?|Dirhams?)$/i.test(String(c.currency??'').trim()))throw Error('QUOTATION_CURRENCY_REVIEW_REQUIRED');
  const finalTotal=String(c.totalAmount??'').replace(/AED|د.إ/gi,'').replace(/[,\s]/g,'');
  if(!/^\d+(?:\.\d{1,2})?$/.test(finalTotal)||Math.round(Number(finalTotal)*100)!==Math.round(q.total_amount_aed*100))throw Error('QUOTATION_TOTAL_RECONCILIATION_REQUIRED');
  const identity=await quotationIdentity(env,doc);
  const values=[c.title,c.summary,c.commercialTerms,c.currency,c.exclusions,c.validity,c.paymentTerms,c.leadTime,c.dlp,c.warranty,c.notes,...c.rows.flatMap(r=>[r.description,r.unit,r.remarks]),...(c.totals??[]).map(t=>t.label)].filter(v=>typeof v==='string');
  if(values.some(v=>quotationMask(v,identity)!==v))throw Error('QUOTATION_IDENTITY_REVIEW_REQUIRED');
  if(!await env.DB.prepare("SELECT id FROM audit_logs WHERE actor_user_id=? AND resource_id=? AND action_type='DOCUMENT_ACCESS'").bind(actor.id,doc.id).first())throw Error('OPEN_ORIGINAL_DOCUMENT_BEFORE_APPROVAL');
  // Reading raw files and checking every value remains a human review responsibility.
  return rev;
}
function workbookQuotationContent(c,response,meta,identity){
  const clean=v=>maskedText(String(v??''),identity)??'';
  let terms={};try{terms=JSON.parse(response.notes??'{}');}catch{}
  return {title:'Quotation',summary:'',rows:c.rows.map((r,i)=>({description:r.description,unit:r.unit,quantity:r.quantity,rate:response.rates[i].unitRate==null?'':response.rates[i].unitRate.toFixed(2),amount:response.rates[i].amount==null?'':response.rates[i].amount.toFixed(2),remarks:clean([r.specRef,response.rates[i].remarks].filter(Boolean).join('; '))})),
    totalAmount:response.totalAmountAed.toFixed(2),currency:'AED',totals:[{label:'Total quotation (AED, exclusive of VAT)',value:response.totalAmountAed.toFixed(2)}],commercialTerms:'',paymentTerms:clean(response.paymentTerms),validity:response.validityDays+' days',leadTime:response.leadTimeDays+' days',warranty:clean(terms.warranty),dlp:clean(terms.dlp),exclusions:clean(terms.qualifications),notes:terms.materials?clean('Materials / proposed equivalents: '+terms.materials):'',warnings:[],sourceText:'',quotationMeta:meta};
}
async function stageWorkbookQuotation(env,actor,parent,book,response,parsed,key,id,nonce,reference,now){
  const docId=crypto.randomUUID(),revId=crypto.randomUUID();
  const n=await env.DB.prepare('SELECT coalesce(max(revision_number),0)+1 AS n FROM quotation_pdf_revisions WHERE quotation_id=?').bind(id).first();
  const c=JSON.parse(book.content_json),meta={reference,revision:n.n,rfqReference:c.reference,rfqRevision:book.revision,submittedAt:now};
  const content=workbookQuotationContent(c,response,meta,await quotationIdentity(env,{uploader_user_id:actor.id}));
  let artifact=null,error=null;
  try{artifact=await renderCorporateQuotation(content,reference);}catch(e){error=/^[A-Z_]+$/.test(e.message)?e.message:'QUOTATION_PDF_RENDER_REVIEW';}
  const safeKey=artifact?'standardized/'+docId+'/'+crypto.randomUUID()+'.pdf':null;
  if(artifact)await env.DOCUMENTS_BUCKET.put(safeKey,artifact.bytes,{httpMetadata:{contentType:artifact.type}});
  const condition='EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND revision_nonce=?)';
  return {safeKey,statements:[
    env.DB.prepare(`INSERT INTO rfq_documents(id,rfq_id,quotation_id,uploader_user_id,file_name,file_type,file_size_bytes,r2_object_key,document_purpose,sha256_hash,created_at,standardization_status,standardization_error,standardized_content_json,standardized_r2_key,standardized_file_type,standardized_size_bytes,standardized_sha256,standardized_at) SELECT ?,?,?,?,?,?,?,?,'boq',?,?,?,?,?,?,?,?,?,? WHERE ${condition}`).bind(docId,parent.id,id,actor.id,parsed.name,parsed.type,parsed.bytes.length,key,await sha(parsed.bytes),now,artifact?'review_required':'needs_manual_review',error,JSON.stringify(content),safeKey,artifact?.type??null,artifact?.bytes.length??null,artifact?await sha(artifact.bytes):null,now,id,nonce),
    env.DB.prepare(`INSERT INTO quotation_pdf_revisions(id,quotation_id,revision_number,revision_nonce,workbook_id,document_id,input_kind,submitted_at) SELECT ?,?,?,?,?,?,'excel',? WHERE ${condition}`).bind(revId,id,n.n,nonce,book.id,docId,now,id,nonce)
  ]};
}
async function pdfQuotationRoute(request,env,actor){
  const match=new URL(request.url).pathname.match(/^\/api\/vendor\/rfqs\/([^/]+)\/quote$/);
  if(!match||!['POST','PUT'].includes(request.method)||env.EXCEL_RFQ_ENABLED!=='true')return null;
  let body;try{body=await rfqJson(request,15000000);}catch{return fail('INVALID_QUOTATION');}
  if(!body.pdfFile)return null;
  if(body.excelFile)return fail('ONE_QUOTATION_FILE_REQUIRED');
  if(actor?.role!=='vendor'||actor.status!=='active')return fail('VENDOR_REQUIRED',403);
  const accepted=await acceptanceFor(env,actor);if(!accepted)return fail('TERMS_ACCEPTANCE_REQUIRED',403);
  const vendor=await env.DB.prepare("SELECT * FROM vendors WHERE user_id=? AND verification_status='verified'").bind(actor.id).first();if(!vendor)return fail('VENDOR_VERIFICATION_REQUIRED',403);
  const parent=await parentFor(env,'contractor',match[1]),book=await publishedWorkbook(env,'contractor',match[1]);
  if(!parent||!book||parent.deleted_at||!['reviewed_published','receiving_quotations'].includes(parent.status)||Date.parse(parent.submission_deadline)<=Date.now())return fail('RFQ_NOT_AVAILABLE',409);
  let parsed;try{parsed=decodeDocument(body.pdfFile);if(parsed.type!=='application/pdf')throw Error('PDF_QUOTATION_REQUIRED');}catch{return fail('PDF_QUOTATION_REQUIRED');}
  // Submission metadata is explicitly vendor supplied; reviewers must reconcile it with the PDF.
  if(!Number.isFinite(body.totalAmountAed)||body.totalAmountAed<=0||body.totalAmountAed>1e12||!Number.isSafeInteger(Math.round(body.totalAmountAed*100))||!Number.isSafeInteger(body.leadTimeDays)||body.leadTimeDays<1||!Number.isSafeInteger(body.validityDays)||body.validityDays<1||typeof body.paymentTerms!=='string'||!body.paymentTerms.trim()||body.paymentTerms.length>3000||body.notes!=null&&(typeof body.notes!=='string'||body.notes.length>5000))return fail('QUOTATION_METADATA_REQUIRED');
  const previous=await env.DB.prepare("SELECT * FROM vendor_quotes WHERE rfq_id=? AND vendor_id=? AND deleted_at IS NULL AND withdrawn_at IS NULL AND status='submitted'").bind(parent.id,vendor.id).first();
  if(request.method==='PUT'&&!previous)return fail('QUOTATION_NOT_EDITABLE',409);
  const id=previous?.id??crypto.randomUUID(),nonce=crypto.randomUUID(),docId=crypto.randomUUID(),now=new Date().toISOString(),ref=previous?.reference_code??'QTE-'+crypto.randomUUID();
  const n=await env.DB.prepare('SELECT coalesce(max(revision_number),0)+1 AS n FROM quotation_pdf_revisions WHERE quotation_id=?').bind(id).first();
  const key='private/quotation-originals/'+docId+'.pdf';
  const eligible="EXISTS(SELECT 1 FROM rfq_workbook_revisions w JOIN rfqs r ON r.id=w.parent_id JOIN vendors v ON v.id=? JOIN users u ON u.id=v.user_id WHERE w.id=? AND w.status='published' AND r.deleted_at IS NULL AND r.status IN ('reviewed_published','receiving_quotations') AND r.submission_deadline>? AND v.verification_status='verified' AND u.status='active' AND NOT EXISTS(SELECT 1 FROM awards WHERE rfq_id=r.id) AND EXISTS(SELECT 1 FROM terms_acceptance_evidence e JOIN terms_versions t ON t.id=e.terms_version_id WHERE e.acceptance_id=? AND e.user_id=u.id AND NOT EXISTS(SELECT 1 FROM terms_versions n WHERE n.role='vendor' AND n.mandatory=1 AND n.status IN ('published','retired') AND n.published_at>t.published_at)))";
  const total=Math.round(body.totalAmountAed*100)/100;
  const write=previous?env.DB.prepare(`UPDATE vendor_quotes SET total_amount_aed=?,lead_time_days=?,validity_days=?,payment_terms=?,notes=?,submitted_at=?,pricing_mode='file',revision_nonce=? WHERE id=? AND vendor_id=? AND status='submitted' AND withdrawn_at IS NULL AND deleted_at IS NULL AND ${eligible}`).bind(total,body.leadTimeDays,body.validityDays,body.paymentTerms,body.notes??null,now,nonce,id,vendor.id,vendor.id,book.id,now,accepted.acceptance_id):env.DB.prepare(`INSERT INTO vendor_quotes(id,reference_code,rfq_id,vendor_id,total_amount_aed,lead_time_days,validity_days,payment_terms,notes,status,submitted_at,pricing_mode,revision_nonce) SELECT ?,?,?,?,?,?,?,?,?,'submitted',?,'file',? WHERE ${eligible}`).bind(id,ref,parent.id,vendor.id,total,body.leadTimeDays,body.validityDays,body.paymentTerms,body.notes??null,now,nonce,vendor.id,book.id,now,accepted.acceptance_id);
  await env.DOCUMENTS_BUCKET.put(key,parsed.bytes,{httpMetadata:{contentType:parsed.type}});
  try{
    const result=await env.DB.batch([write,
      env.DB.prepare("INSERT INTO rfq_documents(id,rfq_id,quotation_id,uploader_user_id,file_name,file_type,file_size_bytes,r2_object_key,document_purpose,sha256_hash,created_at) SELECT ?,?,?,?,?,?,?,?,'boq',?,? WHERE EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND revision_nonce=?)").bind(docId,parent.id,id,actor.id,parsed.name,parsed.type,parsed.bytes.length,key,await sha(parsed.bytes),now,id,nonce),
      env.DB.prepare("INSERT INTO quotation_pdf_revisions(id,quotation_id,revision_number,revision_nonce,workbook_id,document_id,input_kind,submitted_at) SELECT ?,?,?,?,?,?,'pdf',? WHERE EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND revision_nonce=?)").bind(crypto.randomUUID(),id,n.n,nonce,book.id,docId,now,id,nonce),
      env.DB.prepare("UPDATE rfqs SET status='receiving_quotations' WHERE id=? AND status='reviewed_published' AND EXISTS(SELECT 1 FROM vendor_quotes WHERE id=? AND revision_nonce=?)").bind(parent.id,id,nonce),
      env.DB.prepare("INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,?,'vendor',?,'quotation',id,?,? FROM vendor_quotes WHERE id=? AND revision_nonce=?").bind(crypto.randomUUID(),actor.id,previous?'QUOTATION_PDF_REVISION':'QUOTATION_PDF_SUBMIT',JSON.stringify({revision:n.n,rfqRevision:book.revision,documentId:docId}),now,id,nonce)
    ]);
    if(!result[0].meta.changes)throw Error('QUOTATION_CONFLICT');
    return ok({id,documentId:docId,referenceCode:ref,revision:n.n,status:'review_required'},201);
  }catch{await env.DOCUMENTS_BUCKET.delete(key);return fail('QUOTATION_CONFLICT',409);}
}
async function quotePdfData(env,q,forVendor){
  const rows=await env.DB.prepare("SELECT p.*,d.standardization_status,d.standardized_file_type,d.standardized_size_bytes,d.vendor_access_approved FROM quotation_pdf_revisions p JOIN rfq_documents d ON d.id=p.document_id WHERE p.quotation_id=? ORDER BY p.revision_number DESC").bind(q.id).all();
  if(!rows.results.length)return {};
  const current=rows.results.find(r=>r.revision_nonce===q.revision_nonce);
  const book=current?await publishedWorkbook(env,'contractor',q.rfq_id):null;
  return {quotationRevision:current?.revision_number??null,reviewStatus:current?.standardization_status??'needs_manual_review',staleRevision:!current||current.workbook_id!==book?.id,
    quotationRevisions:rows.results.filter(r=>forVendor||r.standardization_status==='approved'&&r.vendor_access_approved===1).map(r=>({revision:r.revision_number,documentId:r.document_id,inputKind:r.input_kind,submittedAt:r.submitted_at,status:r.standardization_status,current:r.revision_nonce===q.revision_nonce,documents:r.standardization_status==='approved'?[{id:r.document_id,fileName:'Urban-Procures-Quotation-Rev-'+r.revision_number+'.pdf',fileType:'application/pdf',standardized:true}]:[]}))};
}
