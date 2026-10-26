const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const Module=require('node:module'),originalLoad=Module._load;
let mergeViewport;
try{Module._load=function(name,...args){return name==='server-only'?{}:originalLoad.call(this,name,...args)};({mergeViewport}=require('next/dist/lib/metadata/metadata-resolution-primitives'))}finally{Module._load=originalLoad}
const {createDefaultViewport}=require('next/dist/lib/metadata/default-metadata');
const {createViewportElements}=require('next/dist/lib/metadata/metadata-elements');
function viewport(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:()=>({withPublicSocial:x=>x})});return exports.viewport}
test('homepage clears inherited 1:1 scale so phones initially fit the wide overview and retain pinch zoom',()=>{const resolved=mergeViewport({resolvedViewport:{...createDefaultViewport(),viewportFit:'cover'},viewport:viewport('app/page.tsx')});const tag=createViewportElements(resolved).find(e=>e.props.name==='viewport');assert.equal(tag.props.content,'width=1120, user-scalable=yes, viewport-fit=cover');assert.doesNotMatch(tag.props.content,/initial-scale|maximum-scale|minimum-scale/)});
test('search and news listing retain their own device-width viewports',()=>{for(const file of ['app/search/layout.tsx','app/updates/page.tsx']){const resolved=mergeViewport({resolvedViewport:createDefaultViewport(),viewport:viewport(file)});assert.equal(resolved.width,'device-width');assert.equal(resolved.initialScale,1)}});
