import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
const before=false;
const reportPrefix='onboarding-discovery-feature';
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
  for(const role of ['contractor','vendor']){await page.goto(origin+'/'+role);await page.getByRole('button',{name:role==='contractor'?'Register Organization':'Register as Vendor',exact:true}).click();const input=page.getByLabel('Trade license document',{exact:true});verify(await input.isVisible()&&await input.getAttribute('required')!==null,origin+' '+role+' required registration license field');verify((await input.getAttribute('accept')).includes('.pdf'),origin+' '+role+' PDF license supported');verify(!await page.getByRole('checkbox',{name:/List my company name/}).isChecked(),origin+' '+role+' public listing remains opt-in');}
  await page.close();
 }
 report.status='passed';
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;}
finally{await browser.close();report.checkedAt=new Date().toISOString();await writeFile('deployment/'+reportPrefix+'-live-release-20261008.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checksPassed:report.checks.length,failures:report.failures,businessRowsModified:false,testEmailsSent:false}));}
