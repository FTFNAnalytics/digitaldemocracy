# Slovenia full-register research handoff

## One-page summary

Pinned `FTFNAnalytics/digitaldemocracy` main at **`3b21c584c1b59663c5c4ae1bad775618293ac0fa`** on 2026-09-21. This is new sourced research. No repository, importer, SQLite, VPS or UI changes were made.

**428 current offices; 0 historical-only offices recovered; 1,282 historical cycles plus 424 prospective cycles = 1,706 events; 13,830 result rows; 801 round/repeat proceedings.** Earlier predecessor reconstruction remains an open research gate. Zero recovered historical-only offices does not mean that no abolished offices existed.

The current register contains **212 municipal councils and 212 directly elected mayors**, reconciled between the government directory and DVK’s municipal code roster. It also contains **one Državni zbor (National Assembly), one indirectly elected Državni svet (National Council), one directly elected President, and one EP delegation**. There are **213 direct-executive offices** and **215 councils, chambers or delegation offices**. No elected regional office, appointed PM/cabinet or neighborhood body is fabricated.

Draft tiers are **424 municipal / 0 regional / 3 national / 1 other**. Every classification remains `draft_for_human_review`; the EP delegation has a focused tier-policy flag. National Council local and functional electorates remain distinct from popular ballots. A cleared focused flag is not pack approval.

History covers local elections in 2014, 2018 and 2022; the Assembly in 2018, 2022 and 2026; the President in 2012, 2017 and 2022; the EP delegation in 2014, 2019 and 2024; and the National Council’s 2017 and 2022 cycles, with component proceedings in 2018 and 2023. First rounds and runoffs are not double-counted as cycles. The 2014 and 2018 local returns are explicitly **unofficial**. The missing 2018 Ribnica council return stays missing. **1,172 damaged source labels** remain verbatim and flagged. Earlier abolished municipalities, exhaustive replacement/certification histories and some preference/minority detail remain open.

The official local call supplies **15 November 2026** for 424 prospective events, with no fabricated results. Other next dates remain unknown. The alert window never removes an office or historic row. **Zero regional offices is an honest calendar empty state.**

The 223-column field map does not imply complete research or an accepted import. Research validation and checksums are reported in `validation.json`; **importer/publication CI is Not run**. All Justin approval boxes remain unchecked.

## Scope and tiers

| Body | Offices | Proposed tier | Electoral mode |
|---|---:|---|---|
|Municipal councils|212|municipal|Direct; majority/proportional and minority components preserved|
|Municipal mayors|212|municipal|Direct popular; actual runoffs only|
|Državni zbor|1|national→national_context|Direct national chamber|
|Državni svet|1|national→national_context|Indirect local/functional electors|
|President|1|national→national_context|Direct popular, first/runoff|
|EP delegation|1|other|Direct; supranational tier review|

## Historic depth

| Cycle | Events | Results | Limit |
|---|---:|---:|---|
|DS2017|1|109|College components / repeat dates distinct|
|DS2022|1|102|College components / repeat dates distinct|
|DZ2018|1|25|Source-bound selected projection; detailed gaps below|
|DZ2022|1|21|Source-bound selected projection; detailed gaps below|
|DZ2026|1|17|Source-bound selected projection; detailed gaps below|
|EP2014|1|16|Source-bound selected projection; detailed gaps below|
|EP2019|1|14|Source-bound selected projection; detailed gaps below|
|EP2024|1|11|Source-bound selected projection; detailed gaps below|
|LV2014|424|4837|Unofficial archived snapshot|
|LV2018|423|4616|Unofficial archived snapshot|
|LV2022|424|4037|Source-bound selected projection; detailed gaps below|
|LV2026|424|0|Prospective call only|
|PRE2012|1|5|Source-bound selected projection; detailed gaps below|
|PRE2017|1|11|Source-bound selected projection; detailed gaps below|
|PRE2022|1|9|Source-bound selected projection; detailed gaps below|

## Primary sources and verification

