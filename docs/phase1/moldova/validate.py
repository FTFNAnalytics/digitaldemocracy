#!/usr/bin/env python3
"""Read-only Moldova Prompt BC research-package validator. Python standard library only."""
import collections
import hashlib
import json
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parent
CHECKS=[]
def j(p):return json.loads((ROOT/p).read_text(encoding='utf-8'))
def jl(p):return [json.loads(s) for s in (ROOT/p).read_text(encoding='utf-8').splitlines() if s]
def check(name,condition,detail):
    CHECKS.append({'check':name,'status':'PASS' if condition else 'FAIL','detail':detail})
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    O=jl('data/office-register.jsonl');T=jl('data/draft-tiers.jsonl');E=jl('data/events.jsonl');R=jl('data/results.jsonl')
    S=jl('sources/source-inventory.jsonl');M=j('metadata.json');C=j('contracts/columns.json');F=j('contracts/column-map.json');G=j('data/research-gaps.json')
    B={o['office_id']:o for o in O};EB={e['event_id']:e for e in E};SB={s['source_id']:s for s in S};RR=collections.defaultdict(list)
    for r in R:RR[r['event_id']].append(r)
    current=[o for o in O if o['office_status']=='current'];hist=[o for o in O if o['office_status']=='historical_only']
    c_types=collections.Counter(o['office_type'] for o in current)
    check('current_register',len(current)==1822 and len(hist)==14 and len(O)==1836 and len(B)==1836,
          '1,822 current + 14 source-identified historical-only offices; keys unique.')
    check('tiers',len(T)==len(O) and {x['office_id'] for x in T}==set(B) and len({x['office_id'] for x in T})==len(T)
          and all(x['justin_approved'] is False and x['applied'] is False for x in T)
          and dict(collections.Counter(x['draft_tier'] for x in T))=={'national':2,'autonomous':2,'raion':32,'municipal':1800},
          'Exact 1:1 unapproved draft tiers; institutional-level histogram checked.')
    check('national',{o['office_type'] for o in current if o['scope_level']=='national'}=={'national_assembly','president'}
          and sum(o['scope_level']=='national' for o in current)==2,'Only Parliament and direct-era President.')
    pe=[e for e in E if e['office_id']=='MD-NAT-PRES']
    check('presidential_era',all(e['date'] and not ('2000-07-28'<=e['date']<'2016-03-04') for e in pe),
          'No popular presidential poll in the parliamentary-selection interval.')
    check('presidential_rounds',len(pe)==9 and {e['date'] for e in pe}=={'1991-12-08','1996-11-17','1996-12-01','2016-10-30','2016-11-13','2020-11-01','2020-11-15','2024-10-20','2024-11-03'},
          'All nine sourced popular rounds retained separately.')
    runoff=RR['MD-E-NAT-PRES-2024-11-03-r2']
    check('presidential_conflict',{r['candidate_or_list_label']:r['votes'] for r in runoff}=={'Maia Sandu':930139,'Alexandr Stoianoglo':750430}
          and all(r['share'] is None and r['evidence_status']=='primary_certified' for r in runoff),
          'Primary court vector retained; no spliced secondary shares.')
    check('no_ep',M['counts']['ep_offices']==0 and all(o['office_type']!='european_parliament' for o in O),
          'Zero European Parliament offices; event foreign keys constrain events to registered offices.')
    check('no_parallel',M['counts']['transnistria_parallel_offices']==0 and all(o['country_id']=='moldova' for o in O)
          and all(not any(x in o['name'].casefold() for x in ['pmr','transnistria','transnistrian','tiraspol']) for o in O),
          'Moldova-scope register only; no parallel institutions.')
    check('raions',c_types['raion_council']==32 and all(o['office_type']!='raion_president' for o in O),
          '32 elected raion councils; no popularly invented raion executive.')
    check('gagauzia',c_types['autonomous_assembly']==1 and c_types['autonomous_governor']==1
          and sum(o.get('within_gagauzia',False) for o in current)==52,
          'Two autonomous institutions and 26 separate local council/mayor pairs.')
    check('nested',sum(o.get('nested_under_municipality')=='Chișinău' for o in current)==36
          and sum(o.get('nested_under_municipality')=='Bălți' for o in current)==4,
          '18 Chișinău subordinate pairs; two Bălți subordinate pairs.')
    check('no_sectors',all(o.get('local_unit_status')!=4 for o in O),
          'No administrative sector converted into an elected office.')
    localgroups=collections.defaultdict(set)
    for o in current:
        if o['scope_level']=='local':localgroups[o['cuatm_code']].add(o['office_type'])
    check('amalgamation',len(localgroups)==893 and all(x=={'local_council','mayor'} for x in localgroups.values())
          and len(hist)==14 and sum(o['office_type']=='local_council' for o in hist)==7
          and sum(o['office_type']=='mayor' for o in hist)==7,
          '893 complete current pairs; seven source-identified historical pairs.')
    check('no_successors',not jl('data/successor-links.jsonl') and all(o['successor_office_id'] is None and o['predecessor_office_id'] is None for o in O),
          'No inferred successor/merger graph.')
    expanded=[f'MD-MUN-{code}-{kind}{suffix}' for code in ['4315','5701'] for kind in ['C','M'] for suffix in ['','-PRE2025']]
    check('expanded_centers',all(x in B for x in expanded) and all(B[x]['mandate_end_date'] is None for x in expanded if x.endswith('PRE2025')),
          'Current expanded Leova/Călinești and their old territories are distinct; mandate expiry not invented.')
    held=j('evidence/cec-2015-cornesti-unassigned.json');members=jl('evidence/cec-2015-elected-members.jsonl')
    check('cornesti',len(held)==24 and all(not (e['office_id'] in ['MD-MUN-9202-C','MD-MUN-9233-C'] and e['event_kind']=='elected_member_roster') for e in E),
          'Ambiguous Cornești members remain unassigned.')
    roster_e=[e for e in E if e['event_kind']=='elected_member_roster'];mr=[r for r in R if EB[r['event_id']]['event_kind']=='elected_member_roster']
    check('member_counts',len(members)==10540 and len(held)==24 and len(roster_e)==894
          and sum(r['seats'] for r in mr)==10540 and all(r['votes'] is None and r['share'] is None and r['seats_status']=='derived_count_of_official_named_members' for r in mr),
          '10,540 assigned + 24 held = 10,564 source councillors; seat-count derivation explicit.')
    mayors=[e for e in E if e['event_kind']=='election_cycle_roster'];mayorr=[r for r in R if EB[r['event_id']]['event_kind']=='election_cycle_roster']
    check('mayor_rosters',len(mayors)==1796 and len(mayorr)==1796 and all(e['date'] is None for e in mayors)
          and all(e['source_as_of']=='2024-05-19' for e in mayors if e['cycle_year']==2023)
          and all(r['votes'] is None and r['share'] is None and r['seats'] is None and r['elected_flag'] is True for r in mayorr),
          'Winner-only rosters have no manufactured date, votes, shares or executive seats.')
    smd=[e for e in E if e['event_kind']=='parliamentary_constituency_election']
    check('mixed_2019',len(smd)==51 and all(e['office_id']=='MD-NAT-PARL' for e in smd)
          and sum(r['seats'] or 0 for r in RR['MD-E-NAT-PARL-2019-list'])==50,
          '50-seat list component plus 51 SMD events under one Parliament office.')
    check('parliament_1994',sum(r['seats'] for r in RR['MD-E-NAT-PARL-1994-list'])==104,
          '1994 historical allocation not forced to 101.')
    apr=RR['MD-E-NAT-PARL-2009-04-05-list']
    check('april_2009',len(apr)==17 and sum(r['votes'] for r in apr)==1537087
          and next(r['votes'] for r in apr if r['candidate_or_list_label']=='PCRM')==760551,
          'Final recount column checked against CEC figures reproduced by ODIHR.')
    july=RR['MD-E-NAT-PARL-2009-07-29-list']
    check('july_2009',len(july)==8 and all(r['votes'] is None and r['share'] is not None for r in july),
          'No vote counts reconstructed from rounded percentages.')
    zeros=[r for r in R if r['votes']==0]
    check('zero',len(zeros)==1 and zeros[0]['candidate_or_list_label']=='NOVICOV EVGHENI'
          and zeros[0]['event_id']=='MD-E-MUN-8725-M-2023-11-05-numeric',
          'Explicit Novosiolovca zero retained; missing votes not coerced to zero.')
    hom=[r for r in R if r['candidate_or_list_label']=='TOPCIU DMITRI']
    check('homonyms',len(hom)==2 and sorted(r['votes'] for r in hom)==[79,103] and len({r['result_row_id'] for r in hom})==2,
          'Two homonymous Tomai candidates retain distinct ordinal identities.')
    check('gaga_repeat',EB['MD-E-GAG-A-2016-12-04-runoff-c1']['legal_outcome']=='annulled'
          and EB['MD-E-GAG-A-2017-03-05-repeat-c1']['date']=='2017-03-05',
          'Annulled runoff and subsequent repeat remain separate.')
    alu=[e for e in E if e['date'] in ['2023-11-19','2023-12-03','2023-12-17'] and e['office_id']=='MD-MUN-8716-M']
    check('aluatu',len(alu)==3 and next(e['legal_outcome'] for e in alu if e['date']=='2023-12-03')=='invalid_turnout',
          'Three separately sourced Aluatu polls; invalid-turnout status retained.')
    colkeys={(t,c) for t,cs in C.items() for c in cs};mapkeys=[(r['table'],r['column']) for r in F]
    check('field_map',len(C)==20 and len(colkeys)==223 and len(F)==223 and set(mapkeys)==colkeys
          and len(set(mapkeys))==len(mapkeys) and all(r['applied'] is False for r in F),
          'All 223 inherited columns appear once in documentation; no applied mapping.')
    source_refs=[x for r in O+E+R for x in r['source_refs']]
    source_ok=len(SB)==len(S) and all(x['source_id'] in SB and bool(x['locator']) for x in source_refs)
    source_ok=source_ok and all(s in SB for g in G for s in g['source_ids'])
    source_errors=[]
    for s in S:
        p=s.get('retained_original_path')
        if p and (not (ROOT/p).is_file() or sha(ROOT/p)!=s.get('original_bytes_sha256')):source_errors.append(s['source_id']+': original mismatch')
        for p,h in s.get('retained_fact_sha256',{}).items():
            if not (ROOT/p).is_file() or sha(ROOT/p)!=h:source_errors.append(s['source_id']+': extract mismatch')
    check('sources',source_ok and not source_errors,'All embedded provenance references resolve; bundled source and factual-extract hashes match.' if not source_errors else str(source_errors))
    check('no_changes',M['applied_changes']==0 and all(v is False for v in M['approvals'].values())
          and all(g['justin_approved'] is False for g in G)
          and not re.search(r'\[[xX]\]',(ROOT/'JUSTIN_REPORT.md').read_text()),
          'No applied changes and all Justin approval booleans/checkboxes unapproved.')
    check('coverage_honesty',M['research_coverage_complete'] is False and len(G)==24
          and all(o['complete_certified_history'] is False for o in jl('data/office-history-coverage.jsonl')),
          'Historical completeness is not claimed; 24 named research gates remain explicit.')
    check('foreign_keys',len(EB)==len(E) and len({r['result_row_id'] for r in R})==len(R)
          and all(e['office_id'] in B for e in E)
          and all(r['event_id'] in EB and r['office_id']==EB[r['event_id']]['office_id'] for r in R),
          'Unique event/result identities and office/event foreign-key closure.')
    nums_ok=all((r['votes'] is None or isinstance(r['votes'],int) and r['votes']>=0)
          and (r['seats'] is None or isinstance(r['seats'],int) and r['seats']>=0)
          and (r['share'] is None or 0<=r['share']<=100)
          and (r['share'] is None or r['share_unit']=='percent') for r in R)
    check('numeric_domains',nums_ok,'Nonnegative integer votes/seats; shares 0–100; missing values remain JSON null.')
    check('no_executive_seats',all(r['seats'] is None for r in R if B[r['office_id']]['office_type'] in ['mayor','president','autonomous_governor']),
          'No synthetic winner=1 or loser=0 seat values for direct executive results.')
    upcoming=[e for e in E if e['status']=='upcoming']
    check('upcoming',len(upcoming)==8 and all(e['date']>'2026-09-28' and not RR[e['event_id']] for e in upcoming),
          'Eight source-confirmed upcoming events, with no future results.')
    pelections=[e for e in E if e['event_kind']=='parliamentary_election']
    check('national_cycles',len(pelections)==11 and len({e['date'] for e in pelections})==11,
          'All eleven source-identified post-independence parliamentary cycles represented.')
    check('2025_parliament_total',sum(r['votes'] for r in RR['MD-E-NAT-PARL-2025-list'])==1578722
          and sorted(r['seats'] for r in RR['MD-E-NAT-PARL-2025-list'] if r['seats'] is not None)==[6,6,8,26,55],
          '2025 transcribed candidate votes and mandate allocation match the cited certified totals.')
    nov2025={e['office_id'] for e in E if e['date']=='2025-11-16'}
    check('november_2025_office_identity',nov2025=={'MD-MUN-1211-M','MD-MUN-4315-M','MD-MUN-4315-C','MD-MUN-4347-M','MD-MUN-4841-M','MD-MUN-5701-M','MD-MUN-5701-C','MD-MUN-7819-M'},
          'November 2025 Ustia is Glodeni, and Cremenciug is a mayoral replacement; no homonym or council substitution.')
    geos=jl('data/geographies.jsonl');geokeys={g['geography_id'] for g in geos}
    check('geography_closure',len(geokeys)==len(geos) and all(o['geography_id'] in geokeys for o in O)
          and all(g['parent_geography_id'] is None or g['parent_geography_id'] in geokeys for g in geos),
          'Every office resolves to a research geography; no duplicate geographic IDs.')
    counts=M['counts']
    check('count_summary',counts['office_rows']==len(O) and counts['events']==len(E) and counts['results']==len(R)
          and counts['current_direct_executives']==sum(c_types[k] for k in ['mayor','president','autonomous_governor'])
          and counts['current_representative_bodies']==sum(c_types[k] for k in ['local_council','raion_council','autonomous_assembly','national_assembly']),
          'Metadata count summary recomputes from records.')
    examples=j('validation/acceptance-examples.json');names={c['check'] for c in CHECKS}
    check('acceptance_examples',len(examples)>=15 and len(examples)==30 and all(x['validator_check'] in names and x['justin_approved'] is False for x in examples),
          'Thirty acceptance cases are bound to executed checks.')
    manifest=ROOT/'SHA256SUMS';hash_errors=[];listed={}
    if manifest.is_file():
        for line in manifest.read_text().splitlines():
            m=re.fullmatch(r'([0-9a-f]{64})  (.+)',line)
            if not m:hash_errors.append('malformed manifest line');continue
            h,p=m.groups();full=ROOT/p
            if p in listed or ROOT not in full.resolve().parents:hash_errors.append('duplicate or unsafe path: '+p);continue
            listed[p]=h
            if not full.is_file() or sha(full)!=h:hash_errors.append('hash mismatch: '+p)
        actual={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name!='SHA256SUMS'}
        if set(listed)!=actual:hash_errors.append('manifest coverage mismatch')
    else:hash_errors.append('SHA256SUMS missing')
    check('manifest',not hash_errors,{'retained_files':len(listed),'errors':hash_errors})
    failed=[x['check'] for x in CHECKS if x['status']=='FAIL']
    report={'validator':'Moldova Prompt BC read-only validator v1','snapshot':'2026-09-28','status':'PASS' if not failed else 'FAIL',
      'applied_changes':0,'historical_coverage_complete':False,'approval_effect':'none; all Justin boxes remain unchecked',
      'checks_run':len(CHECKS),'checks_passed':len(CHECKS)-len(failed),'failed_checks':failed,'counts':{'offices':len(O),'current':len(current),'historical_only':len(hist),'events':len(E),'results':len(R),'sources':len(S)},'checks':CHECKS}
    print(json.dumps(report,ensure_ascii=False,indent=2));return 1 if failed else 0

if __name__=='__main__':
    try:sys.exit(main())
    except Exception as exc:
        print(json.dumps({'status':'FAIL','error':type(exc).__name__+': '+str(exc),'applied_changes':0},ensure_ascii=False,indent=2));sys.exit(1)
