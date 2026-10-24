export const DEFAULT_PUBLISHER_NAME = "S.O.H CONSULTS";

export function normalisePublisherName(value: unknown): string {
  return typeof value === "string" ? Array.from(value.trim().replace(/\s+/g, " ")).slice(0, 120).join("") : "";
}

export function articlePublisherName(value: unknown): string {
  return normalisePublisherName(value) || DEFAULT_PUBLISHER_NAME;
}

export function articleAuthor(value: unknown, siteUrl: string, profileHref?:string) {
  const name = articlePublisherName(value);
  return name.toLowerCase() === DEFAULT_PUBLISHER_NAME.toLowerCase()
    ? {"@id": `${siteUrl}/#organization`}
    : {"@type": "Person", name,...(profileHref&&/^\/writers\/[a-z0-9-]+$/.test(profileHref)?{url:`${siteUrl}${profileHref}`}:{})};
}
