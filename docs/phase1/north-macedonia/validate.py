#!/usr/bin/env python3
"""Offline research-pack validator. Reads files only; never imports/publishes data."""
from pathlib import Path
import json,hashlib,sys,re
from collections import Counter
ROOT=Path(__file__).resolve().parent
def j(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
def jl(p):return [json.loads(x) for x in (ROOT/p).read_text(encoding='utf-8').splitlines() if x.strip()]
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def ck(ok,name,detail=''):
 checks.append({'check':name,'pass':bool(ok),'detail':detail})
try:
 off=jl('data/office-register.jsonl');tiers=jl('data/draft-tiers.jsonl');ev=jl('data/events.jsonl');res=jl('data/results.jsonl')
 counts=j('data/counts.json');meta=j('metadata.json');src=j('data/source-inventory.json');rosters=j('data/elected-rosters-2025.json')
 oi={x['office_id']:x for x in off};ei={x['event_id']:x for x in ev};si={x['source_id']:x for x in src}
 cur=[o for o in off if o['status']=='current'];hist=[o for o in off if o['status']=='historical_only']
 ck(len(off)==172 and len(cur)==164 and len(hist)==8,'A01_full_register','164 current + 8 source-identified historical-only')
 ck(len(oi)==len(off) and len(ei)==len(ev) and len({r['result_id'] for r in res})==len(res),'A02_unique_keys')
 ck(sum(o['tier_scope']=='national' for o in cur)==2 and sum(o['tier_scope']=='local' for o in cur)==162,'A03_national_local_breakout')
 ck(sum(o['office_type']=='municipal_council' for o in cur)==81 and sum(o['office_type']=='mayor' for o in cur)==81,'A04_local_councils_and_mayors')
 ck(sum(o['direct_executive'] for o in cur)==82 and all(o['selection_mode']=='direct_popular_two_round_majority' for o in off if o['direct_executive']),'A05_popular_executives')
 nested=[o for o in cur if o['parent_geography_id']=='MK-GEO-CITY-OF-SKOPJE']
 ck(len(nested)==20 and len([o for o in cur if o['geography']=='City of Skopje'])==2,'A06_skopje_nesting')
 ck(all(o['office_type'] in ['national_legislature','president','municipal_council','mayor'] for o in off) and counts['ep_offices']==counts['regional_offices']==0,'A07_no_EP_regions_PM_or_parties')
 ck({o['geography'] for o in hist}=={'Drugovo','Vraneshtica','Zajas','Oslomej'} and sum(o['direct_executive'] for o in hist)==4,'A08_historical_source_gate')
 transitions=j('data/transition-relations.json')
 ck(transitions['office_successor_edges']==[] and transitions['country_rename']['creates_new_office'] is False,'A09_no_guessed_successors_or_rename_duplicates')
 ck(len(tiers)==len(off) and Counter(t['office_id'] for t in tiers)==Counter(o['office_id'] for o in off),'A10_tiers_one_to_one')
 ck(Counter(t['tier'] for t in tiers)==Counter({'national':2,'municipal':170}),'A11_tier_histogram')
 approvals=j('data/approval-state.json')
 ck(approvals['applied_changes']==0 and meta['applied_changes']==0 and counts['applied_changes']==0 and all(v is False for v in approvals['justin_approvals'].values()) and all(t['justin_approved'] is False for t in tiers),'A12_zero_changes_unchecked_approvals')
 ck(all(e['office_id'] in oi for e in ev) and all(r['event_id'] in ei and r['office_id']==ei[r['event_id']]['office_id'] for r in res),'A13_referential_integrity')
 ck(all(s in si for e in ev for s in e['source_ids']) and all(r['source_id'] in si for r in res) and all(s in si for o in off for s in o['source_ids']),'A14_source_links')
 presid=[e for e in ev if e['office_id']=='MK-NAT-PRESIDENT' and e['date_label'].startswith('2024')]
 ck({(e['date_label'],e['round']) for e in presid}=={('2024-04-24',1),('2024-05-08',2)},'A15_presidential_rounds_separate')
 ck(not any(e['date_label']<'1994-01-01' for e in ev),'A16_independence_and_indirect_1991_gate')
 bad={'Centar Zhupa','Gostivar','Mavrovo i Rostushe','Vrapchishte'}
 invalid=[e for e in ev if e['date_label']=='2025-10-19' and e['legal_outcome']=='invalid_insufficient_turnout']
 ck({oi[e['office_id']]['geography'] for e in invalid}==bad and all(r['elected_flag'] is None for r in res if r['event_id'] in {e['event_id'] for e in invalid}),'A17_failed_turnout_not_a_winner')
 ck({oi[e['office_id']]['geography'] for e in ev if e['date_label']=='2026-01-11'}==bad,'A18_repeat_events_2026')
 future=[e for e in ev if e['date_label']>meta['research_snapshot']]
 ck(len(future)==1 and future[0]['office_id']=='MK-LOC-BRVENICA-MAYOR' and future[0]['date_label']=='2026-10-18' and not any(r['event_id']==future[0]['event_id'] for r in res),'A19_upcoming_window_not_register_filter')
 councils2025={r['office_id'] for r in res if r['result_unit']=='council_list' and ei[r['event_id']]['date_label']=='2025-10-19'}
 mayors2025={r['office_id'] for r in res if r['result_unit']=='candidate' and ei[r['event_id']]['date_label']=='2025-10-19'}
 ck(len(councils2025)==81 and len(mayors2025)==81,'A20_all_current_local_2025_vote_vectors')
 ck(sum(e['date_label']=='2025-11-02' and e['office_id'].endswith('MAYOR') for e in ev)==33,'A21_2025_runoff_count')
 ck(all(r['seats_status']!='reported' or r['seats'] is not None for r in res) and all(r['votes_status']!='reported' or r['votes'] is not None for r in res) and all(r['share_status']!='reported' or r['share'] is not None for r in res),'A22_null_status_consistency')
 ck(any(r['seats']==0 and r['seats_status']=='reported' for r in res) and any(r['seats'] is None and r['seats_status']=='source_dash_unresolved' for r in res),'A23_explicit_zero_vs_dash')
 ck(all(r['result_unit']=='party_group_aggregate' for r in res if r['source_id'] in ['odihr-local2017','odihr-local2021']),'A24_aggregate_not_candidate')
 conflict=[r for r in res if r['event_id']=='MK-NAT-PRESIDENT-20140427' and r['candidate_or_list_label']=='Stevo Pendarovski']
 ck(len(conflict)==1 and conflict[0]['votes'] is None and conflict[0]['votes_status']=='conflicting_source_values','A25_2014_conflict_not_silently_repaired')
 ck('MK-LOC-DEBAR-MAYOR-20211114' in ei and 'MK-LOC-DEBAR-MAYOR-20211014' not in ei,'A26_debar_date_conflict')
 rerun=ei['MK-LOC-SHUTO-ORIZARI-COUNCIL-20251102']
 ck(rerun['result_scope']=='cumulative_after_partial_revote' and ei['MK-LOC-SHUTO-ORIZARI-COUNCIL-20251019']['legal_outcome']=='partial_revote_required','A27_revote_not_double_counted')
 ck(all(r['evidence_status']=='official_portal_certification_not_established' for r in res if r['source_id'].startswith('sec-')),'A28_live_portal_not_certified')
 cols=j('contracts/columns.json');maps=j('contracts/column-map.json')
 ck(len(cols)==20 and sum(map(len,cols.values()))==223 and len(maps)==223 and {(m['table'],m['column']) for m in maps}=={(t,c) for t,cc in cols.items() for c in cc},'A29_exact_223_column_map')
 ck(all(m['applied'] is False for m in maps) and all(m['status']=='prohibited_operational_write' for m in maps if m['table'] in ['ingest_attempt','publication_receipt','publication_release']),'A30_operational_tables_not_written')
 ck(meta['current_office_register_complete_for_scope'] is True and meta['research_coverage_complete'] is False and len(j('data/research-gaps.json'))>=15,'A31_coverage_claim_honest')
 ck(all((r['votes'] is None or isinstance(r['votes'],int) and r['votes']>=0) and (r['share'] is None or 0<=r['share']<=100) and (r['seats'] is None or isinstance(r['seats'],int) and r['seats']>=0) for r in res),'A32_numeric_domains')
 roster_ok=True
 for roster in rosters:
  rr=roster['roster'];ct=Counter(x['ballot_position'] for x in rr)
  roster_ok &= [x['rank'] for x in rr]==list(range(1,len(rr)+1))
  roster_ok &= len(rr)==45 if roster['event_id'].startswith('MK-LOC-CITY-OF-SKOPJE') else 9<=len(rr)<=33
  for r in res:
   if r['event_id']==roster['event_id'] and r['seats_status']=='derived_from_displayed_elected_roster':roster_ok &= r['seats']==ct[r['ballot_position']]>0
 ck(roster_ok and len({x['event_id'] for x in rosters if x['event_id'].endswith('20251019')})==81,'A33_elected_roster_derivations')
 ck(all(d['interpretation']=='Diagnostic only; source values unchanged.' for d in j('data/arithmetic-diagnostics.json')),'A34_arithmetic_diagnostics_not_repairs')
 ck(len(j('data/acceptance-vectors.json'))>=15,'A35_acceptance_examples')
 expected={'offices_total':len(off),'offices_current':len(cur),'offices_historical_only':len(hist),'events':len(ev),'results':len(res),'events_national':sum(e['office_id'].startswith('MK-NAT') for e in ev),'results_national':sum(r['office_id'].startswith('MK-NAT') for r in res),'sources':len(src),'council_2025_elected_roster_vectors':len(rosters)}
 ck(all(counts[k]==v for k,v in expected.items()),'A36_counts_recomputed',json.dumps(expected,sort_keys=True))
 ck(all(digest(ROOT/s['retained_extract_path'])==s['retained_extract_sha256'] and (ROOT/s['retained_extract_path']).stat().st_size==s['retained_extract_byte_count'] for s in src),'A37_source_extract_hashes')
 manifest={}
 for row in (ROOT/'SHA256SUMS').read_text().splitlines():
  h,p=row.split('  ',1);manifest[p]=h
  if not re.fullmatch('[0-9a-f]{64}',h):raise ValueError('Invalid hash token')
 files={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name!='SHA256SUMS' and '__pycache__' not in str(p)}
 ck(set(manifest)==files,'A38_manifest_completeness')
 ck(all((ROOT/p).is_file() and digest(ROOT/p)==h for p,h in manifest.items()),'A39_manifest_hashes')
except Exception as exc:
 ck(False,'validator_exception',repr(exc))
report={'ok':all(c['pass'] for c in checks),'checks_passed':sum(c['pass'] for c in checks),'checks_total':len(checks),'applied_changes':0,'all_justin_approvals_unchecked':True,'scope':'Offline structure, provenance and policy validation; does not certify source election results.','checks':checks}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if report['ok'] else 1)
