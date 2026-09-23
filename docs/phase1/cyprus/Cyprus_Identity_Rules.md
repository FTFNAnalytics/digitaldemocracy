# Cyprus identity and evidence rules

Country identity is the Republic of Cyprus (CY), not a claim of effective control over every statistical territory. The local register uses administered units. National electoral reporting keeps official House constituencies (including Ammochostos and Keryneia) and the complete official presidential/EP electorate. Do not delete national ballots because their associated territory is excluded from the local-office register.

One council body is one office row. A direct mayor, deputy mayor, community leader or DLGO president has a distinct row. Councillor seats are not office rows. The House, President and EP delegation are national/delegation bodies; the three non-voting religious representatives are separate elected offices. Community deputies, cabinet posts, appointed district administration and ex-officio service-cluster seats are not invented popular contests.

Municipality IDs use explicit 2026 CYSTAT codes corroborated against the 2024 electoral municipality names. Reviewed EC↔CYSTAT aliases are evidence, not an arithmetic rule. Municipal-quarter deputies use the explicit former/EC area code within the named parent municipality. Community identities use Electoral Service area IDs joined to the named current composition table; Spilia Kourdali uses a readable unresolved-code token. Do not force its identity to CYSTAT Spilia or to Agia Eirini (1402).

Pre-reform office IDs use CY-HIST-MUN or CY-HIST-COM. Current merged councils are distinct from their historical constituents. Historical existence requires an earlier electoral area of the relevant type, not merely a present-day locality name. CYSTAT previous codes are statistical correspondences. The legal successor-crosswalk remains empty until merger instruments identify the actual edges and dates. No historic end date is synthesized.

Event identity is office + observed cycle + presidential round where applicable. R1 and R2 share a cycle_id but have separate totals. A runoff is neither a recount nor an STV transfer. The reported second-round percentages use that round’s valid ballots. A single-round 2003 return does not create a phantom R2.

Result identity in this frozen pack uses an event-scoped sequential row locator. For a future adapter, derive a canonical key from event, reporting unit, source ID, source locator and result kind; do not treat row order as a durable cross-release candidate identifier. Source candidate IDs remain election-scoped. Political labels remain source- and event-specific; no party mapping or cross-cycle continuity is guessed.

Maintain distinct result kinds: list_ballot, candidate_vote, candidate_preference, party_seats and returned_representative. Country and district views of the same election overlap; candidate preferences overlap with party ballots. Never sum across those views. Separate EP/parliament seat declarations from original ballot count views. Council composition seats include/exclude executives as explicitly stated on each row.

Only source-declared election or seat status sets elected/seats. Unknown is null. An explicit zero vote or zero seat remains zero. Unopposed returns have no_poll, not a fictional electorate or zero popular votes. Portal completion percentages are not certification. Subsequent replacements and corrected data require their own evidence, not retrospective alteration without provenance.

Dates retain day or year precision. No January 1 placeholders. Future cycle years are expectations, never exact poll dates. The 18-month window filters alerts only; it does not filter offices or historical events. No alert is created by this pack.

Every normalized value links to a retained source and a locator. Hashes cover exact retained bytes, including browser/search extracts labelled as extracts. Approvals, registry qualification and implementation remain gated. applied_changes=0.
