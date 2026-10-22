import {readArticleBlocks,writeArticleBlocks,removeArticleBlocks} from '../../../../../lib/article-blocks';
import {cleanGalleryDetails} from '../../../../../lib/story-gallery';
import {scheduledAt,stripSmartMeta} from '../../../../../lib/smart-operations';
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentWriter, EditorError, teamRequest, type Submission } from "../../../../../lib/editor-team";
import { getStorySlug, type QueuedStory } from "../../../../../lib/news-queue";
import { writerArticleValues, writerArticleVisible, listWriterArticles } from "../../../../../lib/writer-articles";
import { verifyExternalSource } from "../../../../../lib/source-verification";
import { publicationQuality } from "../../../../../lib/publishing-quality";
import { checkRateLimit } from "../../../../../lib/rate-limit";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
const expose=(s:QueuedStory)=>({...s,permalink:`/updates/${getStorySlug(s)}`});
export async function GET(request:Request){try{
 if(!await currentWriter())return reply({error:'Unauthorized'},401);
 const url=new URL(request.url),id=url.searchParams.get('id');
 if(id){if(!/^[a-f0-9-]{36}$/i.test(id))throw new EditorError('Invalid article.');const rows=await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?id=eq.${id}&select=*`);if(!rows[0]||!writerArticleVisible(rows[0]))throw new EditorError('Article not found.',404);return reply({story:expose(rows[0])});}
 const rows=await listWriterArticles();return reply({stories:rows.map(expose)});
}catch(e){return failure(e);}}
export async function POST(request:Request){return save(request,true);}
export async function PATCH(request:Request){return save(request,false);}
async function save(request:Request,create:boolean){try{
 const member=await currentWriter();if(!member)return reply({error:'Unauthorized'},401);
 const rate=await checkRateLimit(request,`writer-article-${member.id}`,120,3600);if(!rate.allowed)throw new EditorError('Please try again later.',rate.unavailable?503:429);
 const body=await request.json().catch(()=>null);if(!body||typeof body!=='object'||JSON.stringify(body).length>550000)throw new EditorError('Invalid article.');
 if(body.action&&body.action!=='restore')throw new EditorError('This action is owner-only.',403);
 const id=create?(typeof body.review_id==='string'?body.review_id:crypto.randomUUID()):body.id;if(typeof id!=='string'||!/^[a-f0-9-]{36}$/i.test(id))throw new EditorError('Invalid article.');
 let previous:QueuedStory|undefined;
 if(!create){previous=(await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?id=eq.${id}&select=*`))[0];if(!previous||!writerArticleVisible(previous))throw new EditorError('Article not found.',404);if(body.expected_updated_at!==previous.updated_at)throw new EditorError('Another editor changed this article. Reload before saving.',409);}
 let input=body;
 if(create&&body.review_id){
  const submission=(await teamRequest<Submission[]>(`/rest/v1/editor_submissions?id=eq.${id}&author_id=eq.${member.id}&select=*`))[0];
  if(!submission||submission.status==='imported')throw new EditorError('Review draft is no longer available.',409);
  if(body.review_expected!==submission.updated_at)throw new EditorError('Review draft changed. Reload before publishing.',409);
  input={...submission.snapshot,details:writeArticleBlocks('',submission.snapshot.blocks),status:body.status};
 }

 if(body.action==='restore'){
  if(!previous||typeof body.history_id!=='string'||!/^[a-f0-9-]{36}$/i.test(body.history_id))throw new EditorError('Choose a valid revision.');
  const row=(await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?id=eq.${body.history_id}&select=*`))[0];
  if(!row||row.source_name!==`S.O.H System:history:${id}`)throw new EditorError('Revision not found.',404);
  const snapshot=JSON.parse(row.details).snapshot as QueuedStory;
  if(snapshot?.id!==id)throw new EditorError('Revision does not belong to this article.');
  input={...snapshot,details:readArticleBlocks(snapshot.details)?snapshot.details:writeArticleBlocks('',[{type:'paragraph',text:removeArticleBlocks(stripSmartMeta(cleanGalleryDetails(snapshot.details))).replace(/\[SOH:(?:FEATURED|BREAKING)\]/gi,'').trim()}]),status:previous.status==='published'?'published':undefined};
 }
 const values=writerArticleValues(input,member,previous);
 if(values.status==='published'||scheduledAt({...previous,...values} as QueuedStory)){
  const quality=publicationQuality({...previous,...values,id} as QueuedStory,[]);if(quality.length)throw new EditorError(quality.join(' '));
  if(values.official_source_url){const source=await verifyExternalSource(values.official_source_url);if(!source.ok)throw new EditorError(source.reason);}
 }
 const rows=await teamRequest<QueuedStory[]>('/rest/v1/rpc/save_writer_article',{method:'POST',body:JSON.stringify({p_id:id,p_expected:previous?.updated_at||body.review_expected||null,p_actor:member.id,p_values:{...values,...(body.action==='restore'?{writer_action:'restore'}:{})},p_create:create})});
 if(!rows[0])throw new EditorError('Another editor changed this article. Reload before saving.',409);
 for(const path of ['/','/updates','/updates/[id]','/admin','/admin/updates',`/updates/imported/${id}`]){if(path==='/updates/[id]')revalidatePath(path,'page');else revalidatePath(path);}
 return reply({story:expose(rows[0])},create?201:200);
}catch(e){return failure(e);}}
function failure(e:unknown){return reply({error:e instanceof EditorError?e.message:'Unable to save article. Please reload and try again.'},e instanceof EditorError?e.status:500);}
