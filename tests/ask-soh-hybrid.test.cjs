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

test("contextual price follow-ups do not invent fees",()=>{assert.match(services,/const priceFollowUp=/);assert.match(services,/priceFollowUp&&/);assert.match(services,/contact us on WhatsApp to confirm availability and the exact price/);assert.doesNotMatch(services,/₦[0-9]/);});

test("service pricing follow-ups use recognized previous service",()=>{assert.match(services,/priceFollowUp&&ctx/);assert.match(services,/businessServiceAnswer\(context,""\)/);assert.match(services,/previousService\.service/);assert.match(services,/Do not pay to an unverified account/);});

test("certificate enquiries do not get result-token pricing",()=>{const guard=services.match(/if\(priceFollowUp&&([^\n]+)\)\{/);assert.ok(guard);assert.doesNotMatch(guard[1],/neco\|waec\|nabteb/);assert.match(guard[1],/result/);assert.match(services,/previousService=businessServiceAnswer\(context,""\)/);});

test("context VC intent uses word boundaries",()=>{const resolver=fs.readFileSync("lib/ask-soh/question-resolver.ts","utf8");const inherited=resolver.slice(resolver.indexOf("const contextQ="),resolver.indexOf("const intent="));assert.ok(inherited.includes("vc"));assert.ok(!inherited.includes(String.raw`\\\\bvc\\\\b`));});

test("cutoff and fee questions always require current verification",()=>{const resolver=fs.readFileSync("lib/ask-soh/question-resolver.ts","utf8");assert.match(resolver,/currentSensitive:cutoff\|\|CURRENT\.test\(question\)/);assert.match(resolver,/admission status\|admitted\|offered admission/);assert.match(resolver,/fee\|fees\|price\|cost/);});

test("university cutoff extraction requires institution-owned official domain",()=>{assert.match(route,/resolved\.intent==="cutoff"/);assert.match(route,/institution\.officialDomains\.some/);assert.match(route,/hostname===domain\|\|hostname\.endsWith/);assert.match(route,/shapeEvidenceAnswer\(resolved\.answerMode,scoreEvidence\)/);});
