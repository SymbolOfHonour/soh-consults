import {NextResponse} from 'next/server';
import {currentWriter,teamRequest} from '../../../../../lib/editor-team';
import type {QueuedStory} from '../../../../../lib/news-queue';
import {writerArticleVisible} from '../../../../../lib/writer-articles';
export async function GET(request:Request){try{
 if(!await currentWriter())return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=new URL(request.url).searchParams.get('id');if(!id||!/^[a-f0-9-]{36}$/i.test(id))return NextResponse.json({error:'Invalid article.'},{status:400});
 const story=(await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?id=eq.${id}&select=*`))[0];
 if(!story||!writerArticleVisible(story))return NextResponse.json({error:'Article not found.'},{status:404});
 const rows=await teamRequest<QueuedStory[]>(`/rest/v1/news_queue?source_name=in.(S.O.H%20System:history:${id},S.O.H%20System:audit:${id})&order=created_at.desc&limit=100&select=*`);
 return NextResponse.json({entries:rows.flatMap(r=>{try{const p=JSON.parse(r.details);return[{id:r.id,kind:r.source_name.includes(':history:')?'revision':'activity',created_at:r.created_at,action:p.action,details:p.details||'',title:p.snapshot?.title||p.title||r.title}];}catch{return[];}})},{headers:{'Cache-Control':'no-store'}});
}catch{return NextResponse.json({error:'Unable to load article history.'},{status:503});}}
