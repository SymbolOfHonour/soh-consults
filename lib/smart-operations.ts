import type {QueuedStory} from "./news-queue";
export type ModuleOverride="auto"|"opportunities"|"forms"|"none";
const META=/\[SOH_SMART:([^\]]+)\]/g;
export type SmartMeta={module?:ModuleOverride;schedule?:string;expires?:string};
export function smartMeta(details:string):SmartMeta{const matches=[...details.matchAll(META)];if(!matches.length)return{};try{return JSON.parse(decodeURIComponent(matches.at(-1)![1])) as SmartMeta}catch{return{}}}
export function stripSmartMeta(details:string){return details.replace(META,"").replace(/\n{3,}/g,"\n\n").trim()}
export function writeSmartMeta(details:string,meta:SmartMeta){const clean=stripSmartMeta(details);const values:Record<string,unknown>=Object.fromEntries(Object.entries(meta).filter(([,v])=>Boolean(v)&&v!=="auto"));if(!Object.keys(values).length)return clean;return `${clean}${clean?"\n\n":""}[SOH_SMART:${encodeURIComponent(JSON.stringify(values))}]`;}
export function scheduledAt(story:QueuedStory){const value=smartMeta(story.details).schedule;if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date;}
export function expiryAt(story:QueuedStory){const value=smartMeta(story.details).expires;if(!value)return null;const date=new Date(value);return Number.isNaN(date.getTime())?null:date;}
