"""Bulk, provisional parsing of explicit subjects; never admission decisions.

Only fully consumed, enumerated wording is accepted. Waivers and institutional
conditions remain separate unresolved evidence. Raw hashes are never rewritten.
"""
import argparse
import collections
import gzip
import hashlib
import importlib.util
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
spec = importlib.util.spec_from_file_location('reconcile', pathlib.Path(__file__).with_name('reconcile-requirements.py'))
reconcile = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reconcile)
SUBJECTS = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
            'Agricultural Science', 'Economics', 'Geography', 'Government',
            'History', 'Literature in English', 'French', 'Christian Religious Studies',
            'Islamic Studies', 'Art']
ALIASES = {subject.lower(): subject for subject in SUBJECTS}
ALIASES.update({'maths': 'Mathematics', 'agric science': 'Agricultural Science'})

def subjects(value):
    # Slash alternatives and unknown/category words are deliberately refused.
    tokens = re.split(r'\s*(?:,|\band\b)\s*', value.strip(), flags=re.I)
    tokens = [token.strip() for token in tokens if token.strip()]
    result = [ALIASES.get(token.lower()) for token in tokens]
    return result if result and None not in result and len(result) == len(set(result)) else None

def parse_utme(value):
    value = value.strip().rstrip('.').strip()
    core = subjects(value)
    if core and len(core) == 3 and 'English Language' not in core:
        return {'requiredSubjects': core, 'groups': [], 'electiveCount': 3}
    alternative = re.fullmatch(r'(.+?) and (?:either )?([^,]+?) or ([^,]+)', value, re.I)
    if alternative:
        core = subjects(alternative[1])
        choice = subjects(alternative[2] + ',' + alternative[3])
        if core and len(core) == 2 and choice and len(choice) == 2 and not set(core) & set(choice) and 'English Language' not in core + choice:
            return {'requiredSubjects': core, 'groups': [{'subjects': choice, 'count': 1}], 'electiveCount': 3}
    enumerated = re.fullmatch(r'(.+?) (?:and|plus) (?:any )?(one|two) \(([12])\) (?:other subjects (?:chosen )?from|other subjects from|of) (.+)', value, re.I)
    if enumerated:
        count = int(enumerated[3])
        if enumerated[2].lower() != {1:'one', 2:'two'}[count]: return None
        core, choice = subjects(enumerated[1]), subjects(enumerated[4])
        if core and choice and len(core) + count == 3 and len(choice) >= count and not set(core) & set(choice) and 'English Language' not in core + choice:
            return {'requiredSubjects': core, 'groups': [{'subjects': choice, 'count': count}], 'electiveCount': 3}
    return None

def parse_olevel(value):
    # Exactly five named credits only; passes, alternative certificates,
    # category slots, sitting conditions and trailing clauses are not inferred.
    match = re.fullmatch(r"Five\s*\(5\)\s*(?:SSC|'O'\s*Level) credits?(?: passes)? (?:in|including|to include) (.+?)\.?", value, re.I)
    core = subjects(match[1].rstrip('.').strip()) if match else None
    if core and len(core) == 5:
        return {'requiredSubjects': core, 'groups': [], 'minimumCreditCount': 5}
    return None

def build(snapshot, digest):
    reconcile.reconcile(snapshot, digest)  # validates all identities and hashes
    clean = {key: reconcile.text(value) for key, value in snapshot['evidencePool'].items()}
    sections = {'utme': {}, 'olevel': {}}
    parsers = {'utme': parse_utme, 'olevel': parse_olevel}
    for section, parser in parsers.items():
        field = {'utme':'rawUtme', 'olevel':'rawOlevel'}[section]
        for ref in sorted({row[field] for row in snapshot['records']}):
            rule = parser(clean[ref])
            sections[section][ref] = {'wording': clean[ref] if rule else None, 'provisionalRule': rule,
                                     'status': 'parsed-explicit' if rule else ('missing' if not clean[ref] else 'manual-interpretation')}
    tasks = collections.defaultdict(list)
    totals = collections.Counter()
    for row in sorted(snapshot['records'], key=lambda item: item['offeringId']):
        status = {section: sections[section][row[field]]['status'] for section, field in [('utme','rawUtme'),('olevel','rawOlevel')]}
        totals.update(section + ':' + state for section, state in status.items())
        both = all(state == 'parsed-explicit' for state in status.values())
        totals['both-subject-sections-parsed'] += both
        tasks[row['institutionId']].append({'offeringId': row['offeringId'], 'programme': row['programme'],
          'sourceUrl': row['sourceUrl'], 'evidenceRefs': {field: row[field] for field in reconcile.FIELDS},
          'subjectStatus': status, 'verificationStatus': 'review',
          'remainingChecks': ['waiver-applicability', 'current-screening', 'official-parity'] +
          [section + ':' + state for section, state in status.items() if state != 'parsed-explicit']})
    institutions = [{'institutionId': row['id'], 'institutionName': row['title'],
                     'offerings': tasks[row['id']]} for row in sorted(snapshot['institutions'], key=lambda item: item['id'])]
    return {'schemaVersion': 1, 'sourceSnapshotSha256': digest, 'scope': 'provisional subject interpretation only; not institution-specific eligibility',
            'sections': sections, 'institutions': institutions,
            'summary': {'institutionsProcessed':len(institutions), 'offeringsProcessed':len(snapshot['records']),
                        'sectionCounts': dict(sorted(totals.items())), 'verifiedNewRecords':0,
                        'nationalEligibilityVerification':'INCOMPLETE'}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    raw = (OUT / 'evidence-snapshot.json.gz').read_bytes()
    result = build(json.loads(gzip.decompress(raw)), hashlib.sha256(raw).hexdigest())
    outputs = {'national-subject-proposals.json.gz': reconcile.deterministic_gzip(reconcile.serialize(result)),
               'national-subject-proposals-summary.json': json.dumps(result['summary'], indent=2, sort_keys=True).encode()+b'\n'}
    for name, value in outputs.items():
        file = OUT / name
        if args.check:
            if not file.exists() or file.read_bytes() != value: raise SystemExit('Stale national proposals: '+name)
        else: file.write_bytes(value)
    print(json.dumps(result['summary'], indent=2))

if __name__ == '__main__': main()
