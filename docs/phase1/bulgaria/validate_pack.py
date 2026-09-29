#!/usr/bin/env python3
"""Read-only offline validation of the Bulgaria BI research directory. No importer."""
from pathlib import Path, PurePosixPath
import json, hashlib, collections, re, sys, tarfile, datetime
ROOT=Path(__file__).resolve().parent
checks=[]
def j(p): return json.loads((ROOT/p).read_text())
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def check(code,description,ok):
 checks.append({'id':code,'description':description,'passed':bool(ok)})
def main():
 o=j('Bulgaria_Office_Register.json');t=j('Bulgaria_Draft_Tiers.json');c=j('Bulgaria_Counts.json');v=j('baseline/Prompt_P/Bulgaria_Identity_Vectors.json');p_t=j('baseline/Prompt_P/Accepted_Tiers.json')
 pe=j('data/P_Inherited_Events.json');pr=j('data/P_Inherited_Results.json');obs=j('data/P_Retained_Observations.json');e=j('data/BI_New_Events.json');r=j('data/BI_New_Results.json');cal=j('data/Upcoming_Elections.json');s=j('Bulgaria_Source_Inventory.json')
 oi={x['office_id']:x for x in o}; ei={x['event_id']:x for x in e};si={x['source_id']:x for x in s};tc={x['office_id']:x for x in t['classifications']}
 orig={x['office_id'] for x in v['offices']}; accepted={x['office_id'] for x in v['offices'] if x['office_type'] in ['Mayor','Municipal council']};held=orig-accepted
 check('A01','Exactly 533 current in-scope, 1 historical-only, 3067 held offices',len(o)==3601 and len(oi)==3601 and sum(x['lifecycle'] in ['current','current_baseline'] for x in o)==533 and sum(x['lifecycle']=='historical_only' for x in o)==1 and sum(x['scope_disposition']=='hold_submunicipal_scope' for x in o)==3067)
 check('A02','All 530 accepted P IDs and original labels/geography preserved',len(accepted)==530 and all(x['office_id'] in oi and oi[x['office_id']]['jurisdiction']==x['jurisdiction'] and oi[x['office_id']]['geography_id']==x['geography_id'] and oi[x['office_id']]['office']==x['office_type'] for x in v['offices']) and {x['office_id'] for x in o if x['scope_disposition']=='inherited_P_accepted'}==accepted)
 check('A03','3067 held identities never promoted',len(held)==3067 and all(oi[x]['scope_disposition']=='hold_submunicipal_scope' and tc[x]['production_disposition']=='hold' for x in held))
 check('A04','265 mayor/council pairs survive duplicate municipality labels',collections.Counter(x['family'] for x in o if x['office_id'] in accepted)=={'municipal_mayor':265,'municipal_council':265} and {x['office_id'][:-2] for x in o if x['family']=='municipal_mayor'}=={x['office_id'][:-2] for x in o if x['family']=='municipal_council'} and {'BG-RSE04-M','BG-RSE04-C','BG-VAR05-M','BG-VAR05-C'}<=accepted)
 check('A05','Tier records 1:1 and use the frozen P vocabulary',len(t['classifications'])==len(o) and set(tc)==set(oi) and all(x['tier'] in p_t['classification_vocabulary'] for x in tc.values()) and collections.Counter(x['tier'] for x in tc.values())==c['draft_tier_histogram'])
 check('A06','New BI approvals false, all Justin boxes unchecked',t['approval']['Justin'] is False and all(x['new_BI_approval'] is False for x in o+t['classifications']) and all(x['justin_approved'] is False for x in e+r+cal) and not any(re.search(r'\[[xX]\]',p.read_text()) for p in ROOT.rglob('*.md')))
 check('A07','P event vectors preserved without any changed original field',len(pe)==8661 and [{k:val for k,val in x.items() if k not in ['scope_disposition','provenance']} for x in pe]==v['events'])
 check('A08','P result vectors preserved without any changed original field',len(pr)==25817 and [{k:val for k,val in x.items() if k not in ['scope_disposition','provenance']} for x in pr]==v['results'])
 check('A09','All 10337 first-round/unresolved observations retained',obs==v['retained_observation_bindings'] and collections.Counter(x['kind'] for x in obs)=={'first_round':7746,'unresolved':2591})
 gradec=[x for x in obs if x['office_id']=='BG-SLV11-b88d0d4475-V']
 check('A10','Gradec 2015 remains six first-round plus two unresolved observations',collections.Counter(x['kind'] for x in gradec)=={'first_round':6,'unresolved':2} and not any(x['office_id']=='BG-SLV11-b88d0d4475-V' and '::2015::' in x['history_key'] for x in pe))
 pct=[x for x in pr if x['votes'] is None and x['share'] is not None]
 check('A11','P missing votes and explicit zeros remain distinct',len(pct)==587 and len({x['event_id'] for x in pct})==221 and sum(x['votes']==0 for x in pr)==26 and sum(x['share']==0 for x in pr)==28 and sum(x['seats']==0 for x in pr)==14247)
 check('A12','Inherited history counts retain accepted/held separation',collections.Counter(x['scope_disposition'] for x in pe)=={'inherited_P_accepted':1590,'hold_submunicipal_scope':7071} and collections.Counter(x['scope_disposition'] for x in pr)=={'inherited_P_accepted':10343,'hold_submunicipal_scope':15474})
 check('A13','New event/result IDs unique and referentially complete',len(e)==31 and len(r)==421 and len(ei)==31 and len({x['result_id'] for x in r})==421 and all(x['office_id'] in oi for x in e) and all(x['event_id'] in ei and x['office_id']==ei[x['event_id']]['office_id'] for x in r))
 recent={x['date'] for x in e if x['office_id']=='BG-NATIONAL-ASSEMBLY' and x['date']>='2021'}
 check('A14','Eight distinct parliamentary contests from 2021 through April 2026',recent=={'2021-04-04','2021-07-11','2021-11-14','2022-10-02','2023-04-02','2024-06-09','2024-10-27','2026-04-19'})
 octs=[x for x in e if x['office_id']=='BG-NATIONAL-ASSEMBLY' and x['date']=='2024-10-27']
 check('A15','Court correction stays on October 2024 contest, never new 2025 ballot',len(octs)==1 and octs[0]['result_status']=='CIK_court_corrected_published' and not any(x['date'].startswith('2025') for x in e) and any(x['label']=='ПП ВЕЛИЧИЕ' and x['seats']==10 for x in r if x['event_id']==octs[0]['event_id']))
 check('A16','1997 untranscribed results remain zero rows, not zero-valued results',len([x for x in e if x['date']=='1997-04-19'])==1 and not any('1997-04-19' in x['event_id'] for x in r))
 check('A17','EP begins in 2007 and all five contest years retained',sorted(x['date'][:4] for x in e if x['office_id']=='BG-EUROPEAN-PARLIAMENT')==['2007','2009','2014','2019','2024'] and not any('2004-' in x['date'] for x in e if x['office_id']=='BG-EUROPEAN-PARLIAMENT') and all(x['votes'] is None for x in r if x['office_id']=='BG-EUROPEAN-PARLIAMENT' and '2007-05-20' not in x['event_id']))
 check('A18','Presidential joint family and separate rounds; invalid votes never seats',sum(x['office_id']=='BG-PRESIDENT-JOINT-TICKET' for x in o)==1 and collections.Counter(x['round'] for x in e if x['office_id']=='BG-PRESIDENT-JOINT-TICKET')=={1:4,2:4} and all(x['seats'] is None for x in r if x['office_id']=='BG-PRESIDENT-JOINT-TICKET'))
 g=[x for x in e if x['office_id']=='BG-GRAND-NATIONAL-ASSEMBLY-1990']
 check('A19','Distinct historical GNA, 400 total seats across two explicit polling dates',len(g)==1 and g[0]['date']=='1990-06-10' and g[0]['date_end']=='1990-06-17' and sum(x['seats'] for x in r if x['office_id']==g[0]['office_id'])==400 and oi[g[0]['office_id']]['lifecycle']=='historical_only')
 check('A20','All five ordinary calendar families present and country-visible',{'national_assembly','presidential_ticket','european_parliament','municipal_council','municipal_mayor'}<={x['office_family'] for x in cal if x['date_basis']!='research hold'} and all(x['country_surface_prominent'] and x['global_alert_window_controls_country_visibility'] is False for x in cal))
 check('A21','2027/2029/2030 formula cards do not invent exact days',all(x['scheduled_date'] is None for x in cal if x['next_year'] in [2027,2029,2030]) and {2027,2029,2030}<={x['next_year'] for x in cal})
 check('A22','Presidential official first ballot and formula-only conditional runoff',next(x for x in cal if x['calendar_id']=='BI-CAL-PRES')['scheduled_date']=='2026-10-25' and next(x for x in cal if x['calendar_id']=='BI-CAL-PRES-R2')['scheduled_date'] is None)
 check('A23','Called Polski Trambesh by-election stays on existing mayor ID',all(x['office_id']=='BG-VTR26-M' for x in cal if x['calendar_id'].startswith('BI-CAL-TRAMBESH')) and {x['scheduled_date'] for x in cal if x['calendar_id'].startswith('BI-CAL-TRAMBESH')}=={'2026-10-18','2026-10-25'})
 check('A24','Early Assembly contingency has no fabricated future day/year',next(x for x in cal if x['calendar_id']=='BI-CAL-NA-EARLY')['scheduled_date'] is None and next(x for x in cal if x['calendar_id']=='BI-CAL-NA-EARLY')['next_year'] is None)
 expected={(table,col) for table,cs in j('contracts/columns.json').items() for col in cs};fm=j('Bulgaria_Field_Map_223.json')
 check('A25','All 223 destination columns mapped exactly once, 20 tables',len(expected)==len(fm)==223 and len(j('contracts/columns.json'))==20 and {(x['table'],x['column']) for x in fm}==expected and all(x['implementation_applied'] is False and x['BI_mapping_or_null_policy'] for x in fm))
 check('A26','No regional offices, guessed successors or applied changes',c['regional_offices']==0 and not any(x['tier']=='regional' for x in o) and j('data/Successor_Links.json')==[] and c['applied_changes']==t['applied_changes']==0 and c['research_coverage_complete'] is False)
 sourceids=[x['source_id'] for x in e+r+o]
 sourceids += [s for x in e+r for s in x.get('additional_source_ids',[])]
 sourceids += [s for x in cal+j('Bulgaria_Research_Gaps.json') for s in x['source_ids']]
 check('A27','All BI typed/calendar/gap source IDs resolve',len(si)==len(s) and all(k in si for k in sourceids))
 check('A28','Saved-source hashes match, extraction hashes never pretend to be raw',all((ROOT/x['snapshot_file']).is_file() and sha(ROOT/x['snapshot_file'])==x['file_sha256'] for x in s if x.get('snapshot_file')) and all(x.get('remote_original_sha256') is None for x in s if x.get('retrieval_status')=='web_extracted_text_or_search_excerpt'))
 expected_hashes={'baseline/Prompt_P/Bulgaria_Identity_Vectors.json':'2d8bb80b9e47d056f798da4d9912430f78e4096448cbe82661c59869314cdffc','baseline/Prompt_P/Accepted_Tiers.json':'9a6718fe301f440511cc9e9f9b4139b3a1e0332ef2e3e6c9b3063f67f04652ab','baseline/Prompt_P/unpacked/tables/master/office-register.json':'00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559','baseline/Prompt_P/Original_Payload.tar.xz':'0b6b2c05dd8906f7e7a19927e847d4bc0aa83da8769e70ebbef012b13d0d287e'}
 check('A29','Original register, tiers, vectors and payload hashes unchanged',all(sha(ROOT/p)==h for p,h in expected_hashes.items()))
 inv=j('baseline/Prompt_P/Original_Payload_Inventory.json')['contents'];seen=set();safe=True
 with tarfile.open(ROOT/'baseline/Prompt_P/Original_Payload.tar.xz',mode='r:xz') as tar:
  for m in tar:
   pp=PurePosixPath(m.name)
   if not m.isfile() or pp.is_absolute() or '..' in pp.parts or m.name in seen:safe=False;continue
   seen.add(m.name);b=tar.extractfile(m).read()
   if m.name=='inventory.json':safe=safe and b==(ROOT/'baseline/Prompt_P/Original_Payload_Inventory.json').read_bytes()
   else:safe=safe and m.name in inv and hashlib.sha256(b).hexdigest()==inv[m.name]['sha256'] and len(b)==inv[m.name]['bytes']
 check('A30','Original archive member hashes and lengths verified without extraction',safe and seen==set(inv)|{'inventory.json'})
 issues=j('data/Result_Reconciliation_Holds.json')
 check('A31','Published aggregate conflicts explicitly retained and arithmetic reproducible',len(issues)==5 and all(sum(x['votes'] or 0 for x in r if x['event_id']==z['event_id'] and x['row_kind']!='ballot_choice_none_of_above')==z['transcribed_candidate_vector_sum'] and z['difference_vector_minus_headline']==z['transcribed_candidate_vector_sum']-z['published_headline_candidate_or_valid_votes'] and ei[z['event_id']]['quality_hold']=='aggregate_conflict_as_retrieved' for z in issues))
 valid_numbers=all((x[k] is None or isinstance(x[k],int) and not isinstance(x[k],bool) and x[k]>=0) for x in r for k in ['votes','seats']) and all(x['share_percent'] is None or 0<=x['share_percent']<=100 for x in r)
 dates_ok=all(datetime.date.fromisoformat(x['date']).isoformat()==x['date'] for x in e) and all(not x['date_end'] or x['date_end']>=x['date'] for x in e)
 check('A32','Typed numeric and historical date domains valid',valid_numbers and dates_ok)
 check('A33','Counts reconcile including held history and source-only observations',c['historical_event_total']==len(e)+len(pe)==8692 and c['result_row_total']==len(r)+len(pr)==26238 and c['new_result_rows']==len(r)==421 and c['retained_observations_not_events_or_results']==len(obs)==10337)
 check('A34','README/report/dedicated calendar each contain first-class calendar',all('Upcoming elections' in (ROOT/f).read_text() and '2030' in (ROOT/f).read_text() and '2029' in (ROOT/f).read_text() and 'global' in (ROOT/f).read_text() for f in ['README.md','Bulgaria_Justin_Report.md','Bulgaria_Upcoming_Elections.md']))
 check('A35','At least fifteen concrete acceptance examples with unique IDs',len(j('Bulgaria_Acceptance_Examples.json'))>=15 and len({x['case_id'] for x in j('Bulgaria_Acceptance_Examples.json')})==len(j('Bulgaria_Acceptance_Examples.json')))
 manifest=ROOT/'SHA256SUMS';mh={};integrity=manifest.is_file()
 if integrity:
  for line in manifest.read_text().splitlines():
   h,p=line.split('  ',1);pp=PurePosixPath(p)
   integrity=integrity and not pp.is_absolute() and '..' not in pp.parts and p not in mh and re.fullmatch('[0-9a-f]{64}',h) is not None
   mh[p]=h
  actual={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name!='SHA256SUMS' and '__pycache__' not in p.parts}
  integrity=integrity and actual==set(mh) and all((ROOT/p).is_file() and sha(ROOT/p)==h for p,h in mh.items())
 check('A36','SHA256SUMS covers every packaged file and every hash matches',integrity)
 result={'status':'PASS' if all(x['passed'] for x in checks) else 'FAIL','checks_passed':sum(x['passed'] for x in checks),'checks_total':len(checks),'applied_changes':0,'research_coverage_complete':False,'scope':'offline byte preservation, identity and documentary consistency; not external certification','counts':c,'checks':checks}
 print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['status']=='PASS' else 1
if __name__=='__main__':
 try:sys.exit(main())
 except Exception as ex:
  print(json.dumps({'status':'ERROR','error':str(ex),'checks_completed':checks},ensure_ascii=False,indent=2));sys.exit(2)
