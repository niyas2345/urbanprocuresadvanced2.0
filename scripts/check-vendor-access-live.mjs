import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
const before=false;
const reportPrefix='vendor-access-feature';
if(!/^[a-z-]+$/.test(reportPrefix))throw Error('Invalid report prefix');
const report={phase:before?'before-release':'after-release',checks:[],failures:[],businessRowsModified:false,testEmailsSent:false};
const verify=(value,label)=>{assert.ok(value,label);report.checks.push(label);};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
try{
 for(const origin of ['https://urbanprocures.com','https://www.urbanprocures.com']){
  const page=await browser.newPage();await page.goto(origin);
  await page.getByRole('heading',{name:'Published RFQ opportunities',exact:true}).waitFor();verify(await page.getByRole('heading',{name:'Verified business community',exact:true}).isVisible(),origin+' public directory section');
  const discovery=await page.evaluate(async()=>{const r=await fetch('/api/public/discovery');return {status:r.status,body:await r.json()};});verify(discovery.status===200&&discovery.body.success,origin+' live public discovery API');
  const d=discovery.body.data;verify(Array.isArray(d.rfqs)&&Array.isArray(d.contractors)&&Array.isArray(d.vendors),origin+' discovery DTO sections');
  verify(!JSON.stringify(d).includes('r2ObjectKey')&&!JSON.stringify(d).includes('tradeLicenseNumber')&&!JSON.stringify(d).includes('contactPhone'),origin+' public discovery excludes private fields');
  for(const role of ['contractor','vendor']){await page.goto(origin+'/'+role);await page.getByRole('button',{name:role==='contractor'?'Register Organization':'Register as Vendor',exact:true}).click();const input=page.getByLabel('Trade license document',{exact:true});verify(await input.isVisible()&&await input.getAttribute('required')!==null,origin+' '+role+' required registration license field');if(role==='vendor')for(const category of ['Technical Services LLC','Maintenance Company','Painting Contracting','Waterproofing & Insulation','Swimming Pool Maintenance','Civil Works','Pumping Works','MEP Works'])verify(await page.locator('option').filter({hasText:category}).count()>0,origin+' category '+category);verify((await input.getAttribute('accept')).includes('.pdf'),origin+' '+role+' PDF license supported');verify(!await page.getByRole('checkbox',{name:/List my company name/}).isChecked(),origin+' '+role+' public listing remains opt-in');}
  await page.close();
 }
 const admin=await browser.newPage();await admin.goto('https://urbanprocures.com/admin');await admin.locator('form input[type=email]').fill(process.env.ADMIN_BOOTSTRAP_EMAIL);await admin.locator('form input[type=password]').fill(process.env.ADMIN_INITIAL_PASSWORD);const logged=admin.waitForResponse(r=>r.url().endsWith('/api/auth/login'));await admin.locator('form button').filter({hasText:/Sign In|Login/}).last().click();verify((await logged).status()===200,'Live owner Admin browser login');
 const license=admin.locator('tr').filter({hasText:/trade_license/i}).first();await license.getByRole('button',{name:'Open & Review',exact:true}).click();await admin.locator('iframe').waitFor();verify((await admin.locator('iframe').getAttribute('src')).startsWith('blob:'),'Existing live license private preview loads');verify(await admin.getByRole('button',{name:/^(Approve Vendor|Vendor approved|Approve Contractor|Contractor approved)$/}).count()>0,'Existing live license shows account approval action');verify(await admin.getByRole('button',{name:'Copy Reference',exact:true}).isVisible(),'Live viewer uses correct Copy Reference label');await admin.getByRole('button',{name:'Close Viewer',exact:true}).click();await admin.evaluate(()=>fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}));
 report.status='passed';
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;}
finally{await browser.close();report.checkedAt=new Date().toISOString();await writeFile('deployment/'+reportPrefix+'-live-release-20261008.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checksPassed:report.checks.length,failures:report.failures,businessRowsModified:false,testEmailsSent:false}));}
