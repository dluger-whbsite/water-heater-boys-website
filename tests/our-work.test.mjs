import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative),'utf8');

test('Our Work route builds with accessible filters and all water-heater categories',()=>{
 const page=path.join(root,'site/dist/our-work/index.html');
 assert.ok(fs.existsSync(page),'Build the site before running portfolio checks');
 const html=fs.readFileSync(page,'utf8');
 for(const label of ['All work','Gas tank','Tankless','Heat pump','Plumbing'])assert.match(html,new RegExp(`>${label}<`));
 for(const category of ['gas-tank','tankless','heat-pump'])assert.match(html,new RegExp(`data-category="${category}"`));
 assert.match(html,/aria-pressed="true"/);
 assert.match(html,/id="work-empty"/);
});

test('primary navigation includes Our Work and Blog everywhere',()=>{
 for(const file of ['site/src/components/ApprovedHome.tsx','site/src/layouts/ServiceLayout.astro','site/src/layouts/LegalLayout.astro']){
  const source=read(file);
  assert.match(source,/href="\/our-work\/">Our work/);
  assert.match(source,/href="\/blog\/">Blog/);
 }
 const home=read('site/src/components/ApprovedHome.tsx');
 assert.match(home,/href="\/our-work\/">See more installations/);
});

test('service pages request only their matching published job category',()=>{
 const cases={
  'site/src/pages/services/gas-tank-water-heaters.astro':'gas-tank',
  'site/src/pages/services/tankless-water-heaters.astro':'tankless',
  'site/src/pages/services/heat-pump-water-heaters.astro':'heat-pump',
  'site/src/pages/services/plumbing.astro':'plumbing',
 };
 for(const [file,category] of Object.entries(cases))assert.match(read(file),new RegExp(`serviceJobs\\(await loadJobs\\(\\),'${category}'\\)`));
});

test('water-heater service pages place the portfolio before the condensed information section',()=>{
 const gas=read('site/src/pages/services/gas-tank-water-heaters.astro');
 assert.ok(gas.indexOf('id="work"')<gas.indexOf('service-info'));
 const shared=read('site/src/components/ServicePage.astro');
 assert.ok(shared.indexOf('id="work"')<shared.indexOf('service-info'));
});

test('sitemap includes Our Work and established legal routes',()=>{
 const xml=read('site/dist/sitemap.xml');
 for(const route of ['/our-work/','/privacy-policy/','/disclaimer/'])assert.match(xml,new RegExp(`<loc>https://www\\.waterheaterboys\\.com${route}</loc>`));
});
