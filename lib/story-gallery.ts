const GALLERY=/\[SOH_GALLERY:([^\]]*)\]/g;
export function getGalleryImages(details:string){const matches=[...(details||"").matchAll(GALLERY)];const m=matches.at(-1);if(!m)return[];try{const v=JSON.parse(decodeURIComponent(m[1]));return Array.isArray(v)?v.filter(x=>typeof x==="string"&&/^https?:\/\//.test(x)).slice(0,4):[]}catch{return[]}}
export function cleanGalleryDetails(details:string){return(details||"").replace(GALLERY,"").replace(/\n{3,}/g,"\n\n").trim()}
export function setGalleryImages(details:string,images:string[]){const clean=cleanGalleryDetails(details);const safe=[...new Set(images.filter(x=>/^https?:\/\//.test(x)))].slice(0,4);return safe.length?`${clean}\n\n[SOH_GALLERY:${encodeURIComponent(JSON.stringify(safe))}]`:clean}
