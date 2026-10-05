import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const urls = execFileSync('git', ['remote', 'get-url', '--all', 'origin'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
const pushUrls = execFileSync('git', ['remote', 'get-url', '--push', '--all', 'origin'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
const allowed = new Set([
  'https://github.com/niyas2345/urbanprocuresadvanced2.0',
  'https://github.com/niyas2345/urbanprocuresadvanced2.0.git',
  'git@github.com:niyas2345/urbanprocuresadvanced2.0.git',
]);
if ([...urls, ...pushUrls].some(url => !allowed.has(url))) {
  console.error('Repository boundary failed: only niyas2345/urbanprocuresadvanced2.0 is authorized.');
  process.exitCode = 1;
} else console.log('Repository boundary passed: niyas2345/urbanprocuresadvanced2.0 only.');
