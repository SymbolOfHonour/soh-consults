"""Plan every exact, unambiguous school/programme selection in the national audit."""
import argparse
import gzip
import json
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'audit/ibass-2026-10-04'
parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--one-per-school', action='store_true')
parser.add_argument('--missing-evidence', action='store_true')
args = parser.parse_args()
audit = json.loads(gzip.decompress((folder/'checker-catalogue-reconciliation.json.gz').read_bytes()))
snapshot = json.loads(gzip.decompress((folder/'evidence-snapshot.json.gz').read_bytes()))
existing = json.loads(gzip.decompress((folder/'parity-probes.json.gz').read_bytes()))['probes']
known = {(p['institutionId'],p['programmeId']) for p in existing}
known_schools = {p['institutionId'] for p in existing}
schools = {row['id']:row for row in snapshot['institutions']}
priority = ['NURSING/NURSING SCIENCE','MEDICINE AND SURGERY','COMPUTER SCIENCE','CIVIL ENGINEERING','BIOCHEMISTRY','CHEMISTRY','ACCOUNTING','BUSINESS ADMINISTRATION','LAW']
probes, omitted, seen = [], [], set()
for row in audit['institutions']:
    cid = row.get('checkerInstitutionId')
    if not cid:
        omitted.append({'catalogueInstitutionId':row['institutionId'],'reason':'Checker school identity unresolved'})
        continue
    offerings = [x for x in row['offerings'] if x['status']=='exact-programme-listed']
    if not offerings:
        omitted.append({'catalogueInstitutionId':row['institutionId'],'reason':'No exact unambiguous checker programme selection'})
        continue
    if args.one_per_school:
        if args.missing_evidence and cid in known_schools:
            continue
        offerings = [min(offerings,key=lambda x:(priority.index(x['programme']) if x['programme'] in priority else len(priority),x['programme']))]
    school = schools[row['institutionId']]
    for offer in offerings:
        pid = offer['checkerProgrammeIds'][0]
        if (cid,pid) in seen or (args.missing_evidence and (cid,pid) in known):
            continue
        seen.add((cid,pid))
        probes.append({'key':f'national:{cid}:{pid}:baseline','family':'National institutional component','variant':'baseline','institutionNamespace':'eligibility-checker','institutionId':cid,'programmeId':pid,'programme':offer['programme'],'request':{'mode_of_entry':'UTME','institution':str(cid),'select_programme':str(pid),'institution_category':str(school['inst_category']),'institution_type':str(school['inst_type']),'olevel_credit':['English Language','Mathematics','Physics','Chemistry','Biology','Economics','Government','Literature in English','Geography'],'olevel_passes':[],'alevel_credit':[],'alevel_passes':[],'utme_subjects':['English Language','Mathematics','Physics','Chemistry']}})
args.output.write_text(json.dumps({'schemaVersion':1,'scope':'Exact selections only; not verified requirements','probes':probes,'omittedInstitutions':omitted},sort_keys=True))
print(json.dumps({'probes':len(probes),'institutions':len({p['institutionId'] for p in probes}),'omittedInstitutions':len(omitted)}))
