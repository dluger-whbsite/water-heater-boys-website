import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recentJobs,serviceJobs} from '../site/src/lib/feeds.mjs';
const jobs=[{_id:'old',publishedAt:'2020-01-01',serviceType:'gas-tank'},{_id:'new',publishedAt:'2026-09-12',serviceType:'gas-tank'},{_id:'other',publishedAt:'2026-09-11',serviceType:'tankless'},{_id:'third',publishedAt:'2026-09-10',serviceType:'heat-pump'},{_id:'drafts.test',publishedAt:'2027-01-01',serviceType:'gas-tank'},{_id:'unpublished',serviceType:'gas-tank'}];
test('recent feed excludes drafts and caps at three across services',()=>assert.deepEqual(recentJobs(jobs).map(x=>x._id),['new','other','third']));
test('service feed selects matching published records including legacy jobs',()=>assert.deepEqual(serviceJobs(jobs,'gas-tank').map(x=>x._id),['new','old']));
test('bulk-import publication dates never displace new manager jobs',()=>{const legacy={_id:'wix-gt-001',legacyId:'GT-001',legacyOrder:1,publishedAt:'2099-01-01',serviceType:'gas-tank'};assert.deepEqual(recentJobs([...jobs,legacy]).map(x=>x._id),['new','other','third']);assert.ok(serviceJobs([...jobs,legacy],'gas-tank').some(j=>j._id===legacy._id));});
