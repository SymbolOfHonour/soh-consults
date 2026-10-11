const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function load(file,dependencies={}) {
 const mod={exports:{}};
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:name=>dependencies[name]||require(name),URL,Set,DOMParser:undefined});
 return mod.exports;
}
const blocks=load('lib/article-blocks.ts');
const tables=load('lib/article-tables.ts');
test('CSV importer preserves quoted commas, newlines and escaped double-quotes',()=>{
 const rows=tables.parseDelimitedRows('School,Year,Notes\r\n"Ambrose Alli University, Ekpoma",1980,"A ""quoted"" entry"\r\nRivers State University,1979,Open');
 assert.equal(JSON.stringify(rows),JSON.stringify([['School','Year','Notes'],['Ambrose Alli University, Ekpoma','1980','A "quoted" entry'],['Rivers State University','1979','Open']]));
 assert.equal(JSON.stringify(tables.tableFromRows(rows).headers),JSON.stringify(['School','Year','Notes']));
 assert.equal(tables.tableFromRows(rows).rows.length,2);
});
test('TSV import retains columns and supports a no-header mode',()=>{
 const rows=tables.parseDelimitedRows('1\tRivers State University\t1979\n2\tAmbrose Alli University\t1980');
 assert.equal(rows[0].length,3);
 assert.equal(tables.tableFromRows(rows,false).rows.length,2);
 assert.deepEqual(Array.from(tables.tableFromRows(rows,false).headers),['Column 1','Column 2','Column 3']);
});
test('table blocks round trip safely with media, typography and optional layout data',()=>{
 const table={type:'table',caption:'Nigerian state universities',headers:['S/N','University','Official website'],rows:[['1','Rivers State University','[Visit site](https://example.edu.ng)']],aligns:['center','left','left'],widths:[80,320,220]};
 const original=[{type:'heading',text:'State universities'},{type:'paragraph',text:'A list of schools'},{type:'image',url:'https://files.example/photo.png',alt:''},table,{type:'document',url:'https://files.example/a.pdf',name:''},{type:'video',url:'https://files.example/demo.mp4',title:'',mode:'player'}];
 assert.equal(JSON.stringify(blocks.readArticleBlocks(blocks.writeArticleBlocks('',original))),JSON.stringify(original));
 assert.equal(blocks.articleBlocksError(original),null);
});
test('invalid row shapes, excessive cells and malformed links cannot publish as HTML',()=>{
 const malformed={type:'table',headers:['S/N','School'],rows:[['1']]};
 assert.ok(blocks.articleBlocksError([malformed]));
 assert.equal(blocks.readArticleBlocks(blocks.writeArticleBlocks('',[malformed])),null);
 const excessive={type:'table',headers:['Name'],rows:[['x'.repeat(3001)]]};
 assert.ok(blocks.articleBlocksError([excessive]));
 assert.equal(blocks.readArticleBlocks(blocks.writeArticleBlocks('',[excessive])),null);
 assert.equal(tables.safeTableLink('javascript:alert(1)'),false);
 assert.equal(tables.safeTableLink('https://user:password@example.edu.ng'),false);
 assert.equal(tables.safeTableLink('https://example.edu.ng'),true);
});
test('public renderer emits accessible scrollable table with safe links and escaped text',()=>{
 const rich=load('app/updates/[id]/RichText.tsx');
 const renderer=load('app/updates/[id]/StructuredArticle.tsx',{
  '../../../lib/article-blocks':blocks,
  '../../../lib/article-ad-positions':{articleAdPositions:()=>new Set()},
  '../../../lib/story-gallery':{cleanGalleryDetails:v=>v},
  '../../components/ArticleAd':{default:()=>null},
  './RichText':rich,
  './GalleryCarousel':{default:()=>null}
 }).default;
 const body=blocks.writeArticleBlocks('',[{type:'table',caption:'School directory',headers:['University','Website'],rows:[['Rivers State University','[Official website](https://example.edu.ng)'],['<script>unsafe</script>','javascript:alert(1)']]}]);
 const html=renderToStaticMarkup(React.createElement(renderer,{details:body}));
 assert.match(html,/<table/);assert.match(html,/<thead/);assert.match(html,/<tbody/);
 assert.match(html,/aria-label="School directory"/);assert.match(html,/overflow-x-auto/);
 assert.match(html,/href="https:\/\/example.edu.ng"/);
 assert.match(html,/&lt;script&gt;unsafe&lt;\/script&gt;/);
 assert.doesNotMatch(html,/href="javascript:/);
});
