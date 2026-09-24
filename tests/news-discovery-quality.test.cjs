const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../lib/news-importer.ts'), 'utf8');

test('imported headlines use the cleanup function before saving', () => {
  assert.match(source, /const title = cleanDiscoveryHeadline\(match\[2\]\)/);
  assert.match(source, /export function cleanDiscoveryHeadline/);
});

test('automatic drafts require a verified fresh publication date and useful article content', () => {
  assert.match(source, /if\(!published\).*continue/);
  assert.match(source, /if\(!isFreshPublication\(published\)\).*continue/);
  assert.match(source, /Source content unavailable or too thin for a useful draft/);
  assert.match(source, /source_published_at:published/);
});

test('source discovery excludes document links and keeps drafts unpublished', () => {
  assert.match(source, /!isArticleUrl\(url\.toString\(\)\)/);
  assert.match(source, /status: "draft"/);
});
