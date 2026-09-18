type Verification = { ok: boolean; reason: string };

function isPrivateHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h === "::1" || h === "::" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80:")) return true;
  // URL normalizes alternate IPv4 spellings (including integer and hexadecimal forms).
  const octets = h.split(".").map(Number);
  if (octets.length === 4 && octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = octets;
    if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
        (a === 100 && b >= 64 && b <= 127) || (a === 192 && b === 0) ||
        (a === 198 && (b === 18 || b === 19))) return true;
  }
  // Reject literal IPv6 addresses rather than attempt to enumerate all reserved ranges.
  if (h.includes(":")) return true;
  return false;
}

function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || isPrivateHost(url.hostname)) return null;
    return url;
  } catch { return null; }
}

async function fetchVerified(url: URL, method: "HEAD" | "GET") {
  let current = url;
  for (let redirects = 0; redirects <= 5; redirects++) {
    const response = await fetch(current, {
      method,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "S.O.H CONSULTS publication verifier (+https://soh-consults.vercel.app)",
        ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
      },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    const next = location ? safeExternalUrl(new URL(location, current).toString()) : null;
    if (!next) throw new Error("Official source redirected to an unsafe or invalid address.");
    current = next;
  }
  throw new Error("Official source redirected too many times.");
}

export async function verifyExternalSource(value: string | null | undefined): Promise<Verification> {
  const url = safeExternalUrl(value);
  if (!url) return { ok: false, reason: "Official source URL is invalid or points to a private/local address." };
  try {
    let response = await fetchVerified(url, "HEAD");
    if (response.status === 405 || response.status === 501) response = await fetchVerified(url, "GET");
    if (!response.ok) return { ok: false, reason: `Official source could not be reached successfully (HTTP ${response.status}).` };
    return { ok: true, reason: "Official source is reachable." };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? `Official source could not be verified: ${error.message}` : "Official source could not be verified." };
  }
}

export function deadlineEvidencePresent(deadline: string | null | undefined, deadlineIso: string | null | undefined, officialSourceUrl: string | null | undefined) {
  void officialSourceUrl;
  if (!deadline && !deadlineIso) return true;
  if (!deadlineIso || Number.isNaN(Date.parse(deadlineIso))) return false;
  return true;
}
