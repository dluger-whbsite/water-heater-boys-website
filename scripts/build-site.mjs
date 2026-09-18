import {spawnSync} from 'node:child_process';
import path from 'node:path';

const production=process.argv.includes('--production');
const astro=path.resolve('node_modules/astro/bin/astro.mjs');
const result=spawnSync(process.execPath,[astro,'build','--root','site'],{
  stdio:'inherit',
  env:{...process.env,PUBLIC_SITE_MODE:production?'production':'preview'},
});

process.exit(result.status??1);
