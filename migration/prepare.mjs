import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,basename,relative,sep} from 'node:path';

// CSV parser keeps quoted commas, escaped quotes, line breaks, and ZIP strings.
export function parseCsv(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){
   if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
  }else if(!quoted&&(c===','||c==='\n')){
   row.push(cell.replace(/\r$/,''));cell='';
   if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}
  }else cell+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');
 if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
 const headers=rows.shift();
 return rows.map((values,i)=>{
  if(values.length!==headers.length)throw Error(`CSV row ${i+2}: incorrect field count`);
  return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));
 });
}
const fixes=[[/\bCoversion\b/g,'Conversion'],[/\ba a new\b/g,'a new'],[/\ban leaking\b/g,'a leaking'],[/\bless then\b/g,'less than'],[/\b20 yea old\b/g,'20-year-old'],[/\bGallon Gallon\b/g,'Gallon'],[/\bwhich was had a leak\b/g,'which had a leak'],[/\bstarting leak\b/g,'starting to leak'],[/\b75gallon\b/g,'75-gallon']];
export function normalize(text){return fixes.reduce((s,[pattern,value])=>s.replace(pattern,value),text.trim().replace(/\s+/g,' '));}
export const sourceRoot=resolve('migration/source-package/Water-Heater-Boys-Astra-Migration');
export function prepare(){
 const corrections=JSON.parse(readFileSync(new URL('./owner-corrections.json',import.meta.url),'utf8'));
 const manifest=parseCsv(readFileSync(resolve(sourceRoot,'05_assets/image-manifest.csv'),'utf8'));
 const rows=['gas-tank','tankless','heat-pump'].flatMap(service=>parseCsv(readFileSync(resolve(sourceRoot,`02_services/${service}/jobs.csv`),'utf8')).map(row=>({...row,service})));
 if(new Set(rows.map(r=>r.job_id)).size!==rows.length)throw Error('Duplicate job IDs');
 const expected=JSON.parse(readFileSync(resolve(sourceRoot,'package-metadata.json'),'utf8'));
 if(rows.length!==expected.total_structured_jobs)throw Error('Package job count does not reconcile');
 return rows.map((r,index)=>{
  const matches=manifest.filter(m=>m.category===r.service&&m.image_filename===r.image_filename&&m.associated_title===r.job_title&&m.source_page===r.source_page&&m.city===r.city&&m.association_status==='MATCHED_TO_JOB');
  if(matches.length!==1)throw Error(`Manifest mismatch: ${r.job_id}`);
  const notes=[];
  const zips=[...new Set((r.job_title+' '+r.description).match(/\b\d{5}\b/g)||[])];
  if(zips.some(zip=>r.zip&&zip!==r.zip))notes.push(`Conflicting source ZIPs: column ${r.zip}; text ${zips.join(', ')}. Confirm before publishing.`);
  if(rows.some(other=>other.service!==r.service&&other.image_filename===r.image_filename))notes.push('Filename reused across categories; requires a category-specific file or explicit file mapping.');
  if(!/\.[a-z0-9]{2,5}$/i.test(r.image_filename))notes.push('Source filename has no recognizable extension. Match exactly or provide an explicit filename mapping.');
  if(normalize(r.description)!==r.description||normalize(r.job_title)!==r.job_title)notes.push('Formatting/obvious typo normalized; original wording retained below.');
  const job={
   _id:`drafts.wix-${r.job_id.toLowerCase()}`,_type:'completedJob',
   title:normalize(r.job_title),city:r.city,zip:r.zip||undefined,serviceType:r.service,
   description:normalize(r.description),reviewStatus:'draft',
   legacyId:r.job_id,legacySourceUrl:r.source_page,legacyImageFilename:r.image_filename,
   legacyOrder:index+1,legacyOriginalTitle:r.job_title,legacyOriginalDescription:r.description,
   migrationNotes:notes.join('\n'),photos:[],
  };
  const correction=corrections[r.job_id];
  if(correction){
   const pattern=new RegExp(`\\b${correction.replaces}\\b`,'g');
   job.zip=correction.zip;
   job.title=job.title.replace(pattern,correction.zip);
   job.description=job.description.replace(pattern,correction.zip);
   job.migrationNotes=[...notes.filter(n=>!n.startsWith('Conflicting source ZIPs:')),`${correction.reason} Corrected display fields to ${correction.zip}; original source wording retained.`].join('\n');
  }
  return job;
 });
}
export function findImages(jobs,imageDir,fileMap={}){
 if(!imageDir)return jobs.map(job=>({id:job.legacyId,status:'missing',expected:job.legacyImageFilename}));
 const root=resolve(imageDir);
 function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isSymbolicLink()?[]:entry.isDirectory()?walk(resolve(dir,entry.name)):[resolve(dir,entry.name)]);}
 const files=walk(root);
 return jobs.map(job=>{
  let candidates;
  if(fileMap[job.legacyId]){
   const target=resolve(root,fileMap[job.legacyId]);
   if(relative(root,target).startsWith('..')||!existsSync(target))throw Error(`Invalid mapped file for ${job.legacyId}`);
   candidates=[target];
  }else{
   const same=files.filter(file=>basename(file)===job.legacyImageFilename);
   const category=same.filter(file=>relative(root,file).split(sep).includes(job.serviceType));
   const reused=jobs.some(other=>other.serviceType!==job.serviceType&&other.legacyImageFilename===job.legacyImageFilename);
   candidates=category.length?category:reused?[]:same;
  }
  return {id:job.legacyId,status:candidates.length===1?'matched':candidates.length?'ambiguous':'missing',expected:job.legacyImageFilename,path:candidates.length===1?candidates[0]:undefined};
 });
}
