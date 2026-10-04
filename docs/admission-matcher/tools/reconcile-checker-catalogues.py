"""Reconcile the fresh public checker catalogue against all captured schools.

Names may differ only in punctuation/whitespace, with identical ordered words
and unique identities on both sides. Previous names are used only when the
official catalogue explicitly attaches them in its original_daps_name field.
No abbreviation expansion or programme aliases are invented.
"""
import argparse
import collections
import gzip
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'


def pack(value):
    return gzip.compress(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode(), mtime=0)


def reconcile(source, snapshot, identity, source_digest):
    names = {int(row['checkerId']): row['officialName'] for row in identity['exactMappings']}
    names.update({int(row['id']): row['name'] for row in identity['unresolved']})
    rows = source['institutions']
    if source.get('schemaVersion') != 1 or source.get('expectedCheckerInstitutions') != len(names) or len(rows) != len(names) or {row['checkerInstitutionId'] for row in rows} != set(names):
        raise ValueError('Incomplete or duplicate checker institution capture')
    school_key = lambda value: ' '.join(re.findall(r'[a-z0-9]+', value.lower()))
    programme_key = lambda value: ' '.join(value.upper().split())
    catalogue_names, checker_names = collections.defaultdict(dict), collections.defaultdict(list)
    name_fields = collections.defaultdict(list)
    for school in snapshot['institutions']:
        for field in ['title', 'school_name', 'original_daps_name']:
            if school.get(field):
                name = school_key(school[field])
                catalogue_names[name][school['id']] = school
                name_fields[(school['id'], name)].append({'field': field, 'officialValue': school[field]})
    for row in rows:
        if row.get('error') or row.get('sourceUrl') != 'https://ibass-api.jamb.gov.ng/api/ibass/eligibility-checker/' + str(row['checkerInstitutionId']) or not re.match(r'^\d{4}-\d{2}-\d{2}T', row.get('observedAt', '')):
            raise ValueError('Unsuccessful or malformed checker source')
        programmes = row['programmes']
        if any(not isinstance(item['id'], int) or item['id'] < 1 or not isinstance(item['title'], str) or not item['title'].strip() for item in programmes) or len({item['id'] for item in programmes}) != len(programmes):
            raise ValueError('Invalid or duplicate checker programme identifier')
        checker_names[school_key(names[row['checkerInstitutionId']])].append(row)
    by_school, mappings, unresolved = {}, [], []
    candidates_by_school = collections.defaultdict(list)
    for row in rows:
        matches = list(catalogue_names[school_key(names[row['checkerInstitutionId']])].values())
        if len(matches) == 1:
            candidates_by_school[matches[0]['id']].append(row['checkerInstitutionId'])
    for row in sorted(rows, key=lambda item: item['checkerInstitutionId']):
        name = names[row['checkerInstitutionId']]
        matches = list(catalogue_names[school_key(name)].values())
        if len(matches) != 1 or len(checker_names[school_key(name)]) != 1 or len(candidates_by_school[matches[0]['id']]) != 1:
            unresolved.append({'checkerInstitutionId': row['checkerInstitutionId'], 'name': name,
                               'reason': 'No unique exact ordered-name match; no identity was guessed'})
            continue
        school = matches[0]
        by_school[school['id']] = row
        mappings.append({'checkerInstitutionId': row['checkerInstitutionId'], 'catalogueInstitutionId': school['id'],
                         'checkerName': name, 'catalogueName': school['title'],
                         'method': 'official-name-field-with-identical-ordered-words',
                         'nameEvidence': name_fields[(school['id'], school_key(name))]})
    offerings = collections.defaultdict(list)
    totals = collections.Counter()
    for record in sorted(snapshot['records'], key=lambda item: item['offeringId']):
        row = by_school.get(record['institutionId'])
        matches = [item['id'] for item in row['programmes'] if programme_key(item['title']) == programme_key(record['programme'])] if row else []
        state = 'exact-programme-listed' if len(matches) == 1 else 'ambiguous-programme-title' if matches else 'not-in-checker-snapshot' if row else 'checker-identity-unresolved'
        totals[state] += 1
        offerings[record['institutionId']].append({'offeringId': record['offeringId'], 'programme': record['programme'],
            'checkerProgrammeIds': matches, 'status': state, 'verificationStatus': 'review'})
    schools = []
    for school in sorted(snapshot['institutions'], key=lambda item: item['id']):
        row = by_school.get(school['id'])
        schools.append({'institutionId': school['id'], 'name': school['title'], 'checkerInstitutionId': row['checkerInstitutionId'] if row else None,
            'sourceUrl': row['sourceUrl'] if row else None, 'observedAt': row['observedAt'] if row else None,
            'offerings': offerings[school['id']]})
    summary = {'catalogueSchoolsAudited': len(schools), 'sourceOfferingsAudited': len(snapshot['records']),
               'checkerInstitutionsCaptured': len(rows), 'checkerProgrammesCaptured': sum(len(row['programmes']) for row in rows),
               'mappedInstitutions': len(mappings), 'unresolvedCheckerIdentities': len(unresolved),
               'catalogueInstitutionsWithoutCheckerIdentity': len(schools) - len(mappings),
               'offeringStates': dict(sorted(totals.items())), 'fullEligibilityPromotions': 0}
    return {'schemaVersion': 1, 'sourceSha256': source_digest,
            'scope': 'Programme availability evidence only; missing entries and identity gaps are not ineligibility decisions',
            'mappings': mappings, 'unresolvedCheckerIdentities': unresolved, 'institutions': schools, 'summary': summary}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=pathlib.Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    target = OUT / 'checker-catalogue-2026-10-04.json.gz'
    if args.source:
        if args.check:
            raise ValueError('--source cannot be combined with --check')
        target.write_bytes(pack(json.loads(args.source.read_text())))
    raw = target.read_bytes()
    source = json.loads(gzip.decompress(raw))
    snapshot = json.loads(gzip.decompress((OUT / 'evidence-snapshot.json.gz').read_bytes()))
    identity = json.loads((OUT / 'checker-identity-reconciliation.json').read_text())
    result = reconcile(source, snapshot, identity, hashlib.sha256(raw).hexdigest())
    outputs = {'checker-catalogue-reconciliation.json.gz': pack(result),
               'checker-catalogue-reconciliation-summary.json': json.dumps(result['summary'], indent=2, sort_keys=True).encode() + b'\n'}
    for name, content in outputs.items():
        file = OUT / name
        if args.check:
            if file.read_bytes() != content:
                raise ValueError('Stale checker reconciliation: ' + name)
        else:
            file.write_bytes(content)
    print(json.dumps(result['summary'], indent=2))


if __name__ == '__main__':
    main()
