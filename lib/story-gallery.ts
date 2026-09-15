const GALLERY=/\[SOH_GALLERY:([^\]]*)\]/g;

function text(value:unknown){return typeof value==="string"?value:"";}

export function getGalleryImages(details:string){
  const source=text(details);
  let payload:string|null=null;
  GALLERY.lastIndex=0;
  let match:RegExpExecArray|null;
  while((match=GALLERY.exec(source))!==null){payload=match[1]||null;}
  GALLERY.lastIndex=0;
  if(!payload)return[];
  try{
    const decoded=decodeURIComponent(payload);
    const value:unknown=JSON.parse(decoded);
    if(!Array.isArray(value))return[];
    return [...new Set(value.filter((item):item is string=>typeof item==="string"&&/^https?:\/\//i.test(item)))].slice(0,4);
  }catch{return[];}
}

export function cleanGalleryDetails(details:string){
  GALLERY.lastIndex=0;
  const clean=text(details).replace(GALLERY,"").replace(/\n{3,}/g,"\n\n").trim();
  GALLERY.lastIndex=0;
  return clean;
}

export function setGalleryImages(details:string,images:string[]){
  const clean=cleanGalleryDetails(details);
  const safe=[...new Set((Array.isArray(images)?images:[]).filter(item=>typeof item==="string"&&/^https?:\/\//i.test(item)))].slice(0,4);
  return safe.length?`${clean}\n\n[SOH_GALLERY:${encodeURIComponent(JSON.stringify(safe))}]`:clean;
}
