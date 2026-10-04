/** Only the configured storage project may receive browser upload connections. */
export function storageConnectSources(base=process.env.SUPABASE_URL):string {
  if(!base)return "";
  try{const url=new URL(base);if(url.protocol!=="https:"||url.username||url.password)return "";const direct=new URL(url.origin);if(/^[a-z0-9]+\.supabase\.co$/.test(direct.hostname))direct.hostname=direct.hostname.replace(".supabase.co",".storage.supabase.co");return [...new Set([url.origin,direct.origin])].join(" ");}catch{return "";}
}
