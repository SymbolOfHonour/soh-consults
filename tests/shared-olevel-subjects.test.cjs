const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function compile(file,requireFn){const context={exports:{},require:requireFn};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);return context.exports;}
const shared=compile('lib/olevel-subjects.ts',require);
const Form=compile('app/components/LasuStyleOLevel.tsx',name=>name.includes('olevel-subjects')?shared:require(name)).default;
const expected=['Data Processing','Computer Studies','Digital Technologies','Ibibio','Igbo Language'];
test('current and future shared forms render expanded options in both sittings',()=>{
 for(const subjects of [undefined,['English Language','Mathematics','Financial Accounting','Agricultural Science']]){
  const html=renderToStaticMarkup(React.createElement(Form,{subjects,grades:['A1','C6'],value:[],onChange(){},sittings:2,onSittingsChange(){}}));
  for(const label of expected) assert.equal(html.split(`value="${label}"`).length-1,18,label);
 }
});
test('school matching labels survive; spelling variants do not inflate dropdowns',()=>{
 const options=shared.getOLevelSubjectOptions(['Financial Accounting','Agricultural Science','CRS','IRS','Igbo']);
 for(const label of ['Financial Accounting','Agricultural Science','CRS','IRS','Igbo'])assert.ok(options.includes(label),label);
 assert.ok(!options.includes('Accounting'));assert.ok(!options.includes('Agriculture'));assert.ok(!options.includes('Igbo Language'));
 assert.ok(options.includes('Ibibio'));
 assert.equal(new Set(options.map(shared.oLevelSubjectKey)).size,options.length);
});
test('all existing subject entry calculators use shared catalogue or shared form',()=>{
 const schools=['lasu','oau','eksu','fuoye','fuadsi','yabatech','uniosun','lasued','lasustech','fustech'];
 for(const school of schools){const source=fs.readFileSync(`app/${school}-calculator/page.tsx`,'utf8');assert.ok(source.includes('getOLevelSubjectOptions')||source.includes('<LasuStyleOLevel'),school);}
});
