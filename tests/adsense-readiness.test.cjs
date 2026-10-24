const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const ts = require('typescript'), React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function load(name, imports = {}) {
  const file = path.resolve(name), m = new Module(file, module);
  m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file));
  m.require = spec => Object.hasOwn(imports, spec) ? imports[spec] : require(spec);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file);
  return m.exports;
}
test('inactive or invalid ad slots render no advertising box; valid enabled slots remain available', () => {
  const Ad = load('app/components/ArticleAd.tsx').default;
  for (const props of [{slot:'1234567890',enabled:false},{slot:'',enabled:true},{slot:'invalid',enabled:true}]) {
    assert.equal(renderToStaticMarkup(React.createElement(Ad, props)), '');
  }
  assert.match(renderToStaticMarkup(React.createElement(Ad,{slot:'1234567890',enabled:true})), /data-ad-slot="1234567890"/);
});
test('application checklists canonicalize to their original notice and incomplete listings remain noindex', async () => {
  const items = [{id:'seed',programme:'Seed',summary:'Summary'}, {id:'notice',programme:'Notice',summary:'Summary',detailHref:'/updates/original'}];
  const {generateMetadata} = load('app/applications/[slug]/page.tsx', {
    '../../../lib/news-queue': {listPublishedStories:async()=>[{id:'original'}],getStorySlug:s=>s.id},
    '../../../lib/content-catalogue': {publicOpportunities:()=>items},
    '../../../lib/application-guide': {applicationSlug:i=>i.id,applicationHref:i=>'/applications/'+i.id},
    '../../../lib/public-metadata': {withPublicSocial:x=>x},
    '../../components/DiscoveryHeader': {}, '../../components/ServiceEnquiry': {}, '../../components/JsonLd': {},
    '../../updates/[id]/RichText': {}, '../../updates/[id]/StructuredArticle': {}, '../../../lib/article-blocks': {}, '../../site-url': {PRIMARY_SITE_URL:'https://sohconsults.com.ng'},
  });
  const original = await generateMetadata({params:Promise.resolve({slug:'notice'})});
  assert.equal(original.alternates.canonical,'/updates/original');
  const seed = await generateMetadata({params:Promise.resolve({slug:'seed'})});
  assert.equal(seed.robots.index,false);
  assert.equal(seed.robots.follow,true);
  assert.equal((await generateMetadata({params:Promise.resolve({slug:'missing'})})).robots.index,false);
});
test('sitemap includes published notice canonical, excludes derivative checklists and propagates database failure', async () => {
  let fail = false;
  const sitemap = load('app/sitemap.ts', {
    '../lib/category-slug': {categorySlug:s=>s.toLowerCase()},
    './site-url': {PRIMARY_SITE_URL:'https://sohconsults.com.ng'},
    '../data/guides': {guides:[]},
    '../lib/public-writer-profile': {listPublicWriterProfiles:async()=>[]},
    '../lib/publisher-profiles': {buildPublisherCatalogue:()=>[{href:'/writers/soh-consults'}]},
    '../lib/news-queue': {getStorySlug:s=>s.id,listPublishedStories:async options=>{assert.equal(options.strict,true);if(fail)throw Error('unavailable');return [{id:'original',category:'Admission',created_at:'2026-10-01'}];}},
  }).default;
  const rows = await sitemap();
  assert.ok(rows.some(r=>r.url==='https://sohconsults.com.ng/updates/original'));
  assert.ok(rows.some(r=>r.url==='https://sohconsults.com.ng/writers/soh-consults'));
  assert.ok(rows.every(r=>!r.url.includes('/applications/')));
  fail=true;
  await assert.rejects(sitemap(),/unavailable/);
});
