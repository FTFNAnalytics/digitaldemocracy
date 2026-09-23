import json, pathlib, hashlib, sys, collections
R=pathlib.Path(__file__).resolve().parent
J=lambda p: json.loads((R/p).read_text(encoding='utf-8'))
o=J('data/office-register.json'); e=J('data/events.json'); r=J('data/results.json'); t=J('data/draft-tiers.json'); c=J('contract/columns.json'); x=J('data/identity-crosswalk.json'); h=J('human-review.json')
assert len(c)==20 and sum(map(len,c.values()))==223
assert len(o)==87 and sum(z['status']=='current' for z in o)==63 and sum(z['status']=='historical_only' for z in o)==24
assert sum(z['status']=='current' and z['office_type']=='municipal_council' for z in o)==61
assert sum(z.get('direct_executive',False) and z['office_type']=='municipal_council' for z in o)==0
assert sum(z.get('direct_executive',False) and z['status']=='current' for z in o)==1
assert not any('European Parliament' in z['name'] or z.get('office_type')=='european_parliament' for z in o)
assert len(t)==len(o) and {z['office_id'] for z in t}=={z['office_id'] for z in o} and all(z['justin_approved'] is False for z in t)
exp={2014:74,2018:72,2022:64,2026:61}
for y,n in exp.items():
 es=[z for z in e if z['event_kind']=='municipal_council_election' and z.get('cycle_year')==y]
 assert len(es)==n,(y,len(es)); ids={z['event_id'] for z in es}; assert all(any(q['event_id']==i for q in r) for i in ids)
assert len(e)==277, len(e)
expected_modes={2014:{'unrestricted_personal_vote':18,'proportional_list_election':53,'unopposed_single_list_no_poll':3},2018:{'unrestricted_personal_vote':16,'proportional_list_election':55,'unopposed_single_list_no_poll':1},2022:{'unrestricted_personal_vote':13,'proportional_list_election':49,'unopposed_single_list_no_poll':2},2026:{'restricted_proportional_list':50,'unrestricted_write_in':7,'one_list_self_elected_no_poll':4}}
for y,exp_modes in expected_modes.items():
 got=collections.Counter(z['electoral_system'] for z in e if z['event_kind']=='municipal_council_election' and z.get('cycle_year')==y)
 assert dict(got)==exp_modes,(y,got)
assert h['applied_changes']==0 and not any(h['approvals'].values())
# all crosswalk source-supported
assert len(x)==24 and all(z.get('source_ids') and z.get('reason') for z in x)
# checksums excluding manifest and generated validation report
sums=(R/'SHA256SUMS').read_text().splitlines()
for line in sums:
 sha,rel=line.split('  ',1); p=R/rel; assert p.exists(),rel; assert hashlib.sha256(p.read_bytes()).hexdigest()==sha,rel
print(json.dumps({'status':'PASS','offices':len(o),'events':len(e),'results':len(r),'tables':len(c),'columns':sum(map(len,c.values())),'cycle_counts':exp,'ep_offices':0,'direct_municipal_executives':0,'applied_changes':0},indent=2))
