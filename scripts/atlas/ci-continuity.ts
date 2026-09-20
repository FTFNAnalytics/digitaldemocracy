#!/usr/bin/env npx tsx
/**
 * CI proof: import Albania + Andorra + Alderney + Armenia + Belgium + Bosnia and Herzegovina + Bulgaria + Denmark + approved continuity packs (Batch A+B + ES/AR) into a temp SQLite.
 * Kept out of Vitest because the LatAm projection exceeds Vitest's 60s worker RPC timeout.
 */
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { importAtlasLineages } from "../../lib/atlas/continuity/import";
import { LATAM_LINEAGE_ID } from "../../lib/atlas/continuity/latam";
import { NZ_LINEAGE_ID } from "../../lib/atlas/continuity/nz";
import { draftContinuityPacks } from "../../lib/atlas/continuity/approved";
import { LINEAGE_ID as ALBANIA_LINEAGE } from "../../lib/atlas/identity";
import { LINEAGE_ID as ALDERNEY_LINEAGE } from "../../lib/atlas/alderney/identity";
import { LINEAGE_ID as ANDORRA_LINEAGE } from "../../lib/atlas/andorra/identity";
import { LINEAGE_ID as ARMENIA_LINEAGE } from "../../lib/atlas/armenia/identity";
import { LINEAGE_ID as BELGIUM_LINEAGE } from "../../lib/atlas/belgium/identity";
import { LINEAGE_ID as BOSNIA_LINEAGE } from "../../lib/atlas/bosnia-and-herzegovina/identity";
import { LINEAGE_ID as BULGARIA_LINEAGE } from "../../lib/atlas/bulgaria/identity";
import { LINEAGE_ID as DENMARK_LINEAGE } from "../../lib/atlas/denmark/identity";

function fail(message: string): never {
  console.error(`test:atlas-import failed: ${message}`);
  process.exit(1);
}

function count(db: DatabaseSync, sql: string, params: unknown[] = []): number {
  return Number(db.prepare(sql).get(...params)?.n ?? 0);
}

