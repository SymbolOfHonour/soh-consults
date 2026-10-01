const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const client=fs.readFileSync(path.join(__dirname,'../app/admission-matcher/MatcherClient.tsx'),'utf8');
test('UI consumes registered catalogue, validation and honest coverage',()=>{
 for(const contract of ['discoverProgrammes(admissionMatcherRequirements)','discoverSubjects(admissionMatcherRequirements)','validateCandidate(candidate)','max={3}','utmeSubjects.length !== 3','!isEnglish(s)','scope.verifiedProgrammes','scope.verifiedInstitutions','No supported record','result.needsReview','r.sources.map','PAGE_SIZE = 10'])assert.ok(client.includes(contract),contract);
 assert.doesNotMatch(client,/from .*calculator|from .*\/data\/(lasu|fuoye|uniosun)/i);
});
