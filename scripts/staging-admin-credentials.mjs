import {readFile} from 'node:fs/promises';
const origin='https://urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev';
export async function stagingAdminCredentials(){
 if(process.env.STAGING_QA_CREDENTIAL_FILE)return JSON.parse(await readFile(process.env.STAGING_QA_CREDENTIAL_FILE));
 // The previous disposable credential file may not survive environment publication.
 // Reuse the approved owner runtime binding without resetting or creating an Admin.
 if(process.env.ADMIN_BOOTSTRAP_EMAIL==='urbanprocures@urbanprocures.com'&&process.env.ADMIN_INITIAL_PASSWORD){
  return {origin,adminEmail:process.env.ADMIN_BOOTSTRAP_EMAIL,adminPassword:process.env.ADMIN_INITIAL_PASSWORD};
 }
 return JSON.parse(await readFile('/tmp/urbanprocures-staging-qa.json'));
}
