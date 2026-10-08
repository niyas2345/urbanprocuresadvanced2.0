import assert from 'node:assert/strict';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {createLocalWorker,applyMigrations} from './local-worker-test.mjs';
import {stagingAdminCredentials} from './staging-admin-credentials.mjs';
const staging=process.argv.includes('--staging');
const origin=staging?'https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev':'http://localhost';
const runId=randomBytes(6).toString('hex'),password=randomBytes(24).toString('base64url');
const report={origin,runId,checks:[],temporaryUserIds:[],rfqIds:[],productionModified:false,outboundMessagesSent:false};
const verify=(value,label)=>{assert.ok(value,label);report.checks.push(label);};
let mf,browser,page,adminToken,db;
const call=async(path,body,token,method=body?'POST':'GET')=>{
 if(staging)return page.evaluate(async({path,body,token,method})=>{const r=await fetch(path,{method,credentials:'omit',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,body:r.headers.get('Content-Type')?.includes('json')?await r.json():null,bytes:r.headers.get('Content-Type')?.includes('json')?null:Array.from(new Uint8Array(await r.arrayBuffer()))};},{path,body,token,method});
 const r=await mf.dispatchFetch(origin+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const json=r.headers.get('Content-Type')?.includes('json');return {status:r.status,body:json?await r.json():null,bytes:json?null:Array.from(new Uint8Array(await r.arrayBuffer()))};
};
const xlsx=execFileSync('python3',['-c',`import io,zipfile,sys
b=io.BytesIO()
with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
 z.writestr('xl/workbook.xml','<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets/></workbook>')
sys.stdout.buffer.write(b.getvalue())`]);
const formats=[['pdf','application/pdf',Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF')],['xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',xlsx],['xls','application/vnd.ms-excel',Buffer.from([208,207,17,224,161,177,26,225,0,0])],['dwg','image/vnd.dwg',Buffer.from('AC1027\0CAD validation fixture')],['dxf','application/dxf',Buffer.from('0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n10\n21\n10\n0\nENDSEC\n0\nEOF\n')]];
const attachment=([ext,type,bytes])=>({fileName:'qa-'+runId+'.'+ext,fileType:type,dataUrl:'data:'+type+';base64,'+bytes.toString('base64'),documentPurpose:'boq'});
const pdf=attachment(formats[0]);
try{
 if(staging){const {chromium}=await import('playwright-core');browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});page=await browser.newPage();await page.goto(origin);const admin=await stagingAdminCredentials();const login=await call('/api/auth/login',{email:admin.adminEmail,password:admin.adminPassword});verify(login.status===200,'Staging QA administrator login');adminToken=login.body.token;}
 else{mf=await createLocalWorker();db=await mf.getD1Database('DB');await applyMigrations(db);adminToken='a'.repeat(64);const now=new Date().toISOString();await db.prepare("INSERT INTO users VALUES('rfq-fix-admin','admin@example.invalid','!nonlogin','fixture','admin','active',?,?)").bind(now,now).run();await db.prepare("INSERT INTO auth_sessions VALUES(?,'rfq-fix-admin','admin','2099-01-01T00:00:00.000Z',?)").bind(createHash('sha256').update(adminToken).digest('hex'),now).run();}
 const terms=async(role)=>(await call('/api/terms?role='+role)).body.data.id;
 const register=async(role,suffix)=>{const r=await call('/api/auth/register-'+role,{companyName:'QA improvements '+runId,tradeLicenseNumber:'QA-'+runId,emirate:'Dubai',address:'QA',contactPerson:'QA',contactPhone:'+971500000001',email:'qa-improvements-'+runId+'-'+suffix+'@example.invalid',password,tradeCategories:['Joinery & Carpentry'],emiratesServiced:['Dubai'],acceptTerms:true,termsVersionId:await terms(role)});verify(r.status===201,role+' isolated registration');report.temporaryUserIds.push(r.body.user.id);return r.body;};
 const c=await register('contractor','c'),other=await register('contractor','other'),v=await register('vendor','v');
 const base={title:'QA improvements '+runId,category:'Joinery & Carpentry',projectName:'QA package',locationEmirate:'Dubai',scopeDescription:'Sanitized QA work scope',submissionDeadline:'2099-01-01',status:'submitted',items:[{description:'Fixture item',quantity:2,unit:'nos'}],documents:[]};
 const create=async(body={})=>{const r=await call('/api/contractor/rfqs',{...base,...body},c.token);verify(r.status===201,'RFQ creation');report.rfqIds.push(r.body.data.id);return r.body.data;};
 const keyed={...base,creationKey:randomUUID(),documents:[pdf]};const concurrent=await Promise.all([call('/api/contractor/rfqs',keyed,c.token),call('/api/contractor/rfqs',keyed,c.token)]);verify(concurrent.every(r=>r.status===201)&&concurrent[0].body.data.id===concurrent[1].body.data.id,'Concurrent duplicate submission returns one RFQ');const id=concurrent[0].body.data.id;report.rfqIds.push(id);
 verify((await call('/api/contractor/rfqs',{...keyed,title:'Changed payload'},c.token)).status===409,'Reused key with changed payload rejected');
 verify((await call(`/api/contractor/rfqs/${id}/status`,{status:'draft'},other.token,'PATCH')).status===404,'Foreign owner cannot recall');
 verify((await call(`/api/contractor/rfqs/${id}/status`,{status:'draft'},c.token,'PATCH')).status===200,'Submitted RFQ recalled to draft');
 verify((await call(`/api/contractor/rfqs/${id}`,{...base,title:'Recalled and edited'},c.token,'PUT')).status===201,'Recalled draft editable');
 verify((await call(`/api/contractor/rfqs/${id}`,null,other.token,'DELETE')).status===404,'Foreign owner cannot remove');
 verify((await call(`/api/contractor/rfqs/${id}`,null,c.token,'DELETE')).status===200,'Owner removes unawarded post');
 verify(!(await call('/api/contractor/rfqs',null,c.token)).body.data.some(r=>r.id===id),'Removed post hidden from dashboard');
 verify((await call(`/api/admin/rfqs/${id}/publish`,{identityReviewConfirmed:true},adminToken)).status===409,'Removed post cannot publish');
 const publicBase={customerName:'QA '+runId,customerPhone:'+971500000002',customerEmail:'qa-public-'+runId+'@example.invalid',propertyType:'villa',locationEmirate:'Dubai',locationCommunity:'QA',workCategory:'Joinery',description:'QA document request',siteVisitRequested:false,acceptTerms:true,termsVersionId:await terms('get_a_quote')};
 for(const format of formats){
  const file=attachment(format),r=await create({documents:[file],boqMode:'file',items:[]});verify(r.items.length===1&&r.items[0].unit==='lump_sum','Attached BOQ creates explicit package scope');
  const d=r.documents[0];const downloaded=await call(`/api/documents/${d.id}/download`,null,c.token);verify(downloaded.status===200&&Buffer.from(downloaded.bytes).equals(format[2]),format[0]+' private R2 byte roundtrip');
  verify((await call(`/api/documents/${d.id}/download`,null,other.token)).status===404,format[0]+' foreign document denied');
  verify((await call('/api/quotes/public',{...publicBase,attachments:[file]})).status===201,format[0]+' public attachment accepted');
 }
 verify((await call('/api/contractor/rfqs',{...base,boqMode:'file',documents:[]} ,c.token)).status===400,'File BOQ requires attachment');
 for(const ext of ['pdf','xlsx','xls','dwg','dxf'])verify((await call('/api/contractor/rfqs',{...base,documents:[{fileName:'spoof.'+ext,dataUrl:'data:application/octet-stream;base64,'+Buffer.from('not a document').toString('base64')}]},c.token)).status===400,ext+' spoof rejected');
 verify((await call('/api/contractor/rfqs',{...base,documents:Array(6).fill(pdf)},c.token)).status===400,'Too many documents rejected');
 const big={...pdf,dataUrl:'data:application/pdf;base64,'+Buffer.concat([Buffer.from('%PDF-'),Buffer.alloc(7100000)]).toString('base64')};verify((await call('/api/contractor/rfqs',{...base,documents:[big,big,big]},c.token)).status===400,'Combined 20MB limit enforced');
 const tooBig={...pdf,dataUrl:'data:application/pdf;base64,'+Buffer.concat([Buffer.from('%PDF-'),Buffer.alloc(10000001)]).toString('base64')};verify((await call('/api/quotes/public',{...publicBase,attachments:[tooBig]})).status===400,'Per-file 10MB limit enforced');
 verify((await call('/api/documents/upload',{...pdf,documentPurpose:'trade_license'},v.token)).status===201,'Vendor license uploaded');verify((await call(`/api/admin/vendors/${v.vendor.id}/verification`,{status:'verified'},adminToken,'PATCH')).status===200,'Vendor verification reviewed');
 for(const mode of ['itemized','total','file']){
  const rfq=await create();verify((await call(`/api/admin/rfqs/${rfq.id}/publish`,{identityReviewConfirmed:true},adminToken)).status===200,'RFQ reviewed and published');
  for(const value of [0,-100,'1234.56',null,1e15])verify((await call(`/api/vendor/rfqs/${rfq.id}/quote`,{pricingMode:'total',totalAmountAed:value,items:[],leadTimeDays:2,validityDays:30,paymentTerms:'QA'},v.token)).status===400,'Invalid package total rejected');
  if(mode==='file')verify((await call(`/api/vendor/rfqs/${rfq.id}/quote`,{pricingMode:'file',totalAmountAed:100,items:[],leadTimeDays:2,validityDays:30,paymentTerms:'QA'},v.token)).status===400,'File quotation requires actual attachment');
  const payload={pricingMode:mode,totalAmountAed:mode==='itemized'?999999:1234.56,items:mode==='itemized'?[{rfqItemId:rfq.items[0].id,unitRateAed:617.28}]:[],leadTimeDays:2,validityDays:30,paymentTerms:'QA',attachments:mode==='file'?[attachment(formats[1])]:[]};
  const quote=await call(`/api/vendor/rfqs/${rfq.id}/quote`,payload,v.token);verify(quote.status===201,mode+' quotation persists');verify(quote.body.data.totalAmountAed===1234.56,mode+' total correct');
  const listing=(await call(`/api/contractor/rfqs/${rfq.id}/quotations`,null,c.token)).body.data;verify(listing[0].pricingMode===mode&&listing[0].items.length===(mode==='itemized'?1:0),mode+' comparison has truthful pricing method');
  if(mode==='file'){verify(listing[0].documents.length===0,'Unreviewed quotation identity not exposed');const own=(await call('/api/vendor/my-quotes',null,v.token)).body.data.find(q=>q.id===quote.body.data.id);const doc=own.documents[0];verify((await call(`/api/admin/documents/${doc.id}/release`,{identityReviewConfirmed:true},adminToken)).status===200,'Quotation identity review');verify((await call(`/api/documents/${doc.id}/download`,null,c.token)).status===200,'Contractor downloads reviewed quotation');}
  verify((await call(`/api/contractor/rfqs/${rfq.id}/status`,{status:'draft'},c.token,'PATCH')).status===409,'Published quoted RFQ cannot recall');
  const award=await call(`/api/contractor/rfqs/${rfq.id}/award`,{quotationId:quote.body.data.id},c.token);verify(award.status===200,mode+' award works');
  const own=(await call('/api/vendor/my-quotes',null,v.token)).body.data.find(q=>q.id===quote.body.data.id);verify(own.serviceCharge.total_charge_aed===500,mode+' minimum Service Charge applies');
  verify((await call(`/api/contractor/rfqs/${rfq.id}`,null,c.token,'DELETE')).status===409,'Awarded RFQ cannot remove');
 }
 const cancelled=await create();await call(`/api/admin/rfqs/${cancelled.id}/publish`,{identityReviewConfirmed:true},adminToken);verify((await call(`/api/contractor/rfqs/${cancelled.id}/status`,{status:'cancelled'},c.token,'PATCH')).status===200,'Published RFQ can cancel');verify(!(await call('/api/vendor/rfqs',null,v.token)).body.data.some(r=>r.id===cancelled.id),'Cancelled RFQ removed from discovery');verify((await call(`/api/vendor/rfqs/${cancelled.id}/quote`,{pricingMode:'total',totalAmountAed:100,leadTimeDays:2,validityDays:30,paymentTerms:'QA'},v.token)).status===403,'Cancelled RFQ rejects new quote');
 report.status='passed';report.completedAt=new Date().toISOString();console.log(JSON.stringify({checksPassed:report.checks.length,staging,productionModified:false,outboundMessagesSent:false}));
}catch(error){report.status='failed';report.failure=error.message;throw error;}finally{
 if(staging&&adminToken)for(const id of report.temporaryUserIds)await call(`/api/admin/users/${id}/status`,{status:'suspended'},adminToken,'PATCH');
 if(staging)await writeFile('deployment/rfq-improvements-staging-20261008.json',JSON.stringify(report,null,2)+'\n');
 if(browser)await browser.close();if(mf)await mf.dispose();
}
