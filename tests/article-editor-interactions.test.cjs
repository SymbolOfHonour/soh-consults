const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://editor.test',pretendToBeVisual:true});
for(const name of ['window','document','Node','HTMLElement','DOMParser','Event','MouseEvent','KeyboardEvent','HTMLInputElement','HTMLTextAreaElement','HTMLSelectElement','localStorage'])global[name]=dom.window[name];
global.requestAnimationFrame=fn=>{fn();return 0;};
global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {renderToStaticMarkup}=require('react-dom/server');
const ts=require('typescript');
const cache=new Map();
const uploads=[];
// Only the database, authentication and audit transports are replaced. The real
// editor, serializers, API validation and published renderer run without network writes.
let storedStories=[],requests=[];
const nextParams={id:'qa-private-draft'};
function load(file){
 file=path.resolve(file);if(!path.extname(file))file+=fs.existsSync(file+'.tsx')?'.tsx':'.ts';
 if(cache.has(file))return cache.get(file).exports;
 const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);
 mod.require=name=>{
  if(name==='next/navigation')return {useParams:()=>nextParams};
  if(name==='next/cache')return {revalidatePath(){}};
  if(name==='next/server')return {NextResponse:{json:(body,options={})=>Response.json(body,options)}};
  if(name.endsWith('/admin-auth'))return {isAdmin:async()=>true};
  if(name.endsWith('/news-queue'))return {
   listStories:async()=>structuredClone(storedStories),getStorySlug:s=>s.id,
   createStory:async values=>{const story={...values,id:nextParams.id,source_name:'S.O.H CONSULTS',source_url:'manual:new',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};storedStories.push(story);return structuredClone(story);},
   updateStory:async(id,values)=>{const index=storedStories.findIndex(s=>s.id===id);if(index<0)return null;storedStories[index]={...storedStories[index],...values};return structuredClone(storedStories[index]);}
  };
  if(name.endsWith('/admin-recovery'))return {visibleAdminStories:s=>s,recordVersion:async()=>{},recordAudit:async()=>{}};
  if(name.endsWith('/article-upload-client'))return {uploadArticleFile:async(file,kind,progress)=>{uploads.push({file,kind});progress?.(100);return {url:'https://assets.example/'+file.name};}};
  if(name.endsWith('/ArticleAd'))return {__esModule:true,default:()=>null};
  if(name.startsWith('.'))return name.endsWith('.json')?require(path.resolve(path.dirname(file),name)):load(path.resolve(path.dirname(file),name));
  return require(name);
 };
 mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
 return mod.exports;
}
const {writeArticleBlocks,readArticleBlocks,articleBlocksError,hasArticleNarrative}=load('lib/article-blocks.ts');
const {tableFromHtml,tableFromRows,parseDelimitedRows}=load('lib/article-tables.ts');
const Editor=load('app/admin/updates/ArticleBlockEditor.tsx').default;
const Preview=load('app/admin/updates/ArticleLivePreview.tsx').default;
const Recovery=load('app/admin/updates/ArticleDraftRecovery.tsx').default;
const Structured=load('app/updates/[id]/StructuredArticle.tsx').default;
const Editorial=load('app/admin/updates/ArticleEditorialFields.tsx').default;
const NewPage=load('app/admin/updates/new/page.tsx').default;
const EditPage=load('app/admin/updates/edit/[id]/page.tsx').default;
const api=load('app/api/admin/stories/route.ts');
const {smartMeta,writeSmartMeta}=load('lib/smart-operations.ts');
const originalFetch=global.fetch;
global.fetch=async(url,options={})=>{
 assert.equal(url,'/api/admin/stories','tests never make external requests');
 const method=options.method||'GET';requests.push({method,body:options.body&&JSON.parse(options.body)});
 return method==='GET'?api.GET():api[method](new Request('https://editor.test/api/admin/stories',{...options,method}));
};
let container,root,current;
async function mount(component){container=document.createElement('div');document.body.append(container);root=createRoot(container);await act(async()=>root.render(component));}
async function editor(initial=[]){function Harness(){const [blocks,set]=React.useState(initial);current=blocks;return React.createElement(React.Fragment,null,React.createElement(Editor,{value:blocks,onChange:set}),React.createElement(Preview,{blocks,title:'Private QA article',summary:''}));}await mount(React.createElement(Harness));}
function button(text,scope=container){const found=[...scope.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert.ok(found,'button '+text);return found;}
function field(label){const found=container.querySelector(`[aria-label="${label}"]`);assert.ok(found,'field '+label);return found;}
async function click(node){await act(async()=>node.click());}
async function change(node,value){await act(async()=>{const proto=node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:node.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(node,value);node.dispatchEvent(new Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));});}
async function paste(node,plain,html=''){const event=new Event('paste',{bubbles:true,cancelable:true});Object.defineProperty(event,'clipboardData',{value:{getData:type=>type==='text/html'?html:plain}});await act(async()=>node.dispatchEvent(event));return event;}
function publicDocument(blocks){return new JSDOM(renderToStaticMarkup(React.createElement(Structured,{details:writeArticleBlocks('',blocks)}))).window.document;}
test.afterEach(async()=>{if(root){await act(async()=>root.unmount());container.remove();root=null;}localStorage.clear();uploads.length=0;storedStories=[];requests=[];});
test.after(()=>{global.fetch=originalFetch;});

