import { extractText } from 'unpdf';
import { InstitutionRecord, isOfficialInstitutionUrl } from './institution-registry';
import { cacheGet, cacheSet } from './cache';

export type SourceDocument = {title:string;url:string;snippet:string;official:boolean;internal?:boolean;publishedAt?:string|null;fetchedAt?:string;session?:string|null;kind?:'article'|'portal'|'pdf'|'homepage'|'search';adapter?:string;verified?:boolean};
export type CoverageGap = {adapter:string;url:string;reason:string};
type Link = {title:string;url:string;publishedAt?:string|null;abstract?:string};
export type DiscoveryOptions = {fetcher?:typeof fetch;timeoutMs?:number;maxDocuments?:number;useCache?:boolean};
export function plainText(raw:string){return raw.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/\s+/g,' ').trim();}
export function sessionsIn(text:string){return [...new Set([...text.matchAll(/\b(20\d{2})\s*[\/_-]\s*(20\d{2})\b/g)].map(m=>m[1]+'/'+m[2]))];}
export function sourceAllowed(url:string,institution:InstitutionRecord){try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password&&isOfficialInstitutionUrl(url,institution.key);}catch{return false;}}
function publication(raw:string){const value=raw.match(/<meta[^>]+(?:property|name)=["'](?:article:published_time|date|datePublished)["'][^>]+content=["']([^"']+)/i)?.[1]||raw.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]||raw.match(/<time[^>]+datetime=["']([^"']+)/i)?.[1];return value&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;}
export function mainBody(raw:string){
 // WordPress/Elementor may use <article> only for unrelated news cards.
 // Prefer the balanced post-content container, including nested divs.
 const marker=raw.match(/<(div|section)\b[^>]*class=["'][^"']*(?:elementor-widget-theme-post-content|\bentry-content\b|\bpost-content\b)[^"']*["'][^>]*>/i);
 if(marker?.index!==undefined){const tag=marker[1],start=marker.index+marker[0].length,tokens=new RegExp('<'+tag+'\\b[^>]*>|</'+tag+'\\s*>','gi');tokens.lastIndex=start;let depth=1;let token;while((token=tokens.exec(raw))){depth+=token[0].startsWith('</')?-1:1;if(depth===0)return raw.slice(start,token.index);}}
 return raw.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]||raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||raw;}
export function htmlLinks(raw:string,base:string):Link[]{return [...raw.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap(m=>{try{return [{url:new URL(m[1].replace(/&amp;/g,'&'),base).href,title:plainText(m[2])}];}catch{return [];}});}
export function feedLinks(raw:string):Link[]{return [...raw.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)].flatMap(m=>{const body=m[1],url=body.match(/<link[^>]*>\s*(?:<!\[CDATA\[)?([^<\]]+)/i)?.[1]?.trim()||body.match(/<link[^>]+href=["']([^"']+)/i)?.[1];return url?[{url:url.replace(/&amp;/g,'&'),title:plainText(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),publishedAt:body.match(/<(?:pubDate|published)>([^<]+)/i)?.[1]||null}]:[];});}
const TOPIC=/admission|screening|post.?utme|registration|deadline|extension|circular|news|result|certificate|examination|cut.?off|vice.?chancellor/i;
function relevance(link:Link,question:string,session:string|null){const text=(link.title+' '+decodeURI(link.url)+' '+(link.abstract||'')).toLowerCase();const terms=question.toLowerCase().split(/[^a-z0-9]+/).filter(t=>t.length>3);return terms.reduce((n,t)=>n+(text.includes(t)?3:0),0)+(TOPIC.test(text)?4:0)+(/deadline|closing date|registration closes|extended to/i.test(link.abstract||link.title)?35:0)+(/post.?utme|screening/i.test(question)&&/post.?utme|screening/i.test(link.title)?30:0)+(session&&sessionsIn(text).includes(session)?20:0)-(/\/tag\/|\/category\//.test(link.url)?5:0);}

// Every redirect must retain institution ownership; a successful fetch alone is not authority.
export async function fetchOfficialDocument(link:Link,institution:InstitutionRecord,options:DiscoveryOptions={},adapter='direct'):Promise<{document:SourceDocument|null;gap?:CoverageGap}>{
 const fetcher=options.fetcher||fetch;let url=link.url;
 try{
  let response:Response|undefined;
  for(let hop=0;hop<4;hop++){
   if(!sourceAllowed(url,institution))throw new Error('Non-official URL or redirect');
   response=await fetcher(url,{redirect:'manual',headers:{'User-Agent':'AskSOH/2.0 (+https://sohconsults.com.ng)','Accept':'text/html,application/pdf,text/plain'},signal:AbortSignal.timeout(options.timeoutMs||6000),cache:'no-store'});
   if(response.status>=300&&response.status<400){const location=response.headers.get('location');if(!location)throw new Error('Redirect without location');url=new URL(location,url).href;continue;}break;
  }
  if(!response?.ok)throw new Error('HTTP '+response?.status);
  const type=response.headers.get('content-type')||'';
  if(Number(response.headers.get('content-length'))>8_000_000)throw new Error('Source exceeds 8 MB extraction limit');
  // Stream limit also applies when content-length is absent or inaccurate.
  const reader=response.body?.getReader();if(!reader)throw new Error('Empty source');const chunks:Uint8Array[]=[];let length=0;
  while(true){const next=await reader.read();if(next.done)break;length+=next.value.length;if(length>8_000_000){await reader.cancel();throw new Error('Source exceeds 8 MB extraction limit');}chunks.push(next.value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let text='',title=link.title,publishedAt=link.publishedAt||null;let kind:SourceDocument['kind']='article';
  if(type.includes('pdf')||new TextDecoder().decode(bytes.slice(0,5))==='%PDF-'){text=(await extractText(bytes,{mergePages:true})).text;kind='pdf';}
  else {const raw=new TextDecoder().decode(bytes);if(!type.includes('html')&&!type.includes('text/plain')&&!/^\s*</.test(raw))throw new Error('Unsupported source format');title=plainText(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||title);publishedAt=publication(raw)||publishedAt;text=plainText(mainBody(raw));const path=new URL(url).pathname;kind=/^\/(?:home\/?)?$/.test(path)?'homepage':/portal|admission|putme/.test(path)&&!publishedAt?'portal':'article';}
  if(text.length<40||/just a moment|captcha|performing security verification|verifies you are not a bot|verify you are human|checking your browser|security service to protect against malicious bots|access denied|page not found/i.test(title+' '+text.slice(0,250)))throw new Error('No usable evidence or access challenge');
  const sessions=sessionsIn(title+' '+text);
  return {document:{title,url,snippet:text.slice(0,24000),official:true,publishedAt,fetchedAt:new Date().toISOString(),session:sessions.length===1?sessions[0]:null,kind,adapter,verified:true}};
 }catch(e){return {document:null,gap:{adapter,url,reason:e instanceof Error?e.message:'Source unavailable'}};}
}

// Independent adapters expose URLs, never authoritative search snippets.
export async function discoverOfficialSources(institution:InstitutionRecord,question:string,session:string|null,options:DiscoveryOptions={}){
 const cacheKey='discovery:'+institution.key+':'+session+':'+question.toLowerCase();
 const cached=options.useCache!==false?cacheGet<{documents:SourceDocument[];gaps:CoverageGap[]}>(cacheKey):null;if(cached)return {...cached,cacheHit:true};
 const fetcher=options.fetcher||fetch,gaps:CoverageGap[]=[];const links:Link[]=[];const roots=[...new Set(institution.officialDomains.map(d=>'https://'+d+'/'))];
 const read=async(url:string,adapter:string)=>{try{if(!sourceAllowed(url,institution))throw new Error('Non-official adapter URL');let target=url;let r:Response|undefined;for(let hop=0;hop<4;hop++){if(!sourceAllowed(target,institution))throw new Error('Non-official listing redirect');r=await fetcher(target,{redirect:'manual',signal:AbortSignal.timeout(options.timeoutMs||6000),headers:{Accept:'application/json,text/xml,text/html'},cache:'no-store'});if(r.status>=300&&r.status<400){const location=r.headers.get('location');if(!location)throw new Error('Redirect without location');target=new URL(location,target).href;continue;}break;}if(!r?.ok)throw new Error('HTTP '+r?.status);const reader=r.body?.getReader();if(!reader)return '';const decoder=new TextDecoder();let text='';let size=0;while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.length;if(size>2_000_000){await reader.cancel();throw new Error('Listing too large');}text+=decoder.decode(chunk.value,{stream:true});}return text+decoder.decode();}catch(e){gaps.push({adapter,url,reason:e instanceof Error?e.message:'Unavailable'});return '';}};
 const primary=roots[0];
 const discoveryRoots=[...new Set([primary,'https://www.'+institution.officialDomains[0]+'/'])];
 for(const url of institution.sourceUrls||[])links.push({url,title:institution.name+' official portal'});
 const jobs=[
  ...discoveryRoots.map(root=>async()=>{const term=/screening|utme|admission|deadline/i.test(question)?'post-utme':/certificate/i.test(question)?'certificate':/result/i.test(question)?'result':question.replace(new RegExp(institution.key,'ig'),'').trim();const url=root+'wp-json/wp/v2/posts?search='+encodeURIComponent(term)+'&per_page=30';const raw=await read(url,'wordpress');try{const data=JSON.parse(raw);if(Array.isArray(data))for(const row of data)if(row.link)links.push({url:row.link,title:plainText(row.title?.rendered||''),publishedAt:row.date_gmt?row.date_gmt+'Z':null,abstract:plainText(row.content?.rendered||row.excerpt?.rendered||'')});}catch{}}),
  ...discoveryRoots.map(root=>async()=>{const raw=await read(root+'feed/','rss');for(const m of raw.matchAll(/<(?:item|entry)\b[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi)){const body=m[1];const url=body.match(/<link[^>]*>\s*(?:<!\[CDATA\[)?([^<\]]+)/i)?.[1]?.trim()||body.match(/<link[^>]+href=["']([^"']+)/i)?.[1];if(url)links.push({url,title:plainText(body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||''),publishedAt:body.match(/<(?:pubDate|published)>([^<]+)/i)?.[1]||null});}}),
  async()=>{const urls=discoveryRoots.flatMap(root=>[root+'sitemap.xml',root+'wp-sitemap.xml']);for(const url of urls){const raw=await read(url,'sitemap');const children=[...raw.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(m=>m[1].trim().replace(/&amp;/g,'&'));if(/<sitemapindex/i.test(raw)){await Promise.all(children.filter(u=>sourceAllowed(u,institution)).sort((a,b)=>Number(/post|news/i.test(b))-Number(/post|news/i.test(a))).slice(0,3).map(async child=>{const xml=await read(child,'sitemap-child');for(const m of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi))links.push({url:m[1].trim().replace(/&amp;/g,'&'),title:''});}));}else children.forEach(u=>links.push({url:u,title:''}));}},
  ...[...discoveryRoots,...roots.slice(1,3),...(institution.sourceUrls||[])].map(root=>async()=>{const raw=await read(root,'html');links.push({url:root,title:institution.name});links.push(...htmlLinks(raw,root));const feeds=[...raw.matchAll(/<link\b[^>]*>/gi)].flatMap(m=>/application\/(?:rss|atom)\+xml/i.test(m[0])?[m[0].match(/href=["']([^"']+)/i)?.[1]||'']:[]);for(const feed of feeds.slice(0,2)){try{const url=new URL(feed,root).href;if(sourceAllowed(url,institution))links.push(...feedLinks(await read(url,'declared-feed')));}catch{}}})
 ];
 // Operational adapters stay bounded so one unavailable platform cannot block the others.
 await Promise.allSettled(jobs.map(job=>job()));
 // Follow news/admission listing links once, including non-WordPress platforms.
 const listings=links.filter(l=>sourceAllowed(l.url,institution)&&/news\/?$|admission\/?$|events\.php$|news\.php$/i.test(l.url)).slice(0,3);
 await Promise.all(listings.map(async link=>links.push(...htmlLinks(await read(link.url,'news-listing'),link.url))));
 for(const link of links){try{const url=new URL(link.url);for(const key of [...url.searchParams.keys()])if(key.startsWith('utm_'))url.searchParams.delete(key);url.hash='';link.url=url.href;}catch{}}
 const merged=new Map<string,Link>();for(const link of links.filter(l=>sourceAllowed(l.url,institution))){const previous=merged.get(link.url);merged.set(link.url,{...link,title:previous?.title||link.title,abstract:previous?.abstract||link.abstract,publishedAt:previous?.publishedAt||link.publishedAt});}
 const unique=[...merged.values()].sort((a,b)=>relevance(b,question,session)-relevance(a,question,session)).slice(0,options.maxDocuments||10);
 const fetched=await Promise.all(unique.map(link=>fetchOfficialDocument(link,institution,options,'discovery')));
 fetched.forEach(r=>{if(r.gap)gaps.push(r.gap);});const result={documents:fetched.flatMap(r=>r.document?[r.document]:[]),gaps};
 if(options.useCache!==false&&result.documents.length)cacheSet(cacheKey,result,180);return {...result,cacheHit:false};
}

export async function searchProviderSources(question:string,institution:InstitutionRecord,options:DiscoveryOptions={}){
 const fetcher=options.fetcher||fetch,gaps:CoverageGap[]=[];const candidates:Link[]=[];
 const providers=[
  {name:'brave',url:'https://api.search.brave.com/res/v1/web/search?q='+encodeURIComponent(question+' site:'+institution.officialDomains[0]),key:process.env.BRAVE_SEARCH_API_KEY},
  {name:'jina-google',url:'https://r.jina.ai/http://www.google.com/search?q='+encodeURIComponent(question+' site:'+institution.officialDomains[0])},
  {name:'jina-bing',url:'https://r.jina.ai/http://www.bing.com/search?q='+encodeURIComponent(question+' site:'+institution.officialDomains[0])}
 ];
 for(const provider of providers){if(provider.name==='brave'&&!provider.key)continue;try{const r=await fetcher(provider.url,{headers:provider.key?{'X-Subscription-Token':provider.key}: {Accept:'text/plain'},signal:AbortSignal.timeout(options.timeoutMs||4000),cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const raw=await r.text();if(provider.name==='brave'){const data=JSON.parse(raw);for(const item of data.web?.results||[])candidates.push({title:item.title,url:item.url});}else for(const m of raw.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g))candidates.push({title:m[1],url:m[2]});if(candidates.some(l=>sourceAllowed(l.url,institution)))break;throw new Error('No institution-owned URLs');}catch(e){gaps.push({adapter:provider.name,url:provider.url,reason:e instanceof Error?e.message:'Provider unavailable'});}}
 const unique=[...new Map(candidates.filter(l=>sourceAllowed(l.url,institution)).map(l=>[l.url,l])).values()].slice(0,6);const fetched=await Promise.all(unique.map(l=>fetchOfficialDocument(l,institution,options,'search-provider')));fetched.forEach(r=>{if(r.gap)gaps.push(r.gap);});return {documents:fetched.flatMap(r=>r.document?[r.document]:[]),gaps};
}
