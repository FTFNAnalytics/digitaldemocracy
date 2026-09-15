# Build prompt — The Center for Digital Democracy

Give the implementing AI this entire document and the latest `Latin_America_Races_and_Briefings.zip`. The checkpoint and source archives are useful for tracing or changing the research pipeline, but are not required merely to display the exported data. Supply the target repository when available. This prompt does not assume an existing Git organization slug, domain or hosting account.

---

You are the lead engineer and information designer building a public election research platform for **The Center for Digital Democracy**.

Build the working repository, data import pipeline and public website described below. Implement the product using the supplied research, rather than stopping at an architecture proposal or a demonstration populated with invented elections. Work through implementation and validation, preserve progress in reviewable files, and document any genuine blockers. Do not describe the underlying research as complete simply because the software builds successfully.

## 1. Product and scope

The platform makes subnational election research searchable, comparable, understandable and downloadable. Its users include researchers, journalists, public officials and interested citizens.

The initial content is the supplied Latin America and Caribbean research package, with **South America as the default landing region and immediate priority**. Display all other supplied regional content through the same architecture. The wider project covers North and South America, Europe excluding Russia, Australia, New Zealand and Japan. Make those regions extensible without pretending their data has been supplied or completed. Do not collect a new global dataset as a prerequisite to building this product.

The research includes regional/state and municipal government elections, councils and relevant smaller elected bodies, historical results, competition and volatility measures, national and local polling, officeholder evidence, election calendars, sources and research gaps.

Use the exact organization name above. A suitable initial product title is **Subnational Election Observatory**. Treat that product title and the proposed repository name `election-observatory` as editable defaults, not existing organizational assets. Use a restrained text wordmark until real branding is supplied. Do not invent organizational history, staff, institutional partnerships, endorsements or a Git hosting URL.

## 2. Inspect the inputs before implementing adapters

Start by reading the repository's instructions, if one exists, and inventory the supplied files. Reuse a suitable existing stack and conventions. Preserve the original research files unchanged; perform normalization through a documented adapter.

The current delivery normally contains:

| Input | Intended use |
|---|---|
| `Data/<Country>.json` | Main country records: `country`, `coverage`, `offices`, `histories`, `rosters`, `issues`, `sources`, `polling` |
| `Data/<Country>_Supplementary_Evidence.json` | Additional evidence, often also represented in the country's `rosters`; reconcile duplicates before importing |
| `Data/Build_Status.json` | Release context, window, reported totals, remaining work and source archive references |
| `Data/South_America_Research_Status.json`, `Data/south_america_release_review.json` | South American research coverage and qualifications; overlapping representations, not additive datasets |
| `South_America_Completion_Queue.csv` | Office-level remaining requirements; UTF-8 BOM may be present |
| `Data/polling_context.json` and country `polling` / office `polling_context` | Overlapping representations of polling evidence; do not count them repeatedly |
| `Data/Country_Screen_Evidence.json` | Reasons a country has no imported in-window ordinary races, with sources and limitations |
| `Data/South_America_Additional_Evidence.json`, territory files and other supplementary JSON | Historical baselines, exceptional events and separately screened territories |
| `Briefings/<Country>/*.html` | Existing individual office briefings, including historical offices |
| `Start_Here.html`, `Methodology.html` | Existing navigation and definitions; useful for preserving interpretation and links |
| Country workbooks, regional workbook and briefing PDF | Downloadable research artifacts and cross-checks |
| `Data/Validation_Summary.json`, other validation files | Prior validation evidence; not a substitute for your own import checks |

Do not import every JSON file as a country. Create an explicit input manifest with adapters for each supported document type. Every supplied content-bearing file must be imported, exposed as an ancillary download, or listed in an import report with the reason it is not displayed. Do not silently lose supplementary evidence.

The optional `Latin_America_Checkpoint.zip` contains research scripts and working data; source archives contain original evidence. The checkpoint explicitly warns against rerunning older importers over corrected data. Respect those instructions. Do not require raw SPSS/PDF extraction for ordinary website builds when normalized exports are already supplied.

### Release-specific baseline, not permanent constants

The inspected release has an evidence snapshot of **13 September 2026**, with Ecuador additions retrieved on **14 September 2026**. Its fixed, inclusive election window is **8 September 2026–8 March 2028**.

South America contains 12,738 tracked current offices, 27,889 historical records and 164,191 party/candidate rows. Of the tracked current offices, 7,435 have three usable selected vote cycles. This is not a percentage of all real-world offices because some country registers are incomplete.

