# Election database — integration status and operations

The existing Next.js framework now loads the Latin America research release at `/electiondatabase`, and also ingests standalone country packages under `data/countries/*`. South America remains the default region. Europe and Oceania become **partial** only for the packages actually present; Australia and Japan stay not-yet-supplied. See [country-package mapping](electiondatabase-country-packages.md).

## Verified research input

Input: `Latin_America_Races_and_Briefings.zip`, 127,077,676 bytes. The complete SHA-256 is in `data/research/manifest.json`; release ID `latin-america-fe5e91689def`.

| Imported dimension | Count |
| --- | ---: |
| Current tracked offices, full release | 18,229 |
| Historical predecessor offices | 414 |
| Historical event records | 40,509 |
| Candidate/list result rows | 269,740 |
| Full office briefings | 18,643 |
| Countries with office records | 21 |
| Country/territory records including screens | 36 |
| South American current tracked offices | 12,738 |
| South American office-level completion requirements | 12,738 |

The fixed inclusive research window is 2026-09-08 through 2028-03-08. This is an imported research snapshot, not a live results feed. Integration is complete for the Latin America package plus the standalone country folders currently in git; **research coverage remains incomplete**. Europe is partial (Albania, Alderney, Andorra, Armenia). Oceania is partial (New Zealand by-elections only). Australia and Japan are still not supplied. Absence from a package does not establish the status of research held elsewhere.

The importer recomputes counts instead of trusting the malformed `release_summary.json.totals` and stale `Data/Build_Status.json.briefings` fields. The manifest records these discrepancies. Supporting JSON files are classified separately from country records.

## What is available

- Real office, country, historical-event, polling, coverage, source and release pages; stable original office IDs and selected-history keys.
- Shareable filters and pagination for large catalogues, country lists, calendar and completion queue. Compare up to four office IDs.
- All 18,643 sanitized original briefings, linked from structured office pages. Scripts, source styling and unsafe links are removed. Original file hashes and legacy path-to-office mappings are retained.
- Ninety-nine byte-preserved JSON/CSV/Markdown/text/HTML source objects, downloaded through checked server routes. Exact duplicate mirrored observations and issue rows are consolidated only in the display model; original evidence remains intact.
- Separate score gating, provisional CI, grouped volatility, unknown/zero values, dated electoral registers, roster observations and national polling context. Statistical results are not treated as proof of legal certification. National polling is not turned into local forecasts.
- Original PDFs, workbooks and the complete ZIP are catalogued with size and checksum. They remain unavailable until an HTTPS artifact host is configured.

## Run and deploy

```bash
npm ci
npm run validate:data
npm run validate:evidence
npm test
npm run lint
npm run build
npm start
```

Node 22 or newer. The committed compressed data is sufficient for normal development and deployment; the original ZIP is **not** needed to run the site. There is no database, private research API or authentication dependency. Public marketing-page forms retain their existing prototype behavior.

The Next.js build produces `output: "standalone"` and includes `data/research` in output tracing. The build script also copies static and public assets into the standalone bundle; `npm start` runs that server. Set `PORT` and `HOSTNAME` for the deployment host when needed. Allow roughly 2 GB runtime memory and at least 4 GB for the full archive import; measurements depend on Node and host. Restart the server after changing the release, because loaded records and indexes are process-cached.

Optional environment variable:

```text
ELECTION_ARTIFACT_BASE_URL=https://your-artifact-host.example/releases/latin-america-fe5e91689def/
```

Upload the original binary files at their archive-relative paths, and the complete ZIP at the root of that URL. Do not point this setting at a different release. Artifact downloads are direct HTTPS redirects; the host must serve the exact bytes matching the manifest. No secret belongs in this URL. The UI labels binaries unavailable while this setting is absent.

`OBSERVATORY_FIXTURES=1` enables synthetic data for explicit nonproduction development/tests only. Production always loads the real release and fails if it is absent; it never silently substitutes fixtures.

## Import another release

```bash
npm run import:data -- --zip /absolute/path/Latin_America_Races_and_Briefings.zip
npm run import:countries
npm run validate:data
npm run validate:evidence
```

The importer reads the archive, checks identities and references, computes normalized counts and verifies every briefing mapping, then writes a staging directory. It replaces the active directory only after validation passes. A local ignored `data/research.previous` directory supports recovery; these operations are intended for an offline build/checkout, not concurrent production imports.

The manifest records input checksums, normalized bundle hashes, briefing hashes, legacy mappings, discrepancies and changed/added/removed source paths relative to the previous release. Canonical JSON, fixed gzip settings and content-derived IDs make repeat imports deterministic. Review the manifest and data changes in a PR; do not treat successful ingestion as research certification.

## Storage map

| Path | Purpose |
| --- | --- |
| `schemas/v1/normalized.ts` | Schema 1.1.0 and explicit evidence states |
| `scripts/import/normalize.ts` | Legacy country adapter and evidence rules |
| `scripts/import/release.ts` | Archive import, sanitization, manifest and atomic publication |
| `scripts/validate/dataset.ts` | Referential, numeric, count and eligibility checks |
| `scripts/validate/release-evidence.ts` | Independent comparison to preserved original country documents |
| `lib/observatory/adapters/` | Standalone `data/countries/*` inventory, Europe/NZ/Armenia adapters, merge |
| `lib/observatory/research.ts` | Checked, server-side compressed Latin America loader; observatory merge happens in `load.ts` |
| `lib/observatory/load.ts` | Cached record indexes and filters |
| `data/research/countries/*.json.gz` | Normalized country datasets |
| `data/research/briefings/*.json.gz` | Sanitized original briefings, grouped by country |
| `data/research/objects/*.gz` | Exact original text evidence, addressed by SHA-256 |
| `data/research/base.json.gz` | Release metadata, screens, territories, completion queue and artifact catalogue |
| `data/research/manifest.json` | Inventory, validation counts and release comparison |

## Verification

- Full normalized-data validation: 1,403,097 checks, zero errors.
- Independent evidence validation: all 18,643 office selections, 40,509 historical records and 269,740 result rows matched original source objects; all 99 source-object hashes and 18,643 briefing links verified.
- Adapter/semantic tests include null versus zero, partial dates, legal status, false score gates, namespace preservation, exact-duplicate issues, CSV parsing, sanitized HTML and pagination bounds.
- Repeat import: all 141 output files were byte-identical.
- Production route checks cover the homepage, Ecuador explorer pagination, an Ecuador office and original briefing, Chile country/polling pages, month calendar, completion queue pagination, sources, downloads, comparisons and an unknown-office 404.
- Standalone-server checks also verify Chile polling from the shared register and an artifact download against its exact SHA-256.
- All 21 tests, lint and the production build pass. CI runs the same checks plus both full data validators. Research gaps remain visible regardless of software checks passing.
