import { guides } from "../data/guides";
import { opportunities, updates, getUpdateSlug } from "../data/updates";
import { getStorySlug, type QueuedStory } from "./news-queue";
import { type DiscoveryItem } from "./algorithm-phase2";
import { deadlineDate, normaliseText } from "./discovery-text";
import { readArticleBlocks } from "./article-blocks";
import { admissionDeadlines } from "../data/admission-deadlines";

export const calculatorContent: DiscoveryItem[] = [
  { id:"tool-screening",kind:"calculator",href:"/screening-calculator",title:"Admission & Screening Calculators",summary:"Choose your school to calculate a Post-UTME screening aggregate and check eligibility.",category:"Admission",keywords:["UTME", "O'Level", "screening", "aggregate"] },
  { id:"tool-cgpa",kind:"calculator",href:"/cgpa-calculator",title:"CGPA Calculator & Target Planner",summary:"Calculate GPA and CGPA, or plan the grades you need to reach your target.",category:"CGPA",keywords:["grades", "course units", "semester", "GPA"] },
  ...[ ["LASU","Lagos State University","lasu"], ["FUOYE","Federal University Oye-Ekiti","fuoye"], ["LASUSTECH","Lagos State University of Science and Technology","lasustech"], ["UNIOSUN","Osun State University","uniosun"], ["OOU","Olabisi Onabanjo University","oou"], ["LASUED","Lagos State University of Education","lasued"], ["YABATECH","Yaba College of Technology","yabatech"], ["FUADSI","Federal University of Agriculture and Development Studies Iragbiji","fuadsi"] ].map(([short,institution,slug]):DiscoveryItem=>({id:`tool-${slug}`,kind:"calculator",href:`/${slug}-calculator`,title:`${short} Screening Calculator`,summary:`Calculate your screening score with the ${institution} tool. Read the guidance and requirements shown by the calculator.`,institution,category:"Admission",keywords:["post UTME", "O'Level", "aggregate", "eligibility"]})),
];
export const guideContent: DiscoveryItem[] = guides.map(g=>({id:`guide-${g.slug}`,href:`/guides/${g.slug}`,kind:"guide",title:g.title,summary:g.summary,body:g.sections.map(s=>`${s.heading} ${s.body}`).join(" "),category:g.category}));
export const deadlineContent: DiscoveryItem[] = admissionDeadlines.map((d,i)=>({id:`deadline-${i}`,href:`/deadlines?q=${encodeURIComponent(d.shortName||d.institution)}`,kind:"deadline",title:`${d.institution} ${d.programme}`,summary:`Application deadline: ${d.deadline}`,institution:d.institution,category:d.category,deadline:d.deadline}));
export function storyDiscovery(item:QueuedStory):DiscoveryItem {
  const blocks=readArticleBlocks(item.details);
  const legacy=updates.find(u=>getUpdateSlug(u)===getStorySlug(item));
  const body=blocks?blocks.map(block=>"text" in block?block.text:"").join(" "):item.details;
  return {id:item.id,href:`/updates/${getStorySlug(item)}`,kind:"update",title:item.title,summary:item.summary,body,institution:item.institution,category:item.category,publishedAt:item.source_published_at||item.created_at,deadline:item.deadline_iso||item.deadline||legacy?.deadlineISO||legacy?.deadline||legacy?.opportunityDeadline,isOfficial:Boolean(item.official_source_url)};
}
export type PublicOpportunity = DiscoveryItem & { programme:string;description:string;status:string;deadlineLabel:string;applicationUrl?:string;detailHref?:string };
export function opportunityStatus(item:Pick<PublicOpportunity,"deadline"|"status">, now=new Date()) {
  const deadline=deadlineDate(item.deadline);
  if(item.status==="CLOSED" || (deadline && +deadline < +now))return "Closed";
  if(item.status==="COMING SOON")return "Coming soon";
  if(!deadline)return "Confirm availability";
  return (+deadline-+now)/86_400_000<=7 ? "Closing soon" : "Open";
}
export function publicOpportunities(stories:QueuedStory[]):PublicOpportunity[] {
  const published=new Map(stories.map(s=>[getStorySlug(s),s]));
  const mapped=updates.filter(u=>u.isOpportunity && published.has(getUpdateSlug(u))).map(u=>{
    const s=published.get(getUpdateSlug(u))!;
    return {...storyDiscovery(s),id:`opportunity-${s.id}`,kind:"opportunity" as const,href:`/opportunities#opportunity-${s.id}`,programme:u.opportunityProgramme||s.title,description:s.summary,status:u.opportunityStatus||"OPEN",deadline:s.deadline_iso||s.deadline||u.opportunityDeadline,deadlineLabel:s.deadline||u.opportunityDeadline||"Check official portal",category:u.opportunityCategory||"Other",detailHref:`/updates/${getStorySlug(s)}`,applicationUrl:s.official_source_url||u.sourceUrl};
  });
  const known=new Set(mapped.map(o=>o.detailHref));
  const cms=stories.filter(s=>/scholarship|opportunit/i.test(s.category) && !known.has(`/updates/${getStorySlug(s)}`)).map(s=>({...storyDiscovery(s),id:`opportunity-${s.id}`,kind:"opportunity" as const,href:`/opportunities#opportunity-${s.id}`,programme:s.title,description:s.summary,status:"OPEN",deadlineLabel:s.deadline||"Check official portal",category:/scholarship/i.test(s.category)?"Scholarships":"Other",detailHref:`/updates/${getStorySlug(s)}`,applicationUrl:s.official_source_url||undefined}));
  const seeded=opportunities.map((o,i):PublicOpportunity=>({id:`opportunity-seed-${i}`,kind:"opportunity",href:`/opportunities#opportunity-seed-${i}`,title:`${o.institution} ${o.programme}`,institution:o.institution,programme:o.programme,description:o.description,summary:o.description,category:o.category,status:o.status,deadline:o.deadline,deadlineLabel:o.deadline}));
  return [...mapped,...cms,...seeded];
}
export function contentCatalogue(stories:QueuedStory[]):DiscoveryItem[] {
  return [...stories.map(storyDiscovery),...publicOpportunities(stories),...deadlineContent,...guideContent,...calculatorContent];
}
export function newestContent<T extends {publishedAt?:string|Date}>(items:T[]) {
  const date=(item:T)=>item.publishedAt?Date.parse(String(item.publishedAt))||0:0;
  return [...items].sort((a,b)=>date(b)-date(a));
}
export const sameCategory=(a:string,b:string)=>normaliseText(a)===normaliseText(b);
