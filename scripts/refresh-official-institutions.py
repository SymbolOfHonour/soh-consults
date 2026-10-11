#!/usr/bin/env python3
"""Regulator-only institution snapshot builder. Never marks national coverage complete."""
import datetime
import html
import json
import pathlib
import re
import sys
import urllib.request
from html.parser import HTMLParser

SOURCES = [
    ("NUC", "https://enuc.nuc.edu.ng/nus"),
    ("NCCE", "https://www.ncce.gov.ng/AccreditedColleges"),
]
class Tables(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables, self.table, self.row, self.cell = [], None, None, None
        self.depth = 0
    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.depth += 1
            if self.depth == 1: self.table = []
        elif self.depth and tag == "tr": self.row = []
        elif self.depth and tag in ("td", "th") and self.row is not None: self.cell = []
    def handle_data(self, data):
        if self.cell is not None: self.cell.append(data)
    def handle_endtag(self, tag):
        if self.depth and tag in ("td", "th") and self.cell is not None:
            self.row.append(" ".join(" ".join(self.cell).split()))
            self.cell = None
        elif self.depth and tag == "tr" and self.row is not None:
            if self.row: self.table.append(self.row)
            self.row = None
        elif tag == "table" and self.depth:
            self.depth -= 1
            if self.depth == 0: self.tables.append(self.table); self.table = None

def read(url):
    request = urllib.request.Request(url, headers={"User-Agent": "SOHConsults-DirectoryAudit/1.0", "Accept": "text/html"})
    with urllib.request.urlopen(request, timeout=25) as response:
        if response.status != 200: raise ValueError("Non-200 regulator response")
        raw = response.read(6_000_001)
        if len(raw) > 6_000_000: raise ValueError("Regulator response too large")
        return raw.decode("utf-8", "replace")

def parse_regulator(authority, url):
    tables = Tables()
    tables.feed(read(url))
    result = []
    for table in tables.tables:
        for row in table:
            if len(row) < 2 or not re.fullmatch(r"\\d+\\.?", row[0].strip()): continue
            if authority == "NUC":
                # NUC official university table: number, name, year, ownership, state
                if len(row) < 4 or row[3].strip().lower() not in ("federal", "state", "private"): continue
                name, category = row[1].strip(), "College of Education".title() + " University"
            else:
                # NCCE official table: number, name, provost, ownership, state
                if len(row) < 2 or "college" not in row[1].lower(): continue
                name, category = row[1].strip(), row[3].strip()
            if len(name) < 6 or len(name) > 220: continue
            result.append({"name": name, "category": category, "source": url, "status": "verified"})
    if not result: raise ValueError(authority + " returned no recognisable institution rows")
    return result

def main():
    target = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "data/official-institutions.json")
    existing = json.loads(target.read_text(encoding="utf-8"))
    verified = {}
    errors = []
    for authority, url in SOURCES:
        try:
            records = parse_regulator(authority, url)
            print(authority, "parsed:", len(records))
            for record in records:
                key = re.sub(r"\\s+", " ", record["name"].casefold().strip())
                verified.setdefault(key, record)
        except Exception as exc:
            errors.append(authority + ": " + str(exc))
    # Keep the last verified snapshot if one regulator fails. Do not silently
    # replace it with an empty or partial new scrape.
    if errors: raise RuntimeError("Refusing incomplete refresh: " + "; ".join(errors))
    if len(verified) < 100: raise RuntimeError("Refusing implausibly small regulator inventory")
    output = {"schemaVersion": 1, "verifiedAt": datetime.date.today().isoformat(),
              "coverage": "partial", "sources": existing["sources"],
              "institutions": sorted(verified.values(), key=lambda x: x["name"].casefold())}
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Snapshot generated:", len(output["institutions"]), "records; national coverage NOT claimed.")

if __name__ == "__main__":
    main()
