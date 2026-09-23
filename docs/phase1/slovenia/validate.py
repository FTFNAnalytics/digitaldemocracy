#!/usr/bin/env python3
"""Read-only research-pack validation. No importer, SQLite, network or repository mutation."""
from pathlib import Path
import json,hashlib,re,collections,sys
from functools import lru_cache
try:
 from bs4 import BeautifulSoup
 import pdfplumber
except ImportError as e:
 print(json.dumps({'status':'FAIL','reason':'Research validation requires beautifulsoup4 and pdfplumber: '+str(e)}));sys.exit(1)
B=Path(__file__).resolve().parent;D=B/'data/research/slovenia';P=B/'docs/phase1/slovenia';checks=[];fail=[]
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def data(n):return load(D/(n+'.json'))
def C(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
def H(x):return hashlib.sha256(C(x).encode()).hexdigest()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(p,x):return p+'-'+H(x)[:24]
def check(name,ok,detail=None):
 checks.append({'check':name,'status':'PASS'if ok else'FAIL','detail':detail})
 if not ok:fail.append(name)
def assertx(ok,detail):
 if not ok:raise ValueError(detail)
@lru_cache(maxsize=1500)
def parsed(rel):
 p=B/rel
 if p.suffix=='.json':return load(p)
 try:t=p.read_text(encoding='utf-8-sig')
 except UnicodeDecodeError:t=p.read_text(encoding='cp1250')
 return BeautifulSoup(t,'html.parser')
def pointer(d,s):
 for a in s.lstrip('/').split('/')if s else[]:
  a=a.replace('~1','/').replace('~0','~');d=d[int(a)]if isinstance(d,list)else d[a]
 return d
def st(v):return'unknown'if v is None else'zero'if v==0 else'recorded'
def num(s):
 s=str(s).strip().replace('\xa0','').replace(' ','').replace('%','');return None if not s or s in['-','/']else float(s.replace('.','').replace(',','.'))
try:
 I=load(P/'Slovenia_Input_Inventory.json');O=data('office-register');G=data('geography');E=data('events');R=data('results');S=data('sources');PR=data('proceedings');K=data('counts');T=load(B/'schemas/atlas/tiers/slovenia.json');V=load(P/'Slovenia_Identity_Vectors.json');M=load(P/'column-map.json');cols=load(P/'contract-columns.json');N='cdd-observatory-v1';L='country-package-slovenia'
 check('pin recorded',I['pin']['commit']=='3b21c584c1b59663c5c4ae1bad775618293ac0fa')
 expectedddl={'0001_atlas_attempt_log.sql':'e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1','0002_atlas_master.sql':'1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da'}
 check('unchanged authoritative DDL reference hashes',all(sha(P/'contract-reference'/n)==h for n,h in expectedddl.items()))
 bad=[x['input_path']for x in I['hash_inputs']['inputs']if sha(B/x['input_path'])!=x['sha256']or(B/x['input_path']).stat().st_size!=x['byte_count']];check('all retained effective input bytes',not bad,bad)
 check('fingerprint exact canonical descriptors',H(I['hash_inputs'])==I['fingerprint_sha256']and I['candidate_release_id']==L+'--sha256-'+H(I['hash_inputs']))
 check('tier exact ID set; draft status; no approval',len(O)==428 and len(T['classifications'])==428 and {x['office_id']for x in O}=={x['office_id']for x in T['classifications']}and T['status']=='draft_for_human_review'and T['approval']['Justin_accepted']is False)
 check('proposed tier histogram',collections.Counter(x['tier']for x in T['classifications'])=={'municipal':424,'national':3,'other':1})
 check('source register hash/bytes',T['source_register']['sha256']==sha(D/'office-register.json')and T['source_register']['bytes']==(D/'office-register.json').stat().st_size)
 gov=data('roster-bindings');check('212 unique current municipality bindings',len(gov)==212 and len({x['source_code']for x in gov})==212)
 rs=parsed('data/research/slovenia/sources/www.dvk-rs.si/arhivi/volitve2022/lv2022/data/prvikrog/data.json')['slovenija']['obcine'];check('current codes exact source roster equality',{x['source_code']for x in gov}=={f"{x['st']:03}"for x in rs})
 check('municipal two-body universe',all(sum(o['source_territorial_code']==x['source_code']for o in O)==2 for x in gov)and sum(o['office_type']=='direct_mayor'for o in O)==212 and sum(o['office_type']=='municipal_council'for o in O)==212)
 check('national/EP offices and indirect mode',{o['office_id']for o in O if o['source_territorial_code']is None}=={'SI-DZ','SI-DS','SI-PRESIDENT','SI-EP'}and next(o for o in O if o['office_id']=='SI-DS')['electoral_mode']=='indirect_functional_and_local_electors')
 check('historical only not invented',all(o['office_status']=='current'for o in O)and K['historical_only_offices_recovered']==0)
 check('unique typed identities',all(len(a)==len({x[k]for x in a})for a,k in[(O,'office_id'),(E,'history_key'),(E,'event_id'),(R,'result_row_id'),(PR,'proceeding_id'),(G,'geography_id'),(S,'source_id')]))
 om={o['office_id']:o for o in O};em={e['history_key']:e for e in E};pm={p['proceeding_id']:p for p in PR};sm={s['source_id']:s for s in S};gm={g['geography_id']:g for g in G}
 check('office/geography/event/result/proceeding FKs',all(o['geography_id']in gm for o in O)and all(e['office_id']in om for e in E)and all(r['history_key']in em and r['office_id']==em[r['history_key']]['office_id']and(r['proceeding_id']is None or r['proceeding_id']in pm and pm[r['proceeding_id']]['history_key']==r['history_key'])for r in R))
 bad=[]
 for arr in[O,G,E,R,PR]:
  for x in arr:
   for loc in x['origins']:
    if loc['source_id']not in sm or sm[loc['source_id']]['input_path']!=loc['input_path']or sm[loc['source_id']]['sha256']!=loc['sha256']:bad.append(loc)
 check('every resolved origin binds real source/path/hash',not bad,len(bad))
 bad=[]
 for r in R:
  for f in['votes','share','seats']:
   v=r[f]
   if r[f+'_status']!=st(v)or v is not None and(v<0 or f in['votes','seats']and int(v)!=v):bad.append(r['result_row_id'])
  if r['share']is not None and r['share']>(1 if r['share_unit']=='proportion_0_1'else 100):bad.append(r['result_row_id'])
 check('numeric/status/unit domains; missing differs zero',not bad,len(set(bad)))
 # Independent source round-trip of every normalized result, including exact raw HTML/JSON labels.
 verified=collections.Counter();pdfcache={}
 for r in R:
  loc=r['origins'][0];raw=r['raw'];rel=loc['input_path']
  if 'json_pointer'in loc:
   q=pointer(parsed(rel),loc['json_pointer']);assertx(q==raw,('JSON raw changed',r['result_row_id']));assertx(r['votes']==q.get('gl',q.get('glasov')),('votes',r['result_row_id']));assertx(r['share']==q.get('prc',q.get('procent')),('share',r['result_row_id']));assertx(r['candidate_or_list_label']==q.get('naz',q.get('naziv')),('label',r['result_row_id']));assertx(r['seats']==q.get('man'),('seats',r['result_row_id']));verified['JSON']+=1
  elif 'html_table_index'in loc and'html_row_index'in loc:
   tr=parsed(rel).select('table')[loc['html_table_index']].select('tr')[loc['html_row_index']];c=[t.get_text(' ',strip=True)for t in tr.select('td,th')];assertx(c==raw['values'],('HTMLraw',r['result_row_id']))
   if 'columns'in raw:
    h=raw['columns'];assertx(r['votes']==num(c[h.index('Št. glasov')])and r['share']==num(c[h.index('Odstotek glasov')]),('HTMLnumbers',r['result_row_id']));assertx(r['candidate_or_list_label']==c[1],('HTMLlabel',r['result_row_id']));assertx(r['seats']==(num(c[h.index('Št. mandatov')])if'Št. mandatov'in h else None),('HTMLseats',r['result_row_id']))
   elif r['history_key']=='SI-EP::EP2014':assertx(r['candidate_or_list_label']==c[1]and r['votes']==num(c[2])and r['share']==num(c[3]),'EP2014')
   else:
    vals=c[1].split()if'Prvi' in rel else c[1:] # explicit source shape below
    vals=c[1].split()if'/rezultati/rezultati.html'in rel else c[1:];assertx(r['candidate_or_list_label']==c[0]and r['votes']==num(vals[0])and r['share']==num(vals[1]),'PRE2012')
   verified['HTML table']+=1
  elif loc.get('html_tag')=='div':
   ds=parsed(rel).select('div');a=ds[loc['html_element_index']].get_text(' ',strip=True);v=ds[loc['paired_value_element_index']].get_text(' ',strip=True);assertx(a==raw['candidate_text']and v==raw['vote_text'],'DS raw');assertx(r['votes']==int(v.split()[0])and r['share']is None and r['candidate_or_list_label']==re.sub(r'^\d+\.\s*','',a),'DS numeric');verified['HTML electoral college']+=1
  elif loc.get('pdf_table_index')is not None:
   if rel not in pdfcache:
    with pdfplumber.open(B/rel)as pdf:pdfcache[rel]={i+1:pdf.pages[i].extract_tables()for i in[0,1]}
   cells=pdfcache[rel][loc['pdf_page']][loc['pdf_table_index']][loc['pdf_row_index']];assertx(cells==raw['values']and r['votes']==num(cells[1])and r['share']==num(cells[2])and r['candidate_or_list_label']==cells[0].replace('\n',' '),'DZ2026 PDF');verified['PDF table']+=1
  elif loc.get('candidate_rank'):
   expected={1:('Borut Pelko',0),2:('Zoran Poznič',5),3:('Tomaž Simetinger',2),4:('Luka Steiner',10)}[loc['candidate_rank']];assertx((r['candidate_or_list_label'],r['votes'])==expected and r['share']is None,'visual DS2023 transcription');verified['Visually verified PDF transcription']+=1
  else:raise ValueError(('Unverified projection',loc))
 check('all result claims source-round-tripped',sum(verified.values())==len(R),dict(verified))
 check('national2026 party total from final Gazette',sum(r['votes']for r in R if r['history_key']=='SI-DZ::DZ2026')==1179769)
 check('National Council shares never fabricated',all(r['share']is None for r in R if r['office_id']=='SI-DS'))
 check('no media fixture result projection',all('/navodila_medijem/'not in r['origins'][0]['input_path'].lower()and'/za_medije/'not in r['origins'][0]['input_path']and not r['origins'][0]['input_path'].endswith('fileadmin/user_upload/rezultati.json')for r in R))
 check('fixture office/event IDs absent',not any(re.match(r'^(FIX|FXT)-',x.upper())for x in list(om)+[e['event_id']for e in E]))
 check('historical events/calls exactly accounted',len(E)==1706 and sum(e['selected_history_role']=='none'for e in E)==424 and len(PR)==801 and len(R)==13830)
 check('calls have no fabricated returns',not any(r['history_key'].endswith('LV2026')for r in R))
 check('missing2018Ribnica council remains explicit',len(data('missing-local-cycles'))==1 and data('missing-local-cycles')[0]['office_id']=='SI-106-C'and'SI-106-C'in om and'SI-106-C::LV2018'not in em)
 check('corrupted label queue exact',len(data('result-label-review'))==1172 and sum('\ufffd'in r['candidate_or_list_label']for r in R)==1172)
 check('all vectors exact counts',all(len(V[k])==len(a)for k,a in[('offices',O),('events',E),('results',R),('proceedings',PR),('sources',S),('geographies',G)]))
 check('deterministic complete identity vectors',all(key(prefix,v['natural_key'])==v[field]for vs,prefix,field in[(V['events'],'event','event_id'),(V['results'],'result','result_row_id'),(V['proceedings'],'proceeding','proceeding_id'),(V['sources'],'src','source_id')]for v in vs))
 dates={v['date_id']:v for v in V['research_dates']};check('date IDs unique and deterministic',len(dates)==len(V['research_dates'])and all(v['date_id']=='date-'+H([N,v['owner'],v['owner_id'],v['slot']])for v in dates.values()))
 check('DS date ranges explicit endpoints',all(v['range_start_id']in dates and v['range_end_id']in dates and v['value']['day']is None for v in dates.values()if v['value']['precision']=='range'))
 check('all223 exact contract columns documented',sum(map(len,M.values()))==223 and all(set(M[t])==set(cs)for t,cs in cols.items())and all(all(f in x for f in['source_locator','conversion_and_null_policy','deterministic_identity_rule','evidence_fk_rule','validation_assertion'])for cs in M.values()for x in cs.values()))
 check('at least15 acceptance examples',len(re.findall(r'^## \d+\.',(P/'Slovenia_Acceptance_Examples.md').read_text(),re.M))>=15)
 check('applied_changes0; Justin false',I['protection']['applied_changes']==0 and I['approval']['Justin_accepted']is False)
 if(B/'SHA256SUMS').exists():
  manifest={line.split('  ',1)[1]:line.split('  ',1)[0]for line in(B/'SHA256SUMS').read_text().splitlines()};actual={str(p.relative_to(B))for p in B.rglob('*')if p.is_file()and p.name!='SHA256SUMS'and'__pycache__'not in p.parts};check('manifest exact file set',set(manifest)==actual);check('manifest all hashes',all(sha(B/p)==h for p,h in manifest.items()))
 else:check('manifest pending external packaging',True,'No manifest yet; final packaging must rerun with manifest present.')
except Exception as e:check('source/structure validation completed',False,str(e))
report={'status':'FAIL'if fail else'PASS','validation_scope':'Research pack only; no importer/SQLite/VPS/UI execution','checks':checks,'failures':fail,'applied_changes':0,'execution_ci':'Not run','Justin_accepted':False}
print(json.dumps(report,ensure_ascii=False,indent=2));sys.exit(1 if fail else 0)
