const {registerHooks}=require('node:module');
registerHooks({resolve(specifier,context,next){try{return next(specifier,context)}catch(e){if(specifier.startsWith('.'))return next(specifier+'.ts',context);throw e}}});
const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');
for(const [q,c] of [['And Direct Entry?','FUOYE 2026/2027 Post-UTME requirements'],['What UTME subjects do I need for Medicine at LASU for 2026/2027?'],['What are FUOYE Direct Entry requirements for 2026/2027?'],['What is Lasuu cut off mark for 2026/2027?']])console.log(JSON.stringify({q,c,resolved:resolveQuestion(q,c)}));
