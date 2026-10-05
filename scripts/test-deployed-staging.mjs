import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash,randomBytes} from 'node:crypto';
import {chromium} from 'playwright-core';

// Actual deployed application tests; no local Worker, DB doubles or synthetic sessions.
const resources=JSON.parse(await readFile(new URL('../deployment/staging-resources.json',import.meta.url)));
const admin=JSON.parse(await readFile(process.env.STAGING_QA_CREDENTIAL_FILE||'/tmp/urbanprocures-staging-qa.json'));
const origin=resources.stagingUrl;
assert.equal(origin,'https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev');
assert.equal(admin.origin,origin);
assert.equal(resources.stagingDatabaseId,'eb82db72-864e-4835-b230-3903f77706f2');
const runId=randomBytes(6).toString('hex'),password=randomBytes(24).toString('base64url');
const report={runId,origin,startedAt:new Date().toISOString(),checks:[],failures:[],productionModified:false,outboundMessagesSent:false,temporaryUserIds:[],rfqIds:[]};
const verify=(value,label)=>{assert.ok(value,label);report.checks.push(label);};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const apiContext=await browser.newContext(),apiPage=await apiContext.newPage();
const call=async(path,body,token,method=body?'POST':'GET')=>apiPage.evaluate(async({path,body,token,method})=>{
 const response=await fetch(path,{method,credentials:'omit',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const type=response.headers.get('Content-Type')||'';
 return {status:response.status,body:type.includes('json')?await response.json():null,headers:Object.fromEntries(response.headers),...(!type.includes('json')?{bytes:Array.from(new Uint8Array(await response.arrayBuffer()))}:{})};
},{path,body,token,method});
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=','base64');
const document={fileName:'qa-'+runId+'.png',fileType:'image/png',dataUrl:'data:image/png;base64,'+png.toString('base64'),documentPurpose:'drawing'};
const details={companyName:'QA '+runId,tradeLicenseNumber:'QA-'+runId,emirate:'Dubai',address:'Private QA address '+runId,contactPerson:'QA Representative '+runId,contactPhone:'+971500000001',password,tradeCategories:['Joinery & Carpentry','Manpower'],emiratesServiced:['Dubai'],acceptTerms:true};
const fixtures=[];
try {
 const home=await apiPage.goto(origin,{waitUntil:'networkidle'});verify(home.status()===200,'HTTPS homepage loads with TLS verification');
 verify((await apiPage.locator('h1').textContent()).includes('The right people'),'approved homepage renders');
 for(const role of ['vendor','contractor','get_a_quote']){
  const response=await call('/api/terms?role='+role),terms=response.body.data;
  verify(response.status===200,role+' published Terms available');
  const name=role==='get_a_quote'?'get-a-quote':role,version=role==='vendor'?'2026.2':'2026.1';
  const text=await readFile(new URL('../urbanprocures advanced/terms/'+name+'-'+version+'.md',import.meta.url),'utf8');
  verify(terms.content_sha256===createHash('sha256').update(text).digest('hex'),role+' published Terms hash matches approved text');
  verify(terms.content_text===text,role+' full published Terms matches approved text');
 }
 verify((await call('/api/auth/register-vendor',{...details,email:'qa-reject-'+runId+'@example.invalid',acceptTerms:false,termsVersionId:'vendor-2026.2'})).status===400,'registration rejects unchecked consent');
 verify((await call('/api/auth/register-vendor',{...details,email:'qa-reject-'+runId+'@example.invalid',role:'admin',termsVersionId:'vendor-2026.2'})).status===403,'registration rejects Admin role forgery');
 // Real browser clickwrap registration for both roles.
 for(const role of ['contractor','vendor']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/'+role);await page.getByRole('button',{name:role==='vendor'?'Register as Vendor':'Register Organization',exact:true}).click();
  await page.getByText(role==='vendor'?'Version 2026.2':'Version 2026.1',{exact:true}).waitFor();
  verify(!await page.getByRole('checkbox').isChecked(),role+' browser consent initially unchecked');
  const submit=page.getByRole('button',{name:'ACCEPT TERMS & COMPLETE REGISTRATION',exact:true});verify(await submit.isDisabled(),role+' browser submit requires consent');
  await page.getByRole('button',{name:role==='vendor'?'VIEW VENDOR TERMS & CONDITIONS':'VIEW CONTRACTOR / CLIENT TERMS & CONDITIONS',exact:true}).click();
  verify((await page.getByRole('dialog').textContent()).includes('GOVERNING LAW / DISPUTES'),role+' browser opens full Terms');await page.getByRole('button',{name:'Close Terms',exact:true}).click();
  const fields=page.locator('form input[type=text]');await fields.nth(0).fill(details.companyName+' '+role);await fields.nth(1).fill(details.tradeLicenseNumber);await fields.nth(2).fill(details.contactPerson);
  const email='qa-'+runId+'-'+role+'@example.invalid';await page.locator('form input[type=tel]').fill(details.contactPhone);await page.locator('form input[type=email]').fill(email);await page.locator('form input[type=password]').fill(password);
  await page.getByRole('checkbox').check();const response=page.waitForResponse(r=>r.url().endsWith('/api/auth/register-'+role)&&r.request().method()==='POST');await submit.click();const registration=await response;verify(registration.status()===201,role+' browser registration persists on deployed D1');
  const me=await page.evaluate(async()=>(await fetch('/api/auth/me')).json());verify(me.authenticated&&me.termsAccepted&&me.user.role===role,role+' browser authenticated with accepted Terms');
  verify(me.user.status==='active',role+' actual user active');verify(role==='vendor'?me.vendor.verificationStatus==='pending':!me.contractor.verified_at,role+' registration does not auto-verify');
  await page.reload();verify((await page.evaluate(async()=>(await fetch('/api/auth/me')).json())).authenticated,role+' HttpOnly session survives reload');
  verify(await page.evaluate(()=>localStorage.getItem('urbanprocures_token')===null),role+' bearer credential not stored in localStorage');
  verify(errors.length===0,role+' browser has no runtime errors');
  const login=await call('/api/auth/login',{email,password});verify(login.status===200,role+' actual credential login');
  const value={role,email,password,token:login.body.token,profile:role==='vendor'?me.vendor:me.contractor,user:me.user,context,page};fixtures.push(value);report.temporaryUserIds.push(me.user.id);
 }
 const contractor=fixtures.find(f=>f.role==='contractor'),vendor=fixtures.find(f=>f.role==='vendor');
 // Browser registration uses its approved category default. Another API-created vendor covers manpower and losing-party privacy.
 const extra=await call('/api/auth/register-vendor',{...details,email:'qa-'+runId+'-extra@example.invalid',termsVersionId:'vendor-2026.2'});verify(extra.status===201,'separate Vendor registration with categories');
 const losing={token:extra.body.token,profile:extra.body.vendor,user:extra.body.user};report.temporaryUserIds.push(losing.user.id);
 const otherResponse=await call('/api/auth/register-contractor',{...details,email:'qa-'+runId+'-other@example.invalid',termsVersionId:'contractor-2026.1'});verify(otherResponse.status===201,'separate Contractor registration');const other=otherResponse.body;report.temporaryUserIds.push(other.user.id);
 await writeFile('/tmp/urbanprocures-staging-workflow-'+runId+'.json',JSON.stringify({runId,password,users:fixtures.map(f=>({role:f.role,email:f.email,userId:f.user.id})),extraEmail:extra.body.user.email,otherEmail:other.user.email}),{mode:0o600});
 const adminLogin=await call('/api/auth/login',{email:admin.adminEmail,password:admin.adminPassword});verify(adminLogin.status===200&&adminLogin.body.user.role==='admin','temporary Admin authenticates with actual password');const adminToken=adminLogin.body.token;
 for(const resource of ['users','contractors','vendors','documents','rfqs','public-quotes','site-visits','awards','quotations','service-charges','audit-logs','invitations']){
  verify((await call('/api/admin/'+resource)).status===401,resource+' anonymous denied');verify((await call('/api/admin/'+resource,null,vendor.token)).status===403,resource+' Vendor denied');verify((await call('/api/admin/'+resource,null,adminToken)).status===200,resource+' Admin actual deployed query');
 }
 for(const v of [vendor,losing]){
  verify((await call(`/api/admin/vendors/${v.profile.id}/verification`,{status:'verified'},adminToken,'PATCH')).status===409,'Vendor verification requires uploaded license');
  const upload=await call('/api/documents/upload',{...document,documentPurpose:'trade_license'},v.token);verify(upload.status===201,'Vendor license stored in private staging R2');
  verify((await call(`/api/admin/vendors/${v.profile.id}/verification`,{status:'verified'},adminToken,'PATCH')).status===200,'Admin verifies actual Vendor license');
 }
 const rfqBody={title:'Staging QA '+runId,category:'Joinery & Carpentry',projectName:'Protected QA Project '+runId,locationEmirate:'Dubai',scopeDescription:'Private requirement '+contractor.email,submissionDeadline:'2099-01-01',status:'submitted',items:[{description:'QA BoQ item',quantity:2,unit:'nos'}],documents:[document]};
 const created=await call('/api/contractor/rfqs',rfqBody,contractor.token);verify(created.status===201,'Contractor RFQ BoQ and file persist');const rfq=created.body.data;report.rfqIds.push(rfq.id);const doc=rfq.documents[0].id;
 for(const [token,status,label]of [[null,401,'anonymous'],[other.token,404,'other Contractor'],[vendor.token,404,'Vendor before document review']])verify((await call(`/api/documents/${doc}/view`,null,token)).status===status,label+' original document denied');
 const opened=await call(`/api/documents/${doc}/view`,null,adminToken);verify(opened.status===200&&Buffer.from(opened.bytes).equals(png),'Admin opens actual R2 bytes');verify(opened.headers['x-content-type-options']==='nosniff','document MIME sniffing disabled');
 const downloaded=await call(`/api/documents/${doc}/download`,null,adminToken);verify(downloaded.status===200&&Buffer.from(downloaded.bytes).equals(png),'Admin downloads exact uploaded bytes');
 verify((await call(`/api/admin/rfqs/${rfq.id}/publish`,{},adminToken)).status===409,'Admin publication requires identity review');verify((await call(`/api/admin/rfqs/${rfq.id}/publish`,{identityReviewConfirmed:true},adminToken)).status===200,'Admin publishes reviewed RFQ');
 const discovered=(await call('/api/vendor/rfqs',null,vendor.token)).body.data.find(r=>r.id===rfq.id);verify(!!discovered,'verified Vendor discovers matching RFQ');verify(discovered.projectName!==rfqBody.projectName&&!JSON.stringify(discovered).includes(contractor.email),'pre-award discovery masks project and email');verify(discovered.documents.length===0,'unreviewed original documents omitted');
 const quoteBody={items:[{rfqItemId:rfq.items[0].id,unitRateAed:5000}],leadTimeDays:2,validityDays:30,paymentTerms:'QA payment',notes:vendor.email,totalAmountAed:1};
 const quotation=await call(`/api/vendor/rfqs/${rfq.id}/quote`,quoteBody,vendor.token);verify(quotation.status===201,'Vendor submits deployed itemized quote');verify(quotation.body.data.totalAmountAed===10000,'server ignores browser total override');
 verify((await call(`/api/vendor/rfqs/${rfq.id}/quote`,quoteBody,vendor.token)).status===409,'duplicate quotation denied');
 verify((await call(`/api/vendor/rfqs/${rfq.id}/quote`,quoteBody,losing.token)).status===201,'second Vendor independently quotes');
 const quotes=(await call(`/api/contractor/rfqs/${rfq.id}/quotations`,null,contractor.token)).body.data;verify(!JSON.stringify(quotes).includes(vendor.email),'pre-award quotation masks Vendor identity');verify((await call(`/api/contractor/rfqs/${rfq.id}/quotations`,null,other.token)).status===404,'other Contractor cannot read quotations');
 verify((await call(`/api/contractor/rfqs/${rfq.id}/award`,{quotationId:quotation.body.data.id},adminToken)).status===403,'Admin cannot award for Contractor');verify((await call(`/api/contractor/rfqs/${rfq.id}/award`,{quotationId:quotation.body.data.id},other.token)).status===404,'wrong Contractor cannot award');
 const awards=await Promise.all([1,2].map(()=>call(`/api/contractor/rfqs/${rfq.id}/award`,{quotationId:quotation.body.data.id,serviceChargeAed:0},contractor.token)));verify(awards.filter(a=>a.status===200).length===1&&awards.filter(a=>a.status===409).length===1,'concurrent awards create exactly one winner');
 const award=awards.find(a=>a.status===200).body.data;verify(award.totalVendorChargeAed===500&&award.contractorServiceChargeAed===0,'AED 10000 award yields Vendor 500 Contractor zero');verify(award.vendorTermsVersion==='2026.2'&&!!award.vendorTermsAcceptanceId,'award links accepted Vendor Terms evidence');
 const winnerQuotes=(await call(`/api/contractor/rfqs/${rfq.id}/quotations`,null,contractor.token)).body.data;verify(winnerQuotes.find(q=>q.id===quotation.body.data.id).vendorContact.email===vendor.email,'winning Vendor contact released to owning Contractor');
 const losingQuotes=(await call('/api/vendor/my-quotes',null,losing.token)).body.data;verify(!JSON.stringify(losingQuotes.find(q=>q.rfqId===rfq.id)).includes(contractor.email),'losing Vendor never receives Contractor identity');
 for(const scenario of [{value:100000,charge:2500},{value:10000,charge:1,persons:1,hours:1,days:1},{value:10000,charge:80,persons:10,hours:8,days:1},{value:10000,charge:600,persons:20,hours:10,days:3}]){
  const manpower=!!scenario.persons,created=await call('/api/contractor/rfqs',{...rfqBody,documents:[],category:manpower?'Manpower':'Joinery & Carpentry',...(manpower?{manpowerPersons:scenario.persons,manpowerHoursPerPersonPerDay:scenario.hours,manpowerDays:scenario.days,manpowerRateAed:500}:{})},contractor.token);verify(created.status===201,'commercial scenario RFQ persists');const current=created.body.data;report.rfqIds.push(current.id);
  verify((await call(`/api/admin/rfqs/${current.id}/publish`,{identityReviewConfirmed:true},adminToken)).status===200,'commercial scenario published');
  const q=await call(`/api/vendor/rfqs/${current.id}/quote`,{...quoteBody,items:[{rfqItemId:current.items[0].id,unitRateAed:scenario.value/2}]},losing.token);verify(q.status===201,'commercial scenario quote persists');
  const awarded=await call(`/api/contractor/rfqs/${current.id}/award`,{quotationId:q.body.data.id,manpowerRateAed:500,manpowerQuantity:999999},contractor.token);verify(awarded.status===200,'commercial scenario award persists');
  const charge=awarded.body.data;verify(charge.totalVendorChargeAed===scenario.charge&&charge.contractorServiceChargeAed===0,'authoritative commercial charge '+scenario.charge);
  if(manpower)verify(charge.vendorServiceChargeAed===0&&charge.manpowerRateAed===1&&charge.manpowerQuantity===scenario.charge&&charge.manpowerPersons===scenario.persons&&charge.manpowerHoursPerPersonPerDay===scenario.hours&&charge.manpowerDays===scenario.days,'manpower operands persist at AED 1 without double charge');
 }
 const publicBody={customerName:'QA Public '+runId,customerEmail:'qa-public-'+runId+'@example.invalid',customerPhone:'+971500000002',propertyType:'villa',locationEmirate:'Dubai',locationCommunity:'QA Community',workCategory:'Joinery & Carpentry',description:'Staging QA public request',siteVisitRequested:true,acceptTerms:true,termsVersionId:'get-a-quote-2026.1',attachments:[document]};
 verify((await call('/api/quotes/public',{...publicBody,acceptTerms:false})).status===403,'public request requires explicit consent');
 const publicRequest=await call('/api/quotes/public',publicBody);verify(publicRequest.status===201,'public request and attachment persist without account');
 const visits=(await call('/api/admin/site-visits',null,adminToken)).body.data;verify(visits.some(v=>v.feeAed===100&&v.status==='pending'),'optional AED 100 site visit is pending');
 const evidence=(await call('/api/admin/terms/acceptances',null,adminToken)).body.data;verify(report.temporaryUserIds.every(id=>evidence.some(e=>e.user_id===id)),'Admin sees actual immutable role Terms evidence');
 const charges=(await call('/api/admin/service-charges',null,adminToken)).body.data;verify(report.rfqIds.every(id=>charges.some(c=>c.rfqId===id)),'all five awards have persistent Service Charge records');
 // Genuine Admin UI sign-in and inspection of the actual uploaded image.
 const context=await browser.newContext(),page=await context.newPage();await page.goto(origin+'/admin');await page.getByLabel('Admin email').fill(admin.adminEmail);await page.getByLabel('Password',{exact:true}).fill(admin.adminPassword);await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByRole('button',{name:/Document Inspector/}).waitFor();verify(await page.getByText('Admin Session Active',{exact:true}).isVisible(),'Admin browser authenticates');
 await page.getByRole('button',{name:'Terms Acceptance Evidence',exact:true}).click();await page.getByRole('button',{name:'Inspect Accepted Version',exact:true}).first().click();verify((await page.locator('pre').textContent()).includes('ELECTRONIC ACCEPTANCE'),'Admin browser inspects full stored accepted Terms');
 await context.close();
 verify((await call('/api/auth/forgot-password',{email:contractor.email})).status===503,'unconfigured Zoho reports unavailable without sending mail');
 verify((await call('/api/no-such-route')).status===404,'unknown API returns honest 404');
 report.completedAt=new Date().toISOString();report.status='passed';
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;}
finally{
 await browser.close();await writeFile(new URL('../deployment/staging-qa-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,actualDeployedChecksPassed:report.checks.length,failures:report.failures,report:'deployment/staging-qa-results.json',productionModified:false}));
}
