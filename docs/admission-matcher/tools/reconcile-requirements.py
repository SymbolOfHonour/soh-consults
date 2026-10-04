"""Reconcile all captured offerings without inventing eligibility rules.

Input is the immutable, hash-addressed official snapshot. Output records exact
missing evidence, prose interpretation limits and duplicate source differences.
A clean wording capture is NOT proof that waivers, screening or parity passed.
Run with --check in CI to detect stale or hand-edited generated outputs.
"""
import argparse
import collections
import gzip
import hashlib
import json
import io
import pathlib
import re
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[3]
AUDIT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
SOURCE = AUDIT / 'evidence-snapshot.json.gz'
FIELDS = ('rawUtme', 'rawOlevel', 'rawDirectEntry', 'rawWaivers')
# Codes describe observations, not verified rules or an inferred waiver scope.
MESSAGES = {
    'missing-utme': 'No readable UTME requirement was captured for at least one source offering.',
    'missing-olevel': "No readable O'Level requirement was captured for at least one source offering.",
    'missing-waivers': 'Special-consideration evidence was not captured for at least one offering; absence does not prove there are no exceptions.',
    'subject-categories': 'The source uses broad subject categories whose accepted members still need official verification.',
    'wording-review': 'The captured subject wording has not yet been converted into a verified eligibility rule.',
    'waiver-review': 'Captured special considerations still need institution-specific applicability review.',
    'source-differences': 'Duplicate listings for this institution and programme contain different requirement evidence; no version has been chosen automatically.',
    'text-encoding': 'Captured requirement text contains apparent encoding damage that needs source comparison.',
    'blank-programme': 'The official offering has no programme title; no name has been inferred.',
    'screening-review': 'Current institutional screening conditions and official eligibility parity remain unverified.',
}
CATEGORY = re.compile(r'\b(?:social\s+sciences?|science|arts?|commercial|relevant|related)\s+subjects?\b', re.I)

class EvidenceText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'xml'):
            self.hidden.append(tag)
        if tag in ('p', 'div', 'br', 'tr', 'td', 'li') and not self.hidden:
            self.parts.append(' ')
    def handle_endtag(self, tag):
        if self.hidden and tag == self.hidden[-1]:
            self.hidden.pop()
        if tag in ('p', 'div', 'tr', 'td', 'li') and not self.hidden:
            self.parts.append(' ')
    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)

def text(raw):
    parser = EvidenceText()
    parser.feed(raw)
    parser.close()
    return ' '.join(''.join(parser.parts).split())

def programme_key(value):
    return ' '.join(value.upper().split())

def reconcile(snapshot, source_digest):
    pool = snapshot['evidencePool']
    for digest, raw in pool.items():
        if not isinstance(raw, str) or hashlib.sha256(raw.encode()).hexdigest() != digest:
            raise ValueError('Raw evidence checksum mismatch')
    clean = {digest: text(raw) for digest, raw in pool.items()}
    institutions = {item['id'] for item in snapshot['institutions']}
    if len(institutions) != len(snapshot['institutions']):
        raise ValueError('Duplicate institution identity')
    records = snapshot['records']
    if snapshot['summary']['coverageGate'] != 'PASS':
        raise ValueError('Incomplete catalogue capture')
    offerings, groups = set(), collections.defaultdict(list)
    for row in records:
        if row['offeringId'] in offerings or row['institutionId'] not in institutions:
            raise ValueError('Duplicate offering or orphan institution')
        if any(row[field] not in pool for field in FIELDS):
            raise ValueError('Missing evidence reference')
        offerings.add(row['offeringId'])
        groups[(row['institutionId'], programme_key(row['programme']))].append(row)
    # Whitespace/HTML-only differences are not reported as wording conflicts.
    differing = {key for key, rows in groups.items() if len({tuple(clean[row[field]] for field in FIELDS) for row in rows}) > 1}
    result, counts = [], collections.Counter()
    for row in sorted(records, key=lambda item: item['offeringId']):
        wording = {field: clean[row[field]] for field in FIELDS}
        blockers = []
        if not wording['rawUtme']: blockers.append('missing-utme')
        if not wording['rawOlevel']: blockers.append('missing-olevel')
        if not wording['rawWaivers']: blockers.append('missing-waivers')
        if CATEGORY.search(wording['rawUtme'] + ' ' + wording['rawOlevel']): blockers.append('subject-categories')
        if wording['rawUtme'] or wording['rawOlevel']: blockers.append('wording-review')
        if wording['rawWaivers']: blockers.append('waiver-review')
        if (row['institutionId'], programme_key(row['programme'])) in differing: blockers.append('source-differences')
        if any(marker in value for value in wording.values() for marker in ('\ufffd', 'ï¿½', 'â€', 'Ã')): blockers.append('text-encoding')
        if not programme_key(row['programme']): blockers.append('blank-programme')
        blockers.append('screening-review')
        counts.update(blockers)
        result.append({'offeringId': row['offeringId'], 'institutionId': row['institutionId'],
                       'programmeId': row['programmeId'], 'programme': row['programme'],
                       'sourceUrl': row['sourceUrl'], 'observedAt': row['observedAt'],
                       'evidenceRefs': {field: row[field] for field in FIELDS},
                       'blockers': blockers, 'verificationStatus': 'review'})
    summary = {'sourceSnapshotSha256': source_digest, 'offeringsAudited': len(result),
               'institutionsAudited': len(institutions), 'presentationPairsAudited': len(groups),
               'namedPresentationPairsAudited': sum(bool(key[1]) for key in groups),
               'pairsWithDifferentRequirementText': len(differing),
               'duplicatePresentationPairs': sum(len(rows) > 1 for rows in groups.values()),
               'blockerCounts': dict(sorted(counts.items())), 'verifiedNewRecords': 0,
               'nationalEligibilityVerification': 'INCOMPLETE'}
    manifest = {'schemaVersion': 1, 'provider': 'jamb-ibass', 'sourceSnapshotSha256': source_digest,
                'messages': MESSAGES, 'records': result, 'summary': summary}
    compact = {'schemaVersion': 1, 'sourceSnapshotSha256': source_digest,
               'messages': MESSAGES, 'codes': list(MESSAGES),
               'offerings': [[row['offeringId'], sum(1 << list(MESSAGES).index(code) for code in row['blockers'])] for row in result]}
    return manifest, compact, summary

def serialize(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode()

def deterministic_gzip(content):
    output = io.BytesIO()
    with gzip.GzipFile(filename='', fileobj=output, mode='wb', mtime=0) as stream:
        stream.write(content)
    return output.getvalue()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source_bytes = SOURCE.read_bytes()
    snapshot = json.loads(gzip.decompress(source_bytes))
    manifest, compact, summary = reconcile(snapshot, hashlib.sha256(source_bytes).hexdigest())
    outputs = {
        AUDIT / 'requirement-reconciliation.json.gz': deterministic_gzip(serialize(manifest)),
        AUDIT / 'requirement-reconciliation-summary.json': (json.dumps(summary, indent=2, sort_keys=True) + '\n').encode(),
        ROOT / 'lib/admission-matcher/data/national-review-2026-10-04.json': serialize(compact),
    }
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_bytes() != content:
                raise SystemExit('Stale reconciliation output: ' + str(path.relative_to(ROOT)))
        else:
            path.write_bytes(content)
    print(json.dumps(summary, indent=2))

if __name__ == '__main__':
    main()
