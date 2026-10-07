import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkIsolation } from './check-isolation.mjs';
import { isIsolatedAdvancedRequest } from '../urbanprocures advanced/workers/isolation.ts';
import worker from '../urbanprocures advanced/workers/index.ts';
import { runAllUrbanProcuresTests } from '../urbanprocures advanced/tests/runTests.ts';

let checks = 0;
const verify = (condition) => { assert.ok(condition); checks++; };
const cfg = fs.readFileSync(new URL('../urbanprocures%20advanced/workers/wrangler.toml', import.meta.url), 'utf8');
verify(checkIsolation(cfg).length === 0);
verify(checkIsolation(cfg.replace('PLATFORM_DOMAIN = "localhost"', 'PLATFORM_DOMAIN = "urbanprocures.com"')).length > 0);
verify(checkIsolation(cfg.replace('urbanprocures-advanced-db', 'urban-procure-db')).length > 0);
verify(checkIsolation(cfg + '\nroute = "*.urbanprocures.com/*"\n').length > 0);
verify(checkIsolation(cfg.replace('workers_dev = false', 'workers_dev = true')).length > 0);
for (const host of ['urbanprocures.com', 'www.urbanprocures.com', 'admin.urbanprocures.com', 'urbanprocures.com.']) {
  verify(!isIsolatedAdvancedRequest(new Request(`https://${host}/api`), 'advanced-staging', 'advanced.example.test'));
}
verify(!isIsolatedAdvancedRequest(new Request('http://localhost/api'), 'production', 'localhost'));
verify(!isIsolatedAdvancedRequest(new Request('http://localhost/api'), 'advanced-development', 'www.urbanprocures.com'));
verify(isIsolatedAdvancedRequest(new Request('http://localhost/api'), 'advanced-development', 'localhost'));
for(const host of ['urbanprocures.com','www.urbanprocures.com','urbanprocures-advanced-production-20261007.abdeenniyas23.workers.dev']){
 verify(isIsolatedAdvancedRequest(new Request(`https://${host}/api`),'advanced-production','urbanprocures.com'));
 verify(!isIsolatedAdvancedRequest(new Request(`https://${host}/api`),'advanced-production','localhost'));
}
for(const host of ['admin.urbanprocures.com','urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev','example.com'])verify(!isIsolatedAdvancedRequest(new Request(`https://${host}/api`),'advanced-production','urbanprocures.com'));
verify(!isIsolatedAdvancedRequest(new Request('http://urbanprocures.com/api'),'advanced-production','urbanprocures.com'));

// Focused Worker boundary tests with explicit D1/R2 doubles, NOT Cloudflare integration certification.
let actor = null; let r2Reads = 0;
const env = {
  ENVIRONMENT: 'advanced-development', PLATFORM_DOMAIN: 'localhost',
  DB: { prepare(sql) { return { bind() { return this; }, async run(){return {meta:{changes:1}};}, async first() {
    if (sql.includes('auth_sessions')) return actor;
    return { r2_object_key: 'private/document.pdf', file_type: 'application/pdf', file_name: 'document.pdf' };
  } }; } },
  DOCUMENTS_BUCKET: { async get() { r2Reads++; return { body: '%PDF-1.7 test fixture' }; } },
};
const request = (route, token) => new Request(`http://localhost${route}`, token ? { headers: { Authorization: `Bearer ${'a'.repeat(64)}` } } : {});
verify((await worker.fetch(request('/api/auth/login'), env, {})).status === 404);
verify((await worker.fetch(request('/api/documents/doc/view'), env, {})).status === 401);
actor = { role: 'vendor', status: 'active' };
verify((await worker.fetch(request('/api/documents/doc/view', 'test'), env, {})).status === 403);
actor = { role: 'admin', status: 'suspended' };
verify((await worker.fetch(request('/api/documents/doc/view', 'test'), env, {})).status === 401);
verify(r2Reads === 0);
actor = { role: 'admin', status: 'active' };
verify((await worker.fetch(request('/api/documents/doc/view', 'test'), env, {})).status === 200);
verify(r2Reads === 1);
verify((await worker.fetch(new Request('https://urbanprocures.com/api/documents/doc/view'), env, {})).status === 503);
const business = runAllUrbanProcuresTests();
for (const result of business) assert.ok(result.passed, `${result.suite}: ${result.name}: ${result.message}`);
console.log(JSON.stringify({ boundaryChecksPassed: checks, suppliedBusinessUnitTestsPassed: business.length, genuineCloudflareIntegrationTestsRun: 0 }, null, 2));
