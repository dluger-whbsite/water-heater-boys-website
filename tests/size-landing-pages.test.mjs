import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=join(process.cwd(),'site','dist');

for(const size of ['40','50','75']){
  test(`${size}-gallon paid landing page is size-specific and trackable`,async()=>{
    const html=await readFile(join(root,`${size}-gallon-gas-water-heater-replacement`,'index.html'),'utf8');
    assert.match(html,new RegExp(`<title>${size}-Gallon Gas Water Heater Replacement`));
    assert.match(html,new RegExp(`${size}-GALLON GAS WATER HEATER REPLACEMENT`));
    assert.match(html,new RegExp(`${size}-gallon replacement`, 'i'));
    assert.match(html,/name="robots" content="noindex,nofollow"/);
    assert.match(html,/\(650\) 844-2305/);
    assert.doesNotMatch(html,/925[) .-]*788[ .-]*4555/);
    assert.match(html,/form_id=2079447/);
    assert.match(html,/G-JLE3QE7HQ4/);
    assert.match(html,/whb_phone_click/);
    assert.match(html,/whb_quote_click/);
    assert.match(html,new RegExp(`const tankSize = \"${size}\"`));
    assert.match(html,/tank_size:\s*`\$\{tankSize\}_gallon`/);
  });
}

test('40- and 75-gallon pages do not reuse the 50-gallon product cutout',async()=>{
  for(const size of ['40','75']){
    const html=await readFile(join(root,`${size}-gallon-gas-water-heater-replacement`,'index.html'),'utf8');
    assert.doesNotMatch(html,/bradford-white-50-gallon\.png/);
  }
});

test('size-specific paid offers use only the approved prices',async()=>{
  const forty=await readFile(join(root,'40-gallon-gas-water-heater-replacement','index.html'),'utf8');
  const fifty=await readFile(join(root,'50-gallon-gas-water-heater-replacement','index.html'),'utf8');
  const seventyFive=await readFile(join(root,'75-gallon-gas-water-heater-replacement','index.html'),'utf8');

  assert.match(forty,/\$1,850 installed/);
  assert.match(forty,/qualifying standard 40-gallon gas water heater replacements/);
  assert.doesNotMatch(forty,/\$1,950/);

  assert.match(fifty,/\$1,950 installed/);
  assert.match(fifty,/qualifying standard 50-gallon gas water heater replacements/);
  assert.doesNotMatch(fifty,/\$1,850/);

  assert.doesNotMatch(seventyFive,/\$1,850|\$1,950/);
  assert.match(seventyFive,/job-specific quote for a 75-gallon replacement/);
});
