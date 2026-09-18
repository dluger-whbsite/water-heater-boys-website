import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {getCliClient} from 'sanity/cli';

const client = getCliClient({apiVersion: '2026-09-01'});
const visibleFields = ['title', 'description', 'problem', 'workPerformed'] as const;

type Job = {
  _id: string;
  _rev: string;
  _type: 'completedJob';
  city?: string;
  zip?: string;
  legacyId?: string;
  legacyOriginalTitle?: string;
  legacyOriginalDescription?: string;
  title?: string;
  description?: string;
  problem?: string;
  workPerformed?: string;
};

function escaped(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function embeddedZips(value: unknown) {
  return [...String(value || '').matchAll(/\b9\d{4}\b/g)].map((match) => match[0]);
}

function removeStructuredZip(value: string, zip: string) {
  return value
    .replace(new RegExp(`(?<!\\d)${escaped(zip)}(?!\\d)`, 'g'), '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([,.;:!?])/g, '$1')
    .trim();
}

const before = await client.fetch<Job[]>(
  '*[_type == "completedJob"] | order(_id asc)',
  {},
  {perspective: 'raw'},
);

const changes: Array<{doc: Job; fields: Partial<Job>}> = [];
for (const doc of before) {
  const fields: Partial<Job> = {};
  const found = visibleFields.flatMap((field) => embeddedZips(doc[field]));
  if (!found.length) continue;

  assert.ok(doc.zip, `${doc._id} contains a ZIP in visible text but has no structured ZIP`);
  const unexpected = [...new Set(found.filter((zip) => zip !== doc.zip))];
  assert.deepEqual(
    unexpected,
    [],
    `${doc._id} contains ZIP(s) that do not match its structured ZIP ${doc.zip}: ${unexpected.join(', ')}`,
  );

  for (const field of visibleFields) {
    if (typeof doc[field] !== 'string' || !embeddedZips(doc[field]).length) continue;
    const cleaned = removeStructuredZip(doc[field], doc.zip);
    assert.ok(cleaned, `${doc._id}.${field} would become empty`);
    fields[field] = cleaned;
  }
  changes.push({doc, fields});
}

assert.equal(changes.length, 38, 'Expected the audited set of exactly 38 jobs; stopping because scope changed');
assert.ok(changes.every(({doc}) => !doc._id.startsWith('drafts.')), 'A matching draft exists; inspect it before cleanup');

mkdirSync('backups', {recursive: true});
const backupPath = `backups/before-job-zip-normalization-${Date.now()}.json`;
writeFileSync(backupPath, JSON.stringify(changes.map(({doc}) => doc), null, 2));

let transaction = client.transaction();
for (const {doc, fields} of changes) {
  transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(fields));
}
await transaction.commit({tag: 'migration.normalize-job-zips'});

const changedIds = changes.map(({doc}) => doc._id);
const after = await client.fetch<Job[]>(
  '*[_id in $ids]',
  {ids: changedIds},
  {perspective: 'raw'},
);
assert.equal(after.length, changes.length);

for (const updated of after) {
  const original = changes.find(({doc}) => doc._id === updated._id)!.doc;
  assert.equal(updated.zip, original.zip, `${updated._id}: structured ZIP changed`);
  assert.equal(updated.legacyOriginalTitle, original.legacyOriginalTitle, `${updated._id}: original title changed`);
  assert.equal(
    updated.legacyOriginalDescription,
    original.legacyOriginalDescription,
    `${updated._id}: original description changed`,
  );
  for (const field of visibleFields) {
    assert.equal(embeddedZips(updated[field]).length, 0, `${updated._id}.${field}: embedded ZIP remains`);
  }
}

const allPublished = await client.fetch<Job[]>(
  '*[_type == "completedJob" && !(_id in path("drafts.**"))]',
  {},
  {perspective: 'raw'},
);
assert.equal(allPublished.length, 71, 'Published job count changed unexpectedly');
assert.equal(
  allPublished.flatMap((job) => visibleFields.flatMap((field) => embeddedZips(job[field]))).length,
  0,
  'An embedded ZIP remains in published job text',
);

console.log(
  JSON.stringify(
    {
      correctedJobs: changes.length,
      publishedJobs: allPublished.length,
      remainingEmbeddedZips: 0,
      structuredZipsPreserved: true,
      legacySourceFieldsPreserved: true,
      backupPath,
    },
    null,
    2,
  ),
);
