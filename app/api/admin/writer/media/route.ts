import {NextResponse} from 'next/server';
import {currentWriter,teamRequest} from '../../../../../lib/editor-team';
import {listWriterArticles} from '../../../../../lib/writer-articles';
import {addReusableMedia,articleMedia,type MediaKind} from '../../../../../lib/reusable-media';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){try{
 if(!await currentWriter())return NextResponse.json({error:'Unauthorized'},{status:401,headers});
 const params=new URL(request.url).searchParams;
 const folder=params.get('folder')||'images',offset=Number(params.get('offset')||0);
 if(!['images','documents','videos'].includes(folder)||!Number.isSafeInteger(offset)||offset<0)return NextResponse.json({error:'Invalid media page.'},{status:400,headers});
 const kind:MediaKind=folder==='images'?'image':folder==='documents'?'document':'video';
 const [storage,stories]=await Promise.allSettled([
  teamRequest<{name:string;id:string|null}[]>('/storage/v1/object/list/news-attachments',{method:'POST',body:JSON.stringify({prefix:folder,limit:100,offset,sortBy:{column:'created_at',order:'desc'}})}),
  offset===0?listWriterArticles():Promise.resolve([])
 ]);
 if(storage.status==='rejected'&&(offset>0||stories.status==='rejected'))throw Error('Media unavailable');
 const origin=new URL(request.url).origin;
 const files=articleMedia(stories.status==='fulfilled'?stories.value:[],kind,origin);
 const objects=storage.status==='fulfilled'?storage.value:[];
 for(const object of objects)if(object.id)addReusableMedia(files,`${process.env.SUPABASE_URL}/storage/v1/object/public/news-attachments/${folder}/${encodeURIComponent(object.name)}`,object.name,kind,origin);
 const warning=storage.status==='rejected'||stories.status==='rejected'?'Some media could not be loaded. Refresh the library to try again.':undefined;
 return NextResponse.json({files:[...files.values()],nextOffset:objects.length===100?offset+100:null,...(warning?{warning}:{})},{headers});
}catch{return NextResponse.json({error:'Unable to load media library. Please try again.'},{status:503,headers});}}
