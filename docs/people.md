# People in the Election Atlas

A person page is a reviewed grouping of candidate labels that already appear in published official results. It is not a biography.

The page shows only:

- the canonical name chosen from those labels
- other approved spellings of the same name ("Also recorded as")
- electoral history rows whose candidate label is an approved alias: year, election, seat, result, votes, share, and margin
- offices where an approved alias is the recorded winner
- "In office" only when the seat's current holder is one of those approved aliases

Missing numbers stay "not supplied". They are not shown as zero.

The page does not add birth dates, addresses, photos, external profiles, or any fact that is not already in a published result row. Party colours are not used. Import vocabulary stays in the collapsed record details.

## Migration

Person tables are `schemas/atlas/migrations/0007_atlas_person.sql` (`person`, `person_alias`).

`0006_atlas_office_slug.sql` is already the office-slug migration. Do not reuse `0006` for persons.

`person_alias` allows at most one **approved** person for a `(country_id, candidate_or_list_label)` pair. The same spelling in another country is a different person unless a reviewer adds a manual cross-country alias (`manual_cross_country` and an evidence note). The proposer never creates that row.

## Proposals

`npm run people:propose -- --country albania` reads `ATLAS_SQLITE_PATH` and writes `schemas/atlas/people/albania.json`.

Every generated file and every person in it has `review_status` `draft_for_human_review`. Nothing in that file is a person on the site until a reviewer changes the file to `approved` and sets `reviewed_on`.

Clustering rules, per country:

- Labels that match exactly after case, diacritic, and punctuation folding are one proposal. "Ada One", "ADA ONE", and "Ada-One" are one cluster. "Ada One" and "Bea Two" are not, including when they stand for the same office in different years.
- Recurrence in the same office across cycles is recorded as evidence (offices, years, row counts). It is not a reason to merge different surnames.
- Initials-only labels stay their own proposal with hold reason `initials-only label; left unmerged`.
- List labels are excluded by `office_type` (council, assembly, and other collective bodies, plus types whose name says list or slate) and by `ballot_basis` `list_votes`. They never become persons.
- Withheld result rows are not proposed.

An alias claimed by two persons fails validation. `npm run derive:atlas` loads only files whose `review_status` is `approved`, and refuses an approved file that still contains a draft row. Draft files are left out of `person` and `person_alias`.

## Commands

```bash
npm run people:propose -- --country albania
npm run derive:atlas
npm test -- tests/atlas/people.test.ts
```

`ATLAS_PEOPLE_DIR` overrides the proposal directory. Tests use a temporary directory.

## Pages and search

Approved persons are at `/atlas/people/{person-slug}`.

Search mode `person` returns approved persons first. Candidate labels that are not an approved alias follow, marked `unreviewed label`.

"These are two different people" opens the research-correction issue template with that `person_id` filled in. Splitting a cluster is a reviewed edit to the proposal file, not an automatic guess.
