#!/usr/bin/env python3
"""Read-only research-pack validator. Standard library; no network or writes."""
from pathlib import Path
import collections,datetime,hashlib,json,re,sys
P=Path(__file__).resolve().parent
checks=[]
def check(n,v):checks.append({'check':n,'passed':bool(v)})
def read(n):return json.loads((P/n).read_text(encoding='utf-8'))
def rows(n):return [json.loads(l) for l in (P/n).read_text(encoding='utf-8').splitlines() if l]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def unique(a):return len(a)==len(set(a))
def key(prefix,value):return prefix+'-'+hashlib.sha256(json.dumps(value,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()).hexdigest()[:24]
try:
 M=read('metadata.json');C=read('data/counts.json');O=rows('data/office-register.jsonl');T=rows('data/draft-tiers.jsonl');E=rows('data/events.jsonl');R=rows('data/results.jsonl');S=read('data/source-inventory.json');G=read('data/research-gaps.json');A=read('data/acceptance-examples.json')
 oi={o['office_id']:o for o in O};ei={e['event_id']:e for e in E};si={s['source_id']:s for s in S};rr=collections.defaultdict(list)
 for r in R:rr[r['event_id']].append(r)
 cur=[o for o in O if o['status']=='current'];hist=[o for o in O if o['status']=='historical_only']
 check('138_unique_offices_current77_historical61',len(O)==138 and len(cur)==77 and len(hist)==61 and unique([o['office_id'] for o in O]))
 check('core_national_local_breakout',sum(o['tier_scope']=='national' for o in cur)==1 and sum(o['tier_scope']=='local' for o in cur)==76 and sum(o['tier_scope']=='national' for o in hist)==1 and sum(o['tier_scope']=='local' for o in hist)==60)
 units=collections.defaultdict(list)
 for o in cur:
  if o['tier_scope']=='local':units[o['territorial_unit_id']].append(o)
 check('38_complete_assembly_mayor_pairs',len(units)==38 and all(len(v)==2 and {o['office_type'] for o in v}=={'mayor','municipal_assembly'} for v in units.values()))
 check('direct_selection_modes',sum(o['direct_executive'] for o in cur)==38 and sum(o['direct_executive'] for o in hist)==30 and all(o['selection_mode']=='direct_popular_majority_runoff' for o in O if o['direct_executive']))
 check('only_sourced_body_types',set(o['office_type'] for o in O)=={'mayor','municipal_assembly','national_legislature'})
 check('zero_president_EP_region_parallel',C['ep_offices']==C['popular_president_offices']==C['popular_regional_offices']==C['serbia_scope_offices']==0 and all(o['country_id']=='kosovo' and o['country_code']=='XK' and o['office_id'].startswith('XK-') for o in O))
 check('one_tier_per_office',len(T)==len(O) and unique([t['office_id'] for t in T]) and set(t['office_id'] for t in T)==set(oi) and all(t['status']=='draft_unapproved' and t['justin_approved'] is False and t['applied'] is False for t in T))
 check('tier_histogram',dict(collections.Counter(t['draft_tier'] for t in T))==C['draft_tier_histogram']=={'national':2,'municipal':136})
 check('core_full_nested_history_incomplete',M['current_national_and_municipal_register_complete'] is True and M['nested_advisory_body_census_complete'] is False and M['historical_coverage_complete'] is False and M['numeric_coverage_complete'] is False and M['research_coverage_complete'] is False)
 check('zero_applied_all_approvals_false',M['applied_changes']==C['applied_changes']==0 and M['justin_approved'] is False and all(v is False if k!='applied_changes' else v==0 for k,v in read('data/approval-state.json').items()) and all(g['justin_approved'] is False for g in G) and all(a['justin_approved'] is False for a in A))
 check('no_future_day_or_guessed_edges',all(o['next_polling_date'] is None and o['valid_from'] is None and o['valid_to'] is None for o in O) and read('data/transition-relations.json')==[])
 check('provisional_histories_not_current_identity',all(e['office_id'].startswith('XK-H-') for e in E if e['cycle_year']<2008) and sum(o['office_id']=='XK-H-PISG-ASSEMBLY' for o in O)==1)
 check('event_result_counts_unique',len(E)==C['events']==574 and len(R)==C['results']==3489 and unique([e['event_id'] for e in E]) and unique([r['result_id'] for r in R]))
 check('record_foreign_keys',all(e['office_id'] in oi for e in E) and all(r['event_id'] in ei and r['office_id']==ei[r['event_id']]['office_id'] for r in R))
 check('deterministic_keys',all(e['event_id']==key('event',['kosovo',e['history_key']]) for e in E) and all([r['result_id'] for r in v]==[eid+'-r'+str(i) for i in range(len(v))] for eid,v in rr.items()))
 check('per_event_result_count',all(e['result_count']==len(rr[e['event_id']]) for e in E))
 check('national_local_breakout',sum(oi[e['office_id']]['tier_scope']=='national' for e in E)==C['national_events']==14 and sum(oi[e['office_id']]['tier_scope']=='local' for e in E)==C['local_events']==560 and sum(oi[r['office_id']]['tier_scope']=='national' for r in R)==C['national_results']==237 and sum(oi[r['office_id']]['tier_scope']=='local' for r in R)==C['local_results']==3252)
 check('event_kinds_counts',dict(collections.Counter(e['event_kind'] for e in E))==C['events_by_kind'] and sum(e['event_kind']=='source_result_snapshot' for e in E)==7)
 check('date_precision',all((e['date'] is None and e['date_precision']=='year') or (e['date'] is not None and e['date_precision']=='day' and datetime.date.fromisoformat(e['date']).isoformat()==e['date']) for e in E))
 check('numeric_domains',all((r[k] is None or type(r[k]) is int and r[k]>=0) for r in R for k in ['votes','seats']) and all(r['share_unit']=='percent' and (r['share'] is None or 0<=r['share']<=100) for r in R))
 check('null_and_true_zero_semantics',all(r['votes_status']=='untranscribed' for r in R if r['votes'] is None) and all(r['seats_status']=='untranscribed' for r in R if r['seats'] is None) and all(r['votes_status']=='source_zero' for r in R if r['votes']==0) and all(r['seats_status']=='source_zero' for r in R if r['seats']==0))
 check('recorded_totals_reconcile',all(sum(r['votes'] or 0 for r in rr[e['event_id']])==e['valid_votes'] for e in E if e['valid_votes'] is not None))
 check('recorded_seats_reconcile',all(sum(r['seats'] or 0 for r in rr[e['event_id']])==e['seats_total'] for e in E if e['seats_total'] is not None))
 check('derived_percentages_declared_and_valid',all(ei[r['event_id']]['valid_votes'] and abs(r['share']-100*r['votes']/ei[r['event_id']]['valid_votes'])<1e-8 and r.get('share_basis') for r in R if r['share_status']=='derived_from_reported_valid_total'))
 check('all_references_resolve',all(s in si for o in O for s in o['source_ids']) and all(s in si for e in E for s in e['source_ids']) and all(r['source_id'] in si for r in R) and all(s in si for g in G for s in g['source_ids']) and all(r['origin'].get('label_source_id',r['source_id']) in si and r['origin'].get('vote_source_id',r['source_id']) in si for r in R))
 def ev(oid=None,y=None,date=None,kind=None):return [e for e in E if (oid is None or e['office_id']==oid) and (y is None or e['cycle_year']==y) and (date is None or e['date']==date) and (kind is None or e['event_kind']==kind)]
 e2000=ev(y=2000);check('2000_27_certified_3_untranscribed',len(e2000)==30 and sum(e['result_count']>0 for e in e2000)==27 and all(e['result_count']==0 and e['valid_votes'] is None for e in e2000 if e['office_id'] in ['XK-H-UNMIK-12-C','XK-H-UNMIK-28-C','XK-H-UNMIK-29-C']))
 check('2000_matrix_totals',sum(r['votes'] or 0 for r in R if ei[r['event_id']]['cycle_year']==2000)==687332 and sum(r['seats'] or 0 for r in R if ei[r['event_id']]['cycle_year']==2000)==869)
 check('2001_explicit_seat_zeros',any(r['seats']==0 and r['seats_status']=='source_zero' for r in R if ei[r['event_id']]['cycle_year']==2001))
 check('2002_matrix_totals',len(ev(y=2002))==30 and sum(r['votes'] or 0 for r in R if ei[r['event_id']]['cycle_year']==2002)==699399 and sum(r['seats'] or 0 for r in R if ei[r['event_id']]['cycle_year']==2002)==920)
 check('2007_23_round_two_events',len(ev(y=2007,date='2007-12-08',kind='runoff'))==23)
 mal=[r for r in R if r.get('source_share_token')=='0.00594'];check('2007_malformed_share_held',len(mal)==1 and mal[0]['share'] is None)
 n10=ev('XK-NAT-ASSEMBLY',2010,kind='cycle_result_aggregate');check('2010_denominator_hold',len(n10)==1 and n10[0]['valid_votes'] is None and sum(r['votes'] for r in rr[n10[0]['event_id']])==698751 and all(r['share'] is None for r in rr[n10[0]['event_id']]))
 check('2010_repeat_dates',set(e['date'] for e in ev('XK-NAT-ASSEMBLY',2010) if e['date'])=={'2010-12-12','2011-01-09','2011-01-23'})
 check('2014_primary_vector_and_alternate_hold',len(ev('XK-NAT-ASSEMBLY',2014))==1 and ev('XK-NAT-ASSEMBLY',2014)[0]['result_count']==15 and len(read('data/alternative-return-holds.json'))==1)
 check('north_2013_separate_polls',all(len(ev('XK-38-'+c,2013,date=d))==1 for c in ['C','M'] for d in ['2013-11-03','2013-11-17']))
 check('zvecan_2013_no_invented_results_or_repeat_date',all(e['result_count']==0 for e in ev('XK-29-C',2013)+ev('XK-29-M',2013)) and len(ev('XK-29-C',2013))+len(ev('XK-29-M',2013))==2)
 check('partesh_2017_not_false_runoff',not ev('XK-36-M',2017,kind='runoff') and len(ev('XK-36-M',2017,date='2017-11-19',kind='repeat_first_round'))==1 and ev('XK-36-M',2017,date='2017-10-22')[0]['legal_outcome']=='annulled')
 check('istog_annulment_and_repeat',ev('XK-06-M',2017,date='2017-11-19')[0]['legal_outcome']=='annulled' and len(ev('XK-06-M',2017,date='2017-12-17',kind='repeat_runoff'))==1)
 check('dragash_postal_subset',len(ev('XK-05-M',2021,kind='postal_ballot_repeat'))==1 and ev('XK-05-M',2021,kind='postal_ballot_repeat')[0]['date'] is None)
 check('cycle_elected_not_round_winner',all(r['elected'] is None for r in R if r.get('source_cycle_elected_label')))
 check('zero_padding_excluded',len(read('data/dplus-zero-padding-holds.json'))==8651 and not any(r['votes']==0 and r['source_id'].startswith('dplus-LocalAssembly') for r in R))
 national_ok=True
 for y,total in [(2017,727986),(2019,841275),(2025,938010)]:
  e=ev('XK-NAT-ASSEMBLY',y,date='2025-02-09' if y==2025 else None)[0];v=rr[e['event_id']];national_ok &= sum(r['votes'] for r in v)==total and sum(r['seats'] or 0 for r in v)==120
 check('2017_2019_2025_EU_totals',national_ok)
 check('2023_exact_bodies',len(ev(y=2023))==6 and {e['office_id'] for e in ev(y=2023)}=={'XK-12-M','XK-28-M','XK-29-M','XK-38-M','XK-12-C','XK-29-C'})
 check('2024_recall_only',len(ev(y=2024))==4 and all(e['event_kind']=='recall_vote' and e['legal_outcome']=='recall_failed' and e['result_count']==0 for e in ev(y=2024)))
 check('2025_full_core_cycle_calendar',sum(oi[e['office_id']]['tier_scope']=='local' for e in ev(y=2025,date='2025-10-12'))==76 and len(ev(y=2025,date='2025-11-09'))==18)
 check('2025_seat_snapshot_not_upgraded',sum(r['source_id']=='kallxo-local-2025' and r['seats'] is not None for r in R)==198 and all('announced' in r['evidence_status'] for r in R if r['source_id']=='kallxo-local-2025' and r['seats'] is not None))
 check('2025_preliminary_leaders_not_winners',sum(r.get('preliminary_leader') is True for r in R)==17 and all(r['elected'] is None and 'preliminary' in r['evidence_status'] for r in R if r.get('preliminary_leader')))
 pd=[r for r in R if ei[r['event_id']]['date']=='2026-06-07' and r['candidate_or_list_label']=='Democratic Party of Kosovo (PDK)'];check('2026_PDK_conflicting_share_null',len(pd)==1 and pd[0]['share'] is None and pd[0]['seats']==22 and pd[0]['source_share_conflict']==[19.44,19.24])
 check('2009_not_retrojected',not ev(y=2009) and read('data/unbound-historical-cycles.json')[0]['numeric_results'] is None)
 ax=read('reference/serbia-ax-scope-audit.json');check('AX_scope_audit_read_only',ax['AX_kosovo_scope_offices']==ax['BB_serbia_scope_offices']==0 and ax['BB_merged_into_AX'] is False and ax['AX_modified'] is False and ax['source_office_register_sha256']==ax['source_office_register_after_sha256'] and len(ax['office_ids_inspected'])==178 and not any(x.startswith('XK-') for x in ax['office_ids_inspected']))
 fmap=read('contracts/column-map.json');cols=read('contracts/columns.json');expected=[(t,c) for t,cc in cols.items() for c in cc]
 check('exact_20_tables_223_columns',len(cols)==20 and len(expected)==len(fmap)==223 and [(r['table'],r['column']) for r in fmap]==expected and all(r['applied'] is False for r in fmap))
 check('24_gaps_38_examples',len(G)==24 and len(A)==38 and unique([g['gap_id'] for g in G]) and unique([a['example_id'] for a in A]))
 check('source_unique_retrieval_hash_scopes',len(S)==372 and unique([s['source_id'] for s in S]) and all((s['original_sha256'] is None if s['retrieval_status']!='downloaded_and_hashed' else bool(re.fullmatch('[a-f0-9]{64}',s['original_sha256']))) for s in S) and all(s['original_bundled'] is False for s in S))
 check('normalized_source_hashes',all(sha(P/s['normalized_path'])==s['normalized_sha256'] and (P/s['normalized_path']).stat().st_size==s['normalized_bytes'] and read(s['normalized_path'])['source_id']==s['source_id'] for s in S))
 check('no_checked_approval_boxes',all(not re.search(r'\[[xX]\]',p.read_text(encoding='utf-8')) for p in P.glob('*.md')))
 required=['README.md','JUSTIN_REPORT.md','Kosovo_Office_Register.md','Kosovo_Identity_Rules.md','Kosovo_Coverage.md','Kosovo_Research_Gaps.md','Kosovo_Acceptance_Examples.md','Kosovo_Field_Map.md','Kosovo_Source_Inventory.md','Prompt_BB_Full_Register_Field_Map_and_CI.md']
 check('required_documents',all((P/n).is_file() for n in required))
 cal=read('data/upcoming-calendar.json');lineage=read('reference/BH-lineage.json')
 check('BH_calendar_rows_sources',len(cal)==9 and unique([r['calendar_id'] for r in cal]) and all(s in si for r in cal for s in r['source_ids']))
 check('BH_every_current_office_calendar',set(o['office_id'] for o in cur)==set(x for r in cal for x in r['office_ids']))
 check('BH_no_invented_future_days',all(r['scheduled_date'] is None and r['justin_approved'] is False and r['applied_changes']==0 for r in cal))
 check('BH_full_term_years_and_runoff',cal[0]['next_occurrence_year']==2030 and all(cal[i]['next_occurrence_year']==2029 for i in [2,3,4]) and 'four weeks' in cal[4]['date_formula'])
 check('BH_indirect_president_hold',cal[1]['next_occurrence_year'] is None and cal[1]['office_ids']==[] and cal[1]['date_basis']=='research_hold')
 check('BH_country_prominence',all(r['country_surface_prominent'] and r['global_alert_window_filters_only'] for r in cal) and all('## Upcoming elections' in (P/f).read_text() for f in ['README.md','JUSTIN_REPORT.md']) and (P/'Kosovo_Upcoming_Elections.md').is_file())
 check('BH_lossless_inherited_records',all(sha(P/f)==h for f,h in lineage['unchanged_files'].items()))
 manifest={}
 for line in (P/'SHA256SUMS').read_text().splitlines():
  h,n=line.split('  ',1);assert n not in manifest;manifest[n]=h
 actual={p.relative_to(P).as_posix() for p in P.rglob('*') if p.is_file() and p.name not in ['SHA256SUMS','validation-report.json']}
 check('manifest_exact_file_inventory',set(manifest)==actual and all(not p.startswith('/') and '..' not in Path(p).parts for p in manifest))
 check('manifest_SHA256',all(sha(P/n)==h for n,h in manifest.items()))
 report={'status':'PASS' if all(c['passed'] for c in checks) else 'FAIL','as_of':'2026-09-29','applied_changes':0,'read_only':True,'human_approval':False,'research_gaps_closed':False,'counts':C,'check_count':len(checks),'passed':sum(c['passed'] for c in checks),'failed':[c['check'] for c in checks if not c['passed']],'checks':checks,'manifest_exclusions':['SHA256SUMS','validation-report.json'],'scope':'Integrity and recorded research invariants; not full legal/historical accuracy certification or importer test.'}
 print(json.dumps(report,ensure_ascii=False,indent=2));sys.exit(0 if report['status']=='PASS' else 1)
except Exception as exc:
 print(json.dumps({'status':'ERROR','error':str(exc),'checks_completed':checks,'applied_changes':0},ensure_ascii=False,indent=2));sys.exit(2)
