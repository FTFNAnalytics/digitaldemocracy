#!/usr/bin/env npx tsx
/**
 * Ingest recognized inputs into the Atlas SQLite master.
 *
 * Phase 1 stub: fails clearly until reviewed entity DDL, the Albania
 * tier-classification file, and Albania ingest land. Does not invent rows.
 *
 * See docs/atlas-plan.md Phase 1 and docs/atlas-phase1.md.
 */
import { atlasImportBlockedMessage } from "../../lib/atlas/import-status";

function main() {
  const message = atlasImportBlockedMessage();
  console.error(message);
  process.exit(1);
}

main();
