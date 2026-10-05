import type {Env} from './index.ts';
import {tokenDigest,passwordHash} from './auth.ts';
import {sendZohoMail,zohoConfiguration,validZohoConfiguration} from './zohoMail.ts';
export async function rateAllowed(env:Env,key:string,limit:number,windowMs=60000) {
 const window=Math.floor(Date.now()/windowMs)*windowMs;
 const result=await env.DB.prepare(`INSERT INTO auth_rate_limits (key,window_start,attempts) VALUES (?,?,1)
 ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start=excluded.window_start THEN attempts+1 ELSE 1 END,window_start=excluded.window_start RETURNING attempts`).bind(await tokenDigest(key),window).first<{attempts:number}>();
 return !!result&&result.attempts<=limit;
}
export async function recoveryRoute(request:Request,env:Env):Promise<Response|null> {
 const path=new URL(request.url).pathname;if(!['/api/auth/forgot-password','/api/auth/reset-password'].includes(path)||request.method!=='POST')return null;
 const fail=(error:string,status=400)=>Response.json({success:false,error},{status});
 let body:any;try{const raw=await request.text();if(raw.length>2000)return fail('INVALID_REQUEST');body=JSON.parse(raw);}catch{return fail('INVALID_REQUEST');}
 if(!await rateAllowed(env,'recovery:'+request.headers.get('CF-Connecting-IP'),10))return fail('TRY_AGAIN_LATER',429);
 if(path.endsWith('forgot-password')){
  if(typeof body.email!=='string'||body.email.length>250)return fail('INVALID_REQUEST');
  // Only owner-configured Zoho transport may deliver reset links; no simulated success.
  const config=zohoConfiguration(env);
  if(!config||!env.PUBLIC_APP_ORIGIN)return fail('ZOHO_PASSWORD_RESET_NOT_CONFIGURED',503);
  if(!validZohoConfiguration(config)||!/^https:\/\//.test(env.PUBLIC_APP_ORIGIN))return fail('EMAIL_CONFIGURATION_INVALID',503);
  const user=await env.DB.prepare("SELECT id,email FROM users WHERE email=? AND status='active'").bind(body.email.trim().toLowerCase()).first<{id:string;email:string}>();
  if(user){const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),digest=await tokenDigest(token),now=new Date().toISOString();
   await env.DB.batch([env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').bind(user.id),env.DB.prepare('INSERT INTO password_reset_tokens (digest,user_id,expires_at,created_at) VALUES (?,?,?,?)').bind(digest,user.id,new Date(Date.now()+1800000).toISOString(),now)]);
   try{await sendZohoMail(env,{toAddress:user.email,subject:'Urban Procures password reset',content:`Use this link within 30 minutes to reset your password: ${env.PUBLIC_APP_ORIGIN}/reset-password#${token}`});}catch{await env.DB.prepare('DELETE FROM password_reset_tokens WHERE digest=?').bind(digest).run();return fail('EMAIL_DELIVERY_UNAVAILABLE',503);}
  }
  return Response.json({success:true,data:{message:'If an eligible account exists, reset instructions have been sent.'}});
 }
 if(typeof body.token!=='string'||! /^[a-f0-9]{64}$/.test(body.token)||typeof body.password!=='string'||body.password.length<12||body.password.length>128)return fail('INVALID_RESET_REQUEST');
 const digest=await tokenDigest(body.token),now=new Date().toISOString(),reset=await env.DB.prepare("SELECT r.user_id FROM password_reset_tokens r JOIN users u ON u.id=r.user_id WHERE r.digest=? AND r.expires_at>? AND u.status='active'").bind(digest,now).first<{user_id:string}>();if(!reset)return fail('RESET_INVALID_OR_EXPIRED');
 const salt=crypto.randomUUID(),hash=await passwordHash(body.password,salt);
 const results=await env.DB.batch([env.DB.prepare('UPDATE users SET password_hash=?,salt=?,updated_at=? WHERE id=? AND EXISTS(SELECT 1 FROM password_reset_tokens WHERE digest=? AND expires_at>?)').bind(hash,salt,now,reset.user_id,digest,now),env.DB.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(reset.user_id),env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').bind(reset.user_id),env.DB.prepare("INSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) SELECT ?,id,role,'PASSWORD_RESET','user',id,'{}',? FROM users WHERE id=?").bind(crypto.randomUUID(),now,reset.user_id)]);
 return results[0].meta.changes?Response.json({success:true}):fail('RESET_INVALID_OR_EXPIRED');
}
