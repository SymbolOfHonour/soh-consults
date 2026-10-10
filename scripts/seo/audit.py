"""Read-only sitemap and server HTML audit; no database access."""
import concurrent.futures, csv, json, sys, urllib.request, urllib.error, xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
from pathlib import Path
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.links=set(); self.canonical=""; self.robots=[]; self.title=""; self.description=""; self.h1=""; self.active=""; self.skip=0; self.text=[]
 def handle_starttag(self,t,a):
  d=dict(a)
  if t in ("script","style"): self.skip+=1
  if t in ("title","h1"): self.active=t
  if t=="a" and d.get("href"): self.links.add(d["href"])
  if t=="link" and d.get("rel")=="canonical": self.canonical=d.get("href","")
  if t=="meta" and d.get("name") in ("robots","googlebot"): self.robots.append(d.get("content",""))
  if t=="meta" and d.get("name")=="description": self.description=d.get("content","")
 def handle_endtag(self,t):
  if t in ("script","style"): self.skip=max(0,self.skip-1)
  if t==self.active: self.active=""
 def handle_data(self,d):
  if self.active: setattr(self,self.active,getattr(self,self.active)+d)
  if not self.skip: self.text.append(d)
def get(url):
 req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; SEOAudit/1.0)"})
 try:
  with urllib.request.urlopen(req,timeout=35) as r: return r.status,r.geturl(),dict(r.headers),r.read().decode("utf-8","replace")
 except urllib.error.HTTPError as e: return e.code,e.geturl(),dict(e.headers),e.read().decode("utf-8","replace")
def run(url):
 try:
  status,final,headers,html=get(url); p=Page(); p.feed(html)
  return {"url":url,"page_type":"article" if "/updates/" in url and "/category/" not in url else "category" if "/category/" in url else "guide" if "/guides/" in url else "core", "status":status,"final_url":final,"canonical":p.canonical,"robots":"; ".join(p.robots+[headers.get("X-Robots-Tag",headers.get("x-robots-tag",""))]),"title":p.title,"description":p.description,"h1":p.h1,"visible_words":len(" ".join(p.text).split()),"links":sorted(urljoin(final,x).split("#")[0] for x in p.links),"sitemap":True,"gsc_status":"Unavailable; not individually verified"}
 except Exception as e: return {"url":url,"error":str(e),"sitemap":True,"gsc_status":"Unavailable; not individually verified"}
base=sys.argv[1].rstrip("/"); out=Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
status,_,_,xml=get(base+"/sitemap.xml"); root=ET.fromstring(xml); urls=[e.text for e in root.findall("{*}url/{*}loc")]
(out/"sitemap.xml").write_text(xml)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: rows=list(pool.map(run,urls))
for r in rows:
 r["incoming_links"]=sum(r["url"] in x.get("links",[]) for x in rows)
 issues=[]
 if r.get("status")!=200: issues.append("HTTP or fetch failure")
 if r.get("canonical","").rstrip("/")!=r["url"].rstrip("/"): issues.append("Canonical mismatch/missing")
 if "noindex" in r.get("robots",""): issues.append("Noindex")
 if not r.get("h1"): issues.append("No H1")
 if not r.get("description"): issues.append("No description")
 if not r["incoming_links"]: issues.append("No incoming link found in sitemap-page HTML")
 r["issues"]="; ".join(issues); r["indexability"]="review" if any(x in issues for x in ["HTTP or fetch failure","Canonical mismatch/missing","Noindex"]) else "technically indexable"
(out/"audit.json").write_text(json.dumps(rows,indent=2))
keys=["url","page_type","status","final_url","canonical","indexability","sitemap","incoming_links","visible_words","robots","title","description","h1","gsc_status","issues","error"]
with (out/"audit.csv").open("w") as f:
 w=csv.DictWriter(f,fieldnames=keys,extrasaction="ignore"); w.writeheader(); w.writerows(rows)
print(json.dumps({"urls":len(rows),"errors":sum("error" in r for r in rows),"issues":[{"url":r["url"],"issues":r["issues"]} for r in rows if r["issues"]]},indent=2))
