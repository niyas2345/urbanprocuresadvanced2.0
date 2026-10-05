import type { Env } from './index.ts';
export type Actor = { id: string; email: string; role: string; status: string };
export type Terms = { id: string; role: string; terms_type: string; terms_version: string; title: string; content_text: string; content_sha256: string; mandatory: number; effective_at: string; published_at: string };
export const publishedTerms = (env: Env, role: string) => env.DB.prepare("SELECT * FROM terms_versions WHERE role=? AND status='published' AND (effective_at IS NULL OR effective_at<=?)").bind(role,new Date().toISOString()).first<Terms>();
export const publicTerms = (env: Env) => env.DB.prepare("SELECT * FROM public_terms_documents WHERE status='published' AND effective_at<=?").bind(new Date().toISOString()).first<Terms>();
export async function organizationFor(env: Env, actor: Actor) {
  if (!['contractor','vendor'].includes(actor.role)) return null;
  return env.DB.prepare(`SELECT id,organization_id FROM ${actor.role === 'vendor' ? 'vendors' : 'contractors'} WHERE user_id=?`).bind(actor.id).first<{id:string;organization_id:string}>();
}
export async function acceptanceFor(env: Env, actor: Actor) {
  const profile=await organizationFor(env,actor), current=await publishedTerms(env,actor.role);
  if (!profile?.organization_id || !current || actor.status!=='active') return null;
  return env.DB.prepare(`SELECT e.acceptance_id,e.terms_version,e.terms_version_id,e.content_sha256
    FROM terms_acceptance_evidence e JOIN terms_versions t ON t.id=e.terms_version_id
    WHERE e.user_id=? AND e.organization_id=? AND e.role=? AND e.acceptance_status='accepted'
    AND t.status IN ('published','retired') AND e.content_sha256=t.content_sha256
    AND (t.id=? OR (?=0 AND NOT EXISTS(SELECT 1 FROM terms_versions n WHERE n.role=t.role
      AND n.mandatory=1 AND n.status IN ('published','retired') AND n.published_at>t.published_at)))
    ORDER BY e.accepted_at DESC LIMIT 1`).bind(actor.id,profile.organization_id,actor.role,current.id,current.mandatory).first<{acceptance_id:string;terms_version:string;terms_version_id:string;content_sha256:string}>();
}
export function auditStatement(env: Env, actor: Actor|null, action: string, terms: {id:string;terms_version:string}, organizationId:string|null=null, reference=crypto.randomUUID()) {
  return env.DB.prepare('INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES (?,?,?,?,?,?,?,?)')
    .bind(reference,actor?.id||null,actor?.role||'public',action,'terms',terms.id,JSON.stringify({organizationId,termsVersion:terms.terms_version,auditReference:reference}),new Date().toISOString());
}
export function evidenceStatement(env: Env, request: Request, actor: Actor, organizationId:string, terms:Terms, reference:string) {
  const now=new Date().toISOString();
  return env.DB.prepare('INSERT INTO terms_acceptance_evidence (acceptance_id,user_id,organization_id,role,terms_type,terms_version_id,terms_version,content_sha256,accepted_at,acceptance_status,acceptance_action,ip_address,user_agent,audit_reference,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(crypto.randomUUID(),actor.id,organizationId,actor.role,actor.role,terms.id,terms.terms_version,terms.content_sha256,now,'accepted','explicit_clickwrap',null,null,reference,now);
}
export async function termsGate(request:Request,env:Env,actor:Actor|null,role:string) {
  const fail=(code:string,status:number)=>Response.json({success:false,error:code,code},{status});
  if(!actor) return fail('AUTHENTICATION_REQUIRED',401);
  if(actor.role!==role) return fail('ROLE_REQUIRED',403);
  if(!(await organizationFor(env,actor))?.organization_id) return fail('ORGANIZATION_REQUIRED',403);
  if(await acceptanceFor(env,actor)) return null;
  const had=await env.DB.prepare('SELECT acceptance_id FROM terms_acceptance_evidence WHERE user_id=? LIMIT 1').bind(actor.id).first();
  const current=await publishedTerms(env,role);
  if(current && had) await auditStatement(env,actor,'TERMS_REACCEPTANCE_REQUIRED',current,(await organizationFor(env,actor))!.organization_id).run();
  return fail(had?'REACCEPTANCE_REQUIRED':'TERMS_ACCEPTANCE_REQUIRED',403);
}
export async function termsRoute(request:Request,env:Env,actor:Actor|null):Promise<Response|null> {
  const url=new URL(request.url);
  if(url.pathname==='/api/terms' && request.method==='GET') {
    const role=url.searchParams.get('role');
    if(!role || !['contractor','vendor','get_a_quote'].includes(role)) return Response.json({success:false,error:'Invalid Terms type'},{status:400});
    const terms=role==='get_a_quote'?await publicTerms(env):await publishedTerms(env,role);
    if(!terms)return Response.json({success:false,error:'Published Terms unavailable'},{status:503});
    const profile=actor?await organizationFor(env,actor):null;
    if(url.searchParams.get('viewed')==='true')await auditStatement(env,actor,role==='vendor'?'VENDOR_TERMS_VIEWED':role==='contractor'?'CONTRACTOR_TERMS_VIEWED':'GET_A_QUOTE_TERMS_VIEWED',terms,profile?.organization_id||null).run();
    // Do not expose publisher account details through public responses.
    return Response.json({success:true,data:{id:terms.id,terms_type:role,terms_version:terms.terms_version,title:terms.title,content_text:terms.content_text,content_sha256:terms.content_sha256,requires_reacceptance:terms.mandatory===1,effective_at:terms.effective_at}},{headers:{'Cache-Control':'no-store'}});
  }
  if(url.pathname==='/api/terms/status' && request.method==='GET') {
    if(!actor)return Response.json({success:false,error:'AUTHENTICATION_REQUIRED'},{status:401});
    const terms=await publishedTerms(env,actor.role), accepted=await acceptanceFor(env,actor);
    return Response.json({success:true,data:{status:accepted?'ACTIVE':'REACCEPTANCE_REQUIRED',termsVersionId:terms?.id||null,acceptance:accepted}},{headers:{'Cache-Control':'no-store'}});
  }
  if(url.pathname==='/api/admin/terms/acceptances' && request.method==='GET') {
    if(!actor)return Response.json({success:false,error:'AUTHENTICATION_REQUIRED'},{status:401});
    if(actor.role!=='admin')return Response.json({success:false,error:'ADMIN_REQUIRED'},{status:403});
    const offset=Number(url.searchParams.get('offset')||0);
    if(!Number.isSafeInteger(offset)||offset<0)return Response.json({success:false,error:'INVALID_OFFSET'},{status:400});
    const sql=url.searchParams.get('type')==='get_a_quote'?`SELECT p.id AS acceptance_id,p.request_id,p.terms_document_id AS terms_version_id,
      'public' AS role,'get_a_quote' AS terms_type,p.terms_version,p.content_hash_at_acceptance AS content_sha256,
      p.accepted_at,'accepted' AS acceptance_status,p.audit_reference,q.customer_email AS email,q.reference_code AS company,d.title,d.content_text
      FROM public_terms_acceptances p JOIN get_a_quote_requests q ON q.id=p.request_id
      JOIN public_terms_documents d ON d.id=p.terms_document_id ORDER BY p.accepted_at DESC,p.id LIMIT 201 OFFSET ?`
      :`SELECT e.*,u.email,o.name AS company,t.title,t.content_text
      FROM terms_acceptance_evidence e JOIN users u ON u.id=e.user_id LEFT JOIN organizations o ON o.id=e.organization_id
      JOIN terms_versions t ON t.id=e.terms_version_id ORDER BY e.accepted_at DESC,e.acceptance_id LIMIT 201 OFFSET ?`;
    const rows=await env.DB.prepare(sql).bind(offset).all();
    return Response.json({success:true,data:rows.results.slice(0,200),nextOffset:rows.results.length>200?offset+200:null},{headers:{'Cache-Control':'no-store'}});
  }
  return null;
}
