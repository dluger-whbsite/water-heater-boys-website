import assert from 'node:assert/strict';
import {getCliClient} from 'sanity/cli';
import {readFileSync} from 'node:fs';

const client=getCliClient({apiVersion:'2026-09-01'});
const corrections=JSON.parse(readFileSync('migration/owner-corrections.json','utf8'));
const legacyIds=Object.keys(corrections);
const docs=await client.fetch('*[_type=="completedJob" && legacyId in $legacyIds]{_id,legacyId,city,zip,title,publishedAt,legacyOriginalTitle}',{legacyIds},{perspective:'published'});
assert.equal(docs.length,legacyIds.length,'Every correction must resolve to one published job');
for(const doc of docs){
  const correction=corrections[doc.legacyId];
  assert.equal(doc.zip,correction.zip,doc.legacyId);
  assert.ok(doc.publishedAt,`${doc.legacyId} must remain published`);
}
console.log(JSON.stringify(docs,null,2));
