# Justin acceptance — Poland Prompt AC

**Date:** 2026-09-20 (America/Edmonton)  
**Decision:** Accept with named holds  
**Scope:** 5,310 current + 2 historical offices (5,312 total); 16,767 events; 641,493 results (results live in review extract; omitted from this land slim)

## Accepted
- Full current office register + qualified historic contests
- Sejm, Senat, President of the Republic, Poland EP delegation
- 16 voivodeship sejmiks + 314 powiat councils (drafted `regional`; **PL-POWIAT-TIER** left open — do not reclassify)
- 2,479 current municipal councils + 2,479 current direct municipal executives (wójt / burmistrz / prezydent miasta)
- Historic Ostrowice retained without invented successor edges
- Draft tiers: 4,960 municipal / 330 regional / 3 national / 19 other
- Standing Atlas policy (full register even outside ~18-month alert window)
- No appointed voivode or popular PM/cabinet rows

## Named holds (open, not blockers)
1. PL-HISTORIC-TERRITORIES
2. PL-1990-1999-REFORMS
3. PL-CYCLE-LEGAL-STATUS
4. PL-2019-SHARE-UNIT
5. PL-SPECIAL-RETURN-DETAIL
6. PL-WARSAW-AUXILIARY
7. PL-POWIAT-TIER
8. PL-EP-SCOPE
9. PL-TITLE-AND-BOUNDARY-CHANGES
10. PL-OLDER-NATIONAL-HISTORY
11. PL-MARGINS-AND-PARTIES
12. PL-NEXT-DATES

## Land slim omissions
- `data/research/poland/sources/` raw capture
- `results.jsonl.gz` (~60.9 MB) and `result-identity-vectors.jsonl.gz` (~71.05 MB) — retained in review extract; not invented here
- Full review ZIP SHA-256: `c213e86b9e720abca476e57c7fea13ec162442fa3a298fb29d3c33e12ba871dc`

## Out of scope this land
- Poland `import:atlas` importer (follow-up PR)
- `/electiondatabase` redirects
- Mexico / other countries
