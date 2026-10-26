import {articleText} from "./article-text";
import {readArticleBlocks} from "./article-blocks";
import {smartMeta} from "./smart-operations";
type ReviewStory={id:string;title:string;summary:string;details:string;source_url:string;official_source_url?:string|null;document_url?:string|null;image_url?:string|null;deadline?:string|null;deadline_iso?:string|null};
export function articleReview(story:ReviewStory){
 const text=articleText(story.details||""),blocks=readArticleBlocks(story.details||""),meta=smartMeta(story.details||"");
 const words=text.replace(/https?:\/\/\S+/g,"").trim().split(/\s+/).filter(Boolean).length;
 const sourceLinks=[...new Set([story.official_source_url,...(text.match(/https?:\/\/[^\s<>"\])]+/g)||[])].filter((x):x is string=>!!x).map(x=>x.replace(/[.,;:]$/,"")).filter(x=>/^https?:\/\//i.test(x)).filter(x=>!/(?:supabase\.co\/storage|wa\.me\/|whatsapp\.com\/)/i.test(x)))];
 // Only the demonstrated imported placeholder notices are withheld from indexing.
 // Brief original news, documents, FAQ/table layouts and edited legacy pages stay eligible.
 const placeholder=(story.source_url||"").startsWith("legacy:")&&words<60&&blocks===null&&!story.document_url&&!sourceLinks.length;
 const headings=blocks?.filter(b=>b.type==="heading").length||0;
 const flags=[...(placeholder?["Imported brief notice: enrich before indexing"]:[]),...(!sourceLinks.length?["No external evidence link found in stored text; attachments may need manual review"]:[]),...(words>350&&!headings?["Long article has no structured headings; review readability"]:[]),...(!meta.seoDescription&&!(story.summary||"").trim()?["Missing search description"]:[]),...(/utm_source=chatgpt/i.test(text)?["Imported attribution parameter in an external link"]:[])];
 return {words,sourceLinks,headings,placeholder,indexable:!placeholder,flags};
}
