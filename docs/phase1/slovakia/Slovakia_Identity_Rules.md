# Slovakia identity rules

Draft; main `89726607439fa6726e7c34e30eec45357230d318`; no public release minted. Namespace `cdd-observatory-v1`; lineage/source namespace `country-package-slovakia`. Country `slovakia`, code `SK`. Official territorial codes are preserved as strings. Atlas IDs below are explicit documentary keys derived from actual bodies; they are not claimed to be government-issued office IDs.

## Office and geography keys

| Source entity | Office ID | Geography ID | Scope |
|---|---|---|---|
| Official6-digit municipality/city-part code c | SK-c-C and SK-c-M | SK-OBEC-c | Council and separate direct mayor;39 city parts kept distinct from parent city |
| Official VUC code k in 1…8 | SK-VUC-k-C and SK-VUC-k-P | SK-VUC-k | Assembly and direct chair |
| National Council | SK-NRSR | SK | One chamber, no invented constituency office |
| Direct presidency | SK-PRESIDENT | SK | One office, first/runoff proceedings |
| Slovak EP delegation | SK-EP | SK | Supranational delegation, proposed other |

Names never serve as current territorial PKs. `2014-name-bindings.json` binds old returns to official2018 codes by exact scoped (obvod,name), trimming whitespace, a trailing footnote asterisk and spacing around hyphens only. All 2,926 roster bindings are unique. No fuzzy match or inferred merger edge. Original names and both source locators survive. `identity-crosswalk.json` registers5,852 body-qualified territorial aliases. National/VUC keys are explicit reserved documentary literals qualified by country; all vectors enumerate exact IDs.

## Canonical identities

C(x)=UTF-8 JSON, recursively sorted object keys, compact separators, Unicode unescaped, no NaN. H(x)=lowercase SHA256(C(x)). key(prefix,x)=prefix+"-"+first24hex(H(x)). Examples and all complete vectors are in Slovakia_Identity_Vectors.json.

- HK = office_id + `::` + cycle token: OSO2014/2018/2022/2026, VUC2013/2017/2022/2026, NRSR2016/2020/2023, PRE2014/2019/2024, EP2014/2019/2024. A date correction never changes HK.
- event_id = key("event",[N,office_id,HK]). It includes the namespace and office. Both presidential ballots and 2013 VUC runoff belong to the same event.
- proceeding_id = key("proceeding",[N,office_id,HK,"ballot-"+sequence]). Sequence1=first round,2=runoff; no unobserved round invented. Runoff is not supersession.
- result_row_id = key("result",[N,office_id,HK,proceeding_id or "main",candidate_source_id]). Values, votes, party label corrections, dates and file hashes never enter the numeric result identity.
- source_id = key("src",[L,exact_acquisition_URL,archive_member or null]). Retained bytes hash is version provenance, not the source ID. ZIP member and parent ZIP have separate identities.
- record_key = "rec-"+H([entity_kind,...typedPKparts]). Office parts=[N,O]; event=[N,O,HK]; result=[N,O,HK,resultID]; proceeding=[N,O,HK,proceedingID]; geography=[country,G]; source=[country,L,sourceID]; country=[country]; input=[L,R,input_path].
- date_id = "date-"+H([N,ownerType,ownerID,slot]); office/next, event/election, proceeding/ballot. Full hashes prevent shortened date collisions. A proceeding date attaches by evidence_link and raw, not a nonexistent proceeding.date_id column.
- evidence_id = "ev-"+H([record_key,[country,L,source_id],originWithoutSourceID,claim_kind]). The exact origin includes retained path/hash and real CSV record/XLSX row/PDF page/HTML id.

## Candidate key details and homonyms

Where supplied, mayor/chair/presidential keys use source ballot number; local/regional council keys include district and ballot number. National party rows use event-scoped source party code; EP2014 uses exact party label because its table lacks a code. PRE2014 uses the exact candidate header name, independently scoped by round.

Sources without sufficient ballot IDs use immutable source-record keys: OSO2014 mayor `source-record:OSO_2014_tab11:<CSVrecord>`; council `source-record:OSO_2014_tab10:<CSVrecord>`; OSO2018 non-IVIS council `district:<d>:source-record:OSO_2018_tab06d:<CSVrecord>`; VUC2013 assembly `source-record:OSK_2013_1kolo_tab08:<CSVrecord>`. These preserve distinct same-name occurrences, including same-party homonyms. They assert no cross-cycle person identity. A revised/reordered source MUST be reconciled to the frozen vector before import; do not silently regenerate row numbers as new people. Hold ambiguous bindings for human review.2018 IVIS and non-IVIS winners are separate supplied coverage, not duplicate all-candidate vectors.

## Release and attempt

Fingerprint `94f39ca9f08bfc266a3f6f0280a9feb141f08189d69a86acff95c1d718240179` = H(I.hash_inputs). The candidate release ID is `country-package-slovakia--sha256-94f39ca9f08bfc266a3f6f0280a9feb141f08189d69a86acff95c1d718240179`. It includes all effective source/research bytes, draft tier hash `ce8c24f7fcc2f41439f16fca0ad428312de913815c542d3c5c46e28275559770`, explicit empty override list, adapter/method/schema versions, canonicalization version and unchanged DDL hashes. ZIP, document formatting, wallclock, attempt_id and unrelated countries are excluded. Approval changing tier bytes changes fingerprint; no production release is minted from this draft.

Unchanged re-import → a fresh durable attempt_id and the same lineage release_id. A correction changes effective input hash/release while retaining office/event/result identities through the crosswalk. An incomplete update retains omitted offices/history and their provenance; inherited bytes/hashes join the new effective input set. Only sourced explicit withdrawal/supersession can change record state. Historical predecessor discovery adds sourced historical rows; no guessed successor link or removal of current rows.

Publication is a set of lineage releases. A Slovakia-only update leaves LatAm/NZ/Europe peers' release IDs and citations unchanged. Resolved evidence must reference a real source tuple; unresolved textual citations stay unresolved without fake publishers/FKs. Broken known FKs are fatal, not an excuse to create unresolved rows.
