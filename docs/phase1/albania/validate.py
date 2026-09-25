#!/usr/bin/env python3
"""Read-only validation of this research archive. No network, database or publication I/O."""
from pathlib import Path
import collections, hashlib, json, re, sys
P=Path(__file__).resolve().parent
checks=[]
def check(name,condition):checks.append({'check':name,'passed':bool(condition)})
def read(name):return json.loads((P/name).read_text(encoding='utf-8'))
def rows(name):return [json.loads(x) for x in (P/name).read_text(encoding='utf-8').splitlines() if x]
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def key(prefix,value):return prefix+'-'+hashlib.sha256(json.dumps(value,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()[:24]
def unique(xs):return len(xs)==len(set(xs))
try:
 M=read('metadata.json');C=read('data/counts.json');O=rows('data/office-register.jsonl');T=rows('data/draft-tiers.jsonl');E=rows('data/events.jsonl');R=rows('data/results.jsonl');S=read('data/source-inventory.json');G=read('data/research-gaps.json');A=read('data/acceptance-examples.json')
 oi={o['office_id']:o for o in O};ei={e['event_id']:e for e in E};si={s['source_id']:s for s in S};rg=collections.defaultdict(list)
 for r in R:rg[r['event_id']].append(r)
 cur=[o for o in O if o['status']=='current'];hist=[o for o in O if o['status']=='historical_only'];nat='AL-NAT-ASSEMBLY'
 check('office_counts_and_unique_ids',len(O)==891 and len(cur)==123 and len(hist)==768 and unique([o['office_id'] for o in O]))
 check('current_national_local_breakout',sum(o['tier_scope']=='national' for o in cur)==1 and sum(o['tier_scope']=='local' for o in cur)==122 and all(o['tier_scope']=='local' for o in hist))
 check('only_sourced_office_types',set(o['office_type'] for o in O)=={'national_legislature','mayor','municipal_council','borough_mayor','borough_council'})
 check('current_selection_modes',sum(o['office_type']=='mayor' for o in cur)==61 and sum(o['office_type']=='municipal_council' for o in cur)==61 and all(o['selection_mode']=='direct_popular_plurality' for o in O if o['direct_executive']))
 units=collections.defaultdict(list)
 for o in cur:
  if o['tier_scope']=='local':units[o['territorial_unit_id']].append(o)
 check('current_61_mayor_council_pairs',len(units)==61 and all(len(v)==2 and {x['office_type'] for x in v}=={'mayor','municipal_council'} for v in units.values()))
 rec=read('data/current-register-reconciliation.json')
 check('official_61_register_reconciled',len(rec)==61 and unique([x['statutory_register_name'] for x in rec]) and {oid for x in rec for oid in x['office_ids']}=={o['office_id'] for o in cur if o['tier_scope']=='local'})
 check('president_ep_regional_exclusions',C['popular_presidential_offices']==C['ep_offices']==C['popular_regional_offices']==0 and all(o['office_type'] in {'mayor','municipal_council','borough_mayor','borough_council','national_legislature'} for o in O))
 check('full_scope_limit_is_explicit',M['current_national_and_municipal_register_complete'] is True and M['research_coverage_complete'] is False and M['nested_advisory_body_census_complete'] is False and M['historical_coverage_complete'] is False)
 check('historic_types_65_308_11_pairs',sum(o['geography'].startswith('BASHKIA ') for o in hist)==130 and sum(o['geography'].startswith('KOMUNA ') for o in hist)==616 and sum(o['office_type'].startswith('borough_') for o in hist)==22)
 check('historic_direct_executives_and_councils',sum(o['direct_executive'] for o in hist)==384 and sum(not o['direct_executive'] for o in hist)==384)
 check('historic_borough_parents_sourced',all(len(o['parent_office_ids'])==2 and all(p in oi and oi[p]['status']=='historical_only' and oi[p]['geography']=='BASHKIA TIRANE' for p in o['parent_office_ids']) for o in hist if o['office_type'].startswith('borough_')))
 check('legacy_office_id_binding',oi['AL-13-M']['geography']=='Belsh' and oi['AL-14-M']['geography']=='Cërrik' and oi['AL-13-M']['geography_id']=='geo-99a7b8d0e325a448c5e7c7ca')
 cross=read('data/identity-crosswalk.json')
 check('all_122_retained_identity_crosswalks',len(cross)==122 and all(x['upstream_id']==x['research_id'] and x['research_id'] in oi for x in cross))
 check('no_guessed_successor_edges',read('data/transition-relations.json')['office_successor_edges']==[])
 trans=read('data/transition-relations.json')['rename']
 check('dimal_same_unit_rename',trans['office_ids']==['AL-05-M','AL-05-C'] and not trans['creates_new_office'] and all(oi[x]['geography']=='Dimal' for x in trans['office_ids']))
 check('draft_tiers_bijection',len(T)==len(O) and unique([t['office_id'] for t in T]) and {t['office_id'] for t in T}==set(oi))
 check('draft_tier_histogram',dict(collections.Counter(t['tier'] for t in T))=={'national':1,'municipal':868,'other':22} and all(t['review_status']=='draft_unapproved' and t['justin_approved'] is False for t in T))
 check('event_and_result_counts',len(E)==1180 and len(R)==8229 and unique([e['event_id'] for e in E]) and unique([r['result_id'] for r in R]))
 check('event_foreign_keys',all(e['office_id'] in oi for e in E) and all(r['event_id'] in ei and r['office_id']==ei[r['event_id']]['office_id'] for r in R))
 check('event_source_references',all(e['source_ids'] and all(s in si for s in e['source_ids']) for e in E) and all(o['source_ids'] and all(s in si for s in o['source_ids']) for o in O))
 check('result_source_references',all(r['source_id'] in si and (not r.get('outcome_source_id') or r['outcome_source_id'] in si) and all(s in si for s in r.get('name_evidence_source_ids',[])) for r in R))
 check('gap_source_references',all(all(s in si for s in g['source_ids']) for g in G))
 check('deterministic_event_keys',all(e['event_id']==key('event',['albania',e['history_key']]) for e in E))
 check('deterministic_result_rows',all([r['result_id'] for r in rr]==[eid+'-r'+str(i) for i in range(len(rr))] for eid,rr in rg.items()))
 check('legacy_known_event',any(e['event_id']=='event-9b7cd1a6a6d27850e712e6a7' and e['office_id']=='AL-13-M' and e['date']=='2023-05-14' for e in E))
 check('result_counts_per_event',all(e['result_count']==len(rg[e['event_id']]) for e in E))
 check('national_local_event_result_breakout',sum(e['office_id']==nat for e in E)==24 and sum(r['office_id']==nat for r in R)==185 and sum(e['office_id']!=nat for e in E)==1156 and sum(r['office_id']!=nat for r in R)==8044)
 check('date_precision_and_scheduled_role',all((e['date'] is not None and e['date_precision']=='day') or (e['date'] is None and e['date_precision'] in {'year','range'}) for e in E) and all(re.fullmatch(r'\d{4}-\d{2}-\d{2}',e['date']) for e in E if e['date']))
 check('numeric_types',all((r[k] is None or type(r[k]) is int and r[k]>=0) for r in R for k in ['votes','seats']))
 check('share_units_and_range',all(r['share_unit']=='percent' and (r['share'] is None or 0<=r['share']<=100) for r in R))
 check('null_is_not_zero',all(r['votes_status'] in {'untranscribed','not_transcribed','not_applicable'} for r in R if r['votes'] is None) and all(r['seats_status']=='untranscribed' for r in R if r['seats'] is None))
 check('explicit_zero_status',all(r['votes_status']=='source_zero' for r in R if r['votes']==0) and all(r['seats_status'] in {'source_zero','inherited_recorded_zero'} for r in R if r['seats']==0))
 base=[r for r in R if r.get('origin',{}).get('kind')=='inherited_research'];br=read('data/baseline-reconciliation.json')
 check('baseline_3843_rows_366_events',len(base)==3843 and len({r['event_id'] for r in base})==366 and len(br['events'])==366 and all(x['workbook_vector_matches_html'] for x in br['events']))
 check('baseline_null_zero_preservation',sum(r['seats'] is None for r in base)==399 and sum(r['seats_status']=='inherited_recorded_zero' for r in base)==1876)
 check('2015_full_mayor_restoration',sum(e['cycle_year']==2015 and oi[e['office_id']]['direct_executive'] for e in E)==61 and len(br['fresh_2015_mayor_checks'])==61)
 check('all_current_map_ordinary_cycles',all(sum(e['date']==d and oi[e['office_id']]['status']=='current' and e['office_id']!=nat for e in E)==122 for d in ['2015-06-21','2019-06-30','2023-05-14']))
 check('2019_votes_stay_preliminary',all(e['evidence_status']=='official_preliminary' for e in E if e['date']=='2019-06-30'))
 hwin=[r for r in R if oi[r['office_id']]['status']=='historical_only' and oi[r['office_id']]['direct_executive']]
 check('2011_winner_only_null_fields',len(hwin)==384 and all(r['elected'] is True and r['votes'] is None and r['share'] is None and r['seats'] is None for r in hwin))
 hc=[r for r in R if oi[r['office_id']]['status']=='historical_only' and not oi[r['office_id']]['direct_executive']]
 check('2011_nonblank_council_seats',len(hc)==3775 and sum(r['seats'] for r in hc)==6152 and all(r['seats']>0 and r['votes'] is None and r['share'] is None for r in hc))
 check('2011_blank_cells_retained',len(read('data/historical-2011-blank-seat-cells.json'))==384)
 check('2011_cycle_aggregate_date_honesty',sum(e['cycle_year']==2011 and e['event_kind']=='cycle_result' and e['date'] is None for e in E)==768)
 check('2011_cancelled_and_repeat_separate',sum(e['event_kind']=='cancelled_poll' and e['date']=='2011-05-08' for e in E)==2 and sum(e['event_kind']=='repeat_poll_date_unresolved' and e['date'] is None and e['result_count']==0 for e in E)==2)
 check('council_cycle_seat_totals',all(sum(r['seats'] for r in R if r['office_id'].endswith('-C') and ei[r['event_id']]['cycle_year']==y)==total for y,total in [(2011,6152),(2015,1595),(2019,1619),(2023,1613)]))
 ne=[e for e in E if e['office_id']==nat and e['result_count']]
 check('ten_post1991_national_cycles',{e['cycle_year'] for e in ne}=={1992,1996,1997,2001,2005,2009,2013,2017,2021,2025} and len(ne)==10)
 check('no_pre1992_national_inference',all(e['cycle_year']>=1992 for e in E if e['office_id']==nat))
 check('national_cycle_seat_totals',all(sum(r['seats'] for r in rg[e['event_id']])==(155 if e['cycle_year']==1997 else 140) for e in ne))
 check('early_national_phases_separate',sum(e['office_id']==nat and e['event_kind']=='cycle_result' for e in E)==5 and all(e['result_count']==0 and e['cycle_summary_event_id'] in ei for e in E if e['office_id']==nat and e['event_kind'] in {'first_round','second_round','repeat_poll'}))
 annual={y:next(e for e in ne if e['cycle_year']==y) for y in [2005,2009,2013,2017,2021,2025]}
 check('transcribed_national_vote_sums',all(sum(r['votes'] or 0 for r in rg[annual[y]['event_id']])==v for y,v in [(2005,1366226),(2009,1519176),(2013,1724779),(2017,1582150),(2021,1578117),(2025,1606057)]))
 check('2021_arithmetic_hold',any(x['candidate_sum']==1578117 and x['printed_valid_votes']==1661176 for x in read('data/arithmetic-diagnostics.json')))
 check('2025_final_primary_and_preliminary_separate',annual[2025]['evidence_status']=='official_final' and len(rg[annual[2025]['event_id']])==11 and all(r['source_id']=='cec-2025-final' for r in rg[annual[2025]['event_id']]) and read('data/2025-preliminary-comparison.json')['not_part_of_main_result_count'] is True)
 may=next(e for e in E if e['office_id']=='AL-52-M' and e['date']=='2023-05-14');jul=next(e for e in E if e['office_id']=='AL-52-M' and e['date']=='2023-07-23')
 check('rrogozhine_annulled_recount',may['legal_outcome']=='annulled' and sorted(r['votes'] for r in rg[may['event_id']])==[5108,5129] and all(r['elected'] is False for r in rg[may['event_id']]))
 check('rrogozhine_repeat_and_certificate',jul['repeats_event_id']==may['event_id'] and jul['certificate_date']=='2023-08-01' and jul['event_id']=='event-fc68f2719386d599c584111d')
 tir=next(e for e in E if e['office_id']=='AL-53-M' and e['date']=='2025-11-09')
 check('tirana_cancelled_schedule_has_no_results',tir['event_kind']=='scheduled_poll_cancelled' and tir['date_role']=='scheduled_date_not_actual_poll' and tir['result_count']==0 and tir['legal_outcome']=='election_decree_annulled')
 check('five_actual_november_2025_replacements',sum(e['date']=='2025-11-09' and e['event_kind']=='replacement_election' for e in E)==5)
 check('diber_2016_calendar_only',any(e['office_id']=='AL-07-M' and e['date']=='2016-09-11' and e['result_count']==0 for e in E))
 check('repeat_links_reference_same_office',all(e['repeats_event_id'] in ei and ei[e['repeats_event_id']]['office_id']==e['office_id'] and e['repeats_event_id']!=e['event_id'] for e in E if e.get('repeats_event_id')))
 check('no_invented_future_days',all(o['next_polling_date'] is None for o in O) and all(x['exact_polling_date'] is None for x in read('data/cycle-outlook.json')) and C['upcoming_events']==0)
 cols=read('contracts/columns.json');cm=read('contracts/column-map.json');pairs=[(x['table'],x['column']) for x in cm]
 check('223_column_exact_coverage',len(cols)==20 and sum(map(len,cols.values()))==223 and len(cm)==223 and unique(pairs) and set(pairs)=={(t,c) for t,cc in cols.items() for c in cc})
 check('all_field_mappings_unapplied',all(x['applied'] is False and x['mapping'] and x['null_policy'] for x in cm))
 check('acceptance_examples_and_gates',len(A)>=15 and unique([a['example_id'] for a in A]) and len(G)==21 and unique([g['gap_id'] for g in G]))
 check('all_approvals_unchecked',all(x['justin_approved'] is False for x in A+G+T) and all(v is False for v in read('data/approval-state.json')['justin_approvals'].values()) and M['justin_approved'] is False and not any(re.search(r'\[[xX]\]',f.read_text()) for f in P.rglob('*.md')))
 check('applied_changes_zero',M['applied_changes']==C['applied_changes']==read('data/approval-state.json')['applied_changes']==0)
 check('no_implementation_artifacts',not any(f.suffix.lower() in {'.sql','.sqlite','.sqlite3','.db','.js','.tsx','.sh'} for f in P.rglob('*') if f.is_file()))
 check('source_inventory_unique',len(S)==169 and unique([s['source_id'] for s in S]))
 check('retained_extract_hashes',all((P/s['retained_extract_path']).is_file() and sha(P/s['retained_extract_path'])==s['retained_extract_sha256'] and (P/s['retained_extract_path']).stat().st_size==s['retained_extract_byte_count'] and read(s['retained_extract_path'])['source_id']==s['source_id'] for s in S))
 check('original_hash_scope_honest',sum(s['original_sha256'] is not None for s in S)==161 and all(s['original_file_redistributed'] is False and (s['original_sha256'] is None or re.fullmatch('[0-9a-f]{64}',s['original_sha256'])) for s in S))
 # Count-file consistency beyond headline values.
 derived={'offices_total':len(O),'offices_current':len(cur),'offices_historical_only':len(hist),'events':len(E),'results':len(R),'draft_tiers':len(T),'events_with_results':sum(bool(rg[e['event_id']]) for e in E),'results_with_votes':sum(r['votes'] is not None for r in R),'results_with_seats':sum(r['seats'] is not None for r in R),'results_without_votes_or_seats':sum(r['votes'] is None and r['seats'] is None for r in R),'sources':len(S)}
 check('counts_json_consistent',all(C[k]==v for k,v in derived.items()) and C['event_kind_histogram']==dict(collections.Counter(e['event_kind'] for e in E)))
 check('other_country_work_remains_pending','ME-AY-G01' in read('data/approval-state.json')['other_pending_work']['Montenegro_AY'] and 'pending' in read('data/approval-state.json')['other_pending_work']['Serbia_AX'])
 manifest={};manifest_safe=True
 for line in (P/'SHA256SUMS').read_text().splitlines():
  digest,rel=line.split('  ',1)
  if not re.fullmatch('[0-9a-f]{64}',digest) or Path(rel).is_absolute() or '..' in Path(rel).parts or rel in manifest:manifest_safe=False
  manifest[rel]=digest
 actual={str(f.relative_to(P)) for f in P.rglob('*') if f.is_file() and f.name!='SHA256SUMS' and '__pycache__' not in f.parts}
 check('manifest_complete_safe_unique',manifest_safe and set(manifest)==actual)
 check('all_bundled_file_hashes',manifest_safe and all((P/n).is_file() and sha(P/n)==h for n,h in manifest.items()))
except Exception as exc:
 checks.append({'check':'validator_exception','passed':False,'detail':str(exc)})
report={'pack':'Prompt BA — Albania','as_of':'2026-09-24','mode':'read_only_research_validation','applied_changes':0,'checks_passed':sum(x['passed'] for x in checks),'checks_total':len(checks),'passed':all(x['passed'] for x in checks),'research_holds_cleared':False,'justin_approved':False,'checks':checks}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if report['passed'] else 1)
