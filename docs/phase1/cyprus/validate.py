#!/usr/bin/env python3
"""Read-only research-pack validator. Standard library; no network or operational writes."""
import collections,copy,hashlib,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((ROOT/n).read_text(encoding='utf-8'))
def check_data(data):
 errors=[]
 def ck(test,msg):
  if not test:errors.append(msg)
 O=data['office-register'];T=data['draft-tiers'];E=data['events'];U=data['reporting-units'];R=data['results'];C=data['counts'];S=data['source-inventory'];M=data['metadata']
 for name,rows,key in [('office',O,'office_id'),('tier',T,'office_id'),('event',E,'event_id'),('unit',U,'unit_id'),('result',R,'result_id'),('source',S,'source_id')]:ck(len({x[key] for x in rows})==len(rows),name+' identity duplicate')
 ob={o['office_id']:o for o in O};eb={e['event_id']:e for e in E};ub={u['unit_id']:u for u in U};sb={s['source_id']:s for s in S}
 ck({o['office_id'] for o in O}=={t['office_id'] for t in T},'tiers not 1:1 with offices')
 ck(all(t['status']=='draft' and t['justin_approved'] is False for t in T),'tier approved or non-draft')
 ck(M['applied_changes']==0 and M['justin_approved'] is False,'operational change or approval')
 ck(M['current_register_complete'] is False,'unresolved community gate falsely closed')
 current=[o for o in O if o['status']=='current'];hist=[o for o in O if o['status']=='historical_only']
 ck(len(current)==714 and len(hist)==174,'current/historical office inventory count drift')
 types=collections.Counter(o['office_type'] for o in current)
 ck(types=={'municipal_council':20,'mayor':20,'deputy_mayor':93,'community_council':285,'community_leader':285,'district_organisation_president':5,'national_parliament':1,'president':1,'european_parliament_delegation':1,'religious_group_representative':3},'current office type counts differ')
 ck(sum(o['direct_executive'] for o in current)==404,'direct executive count drift')
 ck(sum(o['seats'] for o in current if o['office_type']=='municipal_council')==442,'municipal component seat total differs')
 ck(sum(o['seats'] for o in current if o['office_type']=='community_council')==1464,'community component seat total differs')
 ck(not any(o['office_type'] in ['community_deputy','prime_minister','cabinet','appointed_district_commissioner'] for o in O),'excluded office type')
 ck(all(o['selection_mode']=='direct_popular' for o in O),'unexpected mechanism')
 ck(all(o['justin_approved'] is False for o in O),'office approval not false')
 ck(len(data['municipalities'])==20 and len(data['communities'])==285 and len(data['municipal-quarters'])==93,'territory count mismatch')
 ck(len({x['code'] for x in data['municipalities']})==20,'municipality duplicate')
 ck(collections.Counter(x['district_id'] for x in data['communities'])=={1:88,4:32,5:86,6:79},'community district counts differ')
 ck(not data['successor-crosswalk'],'unsupported legal successor edge')
 ck(ob['CY-COM-SPILIA-KOURDALI-council']['ec_area_id'] is None,'Spilia Kourdali code invented')
 ck(ob['CY-HOUSE']['seats']==56 and ob['CY-HOUSE']['reserved_vacant_seats']==24,'House seat universes conflated')
 ck(all(ob['CY-HOUSE-REL-'+x]['parliamentary_voting_right'] is False for x in ['ARM','LAT','MAR']),'religious representative voting status')
 excluded_municipal_ec={13304,13000,12217,12000,11139,12222,13221,13202,11340}
 ck(not any(o.get('ec_area_id') in excluded_municipal_ec for o in current if o['office_type'] in ['mayor','municipal_council']),'occupied local municipality included')
 for e in E:
  ck(e['office_id'] in ob,'event office FK '+e['event_id']);ck(e['justin_approved'] is False,'event approval')
  ck((e['date_precision']=='day' and len(e['date'])==10) or (e['date_precision']=='year' and len(e['date'])==4),'date precision '+e['event_id'])
 for u in U:ck(u['event_id'] in eb,'unit event FK '+u['unit_id'])
 byunit=collections.defaultdict(list)
 for r in R:
  ck(r['event_id'] in eb and r['unit_id'] in ub,'result FK '+r['result_id'])
  if r['unit_id'] in ub:ck(ub[r['unit_id']]['event_id']==r['event_id'],'cross-event result unit')
  ck(r['votes'] is None or (type(r['votes']) is int and r['votes']>=0),'vote is not nonnegative integer/null')
  ck(r['seats'] is None or (type(r['seats']) is int and r['seats']>=0),'seat is not nonnegative integer/null')
  ck(r['elected'] in [None,True,False],'invalid elected status')
  ck(r['result_kind'] in ['list_ballot','candidate_vote','candidate_preference','party_seats','returned_representative'],'unknown result kind')
  if r['votes_status']=='no_poll':ck(r['votes'] is None,'unopposed return has invented votes')
  if r['votes'] is None:ck(r['votes_status']!='reported','missing marked reported')
  if r.get('source_elected_marker')=='':ck(r['elected'] is None,'blank elected marker coerced to false')
  if r['result_kind']=='party_seats':ck(r['votes'] is None,'seat view conflated with ballot votes')
  byunit[r['unit_id']].append(r)
 checks=0
 for u in U:
  b=[r for r in byunit[u['unit_id']] if r['result_kind'] in ['list_ballot','candidate_vote']]
  if u.get('valid') is not None and b:
   checks+=1;ck(sum(r['votes'] for r in b)==u['valid'],'ballot sum mismatch '+u['unit_id'])
 for y in [2008,2013,2018,2023]:
  ee=[e for e in E if e['office_id']=='CY-PRESIDENT' and e['date'].startswith(str(y))]
  ck({e['round'] for e in ee}=={1,2},'presidential rounds missing/duplicated '+str(y))
  ck(len([r for r in R if r['event_id']==f'CY-PRESIDENT@{y}-R2'])==2,'runoff not top-two '+str(y))
 ck('CY-PRESIDENT@2003-R2' not in eb,'invented 2003 runoff')
 ck(ub['CY-PRESIDENT@2023-R1|national']['valid']==397317 and ub['CY-PRESIDENT@2023-R2|national']['valid']==394202,'2023 round universes conflated')
 ck(sum(r['votes'] for r in R if r['event_id']=='CY-HOUSE@2026' and r['result_kind']=='list_ballot')==372060,'2026 House ballots fail official total')
 ck(sum(r['seats'] for r in R if r['event_id']=='CY-HOUSE@2026' and r['result_kind']=='party_seats')==56,'2026 House seats fail')
 ck(sum(r['seats'] for r in R if r['event_id']=='CY-EP@2024' and r['result_kind']=='party_seats')==6,'2024 EP seats fail')
 ck(len([x for x in data['extraction-issues'] if x['kind']=='malformed_candidate_preference_row'])==3,'malformed-row quarantine drift')
 ck(not any(r['source_id']==next(s['source_id'] for s in S if s['input_path'].endswith('dataset-93-8a62d93b532e.csv')) and r['source_locator'] in ['CSV row 471','CSV row 472','CSV row 473'] for r in R),'quarantined malformed row normalized')
 cols=data['columns'];fm=data['field-map-223'];expected={(t,c) for t,cs in cols.items() for c in cs}
 ck(len(fm)==223 and len(expected)==223 and {(r['table'],r['column']) for r in fm}==expected,'223 field-map contract mismatch')
 ck(all(r['mapping'].strip() for r in fm),'blank field mapping')
 ck(len(data['acceptance-examples'])>=15,'fewer than 15 acceptance examples')
 ck(len(data['calendar'])==714 and all(x['alert_created'] is False and x['date'] is None for x in data['calendar']),'calendar invented alerts/dates')
 def refs(x):
  if isinstance(x,dict):
   for k,v in x.items():
    if k in ['source_id','elected_source_id'] and v:ck(v in sb,'missing source FK '+str(v))
    elif k=='source_ids':
     for v2 in v:ck(v2 in sb,'missing source FK '+str(v2))
    else:refs(v)
  elif isinstance(x,list):
   for v in x:refs(v)
 for key,value in data.items():
  if key not in ['source-inventory','columns']:refs(value)
 expected_counts={'current_offices':len(current),'historical_offices':len(hist),'office_rows':len(O),'events':len(E),'reporting_units':len(U),'results':len(R),'tier_histogram':dict(collections.Counter(t['tier'] for t in T)),'result_kinds':dict(collections.Counter(r['result_kind'] for r in R))}
 for k,v in expected_counts.items():ck(C[k]==v,'count mismatch '+k)
 return errors,checks