function main() {
  delete process.env.OBSERVATORY_FIXTURES;
  const root = process.cwd();
  const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-ci-continuity-"));
  const sqlitePath = path.join(dir, "atlas.sqlite");
  const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
  console.log(`test:atlas-import sqlite=${sqlitePath}`);
  try {
    const result = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "all",
    );
    if (result.albania?.counts.current_offices !== 122) {
      fail(`Albania offices ${String(result.albania?.counts.current_offices)}`);
    }
    if (result.andorra?.counts.current_offices !== 7) {
      fail(`Andorra offices ${String(result.andorra?.counts.current_offices)}`);
    }
    if (result.andorra?.counts.regional_offices !== 0) {
      fail(`Andorra regional ${String(result.andorra?.counts.regional_offices)}`);
    }
    if (result.andorra?.counts.selected_histories !== 21) {
      fail(`Andorra events ${String(result.andorra?.counts.selected_histories)}`);
    }
    if (result.alderney?.counts.current_offices !== 2) {
      fail(`Alderney offices ${String(result.alderney?.counts.current_offices)}`);
    }
    if (result.alderney?.counts.other_offices !== 2) {
      fail(`Alderney other ${String(result.alderney?.counts.other_offices)}`);
    }
    if (result.alderney?.counts.regional_offices !== 0) {
      fail(`Alderney regional ${String(result.alderney?.counts.regional_offices)}`);
    }
    if (result.alderney?.counts.selected_histories !== 6) {
      fail(`Alderney events ${String(result.alderney?.counts.selected_histories)}`);
    }
    if (result.armenia?.counts.current_offices !== 71) {
      fail(`Armenia offices ${String(result.armenia?.counts.current_offices)}`);
    }
    if (result.armenia?.counts.municipal_offices !== 71) {
      fail(`Armenia municipal ${String(result.armenia?.counts.municipal_offices)}`);
    }
    if (result.armenia?.counts.regional_offices !== 0) {
      fail(`Armenia regional ${String(result.armenia?.counts.regional_offices)}`);
    }
    if (result.armenia?.counts.selected_histories !== 33) {
      fail(`Armenia events ${String(result.armenia?.counts.selected_histories)}`);
    }
    if (result.bosnia?.counts.current_offices !== 13) {
      fail(`Bosnia offices ${String(result.bosnia?.counts.current_offices)}`);
    }
    if (result.bosnia?.counts.regional_offices !== 13) {
      fail(`Bosnia regional ${String(result.bosnia?.counts.regional_offices)}`);
    }
    if (result.bosnia?.counts.municipal_offices !== 0) {
      fail(`Bosnia municipal ${String(result.bosnia?.counts.municipal_offices)}`);
    }
    if (result.bosnia?.counts.selected_histories !== 39) {
      fail(`Bosnia events ${String(result.bosnia?.counts.selected_histories)}`);
    }
    if (result.bosnia?.counts.approved_classifications !== 10) {
      fail(`Bosnia approved ${String(result.bosnia?.counts.approved_classifications)}`);
    }
    if (result.belgium?.counts.offices !== 1234) {
      fail(`Belgium offices ${String(result.belgium?.counts.offices)}`);
    }
    if (result.belgium?.counts.current_offices !== 1179) {
      fail(`Belgium current ${String(result.belgium?.counts.current_offices)}`);
    }
    if (result.belgium?.counts.historical_offices !== 55) {
      fail(`Belgium historical ${String(result.belgium?.counts.historical_offices)}`);
    }
    if (result.belgium?.counts.municipal_offices !== 1185) {
      fail(`Belgium municipal ${String(result.belgium?.counts.municipal_offices)}`);
    }
    if (result.belgium?.counts.regional_offices !== 15) {
      fail(`Belgium regional ${String(result.belgium?.counts.regional_offices)}`);
    }
    if (result.belgium?.counts.national_offices !== 2) {
      fail(`Belgium national ${String(result.belgium?.counts.national_offices)}`);
    }
    if (result.belgium?.counts.total_events !== 1772) {
      fail(`Belgium events ${String(result.belgium?.counts.total_events)}`);
    }
    if (result.belgium?.counts.result_rows !== 9238) {
      fail(`Belgium results ${String(result.belgium?.counts.result_rows)}`);
    }
    if (result.belgium?.counts.prospective_events !== 0) {
      fail(`Belgium prospective ${String(result.belgium?.counts.prospective_events)}`);
    }
    if (result.bosnia?.counts.needs_review_classifications !== 3) {
      fail(`Bosnia needs_review ${String(result.bosnia?.counts.needs_review_classifications)}`);
    }
    if (result.bulgaria?.counts.current_offices !== 530) {
      fail(`Bulgaria offices ${String(result.bulgaria?.counts.current_offices)}`);
    }
    if (result.bulgaria?.counts.municipal_offices !== 530) {
      fail(`Bulgaria municipal ${String(result.bulgaria?.counts.municipal_offices)}`);
    }
    if (result.bulgaria?.counts.regional_offices !== 0) {
      fail(`Bulgaria regional ${String(result.bulgaria?.counts.regional_offices)}`);
    }
    if (result.bulgaria?.counts.held_offices !== 3067) {
      fail(`Bulgaria held ${String(result.bulgaria?.counts.held_offices)}`);
    }
    if (result.bulgaria?.counts.selected_histories !== 1590) {
      fail(`Bulgaria events ${String(result.bulgaria?.counts.selected_histories)}`);
    }
    if (result.denmark?.counts.offices !== 346) {
      fail(`Denmark offices ${String(result.denmark?.counts.offices)}`);
    }
    if (result.denmark?.counts.current_offices !== 106) {
      fail(`Denmark current ${String(result.denmark?.counts.current_offices)}`);
    }
    if (result.denmark?.counts.historical_offices !== 240) {
      fail(`Denmark historical ${String(result.denmark?.counts.historical_offices)}`);
    }
    if (result.denmark?.counts.municipal_offices !== 324) {
      fail(`Denmark municipal ${String(result.denmark?.counts.municipal_offices)}`);
    }
    if (result.denmark?.counts.regional_offices !== 20) {
      fail(`Denmark regional ${String(result.denmark?.counts.regional_offices)}`);
    }
    if (result.denmark?.counts.result_rows !== 25391) {
      fail(`Denmark results ${String(result.denmark?.counts.result_rows)}`);
    }
    if (result.denmark?.counts.prospective_events !== 0) {
      fail(`Denmark prospective ${String(result.denmark?.counts.prospective_events)}`);
    }
    if (result.latam?.counts.offices !== 10227) fail(`LatAm offices ${String(result.latam?.counts.offices)}`);
    if (result.nz?.counts.offices !== 4) fail(`NZ offices ${String(result.nz?.counts.offices)}`);
    if (result.nz?.counts.events !== 7) fail(`NZ events ${String(result.nz?.counts.events)}`);
    if (result.nz?.counts.result_rows !== 36) fail(`NZ results ${String(result.nz?.counts.result_rows)}`);

    const expectedDrafts = draftContinuityPacks(root)
      .filter((pack) => pack.lineageId === LATAM_LINEAGE_ID)
      .map((pack) => pack.countryId)
      .sort();
    const skipped = result.latam?.skippedDraftCountries ?? [];
    if (JSON.stringify(skipped) !== JSON.stringify(expectedDrafts)) {
      fail(`skipped drafts ${skipped.join(",")} != ${expectedDrafts.join(",")}`);
    }

    const db = new DatabaseSync(sqlitePath, { readOnly: true });
    try {
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [ALBANIA_LINEAGE]) !== 122) {
        fail("Albania office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [ANDORRA_LINEAGE]) !== 7) {
        fail("Andorra office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [ALDERNEY_LINEAGE]) !== 2) {
        fail("Alderney office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [ARMENIA_LINEAGE]) !== 71) {
        fail("Armenia office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [BELGIUM_LINEAGE]) !== 1234) {
        fail("Belgium office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [BELGIUM_LINEAGE]) !==
        55
      ) {
        fail("Belgium historical office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [BOSNIA_LINEAGE]) !== 13) {
        fail("Bosnia office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [BULGARIA_LINEAGE]) !== 530) {
        fail("Bulgaria office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [DENMARK_LINEAGE]) !== 346) {
        fail("Denmark office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [DENMARK_LINEAGE]) !==
        240
      ) {
        fail("Denmark historical office rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [DENMARK_LINEAGE],
        ) !== 20
      ) {
        fail("Denmark regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (office_id LIKE '%-M' OR office_type LIKE '%mayor%' OR name LIKE '%Inatsisartut%' OR name LIKE '%Løgting%')",
          [DENMARK_LINEAGE],
        ) !== 0
      ) {
        fail("Denmark invented mayor or Realm offices");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [BULGARIA_LINEAGE],
        ) !== 0
      ) {
        fail("Bulgaria regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id = 'BG-SLV11-b88d0d4475-V'",
          [BULGARIA_LINEAGE],
        ) !== 0
      ) {
        fail("Градец held office published");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [ANDORRA_LINEAGE],
        ) !== 0
      ) {
        fail("Andorra regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [ALDERNEY_LINEAGE],
        ) !== 0
      ) {
        fail("Alderney regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [ARMENIA_LINEAGE],
        ) !== 0
      ) {
        fail("Armenia regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'municipal'",
          [ARMENIA_LINEAGE],
        ) !== 71
      ) {
        fail("Armenia municipal rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [BELGIUM_LINEAGE],
        ) !== 15
      ) {
        fail("Belgium regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'national_context'",
          [BELGIUM_LINEAGE],
        ) !== 2
      ) {
        fail("Belgium national rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [BOSNIA_LINEAGE],
        ) !== 13
      ) {
        fail("Bosnia regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'municipal'",
          [BOSNIA_LINEAGE],
        ) !== 0
      ) {
        fail("Bosnia municipal rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND review_status = 'approved'",
          [BOSNIA_LINEAGE],
        ) !== 10
      ) {
        fail("Bosnia approved classification rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND review_status = 'needs_review'",
          [BOSNIA_LINEAGE],
        ) !== 3
      ) {
        fail("Bosnia needs_review classification rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (office_id LIKE '%BRC%' OR name LIKE '%Brčko%' OR name LIKE '%Brcko%')",
          [BOSNIA_LINEAGE],
        ) !== 0
      ) {
        fail("Bosnia invented Brčko office");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM research_date WHERE lineage_id = ? AND certainty = 'conditional'",
          [ALDERNEY_LINEAGE],
        ) !== 2
      ) {
        fail("Alderney conditional dates");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [LATAM_LINEAGE_ID]) !== 10227) {
        fail("LatAm office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [NZ_LINEAGE_ID]) !== 4) {
        fail("NZ office rows");
      }
      const approved = [
        "argentina",
        "bahamas",
        "belize",
        "brazil",
        "colombia",
        "cuba",
        "dominica",
        "dominican-republic",
        "el-salvador",
        "guatemala",
        "jamaica",
        "mexico",
        "paraguay",
      ];
      for (const country of approved) {
        const n = count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND country_id = ?",
          [LATAM_LINEAGE_ID, country],
        );
        if (n <= 0) fail(`no offices for approved ${country}`);
      }
      for (const pack of skipped) {
        const n = count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND country_id = ?",
          [LATAM_LINEAGE_ID, pack],
        );
        if (n !== 0) fail(`draft pack ${pack} imported offices`);
      }
      if (
        count(
          db,
          `SELECT COUNT(*) AS n FROM result_row
           WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NULL AND share_status = 'unknown' AND evidence_status = 'disputed'`,
          [LATAM_LINEAGE_ID],
        ) !== 67
      ) {
        fail("Mexico withhold count");
      }
      if (
        count(
          db,
          `SELECT COUNT(*) AS n FROM result_row
           WHERE lineage_id = ? AND country_id = 'mexico' AND share IS NOT NULL AND share > 100`,
          [LATAM_LINEAGE_ID],
        ) !== 0
      ) {
        fail("Mexico share>100 survived");
      }
      const lineages = db
        .prepare("SELECT lineage_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => String(row.lineage_id));
      const expectedLineages = [
        ALBANIA_LINEAGE,
        ALDERNEY_LINEAGE,
        ANDORRA_LINEAGE,
        ARMENIA_LINEAGE,
        BELGIUM_LINEAGE,
        BOSNIA_LINEAGE,
        BULGARIA_LINEAGE,
        DENMARK_LINEAGE,
        NZ_LINEAGE_ID,
        LATAM_LINEAGE_ID,
      ].sort();
      if (JSON.stringify(lineages) !== JSON.stringify(expectedLineages)) {
        fail(`publication_release ${lineages.join(",")}`);
      }
    } finally {
      db.close();
    }
    console.log("test:atlas-import ok");
    console.log(
      `loaded albania=122 andorra=7 alderney=2 armenia=71 belgium=1234 bosnia=13 bulgaria=530 denmark=346 latam=10227 nz=4 skipped_drafts=${skipped.length} mexico_withholds=67`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
