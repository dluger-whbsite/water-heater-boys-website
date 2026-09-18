import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayJobTitle} from '../site/src/lib/jobDisplay.mjs';

test('removes a duplicated city prefix without changing the stored title', () => {
  const job = {city:'Walnut Creek',title:'Walnut Creek-Bradford White 50-Gallon'};
  assert.equal(displayJobTitle(job),'Bradford White 50-Gallon');
  assert.equal(job.title,'Walnut Creek-Bradford White 50-Gallon');
});

test('handles city punctuation and falls back cleanly', () => {
  assert.equal(displayJobTitle({city:'Danville/Blackhawk',title:'Danville/Blackhawk - Bradford White 50-gallon'}),'Bradford White 50-gallon');
  assert.equal(displayJobTitle({city:'Danville',equipment:'URG250T6N'}),'URG250T6N');
});
