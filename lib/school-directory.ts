import {verifiedSchoolLinks} from "../data/schools/verified-links";
import snapshot from "../data/schools/ibass-institutions.json";
import categories from "../data/schools/categories.json";
export type School={key:string;id:number;name:string;alias:string;state:string;ownership:string;categoryId:number|null;typeId:number;type:string};
export const directorySchools:School[]=snapshot.institutions;
export const directoryObservedAt=snapshot.observedAt;
export const directoryCoverage=snapshot.coverage;
export const directoryCategories=categories;
export const categoryTitle=(id:number|null)=>categories.find(c=>c.id===id)?.title||"Category not supplied by source";
const normalize=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function searchSchools({q="",category="",state="",page="1"}:{q?:string;category?:string;state?:string;page?:string}){
 q=typeof q==="string"?q:"";category=typeof category==="string"?category:"";state=typeof state==="string"?state:"";page=typeof page==="string"?page:"1";
 const words=normalize(q.slice(0,120)).split(" ").filter(Boolean);
 const found=directorySchools.filter(s=>(!category||String(s.categoryId)===category)&&(!state||s.state===state)&&words.every(word=>normalize(`${s.name} ${s.alias} ${verifiedSchoolLinks[s.key]?.name===s.name?verifiedSchoolLinks[s.key].aliases.join(" "):""}`).includes(word))).sort((a,b)=>a.name.localeCompare(b.name)||a.key.localeCompare(b.key));
 const pages=Math.max(1,Math.ceil(found.length/24));const number=Math.min(pages,Math.max(1,Number.isFinite(Number(page))?Math.floor(Number(page)):1));
 return {total:found.length,pages,page:number,schools:found.slice((number-1)*24,number*24)};
}
export function findSchool(key:string){return directorySchools.find(s=>s.key===key)}
export function schoolBrochureUrl(school:School){return `https://ibass.jamb.gov.ng/brochure-courses?id=${school.id}&school=${encodeURIComponent(school.name)}`}

export function verifiedSchoolWebsite(school:School){const entry=verifiedSchoolLinks[school.key];return entry?.name===school.name?entry:null}
