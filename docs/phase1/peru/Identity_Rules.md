# Peru identity and counting rules

1. Country identity is `peru` / `PE`, República del Perú. No diplomatic parallel identities are created.
2. Documentary IDs use namespace `PE-BK-research`. These do not mint or overwrite Atlas production IDs.
3. Municipality-wide mayor and council bodies each have one row. IDs distinguish `province-<INEI4digits>` from `district-<INEI6digits>`. The INEI roster’s title class determines municipal level, not a guess from population or name.
4. Provincial-capital districts do not receive invented second district municipalities. Lima provincial +42 district authorities are retained. Callao regional/provincial/district institutions are distinct legal levels.
5. Regional identity follows the 25-unit INEI government register. Departamento de Lima excludes metropolitan Lima per Law 31140 / directory footnote; no 26 th regional governor is invented.
6. Presidents and regional executives are elected tickets. Two presidential VPs and 25 vicegovernors are explicit components, not separately contested ballots. Component counts are separate from office/body counts.
7. Senate and Deputies start the restored 2026 era. The unicameral identity is historical; no current overlapping unicameral row. Pre 1992 bicameral institutions are an unresolved historical identity gate, not guessed predecessors.
8. Andean delegation is one elected body,5 titular seats plus 10 alternates; it is not EP or MERCOSUR. No party organization is an office.
9. ONPE native codes are preserved separately from INEI codes. Join historical territory only on an unambiguous exact normalized department/province/district name tuple (case/diacritic/punctuation normalization); unmatched observations are holds. This is a documentary same-place match, not proof of unchanged boundaries.
10. No guessed rename, split, merger or successor links. `successor_edges.json` is empty. Historical source geography is retained even when no current match is established.
11. A source-defined shared mayor/council ballot is one event with 2 office references; do not duplicate its vote totals. Senate two ballots remain separate segments. Any future 1-office-per-event target projection requires an explicit non-double-counting policy.
12. Original, runoff, complementary and replacement data have separate event/process identifiers. Labels alone do not establish a specific original→repeat or annulment→replacement edge.
13. Choice IDs are scoped to source/event. No guessed party-family continuity; original names/codes remain.
14. Numeric zero is retained only where the source contains numeric zero. Missing/blank/nonnumeric cells produce `votes=null` if any constituent is missing; `observed_vote_sum` remains a qualified partial sum. Missing shares/seats/outcomes stay null.
15. Candidate preference totals, party/list totals and ballot controls have distinct grains. Never sum them into one vote or seat total.
16. Sangani’s law establishes future popular municipal offices but no retained first-election call. Its mayor/council are current-territory holds, under transitional provincial administration, and receive no 2026 event.
17. Elected-office identity does not assert that every incumbent is directly elected at every snapshot: interim vacancy successors/administrators are not new popular offices.
18. `research_accept` means eligible for Justin review, not production approval; all tier and approval rows stay false/unchecked.
