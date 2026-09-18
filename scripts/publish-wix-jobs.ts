import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';
import {prepare} from '../migration/prepare.mjs';
import {serviceJobs,recentJobs} from '../site/src/lib/feeds.mjs';
const client=getCliClient({apiVersion:'2026-09-01'});
const expected=prepare();
const before=await client.fetch('*[_type=="completedJob"]',{}, {perspective:'raw'});
const draftIds=expected.map(j=>j._id);
const targets=before.filter((d:any)=>draftIds.includes(d._id));
assert.equal(targets.length,70,'Expected exactly 70 imported drafts; stop on changed scope');
const publishedIds=targets.map((d:any)=>d._id.replace(/^drafts\./,''));
assert.ok(!before.some((d:any)=>publishedIds.includes(d._id)),'A target is already published; inspect before replacing');
for(const job of targets){
 assert.equal(job._type,'completedJob');
 assert.ok(job.city&&job.title&&job.description,`Incomplete job ${job.legacyId}`);
 assert.ok(['gas-tank','tankless','heat-pump'].includes(job.serviceType));
 assert.ok(job.photos?.length&&job.photos.every((p:any)=>p.asset?._ref),`Missing image ${job.legacyId}`);
}
assert.equal(targets.find((j:any)=>j.legacyId==='GT-031').zip,'94583');
assert.equal(targets.find((j:any)=>j.legacyId==='TL-004').zip,'94121');
mkdirSync('backups',{recursive:true});
writeFileSync(`backups/before-bulk-publish-${Date.now()}.json`,JSON.stringify(before,null,2));
const publicationTime=new Date().toISOString();
let transaction=client.transaction();
for(const job of targets)transaction=transaction.patch(job._id,p=>p.ifRevisionId(job._rev).set({reviewStatus:'approved'}).setIfMissing({publishedAt:publicationTime}));
await transaction.commit();
const ready=await client.fetch('*[_id in $ids]',{ids:draftIds},{perspective:'raw'});
assert.equal(ready.length,70);
await client.action(ready.map((job:any)=>({actionType:'sanity.action.document.publish',draftId:job._id,publishedId:job._id.replace(/^drafts\./,''),ifDraftRevisionId:job._rev})));
const after=await client.fetch('*[_type=="completedJob"]',{}, {perspective:'raw'});
assert.equal(after.filter((d:any)=>draftIds.includes(d._id)).length,0);
const published=after.filter((d:any)=>publishedIds.includes(d._id));
assert.equal(published.length,70);
for(const job of published){
 assert.equal(job.reviewStatus,'approved');assert.ok(job.publishedAt);
 const original=targets.find((d:any)=>d.legacyId===job.legacyId);
 for(const key of Object.keys(original).filter(k=>!['_id','_rev','_createdAt','_updatedAt','reviewStatus','publishedAt'].includes(k)))assert.deepEqual(job[key],original[key],`${job.legacyId}: ${key} changed`);
}
for(const original of before.filter((d:any)=>!draftIds.includes(d._id)))assert.equal(after.find((d:any)=>d._id===original._id)?._rev,original._rev,'Non-target job changed');
const counts=Object.fromEntries(['gas-tank','tankless','heat-pump'].map(s=>[s,serviceJobs(published,s).length]));
assert.deepEqual(counts,{'gas-tank':57,tankless:6,'heat-pump':7});
const report={published:70,counts,remainingImportedDrafts:0,unrelatedRecordsUnchanged:true,recentJobs:recentJobs(after).map((j:any)=>({id:j._id,city:j.city})),publicationTime};
writeFileSync('backups/after-bulk-publish.json',JSON.stringify(after,null,2));
writeFileSync('migration/prepared/publication.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
