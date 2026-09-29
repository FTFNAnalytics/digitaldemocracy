#!/usr/bin/env python3
"""Read-only Chile BJ pack validator. No network, database, importer or file writes."""
import json,hashlib,re,collections,sys
from pathlib import Path
P=Path(__file__).resolve().parent
checks=[]
def check(name,ok):checks.append({'check':name,'passed':bool(ok)})
def read(n):return json.loads((P/n).read_text())
def lines(n):return [json.loads(x) for x in (P/n).open() if x.strip()]
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
try:
 s=read('Count_Summary.json');o=read('data/office_register.json');t=read('data/draft_tiers.json');c=read('data/comuna_register.json');e=lines('data/events.jsonl');r=lines('data/results.jsonl');cal=read('data/upcoming_calendar.json');sources=read('Source_Inventory.json');aliases=read('data/source_aliases.json')
 check('required_documents',all((P/n).exists() for n in ['README.md','Justin_Report.md','Chile_Upcoming_Elections.md','Chile_223_Column_Field_Map.md','Identity_Rules.md','Research_Gaps.md','Acceptance_Examples.md','SHA256SUMS']))
 check('no_applied_changes',s['applied_changes']==0)
 check('approvals_all_false',all(v is False for v in s['justin_approvals'].values()) and all(x['justin_approved'] is False for x in t))
 check('approval_boxes_unchecked',all('[x]' not in (P/n).read_text().lower() for n in ['README.md','Justin_Report.md']))
 check('country_identity',all(x['country_id']=='chile' and x['country_code']=='CL' for x in o))
 check('office_ids_unique',len({x['office_id'] for x in o})==len(o))
 check('full_current_count',sum(x['current'] for x in o)==725==s['current_offices'])
 check('historical_extraordinary_count',sum(x['historical_only'] for x in o)==2 and {x['office_family'] for x in o if not x['current']}=={'constitutional_convention','constitutional_council'})
 expected={'president':1,'deputies':1,'senate':1,'governor':16,'core':16,'mayor':345,'council':345}
 check('family_histogram',dict(collections.Counter(x['office_family'] for x in o if x['current']))==expected==s['current_family_counts'])
 check('tier_one_to_one',len(t)==len(o) and {x['office_id'] for x in t}=={x['office_id'] for x in o})
 check('tier_vocabulary',all(x['tier'] in ['national_context','regional','municipal','other'] for x in t))
 check('tier_histogram',dict(collections.Counter(x['tier'] for x in t))=={'national_context':5,'regional':32,'municipal':690})
 check('comuna_inventory_346',len(c)==346 and len({x['comuna_key'] for x in c})==346)
 check('shared_municipal_group_345',len({x['municipal_key'] for x in c})==345 and all(x['municipal_key']=='cabodehornos' for x in c if x['comuna_key'] in ['antartica','cabodehornos']))
 check('all_municipal_bodies_present',all('cl-'+f+'-'+x['municipal_key'] in {v['office_id'] for v in o} for x in c for f in ['mayor','council']))
 check('excluded_offices_zero',s['EP_offices']==s['provincial_elected_offices']==s['appointed_era_popular_offices']==s['submunicipal_accepted']==0)
 check('no_successor_edges',s['successor_edges']==0)
 check('event_ids_unique',len({x['event_id'] for x in e})==len(e)==s['events'])
 check('result_ids_unique',len({x['result_id'] for x in r})==len(r)==s['results'])
 eventids={x['event_id'] for x in e};officeids={x['office_id'] for x in o}
 check('result_event_references',all(x['event_id'] in eventids for x in r))
 check('office_references',all(x['office_id'] is None or x['office_id'] in officeids for x in e+r))
 check('unlinked_offices_explicit_hold',all('hold' in x['mapping_state'] for x in e if x['office_id'] is None))
 check('missing_numbers_not_zero_filled',all(x.get('votes') is None for x in r if x.get('missing_vote_components',0)>0))
 check('nonnegative_observed_votes',all(x.get('votes') is None or (isinstance(x['votes'],int) and x['votes']>=0) for x in r))
 check('share_fraction_range',all(x.get('share') is None or 0<=x['share']<=1 for x in r))
 check('source_elected_seats_only',all(x.get('seats') is None or x['seats']==1 for x in r))
 check('candidate_names_not_ballot_totals',all(re.fullmatch(r'VOTOS (?:NULOS|EN BLANCOS?)',x['candidate_or_label'].strip().upper()) for x in r if x['result_kind']=='ballot_total') and all(x['result_kind']=='candidate' for x in r if x.get('candidate_or_label')=='DORIS BLANCO LLANQUILEO'))
 check('source_review_warnings_retained',sum(x['result_state']=='hold_source_in_review' for x in e)==6 and sum(x['result_state']=='hold_source_in_review' for x in r)==416)
 check('unlabelled_codes_not_interpreted',sum(x['result_kind']=='unlabelled_source_code' for x in r)==68 and all(x['candidate_or_label'] is None and x['source_ballot_code'] in [900,901] for x in r if x['result_kind']=='unlabelled_source_code'))
 eb={x['event_id']:x for x in e}
 winners=collections.Counter((eb[x['event_id']]['family'],eb[x['event_id']]['election_year']) for x in r if x.get('elected') is True)
 check('certified_senate_cohorts',winners['senate',2021]==27 and winners['senate',2025]==23)
 check('certified_deputies_totals',winners['deputies',2021]==155 and winners['deputies',2025]==155)
 check('certified_convention_total',winners['constitutional_convention',2021]==155)
 pres=[x for x in r if x['result_kind']=='candidate_national_derived']
 check('presidential_2025_national_reconciliation',len(pres)==8 and sum(x['votes'] for x in pres)==12975034 and all(len(x['component_result_ids'])==17 for x in pres))
 check('separate_2025_presidential_rounds',all(x in eventids for x in ['cl-president-2025-11-16','cl-president-2025-12-14']))
 check('governor_2024_runoff_11_regions',sum(x['family']=='governor' and x['date']=='2024-11-24' for x in e)==11)
 check('separate_annulled_repeat_events',sum(x['event_kind']=='partially_annulled_original' for x in e)==2 and sum(x['event_kind']=='partial_repeat' for x in e)==2)
 check('1992_conflict_retained',all(x['date'] is None and x['source_dates']==['1992-10-28'] for x in e if x['family']=='council' and x['election_year']==1992))
 check('no_early_popular_governors',all(x['election_year']>=2021 for x in e if x['family']=='governor'))
 check('no_pre2013_popular_core',all(x['election_year']>=2013 for x in e if x['family']=='core'))
 check('no_2013_or_2017_nuble_core',not any(x['office_id']=='cl-core-16' and x['election_year']<2021 for x in e))
 calids={x['calendar_id'] for x in cal}
 check('every_current_office_has_calendar',all(x['upcoming_calendar_id'] in calids for x in o if x['current']))
 check('all_ordinary_calendar_families',set(expected)<={f for x in cal for f in x['office_families']})
 check('no_invented_exact_upcoming_days',all(x['exact_date'] is None for x in cal))
 check('calendar_sources_and_basis',all(x['source_urls'] and x['date_basis'] and x['last_comparable_contest'] for x in cal))
 check('country_calendar_outside_alert_window',all(x['country_surface_required'] and not x['global_alert_window_changes_coverage'] for x in cal) and {2028,2029}<={x['next_occurrence_year'] for x in cal})
 check('calendar_first_class_three_documents',all('Upcoming elections' in (P/n).read_text() and '~18-month' in (P/n).read_text() for n in ['README.md','Justin_Report.md','Chile_Upcoming_Elections.md']))
 columns=read('contracts/columns.json');mapping=read('contracts/field_map_223.json');expectedcols={(tab,col) for tab,cols in columns.items() for col in cols}
 check('exact_223_map_one_to_one',len(mapping)==223==len(expectedcols) and {(x['table'],x['column']) for x in mapping}==expectedcols)
 ddl=(P/'contracts/atlas_master_reference.txt').read_text()+'\n'+(P/'contracts/atlas_attempt_log_reference.txt').read_text()
 actual={tab:re.findall(r'^    (\w+)\s+(?:TEXT|INTEGER|REAL|BLOB)\b',body,re.M) for tab,body in re.findall(r'CREATE TABLE (\w+) \(\n(.*?)\n\) STRICT;',ddl,re.S) if tab!='schema_migration'}
 check('contract_matches_pinned_ddl',actual==columns)
 check('acceptance_examples_at_least_15',len(re.findall(r'^\| \d+ \|',(P/'Acceptance_Examples.md').read_text(),re.M))>=15)
 check('source_hashes',all((P/x['retained_path']).stat().st_size==x['byte_count'] and sha(P/x['retained_path'])==x['sha256'] for x in sources))
 check('hash_semantics_explicit',all(x['hash_semantics'] in ['downloaded_original_bytes','retrieval_text_snapshot_not_publisher_bytes'] for x in sources))
 sourceids={x['source_id'] for x in sources}|set(aliases)
 check('office_sources_resolve',all(f in sourceids for x in o for f in x['source_ids']))
 check('source_urls_present',all(x.get('url') for x in sources))
 check('event_sources_resolve',all(f in sourceids for x in e for f in x['source_files']))
 check('result_sources_resolve',all(ref[0] in sourceids for x in r for ref in x.get('source_refs',[])) and all(ref['source'] in sourceids for x in r for ref in x.get('source_aggregate_refs',[])))
 manifest={line.split('  ',1)[1]:line.split('  ',1)[0] for line in (P/'SHA256SUMS').read_text().splitlines() if line}
 check('sha256_manifest_integrity',all((P/p).is_file() and sha(P/p)==h for p,h in manifest.items()))
 check('sha256_manifest_complete',{str(p.relative_to(P)) for p in P.rglob('*') if p.is_file() and p.name!='SHA256SUMS'}==set(manifest))
 check('coverage_holds_not_hidden',s['research_coverage_complete'] is False and s['current_office_inventory_complete'] is True)
except Exception as exc:checks.append({'check':'validator_exception','passed':False,'error':str(exc)})
report={'pack':'Chile Prompt BJ','read_only':True,'applied_changes':0,'passed':all(x['passed'] for x in checks),'checks_total':len(checks),'checks_passed':sum(x['passed'] for x in checks),'checks':checks}
print(json.dumps(report,indent=2));sys.exit(0 if report['passed'] else 1)
