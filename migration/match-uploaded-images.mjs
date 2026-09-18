import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {prepare} from './prepare.mjs';
const images=JSON.parse(readFileSync('migration/source-images-indexed/inventory.json','utf8').replace(/^\uFEFF/,''));
const unique=items=>[...new Map(items.map(i=>[i.sha256,i])).values()];
const map={},review=[];
for(const job of prepare()){
 const exact=images.filter(i=>i.entry===job.legacyImageFilename);
 const category=exact.filter(i=>i.category===job.serviceType);
 const candidates=unique(category.length?category:exact);
 if(candidates.length===1)map[job.legacyId]=candidates[0].path;
 else {
  const stem=job.legacyImageFilename.replace(/\.(jpg|jpeg|png|jfif|heic)$/i,'').replace(/(_edited)+$/,'');
  const suggested=images.filter(i=>i.entry.startsWith(stem));
  review.push({id:job.legacyId,category:job.serviceType,expected:job.legacyImageFilename,title:job.title,candidates:(candidates.length?candidates:unique(suggested)).map(i=>({path:i.path,name:i.entry,category:i.category,bytes:i.bytes}))});
 }
}
const overrides=JSON.parse(readFileSync('migration/reviewed-image-overrides.json','utf8'));
for(const [id,override] of Object.entries(overrides)){
 if(!images.some(i=>i.path.replaceAll('\\','/')===override.path))throw Error(`Override file missing: ${id}`);
 map[id]=override.path;
}
if(existsSync('migration/prepared/conversions.json')){
 for(const conversion of JSON.parse(readFileSync('migration/prepared/conversions.json','utf8'))){
  const data=readFileSync(`migration/source-images-indexed/${conversion.output}`);
  if(createHash('sha256').update(data).digest('hex')!==conversion.outputSha256)throw Error(`Converted image changed: ${conversion.id}`);
  map[conversion.id]=conversion.output;
 }
}
writeFileSync('migration/prepared/file-map.json',JSON.stringify(map,null,2));
writeFileSync('migration/prepared/image-review.json',JSON.stringify(review,null,2));
console.log(JSON.stringify({matched:Object.keys(map).length,reviewedOverrides:Object.keys(overrides).length,unresolved:review.filter(r=>!overrides[r.id])},null,2));
