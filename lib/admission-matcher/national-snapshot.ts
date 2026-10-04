export type NationalSnapshot = {
  schemaVersion: number; provider: string; observedAt: string;
  institutions: {id:number; name:string}[]; programmes:string[];
  pairs: [number, number, number[]][];
  unresolvedOfferings: {institutionId:number;offeringId:number;programmeId:number;reason:string;sourceUrl:string}[];
  stats: {institutions:number;programmeLabels:number;sourceOfferings:number;unnamedOfferingExceptions:number;presentationPairs:number;verifiedNewRecords:number};
};

/** Reject malformed imports before the offline catalogue becomes public data. */
export function validateNationalSnapshot(value: unknown): asserts value is NationalSnapshot {
  const snapshot = value as NationalSnapshot;
  if (!snapshot || snapshot.schemaVersion !== 1 || snapshot.provider !== 'jamb-ibass' || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.observedAt) || !Number.isFinite(Date.parse(snapshot.observedAt)) || Date.parse(snapshot.observedAt) > Date.now()) throw new Error('Malformed national snapshot');
  if (!Array.isArray(snapshot.institutions) || !Array.isArray(snapshot.programmes) || !Array.isArray(snapshot.pairs) || !Array.isArray(snapshot.unresolvedOfferings)) throw new Error('Missing national catalogue collections');
  const ids = new Set<number>(), labels = new Set<string>(), offerings = new Set<number>(), pairs = new Set<string>();
  const positive = (id: unknown): id is number => Number.isInteger(id) && (id as number) > 0;
  for (const institution of snapshot.institutions) {
    if (!positive(institution.id) || ids.has(institution.id) || typeof institution.name !== 'string' || !institution.name.trim()) throw new Error('Blank or duplicate institution');
    ids.add(institution.id);
  }
  for (const programme of snapshot.programmes) {
    if (typeof programme !== 'string' || !programme.trim() || labels.has(programme.trim().toUpperCase().replace(/\s+/g,' '))) throw new Error('Blank or duplicate programme');
    labels.add(programme.trim().toUpperCase().replace(/\s+/g,' '));
  }
  const offering = (id: unknown) => {if (!positive(id) || offerings.has(id)) throw new Error('Duplicate or invalid offering ID'); offerings.add(id);};
  for (const row of snapshot.pairs as [number,number,number[]][]) {
    if (!Array.isArray(row) || row.length !== 3 || !ids.has(row[0]) || !Number.isInteger(row[1]) || row[1] < 0 || row[1] >= snapshot.programmes.length || !Array.isArray(row[2]) || !row[2].length || pairs.has(`${row[0]}:${row[1]}`)) throw new Error('Orphan or duplicate programme pair');
    pairs.add(`${row[0]}:${row[1]}`); row[2].forEach(offering);
  }
  for (const row of snapshot.unresolvedOfferings) {
    const url = new URL(row.sourceUrl);
    if (!ids.has(row.institutionId) || !row.reason?.trim() || url.protocol !== 'https:' || url.hostname !== 'ibass-api.jamb.gov.ng' || url.username || url.password) throw new Error('Invalid unresolved offering evidence');
    offering(row.offeringId);
  }
  const stats = snapshot.stats;
  if (!stats || stats.institutions !== ids.size || stats.programmeLabels !== labels.size || stats.sourceOfferings !== offerings.size || stats.presentationPairs !== pairs.size || stats.unnamedOfferingExceptions !== snapshot.unresolvedOfferings.length || stats.verifiedNewRecords !== 0) throw new Error('Snapshot accounting mismatch or unsafe verification promotion');
}
