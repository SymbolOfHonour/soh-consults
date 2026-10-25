const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://visitor.test/updates',pretendToBeVisual:true});
for(const name of ['window','document','Node','HTMLElement','DOMParser','Event','MouseEvent','KeyboardEvent','HTMLInputElement','HTMLTextAreaElement','HTMLSelectElement','localStorage'])global[name]=dom.window[name];
global.requestAnimationFrame=fn=>{fn();return 0;};
HTMLElement.prototype.scrollTo=function(){};
HTMLElement.prototype.scrollIntoView=function(){};
window.scrollTo=function(){};
global.IS_REACT_ACT_ENVIRONMENT=true;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{renderToReadableStream}=require('react-dom/server');
const cache=new Map();let stories=[],rate={allowed:true},requests=[];
// Isolate database/authentication/telemetry and navigation transports. Actual public
// components, ranking, serializers, validation and Ask S.O.H route execute below.
function load(file){
 file=path.resolve(file);if(!path.extname(file))file+=fs.existsSync(file+'.tsx')?'.tsx':'.ts';
 if(cache.has(file))return cache.get(file).exports;
 const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);
 mod.require=name=>{
  if(name==='next/navigation')return {usePathname:()=>window.location.pathname,notFound(){throw Error('NOT_FOUND');},permanentRedirect(url){throw Error('REDIRECT '+url);}};
  if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
  if(name==='next/headers')return {headers:async()=>new Headers()};
  if(name==='next/server')return {NextResponse:{json:Response.json}};
  if(name.endsWith('/rate-limit'))return {checkRateLimit:async()=>rate};
  if(name.endsWith('/telemetry'))return {recordQuestion:async()=>{}};
  if(name.endsWith('/site-manager'))return {getPublishedSiteSettings:async()=>({adsEnabled:false})};
  if(name.endsWith('/news-queue'))return {...load('lib/news-queue.ts'),listPublishedStories:async()=>structuredClone(stories),getPublishedStoryBySlug:async slug=>structuredClone(stories.find(story=>load('lib/news-queue.ts').getStorySlug(story)===slug)||null)};
  if(name.startsWith('@/'))return load(name.slice(2));
  if(name.startsWith('.'))return name.endsWith('.json')?require(path.resolve(path.dirname(file),name)):load(path.resolve(path.dirname(file),name));
  return require(name);
 };
 mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);return mod.exports;
}
const {articleText,articleReadingMinutes}=load('lib/article-text.ts');
const {writeArticleBlocks}=load('lib/article-blocks.ts');
const {writeSmartMeta}=load('lib/smart-operations.ts');
const {normalisePublisherName,articlePublisherName,articleAuthor}=load('lib/article-publisher.ts');
const ArticlePage=load('app/updates/[id]/page.tsx');
const {storyDiscovery}=load('lib/content-catalogue.ts');
const {applicationSections,checklistSection}=load('lib/application-guide.ts');
const Updates=load('app/components/UpdatesExplorer.tsx').default,Search=load('app/components/SearchExplorer.tsx').default;
const School=load('app/components/MySchoolFeed.tsx').default,Enquiry=load('app/components/ServiceEnquiry.tsx').default;
const OOU=load('app/oou-calculator/page.tsx').default,Ask=load('app/components/AskSOH.tsx').default;
const Header=load('app/components/DiscoveryHeader.tsx').default;
const CGPA=load('app/cgpa-calculator/planner/page.tsx').default;
const Application=load('app/applications/[slug]/page.tsx').default;
const api=load('app/api/ask-soh/search/route.ts');
const queue=load('lib/news-queue.ts');
const originalFetch=global.fetch;
global.fetch=async(url,options={})=>{
 assert.equal(url,'/api/ask-soh/search','visitor tests cannot contact external systems');requests.push(JSON.parse(options.body));
 const request=new Request('https://visitor.test'+url,options);Object.defineProperty(request,'nextUrl',{value:new URL(request.url)});return api.POST(request);
};
let root,container;
async function mount(component){container=document.createElement('div');document.body.append(container);root=createRoot(container);await act(async()=>root.render(component));}
async function unmount(){if(root){await act(async()=>root.unmount());container.remove();root=null;}}
function button(text){const node=[...container.querySelectorAll('button')].find(b=>b.textContent.trim()===text||b.getAttribute('aria-label')===text);assert.ok(node,'button '+text);return node;}
function field(label){const node=container.querySelector(`[aria-label="${label}"]`)||[...container.querySelectorAll('label')].find(l=>l.textContent.startsWith(label))?.querySelector('input,select,textarea');assert.ok(node,'field '+label);return node;}
async function click(node){await act(async()=>node.click());}
async function change(node,value){assert.ok(node);await act(async()=>{const proto=node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:node.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(node,value);node.dispatchEvent(new Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));});}
function fixture(details,extra={}){return {id:'public-fixture',title:'Fixture admission application',summary:'Published fixture',details,category:'Admission',institution:'Nigeria',status:'published',source_name:'S.O.H CONSULTS',source_url:'manual:fixture',created_at:'2026-10-18T10:00:00Z',updated_at:'2026-10-18T10:00:00Z',source_published_at:null,...extra};}
test.afterEach(async()=>{await unmount();localStorage.clear();stories=[];requests=[];rate={allowed:true};window.history.replaceState(null,'','/updates');});
test.after(()=>{global.fetch=originalFetch;});

