const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),Module=require('node:module');
const filename=require('node:path').resolve('lib/unilorin/calculate.ts'),m=new Module(filename,module);m.filename=filename;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {programmes,calculate,bestFive,targetScores,assessUtme,subjectLabels}=m.exports;
const p=n=>programmes.find(x=>x.name===n),r=(subject,grade,sitting=1)=>({subject,grade,sitting});
const science=grades=>['English Language','Mathematics','Biology','Chemistry','Physics'].map((s,i)=>r(s,grades[i]));
test('UNILORIN supplied grade example normalises 20 of 30 points to 13.333 of 20',()=>{const c=calculate(p('Biochemistry'),'280','70',science(['A1','B2','B3','C4','C5']),['BIO','CHE','PHY'],1);assert.equal(c.utme,35);assert.equal(c.post,21);assert.ok(Math.abs(c.oLevel-40/3)<1e-10);assert.ok(Math.abs(c.total-(56+40/3))<1e-10);});
test('maximum aggregate is 100 and blank components never become zero',()=>{const rows=science(Array(5).fill('A1'));assert.equal(calculate(p('Biochemistry'),'400','100',rows,['BIO','CHE','PHY'],1).total,100);for(const v of ['', '-1','401','250.5','Infinity'])assert.equal(calculate(p('Biochemistry'),v,'100',rows,['BIO','CHE','PHY'],1).total,null);for(const v of ['', '-1','100.01','NaN'])assert.equal(calculate(p('Biochemistry'),'400',v,rows,['BIO','CHE','PHY'],1).total,null);assert.equal(calculate(p('Biochemistry'),'0','0',rows,['BIO','CHE','PHY'],1).total,20);assert.equal(calculate(p('Biochemistry'),'400','100',rows.slice(0,4),['BIO','CHE','PHY'],1).total,null);});
test('best credits retain compulsory subjects and count repeats once',()=>{const rows=science(['C6','C6','C6','C6','C6']);rows.push(r('Biology','A1',2),r('Economics','A1',2));const a=calculate(p('Biochemistry'),'300','80',rows,['BIO','CHE','PHY'],2);assert.equal(a.selected.length,5);assert.equal(a.selected.find(r=>r.subject==='Biology').grade,'A1');assert.equal(a.selected.some(r=>r.subject==='Economics'),false);assert.equal(new Set(a.selected.map(r=>r.subject)).size,5);assert.ok(bestFive(p('Biochemistry'),rows,1).every(r=>r.sitting===1));});
test('one-sitting programmes choose an intact sitting before higher mixed grades',()=>{const rows=science(['B3','B3','B3','B3','B3']);rows.push(r('Biology','A1',2));const a=calculate(p('Pharmacy'),'300','70',rows,['BIO','CHE','PHY'],2);assert.equal(a.sittingMet,true);assert.ok(a.selected.every(r=>r.sitting===1));const split=science(['A1','A1','F9','A1','A1']);split.push(r('Biology','A1',2));assert.equal(calculate(p('Pharmacy'),'300','70',split,['BIO','CHE','PHY'],2).sittingMet,false);assert.equal(calculate(p('Nursing Science'),'300','70',split,['BIO','CHE','PHY'],2).sittingMet,false);});
test('subject checks reject duplicates and wrong combinations',()=>{assert.equal(assessUtme(p('Biochemistry'),['BIO','CHE','PHY']),'matched');assert.equal(assessUtme(p('Biochemistry'),['BIO','CHE','CHE']),'incorrect');assert.equal(assessUtme(p('Biochemistry'),['BIO','GOV','MAT']),'incorrect');assert.equal(assessUtme(p('Biochemistry'),['BIO','','PHY']),'incomplete');assert.equal(assessUtme(p('Home Economics'),['BIO','CHE','MAT']),'matched');});
test('targets hold other components fixed, round upward and identify impossible goals',()=>{let t=targetScores('70',35,21,40/3);assert.equal(t.requiredPost,72.23);assert.equal(t.requiredUtme,286);assert.equal(t.postPossible,true);t=targetScores('100',20,0,10);assert.equal(t.postPossible,false);assert.equal(t.utmePossible,false);assert.equal(targetScores('',35,21,20),null);assert.equal(targetScores('70',35,21,null),null);t=targetScores('10',35,21,20);assert.equal(t.requiredPost,0);assert.equal(t.requiredUtme,0);assert.equal(targetScores('70',null,null,20).requiredPost,null);});
test('catalogue contains unique names, known subjects and complete slot counts',()=>{assert.equal(new Set(programmes.map(x=>x.code)).size,programmes.length);for(const p of programmes){assert.equal(p.slots.length,5,p.name);assert.equal(p.utmeSlots.length,4,p.name);for(const slot of [...p.slots,...p.utmeSlots]){assert.ok(slot.length,p.name);for(const c of slot)assert.ok(subjectLabels[c],p.name+' '+c);}}for(const n of ['Pharmacy','Medicine and Surgery','Computer Engineering','Optometry and Vision Science'])assert.equal(p(n).oneSitting,true);});
test('owner-supplied table completes the previously missing courses and preserves genuine caveats',()=>{assert.equal(programmes.filter(p=>p.manual).length,0);assert.equal(assessUtme(p('Medical Laboratory Science'),['BIO','CHE','PHY']),'matched');assert.equal(assessUtme(p('Building Technology Education'),['MAT','PHY','CHE']),'matched');assert.equal(assessUtme(p('Business Education'),['MAT','ACC','COM']),'matched');assert.equal(assessUtme(p('Architecture'),['MAT','PHY','GEO']),'matched');assert.equal(assessUtme(p('Hausa'),['HAU','LIT','GOV']),'matched');assert.equal(assessUtme(p('Quantity Surveying'),['MAT','PHY','ECO']),'matched');assert.equal(p('Physiotherapy').oneSitting,true);});
test('Agricultural Extension checks additional Physics and conditional Biology passes without scoring them',()=>{const rows=[r('English Language','A1'),r('Mathematics','A1'),r('Chemistry','A1'),r('Agricultural Science','A1'),r('Economics','A1')];let c=calculate(p('Agricultural Extension and Rural Development'),'280','70',rows,['CHE','AGR','ECO'],1);assert.equal(c.extraPassMet,false);c=calculate(p('Agricultural Extension and Rural Development'),'280','70',[...rows,r('Physics','D7'),r('Biology','E8')],['CHE','AGR','ECO'],1);assert.equal(c.extraPassMet,true);assert.equal(c.oLevel,20);});
const credits=(codes,grade='A1',sitting=1)=>codes.map(code=>r(subjectLabels[code],grade,sitting));
const pairs=pool=>pool.flatMap((a,i)=>pool.slice(i+1).map(b=>[a,b]));
for(const course of programmes.filter(p=>p.name.endsWith('Engineering'))){
 test(`${course.name}: compulsory credits, Science alternative and programme exception`,()=>{
  assert.equal(bestFive(course,credits(['ENG','MAT','PHY','CHE','BIO']),1).length,5);
  assert.equal(bestFive(course,credits(['ENG','MAT','PHY','CHE','GOV']),1).length,0);
  assert.equal(bestFive(course,credits(['ENG','MAT','PHY','BIO','AGR']),1).length,0);
  const biologyRequired=course.slots.some(s=>s.length===1&&s[0]==='BIO');
  assert.equal(bestFive(course,credits(['ENG','MAT','PHY','CHE','AGR']),1).length,biologyRequired?0:5);
 });
}
test('Computer Engineering cannot combine credits but can use an intact second sitting',()=>{
 const course=p('Computer Engineering');const rows=[...credits(['ENG','MAT','PHY','CHE']),...credits(['BIO'],'A1',2)];
 assert.equal(calculate(course,'300','70',rows,['MAT','PHY','CHE'],2).sittingMet,false);
 assert.equal(calculate(course,'300','70',credits(['ENG','MAT','PHY','CHE','BIO'],'A1',2),['MAT','PHY','CHE'],2).sittingMet,true);
 assert.equal(calculate(course,'300','70',credits(['ENG','MAT','PHY','CHE','BIO'],'A1',2),['MAT','PHY','CHE'],1).creditsMet,false);
});
test('Public Administration accepts either Government or Civic Education and retains other compulsory credits',()=>{
 for(const alt of ['GOV','CIV'])assert.equal(bestFive(p('Public Administration'),credits(['ENG','MAT',alt,'HIS','ECO']),1).length,5);
 assert.equal(bestFive(p('Public Administration'),credits(['ENG','MAT','HIS','ECO','GEO']),1).length,0);
 assert.equal(p('Public Administration').reviewRequired,false);
});
test('Comparative Religious Studies accepts either CRS or IRS without Traditional Religion',()=>{
 for(const alt of ['CRS','IRS']){assert.equal(bestFive(p('Comparative Religious Studies'),credits(['ENG','MAT',alt,'HIS','ECO']),1).length,5);assert.equal(assessUtme(p('Comparative Religious Studies'),[alt,'HIS','ECO']),'matched');}
 assert.equal(bestFive(p('Comparative Religious Studies'),credits(['ENG','MAT','BIO','HIS','ECO']),1).length,0);
});
for(const name of ['Technology Education','Building Technology Education','Electrical/Electronic Technology Education','Metalwork Technology Education','Woodwork Technology Education']){
 test(`${name}: UNILORIN fixed UTME supersedes generic technology alternatives`,()=>{
  assert.equal(assessUtme(p(name),['MAT','PHY','CHE']),'matched');
  for(const alt of ['TDR','BIO','MWO','GOV'])assert.equal(assessUtme(p(name),['MAT','PHY',alt]),'incorrect');
  assert.equal(bestFive(p(name),credits(['ENG','MAT','MWO','WWO','BUI']),1).length,5);
 });
}
test('Educational Technology Arts allows three Arts or two Arts plus one Social Science, not science-only routes',()=>{
 const course=p('Educational Technology (Arts)');
 for(const combo of [['LIT','HIS','CRS'],['LIT','HIS','ECO'],['ECO','LIT','HIS']])assert.equal(assessUtme(course,combo),'matched');
 for(const combo of [['MAT','PHY','CHE'],['LIT','ECO','GOV'],['LIT','LIT','ECO']])assert.equal(assessUtme(course,combo),'incorrect');
 assert.equal(bestFive(course,credits(['ENG','MAT','LIT','HIS','ECO']),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','WWO','CER','ECO']),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','LIT','HIS','CRS']),1).length,0);
 assert.equal(bestFive(course,credits(['ENG','BIO','LIT','HIS','ECO']),1).length,0);
});
test('Educational Technology Science preserves technical OLevel alternatives while keeping UTME scientific',()=>{
 const course=p('Educational Technology (Sciences)');
 assert.equal(assessUtme(course,['MAT','PHY','CHE']),'matched');
 assert.equal(assessUtme(course,['LIT','HIS','CRS']),'incorrect');
 assert.equal(bestFive(course,credits(['ENG','MAT','ICT','BLE','RTE']),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','EIM','AEL','BIO']),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','LIT','HIS','CRS']),1).length,0);
});
test('Educational Technology Social Sciences distinguishes UTME subjects from OLevel technical alternatives',()=>{
 const course=p('Educational Technology (Social Sciences)');
 assert.equal(assessUtme(course,['ECO','GOV','GEO']),'matched');
 assert.equal(assessUtme(course,['MAT','PHY','CHE']),'incorrect');
 assert.equal(assessUtme(course,['ECO','GOV','CST']),'incorrect');
 for(const alt of ['DAT','CST','INS','MKT','BUS'])assert.equal(bestFive(course,credits(['ENG','MAT','ECO','GOV',alt]),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','PHY','CHE','BIO']),1).length,0);
});
for(const [name,compulsory,pool] of [['Chemistry Education','CHE',['PHY','BIO','MAT']],['Mathematics Education','MAT',['PHY','CHE','BIO']]]){
 test(`${name}: all allowed IBASS pairs work in any entered order`,()=>{
  for(const pair of pairs(pool))for(const combo of [[compulsory,...pair],[pair[1],compulsory,pair[0]]])assert.equal(assessUtme(p(name),combo),'matched');
  assert.equal(assessUtme(p(name),[...pool]),'incorrect');
  assert.equal(assessUtme(p(name),[compulsory,pool[0],'GOV']),'incorrect');
  assert.equal(assessUtme(p(name),[compulsory,pool[0],pool[0]]),'incorrect');
 });
}
test('Social Work requires Mathematics and Economics or Geography plus another distinct UTME subject',()=>{
 for(const combo of [['MAT','ECO','GOV'],['MAT','GEO','BIO'],['GEO','MAT','ECO']])assert.equal(assessUtme(p('Social Work'),combo),'matched');
 for(const combo of [['GOV','ECO','GEO'],['MAT','GOV','BIO'],['MAT','ECO','ECO']])assert.equal(assessUtme(p('Social Work'),combo),'incorrect');
 assert.equal(assessUtme(p('Social Work'),['MAT','ECO','']),'incomplete');
});
test('Statistics accepts all 20 three-credit combinations from its six-subject pool and rejects unrelated credits',()=>{
 const pool=['PHY','STA','CHE','FMA','ECO','GEO'];let count=0;
 for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++)for(let k=j+1;k<pool.length;k++){
  assert.equal(bestFive(p('Statistics'),credits(['ENG','MAT',pool[i],pool[j],pool[k]]),1).length,5);count++;
 }
 assert.equal(count,20);
 for(const wrong of ['BIO','GOV','CST'])assert.equal(bestFive(p('Statistics'),credits(['ENG','MAT','PHY','ECO',wrong]),1).length,0);
 assert.equal(bestFive(p('Statistics'),credits(['ENG','PHY','STA','CHE','GEO']),1).length,0);
});
test('Islamic Studies Education keeps IRS compulsory at OLevel while accepting Arabic or IRS in UTME',()=>{
 const course=p('Education and Islamic Studies');
 for(const alt of ['IRS','ARA'])assert.equal(assessUtme(course,[alt,'LIT','ECO']),'matched');
 assert.equal(bestFive(course,credits(['ENG','MAT','IRS','LIT','ECO']),1).length,5);
 assert.equal(bestFive(course,credits(['ENG','MAT','ARA','LIT','ECO']),1).length,0);
 assert.equal(assessUtme(course,['CRS','LIT','ECO']),'incorrect');
 assert.equal(bestFive(course,credits(['ENG','MAT','IRS','PHY','CHE']),1).length,0);
});
test('UI and downloaded reports label the OLevel scale as commonly reported and unverified',()=>{
 const page=fs.readFileSync('app/unilorin-calculator/page.tsx','utf8');
 assert.match(page,/commonly reported method/);
 assert.match(page,/official grade-conversion scale has not been verified/);
 assert.match(page,/O’Level conversion uses the commonly reported method; the official grade-conversion scale has not been verified/);
 assert.match(page,/p\.oLevelDescription/);assert.match(page,/p\.utmeDescription/);
});
test('new unrestricted/category UTME slots do not accept OLevel-only technical subjects',()=>{
 for(const code of ['RTE','DAT','TDR','STA','CIV'])assert.equal(assessUtme(p('Social Work'),['MAT','ECO',code]),'incorrect');
 for(const code of ['BLE','DAT','STA','EIM'])assert.equal(assessUtme(p('Educational Technology (Sciences)'),['MAT','PHY',code]),'incorrect');
 assert.equal(assessUtme(p('Educational Technology (Social Sciences)'),['ECO','GOV','INS']),'incorrect');
});
test('UTME dropdown and validation share the 25 approved subjects; trade subjects stay OLevel-only',()=>{
 const {utmeSubjectLabels}=m.exports;assert.equal(Object.keys(utmeSubjectLabels).length,25);
 assert.ok(utmeSubjectLabels.CST);assert.equal(utmeSubjectLabels.PHE,'Physical and Health Education');
 for(const code of ['TDR','RTE','DAT','STA','BLE','FMA'])assert.equal(utmeSubjectLabels[code],undefined);
 assert.match(fs.readFileSync('app/unilorin-calculator/page.tsx','utf8'),/Object.entries\(utmeSubjectLabels\)/);
});
test('all 105 programmes clear stale manual review flags without changing grade estimation',()=>{
 assert.equal(programmes.length,105);assert.ok(programmes.every(p=>!p.reviewRequired&&!p.manual&&!p.sittingReview));
 for(const p of programmes)assert.doesNotMatch(p.note,/pending|confirm|provisional|differ/i,p.name);
});
for(const [name,codes,u,missing] of [
 ['Architecture',['ENG','MAT','PHY','CHE','BIO'],['MAT','PHY','BIO'],'PHY'],
 ['Education and English',['ENG','MAT','LIT','HIS','ECO'],['LIT','HIS','ECO'],'LIT'],
 ['Education and French',['ENG','MAT','FRE','GOV','ECO'],['FRE','GOV','ECO'],'FRE'],
 ['Education and History',['ENG','MAT','GOV','LIT','ECO'],['GOV','LIT','ECO'],'GOV'],
 ['Education and Yoruba',['ENG','MAT','YOR','HIS','ECO'],['YOR','HIS','ECO'],'YOR'],
 ['Educational Management',['ENG','MAT','BIO','ECO','HIS'],['BIO','ECO','HIS'],'MAT'],
 ['Hausa',['ENG','HAU','LIT','GOV','ECO'],['HAU','LIT','GOV'],'HAU'],
 ['Igbo',['ENG','MAT','BIO','CHE','PHY'],['IGB','HIS','ECO'],'ENG'],
 ['Human Kinetics Education',['ENG','MAT','BIO','GOV','ECO'],['BIO','GOV','ECO'],'MAT'],
 ['Social Studies Education (B.A.)',['ENG','MAT','CRS','HIS','LIT'],['CRS','HIS','ECO'],'MAT'],
 ['Social Studies Education (B.Sc.)',['ENG','MAT','ECO','GOV','COM'],['MAT','ECO','GOV'],'MAT'],
]){
 test(`${name}: formerly flagged valid inputs now pass, missing compulsory credits still fail`,()=>{
  const course=p(name);const c=calculate(course,'280','70',credits(codes),u,1);
  assert.equal(c.creditsMet,true);assert.equal(c.utmeStatus,'matched');assert.equal(c.sittingMet,true);assert.equal(c.total,76);
  assert.equal(bestFive(course,credits(codes.filter(code=>code!==missing)),1).length,0);
 });
}
test('UNILORIN architecture and language exceptions override generic brochure restrictions',()=>{
 assert.equal(bestFive(p('Architecture'),credits(['ENG','MAT','PHY','CHE','BIO']),1).length,5);
 assert.equal(bestFive(p('Architecture'),credits(['ENG','MAT','PHY','GOV','COM']),1).length,0);
 assert.equal(bestFive(p('Igbo'),credits(['ENG','MAT','BIO','CHE','PHY']),1).length,5);
 assert.equal(bestFive(p('Hausa'),credits(['ENG','HAU','BIO','CHE','PHY']),1).length,0);
});
test('Human Kinetics retains the supplied one-sitting rule and Biology/Health/PE alternatives',()=>{
 for(const alt of ['BIO','HED','PHE'])assert.equal(bestFive(p('Human Kinetics Education'),credits(['ENG','MAT',alt,'ECO','GOV']),1).length,5);
 const rows=[...credits(['ENG','MAT','BIO','ECO']),...credits(['GOV'],'A1',2)];
 assert.equal(calculate(p('Human Kinetics Education'),'280','70',rows,['BIO','ECO','GOV'],2).sittingMet,false);
});
test('Education named pools reject unrelated substitutions and preserve four distinct UTME subjects',()=>{
 assert.equal(assessUtme(p('Education and English'),['LIT','PHY','CHE']),'incorrect');
 assert.equal(assessUtme(p('Education and French'),['FRE','PHY','CHE']),'incorrect');
 assert.equal(assessUtme(p('Education and History'),['GOV','BIO','CHE']),'incorrect');
 assert.equal(assessUtme(p('Education and Yoruba'),['YOR','BIO','CHE']),'incorrect');
 assert.equal(assessUtme(p('Social Studies Education (B.A.)'),['CRS','HIS','PHY']),'matched');
 assert.equal(assessUtme(p('Social Studies Education (B.A.)'),['ECO','MAT','PHY']),'incorrect');
 assert.equal(bestFive(p('Social Studies Education (B.Sc.)'),credits(['ENG','MAT','ECO','GOV','PHY']),1).length,0);
 assert.equal(assessUtme(p('Educational Management'),['GDE','ECO','HIS']),'incorrect');
});
