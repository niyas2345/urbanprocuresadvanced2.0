import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const origin='https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev';
assert.equal(process.env.ADMIN_BOOTSTRAP_EMAIL,'urbanprocures@urbanprocures.com');
const report={origin,startedAt:new Date().toISOString(),ownerOnly:true,customerEmailsSent:false};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
try{
 const page=await browser.newPage();assert.equal((await page.goto(origin+'/admin')).status(),200);
 const call=(path,body)=>page.evaluate(async({path,body})=>{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};},{path,body});
 const login=await call('/api/auth/login',{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});assert.equal(login.status,200);
 try{
  const health=await call('/api/admin/email/health',{});assert.equal(health.data.data?.authenticated,true);
  const sent=await call('/api/auth/forgot-password',{email:'urbanprocures@urbanprocures.com'});report.httpStatus=sent.status;report.safeError=sent.data.error;assert.equal(sent.status,200);report.status='passed';
 }finally{await call('/api/auth/logout',{});}
}catch{report.status='failed';process.exitCode=1;}
finally{await browser.close();report.completedAt=new Date().toISOString();await writeFile('deployment/production-owner-mail-verification-20261007.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}
