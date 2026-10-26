"""Capture public IBASS institution metadata, not course/admission requirements.
Standard library only. Sequential, cached, two-second request interval; no retry
on a rate limit or failed response. Re-run to resume cached pages.
"""
import datetime,hashlib,json,pathlib,time,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
CACHE=ROOT.parent/'ibass-directory-capture-20261026';CACHE.mkdir(exist_ok=True)
BASE='https://ibass-api.jamb.gov.ng/api'
last=0

def request(path,body=None):
 global last
 key=hashlib.sha256((path+json.dumps(body,sort_keys=True)).encode()).hexdigest()
 file=CACHE/(key+'.json')
 if file.exists():return json.loads(file.read_text())
 time.sleep(max(0,2-(time.monotonic()-last)));last=time.monotonic()
 req=urllib.request.Request(BASE+path,data=None if body is None else json.dumps(body).encode(),headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=35) as res:data=json.load(res)
 if data.get('status') is not True:raise ValueError('Upstream unsuccessful: '+path)
 item={'url':BASE+path,'request':body,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'response':data}
 file.write_text(json.dumps(item,ensure_ascii=False));return item

def main():
 types=request('/inst-type')['response']['data'];all_rows=[];coverage=[];evidence=[];categories=[]
 for kind in types:
  category_response=request('/inst-category',{'inst_type':kind['id']})
  categories.extend({'id':c['id'],'title':c['title'],'typeId':kind['id']} for c in category_response['response']['data'])
  body={'inst_type':kind['id'],'inst_category':None,'inst_search':''}
  first=request('/ibass/institutions?page=1',body);meta=first['response']['data'];rows=[]
  for page in range(1,meta['last_page']+1):
   envelope=first if page==1 else request('/ibass/institutions?page='+str(page),body)
   value=envelope['response']['data']
   if value['current_page']!=page or value['total']!=meta['total']:raise ValueError('Pagination changed; do not publish partial data')
   rows.extend(value['data']);evidence.append({'url':envelope['url'],'request':body,'observedAt':envelope['observedAt'],'rows':len(value['data']),'sha256':hashlib.sha256(json.dumps(value,sort_keys=True).encode()).hexdigest()})
   print(kind['title'],page,'/',meta['last_page'],flush=True)
  if len(rows)!=meta['total'] or len({x['id'] for x in rows})!=len(rows):raise ValueError('Incomplete or duplicate institution IDs')
  coverage.append({'id':kind['id'],'title':kind['title'],'total':len(rows),'pages':meta['last_page']})
  for row in rows:
   if not row.get('title') or row.get('inst_type')!=kind['id']:raise ValueError('Invalid institution metadata')
   all_rows.append({'key':str(kind['id'])+'-'+str(row['id']),'id':row['id'],'name':row['title'].strip(),'alias':(row.get('abbreviation') or '').strip(),'state':(row.get('state') or '').strip(),'ownership':(row.get('ownership') or '').strip(),'categoryId':row.get('inst_category'),'typeId':kind['id'],'type':kind['title']})
 (ROOT/'data/schools/categories.json').write_text(json.dumps(categories,ensure_ascii=False,indent=2)+'\n')
 result={'schemaVersion':1,'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'https://ibass.jamb.gov.ng/brochure-by-institution','coverage':coverage,'institutions':all_rows}
 (ROOT/'data/schools/ibass-institutions.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
 (ROOT/'docs/website-evolution/directory-capture.json').write_text(json.dumps({'coverage':coverage,'evidence':evidence,'recordCount':len(all_rows)},indent=2)+'\n')
 print('Complete',len(all_rows),'institution listings',flush=True)
if __name__=='__main__':main()
