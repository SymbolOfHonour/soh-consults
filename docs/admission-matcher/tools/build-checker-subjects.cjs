// Normalize saved institution-specific checker configurations and replay every
// observation. A parsed component requires positive AND negative observations,
// unchanged configuration and exact school/programme identity before runtime use.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const {loadMatcher} = require('../../../tests/admission-matcher-helper.cjs');
const {parseCheckerSubjects, checkerRuleSatisfied} = loadMatcher('lib/admission-matcher/upstream/checker-subjects');
const root = path.resolve(__dirname, '../../..');
const folder = path.join(root, 'docs/admission-matcher/audit/ibass-2026-10-04');
const raw = fs.readFileSync(path.join(folder, 'parity-probes.json.gz'));
const source = JSON.parse(zlib.gunzipSync(raw));
if(source.schemaVersion!==1 || source.sourceType!=='eligibility-checker' || !Array.isArray(source.probes)) throw new Error('Malformed official checker evidence');
const snapshot = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(folder, 'evidence-snapshot.json.gz'))));
const catalogueRaw = fs.readFileSync(path.join(folder, 'checker-catalogue-2026-10-04.json.gz'));
const checkerCatalogue = JSON.parse(zlib.gunzipSync(catalogueRaw));
const identityAudit = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(folder, 'checker-catalogue-reconciliation.json.gz'))));
const screeningBaseline = JSON.parse(fs.readFileSync(path.join(folder, 'unilag-screening-baseline.json')));
if(screeningBaseline.catalogueInstitutionId!==494 || screeningBaseline.session!=='2026/2027' || screeningBaseline.minimumUtmeScore!==200 || screeningBaseline.maximumSittings!==1 || screeningBaseline.firstChoiceRequired!==true || screeningBaseline.sourceUrl!=='https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/' || !/^[a-f0-9]{64}$/.test(screeningBaseline.sourceHtmlSha256)) throw new Error('Unverified screening baseline');
const schoolMappings = new Map(identityAudit.mappings.map(row=>[row.checkerInstitutionId,row.catalogueInstitutionId]));
const schoolKey = value => value.toLowerCase().match(/[a-z0-9]+/g)?.join(' ') ?? '';
const programmeKey = value => value.trim().toUpperCase().replace(/\s+/g, ' ');
const grouped = new Map();
source.probes.forEach((probe, index) => {
  if (probe.request.mode_of_entry !== 'UTME' || probe.response.status !== true) return;
  const school = probe.response.institution_details;
  const programme = probe.response.programme_details;
  if (!school || !programme || school.itemid !== Number(probe.request.institution) || programme.itemid !== Number(probe.request.select_programme) ||
      school.itemid !== probe.institutionId || programme.itemid !== probe.programmeId || programmeKey(programme.title) !== programmeKey(probe.programme)) throw new Error('Checker observation identity mismatch');
  const key = `${school.itemid}:${programme.itemid}`;
  grouped.set(key, [...(grouped.get(key) ?? []), {probe, index}]);
});
const audit = [], runtime = [];
for (const [id, observations] of grouped) {
  const {probe} = observations[0];
  const institution = snapshot.institutions.find(row=>row.id===schoolMappings.get(probe.institutionId)) ?? null;
  const officialFields = institution ? ['title','school_name','original_daps_name'].flatMap(field=>institution[field]?[institution[field]]:[]) : [];
  if(institution && !officialFields.some(name=>schoolKey(name)===schoolKey(probe.response.institution_details.title))) throw new Error('Checker response school name contradicts the official identity mapping');
  const label = probe.response.programme_details.title;
  const currentProgrammes = checkerCatalogue.institutions.find(row=>row.checkerInstitutionId===probe.institutionId)?.programmes.filter(row=>programmeKey(row.title)===programmeKey(label)) ?? [];
  const selectionConfirmed = currentProgrammes.length===1 && currentProgrammes[0].id===probe.programmeId;
  const rows = institution && selectionConfirmed ? snapshot.records.filter(row => row.institutionId === institution.id && programmeKey(row.programme) === programmeKey(label)) : [];
  const record = {checkerInstitutionId: probe.institutionId, checkerProgrammeId: probe.programmeId,
    catalogueInstitutionId: institution?.id ?? null, programme: label, offeringIds: rows.map(row => row.offeringId).sort((a,b)=>a-b),
    observedAt: observations.map(row=>row.probe.observedAt).sort().at(-1).slice(0,10),
    sourceUrl: 'https://ibass.jamb.gov.ng/eligibility-checker',
    identityStatus: rows.length ? 'exact-programme-and-official-school-name-field' : 'unresolved',
    components: {}};
  for (const kind of ['utme','olevel']) {
    const field = kind === 'utme' ? 'programme_utme_subject_data' : 'programme_utme_requirements_data';
    // The public form displays `alternatives` in a separate table of alternative
    // programmes/institutions. They are recommendations, not subject waivers.
    // Only the selected programme's explicit configuration is interpreted here.
    const interpretations = observations.map(({probe}) => parseCheckerSubjects(probe.response[field], kind, probe.institutionId));
    const rule = interpretations[0];
    const identical = interpretations.every(value => JSON.stringify(value) === JSON.stringify(rule));
    const checks = observations.map(({probe,index}, i) => {
      const result = kind === 'utme' ? probe.response.utme_subjects_result : probe.response.eligibility_result;
      const qualified = kind === 'utme' ? result === 'Qualified' : result === 'Your O Level results match the requirements';
      const disqualified = typeof result === 'string' && /^Disqualified!?$/.test(result);
      const input = kind === 'utme' ? probe.request.utme_subjects : probe.request.olevel_credit;
      const predicted = interpretations[i] ? checkerRuleSatisfied(interpretations[i], input) : null;
      return {probeIndex:index, sourceKey:probe.key, qualified:qualified ? true : disqualified ? false : null,
        predicted, agrees:predicted !== null && (qualified || disqualified) && predicted === qualified};
    });
    const positive = checks.some(check=>check.qualified === true), negative = checks.some(check=>check.qualified === false);
    const ready = !!rule && identical && checks.every(check=>check.agrees) && positive && negative && rows.length > 0;
    record.components[kind] = {rule, status:ready ? 'parity-confirmed' : 'review', checks,
      reasons:[...(!rule ? ['Unsupported, incomplete or categorical configuration'] : []), ...(!identical ? ['Configuration varies across observations'] : []),
        ...(checks.some(check=>check.predicted !== null && !check.agrees) ? ['Observed checker outcome disagrees with parsed configuration'] : []),
        ...(!positive || !negative ? ['Positive and negative official component observations are both required'] : []),
        ...(!rows.length ? ['Exact institution/programme association is unresolved'] : [])]};
  }
  audit.push(record);
  if (Object.values(record.components).some(component=>component.status==='parity-confirmed')) {
    runtime.push({institutionId:record.catalogueInstitutionId, programme:record.programme, offeringIds:record.offeringIds,
      checkerInstitutionId:record.checkerInstitutionId, checkerProgrammeId:record.checkerProgrammeId,
      observedAt:record.observedAt, sourceUrl:record.sourceUrl,
      utme:record.components.utme.status==='parity-confirmed' ? record.components.utme.rule : null,
      olevel:record.components.olevel.status==='parity-confirmed' ? record.components.olevel.rule : null,
      screening:record.catalogueInstitutionId===494 ? {minimumUtmeScore:screeningBaseline.minimumUtmeScore,
        maximumSittings:screeningBaseline.maximumSittings,firstChoiceRequired:screeningBaseline.firstChoiceRequired,
        sourceUrl:screeningBaseline.sourceUrl,session:screeningBaseline.session,observedAt:screeningBaseline.observedAt.slice(0,10)} : null});
  }
}
const summary = {checkerProgrammeConfigurations:audit.length, runtimeRecords:runtime.length,
  utmeComponents:runtime.filter(row=>row.utme).length, olevelComponents:runtime.filter(row=>row.olevel).length,
  bothComponents:runtime.filter(row=>row.utme&&row.olevel).length,
  verifiedBasicCheckRecords:runtime.filter(row=>row.utme&&row.olevel&&row.screening).length,
  fullEligibilityPromotions:0};
const digest = crypto.createHash('sha256').update(raw).digest('hex');
const result = {schemaVersion:1, sourceSha256:digest, catalogueSha256:crypto.createHash('sha256').update(catalogueRaw).digest('hex'), summary, records:audit};
const compact = {schemaVersion:1, sourceSha256:digest, records:runtime.sort((a,b)=>a.institutionId-b.institutionId||a.programme.localeCompare(b.programme))};
const outputs = [[path.join(folder,'checker-subject-reconciliation.json'),result],
  [path.join(root,'lib/admission-matcher/data/checker-subjects-2026-10-04.json'),compact]];
for (const [file, data] of outputs) {
  const content = JSON.stringify(data,null,2)+'\n';
  if (process.argv.includes('--check')) {if(fs.readFileSync(file,'utf8')!==content)throw new Error('Stale checker reconciliation: '+file);}
  else fs.writeFileSync(file,content);
}
console.log(JSON.stringify(summary));
