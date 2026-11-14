import sys, concurrent.futures,urllib.request,urllib.parse,re,json,pathlib,time,datetime,hashlib
base='https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/index.php'
if len(sys.argv) != 2: raise SystemExit('Usage: python scripts/capture-lasu-requirements.py /absolute/capture-directory')
root=pathlib.Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=True)
with urllib.request.urlopen(base,timeout=25) as response: html=response.read().decode()
rows=[{'courseId':i,'programme':n.strip()} for i,n in re.findall(r"<option[^>]*value=['\"]([^'\"]+)['\"][^>]*>([^<]+)</option>",html) if i]
(root/'programmes.html').write_text(html);(root/'programmes.json').write_text(json.dumps(rows,indent=2))
def capture(row):
 p=root/(row['courseId']+'.html')
 for attempt in range(2):
  try:
   request=urllib.request.Request(base,data=urllib.parse.urlencode({'course':row['courseId']}).encode(),headers={'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0 S.O.H CONSULTS requirements verification'})
   with urllib.request.urlopen(request,timeout=25) as response:
    body=response.read();url=response.url
   text=body.decode();heading=re.search(r'<div class="result-band">[\s\S]*?<h3>(.*?)</h3>',text)
   if not heading or heading[1].strip()!=row['programme']:raise ValueError('Wrong or missing programme heading')
   p.write_bytes(body)
   return {**row,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(body).hexdigest(),'url':url}
  except Exception as e:
   if attempt: return {**row,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 results=[]
 for result in pool.map(capture,rows):
  results.append(result);(root/'manifest.json').write_text(json.dumps(results,indent=2))
  print(len(results),result['programme'],result.get('error','OK'),flush=True)
print('COMPLETE',len(results),'errors',sum('error' in r for r in results),flush=True)

if any("error" in row for row in results): raise SystemExit("Capture incomplete; do not replace the backup")
