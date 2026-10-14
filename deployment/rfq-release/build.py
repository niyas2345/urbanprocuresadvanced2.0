from pathlib import Path
import json,re,gzip,base64,hashlib,subprocess
P=Path(__file__).resolve().parent
s=(P/'baseline/worker.mjs').read_text()
def replace(old,new):
 global s
 if s.count(old)!=1:raise RuntimeError('Patch anchor mismatch: '+old[:100]+' count '+str(s.count(old)))
 s=s.replace(old,new)
# Include fonts from licensed local assets and the exact recovered approved logo.
assets=json.loads(re.search(r'var assets_default = (.*);\n',s).group(1))
logo=gzip.decompress(base64.b64decode(assets['/assets/urbanprocures-logo.png']['gzip']))
imports='import quotationFontkit from "@pdf-lib/fontkit";\n'
for name,data in [('quotationRegularFont',(P/'fonts/DejaVuSans.ttf').read_bytes()),('quotationBoldFont',(P/'fonts/DejaVuSans-Bold.ttf').read_bytes()),('quotationLogo',logo)]:
 imports+='var '+name+'=Uint8Array.from(atob('+json.dumps(base64.b64encode(data).decode())+'),c=>c.charCodeAt(0));\n'
s=imports+s
replace('async function renderStandardized(content, reference, quotation) {','async function renderStandardized(content, reference, quotation) {\n  if (quotation) return renderCorporateQuotation(content, reference);')
replace('return { ...result, ...vendorRfq ? { vendorRfq } : {} };','return { ...result, ...quotationFields(raw, {...identity,...sensitive}), ...vendorRfq ? { vendorRfq } : {} };')
# Preserve every source total/term as a string; no recalculation of PDF values.
replace('"commercialTerms":"","warnings":[""],"sensitiveStrings":[""]}', '"commercialTerms":"","currency":"","totals":[{"label":"","value":""}],"totalAmount":"","paymentTerms":"","validity":"","leadTime":"","warranty":"","exclusions":"","notes":"","warnings":[""],"sensitiveStrings":[""]}')
replace('"amount":""}],"commercialTerms"','"amount":"","remarks":""}],"commercialTerms"')
replace('Mark unreadable/uncertain content in warnings.', 'Copy the final payable total exactly into totalAmount; if absent leave it empty. Keep subtotal, discount, VAT and final total separately in totals. Preserve row remarks. Do not summarize or omit terms or rows. Mark unreadable/uncertain or incomplete content in warnings.')
replace('const artifact = await renderStandardized(content, reference, !!doc.quotation_id), key =', 'if (doc.quotation_id) content.quotationMeta = await quotationMetaFor(env, doc);\n    const artifact = await renderStandardized(content, reference, !!doc.quotation_id), key =')
replace('content = canonicalContent(body.content, {});','content = canonicalContent(body.content, doc2.quotation_id ? await quotationIdentity(env, doc2) : {});\n        if (doc2.quotation_id) content.quotationMeta = await quotationMetaFor(env, doc2);')
replace('if (body.file) {\n        const decoded', 'if (body.file) {\n        if(doc2.quotation_id) throw Error("QUOTATION_STRUCTURED_CORRECTION_REQUIRED");\n        const decoded')
# Avoid processing superseded quotation originals as current extraction candidates.
replace("AND (q.id IS NULL OR (q.withdrawn_at IS NULL AND q.deleted_at IS NULL)) AND d.standardization_status='pending'", "AND (q.id IS NULL OR (q.withdrawn_at IS NULL AND q.deleted_at IS NULL)) AND (NOT EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.document_id=d.id) OR EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.document_id=d.id AND p.revision_nonce=q.revision_nonce)) AND d.standardization_status='pending'")
# Route ahead of Excel handler; both paths preserve existing auth/terms/origin checks.
replace('const contractorExcelQuote = await contractorWorkbookQuoteRoute', 'const pdfQuote = await pdfQuotationRoute(request.clone(), env, await actorFor(request, env));\n      if (pdfQuote) { if(pdfQuote.ok && env.AI) ctx.waitUntil(processPendingDocuments(env).catch(()=>{})); return pdfQuote; }\n      const contractorExcelQuote = await contractorWorkbookQuoteRoute')
replace('const ready = await env.DB.prepare("SELECT standardized_at,standardized_r2_key,standardization_status,standardized_content_json,rfq_id FROM rfq_documents WHERE id=?")','const ready = await env.DB.prepare("SELECT * FROM rfq_documents WHERE id=?")')
replace('    let packageContent;\n    try {','    if(ready.quotation_id) { try { await quotationReleaseCheck(env,actor,ready); } catch(e) { return fail2(e.message,409); } }\n    let packageContent;\n    try {')
# Excel-generated artifact remains review_required; originals are byte-for-byte retained.
replace('  await env.DOCUMENTS_BUCKET.put(key, parsed.bytes, { httpMetadata: { contentType: parsed.type } });\n  try {\n    const results = await env.DB.batch([\n      quote,','  const derivative = await stageWorkbookQuotation(env, actor, parent, book, response, parsed, key, id, nonce, reference, now);\n  await env.DOCUMENTS_BUCKET.put(key, parsed.bytes, { httpMetadata: { contentType: parsed.type } });\n  try {\n    const results = await env.DB.batch([\n      quote,\n      ...derivative.statements,')
replace('    await env.DOCUMENTS_BUCKET.delete(key);\n    return fail("QUOTATION_CONFLICT", 409);\n  }\n}\nasync function publicWorkbookQuoteRoute','    await env.DOCUMENTS_BUCKET.delete(key);\n    if(derivative.safeKey) await env.DOCUMENTS_BUCKET.delete(derivative.safeKey);\n    return fail("QUOTATION_CONFLICT", 409);\n  }\n}\nasync function publicWorkbookQuoteRoute')
# Only current reviewed quotation derivatives appear in contractor views.
replace('  const documents = await env.DB.prepare("SELECT * FROM rfq_documents WHERE quotation_id=?" + (forVendor ? "" : " AND ((standardization_status=\'approved\' AND standardized_r2_key IS NOT NULL) OR EXISTS(SELECT 1 FROM awards WHERE quotation_id=rfq_documents.quotation_id))"))', '  const documents = await env.DB.prepare("SELECT * FROM rfq_documents WHERE quotation_id=?" + (forVendor ? "" : " AND standardization_status=\'approved\' AND vendor_access_approved=1 AND standardized_r2_key IS NOT NULL AND (NOT EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.quotation_id=rfq_documents.quotation_id) OR EXISTS(SELECT 1 FROM quotation_pdf_revisions p JOIN vendor_quotes q ON q.id=p.quotation_id WHERE p.document_id=rfq_documents.id AND p.revision_nonce=q.revision_nonce))"))')
replace('  Object.assign(result, await quoteWorkbookData(env, q2, forVendor));','  Object.assign(result, await quoteWorkbookData(env, q2, forVendor), await quotePdfData(env,q2,forVendor));')
replace('const quotes = await env.DB.prepare("SELECT * FROM vendor_quotes WHERE withdrawn_at IS NULL AND deleted_at IS NULL AND rfq_id=?")', 'const quotes = await env.DB.prepare("SELECT * FROM vendor_quotes WHERE withdrawn_at IS NULL AND deleted_at IS NULL AND rfq_id=? AND (NOT EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.quotation_id=vendor_quotes.id) OR EXISTS(SELECT 1 FROM quotation_pdf_revisions p JOIN rfq_documents d ON d.id=p.document_id WHERE p.quotation_id=vendor_quotes.id AND p.revision_nonce=vendor_quotes.revision_nonce AND d.standardization_status=\'approved\' AND d.vendor_access_approved=1))")')
# Workbook data from an old submission must not be shown as the new PDF's rows.
replace('  if (!response) return {};\n  return { workbookResponse:', '  if (!response) return {};\n  const currentPdf=await env.DB.prepare("SELECT input_kind FROM quotation_pdf_revisions WHERE quotation_id=? AND revision_nonce=?").bind(quote.id,quote.revision_nonce).first();\n  if(currentPdf?.input_kind===\'pdf\')return {};\n  return { workbookResponse:')
# Contractor text is taken from the reviewed document, rather than unreviewed submission metadata.
replace('  Object.assign(result, await quoteWorkbookData(env, q2, forVendor), await quotePdfData(env,q2,forVendor));', '  Object.assign(result, await quoteWorkbookData(env, q2, forVendor), await quotePdfData(env,q2,forVendor));\n  if(!forVendor && result.quotationRevision) {const safe=documents.results[0];const c=safe?JSON.parse(safe.standardized_content_json??\'{}\'):{};result.paymentTerms=c.paymentTerms||c.commercialTerms||\'\';result.notes=c.notes||\'\';}')
# Compare reviewed derivative identity atomically when releasing.
replace("SET vendor_access_approved=1,standardization_status='approved' WHERE id=? AND EXISTS", "SET vendor_access_approved=1,standardization_status='approved' WHERE id=? AND standardized_sha256=? AND standardized_at=? AND EXISTS")
replace('.bind(approval[1]), audit(env, actor, "DOCUMENT_IDENTITY_REVIEW"', '.bind(approval[1],ready.standardized_sha256,ready.standardized_at), audit(env, actor, "DOCUMENT_IDENTITY_REVIEW"')
# Contractors ALWAYS receive safe derivatives, including post-award. Originals remain owner/vendor private.
replace('    if (!permitted) return fail2("DOCUMENT_NOT_AVAILABLE", 404);\n    if (useStandard', '    if(doc.quotation_id && actor.role===\'contractor\') {useStandard=true; permitted=permitted && doc.standardization_status===\'approved\' && doc.vendor_access_approved===1;}\n    if (!permitted) return fail2("DOCUMENT_NOT_AVAILABLE", 404);\n    if (useStandard')
# Prevent awards from bypassing the review or using previous PDF/Excel revisions.
old='if (!book || JSON.parse(book.content_json).preliminary || !await env.DB.prepare("SELECT id FROM rfq_workbook_responses WHERE workbook_id=? AND quotation_id=? AND total_amount_aed=?").bind(book.id, quote.id, quote.total_amount_aed).first())'
new='const currentPdf=await env.DB.prepare("SELECT p.workbook_id,d.standardization_status,d.vendor_access_approved FROM quotation_pdf_revisions p JOIN rfq_documents d ON d.id=p.document_id WHERE p.quotation_id=? AND p.revision_nonce=?").bind(quote.id,quote.revision_nonce).first();\n    if (!book || JSON.parse(book.content_json).preliminary || (currentPdf ? currentPdf.workbook_id!==book.id || currentPdf.standardization_status!==\'approved\' || currentPdf.vendor_access_approved!==1 : !await env.DB.prepare("SELECT id FROM rfq_workbook_responses WHERE workbook_id=? AND quotation_id=? AND total_amount_aed=?").bind(book.id, quote.id, quote.total_amount_aed).first()))'
replace(old,new)
# Recheck revision and review in the atomic award statement, including concurrent changes.
replace('      AND q.total_amount_aed=? AND r.procurement_type=?', "      AND q.total_amount_aed=? AND q.revision_nonce IS ? AND (NOT EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.quotation_id=q.id) OR EXISTS(SELECT 1 FROM quotation_pdf_revisions p JOIN rfq_documents d ON d.id=p.document_id JOIN rfq_workbook_revisions w ON w.id=p.workbook_id WHERE p.quotation_id=q.id AND p.revision_nonce=q.revision_nonce AND d.standardization_status='approved' AND d.vendor_access_approved=1 AND w.status='published' AND json_extract(w.content_json,'$.preliminary')=0)) AND r.procurement_type=?")
replace('quote.id, quote.total_amount_aed, rfq.procurement_type, rfq.approved_manpower_quantity', 'quote.id, quote.total_amount_aed, quote.revision_nonce, rfq.procurement_type, rfq.approved_manpower_quantity')
replace("AND (quotation_id IS NULL OR EXISTS(SELECT 1 FROM vendor_quotes q WHERE q.id=quotation_id AND q.withdrawn_at IS NULL AND q.deleted_at IS NULL))`).bind(approval", "AND (quotation_id IS NULL OR EXISTS(SELECT 1 FROM vendor_quotes q WHERE q.id=quotation_id AND q.withdrawn_at IS NULL AND q.deleted_at IS NULL)) AND (NOT EXISTS(SELECT 1 FROM quotation_pdf_revisions p WHERE p.document_id=rfq_documents.id) OR EXISTS(SELECT 1 FROM quotation_pdf_revisions p JOIN vendor_quotes q ON q.id=p.quotation_id WHERE p.document_id=rfq_documents.id AND p.revision_nonce=q.revision_nonce))`).bind(approval")
# Embed narrowly modified current frontend; all other production assets stay identical.
f=(P/'baseline/assets/assets/rfq-f7c3d82b59a2.js').read_text()
start=f.index('var Qe = ({ rfq: e, onSubmitted: t }) => {');end=f.index('  $e = ({ onNavigate: e }) => {',start)
f=f[:start]+(P/'src/frontend-submission.js').read_text()+',\n'+f[end:]
anchor=' (0, x.jsx)(WorkbookPriceTable, { response: e.workbookResponse }),'
if f.count(anchor)!=2:raise RuntimeError('frontend card anchors differ')
f=f.replace(anchor,anchor+'\n (0, x.jsx)(QuotationPdfHistory, { quote: e }),')
f=f.replace('disabled: !!e.workbookResponse?.staleRevision || !!e.workbookResponse?.preliminary,','disabled: !!e.staleRevision || !!e.workbookResponse?.staleRevision || !!e.workbookResponse?.preliminary,')
f+='\n'+(P/'src/frontend-history.js').read_text()
asset='/assets/quotation-'+hashlib.sha256(f.encode()).hexdigest()[:12]+'.js'
assets[asset]={'type':'text/javascript; charset=utf-8','gzip':base64.b64encode(gzip.compress(f.encode(),mtime=0)).decode(),'sha256':hashlib.sha256(f.encode()).hexdigest()}
html=gzip.decompress(base64.b64decode(assets['/index.html']['gzip'])).decode().replace('/assets/rfq-f7c3d82b59a2.js',asset)
assets['/index.html']={'type':'text/html; charset=utf-8','gzip':base64.b64encode(gzip.compress(html.encode(),mtime=0)).decode(),'sha256':hashlib.sha256(html.encode()).hexdigest()}
s=re.sub(r'var assets_default = .*;\n','var assets_default = '+json.dumps(assets,separators=(',',':'))+';\n',s)
s+='\n'+(P/'src/quotation.js').read_text()
(P/'build').mkdir(exist_ok=True);(P/'build/patched.mjs').write_text(s)
subprocess.run([str(P/'node_modules/.bin/esbuild'),str(P/'build/patched.mjs'),'--bundle','--format=esm','--platform=neutral','--main-fields=module,main','--target=es2022','--outfile='+str(P/'build/worker.mjs')],check=True)
(P/'build/frontend.js').write_text(f)
print('Built recovered production Worker and existing frontend quotation changes')
