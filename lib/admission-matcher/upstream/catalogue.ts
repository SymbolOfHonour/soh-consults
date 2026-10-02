export type IbassCatalogueProgramme = {
  id: number;
  title: string;
};

export type IbassCatalogueResponse = {
  status: boolean;
  message: string;
  data: IbassCatalogueProgramme[];
};

export type IbassInstitutionCatalogue = {
  provider: "jamb-ibass";
  schemaVersion: 1;
  institutionUpstreamId: number;
  observedAt: string;
  programmes: IbassCatalogueProgramme[];
};

const cleanTitle = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * Normalize a browser-observed IBASS institution -> programme catalogue.
 * This is intentionally a pure/offline parser: it does not call JAMB at runtime.
 */
export function normalizeIbassCatalogue(
  institutionUpstreamId: number,
  response: IbassCatalogueResponse,
  observedAt: string,
): IbassInstitutionCatalogue {
  if (!Number.isInteger(institutionUpstreamId) || institutionUpstreamId <= 0) {
    throw new Error("A positive IBASS institution id is required.");
  }
  if (!response.status || !Array.isArray(response.data)) {
    throw new Error("IBASS catalogue response was not successful.");
  }

  const seenIds = new Set<number>();
  const seenTitles = new Set<string>();
  const programmes = response.data.map((programme) => {
    if (!Number.isInteger(programme.id) || programme.id <= 0) {
      throw new Error("Every IBASS programme requires a positive upstream id.");
    }
    const title = cleanTitle(programme.title);
    if (!title) throw new Error(`IBASS programme ${programme.id} has no title.`);
    const canonicalTitle = title.toLowerCase();
    if (seenIds.has(programme.id)) throw new Error(`Duplicate IBASS programme id: ${programme.id}`);
    if (seenTitles.has(canonicalTitle)) throw new Error(`Duplicate IBASS programme title: ${title}`);
    seenIds.add(programme.id);
    seenTitles.add(canonicalTitle);
    return { id: programme.id, title };
  });

  return {
    provider: "jamb-ibass",
    schemaVersion: 1,
    institutionUpstreamId,
    observedAt,
    programmes,
  };
}
