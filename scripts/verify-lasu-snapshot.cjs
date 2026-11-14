/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS verification tool loads the shared TypeScript test loader. */
// Build the bundled backup only from a complete, independently checked portal capture.
require('./ask-soh-test-loader.cjs');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const {JSDOM}=require('jsdom');
const {parseLasuRequirements}=require('../lib/lasu-portal.ts');
const root=process.argv[2];if(!root)throw Error('Pass the capture directory');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'programmes.json'),'utf8'));
if(manifest.length!==catalogue.length || manifest.length!==113 || manifest.some(r=>r.error))throw Error('The complete 113-programme capture is required');
const clean=s=>s.replace(/\s+/g,' ').trim();
const rows=[],evidence=[];
for(const row of manifest){
 const html=fs.readFileSync(path.join(root,row.courseId+'.html'),'utf8');
 if(crypto.createHash('sha256').update(html).digest('hex')!==row.sha256)throw Error('Evidence hash mismatch: '+row.courseId);
 const parsed=parseLasuRequirements(html,row.courseId);
 const dom=new JSDOM(html).window.document;
 const selected=dom.querySelector('select[name="course"] option[selected]');
 if(selected?.value!==row.courseId || clean(dom.querySelector('.result-band h3')?.textContent||'')!==row.programme)throw Error('Programme mismatch');
 const independent={};
 for(const section of dom.querySelectorAll('.result-section')){
  const label=clean(section.querySelector('.section-label')?.textContent||'');
  const value=clean(section.querySelector('.subject-pill-wrap')?.textContent||'');
  if(label==='O-Level Subject Requirements')independent.oLevel=value;
  if(label==='JAMB UTME Subject Requirements')independent.utme=value;
 }
 for(const key of ['oLevel','utme'])if(parsed[key]!==independent[key])throw Error('Parser differs from portal DOM: '+row.courseId+' '+key);
 rows.push({...parsed,retrievedAt:row.retrievedAt});evidence.push({...row,html});
}
rows.sort((a,b)=>a.programme.localeCompare(b.programme));
fs.writeFileSync('data/lasu-requirements-snapshot.json',JSON.stringify(rows,null,2)+'\n');
const archive={sourceUrl:'https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php',catalogueHtml:fs.readFileSync(path.join(root,'programmes.html'),'utf8'),responses:evidence};
fs.mkdirSync('docs/lasu-requirements',{recursive:true});
fs.writeFileSync('docs/lasu-requirements/portal-capture-2026-11-14.json.gz',zlib.gzipSync(JSON.stringify(archive),{level:9}));
const incomplete=rows.filter(r=>!r.oLevel||!r.utme).map(r=>({courseId:r.courseId,programme:r.programme,missing:!r.oLevel?'O-Level':'UTME'}));
const audit={sourceUrl:archive.sourceUrl,programmes:rows.length,complete:rows.length-incomplete.length,firstRetrievedAt:manifest.map(r=>r.retrievedAt).sort()[0],lastRetrievedAt:manifest.map(r=>r.retrievedAt).sort().at(-1),incomplete,verification:'Every field compared against independently parsed official subject-pill-wrap DOM text; no page labels or inferred requirements included.'};
fs.writeFileSync('docs/lasu-requirements/verification-2026-11-14.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));
