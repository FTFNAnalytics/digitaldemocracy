#!/usr/bin/env python3
"""Offline integrity and research semantics validator. Never applies Atlas changes."""
import argparse, collections, copy, hashlib, json, pathlib, re, tempfile
ROOT = pathlib.Path(__file__).resolve().parent

def require(ok, message):
    if not ok: raise ValueError(message)
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def read(name): return json.loads((ROOT / name).read_text())
def approval_check(value):
    if isinstance(value, dict):
        for k, v in value.items():
            if k == 'applied_changes': require(v == 0, 'Nonzero applied_changes')
            if k == 'justin_approved': require(v is False, 'Justin approval is checked')
            approval_check(v)
    elif isinstance(value, list):
        for v in value: approval_check(v)
def reference_check(rows, targets, field):
    for row in rows: require(row[field] in targets, 'Broken reference: ' + field)
def file_hash_check(path, expected): require(sha(path) == expected, 'Hash mismatch: ' + str(path))
def validate():
    data = {p.stem: json.loads(p.read_text()) for p in (ROOT/'data').glob('*.json')}
    for value in data.values(): approval_check(value)
    approval_check(read('metadata.json'))
    for p in (ROOT/'docs').rglob('*.md'):
        require(not re.search(r'\[[xX]\]', p.read_text()), 'Checked approval box: '+str(p))
    indexes={}
    for name,key in [('office-register','office_id'),('events','event_id'),('results','result_id'),('reporting-units','unit_id'),('source-inventory','source_id')]:
        indexes[name]={r[key]:r for r in data[name]}
        require(len(indexes[name])==len(data[name]), 'Duplicate IDs: '+name)
    offices,events,results,units,sources=[indexes[n] for n in ['office-register','events','results','reporting-units','source-inventory']]
    reference_check(data['events'],offices,'office_id')
    reference_check(data['results'],events,'event_id')
    reference_check(data['reporting-units'],events,'event_id')
    reference_check(data['stv-counts'],results,'result_id')
    reference_check(data['stv-counts'],units,'unit_id')
    for name,rows in data.items():
        if not isinstance(rows,list): continue
        for row in rows:
            if not isinstance(row,dict): continue
            for field in ['source_id','elected_source_id']:
                if row.get(field): require(row[field] in sources,'Unknown source: '+name)
            for sid in row.get('source_ids',[]): require(sid in sources,'Unknown source: '+name)
    tiers=data['draft-tiers']
    require(collections.Counter(t['office_id'] for t in tiers)==collections.Counter(offices.keys()),'Tiers are not 1:1')
    require(all(t['status']=='draft' and t['tier']==offices[t['office_id']]['tier'] for t in tiers),'Tier status mismatch')
    contract=read('contract/columns.json')
    pairs=[(t,c) for t,cols in contract.items() for c in cols]
    mapped=[(r['table'],r['column']) for r in data['field-map-223']]
    require(len(pairs)==223 and len(set(pairs))==223 and collections.Counter(pairs)==collections.Counter(mapped),'223-column contract mismatch')
    current=[o for o in offices.values() if o['status']=='current']
    locals_=[o for o in current if o['office_type']=='local_council']
    require(len(current)==213 and len(offices)-len(current)==2,'Office scope mismatch')
    require(collections.Counter(o['island'] for o in locals_)=={'Malta':54,'Gozo':14},'Local territorial coverage')
    types=collections.Counter(o['office_type'] for o in current)
    require(types['mayor']==68 and types['deputy_mayor']==68 and types['regional_president']==6,'Executive coverage')
    require(all(o['standalone_popular_executive_ballot'] is False for o in offices.values()),'Invented direct executive ballot')
    require(offices['MT-PRESIDENT']['popular_vote_universe'] is None,'Invented popular presidential universe')
    local_events=[e for e in events.values() if e['office_id'] in {o['office_id'] for o in locals_}]
    require(collections.Counter(e['date'][:4] for e in local_events)=={'2024':68,'2019':68,'2015':34,'2013':34},'Local cycle coverage')
    require(all(sum(e['office_id']==o['office_id'] for e in local_events)==3 for o in locals_),'Local historic coverage')
    require(len(units)==287,'Reporting unit coverage')
    grouped=collections.defaultdict(list)
    for r in results.values():
        if r.get('unit_id'): require(r['unit_id'] in units,'Unknown result unit'); grouped[r['unit_id']].append(r)
    ntv=collections.defaultdict(int)
    for r in data['count-totals']:
        if r['count']==1 and r['kind']=='Non-Transferrable Votes':
            require(r['value'] is not None,'Missing count-one non-transferable total')
            ntv[r['unit_id']]+=r['value']
    for uid,u in units.items():
        rr=grouped[uid]
        require(sum(r['elected'] for r in rr)==u['seats']==u['elected_candidates'],'Original seat count: '+uid)
        if u['uncontested']:
            require(all(r['votes'] is None and r['votes_status']=='not_applicable_no_poll' for r in rr),'No-poll votes invented')
        else:
            require(all(r['votes'] is not None for r in rr),'Missing first preference')
            require(sum(r['votes'] for r in rr)+ntv[uid]==u['valid_votes'],'First-count reconciliation: '+uid)
            src=json.loads((ROOT/sources[u['source_id']]['path']).read_text())
            countsel=next(s for s in src['selects'] if s['id']=='countSelection')
            prefix=sources[u['source_id']]['path'].rsplit('count-',1)[0]
            for option in countsel['options']:
                require(prefix+'count-'+option['value']+'.json' in {s['path'] for s in sources.values()},'Missing count panel')
    observations=data['stv-counts'];keys=[(r['result_id'],r['count']) for r in observations]
    require(len(set(keys))==len(keys),'Duplicate STV count observation')
    for r in observations:
        if r['tally'] is None: require(r['tally_status']=='not_numeric_in_source','Null tally status')
        if r['count']==1: require(r['tally']==results[r['result_id']]['votes'],'Count-one result discrepancy')
    require(not data['extraction-issues'],'Unresolved extraction issues')
    require(not data['successor-crosswalk'],'Unexpected successor edges')
    counts=data['counts']
    for field,value in [('current_offices',len(current)),('historical_offices',len(offices)-len(current)),('events',len(events)),('results',len(results)),('stv_count_observations',len(observations)),('source_inventory_entries',len(sources)),('distinct_source_files',len({s['path'] for s in sources.values()}))]:
        require(counts[field]==value,'Published count mismatch: '+field)
    require(counts['all_draft_tier_histogram']==dict(collections.Counter(t['tier'] for t in tiers)),'Tier histogram')
    for s in sources.values():
        p=ROOT/s['path']; file_hash_check(p,s['sha256']); require(p.stat().st_size==s['bytes'],'Source byte size')
    manifest={}
    for line in (ROOT/'SHA256SUMS').read_text().splitlines():
        digest,name=line.split('  ',1); require(name not in manifest,'Duplicate manifest member');manifest[name]=digest
    members={str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.name not in {'SHA256SUMS','validation-report.json'}}
    require(set(manifest)==members,'Manifest membership differs')
    for name,digest in manifest.items(): file_hash_check(ROOT/name,digest)
    return {'status':'PASS','checks':['source and manifest hashes','unique IDs and foreign keys','223-column inherited contract','office/tier 1:1','territorial and cycle coverage','all 287 original seat totals','first-count valid-vote reconciliation','count-panel completeness','null/no-poll semantics','unchecked approvals and applied_changes=0'], 'counts':counts}
def self_test():
    checks=[lambda: reference_check([{'event_id':'missing'}],{'real':{}},'event_id'), lambda:approval_check({'justin_approved':True})]
    with tempfile.TemporaryDirectory() as d:
        p=pathlib.Path(d)/'source';p.write_bytes(b'original');expected=sha(p);p.write_bytes(b'corrupted')
        checks.append(lambda:file_hash_check(p,expected))
        for check in checks:
            try: check()
            except ValueError: pass
            else: raise ValueError('Negative test failed to reject corruption')
    return ['broken event reference rejected','checked approval rejected','corrupt source rejected']
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--self-test',action='store_true');args=parser.parse_args()
    try:
        report=validate()
        if args.self_test: report['negative_tests']=self_test()
    except Exception as exc: report={'status':'FAIL','error':str(exc)}
    (ROOT/'validation-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    raise SystemExit(0 if report['status']=='PASS' else 1)
