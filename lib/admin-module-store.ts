import { createStory, deleteStory, listStories, updateStory, type QueuedStory } from "./news-queue";
export type ModuleKey="forms"|"calendar"|"seo"|"enquiries"|"settings"|"calculator"|"media"|"analytics";
export type ModuleRecord={id:string;module:ModuleKey;title:string;subtitle:string;status:string;details:string;value:string;url:string|null;deadline:string|null;created_at:string;updated_at:string};
const PREFIX="S.O.H Module:";
const source=(m:ModuleKey,s:string)=>`${PREFIX}${m}:${s||"ACTIVE"}`;
function parse(s:string){if(!s.startsWith(PREFIX))return null;const [module,...rest]=s.slice(PREFIX.length).split(":");return {module:module as ModuleKey,status:rest.join(":")||"ACTIVE"}}
function mapped(s:QueuedStory):ModuleRecord|null{const p=parse(s.source_name);if(!p)return null;return{id:s.id,module:p.module,title:s.title,subtitle:s.institution,status:p.status,details:s.summary,value:s.details||"",url:s.official_source_url,deadline:s.deadline,created_at:s.created_at,updated_at:s.updated_at}}
export async function listModuleRecords(module:ModuleKey){return(await listStories()).map(mapped).filter((r):r is ModuleRecord=>!!r&&r.module===module).sort((a,b)=>+new Date(b.updated_at)-+new Date(a.updated_at))}
export async function createModuleRecord(module:ModuleKey,v:Partial<ModuleRecord>){const row=await createStory({title:v.title||"Untitled",institution:v.subtitle||"",category:`Admin ${module}`,summary:v.details||"",details:v.value||"",deadline:v.deadline||null,official_source_url:v.url||null,status:"archived"});const u=await updateStory(row.id,{source_name:source(module,v.status||"ACTIVE"),source_url:`module:${module}:${row.id}`});return mapped(u!)!}
export async function updateModuleRecord(module:ModuleKey,id:string,v:Partial<ModuleRecord>){const u=await updateStory(id,{title:v.title, institution:v.subtitle, summary:v.details,details:v.value,deadline:v.deadline||null,official_source_url:v.url||null,source_name:source(module,v.status||"ACTIVE")});if(!u)throw new Error("Record not found");return mapped(u)!}
export async function deleteModuleRecord(id:string){return deleteStory(id)}
export function isModuleKey(v:string):v is ModuleKey{return ["forms","calendar","seo","enquiries","settings","calculator","media","analytics"].includes(v)}
