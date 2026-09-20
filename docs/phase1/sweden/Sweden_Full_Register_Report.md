# Sweden full-register handoff — ACCEPTED (with holds)

> **Accepted 2026-09-19 (America/Edmonton) by Justin:** full register with named holds (Gotland tier, EP+Sameting other, 2026 preliminary locals refresh, historic boundaries/party/repeats, Färgelanda 1973). Importer not part of this land.


**313 current + 7 historical offices; 4,951 events; 40,991 result rows.** New research captured 20September2026 against main `94b22e8662b4d304263bef67628765f5377fd9da` ([pinned commit](https://github.com/FTFNAnalytics/digitaldemocracy/commit/94b22e8662b4d304263bef67628765f5377fd9da)). All office tiers remain drafts for Justin. Package validation concerns identities, source bindings and checksums; importer/SQLite/VPS/UI execution is **Not run**, applied changes **0**.

| Institution | Current | Historical | Historic coverage |
| --- | --- | --- | --- |
| Kommunfullmäktige (including Gotland once) | 290 | 2 | SCB 1973–2022 plus captured 2026; Bara and pre-1976 Svedala retained |
| Separately elected regional assemblies | 20 | 5 | SCB 1973–2022; five former landsting retained; live 2026 where available |
| Riksdagen | 1 | 0 | 15 SCB cycles 1973–2022 plus 2026 official final return |
| Sweden EP delegation | 1 | 0 | 7cycles1995–2024; source-year precision |
| Elected Sameting assembly | 1 | 0 | 2017, 2021, annulled May 2025 and October 2025 repeat |


**Gotland explains the regional count.** There are 21 county groups (län) in the current election geography, but only 20 separate RF election areas. Gotland’s municipal council performs combined functions and may use the name regionfullmäktige under Kommunallag 3:14. It appears once, proposed municipal with focused review; no second regional office or duplicate result. [Current election data](https://www.val.se/valresultat-och-statistik/statistik-och-data/radata-val-2026); [municipal law](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/kommunallag-2017725_sfs-2017-725/).

Tier totals: **municipal 292 / regional 25 / national 1 / other 2**. Current tiers: municipal 290 / regional 20 / national 1 / other 2. EP and Sameting other proposals remain review items. The current Valmyndigheten geography ID set also exactly matches the independent 2026 mandate workbook: 290 municipal and 20 regional office codes. Repeated constituency rows do not add offices (workbook-register-crosscheck.json). The roster is complete for the current governmental elected-body scope evidenced by Valmyndigheten. Historical depth is qualified, not an exhaustive pre-1973 register. Church/private-association elections, referendums, appointed chairs, kommunalråd, prime minister and cabinet are excluded as separate popular offices. [Election types](https://www.val.se/det-svenska-valsystemet/grunderna-i-det-svenska-valsystemet/allmanna-val-i-sverige).

The alert window does not filter the register. Next ordinary 2030 and EP 2029 remain year-precision metadata; Sami 2029-05-20 retains its sourced day. All are outside the study window, and no future event is manufactured. The 13September2026 event anchors remain in history even where returns are partial. [Upcoming election years](https://www.val.se/kommande-val/kommande-valar).

## Results and source limits

SCB original JSON-stat2 cubes and queries are retained, with direct cell pointers for votes, shares and seats. Main history is 1973–2022; no automatic assumption that a source-year column is the actual repeat-election year. SCB labels can be modern/harmonized and ÖVRIGA groups local/older parties. Source tables are statistical returns, not a complete candidate slate. [SCB election statistics](https://www.scb.se/hitta-statistik/statistik-efter-amne/demokrati/allmanna-val/allmanna-val-valresultat/).

2026 captured local/national result payloads: **311**. All 310 local vectors remain preliminary under the district-completion/mandate guard; the Riksdag vector is final. Reporting completion and count stage are retained per event. Event outcomes: `{"annulled":1,"certified":4638,"preliminary":310,"superseded":1,"unknown":1}`. Missing endpoints do not remove offices/events. The official raw-data page says files are published as available; local counts must be refreshed independently of the final Riksdag result. No preliminary vector is labelled final merely because an endpoint exists.

Historic rows are counted once. The 40,991 result records include non-additive display summaries: Val visibility code 2 is an overlapping other-party summary and is excluded from vote-sum reconciliation, while its original row remains retained. Separate source seat/vote tables join one result; previous-election comparisons, reporting districts and candidate personal-vote sublists stay raw. SCB repeat footnotes cover Hallsberg 1980, Borgholm/Åre 1986, Orsa 2003, Västra Götaland 2011 and Falun 2019. Örebro 2010 is a mixed cycle aggregate; Båstad 2015 repeat has an anchor with absent results. Sameting May 2025 remains annulled/other; October repeat remains separate. [Sameting2025 result and annulment](https://www.val.se/valresultat-och-statistik/sametingsval/valresultat-2025).

**Missing ≠ zero:** 12 missing vote scalars vs 57 reported zeros; 1191 missing seat scalars vs 5967 reported zeros. Färgelanda 1973 hypothetical adjusted seats are withheld from typed seats and retained with the SCB explanation. No certified totals, margins or party-family mappings were invented.

## Open research gates

| Gate | What remains |
| --- | --- |
| SE-HISTORICAL-BOUNDARIES | The register preserves all council identities evidenced in the SCB 1973–2022 series, including Bara, pre-1976 Svedala and five former landsting. Pre-1973 abolished councils are not exhaustively inventoried. Source labels/codes are harmonized across county transfers; exact legal succession beyond explicit Bara/Svedala note remains a research gate. |
| SE-HISTORIC-PARTY-DETAIL | SCB ÖVRIGA combines local parties and some older named parties; detailed full-party and candidate slates are not complete. Numeric modern labels are source labels, not an asserted historic renaming timeline. |
| SE-REPEAT-AND-RECOUNT | SCB footnotes replace some original ordinary returns with repeat outcomes or mixed partial-repeat totals. Original annulled vectors and separate protocols need recovery; Båstad 2015 has an event anchor but no typed vector. |
| SE-2026-COUNT-IN-PROGRESS | 2026 source availability is a capture, not a claim that every local count is final. Missing endpoints and incomplete district counts require refresh; retain offices and event anchors regardless. Compare updates by stable identity and original claims. |
| SE-GOTLAND-TIER | Gotland is one municipal electoral body with regional responsibilities. Proposed municipal with focused review; no extra regional office or duplicate contest. |
| SE-EP-SAM-TIER | EP delegation and elected Sameting assembly are evidenced directly elected bodies; proposed other requires Justin tier acceptance. Church elections and private associations are outside the governmental political-body scope. |
| SE-FARGELANDA-1973 | SCB seats are a hypothetical double-election-adjusted presentation for Färgelanda 1973; do not call those seat scalars actual installed seats. Withhold typed seats, retain source values/claim. |


The companion `aggregate-audit.json` and validation record distinguish arithmetic disagreements, partial counts and research gaps from package-integrity checks. A PASS does not certify the research complete or authorize publication.

- [x] Justin accepts the source-backed register and qualified historical scope (2026-09-19, with named holds).
- [x] Justin accepts Gotland municipal + EP/Sameting other proposals as named holds (2026-09-19).
- [x] Justin accepts draft tiers with named holds (2026-09-19); production_accepted=true on package.
- [x] Justin accepts the named source gaps and 2026 local refresh requirement as holds (2026-09-19).
