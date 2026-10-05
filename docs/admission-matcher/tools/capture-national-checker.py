"""Resumable national checker evidence capture; never called by public pages.

Only the public endpoints used by the IBASS form are requested. The existing
identity audit supplies checker IDs; brochure IDs are never substituted for
them. Workers share a request interval (two seconds by default) and stop on HTTP 429.
Each response is atomically checkpointed, including source and observation time.
"""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import threading
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[3]
AUDIT = ROOT / 'docs/admission-matcher/audit/ibass-2026-10-04'
BASE = 'https://ibass-api.jamb.gov.ng/api'
STOP = threading.Event()
LOCK = threading.Lock()
LAST = 0.0
INTERVAL = 2.0


def capture(path, body, directory):
    global LAST
    url = BASE + path
    identity = json.dumps([url, body], sort_keys=True, separators=(',', ':'))
    file = directory / (hashlib.sha256(identity.encode()).hexdigest() + '.json')
    if file.exists():
        envelope = json.loads(file.read_text())
        if envelope['url'] != url or envelope['request'] != body:
            raise ValueError('Checkpoint identity mismatch')
        return envelope
    with LOCK:
        delay = INTERVAL - (time.monotonic() - LAST)
        if delay > 0:
            time.sleep(delay)
        if STOP.is_set():
            raise RuntimeError('Capture halted by upstream rate limit')
        LAST = time.monotonic()
    request = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(),
                                     headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code == 429:
            STOP.set()
            (directory / 'rate-limit.json').write_text(json.dumps({
                'url': url, 'status': 429, 'retryAfter': error.headers.get('Retry-After'),
                'action': 'Stopped without bypass or immediate retry'}))
        raise
    if data.get('status') is not True:
        raise ValueError('Unsuccessful official response')
    envelope = {'url': url, 'request': body,
                'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'response': data}
    temporary = file.with_suffix('.pending')
    temporary.write_text(json.dumps(envelope, ensure_ascii=False))
    temporary.replace(file)
    return envelope


def main():
    global INTERVAL
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', required=True, type=pathlib.Path)
    parser.add_argument('--probe-plan', type=pathlib.Path)
    parser.add_argument('--workers', type=int, default=4, choices=range(1, 9))
    parser.add_argument('--request-interval', type=float, default=2.0)
    parser.add_argument('--retry-errors', action='store_true')
    args = parser.parse_args()
    if args.request_interval < 1:
        parser.error('Request interval must be at least one second')
    INTERVAL = args.request_interval
    args.output_dir.mkdir(parents=True, exist_ok=True)
    if args.probe_plan:
        plan = json.loads(args.probe_plan.read_text())
        checkpoint = args.output_dir / 'probes.json'
        previous = {row['key']:row for row in json.loads(checkpoint.read_text())['probes']} if checkpoint.exists() else {}
        def probe(item):
            body = item['request']
            if body['mode_of_entry'] != 'UTME' or len(body['utme_subjects']) != 4 or len(body['olevel_credit']) > 9 or any(body[field] for field in ['olevel_passes', 'alevel_credit', 'alevel_passes']):
                raise ValueError('Only synthetic UTME subject profiles are permitted')
            saved = previous.get(item['key'])
            if saved and saved['request'] == body and saved['institutionId'] == item['institutionId'] and saved['programmeId'] == item['programmeId'] and saved['programme'] == item['programme'] and (not saved.get('error') or not args.retry_errors):
                return saved
            try:
                envelope = capture('/ibass/eligibility-checker/submit', body, args.output_dir)
                result = {**item, 'sourceUrl': envelope['url'], 'observedAt': envelope['observedAt'], 'response': envelope['response'], 'error': None}
            except Exception as error:
                result = {**item, 'sourceUrl': BASE + '/ibass/eligibility-checker/submit', 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'error': str(error)}
            print(item['key'], result['error'] or 'captured', flush=True)
            return result
        results = []
        def save_checkpoint():
            temporary = checkpoint.with_suffix('.pending')
            retained = dict(previous)
            retained.update({row['key']: row for row in results})
            temporary.write_text(json.dumps({'schemaVersion': 1, 'sourceType': 'eligibility-checker', 'probes': list(retained.values())}, ensure_ascii=False))
            temporary.replace(checkpoint)
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
            for result in pool.map(probe, plan['probes']):
                results.append(result)
                # Individual successful responses are already durable in capture().
                # Batch the combined index to avoid rewriting the full national
                # evidence thousands of times; retain completed failures on resume.
                if len(results) % 25 == 0:
                    save_checkpoint()
        save_checkpoint()
        print(json.dumps({'probes': len(results), 'failed': sum(row['error'] is not None for row in results)}), flush=True)
        return
    identity = json.loads((AUDIT / 'checker-identity-reconciliation.json').read_text())
    ids = sorted({int(row['checkerId']) for row in identity['exactMappings']} |
                 {int(row['id']) for row in identity['unresolved']})
    results = []

    def institution(checker_id):
        try:
            envelope = capture('/ibass/eligibility-checker/' + str(checker_id), None, args.output_dir)
            rows = envelope['response']['data']
            if not isinstance(rows, list) or any(not isinstance(row.get('id'), int) or not row.get('title') for row in rows):
                raise ValueError('Malformed programme list')
            if len({row['id'] for row in rows}) != len(rows):
                raise ValueError('Duplicate programme identity')
            result = {'checkerInstitutionId': checker_id, 'programmes': rows,
                      'sourceUrl': envelope['url'], 'observedAt': envelope['observedAt'], 'error': None}
        except Exception as error:
            result = {'checkerInstitutionId': checker_id, 'programmes': [], 'error': str(error)}
        print(checker_id, len(result['programmes']), result['error'] or 'captured', flush=True)
        return result

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for result in pool.map(institution, ids):
            results.append(result)
            file = args.output_dir / 'catalogues.json'
            temporary = file.with_suffix('.pending')
            temporary.write_text(json.dumps({'schemaVersion': 1, 'institutions': results,
                'expectedCheckerInstitutions': len(ids), 'verificationStatus': 'review'}, ensure_ascii=False))
            temporary.replace(file)
    failures = sum(row['error'] is not None for row in results)
    print(json.dumps({'checkerInstitutions': len(results), 'failed': failures,
                      'programmes': sum(len(row['programmes']) for row in results)}), flush=True)
    if failures:
        raise SystemExit('Incomplete capture: unresolved responses retained')


if __name__ == '__main__':
    main()
