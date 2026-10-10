const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const cache = new Map();
function load(file) {
  file=path.resolve(file.endsWith('.ts')?file:file+'.ts');
  if(cache.has(file))return cache.get(file).exports;
  const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,m);
  m.require=spec=>spec.startsWith('.')?(spec.endsWith('.json')?require(path.resolve(path.dirname(file),spec)):load(path.resolve(path.dirname(file),spec))):require(spec);
  m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
  return m.exports;
}
const {isIsolatedPreview}=load('lib/isolated-preview');
const {listPublishedStories}=load('lib/news-queue');

test('isolated public-content preview cannot migrate or access the database',async()=>{
  const prior={env:process.env.VERCEL_ENV,url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SERVICE_ROLE_KEY,fetch:global.fetch};
  try {
    process.env.VERCEL_ENV='preview';delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    global.fetch=()=>{throw new Error('An isolated preview must not access the CMS');};
    const stories=await listPublishedStories({strict:true});
    assert.ok(stories.length>0);
    assert.ok(stories.every(s=>s.status==='published'&&!s.source_name.startsWith('admin:')));
    process.env.VERCEL_ENV='production';assert.equal(isIsolatedPreview(),false);
    process.env.VERCEL_ENV='preview';process.env.SUPABASE_URL='https://qa.example';process.env.SUPABASE_SERVICE_ROLE_KEY='configured';assert.equal(isIsolatedPreview(),false);
  } finally {
    for(const [key,value] of [['VERCEL_ENV',prior.env],['SUPABASE_URL',prior.url],['SUPABASE_SERVICE_ROLE_KEY',prior.key]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}
    global.fetch=prior.fetch;
  }
});
