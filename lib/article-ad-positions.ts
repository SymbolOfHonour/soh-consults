import type {ArticleBlock} from "./article-blocks";
/** Keep editorial ad blocks away from the start/end and space them with real text. */
export function articleAdPositions(blocks:ArticleBlock[]) {
 const words=blocks.filter(b=>b.type==="paragraph"||b.type==="heading").map(b=>"text" in b?b.text:"").join(" ").trim().split(/\s+/).filter(Boolean).length;
 const positions=new Set<number>();
 if(words<300)return positions;
 let paragraphs=0;
 blocks.forEach((b,index)=>{
  if(b.type==="paragraph"&&b.text.trim())paragraphs++;
  if(b.type!=="ad"||positions.size>=2||paragraphs<2||!blocks.slice(index+1).some(next=>next.type==="paragraph"&&next.text.trim()))return;
  positions.add(index);paragraphs=0;
 });
 return positions;
}
