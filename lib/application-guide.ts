import type { PublicOpportunity } from "./content-catalogue";
import type { QueuedStory } from "./news-queue";
import { readArticleBlocks, removeArticleBlocks } from "./article-blocks";
import { normaliseText } from "./discovery-text";

export function applicationSlug(item: PublicOpportunity) {
  return item.detailHref?.split("/").filter(Boolean).pop() || item.id;
}
export function applicationHref(item: PublicOpportunity) {
  return `/applications/${encodeURIComponent(applicationSlug(item))}`;
}
export function safeOfficialUrl(value?: string | null) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
export type NoticeSection = { heading: string; text: string };
// Show the editor's actual sections. Never derive requirements or fees from a title.
export function applicationSections(story?: QueuedStory): NoticeSection[] {
  if (!story) return [];
  const blocks = readArticleBlocks(story.details);
  if (blocks) {
    const sections: NoticeSection[] = [];
    for (const block of blocks) {
      if (block.type === "heading") sections.push({ heading: block.text, text: "" });
      else if (block.type === "paragraph") {
        if (!sections.length) sections.push({ heading: "Published notice", text: "" });
        sections[sections.length - 1].text += `${block.text}\n\n`;
      }
    }
    return sections.filter(section => section.text.trim());
  }
  const text = removeArticleBlocks(story.details);
  return text ? [{ heading: "Published notice", text }] : [];
}
export function checklistSection(sections: NoticeSection[], kind: "eligibility" | "documents" | "fees") {
  const match = {
    eligibility: /eligib|requirements|qualification|who can apply/,
    documents: /documents|what to bring|what you need|credentials/,
    fees: /fees?|cost|payment|application charge/,
  }[kind];
  return sections.filter(section => match.test(normaliseText(section.heading)));
}
