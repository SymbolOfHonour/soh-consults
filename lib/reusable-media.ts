import {readArticleBlocks,type ArticleBlock} from './article-blocks';
import {getGalleryImages} from './story-gallery';
import type {QueuedStory} from './news-queue';
export type MediaKind='image'|'document'|'video';
export type ReusableMedia={url:string;name:string;kind:MediaKind;usedIn?:string[];alt?:string;mode?:'link'|'player'};
export type MediaChooser=(kind:MediaKind,onSelect:(file:ReusableMedia)=>void)=>void;
export function reusableMediaUrl(value:unknown,origin:string):string|null{
 if(typeof value!=='string'||!value.trim()||/[\\\u0000-\u001f]/.test(value))return null;
 const raw=value.trim();if(!/^https:\/\//i.test(raw)&&!/^\/(?!\/)/.test(raw))return null;
 try{const url=new URL(raw,origin);if(url.protocol!=='https:'||url.username||url.password)return null;if(url.origin===new URL(origin).origin&&/^\/(api|admin)(\/|$)/i.test(url.pathname))return null;url.hash='';return url.href;}catch{return null;}
}
export function addReusableMedia(files:Map<string,ReusableMedia>,value:unknown,name:string,kind:MediaKind,origin:string,extra:Partial<ReusableMedia>={}){
 const url=reusableMediaUrl(value,origin);if(!url)return;
 const previous=files.get(url),usedIn=[...new Set([...(previous?.usedIn||[]),...(extra.usedIn||[])])];
 files.set(url,{url,name:(previous?.name||name||new URL(url).pathname.split('/').pop()||'Media file').slice(0,300),kind,...(usedIn.length?{usedIn}:{}),...(previous?.alt||extra.alt?{alt:previous?.alt||extra.alt}:{}),...(previous?.mode||extra.mode?{mode:previous?.mode||extra.mode}:{})});
}
export function articleMedia(stories:QueuedStory[],kind:MediaKind,origin:string):Map<string,ReusableMedia>{
 const files=new Map<string,ReusableMedia>();
 for(const s of stories){
  if(/^(S\.O\.H (System:|Trash:|Opportunity:)|Admin:)/i.test(s.source_name)||/^admin /i.test(s.category)||/^health:/i.test(s.title)||['whatsapp_click','page_view','install_click'].includes(s.title.toLowerCase()))continue;
  const extra={usedIn:[s.title]};
  if(kind==='image'){addReusableMedia(files,s.image_url,s.title,kind,origin,extra);for(const url of getGalleryImages(s.details))addReusableMedia(files,url,s.title,kind,origin,extra);}
  if(kind==='document')addReusableMedia(files,s.document_url,s.document_name||s.title,kind,origin,extra);
  for(const b of readArticleBlocks(s.details)||[]){
   if(b.type==='gallery'&&kind==='image')for(const url of b.urls)addReusableMedia(files,url,s.title,kind,origin,extra);
   if(b.type===kind&&'url' in b){const name=b.type==='document'?b.name:b.type==='video'?b.title:b.type==='image'?b.alt:'';addReusableMedia(files,b.url,name||s.title,kind,origin,{...extra,...(b.type==='image'?{alt:b.alt}:{}),...(b.type==='video'?{mode:b.mode}:{})});}
  }
 }
 return files;
}
export function insertReusableMedia(block:ArticleBlock,file:ReusableMedia):ArticleBlock{
 if(block.type==='image'&&file.kind==='image')return {...block,url:file.url,alt:block.alt||file.alt||''};
 if(block.type==='gallery'&&file.kind==='image')return {...block,urls:[...new Set([...block.urls,file.url])].slice(0,10)};
 if(block.type==='document'&&file.kind==='document')return {...block,url:file.url,name:block.name||file.name};
 if(block.type==='video'&&file.kind==='video')return {...block,url:file.url,title:block.title||file.name,mode:file.mode||(/\.(mp4|webm)(?:\?|$)/i.test(file.url)?'player':'link')};
 return block;
}
