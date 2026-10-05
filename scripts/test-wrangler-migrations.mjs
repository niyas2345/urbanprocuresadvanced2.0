// Validate the same SQL splitter used by actual remote Wrangler migrations.
process.env.XDG_CONFIG_HOME??='/workspace/.config';
process.env.WRANGLER_SEND_METRICS='false';
const {unstable_splitSqlQuery}=await import('wrangler');
import {readdirSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root='urbanprocures advanced/database/migrations';let checks=0;
for(const name of readdirSync(root).filter(n=>n.endsWith('.sql')).sort()){
 const statements=unstable_splitSqlQuery(readFileSync(root+'/'+name,'utf8'));
 const complete=JSON.parse(execFileSync('python3',['-c','import json,sqlite3,sys; print(json.dumps([sqlite3.complete_statement(s+";") for s in json.load(sys.stdin)]))'],{input:JSON.stringify(statements),encoding:'utf8'}));
 if(complete.some(v=>!v))throw Error('Wrangler splits an incomplete SQLite statement in '+name);
 checks+=statements.length;
}
console.log(JSON.stringify({wranglerMigrationStatementsChecked:checks}));
