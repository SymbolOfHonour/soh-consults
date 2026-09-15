import { upsertStories } from "./news-queue";

type Source = { name: string; url: string; baseUrl: string };

const sources: Source[] = [
  { name: "Myschool", url: "https://myschool.ng/news", baseUrl: "https://myschool.ng" },
  { name: "MySchoolGist", url: "https://myschoolgist.com/", baseUrl: "https://myschoolgist.com" },
];

const usefulTerms = /admission|post[- ]?utme|direct entry|screening|jamb|waec|neco|nabteb|scholarship|application form|admission list|cut[- ]?off|nysc|resumption|clearance|acceptance fee|nursing/i;

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFor(title: string) {
  if (/scholarship/i.test(title)) return "Scholarship";
  if (/jamb/i.test(title)) return "JAMB";
  if (/waec|neco|nabteb|o.level/i.test(title)) return "O'Level";
  if (/nysc/i.test(title)) return "NYSC";
  if (/admission list/i.test(title)) return "Admission List";
  return "Admission";
}

function extractInstitution(title: string) {
  const match = title.match(/^([A-Z][A-Z0-9-]{2,12})(?:\s|:)/);
  return match?.[1] || "To be confirmed";
}

function extractLinks(html: string, source: Source) {
  const results = new Map<string, { title: string; url: string }>();
  const pattern = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const title = decodeHtml(match[2]);
    if (title.length < 24 || title.length > 180 || !usefulTerms.test(title)) continue;
    let url: URL;
    try { url = new URL(match[1], source.baseUrl); } catch { continue; }
    if (url.hostname !== new URL(source.baseUrl).hostname) continue;
    url.hash = "";
    results.set(url.toString(), { title, url: url.toString() });
  }
  return [...results.values()].slice(0, 30);
}

export async function importLatestStories() {
  const imported: Array<Record<string, string>> = [];
  const failures: string[] = [];
  await Promise.all(sources.map(async (source) => {
    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "S.O.H CONSULTS update monitor (+https://soh-consults.vercel.app)" },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const links = extractLinks(await response.text(), source);
      for (const item of links) {
        imported.push({
          source_name: source.name,
          source_url: item.url,
          title: item.title,
          institution: extractInstitution(item.title),
          category: categoryFor(item.title),
          summary: `${item.title}. Review the original source and prepare an original S.O.H CONSULTS summary before approval.`,
          details: "Imported as a draft. Verify all claims, dates, requirements and application links from the original source before publishing.",
          status: "draft",
        });
      }
    } catch (error) {
      const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
      failures.push(`${source.name}: ${timedOut ? "timed out after 15 seconds" : error instanceof Error ? error.message : "Unknown error"}`);
    }
  }));
  const saved = await upsertStories(imported);
  return { discovered: imported.length, added: saved.length, failures };
}
