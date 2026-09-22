#!/usr/bin/env python3
import gzip,json,hashlib,re,sys
from pathlib import Path
r=Path(__file__).resolve().parents[1]
o=json.loads((r/'data/research/romania/office-register.json').read_text())
g=json.loads((r/'data/research/romania/geographies.json').read_text())
z=json.load(gzip.open(r/'data/research/romania/events.json.gz','rt',encoding='utf-8'))
x=json.loads((r/'data/research/romania/results.json').read_text())
t=json.loads((r/'schemas/atlas/tiers/romania.json').read_text())
assert len(o)==6460 and len({a['office_id'] for a in o})==6460
assert len(z)==19343 and len({a['event_id'] for a in z})==19343
assert len(x)==23 and all(a['event_id'] in {e['event_id'] for e in z} for a in x)
assert len(t['classifications'])==6460 and {a['office_id'] for a in t['classifications']}=={a['office_id'] for a in o}
assert t['status']=='draft_for_human_review' and not t['production_accepted']
assert sum(a['direct_election'] for a in o)==3229
assert not [e for e in z if e['office_id'].endswith('-P') and e['election_date'].startswith('2016')]
cm=json.loads((r/'docs/phase1/romania/column-map.json').read_text())
cols=sum(len(v) for v in cm.values())
assert len(cm)==20 and cols==223,(len(cm),cols)
assert '`applied_changes=0`' in (r/'README.md').read_text()
assert '[x]' not in (r/'docs/phase1/romania/JUSTIN_REPORT.md').read_text().lower()
print(json.dumps({'status':'PASS','offices':len(o),'events':len(z),'results':len(x),'columns':cols,'applied_changes':0}))
