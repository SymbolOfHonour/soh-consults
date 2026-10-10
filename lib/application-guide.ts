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
function isNoticeHeading(value: string) {
  const plain = value.normalize("NFKD").replace(/\*\*/g, "").replace(/^#{1,6}\s+/, "").trim();
  return plain.length > 0 && plain.length <= 160 && (/^#{1,6}\s+/.test(value) || /^\*\*[^*]+\*\*$/.test(value.trim()) || (/[A-Z]/.test(plain) && plain === plain.toUpperCase() && !/^[-*\d]/.test(plain)));
}
// Show the editor's actual sections. Never derive requirements or fees from a title.
export function applicationSections(story?: QueuedStory): NoticeSection[] {
  if (!story) return [];
  const blocks = readArticleBlocks(story.details);
  if (blocks) {
    const sections: NoticeSection[] = [];
    for (const block of blocks) {
      if (block.type === "heading" || (block.type === "paragraph" && isNoticeHeading(block.text))) sections.push({ heading: block.text, text: "" });
      else if (block.type === "paragraph") {
        if (!sections.length) sections.push({ heading: "Published notice", text: "" });
        sections[sections.length - 1].text += `${block.text}\n\n`;
      }
    }
    return sections.filter(section => section.text.trim());
  }
  const text = removeArticleBlocks(story.details);
  const sections: NoticeSection[] = [];
  for (const line of text.split("\n")) {
    const heading = isNoticeHeading(line);
    if (heading) sections.push({ heading: line.replace(/^#{1,6}\s+/, "").replace(/^\*\*|\*\*$/g, ""), text: "" });
    else {
      if (!sections.length) sections.push({ heading: "Published notice", text: "" });
      sections[sections.length - 1].text += `${line}\n`;
    }
  }
  return sections.filter(section => section.text.trim());
}
export function checklistSection(sections: NoticeSection[], kind: "eligibility" | "documents" | "fees") {
  const match = {
    eligibility: /eligib|requirements|qualification|who can apply/,
    documents: /documents|what to bring|what you need|credentials/,
    fees: /fees?|cost|payment|application charge/,
  }[kind];
  const matched = sections.filter(section => match.test(normaliseText(section.heading)));
  if (matched.length || kind !== "fees") return matched;
  // A fee labelled inside a dates section is still useful; quote only the supplied line.
  const lines = sections.flatMap(section => section.text.split("\n")).filter(line => /^(?:application|registration|screening|form)\s+(?:fee|cost|charge)\s*:/i.test(line.normalize("NFKD").replace(/\*\*/g, "").trim()));
  return lines.length ? [{ heading: "Fee stated in the notice", text: lines.join("\n") }] : [];
}
export function officialNoticeUrl(story?: QueuedStory) {
  if (!story) return undefined;
  const text = applicationSections(story).map(section => section.text).join("\n");
  const links = [...text.matchAll(/\[([^\]\n]*official[^\]\n]*)\]\((https:\/\/[^\s)]+)\)/gi)].map(match => safeOfficialUrl(match[2])).filter(Boolean);
  return new Set(links).size === 1 ? links[0] : undefined;
}
