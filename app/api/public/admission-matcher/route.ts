import { nationalCatalogueSummary, nationalRequirementsForProgramme } from "../../../../lib/admission-matcher/national-catalogue";

export async function GET(request: Request) {
  const programme = new URL(request.url).searchParams.get("programme");
  if (programme !== null && (programme.length > 250 || !programme.trim())) {
    return Response.json({ error: "Supply a valid programme name." }, { status: 400 });
  }
  const body = programme === null ? nationalCatalogueSummary() : { requirements: nationalRequirementsForProgramme(programme) };
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
