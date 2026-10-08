const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const route=fs.readFileSync("app/api/ask-soh/search/route.ts","utf8"),ui=fs.readFileSync("app/components/AskSOH.tsx","utf8");
const guidance=route.slice(route.indexOf("function examinationResultGuidance("),route.indexOf("function businessServiceAnswer("));
const services=route.slice(route.indexOf("function businessServiceAnswer("),route.indexOf("async function handleSearch("));
for(const [exam,url] of [["WAEC","waecdirect.org"],["NECO","results.neco.gov.ng"]])test("hybrid result "+exam,()=>{assert.ok(guidance.includes('exam==="'+exam+'"'));assert.ok(guidance.includes(url));assert.match(guidance,/S.O.H CONSULTS/);});
for(const [label,pattern] of [["scratch cards",/scratch.\\?card/],["NECO context",/const ctx=context/],["O-Level uploads",/O.Level result upload on JAMB/],["JAMB printing",/JAMB document printing/],["Post-UTME",/Post-UTME and Direct Entry/],["WAEC DigiCert",/WAEC certificate assistance/],["acceptance fees",/School fee payment guidance/]])test("service coverage: "+label,()=>assert.match(services,pattern));
test("general questions still use verified knowledge",()=>{assert.ok(route.includes("findVerifiedFact(resolved,safeQuestion)"));});
test("missing token intent precedes generic result guidance",()=>{assert.ok(route.indexOf("const tokenNeed=")<route.indexOf("const resultGuidance=examinationResultGuidance"));assert.match(route,/if\(tokenNeed\)/);});
test("WhatsApp number and service CTA configured",()=>{assert.match(ui,/const WHATSAPP = "2348182141088"/);assert.match(ui,/Get Assistance on WhatsApp/);assert.match(ui,/encodeURIComponent\(message\)/);});
test("official sources and clickable links preserved",()=>{assert.match(ui,/function isSOHSource/);assert.match(ui,/Open Official Source/);assert.match(ui,/renderReadableAnswer\(message.text\)/);assert.match(ui,/rel="noopener noreferrer"/);});

test("multi-turn follow-ups retain latest named institution or examination",()=>{assert.match(ui,/function findFollowUpSubject/);assert.match(ui,/\.reverse\(\)\.find/);assert.match(ui,/findFollowUpSubject\(recentUserMessages\)/);assert.match(ui,/\bneco\|nabteb\|nysc/);});
test("explicit new subject does not inherit previous conversation",()=>{assert.match(ui,/!explicitSubject && !namedInstitution/);assert.match(ui,/const subjectContext = isFollowUp \?/);});
