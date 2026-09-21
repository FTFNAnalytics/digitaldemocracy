#!/usr/bin/env python3
"""Offline read-only research-pack validator. No importer/SQLite/network/repo writes."""
from pathlib import Path
import json,hashlib,collections,sys,zipfile,xml.etree.ElementTree as ET,datetime,re
B=Path(__file__).resolve().parent;D=B/'data/research/estonia';P=B/'docs/phase1/estonia'
def load(p):return json.loads(p.read_text())
def C(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)
def H(x):return hashlib.sha256(C(x).encode()).hexdigest()
def key(p,x):return p+'-'+H(x)[:24]
checks=[]
def ck(name,condition,detail=None):
 checks.append({'check':name,'status':'PASS'if condition else'FAIL','detail':detail})
 if not condition:raise AssertionError(name+': '+str(detail))
_cache={}
def digest(p):
 if p not in _cache:_cache[p]=hashlib.sha256(p.read_bytes()).hexdigest()
 return _cache[p]
I=load(P/'Estonia_Input_Inventory.json');O=load(D/'office-register.json');E=load(D/'events.json');R=load(D/'results.json');S=load(D/'sources.json');PR=load(D/'proceedings.json');G=load(D/'geography.json');K=load(D/'counts.json');T=load(B/'schemas/atlas/tiers/estonia.json');V=load(P/'Estonia_Identity_Vectors.json');N='cdd-observatory-v1';L='country-package-estonia'
try:
 for x in I['hash_inputs']['inputs']:
  p=B/x['input_path'];assert p.is_file()and p.stat().st_size==x['byte_count']and digest(p)==x['sha256'],x['input_path']
 ck('effective_input_hashes_and_bytes',True,len(I['hash_inputs']['inputs']))
 ck('fingerprint',H(I['hash_inputs'])==I['fingerprint_sha256'])
 ck('candidate_release',I['candidate_release_id']==L+'--sha256-'+I['fingerprint_sha256'])
 for x in I['hash_inputs']['schema_inputs']:assert digest(P/'contract-reference'/x['input_path'])==x['sha256']
 ck('pinned_DDL_reference_hashes',True)
 zcache={}
 for a in I['archive_members']:
  p=B/a['archive_path']
  if p not in zcache:zcache[p]=zipfile.ZipFile(p)
  b=zcache[p].read(a['archive_member']);assert hashlib.sha256(b).hexdigest()==a['sha256']==digest(B/a['input_path']);assert digest(p)==a['archive_sha256']
 ck('archive_members_recover_exactly',True,len(I['archive_members']))
 ids={o['office_id']for o in O};ck('office_ids_unique',len(ids)==len(O)==281)
 ck('current_historical_counts',sum(o['current']for o in O)==81 and sum(o['historical']for o in O)==200)
 ck('current_council_roster',sum(o['current']and o['office_type']=='local_government_council'for o in O)==78)
 roster=load(D/'register-source-rows.json');rc=dict(collections.Counter(str(x['cycle'])for x in roster));ck('roster_counts',rc=={'2013':215,'2017':79,'2021':79,'2025':78},rc)
 ck('tier_exact_set',set(x['office_id']for x in T['classifications'])==ids and len(T['classifications'])==len(O))
 ck('draft_no_approval',T['status']=='draft_for_human_review'and not T['approval']['Justin_accepted']and not T['approval']['production_accepted'])
 ck('tier_counts',dict(collections.Counter(x['tier']for x in T['classifications']))=={'municipal':278,'national':2,'other':1})
 ck('no_direct_mayor_offices',not any('mayor'in o['office_type']or o['election_mode']=='direct_executive'for o in O))
 gids={g['geography_id']for g in G};ck('geography_fks',all(o['geography_id']in gids for o in O)and len(gids)==len(G))
 ck('no_guessed_successors',all(g.get('successor_id')is None for g in G))
 ev={e['event_id']:e for e in E};ek={(e['office_id'],e['history_key'])for e in E};ck('events_unique_FK',len(ev)==len(ek)==len(E)==464 and all(e['office_id']in ids for e in E))
 for e in E:
  assert e['history_key']==e['office_id']+'::'+e['cycle'];assert e['event_id']==key('event',['estonia',N,e['history_key']])
 ck('event_ID_vectors',True)
 ps={p['proceeding_id']:p for p in PR};ck('proceeding_count_unique',len(ps)==len(PR)==24)
 for p in PR:
  assert (p['office_id'],p['history_key'])in ek;assert p['proceeding_id']==key('proceeding',[N,p['office_id'],p['history_key'],'ballot-'+str(p['sequence'])])
 ck('proceeding_ID_FKs',True)
 ss={s['source_id']:s for s in S};ck('sources_unique_hashes',len(ss)==len(S)and all(digest(B/s['input_path'])==s['sha256']for s in S))
 for s in S:assert s['source_id']=='estonia--'+key('url',s['url'])
 ck('source_identity',True)
 rids=set();trees={};sums=collections.Counter();counts=collections.Counter()
 for r in R:
  assert r['office_id']in ids and(r['office_id'],r['history_key'])in ek and r['event_id']in ev
  if r['proceeding_id']:
   p=ps[r['proceeding_id']];assert(p['office_id'],p['history_key'])==(r['office_id'],r['history_key'])
  assert r['result_row_id']==key('result',[N,r['office_id'],r['history_key'],r['proceeding_id']or'main',r['candidate_source_id']]);assert r['result_row_id']not in rids;rids.add(r['result_row_id'])
  for field in ['votes','share','seats']:
   v=r[field];st=r[field+'_status'];assert(v is None and st=='unknown')or(v==0 and st=='zero')or(v is not None and v>0 and st=='recorded')
   if field=='share'and v is not None:assert 0<=v<=100
  org=r['origin'];assert org['source_id']in ss and digest(B/org['input_path'])==org['sha256']
  if 'xpath'in org:
   f=B/org['input_path']
   if f not in trees:
    root=ET.parse(f).getroot()
    for el in root.iter():el.tag=el.tag.split('}')[-1]
    trees[f]=root
   root=trees[f];xp=org['xpath'];assert xp.startswith('/'+root.tag+'/');node=root
   for part in xp[len(root.tag)+2:].split('/'):
    mt=re.fullmatch(r'([^\[]+)(?:\[(\d+)\])?',part);tag,ix=mt.group(1),int(mt.group(2)or 1);children=[c for c in node if c.tag==tag];node=children[ix-1]
   assert node is not None,xp
   cid=node.findtext('candidateRegNumber')or node.findtext('registrationNumber');assert cid==r['candidate_source_id']
   value=node.findtext('votes')or node.findtext('candidateVotes')
   if value is None:value=next(x.findtext('value')for x in node.findall('votesDistributionRow/votesDistributionCell')if x.findtext('name')in['R','Hääli kokku'])
   assert int(value)==r['votes']
  sums[r['event_id']]+=r['votes'];counts[r['event_id']]+=1
 ck('all_result_ID_FKs_statuses_and_XML_votes',len(R)==49504,len(R))
 aud=load(D/'vote-reconciliation.json')
 for a in aud:assert sums[a['event_id']]==a['candidate_vote_sum']==a['supplied_valid_or_total']and counts[a['event_id']]==a['candidate_rows']
 ck('457_source_vector_reconciliations',len(aud)==457,'Does not resolve known2013cross-source625334vs625336conflict')
 ck('nonadditive_summaries_separate',len(load(D/'nonadditive-list-summaries.json'))==2999)
 for v in V['research_dates']:
  d=v['value'];assert v['date_id']=='date-'+H([N,v['owner'],v['owner_id'],v['slot']]);assert d['certainty']in['called','statutory','expected','conditional','unknown']
  if d['precision']=='year':assert d['month']is None and d['day']is None
  else:datetime.date(d['year'],d['month'],d['day'])
 ck('date_precision_and_IDs',True,len(V['research_dates']))
 ck('full_vector_coverage',len(V['offices'])==len(O)and len(V['events'])==len(E)and len(V['results'])==len(R)and len(V['proceedings'])==len(PR)and len(V['sources'])==len(S)and len(V['geographies'])==len(G))
 cols=load(P/'contract-columns.json');m=load(P/'column-map.json');ck('223_column_contract',set(cols)==set(m)and all(set(cols[t])==set(m[t])for t in cols)and sum(map(len,m.values()))==223)
 ck('fixture_exclusion',not any(x.upper().startswith(('FIX-','FXT-'))for x in ids|set(ev)|rids))
 ck('no_repo_importer_sqlite_vps_ui_changes',I['protection']['applied_changes']==0)
 md=(P/'Estonia_Acceptance_Examples.md').read_text();ck('worked_examples',sum(l.startswith('## ')for l in md.splitlines())>=15)
 ck('Justin_boxes_unchecked',not any('[x]'in p.read_text().lower()for p in B.rglob('*.md')if'contract-reference'not in str(p)))
 # Manifest does not include itself; validation.json was generated in an earlier pass.
 mf=B/'SHA256SUMS'
 if mf.exists():
  listed={}
  for line in mf.read_text().splitlines():h,n=line.split('  ',1);assert digest(B/n)==h,n;listed[n]=h
  actual={str(p.relative_to(B))for p in B.rglob('*')if p.is_file()and p!=mf};ck('manifest_all_member_hashes',set(listed)==actual,len(listed))
 else:checks.append({'check':'manifest_all_member_hashes','status':'PENDING_FINAL_MANIFEST','detail':'Finalization must run validator again after writing manifest.'})
 result={'status':'PASS','validator_scope':'offline research integrity only; not importer or SQLite CI','checks':checks,'counts':K,'applied_changes':0,'execution':{x:'Not run'for x in ['importer','SQLite','VPS','UI','publication_CI']},'research_coverage_complete':False,'Justin_approved':False}
except Exception as e:
 result={'status':'FAIL','error':str(e),'checks':checks,'applied_changes':0}
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['status']=='PASS'else 1)
