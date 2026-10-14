from cf import cf,ACCOUNT
from pathlib import Path
import json,base64,urllib.request,urllib.error,time
P=Path(__file__).resolve().parent
cfg=json.loads((P/'build/staging-state.json').read_text());f=json.loads((P/'build/staging-fixtures.json').read_text());origin=cfg['origin'];checks=[]
def api(path,role=None,method='GET',body=None):
 headers={'User-Agent':'Mozilla/5.0','Origin':origin}
 if role:headers['Authorization']='Bearer '+cfg['tokens'][role]
 if body is not None:headers['Content-Type']='application/json'
 req=urllib.request.Request(origin+path,data=None if body is None else json.dumps(body).encode(),headers=headers,method=method)
 try:
  with urllib.request.urlopen(req) as r:return r.status,r.read(),{k.lower():v for k,v in r.headers.items()}
 except urllib.error.HTTPError as e:return e.code,e.read(),{k.lower():v for k,v in e.headers.items()}
def japi(*args,**kw):
 status,data,h=api(*args,**kw);return status,json.loads(data)
def check(label,fn):
 fn();checks.append(label);print('PASS',label,flush=True)
def expect(actual,expected):
 if actual!=expected:raise RuntimeError('Assertion failed; expected and observed values withheld')
def file(data,name,mime):return {'fileName':name,'fileType':mime,'fileSizeBytes':len(base64.b64decode(data)),'dataUrl':'data:'+mime+';base64,'+data,'documentPurpose':'boq'}
# Reset only this isolated synthetic fixture's quotations between validation runs.
for table in ['quotation_pdf_revisions','rfq_workbook_responses','quote_items','rfq_documents','vendor_quotes','audit_logs']:
 cf(f'/accounts/{ACCOUNT}/d1/database/{cfg["database"]}/query','POST',{'sql':'DELETE FROM '+table,'params':[]})
cf(f'/accounts/{ACCOUNT}/r2/buckets/{cfg["bucket"]}/objects/book.xlsx','PUT',(P/'build/blank-test.xlsx').read_bytes(),'application/octet-stream')
check('Staging homepage uses existing application',lambda:expect(api('/')[0],200))
check('Unauthenticated vendor quotation access denied',lambda:expect(api('/api/vendor/my-quotes')[0],401))
check('Published RFQ appears for unrelated vendor trade',lambda:expect(any(r['id']=='rfq' for r in japi('/api/vendor/rfqs','vendor')[1]['data']),True))
check('Vendor downloads published blank workbook',lambda:expect(api('/api/rfq-workbooks/book/download','vendor')[1],(P/'build/blank-test.xlsx').read_bytes()))
pdf={'pdfFile':file(f['original'],'private-vendor.pdf','application/pdf'),'totalAmountAed':125,'leadTimeDays':7,'validityDays':30,'paymentTerms':'50% advance; balance on completion'}
status,j=japi('/api/vendor/rfqs/rfq/quote','vendor','POST',pdf);expect(status,201);qid=j['data']['id'];doc=j['data']['documentId'];checks.append('Deployed PDF quotation upload succeeds');print('PASS',checks[-1],flush=True)
check('Unreviewed quotation withheld from comparison',lambda:expect(japi('/api/contractor/rfqs/rfq/quotations','contractor')[1]['data'],[]))
check('Pending original remains inaccessible to contractor',lambda:expect(api('/api/documents/'+doc+'/download','contractor')[0],404))
check('Vendor can retrieve its original unchanged',lambda:expect(api('/api/documents/'+doc+'/download','vendor')[1],base64.b64decode(f['original'])))
check('Original preview required to release',lambda:expect(japi('/api/admin/documents/'+doc+'/release','admin','POST',{'identityReviewConfirmed':True})[0],409))
# When AI is bound, wait for the real extraction candidate before correction.
for attempt in range(30):
 docs=japi('/api/admin/documents','admin')[1]['data'];candidate=next(d for d in docs if d['id']==doc)
 if candidate['standardizationStatus'] not in ['pending','processing']:break
 time.sleep(2)
