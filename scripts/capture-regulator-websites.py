"""Read NUC website listings; join only unique literal name-prefix identities.
No fuzzy matches, affiliation joins, guessed domains or admission claims.
"""
import datetime,json,pathlib,re,time,unicodedata,urllib.request
from html.parser import HTMLParser
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Tables(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,t,a):
  if t=='tr':self.row=[]
  if t in ('td','th') and self.row is not None:self.cell=''
 def handle_data(self,s):
  if self.cell is not None:self.cell+=s
 def handle_endtag(self,t):
  if t in ('td','th') and self.cell is not None:self.row.append(' '.join(self.cell.split()));self.cell=None
  if t=='tr' and self.row is not None:self.rows.append(self.row);self.row=None
norm=lambda s:re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s).lower()).strip()
def main():
 schools=json.loads((ROOT/'data/schools/ibass-institutions.json').read_text())['institutions'];joined=[];unmatched=[];sources=[]
 for path in ('federal-univeristies','state-univerisity','private-univeristies'):
  url='https://www.nuc.edu.ng/nigerian-univerisities/'+path+'/'
  html=urllib.request.urlopen(url,timeout=35).read().decode('utf-8','replace');parser=Tables();parser.feed(html);count=0
  for row in parser.rows:
   if len(row)<4 or not re.fullmatch(r'\d+',row[0]):continue
   candidates=re.findall(r'https?://[^\s<>]+',row[3])
   if len(candidates)!=1:continue
   website=candidates[0].rstrip('.,');name=row[1];n=norm(name)
   matches=[s for s in schools if s['typeId']==4 and (norm(s['name'])==n or norm(s['name']).startswith(n+' ')) and len(n.split())>=3]
   if len(matches)!=1:unmatched.append({'name':name,'source':url,'reason':'No unique literal identity match'});continue
   s=matches[0];count+=1;joined.append({'key':s['key'],'name':s['name'],'sourceName':name,'website':website,'source':url,'checked':datetime.date.today().isoformat()})
  sources.append({'url':url,'matched':count});time.sleep(2)
 # A duplicate candidate key is ambiguous; never let last-write-wins choose a domain.
 unique=[x for x in joined if sum(y['key']==x['key'] for y in joined)==1]
 result={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'NUC-listed website; unique literal name-prefix match to JAMB identity; destination availability not implied','sources':sources,'links':unique,'unmatched':unmatched}
 (ROOT/'data/schools/regulator-websites.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'matched':len(unique),'unmatched':len(unmatched),'sources':sources}))
if __name__=='__main__':main()
