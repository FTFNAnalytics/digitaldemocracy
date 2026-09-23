#!/usr/bin/env python3
"""Offline research-pack validator. Read-only, standard library, no network or operational writes."""
import collections,csv,hashlib,json,pathlib,re,sys,zipfile
P=pathlib.Path(__file__).resolve().parent;D=P/'data'
def read(name):return json.loads((D/(name+'.json')).read_text())
def stream(name):
 with open(D/(name+'.jsonl'),encoding='utf-8') as f:
  for line in f:yield json.loads(line)
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def main():
 errors=[]
 def ck(x,msg):
  if not x:errors.append(msg)
 def keyed(name,key):
  out={};n=0
  for r in stream(name):n+=1;out[r[key]]=r
  ck(len(out)==n,name+' duplicate identity');return out
 O=keyed('office-register','office_id');T=keyed('draft-tiers','office_id');E=keyed('events','event_id');U=keyed('reporting-units','unit_id');C=read('counts');M=json.loads((P/'metadata.json').read_text());S=read('source-inventory');SB={s['source_id']:s for s in S};known={r['unit_id']:r for r in read('source-arithmetic-discrepancies')}
 ck(len(SB)==len(S),'source identity duplicate')
 ck(set(T)==set(O),'draft tiers not 1:1')
 ck(all(x['status']=='draft' and x['justin_approved'] is False for x in T.values()),'tier approval or status')
 ck(all(x['justin_approved'] is False for x in O.values()),'office approval')
 ck(M['applied_changes']==0 and M['justin_approved'] is False,'changes or approval')
 ck(M['current_register_complete'] is True and M['historical_coverage_exhaustive'] is False and M['research_coverage_complete'] is False,'completeness scope flags')
 current={k:o for k,o in O.items() if o['status']=='current'};hist=[o for o in O.values() if o['status']=='historical_only']
 expected={'municipal_council':34952,'departmental_council':95,'single_territorial_assembly':3,'metropolitan_council':1,'regional_council':14,'arrondissement_or_sector_council':34,'overseas_territorial_assembly':5,'new_caledonia_congress':1,'provincial_assembly':3,'national_lower_house':1,'national_upper_house':1,'president':1,'european_parliament_delegation':1}
 types=dict(collections.Counter(o['office_type'] for o in current.values()));ck(types==expected,'current office category count')
 ck(len(current)==35112,'current office total');ck(sum(o['direct_executive'] for o in current.values())==1,'direct executives')
 ck({o['office_id'] for o in current.values() if o['direct_executive']}=={'FR-PRESIDENT'},'invented local direct executive')
 ck(not any(o['office_type'] in ['mayor','prefect','prime_minister','cabinet','epci_executive','party_organisation'] for o in O.values()),'excluded office type')
 ck('FR-MUN-75056' in current and 'FR-CT-75C' not in current,'Paris double count')
 ck('FR-CT-69M' in current and 'FR-MUN-69123' in current,'Lyon missing distinct bodies')
 ck('FR-CT-6AE' in current and not {'FR-CT-67D','FR-CT-68D'}&set(current),'Alsace double count')
 ck(current['FR-CT-976R']['seats'] is None,'future Mayotte seats imported')
 ck(current['FR-NC-CONGRESS']['seats']==54 and current['FR-NC-CONGRESS']['selection_mode']=='direct_via_provincial_ballot','NC Congress footing')
 ck(current['FR-OM-986']['seats']==20,'WF assembly seats')
 ck(O['FR-SENATE']['selection_mode']=='indirect_electoral_college' and O['FR-AN']['selection_mode']=='direct_popular','chamber mechanism')
 # Independently reproduce INSEE municipality footing from retained ZIP.
 with zipfile.ZipFile(P/'sources/cog2026.zip') as z:
  def table(suffix):
   name=next(n for n in z.namelist() if n.endswith(suffix));return list(csv.DictReader(z.read(name).decode('utf-8-sig').splitlines()))
  com=table('v_commune_2026.csv');om=table('v_commune_comer_2026.csv');mov=table('v_mvt_commune_2026.csv')
 cogcom={x['COM'] for x in com if x['TYPECOM']=='COM'};ex=read('territory-exclusions');appointed={x['code'] for x in ex if x['reason'].startswith('Appointed')};extra={x['COM_COMER'] for x in om if x['NATURE_ZONAGE']=='COM' and x['COMER'] in ['975','987','988']}
 actual_mun={o['territory_code'] for o in current.values() if o['office_type']=='municipal_council'}
 ck(len(cogcom)==34875 and len(extra)==83 and len(appointed)==6,'COG footing cardinality')
 ck(actual_mun==(cogcom-appointed)|extra,'COG municipality set differs')
 ck(collections.Counter(x[:3] for x in extra)=={'975':2,'987':48,'988':33},'overseas commune breakdown')
 ck(not {'97701','97801'}&actual_mun,'statistical SB/SM municipal twins')
 ck(not read('successor-crosswalk'),'unsupported legal successor edges')
 ck(sum(1 for _ in stream('territorial-movements'))==len(mov)==13734,'geographic movement preservation')
 for o in O.values():ck(o['source_id'] in SB,'office source FK '+o['office_id'])
 for e in E.values():
  ck(e['office_id'] in O,'event office FK '+e['event_id']);ck(e['source_id'] in SB,'event source FK');ck(e['justin_approved'] is False,'event approval')
  ck(e['date_precision'] in ['day','year'],'event date precision');ck(len(e['date'])==(10 if e['date_precision']=='day' else 4),'event date value')
  if e['office_id']=='FR-SENATE':ck(e['electorate_type']=='electoral_college' and e['year']<2026,'Senate popular or future result')
 for u in U.values():ck(u['event_id'] in E,'unit event FK');ck(u['source_id'] in SB,'unit source FK')
 for year in [1995,2002,2007,2012,2017,2022]:ck({e['round'] for e in E.values() if e['office_id']=='FR-PRESIDENT' and e['year']==year}=={1,2},'presidential rounds '+str(year))
 # Independent modern CSV source comparison at the exact row/block locator.
 rawcsv={}
 for name in ['mun2026r1-communes.csv','mun2026r2-communes.csv','mun2026r1-plm.csv','mun2026r2-plm.csv','an2024r1-5163f2e3.csv','an2024r2-41ed46cd.csv']:
  with open(P/'sources'/name,encoding='utf-8-sig') as f:rawcsv['FR-S-'+name]=list(csv.reader(f,delimiter=';'))
 def integer(x):return int(x) if x is not None and str(x).strip() else None
 ids=set();sums=collections.Counter();numb=collections.Counter();missing=collections.Counter();rk=collections.Counter();epseats=collections.Counter();total=0;rawchecks=0;pf_result_count=0;wfcount=0;pres22=[];badlabel=0
 for r in stream('results'):
  total+=1;ck(r['result_id'] not in ids,'duplicate result '+r['result_id']);ids.add(r['result_id'])
  ck(r['event_id'] in E and r['unit_id'] in U,'result FK');ck(U[r['unit_id']]['event_id']==r['event_id'],'cross-event reporting unit')
  ck(r['source_id'] in SB,'result source FK');ck(r['votes'] is None or type(r['votes']) is int and r['votes']>=0,'invalid vote value');ck(r['seats'] is None or type(r['seats']) is int and r['seats']>=0,'invalid seat value')
  ck(r['votes_status']==('not_supplied' if r['votes'] is None else 'reported'),'missing vote coerced')
  if not r['contestant_label'].strip():
   ck(r['result_id']=='FR-MUN-86063@2026-R1|86063|1' and r.get('ballot_number')=='1' and r['votes']==65 and r['seats']==9,'undocumented blank contestant label '+r['result_id'])
  if r.get('source_elected_marker')=='':ck(r['elected'] is None,'blank elected marker coerced')
  if r['votes'] is not None:sums[r['unit_id']]+=r['votes'];numb[r['unit_id']]+=1
  else:missing[r['unit_id']]+=1
  rk[r['result_kind']]+=1
  if r['source_id'] in rawcsv:
   match=re.fullmatch(r'row (\d+), column (\d+)',r['source_locator']);ck(match is not None,'CSV result locator format')
   if match:
    rn,col=map(int,match.groups());raw=rawcsv[r['source_id']][rn-1];offset=5 if 'an2024' in r['source_id'] else 7
    ck(r['votes']==integer(raw[col-1+offset]),'raw CSV votes differ '+r['result_id']);rawchecks+=1
  if r['event_id'].startswith('FR-EP@') and r['result_kind']=='party_share_and_seats':epseats[E[r['event_id']]['year']]+=r['seats'] or 0;ck(r['votes'] is None,'EP inferred raw vote count')
  if '-pf.csv' in r['source_id']:pf_result_count+=1
  if r['event_id']=='FR-OM-986@2022-R1':wfcount+=1;ck(r['votes'] is None and r['seats']==1,'WF fabricated vote')
  if r['event_id']=='FR-PRESIDENT@2022-R2':pres22.append(r['votes'])
 ck(pf_result_count==0,'PF metrics-only return has invented results');ck(wfcount==20,'WF representative count')
 ck(epseats=={2009:72,2014:74,2019:74,2024:81},'EP constitutive seat totals')
 ck(sorted(pres22)==[13288686,18768639],'2022 presidential runoff votes')
 ck(U['FR-PRESIDENT@2022-R1|FR']['valid']==35132947 and U['FR-PRESIDENT@2022-R2|FR']['valid']==32057325,'presidential round universes')
 observed=set();sumchecks=0
 for uid,u in U.items():
  if u['ballot_sum_applicable'] and u['valid'] is not None and numb[uid] and not missing[uid]:
   sumchecks+=1
   if sums[uid]!=u['valid']:
    observed.add(uid);k=known.get(uid);ck(k is not None,'unlisted ballot discrepancy '+uid)
    if k:ck(k['reported_valid']==u['valid'] and k['sum_reported_votes']==sums[uid] and k['source_id']==u['source_id'],'changed source discrepancy '+uid)
 ck(observed==set(known),'discrepancy inventory drift')
 ck(M['source_discrepancies']==len(known)==38,'source discrepancy count')
 for s in S:
  f=P/s['input_path'];ck(f.is_file(),'retained source missing '+s['input_path']);ck(f.stat().st_size==s['byte_count'] and sha(f)==s['sha256'],'source byte/hash mismatch '+s['input_path']);ck(s['url'].startswith('https://'),'source URL absent')
 cols=json.loads((P/'contract/columns.json').read_text());fm=read('field-map-223');expectedfields={(t,c) for t,cs in cols.items() for c in cs}
 ck(len(cols)==20 and len(expectedfields)==len(fm)==223 and {(x['table'],x['column']) for x in fm}==expectedfields,'223-col contract mismatch');ck(all(x['mapping'] and x['operational_write'] is False for x in fm),'field map implies writes')
 ck(len(read('acceptance-examples'))>=15,'acceptance example minimum')
 calendar=list(stream('calendar'));ck(len(calendar)==len(current) and {x['office_id'] for x in calendar}==set(current),'calendar 1:1');ck(all(x['alert_created'] is False for x in calendar),'alert created')
 ck(next(x for x in calendar if x['office_id']=='FR-SENATE')['date']=='2026-09-27','Senate upcoming date')
 ck(not any('2026' in e['event_id'] for e in E.values() if e['office_id']=='FR-SENATE'),'upcoming Senate becomes historic')
 ck(len(list(stream('office-history-coverage')))==len(O),'history coverage office rows')
 expectcounts={'current_offices':len(current),'historical_offices':len(hist),'office_rows':len(O),'events':len(E),'reporting_units':len(U),'results':total,'current_by_type':types,'draft_tier_histogram':dict(collections.Counter(t['tier'] for t in T.values())),'result_kinds':dict(rk)}
 for k,v in expectcounts.items():ck(C[k]==v,'count mismatch '+k)
 issues=read('extraction-issues');ck(sum(x['kind']=='documented_unescaped_tab_in_list_label' for x in issues)==2,'two documented tab repairs');ck(not any(x['kind']=='unresolved_historical_territory' for x in issues),'unresolved historical codes')
 # Approval and package policy gates.
 for f in P.rglob('*.md'):ck(not re.search(r'\[[xX]\]',f.read_text()),'checked approval box '+str(f))
 ck({f.name for f in P.rglob('*.py')}=={'validate.py'},'unexpected executable code in research pack')
 # Byte manifest includes report but not itself; optional first run before manifest generation.
 manifest=P/'SHA256SUMS';listed=set()
 if manifest.exists():
  for line in manifest.read_text().splitlines():
   h,n=line.split('  ',1);listed.add(n);f=P/n;ck(f.is_file() and sha(f)==h,'manifest mismatch '+n)
  actual={str(f.relative_to(P)) for f in P.rglob('*') if f.is_file() and f.name!='SHA256SUMS' and '__pycache__' not in f.parts};ck(actual==listed,'manifest coverage mismatch')
 elif '--pre-manifest' not in sys.argv:errors.append('SHA256SUMS missing')
 # Pure negative controls of semantic gates; no source files are altered.
 def approve_ok(x):return x.get('applied_changes')==0 and x.get('justin_approved') is False
 def vote_ok(x):return x.get('votes_status')==('not_supplied' if x.get('votes') is None else 'reported')
 def tier_ok(keys,tiers):return keys==set(tiers) and all(v.get('status')=='draft' and v.get('justin_approved') is False for v in tiers.values())
 neg=[dict(case='approval_true',rejected_as_expected=not approve_ok({'applied_changes':0,'justin_approved':True})),dict(case='applied_change',rejected_as_expected=not approve_ok({'applied_changes':1,'justin_approved':False})),dict(case='missing_vote_marked_reported',rejected_as_expected=not vote_ok({'votes':None,'votes_status':'reported'})),dict(case='missing_tier',rejected_as_expected=not tier_ok({'a','b'},{'a':{'status':'draft','justin_approved':False}}))]
 ck(all(x['rejected_as_expected'] for x in neg),'negative control failure')
 report=dict(status='PASS' if not errors else 'FAIL',scope='Frozen research-pack integrity and extraction checks, not election certification or Justin approval',applied_changes=0,justin_approved=False,current_offices=len(current),historical_offices=len(hist),events=len(E),reporting_units=len(U),results=total,sources_hashed=len(S),manifest_files_hashed=len(listed),current_register_complete=True,historical_coverage_exhaustive=False,raw_modern_CSV_vote_comparisons=rawchecks,applicable_ballot_sum_checks=sumchecks,preserved_source_arithmetic_discrepancies=len(known),field_map_columns=len(fm),acceptance_examples=len(read('acceptance-examples')),negative_controls=neg,errors=errors)
 print(json.dumps(report,ensure_ascii=False,indent=2));return 0 if not errors else 1
if __name__=='__main__':sys.exit(main())
