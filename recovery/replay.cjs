/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS recovery test tooling */
require('../scripts/ask-soh-test-loader.cjs');
const fs=require('node:fs');
process.env.SUPABASE_URL='https://recovery.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='recovery-fixture';delete process.env.OPENAI_API_KEY;
const baseline=JSON.parse(fs.readFileSync('recovery/baseline.json'));
const facts=[...JSON.parse(fs.readFileSync('recovery/registry.json')),...(fs.existsSync('recovery/reviewed-facts-qa.json')?JSON.parse(fs.readFileSync('recovery/reviewed-facts-qa.json')):[])];
let row;
global.fetch=async url=>new Response(JSON.stringify(String(url).includes('ask_soh_facts?')?facts.filter(f=>f.institution_key===new URL(url).searchParams.get('institution_key')?.slice(3)&&f.intent===new URL(url).searchParams.get('intent')?.slice(3)):[]),{headers:{'Content-Type':'application/json'}});
require('../lib/rate-limit.ts').checkRateLimit=async()=>({allowed:true});
require('../lib/news-queue.ts').listPublishedStories=async()=>[];
const discovery=require('../lib/ask-soh/source-discovery.ts');
discovery.discoverOfficialSources=async()=>({documents:row.actual.results.filter(d=>d.official),gaps:row.actual.coverageGaps||[],cacheHit:false});
discovery.searchProviderSources=async()=>({documents:[],gaps:[]});
require('../lib/ask-soh/telemetry.ts').recordQuestion=async()=>{};
const {NextRequest}=require('next/server');const route=require('../app/api/ask-soh/search/route.ts');
(async()=>{const rows=[];for(row of baseline.rows){const req=new NextRequest('https://recovery.invalid/api/ask-soh/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:row.question,context:row.context})});const response=await route.POST(req);const actual=await response.json();rows.push({id:row.id,question:row.question,status:response.status,actual});console.log(row.id,actual.confidence,actual.answer)}fs.writeFileSync('recovery/replay.json',JSON.stringify({method:'Controlled replay of captured API documents and production registry snapshot through modified actual route; no new live source fetches, model calls, or database writes. Captured API results are a subset of full retrieval. Not preview/production QA.',rows},null,2))})().catch(e=>{console.error(e);process.exitCode=1});
