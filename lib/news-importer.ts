import { upsertStories, type QueuedStory } from "./news-queue";
import { newsSources, type NewsSource } from "./news-sources";

const useful = /admission|post[- ]?utme|direct entry|screening|jamb|waec|wassce|neco|nabteb|scholarship|application|admission list|cut[- ]?off|nysc|resumption|clearance|acceptance fee|registration|timetable|mobilisation|mobilization|matriculation|convocation|deadline|result|bursary|fellowship|exam|o.level/i;
const exclude = /software download|photo gallery|courtesy visit|stakeholders? meeting|advertorial|procurement|tender|staff recruitment|birthday|condolence|anniversary message/i;
const FRESH_HOURS = 72;
const MIN_ARTICLE_TEXT = 180;
const USER_AGENT = "S.O.H CONSULTS education update monitor (+https://sohconsults.com.ng)";
function decode(v: string) { return v.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "-").replace(/&#8217;|&rsquo;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c))).replace(/\s+/g, " ").trim(); }
/** Strip listing-page date/comment badges, without removing dates that belong to a headline. */
export function cleanDiscoveryHeadline(raw: string) {
  return decode(raw)
    .replace(/^(?:O['’]?Level News|Post[- ]?UTME News|Admission News|Latest News)\s+(?=(?:WAEC|NECO|NABTEB|JAMB|Post[- ]?UTME|[A-Z]{3,}))/i, "")
    .replace(/\s+\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:20\d{2}\s+)?(?:\d+\s+Comments?|\d+)\s*$/i, "")
    .replace(/\s+\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\s*$/i, "")
    .replace(/\s+\d+\s+Comments?\s*$/i, "")
    .trim();
}
function category(t: string) { if (/scholarship|bursary|fellowship/i.test(t)) return "Scholarship"; if (/jamb|utme|direct entry/i.test(t)) return "JAMB"; if (/waec|wassce|neco|nabteb|o.level/i.test(t)) return "O'Level"; if (/nysc|mobilisation|mobilization/i.test(t)) return "NYSC"; if (/admission list/i.test(t)) return "Admission List"; return "Admission"; }
function institution(t: string, s: NewsSource) { return s.official ? s.name : t.match(/^([A-Z][A-Z0-9-]{2,12})(?:\s|:)/)?.[1] || "To be confirmed"; }
/** Documents and downloads are not HTML news articles; don't fetch them as articles. */
export function isArticleUrl(url: string) { try { const path = new URL(url).pathname; return !/\.(?:pdf|docx?|xlsx?|pptx?|zip|rar|jpe?g|png|gif|webp|mp[34]|aspx)(?:$)/i.test(path); } catch { return false; } }
function links(html: string, s: NewsSource) { const found = new Map<string, { title: string; url: string }>(); const host = new URL(s.baseUrl).hostname.replace(/^www\./, ""); for (const match of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) { const title = cleanDiscoveryHeadline(match[2]); if (title.length < 20 || title.length > 180 || !useful.test(title) || exclude.test(title)) continue; try { const url = new URL(match[1], s.baseUrl); if (url.protocol !== "https:" || url.hostname.replace(/^www\./, "") !== host || !isArticleUrl(url.toString())) continue; url.hash = ""; found.set(url.toString(), { title, url: url.toString() }); } catch { /* Invalid source link. */ } } return [...found.values()].slice(0, s.official ? 8 : 20); }
function validDate(value: string | undefined): string | null { if (!value) return null; const time = Date.parse(value); return Number.isFinite(time) ? new Date(time).toISOString() : null; }
/** Explicit year/month/day paths can rule out old undated articles, but cannot prove freshness. */
export function isHistoricallyDatedUrl(url: string, now = Date.now()) {
  try {
    const path = new URL(url).pathname;
    const match = path.match(/(?:^|\/)(20\d{2})\/(0?[1-9]|1[0-2])(?:\/(0?[1-9]|[12]\d|3[01]))?(?:\/|$)/);
    if (!match) return false;
    const year = Number(match[1]); const month = Number(match[2]); const day = match[3] ? Number(match[3]) : 1;
    const date = Date.UTC(year, month - 1, day);
    if (!Number.isFinite(date) || new Date(date).getUTCMonth() !== month - 1) return false;
    const latestPossible = match[3] ? date + 86400000 : Date.UTC(year, month, 1);
    return latestPossible < now - FRESH_HOURS * 3600000;
  } catch { return false; }
}
/** Use explicit publication metadata only. Never substitute crawl time or a page's modified date. */
export function articlePublicationDate(html: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = tag.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (!key || !["article:published_time", "datepublished", "pubdate", "publish_date", "dc.date.issued", "citation_publication_date", "date", "parsely-pub-date", "sailthru.date", "article.published", "article:published", "og:published_time"].includes(key)) continue;
    const value = tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]; const parsed = validDate(value); if (parsed) return parsed;
  }
  for (const match of html.matchAll(/["'](?:datePublished|dateCreated|pubDate)["']\s*:\s*["']([^"'\n]+)["']/gi)) { const parsed = validDate(match[1]); if (parsed) return parsed; }
  for (const tag of html.match(/<time\b[^>]*>/gi) || []) { const value = tag.match(/datetime\s*=\s*["']([^"']+)["']/i)?.[1]; const parsed = validDate(value); if (parsed) return parsed; }
  return null;
}
export function isFreshPublication(date: string | null, now = Date.now()) { if (!date) return false; const time = Date.parse(date); return Number.isFinite(time) && time <= now + 300000 && time >= now - FRESH_HOURS * 3600000; }
export type DiscoverySuggestion = { source_name: string; source_url: string; source_published_at: string; title: string; institution: string; category: string; official: boolean; summary: string; details: string };
export type SourceDiagnostic = { source: string; links: number; candidates: number; undated: number; old: number; failures: number };
function articleText(html:string) { const scoped=html.match(/<article\b[^>]*>([\s\\S]*?)<\/article>/i)?.[1]||html.match(/<main\b[^>]*>([\s\\S]*?)<\/main>/i)?.[1]||html; return decode(scoped.replace(/<script\b[\s\\S]*?<\/script>/gi," ").replace(/<style\b[\s\\S]*?<\/style>/gi," ").replace(/<nav\b[\s\\S]*?<\/nav>/gi," ").replace(/<footer\b[\s\\S]*?<\/footer>/gi," ")); }
function draftFromArticle(title:string,text:string){const body=text.replace(title," ").replace(/\s+/g," ").trim();if(body.length<MIN_ARTICLE_TEXT)return null;const sentences=body.match(/[^.!?]+[.!?]+/g)?.map(x=>x.trim()).filter(x=>x.length>35)||[];const selected=sentences.slice(0,8);if(selected.join(" ").length<MIN_ARTICLE_TEXT)return null;return{summary:selected.slice(0,2).join(" ").slice(0,600),details:selected.join("\\n\\n").slice(0,5000)};}
async function retrieve(url: string, timeout = 9000) { const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" }, cache: "no-store", signal: AbortSignal.timeout(timeout) }); if (!response.ok) throw new Error(`HTTP ${response.status}`); const type = response.headers.get("content-type") || ""; if (type && !/text\/html|application\/xhtml\+xml/i.test(type)) throw new Error(`Unsupported content type: ${type}`); return response.text(); }
export async function discoverLatestStories() { const suggestions: DiscoverySuggestion[] = []; const failures: string[] = []; const sourceDiagnostics: SourceDiagnostic[] = []; let skippedOld = 0, skippedUndated = 0; let next = 0;
  async function worker() { while (next < newsSources.length) { const source = newsSources[next++]; const diagnostic: SourceDiagnostic = { source: source.name, links: 0, candidates: 0, undated: 0, old: 0, failures: 0 }; sourceDiagnostics.push(diagnostic); try { const found = links(await retrieve(source.url, 12000), source); diagnostic.links = found.length; if (!found.length) { failures.push(`${source.name}: no qualifying links; review source layout.`); diagnostic.failures++; continue; } let cursor = 0; async function articleWorker() { while (cursor < found.length) { const item = found[cursor++]; try { const html=await retrieve(item.url); const published=articlePublicationDate(html); if(!published){skippedUndated++;diagnostic.undated++;continue;} if(!isFreshPublication(published)){skippedOld++;diagnostic.old++;continue;} const draft=draftFromArticle(item.title,articleText(html)); if(!draft){diagnostic.failures++;failures.push(`${source.name}: ${item.url}: Source content unavailable or too thin for a useful draft`);continue;} suggestions.push({source_name:source.name,source_url:item.url,source_published_at:published,title:item.title,institution:institution(item.title,source),category:category(item.title),official:!!source.official,summary:draft.summary,details:draft.details}); diagnostic.candidates++; } catch (error) { diagnostic.failures++; failures.push(`${source.name}: ${item.url}: ${error instanceof Error ? error.message : "Article fetch failed"}`); } } } await Promise.all(Array.from({ length: Math.min(3, found.length) }, () => articleWorker())); } catch (error) { diagnostic.failures++; failures.push(`${source.name}: ${error instanceof Error ? error.message : "Source fetch failed"}`); } } }
  await Promise.all(Array.from({ length: Math.min(3, newsSources.length) }, () => worker())); suggestions.sort((a, b) => (b.source_published_at || "").localeCompare(a.source_published_at || "")); sourceDiagnostics.sort((a,b)=>a.source.localeCompare(b.source)); return { suggestions, failures, skippedOld, skippedUndated, sourcesChecked: newsSources.length, sourceDiagnostics }; }
export async function importLatestStories() { const { suggestions, failures, skippedOld, skippedUndated, sourcesChecked, sourceDiagnostics } = await discoverLatestStories(); const drafts: Partial<QueuedStory>[] = suggestions.map(item => ({ source_name: item.source_name, source_url: item.source_url, source_published_at: item.source_published_at, title: item.title, institution: item.institution, category: item.category, summary: item.summary, details: item.details, official_source_name: item.official ? item.source_name : "", official_source_url: item.official ? item.source_url : "", status: "draft" })); const saved = await upsertStories(drafts); return { discovered: drafts.length, added: saved.length, skippedOld, skippedUndated, sourcesChecked, failures, sourceDiagnostics }; }
