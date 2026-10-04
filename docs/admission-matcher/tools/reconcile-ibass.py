"""Account for every brochure row using exact labels/abbreviations only.

Unknown labels, continuations, missing offerings and ambiguous institutions are
explicit exceptions with full source cells. They never become runtime rules.
"""
import collections
import gzip
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
key = lambda value: ' '.join(value.upper().split())
with gzip.open(OUT / 'evidence-snapshot.json.gz', 'rt') as stream:
    snapshot = json.load(stream)
with gzip.open(OUT / 'brochure-evidence.json.gz', 'rt') as stream:
    brochures = json.load(stream)
labels = {key(record['programme']) for record in snapshot['records']}
pairs = {(record['institutionId'], key(record['programme'])) for record in snapshot['records']}
abbreviations = collections.defaultdict(list)
for institution in snapshot['institutions']:
    if institution.get('abbreviation'):
        abbreviations[key(institution['abbreviation'])].append(institution['id'])
families, exceptions, claims = [], [], []
index_evidence = json.loads((OUT / 'brochure-reconciliation.json').read_text())
index_by_family = {family['family']: family['indexEntries'] for family in index_evidence['families']}
for family in brochures['families']:
    current_label = None
    rows_accounted, labels_found, linked_pairs = 0, set(), set()
    for page in family['pages']:
        for ti, table in enumerate(page['tables']):
            for ri, cells in enumerate(table):
                if not any(cells): continue
                locator = f"{family['family']}:page-{page['page']}:table-{ti}:row-{ri}"
                rows_accounted += 1
                lines = (cells[0] or '').splitlines()
                prefix, label = [], None
                for line in lines:
                    if key(line) in abbreviations: break
                    prefix.append(line)
                full_label = key(' '.join(prefix))
                if full_label in labels and full_label:
                    label = full_label
                if label:
                    current_label = label; labels_found.add(label)
                elif any('REQUIREMENTS' in (cell or '').upper() for cell in cells):
                    current_label = None
                row_links, reasons = [], []
                if current_label:
                    for line in lines:
                        ids = abbreviations.get(key(line), [])
                        if len(ids) > 1: reasons.append('Ambiguous official institution abbreviation: ' + line)
                        elif len(ids) == 1:
                            pair = (ids[0], current_label)
                            if pair in pairs:
                                row_links.append(pair); linked_pairs.add(pair)
                            else: reasons.append('Brochure offering absent from captured catalogue: ' + str(pair))
                if row_links:
                    claims.append({'locator': locator, 'programme': current_label, 'pairs': row_links,
                                   'verificationStatus': 'review', 'sourceUrl': family['sourceUrl'],
                                   'rawCells': cells, 'reason': 'Exact full label/abbreviation association is evidence only; all waiver and requirement interpretations remain under review.'})
                else:
                    reasons.append('Exact programme/institution association unresolved; no fuzzy join or offering was invented.')
                if reasons:
                    exceptions.append({'locator': locator, 'sourceUrl': family['sourceUrl'], 'rawCells': cells,
                                       'verificationStatus': 'review', 'reasons': reasons})
    families.append({'family': family['family'], 'pages': len(family['pages']), 'rowsAccounted': rows_accounted,
                     'indexCandidates': index_by_family[family['family']], 'exactCatalogueProgrammeLabelsFound': sorted(labels_found), 'exactCataloguePairsLinked': len(linked_pairs)})
result = {'schemaVersion': 1, 'families': families, 'claims': claims, 'exceptions': exceptions,
          'rawRowAccountingGate': 'PASS' if len(families) == 9 and all(f['rowsAccounted'] > 0 for f in families) else 'FAIL',
          'semanticProgrammeReconciliationGate': 'REVIEW',
          'coverageReconciliationGate': 'PASS' if len(families) == 9 and all(f['rowsAccounted'] > 0 and f['indexCandidates'] for f in families) and sum(f['rowsAccounted'] for f in families) == len({x['locator'] for x in claims + exceptions}) else 'FAIL',
          'reason': 'Every nonempty brochure table row and every index candidate is retained as linked evidence or an explicit review exception. Raw text from every page remains in brochure-evidence.json.gz. Ambiguous continuations, labels, institution mappings and requirement interpretations are not represented as verified facts.'}
with gzip.GzipFile(filename=str(OUT / 'brochure-reconciliation.json.gz'), mode='wb', mtime=0) as stream:
    stream.write(json.dumps(result, ensure_ascii=False).encode())
print(json.dumps({'families': families, 'claims': len(claims), 'exceptions': len(exceptions), 'semanticGate': 'FAIL'}, indent=2))
