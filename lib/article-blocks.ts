export type Typography = { font?: "Arial" | "Georgia" | "Verdana" | "Trebuchet MS" | "Times New Roman"; size?: 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72; align?: "left" | "center" | "right"; color?: "default" | "green" | "blue" | "red"; spacing?: "normal" | "relaxed" | "loose"; highlight?: boolean };
export type ArticleBlock =
  | ({ type: "paragraph" | "heading"; text: string } & Typography)
  | { type: "image"; url: string; alt?: string }
  | { type: "gallery"; urls: string[] }
  | { type: "ad"; slot: string };

const MARKER = /\[SOH_BLOCKS:([^\]]*)\]/g;
const IMAGE = /^https:\/\/[^\s]+$/i;
const fonts = ["Arial", "Georgia", "Verdana", "Trebuchet MS", "Times New Roman"] as const;
const sizes = [12,14,16,18,20,24,28,32,36,40,48,56,64,72] as const;
const aligns = ["left", "center", "right"] as const;
const colors = ["default", "green", "blue", "red"] as const;
const spacings = ["normal", "relaxed", "loose"] as const;
export function typographyFrom(input: Record<string, unknown>): Typography {
  const result: Typography = {};
  if (fonts.some(value => value === input.font)) result.font = input.font as Typography["font"];
  if (sizes.some(value => value === input.size)) result.size = input.size as Typography["size"];
  if (aligns.some(value => value === input.align)) result.align = input.align as Typography["align"];
  if (colors.some(value => value === input.color)) result.color = input.color as Typography["color"];
  if (spacings.some(value => value === input.spacing)) result.spacing = input.spacing as Typography["spacing"];
  if (input.highlight === true) result.highlight = true;
  return result;
}
export function readArticleBlocks(details: string): ArticleBlock[] | null {
  const matches = [...details.matchAll(MARKER)];
  if (!matches.length) return null;
  try {
    const raw: unknown = JSON.parse(decodeURIComponent(matches[matches.length - 1][1]));
    if (!Array.isArray(raw) || raw.length > 100) return null;
    const blocks: ArticleBlock[] = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") return null;
      const block = item as Record<string, unknown>;
      if ((block.type === "paragraph" || block.type === "heading") && typeof block.text === "string" && block.text.length <= 30000) {
        blocks.push({ type: block.type, text: block.text, ...typographyFrom(block) });
      } else if (block.type === "image" && typeof block.url === "string" && IMAGE.test(block.url)) {
        blocks.push({ type: "image", url: block.url, alt: typeof block.alt === "string" ? block.alt.slice(0, 250) : "" });
      } else if (block.type === "gallery" && Array.isArray(block.urls) && block.urls.length <= 20 && block.urls.every((url: unknown) => typeof url === "string" && IMAGE.test(url))) {
        blocks.push({ type: "gallery", urls: [...new Set(block.urls as string[])] });
      } else if (block.type === "ad" && typeof block.slot === "string" && /^[a-z0-9_-]{1,40}$/i.test(block.slot)) {
        blocks.push({ type: "ad", slot: block.slot });
      } else return null;
    }
    return blocks;
  } catch { return null; }
}
export function removeArticleBlocks(details: string): string {
  return details.replace(MARKER, "").replace(/\n{3,}/g, "\n\n").trim();
}
export function writeArticleBlocks(details: string, blocks: ArticleBlock[]): string {
  const clean = removeArticleBlocks(details);
  const encoded = encodeURIComponent(JSON.stringify(blocks));
  return `${clean}${clean ? "\n\n" : ""}[SOH_BLOCKS:${encoded}]`;
}
