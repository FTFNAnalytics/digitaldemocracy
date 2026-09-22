# Greece research gaps and limits

The current register is complete; historical numerical coverage is explicitly incomplete where stated below. These gaps remain visible even though all four local archive authority registers were fully extracted.

## GR-G01 — presidential_indirect_election

Status: **open**. Scope: 1974, 1975, 1980, 1985, 1990, 1995.

Official Presidency biographies identify outcomes, but do not provide every unsuccessful ballot, opponent or abstention. The 1974 interim election and 1975 date are year-precision; a term-start date is not substituted for an election date.

Retained: Six older cycle/outcome records; numeric support where present. Original parliamentary minutes supply all recorded candidate totals for 2000, 2005, 2010, 2014-15, 2020 and 2025.

Needed: Earlier authenticated parliamentary roll-call minutes; resolve 1975 date before increasing date precision.

Guard: No popular national votes, turnout, first preferences, or invented opposition votes.

## GR-G02 — regional_governors_and_councils

Status: **open**. Scope: All thirteen 2019 regional source vectors.

ANumTm differs from configured CountTm. The archive does not establish here whether that difference means inactive polling-station configurations or missing returns. All candidate values are retained and reconcile to the published valid-vote total.

Retained: All 13 councils and 13 governors in all four cycles; source station counts and 13 explicit holds.

Needed: Reconcile each station-count denominator against the certified regional return.

Guard: Do not label these snapshots fully certified solely because vote shares sum to 100.

## GR-G03 — mayoral_direct_election

Status: **open**. Scope: Messini 2014, electoral code 9255.

The published runoff has 9,236 votes for each candidate, WIN_ID=0, and only 17 of 33 council seats allocated in the source fields.

Retained: Both actual runoff tallies, all first-round candidates, published partial seats, and missing winner.

Needed: Obtain the court determination/recount and legally effective allocation as a separately sourced outcome.

Guard: Do not choose the first row, rank, larger first-round tally, or current incumbent as the runoff winner.

## GR-G04 — Kallikratis_Kleisthenis_succession

Status: **partially_resolved**. Scope: 2010 architecture and 2019 five-to-twelve municipality reform.

All 325 municipalities in 2010/2014 and all 332 in 2019/2023 are covered. Five abolished municipalities have historical council/mayor pairs. The 2019 Ministry circular supplies the named reform and effective dates.

Retained: 10 historical offices, versioned source codes, contemporary registers, reform PDF. No successor edges are asserted.

Needed: A separate legal provision-level crosswalk for any requested territorial successor graph or pre-2010 municipality lineage.

Guard: A reused code or matching name is not proof of unchanged boundaries; municipal districts are not automatically historical municipality offices.

## GR-G05 — earlier_parliamentary_vote_vectors

Status: **open**. Scope: 1974, 1977, 1981, 1985, June/November 1989, 1990, 1993, 1996, 2000.

Parliament publishes seat-winning parties for these ten cycles; losing-party vote vectors are not represented as complete. Independents in November 1989 and 1990 have no published votes/shares in the selected compilation.

Retained: All 20 post-1974 parliamentary election cycles through June 2023; 300 published seats in each. Full national vote vectors for ten cycles from 2004 onward.

Needed: Recover and transcribe Ministry historical national totals for these ten cycles, then reconcile to the official valid-vote denominator.

Guard: Do not infer missing party votes by subtracting rounded shares or treating omitted contestants as zero.

## GR-G06 — European_Parliament

Status: **open**. Scope: 1981 and the 1984-2009 archive series.

1981 is an evidenced election-year event without an asserted return vector. Six later historical EP constitutive-session tables supply seats and some shares but no exact votes. Their other-parties category stays aggregated.

Retained: 10 EP cycles including 2014/2019/2024 complete published Ministry party vectors. The 1979-1984 outgoing composition is retained outside election results.

Needed: Exact early EP national returns, including losing parties, date-level election evidence where only the year is retained, and candidate preferences if a person-level EP extension is requested.

Guard: An outgoing parliamentary composition is not a 1981 election return. Never convert a rounded share to an exact vote count.

## GR-G07 — source_finality

Status: **open**. Scope: Archive snapshots generally.

An official host, an archive timestamp, and 100% arithmetic reconciliation are not interchangeable with a court-certified return. The 2023 portal describes court-based adjustments; it does not supply every underlying judgment here.

Retained: Raw source flags/timestamps, preliminary holds, 2023 court-reconciled publication note, and otherwise unknown legal_outcome.

Needed: Link certification, recount, annulment and repeat decisions at authority/cycle level before treating all values as final.

Guard: Do not relabel every archived result certified, or silently overwrite one snapshot with another.

## GR-G08 — pre_2010_municipal_history

Status: **open**. Scope: Kapodistrias and earlier municipal elections.

The present extraction starts with the Kallikratis 2010 election. A nationwide pre-2010 historical office register and result transcription are not supplied.

Retained: No invented current twin offices or guessed merger links. Only the five abolished municipalities directly identified by the retained 2019 reform are historical office rows.

Needed: Recover the earlier Ministry electoral archive and territorial/legal register, then add source-identified historical offices and their own contests.

Guard: Do not project the current 332 municipality identities backward into pre-2010 elections.

## GR-G09 — party_and_person_identity

Status: **review_required**. Scope: All cycles.

Source list labels and candidate spellings are retained, but canonical party aliases and cross-cycle person identifiers are not asserted. Municipal joint-ticket totals are not personal preference marks for individual council candidates.

Retained: 8,021 distinct source result observations with scoped codes and 14,004 explicit office projections.

Needed: Human-reviewed entity mapping if later requested; separate candidate-preference extraction for individual seat-holder analysis.

Guard: Do not collapse similarly named local slates, coalition successors, or people by fuzzy name matching.

## GR-G10 — retrieval_and_original_bytes

Status: **open**. Scope: Legacy archives and 2014 date circular.

Some legacy Ministry hosts returned HTTP 502; several Ministry pages and the original 2014 date PDF returned HTTP 403 to the direct client. The date circular was readable through the web retrieval service.

Retained: All selected source bytes are hashed. One explicitly labelled web-extract JSON preserves the retrieved text of circular 19011/11-05-2014; its hash is not represented as a hash of the unavailable original PDF.

Needed: Recover original inaccessible materials when the public archives respond; do not interpret retrieval failure as absence of an election.

Guard: No fabricated original-file digest, HTTP success status, or claims that an inaccessible archive contains no data.
