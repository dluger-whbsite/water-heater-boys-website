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
