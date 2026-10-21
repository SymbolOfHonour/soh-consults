import {NextResponse} from 'next/server';
import {currentWriter,teamRequest} from '../../../../../lib/editor-team';
import {listStories} from '../../../../../lib/news-queue';
import {readArticleBlocks} from '../../../../../lib/article-blocks';
import {writerArticleVisible} from '../../../../../lib/writer-articles';
export async function GET(request:Request){try{
 if(!await currentWriter())return NextResponse.json({error:'Unauthorized'},{status:401});
 const params=new URL(request.url).searchParams;
 const folder=params.get('folder')||'images',offset=Number(params.get('offset')||0);
 if(!['images','documents','videos'].includes(folder)||!Number.isSafeInteger(offset)||offset<0)return NextResponse.json({error:'Invalid media page.'},{status:400});
 const objects=await teamRequest<{name:string;id:string|null}[]>('/storage/v1/object/list/news-attachments',{method:'POST',body:JSON.stringify({prefix:folder,limit:100,offset,sortBy:{column:'created_at',order:'desc'}})});
 const files=new Map<string,{url:string;name:string;kind:string}>();
 const add=(url:string|null|undefined,name:string,kind:string)=>{if(url&&/^https:\/\//i.test(url))files.set(url,{url,name,kind});};
 for(const object of objects)if(object.id)add(`${process.env.SUPABASE_URL}/storage/v1/object/public/news-attachments/${folder}/${encodeURIComponent(object.name)}`,object.name,folder==='images'?'image':folder==='documents'?'document':'video');
 if(offset===0)for(const s of (await listStories()).filter(writerArticleVisible)){
  const kind=folder==='images'?'image':folder==='documents'?'document':'video';
  if(kind==='image')add(s.image_url,s.title,kind);if(kind==='document')add(s.document_url,s.document_name||s.title,kind);
  for(const b of readArticleBlocks(s.details)||[]){if(b.type===kind&&'url' in b)add(b.url,s.title,kind);if(kind==='image'&&b.type==='gallery')for(const url of b.urls)add(url,s.title,kind);}
 }
 return NextResponse.json({files:[...files.values()],nextOffset:objects.length===100?offset+100:null},{headers:{'Cache-Control':'no-store'}});
}catch{return NextResponse.json({error:'Unable to load media library.'},{status:503});}}
