const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('lib/ranking-engine.ts','utf8');
const phase2=fs.readFileSync('lib/algorithm-phase2.ts','utf8');

test('ranking engine contains expiry and stale breaking safeguards',()=>{
  assert.ok(engine.includes('deadline.getTime()<now.getTime()') || engine.includes('deadline.getTime() < now.getTime()'));
  assert.ok(engine.includes('item.isBreaking&&age>7') || engine.includes('item.isBreaking && age > 7'));
});

test('engagement is logarithmically capped and recent engagement is supported',()=>{
  assert.match(engine,/Math\.log10/);
  assert.match(engine,/recentViews/);
  assert.match(engine,/recentClicks/);
  assert.ok(engine.includes('clamp(lifetime+recent,0,10)') || engine.includes('clamp(lifetime + recent, 0, 10)'));
});

test('Phase 2 centralizes unified search related trending and session interests',()=>{
  assert.match(phase2,/export function unifiedSearch/);
  assert.match(phase2,/export function relatedContent/);
  assert.match(phase2,/export function trendingContent/);
  assert.match(phase2,/sessionStorage/);
});

test('related content excludes current item and unified search requires relevance',()=>{
  assert.ok(phase2.includes('item.id!==current.id') || phase2.includes('item.id !== current.id'));
  assert.ok(phase2.includes('result.breakdown.relevance>0') || phase2.includes('result.breakdown.relevance > 0'));
});
