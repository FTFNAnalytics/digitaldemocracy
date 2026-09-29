# Acceptance examples

These are review cases, not approvals. Machine checks are in `validate.py`; unresolved source gates remain open even when structural validation passes.

| ID | Case | Input/locator | Expected |
|---|---|---|---|
| UA-BD-A01 | National parliament | UA-NAT-PARL | One unicameral legislature; no PM office. |
| UA-BD-A02 | Popular president | UA-NAT-PRES | One direct office; 13 sourced historical presidential events. |
| UA-BD-A03 | Kyiv nesting | CVK region 80 | One city council and mayor; Kyiv oblast remains separate. |
| UA-BD-A04 | Oblast coverage | KATOTTG O | 22 current evidenced oblast councils; Donetsk/Luhansk scope holds. |
| UA-BD-A05 | Raion coverage | KATOTTG P | 136 territorial rows = 119 council offices + 17 holds. |
| UA-BD-A06 | Hromada accounting | KATOTTG H | 1772 H records = 1420 elected pairs + 352 holds; Kyiv adds one K pair. |
| UA-BD-A07 | Nested elected bodies | 15 city districts | 15 councils only; no city-district popular executives. |
| UA-BD-A08 | Non-elected administrative districts | 108 KATOTTG B rows | 93 additional divisions do not create councils from geography alone. |
| UA-BD-A09 | Olyka continuity | CVK 63929 | One council/head pair survives settlement-to-city status change. |
| UA-BD-A10 | Slobozhanske continuity | CVK 64337 | Kharkiv/Chuhuiv unit retained once; not confused with Dnipro namesake. |
| UA-BD-A11 | Pre-2020 raion | UA-HIST-VM2015-06528-C | Historical office distinct from current 63553; successor remains null. |
| UA-BD-A12 | Crimea | 303 H territorial entries | Held geography; no occupying-power legislature or synthetic polls. |
| UA-BD-A13 | Sevastopol | UA-HIST-SEVASTOPOL-C | Ukrainian historical council only; no invented popular city executive. |
| UA-BD-A14 | Whole-community deferrals | 18 CVK161 hromadas | No current office pair or zero-result 2020 event invented. |
| UA-BD-A15 | Partial deferral | Novoaidar five stations | Partial hold coexists with evidenced community council/head. |
| UA-BD-A16 | Presidential runoff | 2019-03-31 / 2019-04-21 | 39 first-round and two runoff candidate rows kept separate. |
| UA-BD-A17 | Annulled runoff | 2004-11-21 | Two reported figures are invalidated, never effective victory. |
| UA-BD-A18 | Repeat runoff | 2004-12-26 | Separate event, not a second presidency or additive vote total. |
| UA-BD-A19 | Earlier incomplete cycle | 1994-06-26 | Known poll date retained with no invented result rows. |
| UA-BD-A20 | Certified notice | 2014-05-25 | 21 candidate rows from certified CVK notice. |
| UA-BD-A21 | PR/constituency split | 2019 parliament | 22 national parties plus 3084 candidate rows in 199 SMDs; 225 PR seats. |
| UA-BD-A22 | Unheld constituency | 2019 non-contested SMDs | No fabricated zero-result district rows. |
| UA-BD-A23 | Snapshot not full return | 43,351 local XML rows | Elected-member evidence only; no party vote/seat totals inferred. |
| UA-BD-A24 | Missing head name | 23 XML head nodes | Office retained; no winner or vote total synthesized. |
| UA-BD-A25 | Missing numeric field | F58/F50 blank | Null remains null; zero only if source explicitly says zero. |
| UA-BD-A26 | Malformed source field | Starobilsk city CVK2096 | One parse repair; appointment date null; source typo retained. |
| UA-BD-A27 | Appointment date | Local DATE_OF_APPOINTMENT | Not reused as election date. |
| UA-BD-A28 | Repeat terminology | Повторні / Повторне голосування | Repeat election differs from repeat voting; no guessed prior event. |
| UA-BD-A29 | Wartime future dates | UA-BD-G03 | No invented ordinary dates or not-held result rows after 2022. |
| UA-BD-A30 | Historic direct head rules | 2010 vs 2020 | Relative majority historical rule not overwritten by later threshold. |
| UA-BD-A31 | Indirect officials | council chairs / starostas / administrations | No current popular offices created for indirectly selected/appointed roles. |
| UA-BD-A32 | EP exclusion | All rows | EP offices/events/results = 0. |
| UA-BD-A33 | Scope exclusion | All rows | No parallel-state, twin president or occupying-power office. |
| UA-BD-A34 | Draft tier coverage | 3005 office rows | Exactly one unapproved tier per current/historical office. |
| UA-BD-A35 | Contract completeness | 20 tables / 223 columns | Every inherited column appears exactly once in the map. |
| UA-BD-A36 | No implementation | Manifest / approvals | applied_changes=0 and Justin approval boxes unchecked. |
| UA-BD-A37 | Source integrity | Sources and SHA256SUMS | Retained original bytes and retrieval snapshots have verifiable hashes. |
| UA-BD-A38 | Alert window | All current/history rows | No current or historical coverage filtered by next-cycle timing. |
