export function redactQuestion(input:string){return input
 .replace(/\b\d{10,16}\b/g,"[REDACTED_NUMBER]")
 .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[REDACTED_EMAIL]")
 .replace(/(?:\+?234|0)[789][01]\d{8}\b/g,"[REDACTED_PHONE]")
 .slice(0,1000);}
export async function questionHash(input:string){const bytes=new TextEncoder().encode(input.trim().toLowerCase());const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");}
