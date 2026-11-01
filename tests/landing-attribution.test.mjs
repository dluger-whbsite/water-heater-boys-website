import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const attribution = readFileSync('site/public/scripts/landing-attribution.js', 'utf8');
const loader = readFileSync('site/public/scripts/jobber-landing-form.js', 'utf8');
function visit(path, storage = new Map(), blockedStorage = false, hostname = 'www.waterheaterboys.com') {
  const elements = [];
  const formUrl = 'https://clienthub.getjobber.com/client_hubs/test/public/work_request/embedded_work_request_form?form_id=2079447';
  const context = {
    URL, URLSearchParams, Date,
    location: new URL(`https://${hostname}${path}`), window: {},
    sessionStorage: {
      getItem: key => { if (blockedStorage) throw Error('denied'); return storage.get(key); },
      setItem: (key, value) => { if (blockedStorage) throw Error('denied'); storage.set(key, value); },
    },
    document: {
      createElement: () => ({setAttribute(key, value) { this[key] = value; }}),
      head: {appendChild: el => elements.push(el)},
      currentScript: {
        getAttribute: key => key === 'form_url' ? formUrl : 'test-2079447',
        parentNode: {insertBefore: el => elements.push(el)},
      },
    },
  };
  vm.runInNewContext(attribution, context);
  vm.runInNewContext(loader, context);
  return {context, elements, url: new URL(elements.at(-1).form_url)};
}

test('dedicated Nextdoor URL passes its source and submission page into Jobber', () => {
  const {context, url} = visit('/nextdoor-gas-tank-replacement/');
  assert.equal(url.searchParams.get('utm_source'), 'nextdoor');
  assert.equal(url.searchParams.get('utm_medium'), 'paid_social');
  assert.equal(url.searchParams.get('utm_content'), 'nextdoor-gas-tank-replacement');
  assert.equal(context.window.dataLayer[1][0], 'config');
  assert.equal(context.window.dataLayer[1][1], 'G-JLE3QE7HQ4');
  assert.equal(context.window.dataLayer.some(event => event[0] === 'event'), false);
});

test('Google click attribution survives navigation to a different tank-size form', () => {
  const storage = new Map();
  visit('/40-gallon-gas-water-heater-replacement/?gclid=test-click', storage);
  const {url} = visit('/50-gallon-gas-water-heater-replacement/', storage);
  assert.equal(url.searchParams.get('gclid'), 'test-click');
  assert.equal(url.searchParams.get('utm_source'), 'google');
  assert.equal(url.searchParams.get('utm_medium'), 'cpc');
  assert.equal(url.searchParams.get('utm_content'), '50-gallon-gas-water-heater-replacement');
});

test('current campaign replaces previous campaign and does not duplicate vendor-forwarded parameters', () => {
  const storage = new Map();
  visit('/gas-tank-replacement/?gclid=previous', storage);
  const {context, url} = visit('/gas-tank-replacement/?utm_source=email&utm_medium=newsletter', storage);
  assert.equal(context.window.whbLandingAttribution.values.gclid, undefined);
  assert.equal(context.window.whbLandingAttribution.values.utm_source, 'email');
  assert.equal(url.searchParams.has('utm_source'), false);
  assert.equal(url.searchParams.has('gclid'), false);
});

test('braid attribution is passed explicitly because the vendor does not copy it', () => {
  const {url} = visit('/gas-tank-replacement/?wbraid=example-braid');
  assert.equal(url.searchParams.get('wbraid'), 'example-braid');
  assert.equal(url.searchParams.get('utm_source'), 'google');
});

test('missing storage or Analytics on preview cannot block the form', () => {
  assert.equal(visit('/nextdoor-gas-tank-replacement/', new Map(), true).url.searchParams.get('utm_source'), 'nextdoor');
  const preview = visit('/gas-tank-replacement/', new Map(), false, 'localhost');
  assert.equal(preview.elements.length, 1);
  assert.equal(preview.context.window.gtag, undefined);
  assert.equal(preview.url.searchParams.get('form_id'), '2079447');
});

test('expired attribution and unrelated personal query parameters are not forwarded', () => {
  const storage = new Map([['whb_campaign', JSON.stringify({time: Date.now() - 31 * 60 * 1000, values: {gclid: 'stale', utm_source: 'google'}})]]);
  const {url} = visit('/gas-tank-replacement/?email=private@example.com', storage);
  assert.equal(url.searchParams.has('gclid'), false);
  assert.equal(url.searchParams.has('email'), false);
  assert.equal(url.searchParams.get('utm_source'), 'website');
});
