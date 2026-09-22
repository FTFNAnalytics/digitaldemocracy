"""Research-pack validator only. Does not import or open SQLite, connect to VPS or mutate repository."""
from pathlib import Path
import json,hashlib,re,collections,sys,zipfile
B=Path(__file__).resolve().parent;D=B/'data/research/hungary';P=B/'docs/phase1/hungary'
def ld(p):return json.loads(p.read_text())
def C(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def H(x):return hashlib.sha256(C(x).encode()).hexdigest()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def ck(name,ok,detail=None):
 checks.append({'check':name,'status':'PASS'if ok else'FAIL','detail':detail})
 if not ok:print('FAIL',name,str(detail)[:200],file=sys.stderr)
O=ld(D/'office-register.json');E=ld(D/'events.json');R=ld(D/'results.json');G=ld(D/'geography.json');S=ld(D/'sources.json');T=ld(B/'schemas/atlas/tiers/hungary.json');I=ld(P/'Hungary_Input_Inventory.json');V=ld(P/'Hungary_Identity_Vectors.json');K=ld(D/'counts.json');M=ld(P/'column-map.json');N='cdd-observatory-v1';L='country-package-hungary'
os={o['office_id']for o in O};es={(e['office_id'],e['history_key']):e for e in E};gs={g['geography_id']for g in G};ss={s['source_id']:s for s in S}
ck('unique office IDs',len(os)==len(O));ck('tier exact1:1 IDs',len(T['classifications'])==len(os)and{t['office_id']for t in T['classifications']}==os);ck('all draft, Justin unchecked',T['status']=='draft_for_human_review'and T['approval']['Justin_accepted']is False and I['approval']['Justin_accepted']is False)
ck('office types/counts',len(O)==6378 and K['direct_executive_offices']==3178 and K['county_assemblies']==19 and K['municipal_councils']==3177)
ck('tier histogram',dict(collections.Counter(t['tier']for t in T['classifications']))==K['tier_histogram'])
ck('register retained hash',T['source_register']['sha256']==sha(D/'office-register.json')and T['source_register']['bytes']==(D/'office-register.json').stat().st_size)
ck('tier hash',I['tier_file']['sha256']==sha(B/I['tier_file']['input_path']))
ck('geography office FKs',all(o['geography_id']in gs for o in O));ck('geography parents',all(g['parent_geography_id']is None or g['parent_geography_id']in gs for g in G))
parent={g['geography_id']:g['parent_geography_id']for g in G};cycle=False
for g in G:
 seen=set();cur=g['geography_id']
 while cur is not None:
  if cur in seen:cycle=True;break
  seen.add(cur);cur=parent.get(cur)
ck('no geography cycle',not cycle)
ck('unique event identities',len(es)==len(E)and len({e['event_id']for e in E})==len(E));ck('event FK/IDs',all(e['office_id']in os and e['event_id']=='event-'+H([N,e['office_id'],e['history_key']])[:24]for e in E))
ck('unique result IDs',len({r['result_row_id']for r in R})==len(R));ck('result event FKs',all((r['office_id'],r['history_key'])in es and es[(r['office_id'],r['history_key'])]['event_id']==r['event_id']for r in R))
ck('result deterministic IDs',all(r['result_row_id']=='result-'+H([N,r['office_id'],r['history_key'],'main',r['ballot_component'],r['candidate_source_key']])[:24]for r in R))
numerr=[]
for r in R:
 for f in['votes','share','seats']:
  v=r[f];status='unknown'if v is None else'zero'if v==0 else'recorded'
  if r[f+'_status']!=status or(v is not None and(v<0 or f!='share'and not isinstance(v,int))):numerr.append((r['result_row_id'],f,v))
 if r['share']is not None and r['share']>100:numerr.append((r['result_row_id'],'share domain',r['share']))
ck('numeric domains and missing/zero statuses',not numerr,numerr[:10]);ck('no padded/withdrawn fake candidates',not any(r['candidate_or_list_label']=='Kiesett'for r in R))
fixture=[o['office_id']for o in O if o['office_id'].upper().startswith(('FIX-','FXT-'))];ck('fixture-free factual office universe',not fixture)
ck('no appointed/direct county-chair or PM offices',not any(o['office_type']in['direct_county_chair','prime_minister','cabinet','jaras_council']for o in O))
ck('presidency indirect and no fabricated vote totals',all(e['event_kind']=='indirect'and e['ballot_basis']=='electors'for e in E if e['office_id']=='HU-PRES')and all(r['votes']is None for r in R if r['office_id']=='HU-PRES'))
ck('no invented prospective dates',all(o['next_date']is None and o['next_cycle']is None for o in O)and K['prospective_events']==0)
ck('date precision source components',all(e['date']['precision']=='day'and e['date']['label']==f"{e['date']['year']:04}-{e['date']['month']:02}-{e['date']['day']:02}"for e in E))
rec=ld(D/'territorial-reconciliation.json');ck('2024vs2026jurisdiction set',rec['territorial_2024_count']==3177 and rec['nvi_2026_roster_count']==3177 and not rec['only_2024']and not rec['only_2026'])
ck('current/historical counts',K['current_offices']==sum(o['office_status']=='current'for o in O)and K['historical_offices']==sum(o['office_status']=='historical'for o in O));ck('counts actual',K['events']==len(E)and K['results']==len(R))
ck('all223columns',sum(map(len,M.values()))==223 and{t:set(fs)for t,fs in ld(P/'contract-columns.json').items()}=={t:set(fs)for t,fs in M.items()})
ck('identity vector counts',len(V['offices'])==len(O)and len(V['events'])==len(E)and len(V['results'])==len(R)and len(V['sources'])==len(S)and len(V['geographies'])==len(G))
ck('all vector record keys unique',len({r['record_key']for k in['offices','events','results','sources','geographies']for r in V[k]})==sum(len(V[k])for k in['offices','events','results','sources','geographies']))
ck('source IDs deterministic',all(s['source_id']=='src-'+H([L,s['url'],s.get('archive_member')])[:24]for s in S))
inputerrors=[]
for x in I['hash_inputs']['inputs']:
 p=B/x['input_path']
 if not p.is_file()or sha(p)!=x['sha256']or p.stat().st_size!=x['byte_count']:inputerrors.append(x['input_path'])
ck('all effective-input hashes and sizes',not inputerrors,inputerrors[:10]);ck('release fingerprint',I['fingerprint_sha256']==H(I['hash_inputs'])and I['candidate_release_id']==L+'--sha256-'+H(I['hash_inputs']))
ck('no accepted overrides',I['hash_inputs']['overrides']==[])
origerr=[]
for x in O+E+R:
 for a in x.get('origins',[]):
  if a['source_id']not in ss or ss[a['source_id']]['input_path']!=a['input_path']or ss[a['source_id']]['sha256']!=a['sha256']or ss[a['source_id']].get('acquisition_status')=='blocked_response':origerr.append(a['input_path'])
ck('all resolved origins bind actual nonblocked source hash',not origerr,list(set(origerr))[:10])
membererr=[];zs={}
for a in ld(D/'archive-members.json'):
 z=zs.setdefault(a['archive_path'],zipfile.ZipFile(B/a['archive_path']));b=z.read(a['archive_member'])
 if hashlib.sha256(b).hexdigest()!=a['sha256']or b!=(B/a['input_path']).read_bytes():membererr.append(a['input_path'])
for z in zs.values():z.close()
ck('unpacked members equal immutable archive bytes',not membererr,membererr[:5])
ck('contract hashes unchanged',all(sha(P/'contract-reference'/x['input_path'])==x['sha256']for x in I['hash_inputs']['schema_inputs']))
ck('at least15 acceptance examples',len(ld(P/'acceptance-vectors.json'))>=15)
ck('no repository/importer/SQLite/VPS/UI changes',all(v==0 for v in I['protection'].values()))
if(B/'SHA256SUMS').exists():
 lines=(B/'SHA256SUMS').read_text().splitlines();entries={line.split('  ',1)[1]:line.split('  ',1)[0]for line in lines};actual={str(p.relative_to(B))for p in B.rglob('*')if p.is_file()and p.name!='SHA256SUMS'and'__pycache__'not in p.parts};ck('manifest exact file set',set(entries)==actual);ck('manifest all hashes',all((B/n).is_file()and sha(B/n)==h for n,h in entries.items()))
else:checks.append({'check':'manifest','status':'PENDING_FINALIZATION'})
if'--deep'in sys.argv:
 import pandas as pd
 from bs4 import BeautifulSoup
 byfile=collections.defaultdict(list)
 for i,r in enumerate(R):
  for a in r['origins']:byfile[a['input_path']].append((i,a))
 contributions=collections.defaultdict(list);direct={};fail=[];html_count=0;sheet_count=0
 def num(x):
  s=re.sub(r'[\s%]','',str(x)).replace(',','.')
  return float(s)if'.'in s else int(s)if s.isdigit()else None
 for path,items in byfile.items():
  p=B/path
  if p.suffix in['.xls','.xlsx']:
   x=pd.ExcelFile(p);sheets={}
   for i,a in items:
    if'sheet'not in a:continue
    sn=a['sheet']
    if sn not in sheets:sheets[sn]=pd.read_excel(x,sn,header=None);sheet_count+=1
    d=sheets[sn];r=R[i]
    if a.get('operation')=='sum_exact_source_cells':contributions[i].append(sum(d.iat[j-1,a['column']-1]for j in a['rows']))
    elif'column'in a and'row'in a:contributions[i].append(d.iat[a['row']-1,a['column']-1])
    elif r['history_key']=='HU-OGY::OGY2022':
     h=d.iloc[0].tolist();row=d.iloc[a['row']-1].tolist()
     col='PÁRT_LISTA_SZAVAZAT'if r['ballot_component']=='national_party_list'else'NEMZ_LISTA_SZAVAZAT'if r['ballot_component']=='national_minority_list'else'SZAVAZAT';direct[i]=row[h.index(col)]
  elif any('html_table_index'in a for _,a in items):
   soup=BeautifulSoup(p.read_bytes(),'html.parser');tables=soup.select('table');html_count+=1
   for i,a in items:
    if'html_table_index'not in a:continue
    rows=tables[a['html_table_index']].find_all('tr');h=[c.get_text(' ',strip=True)for c in rows[0].find_all(['td','th'],recursive=False)];rr=[c.get_text(' ',strip=True)for c in rows[a['html_row_index']].find_all(['td','th'],recursive=False)];vi=next((j for j,v in enumerate(h)if'Kapott érvényes szavazat'in v),None)
    if vi is None:
     if R[i]['ballot_component']!='capital_compensation_seat_allocation' or num(rr[2])!=R[i]['seats'] or num(rr[1])!=R[i]['raw']['compensation_tally']:fail.append((i,'capital compensation mismatch'))
     continue
    direct[i]=num(rr[vi]);sh=num(rr[h.index('%')])if'%'in h else None
    if sh!=R[i]['share']:fail.append((i,'printed share mismatch'))
  elif any(R[i]['office_id']=='HU-PRES'for i,a in items):
   text=BeautifulSoup(p.read_bytes(),'html.parser').get_text(' ',strip=True)
   for i,a in items:
    if R[i]['candidate_or_list_label'].replace('dr. ','')not in text:fail.append((i,'elected person missing in resolution'))
 for i,r in enumerate(R):
  if r['votes']is None:continue
  expected=sum(contributions[i])if i in contributions else direct.get(i)
  if expected!=r['votes']:fail.append((i,r['result_row_id'],r['votes'],str(expected)))
 ck('deep all numeric votes and printed shares equal retained sources',not fail,{'errors':fail[:20],'result_rows_checked':len(R),'html_pages':html_count,'worksheets':sheet_count})
result={'status':'FAIL'if any(c['status']=='FAIL'for c in checks)else'PASS','validation_scope':'documentary research package only; not importer/SQLite/publication CI; research completeness not asserted','counts':K,'checks':checks,'applied_changes':0,'execution':{'importer':'Not run','SQLite':'Not run','VPS':'Not run','UI':'Not run','repo_mutation':'Not run'},'Justin_accepted':False}
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(1 if result['status']=='FAIL'else 0)
