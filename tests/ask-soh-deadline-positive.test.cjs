const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const source=fs.readFileSync("app/api/ask-soh/search/route.ts","utf8");
const start=source.indexOf("function verifiedRegistrationDeadline("),end=source.indexOf("function shapeEvidenceAnswer(",start);
assert.ok(start>=0&&end>start);
const fn=source.slice(start,end).replace("results:SearchResult[]","results").replace("institutionDomains:string[]","institutionDomains").replace("session:string|null","session").replace("let host:string;","let host;").replace("let dateParts:RegExpMatchArray|null=null;","let dateParts=null;").replaceAll("marker.index!","marker.index");
const extract=new Function("cleanText",fn+";return verifiedRegistrationDeadline;")(s=>s.replace(/\s+/g," ").trim());
const official=(snippet,url="https://lasu.edu.ng/admissions/screening")=>[{title:"LASU 2026/2027 Post-UTME Screening",snippet,url,official:true}],domains=["lasu.edu.ng"];
test("official textual deadline",()=>{const r=extract(official("2026/2027 Post-UTME screening. Closing date: 15 October 2026."),domains,"2026/2027");assert.ok(r);assert.match(r.answer,/15 October 2026/);});
test("official numeric deadline",()=>{const r=extract(official("2026/2027 admission screening. Registration closes on 15/10/2026."),domains,"2026/2027");assert.ok(r);assert.match(r.answer,/15 October 2026/);});
test("wrong session and unrelated domains are rejected",()=>{assert.equal(extract(official("2025/2026 Post-UTME screening. Closing date: 15 October 2026."),domains,"2026/2027"),null);assert.equal(extract(official("2026/2027 Post-UTME screening. Closing date: 15 October 2026.","https://example.com/notice"),domains,"2026/2027"),null);});
test("no explicit deadline is rejected",()=>{assert.equal(extract(official("2026/2027 Post-UTME screening portal is available."),domains,"2026/2027"),null);});

test("reject mixed-session listing even when requested session appears",()=>{const r=extract(official("2026/2027 Post-UTME screening. Closing date: 15 October 2026. 2025/2026 Post-UTME screening. Closing date: 15 September 2025."),domains,"2026/2027");assert.equal(r,null);});
test("reject generic institutional homepage with session only in body",()=>{const r=extract([{title:"Lagos State University",url:"https://lasu.edu.ng/home/",snippet:"2026/2027 Post-UTME screening. Closing date: 15 October 2026.",official:true}],domains,"2026/2027");assert.equal(r,null);});
