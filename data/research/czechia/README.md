# Czechia Prompt V research tables

Sourced Prompt V full-register research for Czechia. 6,411 current + 13 historical office rows. Justin accepted the register on 2026-09-20 with named holds. Drafted geographic tiers are retained, including 155 focused-review rows. This directory is the Prompt V research pack loaded by `ATLAS_IMPORT_SCOPE=czechia`.

Named holds retained: MUNICIPAL-RECALCULATED-PERCENT; HISTORICAL-CODE-BINDING; PRAGUE-DUAL-STATUS; MILITARY-CIVILIAN-TRANSITION; CURRENT-ROSTER-VALIDITY; EXECUTIVE-MODE; HISTORIC-DEPTH; LEGAL-OUTCOME-REPEAT-AUDIT; EP-PARTY-SCOPE; DATES-AND-NEXT-CYCLES. President is the only direct executive. Prague stays one city/region body. Do not invent a second Prague office, council-selected mayor or governor rows, historical successors, or municipal vote-share corrections.

Core tables landed from the slim review pack. `events.json` is stored only as `events.json.gz`. `results.jsonl.gz`, identity-vector blobs, and `sources/` raw bytes were omitted from git; do not invent those bytes. Result rows stay unpublished until an explicit importer change loads the omitted result artifact.

See [docs/phase1/czechia/README.md](../../../docs/phase1/czechia/README.md) and [docs/phase1/czechia/Czechia_Import.md](../../../docs/phase1/czechia/Czechia_Import.md).
