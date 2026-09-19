"""Verify all payload bytes and record coverage, optionally unpack to a NEW directory.
Usage: python validate.py [destination]
No dependencies outside the Python standard library.
"""
import gzip, hashlib, io, json, sys, tarfile
from collections import Counter
from pathlib import Path, PurePosixPath
ROOT=Path(__file__).resolve().parent

def checked(raw, metadata):
    assert len(raw)==metadata['bytes']
    assert hashlib.sha256(raw).hexdigest()==metadata['sha256']
    return raw

def main():
    m=json.loads((ROOT/'manifest.json').read_text())
    coverage=json.loads((ROOT/'coverage.json').read_text())
    raw=b''.join(checked((ROOT/n).read_bytes(),d) for n,d in m['chunks'].items())
    assert hashlib.sha256(raw).hexdigest()==m['payload_sha256']
    files={}
    with tarfile.open(fileobj=io.BytesIO(gzip.decompress(raw)),mode='r:') as t:
        for member in t:
            name=member.name
            assert member.isfile() and not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts
            assert name not in files
            files[name]=t.extractfile(member).read()
    inventory=json.loads(checked(files['inventory.json'],m['inventory']))
    assert set(files)==set(inventory['contents'])|{'inventory.json'}
    for name,metadata in inventory['contents'].items(): checked(files[name],metadata)
    def rows(name):
        t=json.loads(files[name]);return [dict(zip(t['columns'],r)) for r in t['rows']]
    offices=rows('tables/master/office-register.json') if int(coverage['records']) else []
    histories=json.loads(files['history-index.json'])
    ids={r['Office ID'] for r in offices}
    assert len(ids)==len(offices)==int(coverage['records'])==m['summary']['office_records']
    assert len(histories)==int(coverage['history_entries'])==m['summary']['history_entries']
    assert all(r['Country']==m['country'] and r['Office ID'] in ids for r in histories)
    assert Counter(r['Office ID'] for r in histories)==Counter({r['Office ID']:r['History entries'] for r in offices if r['History entries']})
    assert {Path(n).stem for n in files if n.startswith('Office_Briefings/Offices/')}==ids
    for name,metadata in inventory['source_entries'].items():
        relative=name.removeprefix('Europe_Excluding_Russia/')
        target=relative if relative.startswith('Office_Briefings/') else 'workbooks/'+relative
        if target in files: checked(files[target],metadata)
    for name in files:
        if name.startswith('tables/'):
            t=json.loads(files[name]); assert len(t['rows'])==len(t['source_rows'])
            assert all(len(r)==len(t['columns']) for r in t['rows'])
    if len(sys.argv)>1:
        dest=Path(sys.argv[1]); dest.mkdir(parents=True,exist_ok=False)
        for name,raw in files.items():
            p=dest/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
    print(f"PASS: {m['country']}: {len(offices)} offices, {len(histories)} history entries, {len(files)} verified payload files")
if __name__=='__main__': main()
