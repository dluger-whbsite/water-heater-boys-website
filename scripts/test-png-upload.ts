import {createReadStream} from 'node:fs';
import assert from 'node:assert/strict';
import {getCliClient} from 'sanity/cli';
import {completedJob} from '../studio/schemaTypes/completedJob';

// Uses an existing public portfolio photo; does not create or publish a job.
const photos = completedJob.fields.find(field => field.name === 'photos') as any;
const options = photos.of[0].options;
assert.ok(!options.metadata?.includes('dimensions'));
assert.ok(!options.extract?.includes('dimensions'));
const client = getCliClient({apiVersion: '2026-09-01'});
const asset = await client.assets.upload('image', createReadStream('site/public/assets/danville-gas-tank.png'), {
  filename: 'danville-gas-tank.png',
  contentType: 'image/png',
  ...(options.metadata ? {extract: options.metadata} : {}),
});
assert.equal(asset.mimeType, 'image/png');
assert.ok(asset.metadata?.dimensions?.width > 0);
console.log(JSON.stringify({result: 'PNG upload succeeded', assetId: asset._id, mimeType: asset.mimeType, dimensions: asset.metadata.dimensions, jobChanged: false}, null, 2));
