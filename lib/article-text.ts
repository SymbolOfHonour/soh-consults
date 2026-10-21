import {readArticleBlocks, removeArticleBlocks, type ArticleBlock} from "./article-blocks";
import {cleanGalleryDetails} from "./story-gallery";

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case "paragraph": case "heading": return block.text;
    case "notice": case "collapsible": return [block.title, block.text].filter(Boolean).join(" ");
    case "quote": return [block.text, block.attribution].filter(Boolean).join(" ");
    case "table": return [block.caption, ...block.headers, ...block.rows.flat()].filter(Boolean).join(" ");
    case "faq": return block.entries.map(entry => `${entry.question} ${entry.answer}`).join(" ");
    case "image": return block.alt || "";
    case "document": return block.name || "";
    case "video": return block.title || "";
    default: return "";
  }
}

/** Match the readable public article, excluding encoded layout and editorial metadata. */
export function articleText(details: string): string {
  const blocks = readArticleBlocks(details);
  if (blocks) return blocks.map(blockText).filter(Boolean).join(" ").trim();
  return cleanGalleryDetails(removeArticleBlocks(details))
    .replace(/\[SOH_SMART:[^\]]*\]/gi, "")
    .replace(/\[SOH:(?:FEATURED|BREAKING)\]/gi, "")
    .replace(/\[(?:SCHEDULE|EXPIRES):[^\]]*\]/gi, "")
    .trim();
}

export function articleReadingMinutes(details: string): number {
  const text = articleText(details);
  return Math.max(1, Math.ceil((text ? text.split(/\s+/).length : 0) / 220));
}
