import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const origin='https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev';
assert.equal(process.env.ADMIN_BOOTSTRAP_EMAIL,'urbanprocures@urbanprocures.com');
assert.ok(process.env.ADMIN_INITIAL_PASSWORD);
const report={origin,startedAt:new Date().toISOString(),ownerOnly:true,productionModified:false,checks:[]};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
try{
 const page=await browser.newPage();assert.equal((await page.goto(origin+'/admin')).status(),200);
 const call=(path,body)=>page.evaluate(async({path,body})=>{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};},{path,body});
 const unauthorized=await call('/api/admin/email/workflow-test',{confirmOwnerOnlyTest:true});assert.equal(unauthorized.status,401);report.checks.push('anonymous denied');
 const login=await call('/api/auth/login',{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});assert.equal(login.status,200);
 try{
  const missing=await call('/api/admin/email/workflow-test',{});assert.equal(missing.status,400);report.checks.push('explicit confirmation enforced');
  const sent=await call('/api/admin/email/workflow-test',{confirmOwnerOnlyTest:true});
  report.httpStatus=sent.status;report.providerAccepted=sent.data.data?.providerAccepted===true;report.outboxStatus=sent.data.data?.outboxStatus;
  assert.equal(sent.status,200);assert.equal(report.outboxStatus,'sent');report.checks.push('real deployed outbox claim, Zoho send and sent completion');
  const duplicate=await call('/api/admin/email/workflow-test',{confirmOwnerOnlyTest:true});assert.equal(duplicate.status,429);report.checks.push('duplicate owner test throttled');
 }finally{await call('/api/auth/logout',{});}
 report.status='passed';
}catch{report.status='failed';process.exitCode=1;}
finally{await browser.close();report.completedAt=new Date().toISOString();await writeFile('deployment/staging-owner-outbox-verification-20261007.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