if candidate['standardizationStatus']=='review_required':
 c=json.loads(candidate['standardizedContentJson']);expect(len(c['rows']),2);expect(c['totalAmount'].replace('AED','').replace(' ','').replace(',','') in ['125','125.00'],True)
 expect('Private Vendor LLC' not in json.dumps(c),True);expect('vendor-user@example.test' not in json.dumps(c),True);expect(candidate['standardizedFileType'],'application/pdf')
 checks.append('Real Workers AI extraction preserves two rows and total, masks vendor identity and produces review-only PDF');print('PASS',checks[-1],flush=True)
elif candidate['standardizationStatus'] not in ['pending','needs_manual_review']:raise RuntimeError('AI processing did not complete')
check('Correction builds branded PDF in deployed runtime',lambda:expect(japi('/api/admin/documents/'+doc+'/standardize','admin','PUT',{'content':f['reviewed']})[0],200))
check('Source preview is audited',lambda:expect(api('/api/documents/'+doc+'/view','admin')[0],200))
check('Derivative preview required after correction',lambda:expect(japi('/api/admin/documents/'+doc+'/release','admin','POST',{'identityReviewConfirmed':True})[1].get('error'),'OPEN_STANDARD_DOCUMENT_BEFORE_APPROVAL'))
status,bytes,h=api('/api/documents/'+doc+'/standardized/view','admin');expect(status,200);expect(h.get('content-type'),'application/pdf');(P/'build/staging-reviewed.pdf').write_bytes(bytes)
check('Both previews permit reviewed release',lambda:expect(japi('/api/admin/documents/'+doc+'/release','admin','POST',{'identityReviewConfirmed':True})[0],200))
check('Reviewed quotation integrates into comparison',lambda:expect(japi('/api/contractor/rfqs/rfq/quotations','contractor')[1]['data'][0]['documents'][0]['fileType'],'application/pdf'))
check('Contractor view/download both return derivative PDF',lambda:expect(api('/api/documents/'+doc+'/download','contractor')[1],bytes))
check('Another contractor cannot retrieve PDF',lambda:expect(api('/api/documents/'+doc+'/standardized/download','outsider')[0],404))
status,j=japi('/api/vendor/rfqs/rfq/quote','vendor','PUT',pdf);expect(status,201);doc2=j['data']['documentId'];checks.append('Deployed PDF revision creates fresh review');print('PASS',checks[-1],flush=True)
check('New revision hidden until reviewed',lambda:expect(japi('/api/contractor/rfqs/rfq/quotations','contractor')[1]['data'],[]))
check('Previous original retained',lambda:expect(api('/api/documents/'+doc+'/download','vendor')[1],base64.b64decode(f['original'])))
excel={'excelFile':file(f['filled'],'completed.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
check('Completed Excel submission still works on deployed Worker',lambda:expect(japi('/api/vendor/rfqs/rfq/quote','vendor','POST',excel)[0],201))
qs=japi('/api/vendor/my-quotes','vendor')[1]['data'];q=next(q for q in qs if q['id']==qid);expect(q['quotationRevision'],3);latest=q['quotationRevisions'][0]['documentId'];
check('Excel generates same corporate PDF under review',lambda:expect(q['reviewStatus'],'review_required'))
check('Excel original unchanged and private',lambda:expect(api('/api/documents/'+latest+'/download','vendor')[1],base64.b64decode(f['filled'])))
api('/api/documents/'+latest+'/view','admin');api('/api/documents/'+latest+'/standardized/view','admin')
check('Excel derivative passes required review/release',lambda:expect(japi('/api/admin/documents/'+latest+'/release','admin','POST',{'identityReviewConfirmed':True})[0],200))
q=japi('/api/contractor/rfqs/rfq/quotations','contractor')[1]['data'][0]
check('Comparison contains current Excel PDF and approved PDF revision history',lambda:expect([r['revision'] for r in q['quotationRevisions']],[3,1]))
check('Workbook validated item rates remain available',lambda:expect(q['workbookResponse']['items'][0]['unitRateAed'],10))
# Save synthetic IDs for browser inspection, never print sessions.
cfg['quoteId']=qid;cfg['documentId']=latest;(P/'build/staging-state.json').write_text(json.dumps(cfg))
(P/'build/staging-results.json').write_text(json.dumps({'checks':checks,'passed':len(checks),'origin':origin},indent=2))
print('RESULT',len(checks),'deployed Cloudflare checks passed')
