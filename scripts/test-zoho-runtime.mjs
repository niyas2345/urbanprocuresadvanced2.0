import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
const bundle=await build({stdin:{resolveDir:process.cwd(),contents:`
import {createZohoMailTransport} from './urbanprocures advanced/workers/zohoMail.ts';
export default {async fetch(){
 let checks=0,requests=0;
 const check=value=>{if(!value)throw Error('Runtime assertion failed');checks++;};
 const config={clientId:'fixture-client',clientSecret:'fixture-secret',refreshToken:'fixture-refresh',accountId:'6991914000000008002',fromAddress:'urbanprocures@urbanprocures.com',mailOrigin:'https://mail.zoho.ae',accountsOrigin:'https://accounts.zoho.com'};
 const transport=createZohoMailTransport(config,{fetch:async(input,init)=>{
  // Actual workerd Request construction catches unsupported runtime options.
  const request=new Request(input,init);requests++;
  check(request.redirect==='manual');check(request.method==='POST');
  if(request.url==='https://accounts.zoho.com/oauth/v2/token'){
   const form=new URLSearchParams(await request.text());check(form.get('grant_type')==='refresh_token');check(form.get('client_secret')===config.clientSecret);
   return Response.json({access_token:'fixture-access',expires_in:3600});
  }
  check(request.url==='https://mail.zoho.ae/api/accounts/6991914000000008002/messages');check(request.headers.get('Authorization')==='Zoho-oauthtoken fixture-access');
  const body=await request.json();check(body.fromAddress===config.fromAddress);check(!('clientSecret' in body));return Response.json({status:{code:200}});
 }});
 try{
  check(await transport.authenticate()===undefined);await transport.send({toAddress:'fixture@example.invalid',subject:'Fixture',content:'Fixture'});check(requests===2);
  const redirect=createZohoMailTransport(config,{fetch:async()=>new Response(null,{status:302,headers:{Location:'https://attacker.example.invalid'}})});
  let refused=false;try{await redirect.authenticate();}catch(error){refused=error.providerCode==='redirect_refused';}check(refused);
  return Response.json({passed:true,checks,actualExternalMailSent:false});
 }catch(error){return Response.json({passed:false,error:error.message},{status:500});}
}};`},bundle:true,write:false,format:'esm',platform:'browser'});
const mf=new Miniflare(convertV4MiniflareOptions({cf:false,modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-01'}));
try{const result=await(await mf.dispatchFetch('http://localhost')).json();assert.equal(result.passed,true,result.error);console.log(JSON.stringify({...result,runtime:'actual workerd',providerHTTP:'explicit test double'}));}finally{await mf.dispose();}