def main():
 data={f.stem:json.loads(f.read_text(encoding='utf-8')) for f in (ROOT/'data').glob('*.json')}
 data['metadata']=read('metadata.json');data['columns']=read('contract/columns.json')
 errors,totalchecks=check_data(data)
 for s in data['source-inventory']:
  f=ROOT/s['input_path']
  if not f.is_file():errors.append('missing retained source '+s['input_path']);continue
  b=f.read_bytes()
  if len(b)!=s['byte_count'] or hashlib.sha256(b).hexdigest()!=s['sha256']:errors.append('source byte/hash mismatch '+s['input_path'])
  if not s['url']:errors.append('source recovery URL missing '+s['input_path'])
 manifest=ROOT/'SHA256SUMS';manifest_count=0
 if not manifest.exists():errors.append('SHA256SUMS missing')
 else:
  listed=set()
  for line in manifest.read_text().splitlines():
   sha,name=line.split('  ',1);manifest_count+=1;listed.add(name);f=ROOT/name
   if not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=sha:errors.append('manifest mismatch '+name)
  actual={str(f.relative_to(ROOT)) for f in ROOT.rglob('*') if f.is_file() and f.name!='SHA256SUMS' and '__pycache__' not in f.parts}
  if listed!=actual:errors.append('manifest file coverage mismatch')
 # Negative controls prove gates reject meaningful corruption, without touching disk.
 neg=[]
 tests=[('duplicate_office',lambda x:x['office-register'].append(copy.deepcopy(x['office-register'][0])),'office identity duplicate'),('approved_tier',lambda x:x['draft-tiers'][0].update(justin_approved=True),'tier approved or non-draft'),('fabricated_no_poll_votes',lambda x:next(r for r in x['results'] if r['votes_status']=='no_poll').update(votes=0),'unopposed return has invented votes'),('falsely_complete_register',lambda x:x['metadata'].update(current_register_complete=True),'unresolved community gate falsely closed')]
 for name,mutate,expected in tests:
  altered=copy.deepcopy(data);mutate(altered);ee,_=check_data(altered);passed=expected in ee;neg.append({'case':name,'rejected_as_expected':passed})
  if not passed:errors.append('negative control failed '+name)
 report={'status':'PASS' if not errors else 'FAIL','scope':'frozen research-pack integrity, not election certification or approval','applied_changes':0,'current_register_complete':False,'historical_coverage_exhaustive':False,'office_rows':len(data['office-register']),'draft_tier_rows':len(data['draft-tiers']),'events':len(data['events']),'results':len(data['results']),'sources_hashed':len(data['source-inventory']),'manifest_files_hashed':manifest_count,'ballot_sum_checks':totalchecks,'field_map_columns':len(data['field-map-223']),'acceptance_examples':len(data['acceptance-examples']),'negative_controls':neg,'errors':errors}
 print(json.dumps(report,ensure_ascii=False,indent=2))
 return 0 if not errors else 1
if __name__=='__main__':sys.exit(main())
