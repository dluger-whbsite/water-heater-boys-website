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
    assert.match(html,/Read our 100\+ reviews ↗/);
    assert.doesNotMatch(html,/Read our 98 reviews/);
  });
}

test('all three landing pages use the main homepage hero photo at the top',async()=>{
  for(const size of ['40','50','75']){
    const html=await readFile(join(root,`${size}-gallon-gas-water-heater-replacement`,'index.html'),'utf8');
    assert.match(html,/<img class="hero-photo" src="\/assets\/brand\/water-heater-boys-hero\.jpg"/);
    assert.equal((html.match(/src="\/assets\/brand\/water-heater-boys-hero\.jpg"/g)||[]).length,1);
  }
});

test('only the 75-gallon page keeps its approved lower installation photo',async()=>{
  const forty=await readFile(join(root,'40-gallon-gas-water-heater-replacement','index.html'),'utf8');
  const fifty=await readFile(join(root,'50-gallon-gas-water-heater-replacement','index.html'),'utf8');
  const seventyFive=await readFile(join(root,'75-gallon-gas-water-heater-replacement','index.html'),'utf8');
  const lowerSeventyFivePhoto='63bb1a1902c009cf2d540e27c8984edbfbda9483';

  assert.doesNotMatch(forty,new RegExp(lowerSeventyFivePhoto));
  assert.doesNotMatch(fifty,new RegExp(lowerSeventyFivePhoto));
  assert.match(seventyFive,new RegExp(lowerSeventyFivePhoto));
  const retiredUpperPhotos=/035206e64855275cdfd345eefcbd2081fbb45ecd|19de1ea10dbe10bb67e6251c17c89f3ad54cbbd9|809fd11cbb25fa0e64dcdb67e5b5b1cb316dcf76|ccbeae2a7f8b3aea6a453effb588103bc8e46129|bradford-white-50-gallon\.png/;
  assert.doesNotMatch(forty,retiredUpperPhotos);
  assert.doesNotMatch(fifty,retiredUpperPhotos);
  assert.doesNotMatch(seventyFive,/ccbeae2a7f8b3aea6a453effb588103bc8e46129|bradford-white-50-gallon\.png/);
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
