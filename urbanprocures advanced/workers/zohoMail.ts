import type {Env} from './index.ts';

const providers:Record<string,string>={
 'https://mail.zoho.ae':'https://accounts.zoho.ae',
 'https://mail.zoho.com':'https://accounts.zoho.com',
 'https://mail.zoho.eu':'https://accounts.zoho.eu',
 'https://mail.zoho.in':'https://accounts.zoho.in',
 'https://mail.zoho.com.au':'https://accounts.zoho.com.au',
 'https://mail.zoho.jp':'https://accounts.zoho.jp',
 'https://mail.zoho.ca':'https://accounts.zohocloud.ca'
};
export type ZohoConfiguration={clientId:string;clientSecret:string;refreshToken:string;accountId:string;fromAddress:string;mailOrigin:string;accountsOrigin?:string};
export type MailMessage={toAddress:string;subject:string;content:string};
const safeOAuthCodes=new Set(['invalid_client','invalid_client_secret','invalid_clientid','invalid_code','invalid_grant','invalid_refresh_token','invalid_scope','invalid_request','unauthorized_client','access_denied','temporarily_unavailable']);
export class ZohoOAuthError extends Error {
 constructor(public readonly providerStatus?:number,public readonly providerCode?:string){super('EMAIL_AUTHENTICATION_UNAVAILABLE');}
}
export function zohoConfiguration(env:Env):ZohoConfiguration|null {
 if(!env.ZOHO_CLIENT_ID||!env.ZOHO_CLIENT_SECRET||!env.ZOHO_REFRESH_TOKEN||!env.ZOHO_MAIL_ACCOUNT_ID||!env.ZOHO_MAIL_FROM_ADDRESS||!env.ZOHO_MAIL_API_ORIGIN)return null;
 return {clientId:env.ZOHO_CLIENT_ID,clientSecret:env.ZOHO_CLIENT_SECRET,refreshToken:env.ZOHO_REFRESH_TOKEN,accountId:env.ZOHO_MAIL_ACCOUNT_ID,fromAddress:env.ZOHO_MAIL_FROM_ADDRESS,mailOrigin:env.ZOHO_MAIL_API_ORIGIN,accountsOrigin:env.ZOHO_ACCOUNTS_API_ORIGIN};
}
export function validZohoConfiguration(config:ZohoConfiguration) {
 return Object.hasOwn(providers,config.mailOrigin)&&(!config.accountsOrigin||Object.values(providers).includes(config.accountsOrigin))&&/^\d+$/.test(config.accountId)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.fromAddress);
}
// This factory is server-only. Access tokens and OAuth credentials never enter API responses.
export function createZohoMailTransport(config:ZohoConfiguration,dependencies:{fetch?:typeof fetch;now?:()=>number}={}) {
 if(!validZohoConfiguration(config))throw Error('EMAIL_CONFIGURATION_INVALID');
 const fetcher=dependencies.fetch??fetch,now=dependencies.now??Date.now;
 let cached:{token:string;expiresAt:number}|null=null,inFlight:Promise<string>|null=null;
 const accessToken=async():Promise<string>=>{
  if(cached&&cached.expiresAt>now())return cached.token;
  if(inFlight)return inFlight;
  inFlight=(async()=>{
   try {
    const response=await fetcher((config.accountsOrigin??providers[config.mailOrigin])+'/oauth/v2/token',{
     method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),
     headers:{'Content-Type':'application/x-www-form-urlencoded'},
     body:new URLSearchParams({grant_type:'refresh_token',client_id:config.clientId,client_secret:config.clientSecret,refresh_token:config.refreshToken})
    });
    let data:any;try{data=await response.json();}catch{throw new ZohoOAuthError(response.status,'unexpected_response');}
    const seconds=Number(data.expires_in??data.expires_in_sec);
    if(!response.ok||data.error||typeof data.access_token!=='string'||!data.access_token||data.access_token.length>4096||!Number.isFinite(seconds)||seconds<=0)throw new ZohoOAuthError(response.status,safeOAuthCodes.has(data.error)?data.error:'invalid_token_response');
    // Refresh before provider expiry; cap excessively long lifetimes conservatively.
    const lifetime=Math.min(seconds,3600),margin=Math.min(60,lifetime/10);
    cached={token:data.access_token,expiresAt:now()+(lifetime-margin)*1000};return cached.token;
   }catch(error){cached=null;throw error instanceof ZohoOAuthError?error:new ZohoOAuthError(undefined,'transport_failure');}
  })();
  try{return await inFlight;}finally{inFlight=null;}
 };
 return {async authenticate():Promise<void>{await accessToken();},async send(message:MailMessage):Promise<void> {
  for(let attempt=0;attempt<2;attempt++){
   const token=await accessToken();
   let response:Response,data:any;
   try {
    response=await fetcher(`${config.mailOrigin}/api/accounts/${encodeURIComponent(config.accountId)}/messages`,{
     method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),
     headers:{Authorization:'Zoho-oauthtoken '+token,'Content-Type':'application/json'},
     body:JSON.stringify({fromAddress:config.fromAddress,...message,mailFormat:'plaintext'})
    });data=await response.json();
   }catch{throw Error('EMAIL_DELIVERY_UNAVAILABLE');}
   if((response.status===401||Number(data?.status?.code)===401)&&attempt===0){
    if(cached?.token===token)cached=null;
    continue;
   }
   if(!response.ok||Number(data?.status?.code)!==200)throw Error('EMAIL_DELIVERY_UNAVAILABLE');
   return;
  }
  throw Error('EMAIL_DELIVERY_UNAVAILABLE');
 }};
}
const transports=new Map<string,ReturnType<typeof createZohoMailTransport>>();
async function transportFor(env:Env) {
 const config=zohoConfiguration(env);if(!config)throw Error('EMAIL_NOT_CONFIGURED');
 // Separate cache entries after credential rotation, without retaining raw credentials as keys.
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(config)));
 const key=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
 let transport=transports.get(key);
 if(!transport){transport=createZohoMailTransport(config);if(transports.size>=8)transports.delete(transports.keys().next().value!);transports.set(key,transport);}
 return transport;
}
export async function sendZohoMail(env:Env,message:MailMessage) {
 await (await transportFor(env)).send(message);
}
export async function verifyZohoAuthentication(env:Env):Promise<void> {
 await (await transportFor(env)).authenticate();
}
