"""Offline, resumable official IBASS capture; never imported by public runtime.

Run with Python 3. Uses only the standard library. Cached response envelopes keep
URL, request, observation time and raw response. No candidate data is submitted.
"""
import concurrent.futures
import datetime
import fcntl
import hashlib
import json
import pathlib
import threading
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'audit/ibass-2026-10-04'
BASE = 'https://ibass-api.jamb.gov.ng/api'
OUT.mkdir(parents=True, exist_ok=True)
STOP = threading.Event()
REQUEST_LOCK = threading.Lock()
LAST_REQUEST = 0.0


class RateLimited(Exception):
    pass


def capture(path, body=None):
    global LAST_REQUEST
    url = BASE + path
    key = hashlib.sha256((url + json.dumps(body, sort_keys=True)).encode()).hexdigest()
    file = OUT / 'raw' / (key + '.json')
    if file.exists():
        try:
            return json.loads(file.read_text())['response']
        except json.JSONDecodeError:
            # An interrupted old capture is not valid evidence.
            file.rename(file.with_suffix('.incomplete'))
    if STOP.is_set():
        raise RateLimited('Not attempted: upstream rate limit paused capture')
    # Respect a conservative global request interval across all workers.
    with REQUEST_LOCK:
        remaining = 2.0 - (time.monotonic() - LAST_REQUEST)
        if remaining > 0:
            time.sleep(remaining)
        if STOP.is_set():
            raise RateLimited('Not attempted: upstream rate limit paused capture')
        LAST_REQUEST = time.monotonic()
    request = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(),
                                     headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            data = json.load(response)
    except urllib.error.HTTPError as error:
        if error.code == 429:
            STOP.set()
            (OUT / 'rate-limit.json').write_text(json.dumps({
                'url': url, 'status': 429, 'retryAfter': error.headers.get('Retry-After'),
                'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                'action': 'Capture halted; no rate-limit bypass or immediate retry.'}))
            raise RateLimited('HTTP 429: upstream rate limit halted capture') from error
        raise
    if data.get('status') is not True:
        raise ValueError('Upstream unsuccessful response: ' + url)
    file.parent.mkdir(exist_ok=True)
    temporary = file.with_suffix('.pending')
    temporary.write_text(json.dumps({'url': url, 'request': body, 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                                     'response': data}, ensure_ascii=False))
    temporary.replace(file)
    return data


def pages(path, body):
    first = capture(path + '?page=1', body)['data']
    rows = list(first['data'])
    for page in range(2, first['last_page'] + 1):
        item = capture(path + '?page=' + str(page), body)['data']
        if item['current_page'] != page:
            raise ValueError('Pagination mismatch')
        rows.extend(item['data'])
    if len(rows) != first['total']:
        raise ValueError('Pagination total mismatch')
    return rows


def institution(item):
    try:
        programmes = pages('/ibass/institution/programmes/' + str(item['id']), {'course_search': ''})
        print('Captured', item['id'], len(programmes), flush=True)
        return {'institution': item, 'programmes': programmes, 'error': None}
    except Exception as error:
        print('FAILED', item['id'], str(error), flush=True)
        return {'institution': item, 'programmes': [], 'error': str(error)}


def main():
    types = capture('/inst-type')['data']
    degree = [item for item in types if item['title'] == 'DEGREE AWARDING INSTITUTIONS']
    if len(degree) != 1:
        raise ValueError('Degree type is ambiguous')
    institutions = pages('/ibass/institutions', {'inst_type': degree[0]['id'], 'inst_category': None, 'inst_search': ''})
    if len({item['id'] for item in institutions}) != len(institutions):
        raise ValueError('Duplicate institution IDs')
    (OUT / 'institutions.json').write_text(json.dumps(institutions, ensure_ascii=False))
    print('Discovered degree institutions:', len(institutions), flush=True)
    results = []
    # Four bounded workers. A 429 halts fresh network requests globally.
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(institution, institutions):
            results.append(result)
            (OUT / 'catalogue.json').write_text(json.dumps(results, ensure_ascii=False))
    print('Capture complete:', len(results), flush=True)


if __name__ == '__main__':
    with (OUT / 'capture.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit('Another IBASS capture is already active; refusing overlapping requests.')
        main()
