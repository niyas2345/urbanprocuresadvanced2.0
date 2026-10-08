import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkIsolation(source) {
  const errors = [];
  const requireValue = (key, value) => {
    if (!new RegExp(`^${key}\\s*=\\s*"${value}"\\s*$`, 'm').test(source)) errors.push(`Expected ${key}=${value}`);
  };
  requireValue('name', 'urbanprocures-advanced-worker');
  requireValue('ENVIRONMENT', 'advanced-development|advanced-staging');
  requireValue('database_name', 'urbanprocures-advanced-db');
  requireValue('bucket_name', 'urbanprocures-advanced-documents');
  if (!/^workers_dev\s*=\s*false\s*$/m.test(source)) errors.push('workers_dev must remain disabled');
  const active = source.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');
  if (/urbanprocures\.com/i.test(active)) errors.push('Production domain is forbidden');
  if (/^\s*(routes?|account_id|zone_id)\s*=|^\s*\[env\./m.test(active)) errors.push('Routes/accounts/extra environments require separate audited configuration');
  if (/\[\[?(queues|kv_namespaces)/.test(active)) errors.push('Unrequired queue/KV bindings must remain absent');
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const configIndex=process.argv.indexOf('--config');
  const filename=configIndex>=0?process.argv[configIndex+1]:new URL('../urbanprocures%20advanced/workers/wrangler.toml',import.meta.url);
  const config=fs.readFileSync(filename,'utf8');
  let errors;
  if(configIndex>=0){
    const expected={name:'urbanprocures-advanced-staging-20261005',account_id:'dcb411ece67dfdfb730635133ed31825',ENVIRONMENT:'advanced-staging',PLATFORM_DOMAIN:'urbanprocures-advanced-staging-20261005.abdeenniyas23.workers.dev',database_name:'urbanprocures-advanced-staging-20261005-db',bucket_name:'urbanprocures-advanced-staging-20261005-documents'};
    errors=[];for(const [key,value]of Object.entries(expected)){if(!new RegExp('^'+key+'\\s*=\\s*"'+value.replaceAll('.','\\.')+'"\\s*$','m').test(config))errors.push('Unexpected staging '+key);}
    const active=config.split('\n').filter(line=>!line.trim().startsWith('#')).join('\n');
    if(/urbanprocures\.com|^\s*(routes?|zone_id)\s*=|^\s*\[env\./m.test(active))errors.push('Staging cannot modify production domains or extra environments');
    if(!/^workers_dev\s*=\s*true\s*$/m.test(config))errors.push('Expected isolated workers.dev staging');
    if(/\[\[?(queues|kv_namespaces)/.test(active))errors.push('Unexpected staging KV/Queue bindings');
    for(const table of ['d1_databases','r2_buckets'])if((active.match(new RegExp('^\\[\\['+table+'\\]\\]','gm'))||[]).length!==1)errors.push('Exactly one staging '+table+' binding required');
    for(const key of Object.keys(expected))if((active.match(new RegExp('^'+key+'\\s*=','gm'))||[]).length!==1)errors.push('Duplicate staging '+key);
    if(!/^main\s*=\s*"index\.ts"\s*$/m.test(active)||!/^directory\s*=\s*"\.\.\/\.\.\/dist"\s*$/m.test(active))errors.push('Unexpected Worker/asset source path');
    const bindings=[...active.matchAll(/^binding\s*=\s*"([^"]+)"/gm)].map(m=>m[1]).sort();
    if(!/^\[ai\]\s*\nbinding\s*=\s*"AI"\s*$/m.test(active))errors.push('Expected document-processing AI binding');
    if(JSON.stringify(bindings)!==JSON.stringify(['AI','ASSETS','DB','DOCUMENTS_BUCKET']))errors.push('Unexpected staging binding');
    if(!process.argv.includes('--provision')){
      const evidence=JSON.parse(fs.readFileSync(new URL('../deployment/staging-resources.json',import.meta.url),'utf8'));
      const id=active.match(/^database_id\s*=\s*"([^"]+)"/m)?.[1];
      if(id!==evidence.stagingDatabaseId||evidence.stagingDatabaseName!==expected.database_name||evidence.stagingBucket!==expected.bucket_name||evidence.accountId!==expected.account_id)errors.push('Binding identity differs from independently provisioned staging evidence');
    }

  }else errors=checkIsolation(config);
  if(process.argv.includes('--remote')&&!process.argv.includes('--provision')&&/database_id\s*=\s*"00000000-0000-0000-0000-000000000000"/.test(config))errors.push('Remote infrastructure is not provisioned; placeholder D1 ID is forbidden for deployment/migrations');
  if(process.argv.includes('--provision')&&configIndex<0)errors.push('Provisioning requires explicit verified staging configuration');
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('Advanced configuration isolation passed. This does not certify migrations, APIs, or remote resource identity.');
}