test('reading time uses all readable structured content and ignores layout and encoded metadata',()=>{
 const text=Array(1000).fill('application').join(' ');assert.equal(articleReadingMinutes(text),5);assert.equal(articleReadingMinutes(writeArticleBlocks('',[{type:'paragraph',text}])),5);
 const blocks=[{type:'heading',text:'Heading'},{type:'notice',variant:'info',title:'Notice title',text:'Notice body'},{type:'quote',text:'Quote body',attribution:'Attribution'},{type:'table',caption:'Caption',headers:['School'],rows:[['XylophoneInstitution']]},{type:'faq',entries:[{question:'FAQ question',answer:'FAQ answer'}]},{type:'collapsible',title:'Expandable title',text:'Expandable body'},{type:'image',url:'https://example.test/image.jpg',alt:'Image caption'},{type:'document',url:'https://example.test/file.pdf',name:'Document name'},{type:'video',url:'https://example.test/file.mp4',mode:'link',title:'Video title'},{type:'divider'},{type:'toc'},{type:'ad',slot:'article-inline'}];
 const value=articleText(writeArticleBlocks('',blocks));for(const expected of ['Heading','Notice title','Notice body','Attribution','Caption','XylophoneInstitution','FAQ question','FAQ answer','Expandable title','Expandable body','Image caption','Document name','Video title'])assert.ok(value.includes(expected),expected);assert.ok(!value.includes('SOH_BLOCKS'));assert.ok(!value.includes('article-inline'));
 assert.equal(articleText('Visible article\n[SOH_SMART:encoded-hidden]\n[SOH_GALLERY:encoded-gallery]\n[SOH:FEATURED]\n[SCHEDULE:2027-01-01]'),'Visible article');assert.equal(articleReadingMinutes(''),1);
});
test('update cards show correct reading time and search finds table, FAQ and expandable text',async()=>{
 const blocks=[{type:'paragraph',text:Array(1000).fill('application').join(' ')},{type:'table',headers:['School'],rows:[['XylophoneInstitution']]},{type:'faq',entries:[{question:'ZephyrQuestion',answer:'Answer'}]},{type:'collapsible',title:'MarigoldTitle',text:'Expanded content'}];
 const story=fixture(writeArticleBlocks('',blocks));await mount(React.createElement(Updates,{importedStories:[story]}));assert.match(container.querySelector('article').textContent,/5 min read/);
 const input=container.querySelector('#update-search');for(const value of ['XylophoneInstitution','ZephyrQuestion','MarigoldTitle']){await change(input,value);assert.equal(container.querySelectorAll('article').length,1);assert.match(window.location.search,/q=/);}await change(input,'nomatchingrecord');assert.equal(container.querySelectorAll('article').length,0);await click(button('Clear search and filters'));assert.equal(container.querySelectorAll('article').length,1);assert.equal(window.location.search,'');
 await unmount();await mount(React.createElement(Search,{items:[storyDiscovery(story)]}));await change(container.querySelector('#global-search'),'XylophoneInstitution');assert.equal(container.querySelectorAll('article').length,1);
});
test('global search filters, reset and URL restoration preserve the actual result list',async()=>{
 const items=[{id:'guide',href:'/guides/a',kind:'guide',title:'LASU admission guidance'},{id:'closed',href:'/updates/closed',kind:'update',title:'LASU admission notice',deadline:'2020-01-01'},{id:'current',href:'/updates/current',kind:'update',title:'LASU admission form',deadline:'2035-01-01'}];
 window.history.replaceState(null,'','/search?q=LASU&type=guide');await mount(React.createElement(Search,{items}));assert.equal(container.querySelectorAll('article').length,1);assert.match(container.querySelector('article').textContent,/guidance/);
 await click(button('Clear search and filters'));await change(container.querySelector('#global-search'),'LASU');await change(container.querySelector('#search-availability'),'current');assert.equal(container.querySelectorAll('article').length,2);assert.ok(![...container.querySelectorAll('article')].some(a=>a.textContent.includes('notice')));
 await act(async()=>{window.history.replaceState(null,'','/search?q=LASU&type=calculator');window.dispatchEvent(new Event('popstate'));});assert.equal(container.querySelectorAll('article').length,0);await click(button('Search all content'));assert.equal(container.querySelectorAll('article').length,3);
});
test('school preferences save, reopen and clear without including another school or closed notices',async()=>{
 const items=[{id:'lasu',href:'/updates/lasu',kind:'update',title:'LASU screening admission'},{id:'edu',href:'/updates/edu',kind:'update',title:'LASUED screening admission'},{id:'closed',href:'/updates/closed',kind:'update',title:'LASU admission closed',deadline:'2020-01-01'}];const props={items,schools:['LASU','LASUED']};await mount(React.createElement(School,props));const school=[...container.querySelectorAll('label')].find(l=>l.textContent==='LASU').querySelector('input');await click(school);assert.equal(container.querySelectorAll('article').length,1);assert.match(container.querySelector('article').textContent,/LASU screening/);assert.deepEqual(JSON.parse(localStorage.getItem('soh:my-school:v1')).schools,['LASU']);await unmount();await mount(React.createElement(School,props));assert.equal(container.querySelectorAll('article').length,1);await click(button('Clear preferences'));assert.equal(container.querySelectorAll('article').length,0);
});
test('WhatsApp enquiry carries edited service, school and page as a reviewable draft',async()=>{
 await mount(React.createElement(Enquiry,{school:'LASU',context:'https://sohconsults.com.ng/applications/fixture'}));await change(container.querySelector('select'),'WAEC certificate');await change(container.querySelector('input'),'LASU & UNILAG');const link=container.querySelector('a');const url=new URL(link.href);assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/2348182141088');const message=url.searchParams.get('text');assert.match(message,/WAEC certificate/);assert.match(message,/LASU & UNILAG/);assert.match(message,/applications\/fixture/);assert.equal(link.target,'_blank');
});
test('OOU live calculator validates bounds and combines real score inputs without showing missing scores as complete',async()=>{
 await mount(React.createElement(OOU));const jamb=container.querySelector('#oou-jamb'),post=field('Post-UTME score (0-100)');await change(jamb,'250');assert.match(container.textContent,/37\.50\/100/);assert.match(container.textContent,/Before Post-UTME/);await change(post,'65');assert.match(container.textContent,/63\.50\/100/);await change(post,'101');assert.equal(post.getAttribute('aria-invalid'),'true');assert.ok(!container.textContent.includes('77.90/100'));await change(post,'');await change(jamb,'401');assert.equal(jamb.getAttribute('aria-invalid'),'true');assert.match(container.textContent,/Enter a JAMB score/);
});
test('application page preserves tables, FAQ and expandable blocks from the published rendering path',async()=>{
 const blocks=[{type:'collapsible',title:'Eligibility requirements',text:'Five credits as supplied.'},{type:'table',caption:'Application fees',headers:['Item','Amount'],rows:[['Application','As stated by the school']]},{type:'faq',entries:[{question:'What next?',answer:'Read the official notice.'}]}];const story=fixture(writeArticleBlocks('',blocks));stories=[story];const element=await Application({params:Promise.resolve({slug:queue.getStorySlug(story)})});const stream=await renderToReadableStream(element);await stream.allReady;const doc=new JSDOM(await new Response(stream).text()).window.document;assert.equal(doc.querySelectorAll('table').length,1);assert.equal(doc.querySelectorAll('details').length,2);assert.match(doc.body.textContent,/As stated by the school/);assert.match(doc.body.textContent,/Read the official notice/);assert.equal(checklistSection(applicationSections(story),'eligibility')[0].text,'Five credits as supplied.');
});
test('small-screen navigation toggle exposes working site routes and closes again',async()=>{
 await mount(React.createElement(Header));await click(button('Toggle navigation'));assert.equal(button('Toggle navigation').getAttribute('aria-expanded'),'true');const menu=container.querySelector('#discovery-menu');for(const route of ['/updates','/opportunities','/deadlines','/guides','/my-school','/tools'])assert.ok(menu.querySelector(`a[href="${route}"]`));await click(button('Toggle navigation'));assert.equal(container.querySelector('#discovery-menu'),null);
});
async function ask(question){await change(field('Ask S.O.H question'),question);await act(async()=>{container.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,180));});}
test('Ask S.O.H question goes through the real API and renders the service answer and contact link',async()=>{
 await mount(React.createElement(Ask));await click(button('Open Ask S.O.H admission assistant'));await ask('Where can I buy a WAEC result token?');assert.equal(requests.length,1);assert.match(container.textContent,/S.O.H CONSULTS can assist/);assert.ok(container.querySelector('a[href^="https://wa.me/"]'));assert.equal(field('Ask S.O.H question').disabled,false);await click(button('Restart Ask S.O.H'));assert.ok(!container.textContent.includes('Where can I buy a WAEC result token?'));
});
test('Ask S.O.H API outage is visible in the widget and does not leave input stuck',async()=>{
 rate={allowed:false,unavailable:true,retryAfter:60};await mount(React.createElement(Ask));await click(button('Open Ask S.O.H admission assistant'));await ask('Where can I buy a WAEC result token?');assert.equal(requests.length,1);assert.match(container.textContent,/temporarily unavailable/);assert.equal(field('Ask S.O.H question').disabled,false);
});

