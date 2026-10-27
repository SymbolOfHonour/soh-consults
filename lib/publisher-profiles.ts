import {createHash} from 'node:crypto';
import {articlePublisherName,DEFAULT_PUBLISHER_NAME,normalisePublisherName} from './article-publisher';
import {getStorySlug,type QueuedStory} from './news-queue';
import {smartMeta} from './smart-operations';
import type {PublicWriterProfile} from './public-writer-profile';

export type PublisherArticle={id:string;href:string;title:string;summary:string;category:string;image:string;publishedAt:string};
export type PublisherProfile={key:string;slug:string;href:string;name:string;about:string;picture_url:string;kind:'person'|'organization';articles:PublisherArticle[]};
const founderCanonicalId='53b104af-48f5-476c-83ae-38a55e52a4bc';
const founderDuplicateId='2bf0d075-f87b-4b6b-b64e-38aaa227a8b0';
const founderName='Oluyepe Adetayo Sunday';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const nameKey=(value:unknown)=>normalisePublisherName(value).toLocaleLowerCase('en-US');
export function publisherSlug(name:string){return normalisePublisherName(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'writer';}
export function teamPublisherPath(profile:Pick<PublicWriterProfile,'id'|'name'>){return uuid.test(profile.id)?`/writers/${publisherSlug(profile.name)}-${profile.id.toLowerCase()}`:null;}
export function safePublisherPicture(value:unknown){if(typeof value!=='string')return '';if(/^\/(?!\/)/.test(value))return value;try{return new URL(value).protocol==='https:'?value:'';}catch{return '';}}
function publishedArticle(story:QueuedStory){return story.status==='published'&&!/^(S\.O\.H (System|Trash|Opportunity):|admin:)/i.test(story.source_name||'')&&!/^admin (settings|analytics)$/i.test(story.category||'');}
function legacyProfile(name:string):Omit<PublisherProfile,'articles'>{
 const organization=nameKey(name)===nameKey(DEFAULT_PUBLISHER_NAME);
 const founder=nameKey(name)==='oluyepe adetayo sunday';
 const slug=organization?'soh-consults':`${publisherSlug(name)}-${createHash('sha256').update(nameKey(name)).digest('hex').slice(0,10)}`;
 return {key:organization?'organization':`byline:${nameKey(name)}`,slug,href:`/writers/${slug}`,name,kind:organization?'organization':'person',picture_url:organization?'/soh-logo.jpg':founder?'/founder.jpg':'',about:organization?'Education updates, admission guidance and practical support from S.O.H CONSULTS. Your Guide. Your Success.':founder?'Founder of S.O.H CONSULTS, providing admission guidance, registration assistance and educational support for students and prospective applicants.':''};
}
export function buildPublisherCatalogue(stories:QueuedStory[],profiles:PublicWriterProfile[]):PublisherProfile[]{
 const validProfiles=profiles.filter(p=>uuid.test(p.id)&&normalisePublisherName(p.name));
 const byId=new Map(validProfiles.map(p=>[p.id.toLowerCase(),p]));
 const byName=new Map<string,PublicWriterProfile[]>();
 for(const p of validProfiles){const key=nameKey(p.name);byName.set(key,[...(byName.get(key)||[]),p]);}
 const catalogue=new Map<string,PublisherProfile>();
 for(const story of stories.filter(publishedArticle)){
  const meta=smartMeta(story.details);const storedName=articlePublisherName(meta.publisherName);
  const matches=byName.get(nameKey(storedName))||[];
  // An explicit identity always wins. Never use a different account as fallback.
  const canonicalFounder=byId.get(founderCanonicalId);
  const isConfirmedFounder=nameKey(storedName)===nameKey(founderName)&&canonicalFounder&&nameKey(canonicalFounder.name)===nameKey(founderName)&&(!meta.publisherId||meta.publisherId.toLowerCase()===founderDuplicateId||meta.publisherId.toLowerCase()===founderCanonicalId);
  const member=isConfirmedFounder?canonicalFounder:meta.publisherId?(uuid.test(meta.publisherId)?byId.get(meta.publisherId.toLowerCase()):undefined):(matches.length===1?matches[0]:undefined);
  const href=member?teamPublisherPath(member):null;
  const identity=member&&href?{key:`writer:${member.id.toLowerCase()}`,slug:href.slice('/writers/'.length),href,name:normalisePublisherName(member.name),about:member.about||'',picture_url:safePublisherPicture(member.picture_url),kind:'person' as const}:legacyProfile(storedName);
  // A missing explicit account remains an independent historical byline.
  if(meta.publisherId&&!member){identity.key=`historical:${meta.publisherId}:${nameKey(storedName)}`;identity.slug=`${publisherSlug(storedName)}-${createHash('sha256').update(identity.key).digest('hex').slice(0,10)}`;identity.href=`/writers/${identity.slug}`;identity.picture_url='';identity.about='';}
  const entry=catalogue.get(identity.key)||{...identity,articles:[]};
  if(!entry.articles.some(a=>a.id===story.id))entry.articles.push({id:story.id,href:`/updates/${getStorySlug(story)}`,title:story.title,summary:(story.summary||'').slice(0,300),category:story.category||'Updates',image:safePublisherPicture(story.image_url),publishedAt:story.source_published_at||story.created_at});
  catalogue.set(identity.key,entry);
 }
 for(const p of catalogue.values())p.articles.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
 return [...catalogue.values()].sort((a,b)=>b.articles.length-a.articles.length||a.name.localeCompare(b.name));
}
export function publisherForStory(catalogue:PublisherProfile[],id:string){return catalogue.find(p=>p.articles.some(a=>a.id===id))||null;}
export function resolvePublisherSlug(catalogue:PublisherProfile[],slug:string){
 const exact=catalogue.find(p=>p.slug===slug);if(exact)return exact;
 const id=slug.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i)?.[1];
 if(id){const resolvedId=id.toLowerCase()===founderDuplicateId?founderCanonicalId:id.toLowerCase();return catalogue.find(p=>p.key===`writer:${resolvedId}`)||null;}
 // The owner confirmed authorship of the pre-profile archive. Keep the two
 // originally shared profile URLs working after those bylines are corrected.
 if(slug==='soh-consults'||slug===legacyProfile(founderName).slug){
  const matches=catalogue.filter(p=>nameKey(p.name)===nameKey(founderName)&&p.key.startsWith('writer:'));
  return matches.length===1?matches[0]:null;
 }
 return null;
}
