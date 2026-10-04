"""Compile a compact review-only catalogue after exhaustive capture validation.

This does not infer requirements, aliases, subject categories or cutoffs.
Every source offering is retained in the audit mapping, including duplicates
collapsed solely for identical institution/title presentation.
"""
import collections
import gzip
import json
import pathlib
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
with gzip.open(OUT / 'evidence-snapshot.json.gz', 'rt') as stream:
    snapshot = json.load(stream)
if snapshot['summary']['coverageGate'] != 'PASS':
    raise SystemExit('National catalogue capture is incomplete. Runtime generation refused.')
institutions = snapshot['institutions']
ids = [item['id'] for item in institutions]
if len(ids) != len(set(ids)) or any(not isinstance(i, int) or i <= 0 for i in ids):
    raise SystemExit('Invalid or duplicate institution IDs')
labels, rows, offerings = {}, collections.defaultdict(list), set()
exceptions = []
for record in snapshot['records']:
    label = ' '.join(record['programme'].split())
    if record['institutionId'] not in ids or record['offeringId'] in offerings:
        raise SystemExit('Blank programme, orphan or duplicate offering ID')
    offerings.add(record['offeringId'])
    source = urllib.parse.urlparse(record['sourceUrl'])
    if source.scheme != 'https' or source.hostname != 'ibass-api.jamb.gov.ng':
        raise SystemExit('Non-JAMB source in captured catalogue')
    if record['verificationStatus'] != 'review' or record['normalizedRule'] is not None:
        raise SystemExit('Audit importer must not silently promote raw evidence')
    for field in ['rawUtme', 'rawOlevel', 'rawDirectEntry', 'rawWaivers']:
        if record[field] not in snapshot['evidencePool']:
            raise SystemExit('Orphan raw evidence reference')
    if not label:
        exceptions.append({'institutionId': record['institutionId'], 'offeringId': record['offeringId'], 'programmeId': record['programmeId'], 'reason': 'Official catalogue returned a blank title; no programme name inferred.', 'sourceUrl': record['sourceUrl']})
        continue
    key = label.upper()
    if key not in labels: labels[key] = len(labels)
    rows[(record['institutionId'], labels[key])].append(record['offeringId'])
programme_names = [''] * len(labels)
for label, index in labels.items(): programme_names[index] = label
compact = {'schemaVersion': 1, 'provider': 'jamb-ibass', 'observedAt': '2026-10-04',
           'institutions': [{'id': i['id'], 'name': i['title'], 'abbreviation': i.get('abbreviation'),
                             'state': i.get('state'), 'ownership': i.get('ownership')} for i in institutions],
           'unresolvedOfferings': exceptions, 'programmes': programme_names, 'pairs': [[institution, programme, offering_ids]
                                                   for (institution, programme), offering_ids in sorted(rows.items())],
           'stats': {'institutions': len(institutions), 'programmeLabels': len(labels),
                     'sourceOfferings': len(offerings), 'unnamedOfferingExceptions': len(exceptions), 'presentationPairs': len(rows), 'verifiedNewRecords': 0}}
if sum(len(row[2]) for row in compact['pairs']) + len(exceptions) != len(snapshot['records']):
    raise SystemExit('An upstream offering disappeared from runtime reconciliation')
target = ROOT / 'lib/admission-matcher/data/national-catalogue-2026-10-04.json'
target.write_text(json.dumps(compact, separators=(',', ':'), ensure_ascii=False))
print(json.dumps(compact['stats'], indent=2))
