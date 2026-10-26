const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function load(file,imports={}){
 const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:name=>imports[name]||require(name),URL,Set,Date});
 return module.exports;
}
const blocks=load('lib/article-blocks.ts');
const meta=load('lib/smart-operations.ts');
const rich=load('app/updates/[id]/RichText.tsx',{'../../../lib/editorial-link':load('lib/editorial-link.ts')});
const renderArticle=load('app/updates/[id]/StructuredArticle.tsx',{
 '../../../lib/article-blocks':blocks,
 '../../../lib/article-ad-positions':{articleAdPositions:()=>new Set()},
 '../../../lib/story-gallery':{cleanGalleryDetails:v=>v},
 '../../components/ArticleAd':{default:()=>null},
 './RichText':rich,
 './GalleryCarousel':{default:()=>null}
}).default;
test('educational article blocks round-trip with TOC, notice, FAQ, quote and separator',()=>{
 const samples=[{type:'heading',text:'University directory'}, {type:'toc'},
 {type:'notice',variant:'deadline',title:'Application closing date',text:'Complete before 30 November 2026'},
 {type:'faq',entries:[{question:'Is it accredited?',answer:'Check the official NUC list.'}]},
 {type:'quote',text:'Education is a priority',attribution:'Source'},
 {type:'divider'},{type:'table',caption:'',headers:['School','Year'],rows:[['Rivers State University','1979']]}];
 const saved=blocks.readArticleBlocks(blocks.writeArticleBlocks('',samples));
 assert.equal(JSON.stringify(saved),JSON.stringify(samples));
 assert.equal(blocks.articleBlocksError(samples),null);
 assert.equal(blocks.hasArticleNarrative(samples),true);
});
test('blank layouts cannot publish, but a genuine table or FAQ can',()=>{
 assert.equal(blocks.hasArticleNarrative([{type:'divider'},{type:'toc'}]),false);
 assert.equal(blocks.hasArticleNarrative([{type:'table',headers:['School'],rows:[['Rivers State University']]}]),true);
 assert.equal(blocks.hasArticleNarrative([{type:'faq',entries:[{question:'Why?',answer:'Because.'}]}]),true);
 assert.ok(blocks.articleBlocksError([{type:'faq',entries:[{question:'',answer:'Missing'}]}]));
});
test('article contents navigation, notices, correction-safe quote and FAQs render accessibly',()=>{
 const entries=[
 {type:'toc'},
 {type:'heading',text:'Federal universities'},
 {type:'notice',variant:'info',title:'Official confirmation',text:'Always use the NUC register.'},
 {type:'quote',text:'<img src=x onerror=alert(1)>',attribution:'Public source'},
 {type:'faq',entries:[{question:'How many?',answer:'Verify using official records.'}]},
 {type:'divider'},
 {type:'heading',text:'Next steps'}
 ];
 const html=renderToStaticMarkup(React.createElement(renderArticle,{details:blocks.writeArticleBlocks('',entries)}));
 assert.match(html,/aria-label="Article table of contents"/);
 assert.match(html,/href="#section-1"/);
 assert.match(html,/id="section-1"/);
 assert.match(html,/Official confirmation/);
 assert.match(html,/<details/);
 assert.match(html,/<blockquote/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<img src=x onerror=/);
});
test('optional SEO and correction fields preserve smart scheduling and article blocks',()=>{
 const article=blocks.writeArticleBlocks('',[{type:'paragraph',text:'S.O.H article'}]);
 const saved=meta.writeSmartMeta(article,{module:'auto',schedule:'2026-10-21T10:00:00.000Z',seoTitle:'Educational reference',seoDescription:'Official guidance',imageAlt:'University building',reviewAfter:'2027-01-20',correction:'Updated a date'});
 assert.equal(meta.smartMeta(saved).seoTitle,'Educational reference');
 assert.equal(meta.smartMeta(saved).schedule,'2026-10-21T10:00:00.000Z');
 assert.equal(meta.smartMeta(saved).correction,'Updated a date');
 assert.equal(blocks.readArticleBlocks(saved)[0].text,'S.O.H article');
});
test('manual publishing stays free from duplicate-warning gates',()=>{
 const route=fs.readFileSync('app/api/admin/stories/route.ts','utf8');
 assert.doesNotMatch(route,/duplicateCandidates\s*\(/);
 assert.doesNotMatch(route,/Possible duplicate update detected/);
});

test('internal update links render safely while unsafe URL schemes remain plain text',()=>{
 const body=blocks.writeArticleBlocks('',[{type:'paragraph',text:'[Read LASU update](/updates/lasu-update) and [unsafe](javascript:alert(1))'}]);
 const html=renderToStaticMarkup(React.createElement(renderArticle,{details:body}));
 assert.match(html,/href="\/updates\/lasu-update"/);
 assert.doesNotMatch(html,/href="javascript:/);
});
test('table imports do not treat untrusted text as executable markup',()=>{
 const input=[{type:'table',headers:['University','Year'],rows:[['<svg onload=alert(1)>','1982']]}];
 const html=renderToStaticMarkup(React.createElement(renderArticle,{details:blocks.writeArticleBlocks('',input)}));
 assert.match(html,/&lt;svg onload=alert\(1\)&gt;/);
 assert.doesNotMatch(html,/<svg onload=/);
});
