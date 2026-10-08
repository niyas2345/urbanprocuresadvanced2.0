import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=readFileSync('urbanprocures advanced/workers/wrangler.production.toml','utf8');
const provision=process.argv.includes('--provision');
const cutover=process.argv.includes('--cutover');
const values=Object.fromEntries([...config.matchAll(/^([A-Za-z_]+)\s*=\s*"([^"]+)"/gm)].map(m=>[m[1],m[2]]));
for(const [key,value] of Object.entries({name:'urbanprocures-advanced-production-20261007',account_id:'dcb411ece67dfdfb730635133ed31825',ENVIRONMENT:'advanced-production',PLATFORM_DOMAIN:'urbanprocures.com',database_name:'urbanprocures-advanced-production-20261007-db',bucket_name:'urbanprocures-advanced-production-20261007-documents',main:'index.ts',EMAIL_DELIVERY_ENABLED:cutover?'true':'false'}))assert.equal(values[key],value,key);
assert.equal(values.PUBLIC_APP_ORIGIN,cutover?'https://urbanprocures.com':'https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev');
assert.deepEqual([...config.matchAll(/^binding\s*=\s*"([^"]+)"/gm)].map(m=>m[1]).sort(),['AI','ASSETS','DB','DOCUMENTS_BUCKET']);
assert.ok(/^\[ai\]\s*\nbinding\s*=\s*"AI"\s*$/m.test(config),'Only the authorized document-processing AI binding');
assert.ok(!/^\s*\[env\./m.test(config),'No alternate environment bindings');
if(!cutover)assert.ok(!/^\s*(routes?|zone_id)\s*=/m.test(config),'Live cutover requires separate acceptance');
if(cutover){
 assert.deepEqual([...config.matchAll(/^pattern\s*=\s*"([^"]+)"/gm)].map(m=>m[1]).sort(),['urbanprocures.com/*','www.urbanprocures.com/*']);
 assert.equal([...config.matchAll(/^zone_id\s*=\s*"01e244afa455228e04c47e78174d76f1"/gm)].length,2);
 for(const file of ['production-preview-qa-results.json','production-preview-browser-results.json','production-preview-cleanup-20261007.json','production-owner-mail-verification-20261007.json','production-preview-verification-20261007.json'])assert.equal(JSON.parse(readFileSync('deployment/'+file)).status,'passed',file);
 assert.equal(JSON.parse(readFileSync('deployment/production-owner-mail-verification-20261007.json')).ownerInboxReceiptConfirmed,true);
 const clean=JSON.parse(readFileSync('deployment/production-preview-cleanup-20261007.json'));assert.equal(clean.immutableGuardsRestored,true);assert.equal(clean.r2FixtureObjectsRemoved,5);
}
const staging=JSON.parse(readFileSync('deployment/staging-resources.json'));
assert.notEqual(values.database_name,staging.stagingDatabaseName);assert.notEqual(values.bucket_name,staging.stagingBucket);
assert.notEqual(values.database_id,staging.stagingDatabaseId);
if(!provision){const record=JSON.parse(readFileSync('deployment/advanced-production-resources.json'));assert.equal(record.accountId,values.account_id);assert.equal(record.databaseId,values.database_id);assert.equal(record.databaseName,values.database_name);assert.equal(record.bucketName,values.bucket_name);assert.ok(record.createdNew===true);}
for(const file of ['deployment/staging-qa-results.json','deployment/staging-browser-results.json','deployment/staging-owner-outbox-verification-20261007.json','deployment/staging-remote-restore-verification-20261007.json'])assert.equal(JSON.parse(readFileSync(file)).status,'passed',file);
assert.equal(JSON.parse(readFileSync('deployment/staging-owner-outbox-verification-20261007.json')).ownerInboxReceiptConfirmed,true);
assert.equal(JSON.parse(readFileSync('deployment/staging-code-rollback-verification-20261007.json')).latestRestored,true);
console.log(cutover?'Advanced cutover configuration and acceptance guards passed.':'New Advanced production preview isolation passed; no domain cutover authorized by this check.');
