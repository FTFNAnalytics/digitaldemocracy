# Contract and validation

Frozen inherited contract: 20 tables / 223 columns, byte-identical to recovered BA columns.json. Each appears once in column-map.json. Research JSONL is not an importer or SQL migration.

Run python3 validate.py after extraction. Standard-library, read-only, no network. Checks include unique office/event/result keys, counts, 1:1 tiers, source references, null/zero semantics, historical phase gates, selected arithmetic, source-fact hashes and manifest completeness.

PASS does not establish diplomatic status, exhaustive history, certified finality of preserved snapshots or Justin acceptance. No CI service, importer, database, VPS, UI, repository, publication or operational release changed. Only the read-only validator is included as executable research code.
