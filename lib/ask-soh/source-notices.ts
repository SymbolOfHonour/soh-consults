// Public portals sometimes place their visible scrolling announcement in a
// hidden input. Preserve only explicitly scoped examination notices, not form
// values, scripts or general homepage text.
export function examinationNotices(raw: string): string[] {
  const notices: string[] = [];
  for (const input of raw.matchAll(/<input\b[^>]*>/gi)) {
    const attributes = new Map([...input[0].matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
    const text = (attributes.get('value') || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
    if (attributes.get('type')?.toLowerCase() !== 'hidden' || !/^ScrollInfo\d+$/i.test(attributes.get('id') || '')) continue;
    if (text.length > 1500 || !/^WASSCE for Private Candidates?\b/i.test(text) || !/\b20\d{2}\b/.test(text) || !/\b(?:first|second)\s+series\b/i.test(text)) continue;
    if (/\bregistration\s+(?:has ended|closes|ends)\s+on\b/i.test(text)) notices.push(text);
  }
  return [...new Set(notices)];
}
