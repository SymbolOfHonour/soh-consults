import { parseLasuRequirements } from "../../../../lib/lasu-portal";
import { readLasuBackup, saveLasuBackup } from "../../../../lib/lasu-backup";
import { NextRequest, NextResponse } from "next/server";

const LASU_REQUIREMENTS_URL =
  "https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php";

export async function POST(request: NextRequest) {
  let courseId = "";
  try {
    const body = await request.json();

    courseId = String(body.courseId ?? "").trim();

    if (!/^\d{1,8}$/.test(courseId)) {
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
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`LASU returned HTTP ${response.status}`);
    }

    const html = await response.text();

    const parsed = parseLasuRequirements(html, courseId);
    if (response.redirected) throw new Error("LASU redirected the response");
    // Keep confirmed source blanks as blanks. The calculator requires both sections
    // before producing eligibility; an older response must not fill a current source gap.
    if (!parsed.oLevel && !parsed.utme) throw new Error("LASU returned no requirements");
    const record = { ...parsed, retrievedAt: new Date().toISOString() };
    await saveLasuBackup(record).catch(() => console.warn("LASU live result loaded but backup could not be saved"));
    return NextResponse.json({ success: true, source: "LASU", mode: "live", ...record });
  } catch (error) {
    console.error("LASU requirement fetch failed:", error);

    const backup = /^\d{1,8}$/.test(courseId) ? await readLasuBackup(courseId) : null;
    if (backup) return NextResponse.json({ success: true, source: "LASU", mode: "backup", ...backup });

    return NextResponse.json(
      {
        success: false,
        error: "Requirements for this course are temporarily unavailable. Please confirm with LASU or try again later.",
      },
      {
        status: 502,
      }
    );
  }
}