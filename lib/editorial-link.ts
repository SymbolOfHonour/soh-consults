/** Preserve meaningful query parameters while removing the imported attribution tag. */
export function editorialLink(value:string){try{const url=new URL(value);if(url.searchParams.get("utm_source")?.toLowerCase()==="chatgpt.com"){url.searchParams.delete("utm_source");return url.href}return value}catch{return value}}
