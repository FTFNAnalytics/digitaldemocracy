# Poland import

Poland is lineage `country-package-poland`. Justin accepted Prompt AC on 2026-09-20 with named holds: **5,310 current + 2 historical** offices (4,960 municipal / 330 regional / 3 national / 19 other). The 330 regional rows are **16 voivodeship sejmiks + 314 powiat councils**. PL-POWIAT-TIER stays open: the importer does not reclassify powiat rows and does not report 330 as 330 voivodeships.

Historic Ostrowice (`PL-320304-C`, `PL-320304-X`) stays active and historical. No successor edge is invented. No appointed voivode or popular PM/cabinet rows are created.

The slim land omits `results.jsonl.gz`, `result-identity-vectors.jsonl.gz`, and `data/research/poland/sources/`. The importer publishes **0 result rows**. Those bytes are not invented. The full-pack documentary fingerprint `186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944` includes the omitted files and is not the slim release id. The slim release fingerprint is `50d80c24c2f557d2fdc5fd5efc835a96b41f9adf353a3924f481389b5c9cc5a3`.

`/electiondatabase` redirects and Mexico overrides are unchanged. This runbook does not deploy to the VPS.

## Local / CI

```bash
export ATLAS_SQLITE_PATH=/tmp/atlas-poland.sqlite
export ATLAS_ATTEMPTS_SQLITE_PATH=/tmp/atlas-poland-attempts.sqlite
export ATLAS_OPERATOR=poland-import

ATLAS_IMPORT_SCOPE=poland npm run import:atlas
```

Do **not** run `ATLAS_IMPORT_SCOPE=all` unless you intend a full re-import of Albania, Andorra, Alderney, Armenia, Austria, Belgium, Bosnia, Bulgaria, Netherlands, Switzerland, Denmark, LatAm, and New Zealand as well.

Expected Poland lines:

```
lineage=country-package-poland
poland_offices=5312
poland_current=5310
poland_historical=2
poland_municipal=4960
poland_regional=330
poland_national=3
poland_other=19
poland_powiat=314
poland_sejmiks=16
poland_selected_histories=15914
poland_prospective_events=56
poland_result_rows=0
poland_proceedings=9773
poland_sources=3181
poland_unresolved=12
poland_approved=4979
poland_needs_review=333
```

A second run with unchanged `data/research/poland/` plus approved `schemas/atlas/tiers/poland.json` reuses the same release and writes a new attempt UUID.

Named holds stay open: PL-HISTORIC-TERRITORIES, PL-1990-1999-REFORMS, PL-CYCLE-LEGAL-STATUS, PL-2019-SHARE-UNIT, PL-SPECIAL-RETURN-DETAIL, PL-WARSAW-AUXILIARY, PL-POWIAT-TIER, PL-EP-SCOPE, PL-TITLE-AND-BOUNDARY-CHANGES, PL-OLDER-NATIONAL-HISTORY, PL-MARGINS-AND-PARTIES, and PL-NEXT-DATES.
