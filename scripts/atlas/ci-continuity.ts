#!/usr/bin/env npx tsx
/**
 * CI proof: import Albania + Andorra + Alderney + Armenia + Austria + Belgium + Bosnia and Herzegovina + Bulgaria + Netherlands + Switzerland + Denmark + Sweden + Finland + Norway + Ireland + Poland + Czechia + Croatia + Portugal + Spain + Estonia + approved continuity packs (Batch A+B + ES/AR) into a temp SQLite.
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
import { LINEAGE_ID as AUSTRIA_LINEAGE } from "../../lib/atlas/austria/identity";
import { LINEAGE_ID as BELGIUM_LINEAGE } from "../../lib/atlas/belgium/identity";
import { LINEAGE_ID as BOSNIA_LINEAGE } from "../../lib/atlas/bosnia-and-herzegovina/identity";
import { LINEAGE_ID as BULGARIA_LINEAGE } from "../../lib/atlas/bulgaria/identity";
import { LINEAGE_ID as CROATIA_LINEAGE } from "../../lib/atlas/croatia/identity";
import { LINEAGE_ID as CZECHIA_LINEAGE } from "../../lib/atlas/czechia/identity";
import { LINEAGE_ID as DENMARK_LINEAGE } from "../../lib/atlas/denmark/identity";
import { LINEAGE_ID as ESTONIA_LINEAGE } from "../../lib/atlas/estonia/identity";
import { LINEAGE_ID as FINLAND_LINEAGE } from "../../lib/atlas/finland/identity";
import { LINEAGE_ID as IRELAND_LINEAGE } from "../../lib/atlas/ireland/identity";
import { LINEAGE_ID as POLAND_LINEAGE } from "../../lib/atlas/poland/identity";
import { LINEAGE_ID as PORTUGAL_LINEAGE } from "../../lib/atlas/portugal/identity";
import { LINEAGE_ID as NETHERLANDS_LINEAGE } from "../../lib/atlas/netherlands/identity";
import { LINEAGE_ID as SWEDEN_LINEAGE } from "../../lib/atlas/sweden/identity";
import { LINEAGE_ID as NORWAY_LINEAGE } from "../../lib/atlas/norway/identity";
import { LINEAGE_ID as SPAIN_LINEAGE } from "../../lib/atlas/spain/identity";
import { LINEAGE_ID as SWITZERLAND_LINEAGE } from "../../lib/atlas/switzerland/identity";

function fail(message: string): never {
  console.error(`test:atlas-import failed: ${message}`);
  process.exit(1);
}

function count(db: DatabaseSync, sql: string, params: unknown[] = []): number {
  return Number(db.prepare(sql).get(...params)?.n ?? 0);
}

function main() {
  delete process.env.OBSERVATORY_FIXTURES;
  process.env.ATLAS_IMPORT_PROGRESS = "1";
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
    if (result.austria?.counts.current_offices !== 2038) {
      fail(`Austria offices ${String(result.austria?.counts.current_offices)}`);
    }
    if (result.austria?.counts.municipal_offices !== 2034) {
      fail(`Austria municipal ${String(result.austria?.counts.municipal_offices)}`);
    }
    if (result.austria?.counts.regional_offices !== 4) {
      fail(`Austria regional ${String(result.austria?.counts.regional_offices)}`);
    }
    if (result.austria?.counts.selected_histories !== 5956) {
      fail(`Austria events ${String(result.austria?.counts.selected_histories)}`);
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
    if (result.netherlands?.counts.offices !== 501) {
      fail(`Netherlands offices ${String(result.netherlands?.counts.offices)}`);
    }
    if (result.netherlands?.counts.current_offices !== 432) {
      fail(`Netherlands current ${String(result.netherlands?.counts.current_offices)}`);
    }
    if (result.netherlands?.counts.historical_offices !== 69) {
      fail(`Netherlands historical ${String(result.netherlands?.counts.historical_offices)}`);
    }
    if (result.netherlands?.counts.municipal_offices !== 414) {
      fail(`Netherlands municipal ${String(result.netherlands?.counts.municipal_offices)}`);
    }
    if (result.netherlands?.counts.regional_offices !== 12) {
      fail(`Netherlands regional ${String(result.netherlands?.counts.regional_offices)}`);
    }
    if (result.netherlands?.counts.national_offices !== 3) {
      fail(`Netherlands national ${String(result.netherlands?.counts.national_offices)}`);
    }
    if (result.netherlands?.counts.other_offices !== 72) {
      fail(`Netherlands other ${String(result.netherlands?.counts.other_offices)}`);
    }
    if (result.netherlands?.counts.total_events !== 1475) {
      fail(`Netherlands events ${String(result.netherlands?.counts.total_events)}`);
    }
    if (result.netherlands?.counts.result_rows !== 13050) {
      fail(`Netherlands results ${String(result.netherlands?.counts.result_rows)}`);
    }
    if (result.netherlands?.counts.prospective_events !== 0) {
      fail(`Netherlands prospective ${String(result.netherlands?.counts.prospective_events)}`);
    }
    if (result.netherlands?.counts.needs_review_classifications !== 147) {
      fail(`Netherlands needs_review ${String(result.netherlands?.counts.needs_review_classifications)}`);
    }
    if (result.switzerland?.counts.offices !== 2816) {
      fail(`Switzerland offices ${String(result.switzerland?.counts.offices)}`);
    }
    if (result.switzerland?.counts.current_offices !== 2805) {
      fail(`Switzerland current ${String(result.switzerland?.counts.current_offices)}`);
    }
    if (result.switzerland?.counts.historical_offices !== 11) {
      fail(`Switzerland historical ${String(result.switzerland?.counts.historical_offices)}`);
    }
    if (result.switzerland?.counts.municipal_offices !== 2402) {
      fail(`Switzerland municipal ${String(result.switzerland?.counts.municipal_offices)}`);
    }
    if (result.switzerland?.counts.regional_offices !== 52) {
      fail(`Switzerland regional ${String(result.switzerland?.counts.regional_offices)}`);
    }
    if (result.switzerland?.counts.national_offices !== 2) {
      fail(`Switzerland national ${String(result.switzerland?.counts.national_offices)}`);
    }
    if (result.switzerland?.counts.held_commune_executive_gaps !== 308) {
      fail(`Switzerland held executives ${String(result.switzerland?.counts.held_commune_executive_gaps)}`);
    }
    if (result.switzerland?.counts.result_rows !== 8094) {
      fail(`Switzerland results ${String(result.switzerland?.counts.result_rows)}`);
    }
    if (result.switzerland?.counts.prospective_events !== 0) {
      fail(`Switzerland prospective ${String(result.switzerland?.counts.prospective_events)}`);
    }
    if (result.ireland?.counts.offices !== 122) {
      fail(`Ireland offices ${String(result.ireland?.counts.offices)}`);
    }
    if (result.ireland?.counts.current_offices !== 36) {
      fail(`Ireland current ${String(result.ireland?.counts.current_offices)}`);
    }
    if (result.ireland?.counts.historical_offices !== 86) {
      fail(`Ireland historical ${String(result.ireland?.counts.historical_offices)}`);
    }
    if (result.ireland?.counts.municipal_offices !== 118) {
      fail(`Ireland municipal ${String(result.ireland?.counts.municipal_offices)}`);
    }
    if (result.ireland?.counts.regional_offices !== 0) {
      fail(`Ireland regional ${String(result.ireland?.counts.regional_offices)}`);
    }
    if (result.ireland?.counts.result_rows !== 7254) {
      fail(`Ireland results ${String(result.ireland?.counts.result_rows)}`);
    }
    if (result.ireland?.counts.prospective_events !== 0) {
      fail(`Ireland prospective ${String(result.ireland?.counts.prospective_events)}`);
    }
    if (result.ireland?.counts.unresolved_evidence !== 9) {
      fail(`Ireland unresolved ${String(result.ireland?.counts.unresolved_evidence)}`);
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
    if (result.sweden?.counts.offices !== 320) {
      fail(`Sweden offices ${String(result.sweden?.counts.offices)}`);
    }
    if (result.sweden?.counts.current_offices !== 313) {
      fail(`Sweden current ${String(result.sweden?.counts.current_offices)}`);
    }
    if (result.sweden?.counts.historical_offices !== 7) {
      fail(`Sweden historical ${String(result.sweden?.counts.historical_offices)}`);
    }
    if (result.sweden?.counts.municipal_offices !== 292) {
      fail(`Sweden municipal ${String(result.sweden?.counts.municipal_offices)}`);
    }
    if (result.sweden?.counts.regional_offices !== 25) {
      fail(`Sweden regional ${String(result.sweden?.counts.regional_offices)}`);
    }
    if (result.sweden?.counts.result_rows !== 40991) {
      fail(`Sweden results ${String(result.sweden?.counts.result_rows)}`);
    }
    if (result.sweden?.counts.prospective_events !== 310) {
      fail(`Sweden prospective ${String(result.sweden?.counts.prospective_events)}`);
    }
    if (result.sweden?.counts.unresolved_evidence !== 7) {
      fail(`Sweden unresolved ${String(result.sweden?.counts.unresolved_evidence)}`);
    }
    if (result.finland?.counts.offices !== 503) {
      fail(`Finland offices ${String(result.finland?.counts.offices)}`);
    }
    if (result.finland?.counts.current_offices !== 333) {
      fail(`Finland current ${String(result.finland?.counts.current_offices)}`);
    }
    if (result.finland?.counts.historical_offices !== 170) {
      fail(`Finland historical ${String(result.finland?.counts.historical_offices)}`);
    }
    if (result.finland?.counts.municipal_offices !== 478) {
      fail(`Finland municipal ${String(result.finland?.counts.municipal_offices)}`);
    }
    if (result.finland?.counts.regional_offices !== 22) {
      fail(`Finland regional ${String(result.finland?.counts.regional_offices)}`);
    }
    if (result.finland?.counts.result_rows !== 37471) {
      fail(`Finland results ${String(result.finland?.counts.result_rows)}`);
    }
    if (result.finland?.counts.proceedings !== 11) {
      fail(`Finland proceedings ${String(result.finland?.counts.proceedings)}`);
    }
    if (result.finland?.counts.prospective_events !== 0) {
      fail(`Finland prospective ${String(result.finland?.counts.prospective_events)}`);
    }
    if (result.finland?.counts.unresolved_evidence !== 7) {
      fail(`Finland unresolved ${String(result.finland?.counts.unresolved_evidence)}`);
    }
    if (result.norway?.counts.offices !== 926) {
      fail(`Norway offices ${String(result.norway?.counts.offices)}`);
    }
    if (result.norway?.counts.current_offices !== 389) {
      fail(`Norway current ${String(result.norway?.counts.current_offices)}`);
    }
    if (result.norway?.counts.historical_offices !== 537) {
      fail(`Norway historical ${String(result.norway?.counts.historical_offices)}`);
    }
    if (result.norway?.counts.municipal_offices !== 876) {
      fail(`Norway municipal ${String(result.norway?.counts.municipal_offices)}`);
    }
    if (result.norway?.counts.regional_offices !== 32) {
      fail(`Norway regional ${String(result.norway?.counts.regional_offices)}`);
    }
    if (result.norway?.counts.result_rows !== 59033) {
      fail(`Norway results ${String(result.norway?.counts.result_rows)}`);
    }
    if (result.norway?.counts.prospective_events !== 0) {
      fail(`Norway prospective ${String(result.norway?.counts.prospective_events)}`);
    }
    if (result.norway?.counts.unresolved_evidence !== 9) {
      fail(`Norway unresolved ${String(result.norway?.counts.unresolved_evidence)}`);
    }
    if (result.poland?.counts.offices !== 5312) {
      fail(`Poland offices ${String(result.poland?.counts.offices)}`);
    }
    if (result.poland?.counts.current_offices !== 5310) {
      fail(`Poland current ${String(result.poland?.counts.current_offices)}`);
    }
    if (result.poland?.counts.historical_offices !== 2) {
      fail(`Poland historical ${String(result.poland?.counts.historical_offices)}`);
    }
    if (result.poland?.counts.municipal_offices !== 4960) {
      fail(`Poland municipal ${String(result.poland?.counts.municipal_offices)}`);
    }
    if (result.poland?.counts.regional_offices !== 330) {
      fail(`Poland regional ${String(result.poland?.counts.regional_offices)}`);
    }
    if (result.poland?.counts.powiat_councils !== 314) {
      fail(`Poland powiat ${String(result.poland?.counts.powiat_councils)}`);
    }
    if (result.poland?.counts.result_rows !== 0) {
      fail(`Poland results ${String(result.poland?.counts.result_rows)}`);
    }
    if (result.poland?.counts.prospective_events !== 56) {
      fail(`Poland prospective ${String(result.poland?.counts.prospective_events)}`);
    }
    if (result.czechia?.counts.offices !== 6424) {
      fail(`Czechia offices ${String(result.czechia?.counts.offices)}`);
    }
    if (result.czechia?.counts.current_offices !== 6411) {
      fail(`Czechia current ${String(result.czechia?.counts.current_offices)}`);
    }
    if (result.czechia?.counts.historical_offices !== 13) {
      fail(`Czechia historical ${String(result.czechia?.counts.historical_offices)}`);
    }
    if (result.czechia?.counts.municipal_offices !== 6257) {
      fail(`Czechia municipal ${String(result.czechia?.counts.municipal_offices)}`);
    }
    if (result.czechia?.counts.regional_offices !== 14) {
      fail(`Czechia regional ${String(result.czechia?.counts.regional_offices)}`);
    }
    if (result.czechia?.counts.national_offices !== 3) {
      fail(`Czechia national ${String(result.czechia?.counts.national_offices)}`);
    }
    if (result.czechia?.counts.other_offices !== 150) {
      fail(`Czechia other ${String(result.czechia?.counts.other_offices)}`);
    }
    if (result.czechia?.counts.result_rows !== 0) {
      fail(`Czechia results ${String(result.czechia?.counts.result_rows)}`);
    }
    if (result.czechia?.counts.prospective_events !== 6421) {
      fail(`Czechia prospective ${String(result.czechia?.counts.prospective_events)}`);
    }
    if (result.czechia?.counts.unresolved_evidence !== 10) {
      fail(`Czechia unresolved ${String(result.czechia?.counts.unresolved_evidence)}`);
    }
    if (result.czechia?.counts.proceedings !== 934) {
      fail(`Czechia proceedings ${String(result.czechia?.counts.proceedings)}`);
    }
    if (result.croatia?.counts.offices !== 1245) {
      fail(`Croatia offices ${String(result.croatia?.counts.offices)}`);
    }
    if (result.croatia?.counts.current_offices !== 1234) {
      fail(`Croatia current ${String(result.croatia?.counts.current_offices)}`);
    }
    if (result.croatia?.counts.historical_offices !== 11) {
      fail(`Croatia historical ${String(result.croatia?.counts.historical_offices)}`);
    }
    if (result.croatia?.counts.municipal_offices !== 1187) {
      fail(`Croatia municipal ${String(result.croatia?.counts.municipal_offices)}`);
    }
    if (result.croatia?.counts.regional_offices !== 55) {
      fail(`Croatia regional ${String(result.croatia?.counts.regional_offices)}`);
    }
    if (result.croatia?.counts.result_rows !== 15907) {
      fail(`Croatia results ${String(result.croatia?.counts.result_rows)}`);
    }
    if (result.croatia?.counts.proceedings !== 2418) {
      fail(`Croatia proceedings ${String(result.croatia?.counts.proceedings)}`);
    }
    if (result.croatia?.counts.prospective_events !== 0) {
      fail(`Croatia prospective ${String(result.croatia?.counts.prospective_events)}`);
    }
    if (result.croatia?.counts.unresolved_evidence !== 13) {
      fail(`Croatia unresolved ${String(result.croatia?.counts.unresolved_evidence)}`);
    }
    if (result.portugal?.counts.offices !== 18834) {
      fail(`Portugal offices ${String(result.portugal?.counts.offices)}`);
    }
    if (result.portugal?.counts.current_offices !== 10666) {
      fail(`Portugal current ${String(result.portugal?.counts.current_offices)}`);
    }
    if (result.portugal?.counts.historical_offices !== 8168) {
      fail(`Portugal historical ${String(result.portugal?.counts.historical_offices)}`);
    }
    if (result.portugal?.counts.municipal_offices !== 927) {
      fail(`Portugal municipal ${String(result.portugal?.counts.municipal_offices)}`);
    }
    if (result.portugal?.counts.regional_offices !== 2) {
      fail(`Portugal regional ${String(result.portugal?.counts.regional_offices)}`);
    }
    if (result.portugal?.counts.other_offices !== 17903) {
      fail(`Portugal other ${String(result.portugal?.counts.other_offices)}`);
    }
    if (result.portugal?.counts.result_rows !== 66283) {
      fail(`Portugal results ${String(result.portugal?.counts.result_rows)}`);
    }
    if (result.portugal?.counts.proceedings !== 2) {
      fail(`Portugal proceedings ${String(result.portugal?.counts.proceedings)}`);
    }
    if (result.portugal?.counts.prospective_events !== 0) {
      fail(`Portugal prospective ${String(result.portugal?.counts.prospective_events)}`);
    }
    if (result.portugal?.counts.unresolved_evidence !== 347) {
      fail(`Portugal unresolved ${String(result.portugal?.counts.unresolved_evidence)}`);
    }
    if (result.portugal?.counts.list_head_events !== 0) {
      fail(`Portugal list-head events ${String(result.portugal?.counts.list_head_events)}`);
    }
    if (result.spain?.counts.offices !== 8208) {
      fail(`Spain offices ${String(result.spain?.counts.offices)}`);
    }
    if (result.spain?.counts.current_offices !== 8204) {
      fail(`Spain current ${String(result.spain?.counts.current_offices)}`);
    }
    if (result.spain?.counts.historical_offices !== 4) {
      fail(`Spain historical ${String(result.spain?.counts.historical_offices)}`);
    }
    if (result.spain?.counts.municipal_offices !== 8133) {
      fail(`Spain municipal ${String(result.spain?.counts.municipal_offices)}`);
    }
    if (result.spain?.counts.regional_offices !== 68) {
      fail(`Spain regional ${String(result.spain?.counts.regional_offices)}`);
    }
    if (result.spain?.counts.result_rows !== 0) {
      fail(`Spain results ${String(result.spain?.counts.result_rows)}`);
    }
    if (result.spain?.counts.proceedings !== 0) {
      fail(`Spain proceedings ${String(result.spain?.counts.proceedings)}`);
    }
    if (result.spain?.counts.prospective_events !== 0) {
      fail(`Spain prospective ${String(result.spain?.counts.prospective_events)}`);
    }
    if (result.spain?.counts.unresolved_evidence !== 12) {
      fail(`Spain unresolved ${String(result.spain?.counts.unresolved_evidence)}`);
    }
    if (result.spain?.counts.provincial_councils !== 38) {
      fail(`Spain diputaciones ${String(result.spain?.counts.provincial_councils)}`);
    }
    if (result.spain?.counts.diputacion_events !== 0) {
      fail(`Spain diputacion events ${String(result.spain?.counts.diputacion_events)}`);
    }
    if (result.estonia?.counts.offices !== 281) {
      fail(`Estonia offices ${String(result.estonia?.counts.offices)}`);
    }
    if (result.estonia?.counts.current_offices !== 81) {
      fail(`Estonia current ${String(result.estonia?.counts.current_offices)}`);
    }
    if (result.estonia?.counts.historical_offices !== 200) {
      fail(`Estonia historical ${String(result.estonia?.counts.historical_offices)}`);
    }
    if (result.estonia?.counts.municipal_offices !== 278) {
      fail(`Estonia municipal ${String(result.estonia?.counts.municipal_offices)}`);
    }
    if (result.estonia?.counts.regional_offices !== 0) {
      fail(`Estonia regional ${String(result.estonia?.counts.regional_offices)}`);
    }
    if (result.estonia?.counts.current_councils !== 78) {
      fail(`Estonia councils ${String(result.estonia?.counts.current_councils)}`);
    }
    if (result.estonia?.counts.current_direct_executive_offices !== 0) {
      fail(`Estonia direct executives ${String(result.estonia?.counts.current_direct_executive_offices)}`);
    }
    if (result.estonia?.counts.result_rows !== 0) {
      fail(`Estonia results ${String(result.estonia?.counts.result_rows)}`);
    }
    if (result.estonia?.counts.proceedings !== 24) {
      fail(`Estonia proceedings ${String(result.estonia?.counts.proceedings)}`);
    }
    if (result.estonia?.counts.prospective_events !== 0) {
      fail(`Estonia prospective ${String(result.estonia?.counts.prospective_events)}`);
    }
    if (result.estonia?.counts.unresolved_evidence !== 9) {
      fail(`Estonia unresolved ${String(result.estonia?.counts.unresolved_evidence)}`);
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
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [AUSTRIA_LINEAGE]) !== 2038) {
        fail("Austria office rows");
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
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [NETHERLANDS_LINEAGE]) !== 501) {
        fail("Netherlands office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [NETHERLANDS_LINEAGE]) !==
        69
      ) {
        fail("Netherlands historical office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [SWITZERLAND_LINEAGE]) !== 2816) {
        fail("Switzerland office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [SWITZERLAND_LINEAGE]) !==
        11
      ) {
        fail("Switzerland historical office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [IRELAND_LINEAGE]) !== 122) {
        fail("Ireland office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [IRELAND_LINEAGE]) !==
        86
      ) {
        fail("Ireland historical office rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [IRELAND_LINEAGE],
        ) !== 0
      ) {
        fail("Ireland regional rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ? AND office_id = 'IE-EP'", [IRELAND_LINEAGE]) !== 0) {
        fail("Ireland invented EP results");
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
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [NORWAY_LINEAGE]) !== 926) {
        fail("Norway office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [NORWAY_LINEAGE]) !==
        537
      ) {
        fail("Norway historical office rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id IN ('CH-GM1311-E','CH-GM5402-E')",
          [SWITZERLAND_LINEAGE],
        ) !== 0
      ) {
        fail("Switzerland invented held commune executives");
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
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [SWEDEN_LINEAGE]) !== 320) {
        fail("Sweden office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [SWEDEN_LINEAGE]) !==
        7
      ) {
        fail("Sweden historical office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [FINLAND_LINEAGE]) !== 503) {
        fail("Finland office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [FINLAND_LINEAGE]) !==
        170
      ) {
        fail("Finland historical office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [POLAND_LINEAGE]) !== 5312) {
        fail("Poland office rows");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?", [SPAIN_LINEAGE]) !== 8208) {
        fail("Spain office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_status = 'historical'", [SPAIN_LINEAGE]) !==
        4
      ) {
        fail("Spain historical office rows");
      }
      if (
        count(db, "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id IN ('ES-I071-COUNCIL','ES-P31-DIP')", [
          SPAIN_LINEAGE,
        ]) !== 0
      ) {
        fail("Spain invented Formentera island duplicate or Navarra diputacion");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type != 'concejo_abierto_alcalde' AND (office_type LIKE '%mayor%' OR office_type LIKE '%alcalde%' OR office_type LIKE '%president%' OR office_type LIKE '%premier%' OR office_id LIKE '%-MAYOR')",
          [SPAIN_LINEAGE],
        ) !== 0
      ) {
        fail("Spain invented executive offices");
      }
      if (
        count(
          db,
          `SELECT COUNT(*) AS n FROM election_event e JOIN office o USING (id_namespace, office_id)
           WHERE e.lineage_id = ? AND o.office_type = 'provincial_council'`,
          [SPAIN_LINEAGE],
        ) !== 0
      ) {
        fail("Spain diputacion events");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?", [SPAIN_LINEAGE]) !== 0) {
        fail("Spain result rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [SWEDEN_LINEAGE],
        ) !== 25
      ) {
        fail("Sweden regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'",
          [FINLAND_LINEAGE],
        ) !== 22
      ) {
        fail("Finland regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (office_id LIKE '%-M' OR office_type LIKE '%kommunalråd%' OR office_type LIKE '%mayor%')",
          [SWEDEN_LINEAGE],
        ) !== 0
      ) {
        fail("Sweden invented mayor/executive offices");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND (office_id LIKE '%-M' OR office_type LIKE '%mayor%' OR office_type LIKE '%kaupunginjohtaja%')",
          [FINLAND_LINEAGE],
        ) !== 0
      ) {
        fail("Finland invented mayor/executive offices");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_id != 'SE-K0980-C' AND name LIKE '%Gotland%'",
          [SWEDEN_LINEAGE],
        ) !== 0
      ) {
        fail("Sweden invented second Gotland office");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office WHERE lineage_id = ? AND office_type = 'wellbeing_county_council' AND name LIKE '%Helsinki%'",
          [FINLAND_LINEAGE],
        ) !== 0
      ) {
        fail("Finland invented Helsinki county office");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM proceeding WHERE lineage_id = ? AND history_key LIKE '%::2018::%' AND kind = 'runoff'",
          [FINLAND_LINEAGE],
        ) !== 0
      ) {
        fail("Finland invented 2018 presidential runoff");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office o JOIN office_tier_classification t USING (id_namespace, office_id) WHERE o.lineage_id = ? AND o.office_type = 'county_council' AND t.tier = 'regional'",
          [POLAND_LINEAGE],
        ) !== 314
      ) {
        fail("Poland powiat rows were reclassified");
      }
      if (count(db, "SELECT COUNT(*) AS n FROM result_row WHERE lineage_id = ?", [POLAND_LINEAGE]) !== 0) {
        fail("Poland invented result rows");
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
          [AUSTRIA_LINEAGE],
        ) !== 4
      ) {
        fail("Austria regional rows");
      }
      if (
        count(
          db,
          "SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'municipal'",
          [AUSTRIA_LINEAGE],
        ) !== 2034
      ) {
        fail("Austria municipal rows");
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
        AUSTRIA_LINEAGE,
        BELGIUM_LINEAGE,
        BOSNIA_LINEAGE,
        BULGARIA_LINEAGE,
        CROATIA_LINEAGE,
        DENMARK_LINEAGE,
        ESTONIA_LINEAGE,
        FINLAND_LINEAGE,
        IRELAND_LINEAGE,
        NETHERLANDS_LINEAGE,
        NORWAY_LINEAGE,
        POLAND_LINEAGE,
        PORTUGAL_LINEAGE,
        CZECHIA_LINEAGE,
        SWEDEN_LINEAGE,
        SWITZERLAND_LINEAGE,
        SPAIN_LINEAGE,
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
      `loaded albania=122 andorra=7 alderney=2 armenia=71 austria=2038 belgium=1234 bosnia=13 bulgaria=530 netherlands=501 switzerland=2816 denmark=346 sweden=320 finland=503 norway=926 ireland=122 poland=5312 czechia=6424 croatia=1245 portugal=18834 spain=8208 estonia=281 latam=10227 nz=4 skipped_drafts=${skipped.length} mexico_withholds=67`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
