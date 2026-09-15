const GALLERY=/\n?\[SOH_GALLERY:([^\]]*)\]\s*$/;
export function getGalleryImages(details:string){const m=(details||"").match(GALLERY);if(!m)return[];try{const v=JSON.parse(decodeURIComponent(m[1]));return Array.isArray(v)?v.filter(x=>typeof x==="string"&&/^https?:\/\//.test(x)).slice(0,4):[]}catch{return[]}}
export function cleanGalleryDetails(details:string){return(details||"").replace(GALLERY,"").trim()}
export function setGalleryImages(details:string,images:string[]){const clean=cleanGalleryDetails(details);const safe=images.filter(x=>/^https?:\/\//.test(x)).slice(0,4);return safe.length?`${clean}\n\n[SOH_GALLERY:${encodeURIComponent(JSON.stringify(safe))}]`:clean}
