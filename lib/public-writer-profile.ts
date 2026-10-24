import {teamRequest} from './editor-team';
import {normalisePublisherName} from './article-publisher';
export type PublicWriterProfile={id:string;name:string;about:string;picture_url:string};
export async function listPublicWriterProfiles():Promise<PublicWriterProfile[]>{
 const rows:PublicWriterProfile[]=[];
 for(let offset=0;;offset+=500){
  const page=await teamRequest<PublicWriterProfile[]>(`/rest/v1/editor_team?activated_at=not.is.null&select=id,name,about,picture_url&order=id&limit=500&offset=${offset}`);
  // Never pass account email, invitations, session or permission fields to a reader.
  rows.push(...page.map(({id,name,about,picture_url})=>({id,name,about,picture_url})));
  if(page.length<500)return rows;
 }
}
export async function publicWriterProfile(name:string,id?:string):Promise<PublicWriterProfile|null>{
 const publisher=normalisePublisherName(name);if(!publisher&&!id)return null;
 if(id&&!/^[a-f0-9-]{36}$/i.test(id))return null;
 const filter=id?`id=eq.${encodeURIComponent(id)}`:`name=eq.${encodeURIComponent(publisher)}`;
 try{
  // Read only public profile fields. Legacy name-only articles require an unambiguous activated author.
  const rows=await teamRequest<PublicWriterProfile[]>(`/rest/v1/editor_team?${filter}&activated_at=not.is.null&select=id,name,about,picture_url&limit=2`);
  return rows.length===1?rows[0]:null;
 }catch{return null;}
}