- [Government municipality directory](https://www.gov.si/podrocja/drzava-in-druzba/lokalna-samouprava-in-regionalni-razvoj/lokalna-samouprava/obcine/):212 municipality headings, including 12 citymunicipalities; full roster binding retained.
- [SURS current administrative count](https://www.stat.si/statweb/News/Index/14129):current territorial context; statistical regions are not electoral office identities.
- [DVK local mechanism](https://www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/):mayor and council ballots; [2026 call](https://www.dvk-rs.si/volitve-in-referendumi/lokalne-volitve/lokalne-volitve/lokalne-volitve/).
- Official linked [2014](https://dvk-rs.si/arhivi/lv2014/), [2018](https://dvk-rs.si/arhivi/lv2018/) and [2022](https://www.dvk-rs.si/arhivi/volitve2022/lv2022/) local archives:212 first-round municipality sources percycle; 2022runoff47 sources. No missing municipality invented from count expectations.
- [Final 2026Assembly Gazette](https://pisrs.si/api/uradni-list/objava/u20260197.pdf):rendered table pages 1–2,17 partyrows,1179769 votes. Media examples excluded from normalization.
- [National Council 2017 final record](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2018-01-0965/koncni-izid-volitev-clanov-drzavnega-sveta) and [2022 final record](https://www.uradni-list.si/glasilo-uradni-list-rs/vsebina/2022-01-3744/zapisnik-o-ugotovitvi-koncnega-izida-volitev-v-drzavni-svet):candidate elector votes, not national popular percentages.2023 repeat PDF page 1 was visually read; personal addresses/DOB are not projected into research rows.

All 821 retained source artifacts have exact URLs, byte counts and SHA-256s in Slovenia_Input_Inventory.json. Source retrieval date is not legal effective date. HTML/PDF/JS exactbytes remain inert; full provenance does not grant every retained file permission to generate results. source-projection.json and the field-map selection rules govern projection.

## Open research gates

- **SI-HISTORICAL-MUNICIPAL-UNIVERSE** (before 2014 and boundary changes; open): All 212 local rosters 2014/2018/2022 bind to current recovered municipalities. Zero historical-only offices recovered is not proof no abolished councils existed. Predecessors, creation/abolition dates and mergers/splits need primary dated register plus ballot binding. No successor edges supplied.
- **SI-LOCAL-CERTIFICATION-REPEATS** (all 424 municipal offices; open): 2014/2018 unofficial archived snapshots; 2022 final app snapshot. Municipal gazette/court certification and all by-elections/recounts/repeats not exhaustively reconciled. No certified status inferred from official-host delivery.
- **SI-MISSING-LOCAL-CYCLE** (SI-106-C::LV2018; open): 2018 Ribnica council has no recovered return table. Mayor and council office identities remain. No zero result/event fabricated.
- **SI-SOURCE-TEXT-DAMAGE** (result-label-review.json; open): 1172 result labels contain U+FFFD in frozen 2018 source bytes. Preserve originals, stable table-row IDs and numbers; authoritative replacement spelling requires evidence and reviewed crosswalk.
- **SI-ROSTER-ALIASES** (roster-bindings.json and historic-roster-bindings.json; pending_Justin): Three government/election naming variants are explicit bindings; 2018 LUŽE link points to obcina_luce.html also present in2014. No fuzzy name or merger inference. Approve these documentary aliases before import.
- **SI-DS-COMPONENTS** (SI-DS; open): Two nominal cycles recovered; functional/local colleges retain separate component keys and raw elector counts.2018 culture/sport completion and 2023 repeat retained. Original 2022 culture/sport claims are not current winners. Other National Council by-elections 2018/2020/2024/2026 and older cycles not fully normalized.
- **SI-DZ-MINORITY-MANDATES** (SI-DZ; open): National list vector once per 2018/2022/2026. Italian/Hungarian special-ballot details, district candidate/preference detail and 2026 numeric mandate allocation are retained in source but not fully normalized. Do not synthesize minority vote shares or seat counts.
- **SI-EP-DETAIL** (SI-EP; pending_Justin): Three national list vectors 2014/2019/2024 recovered.2014 numeric mandates absent from chosen table; allocation calculator excluded. Individual preference votes retained raw where supplied. Delegation proposed other requires tier acceptance.
- **SI-LOCAL-PREFERENCE** (proportional council preference vectors; open): Council list votes and majority candidate votes normalized; candidate preference arrays under proportional os/enote retained raw only to avoid mixing denominators. Minority council candidate components normalized separately. Neighborhood ckvs stays raw, excluded from office/result universe.
- **SI-NEXT-CALLS** (future elections; open): Official 15 November2026 local call mapped 424 times to actual offices. Other next dates unknown, not term arithmetic. Nominations, local exceptions and later special calls need refresh; out-of-window offices retained.
- **SI-MEDIA-FIXTURE** (source-projection.json; excluded_from_results): 2026 media sample timestamp 2026-03-06 precedes 22 Marchpoll and contains 2022 party set. All media instructional feeds excluded from numerical projection. Final 2026 record PDF is authoritative input. Archive software deployType=test is configuration, not itself an election fixture; archive publication links and final flags checked separately from instructional media examples.

## Justin decisions — unchecked

- [ ] Accept current office register and documented source-code aliases.
- [ ] Accept or amend draft tier proposals, including EP=other.
- [ ] Accept partial historical coverage and named certification/label/predecessor holds.
- [ ] Authorize future implementation separately; no production publication implied.
