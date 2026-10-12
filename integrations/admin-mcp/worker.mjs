const ORIGIN = 'https://urbanprocures-admin-mcp.abdeenniyas23.workers.dev';
const RESOURCE = ORIGIN + '/mcp';
const SCOPE = 'urbanprocures:admin';
const READS = ['public-quotes','rfqs','users','contractors','vendors','documents','site-visits','awards','quotations','service-charges','audit-logs','invitations','revision','notifications','email/outbox','quotations/history','documents/history','rfqs/history','terms/acceptances'];
const ACTIONS = {
 publish_rfq: ['POST','rfqs','publish'], verify_vendor: ['PATCH','vendors','verification'],
 verify_contractor: ['PATCH','contractors','verification'], release_document: ['POST','documents','release'],
 update_user_status: ['PATCH','users','status'], update_public_quote: ['PATCH','public-quotes','']
};
const HEADERS = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Strict-Transport-Security':'max-age=31536000','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
const enc = new TextEncoder();
const now = () => Math.floor(Date.now()/1000);
const random = () => Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
const base64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));
const unbase64 = s => Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const b64url = b => base64(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const hash = async s => b64url(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = (v,status=200,extra={}) => Response.json(v,{status,headers:{...HEADERS,...extra}});
async function key(env) { return crypto.subtle.importKey('raw',unbase64(env.SESSION_KEY),{name:'AES-GCM'},false,['encrypt','decrypt']); }
async function seal(env,s) { const iv=crypto.getRandomValues(new Uint8Array(12)); return base64(iv)+'.'+base64(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(env),enc.encode(s))); }
async function open(env,s) { const [iv,v]=s.split('.'); return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(iv)},await key(env),unbase64(v))); }
async function limited(env,k,max,seconds) {
 const t=now(); const row=await env.AUTH_DB.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END,expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count').bind(k,t+seconds,t,t).first();
 return row.count<=max;
}
async function input(request) {
 const reader=request.body?.getReader(); if(!reader) return '';
 let size=0,parts=[];
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>6000000){await reader.cancel();throw Error('REQUEST_TOO_LARGE');}parts.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return new TextDecoder().decode(bytes);
}
async function backend(env,path,method='GET',body,token) {
 const headers={'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
 return env.BACKEND.fetch(new Request('https://urbanprocures.com'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)}));
}
async function owner(env,token) {
 const r=await backend(env,'/api/auth/me','GET',undefined,token);if([401,403].includes(r.status))return false;if(!r.ok)throw Error('BACKEND_TEMPORARILY_UNAVAILABLE');
 const v=await r.json();return v.authenticated===true&&v.user?.id===env.OWNER_USER_ID&&v.user?.role==='admin'&&v.user?.status==='active';
}
function form(id,host,nonce,restart='',notice='',persistent=false) {
 return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect Urban Procures Admin</title><style>body{font:17px system-ui;background:#f7f6f2;color:#123540;margin:0;padding:24px}main{max-width:460px;margin:40px auto;background:white;padding:28px;border-radius:10px}input,button{box-sizing:border-box;width:100%;padding:13px;margin:8px 0 18px;font:inherit}button{background:#123540;color:white;border:0;border-radius:6px}</style><main><h1>Urban Procures Admin</h1><p>${escape(notice)}</p><p>Connect your website administrator account to <strong>${escape(host)}</strong>.</p><p>This connection lets your assistant read admin records and carry out the supported website actions you request. Only the existing owner admin account is accepted.</p><form method="post" action="/login"><input type="hidden" name="request_id" value="${escape(id)}"><input type="hidden" name="login_nonce" value="${escape(nonce)}"><input type="hidden" name="restart_context" value="${escape(restart)}"><label>Email<input name="email" type="email" autocomplete="username" required maxlength="250"></label><label>Password<input name="password" type="password" autocomplete="current-password" required maxlength="128"></label><button>Sign in and connect</button></form><small>Your password is checked by the existing website backend and is never stored in this integration. ${persistent?"This Admin App connection renews automatically for up to 90 days, with a 30-day inactivity limit. Disconnecting the App or resetting your password revokes it. Your normal website login still lasts eight hours.":"Access expires with your website session; reconnect when needed."}</small></main></html>`;
}
async function tokens(env,client,family,encrypted,sessionExpires) {
 const access=random(),refresh=random(),expires=Math.min(now()+3600,sessionExpires);
 await env.AUTH_DB.batch([
 env.AUTH_DB.prepare('INSERT INTO tokens VALUES(?,?,?,?,?,?,?)').bind(await hash(access),'access',client,family,encrypted,expires,sessionExpires),
 env.AUTH_DB.prepare('INSERT INTO tokens VALUES(?,?,?,?,?,?,?)').bind(await hash(refresh),'refresh',client,family,encrypted,sessionExpires,sessionExpires)]);
 return json({access_token:access,token_type:'Bearer',expires_in:expires-now(),refresh_token:refresh,scope:SCOPE});
}
const tools = [
 {name:'urbanprocures_admin_rfq_standard',description:'Owner-requested standardized RFQ draft, corrections, authenticated preview and reviewed publication. Preserves source documents, hard holds, preliminary award restrictions and revision audits.',inputSchema:{type:'object',properties:{id:{type:'string',pattern:'^[a-zA-Z0-9_-]{1,128}$'},operation:{type:'string',enum:['read','generate','save','preview','publish','questions_read','questions_review']},contentJson:{type:'string',maxLength:2000000},identityReviewConfirmed:{type:'boolean'},technicalReviewConfirmed:{type:'boolean'},preliminaryApproved:{type:'boolean'}},required:['id','operation'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false}},
 {name:'urbanprocures_admin_document',description:'Owner-only authenticated original or standardized document preview and corrections. Corrections reset release approval; originals remain private and unchanged.',inputSchema:{type:'object',properties:{id:{type:'string',pattern:'^[a-zA-Z0-9_-]{1,128}$'},operation:{type:'string',enum:['preview_original','preview_standardized','correct_content','replace_file']},contentJson:{type:'string',maxLength:500000},fileJson:{type:'string',maxLength:5000000},identityReviewConfirmed:{type:'boolean'}},required:['id','operation'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false}},
 {name:'urbanprocures_admin_status',description:'Verify the connected owner administrator and read current admin revision. Does not change business records.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,openWorldHint:false}},
 {name:'urbanprocures_admin_read',description:'Read a supported live Urban Procures admin collection. Contains private business records: retrieve only what the owner needs.',inputSchema:{type:'object',properties:{collection:{type:'string',enum:READS}},required:['collection'],additionalProperties:false},annotations:{readOnlyHint:true,openWorldHint:false}},
 {name:'urbanprocures_admin_action',description:'Execute an owner-requested website admin action through existing backend authorization, validation and audit rules. Review identity/document evidence before publishing or releasing. Does not award contracts, send invitations or bypass unavailable website features.',inputSchema:{type:'object',properties:{action:{type:'string',enum:Object.keys(ACTIONS)},id:{type:'string',minLength:1,maxLength:128},details:{type:'object',properties:{status:{type:'string'},identityReviewConfirmed:{type:'boolean'},verified:{type:'boolean'},scheduledDate:{type:'string'},inspectorName:{type:'string'}},additionalProperties:false}},required:['action','id','details'],additionalProperties:false},annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:false,openWorldHint:false}}
];
function scrub(value) {
 if(Array.isArray(value))return value.map(scrub);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,/^(password|password_hash|salt|token|invitation_token|access_token|refresh_token|reset_token|client_secret)$/i.test(k)?'[redacted]':scrub(v)]));
 if(typeof value==='string')return value.replace(/([?&](?:token|code|password)=)[^\s&#"<>]+/gi,'$1[redacted]');
 return value;
}
async function rpc(env,body,upstream) {
 const result=v=>json({jsonrpc:'2.0',id:body.id,result:v});const error=(code,message)=>json({jsonrpc:'2.0',id:body.id??null,error:{code,message}});
 if(body.jsonrpc!=='2.0'||typeof body.method!=='string')return error(-32600,'Invalid request');
 if(body.method==='initialize')return result({protocolVersion:['2025-03-26','2025-06-18','2025-11-25'].includes(body.params?.protocolVersion)?body.params.protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false}},serverInfo:{name:'Urban Procures Owner Admin',version:'1.2.0'},instructions:'Use only for the owner’s requested Urban Procures work. Existing backend gates remain authoritative.'});
 if(body.method.startsWith('notifications/'))return new Response(null,{status:202,headers:HEADERS});
 if(body.method==='ping')return result({});
 if(body.method==='tools/list')return result({tools});
 if(body.method!=='tools/call')return error(-32601,'Method not found');
 const {name,arguments:a={}}=body.params??{};let response;
 if(name==='urbanprocures_admin_rfq_standard'){
  if(typeof a.id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(a.id)||!['read','generate','save','preview','publish','questions_read','questions_review'].includes(a.operation))return error(-32602,'Invalid RFQ standard operation');
  const root='/api/admin/rfqs/'+a.id;let path=root+'/standard',method='GET',payload;
  if(a.operation==='generate'){path+='/generate';method='POST';payload={};}
  if(a.operation==='save'||a.operation==='questions_review'){method='PUT';try{payload=JSON.parse(a.contentJson);}catch{return error(-32602,'Invalid RFQ content JSON');}}
  if(a.operation.startsWith('questions_'))path=root+'/questions';
  if(a.operation==='publish'){path+='/publish';method='POST';payload={identityReviewConfirmed:a.identityReviewConfirmed===true,technicalReviewConfirmed:a.technicalReviewConfirmed===true,preliminaryApproved:a.preliminaryApproved===true};}
  if(a.operation==='preview'){path+='/preview';const r=await backend(env,path,'GET',undefined,upstream);if(!r.ok)return result({content:[{type:'text',text:JSON.stringify({httpStatus:r.status,body:scrub(await r.json())})}],isError:true});const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>3000000)return error(-32602,'RFQ preview exceeds limit');let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return result({content:[{type:'text',text:JSON.stringify({httpStatus:200,mimeType:'application/pdf',sizeBytes:bytes.length,base64:btoa(binary)})}],isError:false});}
  response=await backend(env,path,method,payload,upstream);if(method!=='GET')await env.AUTH_DB.prepare('INSERT INTO activity VALUES(?,?,?,?)').bind(crypto.randomUUID(),'rfq_standard_'+a.operation,response.status,now()).run();
 }else if(name==='urbanprocures_admin_document'){
  if(typeof a.id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(a.id)||!['preview_original','preview_standardized','correct_content','replace_file'].includes(a.operation))return error(-32602,'Invalid document operation');
  if(a.operation.startsWith('preview_')){
   const standard=a.operation==='preview_standardized';const r=await backend(env,'/api/documents/'+a.id+'/'+(standard?'standardized/':'')+'view','GET',undefined,upstream);
   if(!r.ok)return result({content:[{type:'text',text:JSON.stringify({httpStatus:r.status,body:scrub(await r.json())})}],isError:true});
   if(Number(r.headers.get('Content-Length')||0)>3000000)return error(-32602,'Document exceeds preview limit');
   const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>3000000)return error(-32602,'Document exceeds preview limit');
   let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   const mime=r.headers.get('Content-Type')?.split(';')[0]||'application/octet-stream';
   return result({content:[{type:'text',text:JSON.stringify({httpStatus:200,documentId:a.id,standardized:standard,mimeType:mime,sizeBytes:bytes.length,base64:btoa(binary)})}],isError:false});
  }
  let payload;try{payload=a.operation==='correct_content'?{content:JSON.parse(a.contentJson)}:{file:JSON.parse(a.fileJson),identityReviewConfirmed:a.identityReviewConfirmed===true};}catch{return error(-32602,'Invalid document correction JSON');}
  response=await backend(env,'/api/admin/documents/'+a.id+'/standardize','PUT',payload,upstream);
  await env.AUTH_DB.prepare('INSERT INTO activity VALUES(?,?,?,?)').bind(crypto.randomUUID(),a.operation,response.status,now()).run();
 }else if(name==='urbanprocures_admin_status')response=await backend(env,'/api/admin/revision','GET',undefined,upstream);
 else if(name==='urbanprocures_admin_read'){
  if(!READS.includes(a.collection))return error(-32602,'Unsupported admin collection');
  response=await backend(env,'/api/admin/'+a.collection,'GET',undefined,upstream);
 } else if(name==='urbanprocures_admin_action'){
  if(!Object.hasOwn(ACTIONS,a.action)||typeof a.id!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(a.id)||!a.details||Array.isArray(a.details)||typeof a.details!=='object')return error(-32602,'Invalid admin action');
  if(Object.keys(a.details).some(k=>!['status','identityReviewConfirmed','verified','scheduledDate','inspectorName'].includes(k)))return error(-32602,'Unsupported action field');
  const [method,collection,suffix]=ACTIONS[a.action];
  response=await backend(env,'/api/admin/'+collection+'/'+a.id+(suffix?'/'+suffix:''),method,a.details,upstream);
 }else return error(-32602,'Unknown tool');
 const text=await response.text();if(text.length>(name==='urbanprocures_admin_rfq_standard'?2000000:300000))return result({content:[{type:'text',text:'Result exceeds limit. Request a narrower workflow.'}],isError:true});
 if(name==='urbanprocures_admin_action')await env.AUTH_DB.prepare('INSERT INTO activity VALUES(?,?,?,?)').bind(crypto.randomUUID(),a.action,response.status,now()).run();
 return result({content:[{type:'text',text:JSON.stringify({httpStatus:response.status,body:scrub(JSON.parse(text))})}],isError:!response.ok});
}
export default {
 async scheduled(controller,env,ctx){ctx.waitUntil(env.AUTH_DB.batch(['requests','codes','tokens','limits'].map(table=>env.AUTH_DB.prepare(`DELETE FROM ${table} WHERE expires<?`).bind(now()))));},
 async fetch(request,env){
  try {
   const u=new URL(request.url),p=u.pathname;
   if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...HEADERS,'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,MCP-Protocol-Version','Access-Control-Expose-Headers':'WWW-Authenticate'}});
   if(p.startsWith('/.well-known/oauth-protected-resource'))return json({resource:RESOURCE,authorization_servers:[ORIGIN],scopes_supported:[SCOPE],bearer_methods_supported:['header']});
   if(p.startsWith('/.well-known/oauth-authorization-server'))return json({issuer:ORIGIN,authorization_endpoint:ORIGIN+'/authorize',token_endpoint:ORIGIN+'/token',registration_endpoint:ORIGIN+'/register',revocation_endpoint:ORIGIN+'/revoke',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],token_endpoint_auth_methods_supported:['none'],code_challenge_methods_supported:['S256'],scopes_supported:[SCOPE]});
   if(p==='/health'&&request.method==='GET')return json({service:'Urban Procures owner admin MCP',version:'1.2.0',authenticationRequired:true,backend:'urbanprocures.com'});
   const ip=request.headers.get('CF-Connecting-IP')||'unknown';
   if(p==='/register'&&request.method==='POST'){
    if(!await limited(env,'register:'+ip,20,3600))return json({error:'rate_limited'},429);
    const b=JSON.parse(await input(request));if(!Array.isArray(b.redirect_uris)||b.redirect_uris.length<1||b.redirect_uris.length>5)return json({error:'invalid_client_metadata'},400);
    for(const s of b.redirect_uris){if(typeof s!=='string'||s.length>2048)return json({error:'invalid_redirect_uri'},400);const r=new URL(s);if(r.protocol!=='https:'||r.username||r.password||r.hash)return json({error:'invalid_redirect_uri'},400);}
    const id=crypto.randomUUID();await env.AUTH_DB.prepare('INSERT INTO clients VALUES(?,?,?)').bind(id,JSON.stringify(b.redirect_uris),now()).run();return json({client_id:id,redirect_uris:b.redirect_uris,token_endpoint_auth_method:'none',grant_types:['authorization_code','refresh_token'],response_types:['code']},201);
   }
   if(p==='/authorize'&&request.method==='GET'){
    if(!await limited(env,'authorize:'+ip,60,3600))return json({error:'rate_limited'},429);
    const q=u.searchParams,c=await env.AUTH_DB.prepare('SELECT * FROM clients WHERE id=?').bind(q.get('client_id')).first();
    if(!c||!JSON.parse(c.redirects).includes(q.get('redirect_uri'))||q.get('response_type')!=='code'||q.get('code_challenge_method')!=='S256'||!/^[A-Za-z0-9_-]{43}$/.test(q.get('code_challenge')||'')||!q.get('state')||q.get('state').length>2048||q.get('resource')&&q.get('resource')!==RESOURCE||q.get('scope')&&q.get('scope')!==SCOPE)return json({error:'invalid_request'},400);
    const id=random(),browser=random();await env.AUTH_DB.prepare('INSERT INTO requests VALUES(?,?,?,?,?,?,?)').bind(id,c.id,q.get('redirect_uri'),q.get('state'),q.get('code_challenge'),await hash(browser),now()+1800).run();
    const restart=await seal(env,JSON.stringify({query:q.toString(),expires:now()+3600}));
    return new Response(form(id,new URL(q.get('redirect_uri')).host,browser,restart,'',env.PERSISTENT_ADMIN_GRANTS==='true'),{headers:{...HEADERS,'Content-Type':'text/html; charset=utf-8','Set-Cookie':`__Host-up_mcp_connect_${id}=${browser}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=1800`}});
   }
   if(p==='/login'&&request.method==='POST'){
    if(request.headers.get('Origin')!==ORIGIN)return json({error:'origin_rejected'},403);
    if(!await limited(env,'login:'+ip,10,300))return json({error:'rate_limited'},429);
    const b=new URLSearchParams(await input(request));const requestId=b.get('request_id')||'';
    if(!/^[a-f0-9]{64}$/.test(requestId))return json({error:'login_request_missing_restart'},400);
    const cookies=new Map((request.headers.get('Cookie')||'').split(';').map(part=>{const i=part.indexOf('=');return [part.slice(0,i).trim(),part.slice(i+1).trim()]}));
    const cookie=cookies.get('__Host-up_mcp_connect_'+requestId)||cookies.get('__Host-up_mcp_connect')||'';
    // The same-origin form nonce supports cookie-restricted OAuth webviews.
    // Origin checking, single-use request, expiry and PKCE remain mandatory.
    const proof=b.get('login_nonce')||cookie;
    if(!/^[a-f0-9]{64}$/.test(proof))return json({error:'login_proof_missing_restart'},400);
    const browserHash=await hash(proof);
    const pending=await env.AUTH_DB.prepare('SELECT * FROM requests WHERE id=?').bind(requestId).first();
    if(!pending||pending.expires<=now()){
     if(b.get('restart_context')){
      const context=JSON.parse(await open(env,b.get('restart_context')));
      if(context.expires>now()){
       const href='/authorize?'+new URLSearchParams(context.query).toString();
       return new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Urban Procures Admin</title><h1>Start a fresh sign-in</h1><p>This login request has expired or was already used.</p><a href="${escape(href)}">Continue to Urban Procures Admin sign-in</a>`,{status:400,headers:{...HEADERS,'Content-Type':'text/html; charset=utf-8'}});
      }
     }
     return json({error:'connection_expired_restart'},400);
    }
    if(pending.browser_hash!==browserHash)return json({error:'login_proof_mismatch_restart'},400);
    if(!b.get('email')||!b.get('password')||b.get('password').length>128)return json({error:'invalid_login'},400);
    const login=await backend(env,'/api/auth/login','POST',{email:b.get('email'),password:b.get('password')});const data=await login.json();
    if(!login.ok||data.user?.role!=='admin'||data.user?.id!==env.OWNER_USER_ID||data.user?.status!=='active'||!data.token){if(data.token)await backend(env,'/api/auth/logout','POST',{},data.token);return new Response(form(requestId,new URL(pending.redirect).host,proof,b.get('restart_context')||'','Sign-in failed. Enter the existing owner administrator email and password again.',env.PERSISTENT_ADMIN_GRANTS==='true'),{status:403,headers:{...HEADERS,'Content-Type':'text/html; charset=utf-8'}});}
    const row=await env.AUTH_DB.prepare('DELETE FROM requests WHERE id=? AND browser_hash=? AND expires>? RETURNING *').bind(requestId,browserHash,now()).first();
    if(!row){await backend(env,'/api/auth/logout','POST',{},data.token);return json({error:'connection_already_used_restart'},400);}
    let upstream=data.token,sessionExpires=now()+28740;
    if(env.PERSISTENT_ADMIN_GRANTS==='true'){
     const grantResponse=await backend(env,'/api/auth/admin-integration','POST',{},data.token);
     const grant=await grantResponse.json();if(!grantResponse.ok||!grant.success||!grant.token||!Number.isFinite(Date.parse(grant.expiresAt)))throw Error('ADMIN_GRANT_UNAVAILABLE');
     upstream=grant.token;sessionExpires=Math.floor(Date.parse(grant.expiresAt)/1000);
     await backend(env,'/api/auth/logout','POST',{},data.token);
    }
    const code=random();await env.AUTH_DB.prepare('INSERT INTO codes VALUES(?,?,?,?,?,?,?)').bind(await hash(code),row.client,row.redirect,row.challenge,await seal(env,upstream),now()+120,sessionExpires).run();
    const redirect=new URL(row.redirect);redirect.searchParams.set('code',code);redirect.searchParams.set('state',row.state);return new Response(null,{status:302,headers:{...HEADERS,Location:redirect.href,'Set-Cookie':`__Host-up_mcp_connect_${requestId}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`}});
   }
   if(p==='/token'&&request.method==='POST'){
    if(!await limited(env,'token:'+ip,120,300))return json({error:'rate_limited'},429);
    const b=new URLSearchParams(await input(request));if(b.get('resource')&&b.get('resource')!==RESOURCE)return json({error:'invalid_target'},400);
    if(b.get('grant_type')==='authorization_code'){
     const row=await env.AUTH_DB.prepare('SELECT * FROM codes WHERE hash=? AND client=? AND redirect=? AND expires>?').bind(await hash(b.get('code')||''),b.get('client_id'),b.get('redirect_uri'),now()).first();
     const verifier=b.get('code_verifier')||'';if(!row||!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)||await hash(verifier)!==row.challenge)return json({error:'invalid_grant'},400);
     const consumed=await env.AUTH_DB.prepare('DELETE FROM codes WHERE hash=? RETURNING hash').bind(row.hash).first();if(!consumed)return json({error:'invalid_grant'},400);
     return tokens(env,row.client,crypto.randomUUID(),row.encrypted,row.session_expires);
    }
    if(b.get('grant_type')==='refresh_token'){
     // Provider/network failures must not consume the owner's refresh credential.
     const digest=await hash(b.get('refresh_token')||'');
     const row=await env.AUTH_DB.prepare("SELECT * FROM tokens WHERE hash=? AND client=? AND kind='refresh' AND expires>?").bind(digest,b.get('client_id'),now()).first();if(!row)return json({error:'invalid_grant'},400);
     let sessionExpires=row.session_expires;
     try{
      const upstream=await open(env,row.encrypted);if(!await owner(env,upstream))return json({error:'invalid_grant'},400);
      if(env.PERSISTENT_ADMIN_GRANTS==='true'){
       const response=await backend(env,'/api/auth/admin-integration/refresh','POST',{},upstream);
       if([401,403].includes(response.status))return json({error:'invalid_grant'},400);
       if(!response.ok)return json({error:'temporarily_unavailable'},503);
       const grant=await response.json();if(!grant.success||!Number.isFinite(Date.parse(grant.expiresAt)))return json({error:'temporarily_unavailable'},503);
       sessionExpires=Math.floor(Date.parse(grant.expiresAt)/1000);
      }
     }catch{return json({error:'temporarily_unavailable'},503);}
     const consumed=await env.AUTH_DB.prepare("DELETE FROM tokens WHERE hash=? AND client=? AND kind='refresh' AND expires>? RETURNING hash").bind(digest,row.client,now()).first();if(!consumed)return json({error:'temporarily_unavailable'},503);
     // Existing access tokens retain their normal one-hour validity during rotation.
     return tokens(env,row.client,row.family,row.encrypted,sessionExpires);
    }
    return json({error:'unsupported_grant_type'},400);
   }
   if(p==='/revoke'&&request.method==='POST'){
    const b=new URLSearchParams(await input(request));const row=await env.AUTH_DB.prepare('SELECT family,encrypted FROM tokens WHERE hash=? AND client=?').bind(await hash(b.get('token')||''),b.get('client_id')).first();
    if(row){await env.AUTH_DB.prepare('DELETE FROM tokens WHERE family=?').bind(row.family).run();await backend(env,env.PERSISTENT_ADMIN_GRANTS==='true'?'/api/auth/admin-integration/revoke':'/api/auth/logout','POST',{},await open(env,row.encrypted));}return json({});
   }
   if(p==='/mcp'){
    if(request.headers.has('Origin')&&!['https://chatgpt.com','https://chat.openai.com',ORIGIN].includes(request.headers.get('Origin')))return json({error:'origin_rejected'},403);
    let message=null;
    if(request.method==='POST'){
     message=JSON.parse(await input(request));
     // Discovery is public metadata; every data-bearing tools/call remains owner-authenticated.
     if(message.jsonrpc==='2.0'&&['initialize','tools/list','ping','notifications/initialized'].includes(message.method)){
      if(!await limited(env,'discovery:'+ip,120,60))return json({error:'rate_limited'},429);
      return rpc(env,message,null);
     }
    }
    const bearer=request.headers.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const row=bearer?await env.AUTH_DB.prepare("SELECT * FROM tokens WHERE hash=? AND kind='access' AND expires>?").bind(await hash(bearer),now()).first():null;
    const token=row?await open(env,row.encrypted):null;
    if(!token||!await owner(env,token))return json({error:'authentication_required'},401,{'WWW-Authenticate':`Bearer resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource"`});
    if(request.headers.has('Origin')&&!['https://chatgpt.com','https://chat.openai.com',ORIGIN].includes(request.headers.get('Origin')))return json({error:'origin_rejected'},403);
    if(request.method==='GET')return json({error:'streaming_not_supported'},405,{Allow:'POST,DELETE'});
    if(request.method==='DELETE')return new Response(null,{status:204,headers:HEADERS});
    if(request.method!=='POST')return json({error:'method_not_allowed'},405);
    if(!await limited(env,'mcp:'+row.family,120,60))return json({error:'rate_limited'},429);
    return rpc(env,message,token);
   }
   return json({error:'not_found'},404);
  }catch{return json({error:'request_failed'},400);}
 }
};

