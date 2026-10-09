// Parse declared public data; never evaluate publisher JavaScript.
export function publicFragment(raw:string,base:string):string|null {
 const path=raw.match(/\b(?:var|let|const)\s+url\s*=\s*["'](ajax\/(?:index|read)\.php)["']/g)?.find(s=>s.includes('read.php'))||raw.match(/\b(?:var|let|const)\s+url\s*=\s*["'](ajax\/index\.php)["']/)?.[0];
 const relative=path?.match(/["']([^"']+)["']/)?.[1];
 return relative&&/\.open\(["']GET["'],\s*url,\s*true\)/.test(raw)?new URL(relative,base).href:null;
}
export type PortalDeclaration={category:'utme'|'direct-entry';status:'open'|'closed';deadline?:string};
export function portalDeclarations(raw:string):PortalDeclaration[]{
 const declarations:PortalDeclaration[]=[];
 for(const [key,category] of [['utme','utme'],['de','direct-entry']] as const){
  const tab=raw.match(new RegExp('<button\\b[^>]*data-tab=["\\\']'+key+'["\\\'][^>]*>([\\s\\S]*?)</button>','i'))?.[1];
  if(tab&&/pill-(open|closed)\b/.test(tab))declarations.push({category,status:/pill-closed\b/.test(tab)?'closed':'open'});
 }
 const literal=raw.match(/\b(?:const|let|var)\s+portalCountdowns\s*=\s*(\[[^;]{0,4000}\])\s*;/)?.[1];
 if(literal)try{const rows=JSON.parse(literal);if(Array.isArray(rows))for(const row of rows){const category=row.key==='utme'?'utme':row.key==='de'?'direct-entry':null;const entry=declarations.find(x=>x.category===category);if(entry&&row.status==='opened'&&entry.status==='open'&&/^20\d{2}-\d{2}-\d{2}$/.test(row.target))entry.deadline=row.target;}}catch{}
 return declarations;
}
export function publicAssetLinks(raw:string,base:string){
 return [...raw.matchAll(/(?:src=["']([^"']+\.js)["']|["']([^"']+\.(?:pdf|js))["'])/g)].flatMap(m=>{try{return [new URL(m[1]||m[2],base).href];}catch{return [];}});
}
export async function boundedText(response:Response,limit=2_000_000){
 const reader=response.body?.getReader();if(!reader)return '';const decoder=new TextDecoder();let text='',bytes=0;
 while(true){const item=await reader.read();if(item.done)break;bytes+=item.value.length;if(bytes>limit){await reader.cancel();throw new Error('Public source exceeds extraction limit');}text+=decoder.decode(item.value,{stream:true});}
 return text+decoder.decode();
}
export function yearArchiveRequest(raw:string,base:string,year:string){
 if(!/^20\d{2}$/.test(year))return null;
 for(const match of raw.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)){
  if(!/method=["']post["']/i.test(match[1]))continue;
  const action=match[1].match(/action=["']([^"']+)["']/i)?.[1];if(!action)continue;
  const url=new URL(action,base);if(url.origin!==new URL(base).origin||!/bulletin|archive|news/i.test(url.pathname))continue;
  const select=match[2].match(/<select\b[^>]*name=["']([^"']*year[^"']*)["'][^>]*>([\s\S]*?)<\/select>/i);if(!select||!select[2].includes('value="'+year+'"'))continue;
  const body=new URLSearchParams();let submit=false;
  for(const input of match[2].matchAll(/<input\b[^>]*>/gi)){
   const tag=input[0],type=tag.match(/type=["']([^"']+)["']/i)?.[1],name=tag.match(/name=["']([^"']+)["']/i)?.[1],value=tag.match(/value=["']([^"']*)["']/i)?.[1]||'';
   if(name&&type==='hidden'&&/^__/.test(name)&&value.length<200000)body.set(name,value);
   if(name&&type==='submit'&&/^(?:view|load|list|search)\s+(?:news|bulletins?|bullettins?|archive)/i.test(value)){body.set(name,value);submit=true;}
  }
  if(submit){body.set(select[1],year);return {url:url.href,body:body.toString()};}
 }
 return null;
}
export function publisherCookies(previous:string,response:Response){
 const values=new Map(previous.split('; ').filter(Boolean).map(c=>[c.split('=')[0],c]));
 for(const header of response.headers.getSetCookie()){const value=header.split(';')[0];if(value.includes('='))values.set(value.split('=')[0],value);}
 return [...values.values()].join('; ');
}
