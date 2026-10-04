"""Extract every page/table from downloaded official degree brochures.

Run using a Python environment with pdfplumber. Tables are raw evidence;
continuations, abbreviations and aliases are NOT automatically joined.
"""
import datetime
import hashlib
import json
import pathlib
import pdfplumber

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
FAMILIES = {
    'administration2': 'Administration', 'agriculture2': 'Agriculture',
    'arts2': 'Arts/Humanities', 'education2': 'Education',
    'engineering2': 'Engineering/Environmental/Technology', 'law2': 'Law',
    'medical2': 'Medical/Pharmaceutical/Health Sciences', 'sciences2': 'Sciences',
    'social2': 'Social/Management Sciences',
}
families = []
for stem, family in FAMILIES.items():
    files = list((OUT / 'brochures').glob(stem + '.*.pdf'))
    if len(files) != 1:
        families.append({'family': family, 'error': 'Missing or ambiguous PDF', 'pages': []})
        continue
    file = files[0]
    pages = []
    with pdfplumber.open(file) as document:
        for number, page in enumerate(document.pages, 1):
            pages.append({'page': number, 'text': page.extract_text(layout=True), 'tables': page.extract_tables()})
    record = {'family': family, 'sourceUrl': 'https://ibass.jamb.gov.ng/static/media/' + file.name,
              'sourceType': 'official-brochure', 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'error': None, 'pages': pages}
    families.append(record)
    print(family, len(pages), 'pages captured', flush=True)
    (OUT / 'brochure-evidence.json').write_text(json.dumps({'schemaVersion': 1, 'families': families}, ensure_ascii=False))
if any(family['error'] for family in families):
    raise SystemExit('Brochure family coverage failed')
