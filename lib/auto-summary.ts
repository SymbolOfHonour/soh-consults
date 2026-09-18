/** Keep summaries entirely optional: an empty field stays empty. */
export function resolveArticleSummary(summary: string, _details: string, _maxLength = 180): string {
  return summary.trim();
}