The broader supplied release contains 18,229 tracked current offices, 414 historical office records and 40,509 histories. There are 18,643 individual office briefings. These figures are reconciliation expectations for this release, not hardcoded UI values or promises about future releases.

Known legacy export hazards found during this handoff:

- `release_summary.json` has a malformed `totals` field containing a territory record. Do not use it to populate dashboard counters.
- `Data/Build_Status.json` has a stale top-level briefing count of 18,528. Reconcile against the actual office records and briefing files.
- Evidence and polling appear in multiple mirrored files. Deduplicate observations by documented source identity and content, while preserving distinct dated snapshots and conflicting observations.
- Some issue `detail` values contain serialized JSON. Parse recognizable structures into readable text while retaining the original value for audit.

Produce an import reconciliation report that separates legacy summary defects from actual missing or invalid research records. Recompute totals from the validated normalized records and document any differences. Do not modify the original inputs to make the numbers agree.

## 3. Required information architecture

Implement these routes or clear equivalents. Navigation, filters and download controls must function.

| Page | Required behavior |
|---|---|
| Home | Organization identity, concise product explanation, South America entry point, release date/window, searchable upcoming elections and clearly scoped coverage totals |
| Regions | Available datasets by region; distinguish available, partial, screened-out and not-yet-supplied coverage |
| Country | Government tiers, calendar, searchable office table, historical coverage, polling context, sources, downloads and country-specific gaps |
| Election explorer | Search/filter by region, country, area, tier, office type, date range, date certainty, evidence status, metric availability and metric review status |
| Office detail | Complete briefing with upcoming race, selected historical cycles, other events, results, metrics, officeholder evidence, sources and unresolved issues |
| Election/event detail | Full candidate/list results, vote basis, seats, rounds, dates, legal outcome and links to associated proceedings |
| Compare | Compare two to four offices with election dates, margins, vote/seat histories, qualified metrics and coverage; explain incompatible comparisons |
| Calendar | Accessible agenda and month views, including partial/conditional dates in an appropriately labelled section |
| Polling | National context and local polls, with fieldwork dates, question/measure, pollster, sample, methodology and supported comparisons |
| Coverage | Country table and searchable office-level completion queue; filters for missing returns, registry gaps, structural exceptions and unresolved events |
| Sources | Searchable evidence catalogue with publisher, title, URL, dates, file hash/locator when supplied, and records supported |
| Downloads | Country workbooks, briefings, structured exports, release package and checksum manifest, with file sizes and release labels |
| Methodology | Metric formulas, eligibility, ballot comparability, event selection, geographic bridges, polling limits and status definitions |
| Release history | Version, dates, changed records, added evidence, known gaps and links to prior releases when actually available |
| About | Supplied project purpose and organization name; no invented institutional credentials |

Prefer stable public routes such as `/countries/ecuador/`, `/offices/EC-P-1/`, `/elections/<stable-id>/` and `/sources/<stable-id>/`. Keep identifiers separate from display names. Preserve or map legacy briefing links through an explicit redirect/link manifest. Confirm filename-to-office mappings from the actual files; do not rely on an undocumented filename guess.

An office page should answer, in this order:

1. What office is this, where is it, and when is its next election expected?
2. Is the date formally called, statutory/expected, conditional or unknown?
3. Who won the relevant earlier elections, by what margin, with what vote and seat evidence?
4. What do the available competition and volatility measures show, and what limits their interpretation?
5. What is actually known about the current officeholder or council control, as of what date?
6. What polling context is relevant, and does it support any local conclusion?
7. What is still unresolved, and which sources support the displayed claims?

## 4. Data model and normalization

Define versioned schemas and TypeScript types. The following are conceptual entities, not a requirement to deploy a database:

