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
for(const city of ['san-mateo','danville']){
 const slug=city+'-water-heater-replacement';
 const h=readFileSync(resolve(root,slug,'index.html'),'utf8');
 assert.ok(h.includes('form_id=5326861')&&!h.includes('2079447'),slug+': wrong Jobber form');
 assert.ok(h.includes('noindex,nofollow'),slug+': must stay out of organic search');
 assert.ok(h.includes('/scripts/jobber-landing-form.js')&&h.includes('/scripts/landing-attribution.js'),slug+': missing attribution');
 assert.ok(h.includes('$50 off 40- and 50-gallon')&&h.includes('$100 off 75-gallon'),slug+': missing winter offers');
 assert.ok(h.includes('CSLB License #1134458')&&h.includes('Water Heater<br><em>Replacement</em>'),slug+': missing approved header or license');
 assert.ok(!h.includes('Preview ·')&&!h.includes('<form'),slug+': preview or mock form');
}
console.log('Both city landing-page checks passed.');
