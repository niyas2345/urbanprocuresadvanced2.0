import assert from 'node:assert/strict';
import {createZohoMailTransport,ZohoDeliveryError} from '../urbanprocures advanced/workers/zohoMail.ts';
const config={clientId:'fixture',clientSecret:'fixture-secret',refreshToken:'fixture-refresh',accountId:'123',fromAddress:'owner@example.invalid',mailOrigin:'https://mail.zoho.ae',accountsOrigin:'https://accounts.zoho.com'};
let checks=0;
for(const [response,expected,status] of [
 [Response.json({status:{code:401},data:{errorCode:'INVALID_TOKEN',description:'secret must not leak'}},{status:401}),'INVALID_TOKEN',401],
 [Response.json({status:{code:403},data:{errorCode:'INVALID_OAUTHSCOPE'}},{status:403}),'INVALID_OAUTHSCOPE',403],
 [Response.json({status:{code:400},data:{errorCode:'fixture-secret'}}),'provider_rejected',200],
 [new Response('fixture-secret',{status:502}),'unexpected_response',502],
 [new Response(null,{status:302,headers:{Location:'https://attacker.example.invalid'}}),'redirect_refused',302]
] as const){
 const transport=createZohoMailTransport(config,{fetch:async(url)=>String(url).includes('/oauth/')?Response.json({access_token:'fixture-token',expires_in:3600}):response.clone()});
 try{await transport.send({toAddress:'fixture@example.invalid',subject:'Fixture',content:'Fixture'});assert.fail('Expected rejection');}
 catch(error){assert.ok(error instanceof ZohoDeliveryError);assert.equal(error.providerCode,expected);assert.equal(error.providerStatus,status);assert.ok(!JSON.stringify(error).includes('fixture-secret'));checks+=4;}
}
console.log(JSON.stringify({safeMailDiagnosticChecks:checks,providerHTTP:'explicit double',externalMailSent:false}));
