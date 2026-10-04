// Make synthetic minimum-credit positives and independent subject failures from
// explicit configurations. Broad categories are never expanded to create inputs.
const fs=require('node:fs');
const {loadMatcher}=require('../../../tests/admission-matcher-helper.cjs');
const {parseCheckerSubjects,checkerRuleSatisfied}=loadMatcher('lib/admission-matcher/upstream/checker-subjects');
const {approvedUtmeSubjects,subjectKey}=loadMatcher('lib/admission-matcher/catalogue');
const [input,output]=process.argv.slice(2);
if(!input||!output)throw new Error('Supply the baseline capture and output plan paths');
const source=JSON.parse(fs.readFileSync(input,'utf8'));

function positiveSubjects(rule){
  const core=[...rule.requiredSubjects], used=new Set(core.map(subjectKey));
  const slots=rule.groups.flatMap(group=>Array.from({length:group.count},()=>group.subjects));
  function allocate(index,selected){
    if(index===slots.length)return checkerRuleSatisfied(rule,selected)?selected:null;
    for(const subject of slots[index]){
      const key=subjectKey(subject);if(used.has(key))continue;
      used.add(key);const result=allocate(index+1,[...selected,subject]);used.delete(key);
      if(result)return result;
    }
    return null;
  }
  return allocate(0,core);
}
function negativeSubjects(rule){
  for(let a=0;a<approvedUtmeSubjects.length;a++)for(let b=a+1;b<approvedUtmeSubjects.length;b++)for(let c=b+1;c<approvedUtmeSubjects.length;c++){
    const subjects=[approvedUtmeSubjects[a],approvedUtmeSubjects[b],approvedUtmeSubjects[c]];
    if(!checkerRuleSatisfied(rule,subjects))return subjects;
  }
  return null;
}
const probes=[],exceptions=[];
for(const row of source.probes){
  if(row.error){exceptions.push({key:row.key,reason:row.error});continue;}
  const r=row.response;
  if(r.status!==true||r.institution_details?.itemid!==row.institutionId||r.programme_details?.itemid!==row.programmeId||r.programme_details?.title!==row.programme){exceptions.push({key:row.key,reason:'Official response identity is unresolved'});continue;}
  const utme=parseCheckerSubjects(r.programme_utme_subject_data,'utme',row.institutionId);
  const olevel=parseCheckerSubjects(r.programme_utme_requirements_data,'olevel',row.institutionId);
  if(!utme&&!olevel){exceptions.push({key:row.key,reason:'No complete explicit subject configuration; categories were not guessed'});continue;}
  const goodUtme=utme?positiveSubjects(utme):row.request.utme_subjects.slice(1);
  const goodOlevel=olevel?positiveSubjects(olevel):row.request.olevel_credit;
  const badUtme=utme?negativeSubjects(utme):row.request.utme_subjects.slice(1);
  if(!goodUtme||!goodOlevel||!badUtme||goodUtme.length!==3||goodOlevel.length>9)throw new Error('Cannot allocate distinct synthetic subject slots');
  for(const variant of ['minimal-positive','subject-failure']){
    const request={...row.request,utme_subjects:['English Language',...(variant==='minimal-positive'?goodUtme:badUtme)],
      olevel_credit:variant==='minimal-positive'?goodOlevel:['English Language']};
    probes.push({...row,key:row.key.replace(/baseline$/,variant),variant,request,response:undefined,observedAt:undefined,sourceUrl:undefined,error:undefined});
  }
}
fs.writeFileSync(output,JSON.stringify({schemaVersion:1,probes,exceptions},null,2)+'\n');
console.log(JSON.stringify({plannedProbes:probes.length,selectedInstitutionProgrammes:probes.length/2,exceptions:exceptions.length}));
