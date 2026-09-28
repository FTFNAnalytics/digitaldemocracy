#!/usr/bin/env npx tsx
/**
 * Propose person clusters for human review.
 * Writes schemas/atlas/people/{country}.json with review_status draft_for_human_review.
 * Does not approve anyone and does not edit the master.
 *
 *   npm run people:propose -- --country albania
 *   npm run people:propose -- --country albania --out /tmp/people
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { resolvePeopleDir } from "../../lib/atlas/people/load";
import { proposePeopleForCountry, serializePeopleProposal } from "../../lib/atlas/people/propose";
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) return undefined;
  return value;
}

function safeCountry(countryId: string): string {
  if (!/^[a-z0-9-]+$/.test(countryId)) {
    throw new Error(`refusing to write a person proposal for country id ${JSON.stringify(countryId)}`);
  }
  return countryId;
}

function main() {
  const sqlitePath = resolveAtlasSqlitePath();
  const outDir = flag("--out") ? path.resolve(flag("--out")!) : resolvePeopleDir();
  const only = flag("--country");
  const db = openAtlasDatabase(sqlitePath, { readOnly: true });
  try {
    const countries = only
      ? [safeCountry(only)]
      : db
          .prepare("SELECT country_id FROM country ORDER BY country_id")
          .all()
          .map((row) => safeCountry(String(row.country_id)));
    mkdirSync(outDir, { recursive: true });
    console.log("people:propose");
    console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
    console.log(`out=${outDir}`);
    for (const countryId of countries) {
      const file = proposePeopleForCountry(db, countryId);
      if (file.review_status !== "draft_for_human_review") {
        throw new Error(`proposer emitted ${file.review_status} for ${countryId}`);
      }
      const destination = path.join(outDir, `${countryId}.json`);
      writeFileSync(destination, serializePeopleProposal(file));
      console.log(
        `${countryId} persons=${file.persons.length} eligible_rows=${file.eligible_row_count} excluded_lists=${file.excluded_list_row_count} withheld=${file.withheld_row_count} review_status=${file.review_status}`,
      );
    }
  } finally {
    db.close();
  }
}

main();
