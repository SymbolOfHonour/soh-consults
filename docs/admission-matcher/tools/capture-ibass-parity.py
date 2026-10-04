"""Synthetic, non-personal eligibility probes against the observed official form.

This records outcomes, never turns a successful candidate into a universal rule.
The checkpoint is resumable and stops immediately on an upstream rate limit.
"""
import datetime,json,pathlib,time,urllib.request,urllib.error
ROOT=pathlib.Path(__file__).resolve().parents[3]
OUT=ROOT/'docs/admission-matcher/audit/ibass-2026-10-04'; BASE='https://ibass-api.jamb.gov.ng/api'
FILE=OUT/'parity-probes.json'
results=json.loads(FILE.read_text()) if FILE.exists() else {'schemaVersion':1,'sourceType':'eligibility-checker','probes':[],'catalogues':{}}
def request(path,body=None):
    time.sleep(2)
    req=urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=45) as res:return json.load(res)
def save():FILE.write_text(json.dumps(results,indent=2,ensure_ascii=False))
for institution in [1345,1319,1453]:
    if str(institution) not in results['catalogues']:
        results['catalogues'][str(institution)]=request('/ibass/eligibility-checker/'+str(institution));save()
# Match only literal substrings for choosing test cases, not programme aliases.
specs=[('Administration','ACCOUNTANCY',1345),('Agriculture','AGRICULTURE',1319),('Arts','ENGLISH LANGUAGE',1345),('Education','EDUCATION AND BIOLOGY',1345),('Engineering','CIVIL ENGINEERING',1345),('Environmental','ARCHITECTURE',1345),('Law','LAW',1345),('Sciences','COMPUTER SCIENCE',1345),('Social Sciences','ECONOMICS',1345),('Medicine','MEDICINE',1345),('Nursing','NURSING',1319),('Pharmacy','PHARMACY',1319),('Dentistry','DENTISTRY',1345),('Medical Laboratory Science','MEDICAL LABORATORY',1453),('Physiotherapy','PHYSIOTHERAPY',1319),('Other Medical','RADIOGRAPHY',1345),('Specialist','BIOMEDICAL ENGINEERING',1345)]
science=['Physics','Chemistry','Biology']; commerce=['Mathematics','Economics','Government']; arts=['Literature in English','Government','History']
for family,needle,institution in specs:
    courses=results['catalogues'][str(institution)].get('data',[])
    matches=[c for c in courses if c['title'].upper()==needle] or [c for c in courses if needle in c['title'].upper()]
    if not matches:
        results.setdefault('selectionExceptions',[]).append({'family':family,'institution':institution,'needle':needle,'reason':'No matching official checker programme; no ID invented.'});save();continue
    course=matches[0]
    variants=['baseline','utme-failure','olevel-failure'] if family in ['Administration','Medicine','Nursing','Sciences'] else ['baseline']
    if family in ['Engineering','Environmental']:variants+=['waiver-subject-present']
    if family=='Administration':variants+=['commerce-alternative','civic-category','marketing-category','DE']
    for variant in variants:
        key=f'{family}:{institution}:{course["id"]}:{variant}'
        if any(p['key']==key for p in results['probes']):continue
        subjects=commerce if family in ['Administration','Social Sciences'] else arts if family in ['Arts','Law'] else ['Mathematics','Physics','Chemistry'] if family in ['Engineering','Environmental','Sciences','Specialist'] else science
        credits=['English Language','Mathematics','Physics','Chemistry','Biology','Economics','Government','Financial Accounting','Literature in English','History','Agricultural Science']
        if variant=='waiver-subject-present':credits+=['Further Mathematics','Fine Art','Technical Drawing']
        if variant=='utme-failure':subjects=['Music','French','Home Economics']
        if variant=='olevel-failure':credits=['English Language']
        if variant=='commerce-alternative':subjects=['Mathematics','Economics','Commerce']
        if variant=='civic-category':subjects=['Mathematics','Economics','Civic Education']
        if variant=='marketing-category':subjects=['Mathematics','Economics','Marketing']
        payload={'mode_of_entry':'DE' if variant=='DE' else 'UTME','institution':str(institution),'select_programme':str(course['id']),'institution_category':'17','institution_type':'4','olevel_credit':credits,'olevel_passes':[],'alevel_credit':[],'alevel_passes':[],'utme_subjects':['English Language']+subjects}
        try:response=request('/ibass/eligibility-checker/submit',payload)
        except urllib.error.HTTPError as error:
            if error.code==429:save();raise SystemExit('Official checker rate limit; capture paused without bypass.')
            response={'retrievalError':str(error)}
        results['probes'].append({'key':key,'family':family,'variant':variant,'institutionNamespace':'eligibility-checker','institutionId':institution,'programmeId':course['id'],'programme':course['title'],'sourceUrl':BASE+'/ibass/eligibility-checker/submit','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':payload,'response':response,'interpretation':'Candidate-specific observation only. National import remains review; category membership and institution-specific waiver rules are not inferred.'});save()
        print(key,str(response)[:220],flush=True)
