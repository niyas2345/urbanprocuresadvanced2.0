import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
const before=process.argv.includes('--before-release');
const reportPrefix=process.argv.includes('--report-prefix')?process.argv[process.argv.indexOf('--report-prefix')+1]:'rfq-improvements';
if(!/^[a-z-]+$/.test(reportPrefix))throw Error('Invalid report prefix');
const report={phase:before?'before-release':'after-release',checks:[],failures:[],businessRowsModified:false,testEmailsSent:false};
const verify=(value,label)=>{assert.ok(value,label);report.checks.push(label);};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
try{
 const html=await readFile('dist/index.html','utf8'),asset=html.match(/src="([^"]+\.js)"/)[1],expectedHash=createHash('sha256').update(await readFile('dist'+asset)).digest('hex');
 for(const origin of ['https://urbanprocures.com','https://www.urbanprocures.com']){
  const page=await browser.newPage();const res=await page.goto(origin,{waitUntil:'networkidle'});verify(res.status()===200,origin+' HTTPS homepage');verify((await page.locator('h1').textContent()).includes('The right people'),origin+' approved homepage');
  if(!before){const delivered=await page.evaluate(async asset=>{const r=await fetch(asset);const b=await r.arrayBuffer();return {status:r.status,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),b=>b.toString(16).padStart(2,'0')).join('')};},asset);verify(delivered.status===200&&delivered.sha256===expectedHash,origin+' exact release frontend artifact');}
  const checks=await page.evaluate(async()=>{const rows=[];for(const role of ['vendor','contractor','get_a_quote']){const r=await fetch('/api/terms?role='+role);const d=await r.json();rows.push({status:r.status,hasTerms:!!d.data?.id});}for(const path of ['/test-suite','/docs']){const r=await fetch(path);rows.push({status:r.status});}return rows;});verify(checks.slice(0,3).every(r=>r.status===200&&r.hasTerms),origin+' three published Terms endpoints');verify(checks.slice(3).every(r=>r.status===404),origin+' developer pages remain unavailable');
  if(!before){await page.goto(origin+'/get-a-quote');const accept=await page.locator('#quote-file').getAttribute('accept');verify(['.pdf','.xls','.xlsx','.dwg','.dxf','.png','.jpg'].every(x=>accept.split(',').includes(x)),origin+' live public document formats');}
  await page.close();
 }
 const page=await browser.newPage();await page.goto('https://urbanprocures.com/admin');
 const check=await page.evaluate(async({email,password})=>{
  const response=await fetch('/api/auth/login',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const auth=await response.json();if(response.status!==200||auth.user?.role!=='admin')return {loginStatus:response.status,admin:false};
  const results=[];try{for(const resource of ['rfqs','awards','service-charges','documents','users']){const r=await fetch('/api/admin/'+resource,{credentials:'omit',headers:{Authorization:'Bearer '+auth.token}});const d=await r.json();results.push({resource,status:r.status,success:d.success===true});}}
  finally{await fetch('/api/auth/logout',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:'{}'});}
  return {loginStatus:response.status,admin:true,results};
 },{email:process.env.ADMIN_BOOTSTRAP_EMAIL,password:process.env.ADMIN_INITIAL_PASSWORD});
 verify(check.admin&&check.loginStatus===200,'Existing production owner password authenticates');verify(check.results.every(r=>r.status===200&&r.success),'Live Admin reads existing business records');report.status='passed';
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;}
finally{await browser.close();report.checkedAt=new Date().toISOString();await writeFile('deployment/'+reportPrefix+'-live-'+(before?'preflight':'release')+'-20261008.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase:report.phase,status:report.status,checksPassed:report.checks.length,failures:report.failures,businessRowsModified:false,testEmailsSent:false}));}
