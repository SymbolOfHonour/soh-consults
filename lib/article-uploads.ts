export const MAX_ARTICLE_UPLOAD_BYTES = 4 * 1024 * 1024;
export type ArticleUploadKind = "image" | "document" | "video";
const types:Record<ArticleUploadKind,string[]> = {image:["image/jpeg","image/png","image/webp"],document:["application/pdf"],video:["video/mp4","video/webm"]};
export async function detectedArticleFileType(file:File):Promise<string|null> {
  const bytes = new Uint8Array(await file.slice(0,64).arrayBuffer());
  const text=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
  if(bytes.length>=3 && bytes[0]===0xff && bytes[1]===0xd8 && bytes[2]===0xff)return "image/jpeg";
  if(bytes.length>=8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i)=>bytes[i]===v))return "image/png";
  if(bytes.length>=12 && text(0,4)==="RIFF" && text(8,12)==="WEBP")return "image/webp";
  if(bytes.length>=5 && text(0,5)==="%PDF-")return "application/pdf";
  if(bytes.length>=16 && text(4,8)==="ftyp") {
    const brands=[text(8,12)];for(let i=16;i+4<=bytes.length;i+=4)brands.push(text(i,i+4));
    if(brands.some(brand=>["isom","iso2","mp41","mp42","avc1","M4V ","dash"].includes(brand)))return "video/mp4";
  }
  if(bytes.length>=12 && [0x1a,0x45,0xdf,0xa3].every((v,i)=>bytes[i]===v) && text(0,64).includes("webm"))return "video/webm";
  return null;
}
export async function uploadValidationError(file:File,kind:ArticleUploadKind):Promise<string|null> {
  if(!file.size || file.size>MAX_ARTICLE_UPLOAD_BYTES)return "Upload a nonempty file up to 4 MB. For larger files, paste a hosted HTTPS link.";
  const actual=await detectedArticleFileType(file);
  if(!types[kind].includes(file.type)||actual!==file.type)return kind==="video"?"Use a genuine MP4 or WebM video.":kind==="document"?"Use a genuine PDF document.":"Use a genuine JPG, PNG or WebP image.";
  return null;
}
