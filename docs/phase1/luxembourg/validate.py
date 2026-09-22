#!/usr/bin/env python3
"""Read-only offline research-pack validator. No imports, SQL or external writes."""
import json,hashlib,pathlib,collections,re,sys,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent

def validate(root=ROOT,check_hashes=True):
 def j(p):return json.loads((root/p).read_text())
 if check_hashes:
  manifest={}
  for line in (root/'SHA256SUMS').read_text().splitlines():
   digest,path=line.split('  ',1);assert path not in manifest,'duplicate manifest path';assert not pathlib.PurePosixPath(path).is_absolute() and '..' not in pathlib.PurePosixPath(path).parts
   manifest[path]=digest;assert hashlib.sha256((root/path).read_bytes()).hexdigest()==digest,'hash mismatch: '+path
  actual={p.relative_to(root).as_posix() for p in root.rglob('*') if p.is_file() and p.name!='SHA256SUMS' and '__pycache__' not in p.parts}
  assert actual==set(manifest),'manifest/file-set mismatch'
 offices=j('data/office-register.json');tiers=j('data/draft-tiers.json');events=j('data/events.json');results=j('data/results.json');sources=j('data/source-inventory.json');counts=j('data/counts.json');meta=j('metadata.json')
 def unique(rows,k):
  d={r[k]:r for r in rows};assert len(d)==len(rows),'duplicate '+k;return d
 O=unique(offices,'office_id');T=unique(tiers,'office_id');E=unique(events,'event_id');R=unique(results,'result_id');S=unique(sources,'url')
 assert O.keys()==T.keys(),'office/tier mismatch';assert len(O)==130
 assert sum(o['status']=='current' for o in offices)==102;assert sum(o['status']=='historical' for o in offices)==28
 assert sum(o['status']=='current' and o['office_type']=='communal_council' for o in offices)==100
 assert all(not o['direct_executive'] for o in offices);assert not any(t['tier']=='regional' for t in tiers)
 assert all(t['justin_approved'] is False and t['review_status']=='needs_review' for t in tiers)
 assert meta['applied_changes']==0 and meta['justin_approved'] is False
 for p in [root/'README.md',*list((root/'docs').rglob('*.md'))]:assert not re.search(r'\[[xX]\]',p.read_text()),'checked approval box'
 for e in events:
  assert e['office_id'] in O;assert all(u in S for u in e['source_urls']);assert e['date_precision'] in ['day','year']
  assert len(e['date'])==(10 if e['date_precision']=='day' else 4)
 for r in results:
  assert r['event_id'] in E,'unknown event FK';assert r['source_url'] in S,'unknown source FK'
  assert r['result_id']=='LUR-'+hashlib.sha256((r['source_url']+'|'+r['source_locator']+'|'+r['event_id']).encode()).hexdigest()[:24]
  for col in ['votes','seats','vote_share_pct']:assert r[col] is None or isinstance(r[col],(int,float)) and r[col]>=0
  if r['vote_share_pct'] is not None:assert r['vote_share_pct']<=100
  if r['votes_status']=='not_applicable_uncontested':assert r['votes'] is None and r['reported_votes']==0 and r['elected'] in ['ELU','oui']
  if r['aggregation_scope']=='commune_reporting_unit' and r['result_kind']=='candidate':assert r['elected'] is None
 for y,n in [('2005',116),('2011',106),('2017',102),('2023',100)]:
  es={e['event_id'] for e in events if e['office_id'].startswith('LU-C-') and e['date'].startswith(y)}
  assert len(es)==n;assert es<={r['event_id'] for r in results},'empty council event'
 assert 'LU-C-berdorf@2023-06-11' not in E
 br=[r for r in results if r['event_id']=='LU-C-berdorf@2023-10-08'];assert len(br)==15 and sum(r['elected']=='ELU' for r in br)==9
 for edge in j('data/merger-crosswalk.json'):
  assert edge['predecessor_office_id'] in O and edge['successor_office_id'] in O
  assert O[edge['predecessor_office_id']]['status']=='historical' and O[edge['successor_office_id']]['status']=='current'
 assert len(j('data/merger-crosswalk.json'))==28
 geo_url='https://features.geoportail.lu/collections/302/items?f=json&limit=1000';geo=j(S[geo_url]['path']);assert geo['numberMatched']==100 and geo['numberReturned']==100
 assert {f['properties']['commune_administrative'] for f in geo['features']}=={o['commune'] for o in offices if o['status']=='current' and o['office_type']=='communal_council'}
 fm=j('data/field-map-223.json');contract=j('contract/columns.json');assert len(contract)==20 and len(fm)==223
 assert {(x['table'],x['column']) for x in fm}=={(t,c) for t,cs in contract.items() for c in cs}
 for s in sources:
  b=(root/s['path']).read_bytes();assert len(b)==s['bytes'] and hashlib.sha256(b).hexdigest()==s['sha256']
 assert counts['events']==len(events) and counts['result_rows']==len(results) and counts['source_artifacts']==len(sources)
 assert counts['numeric_vote_rows']==sum(r['votes'] is not None for r in results)
 # Source-file candidate counts and list total decomposition, selected modern communal XML.
 checked_candidates=0;checked_lists=0;checked_votes=0
 for s in sources:
  if not ('COM_2017' in s['url'] or 'com-2023-06-12' in s['url']):continue
  rootxml=ET.fromstring((root/s['path']).read_bytes())
  for entity in rootxml.iter('entite'):
   if entity.get('type') not in ['COMMUNE','SECTION']:continue
   candidates=entity.findall('resultats/candidats/candidat')+entity.findall('resultats/listes/liste/candidats/candidat')
   stats=entity.find('statistiques/candidats')
   if candidates and stats is not None:
    assert len(candidates)==int(stats.get('total')),'candidate count mismatch';checked_candidates+=1
   rr=entity.find('resultats');ls=entity.findall('resultats/listes/liste')
   if rr is not None and rr.get('suffragesExprimes') is not None and ls:
    assert sum(int(l.get('suffragesTotal')) for l in ls)==int(rr.get('suffragesExprimes')),'list total mismatch';checked_votes+=1
   elif rr is not None and rr.get('suffragesExprimes') is not None and candidates:
    assert sum(int(c.get('suffrages')) for c in candidates)==int(rr.get('suffragesExprimes')),'candidate total mismatch';checked_votes+=1
   for l in ls:
    assert int(l.get('suffragesListe'))+int(l.get('suffragesNominatifs'))==int(l.get('suffragesTotal'));checked_lists+=1
 return {'status':'PASS','offices':len(O),'current':102,'historical':28,'events':len(E),'results':len(R),'mapped_columns':len(fm),'candidate_groups_checked':checked_candidates,'list_decompositions_checked':checked_lists,'vote_totals_checked':checked_votes,'applied_changes':0,'research_coverage_complete':False}

if __name__=='__main__':
 print(json.dumps(validate(check_hashes='--semantic-only' not in sys.argv),indent=2))
