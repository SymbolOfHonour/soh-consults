"""Report capture coverage separately from subject parity and admission verification."""
import collections
import gzip
import hashlib
import json
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'audit/ibass-2026-10-04'


def packed(name):
    return json.loads(gzip.decompress((folder / name).read_bytes()))


catalogue = packed('checker-catalogue-reconciliation.json.gz')
raw = (folder / 'parity-probes.json.gz').read_bytes()
source = json.loads(gzip.decompress(raw))
subjects = json.loads((folder / 'checker-subject-reconciliation.json').read_text())
if subjects['sourceSha256'] != hashlib.sha256(raw).hexdigest():
    raise ValueError('Regenerate subject reconciliation before reporting coverage')

exact = {(row['checkerInstitutionId'], offer['checkerProgrammeIds'][0])
         for row in catalogue['institutions'] if row['checkerInstitutionId']
         for offer in row['offerings'] if offer['status'] == 'exact-programme-listed'}
captures = []
attempts = list(source['probes'])
for name in ['national-baseline-probes.json.gz', 'national-followup-probes.json.gz',
             'national-remaining-probes.json.gz', 'national-remaining-followup-probes.json.gz',
             'national-all-pending-probes.json.gz', 'national-all-followup-probes.json.gz']:
    path = folder / name
    if not path.exists():
        continue
    capture = packed(name)
    if capture['sourceType'] != 'eligibility-checker':
        raise ValueError('Unexpected capture source')
    rows = capture['probes']
    attempts.extend(rows)
    captures.append({'file': name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                     'requests': len(rows), 'successfulResponses': sum(not row.get('error') for row in rows),
                     'requestErrors': sum(bool(row.get('error')) for row in rows)})

attempted = {(row['institutionId'], row['programmeId']) for row in attempts
             if row.get('error') != 'Capture halted by upstream rate limit'}
successful = {(row['institutionId'], row['programmeId']) for row in source['probes']}
errors = {}
for row in attempts:
    if not row.get('error'):
        continue
    # Preserve distinct failed request profiles; duplicated capture copies do not
    # inflate the totals, and a later successful baseline is not called missing.
    identity = json.dumps(row['request'], sort_keys=True, separators=(',', ':'))
    previous = errors.get(identity)
    if not previous or row.get('observedAt', '') > previous.get('observedAt', ''):
        errors[identity] = row
missing_responses = exact - successful
unattempted = exact - attempted
failed_rows = sorted(errors.values(), key=lambda row: (row['institutionId'], row['programmeId'], row['key']))
result = {
    'scope': 'All exact selections are accounted for independently of successful responses and verified requirements',
    'catalogueSchools': len(catalogue['institutions']),
    'mappedCheckerSchools': len(catalogue['mappings']),
    'schoolsWithExactSelections': len({school for school, _ in exact}),
    'exactProgrammeSelections': len(exact),
    'exactSelectionsAttempted': len(exact & attempted),
    'unattemptedExactSelections': len(unattempted),
    'exactSelectionsWithSuccessfulResponse': len(exact & successful),
    'exactSelectionsWithoutSuccessfulResponse': len(missing_responses),
    'schoolsWithSuccessfulResponse': len({school for school, _ in exact & successful}),
    'successfulSubjectObservations': len(source['probes']),
    'retainedFailedRequestProfiles': len(errors),
    'errorTypes': dict(sorted(collections.Counter(row['error'] for row in failed_rows).items())),
    'institutionsWithoutExactSelection': len(catalogue['institutions']) - len({school for school, _ in exact}),
    'subjectParity': subjects['summary'],
    'captureCoverage': 'PASS' if not unattempted else 'INCOMPLETE',
    'nationalEligibilityVerification': 'INCOMPLETE',
    'captureFiles': captures,
    'missingResponseSelections': [{'checkerInstitutionId': school, 'checkerProgrammeId': programme}
                                  for school, programme in sorted(missing_responses)],
    'unattemptedSelections': [{'checkerInstitutionId': school, 'checkerProgrammeId': programme}
                             for school, programme in sorted(unattempted)],
    'requestErrors': [{'checkerInstitutionId': row['institutionId'], 'checkerProgrammeId': row['programmeId'],
                      'programme': row['programme'], 'variant': row['variant'], 'error': row['error']}
                     for row in failed_rows],
}
(folder / 'national-checker-progress.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: value for key, value in result.items()
                  if key not in ['captureFiles', 'missingResponseSelections', 'unattemptedSelections', 'requestErrors']}))