| Entity | Essential distinctions |
|---|---|
| Dataset release | ID, schema/method versions, fixed window, snapshot, retrieval range, provenance, validated counts and artifact references |
| Country/territory | Stable ID, region, names, screening evidence; sovereign-country and territory totals separate |
| Geographic unit | Country, parent geography, names/aliases, source codes, effective dates and optional sourced geometry |
| Office | Stable existing ID, geography, tier/type, current or historical status, registry qualification and sources |
| Election cycle / contest | Office, date with precision/certainty, event kind, selected-history role, electoral system and comparability |
| Proceeding/result version | Round, repeat, recount, annulment, certification, relationship to other proceedings and supersession status |
| Result row | Candidate/list label, dataset-scoped party code, votes/marks, reported and calculated shares, seats and evidence |
| Party/group mapping | Original label/code, country and source namespace, effective scope, mapped group, mapping evidence and uncertainty |
| Officeholder observation | Person, office, role, principal/substitute status, dated roster/term, affiliation evidence and source; not automatically current tenure |
| Electoral register observation | Geography/office, dated elector count, source codes, source rows and related spending-limit evidence |
| Poll observation | Pollster, population, scope, named office if local, question, fieldwork/publication dates, responses, sample and source |
| Metric observation | Value/unit, method version, inputs, selected cycles, eligibility/review status and withholding reason |
| Evidence/claim link | Source ID, URL, title, dates, hash, page/sheet/row locator, claim supported and evidence status |
| Research issue | Affected records, issue category, description, resolution state, required evidence and sources |
| Briefing/artifact | Office/release association, format, path/URL, checksum and availability |

Preserve unknown upstream fields in a namespaced extension/raw record. Keep a field-mapping document. Existing `offices[].id`, `histories[]._key`, source IDs and their references must remain traceable. Names are not primary keys. If new IDs are needed, use deterministic namespaced IDs and save the crosswalk; do not generate random identities on each import.

Source `rosters` is heterogeneous: it contains elected people, dated directories and electoral-register observations. Classify by record type and documented structure. A parish register row must not become a person, and a directory snapshot must not become an election.

The source's `current: true` refers to a tracked current office, not proof that its last election winner still holds that office. A source's numerical usability flags do not imply certified outcomes or cleared comparisons.

## 5. Non-negotiable research semantics

- Missing is not zero. Preserve recorded zeroes. Distinguish unknown, not applicable, structurally unavailable, preliminary, disputed and superseded values. Do not infer these categories without evidence.
- Three source files, rounds or directory snapshots are not three completed election cycles. Preserve `selected_keys`, `all_keys` and the reviewed relationships; do not blindly select the last three year labels.
- Separate ordinary, special, repeated and indirect elections. A recount is a result version, not an extra election. Preserve an annulled result as evidence without treating it as a valid completed cycle. Valid replacement events need their own explicit relationship to the office's history.
- New institutions may have fewer than three genuine prior elections. Show the structural limitation. Do not assign predecessor votes to a new office without a documented comparability decision.
- Votes, candidate marks, list votes, blank/invalid ballots and electors have different denominators. Display the ballot basis and share unit. In the legacy data, history party `share` values may be 0–100 while office `shares` inputs are 0–1: convert explicitly by field contract, never by guessing from a small value.
- Largest party, elected winner, certified seats, roster membership and current governing control are separate claims. Substitutes and vice-officers must not inflate seat totals.
- Do not total overlapping elector observations across mayoral, council and regional contests. Keep dated elector counts distinct from historical turnout. Preserve discrepancies rather than allocating unexplained votes.
- Preserve diacritics, leading-zero codes and local labels. Party code identity is scoped to country/source/election context; the same code may mean different parties in different files. Do not equate successor movements or mixed coalitions without evidence.
- A date without a formal call is not “confirmed.” Retain day/month/year/range precision. Never turn March 2028 into 1 March 2028. Uncertain overlap with the window remains conditional. Keep date-only values free of timezone shifts.
- A country screened outside the fixed window is not permanently election-free. Preserve the source's as-of date and exceptional-election qualification.
- Geographic or boundary uncertainty must remain visible. Do not draw invented municipal boundaries or fabricate coordinates. Maps are an enhancement only where sourced geometry exists; tables remain fully functional without it.

### Competition and volatility

Preserve the existing methodology and distinguish **cleared CI** from **provisional imported-series CI**. `score_gate: false` must prevent a cleared-score claim even when `comparison_ci` is numeric. Display `comparison_status`, event review and withholding reasons near the metric, not only in a distant methodology page.

The documented CI uses top-two gaps in percentage points, latest first:

```text
weighted_gap = 0.6 × latest_gap + 0.3 × previous_gap + 0.1 × oldest_gap
CI = max(0, 100 × (1 − weighted_gap / 20))
```

Higher values mean closer historical competition under this formula, not a probability of a change in government. Preserve upstream eligibility. Missing seat totals are a separate issue and must not become an invented input to the vote-based formula.

