"""Conservative brochure index extraction and explicit reconciliation exceptions.

Index labels are evidence candidates, never aliases or verified requirements.
Every raw table row receives a source locator, including rows that cannot yet
be split into a programme and institution abbreviations.
"""
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
MARKER = re.compile(r'(?<!\S)(\d{1,3})(?:\.\s*|\s+)(?=\S|$)')
brochures = json.loads((OUT / 'brochure-evidence.json').read_text())
catalogue = json.loads((OUT / 'coverage-report.json').read_text())
key = lambda value: ' '.join(value.upper().split())
labels = set()
for path in (OUT / 'raw').glob('*.json'):
    try:
        response = json.loads(path.read_text())
    except json.JSONDecodeError:
        continue
    if '/institution/programmes/' in response['url']:
        labels.update(key(row['title']) for row in response['response']['data']['data'])
families = []
for family in brochures['families']:
    file = OUT / 'brochures' / family['sourceUrl'].rsplit('/', 1)[1]
    text = subprocess.check_output(['pdftotext', '-f', '1', '-l', '1', '-layout', str(file), '-'], stderr=subprocess.DEVNULL, text=True)
    lines = text.splitlines()
    positions = sorted({match.start() for line in lines for match in MARKER.finditer(line)})
    columns = []
    for position in positions:
        if not columns or position - columns[-1] > 3: columns.append(position)
    entries, active = [], {}
    for number, line in enumerate(lines, 1):
        if 'IMPORTANT NOTE' in line or 'ALL PROGRAMMES' in line: break
        if line.strip().isdigit(): continue
        matches = list(MARKER.finditer(line))
        for ci, start in enumerate(columns):
            end = columns[ci + 1] if ci + 1 < len(columns) else len(line)
            marker = next((match for match in matches if abs(match.start() - start) <= 3), None)
            chunk = line[start:end].strip()
            if marker:
                value = line[marker.end():end].strip()
                item = {'indexNumber': int(marker[1]), 'rawLabel': value, 'line': number, 'column': start,
                        'sourceUrl': family['sourceUrl'], 'page': 1, 'rawIndexLine': line, 'verificationStatus': 'review'}
                entries.append(item); active[ci] = item
            elif chunk and ci in active:
                if chunk.isdigit() or chunk.isupper() or 'COURSES' in chunk:
                    active.pop(ci, None)
                else:
                    active[ci]['rawLabel'] += ' ' + chunk
    for entry in entries:
        entry['exactCatalogueLabelFound'] = key(entry['rawLabel']) in labels
        entry['unresolvedReasons'] = ['Institution-specific programme applicability is not established by a national index label.']
        if not entry['exactCatalogueLabelFound']:
            entry['unresolvedReasons'].append('No exact catalogue label found; no fuzzy alias was inferred.')
    raw_sections = []
    for page in family['pages']:
        for ti, table in enumerate(page['tables']):
            for ri, cells in enumerate(table):
                if ri < 2 or not any(cells): continue
                raw_sections.append({'page': page['page'], 'table': ti, 'row': ri, 'rawProgrammeInstitutionCell': cells[0],
                                     'sourceUrl': family['sourceUrl'], 'verificationStatus': 'review',
                                     'unresolvedReason': 'Programme continuation, institution abbreviation and waiver applicability require reconciliation.'})
    families.append({'family': family['family'], 'indexEntries': entries, 'rawSections': raw_sections})
(OUT / 'brochure-reconciliation.json').write_text(json.dumps({'schemaVersion': 1, 'families': families, 'gate': 'FAIL',
    'reason': 'Explicit unresolved sections are retained; exhaustive programme/institution reconciliation has not passed.'}, indent=2, ensure_ascii=False))
for family in families:
    print(family['family'], 'index labels', len(family['indexEntries']), 'raw sections', len(family['rawSections']))
