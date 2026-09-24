#!/usr/bin/env python3
"""Read-only documentary-pack validation. Standard library; no database/network writes.

Default: verify all data, source hashes and manifest. Build-only --skip-manifest
and --report PATH allow a pre-manifest report; never overwrite a manifested file
after its checksum has been calculated.
"""
import argparse, collections, csv, datetime, gzip, hashlib, json, re, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def read(n):return [json.loads(l) for l in (ROOT/'data'/(n+'.jsonl')).open(encoding='utf-8')]
def js(n):return json.loads((ROOT/'data'/(n+'.json')).read_text(encoding='utf-8'))
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1048576),b''):h.update(b)
 return h.hexdigest()
def number(v):
 if v is None or str(v).strip() in ('','-','--'):return None
 assert re.fullmatch(r'\d[\d.]*',str(v).strip()),('Unexpected numeric source literal',v)
 return int(str(v).strip().replace('.',''))
def safe_path(rel):
 p=(ROOT/rel).resolve();assert p.is_relative_to(ROOT),('Unsafe path',rel);assert p.is_file(),('Missing file',rel);return p

def validate(skip_manifest=False):
 checks=[]
 def ok(name,condition,detail=None):
  assert condition,(name,detail);checks.append(dict(check=name,status='pass',detail=detail))
 O=read('office-register');E=read('events');U=read('reporting-units');T=read('draft-tiers');G=read('territorial-register');L=read('event-office-links');C=js('counts');S=js('source-inventory');A=js('approval-state')
 oi={o['office_id']:o for o in O};ei={e['event_id']:e for e in E};ui={u['reporting_unit_id']:u for u in U};si={s['source_id']:s for s in S}
 current=[o for o in O if o['status']=='current'];historical=[o for o in O if o['status']=='historical_only'];pending=[o for o in O if o['status']=='statutory_pending_first_election'];ti=collections.Counter(t['office_id'] for t in T)
 ok('unique office/event/reporting-unit/source identities',len(oi)==len(O) and len(ei)==len(E) and len(ui)==len(U) and len(si)==len(S))
 ok('all current territories and core municipal offices',len(G)==7894 and len({g['PRO_COM_T'] for g in G})==7894)
 for g in G:
  for role in ['council','mayor']:
   o=oi['IT.COMUNE.'+g['PRO_COM_T']+'.'+role];assert o['status']=='current' and o['territory_code']==g['PRO_COM_T'] and o['region_code']==g['COD_REG'];assert g['COMUNE'] in o['name'];assert o['cadastral_code']==g['COD_CATASTO']
 ok('council and direct mayor per current comune',sum(o['office_type']=='municipal_council' for o in current)==7894 and sum(o['office_type']=='direct_mayor' and o['direct_executive'] for o in current)==7894)
 ok('current Vallecrosia al mare name',sum('Vallecrosia al mare' in o['name'] for o in current)==2)
 deputies=[o for o in current if o['office_type']=='direct_deputy_mayor'];ok('Valle d Aosta joint-ticket deputy mayors',len(deputies)==74 and all(o['region_code']=='02' and o['direct_executive'] for o in deputies))
 ok('20 regional councils and 18 direct presidents',sum(o['office_type']=='regional_council' for o in current)==20 and sum(o['office_type']=='direct_regional_president' for o in current)==18 and all('IT.REGIONE.'+r+'.president' not in oi for r in ['02','04']))
 ok('TAA composite regional council',oi['IT.REGIONE.04.council']['selection_mode']=='composed_of_directly_elected_provincial_councillors' and not any(e['office_id']=='IT.REGIONE.04.council' for e in E))
 ok('two autonomous provinces, Trento direct president only',set(o['office_id'] for o in current if o['level']=='provincial')=={'IT.PROVINCE.021.council','IT.PROVINCE.022.council','IT.PROVINCE.022.president'})
 ok('FVG transition remains separately pending',len(pending)==8 and all(o['office_id'].startswith('IT.FVG.2026.') for o in pending) and not any(e['office_id'] in {o['office_id'] for o in pending} for e in E))
 ok('ordinary provinces/metropolitan bodies not invented popular',not any(o['level']=='provincial' and o['status']=='current' and not o['office_id'].startswith('IT.PROVINCE.02') for o in O))
 dispositions=read('provincial-metropolitan-dispositions');ok('all current ISTAT provincial-level units dispositioned',len(dispositions)==len({g['COD_UTS'] for g in G})==110)
 ok('Firenze five councils and direct presidents',len([o for o in current if o['level']=='submunicipal'])==10 and all('IT.FIRENZE.Q'+str(n)+'.'+r in oi for n in range(1,6) for r in ['council','president']))
 ok('distinct national offices and EP',set(o['office_id'] for o in current if o['level'] in {'national','EP'})=={'IT.NATIONAL.camera','IT.NATIONAL.senato','IT.NATIONAL.president','IT.EP'})
 ok('indirect President',oi['IT.NATIONAL.president']['selection_mode']=='parliament_joint_session_and_regional_delegates' and not oi['IT.NATIONAL.president']['direct_executive'])
 pe=[e for e in E if e['office_id']=='IT.NATIONAL.president'];ok('13 source-numbered winning presidential ballots',len(pe)==13 and all(e['ballot_basis']=='indirect_assembly_ballot' and type(e['ballot_number']) is int and e['ballot_number']>0 for e in pe))
 ok('no presidential popular universe',all(e['ballot_basis']!='popular_ballot' for e in pe))
 cross=read('successor-crosswalk');changes=read('official-territorial-changes');es=[r for r in changes if r['DESC_COD_VARIAZIONE'].startswith('ES-')]
 ok('historic extinctions only from explicit ES source rows',len(cross)==len(es)==348 and len(historical)==696 and all(not x['office_successor_asserted'] for x in cross))
 for x in cross:
  source=changes[x['source_row']-1];assert source['PRO_COM_T']==x['from_territory_code'] and source['PRO_COM_T_REL']==x['to_territory_code'] and source['PROVVEDIMENTO']==x['legal_reference'];assert source['DESC_COD_VARIAZIONE'].startswith('ES-')
  for role in ['council','mayor']:
   o=oi['IT.COMUNE.'+x['from_territory_code']+'.ended-'+x['effective_date']+'.'+role];assert o['effective_to']==x['effective_date'] and o['status']=='historical_only'
 ok('territorial recoding is not a guessed merger',len(changes)==2356 and all(x['relationship']=='official_territorial_extinction_into_related_unit' for x in cross))
 ok('tier bijection and unchecked approvals',set(ti)==set(oi) and len(T)==len(O) and set(ti.values())=={1} and all(t['review_status']=='unapproved_draft' and t['justin_approved'] is False for t in T))
 ok('draft tier histogram',dict(collections.Counter(str(t['draft_tier']) for t in T))==C['draft_tier_histogram'])
 ok('office and event approvals false',all(o['justin_approved'] is False for o in O) and all(e['justin_approved'] is False for e in E))
 ok('applied changes zero and all approvals false',A['applied_changes']==0 and A['research_only'] is True and all(v is False for v in A['justin_approvals'].values()) and all(A[k]==0 for k in ['importer_changes','sqlite_changes','vps_changes','ui_changes','repository_changes','publication_attempts']))
 for p in [ROOT/'README.md',*list((ROOT/'docs').rglob('*.md'))]:assert not re.search(r'^\s*[-*]\s+\[[xX]\]',p.read_text(),re.M),('Checked approval box',p)
 ok('all Markdown approval boxes unchecked',True)
 contract=json.loads((ROOT/'contract/columns.json').read_text());provenance=json.loads((ROOT/'contract/provenance.json').read_text());fm=read('field-map-223')
 ok('exact inherited 223-column 20-table contract',len(contract)==20 and sum(map(len,contract.values()))==223 and sha(ROOT/'contract/columns.json')==provenance['sha256'])
 ok('field-map complete 1 to 1',len(fm)==223 and {(r['table'],r['column']) for r in fm}=={(t,c) for t,cols in contract.items() for c in cols} and all(r['italy_mapping'] and r['applied_changes']==0 and r['justin_approved'] is False for r in fm))
 for e in E:
  assert e['office_id'] in oi and e['source_id'] in si
  if e['date'] is not None:datetime.date.fromisoformat(e['date']);assert e['date_precision']=='day'
  else:assert e['date_precision'] in {'year','unknown'}
  for k,v in e.items():
   if k.endswith('source_id') and v:assert v in si,(e['event_id'],k,v)
 for o in O:
  assert o['source_id'] in si
  if o['legal_source_id']:assert o['legal_source_id'] in si
 for u in U:assert u['event_id'] in ei and u['source_id'] in si
 ok('event office/source/unit references and date precision',True)
 for l in L:assert l['event_id'] in ei and l['office_id'] in oi and l['vote_duplication_permitted'] is False
 ok('joint events cannot duplicate votes',any(l['relationship']=='same_joint_list_mayor_ballot' for l in L))
 ep=[e for e in E if e['office_id']=='IT.EP'];ok('ten EP cycles, year-only historic precision',len(ep)==10 and {e['cycle_label'] for e in ep}=={str(y) for y in range(1979,2025,5)} and all(e['date'] is None and e['date_precision']=='year' for e in ep if e['cycle_label']!='2024'))
 be=[e for e in E if e['office_id']=='IT.PROVINCE.021.council'];ok('17 Bolzano historical council polls',len(be)==17 and min(e['date'] for e in be)=='1948-11-28' and max(e['date'] for e in be)=='2023-10-22')
 audit=js('taa-extraction-audit');ok('TAA 282 documents, 281 attachments, no invented Lana values',len(audit)==282 and sum(a['status']=='no_attachment_in_official_index' for a in audit)==1 and sum(a['extracted_results']>0 for a in audit)==281 and not any(a.get('unparsed_table_rows') for a in audit))

 result_count=0;kinds=collections.Counter();sources=collections.Counter();vt=collections.Counter();event_counts=collections.Counter();nullvotes=0;zerovotes=0;nullseats=0;bz=collections.defaultdict(list);candidate_keys=set();ep_national=[];csv_expect=collections.defaultdict(list);capacity=0;runofflist=0
 csvfiles={'camera-2022-Italia-livcomune.csv','senato-2022-italia-livcomune.csv','regionali-20230212.csv','europee-2024-italia-livcomune.csv','comunali-20240728.csv','firenze2024-council.csv','firenze2024-mayor.csv','firenze2024-subdivisions.csv'}
 with gzip.open(ROOT/'data/results.jsonl.gz','rt',encoding='utf-8') as f:
  for line in f:
   r=json.loads(line);result_count+=1;assert r['result_id']=='IT-R-'+str(result_count).zfill(8),('Nonunique/out-of-order result ID',result_count)
   assert r['event_id'] in ei and r['reporting_unit_id'] in ui and ui[r['reporting_unit_id']]['event_id']==r['event_id'];assert r['source_id'] in si
   for field in ['votes','seats']:assert r[field] is None or (type(r[field]) is int and r[field]>=0),(r['result_id'],field,r[field])
   assert r['source_row'] is not None and r['label'] is not None
   sources[r['source_id']]+=1;kinds[r['result_kind']]+=1;vt[r['vote_type']]+=1;event_counts[r['event_id']]+=1
   nullvotes+=r['votes'] is None;zerovotes+=r['votes']==0;nullseats+=r['seats'] is None
   if r['vote_type']=='published_uninominal_candidate_votes':
    key=(r['event_id'],r['reporting_unit_id'],r['label']);assert key not in candidate_keys,('Duplicate coalition candidate total',key);candidate_keys.add(key)
   if r['source_id'].startswith('IT-S-bolzano-'):bz[r['event_id']].append(r)
   if r['vote_type']=='EP_national_party':assert r['votes'] is None;ep_national.append(r)
   if r['vote_type']=='first_round_list_seats_reported_after_runoff':assert r['votes'] is None and ei[r['event_id']]['variant']=='round-1';runofflist+=1
   if r['result_kind']=='council_capacity':assert r['votes'] is None;capacity+=1
   if r['vote_type']=='indirect_assembly_ballot':assert ei[r['event_id']]['office_id']=='IT.NATIONAL.president'
   fn=si[r['source_id']]['input_path'].split('/')[-1]
   if fn in csvfiles:
    if fn in {'camera-2022-Italia-livcomune.csv','senato-2022-italia-livcomune.csv'}:fld=r['label'] if r['result_kind']=='metric' else 'VOTILISTA' if r['vote_type']=='published_list_votes' else 'VOTICANDIDATO'
    elif fn=='regionali-20230212.csv':fld='VOTICAND' if r['vote_type']=='presidential_candidate' else 'VOTILISTA'
    elif fn=='europee-2024-italia-livcomune.csv':fld=r['label'] if r['result_kind']=='metric' else 'NUMVOTI'
    elif fn=='comunali-20240728.csv':fld='VOTICAND' if r['vote_type']=='mayoral_candidate' else 'VOTILISTA'
    elif fn=='firenze2024-subdivisions.csv':fld='VOTI_LISTA' if r['vote_type']=='quartiere_list' else 'VOTI'
    else:fld='VOTI'
    sf='SEGGILISTA' if fn=='comunali-20240728.csv' and r['vote_type']=='list' else None
    csv_expect[fn].append((r['source_row'],fld,r['votes'],sf,r['seats']))
 ok('result IDs, foreign keys and nonnegative integer/null values',result_count==C['results'],result_count)
 ok('quarantined June export contributes no rows',sources['IT-S-comunali-20240609.csv']==0 and 'quarantined' in si['IT-S-comunali-20240609.csv']['disposition'])
 ok('explicit missing/zero distinction',nullvotes==C['missing_and_explicit_zero_counts']['votes_null'] and zerovotes==C['missing_and_explicit_zero_counts']['explicit_votes_zero'] and nullseats==C['missing_and_explicit_zero_counts']['seats_null'])
 ok('result-kind and vote-type histograms',dict(kinds)==C['result_kinds'] and dict(vt)==C['vote_types'])
 ok('round-two mayor figures do not create second-round list votes',runofflist==38)
 ok('capacity separate from party seat allocations',capacity==281)
 checked_csv=0
 for fn,expect in csv_expect.items():
  b=(ROOT/'sources'/fn).read_bytes()
  try:t=b.decode('utf-8-sig')
  except UnicodeDecodeError:t=b.decode('cp1252')
  source_rows={i:r for i,r in enumerate(csv.DictReader(t.splitlines(),delimiter=';'),2)}
  for row,fld,v,sf,seats in expect:
   raw=source_rows[row];assert number(raw[fld])==v,('CSV value mismatch',fn,row,fld,raw[fld],v)
   if sf:assert number(raw[sf])==seats,('CSV seat mismatch',fn,row,sf)
   checked_csv+=1
 ok('every normalized CSV numeric observation matches its original source cell',checked_csv>600000,checked_csv)
 for r in ep_national:
  original=json.loads(safe_path(si[r['source_id']]['input_path']).read_text());index=int(r['source_row'].rsplit('/',1)[1]);x=original['partySummary']['seatsByParty'][index]
  assert x['id']==r['source_party_id'] and x.get('seatsTotal')==r['seats'] and x.get('votesPercent')==r['published_percent']
  assert original['partySummary']['resultsByPartyHeader']['status']==ei[r['event_id']]['source_vote_status'] and original['partySummary']['breakdownByPartyHeader']['status']==ei[r['event_id']]['source_seat_status']
 ok('EP raw votes absent, supplied shares/seats and statuses exact',len(ep_national)==140)
 ba=js('arithmetic-audit');bad=0
 for a in ba:
  rr=bz[a['event_id']];parts=[r for r in rr if r['result_kind']!='metric'];totals=[r for r in rr if r['result_kind']=='metric'];total=totals[0]['votes'] if totals else None
  assert sum(r['votes'] or 0 for r in parts)==a['calculated_party_row_sum_for_audit_only'];assert total==a['reported_total_votes'];assert a['numeric_correction_applied'] is False
  if a['status']=='published_arithmetic_discrepancy_preserved':bad+=1;assert ei[a['event_id']]['numeric_quality_flag']==a['status'] and total!=a['calculated_party_row_sum_for_audit_only']
 ok('published arithmetic discrepancies preserved and flagged',bad==C['arithmetic_discrepancies']==7)
 bo=collections.defaultdict(set)
 for e in E:bo[e['office_id']].add(e['event_id'])
 for l in L:bo[l['office_id']].add(l['event_id'])
 coverage=read('office-history-coverage');assert len(coverage)==len(O)
 for r in coverage:assert r['documented_event_count']==len(bo[r['office_id']]) and r['numeric_event_count']==sum(event_counts[e]>0 for e in bo[r['office_id']])
 ok('missing office history is explicit, not zero contests',set(r['office_id'] for r in coverage)==set(oi))
 calendar=read('calendar');ok('all current and pending offices survive alert horizon',set(r['office_id'] for r in calendar)=={o['office_id'] for o in current+pending} and all(r['next_date'] is None and r['justin_approved'] is False for r in calendar))
 ok('count summary agrees with artifacts',C['offices_current']==len(current)==15917 and C['offices_historical']==len(historical)==696 and C['offices_statutory_pending_first_election']==len(pending)==8 and C['offices_total']==len(O)==16621 and C['events']==len(E)==515 and C['reporting_units']==len(U)==28989 and C['retained_sources']==len(S)==409)
 ok('current executive and collective-body counts',C['current_direct_executive_offices']==sum(o['direct_executive'] for o in current)==7992 and C['current_collective_bodies']==sum(not o['direct_executive'] and o['office_type']!='indirect_head_of_state' for o in current)==7924)
 ok('regional municipality counts sum exactly',sum(r['municipalities'] for r in C['regions'])==7894 and len(C['regions'])==20 and sum(r['special_statute'] for r in C['regions'])==5)
 ok('research incompleteness explicit',C['full_requested_scope_complete'] is False and len(js('research-gaps'))>=15 and all(r['justin_approved'] is False for r in js('research-gaps')))
 examples=js('acceptance-examples');ok('at least 15 distinct evidence-backed acceptance examples',len(examples)==32 and len({x['example_id'] for x in examples})==32 and all(safe_path(x['evidence']) for x in examples))
 for s in S:
  p=safe_path(s['input_path']);assert p.stat().st_size==s['byte_count'] and sha(p)==s['sha256'],('Source hash/size mismatch',s['input_path'])
 ok('every source byte hash and length',len(S),len(S))
 manifested=0
 if not skip_manifest:
  manifest={}
  for l in (ROOT/'SHA256SUMS').read_text().splitlines():
   h,rel=l.split('  ',1);assert re.fullmatch('[0-9a-f]{64}',h) and rel not in manifest;manifest[rel]=h
  files={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name!='SHA256SUMS'}
  assert set(manifest)==files,('Manifest membership differs',sorted(set(manifest)^files))
  for rel,h in manifest.items():assert sha(safe_path(rel))==h,('Manifest hash mismatch',rel)
  manifested=len(manifest);ok('SHA256SUMS membership and every artifact hash',True,manifested)
 return dict(status='PASS_WITH_DOCUMENTED_RESEARCH_GAPS',validation_stage='pre_seal_data_and_source_checks' if skip_manifest else 'sealed_pack_hash_and_data_checks',applied_changes=0,justin_approved=False,checks_passed=len(checks),checks=checks,offices_current=len(current),offices_historical=len(historical),offices_pending=len(pending),events=len(E),results=result_count,source_files_verified=len(S),csv_observations_verified=checked_csv,manifest_checked=not skip_manifest,manifest_files_verified=manifested,known_source_arithmetic_discrepancies=bad,full_requested_scope_complete=False,limitations='Validation checks the stated documentary invariants and source bytes. It does not certify elections, approve the pack, or close missing research.')

if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--skip-manifest',action='store_true');p.add_argument('--report',type=Path);args=p.parse_args()
 try:
  report=validate(args.skip_manifest)
  if args.report:args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
  print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False));sys.exit(0)
 except (AssertionError,KeyError,ValueError,OSError) as e:
  print(json.dumps(dict(status='FAIL',error=str(e)),ensure_ascii=False));sys.exit(1)
