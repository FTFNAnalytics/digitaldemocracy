#!/usr/bin/env python3
"""Read-only offline validation of this research pack. No imports into any system."""
import pathlib,json,hashlib,collections,datetime,re,sys,xml.etree.ElementTree as ET
P=pathlib.Path(__file__).resolve().parent
def j(p):return json.loads((P/p).read_text())
def jl(p):return [json.loads(x) for x in (P/p).read_text().splitlines() if x]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def ck(name,test):
 if not test:raise AssertionError(name)
 checks.append(name)
def main():
 O=jl('data/office-register.jsonl');T=jl('data/draft-tiers.jsonl');E=jl('data/events.jsonl');R=jl('data/results.jsonl');H=jl('data/territorial-holds.jsonl');TR=jl('data/territorial-register.jsonl');N=jl('data/nested-district-audit.jsonl');S=jl('sources/source-inventory.jsonl');M=j('manifest.json');C=j('counts.json');G=j('research-gaps.json');A=j('acceptance-examples.json');F=j('field-map-223.json');COL=j('contracts/columns.json')
 ob={o['office_id']:o for o in O};eb={e['event_id']:e for e in E};sb={s['source_id']:s for s in S};rb=collections.defaultdict(list)
 for r in R:rb[r['event_id']].append(r)
 ck('unique office/event/result/source IDs',len(ob)==len(O) and len(eb)==len(E) and len({r['result_id'] for r in R})==len(R) and len(sb)==len(S))
 ck('counted current and historical register',len(O)==3005 and sum(o['office_status']=='current' for o in O)==3000 and sum(o['office_status']=='historical_only' for o in O)==5)
 ck('manifest counts equal actual records',C['total_offices']==len(O) and C['events']==len(E) and C['results']==len(R) and len(E)==3322 and len(R)==46800)
 ck('1:1 draft tiers including historical offices',len(T)==len(O) and {t['office_id'] for t in T}==set(ob) and len({t['office_id'] for t in T})==len(T))
 ck('draft tier histogram',dict(collections.Counter(t['draft_tier'] for t in T))==C['draft_tier_histogram'])
 current=[o for o in O if o['office_status']=='current']
 ck('councils and direct executives',sum(o['office_kind']=='council' for o in current)==1577 and sum(o['is_direct_executive'] for o in current)==1422 and sum(o['office_kind']=='legislature' for o in current)==1)
 ck('national oblast raion hromada nested breakout',dict(collections.Counter(o['scope_level'] for o in current))=={'national':2,'oblast':22,'raion':119,'hromada':2842,'city_district':15})
 ck('all scope rows Ukraine and zero EP',all(o['country_scope']=='Ukraine' and o['institutional_scope']=='Ukrainian_institution' and not o['ep_office'] for o in O) and M['ep_offices']==0 and M['occupying_power_offices']==0)
 ck('no guessed office successor/predecessor',all(o['successor_id'] is None and o['predecessor_id'] is None for o in O))
 ck('no self-parent territorial relationships',all(o.get('parent_territory_code')!=o.get('territory_code') for o in O if o.get('parent_territory_code')))
 ck('no applied changes or approvals',M['applied_changes']==0 and not M['production_mutations'] and all(v is False for v in M['justin_approvals'].values()) and all(x.get('justin_approved') is False for x in O+T+E+G+A) and all(x.get('applied') is False for x in O+T+E+G))
 ck('no checked Justin Markdown boxes',all(not re.search(r'\[[xX]\]',p.read_text()) for p in P.glob('*.md')))
 ck('history honestly incomplete',M['current_register_accounting_complete'] is True and M['research_coverage_complete'] is False)
 ck('referential integrity',all(e['office_id'] in ob for e in E) and all(r['event_id'] in eb and r['office_id']==eb[r['event_id']]['office_id'] for r in R))
 ck('sources exist for research records',all(sid in sb for x in O+E+H+G for sid in x.get('source_ids',[])) and all(r['source_id'] in sb and r['source_locator'] for r in R))
 for s in S:
  if s['artifact_path']:
   p=P/s['artifact_path'];ck('source hash '+s['source_id'],p.is_file() and sha(p)==s['sha256'] and p.stat().st_size==s['bytes'])
  else:ck('failed retrieval has no invented hash '+s['source_id'],s['sha256'] is None)
 ck('223-column exact field map',len(COL)==20 and sum(map(len,COL.values()))==223 and len(F)==223 and {(f['table'],f['column']) for f in F}=={(t,c) for t,cs in COL.items() for c in cs} and [f['ordinal'] for f in F]==list(range(1,224)))
 ck('at least 15 concrete acceptance cases',len(A)==38 and len({x['example_id'] for x in A})==len(A))
 ck('complete territorial category accounting',len(TR)==1935 and dict(collections.Counter(t['category'] for t in TR))=={'O':25,'P':136,'H':1772,'K':2} and len({t['territory_code'] for t in TR})==len(TR))
 ck('373 full and one partial territorial hold',len(H)==374 and sum(h['scope_level']=='hromada' for h in H)==352 and sum(h['scope_level']=='raion' for h in H)==17 and sum(h['scope_level']=='regional' for h in H)==3 and sum(h['scope_level']=='special_city' for h in H)==1 and sum(h['scope_level']=='polling_stations' for h in H)==1)
 ck('no office/result created by a hold',all(h['office_created'] is False and h['result_rows_created'] is False and h['current_control_census'] is False for h in H))
 ck('all full-held territories have no current office',all(not t['office_ids'] for t in TR if t.get('hold_id')))
 ck('18 whole deferrals and 31 occupied-2014 communities',sum(h['hold_reason']=='whole_hromada_2020_poll_not_held_CVK_161' for h in H)==18 and sum(h['hold_reason']=='occupied_2014_hromada_no_2020_Ukrainian_election' for h in H)==31)
 ck('303 Crimea H units held',sum(t['category']=='H' and t['region_code'].startswith('UA01') and bool(t.get('hold_id')) for t in TR)==303)
 ck('Novoaidar partial hold preserves office pair',len(next(h for h in H if h['scope_level']=='polling_stations')['polling_station_ids'])==5 and len(next(t for t in TR if t['name']=='Новоайдарська')['office_ids'])==2)
 ck('15 nested councils from 108 administrative districts',len(N)==108 and sum(bool(n['office_ids']) for n in N)==15 and all(not o['is_direct_executive'] for o in current if o['scope_level']=='city_district'))
 ck('Kyiv exactly two current offices',len([o for o in current if o.get('region_id')=='80'])==2)
 for code in ['63929','64337']:ck('same-territory status change retained once '+code,{o['office_id'] for o in O if o.get('cvk_body_id')==code}=={f'UA-CVK2020-{code}-C',f'UA-CVK2020-{code}-H'})
 ck('pre-reform Vinnytsia distinct from new raion',ob['UA-HIST-VM2015-06528-C']['cvk_body_id']=='6528' and 'UA-CVK2020-63553-C' in ob)
 ck('all dates exact and no wartime synthetic polls',all(datetime.date.fromisoformat(e['event_date'])<=datetime.date(2022,2,23) and e['event_status'] in ['held','held_annulled'] and e['upcoming'] is False and e['ordinary_next_date'] is None for e in E))
 ck('numeric missingness explicit',all((r['votes'] is None or isinstance(r['votes'],int) and r['votes']>=0) and (r['seats'] is None or isinstance(r['seats'],int) and r['seats']>=0) and (r['vote_share_percent'] is None or re.fullmatch(r'\d+(?:\.\d+)?',r['vote_share_percent']) and 0<=float(r['vote_share_percent'])<=100) for r in R))
 orig=(P/'sources/raw/CVK_od_obrany_22092026_original.xml').read_bytes();pv=(P/'sources/raw/CVK_local_parse_view.xml').read_bytes();bad=b'<DATE_OF_APPOINTMENT0</DATE_OF_APPOINTMENT>';good=b'<DATE_OF_APPOINTMENT></DATE_OF_APPOINTMENT>'
 ck('exact single structural XML repair',orig.count(bad)==1 and orig.replace(bad,good)==pv)
 x=ET.fromstring(pv.decode('cp1251'));councils=x.findall('region/rada');heads=x.findall('region/rada/head');members=x.findall('region/rada/deputies/deputy')
 ck('full original XML roster parsed',len(x)==25 and len(councils)==1575 and len(heads)==1419 and len(members)==41955 and sum(bool(h.findtext('PIB')) for h in heads)==1396)
 ck('every source council/head position is an office',all(f"UA-CVK2020-{int(c.get('id')):05d}-C" in ob and (c.find('head') is None or f"UA-CVK2020-{int(c.get('id')):05d}-H" in ob) for c in councils))
 lr=[r for r in R if r['source_id']=='UA-S-LOCAL-XML'];ck('local snapshot result count and null head distinction',len(lr)==43351 and sum(o.get('head_record_named') is False for o in O)==23)
 for r in lr:
  text=re.sub(r'\s','',r.get('raw_vote_text') or '');expected=int(text) if text.isdigit() else None
  if expected!=r['votes']:raise AssertionError('source blank/value mismatch '+r['result_id'])
 ck('all local raw vote blanks preserved',sum(r['votes'] is None for r in lr)==21688)
 repaired=[r for r in lr if r.get('parse_repair_note')];ck('malformed date kept null for correct city',len(repaired)==1 and repaired[0]['office_id']=='UA-CVK2020-02096-C' and repaired[0]['appointment_date'] is None)
 ck('no local roster seat or share invention',all(r['seats'] is None and r['vote_share_percent'] is None and r['full_election_vector'] is False for r in lr))
 pres=[e for e in E if e['office_id']=='UA-NAT-PRES'];parl=[e for e in E if e['office_id']=='UA-NAT-PARL'];ck('13 presidential events and 8 parliamentary cycles',len(pres)==13 and len(parl)==8)
 pby={e['event_date']:e for e in pres};ck('separate 2004 annulled and repeat runoff',pby['2004-11-21']['event_status']=='held_annulled' and pby['2004-12-26']['event_kind']=='repeat_runoff' and pby['2004-12-26']['event_id']!=pby['2004-11-21']['event_id'] and len(rb[pby['2004-11-21']['event_id']])==2)
 ck('2014 complete candidate notice',len(rb[pby['2014-05-25']['event_id']])==21 and pby['2014-05-25']['certification_date']=='2014-06-02')
 ck('2019 first round and runoff separated',len(rb[pby['2019-03-31']['event_id']])==39 and len(rb[pby['2019-04-21']['event_id']])==2)
 ck('1994 first round untranscribed not zero',not rb[pby['1994-06-26']['event_id']])
 pe=next(e for e in parl if e['event_date']=='2019-07-21');pr=rb[pe['event_id']];parties=[r for r in pr if r['contestant_kind']=='party_or_bloc'];sm=[r for r in pr if r['contestant_kind']=='candidate']
 ck('2019 PR seats and constituency coverage',len(parties)==22 and sum(r['seats'] or 0 for r in parties)==225 and len(sm)==3084 and len({r['constituency_id'] for r in sm})==199)
 ck('199 separately identified constituency winners',sum(r['outcome']=='reported_elected' for r in sm)==199 and sum(r.get('outcome_match_basis')=='source_candidate_birth_year_matches_source_deputy_birth_date_and_winner_votes' for r in sm)==1)
 sl=[r for r in R if r['office_id']=='UA-CVK2020-64337-C'];ck('Slobozhanske original allocation distinct from surviving members',len(sl)==8 and sum(r['seats'] for r in sl)==26 and sum(r['seats']==0 for r in sl)==4)
 ck('PR components never assigned total mixed seats',all(r.get('seat_component')=='PR_only' for r in parties) and all(r['seats'] is None for r in sm))
 ck('1994 parliamentary snapshot 338 seats',sum(r['seats'] or 0 for r in rb[next(e['event_id'] for e in parl if e['event_date']=='1994-03-27')])==338)
 ck('counts null and vote fields reconcile',sum(r['votes'] is None for r in R)==C['results_with_null_votes'] and sum(r['votes'] is not None for r in R)==C['results_with_votes'])
 if '--preflight' not in sys.argv:
  lines=(P/'SHA256SUMS').read_text().splitlines();listed={}
  for line in lines:
   h,name=line.split('  ',1);p=P/name
   if not p.is_file() or sha(p)!=h:raise AssertionError('pack checksum '+name)
   listed[name]=h
  files={str(p.relative_to(P)) for p in P.rglob('*') if p.is_file() and p.name!='SHA256SUMS'}
  ck('SHA256SUMS complete with no unlisted files',set(listed)==files and len(listed)==len(lines))
 print(json.dumps({'status':'PASS','mode':'preflight_without_pack_manifest' if '--preflight' in sys.argv else 'complete_read_only','checks_passed':len(checks),'current_offices':3000,'historical_only_offices':5,'events':len(E),'results':len(R),'contract_columns':223,'acceptance_examples':len(A),'ep_offices':0,'applied_changes':0,'research_holds_closed':0,'justin_approvals_checked':0},indent=2))
if __name__=='__main__':
 try:main()
 except Exception as e:
  print(json.dumps({'status':'FAIL','error':str(e),'checks_passed_before_failure':len(checks)},indent=2));sys.exit(1)
