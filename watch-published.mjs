import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const env=Object.fromEntries((await readFile('site/.env','utf8')).split(/\r?\n/).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)]}));
const query='*[_type == "completedJob" && !(_id in path("drafts.**"))]{_id,_rev} | order(_id)';
const url=`https://${env.PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2026-03-01/data/query/${env.PUBLIC_SANITY_DATASET}?query=${encodeURIComponent(query)}`;
let previous;let busy=false;
async function check(){if(busy)return;busy=true;try{const r=await fetch(url);if(!r.ok)throw Error(`CMS returned ${r.status}`);const json=await r.json();const state=JSON.stringify(json.result);if(state!==previous){console.log('Published content changed; rebuilding local preview.');await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['node_modules/astro/bin/astro.mjs','build','--root','site'],{stdio:'inherit',env:process.env});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error('Build failed; will retry.')))});previous=state;console.log('Local preview updated. Refresh the preview browser tab.')}}catch(e){console.error(e.message)}finally{busy=false}}
await check();setInterval(check,15000);
