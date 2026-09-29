# Georgia BG — inherited 223-field documentary map

Exactly **223 fields across 20 tables**, preserving the inherited BF contract byte-for-byte. Contract SHA-256: `8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae`. BE itself was not retrieved; this is not a claim to a verified live Atlas schema.

Every field has one row in `tables/field_map_223.csv` and `data/field_map_223.jsonl`. Pack-local research keys are not database IDs. Uninstantiated ingest/publication tables are explicitly disabled. No importer, SQL, migration or executable field adapter is supplied.

| Table | Columns | Research source |
|---|---|---|
| country | 11 | manifest.json |
| dataset_lineage | 3 | manifest.json (research lineage only) |
| dataset_release | 12 | manifest.json and SHA256SUMS (no live release) |
| election_event | 18 | data/events.jsonl |
| evidence_link | 11 | source_ids + source_locator on research records |
| geography | 9 | audit/current_municipality_crosswalk.json and office geography/era fields |
| identity_crosswalk | 8 | data/identity_crosswalk.json |
| ingest_attempt | 12 | Operational table not instantiated |
| office | 16 | data/office_register.jsonl |
| office_tier_classification | 11 | data/draft_tiers.jsonl |
| party_mapping | 12 | result labels and ballot codes only; enduring mappings held |
| proceeding | 11 | event_kind, ballot_component, round, legal_outcome |
| publication_receipt | 4 | Operational table not instantiated |
| publication_release | 2 | Operational table not instantiated |
| record_locator | 17 | pack-local IDs and source_locator |
| research_date | 12 | event_date/date_precision and data/upcoming_calendar.jsonl |
| result_row | 24 | data/results.jsonl |
| retained_input | 8 | sources/source_inventory.jsonl + SHA256SUMS |
| source | 14 | sources/source_inventory.jsonl |
| unresolved_evidence | 8 | data/research_gaps.jsonl; audit/local_extraction.json |

The research files intentionally contain extra provenance and hold fields; they are not a 223-column database dump. Nulls and evidence statuses govern any later review. All Justin approvals remain false.
