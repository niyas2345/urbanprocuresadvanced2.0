// Prepare an owner-specific bootstrap without creating accounts or printing credentials.
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['scripts/check-repository.mjs'],{stdio:'inherit'});
const email=process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_INITIAL_PASSWORD;
if(!email||!/^\S+@\S+\.\S+$/.test(email)||!password||password.length<16||password.length>128)throw Error('Configure ADMIN_BOOTSTRAP_EMAIL and ADMIN_INITIAL_PASSWORD (16–128 characters) securely; no default account exists.');
const salt=randomBytes(32).toString('hex'),hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex'),id=crypto.randomUUID(),now=new Date().toISOString();
const quote=value=>"'"+value.replaceAll("'","''")+"'";
const sql=`BEGIN;\nINSERT INTO users (id,email,password_hash,salt,role,status,created_at,updated_at) VALUES (${[id,email,hash,salt,'admin','active',now,now].map(quote).join(',')});\nINSERT INTO audit_logs (id,actor_user_id,actor_role,action_type,resource_type,resource_id,payload_json,timestamp) VALUES (${[crypto.randomUUID(),id,'admin','OWNER_ADMIN_BOOTSTRAP','user',id,'{}',now].map(quote).join(',')});\nCOMMIT;\n`;
const target='/tmp/urbanprocures-admin-bootstrap.sql';writeFileSync(target,sql,{mode:0o600,flag:'wx'});
console.log('Prepared restricted SQL at /tmp/urbanprocures-admin-bootstrap.sql. No database was modified. Apply only after verifying the isolated staging database identity; remove the file afterward.');
