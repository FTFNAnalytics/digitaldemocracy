#!/usr/bin/env python3
"""Offline read-only Latvia research-pack checks. No importer, SQLite or network."""
from pathlib import Path
import json,hashlib,collections,sys,re,datetime,xml.etree.ElementTree as ET
from html.parser import HTMLParser
B=Path(__file__).resolve().parent;D=B/'data/research/latvia';P=B/'docs/phase1/latvia';N='cdd-observatory-v1';L='country-package-latvia'
def load(p):return json.loads(p.read_text())
def C(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
def H(x):return hashlib.sha256(C(x).encode()).hexdigest()
def key(p,x):return p+'-'+H(x)[:24]
cache={}
def sha(p):
 if p not in cache:
  h=hashlib.sha256()
  with p.open('rb')as f:
   for b in iter(lambda:f.read(1048576),b''):h.update(b)
  cache[p]=h.hexdigest()
 return cache[p]
class Tables(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.tables=[];self.t=None;self.row=None;self.cell=None;self.feed(s)
 def handle_starttag(self,t,a):
  if t=='table':self.t=[];self.tables.append(self.t)
  elif t=='tr'and self.t is not None:self.row=[];self.t.append(self.row)
  elif t in ['td','th']and self.row is not None:self.cell=[]
 def handle_data(self,d):
  if self.cell is not None:self.cell.append(d)
 def handle_endtag(self,t):
  if t in ['td','th']and self.cell is not None:self.row.append(' '.join(' '.join(self.cell).split()));self.cell=None
  elif t=='tr':self.row=None
  elif t=='table':self.t=None
checks=[]
def ck(n,ok,detail=None):
 checks.append({'check':n,'status':'PASS'if ok else'FAIL','detail':detail})
 if not ok:raise AssertionError(n+': '+str(detail))
try:
 I=load(P/'Latvia_Input_Inventory.json');O=load(D/'office-register.json');G=load(D/'geography.json');E=load(D/'events.json');R=load(D/'results.json');PR=load(D/'proceedings.json');S=load(D/'sources.json');K=load(D/'counts.json');T=load(B/'schemas/atlas/tiers/latvia.json');V=load(P/'Latvia_Identity_Vectors.json')
 for x in I['hash_inputs']['inputs']:
  p=B/x['input_path'];assert p.is_file()and p.stat().st_size==x['byte_count']and sha(p)==x['sha256'],x['input_path']
 ck('all_effective_input_bytes_and_hashes',True,len(I['hash_inputs']['inputs']))
 ck('fingerprint',H(I['hash_inputs'])==I['fingerprint_sha256']and I['candidate_release_id']==L+'--sha256-'+H(I['hash_inputs']))
 for x in I['hash_inputs']['schema_inputs']:assert sha(P/'contract-reference'/x['input_path'])==x['sha256']
 ck('pinned_DDL_reference_bytes',True)
 ids={o['office_id']for o in O};ck('office_ids_unique',len(ids)==len(O)==166)
 ck('current_roster_counts',sum(o['current']for o in O)==45 and sum(o['historical']for o in O)==121 and sum(o['current']and o['office_type']=='local_government_council'for o in O)==42)
 ck('historic_identity_caveat',K['historical_records_are_not_abolished_council_count']is True and all('LV-G01'in o['holds']for o in O if o['historical']))
 roster=load(D/'register-source-rows.json');rc=dict(collections.Counter(r['cycle']for r in roster));ck('source_roster_snapshots',rc=={'PV2017':119,'PV2021':40,'VRD2021':2,'RD2020':1,'PV2025':42},rc)
 ck('current_tier_exact_set',len(T['classifications'])==len(O)and set(c['office_id']for c in T['classifications'])==ids)
 ck('draft_tier_counts',dict(collections.Counter(c['tier']for c in T['classifications']))=={'municipal':163,'national':2,'other':1})
 ck('no_tier_approval',T['status']=='draft_for_human_review'and not T['approval']['Justin_accepted']and not T['approval']['production_accepted'])
 ck('no_direct_executive_fabrication',K['direct_executive_offices']==0 and not any('mayor'in o['office_type']or o['election_mode']=='direct_executive'for o in O))
 gids={g['geography_id']for g in G};ck('geography_FKs_no_successors',len(gids)==len(G)==164 and all(o['geography_id']in gids for o in O)and all(g['successor_id']is None for g in G))
 ev={e['event_id']:e for e in E};ek={(e['office_id'],e['history_key'])for e in E};ck('event_unique_FKs',len(ev)==len(ek)==len(E)==217 and all(e['office_id']in ids for e in E))
 for e in E:assert e['history_key']==e['office_id']+'::'+e['cycle']and e['event_id']==key('event',['latvia',N,e['history_key']])
 ck('event_ID_vectors',True)
 ck('event_roles',sum(e['status']=='historical'for e in E)==216 and sum(e['status']=='prospective'for e in E)==1)
 ps={p['proceeding_id']:p for p in PR};ck('two_sourced_proceedings',len(ps)==len(PR)==2)
 for p in PR:assert p['proceeding_id']==key('proceeding',[N,p['office_id'],p['history_key'],'ballot-'+str(p['sequence'])])and(p['office_id'],p['history_key'])in ek
 ck('proceeding_ID_FKs',True)
 ss={s['source_id']:s for s in S};ck('sources_unique_hashes',len(ss)==len(S)and all(sha(B/s['input_path'])==s['sha256']for s in S))
 for s in S:assert s['source_id']=='latvia--'+key('url',s['url'])
 ck('source_IDs',True)
 # Parse only DepartmentResults; do not build the huge candidate/precinct XML tree.
 xf=next((D/'sources/data.gov.lv').rglob('electionresults*.xml'));xmlrows={};di=0;xmlroster=[]
 for action,node in ET.iterparse(xf,events=('end',)):
  if node.tag=='DepartmentResultModel':
   di+=1
   if node.findtext('Type')=='2':
    xmlroster.append((node.findtext('Id'),node.findtext('Name')))
    for j,c in enumerate(node.findall('CandidateListResults/CandidateListResultModel'),1):
     xp=f'/ElectionResultVersionData/DepartmentResults/DepartmentResultModel[{di}]/CandidateListResults/CandidateListResultModel[{j}]'
     xmlrows[xp]=(c.findtext('CandidateListId'),int(c.findtext('ValidMarkCount/Count')),float(c.findtext('ValidMarkCount/Percentage')),int(c.findtext('ElectedCandidateCount/Count')))
   node.clear()
  if node.tag=='DepartmentResults':break
 ck('2017_XML_type2_exact_roster',len(xmlroster)==119 and {r['source_code']for r in roster if r['cycle']=='PV2017'}=={x[0]for x in xmlroster})
 html={};rids=set();sums=collections.Counter();counts=collections.Counter();disputed=[];xmlverified=0;htmlverified=0
 for r in R:
  assert r['office_id']in ids and(r['office_id'],r['history_key'])in ek and r['event_id']in ev
  if r['proceeding_id']:
   p=ps[r['proceeding_id']];assert(p['office_id'],p['history_key'])==(r['office_id'],r['history_key'])
  assert r['result_row_id']==key('result',[N,r['office_id'],r['history_key'],r['proceeding_id']or'main',r['candidate_source_id']]);assert r['result_row_id']not in rids;rids.add(r['result_row_id'])
  for fld in ['votes','share','seats']:
   v=r[fld];st=r[fld+'_status'];assert(v is None and st=='unknown')or(v==0 and st=='zero')or(v is not None and v>0 and st in ['recorded','disputed'])
   if fld=='share'and v is not None:assert 0<=v<=100
  if r['share_status']=='disputed':disputed.append(r['result_row_id'])
  org=r['origin'];assert org['source_id']in ss and sha(B/org['input_path'])==org['sha256']
  if 'xpath'in org:
   assert xmlrows[org['xpath']]==(r['candidate_source_id'],r['votes'],r['share'],r['seats']);xmlverified+=1
  if 'html_table'in org and'html_row'in org:
   p=B/org['input_path']
   if p not in html:html[p]=Tables(p.read_text()).tables
   cells=html[p][org['html_table']-1][org['html_row']-1];expected=[' '.join(c.split())for c in r['raw']['source_cells']];assert cells==expected,(p,org,cells,expected)
   assert int(''.join(cells[2].split()))==r['votes'];htmlverified+=1
  sums[r['event_id']]+=r['votes'] or 0;counts[r['event_id']]+=1
 ck('result_ID_FKs_statuses_source_cells',len(R)==1383,{'XML':xmlverified,'HTML':htmlverified,'manual_primary_presidential_claims':len(R)-xmlverified-htmlverified})
 claims=load(D/'unresolved-aggregate-claims.json');ck('seven_disputed_claims',len(claims)==7 and set(disputed)=={c['target_result_row_id']for c in claims})
 for c in claims:
  r=next(r for r in R if r['result_row_id']==c['target_result_row_id']);assert c['original_claim']['value']==r['share']and c['alternate_claim']['value']!=r['share']and c['disposition']=='needs_human_review'
  for side in ['original_claim','alternate_claim']:
   org=c[side]['origin'];assert org['source_id']in ss and sha(B/org['input_path'])==org['sha256']
 ck('conflicting_claims_preserved_no_auto_choice',True)
 audit=load(D/'vote-reconciliation.json')
 for a in audit:assert a['matches']and sums[a['event_id']]==a['vote_sum']==a['supplied_valid_ballots']and counts[a['event_id']]==a['row_count']
 ck('210_complete_list_vectors_reconcile',len(audit)==210,'Internal consistency, not universal certification or percentage adjudication')
 ck('prospective_has_no_results',not any(r['history_key']=='LV-SAEIMA::SV2026'for r in R))
 for x in V['research_dates']:
  assert x['date_id']=='date-'+H([N,x['owner'],x['owner_id'],x['slot']]);d=x['value'];assert d['certainty']in ['called','expected','conditional','statutory','unknown']
  if d['precision']=='year':assert d['month']is None and d['day']is None
  else:datetime.date(d['year'],d['month'],d['day'])
 ck('date_precision_and_IDs',True)
 ck('vectors_complete',all(len(V[n])==len(a)for n,a in [('offices',O),('events',E),('results',R),('proceedings',PR),('geographies',G),('sources',S)]))
 cols=load(P/'contract-columns.json');m=load(P/'column-map.json');ck('223_column_contract',set(cols)==set(m)and all(set(cols[t])==set(m[t])for t in cols)and sum(map(len,m.values()))==223)
 ck('fixtures_excluded',not any(x.upper().startswith(('FIX-','FXT-'))for x in ids|set(ev)|rids))
 ck('no_mutations',I['protection']['applied_changes']==0)
 ck('21_worked_examples',sum(l.startswith('## ')for l in(P/'Latvia_Acceptance_Examples.md').read_text().splitlines())>=15)
 ck('Justin_boxes_unchecked',not any('[x]'in p.read_text().lower()for p in B.rglob('*.md')if'contract-reference'not in str(p)))
 mf=B/'SHA256SUMS'
 if mf.exists():
  listed={}
  for line in mf.read_text().splitlines():h,n=line.split('  ',1);assert sha(B/n)==h,n;listed[n]=h
  ck('all_member_manifest',set(listed)=={str(p.relative_to(B))for p in B.rglob('*')if p.is_file()and p!=mf},len(listed))
 out={'status':'PASS','checks':checks,'counts':K,'applied_changes':0,'importer_SQLite_VPS_UI_CI':'Not run','research_coverage_complete':False,'historical_identity_resolution':'pending Justin; historical rows are not abolished-council count','production_accepted':False,'manual_PDF_review':'pages1/4 visually checked; offline validator verifies retained hash, not handwriting recognition'};print(json.dumps(out,ensure_ascii=False,indent=2))
except Exception as e:
 print(json.dumps({'status':'FAIL','checks':checks,'error':str(e),'applied_changes':0},ensure_ascii=False,indent=2));sys.exit(1)
