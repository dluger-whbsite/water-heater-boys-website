import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

const root = join(process.cwd(), 'site', 'dist');

function htmlFiles(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}

function targetFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
  return clean.endsWith('.html') ? join(root, clean) : join(root, clean, 'index.html');
}

test('all public internal links and fragments resolve', () => {
  assert.ok(existsSync(root), 'Build the site before running link checks');
  const failures = [];
  for (const file of htmlFiles(root)) {
    if (file.endsWith(join('workflow', 'index.html'))) continue;
    const html = readFileSync(file, 'utf8');
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      if (/^(?:https?:|tel:|mailto:)/.test(href)) continue;
      const [pathname, fragment] = href.split('#');
      const destination = pathname ? targetFile(pathname) : file;
      if (!existsSync(destination)) {
        failures.push(`${file}: missing ${href}`);
        continue;
      }
      if (fragment) {
        const destinationHtml = readFileSync(destination, 'utf8');
        const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!new RegExp(`id="${escaped}"`).test(destinationHtml)) failures.push(`${file}: missing fragment ${href}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('customer pages contain no internal build instructions', () => {
  const forbidden = /owner review|proof of concept|design and workflow test|sanity is configured|new approved jobs appear here automatically/i;
  const failures = htmlFiles(root)
    .filter((file) => !file.endsWith(join('workflow', 'index.html')))
    .filter((file) => forbidden.test(readFileSync(file, 'utf8')));
  assert.deepEqual(failures, []);
});

test('service-area copy reflects the confirmed territory', () => {
  const selective = /primarily serve|confirm coverage|confirm service for|not sure whether we cover|including (?:the )?North Bay|entire Bay Area/i;
  const failures = htmlFiles(root)
    .filter((file) => !file.endsWith(join('workflow', 'index.html')))
    .filter((file) => selective.test(readFileSync(file, 'utf8')));
  assert.deepEqual(failures, []);
});
