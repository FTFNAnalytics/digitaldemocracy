# Person proposals

One JSON file per country. Schema `atlas-person-proposals/1`.

`npm run people:propose -- --country albania` writes `review_status` `draft_for_human_review`. That file is a proposal. Justin approves a country file before `npm run derive:atlas` copies it into `person` and `person_alias`.

Draft files are not imported. An approved file that still contains a draft row is refused. See [docs/people.md](../../../docs/people.md).

`0006_atlas_office_slug.sql` is office slugs. Person tables are `0007_atlas_person.sql`.

Do not put birth dates, addresses, photos, or external profiles in these files. The only labels are ones already stored on published result rows.