test('table insertion, cells, rows, columns, moves, caption, alignment, width and round-trip preserve data',async()=>{
 await editor();await click(button('+ table'));assert.equal(current[0].type,'table');
 await change(field('Row 1, column 2'),'Rivers State University');await change(field('Row 1, column 3'),'1979');
 const caption=[...container.querySelectorAll('label')].find(l=>l.textContent.includes('Table caption')).querySelector('input');await change(caption,'University directory');
 await click(button('+ Row'));await change(field('Row 2, column 2'),'Second school');
 await click(field('Move row 2 up'));assert.equal(current[0].rows[0][1],'Second school');
 await click(button('+ Column'));await change(field('Column 4 heading'),'Website');await change(field('Row 1, column 4'),'https://example.edu.ng');
 await change(field('Column 4 alignment'),'right');await change(field('Column 4 width'),'320');await click(field('Move column 4 left'));
 assert.equal(current[0].headers[2],'Website');assert.equal(current[0].aligns[2],'right');assert.equal(current[0].widths[2],320);
 await click(field('Remove column 2'));await click(field('Remove row 2'));await click(button('Auto-number S/N'));
 assert.equal(current[0].rows[0][0],'1');assert.equal(current[0].rows.length,1);assert.equal(articleBlocksError(current),null);
 assert.deepEqual(readArticleBlocks(writeArticleBlocks('',current)),current);
 const preview=container.querySelector('[aria-label="Live article preview"]');assert.match(preview.textContent,/University directory/);assert.match(preview.textContent,/https:\/\/example.edu.ng/);
 const doc=publicDocument(current);assert.equal(doc.querySelectorAll('th[scope="col"]').length,3);assert.ok(doc.querySelector('[role="region"][tabindex="0"]').className.includes('overflow-x-auto'));
});
test('CSV and TSV preserve quoted cells and no-header data',()=>{
 assert.deepEqual(parseDelimitedRows('School,Notes\n"A, B","first\nsecond"'),[['School','Notes'],['A, B','first\nsecond']]);
 assert.equal(tableFromRows(parseDelimitedRows('A\t1980\nB\t1990'),false).rows.length,2);
});
test('Word/website HTML table imports preserve text around multiple links and line breaks',()=>{
 const result=tableFromHtml('<table><tr><th>Notes</th></tr><tr><td>Read <a href="https://example.edu.ng/one">first</a> and <a href="https://example.edu.ng/two">second</a><br>by Friday<script>bad()</script></td></tr></table>');
 assert.equal(result.rows[0][0],'Read [first](https://example.edu.ng/one) and [second](https://example.edu.ng/two)\nby Friday');
});
test('HTML import rejects excessive rows instead of silently dropping content',()=>{
 const html='<table><tr><th>School</th></tr>'+Array.from({length:301},(_,i)=>'<tr><td>School '+i+'</td></tr>').join('')+'</table>';
 assert.throws(()=>tableFromHtml(html),/300/);
});
test('imports reject overlong cells instead of silently truncating them',()=>{assert.throws(()=>tableFromRows([['School'],['x'.repeat(3001)]]),/3000/);});
test('spreadsheet and website table paste inserts an actual table block without losing the paragraph',async()=>{
 await editor([{type:'paragraph',text:'Intro'}]);await paste(field('paragraph 1'),'School\tYear\nSchool A\t1990');
 assert.equal(current[0].text,'Intro');assert.equal(current[1].type,'table');assert.equal(current[1].rows[0][1],'1990');
 await paste(field('paragraph 1'),'School B 2000','<table><tr><th>School</th><th>Year</th></tr><tr><td>School B</td><td>2000</td></tr></table>');assert.equal(current[1].rows[0][0],'School B');
});
test('TOC omits empty/blank heading lists and short one-heading articles',()=>{
 for(const blocks of [[{type:'toc'}],[{type:'toc'},{type:'heading',text:' '}],[{type:'toc'},{type:'heading',text:'Only section'}]])assert.equal(publicDocument(blocks).querySelector('nav[aria-label="Article table of contents"]'),null);
});
test('TOC anchors are unique, target actual headings, and survive edits, reorder and serialization',async()=>{
 await editor();await click(button('+ Table of contents'));await click(button('+ heading'));await change(field('heading 2'),'Admission');await click(button('+ paragraph'));await change(field('paragraph 3'),'Section content');await click(button('+ heading'));await change(field('heading 4'),'Admission');
 let headings=current.filter(b=>b.type==='heading');assert.ok(headings.every(b=>b.anchor));assert.notEqual(headings[0].anchor,headings[1].anchor);const anchor=headings[1].anchor;
 const editBlocks=container.querySelector('[aria-label="Article content editor"]');const moveButtons=[...editBlocks.querySelectorAll('button')].filter(b=>b.textContent==='↑ Up');await click(moveButtons.at(-1));
 headings=current.filter(b=>b.type==='heading');assert.equal(headings[1].anchor,anchor);await change(field('heading 3'),'Fees');assert.equal(current[2].anchor,anchor);
 const restored=readArticleBlocks(writeArticleBlocks('',current));assert.equal(restored[2].anchor,anchor);const doc=publicDocument(restored);const links=[...doc.querySelectorAll('nav a')];assert.equal(links.length,2);assert.equal(new Set(links.map(a=>a.hash)).size,2);for(const a of links){assert.equal(doc.querySelectorAll(a.hash).length,1);assert.ok(a.getAttribute('href').startsWith('#'));}
});
test('TOC recomputes after heading removal and preserves legacy index anchors',()=>{
 const doc=publicDocument([{type:'toc'},{type:'heading',text:'One'},{type:'heading',text:'Two'},{type:'heading',text:'Two'}]);assert.equal(doc.querySelectorAll('nav a').length,3);assert.ok(doc.querySelector('#section-1'));assert.ok(doc.querySelector('#section-3'));
 const short=publicDocument([{type:'toc'},{type:'heading',text:'One'}]);assert.equal(short.querySelector('nav'),null);
});
test('undo/redo buttons and keyboard shortcuts restore actual editor state',async()=>{
 await editor();await click(button('+ table'));await click(button('↶ Undo'));assert.equal(current.length,0);await click(button('↷ Redo'));assert.equal(current[0].type,'table');
 await act(async()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true,altKey:true,bubbles:true})));assert.equal(current.length,0);
 await act(async()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'y',metaKey:true,altKey:true,bubbles:true})));assert.equal(current[0].type,'table');
});
test('notice, quote, FAQ, divider, word count and preview controls function',async()=>{
 await editor([{type:'paragraph',text:'one two three'}]);for(const name of ['+ notice','+ quote','+ FAQ','+ divider'])await click(button(name));
 const notice=container.querySelector('select:not([aria-label])');await change(notice,'warning');
 const labels=[...container.querySelectorAll('label')];const find=(s,tag='textarea')=>labels.find(l=>l.textContent.startsWith(s)).querySelector(tag);
 await change(find('Notice heading','input'),'Warning');await change(find('Notice text'),'Read this warning');await change(find('Quotation'),'Keep learning');await change(find('Attribution','input'),'S.O.H');await change(find('Question 1','input'),'How to apply?');await change(find('Answer'),'Read the official portal.');
 assert.equal(articleBlocksError(current),null);assert.equal(hasArticleNarrative(current),true);assert.match(container.textContent,/words · about 1 min read/);
 const preview=container.querySelector('[aria-label="Live article preview"]');assert.ok(preview.querySelector('blockquote'));assert.ok(preview.querySelector('details summary'));assert.ok(preview.querySelector('[role="separator"][aria-label="Article section divider"]'));
 await click(button('Mobile',preview));assert.ok(preview.querySelector('.max-w-\\[390px\\]'));await click(button('Hide preview',preview));assert.equal(preview.querySelector('blockquote'),null);await click(button('Show preview',preview));assert.ok(preview.querySelector('blockquote'));
});
test('browser draft save clears dirty navigation guard and pending autosave',async()=>{
 let setSnapshot,setToken;function Harness(){const [snapshot,set]=React.useState({text:''});const [token,save]=React.useState(0);setSnapshot=set;setToken=save;return React.createElement(Recovery,{storageKey:'qa-draft',snapshot,saveToken:token,onRestore:set});}
 await mount(React.createElement(Harness));await act(async()=>setSnapshot({text:'Saved work'}));let event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);assert.equal(event.defaultPrevented,true);
 await act(async()=>setToken(1));event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);assert.equal(event.defaultPrevented,false);
 await act(async()=>new Promise(r=>setTimeout(r,1300)));assert.equal(localStorage.getItem('qa-draft'),null);
});
test('browser crash recovery restores a saved snapshot',async()=>{
 localStorage.setItem('qa-recover',JSON.stringify({savedAt:Date.now(),snapshot:{text:'Recovered'}}));let restored;
 await mount(React.createElement(Recovery,{storageKey:'qa-recover',snapshot:{text:''},onRestore:s=>{restored=s;}}));await click(button('Restore browser draft'));assert.equal(restored.text,'Recovered');assert.doesNotMatch(container.textContent,/Unsaved browser draft found/);
});
test('discarding browser recovery keeps the loaded article and removes the old snapshot',async()=>{
 localStorage.setItem('qa-recover',JSON.stringify({savedAt:Date.now(),snapshot:{text:'Old unsaved work'}}));let restored=false;
 await mount(React.createElement(Recovery,{storageKey:'qa-recover',snapshot:{text:'Current article'},onRestore:()=>{restored=true;}}));await click(button('Discard browser draft'));assert.equal(restored,false);assert.equal(localStorage.getItem('qa-recover'),null);
});
test('image, gallery, PDF and video upload handlers retain expected types and public rendering',async()=>{
 await editor();for(const name of ['+ image','+ gallery','+ PDF attachment','+ video'])await click(button(name));
 const inputs=[...container.querySelectorAll('input[type="file"]')];const names=['photo.png','gallery.png','attachment.pdf','clip.mp4'];
 for(let i=0;i<inputs.length;i++){const file={name:names[i],size:12,type:i===2?'application/pdf':i===3?'video/mp4':'image/png'};Object.defineProperty(inputs[i],'files',{value:[file],configurable:true});await act(async()=>inputs[i].dispatchEvent(new Event('change',{bubbles:true})));}
 assert.deepEqual(uploads.map(u=>u.kind),['image','image','document','video']);assert.equal(articleBlocksError(current),null);const doc=publicDocument(current);assert.equal(doc.querySelectorAll('video').length,1);assert.match(doc.body.textContent,/Open PDF: attachment.pdf/);
});
test('editorial fields update metadata values without changing article blocks',async()=>{
 let value;function Harness(){const [v,set]=React.useState({});value=v;return React.createElement(Editorial,{value:v,onChange:set,disabled:false});}await mount(React.createElement(Harness));const inputs=container.querySelectorAll('input,textarea');for(let i=0;i<inputs.length;i++)await change(inputs[i],['SEO title','Image alt','SEO description','2027-01-20','Correction note'][i]);assert.equal(value.seoTitle,'SEO title');assert.equal(value.imageAlt,'Image alt');assert.equal(value.reviewAfter,'2027-01-20');assert.equal(value.correction,'Correction note');
});
test('CSV/TSV file import uses the real table controls and reports oversize files safely',async()=>{
 await editor([{type:'table',headers:['Old'],rows:[['old']]}]);const input=container.querySelector('input[type="file"]');
 Object.defineProperty(input,'files',{value:[{name:'schools.csv',size:30,text:async()=> 'School,Year\n"A, B",1990'}],configurable:true});await act(async()=>input.dispatchEvent(new Event('change',{bubbles:true})));assert.equal(current[0].rows[0][0],'A, B');
 Object.defineProperty(input,'files',{value:[{name:'large.tsv',size:512001,text:async()=>{throw Error('must not read oversize file');}}],configurable:true});await act(async()=>input.dispatchEvent(new Event('change',{bubbles:true})));assert.match(container.textContent,/smaller than 500 KB/);assert.equal(current[0].rows[0][0],'A, B');await click(button('Auto-number S/N'));assert.equal(field('Column 1 width').value,'80');
});
test('paragraph and heading formatting retain selected text and stable heading anchors',async()=>{
 await editor([{type:'paragraph',text:'Read this'},{type:'heading',text:'Title',anchor:'section-stable'}]);const area=field('paragraph 1');area.setSelectionRange(0,4);await click(button('Bold'));assert.equal(current[0].text,'**Read** this');assert.ok(container.querySelector('[aria-label="Live article preview"] strong'));
 const headingBlock=field('heading 2').closest('section');await click(button('Reset to default',headingBlock));assert.equal(current[1].anchor,'section-stable');
});
test('existing article links select published updates and render safe internal URLs',async()=>{
 storedStories=[{id:'published-update',title:'Verified admission update',details:'Existing content',status:'published',source_name:'S.O.H CONSULTS'}];await editor([{type:'paragraph',text:''}]);await click(button('Link existing article'));await click(button('Verified admission update'));assert.match(current[0].text,/\[Verified admission update\]\(\/updates\/published-update\)/);assert.equal(container.querySelector('[aria-label="Live article preview"] a').getAttribute('href'),'/updates/published-update');
});
test('new draft saves through the real API and reopens with table, TOC and SEO metadata intact',async()=>{
 await mount(React.createElement(NewPage));const headline=[...container.querySelectorAll('label')].find(l=>l.textContent==='Headline').querySelector('input');await change(headline,'Private CMS QA draft');
 await change(field('paragraph 1'),'Private introduction');await click(button('+ Table of contents'));await click(button('+ heading'));await change(field('heading 3'),'Applications');await click(button('+ heading'));await change(field('heading 4'),'Fees');await click(button('+ table'));await change(field('Row 1, column 2'),'School A');
 const seo=[...container.querySelectorAll('label')].find(l=>l.textContent.startsWith('Search-result title')).querySelector('input');await change(seo,'Draft SEO title');await click(button('Save Draft'));
 assert.equal(storedStories.length,1);assert.equal(storedStories[0].status,'draft');assert.equal(requests.find(r=>r.method==='POST').body.status,'draft');assert.equal(localStorage.getItem('soh-editor-new-v1'),null);assert.equal(smartMeta(storedStories[0].details).seoTitle,'Draft SEO title');const saved=readArticleBlocks(storedStories[0].details);
 await act(async()=>root.unmount());container.remove();root=null;await mount(React.createElement(EditPage));assert.deepEqual(readArticleBlocks(storedStories[0].details),saved);assert.equal(field('Row 1, column 2').value,'School A');assert.equal(container.querySelectorAll('[aria-label="Live article preview"] nav a').length,2);await click(button('Save Changes'));assert.equal(storedStories[0].status,'draft');assert.deepEqual(readArticleBlocks(storedStories[0].details),saved);
});
test('saving an existing draft preserves scheduling instants in a non-UTC browser timezone',async()=>{
 const oldTimezone=process.env.TZ;process.env.TZ='Africa/Lagos';try{
 storedStories=[{id:nextParams.id,title:'Scheduled article',institution:'School A',category:'Admission',status:'draft',source_name:'S.O.H CONSULTS',details:writeSmartMeta(writeArticleBlocks('',[{type:'paragraph',text:'Existing article text'}]),{schedule:'2026-11-20T10:00:27.000Z',expires:'2026-11-30T10:00:45.000Z'})}];
 await mount(React.createElement(EditPage));await click(button('Save Changes'));const meta=smartMeta(storedStories[0].details);assert.equal(meta.schedule,'2026-11-20T10:00:27.000Z');assert.equal(meta.expires,'2026-11-30T10:00:45.000Z');
 }finally{if(oldTimezone===undefined)delete process.env.TZ;else process.env.TZ=oldTimezone;}
});
test('real publication quality accepts table-only and FAQ articles and rejects layout-only articles',async()=>{
 for(const blocks of [[{type:'table',headers:['School'],rows:[['School A']]}],[{type:'faq',entries:[{question:'How?',answer:'Read the official guidance.'}]}]]){const response=await api.POST(new Request('https://editor.test/api/admin/stories',{method:'POST',body:JSON.stringify({title:'Quality QA',status:'published',details:writeArticleBlocks('',blocks)})}));assert.equal(response.status,201);}
 const response=await api.POST(new Request('https://editor.test/api/admin/stories',{method:'POST',body:JSON.stringify({title:'Empty article',status:'published',details:writeArticleBlocks('',[{type:'toc'},{type:'divider'}])})}));assert.equal(response.status,400);assert.match((await response.json()).error,/Article text is missing/);
});
