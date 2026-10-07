import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
const live=process.argv.includes('--live');
const origin=live?(process.argv.includes('--www')?'https://www.urbanprocures.com':'https://urbanprocures.com'):'https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev';
const report={origin,startedAt:new Date().toISOString(),checks:[],customerDomainModified:live,mailSent:false};
const verify=(condition,label)=>{assert.ok(condition,label);report.checks.push(label);};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
try{
 const page=await browser.newPage();verify((await page.goto(origin)).status()===200,'production preview HTTPS');
 verify((await page.locator('h1').textContent()).includes('The right people'),'approved homepage');
 const call=(path,body)=>page.evaluate(async({path,body})=>{const r=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};},{path,body});
 for(const role of ['vendor','contractor','get_a_quote']){
  const r=await call('/api/terms?role='+role);report.lastTermsStatus=r.status;verify(r.status===200,role+' published Terms');
  const text=await readFile('urbanprocures advanced/terms/'+(role==='get_a_quote'?'get-a-quote':role)+'-'+(role==='vendor'?'2026.2':'2026.1')+'.md','utf8');
  verify(r.data.data.content_text===text,role+' approved content');verify(r.data.data.content_sha256===createHash('sha256').update(text).digest('hex'),role+' approved hash');
 }
 verify((await call('/api/admin/users')).status===401,'anonymous Admin access denied');
 const login=await call('/api/auth/login',{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});report.loginStatus=login.status;report.loginSafeError=login.data.error;verify(login.status===200,'approved owner Admin login');
 try{
  const users=await call('/api/admin/users');verify(users.status===200,'real production D1 Admin listing');verify(users.data.data.length===1&&users.data.data[0].email==='urbanprocures@urbanprocures.com','one owner login and zero QA accounts');
  for(const path of ['rfqs','vendors','contractors','documents','awards','service-charges','public-quotes']){
   const r=await call('/api/admin/'+path);verify(r.status===200&&r.data.data.length===0,'empty production '+path+'; staging fixtures not copied');
  }
  verify((await call('/api/admin/email/workflow-test',{confirmOwnerOnlyTest:true})).status===403,'staging email test disabled in production');
  const mail=await call('/api/admin/email/health',{});report.mailHealthStatus=mail.status;report.mailAuthentication=mail.data.data?.authenticated===true;report.mailSafeCode=mail.data.providerCode;
  verify(mail.status===200&&report.mailAuthentication,'actual production OAuth authentication');
  report.remainingGate=live?null:'live-domain acceptance';
 }finally{verify((await call('/api/auth/logout',{})).status===200,'owner session logged out');}
 report.status='passed';
}catch(error){report.status='failed';report.failure=error instanceof Error?error.message.slice(0,200):'Verification failed';process.exitCode=1;}
finally{await browser.close();report.completedAt=new Date().toISOString();await writeFile('deployment/'+(live?'production-live-'+(process.argv.includes('--www')?'www':'apex')+'-verification-20261007.json':'production-preview-verification-20261007.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