Grouped Pedersen volatility is `0.5 × sum(abs(group_share_t − group_share_previous))`, in percentage points, using the stated fixed party groups. It is a lower bound where residual groups conceal internal change. It is not individual voter switching. Preserve withheld intervals, incompatible ballots and all-Other exclusions. Do not calculate a mean over whichever intervals happen to exist when the source requires both.

Tables and comparisons must keep provisional and cleared measures visibly distinct. Null metrics sort separately from zero. If you provide editable weights, label results as a user scenario, keep official imported values unchanged, and expose the full calculation inputs.

### Polling and government-change context

Separate vote intention, presidential approval and other question types. Approval/disapproval response categories are not candidates or party vote shares. Compare waves only when the population, measure and officeholder/context support comparison. A change of president is not a within-president approval trend.

Attach local polls only to their named offices. Show national polling as national context. Do not invent a national-to-local swing model, local win probabilities or a party's current control. Display any supplied contextual flag with its exact evidence and rule. Where no calibrated local inference exists, say that local government-change risk is unassessed.

## 6. Interface and presentation

Build a credible research publication: light background, dark ink/navy typography, restrained teal/blue accents, legible tables and ample space around analysis. Use a serif for editorial headings if it fits, a readable sans-serif for controls and tables, and tabular numerals. Colors must not imply a universal party identity across countries.

Use responsive layouts, keyboard-accessible controls, visible focus, semantic headings and accessible table captions. Status distinctions need text and/or icons, not color alone. Charts require equivalent data tables. Long result tables need pagination or virtualization. Filters should persist in URL query parameters so a researcher can share a view. Provide clear empty states such as “No local poll supplied,” without adding fabricated content.

Useful visuals include historical vote-share bars, seat distributions where supported, qualified metric comparisons and polling series with methodological breaks. Avoid decorative dashboards, unsupported heatmaps and a single misleading regional “percent complete.” Coverage should show separate dimensions: registry completeness, usable vote histories, seats, actual-event review, current-control evidence and polling availability. Show denominators and unknown totals explicitly.

Office and event pages need print styles and stable citation links. Include a concise “Cite this record” block with organization, page title, release/snapshot, URL and source references. English is the initial interface language; preserve original-language evidence and make UI text localizable. Do not fabricate translations.

## 7. Repository and runtime

Use the existing repository stack when suitable. If starting empty, the preferred approach is **Astro + TypeScript**, with React components for interactive exploration and charts. Generate research pages as static HTML and load only the interactive code and data needed for the current view. Choose maintained compatible dependency versions, check the official documentation during implementation, and commit a lockfile.

Keep public reading and the initial import process independent of a hosted database, login system or proprietary app builder. Support deployment as static files on a standard web server, including a VPS. A different existing stack is acceptable if it meets the same functional and portability requirements; explain the choice briefly.

Suggested repository responsibilities:

```text
src/pages/                 Public routes and layouts
src/components/            Tables, filters, charts, citations and status views
src/lib/                   Queries, date handling, formatting and metric presentation
schemas/                   Versioned input and normalized schemas
scripts/import/            Explicit source adapters and reconciliation
scripts/validate/          Integrity, count, link and methodology checks
data/releases/             Small versioned release manifests and input checksums
data/normalized/           Reviewable data partitioned by country/entity
data/overrides/            Documented editorial corrections with provenance
content/                   Methodology, institutional text and release notes
public/data/               Generated compact indexes and per-record data shards
tests/fixtures/            Clearly marked test examples excluded from public data
docs/                      Architecture, data dictionary and operational guides
```

Adapt this layout to the stack rather than creating empty folders to satisfy a diagram. Do not commit dependencies, secrets, disposable build output or repeated copies of large archives. Use release assets, a configured artifact store or an explicit large-file strategy for bulky workbooks and source archives. Keep checksums and resolvable references in Git. Git hosting, public site hosting and downloadable artifact hosting may differ. Do not assume an organization slug, hosting provider, public bucket or permission to publish evidence.

Serve compact country/search indexes rather than embedding all histories and party rows in the initial page. Pre-index relationships once; avoid rescanning every country file for every office page. Cache parsing within a build, partition output and make interrupted imports resumable. A normal build must work from supplied local data without live scraping or API credentials.

## 8. Import, corrections and release workflow

Implement a deterministic pipeline:

