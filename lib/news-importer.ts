import { upsertStories } from "./news-queue";

type Source = { name: string; url: string; baseUrl: string; official?: boolean };

const sources: Source[] = [
  { name: "WAEC Nigeria", url: "https://www.waecnigeria.org/news", baseUrl: "https://www.waecnigeria.org", official: true },
  { name: "JAMB", url: "https://www.jamb.gov.ng/Bulletins", baseUrl: "https://www.jamb.gov.ng", official: true },
  { name: "NYSC", url: "https://nysc.gov.ng/", baseUrl: "https://nysc.gov.ng", official: true },
  { name: "LASU", url: "https://www.lasu.edu.ng/home/index.php", baseUrl: "https://www.lasu.edu.ng", official: true },
  { name: "Myschool", url: "https://myschool.ng/news", baseUrl: "https://myschool.ng" },
  { name: "MySchoolGist", url: "https://myschoolgist.com/", baseUrl: "https://myschoolgist.com" },
];

const usefulTerms = /admission|post[- ]?utme|direct entry|screening|jamb|waec|wassce|neco|nabteb|scholarship|application form|admission list|cut[- ]?off|nysc|resumption|clearance|acceptance fee|nursing|registration|timetable/i;

function decodeHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "-").replace(/&#8217;|&rsquo;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))).replace(/\s+/g, " ").trim();
}

function categoryFor(title: string) {
  if (/scholarship/i.test(title)) return "Scholarship";
  if (/jamb|utme|direct entry/i.test(title)) return "JAMB";
  if (/waec|wassce|neco|nabteb|o.level/i.test(title)) return "O'Level";
  if (/nysc/i.test(title)) return "NYSC";
  if (/admission list/i.test(title)) return "Admission List";
  return "Admission";
}

function extractInstitution(title: string, source: Source) {
  if (source.official) return source.name;
  const match = title.match(/^([A-Z][A-Z0-9-]{2,12})(?:\s|:)/);
  return match?.[1] || "To be confirmed";
}

function extractLinks(html: string, source: Source) {
  const results = new Map<string, { title: string; url: string }>();
  const pattern = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const sourceHost = new URL(source.baseUrl).hostname.replace(/^www\./, "");
  for (const match of html.matchAll(pattern)) {
    const title = decodeHtml(match[2]);
    if (title.length < 20 || title.length > 180 || !usefulTerms.test(title)) continue;
    let url: URL;
    try { url = new URL(match[1], source.baseUrl); } catch { continue; }
    if (url.hostname.replace(/^www\./, "") !== sourceHost) continue;
    url.hash = "";
    results.set(url.toString(), { title, url: url.toString() });
  }
  return [...results.values()].slice(0, source.official ? 20 : 15);
}

export async function importLatestStories() {
  const imported: Array<Record<string, string>> = [];
  const failures: string[] = [];
  await Promise.all(sources.map(async (source) => {
    try {
      const response = await fetch(source.url, { headers: { "User-Agent": "S.O.H CONSULTS update monitor (+https://soh-consults.vercel.app)" }, cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const links = extractLinks(await response.text(), source);
      for (const item of links) {
        imported.push({
          source_name: source.name,
          source_url: item.url,
          title: item.title,
          institution: extractInstitution(item.title, source),
          category: categoryFor(item.title),
          summary: source.official ? `${item.title}. Official-source draft. Review and prepare an original S.O.H CONSULTS summary before approval.` : `${item.title}. Discovery-source draft. Verify against an official source and prepare an original S.O.H CONSULTS summary before approval.`,
          details: source.official ? "Discovered from an official source. Verify dates, requirements and application links before publishing." : "Imported from a private discovery source. Verify every claim against the relevant official institution before publishing.",
          official_source_name: source.official ? source.name : "",
          official_source_url: source.official ? item.url : "",
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
