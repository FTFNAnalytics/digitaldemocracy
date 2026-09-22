# Spain import

Spain is lineage `country-package-spain`. Justin accepted Prompt AE on 2026-09-21 with named holds: **8,204 current + 4 historical** offices (8,133 municipal / 68 regional / 2 national / 5 other). The 68 regional rows are **17 autonomous-community parliaments + 38 ordinary provincial councils (Diputaciones) + 3 Basque foral assemblies + 10 additional island councils**. Do not report 68 as 68 autonomous communities.

Ceuta and Melilla each stay one autonomous-city assembly (`other`). Formentera stays one combined municipal/island body (`ES-M07024-REP`); `ES-I071-COUNCIL` is not created. Aran stays `other`. Navarra's parliament is not duplicated as a Diputación. Basque Juntas stay distinct from executive Diputaciones. 78 concejo-abierto direct executives stay on the same municipal mandate. 3,762 current municipal modes stay `municipal_elected_mandate_mode_pending`. No ordinary direct mayor, regional president, or prime-minister row is created. All next dates stay unknown. The four historical INE codes stay active with no successor edge. Diputaciones have no inferred constitution events.

The slim land omits `results.json`, `sources/`, `sources.json`, uncompressed `events.json`, and identity vectors. The importer publishes **0 result rows** and **0 source rows**. Those bytes are not invented. The full-pack documentary fingerprint `850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17` includes the omitted files and is not the slim release id. The slim release fingerprint is `1a3b9f84b5819cbf1eeb8afacd3fc00106f4281834fa91c24d9aacfa6aa3adfb`.

`/electiondatabase` redirects and Mexico overrides are unchanged. This runbook does not deploy to the VPS.

## Local / CI

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-spain.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-spain-attempts.sqlite
export ATLAS_OPERATOR=spain-import

ATLAS_IMPORT_SCOPE=spain npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bosnia, Bulgaria, Netherlands, Switzerland, Denmark, Sweden, Finland, Norway, Ireland, Poland, Czechia, Croatia, Portugal, LatAm, and New Zealand as well.

Expected Spain lines:

```
lineage=country-package-spain
spain_offices=8208
spain_current=8204
spain_historical=4
spain_municipal=8133
spain_regional=68
spain_national=2
spain_other=5
spain_diputaciones=38
spain_islands=10
spain_concejo_abierto=78
spain_mode_pending=3762
spain_selected_histories=20401
spain_prospective_events=0
spain_result_rows=0
spain_proceedings=0
spain_sources=0
spain_unresolved=12
spain_approved=4311
spain_needs_review=3897
```

A second run with unchanged `data/research/spain/` plus approved `schemas/atlas/tiers/spain.json` reuses the same release and writes a new attempt UUID.

Named holds stay open: ES-G01, ES-G02, ES-G03, ES-G04, ES-G05, ES-G06, ES-G07, ES-G08, ES-G09, ES-G10, ES-G11, and ES-G12.
