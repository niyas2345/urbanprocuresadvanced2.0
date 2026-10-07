import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const origin='https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev';
assert.equal(process.env.ADMIN_BOOTSTRAP_EMAIL,'urbanprocures@urbanprocures.com');
assert.ok(process.env.ADMIN_INITIAL_PASSWORD,'Owner password runtime binding missing');
const report={origin,checkedAt:new Date().toISOString(),checks:[],externalSendAttempted:false,productionModified:false};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
const page=await browser.newPage();
const call=(path,body)=>page.evaluate(async({path,body})=>{
 const r=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 return {status:r.status,data:await r.json()};
},{path,body});
let loggedIn=false;
try{
 const response=await page.goto(origin+'/admin',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);report.checks.push('staging HTTPS page');
 const login=await call('/api/auth/login',{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});
 report.ownerLoginStatus=login.status;
 if(login.status!==200||login.data.user?.role!=='admin')throw Error('OWNER_LOGIN_REJECTED');
 loggedIn=true;report.checks.push('owner Admin actual password login');
 const health=await call('/api/admin/email/health',{});report.oauthStatus=health.status;
 assert.equal(health.data.data?.authenticated,true);report.checks.push('deployed Worker OAuth authentication');
 const outbox=await call('/api/admin/email/outbox');assert.equal(outbox.status,200);report.checks.push('deployed outbox inspection');
 report.externalSendAttempted=true;
 const send=await call('/api/admin/email/test',{confirmOwnerOnlyTest:true});
 report.deliveryStatus=send.status;report.providerAccepted=send.data.data?.providerAccepted===true;
 report.safeError=send.data.error;report.phase=send.data.phase;report.providerStatus=send.data.providerStatus;report.providerCode=send.data.providerCode;report.mailStatus=send.data.mailStatus;
 if(report.providerAccepted)report.checks.push('deployed Worker owner-only provider acceptance');
}catch(error){report.failure=error.message==='OWNER_LOGIN_REJECTED'?'OWNER_LOGIN_REJECTED':'CHECK_FAILED';}
finally{
 if(loggedIn){const logout=await call('/api/auth/logout',{});report.logoutStatus=logout.status;}
 await browser.close();
 await writeFile('deployment/staging-owner-mail-check-20261007.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}
if(report.failure||!report.providerAccepted)process.exitCode=1;
