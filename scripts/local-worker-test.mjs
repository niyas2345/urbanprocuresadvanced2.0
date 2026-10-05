import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
export async function createLocalWorker() {
  const bundle=await build({entryPoints:['urbanprocures advanced/workers/index.ts'],bundle:true,write:false,format:'esm',platform:'browser'});
  return new Miniflare(convertV4MiniflareOptions({cf:false,modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-10-01',d1Databases:['DB'],r2Buckets:['DOCUMENTS_BUCKET'],bindings:{ENVIRONMENT:'advanced-development',PLATFORM_DOMAIN:'localhost'}}));
}
export async function applyMigrations(db) {
  // SQLite's parser preserves quoted newlines and trigger bodies in the actual publication SQL.
  const parser=`import pathlib,sqlite3,json
out=[]
for file in sorted(pathlib.Path('urbanprocures advanced/database/migrations').glob('*.sql')):
 text=file.read_text();buf=''
 for c in text:
  buf+=c
  if c==';' and sqlite3.complete_statement(buf):out.append(buf);buf=''
 if buf.strip():raise Exception('Incomplete migration '+str(file))
print(json.dumps(out))`;
  const statements=JSON.parse(execFileSync('python3',['-c',parser],{encoding:'utf8',maxBuffer:5000000}));
  for(const sql of statements)await db.prepare(sql).run();
}
