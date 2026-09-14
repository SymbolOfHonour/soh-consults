import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  official: boolean;
};

const OFFICIAL_HOSTS = [
  "jamb.gov.ng",
  "lasu.edu.ng",
  "lidc.lasu.edu.ng",
  "services.lidc.lasu.edu.ng",
  "education.gov.ng",
  "nbte.gov.ng",
  "nysc.gov.ng",
];

function cleanText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[-–—•]+\s*/, "")
    .trim();
}

function isOfficial(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return OFFICIAL_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function parseGoogleMarkdown(markdown: string): SearchResult[] {
  const lines = markdown.split("\n");
  const results: SearchResult[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    const match = line.match(/^\[(.+?)\]\((https?:\/\/[^)]+)\)$/);
    if (!match) continue;

    const title = cleanText(match[1]);
    let url = match[2];

    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("google.") && parsed.pathname === "/url") {
        const target = parsed.searchParams.get("q") || parsed.searchParams.get("url");
        if (target) url = target;
      }
    } catch {
      continue;
    }

    if (
      !title ||
      title.toLowerCase().includes("google") ||
      url.includes("google.com/search") ||
      url.includes("accounts.google") ||
      url.includes("support.google")
    ) {
      continue;
    }

    const snippetParts: string[] = [];
    for (let j = i + 1; j < Math.min(lines.length, i + 7); j += 1) {
      const candidate = cleanText(lines[j]);
      if (!candidate) continue;
      if (/^\[.+?\]\(https?:\/\//.test(candidate)) break;
      if (candidate.startsWith("http")) continue;
      if (candidate.length > 20) snippetParts.push(candidate);
      if (snippetParts.join(" ").length > 320) break;
    }

    const snippet = cleanText(snippetParts.join(" ")).slice(0, 360);
    if (!snippet) continue;

    if (!results.some((item) => item.url === url)) {
      results.push({ title, url, snippet, official: isOfficial(url) });
    }

    if (results.length >= 6) break;
  }

  return results.sort((a, b) => Number(b.official) - Number(a.official));
}

export async function GET(request: NextRequest) {
  const question = request.nextUrl.searchParams.get("q")?.trim();

  if (!question || question.length < 3) {
    return NextResponse.json({ error: "Please enter a valid question." }, { status: 400 });
  }

  const safeQuestion = question.slice(0, 220);
  const googleQuery = `${safeQuestion} Nigeria admission JAMB LASU`;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;
  const readerUrl = `https://r.jina.ai/http://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=8&hl=en`;

  try {
    const response = await fetch(readerUrl, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "markdown",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Search service returned ${response.status}`);
    }

    const markdown = await response.text();
    const results = parseGoogleMarkdown(markdown);

    return NextResponse.json({
      query: safeQuestion,
      googleUrl,
      results,
      searchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        query: safeQuestion,
        googleUrl,
        results: [],
        error: error instanceof Error ? error.message : "Search temporarily unavailable.",
      },
      { status: 200 },
    );
  }
}
