const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('lib/ranking-engine.ts','utf8');
const phase2=fs.readFileSync('lib/algorithm-phase2.ts','utf8');

test('ranking engine contains expiry and stale breaking safeguards',()=>{
  assert.match(engine,/deadline\.getTime\(\)\s*<\s*now\.getTime\(\)/);
  assert.match(engine,/item\.isBreaking\s*&&\s*age\s*>\s*7/);
});

test('engagement is logarithmically capped and recent engagement is supported',()=>{
  assert.match(engine,/Math\.log10/);
  assert.match(engine,/recentViews/);
  assert.match(engine,/recentClicks/);
  assert.match(engine,/clamp\(lifetime\s*\+\s*recent,\s*0,\s*10\)/);
});

test('Phase 2 centralizes unified search related trending and session interests',()=>{
  assert.match(phase2,/export function unifiedSearch/);
  assert.match(phase2,/export function relatedContent/);
  assert.match(phase2,/export function trendingContent/);
  assert.match(phase2,/sessionStorage/);
});

test('related content excludes current item and unified search requires relevance',()=>{
  assert.match(phase2,/item\.id\s*!==\s*current\.id/);
  assert.match(phase2,/breakdown\.relevance\s*>\s*0/);
});
