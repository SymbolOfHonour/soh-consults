/** Parse only the official result containers, never surrounding labels or footer text. */
function text(html: string) {
  return html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, " ")
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)))
    .replace(/&nbsp;/gi, " ").replace(/&quot;/gi, '"').replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ").trim();
}
export function parseLasuRequirements(html: string, courseId: string) {
  const selected = html.match(/<option\b[^>]*value=["']([^"']+)["'][^>]*\bselected\b[^>]*>([\s\S]*?)<\/option>/i);
  const band = html.match(/<div\b[^>]*class=["'][^"']*\bresult-band\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const heading = band?.[1].match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i);
  const programme = heading ? text(heading[1]) : "";
  if (!selected || selected[1] !== courseId || text(selected[2]) !== programme || !programme) {
    throw new Error("LASU did not confirm the selected programme");
  }
  const sections = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bsection-label\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*class=["'][^"']*\bsubject-pill-wrap\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi));
  const oLevel = sections.filter(section => /^O[\s-]*Level Subject Requirements$/i.test(text(section[1])));
  const utme = sections.filter(section => /^(?:JAMB\s+)?UTME Subject Requirements$/i.test(text(section[1])));
  if (oLevel.length !== 1 || utme.length !== 1) throw new Error("LASU requirement sections could not be identified");
  return { courseId, programme, oLevel: text(oLevel[0][2]), utme: text(utme[0][2]) };
}
