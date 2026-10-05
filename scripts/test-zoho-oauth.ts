import assert from 'node:assert/strict';
import {createZohoMailTransport,zohoConfiguration,validZohoConfiguration} from '../urbanprocures advanced/workers/zohoMail.ts';
import type {Env} from '../urbanprocures advanced/workers/index.ts';
const config={clientId:'fixture-client',clientSecret:'fixture-secret',refreshToken:'fixture-refresh',accountId:'6991914000000008002',fromAddress:'urbanprocures@urbanprocures.com',mailOrigin:'https://mail.zoho.ae'};
const message={toAddress:'qa@example.invalid',subject:'Fixture',content:'Fixture content'};
let checks=0;
const verify=(value:unknown,label:string)=>{assert.ok(value,label);checks++;};
const json=(body:unknown,status=200)=>Response.json(body,{status});
let clock=0,refreshes=0,messages=0,unauthorized=0;
const fetcher:typeof fetch=async(input,init)=>{
 const url=String(input);
 verify(init?.redirect==='error','credentials cannot follow redirects');
 verify(!!init?.signal,'provider call has bounded timeout');
 if(url.endsWith('/oauth/v2/token')){
  verify(url==='https://accounts.zoho.ae/oauth/v2/token','refresh uses UAE Accounts endpoint');
  const form=new URLSearchParams(String(init?.body));
  verify(form.get('grant_type')==='refresh_token'&&form.get('client_id')===config.clientId&&form.get('client_secret')===config.clientSecret&&form.get('refresh_token')===config.refreshToken,'refresh credentials sent only in server POST body');
  refreshes++;return json({access_token:'fixture-access-'+refreshes,expires_in:3600});
 }
 verify(url==='https://mail.zoho.ae/api/accounts/6991914000000008002/messages','Mail uses configured UAE account');
 verify(new Headers(init?.headers).get('Authorization')==='Zoho-oauthtoken fixture-access-'+refreshes,'Mail request uses refreshed credential');
 const body=String(init?.body),data=JSON.parse(body);
 verify(data.fromAddress===config.fromAddress&&data.toAddress===message.toAddress&&data.mailFormat==='plaintext','Mail sender and recipient are explicit');
 verify(!body.includes(config.clientSecret)&&!body.includes(config.refreshToken),'OAuth credentials absent from Mail content');
 messages++;if(unauthorized-->0)return json({status:{code:401}},401);
 return json({status:{code:200}});
};
const transport=createZohoMailTransport(config,{fetch:fetcher,now:()=>clock});
verify(await transport.authenticate()===undefined,'authentication probe returns no access token');
verify(messages===0,'authentication probe sends no email');
await Promise.all([transport.send(message),transport.send(message)]);
verify(refreshes===1&&messages===2,'concurrent sends share one OAuth refresh');
clock=3539000;await transport.send(message);verify(refreshes===1,'unexpired token reused');
clock=3540000;await transport.send(message);verify(refreshes===2,'token refreshed before expiry');
unauthorized=1;await transport.send(message);verify(refreshes===3,'provider 401 invalidates cache and refreshes once');
unauthorized=3;await assert.rejects(transport.send(message),/^Error: EMAIL_DELIVERY_UNAVAILABLE$/);checks++;verify(refreshes===4,'persistent 401 does not create retry loop');
for(const bad of [{error:'invalid_grant',error_description:config.clientSecret},{access_token:'fixture',expires_in:0},{access_token:'fixture'},{access_token:'fixture',expires_in:'invalid'}]){
 let calls=0;const failed=createZohoMailTransport(config,{fetch:async()=>{calls++;return json(bad);}});
 await assert.rejects(failed.send(message),/^Error: EMAIL_AUTHENTICATION_UNAVAILABLE$/);checks++;verify(calls===1,'invalid refresh never attempts Mail delivery');
}
let failures=0;const retryAfterFailure=createZohoMailTransport(config,{fetch:async(input)=>{
 if(String(input).endsWith('/oauth/v2/token')){failures++;return failures===1?json({error:'temporarily_unavailable'},503):json({access_token:'fixture',expires_in:3600});}
 return json({status:{code:200}});
}});
await assert.rejects(retryAfterFailure.send(message),/^Error: EMAIL_AUTHENTICATION_UNAVAILABLE$/);checks++;
await retryAfterFailure.send(message);verify(failures===2,'failed refresh releases promise for subsequent recovery');
const providerFailure=createZohoMailTransport(config,{fetch:async(input)=>String(input).endsWith('/oauth/v2/token')?json({access_token:'fixture',expires_in:3600}):json({status:{code:500}})});
await assert.rejects(providerFailure.send(message),/^Error: EMAIL_DELIVERY_UNAVAILABLE$/);checks++;
verify(!validZohoConfiguration({...config,mailOrigin:'https://attacker.example.invalid'}),'unapproved endpoint rejected');
verify(!validZohoConfiguration({...config,accountId:'../other-account'}),'account path injection rejected');
verify(!validZohoConfiguration({...config,fromAddress:'invalid\r\naddress'}),'invalid sender rejected');
verify(zohoConfiguration({ZOHO_MAIL_ACCESS_TOKEN:'legacy-fixture',ZOHO_MAIL_ACCOUNT_ID:config.accountId,ZOHO_MAIL_FROM_ADDRESS:config.fromAddress,ZOHO_MAIL_API_ORIGIN:config.mailOrigin} as unknown as Env)===null,'manually stored access token cannot configure transport');
console.log(JSON.stringify({oauthContractChecksPassed:checks,transport:'explicit HTTP test double',actualZohoDeliveryTested:false,secretsUsed:false}));
