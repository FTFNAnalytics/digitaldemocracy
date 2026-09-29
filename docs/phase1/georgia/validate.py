#!/usr/bin/env python3
"""Offline read-only validator for the Georgia BG slim land payload."""
import collections, hashlib, json, pathlib, sys
P = pathlib.Path(__file__).resolve().parent
ROOT = P.parents[2]
CHECKS = []
def check(name, ok, note): CHECKS.append({'check': name, 'status': 'pass' if ok else 'fail', 'note': note})
def load_json(rel): return json.loads((P/rel).read_text(encoding='utf-8'))
def load_jsonl(rel): return [json.loads(x) for x in (P/rel).read_text(encoding='utf-8').splitlines() if x.strip()]
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
try:
    O = load_jsonl('data/office-register.jsonl'); T = load_jsonl('data/draft-tiers.jsonl'); TS = json.loads((ROOT/'schemas/atlas/tiers/georgia.json').read_text(encoding='utf-8')); C = load_jsonl('data/upcoming-calendar.jsonl')
    G = load_jsonl('data/research-gaps.jsonl'); M = load_json('metadata.json'); N = load_json('counts.json'); A = load_json('acceptance-examples.json')
    OB = {o['office_id']: o for o in O}; TB = {t['office_id']: t for t in TS}
    check('country_scope', len(O)==176 and all(o['country_id']=='georgia' and o['country_code']=='GE' for o in O), 'Georgia GE only; not US-GA.')
    check('office_counts', collections.Counter(o['status'] for o in O)=={'current':130,'current_scope_hold':5,'historical_only':41}, '130 ordinary + 5 statutory holds + 41 historical = 176.')
    check('tiers', len(T)==176 and len(TS)==176 and set(TB)==set(OB) and all(set(t)=={'office_id','draft_tier','tier','status','justin_approved','basis','applied'} for t in TS) and all(t['tier']==t['draft_tier'] and t['justin_approved'] is False and t['applied'] is False for t in TS) and dict(collections.Counter(t['draft_tier'] for t in TS))=={'national':3,'regional':5,'local':168}, 'Exactly 176 unapproved tier rows with requested fields.')
    check('calendar', len(C)==7 and all(c.get('country_surface_prominent') is True for c in C) and all(c.get('next_exact_date') is None for c in C), 'Seven prominent calendar rows; exact future dates remain null.')
    check('calendar_docs', all('Upcoming elections' in (P/f).read_text(encoding='utf-8') for f in ['README.md','Justin_Report.md','Georgia_Upcoming_Elections.md']), 'Upcoming calendar is first-class in required documents.')
    check('holds', len(G)==21 and {g['hold_id'] for g in G}=={f'GE-BG-G{i:02d}' for i in range(1,22)} and all(g['justin_approved'] is False for g in G), 'GE-BG-G01 through GE-BG-G21 remain open and unapproved.')
    check('contract', sum(len(v) for v in load_json('contracts/columns.json').values())==223 and len(load_json('field-map-223.json'))==223, 'Inherited documentary contract has 223 fields.')
    check('metadata_counts', M['counts']['office_rows']==176 and M['counts']['draft_tiers']==176 and N['office_rows']==176 and N['events']==710 and N['results']==4543, 'Counts match source research accounting.')
    slim_names = {p.name.lower() for p in ROOT.rglob('*') if p.is_file()}
    forbidden = {'events.jsonl','results.jsonl','sources'}
    check('omissions', not any(p.name.lower() in forbidden or 'sources' in [x.lower() for x in p.parts] for p in ROOT.rglob('*')), 'No events.jsonl, results.jsonl, or sources/ in slim payload.')
    check('no_heavy_evidence', not any(p.name in {'Georgia_Review.xlsx','Source_Inventory.md'} or 'audit' in p.parts or 'tables' in p.parts for p in ROOT.rglob('*')), 'Heavy evidence, audit extracts, and tables omitted.')
    check('acceptance', all(a.get('justin_approved') is False for a in A), 'Acceptance examples remain unapproved.')
    check('no_production_writes', M['applied_changes']==0 and M['production_state_changed'] is False, 'Documentation-only; no production state changed.')
    sums = {}
    for line in (P/'SHA256SUMS').read_text(encoding='utf-8').splitlines():
        digest, name = line.split('  ', 1); sums[name] = digest
    actual = {p.relative_to(P).as_posix() for p in P.rglob('*') if p.is_file() and p.name != 'SHA256SUMS'}
    check('integrity', set(sums)==actual and all(sha(P/n)==d for n,d in sums.items()), 'Every docs file except SHA256SUMS has a verified checksum.')
except Exception as ex:
    check('validator_execution', False, type(ex).__name__ + ': ' + str(ex))
result = {'validation_status': 'pass' if all(c['status']=='pass' for c in CHECKS) else 'fail', 'validator_mode': 'offline_read_only', 'applied_changes': 0, 'checks_passed': sum(c['status']=='pass' for c in CHECKS), 'checks_total': len(CHECKS), 'checks': CHECKS}
print(json.dumps(result, ensure_ascii=False, indent=2))
sys.exit(0 if result['validation_status']=='pass' else 1)
