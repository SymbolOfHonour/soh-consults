import json,time,urllib.request,concurrent.futures,pathlib,subprocess
cases=[
('services','What services does S.O.H CONSULTS offer?',None,'Describe actual business services and contact route'),
('contact','How can I contact S.O.H CONSULTS?',None,'Return verified business contact'),
('caps','What does JAMB CAPS mean?',None,'Expand CAPS and describe purpose'),
('accept','How do I accept admission on JAMB CAPS?',None,'Official procedure or explicit evidence gap'),
('cutoff','What is LASU minimum UTME score for 2026/2027?',None,'Session-bound official minimum; distinguish course thresholds'),
('session','What is LASU cut off mark?',None,'Ask session; preserve subject for reply'),
('follow-session','2026/2027','What is LASU cut off mark?','Inherit LASU and cutoff intent'),
('subjects','What UTME subjects do I need for Medicine at LASU for 2026/2027?',None,'Course-specific official subjects or acknowledge missing evidence'),
('de','What are FUOYE Direct Entry requirements for 2026/2027?',None,'Route-specific requirements or evidence gap, no sales diversion'),
('deadline','When is LASU 2026/2027 Post-UTME registration deadline?',None,'Dated official deadline; account for extensions'),
('official','Give me the official LASU admission screening portal',None,'Relevant official portal link'),
('typo','What is Lasuu cut off mark for 2026/2027?',None,'Resolve probable LASU typo or clarify'),
('expired','Who is the LASU Vice Chancellor?',None,'Do not serve expired registry fact as current'),
('historical','What was LASU cutoff for 2025/2026?',None,'Do not substitute 2026/2027 evidence'),
('conflict','LASU cutoff is 195 or 200 for 2026/2027?',None,'Verify conflicting numbers rather than guess'),
('follow-route','And Direct Entry?','FUOYE 2026/2027 Post-UTME requirements','Retain institution and session, change admission route'),
]
def run(c):
 id,q,context,expected=c;t=time.monotonic();body={'question':q}
 if context:body['context']=context
 req=urllib.request.Request('https://sohconsults.com.ng/api/ask-soh/search',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
 try:
  r=subprocess.run(['curl','-sS','--max-time','75','-w','\n%{http_code}','-H','Content-Type: application/json','--data',json.dumps(body),'https://sohconsults.com.ng/api/ask-soh/search'],capture_output=True,text=True)
  raw,code=r.stdout.rsplit('\n',1);status=int(code);data=json.loads(raw)
 except Exception as e:status=None;data={'transportError':str(e),'detail':r.stderr if 'r' in locals() else ''}
 row=dict(id=id,question=q,context=context,expected=expected,status=status,latency_ms=round((time.monotonic()-t)*1000),actual=data)
 print(id,status,data.get('confidence'),data.get('answer','')[:100],flush=True);return row
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(run,cases))
pathlib.Path('recovery/baseline.json').write_text(json.dumps({'ran_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'rows':rows},indent=2))
