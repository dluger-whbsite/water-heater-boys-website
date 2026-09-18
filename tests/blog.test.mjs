import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../worker-preview.mjs';

const root=path.resolve(import.meta.dirname,'..');
const source=fs.readFileSync(path.join(root,'blog-review/approved-blog-handoff.md'),'utf8').replace(/\r\n/g,'\n');
const files=fs.readdirSync(path.join(root,'site/src/content/blog')).filter(name=>name.endsWith('.md'));

test('all approved articles retain their body copy and one H1',()=>{
  assert.equal(files.length,13);
  for(const file of files){
    const content=fs.readFileSync(path.join(root,'site/src/content/blog',file),'utf8').replace(/\r\n/g,'\n');
    const number=Number(content.match(/^number: (\d+)$/m)?.[1]);
    const body=content.slice(content.indexOf('\n---\n',4)+5).trim();
    const anchor=number===9?'# Articles #9 and #17\n':`# Article #${number}\n`;
    const start=source.indexOf(anchor);
    assert.notEqual(start,-1,`article ${number} source`);
    const end=source.indexOf('\n---\n',start);
    const section=source.slice(start+anchor.length,end);
    const heading=section.match(/^# (.+)$/m)?.[0];
    assert.ok(heading,`article ${number} title`);
    assert.equal(body,section.slice(section.indexOf(heading)).trim(),`article ${number} copy`);
    assert.equal((body.match(/^# /gm)??[]).length,1,`article ${number} H1`);
  }
});

const env={ASSETS:{fetch:async()=>new Response('asset',{status:200})}};
test('merged Wix URLs have permanent redirects',async()=>{
  const response=await worker.fetch(new Request('https://example.com/post/should-i-switch-to-a-hybrid-electric-water-heater'),env);
  assert.equal(response.status,301);
  assert.match(response.headers.get('location'),/thinking-about-a-heat-pump-water-heater/);
});
test('retired posts return Gone rather than an unrelated article',async()=>{
  const response=await worker.fetch(new Request('https://example.com/post/tankless-water-heater-descaling-why-it-matters-and-how-often-you-should-do-it'),env);
  assert.equal(response.status,410);
});
