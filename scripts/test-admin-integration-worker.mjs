import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
const passwordHash=async(password,salt)=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Array.from(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations:100000},key,256)),b=>b.toString(16).padStart(2,'0')).join('')};
const compiled=await build({entryPoints:['urbanprocures advanced/workers/index.ts'],bundle:true,write:false,format:'esm',platform:'browser',loader:{'.ttf':'base64'}});
const ownerId='owner-runtime-fixture',password='Isolated-runtime-fixture-2026!';
const sessionKey=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
const mf=new Miniflare(convertV4MiniflareOptions({cf:false,workers:[
 {name:'bridge',modules:true,script:fs.readFileSync('integrations/admin-mcp/worker.mjs','utf8').replace("const ORIGIN = 'https://urbanprocures-admin-mcp.abdeenniyas23.workers.dev';","const ORIGIN = 'http://localhost';"),compatibilityDate:'2026-10-01',d1Databases:{AUTH_DB:'auth-local'},serviceBindings:{BACKEND:'backend'},bindings:{OWNER_USER_ID:ownerId,SESSION_KEY:sessionKey,PERSISTENT_ADMIN_GRANTS:'true'}},
 {name:'backend',modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-10-01',d1Databases:{DB:'backend-local'},r2Buckets:['DOCUMENTS_BUCKET'],bindings:{ENVIRONMENT:'advanced-production',PLATFORM_DOMAIN:'urbanprocures.com',EMAIL_DELIVERY_ENABLED:'false',ADMIN_INTEGRATION_GRANTS_ENABLED:'true',ADMIN_INTEGRATION_OWNER_ID:ownerId}}
]}));
let checks=0;const check=(v,label)=>{assert.ok(v,label);checks++};
try{
 const website=await mf.getD1Database('DB','backend'),auth=await mf.getD1Database('AUTH_DB','bridge');
 for(const file of fs.readdirSync('urbanprocures advanced/database/migrations').filter(x=>/^\d+.*\.sql$/.test(x)).sort())await website.exec(fs.readFileSync('urbanprocures advanced/database/migrations/'+file,'utf8').replace(/--[^\n]*/g,'').replace(/\s*\n\s*/g,' '));
 await auth.exec('CREATE TABLE clients(id TEXT PRIMARY KEY,redirects TEXT,created INTEGER);CREATE TABLE requests(id TEXT PRIMARY KEY,client TEXT,redirect TEXT,state TEXT,challenge TEXT,browser_hash TEXT,expires INTEGER);CREATE TABLE codes(hash TEXT PRIMARY KEY,client TEXT,redirect TEXT,challenge TEXT,encrypted TEXT,expires INTEGER,session_expires INTEGER);CREATE TABLE tokens(hash TEXT PRIMARY KEY,kind TEXT,client TEXT,family TEXT,encrypted TEXT,expires INTEGER,session_expires INTEGER);CREATE TABLE limits(key TEXT PRIMARY KEY,count INTEGER,expires INTEGER);CREATE TABLE activity(id TEXT,action TEXT,status INTEGER,time INTEGER);');
 const now=new Date().toISOString();await website.prepare('INSERT INTO users(id,email,password_hash,salt,role,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(ownerId,'owner-runtime@example.invalid',await passwordHash(password,'fixture-salt'),'fixture-salt','admin','active',now,now).run();
 const bridge=await mf.getWorker('bridge'),backend=await mf.getWorker('backend');
 const base='http://localhost'; // Match the local dev proxy's allowed Origin; production source remains unchanged.
 const send=(path,body,headers={})=>bridge.fetch(base+path,{method:body?'POST':'GET',headers,body,redirect:'manual'});
 const reg=await send('/register',JSON.stringify({redirect_uris:['https://chatgpt.com/fixture-callback']}),{'Content-Type':'application/json'});check(reg.status===201,'Dynamic OAuth client registration');const {client_id}=await reg.json();
 const verifier='v'.repeat(64),challenge=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const query=new URLSearchParams({client_id,redirect_uri:'https://chatgpt.com/fixture-callback',response_type:'code',code_challenge_method:'S256',code_challenge:challenge,state:'fixture-state'});
 const form=await send('/authorize?'+query);check(form.status===200,'OAuth sign-in form loads');const html=await form.text();
 const hidden=name=>html.match(new RegExp('name="'+name+'" value="([^"]*)"'))?.[1];
 const login=await send('/login',new URLSearchParams({request_id:hidden('request_id'),login_nonce:hidden('login_nonce'),email:'owner-runtime@example.invalid',password}),{'Content-Type':'application/x-www-form-urlencoded',Origin:base});
 if(login.status!==302){const t=await login.text();let code='html';try{const e=JSON.parse(t).error;if(/^[a-z_]+$/.test(e))code=e}catch{}throw Error('Fixture login status '+login.status+'; code='+code+'; '+t.replace(/<input[^>]*>/g,'').replace(/<style>[\s\S]*?<\/style>/g,'').replace(/<[^>]*>/g,' ').slice(0,700));}
 check(login.status===302,'Owner password verified by actual backend');
 const code=new URL(login.headers.get('Location')).searchParams.get('code');
 const exchange=await send('/token',new URLSearchParams({client_id,grant_type:'authorization_code',code,code_verifier:verifier,redirect_uri:'https://chatgpt.com/fixture-callback'}),{'Content-Type':'application/x-www-form-urlencoded'});check(exchange.status===200,'PKCE code exchange succeeds');let tokens=await exchange.json();
 const rpc=async token=>send('/mcp',JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'urbanprocures_admin_status',arguments:{}}}),{'Content-Type':'application/json',Authorization:'Bearer '+token});
 const status=await rpc(tokens.access_token);check(status.status===200&&!(await status.json()).result.isError,'Admin status reaches real backend authorization');
 check((await website.prepare('SELECT count(*) AS n FROM auth_sessions').first()).n===0,'Ordinary sign-in session logged out after grant creation');
 check((await website.prepare('SELECT count(*) AS n FROM admin_integration_grants').first()).n===1,'Separate revocable grant persisted');
 check(tokens.expires_in<=3600&&tokens.expires_in>3500,'Access token remains bounded to one hour');
 const documentId='qa-document',rfqId='qa-rfq';
 await website.prepare('INSERT INTO contractors(id,user_id,company_name,trade_license_number,emirate,address,contact_person,contact_phone,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind('qa-contractor',ownerId,'Private fixture company','QA123','Dubai','Private fixture address','Fixture owner','000',now).run();
 await website.prepare('INSERT INTO rfqs(id,reference_code,contractor_id,title,category,project_name,location_emirate,submission_deadline,scope_description,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(rfqId,'QA-RFQ','qa-contractor','Fixture scope','Painting','Private project','Dubai',new Date(Date.now()+86400000).toISOString(),'Fixture scope','submitted',now).run();
 const bytes=new TextEncoder().encode('%PDF-1.7 Fixture original bytes');
 await (await mf.getR2Bucket('DOCUMENTS_BUCKET','backend')).put('qa-original',bytes,{httpMetadata:{contentType:'application/pdf'}});
 await website.prepare('INSERT INTO rfq_documents(id,rfq_id,uploader_user_id,file_name,file_type,file_size_bytes,r2_object_key,document_purpose,created_at,standardization_status) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(documentId,rfqId,ownerId,'private-fixture.pdf','application/pdf',bytes.length,'qa-original','boq',now,'pending').run();
 const docRpc=async operation=>{const r=await send('/mcp',JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'urbanprocures_admin_document',arguments:{id:documentId,operation,contentJson:JSON.stringify({title:'Fixture BOQ',summary:'Supply fixture materials',rows:[{description:'Material',unit:'nos',quantity:'2'}],commercialTerms:'AED',warnings:[]})}}}),{'Content-Type':'application/json',Authorization:'Bearer '+tokens.access_token});return r.json();};
 const original=(await docRpc('preview_original')).result;check(!original.isError&&JSON.parse(original.content[0].text).base64===Buffer.from(bytes).toString('base64'),'Authenticated preview preserves original bytes');
 const correction=(await docRpc('correct_content')).result;check(!correction.isError&&JSON.parse(correction.content[0].text).httpStatus===200,'Authenticated correction uses backend workflow');
 const row=await website.prepare('SELECT vendor_access_approved,standardization_status FROM rfq_documents WHERE id=?').bind(documentId).first();check(row.vendor_access_approved===0&&row.standardization_status==='review_required','Correction resets document approval');
 const corrected=(await docRpc('preview_standardized')).result;check(!corrected.isError&&JSON.parse(corrected.content[0].text).mimeType==='application/pdf','Standardized preview records review access');
 const originalAgain=(await docRpc('preview_original')).result;check(JSON.parse(originalAgain.content[0].text).base64===Buffer.from(bytes).toString('base64'),'Correction does not overwrite original');
 check((await website.prepare("SELECT count(*) n FROM audit_logs WHERE resource_id=? AND action_type='STANDARD_DOCUMENT_ACCESS'").bind(documentId).first()).n===1,'Preview creates required backend review evidence');
 const previousAccess=tokens.access_token;
 await auth.prepare("UPDATE tokens SET expires=? WHERE kind='access'").bind(Math.floor(Date.now()/1000)-1).run();
 check((await rpc(previousAccess)).status===401,'Expired access denied');
 const refresh=await send('/token',new URLSearchParams({client_id,grant_type:'refresh_token',refresh_token:tokens.refresh_token}),{'Content-Type':'application/x-www-form-urlencoded'});check(refresh.status===200,'OAuth refresh survives absent website session');tokens=await refresh.json();check((await rpc(tokens.access_token)).status===200,'Renewed token authorizes Admin status');
 const grant=await website.prepare('SELECT expires_at,absolute_expires_at FROM admin_integration_grants').first();check(Date.parse(grant.expires_at)-Date.now()>29*86400000,'Thirty-day renewable grant');
 await website.prepare("UPDATE users SET status='suspended' WHERE id=?").bind(ownerId).run();check((await rpc(tokens.access_token)).status===401,'Disabled owner instantly denied');await website.prepare("UPDATE users SET status='active' WHERE id=?").bind(ownerId).run();
 const revoke=await send('/revoke',new URLSearchParams({client_id,token:tokens.refresh_token}),{'Content-Type':'application/x-www-form-urlencoded'});check(revoke.status===200,'Disconnect revokes OAuth family');check((await rpc(tokens.access_token)).status===401,'Disconnected access denied');check((await website.prepare('SELECT revoked_at FROM admin_integration_grants').first()).revoked_at,'Backend grant revoked');
 const loginAgain=await backend.fetch('https://urbanprocures.com/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'owner-runtime@example.invalid',password})});const normal=await loginAgain.json();check(loginAgain.status===200,'Ordinary website login unaffected');const ordinary=await website.prepare('SELECT expires_at FROM auth_sessions WHERE user_id=?').bind(ownerId).first();check(Date.parse(ordinary.expires_at)-Date.now()<28801000,'Normal website session remains eight hours');
 console.log(JSON.stringify({actualLocalWorkerdChecksPassed:checks,oauthCodePKCELoginRefreshRevoke:true,frontendChanged:false,remoteResourcesTouched:false}));
}finally{await mf.dispose()}
