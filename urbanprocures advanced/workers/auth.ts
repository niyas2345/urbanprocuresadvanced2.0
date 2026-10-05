// Worker-native authentication. Published owner-approved Terms are a prerequisite.
import {rateAllowed,recoveryRoute} from './recovery.ts';
import type { Env } from './index.ts';
import { publishedTerms, acceptanceFor, organizationFor, evidenceStatement, auditStatement } from './terms.ts';
import type { Actor, Terms } from './terms.ts';

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
export const tokenDigest = async (token: string) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)));
const sessionCookie=(request:Request,token:string,maxAge=28800)=>`${new URL(request.url).protocol==='https:'?'__Host-up_session':'up_session'}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256));
}
async function passwordMatches(password: string, salt: string, expected: string) {
  const actual = await passwordHash(password, salt);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}
export async function actorFor(request: Request, env: Env): Promise<Actor | null> {
  const token = request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1]??request.headers.get('Cookie')?.match(/(?:^|;\s*)(?:__Host-up_session|up_session)=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  const actor=await env.DB.prepare("SELECT u.id,u.email,u.role,u.status FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.status='active'")
    .bind(await tokenDigest(token), new Date().toISOString()).first<Actor>();
  return actor?.status==='active'?actor:null;
}
export const currentAcceptance = acceptanceFor;
function profileDto(p:any) {
  if(!p)return null;
  return {...p,userId:p.user_id,organizationId:p.organization_id,companyName:p.company_name,tradeLicenseNumber:p.trade_license_number,contactPerson:p.contact_person,contactPhone:p.contact_phone,verificationStatus:p.verification_status,tradeCategories:p.trade_categories?JSON.parse(p.trade_categories):undefined,emiratesServiced:p.emirates_serviced?JSON.parse(p.emirates_serviced):undefined};
}
async function session(env: Env, actor: Actor) {
  const token = randomToken(); const now = new Date().toISOString();
  await env.DB.prepare('INSERT INTO auth_sessions (token,user_id,role,expires_at,created_at) VALUES (?,?,?,?,?)')
    .bind(await tokenDigest(token), actor.id, actor.role, new Date(Date.now() + 8 * 3600000).toISOString(), now).run();
  return token;
}
function text(body: Record<string, unknown>, name: string, max = 250) {
  const value = body[name];
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Invalid ${name}`);
  return value.trim();
}
async function bodyFor(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();
  if (raw.length > 20000) throw new Error('Request too large');
  const body = JSON.parse(raw);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request');
  return body;
}
export async function authRoute(request: Request, env: Env): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/auth/') && path !== '/api/terms/accept') return null;
  if (path === '/api/auth/me' && request.method === 'GET') {
    const actor = await actorFor(request, env);
    if (!actor) return json({ authenticated: false });
    const contractor = actor.role === 'contractor' ? await env.DB.prepare('SELECT * FROM contractors WHERE user_id=?').bind(actor.id).first() : null;
    const vendor = actor.role === 'vendor' ? await env.DB.prepare('SELECT * FROM vendors WHERE user_id=?').bind(actor.id).first() : null;
    return json({ authenticated: true, user: actor, contractor:profileDto(contractor), vendor:profileDto(vendor), termsAccepted: ['contractor','vendor'].includes(actor.role) ? !!await currentAcceptance(env, actor) : false });
  }
  if (path === '/api/auth/logout' && request.method === 'POST') {
    const token = request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1]??request.headers.get('Cookie')?.match(/(?:^|;\s*)(?:__Host-up_session|up_session)=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (token) await env.DB.prepare('DELETE FROM auth_sessions WHERE token=?').bind(await tokenDigest(token)).run();
    return new Response(JSON.stringify({success:true}),{headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(request,'',0),'Cache-Control':'no-store'}});
  }
  if (request.method !== 'POST') return null;
  const recovery=await recoveryRoute(request,env);if(recovery)return recovery;
  if(path==='/api/auth/login'||path.startsWith('/api/auth/register-')){if(!await rateAllowed(env,'auth:'+request.headers.get('CF-Connecting-IP'),30))return json({success:false,error:'TRY_AGAIN_LATER'},429);}
  try {
    const body = await bodyFor(request);
    if (path === '/api/auth/login') {
      const email = text(body, 'email').toLowerCase(); const password = text(body, 'password', 128);
      if(!await rateAllowed(env,'login-account:'+email,10,300000))return json({success:false,error:'TRY_AGAIN_LATER'},429);
      const user = await env.DB.prepare('SELECT id,email,role,status,password_hash,salt FROM users WHERE email=?').bind(email).first<Actor & { password_hash: string; salt: string }>();
      const valid = await passwordMatches(password, user?.salt || 'invalid-account-salt', user?.password_hash || '0'.repeat(64));
      if (!user || !valid || user.status !== 'active') return json({ success: false, error: 'Invalid credentials or unavailable account' }, 401);
      const actor = { id: user.id, email: user.email, role: user.role, status: user.status };
      const token=await session(env,actor);return new Response(JSON.stringify({success:true,token,user:actor}),{headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(request,token),'Cache-Control':'no-store'}});
    }
    if (path === '/api/terms/accept') {
      const actor = await actorFor(request, env);
      if (!actor) return json({ success: false, error: 'Authentication required' }, 401);
      if (!['contractor','vendor'].includes(actor.role)) return json({ success: false, error: 'Invalid role' }, 403);
      const terms = await publishedTerms(env, actor.role);
      if (!terms) return json({ success: false, error: 'Owner-approved Terms unavailable' }, 503);
      if (body.acceptTerms !== true || body.termsVersionId !== terms.id) return json({ success: false, error: 'Explicit acceptance of current Terms required' }, 400);
      const table = actor.role === 'vendor' ? 'vendors' : 'contractors';
      const profile = await env.DB.prepare(`SELECT organization_id FROM ${table} WHERE user_id=?`).bind(actor.id).first<{ organization_id: string }>();
      if (!profile?.organization_id) return json({ success: false, error: 'Organization unavailable' }, 403);
      if ((body.userId !== undefined && body.userId !== actor.id) || (body.organizationId !== undefined && body.organizationId !== profile.organization_id)) return json({success:false,error:'IDENTITY_SUBSTITUTION_REJECTED'},403);
      if (await env.DB.prepare('SELECT acceptance_id FROM terms_acceptance_evidence WHERE user_id=? AND terms_version_id=?').bind(actor.id,terms.id).first()) return json({ success: true });
      const reference=crypto.randomUUID();
      await env.DB.batch([evidenceStatement(env,request,actor,profile.organization_id,terms,reference),auditStatement(env,actor,actor.role==='vendor'?'VENDOR_TERMS_ACCEPTED':'CONTRACTOR_TERMS_ACCEPTED',terms,profile.organization_id,reference)]);
      return json({ success: true });
    }
    const role = path === '/api/auth/register-contractor' ? 'contractor' : path === '/api/auth/register-vendor' ? 'vendor' : null;
    if (!role) return null;
    if(body.userId !== undefined || body.organizationId !== undefined || (body.role !== undefined && body.role !== role)) return json({success:false,error:'IDENTITY_SUBSTITUTION_REJECTED'},403);
    if (body.acceptTerms !== true) return json({ success: false, error: 'Explicit Terms acceptance required' }, 400);
    const terms = await publishedTerms(env, role);
    if (!terms) return json({ success: false, error: 'Owner-approved Terms unavailable' }, 503);
    if (body.termsVersionId !== terms.id) return json({ success: false, error: 'Current role-specific Terms required' }, 400);
    const email = text(body, 'email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    const password = text(body, 'password', 128); if (password.length < 12) throw new Error('Password must have at least 12 characters');
    const company = text(body, 'companyName'), license = text(body, 'tradeLicenseNumber'), contact = text(body, 'contactPerson'), phone = text(body, 'contactPhone');
    const emirate = text(body, 'emirate'), address = text(body, 'address', 1000);
    if (await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first()) return json({ success: false, error: 'Registration unavailable for this email' }, 409);
    const now = new Date().toISOString(), id = crypto.randomUUID(), org = crypto.randomUUID(), profile = crypto.randomUUID(), salt = randomToken();
    const actor = { id, email, role, status: 'active' };
    const statements = [
      env.DB.prepare('INSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,email,await passwordHash(password,salt),salt,role,'active',now,now),
      env.DB.prepare('INSERT INTO organizations (id,name,org_type,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(org,company,role,license,emirate,address,contact,phone,now)
    ];
    if (role === 'contractor') statements.push(env.DB.prepare('INSERT INTO contractors (id,user_id,organization_id,company_name,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(profile,id,org,company,license,emirate,address,contact,phone,now));
    else {
      const categories = body.tradeCategories, emirates = body.emiratesServiced;
      if (![categories,emirates].every(a => Array.isArray(a) && a.length > 0 && a.length <= 30 && a.every(v => typeof v === 'string' && v.length > 0 && v.length <= 100))) throw new Error('Trade categories and serviced emirates are required');
      statements.push(env.DB.prepare('INSERT INTO vendors (id,user_id,organization_id,company_name,trade_license_number,trade_categories,emirates_serviced,verification_status,contact_person,contact_phone,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(profile,id,org,company,license,JSON.stringify(categories),JSON.stringify(emirates),'pending',contact,phone,now));
    }
    const acceptanceAudit=crypto.randomUUID();
    statements.push(evidenceStatement(env,request,actor,org,terms,acceptanceAudit));
    statements.push(auditStatement(env,actor,role==='vendor'?'VENDOR_TERMS_ACCEPTED':'CONTRACTOR_TERMS_ACCEPTED',terms,org,acceptanceAudit));
    statements.push(env.DB.prepare('INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,ip_address,timestamp) VALUES (?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,role,'ACCOUNT_REGISTERED','user',id,JSON.stringify({termsVersionId:terms.id}),request.headers.get('CF-Connecting-IP'),now));
    await env.DB.batch(statements);
    const token=await session(env,actor);
    const account=await env.DB.prepare(`SELECT * FROM ${role==='vendor'?'vendors':'contractors'} WHERE user_id=?`).bind(id).first();
    return new Response(JSON.stringify({success:true,token,user:actor,[role]:profileDto(account),termsAccepted:true}),{status:201,headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(request,token),'Cache-Control':'no-store'}});
  } catch {
    return json({ success: false, error: 'Invalid request or operation could not be completed' }, 400);
  }
}
