import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {getCliClient} from 'sanity/cli';
import {prepare} from '../migration/prepare.mjs';
import {serviceJobs,recentJobs} from '../site/src/lib/feeds.mjs';
const client=getCliClient({apiVersion:'2026-09-01'});
const expected=prepare();
const map=JSON.parse(readFileSync('migration/prepared/file-map.json','utf8'));
const docs=await client.fetch('*[_type=="completedJob"]{...,"imageDetails":photos[]{"asset":asset->{_id,url,sha1hash,mimeType,metadata}}}',{}, {perspective:'raw'});
const issues=[];
const firstBackup=readdirSync('backups').filter(f=>/^jobs-before-wix-\d+\.json$/.test(f)).sort()[0];
const before=JSON.parse(readFileSync(resolve('backups',firstBackup),'utf8'));
for(const original of before){
 if(docs.find((d:any)=>d._id===original._id)?._rev!==original._rev)issues.push({id:original._id,error:'Existing record revision changed since pre-import backup'});
}
for(const job of expected){
 const actual=docs.find((d:any)=>d._id===job._id);
 if(!actual){issues.push({id:job.legacyId,error:'Missing draft'});continue;}
 for(const field of ['title','city','zip','serviceType','description','legacyId','legacySourceUrl','legacyImageFilename','legacyOrder','legacyOriginalTitle','legacyOriginalDescription']){
  if((actual[field]??null)!==((job as any)[field]??null))issues.push({id:job.legacyId,error:`Field mismatch: ${field}`});
 }
 const sha1=createHash('sha1').update(readFileSync(resolve('migration/source-images-indexed',map[job.legacyId]))).digest('hex');
 if(actual.imageDetails?.[0]?.asset?.sha1hash!==sha1)issues.push({id:job.legacyId,error:'Image checksum mismatch'});
 if(actual.photos?.length!==1)issues.push({id:job.legacyId,error:'Expected one mapped photo'});
 if(!actual.imageDetails?.[0]?.asset?.metadata?.dimensions?.width)issues.push({id:job.legacyId,error:'Image dimensions unavailable'});
 if(actual.publishedAt||actual.completionDate)issues.push({id:job.legacyId,error:'Unexpected date assigned'});
}
const live=docs.filter((d:any)=>!d._id.startsWith('drafts.'));
assert.equal(live.filter((d:any)=>d.legacyId).length,0,'Migration should not publish jobs');
// Simulate publication only in memory to verify placement, never alter Sanity.
const simulated=expected.map(j=>({...j,_id:j._id.replace(/^drafts\./,''),publishedAt:'2099-01-01T00:00:00Z'}));
for(const [service,count] of [['gas-tank',57],['tankless',6],['heat-pump',7]] as const)assert.equal(serviceJobs(simulated,service).length,count);
assert.ok(recentJobs([...live,...simulated]).length<=3);
if(live.length)assert.equal(recentJobs([...live,...simulated])[0]._id,live[0]._id);
const report={expected:70,importedDrafts:docs.filter((d:any)=>d._id.startsWith('drafts.wix-')).length,liveMigrationJobs:0,issues,feedPlacement:'57 gas-tank / 6 tankless / 7 heat-pump (in-memory publication test only)',verifiedAt:new Date().toISOString()};
mkdirSync('backups',{recursive:true});
writeFileSync('backups/jobs-after-wix-import.json',JSON.stringify(docs,null,2));
writeFileSync('migration/prepared/verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(issues.length)process.exitCode=1;
