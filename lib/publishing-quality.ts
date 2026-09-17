import type {QueuedStory} from "./news-queue";
import {deadlineDate} from "./operations-insights";
import {duplicateCandidates} from "./admin-content-flags";
import {readArticleBlocks,removeArticleBlocks} from "./article-blocks";
import {deadlineEvidencePresent} from "./source-verification";

/** Deterministic pre-publication checks. Network reachability is verified separately. */
export function publicationQuality(story:QueuedStory,others:QueuedStory[]){
 const issues:string[]=[];
 if(!story.title?.trim())issues.push("Headline is missing.");
 if(!story.summary?.trim())issues.push("Summary is missing.");
 const blocks=readArticleBlocks(story.details||"");
 const readable=blocks?blocks.some(block=>(block.type==="paragraph"||block.type==="heading")&&block.text.trim()):Boolean(removeArticleBlocks(story.details||"").trim());
 if(!readable)issues.push("Article text is missing.");
 if(!story.official_source_url)issues.push("Official source link is missing.");
 if((story.deadline||story.deadline_iso)&&!deadlineDate(story))issues.push("Deadline is not verified with a valid date.");
 if(!deadlineEvidencePresent(story.deadline,story.deadline_iso,story.official_source_url))issues.push("Deadline evidence is incomplete: provide a valid deadline date and official source link.");
 if(duplicateCandidates(story.title||"",others,story.id,story.official_source_url).length)issues.push("Possible duplicate: review matching headlines or source links.");
 return issues;
}
