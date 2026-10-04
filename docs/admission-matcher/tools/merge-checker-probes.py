"""Append completed synthetic checker captures, preserving failures in audit files."""
import gzip
import json
import sys
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'audit/ibass-2026-10-04'
source_path = folder / 'parity-probes.json.gz'
source = json.loads(gzip.decompress(source_path.read_bytes()))
keys = {row['key'] for row in source['probes']}
for argument in sys.argv[1:]:
    path = Path(argument)
    captured = json.loads(path.read_text())
    if captured.get('sourceType') != 'eligibility-checker':
        raise ValueError('Unexpected capture source')
    label = path.parent.name.replace('-capture', '')
    audit = folder / (label + '-probes.json.gz')
    audit.write_bytes(gzip.compress(json.dumps(captured, sort_keys=True, separators=(',', ':')).encode(), mtime=0))
    for row in captured['probes']:
        if row.get('error') or not row.get('response') or row['response'].get('status') is not True:
            continue
        if row['key'] not in keys:
            source['probes'].append(row)
            keys.add(row['key'])
source_path.write_bytes(gzip.compress(json.dumps(source, sort_keys=True, separators=(',', ':')).encode(), mtime=0))
print(json.dumps({'savedSuccessfulObservations': len(source['probes'])}))
