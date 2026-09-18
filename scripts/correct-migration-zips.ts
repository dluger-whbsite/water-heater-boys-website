import {getCliClient} from 'sanity/cli';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const client=getCliClient({apiVersion:'2026-09-01'});
const corrections=JSON.parse(readFileSync('migration/owner-corrections.json','utf8'));
const legacyIds=Object.keys(corrections);
const docs=await client.fetch('*[_type=="completedJob" && legacyId in $legacyIds]',{legacyIds},{perspective:'raw'});
for(const legacyId of legacyIds)assert.ok(docs.some((doc:any)=>doc.legacyId===legacyId),`Missing Sanity record ${legacyId}`);
mkdirSync('backups',{recursive:true});
writeFileSync(`backups/before-zip-corrections-${Date.now()}.json`,JSON.stringify(docs,null,2));
const docIds=docs.map((doc:any)=>doc._id);
let transaction=client.transaction();
for(const doc of docs){
 const correction=corrections[doc.legacyId];
 assert.ok(correction,'Unexpected document');
 const pattern=new RegExp(`\\b${correction.replaces}\\b`,'g');
 const fields:any={zip:correction.zip};
 for(const field of ['title','description','problem','workPerformed'])if(typeof doc[field]==='string')fields[field]=doc[field].replace(pattern,correction.zip);
 fields.migrationNotes=[...(doc.migrationNotes||'').split('\n').filter((line:string)=>line&&!line.startsWith('Conflicting source ZIPs:')),`${correction.reason} Corrected display fields to ${correction.zip}; original source wording retained.`].join('\n');
 transaction=transaction.patch(doc._id,p=>p.ifRevisionId(doc._rev).set(fields));
}
await transaction.commit();
const updated=await client.fetch('*[_id in $docIds]',{docIds},{perspective:'raw'});
for(const doc of updated){
 const old=docs.find((d:any)=>d._id===doc._id);
 assert.equal(doc.zip,corrections[doc.legacyId].zip);
 assert.equal(doc.legacyOriginalTitle,old.legacyOriginalTitle);
 assert.equal(doc.legacyOriginalDescription,old.legacyOriginalDescription);
 assert.deepEqual(doc.photos,old.photos);
 assert.equal(doc.publishedAt,old.publishedAt);
 console.log(JSON.stringify({id:doc.legacyId,documentId:doc._id,zip:doc.zip,title:doc.title,description:doc.description,status:doc._id.startsWith('drafts.')?'draft':'published'}));
}
