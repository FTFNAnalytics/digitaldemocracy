#!/usr/bin/env python3
"""Read-only documentary pack validator. No network, importer, SQL, or repository writes."""
from pathlib import Path
import json,hashlib,collections,csv,io,re,zipfile,xml.etree.ElementTree as ET,sys
B=Path(__file__).resolve().parent;D=B/'data/research/slovakia';P=B/'docs/phase1/slovakia';N='cdd-observatory-v1';L='country-package-slovakia'
def C(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
def H(x):return hashlib.sha256(C(x).encode()).hexdigest()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def key(p,x):return p+'-'+H(x)[:24]
def load(n):return json.load(open(D/(n+'.json')))
checks=[]
def ck(name,condition):
 checks.append({'name':name,'status':'PASS'if condition else'FAIL'});
 if not condition:raise AssertionError(name)
def number(x):
 if x is None:return None
 s=str(x).strip().replace('\u00a0','').replace(' ','').replace(',','.')
 if s.lower()in['','nan','-','x']:return None
 v=float(s);return int(v)if v.is_integer()else v
O=load('office-register');E=load('events');R=load('results');G=load('geography');S=load('sources');PR=load('proceedings');K=load('counts');T=json.load(open(B/'schemas/atlas/tiers/slovakia.json'));I=json.load(open(P/'Slovakia_Input_Inventory.json'));V=json.load(open(P/'Slovakia_Identity_Vectors.json'));M=json.load(open(P/'column-map.json'));cols=json.load(open(P/'contract-columns.json'))
om={o['office_id']:o for o in O};em={(e['office_id'],e['history_key']):e for e in E};pm={p['proceeding_id']:p for p in PR};sm={s['source_id']:s for s in S};gm={g['geography_id']:g for g in G}
ck('pin recorded',I['pin']['commit']=='89726607439fa6726e7c34e30eec45357230d318')
ck('current office count and uniqueness',len(O)==len(om)==5871 and all(o['current']for o in O))
ck('historical gap disclosed',K['historical_offices_recovered']==0 and not K['historical_office_universe_complete'])
ck('exact tier ID equality',len(T['classifications'])==len(O) and {x['office_id']for x in T['classifications']}==set(om))
ck('draft and approval state',T['status']=='draft_for_human_review' and not T['approval']['Justin_accepted']and not T['approval']['production_accepted'])
ck('tier histogram',dict(collections.Counter(x['tier']for x in T['classifications']))=={'municipal':5774,'regional':16,'national':2,'other':79})
ck('focused review flag count',sum(x['human_review_required']for x in T['classifications'])==79)
ck('executive vs council counts',sum('direct_'in o['office_type']for o in O)==2935 and sum('direct_'not in o['office_type']for o in O)==2936)
ck('no appointed/military/overseas offices',not any(c in oid for oid in om for c in['500267','518581','518638','523551','599999','CABINET','PRIME','OKRES']))
ck('geography keys and FKs',len(G)==len(gm)==2935 and all(o['geography_id']in gm for o in O) and all(g['parent_geography_id']is None or g['parent_geography_id']in gm for g in G))
for g in G:
 seen=set();v=g['geography_id']
 while v is not None:
  assert v not in seen;seen.add(v);v=gm[v]['parent_geography_id']
ck('geography acyclic',True)
ck('event identity and uniqueness',len(E)==len(em)==23437 and len({e['event_id']for e in E})==23437 and all(e['event_id']==key('event',[N,e['office_id'],e['history_key']])and e['office_id']in om for e in E))
ck('historical and prospective counts',sum(e['temporal_role']=='historical'for e in E)==17569 and sum(e['temporal_role']=='prospective'for e in E)==5868)
ck('prospective call no result claims',all(e['date']['label']=='2026-10-24'and e['date']['certainty']=='called'and e['selected_history_role']=='none'and e['result_count']==0 for e in E if e['temporal_role']=='prospective'))
ck('no alert filtering of unknown next office',all(om[x]['next_date']is None and any(e['office_id']==x for e in E)for x in['SK-NRSR','SK-PRESIDENT','SK-EP']))
ck('proceeding identity and full event FK',len(PR)==len(pm)==19 and all(p['proceeding_id']==key('proceeding',[N,p['office_id'],p['history_key'],'ballot-'+str(p['sequence'])])and(p['office_id'],p['history_key'])in em for p in PR))
ck('runoffs not extra cycles',sum(e['office_id']=='SK-PRESIDENT'for e in E)==3 and sum(e['cycle']=='VUC2013'for e in E)==16 and sum(p['kind']=='runoff'for p in PR)==8)
ck('unique result identities and FKs',len(R)==len({r['result_row_id']for r in R})==115217 and all(r['result_row_id']==key('result',[N,r['office_id'],r['history_key'],r['proceeding_id']or'main',r['candidate_source_id']])and(r['office_id'],r['history_key'])in em and (r['proceeding_id']is None or (pm[r['proceeding_id']]['office_id'],pm[r['proceeding_id']]['history_key'])==(r['office_id'],r['history_key']))for r in R))
counts=collections.Counter((r['office_id'],r['history_key'])for r in R)
ck('per-event row totals',all(e['result_count']==counts[(e['office_id'],e['history_key'])]for e in E))
ck('elected-only and full-vector separation',sum(r['coverage']=='elected_only'for r in R)==41647 and all(r['seats']is None for r in R if r['coverage']=='elected_only'))
ck('missing cycle no fake completion',len(load('missing-local-cycles'))==44 and all((x['office_id'],x['office_id']+'::'+x['cycle'])not in em and x['office_id']in om for x in load('missing-local-cycles')))
ck('numeric domain and status pairs',all(all((r[f]is None and r[f+'_status']=='unknown')or(r[f]==0 and r[f+'_status']=='zero')or(r[f]is not None and r[f]>0 and r[f+'_status']=='recorded')for f in['votes','share','seats'])and(r['share']is None or r['share']<=100)for r in R))
ck('zero and missing are distinct',sum(r['votes']==0 for r in R)==107 and sum(r['seats']is None for r in R)==115185)
ck('no unsupported party mappings',load('party-mappings')==[])
ck('every source hash and source identity',len(S)==len(sm)==187 and all(sha(B/s['input_path'])==s['sha256']and(B/s['input_path']).stat().st_size==s['byte_count']and s['source_id']==key('src',[L,s['url'],s.get('archive_member')])for s in S))
for s in S:
 if 'archive_member'in s:
  with zipfile.ZipFile(B/s['parent_input_path'])as z:assert z.read(s['archive_member'])==(B/s['input_path']).read_bytes()
ck('extracted members equal retained ZIP bytes',True)
origins=[z for rows in[O,E,G,R]for x in rows for z in x.get('origins',[])]+[z for x in E+PR for z in x['date']['origins']]
ck('resolved evidence locators',all(z['source_id']in sm and z['input_path']==sm[z['source_id']]['input_path']and z['sha256']==sm[z['source_id']]['sha256']for z in origins))
# Check every normalized raw source row against its retained CSV or XLSX member.
cache={}
def csvrecords(path):
 b=(B/path).read_bytes()
 try:s=b.decode('utf-8-sig')
 except UnicodeDecodeError:s=b.decode('cp1250')
 n=Path(path).name;sep=';'if n.startswith(('OSO_2014','OSK_2013','EUP_2014','PRE_2014'))or'2022_SK'in n else ','
 return list(csv.reader(io.StringIO(s),delimiter=sep))
def xlsxrecords(path):
 ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
 with zipfile.ZipFile(B/path)as z:
  shared=[]
  if'xl/sharedStrings.xml'in z.namelist():
   root=ET.fromstring(z.read('xl/sharedStrings.xml'));shared=[''.join(t.text or''for t in a.findall('.//s:t',ns))for a in root]
  root=ET.fromstring(z.read('xl/worksheets/sheet1.xml'));out={}
  for row in root.findall('.//s:sheetData/s:row',ns):
   a=[None]*15
   for cell in row:
    ref=cell.attrib['r'];letters=re.match(r'[A-Z]+',ref)[0];idx=0
    for c in letters:idx=idx*26+ord(c)-64
    v=cell.find('s:v',ns);typ=cell.attrib.get('t');value=None
    if typ=='s'and v is not None:value=shared[int(v.text)]
    elif typ=='inlineStr':value=''.join(t.text or''for t in cell.findall('.//s:t',ns))
    elif v is not None:value=number(v.text)
    if idx<=15:a[idx-1]=value
   out[int(row.attrib['r'])]=a
  return out
for r in R:
 z=r['origins'][0];path=z['input_path']
 if path not in cache:cache[path]=xlsxrecords(path)if path.endswith('.xlsx')else csvrecords(path)
 source=cache[path][z['row']]if'row'in z else cache[path][z['csv_record']-1]
 assert r['raw']['values']==source,(r['result_row_id'],'raw differs')
 if'header_record'in z:assert r['raw']['columns']==cache[path][z['header_record']-1]
ck('all115217 raw rows match retained source bytes',True)
# Typed numeric projection columns, explicitly selected rather than heuristic header guessing.
proj={'OSO_2014_tab11.csv':(3,None,None),'OSO_2014_tab10.csv':(4,None,None),'OSO_2018_tab05.csv':(12,13,None),'OSO_2018_tab06.csv':(13,None,None),'OSO_2018_tab06d.csv':(12,None,None),'OSO2022_SK_tab05d.xlsx':(12,13,None),'OSO2022_SK_tab05x.csv':(6,7,None),'OSO2022_SK_tab08e.csv':(13,14,None),'OSO2022_SK_tab08ex.csv':(7,8,None),'OSK_2013_1kolo_tab08.csv':(4,None,None),'OSK_2013_1kolo_tab05.csv':(3,4,None),'OSK_2013_2kolo_tab07.csv':(3,4,None),'OSK_2017_tab06b.csv':(5,6,None),'OSK_2017_tab09c.csv':(7,8,None),'OSK2022_SK_tab06a.csv':(6,7,None),'OSK2022_SK_tab09b.csv':(8,9,None),'NRSR_2016_tab13.csv':(2,3,4),'NRSR_2020_tab03a.csv':(2,3,6),'NRSR2023_SK_tab03a.csv':(2,3,6),'EUP_2014_tab08.csv':(1,2,None),'EP_2019_SK_tab03a.csv':(2,3,6),'EP2024_SK_tab03a.csv':(2,3,6),'PRE_2019_KOLO1_tab03a.csv':(3,5,None),'PRE_2019_KOLO2_tab03a.csv':(3,4,None),'PREZ2024_kolo1_SK_tab03a.csv':(3,5,None),'PREZ2024_kolo2_SK_tab03a.csv':(3,4,None)}
for r in R:
 z=r['origins'][0];name=Path(z['input_path']).name;vals=r['raw']['values']
 if name.startswith('PRE_2014'):inds=(z['columns'][0]-1,z['columns'][1]-1,None)
 else:inds=proj[name]
 assert all(r[f]==(None if i is None else number(vals[i]))for f,i in zip(['votes','share','seats'],inds)),r['result_row_id']
ck('typed numeric source-cell roundtrip',True)
# Current roster equality independent of derived register labels.
def rawfile(n):return next(s['input_path']for s in S if Path(s['input_path']).name==n)
a=csvrecords(rawfile('OSO2022_SK_tab0dd.csv'))[3:];b=csvrecords(rawfile('OSO2022_SK_tab0dx.csv'))[3:];refs=csvrecords(rawfile('REF2026_SK_tab0b.csv'))[1:]
base={r[6]for r in a if r and r[0].strip()};city={r[0]for r in b if r and r[0].strip()};ref={r[6]for r in refs if r and r[0].strip()}
ck('2026 current territorial reconciliation',len(base)==2924 and city=={'582000','599981'}and ref-base=={'500267','518581','599999'}and not(base-ref))
ck('local exact source ID set and paired ballots',{o['source_code']for o in O if 'SK-OBEC-'in o['geography_id']}==base|city and all('SK-'+c+'-C'in om and'SK-'+c+'-M'in om for c in base|city))
ck('source name binding coverage',len(load('2014-name-bindings'))==2926 and {x['official_code']for x in load('2014-name-bindings')}==base|city)
ck('complete identity vectors',len(V['offices'])==len(O)and len(V['events'])==len(E)and len(V['results'])==len(R)and len(V['sources'])==len(S)and len(V['proceedings'])==len(PR))
ck('all result vector keys recompute',all(v['result_row_id']==key('result',v['natural_key'])and v['result_row_id']==R[int(v['source_pointer'].rsplit('/',1)[1])]['result_row_id']for v in V['results']))
ck('date precision and keys',all(v['date_id']=='date-'+H([N,v['owner'],v['owner_id'],v['slot']])and v['value']['precision']=='day'and v['value']['certainty']=='called'for v in V['research_dates']))
ck('223-column exact contract',sum(map(len,M.values()))==223 and all(set(M[t])==set(cols[t])for t in cols)and set(M)==set(cols))
# Read CREATE TABLE fields without executing SQLite or migrations.
texts=(P/'contract-reference/0002_atlas_master.sql').read_text()+'\n'+(P/'contract-reference/0001_atlas_attempt_log.sql').read_text()
for table,fields in cols.items():
 match=re.search(r'CREATE TABLE '+table+r'\s*\((.*?)\n\) STRICT;',texts,re.S);assert match,table
 got=re.findall(r'^\s{4}([a-z_0-9]+)\s+(?:TEXT|INTEGER|REAL)\b',match.group(1),re.M);assert set(got)==set(fields),(table,got,fields)
ck('column list verified from pinned DDL text without SQL',True)
ck('all effective input hashes',all(sha(B/x['input_path'])==x['sha256']and(B/x['input_path']).stat().st_size==x['byte_count']for x in I['hash_inputs']['inputs']))
ck('fingerprint recomputes',I['fingerprint_sha256']==H(I['hash_inputs'])and I['candidate_release_id']==L+'--sha256-'+H(I['hash_inputs']))
ck('tier hash source register guard',sha(B/I['tier_file']['input_path'])==I['tier_file']['sha256']and T['source_register']['sha256']==sha(D/'office-register.json'))
ck('DDL protected hashes',sha(P/'contract-reference/0001_atlas_attempt_log.sql')=='e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1'and sha(P/'contract-reference/0002_atlas_master.sql')=='1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da')
ck('no fixture IDs',all(not x.upper().startswith(('FIX-','FXT-'))for x in [*om,*[e['event_id']for e in E]]))
ck('no approvals checked',all('[x]'not in p.read_text().lower()for p in B.rglob('*.md')))
ck('at least15 real or isolated worked examples',len(re.findall(r'^## \d+\.',(P/'Slovakia_Acceptance_Examples.md').read_text(),re.M))>=15)
ck('applied changes zero',I['protection']['applied_changes']==0 and I['protection']['repo_mutations']==0 and I['protection']['importer_sqlite_vps_ui_changes']==0)
manifest=B/'SHA256SUMS'
if manifest.exists():
 listed={}
 for line in manifest.read_text().splitlines():
  h,path=line.split('  ',1);listed[path]=h;assert sha(B/path)==h,path
 ck('manifest exact member set',set(listed)=={str(p.relative_to(B))for p in B.rglob('*')if p.is_file()and p.name!='SHA256SUMS'})
 ck('all manifest member hashes',True)
else:ck('pre-manifest validation mode',True)
print(json.dumps({'status':'PASS','scope':'research pack validation only; no importer/SQLite executed','checks':checks,'counts':K,'applied_changes':0,'execution':{'importer':'Not run','SQLite':'Not run','VPS':'Not run','UI':'Not run','repository_mutation':'Not run'}},ensure_ascii=False,indent=2))
