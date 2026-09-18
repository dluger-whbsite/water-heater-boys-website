import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../worker-production.mjs';

const root=path.resolve(import.meta.dirname,'..');
const env={ASSETS:{fetch:async()=>new Response('<html>ok</html>',{status:200,headers:{'Content-Type':'text/html'}})}};

test('legacy Wix service URLs permanently redirect to their replacement',async()=>{
  const cases={
    '/service-locations-bayarea':'/service-areas/',
    '/general-plumbing':'/services/plumbing/',
    '/services/gas-tank-water-heater-installation':'/services/gas-tank-water-heaters/',
    '/services/gas-tankless-water-heater-installations':'/services/tankless-water-heaters/',
    '/services/hybrid-heat-pump-water-heater-installations':'/services/heat-pump-water-heaters/',
    '/services/safety-valves':'/services/safety-shut-off-valves/',
    '/contact-us':'/#estimate',
    '/request-service':'/#estimate',
  };
  for(const [from,to] of Object.entries(cases)){
    const response=await worker.fetch(new Request(`https://www.waterheaterboys.com${from}`),env);
    assert.equal(response.status,301,from);
    assert.equal(new URL(response.headers.get('location')).pathname+new URL(response.headers.get('location')).hash,to,from);
  }
});

test('canonical trailing-slash pages do not redirect to themselves',async()=>{
  for(const page of ['/about-us/','/service-areas/','/services/plumbing/']){
    const response=await worker.fetch(new Request(`https://www.waterheaterboys.com${page}`),env);
    assert.equal(response.status,200,page);
  }
});

test('apex redirects to canonical www host',async()=>{
  const response=await worker.fetch(new Request('https://waterheaterboys.com/services/plumbing/?source=test'),env);
  assert.equal(response.status,301);
  assert.equal(response.headers.get('location'),'https://www.waterheaterboys.com/services/plumbing/?source=test');
});

test('production worker blocks internal workflow and protects missing pages from indexing',async()=>{
  const workflow=await worker.fetch(new Request('https://www.waterheaterboys.com/workflow/'),env);
  assert.equal(workflow.status,404);
  assert.match(workflow.headers.get('x-robots-tag'),/noindex/);
  const missingEnv={ASSETS:{fetch:async()=>new Response('missing',{status:404})}};
  const missing=await worker.fetch(new Request('https://www.waterheaterboys.com/not-a-page'),missingEnv);
  assert.match(missing.headers.get('x-robots-tag'),/noindex/);
});

test('launch pages exist and footer links point to local routes',()=>{
  for(const page of ['faqs.astro','privacy-policy.astro','disclaimer.astro']){
    assert.ok(fs.existsSync(path.join(root,'site/src/pages',page)),page);
  }
  for(const file of ['site/src/components/ApprovedHome.tsx','site/src/layouts/ServiceLayout.astro']){
    const content=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(content,/href="\/privacy-policy\/"/);
    assert.match(content,/href="\/disclaimer\/"/);
    assert.match(content,/href="\/faqs\/"/);
  }
});
