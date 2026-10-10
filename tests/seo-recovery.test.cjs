const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const fixture = require('../data/preview-published-stories.json');
function load(name) {
  const file=path.resolve(name); const m=new Module(file,module); m.filename=file; m.paths=Module._nodeModulePaths(path.dirname(file));
  m.require=spec=>spec.endsWith('news-queue')?{getStorySlug:s=>s.source_url?.match(/^legacy:\d+:(.+)$/)?.[1]||s.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}:
    spec.endsWith('category-slug')?{categorySlug:s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}:
    require(spec);
  m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
  return m.exports.default;
}
test('server HTML contains every archive article including those beyond the first 12',()=>{
  const Archive=load('app/components/PublishedArchive.tsx');
  assert.ok(fixture.length>12);
  const html=renderToStaticMarkup(React.createElement(Archive,{stories:fixture}));
  for (const story of fixture) assert.ok(html.includes(story.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')),story.title);
  assert.ok(html.includes('/updates/category/'));
  assert.ok(!html.includes('/updates?category='));
});
test('empty archive does not publish misleading empty categories',()=>{
  const Archive=load('app/components/PublishedArchive.tsx');
  assert.equal(renderToStaticMarkup(React.createElement(Archive,{stories:[]})), '');
});
