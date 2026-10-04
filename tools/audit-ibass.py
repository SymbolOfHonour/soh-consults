"""Build reproducible, evidence-first audit snapshots from cached responses.

This is an offline audit, not a production eligibility rule generator. Every
captured row remains review until institutional waivers and exact subject rules
are independently reconciled. Run after capture (or for a progress checkpoint).
"""
import collections
import datetime
import gzip
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'audit/ibass-2026-10-04'


def main():
    institutions = json.loads((OUT / 'institutions.json').read_text())
    pages = collections.defaultdict(dict)
    responses = []
    for file in sorted((OUT / 'raw').glob('*.json')):
        try:
            envelope = json.loads(file.read_text())
        except json.JSONDecodeError:
            # Interrupted legacy files are excluded, never treated as evidence.
            continue
        responses.append(envelope)
        match = re.search(r'/institution/programmes/(\d+)\?page=(\d+)$', envelope['url'])
        if match:
            pages[int(match[1])][int(match[2])] = envelope
    pool = {}

    def evidence(value):
        value = value or ''
        digest = hashlib.sha256(value.encode()).hexdigest()
        pool[digest] = value
        return digest

    records, coverage, problems = [], [], []
    for institution in institutions:
        captured = pages.get(institution['id'], {})
        first = captured.get(1)
        declared = first['response']['data']['total'] if first else None
        page_count = first['response']['data']['last_page'] if first else None
        complete = first is not None and set(captured) == set(range(1, page_count + 1))
        rows = []
        for page, envelope in sorted(captured.items()):
            payload = envelope['response']['data']
            if payload['current_page'] != page or payload['total'] != declared or payload['last_page'] != page_count:
                problems.append({'institutionId': institution['id'], 'reason': 'Upstream pagination changed during capture'})
                complete = False
            for row in payload['data']:
                rows.append(row)
                reasons = ['Institution-specific waiver applicability and structured requirement interpretation await verification.']
                if not row.get('subjects'): reasons.append('Missing UTME subjects')
                if not row.get('utme_requirements'): reasons.append('Missing OLevel evidence')
                if row['institution'] != institution['id']: reasons.append('Conflicting institution identity')
                records.append({
                    'institutionId': institution['id'], 'institutionName': institution['title'],
                    'offeringId': row['id'], 'programmeId': row.get('course'), 'programme': row['title'],
                    'sourceUrl': envelope['url'], 'sourceType': 'institution-catalogue', 'observedAt': envelope['observedAt'],
                    'rawUtme': evidence(row.get('subjects')), 'rawOlevel': evidence(row.get('utme_requirements')),
                    'rawDirectEntry': evidence(row.get('de_requirements')), 'rawWaivers': evidence(row.get('remarks')),
                    'verificationStatus': 'review', 'normalizedRule': None, 'unresolvedReasons': reasons,
                })
        if declared is not None and len(rows) != declared: complete = False
        coverage.append({'institutionId': institution['id'], 'institutionName': institution['title'],
                         'jambProgrammeCount': declared, 'importedProgrammeCount': len(rows), 'complete': complete,
                         'missingPages': [p for p in range(1, (page_count or 0) + 1) if p not in captured]})
    keys = [(r['institutionId'], r['offeringId']) for r in records]
    duplicates = [key for key, count in collections.Counter(keys).items() if count > 1]
    brochures = json.loads((OUT / 'brochure-evidence.json').read_text())
    families = []
    for family in brochures['families']:
        rows = [{'page': page['page'], 'table': ti, 'row': ri, 'cells': cells}
                for page in family['pages'] for ti, table in enumerate(page['tables'])
                for ri, cells in enumerate(table) if any(cells)]
        families.append({'family': family['family'], 'sourceUrl': family.get('sourceUrl'),
                         'pagesCaptured': len(family['pages']), 'rawRowsCaptured': len(rows),
                         'programmeReconciliation': 'review',
                         'unresolvedReason': 'Raw tables captured; programme continuations and institution abbreviations require conservative reconciliation.'})
    summary = {
        'institutionsDiscovered': len(institutions), 'institutionsCompletelyCaptured': sum(c['complete'] for c in coverage),
        'institutionsPartiallyCaptured': sum(c['importedProgrammeCount'] > 0 and not c['complete'] for c in coverage),
        'institutionsWithoutProgrammeCapture': sum(c['jambProgrammeCount'] is None for c in coverage),
        'programmeOccurrencesCaptured': len(records), 'uniqueOfficialProgrammeLabels': len({r['programme'] for r in records}),
        'recordsWithUtmeEvidence': sum(bool(pool[r['rawUtme']].strip()) for r in records),
        'recordsWithOlevelEvidence': sum(bool(pool[r['rawOlevel']].strip()) for r in records),
        'recordsWithDirectEntryEvidence': sum(bool(pool[r['rawDirectEntry']].strip()) for r in records),
        'recordsWithWaiverEvidence': sum(bool(pool[r['rawWaivers']].strip()) for r in records),
        'verified': 0, 'review': len(records), 'duplicateOfferingIds': duplicates, 'paginationConflicts': problems,
        'brochureFamilies': families, 'coverageGate': 'PASS' if all(c['complete'] for c in coverage) and not duplicates and not problems else 'FAIL',
        'brochureReconciliationGate': 'FAIL',
        'releaseGate': 'FAIL', 'releaseBlockers': ['Brochure programme/institution reconciliation incomplete', 'IBASS parity suite not completed'],
    }
    if summary['coverageGate'] == 'FAIL': summary['releaseBlockers'].append('National institution catalogue capture incomplete')
    snapshot = {'provider': 'jamb-ibass', 'schemaVersion': 1, 'generatedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'institutions': institutions, 'records': records, 'evidencePool': pool, 'coverage': coverage, 'summary': summary}
    (OUT / 'coverage-report.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    with gzip.GzipFile(filename=str(OUT / 'evidence-snapshot.json.gz'), mode='wb', mtime=0) as stream:
        stream.write(json.dumps(snapshot, ensure_ascii=False).encode())
    with gzip.GzipFile(filename=str(OUT / 'brochure-evidence.json.gz'), mode='wb', mtime=0) as stream:
        stream.write(json.dumps(brochures, ensure_ascii=False).encode())
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
