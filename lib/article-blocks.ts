export type Typography = { font?: "Arial" | "Georgia" | "Verdana" | "Trebuchet MS" | "Times New Roman"; size?: 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72; align?: "left" | "center" | "right"; color?: "default" | "green" | "blue" | "red"; spacing?: "normal" | "relaxed" | "loose"; highlight?: boolean };
export type ArticleBlock =
  | ({ type: "paragraph" | "heading"; text: string; anchor?: string } & Typography)
  | { type: "image"; url: string; alt?: string }
  | { type: "gallery"; urls: string[] }
  | { type: "document"; url: string; name?: string }
  | { type: "video"; url: string; title?: string; mode: "link" | "player" }
  | { type: "notice"; variant: "info"|"deadline"|"warning"; title?: string; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "divider" }
  | { type: "faq"; entries: {question:string;answer:string}[] }
  | { type: "toc" }
  | { type: "ad"; slot: string }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][]; aligns?: ("left"|"center"|"right")[]; widths?: number[] };

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
        blocks.push({ type: block.type, text: block.text, ...typographyFrom(block), ...(block.type==="heading"&&typeof block.anchor==="string"&&/^section-[a-z0-9-]{1,80}$/i.test(block.anchor)?{anchor:block.anchor}:{}) });
      } else if (block.type === "image" && typeof block.url === "string" && IMAGE.test(block.url)) {
        blocks.push({ type: "image", url: block.url, alt: typeof block.alt === "string" ? block.alt.slice(0, 250) : "" });
      } else if (block.type === "gallery" && Array.isArray(block.urls) && block.urls.length <= 20 && block.urls.every((url: unknown) => typeof url === "string" && IMAGE.test(url))) {
        blocks.push({ type: "gallery", urls: [...new Set(block.urls as string[])] });
      } else if (block.type === "document" && typeof block.url === "string" && safeMediaUrl(block.url)) {
        blocks.push({type:"document",url:block.url,name:typeof block.name==="string"?block.name.slice(0,250):""});
      } else if (block.type === "video" && typeof block.url === "string" && safeMediaUrl(block.url) && (block.mode === "link" || block.mode === "player")) {
        blocks.push({type:"video",url:block.url,title:typeof block.title==="string"?block.title.slice(0,250):"",mode:block.mode});
      } else if (block.type === "table" && Array.isArray(block.headers) && block.headers.length >= 1 && block.headers.length <= 20 && block.headers.every((v:unknown)=>typeof v==="string" && v.length<=1000) && Array.isArray(block.rows) && block.rows.length<=300 && block.rows.every((row:unknown)=>Array.isArray(row) && row.length===(block.headers as string[]).length && row.every((v:unknown)=>typeof v==="string" && v.length<=3000))) {
        blocks.push({type:"table",caption:typeof block.caption==="string"?block.caption.slice(0,250):"",headers:block.headers as string[],rows:block.rows as string[][],aligns:Array.isArray(block.aligns)&&block.aligns.length===block.headers.length&&block.aligns.every((v:unknown)=>v==="left"||v==="center"||v==="right")?block.aligns as ("left"|"center"|"right")[]:undefined,widths:Array.isArray(block.widths)&&block.widths.length===block.headers.length&&block.widths.every((v:unknown)=>typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<=600)?block.widths as number[]:undefined});
      } else if (block.type === "notice" && (block.variant==="info"||block.variant==="deadline"||block.variant==="warning") && typeof block.text==="string" && block.text.length<=12000) {
        blocks.push({type:"notice",variant:block.variant,title:typeof block.title==="string"?block.title.slice(0,200):"",text:block.text});
      } else if (block.type === "quote" && typeof block.text==="string" && block.text.length<=12000) {
        blocks.push({type:"quote",text:block.text,attribution:typeof block.attribution==="string"?block.attribution.slice(0,250):""});
      } else if (block.type === "divider" || block.type === "toc") {
        blocks.push({type:block.type});
      } else if (block.type === "faq" && Array.isArray(block.entries) && block.entries.length<=40 && block.entries.every((v:unknown)=>Boolean(v)&&typeof v==="object"&&typeof (v as Record<string,unknown>).question==="string"&&typeof (v as Record<string,unknown>).answer==="string"&&((v as {question:string}).question.length<=500)&&((v as {answer:string}).answer.length<=10000))) {
        blocks.push({type:"faq",entries:(block.entries as {question:string;answer:string}[]).map(entry=>({question:entry.question,answer:entry.answer}))});
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

export function safeMediaUrl(value:string):boolean {
  try {const url=new URL(value);return url.protocol==="https:" && Boolean(url.hostname) && !url.username && !url.password && !/\s/.test(value);} catch {return false;}
}
export function articleBlocksError(blocks:ArticleBlock[]):string|null {
  if(blocks.length>100)return "An article can contain at most 100 content blocks.";
  if (blocks.some(block => (block.type === "image" || block.type === "document" || block.type === "video") && !safeMediaUrl(block.url))) return "Complete each image, PDF or video block with a valid HTTPS URL, or remove it.";
  if (blocks.some(block => block.type === "gallery" && !block.urls.length)) return "Upload pictures to each gallery or remove the empty gallery.";
  if (blocks.some(block=>block.type==="table" && (!block.headers.length || block.headers.length>20 || block.rows.length>300 || block.rows.some(row=>row.length!==block.headers.length || row.some(cell=>cell.length>3000))))) return "Table rows must have the same number of columns as the header.";
  if (blocks.some(block=>block.type==="faq" && block.entries.some(entry=>!entry.question.trim()||!entry.answer.trim()))) return "Complete each FAQ question and answer before publishing.";
  return null;
}

/** Media-only and empty layout blocks do not count as an article's readable content. */
export function hasArticleNarrative(blocks:ArticleBlock[]):boolean {
 return blocks.some(block =>
  (block.type==="paragraph"||block.type==="heading"||block.type==="notice"||block.type==="quote")?Boolean(block.text.trim()):
  block.type==="table"?Boolean(block.headers.some(h=>h.trim())&&block.rows.some(row=>row.some(cell=>/\p{L}/u.test(cell)))):
  block.type==="faq"?block.entries.some(entry=>Boolean(entry.question.trim()&&entry.answer.trim())):false
 );
}
