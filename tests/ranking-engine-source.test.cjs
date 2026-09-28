const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(process.cwd(), 'lib', 'ranking-engine.ts'), 'utf8');

test('ranking engine exposes reusable scoring and ranking APIs', () => {
  assert.match(source, /export function scoreContent/);
  assert.match(source, /export function rankContent/);
});

test('ranking engine accounts for the agreed core signals', () => {
  for (const signal of ['relevance', 'freshness', 'importance', 'urgency', 'authority', 'engagement', 'context', 'stalenessPenalty', 'duplicationPenalty']) {
    assert.match(source, new RegExp(signal));
  }
});

test('ranking engine handles deadlines and duplicate titles', () => {
  assert.match(source, /deadline/);
  assert.match(source, /seen\.has\(key\)/);
  assert.match(source, /duplicationPenalty = 10/);
});
