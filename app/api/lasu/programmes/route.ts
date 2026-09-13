import { NextResponse } from "next/server";

const LASU_REQUIREMENTS_URL =
  "https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php";

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripHtml(value: string) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
  );
}

export async function GET() {
  try {
    const response = await fetch(LASU_REQUIREMENTS_URL, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 S.O.H CONSULTS LASU Calculator",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(`LASU returned HTTP ${response.status}`);
    }

    const html = await response.text();

    const selectMatch = html.match(
      /<select\b[^>]*(?:name=["']course["']|id=["']course["'])[^>]*>([\s\S]*?)<\/select>/i
    );

    if (!selectMatch) {
      throw new Error("LASU programme selector could not be found.");
    }

    const selectHtml = selectMatch[1];

    const programmes: {
      id: string;
      name: string;
    }[] = [];

    const optionRegex =
      /<option\b[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;

    let match: RegExpExecArray | null;

    while ((match = optionRegex.exec(selectHtml)) !== null) {
      const id = decodeHtml(match[1]).trim();
      const name = stripHtml(match[2]).trim();

      if (!id || !name) continue;

      if (name.toLowerCase().includes("select a course")) {
        continue;
      }

      programmes.push({
        id,
        name,
      });
    }

    const uniqueProgrammes = Array.from(
      new Map(
        programmes.map((programme) => [programme.id, programme])
      ).values()
    );

    uniqueProgrammes.sort((a, b) => a.name.localeCompare(b.name));

    if (uniqueProgrammes.length === 0) {
      throw new Error("LASU returned no programmes.");
    }

    return NextResponse.json({
      success: true,
      source: "LASU",
      count: uniqueProgrammes.length,
      updatedAt: new Date().toISOString(),
      programmes: uniqueProgrammes,
    });
  } catch (error) {
    console.error("LASU programme fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve the current LASU programme list.",
      },
      {
        status: 502,
      }
    );
  }
}