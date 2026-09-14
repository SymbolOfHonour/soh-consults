import { NextRequest, NextResponse } from "next/server";

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

function htmlToText(value: string) {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function extractProgrammeName(html: string) {
  const resultBand = html.match(
    /<div\b[^>]*class=["'][^"']*\bresult-band\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  );

  if (resultBand) {
    const heading = resultBand[1].match(
      /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i
    );

    if (heading) {
      return htmlToText(heading[1]);
    }
  }

  return "";
}

function cleanRequirement(text: string) {
  let cleaned = text;

  const stopPhrases = [
    "Back to Home Page",
    "Lagos State University Directorate",
    "Visits:",
    "Select a programme of study",
  ];

  for (const phrase of stopPhrases) {
    const index = cleaned
      .toLowerCase()
      .indexOf(phrase.toLowerCase());

    if (index >= 0) {
      cleaned = cleaned.slice(0, index);
    }
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

function extractRequirementSections(html: string) {
  const resultStart = html.search(
    /class=["'][^"']*\bresult-box\b/i
  );

  const resultHtml =
    resultStart >= 0 ? html.slice(resultStart) : html;

  const oLevelMatch =
    /O[\s-]*Level\s+Subject\s+Requirements/i.exec(resultHtml);

  const utmeMatch =
    /UTME\s+Subject\s+Requirements/i.exec(resultHtml);

  let oLevel = "";
  let utme = "";

  if (oLevelMatch) {
    const start = oLevelMatch.index + oLevelMatch[0].length;

    const end =
      utmeMatch && utmeMatch.index > start
        ? utmeMatch.index
        : resultHtml.length;

    oLevel = htmlToText(resultHtml.slice(start, end));
  }

  if (utmeMatch) {
    const start = utmeMatch.index + utmeMatch[0].length;

    utme = htmlToText(resultHtml.slice(start));
  }

  return {
    oLevel: cleanRequirement(oLevel),
    utme: cleanRequirement(utme),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const courseId = String(body.courseId ?? "").trim();

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: "LASU programme ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const formData = new URLSearchParams();

    formData.set("course", courseId);

    const response = await fetch(LASU_REQUIREMENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 S.O.H CONSULTS LASU Calculator",
      },
      body: formData.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`LASU returned HTTP ${response.status}`);
    }

    const html = await response.text();

    const programme = extractProgrammeName(html);
    const requirements = extractRequirementSections(html);

    if (!requirements.oLevel && !requirements.utme) {
      return NextResponse.json(
        {
          success: false,
          error:
            "LASU returned the page, but the requirement could not be read.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      source: "LASU",
      courseId,
      programme,
      oLevel: requirements.oLevel,
      utme: requirements.utme,
      retrievedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("LASU requirement fetch failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve the LASU course requirement.",
      },
      {
        status: 502,
      }
    );
  }
}