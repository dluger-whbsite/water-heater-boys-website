import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import convert from 'heic-convert';
const mapPath='migration/prepared/file-map.json';
const map=JSON.parse(readFileSync(mapPath,'utf8'));
const records=existsSync('migration/prepared/conversions.json')?JSON.parse(readFileSync('migration/prepared/conversions.json','utf8')):[];
mkdirSync('migration/source-images-indexed/converted',{recursive:true});
for(const [id,path] of Object.entries(map)){
 if(!/\.heic$/i.test(path))continue;
 const original=readFileSync(`migration/source-images-indexed/${path}`);
 const jpeg=await convert({buffer:original,format:'JPEG',quality:0.95});
 const output=`converted/${id}.jpg`;
 writeFileSync(`migration/source-images-indexed/${output}`,Buffer.from(jpeg));
 map[id]=output;
 const record={id,original:path,output,originalSha256:createHash('sha256').update(original).digest('hex'),outputSha256:createHash('sha256').update(Buffer.from(jpeg)).digest('hex'),conversion:'HEIC main image -> JPEG, quality 0.95; original retained'};
 const previous=records.findIndex(r=>r.id===id);
 if(previous<0)records.push(record);else records[previous]=record;
}
writeFileSync(mapPath,JSON.stringify(map,null,2));
writeFileSync('migration/prepared/conversions.json',JSON.stringify(records,null,2));
console.log(records);
