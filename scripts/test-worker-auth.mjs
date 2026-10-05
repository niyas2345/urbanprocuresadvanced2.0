// Uses the actual workerd runtime with disposable local D1 and R2, no remote resources.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
const bundle = await build({ entryPoints: ['urbanprocures advanced/workers/index.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' });
const mf = new Miniflare(convertV4MiniflareOptions({ cf: false, modules: true, script: bundle.outputFiles[0].text, compatibilityDate: '2026-10-01', d1Databases: ['DB'], r2Buckets: ['DOCUMENTS_BUCKET'], bindings: { ENVIRONMENT: 'advanced-development', PLATFORM_DOMAIN: 'localhost' } }));
let checks = 0;
const verify = (condition) => { assert.ok(condition); checks++; };
const call = (path, body, token) => mf.dispatchFetch(`http://localhost${path}`, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
try {
  const db = await mf.getD1Database('DB');
  for (const file of ['0001_canonical_schema.sql','0002_terms_evidence.sql','0003_clickwrap_commercial.sql','0006_document_review.sql','0007_auth_security.sql']) {
    const sql = fs.readFileSync(`urbanprocures advanced/database/migrations/${file}`, 'utf8').replace(/--[^\n]*/g, '').replace(/\s*\n\s*/g, ' ');
    await db.exec(sql);
  }
  verify((await call('/api/terms?role=contractor')).status === 503);
  verify((await call('/api/auth/register-contractor', {})).status === 400);
  verify((await call('/api/auth/register-contractor', { acceptTerms: true })).status === 503);
  const now = new Date().toISOString();
  await db.prepare('INSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind('fixture-admin','fixture-admin@example.invalid','not-a-login','fixture','admin','active',now,now).run();
  // Test-only Terms are never published to a remote or retained production database.
  for (const role of ['contractor','vendor']) await db.prepare('INSERT INTO terms_versions (id,role,terms_type,terms_version,content_text,content_sha256,status,approved_by,published_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(`fixture-${role}`,role,role,'test-only-v1','TEST FIXTURE: not approved production Terms','fixture-hash','published','fixture-admin',now,now).run();
  const details = { email:'contractor@example.invalid', password:'Local-fixture-password-24!',companyName:'Fixture Company',tradeLicenseNumber:'FIXTURE-ONLY',emirate:'Dubai',address:'Fixture address',contactPerson:'Fixture Contact',contactPhone:'+971500000000',acceptTerms:true,termsVersionId:'fixture-contractor' };
  verify((await call('/api/auth/register-contractor', {...details,acceptTerms:false})).status === 400);
  verify((await call('/api/auth/register-contractor', {...details,termsVersionId:'fixture-vendor'})).status === 400);
  verify((await call('/api/auth/register-contractor', {...details,role:'admin'})).status === 403);
  let response = await call('/api/auth/register-contractor', details);
  verify(response.status === 201);
  const account = await response.json(); const token = account.token;
  verify(account.user.role === 'contractor');
  const profile = await db.prepare('SELECT verified_at FROM contractors WHERE user_id=?').bind(account.user.id).first(); verify(profile.verified_at === null);
  verify((await db.prepare('SELECT count(*) AS n FROM terms_acceptance_evidence WHERE user_id=?').bind(account.user.id).first()).n === 1);
  verify(!(await db.prepare('SELECT token FROM auth_sessions WHERE token=?').bind(token).first()));
  verify((await (await call('/api/auth/me',null,token)).json()).authenticated === true);
  verify((await call('/api/documents/fixture/view',null,token)).status === 404);
  verify((await call('/api/auth/login', {email:details.email,password:'wrong-password'})).status === 401);
  verify((await call('/api/auth/login', {email:details.email,password:details.password})).status === 200);
  await db.prepare("UPDATE users SET status='suspended' WHERE id=?").bind(account.user.id).run();
  verify((await (await call('/api/auth/me',null,token)).json()).authenticated === false);
  verify((await call('/api/auth/login', {email:details.email,password:details.password})).status === 401);
  await db.prepare("UPDATE users SET status='active' WHERE id=?").bind(account.user.id).run();
  await call('/api/auth/logout',{},token);
  verify((await (await call('/api/auth/me',null,token)).json()).authenticated === false);
  const vendorResponse = await call('/api/auth/register-vendor', {...details,email:'vendor@example.invalid',termsVersionId:'fixture-vendor',tradeCategories:['Joinery'],emiratesServiced:['Dubai']});
  verify(vendorResponse.status === 201); const vendor = await vendorResponse.json();
  verify((await db.prepare('SELECT verification_status FROM vendors WHERE user_id=?').bind(vendor.user.id).first()).verification_status === 'pending');
  await db.prepare("UPDATE terms_versions SET status='retired' WHERE id='fixture-vendor'").run();
  verify((await (await call('/api/auth/me',null,vendor.token)).json()).termsAccepted === false);
  await db.prepare('UPDATE auth_sessions SET expires_at=? WHERE user_id=?').bind('2000-01-01T00:00:00.000Z',vendor.user.id).run();
  verify((await (await call('/api/auth/me',null,vendor.token)).json()).authenticated === false);
  const bucket = await mf.getR2Bucket('DOCUMENTS_BUCKET');
  await bucket.put('private/fixture.txt','private actual R2 fixture');
  verify(await (await bucket.get('private/fixture.txt')).text() === 'private actual R2 fixture');
  console.log(JSON.stringify({ genuineLocalWorkerAuthChecksPassed:checks, remoteResourcesTouched:false }));
} finally { await mf.dispose(); }
