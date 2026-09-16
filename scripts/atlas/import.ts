#!/usr/bin/env npx tsx
/**
 * Ingest recognized inputs into the Atlas SQLite master.
 *
 * Phase 1 stub: fails clearly until the Albania importer is implemented.
 * Albania tiers are approved; Prompt C documentation is complete.
 * Does not ingest Albania or any other package.
 *
 * See docs/atlas-plan.md Phase 1, docs/atlas-phase1.md, and
 * docs/phase1/Prompt_C_Field_Map_and_CI.md.
 */
import { atlasImportBlockedMessage } from "../../lib/atlas/import-status";

function main() {
  const message = atlasImportBlockedMessage();
  console.error(message);
  process.exit(1);
}

main();
