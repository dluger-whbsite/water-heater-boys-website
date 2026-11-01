import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'site/dist');
for(const [slug,id,offer] of [['40-gallon-gas-water-heater-replacement','5308180','$1,800 installed.'],['50-gallon-gas-water-heater-replacement','5308159','$1,900 installed.'],['75-gallon-gas-water-heater-replacement','5308187','SAVE $100'],['gas-tank-replacement','5326861','$100 off 75-gallon']]){
 const h=readFileSync(resolve(root,slug,'index.html'),'utf8');
 assert.ok(h.includes('form_id='+id),slug+': wrong Jobber form');
 assert.ok(!h.includes('2079447'),slug+': retired form');
 assert.ok(h.includes(offer),slug+': missing approved offer');
 assert.ok(h.includes('Request a callback.'),slug+': outdated form instructions');
 assert.ok(h.includes('/scripts/jobber-landing-form.js')&&h.includes('/scripts/landing-attribution.js'),slug+': missing attribution');
 if(slug.startsWith('75')){assert.ok(h.includes('/assets/brand/75-gallon-installation.png'));assert.ok(!/\$3,200|\$1,900|\$1,800/.test(h));}
}
console.log('All four landing-page form, offer, and attribution checks passed.');
