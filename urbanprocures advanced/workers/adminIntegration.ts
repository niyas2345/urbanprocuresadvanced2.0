import type {Env} from './index.ts';
import type {Actor} from './terms.ts';

// Dedicated, revocable Admin App grants. Ordinary website sessions stay at eight hours.
const idleMs=30*86400000, absoluteMs=90*86400000;
const reads=new Set(['public-quotes','rfqs','users','contractors','vendors','documents','site-visits','awards','quotations','service-charges','audit-logs','invitations','revision','notifications','email/outbox','quotations/history','documents/history','rfqs/history','terms/acceptances']);
const control='/api/auth/admin-integration';
const digest=async (s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
const bearer=(r:Request)=>r.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
const enabled=(env:Env)=>env.ADMIN_INTEGRATION_GRANTS_ENABLED==='true'&&!!env.ADMIN_INTEGRATION_OWNER_ID;
export function integrationPathAllowed(request:Request){
 const p=new URL(request.url).pathname,m=request.method;
 if(m==='GET'&&p==='/api/auth/me')return true;
 if(m==='POST'&&[control+'/refresh',control+'/revoke'].includes(p))return true;
 if(m==='GET'&&p.startsWith('/api/admin/'))return reads.has(p.slice(11));
 if(m==='POST')return /^\/api\/admin\/(rfqs\/[a-zA-Z0-9_-]+\/publish|documents\/[a-zA-Z0-9_-]+\/release)$/.test(p);
 return m==='PATCH'&&/^\/api\/admin\/(vendors\/[a-zA-Z0-9_-]+\/verification|contractors\/[a-zA-Z0-9_-]+\/verification|users\/[a-zA-Z0-9_-]+\/status|public-quotes\/[a-zA-Z0-9_-]+)$/.test(p);
}
export async function integrationActor(request:Request,env:Env):Promise<Actor|null>{
 if(!enabled(env)||!integrationPathAllowed(request))return null;
 const t=bearer(request);if(!t)return null;
 const now=new Date().toISOString();
 return env.DB.prepare("SELECT u.id,u.email,u.role,u.status FROM admin_integration_grants g JOIN users u ON u.id=g.owner_user_id WHERE g.token_digest=? AND g.owner_user_id=? AND g.revoked_at IS NULL AND g.expires_at>? AND g.absolute_expires_at>? AND u.role='admin' AND u.status='active'").bind(await digest(t),env.ADMIN_INTEGRATION_OWNER_ID,now,now).first<Actor>();
}
export async function adminIntegrationRoute(request:Request,env:Env,websiteActor:Actor|null):Promise<Response|null>{
 const path=new URL(request.url).pathname;if(!path.startsWith(control))return null;
 const reply=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
 if(!enabled(env))return reply({success:false,error:'INTEGRATION_NOT_ENABLED'},503);
 if(request.method!=='POST')return reply({success:false,error:'METHOD_NOT_ALLOWED'},405);
 if(![control,control+'/refresh',control+'/revoke'].includes(path))return reply({success:false,error:'NOT_FOUND'},404);
 let raw:string;try{raw=await request.text();if(raw.length>2000)return reply({success:false,error:'INVALID_REQUEST'},400);JSON.parse(raw||'{}');}catch{return reply({success:false,error:'INVALID_REQUEST'},400);}
 const t=bearer(request),now=new Date().toISOString();if(!t)return reply({success:false,error:'AUTHENTICATION_REQUIRED'},401);
 let tokenDigest=await digest(t),actor:Actor|null=null;
 if(path===control){
  // Never create a new grant using another integration grant.
  const session=await env.DB.prepare("SELECT user_id FROM auth_sessions WHERE token=? AND expires_at>?").bind(tokenDigest,now).first<{user_id:string}>();
  if(!session||session.user_id!==env.ADMIN_INTEGRATION_OWNER_ID||websiteActor?.id!==session.user_id||websiteActor?.role!=='admin'||websiteActor.status!=='active')return reply({success:false,error:'OWNER_SIGN_IN_REQUIRED'},403);
  actor=websiteActor;
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');tokenDigest=await digest(token);
  const expiresAt=new Date(Date.now()+idleMs).toISOString(),absoluteExpiresAt=new Date(Date.now()+absoluteMs).toISOString();
  await env.DB.batch([env.DB.prepare('INSERT INTO admin_integration_grants(token_digest,owner_user_id,created_at,last_refreshed_at,expires_at,absolute_expires_at) VALUES(?,?,?,?,?,?)').bind(tokenDigest,actor.id,now,now,expiresAt,absoluteExpiresAt),env.DB.prepare("INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES(?,?,'admin','ADMIN_INTEGRATION_CONNECT','integration',?,'{}',?)").bind(crypto.randomUUID(),actor.id,actor.id,now)]);
  return reply({success:true,token,expiresAt,absoluteExpiresAt,scope:'urbanprocures:admin'});
 }
 actor=await integrationActor(request,env);if(!actor)return reply({success:false,error:'INTEGRATION_INVALID_OR_EXPIRED'},401);
 if(path.endsWith('/refresh')){
  const row=await env.DB.prepare('SELECT absolute_expires_at FROM admin_integration_grants WHERE token_digest=?').bind(tokenDigest).first<{absolute_expires_at:string}>();
  if(!row)return reply({success:false,error:'INTEGRATION_INVALID_OR_EXPIRED'},401);
  const expiresAt=new Date(Math.min(Date.now()+idleMs,Date.parse(row.absolute_expires_at))).toISOString();
  const updated=await env.DB.prepare('UPDATE admin_integration_grants SET expires_at=?,last_refreshed_at=? WHERE token_digest=? AND revoked_at IS NULL AND expires_at>? AND absolute_expires_at>?').bind(expiresAt,now,tokenDigest,now,now).run();
  return updated.meta.changes?reply({success:true,expiresAt,absoluteExpiresAt:row.absolute_expires_at}):reply({success:false,error:'INTEGRATION_INVALID_OR_EXPIRED'},401);
 }
 await env.DB.batch([env.DB.prepare('UPDATE admin_integration_grants SET revoked_at=? WHERE token_digest=?').bind(now,tokenDigest),env.DB.prepare("INSERT INTO audit_logs(id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES(?,?,'admin','ADMIN_INTEGRATION_REVOKE','integration',?,'{}',?)").bind(crypto.randomUUID(),actor.id,actor.id,now)]);
 return reply({success:true});
}