test('CGPA target planner computes the required GPA from actual fields and responds to an unreachable target',async()=>{
 window.history.replaceState(null,'','/cgpa-calculator/planner?grading=university-5&tool=target');await mount(React.createElement(CGPA));await change(field('Current CGPA'),'3');await change(field('Completed Course Units (CTNUP)'),'60');await change(field('Personal target CGPA'),'3.05');await change(container.querySelector('input[placeholder="Course 1 code"]'),'GST101');assert.match(container.textContent,/approximately 4\.05 \/ 5\.00 average GPA across 3 course units/);await change(field('Personal target CGPA'),'4.5');assert.match(container.textContent,/above the grading scale/);assert.match(container.textContent,/Not possible/);
});

test('published articles display their own publisher in the headline, card, metadata and structured data',async()=>{
 const cases=[['Ada Sunday','Ada Sunday'],['Bola Ade','Bola Ade'],[undefined,'S.O.H CONSULTS']];
 for(let i=0;i<cases.length;i++){const [publisherName,expected]=cases[i];const details=i===2?'Legacy article body':writeArticleBlocks('',[{type:'paragraph',text:'Published body stays intact.'}]);const story=fixture(writeSmartMeta(details,{publisherName}),{id:'publisher-'+i,title:'Publisher article '+i});stories=[story];const params=Promise.resolve({id:queue.getStorySlug(story)});const stream=await renderToReadableStream(await ArticlePage.default({params}));await stream.allReady;const doc=new JSDOM(await new Response(stream).text()).window.document;assert.equal(doc.querySelector('[aria-label="Article publisher"] h2').textContent,expected);assert.match(doc.querySelector('.soh-article-header').textContent,new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal((await ArticlePage.generateMetadata({params})).authors[0].name,expected);const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(n=>JSON.parse(n.textContent));const article=schemas.find(s=>s['@type']==='Article');if(publisherName){assert.equal(article.author.name,publisherName);assert.equal(article.author['@type'],'Person');}else assert.ok(article.author['@id'].endsWith('/#organization'));assert.ok(article.publisher['@id'].endsWith('/#organization'));}
});
test('publisher names have safe defaults, bounded Unicode text and escaped public output',async()=>{
 for(const invalid of [undefined,null,42,{},['Name'],'   '])assert.equal(articlePublisherName(invalid),'S.O.H CONSULTS');assert.equal(normalisePublisherName('  Ada  Sunday\n '),'Ada Sunday');assert.equal(Array.from(normalisePublisherName('𝗔'.repeat(121))).length,120);assert.ok(articleAuthor('', 'https://example.test')['@id'].endsWith('/#organization'));
 const Publisher=load('app/updates/[id]/ArticlePublisher.tsx').default;const name='<img src=x onerror=alert(1)>';const stream=await renderToReadableStream(React.createElement(Publisher,{name}));await stream.allReady;const doc=new JSDOM(await new Response(stream).text()).window.document;assert.equal(doc.querySelector('img'),null);assert.equal(doc.querySelector('h2').textContent,name);
});

test('Ask S.O.H brand services and contact questions reach the API instead of canned consultation',async()=>{
 await mount(React.createElement(Ask));await click(button('Open Ask S.O.H admission assistant'));
 await ask('What services does S.O.H CONSULTS offer?');assert.equal(requests.length,1);assert.match(container.textContent,/Post-UTME and Direct Entry registrations/);
 await ask('How can I contact S.O.H CONSULTS?');assert.equal(requests.length,2);assert.ok(container.querySelector('a[href="mailto:support@sohconsults.com.ng"]')||container.textContent.includes('support@sohconsults.com.ng'));
});
test('Ask S.O.H sends session-only and Direct Entry follow-ups with subject context',async()=>{
 const transport=global.fetch;const bodies=[];
 global.fetch=async(url,options)=>{assert.equal(url,'/api/ask-soh/search');bodies.push(JSON.parse(options.body));return Response.json({query:bodies.at(-1).question,answer:'Please clarify the admission details.',results:[],confidence:'low'});};
 try{
  await mount(React.createElement(Ask));await click(button('Open Ask S.O.H admission assistant'));
  await ask('What are FUOYE Post-UTME requirements for 2026/2027?');
  await ask('And Direct Entry?');assert.equal(bodies.length,2);assert.match(bodies[1].context,/FUOYE.*2026\/2027/);assert.ok(bodies[1].history.length>0);
  await click(button('Restart Ask S.O.H'));
  await ask('What is LASU cutoff?');await ask('2026/2027');assert.equal(bodies.length,4);assert.equal(bodies[3].context,'What is LASU cutoff?');
 }finally{global.fetch=transport;}
});
