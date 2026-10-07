import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
const origin='https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev';
const previous='9bacb818-31fb-4215-81f3-a5d78c991726';
const current='977e0867-9f77-4761-9dc6-a27e3b53acc4';
const config='urbanprocures advanced/workers/wrangler.staging.toml';
const env={...process.env,CLOUDFLARE_ACCOUNT_ID:'dcb411ece67dfdfb730635133ed31825',XDG_CONFIG_HOME:'/workspace/.config',WRANGLER_SEND_METRICS:'false'};
const report={origin,startedAt:new Date().toISOString(),previous,current,checks:[],productionModified:false,mailSent:false};
const deploy=version=>execFileSync('npx',['--no-install','wrangler','versions','deploy',version+'@100','--yes','--config',config,'--message','Isolated staging rollback verification'],{env,stdio:'pipe'});
const smoke=async label=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
 try{
  const page=await browser.newPage();assert.equal((await page.goto(origin+'/admin')).status(),200);
  const result=await page.evaluate(async credentials=>{
   const call=async(path,body)=>{const r=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
   const login=await call('/api/auth/login',credentials);
   if(login.status!==200)return {login:login.status};
   try{const outbox=await call('/api/admin/email/outbox');return {login:login.status,outbox:outbox.status};}
   finally{await call('/api/auth/logout',{});}
  },{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});
  assert.equal(result.login,200);assert.equal(result.outbox,200);report.checks.push(label+' HTTPS, owner login and outbox');
 }finally{await browser.close();}
};
execFileSync('node',['scripts/check-isolation.mjs','--remote','--config',config],{stdio:'pipe'});
try{deploy(previous);report.rolledBack=true;await smoke('rolled-back version');}
catch{report.failure='ROLLBACK_CHECK_FAILED';process.exitCode=1;}
finally{
 try{deploy(current);report.latestRestored=true;await smoke('restored latest version');}
 catch{report.latestRestored=false;report.failure='LATEST_RESTORE_CHECK_FAILED';process.exitCode=1;}
 report.completedAt=new Date().toISOString();
 await writeFile('deployment/staging-code-rollback-verification-20261007.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}
