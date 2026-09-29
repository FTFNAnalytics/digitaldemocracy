#!/usr/bin/env python3
"""Offline, read-only validation of the Uruguay BF documentary pack.

Usage: python3 validate.py [extracted_pack_directory]
Only the Python standard library is used. No network, subprocess, application
connection, mutation or approval is performed. A pass does not certify that
historical transcription is exhaustive or that every official source is error-free.
"""
import collections
import hashlib
import json
import pathlib
import re
import sys
import unicodedata

P = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent
def read(name):
    return json.loads((P / name).read_text(encoding='utf-8'))
def rows(name):
    return [json.loads(line) for line in (P / name).read_text(encoding='utf-8').splitlines() if line.strip()]
def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()
def require(condition, message):
    if not condition:
        raise AssertionError(message)
def unique(items, key):
    require(len(items) == len({item[key] for item in items}), 'Duplicate ' + key)
def norm(value):
    return ''.join(c for c in unicodedata.normalize('NFKD', value.upper()) if not unicodedata.combining(c)).replace('PARTIDO ', '').strip()
def recursive(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from recursive(child)
    elif isinstance(value, list):
        for child in value:
            yield from recursive(child)

O = rows('data/office-register.jsonl')
E = rows('data/events.jsonl')
R = rows('data/results.jsonl')
T = rows('data/draft-tiers.jsonl')
U = rows('data/municipal-register.jsonl')
CAL = rows('data/upcoming-calendar.jsonl')
S = rows('sources/source-inventory.jsonl')
D = rows('data/deferred-calendar-holds.jsonl')
PRO = rows('data/proceedings.jsonl')
G = read('research-gaps.json')
C = read('counts.json')
M = read('manifest.json')
FM = read('field-map-223.json')
CONTRACT = read('contracts/columns.json')
A = read('acceptance-examples.json')
CAN = read('audit/canelones-certification-clauses.json')
CUR = [o for o in O if o['office_status'] == 'current']
HIST = [o for o in O if o['office_status'] == 'historical_only']
OB = {o['office_id']: o for o in O}
EB = {e['event_id']: e for e in E}
SB = {s['source_id']: s for s in S}
CB = {c['calendar_id']: c for c in CAL}
RB = collections.defaultdict(list)
for r in R:
    RB[r['event_id']].append(r)

def events(office=None, year=None, kind=None):
    return [e for e in E if (office is None or e['office_id'] == office) and (year is None or e['event_date'].startswith(str(year))) and (kind is None or e['event_kind'] == kind)]
def one_event(office, year, kind='ordinary'):
    found = events(office, year, kind)
    require(len(found) == 1, f'Expected one {office}/{year}/{kind}, found {len(found)}')
    return found[0]
def event_results(office, year, kind='ordinary'):
    return RB[one_event(office, year, kind)['event_id']]
def all_sources():
    records = O + E + R + U + CAL + G + D + PRO + rows('data/geography.jsonl') + rows('data/evidence-links.jsonl')
    for record in records:
        for key in ['source_ids', 'additional_source_ids']:
            for sid in record.get(key, []):
                yield sid
        for key in ['source_id', 'seat_source_id']:
            if record.get(key):
                yield record[key]

def check_scope_current():
    require(len(CUR) == 314, 'Current-office count')
    require(collections.Counter(o['scope_level'] for o in CUR) == {'national': 4, 'departmental': 38, 'municipal': 272}, 'Current scope breakout')
    require(collections.Counter(o['office_kind'] for o in CUR) == {'direct_executive': 157, 'council': 155, 'legislature': 2}, 'Current office families')
def check_scope_historical():
    require(len(HIST) == 24, 'Historical-only count')
    require(collections.Counter(o['office_kind'] for o in HIST) == {'collective_executive': 21, 'council': 3}, 'Historical bodies')
def check_tiers():
    unique(T, 'office_id')
    require({t['office_id'] for t in T} == set(OB) and len(T) == 338, 'Tier mapping is not 1:1')
    require(collections.Counter(t['draft_tier'] for t in T) == {'national': 6, 'regional': 57, 'local': 275}, 'Tier histogram')
    require(all(t['status'] == 'draft_unapproved' for t in T), 'Approved/non-draft tier')
def check_territory():
    unique(U, 'geography_id')
    require(len(U) == 136 and len({u['department_code'] for u in U}) == 19, 'Municipal inventory')
    expected = {'MO':8,'CA':32,'MA':8,'RO':4,'TT':6,'CL':16,'RV':3,'AR':3,'SA':6,'PA':9,'RN':3,'SO':5,'CO':13,'SJ':4,'FS':1,'FD':3,'DU':2,'LA':6,'TA':4}
    require(dict(collections.Counter(u['department_code'] for u in U)) == expected, 'Department municipal counts')
    for u in U:
        require(u['source_ids'] == ['municipal-annex'], 'Inventory must use signed annex')
        require(all(u['geography_id'] + suffix in OB for suffix in ['-C', '-A']), 'Missing municipal office pair')
def check_canelones_32():
    require(sum(u['department_code'] == 'CA' for u in U) == 32, 'Canelones count')
    require(sum(o['office_status'] == 'current' and o['geography_id'].startswith('UY-M-CA-') for o in O) == 64, 'Canelones office roles')
def check_montevideo_8():
    require(sum(u['department_code'] == 'MO' for u in U) == 8 and all(k in OB for k in ['UY-D-MO-I','UY-D-MO-J']), 'Montevideo nesting')
def check_duplicate_names():
    for name in ['LA PAZ', 'QUEBRACHO', 'CERRO CHATO']:
        found = [u for u in U if norm(u['name']) == name]
        require(len(found) == 2 and len({u['department_code'] for u in found}) == 2, 'Conflated duplicate name: ' + name)
def check_alcalde_mode():
    alcalde = [o for o in CUR if o['scope_level'] == 'municipal' and o['office_kind'] == 'direct_executive']
    require(len(alcalde) == 136, 'Alcalde count')
    require(all(o['selection_mode'] == 'popular_list_result_first_titular' and o['separate_executive_ballot'] is False for o in alcalde), 'Invented separate/indirect alcalde ballot')
def check_five_seats():
    require(all(o['elected_seats'] == 5 for o in CUR if o['scope_level'] == 'municipal' and o['office_kind'] == 'council'), 'Municipal council must include alcalde in five seats')
def check_national_modes():
    require(all(OB[k]['selection_mode'] == 'direct_popular' for k in ['UY-N-PRES','UY-N-VP']), 'National selection mode')
    require(OB['UY-N-VP']['separate_executive_ballot'] is False, 'Separate VP ballot')
    require(OB['UY-N-SEN']['elected_seats'] == 30 and OB['UY-N-SEN']['ex_officio_seats'] == 1 and OB['UY-N-REP']['elected_seats'] == 99, 'Current chamber size')
def check_historical_senate():
    for y, total in [(1954,31),(1962,31),(2024,30)]:
        require(sum(r['seats'] or 0 for r in event_results('UY-N-SEN', y)) == total and one_event('UY-N-SEN', y)['elected_seat_total'] == total, 'Senate seat era ' + str(y))
def check_calendar_current():
    require({oid for c in CAL for oid in c['office_ids']} == {o['office_id'] for o in CUR}, 'Calendar does not cover exact current register')
    for o in CUR:
        require(o['next_calendar_ids'] and all(o['office_id'] in CB[cid]['office_ids'] for cid in o['next_calendar_ids']), 'Calendar-office join')
    for doc in ['README.md','Justin-report.md','Uruguay_Upcoming_Elections.md']:
        require('## Upcoming elections' in (P/doc).read_text(), 'Missing prominent upcoming section')
def check_calendar_hist():
    require(all(not o['next_calendar_ids'] for o in HIST), 'Historical office received a future contest')
def check_calendar_formulas():
    require(len(CAL) == 8 and all(c['exact_date'] is None and c['date_basis'] == 'constitutional_statutory_formula' and c['date_formula'] and c['formal_convocatoria_status'].startswith('pending_') for c in CAL), 'Formula/convocatoria confusion')
def check_calendar_alerts():
    require(all(c['must_surface_prominently_on_country_surface'] is True and c['excluded_by_alert_window'] is False for c in CAL), 'Alert-window exclusion')
    require(M['prior_screened_out_filter_rescinded_for_research'] is True and M['production_state_changed'] is False, 'Rescope control')
def check_calendar_years():
    require(collections.Counter(c['next_occurrence_year'] for c in CAL) == {2029:4, 2030:4}, 'Upcoming cycle years')
    require(all(c['next_occurrence_year'] == (2029 if c['scope_level'] == 'national' else 2030) for c in CAL), 'Wrong cycle family')
def check_runoffs():
    actual = [e for e in E if e['office_id'] == 'UY-N-PRES' and e['event_kind'] == 'runoff']
    require({int(e['event_date'][:4]) for e in actual} == {1999,2009,2014,2019,2024}, 'Runoff series')
    for e in actual:
        require(e['round'] == 2 and len(RB[e['event_id']]) == 2, 'Runoff round/tickets')
        require(one_event('UY-N-PRES', int(e['event_date'][:4]))['event_date'] != e['event_date'], 'Collapsed rounds')
def check_no_2004_runoff():
    require(not events('UY-N-PRES', 2004, 'runoff'), 'Invented 2004 runoff')
    require(any(r['elected_flag'] is True and 'Vázquez' in r['contestant_name'] for r in event_results('UY-N-PRES', 2004)), '2004 winner identity missing')
def check_joint_votes():
    require(not any(r['office_id'] == 'UY-N-VP' for r in R), 'Independent VP results')
    for e in events('UY-N-VP'):
        other = EB.get(e.get('shared_ballot_event_id'))
        require(other and other['office_id'] == 'UY-N-PRES' and other['event_date'] == e['event_date'] and other['ballot_group_id'] == e['ballot_group_id'], 'VP joint ballot link')
def check_deferral():
    require(len(D) == 19 and all(d['original_date'] == '2020-05-10' and d['held_date'] == '2020-09-27' and d['result_rows_for_original_date'] == 0 for d in D), 'Postponement hold')
    require(not any(e['event_date'] == '2020-05-10' for e in E), 'Result event on deferred date')
    require(sum(e['event_date'] == '2020-09-27' for e in E) == 288, '2020 held local event count')
def check_municipal_history():
    for year, count in [(2010,89),(2015,112),(2020,125),(2025,136)]:
        for suffix in ['-C','-A']:
            require(sum(e['event_date'].startswith(str(year)) and e['office_id'].startswith('UY-M-') and e['office_id'].endswith(suffix) for e in E) == count, 'Municipal inventory by era')
def check_blank_not_zero():
    found = [r for r in event_results('UY-M-DU-B-C', 2015) if r['contestant_name'] == 'A.P.']
    require(len(found) == 1 and found[0]['votes'] is None, 'Blank AP vote coerced')
    require(all(r['vote_share_percent'] is None and r['share_status'] == 'not_transcribed' for r in R), 'Invented share')
    require(all((r['votes'] is None) == (r['votes_status'] == 'not_transcribed_or_not_applicable') for r in R), 'Vote status/null inconsistency')
def check_explicit_zero():
    require(any(r['votes'] == 0 and r['votes_status'] == 'sourced_or_source_aggregate' for r in R), 'Published vote zeros lost')
    require(any(r['seats'] == 0 and r['seats_status'] == 'sourced' for r in R), 'Published seat zeros lost')
    require(any(r['seats'] is None for r in R) and any(r['votes'] is None for r in R), 'Nulls lost')
    require(all(r[k] is None or (type(r[k]) is int and r[k] >= 0) for r in R for k in ['votes','seats']), 'Invalid nonnegative integer field')
def check_source_links():
    for records, key in [(O,'office_id'),(E,'event_id'),(R,'result_id'),(S,'source_id'),(CAL,'calendar_id')]:
        unique(records, key)
    for sid in all_sources():
        require(sid in SB and SB[sid]['artifact_path'] and SB[sid]['retrieval_status'] != 'original_not_available_notice', 'Missing/unusable evidence: ' + sid)
    require(all(e['office_id'] in OB and e['event_status'] == 'held' for e in E), 'Invalid event-office join/status')
    require(all(r['event_id'] in EB and EB[r['event_id']]['office_id'] == r['office_id'] and r['source_locator'] for r in R), 'Invalid result-event join/locator')
    require(all(not e.get('shared_ballot_event_id') or (e['shared_ballot_event_id'] in EB and EB[e['shared_ballot_event_id']]['event_date'] == e['event_date']) for e in E), 'Invalid shared ballot reference')
def check_raw_hashes():
    for s in S:
        if s['artifact_path']:
            path = (P / s['artifact_path']).resolve()
            require(path.is_relative_to(P) and path.is_file(), 'Unsafe/missing source artifact')
            require(path.stat().st_size == s['bytes'] and digest(path) == s['sha256'], 'Source digest/length mismatch: ' + s['source_id'])
def check_contract_223():
    require(len(CONTRACT) == 20 and sum(map(len, CONTRACT.values())) == 223 and len(FM) == 223, 'Field contract size')
    require([(f['table'],f['column']) for f in FM] == [(t,c) for t, cols in CONTRACT.items() for c in cols], 'Field contract names/order')
    require([f['ordinal'] for f in FM] == list(range(1,224)) and all(f['target_write_permitted'] is False for f in FM), 'Field map ordinal/write guard')
    require(digest(P/'contracts/columns.json') == '8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae', 'Inherited contract bytes changed')
def check_no_writes():
    for key in ['applied_changes','importer_changes','sqlite_changes','vps_changes','ui_changes','repo_changes']:
        require(M[key] == 0, 'Application mutation flag: ' + key)
    require(M['production_state_changed'] is False and all(r.get('applied',False) is False for r in O+E+R+T+CAL+G), 'Applied record')
def check_approvals():
    for obj in recursive([O,E,R,T,CAL,G,A,PRO,M]):
        for key in ['justin_approved','all_justin_approvals']:
            if key in obj:
                require(obj[key] is False, 'Checked approval flag')
    for path in P.rglob('*.md'):
        require(not re.search(r'^\s*-\s*\[[xX]\]', path.read_text(), re.M), 'Checked approval box in ' + path.name)
def check_ep_zero():
    require(C['ep_offices'] == M['ep_offices'] == 0 and all(o['ep_office'] is False for o in O), 'EP office')
def check_mercosur_zero():
    require(C['mercosur_offices'] == C['party_organ_offices'] == 0, 'Excluded office count')
    require(not any(re.search(r'mercosur|parlamento europeo|party organ', o['name_local'], re.I) for o in O), 'Excluded institution')
def check_successors_zero():
    require(all(o['predecessor_id'] is None and o['successor_id'] is None for o in O) and C['successor_edges'] == 0, 'Invented successor edge')
def check_municipal_aliases():
    found = [u for u in U if u['name'] == 'Atlántida']
    require(len(found) == 1 and found[0]['electoral_letter'] == 'Ñ', 'Atlántida letter')
    require(not any(u['department_code'] == 'FD' and 'BENTOS' in norm(u['name']) for u in U), 'Spurious Florida Fray Bentos')
    require(any(u['department_code'] == 'FD' and norm(u['name']) == 'FRAY MARCOS' for u in U), 'Fray Marcos missing')
def check_CNG_gate():
    for y in [1954,1962]:
        one_event('UY-H-CNG', y)
        require(not events('UY-N-PRES', y) and not events('UY-N-VP', y), 'Invented presidential contest in collegiate era')
    require(not RB[one_event('UY-H-CNG',1954)['event_id']], '1954 conflicted CNG votes invented')
def check_canelones_certified():
    require(len(CAN) == 32 and all(c['csv_matches_certified_votes'] is True for c in CAN), 'Canelones certification audit')
    for c in CAN:
        actual = event_results(c['geography_id']+'-C',2025)
        require({norm(r['contestant_name']):r['votes'] for r in actual} == {norm(k):v for k,v in c['votes'].items()}, 'Canelones vote vector')
        require(sum(r['seats'] or 0 for r in actual) == 5, 'Canelones allocation')
def check_national_2024():
    expected = {'UY-N-SEN':{'FRENTE AMPLIO':16,'NACIONAL':9,'COLORADO':5},'UY-N-REP':{'FRENTE AMPLIO':48,'NACIONAL':29,'COLORADO':17,'CABILDO ABIERTO':2,'IDENTIDAD SOBERANA':2,'INDEPENDIENTE':1}}
    for oid, seats in expected.items():
        actual = {norm(r['contestant_name']):r['seats'] for r in event_results(oid,2024) if r['seats']}
        require(actual == seats, '2024 allocation: ' + oid)
def check_runoff_2024():
    actual = event_results('UY-N-PRES',2024,'runoff')
    require(sorted(r['votes'] for r in actual) == [1119537,1212833] and all(r['source_id'] == 'national-e8d3892617' and r['certification_status'] == 'certified_proclamation' for r in actual), '2024 certified runoff')
def check_tie_proceeding():
    require(len(PRO) == 1 and PRO[0]['kind'] == 'tie_break_draw' and PRO[0]['new_election'] is False and PRO[0]['date'] == '2025-05-21', 'Tie draw proceeding')
    require(not any(e['event_date'] == '2025-05-21' for e in E), 'Draw converted to poll')
def check_history_limits():
    require(M['historical_numeric_coverage_complete'] is False and C['fully_transcribed_election_history'] is False and len(G) == 22, 'Historical completeness overclaim')
    require(C['current_register_complete_for_BF_enumerated_scope'] is True, 'Current scope claim')
def check_source_candidates_partial():
    sid = '7b775c22-3a59-490b-b8a0-6a8f8efd33bc'
    require(sid in SB and not any(sid in o['source_ids'] for o in O) and not any(r['source_id'] == sid for r in R), 'Partial candidate input used for full coverage')
    require(any(g['gap_id'] == 'UY-BF-G17' and sid in g['source_ids'] for g in G), 'Partial source hold missing')
def check_alcalde_winners():
    holders = [r for r in R if r['office_id'].endswith('-A')]
    require(collections.Counter(r['certification_status'] for r in holders) == {'official_OPP_post_election_holder_roster_not_Corte_proclamation':125,'certified_proclamation':53}, 'Alcalde identity evidence states')
    require(all(r['votes'] is None for r in holders), 'Personal alcalde votes inferred from list totals')

def check_counts():
    expected = {'current_offices':len(CUR),'historical_only_offices':len(HIST),'office_rows':len(O),'events':len(E),'held_events':len(E),'results':len(R),'draft_tiers':len(T),'source_records':len(S),'retained_original_sources':sum(s['artifact_kind']=='original_response_bytes' and s['artifact_path'] is not None for s in S),'upcoming_calendar_family_rows':len(CAL)}
    for k,v in expected.items():
        require(C[k] == v, 'Count manifest mismatch: ' + k)
    require(len(E) == 1451 and len(R) == 4328, 'Reported event/result count mismatch')
def check_manifest_files():
    entries = {}
    for line in (P/'SHA256SUMS').read_text().splitlines():
        match = re.fullmatch(r'([0-9a-f]{64})  (.+)', line)
        require(match is not None, 'Malformed checksum line')
        value,name = match.groups()
        require(name not in entries, 'Duplicate manifest filename')
        entries[name] = value
    actual = {p.relative_to(P).as_posix() for p in P.rglob('*') if p.is_file() and p.name != 'SHA256SUMS'}
    require(set(entries) == actual, 'Checksum inventory missing or extra files')
    for name,value in entries.items():
        path = (P/name).resolve()
        require(path.is_relative_to(P) and digest(path) == value, 'Pack digest mismatch: ' + name)

checks = []
for example in A:
    key = example['check_id']
    try:
        function = globals().get('check_'+key)
        require(callable(function), 'No implemented acceptance check')
        function()
        checks.append({'check_id':key,'status':'pass','example_id':example['example_id']})
    except Exception as exc:
        checks.append({'check_id':key,'status':'fail','example_id':example['example_id'],'detail':str(exc)})
for key,function in [('count_manifest',check_counts),('SHA256SUMS',check_manifest_files)]:
    try:
        function()
        checks.append({'check_id':key,'status':'pass'})
    except Exception as exc:
        checks.append({'check_id':key,'status':'fail','detail':str(exc)})
ok = len(A) >= 15 and len({a['check_id'] for a in A}) == len(A) and all(c['status']=='pass' for c in checks)
report = {'pack':'Uruguay Prompt BF','validation_status':'pass' if ok else 'fail','checks_passed':sum(c['status']=='pass' for c in checks),'checks_total':len(checks),'acceptance_examples':len(A),'current_offices':len(CUR),'historical_only_offices':len(HIST),'events':len(E),'results':len(R),'sources':len(S),'applied_changes':0,'justin_approved':False,'scope':'Offline consistency, source bytes and pack-file integrity; not exhaustive historical certification or approval.','checks':checks}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(0 if ok else 1)
