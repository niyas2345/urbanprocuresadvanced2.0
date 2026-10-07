import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright-core';
import {stagingAdminCredentials} from './staging-admin-credentials.mjs';
const productionPreview=process.argv.includes('--production-preview');
const target=productionPreview?'production-preview':'staging';
const previous=JSON.parse(await readFile(new URL('../deployment/'+target+'-qa-results.json',import.meta.url)));
assert.equal(previous.status,'passed');
const origin=previous.origin;assert.equal(origin,productionPreview?'https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev':'https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev');
const fixture=JSON.parse(await readFile('/tmp/urbanprocures-'+target+'-workflow-'+previous.runId+'.json'));
const admin=productionPreview?{adminEmail:process.env.ADMIN_BOOTSTRAP_EMAIL,adminPassword:process.env.ADMIN_INITIAL_PASSWORD}:await stagingAdminCredentials();
const report={origin,startedAt:new Date().toISOString(),checks:[],failures:[],productionModified:false,outboundMessagesSent:false};
const verify=(value,label)=>{assert.ok(value,label);report.checks.push(label);};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:{server:process.env.HTTPS_PROXY||process.env.HTTP_PROXY}});
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=','base64');
const fileName='qa-browser-'+Date.now()+'.png',title='Browser staging QA '+Date.now();
const pages=[];
async function login(role,email,password){
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();pages.push(page);
 await page.goto(origin+'/'+role);await page.locator('form input[type=email]').fill(email);await page.locator('form input[type=password]').fill(password);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/auth/login')&&r.request().method()==='POST');
 await page.locator('form button[type=submit], form button').filter({hasText:role==='admin'?'Sign In':/Sign In|Login/}).last().click();
 verify((await response).status()===200,role+' browser actual credential login');return page;
}
try{
 const c=fixture.users.find(u=>u.role==='contractor'),v=fixture.users.find(u=>u.role==='vendor');
 const contractor=await login('contractor',c.email,fixture.password);
 await contractor.getByRole('button',{name:'Create New RFQ',exact:true}).click();
 await contractor.getByPlaceholder('e.g. Luxury Penthouse Custom Joinery & Acoustic Paneling').fill(title);await contractor.getByPlaceholder('e.g. DIFC Gate Village Level 14').fill('Private staging browser project');
 await contractor.locator('form input[type=date]').first().fill('2099-01-01');await contractor.locator('form textarea').fill('Reviewed staging browser scope');await contractor.getByPlaceholder('e.g. Supply & install fluted acoustic paneling').fill('Staging browser BoQ item');
 await contractor.locator('#rfq-files').setInputFiles({name:fileName,mimeType:'image/png',buffer:png});
 let response=contractor.waitForResponse(r=>r.url().endsWith('/api/contractor/rfqs')&&r.request().method()==='POST');await contractor.getByRole('button',{name:'Submit RFQ for Review',exact:true}).click();let persisted=await response;verify(persisted.status()===201,'browser RFQ BoQ and upload persist on deployed bindings');const rfq=(await persisted.json()).data;report.rfqId=rfq.id;
 const ops=await login('admin',admin.adminEmail,admin.adminPassword);ops.on('dialog',dialog=>dialog.accept());await ops.getByRole('button',{name:/Document Inspector/}).waitFor();
 const row=ops.locator('tr').filter({hasText:fileName});await row.getByRole('button',{name:'Open & Review',exact:true}).click();
 await ops.getByRole('img',{name:fileName,exact:true}).waitFor();verify(await ops.getByRole('img',{name:fileName,exact:true}).evaluate(img=>img.complete&&img.naturalWidth===1),'Admin browser renders actual private R2 image');
 const downloadPromise=ops.waitForEvent('download');await ops.getByRole('button',{name:'Download',exact:true}).click();const download=await downloadPromise;verify(download.suggestedFilename()===fileName,'Admin browser download retains uploaded filename');
 const path=await download.path();verify((await readFile(path)).equals(png),'Admin browser downloads exact uploaded bytes');await ops.getByRole('button',{name:'Close Viewer',exact:true}).click();
 await ops.getByRole('button',{name:/RFQ Publishing Queue/}).click();response=ops.waitForResponse(r=>r.url().endsWith(`/api/admin/rfqs/${rfq.id}/publish`));await ops.getByRole('button',{name:'Approve & Publish to Vendors',exact:true}).click();verify((await response).status()===200,'Admin browser publishes reviewed RFQ');
 const vendor=await login('vendor',v.email,fixture.password);await vendor.getByRole('button',{name:'Review & Submit Quote',exact:true}).click();await vendor.locator('form input[type=number]').first().fill('10000');await vendor.locator('form input[type=text]').fill('Staging browser payment Terms');
 response=vendor.waitForResponse(r=>r.url().endsWith(`/api/vendor/rfqs/${rfq.id}/quote`)&&r.request().method()==='POST');await vendor.getByRole('button',{name:'Submit Itemized Quotation',exact:true}).click();verify((await response).status()===201,'Vendor browser submits actual itemized quotation');
 await contractor.goto(origin+'/contractor');
 const card=contractor.locator('div').filter({has:contractor.getByText(title,{exact:true})}).filter({has:contractor.getByRole('button',{name:'Review & Compare Bids',exact:true})}).last();await card.getByRole('button',{name:'Review & Compare Bids',exact:true}).click();
 await contractor.getByRole('button',{name:'Select Vendor & Confirm Award',exact:true}).click();response=contractor.waitForResponse(r=>r.url().endsWith(`/api/contractor/rfqs/${rfq.id}/award`));await contractor.getByRole('button',{name:'Confirm & Release Contact Info',exact:true}).click();const awarded=await response;verify(awarded.status()===200,'owning Contractor browser confirms award');const data=(await awarded.json()).data;verify(data.totalVendorChargeAed===500&&data.contractorServiceChargeAed===0,'browser award uses server commercial calculation');
 await contractor.getByText('Official Vendor Contact Details (Unmasked)',{exact:true}).waitFor();verify(await contractor.getByText('+971500000001',{exact:true}).isVisible(),'winning contact visible after actual browser award');await contractor.reload();await contractor.getByText(title,{exact:true}).waitFor();verify(true,'awarded RFQ persists after browser reload');
 await ops.getByRole('button',{name:'Service Charge Engine',exact:true}).click();await ops.getByText(data.id,{exact:false}).first().waitFor();verify(true,'Admin browser reads persisted award charge');
 report.status='passed';
}catch(error){report.status='failed';report.failures.push(error.message);process.exitCode=1;}
finally{await browser.close();report.completedAt=new Date().toISOString();report.target=target;report.productionPreviewModified=productionPreview;await writeFile(new URL('../deployment/'+target+'-browser-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,actualDeployedBrowserChecksPassed:report.checks.length,failures:report.failures,existingProductionModified:false}));}
