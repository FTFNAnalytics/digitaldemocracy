#!/usr/bin/env python3
"""Read-only documentary validation: no network, database or application writes."""
import json,hashlib,re,sys,collections
from pathlib import Path
root=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parent
def load(n):return json.loads((root/n).read_text())
def jl(n):return [json.loads(s) for s in (root/n).read_text().splitlines() if s]
checks=[]
def check(name,ok):
 checks.append(dict(check=name,pass_=bool(ok)))
 if not ok:raise AssertionError(name)
m=load('manifest.json');off=load('office_register.json');tiers=load('draft_tiers.json');ev=jl('events.jsonl');res=jl('results.jsonl');cal=load('upcoming_calendar.json');counts=load('counts.json')
check('research_only_no_approvals',m['applied_changes']==0 and not m['production_approved'] and not any(m['justin_approvals'].values()))
check('country_scope',m['country_id']=='peru' and m['country_code']=='PE' and all(o['country_id']=='peru' for o in off))
ids={o['office_id'] for o in off};check('unique_offices',len(ids)==len(off))
check('tier_one_to_one',len(tiers)==len(off) and {t['office_id'] for t in tiers}==ids and all(t['review_status']=='needs_review' and not t['justin_approved'] and not t['production_approved'] for t in tiers))
current=[o for o in off if o['era_status']=='current'];accepted=[o for o in current if o['disposition']=='research_accept'];held=[o for o in current if o['disposition']=='hold']
check('office_counts',len(current)==3840 and len(accepted)==3838 and len(held)==2 and len(off)==3841)
check('current_national_era',{o['family'] for o in current if o['level']=='national'}=={'presidential_ticket','senate','deputies','andean_delegation'})
check('historical_unicameral',len([o for o in off if o['family']=='unicameral_congress' and o['era_status']=='historical'])==1)
check('zero_EP_Mercosur',counts['ep_offices']==counts['mercosur_offices']==0 and not any(o['family'] in ['ep','mercosur'] for o in off))
roster=load('municipal_roster.json');check('full_municipal_roster',len(roster)==1893 and len({r['ubigeo'] for r in roster})==1893 and sum('Provincial' in r['source_office_title'] for r in roster)==196)
for r in roster:
 provincial='Provincial' in r['source_office_title'];prefix='pe-province-'+r['ubigeo'][:4] if provincial else 'pe-district-'+r['ubigeo']
 check('roster_pair_'+r['ubigeo'],{prefix+'-mayor',prefix+'-council'}<=ids)
check('Sangani_hold_only',{o['office_id'] for o in held}=={'pe-district-120307-mayor','pe-district-120307-council'} and all(o['next_regular_election'] is None for o in held))
check('regional_inventory',len(load('regional_roster.json'))==25 and sum(o['level']=='regional' for o in off)==50)
components=load('ticket_components.json');check('ticket_components',len(components)==27 and all(not c['independent_ballot'] and c['parent_office_id'] in ids for c in components))
check('no_guessed_successors',load('successor_edges.json')==[])
eids={e['event_id'] for e in ev};check('event_ids',len(eids)==len(ev))
check('event_office_references',all(set(e.get('office_ids',[]))<=ids for e in ev))
check('unmatched_geographies_explicit',all(e.get('office_ids') or e['disposition'].startswith('hold') for e in ev))
check('no_Sangani_2026_invention',all(not set(e.get('office_ids',[]))&{o['office_id'] for o in held} for e in ev))
check('result_unique_and_linked',len({r['result_id'] for r in res})==len(res) and all(r['event_id'] in eids for r in res))
check('missing_never_zero',all(r.get('votes') is None for r in res if r.get('missing_cells',0)>0))
check('no_negative_votes',all(r.get('votes') is None or isinstance(r['votes'],int) and r['votes']>=0 for r in res))
check('counts_match',counts['events']==len(ev) and counts['results']==len(res) and counts['office_rows']==len(off))
for c in load('certified_controls.json'):
 check('certified_arithmetic_'+c['event_id'],c['valid_votes']+c['blank_votes']+c['null_votes']==c['emitted_votes'])
 votes=sum(r['votes'] for r in res if r['event_id']==c['event_id'] and r['result_grain']=='party_or_list_total')
 check('certified_party_votes_'+c['event_id'],votes==c['valid_votes'])
