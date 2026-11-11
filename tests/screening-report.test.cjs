const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function setup(){
 const canvases=[],downloads=[],pdfs=[];
 class Context {
  constructor(canvas){this.canvas=canvas;this.text=[];this.images=[];}
  measureText(s){return {width:s.length*9};}
  fillText(value,x,y){this.text.push({value,x,y});}
  drawImage(...args){this.images.push(args);}
 }
 for(const fn of ['fillRect','beginPath','roundRect','fill','stroke','moveTo','lineTo','closePath'])Context.prototype[fn]=()=>{};
 const document={body:{appendChild(){}},createElement(type){
  if(type==='a')return {click(){downloads.push(this.download)},remove(){}};
  const canvas={width:0,height:0,getContext(){return this.ctx},toDataURL(){return 'data:image/jpeg;base64,report'},toBlob(cb){cb(new Blob(['image']))}};
  canvas.ctx=new Context(canvas);canvases.push(canvas);return canvas;
 }};
 class PDF {constructor(){this.images=[];this.pages=1;pdfs.push(this)}addPage(){this.pages++}addImage(...args){this.images.push(args)}save(name){this.filename=name}}
 class Image {set src(value){this.width=320;this.height=140;this.onload()}}
 const context={exports:{},document,Image,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},window:{setTimeout(){return 1}},clearTimeout(){},require:name=>name==='jspdf'?{jsPDF:PDF}:{REPORT_TAGLINE:'Your Guide. Your Success.'}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/reports/screening-report.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,context);
 return {...context.exports,canvases,downloads,pdfs};
}
const sample={school:'FUSTECH',candidate:'Ada Test',programme:'Computer Science',score:'69.00 / 100',status:'Requirements met',positive:true,breakdown:[['UTME score','280 / 400'],['UTME points','49.00 / 70'],['O-Level points','20 / 30']],results:[{subject:'English Language',grade:'A1',points:6},{subject:'Mathematics',grade:'B2',points:5},{subject:'Physics',grade:'B3',points:4},{subject:'Chemistry',grade:'C4',points:3},{subject:'Biology',grade:'C5',points:2}],notes:['Verify requirements with FUSTECH.']};
test('LASU-style report preserves supplied scores, candidate and selected grades',async()=>{
 const api=setup();const pages=await api.buildScreeningReport(sample);
 assert.equal(pages.length,1);assert.equal(pages[0].width,1240);assert.equal(pages[0].height,1754);
 const words=pages[0].ctx.text.map(row=>row.value).join('\n');
 for(const value of ['Ada Test','Computer Science','69.00 / 100','49.00 / 70','20 / 30','CANDIDATE INFORMATION','SCREENING BREAKDOWN','O-LEVEL RESULTS','IMPORTANT NOTES','support@sohconsults.com.ng'])assert.ok(words.includes(value),value);
 assert.ok(!words.includes('LASU SCREENING'));
});
test('long requirements wrap and continue without disappearing or overlapping the footer',async()=>{
 const api=setup();const marker='FINAL REQUIREMENT MUST REMAIN';
 const pages=await api.buildScreeningReport({...sample,notes:[('Long programme requirement with distinct subject alternatives. ').repeat(150)+marker]});
 assert.ok(pages.length>1);
 const words=pages.flatMap(page=>page.ctx.text.map(row=>row.value)).join('\n');assert.ok(words.includes(marker));
 for(const [i,page]of pages.entries()){assert.ok(page.ctx.text.some(row=>row.value===`Page ${i+1} of ${pages.length}`));assert.ok(page.ctx.text.every(row=>row.y<=1714));}
});
test('PDF and JPG export the same branded page content and safe filenames',async()=>{
 const api=setup();await api.downloadScreeningReport(sample,'pdf');await api.downloadScreeningReport(sample,'jpg');
 assert.equal(api.pdfs[0].filename,'FUSTECH_Screening_Report_Ada_Test.pdf');assert.equal(api.pdfs[0].images.length,1);
 assert.equal(api.downloads[0],'FUSTECH_Screening_Report_Ada_Test.jpg');
 const exported=api.canvases.filter(canvas=>canvas.ctx.text.length);
 assert.deepEqual(exported[0].ctx.text.map(row=>row.value),exported[1].ctx.text.map(row=>row.value));
});
test('OOU report presents Post-UTME assessment rather than invented O-Level credits',async()=>{
 const api=setup();const pages=await api.buildScreeningReport({...sample,school:'OOU',results:[],details:[['Post-UTME score','65 / 100']],notes:[]});
 const words=pages[0].ctx.text.map(row=>row.value).join('\n');assert.ok(words.includes('ASSESSMENT DETAILS'));assert.ok(words.includes('65 / 100'));assert.ok(!words.includes('O-LEVEL RESULTS'));
});
