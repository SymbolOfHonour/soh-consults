import { articleBlocksError, hasArticleNarrative, readArticleBlocks, writeArticleBlocks } from "./article-blocks";
import { EditorError, teamRequest, type TeamMember } from "./editor-team";
import type { QueuedStory } from "./news-queue";
import { normalizeStoryCategory, listStories } from "./news-queue";
import {scheduleError} from "./publishing-schedule";
import { smartMeta, writeSmartMeta } from "./smart-operations";
export function writerArticleVisible(s:QueuedStory) {
 return !/^(S\.O\.H (System:|Trash:|Opportunity:)|Admin:)/i.test(s.source_name)&&!/^admin /i.test(s.category)&&!/^health:/i.test(s.title)&&!['whatsapp_click','page_view','install_click'].includes(s.title.toLowerCase());
}
export function writerArticleValues(body:Record<string,unknown>,member:TeamMember,previous?:QueuedStory) {
 const text=(key:string,max:number)=>typeof body[key]==='string'?(body[key] as string).trim().slice(0,max):'';
 const title=text('title',300);if(/^health:/i.test(title)||['whatsapp_click','page_view','install_click'].includes(title.toLowerCase())||/^admin /i.test(text('category',100)))throw new EditorError('Choose an article title and category.');if(!title)throw new EditorError('Enter a headline.');
 if(body.status!==undefined&&!['draft','published'].includes(String(body.status)))throw new EditorError('Writers can save drafts or publish articles.');
 if(previous?.status==='published'&&body.status==='draft')throw new EditorError('Only the owner can unpublish an article.',403);
 const category=normalizeStoryCategory(text('category',100)||'Admission');
 if(/^admin /i.test(category))throw new EditorError('Choose a public article category.');
 const status=body.status==='published'?'published':previous?.status||'draft';
 let details=text('details',500000);
 const blocks=readArticleBlocks(details);
 if(!blocks)throw new EditorError('Complete the article blocks before saving.');
 const error=articleBlocksError(blocks);if(error)throw new EditorError(error);
 if(status==='published'&&!hasArticleNarrative(blocks))throw new EditorError('Add readable article content before publishing.');
 // Author and expiry remain owner controlled. Writers may schedule unpublished articles.
 const meta=previous?smartMeta(previous.details):{publisherName:member.name,publisherId:member.id};
 if(body.schedule!==undefined){if(previous?.status==='published'&&body.schedule)throw new EditorError('Only unpublished articles can be scheduled.');const issue=scheduleError(body.schedule);if(issue)throw new EditorError(issue);meta.schedule=typeof body.schedule==='string'&&body.schedule?new Date(body.schedule).toISOString():undefined;}
 if(status==='published')meta.schedule=undefined;
 details=writeSmartMeta(writeArticleBlocks('',blocks),meta);
 if(previous)details=[...['[SOH:FEATURED]','[SOH:BREAKING]'].filter(flag=>previous.details.includes(flag)),details].join('\n');
 for(const key of ['official_source_url','image_url']) {const value=text(key,2000);if(value){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch{throw new EditorError('Use valid HTTPS source and picture links.');}}}
 return {title,institution:text('institution',200)||'To be confirmed',category,summary:text('summary',3000),details,image_url:text('image_url',2000)||null,official_source_name:text('official_source_name',200)||null,official_source_url:text('official_source_url',2000)||null,status};
}

export async function listWriterArticles():Promise<QueuedStory[]> {
 // Initialize the existing legacy import, then page article records independently of private audit rows.
 await listStories();
 const records:QueuedStory[]=[];
 for(let offset=0;;offset+=500){
  const params=new URLSearchParams({select:'*',category:'not.ilike.Admin *',and:'(source_name.not.ilike."S.O.H System:*",source_name.not.ilike."S.O.H Trash:*",source_name.not.ilike."S.O.H Opportunity:*")',order:'created_at.desc,id.desc',limit:'500',offset:String(offset)});
  const page=await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?${params}`);records.push(...page.filter(writerArticleVisible));if(page.length<500)break;
 }
 return records;
}
