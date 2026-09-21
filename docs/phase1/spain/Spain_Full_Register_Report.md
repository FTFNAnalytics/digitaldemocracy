# Spain full-register research handoff — Prompt AE (DRAFT)

## Executive summary

Pinned `FTFNAnalytics/digitaldemocracy` main **`f7b5c81ebd39f1774edea7cde5b4155031d92647`**, checked 21 September 2026. New primary-source research; **8,204 current + 4 historical = 8,208 office/mandate records**, **20,820 event records**, **91,413 transcribed result rows**, 289 retained source URLs and 8,220 geographic records. The 8,132-entry current INE municipal territorial set is complete in this pack. **Electoral-mode and historical-result reconciliation are not complete:** 3,762 current municipal mandates remain mode-pending; 78 explicit 2023 direct concejo-abierto alcalde mandates still need current-mode confirmation. This is a review pack, not a production-ready claim of complete office mechanics or certified results.

Draft tiers (all 8,208 rows): **municipal 8,133; regional 68; national 2; other 5**. Current tiers: municipal 8,129, regional 68, national 2, other 5. There are **17 autonomous-community parliaments**, **38 ordinary indirect provincial councils**, **3 direct foral assemblies**, and **10 additional island councils**. Formentera's eleventh island body is the existing municipal mandate, counted once. Ceuta/Melilla are two combined assemblies; Aran is a sourced special assembly. Navarra has its Parliament, not a fabricated extra provincial council.

Known current institutional labels: **4,289 ordinary municipal councils**, 78 source-explicit direct-alcalde mandates, and 3,762 unresolved municipal modes; the other 75 current rows are combined city/island bodies, national/EP/regional/provincial/foral/island/special assemblies. Total identified collegiate/delegation rows = **4,364**. Direct executives are **78 evidenced 2023 local mandates, not a verified nationwide 2026 executive census**. No ordinary separate alcalde, popularly elected regional president, national PM or King office is invented.

Events span **1979–2026** where JEC indexes identify occurrences. Structured numeric rows cover municipal original summaries in **2015/2019/2023**, Congress **2016, April/November 2019, 2023**, and EP **2014/2019/2024**. Many Senate, regional, foral and island result PDFs are retained but not transcribed; provincial indirect constitutions are not invented. Scanned municipal pages, 158 unmatched bindings and later corrections remain open. Two nonidentical 2015 municipal blocks are explicitly disputed. All shares are unknown, no margins/certified winners are calculated. Per-office depth is in `Spain_Historic_Coverage.json`.

All next-election dates remain unknown pending primary call/calendar work. The alert window only filters alerts; it never removes an office or historic event. No future date is invented from an ordinary term. Structural validator PASS does **not** mean research completeness or production acceptance. **Importer / SQLite / VPS / UI / repository mutation = Not run; applied_changes=0.** Justin approval boxes remain unchecked.

## Scope and counts

| Current scope | Rows | Proposed tier | Mode / non-duplication rule |
|---|---:|---|---|
| Municipal representation, excluding combined city/island bodies | 8,129 | municipal | Council, explicit open-council alcalde or named mode hold; not one invented mayor per municipality |
| Ceuta / Melilla | 2 | other | One autonomous-city assembly each |
| Formentera | 1 | other | One municipal/island combined body |
| Autonomous-community parliaments | 17 | regional | No separate popular regional president |
| Ordinary provincial councils | 38 | regional | Indirect election under LOREG 205 |
| Basque Juntas Generales | 3 | regional | Direct assembly, no separate popular foral executive |
| Additional island councils | 10 | regional | Seven Canary + three Balearic; Formentera already counted |
| Aran special assembly | 1 | other | JEC-evidenced body; tier review held |
| Congress / Senate | 2 | national→national_context | Senate includes popular and autonomous-designation components |
| Spanish EP delegation | 1 | other | No domestic regional misclassification |
| **Current total** | **8,204** | | |
| Four source-identified historical municipal codes | **4** | municipal | No guessed successor/effective date |

## Primary sources and provenance

The [INE 2026 municipal code workbook](https://www.ine.es/daco/daco42/codmun/26codmun.xlsx), older official snapshots and [2026 change log](https://www.ine.es/daco/daco42/codmun/codmun_anual.htm) ground territorial identities. The current workbook SHA is `b4bea7c3cc1b295a73f7fa3ca68b2ef25c3a59833bd91ea5315ae25dcc1ca741`; 13 explicitly documented name changes preserve the same codes. Official orthography is retained; no translations are invented.

[JEC electoral indexes and publications](https://www.juntaelectoralcentral.es/cs/jec/elecciones) ground election occurrences and original returns. [LOREG](https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672) articles 179/196/201/205 distinguish open-council alcalde, council-invested mayor, cabildo and indirect provincial mechanisms. [FEMP's local institution directory](https://www.femp.es/asociados/entidades-locales) supplies named provincial/island institutions. Constitutional and autonomous-statute sources are retained as exact bytes; every original source hash and locator is in the inventory and source catalogue.

## Open acceptance gates

See `Spain_Research_Gaps.md` ES-G01–ES-G12 and the exact 3,897-row `human-review.json` queue. Main blockers: institutional modes/currentness; scanned/partial returns; official correction reconciliation; two disputed duplicate-source events; provincial indirect chronology; Senate designation and numeric gaps; pre-2001/historic legal change binding; special-regime tier decisions; island workbook title mismatch; upcoming-call research; excluded submunicipal register scope; unavailable official machine feeds. No completeness claim is made merely because the 223-column map is complete.

Tier SHA: `f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f`. Candidate fingerprint: `850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17` (not published).

- [ ] Justin approves the draft tier policy and explicitly resolves/retains named holds.
- [ ] Justin accepts research scope and documented historic/numeric limitations.
- [ ] Justin authorizes a future implementation separately.
