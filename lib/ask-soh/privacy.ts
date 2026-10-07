import {createHash} from "crypto";
export function redactQuestion(input:string){return input
 .replace(/\b\d{10,16}\b/g,"[REDACTED_NUMBER]")
 .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,"[REDACTED_EMAIL]")
 .replace(/(?:\+?234|0)[789][01]\d{8}\b/g,"[REDACTED_PHONE]")
 .slice(0,1000);}
export function questionHash(input:string){return createHash("sha256").update(input.trim().toLowerCase()).digest("hex");}
