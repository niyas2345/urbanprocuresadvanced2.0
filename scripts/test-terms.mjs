import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import { createLocalWorker,applyMigrations } from './local-worker-test.mjs';
const mf=await createLocalWorker();let checks=0;
const verify=(value,label)=>{assert.ok(value,label);checks++;};
const call=(path,body,token)=>mf.dispatchFetch('http://localhost'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
try {
 const db=await mf.getD1Database('DB');await applyMigrations(db);
 for(const role of ['vendor','contractor','get_a_quote']) {
   const terms=await (await call(`/api/terms?role=${role}&viewed=true`)).json();
   verify(terms.data.terms_version===(role==='vendor'?'2026.2':'2026.1'),role+' published');
   const content=fs.readFileSync(`urbanprocures advanced/terms/${role==='get_a_quote'?'get-a-quote':role}-${role==='vendor'?'2026.2':'2026.1'}.md`,'utf8');
   verify(terms.data.content_text===content,role+' exact content');
   verify(terms.data.content_sha256===createHash('sha256').update(content).digest('hex'),role+' deterministic hash');
 }
 const details={companyName:'Terms Fixture',tradeLicenseNumber:'FIXTURE',emirate:'Dubai',address:'Fixture address',contactPerson:'Fixture Representative',contactPhone:'+971500000000',password:'Fixture-password-2026!',tradeCategories:['Joinery'],emiratesServiced:['Dubai']};
 for(const role of ['vendor','contractor'])verify((await call('/api/auth/register-'+role,{...details,email:role+'@example.invalid'})).status===400,role+' missing checkbox blocked');
 verify((await call('/api/auth/register-vendor',{...details,email:'vendor@example.invalid',acceptTerms:true,termsVersionId:'forged'})).status===400,'forged Terms blocked');
 const register=async(role,name)=>{const res=await call('/api/auth/register-'+role,{...details,email:name+'@example.invalid',acceptTerms:true,termsVersionId:role+(role==='vendor'?'-2026.2':'-2026.1')});const b=await res.json();verify(res.status===201,JSON.stringify(b));return b;};
 const contractor=await register('contractor','contractor'),vendor=await register('vendor','vendor'),loser=await register('vendor','loser'),otherContractor=await register('contractor','other-contractor');
 let vToken=vendor.token;
 verify((await db.prepare('SELECT content_sha256,organization_id,acceptance_action FROM terms_acceptance_evidence WHERE user_id=?').bind(vendor.user.id).first()).acceptance_action==='explicit_clickwrap','acceptance persisted');
 await call('/api/auth/logout',{},vToken);vToken=(await (await call('/api/auth/login',{email:vendor.user.email,password:details.password})).json()).token;
 verify((await (await call('/api/terms/status',null,vToken)).json()).data.status==='ACTIVE','acceptance survives logout/login');
 verify((await call('/api/terms/accept',{acceptTerms:true,termsVersionId:'vendor-2026.2',organizationId:otherContractor.contractor.organizationId},vToken)).status===403,'organization substitution blocked even on replay');
 verify((await call('/api/terms/accept',{acceptTerms:true,termsVersionId:'vendor-2026.2',userId:loser.user.id},vToken)).status===403,'other user substitution blocked');
 await assert.rejects(()=>db.prepare("UPDATE terms_acceptance_evidence SET content_sha256='forged' WHERE user_id=?").bind(vendor.user.id).run());checks++;
 await assert.rejects(()=>db.prepare("UPDATE terms_versions SET content_text='forged' WHERE id='vendor-2026.2'").run());checks++;
 await assert.rejects(()=>db.prepare("UPDATE terms_versions SET mandatory=0 WHERE id='vendor-2026.2'").run());checks++;
 const noTerms=await register('vendor','no-current-terms');
 // Introduce a mandatory version; old evidence remains present and cannot satisfy the new gate.
 const nextDate=new Date().toISOString();
 await db.prepare("UPDATE terms_versions SET status='retired' WHERE id='vendor-2026.2'").run();
 await db.prepare("INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at,title,effective_at) VALUES ('vendor-test-v2','vendor','vendor','test-v2','Test-only revised Terms','test-v2-hash','published',1,'terms-owner-publication',?,?, 'Test-only Terms',?)").bind(nextDate,nextDate,nextDate).run();
 for(const path of ['/api/vendor/rfqs','/api/vendor/rfqs/fake/quote']) {
   const r=await call(path,path.endsWith('quote')?{}:null,noTerms.token);verify(r.status===403,'old Terms API gate');verify((await r.json()).code==='REACCEPTANCE_REQUIRED','explicit reacceptance code');
 }
 verify((await (await call('/api/terms/status',null,vToken)).json()).data.status==='REACCEPTANCE_REQUIRED','mandatory reacceptance status');
 await db.prepare("INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,created_at) VALUES ('unpublished','vendor','vendor','draft','draft','draft','draft',1,?)").bind(nextDate).run();
 verify((await call('/api/terms/accept',{acceptTerms:true,termsVersionId:'unpublished'},vToken)).status===400,'unpublished Terms rejected');
 for(const account of [{...vendor,token:vToken},loser])verify((await call('/api/terms/accept',{acceptTerms:true,termsVersionId:'vendor-test-v2'},account.token)).status===200,'new Terms accepted');
 await db.prepare("UPDATE vendors SET verification_status='verified' WHERE user_id IN (?,?)").bind(vendor.user.id,loser.user.id).run();
 verify((await call('/api/vendor/rfqs',null,vToken)).status===200,'protected access restored');
 verify((await db.prepare('SELECT count(*) AS n FROM terms_acceptance_evidence WHERE user_id=?').bind(vendor.user.id).first()).n===2,'old history preserved');
 // Directly insert an unaccepted active fixture to distinguish missing from obsolete evidence.
 const now=new Date().toISOString(),uid='unaccepted-fixture',oid='unaccepted-org';
 await db.prepare("INSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES (?,?,'!nonlogin','fixture','vendor','active',?,?)").bind(uid,'unaccepted@example.invalid',now,now).run();
 await db.prepare("INSERT INTO organizations (id,name,org_type,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES (?,'Fixture','vendor','F','Dubai','F','F','F',?)").bind(oid,now).run();
 await db.prepare("INSERT INTO vendors (id,user_id,organization_id,company_name,trade_license_number,trade_categories,emirates_serviced,verification_status,contact_person,contact_phone,created_at) VALUES ('unaccepted-vendor',?,?,'F','F','[]','[]','verified','F','F',?)").bind(uid,oid,now).run();
 const raw='b'.repeat(64),digest=createHash('sha256').update(raw).digest('hex');
 await db.prepare("INSERT INTO auth_sessions (token,user_id,role,expires_at,created_at) VALUES (?,?,'vendor',?,?)").bind(digest,uid,'2099-01-01T00:00:00.000Z',now).run();
 for(const path of ['/api/vendor/rfqs','/api/vendor/rfqs/fake/quote'])verify((await (await call(path,path.endsWith('quote')?{}:null,raw)).json()).code==='TERMS_ACCEPTANCE_REQUIRED','missing acceptance gate');
 const rfq=async(id,type='standard')=>{await db.prepare("INSERT INTO rfqs (id,reference_code,contractor_id,title,category,project_name,location_emirate,submission_deadline,scope_description,status,created_at,procurement_type,approved_manpower_quantity) VALUES (?,?,?,'Fixture','Joinery','Fixture project','Dubai','2099-01-01T00:00:00.000Z','Fixture scope','receiving_quotations',?,?,?)").bind(id,id,contractor.contractor.id,now,type,type==='manpower'?20:null).run();await db.prepare("INSERT INTO rfq_items (id,rfq_id,item_number,description,quantity,unit) VALUES (?,?,1,'Fixture BoQ',1,'fixture')").bind(id+'-item',id).run();};
 const bid=async(id,rate,token)=>{const r=await call(`/api/vendor/rfqs/${id}/quote`,{items:[{rfqItemId:id+'-item',unitRateAed:rate}],totalAmountAed:1,leadTimeDays:1,validityDays:30,paymentTerms:'Fixture terms'},token);const b=await r.json();verify(r.status===201,JSON.stringify(b));verify(b.data.totalAmountAed===rate,'browser financial total ignored');return b.data.id;};
 for(const [id,amount,expected] of [['award-10k',10000,500],['award-100k',100000,2500]]) {
   await rfq(id);if(id==='award-10k')await db.prepare("UPDATE rfqs SET status='reviewed_published' WHERE id=?").bind(id).run();const quote=await bid(id,amount,vToken);await bid(id,amount+1000,loser.token);
   verify((await db.prepare('SELECT status FROM rfqs WHERE id=?').bind(id).first()).status==='receiving_quotations','first bid advances published RFQ');
   verify((await call(`/api/contractor/rfqs/${id}/award`,{quotationId:quote},otherContractor.token)).status===404,'wrong Contractor cannot award');
   const r=await call(`/api/contractor/rfqs/${id}/award`,{quotationId:quote,calculatedServiceChargeAed:1},contractor.token);const b=await r.json();verify(r.status===200,JSON.stringify(b));verify(b.data.vendorServiceChargeAed===expected,'standard Vendor charge');verify(b.data.contractorServiceChargeAed===0,'Contractor AED 0');
   const record=await db.prepare('SELECT a.vendor_terms_version,a.vendor_terms_acceptance_id,e.user_id FROM awards a JOIN terms_acceptance_evidence e ON e.acceptance_id=a.vendor_terms_acceptance_id WHERE a.rfq_id=?').bind(id).first();verify(record.user_id===vendor.user.id&&record.vendor_terms_version==='test-v2','award accepted Terms linkage');
   verify((await call(`/api/contractor/rfqs/${id}/award`,{quotationId:quote},contractor.token)).status===409,'repeat award denied');
 }
 const losingQuotes=(await (await call('/api/vendor/my-quotes',null,loser.token)).json()).data;verify(losingQuotes.every(q=>!q.contractorContact),'non-awarded Vendor stays masked');
 await rfq('concurrent');const concurrentQuote=await bid('concurrent',10000,vToken),alternateQuote=await bid('concurrent',11000,loser.token);
 const concurrent=await Promise.all([call('/api/contractor/rfqs/concurrent/award',{quotationId:concurrentQuote},contractor.token),call('/api/contractor/rfqs/concurrent/award',{quotationId:alternateQuote},contractor.token)]);
 verify(concurrent.filter(r=>r.status===200).length===1&&concurrent.filter(r=>r.status===409).length===1,'concurrent awards produce exactly one winner');verify((await db.prepare("SELECT count(*) AS n FROM service_charges WHERE rfq_id='concurrent'").first()).n===1,'exactly one charge under concurrent awards');
 const winningQuotes=(await (await call('/api/vendor/my-quotes',null,vToken)).json()).data;verify(winningQuotes.filter(q=>q.status==='awarded').every(q=>q.contractorContact?.companyName==='Terms Fixture'),'winning Vendor allowed contact release');
 for(const [persons,hours,days,expected]of [[1,1,1,1],[10,8,1,80],[20,10,3,600]]) {
  const id='manpower-'+expected;await rfq(id,'manpower');await db.prepare('UPDATE rfqs SET manpower_persons=?,manpower_hours_per_person_per_day=?,manpower_days=? WHERE id=?').bind(persons,hours,days,id).run();
  const mq=await bid(id,10000,vToken),r=await call(`/api/contractor/rfqs/${id}/award`,{quotationId:mq,manpowerRate:900,manpowerPersons:900},contractor.token),mc=await r.json();
  verify(r.status===200,JSON.stringify(mc));verify(mc.data.manpowerChargeAed===expected&&mc.data.vendorServiceChargeAed===0&&mc.data.contractorServiceChargeAed===0,'person-hours without double charge, browser override ignored');
  const stored=await db.prepare('SELECT * FROM awards WHERE rfq_id=?').bind(id).first();verify(stored.manpower_persons===persons&&stored.manpower_hours_per_person_per_day===hours&&stored.manpower_days===days&&stored.manpower_rate_aed===1,'persisted manpower operands and fixed rate');
 }
 // Admin evidence uses an actual active session, independent of any UI role switch.
 await db.prepare("INSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES ('admin-fixture','admin@example.invalid','!nonlogin','fixture','admin','active',?,?)").bind(now,now).run();
 const adminToken='c'.repeat(64);await db.prepare("INSERT INTO auth_sessions (token,user_id,role,expires_at,created_at) VALUES (?,'admin-fixture','admin','2099-01-01T00:00:00.000Z',?)").bind(createHash('sha256').update(adminToken).digest('hex'),now).run();
 verify((await call('/api/admin/terms/acceptances',null,vToken)).status===403,'Vendor cannot inspect Admin evidence');
 verify((await call('/api/terms/accept',{acceptTerms:true,termsVersionId:'vendor-test-v2',userId:vendor.user.id},adminToken)).status===403,'Admin cannot accept on behalf of Vendor');
 const evidence=await (await call('/api/admin/terms/acceptances',null,adminToken)).json();verify(evidence.data.some(e=>e.terms_version==='2026.1'&&e.content_text&&e.company&&e.email&&e.audit_reference),'Admin exact version/evidence');
 const publicDetails={customerName:'Public Fixture',customerPhone:'+971500000000',customerEmail:'public@example.invalid',propertyType:'villa',locationEmirate:'Dubai',locationCommunity:'Fixture',workCategory:'Fixture',description:'Fixture request',siteVisitRequested:true};
 verify((await call('/api/quotes/public',publicDetails)).status===403,'public unchecked consent blocked');
 const pr=await call('/api/quotes/public',{...publicDetails,acceptTerms:true,termsVersionId:'get-a-quote-2026.1'});const pb=await pr.json();verify(pr.status===201,JSON.stringify(pb));verify(pb.data.siteVisitFeeAed===100&&pb.data.status==='received','public site visit separate, not scheduled');
 verify((await db.prepare('SELECT terms_version FROM public_terms_acceptances WHERE request_id=?').bind(pb.data.id).first()).terms_version==='2026.1','public versioned evidence persisted');
 verify((await (await call('/api/admin/terms/acceptances?type=get_a_quote',null,adminToken)).json()).data.some(e=>e.request_id===pb.data.id&&e.content_text&&e.content_sha256),'Admin inspects public consent');
 verify((await call('/api/admin/terms/acceptances?offset=-1',null,adminToken)).status===400,'invalid Admin history page rejected');
 const audit=await db.prepare("SELECT DISTINCT action_type FROM audit_logs WHERE resource_type='terms'").all();for(const action of ['VENDOR_TERMS_VIEWED','CONTRACTOR_TERMS_VIEWED','VENDOR_TERMS_ACCEPTED','CONTRACTOR_TERMS_ACCEPTED','TERMS_REACCEPTANCE_REQUIRED'])verify(audit.results.some(e=>e.action_type===action),action+' recorded');
 await db.prepare("UPDATE terms_versions SET status='retired' WHERE id='vendor-test-v2'").run();
 const optionalDate=new Date().toISOString();await db.prepare("INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,mandatory,approved_by,published_at,created_at,effective_at) VALUES ('optional-v3','vendor','vendor','optional-v3','Optional fixture','optional-hash','published',0,'terms-owner-publication',?,?,?)").bind(optionalDate,optionalDate,optionalDate).run();
 verify((await (await call('/api/terms/status',null,vToken)).json()).data.status==='ACTIVE','nonmandatory update preserves valid previous acceptance');
 console.log(JSON.stringify({genuineWorkerD1R2TermsChecksPassed:checks,productionResourcesTouched:false,manpowerUnit:'AED 1 per person-hour; owner master handoff'},null,2));
} finally {await mf.dispose();}
