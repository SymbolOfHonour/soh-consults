const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function loader(mocks={}){const cache=new Map();return function load(file){file=path.resolve(file);if(!path.extname(file))file+='.ts';if(cache.has(file))return cache.get(file).exports;const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);mod.require=name=>mocks[name]||(name.startsWith('.')?load(path.resolve(path.dirname(file),name)):require(name));mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);return mod.exports;};}
const load=loader(),media=load('lib/reusable-media.ts'),blocks=load('lib/article-blocks.ts'),gallery=load('lib/story-gallery.ts');
const origin='https://sohconsults.com.ng';
const article={id:'article-one',title:'LASU admission guide',source_name:'S.O.H CONSULTS',category:'Admission',image_url:'/lasu-campus.jpg',details:'',status:'published'};
test('old public website paths become reusable HTTPS URLs; unsafe and private routes are rejected',()=>{
 assert.equal(media.reusableMediaUrl('/lasu-campus.jpg',origin),origin+'/lasu-campus.jpg');
 assert.equal(media.reusableMediaUrl('https://assets.test/campus.jpg#preview',origin),'https://assets.test/campus.jpg');
 for(const value of ['//evil.test/file','http://assets.test/file','javascript:alert(1)','data:image/png,test','https://user:secret@assets.test/file','/api/admin/writer','/admin/history','/images/../api/secret','/\\evil.test/file','/bad\nfile'])assert.equal(media.reusableMediaUrl(value,origin),null,value);
});
test('discovery includes old galleries, featured images, block files and multiple article references without exposing private records',()=>{
 const details=blocks.writeArticleBlocks(gallery.setGalleryImages('', ['https://assets.test/legacy.jpg']),[
  {type:'image',url:'https://assets.test/block.jpg',alt:'Campus entrance'},
  {type:'gallery',urls:['https://assets.test/gallery.jpg','https://assets.test/block.jpg']},
  {type:'document',url:'https://assets.test/guide.pdf',name:'Admission guide'},
  {type:'video',url:'https://assets.test/tour.mp4',title:'Campus tour',mode:'player'}
 ]);
 const stories=[{...article,details,document_url:'https://assets.test/form.pdf',document_name:'Application form'}, {...article,title:'Second article'},...['S.O.H System:history:id','S.O.H Trash:trash','S.O.H Opportunity:job','Admin:secret'].map(source_name=>({...article,source_name,image_url:'https://assets.test/private.jpg'}))];
 const images=[...media.articleMedia(stories,'image',origin).values()];
 assert.equal(images.length,4);assert.deepEqual(images.find(f=>f.url===origin+'/lasu-campus.jpg').usedIn,['LASU admission guide','Second article']);
 assert.equal(images.find(f=>f.url.endsWith('/block.jpg')).alt,'Campus entrance');assert.ok(images.some(f=>f.url.endsWith('/legacy.jpg')));
 assert.deepEqual([...media.articleMedia(stories,'document',origin).values()].map(f=>f.name),['Application form','Admission guide']);
 assert.equal([...media.articleMedia(stories,'video',origin).values()][0].mode,'player');
 assert.ok(images.every(f=>!('details' in f)&&!('source_name' in f)));
});
test('reusing media preserves descriptions, gallery limits and video display mode',()=>{
 const file={kind:'image',name:'Campus',url:'https://assets.test/campus.jpg',alt:'Campus entrance'};
 const image={type:'image',url:'',alt:'My description'};assert.equal(media.insertReusableMedia(image,file).alt,'My description');assert.equal(image.url,'');
 assert.equal(media.insertReusableMedia({type:'image',url:''},file).alt,'Campus entrance');
 const full={type:'gallery',urls:Array.from({length:10},(_,i)=>`https://assets.test/${i}.jpg`)};
 assert.deepEqual(media.insertReusableMedia(full,file).urls,full.urls);
 assert.equal(media.insertReusableMedia({type:'gallery',urls:[file.url]},file).urls.length,1);
 assert.equal(media.insertReusableMedia({type:'video',url:'',mode:'link'},{kind:'video',name:'Tour',url:'https://assets.test/tour.mp4'}).mode,'player');
 assert.equal(media.insertReusableMedia({type:'video',url:'',mode:'player'},{kind:'video',name:'Tour',url:'https://video.test/watch',mode:'link'}).mode,'link');
 assert.equal(media.insertReusableMedia({type:'document',url:'',name:'My label'},{kind:'document',name:'Guide',url:'https://assets.test/guide.pdf'}).name,'My label');
 assert.equal(media.insertReusableMedia(image,{...file,kind:'document'}),image);
});
function apiFixture({authenticated=true,storage=[],stories=[article],storageError=false,storyError=false}={}){
 const calls=[],previous=process.env.SUPABASE_URL;process.env.SUPABASE_URL='https://storage.test';
 const api=loader({'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'../../../../../lib/editor-team':{currentWriter:async()=>authenticated?{id:'writer'}:null,teamRequest:async(p,options)=>{calls.push({path:p,body:JSON.parse(options.body)});if(storageError)throw Error('private storage error');return storage;}},'../../../../../lib/writer-articles':{listWriterArticles:async()=>{calls.push({stories:true});if(storyError)throw Error('private database error');return stories;}}})('app/api/admin/writer/media/route.ts');
 return {calls,async get(query=''){try{return await api.GET(new Request(origin+'/api/admin/writer/media'+query));}finally{if(previous===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=previous;}}};
}
test('media endpoint requires membership, validates paths and offsets, and never caches private results',async()=>{
 for(const [options,query,status] of [[{authenticated:false},'',401],[{},'?folder=../../private',400],[{},'?offset=-1',400],[{},'?offset=1.5',400]]){
  const f=apiFixture(options),r=await f.get(query);assert.equal(r.status,status);assert.equal(r.headers.get('Cache-Control'),'no-store');assert.equal(f.calls.length,0);
 }
});
test('media endpoint combines storage with old article files and ignores storage folders',async()=>{
 const f=apiFixture({storage:[{id:'upload',name:'photo one.jpg'},{id:null,name:'subfolder'}]}),r=await f.get(),d=await r.json();
 assert.equal(r.status,200);assert.equal(d.files.length,2);assert.ok(d.files.some(f=>f.url===origin+'/lasu-campus.jpg'));assert.ok(d.files.some(f=>f.url==='https://storage.test/storage/v1/object/public/news-attachments/images/photo%20one.jpg'));assert.equal(d.nextOffset,null);assert.equal(f.calls[0].body.prefix,'images');
});
test('pagination returns older storage files without repeatedly scanning article history',async()=>{
 const first=apiFixture({storage:Array.from({length:100},(_,i)=>({id:String(i),name:i+'.jpg'}))}),a=await (await first.get()).json();assert.equal(a.nextOffset,100);
 const page=apiFixture({storage:[{id:'last',name:'old.jpg'}]}),b=await (await page.get('?offset=100')).json();assert.equal(b.files.length,1);assert.equal(b.nextOffset,null);assert.equal(page.calls.some(c=>c.stories),false);assert.equal(page.calls[0].body.offset,100);
});
test('partial failures preserve available media; total failure returns a safe retry error',async()=>{
 for(const options of [{storageError:true},{storyError:true,storage:[{id:'upload',name:'photo.jpg'}]}]){const r=await apiFixture(options).get(),d=await r.json();assert.equal(r.status,200);assert.equal(d.files.length,1);assert.match(d.warning,/Refresh/);}
 const r=await apiFixture({storageError:true,storyError:true}).get();assert.equal(r.status,503);assert.doesNotMatch(JSON.stringify(await r.json()),/private database|private storage/);
 assert.equal((await apiFixture({storageError:true}).get('?offset=100')).status,503);
});
