import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=readFileSync('urbanprocures advanced/workers/wrangler.production.toml','utf8');
const provision=process.argv.includes('--provision');
const values=Object.fromEntries([...config.matchAll(/^([A-Za-z_]+)\s*=\s*"([^"]+)"/gm)].map(m=>[m[1],m[2]]));
for(const [key,value] of Object.entries({name:'urbanprocures-advanced-production-20261007',account_id:'dcb411ece67dfdfb730635133ed31825',ENVIRONMENT:'advanced-production',PLATFORM_DOMAIN:'urbanprocures.com',database_name:'urbanprocures-advanced-production-20261007-db',bucket_name:'urbanprocures-advanced-production-20261007-documents',main:'index.ts',EMAIL_DELIVERY_ENABLED:'false'}))assert.equal(values[key],value,key);
assert.equal(values.PUBLIC_APP_ORIGIN,'https://urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev');
assert.deepEqual([...config.matchAll(/^binding\s*=\s*"([^"]+)"/gm)].map(m=>m[1]).sort(),['ASSETS','DB','DOCUMENTS_BUCKET']);
assert.ok(!/^\s*(routes?|zone_id)\s*=|^\s*\[env\./m.test(config),'Live cutover requires separate acceptance');
const staging=JSON.parse(readFileSync('deployment/staging-resources.json'));
assert.notEqual(values.database_name,staging.stagingDatabaseName);assert.notEqual(values.bucket_name,staging.stagingBucket);
assert.notEqual(values.database_id,staging.stagingDatabaseId);
if(!provision){const record=JSON.parse(readFileSync('deployment/advanced-production-resources.json'));assert.equal(record.accountId,values.account_id);assert.equal(record.databaseId,values.database_id);assert.equal(record.databaseName,values.database_name);assert.equal(record.bucketName,values.bucket_name);assert.ok(record.createdNew===true);}
for(const file of ['deployment/staging-qa-results.json','deployment/staging-browser-results.json','deployment/staging-owner-outbox-verification-20261007.json','deployment/staging-remote-restore-verification-20261007.json'])assert.equal(JSON.parse(readFileSync(file)).status,'passed',file);
assert.equal(JSON.parse(readFileSync('deployment/staging-owner-outbox-verification-20261007.json')).ownerInboxReceiptConfirmed,true);
assert.equal(JSON.parse(readFileSync('deployment/staging-code-rollback-verification-20261007.json')).latestRestored,true);
console.log('New Advanced production preview isolation passed; no domain cutover authorized by this check.');
