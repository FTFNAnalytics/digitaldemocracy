# Country package adapter — format mapping

Standalone research folders under `data/countries/*` are **not** the Latin America zip. The observatory used to ignore them, so `/electiondatabase/countries/<slug>` 404ed even when README, manifest, tables and briefings were on disk.

This adapter inventories those folders, validates their own manifests, and maps them into schema v1 (`schemas/v1/normalized.ts`) at load time. It does **not** rewrite `data/research` and does **not** treat Latin America completeness as if it applied to Europe or Oceania.

## Commands

```bash
npm run import:countries
npm run import:data -- --countries
npm run validate:data
```

`import:countries` inventories `data/countries/*/`, runs each package adapter, and writes `data/releases/country-packages-report.json` (gitignored). `validate:data` still checks the Latin America release, then each country package, then the merged observatory dataset.

The frozen extracts keep `site_ingestion_status: pending_adapter` so their bytes stay stable. The website adapter consumes them without claiming the underlying research is complete.

## Package kinds

| Kind | Folders | Input | Adapter |
| --- | --- | --- | --- |
| `europe-country-extract/1` | Albania, Alderney, Andorra | `manifest.json` + `tables/*.json` + `briefings/*.html` | `lib/observatory/adapters/europe.ts` |
| `armenia-packed-europe/1` | Armenia | split `payload/data.tar.gz.part*` | unpack, then master office register + companion histories/returns |
| *(none yet)* | Austria | split `payload/data.tar.xz.part*` | **Present on disk** (PR #11). Observatory adapter and Atlas importer are **not** in this change; the folder is skipped until those land. |
| *(none yet)* | Bosnia and Herzegovina | split `payload/data.tar.gz.part*` | **Present on disk** (PR #15). Same gzip packing as Armenia, but no observatory adapter or Atlas importer in this change; the folder is skipped so the Armenia loader cannot mis-ingest it. |
| `nz-research-batch/1` | New Zealand | `dataset.json` | `lib/observatory/adapters/new-zealand.ts` |

Unknown folders are listed as skipped. The loader will not invent a country from a bare directory.

## Field mapping

### Europe workbook extracts

Tables use one `columns` array and a parallel `rows` array. Numbered files (`history-index-001.json`, `detailed-returns-021.json`, …) are concatenated in filename order for the same sheet.

| Source | Normalized target | Notes |
| --- | --- | --- |
| Folder name / `manifest.country` | `countries[].id` via slug | `albania`, `andorra`, `alderney` |
| `manifest.region` | `countries[].regionId` | Europe → `europe`. Russia remains excluded. |
| `coverage.json` / country notes | `countries[].notes`, `issues[]` | Remaining gaps stay visible. Coverage is **partial**. |
| Office register `Office ID` | `offices[].id` | Preserved (`AL-01-M`, `AD-M-05`, `GG-ALD-STATES`). |
| Jurisdiction + office | names, geography | Diacritics kept (`Tiranë`, `Sant Julià de Lòria`, `Kuçovë`). |
| Next polling date | `offices[].nextElection` + upcoming event | Missing dates stay missing. Alderney proposal dates are **conditional**. |
| History index row | selected `events[]` | Key is `officeId::year::ballotDate`. Year-only rows keep year precision (no invented day). |
| Detailed returns | `resultRows[]` | Null stays unknown; numeric zero stays zero. Shares are 0–100 as recorded. |
| Competition score | `metrics[]` competition_index | Cleared only when all three gaps are numeric and the weighted-gap formula matches. Incomplete series are withheld. |
| Mean Pedersen | withheld unless a number is supplied | Grouped vectors are not invented. |
| Governing control | `officeholders[]` | Dated observation; `impliesCurrentTenure` is always false. |
| Polling evidence | `polls[]` | National context; `supportsLocalConclusion` is false. Response vectors are not parsed out of prose. |
| `briefings/*.html` | sanitized original briefing | Scripts stripped; relative office filenames rewritten to `/electiondatabase/offices/<id>`. |

Alderney is a **territory** (`GG-ALD` is not treated as a separate ISO sovereign code). Albania and Andorra are sovereign countries.

### Armenia packed payload

Concatenate `manifest.chunks` in listed order, verify `payload_sha256`, gunzip, then read the ustar archive. Do not add history-index rows on top of companion histories: they overlap. The adapter emits companion histories first and uses the regional history index only for offices that have no companion row. Offices with zero recorded cycles still appear as current tracked offices when the register lists them. Competition scores stay withheld (`three_entries` is 0).

### New Zealand batch

| Source | Normalized target | Notes |
| --- | --- | --- |
| `races[]` | current offices + upcoming events | Upcoming events have no result rows. Empty candidate arrays are not unopposed. |
| `histories[]` | selected events | `related_race_id` links to the race/office. Candidate marks are not unique voters. |
| `sources[]` | `sources[]` namespaced `new-zealand--NZ-S01` | Review status and check dates preserved. |
| `research_gaps[]` | `issues[]` and office completion-queue rows | Country-level gaps stay on the country record. |
| Metrics | withheld | Multi-seat FPP / missing STV stage reports. |

`Takapū` and other source spelling is preserved. The 2022 Buller mirror stays preliminary.

## Regions

After merge:

- **South / Central / North America and Caribbean** — unchanged Latin America status (partial / screened as already imported). South America remains the default landing region.
- **Europe (Russia excluded)** — `partial` because Albania, Alderney, Andorra and Armenia packages are adapted. Austria is on disk (`data/countries/austria`) but has no observatory adapter yet. Bosnia and Herzegovina is on disk (`data/countries/bosnia-and-herzegovina`, PR #15) but is skipped until an adapter/importer lands. Not a complete European register.
- **Oceania** — replaces the empty `new-zealand` placeholder when the NZ package is present. Partial: four by-elections only.
- **Australia, Japan** — still **not yet supplied**.

## Remaining gaps

- Original HTML must be sanitized before embedding (done for display). Byte-original files stay in the package; they are not copied into `data/research/briefings`.
- Armenia companion XLSX is catalogued inside the tarball only; there is no public artifact host for that workbook.
- Europe Parameters / Read me tables are regional methodology and are **not** shown as country totals.
- History-index crosscheck JSON is a reconciliation duplicate and is not added to event counts.
- Cached spreadsheet formulas are provenance, not recalculated.
- Briefing index HTML (`albania.html`, …) is navigation for the downloaded folder, not an office record.
- Later European uploads can drop in as new `data/countries/<slug>` folders; re-run `npm run import:countries` and `npm run validate:data`.
- NZ still needs a national screen, replacement of the 2022 mirror, and STV stage reports before latest-three or competitiveness claims.
- Observatory home still highlights South America only; Europe and Oceania are reached from Regions, explorer (`?region=europe` / `?region=oceania`), and calendar.
- Package `site_ingestion_status` / `website_ingestion` fields stay `pending_adapter` so frozen extract bytes do not change. The website adapter consumes them without rewriting those files.

Research coverage remains incomplete.