for eid,seats in [('pe-2026-deputies',130),('pe-2026-andean',5),('pe-2026-senate-national_ballot',30),('pe-2026-senate-multiple_district_ballot',30)]:
 check('certified_seat_control_'+eid,sum(r.get('seats') or 0 for r in res if r['event_id']==eid and r['result_grain']!='candidate_preference')==seats)
check('calendar_prominence',all(r['country_surface_prominent'] and r['global_alert_window_does_not_exclude'] for r in cal))
check('2031_formulas_no_day',sum(r.get('next_occurrence_year')==2031 for r in cal)==5 and all(r.get('exact_date') is None for r in cal if r.get('next_occurrence_year')==2031))
check('next_ordinary_local_families',sum(r.get('next_occurrence_year')==2030 for r in cal)==6 and all(r.get('exact_date') is None for r in cal if r.get('next_occurrence_year')==2030))
check('no_past_upcoming_dates',all(not r.get('exact_date') or r['exact_date']>m['calendar_as_of'] for r in cal))
check('official_regional_runoff_date',sum(r.get('exact_date')=='2026-12-06' for r in cal)==1 and all(r.get('formal_executive_call_verified') is False for r in cal if r.get('exact_date')=='2026-12-06'))
check('official_centros_poblados_date_scope_hold',sum(r.get('exact_date')=='2026-11-01' and 'scope hold' in r['date_basis'] for r in cal)==1)
check('separate_historical_cutoff',m['historical_normalization_as_of']=='2026-09-30' and m['calendar_as_of']=='2026-10-31')
comparison=load('roster_refresh_comparison.json')
check('no_roster_churn',not comparison['adds'] and not comparison['removes'] and not comparison['identity_changes'])
check('no_stale_office_dates',all(o.get('next_regular_election') is None for o in current))
for fn in ['README.md','Justin_Report.md','Peru_Upcoming_Elections.md']:
 s=(root/fn).read_text();check('calendar_in_'+fn,'Upcoming elections' in s and '2031' in s and '18-month' in s)
 check('unchecked_approvals_'+fn,'[x]' not in s.lower())
fm=load('Peru_Field_Map_223.json');actual=[]
for p in (root/'contracts').glob('*.txt'):
 for table,body in re.findall(r'CREATE TABLE (\w+) \((.*?)\n\) STRICT;',p.read_text(),re.S):
  if table!='schema_migration':actual.extend((table,c) for c in re.findall(r'^    (\w+) (?:TEXT|INTEGER|REAL|BLOB)\b',body,re.M))
check('exact_223_contract',len(fm)==223 and len(actual)==223 and {(r['table'],r['column']) for r in fm}==set(actual) and all(not r['target_write_permitted'] for r in fm))
check('acceptance_examples',len(load('acceptance_examples.json'))>=15)
inventory=load('source_inventory.json');names={s['original_filename'] for s in inventory}
check('office_sources_retained',all(set(o['source_files'])<=names for o in off))
check('event_result_sources_retained',all(e['source_file'] in names for e in ev) and all(r['source_file'] in names for r in res))
for s in inventory:
 p=root/s['file'];check('source_hash_'+s['source_id'],p.is_file() and p.stat().st_size==s['bytes'] and hashlib.file_digest(p.open('rb'),'sha256').hexdigest()==s['sha256'])
manifest=root/'SHA256SUMS'
if manifest.exists():
 tracked={}
 for line in manifest.read_text().splitlines():
  sha,name=line.split('  ',1);tracked[name]=sha;p=root/name
  check('sha_'+name,p.is_file() and hashlib.file_digest(p.open('rb'),'sha256').hexdigest()==sha)
 actualfiles={str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p.name!='SHA256SUMS' and not any(part.startswith('.') for part in p.relative_to(root).parts)}
 check('hash_manifest_complete',set(tracked)==actualfiles)
else:raise AssertionError('SHA256SUMS missing')
print(json.dumps(dict(status='PASS',checks=len(checks),counts=counts,applied_changes=0,justin_approved=False,limitation='Integrity and documentary scope pass; historical completeness and certification are not asserted.'),ensure_ascii=False,indent=2))
