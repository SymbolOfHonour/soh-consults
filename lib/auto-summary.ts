import { readArticleBlocks, removeArticleBlocks } from "./article-blocks";

/** Generate a short, plain-text excerpt only when an editor leaves Summary empty. */
export function resolveArticleSummary(summary: string, details: string, maxLength = 180): string {
  const manual = summary.trim();
  if (manual) return manual;

  const blocks = readArticleBlocks(details);
  const text = blocks
    ? blocks.filter((block) => block.type === "paragraph" || block.type === "heading")
        .map((block) => block.text)
        .join(" ")
    : removeArticleBlocks(details);
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const excerpt = normalized.slice(0, maxLength + 1);
  const lastSpace = excerpt.lastIndexOf(" ");
  return `${(lastSpace > maxLength / 2 ? excerpt.slice(0, lastSpace) : excerpt.slice(0, maxLength)).trimEnd()}…`;
}
