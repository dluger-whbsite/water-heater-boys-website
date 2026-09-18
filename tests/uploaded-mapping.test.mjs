import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {prepare,findImages} from '../migration/prepare.mjs';
const localAssets=existsSync('migration/source-images-indexed/inventory.json');
test('all supplied images resolve using recorded exact or reviewed mappings',{skip:!localAssets},()=>{
 const jobs=prepare();
 const map=JSON.parse(readFileSync('migration/prepared/file-map.json','utf8'));
 const matches=findImages(jobs,'migration/source-images-indexed',map);
 assert.equal(matches.length,70);
 assert.ok(matches.every(m=>m.status==='matched'));
 assert.notEqual(map['GT-041'],map['HP-004'],'Same-name Ryan images must stay separate');
 assert.equal(new Set(matches.map(m=>m.path)).size,70,'Each legacy record has a distinct selected file');
});
