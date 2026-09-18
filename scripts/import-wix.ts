import {mkdirSync,readFileSync,writeFileSync,createReadStream} from 'node:fs';
import {resolve} from 'node:path';
import {getCliClient} from 'sanity/cli';
import {prepare,findImages} from '../migration/prepare.mjs';

const arg=(name:string)=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1]};
const jobs=prepare();
const mapping=arg('--file-map');
const images=findImages(jobs,arg('--images'),mapping?JSON.parse(readFileSync(mapping,'utf8')):{});
mkdirSync('migration/prepared',{recursive:true});
writeFileSync('migration/prepared/jobs.json',JSON.stringify(jobs,null,2));
writeFileSync('migration/prepared/image-check.json',JSON.stringify(images,null,2));
console.log(JSON.stringify({jobs:jobs.length,counts:Object.fromEntries(['gas-tank','tankless','heat-pump'].map(s=>[s,jobs.filter(j=>j.serviceType===s).length])),matchedImages:images.filter(i=>i.status==='matched').length,issues:jobs.filter(j=>j.migrationNotes).map(j=>({id:j.legacyId,notes:j.migrationNotes})),mode:process.argv.includes('--apply')?'apply drafts':'dry run'},null,2));
if(process.argv.includes('--apply')){
 if(images.some(i=>i.status!=='matched'))throw Error('Import stopped before writes: supply all unambiguous mapped images.');
 const client=getCliClient({apiVersion:'2026-09-01'});
 const existing=await client.fetch('*[_type == "completedJob"]',{}, {perspective:'raw'});
 mkdirSync('backups',{recursive:true});
 writeFileSync(resolve('backups',`jobs-before-wix-${Date.now()}.json`),JSON.stringify(existing,null,2));
 const occupied=new Set(existing.flatMap((d:any)=>[d._id,d.legacyId].filter(Boolean)));
 for(const job of jobs){
  if(occupied.has(job._id)||occupied.has(job._id.replace(/^drafts\./,''))||occupied.has(job.legacyId)){console.log(`Skipped existing ${job.legacyId}`);continue;}
  const file=images.find(i=>i.id===job.legacyId)!;
  const converted=file.path!.replaceAll('\\','/').includes('/converted/');
  const asset=await client.assets.upload('image',createReadStream(file.path!),{filename:converted?`${job.legacyId}.jpg`:job.legacyImageFilename,...(converted?{contentType:'image/jpeg'}:{})});
  await client.createIfNotExists({...job,photos:[{_type:'image',_key:'source-photo',asset:{_type:'reference',_ref:asset._id},alt:job.title}]});
  console.log(`Imported draft ${job.legacyId}`);
 }
 console.log('Draft import complete. No jobs published. Re-running will not overwrite existing records.');
}
