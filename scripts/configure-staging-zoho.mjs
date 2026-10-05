import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const config='urbanprocures advanced/workers/wrangler.staging.toml';
for(const args of [['scripts/check-repository.mjs'],['scripts/check-isolation.mjs','--remote','--config',config]]){
 const check=spawnSync(process.execPath,args,{stdio:'inherit'});if(check.status!==0)process.exit(check.status??1);
}
const resources=JSON.parse(readFileSync('deployment/staging-resources.json','utf8'));
if(resources.accountId!=='dcb411ece67dfdfb730635133ed31825'||resources.stagingWorker!=='urbanprocures-advanced-staging-20261005')throw Error('Unexpected staging target');
const secrets={};
for(const name of ['ZOHO_CLIENT_ID','ZOHO_CLIENT_SECRET','ZOHO_REFRESH_TOKEN']){
 if(!process.env[name])throw Error('Securely configure '+name+' in environment settings before binding staging.');
 secrets[name]=process.env[name];
}
// The approved sender is a Worker binding, not a production domain route.
secrets.ZOHO_MAIL_FROM_ADDRESS='urbanprocures@urbanprocures.com';
const result=spawnSync('npx',['wrangler','secret','bulk','--config',config],{
 input:JSON.stringify(secrets),encoding:'utf8',stdio:['pipe','pipe','pipe'],
 env:{...process.env,CLOUDFLARE_ACCOUNT_ID:resources.accountId,XDG_CONFIG_HOME:'/workspace/.config',WRANGLER_SEND_METRICS:'false'}
});
// Never echo provider output: a failed command may contain sensitive request details.
if(result.status!==0)throw Error('Staging secret binding failed; no credential values or provider output were logged.');
console.log('OAuth credentials bound only to the independent Advanced staging Worker. No email was sent.');
