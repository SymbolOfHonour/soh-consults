/** Only the configured storage project may receive browser upload connections. */
export function storageConnectSources(base=process.env.SUPABASE_URL):string {
  if(!base)return "";
  try{const url=new URL(base);if(url.protocol!=="https:"||url.username||url.password)return "";const direct=new URL(url.origin);if(/^[a-z0-9]+\.supabase\.co$/.test(direct.hostname))direct.hostname=direct.hostname.replace(".supabase.co",".storage.supabase.co");return [...new Set([url.origin,direct.origin])].join(" ");}catch{return "";}
}

/** Restrict image optimization to public objects in the configured storage project. */
export function publicStorageOrigin(base=process.env.SUPABASE_URL):string|null {
  try { const url=new URL(base||""); return url.protocol==="https:"&&!url.username&&!url.password&&/^[a-z0-9]+\.supabase\.co$/.test(url.hostname)&&!url.port ? url.origin : null; } catch { return null; }
}

export function canOptimizePublicStorageImage(src:string,base=process.env.SUPABASE_URL):boolean {
  const origin=publicStorageOrigin(base);
  if(!origin)return false;
  try { const url=new URL(src); return url.origin===origin&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname.startsWith("/storage/v1/object/public/news-attachments/"); } catch { return false; }
}