1. Inventory and hash the supplied release; select explicitly recognized input types.
2. Validate input shapes and references, retaining unsupported fields.
3. Normalize identities, dates, result units and evidence types with explicit adapters.
4. Reconcile mirrored records and totals without discarding conflicting claims.
5. Apply documented editorial overrides separately from immutable source data.
6. Generate normalized records, search shards, route/link maps and a discrepancy report.
7. Build the public site and downloadable derived exports.
8. Validate the generated site and prepare a release manifest and change report.

Importing the same release twice must leave the same identities, counts and content hashes. Operational build timestamps may differ; research dates must not change. Importing a later release must produce a reviewable diff for additions, removals, changed results, statuses and source references. Detect breaking schema changes instead of silently dropping fields.

Use Git review for research corrections initially. Provide a contribution guide and issue/PR template for source-backed corrections. Do not build an unnecessary authentication/admin system for the first release. Sanitize imported HTML if reused and escape all source text; do not execute scripts from legacy briefings. Preserve citations and unique narrative content when replacing legacy presentation.

Include a data-rights field where known. Unknown rights remain unknown; access to a source file does not establish permission to republish it. Do not invent an organizational software/data license. Public downloads should expose approved/supplied public artifacts and retain provenance; operational checkpoints and credentials do not belong in the public document catalogue.

## 9. Validation and acceptance criteria

Demonstrate that the following work with the supplied real records:

- Every supported country and territory is discoverable; historical offices are accessible but excluded from current-office totals.
- All in-scope offices have working detail routes. Linked histories, sources, issues and supplementary evidence are reachable.
- A user can search for an office, filter a country/date range, share the URL, compare offices and download the relevant research.
- An office with three usable but uncleared histories never receives a cleared metric badge.
- A new Ecuador office with one actual prior election is shown as a structural shortfall, not as three cycles or a failed import.
- Ecuador's 1,292 ordinary register entries and three separate March 2027 first contests remain distinct in this release. Register observations are not presented as people or summed across overlapping office types.
- Cali's three membership-directory snapshots are not counted as three elections.
- An annulled election and a later valid election retain their different legal statuses. Source candidate/elected flags alone do not establish current council control.
- Missing, zero, preliminary, disputed and structurally inapplicable values are visibly different. Null scores do not enter rankings as zero.
- Party-code collisions, accented names, partial dates and historical boundary bridges survive import correctly.
- National polling cannot silently become a local forecast; incompatible approval waves do not produce a misleading trend line.
- Mirrored files do not inflate counts, and the known legacy summary defects are recorded and bypassed transparently.
- Full-data builds and navigation succeed, not just a tiny fixture subset. Record build time, peak memory and page/data transfer sizes, and address concrete bottlenecks.
- Deep links load directly, links respect the configured base path, and no source HTML can execute injected scripts.
- Representative mobile, desktop, keyboard, print and no-JavaScript reading views are checked. Charts retain accessible tabular evidence.

Expose scripts equivalent to `dev`, `import:data`, `validate:data`, `test`, `build` and `preview`. Include meaningful tests for the semantic cases above and smoke tests for the main browsing journey. If using GitHub, add an appropriate CI workflow; otherwise use the repository provider's equivalent. Publication should follow the repository's actual authorized workflow, not an assumed account or domain.

## 10. Delivery and working instructions

Implement in coherent stages: input audit and schemas; deterministic import; site shell and country/office/event pages; exploration, comparison, polling and coverage; downloads and release history; full-data validation and deployment documentation. Keep a concise progress file so another AI can resume without re-importing corrected data blindly.

Deliver the working code, input-mapping and reconciliation reports, data dictionary, methodology implementation notes, operational README, example import command, deployment instructions, test results and remaining limitations. Report separately whether **software delivery is complete** and whether **research coverage is complete**. The current South American research is explicitly incomplete; the application must handle and explain that condition well.

Do not stop after a plan or ask repeatedly whether to continue. Resolve ordinary implementation choices yourself. Ask only when a missing repository, required input, consequential publishing decision or irreconcilable interpretation actually prevents progress. If a file is unavailable, complete the parts supported by available inputs and name the exact missing dependency; do not replace it with fabricated research.

Start now by inspecting the supplied files and repository, then implement the first working import-to-office-page path and expand it to the full supplied dataset.

---

Implementation references for the receiving AI: [Astro content collections](https://docs.astro.build/en/guides/content-collections/) and [Astro islands](https://docs.astro.build/en/concepts/islands/) document the proposed content and interactive-component approach. If GitHub is selected, review its [large-file guidance](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) before committing research archives. Check the current official instructions when implementing; no particular hosting account or software version is assumed here.
