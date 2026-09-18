// Direct asset upload helper. Upload credentials are accepted only over stdin.
import {readFileSync, readdirSync} from 'node:fs';
import {resolve, relative, extname, join} from 'node:path';
import {createHash} from 'node:crypto';
import {createInterface} from 'node:readline';

const root = resolve('site/dist');
const manifest = {};
const files = new Map();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
function scan(dir) {
  for (const item of readdirSync(dir, {withFileTypes:true})) {
    const file = join(dir, item.name);
    if (item.isSymbolicLink()) throw new Error('Symlinks are not deployable');
    if (item.isDirectory()) { scan(file); continue; }
    const key = '/' + relative(root, file).replaceAll('\\', '/');
    if (key.startsWith('/workflow/')) continue;
    if (item.name.startsWith('.') || /\.(map|env)$/i.test(item.name)) throw new Error('Unexpected private build artifact');
    const data = readFileSync(file);
    if (extname(file) === '.html' && !/name="robots"[^>]*noindex/.test(data.toString())) throw new Error('Preview page lacks noindex: ' + key);
    const hash = createHash('sha256').update(data.toString('base64') + extname(file).slice(1)).digest('hex').slice(0,32);
    manifest[key] = {hash, size:data.length};
    files.set(hash, {data, type:types[extname(file)] || 'application/octet-stream'});
  }
}
scan(root);
if (process.argv.includes('--manifest')) {
  console.log(JSON.stringify(manifest));
} else {
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  const lines = createInterface({input:process.stdin, terminal:false});
  console.log('Ready for short-lived asset-upload session on stdin');
  lines.once('line', async line => {
    lines.close();
    try {
      const {jwt, buckets} = JSON.parse(line);
      let completion = buckets.length ? null : jwt;
      for (const bucket of buckets) {
        const form = new FormData();
        for (const hash of bucket) {
          const file = files.get(hash);
          if (!file) throw new Error('Upload manifest changed; recreate session');
          form.append(hash, new Blob([file.data.toString('base64')], {type:file.type}), hash);
        }
        const response = await fetch('https://api.cloudflare.com/client/v4/accounts/b40f136956186504f9e4861e69c3e110/workers/assets/upload?base64=true', {method:'POST', headers:{Authorization:`Bearer ${jwt}`}, body:form});
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error('Asset upload failed: HTTP ' + response.status);
        if (result.result?.jwt) completion = result.result.jwt;
      }
      if (!completion) throw new Error('No upload completion token received');
      // Machine-readable output: caller must capture and redact the token.
      console.log(JSON.stringify({completion, count:Object.keys(manifest).length}));
      process.exit(0);
    } catch (error) { console.error(error.message); process.exitCode=1; }
  });
}
