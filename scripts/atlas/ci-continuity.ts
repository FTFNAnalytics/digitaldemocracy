#!/usr/bin/env npx tsx
/**
 * CI proof: import Albania + Andorra + Alderney + Armenia + Austria + Belgium + Bosnia and Herzegovina + Bulgaria + Netherlands + Switzerland + Denmark + Sweden + Finland + Norway + Ireland + Poland + Czechia + Croatia + Portugal + Spain + Estonia + approved continuity packs (Batch A+B + ES/AR) into a temp SQLite.
 * Latvia, Lithuania, Hungary, Romania, Greece, Luxembourg, Malta, Cyprus, France, Germany, the United Kingdom, and Italy are not part of `all`. Lithuania is then imported with scope `lithuania`, then Romania with scope `romania`, then Greece with scope `greece`, then Luxembourg with scope `luxembourg`, then Malta with scope `malta`, then Cyprus with scope `cyprus`, then France with scope `france`, then Germany with scope `germany`, then the United Kingdom with scope `united_kingdom`, then Italy with scope `italy`, into the same database.
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
import { LINEAGE_ID as LITHUANIA_LINEAGE } from "../../lib/atlas/lithuania/identity";
import { LINEAGE_ID as GREECE_LINEAGE } from "../../lib/atlas/greece/identity";
import { LINEAGE_ID as LUXEMBOURG_LINEAGE } from "../../lib/atlas/luxembourg/identity";
import { LINEAGE_ID as CYPRUS_LINEAGE } from "../../lib/atlas/cyprus/identity";
import { LINEAGE_ID as FRANCE_LINEAGE } from "../../lib/atlas/france/identity";
import { LINEAGE_ID as GERMANY_LINEAGE } from "../../lib/atlas/germany/identity";
import { LINEAGE_ID as UNITED_KINGDOM_LINEAGE } from "../../lib/atlas/united-kingdom/identity";
import { LINEAGE_ID as ITALY_LINEAGE } from "../../lib/atlas/italy/identity";
import { LINEAGE_ID as MALTA_LINEAGE } from "../../lib/atlas/malta/identity";
import { LINEAGE_ID as ROMANIA_LINEAGE } from "../../lib/atlas/romania/identity";
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
    if (result.hungary) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Hungary path");
    }
    if (result.romania) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Romania path");
    }
    if (result.greece) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Greece path");
    }
    if (result.luxembourg) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Luxembourg path");
    }
    if (result.malta) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Malta path");
    }
    if (result.cyprus) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Cyprus path");
    }
    if (result.france) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the France path");
    }
    if (result.germany) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Germany path");
    }
    if (result.unitedKingdom) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the United Kingdom path");
    }
    if (result.italy) {
      fail("ATLAS_IMPORT_SCOPE=all must not be the Italy path");
    }
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
    if (result.latvia || result.lithuania || result.hungary || result.romania || result.greece || result.luxembourg || result.malta || result.cyprus || result.france || result.germany || result.unitedKingdom || result.italy) {
      fail("all imported a scoped lineage");
    }
    const lithuania = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "lithuania",
    );
    if (lithuania.latvia) {
      fail("lithuania scope imported Latvia");
    }
    if (lithuania.hungary) {
      fail("lithuania scope imported Hungary");
    }
    if (lithuania.lithuania?.counts.offices !== 123) {
      fail(`Lithuania offices ${String(lithuania.lithuania?.counts.offices)}`);
    }
    if (lithuania.lithuania?.counts.current_offices !== 123) {
      fail(`Lithuania current ${String(lithuania.lithuania?.counts.current_offices)}`);
    }
    if (lithuania.lithuania?.counts.historical_offices !== 0) {
      fail(`Lithuania historical ${String(lithuania.lithuania?.counts.historical_offices)}`);
    }
    if (lithuania.lithuania?.counts.municipal_offices !== 120) {
      fail(`Lithuania municipal ${String(lithuania.lithuania?.counts.municipal_offices)}`);
    }
    if (lithuania.lithuania?.counts.regional_offices !== 0) {
      fail(`Lithuania regional ${String(lithuania.lithuania?.counts.regional_offices)}`);
    }
    if (lithuania.lithuania?.counts.national_offices !== 2) {
      fail(`Lithuania national ${String(lithuania.lithuania?.counts.national_offices)}`);
    }
    if (lithuania.lithuania?.counts.other_offices !== 1) {
      fail(`Lithuania other ${String(lithuania.lithuania?.counts.other_offices)}`);
    }
    if (lithuania.lithuania?.counts.current_councils !== 60) {
      fail(`Lithuania councils ${String(lithuania.lithuania?.counts.current_councils)}`);
    }
    if (lithuania.lithuania?.counts.current_direct_executive_offices !== 61) {
      fail(`Lithuania direct executives ${String(lithuania.lithuania?.counts.current_direct_executive_offices)}`);
    }
    if (lithuania.lithuania?.counts.result_rows !== 130) {
      fail(`Lithuania results ${String(lithuania.lithuania?.counts.result_rows)}`);
    }
    if (lithuania.lithuania?.counts.proceedings !== 25) {
      fail(`Lithuania proceedings ${String(lithuania.lithuania?.counts.proceedings)}`);
    }
    if (lithuania.lithuania?.counts.prospective_events !== 0) {
      fail(`Lithuania prospective ${String(lithuania.lithuania?.counts.prospective_events)}`);
    }
    if (lithuania.lithuania?.counts.unresolved_evidence !== 21) {
      fail(`Lithuania unresolved ${String(lithuania.lithuania?.counts.unresolved_evidence)}`);
    }
    if (lithuania.lithuania?.counts.needs_review_classifications !== 123) {
      fail(`Lithuania needs_review ${String(lithuania.lithuania?.counts.needs_review_classifications)}`);
    }
    if (lithuania.lithuania?.counts.approved_classifications !== 0) {
      fail(`Lithuania approved ${String(lithuania.lithuania?.counts.approved_classifications)}`);
    }
    if (lithuania.romania) {
      fail("lithuania scope imported Romania");
    }
    const romania = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "romania",
    );
    if (romania.latvia || romania.lithuania) {
      fail("romania scope imported a Baltic lineage");
    }
    if (romania.hungary) {
      fail("romania scope imported Hungary");
    }
    if (romania.romania?.counts.offices !== 6460) {
      fail(`Romania offices ${String(romania.romania?.counts.offices)}`);
    }
    if (romania.romania?.counts.current_offices !== 6460) {
      fail(`Romania current ${String(romania.romania?.counts.current_offices)}`);
    }
    if (romania.romania?.counts.historical_offices !== 0) {
      fail(`Romania historical ${String(romania.romania?.counts.historical_offices)}`);
    }
    if (romania.romania?.counts.municipal_offices !== 6372) {
      fail(`Romania municipal ${String(romania.romania?.counts.municipal_offices)}`);
    }
    if (romania.romania?.counts.regional_offices !== 84) {
      fail(`Romania regional ${String(romania.romania?.counts.regional_offices)}`);
    }
    if (romania.romania?.counts.national_offices !== 3) {
      fail(`Romania national ${String(romania.romania?.counts.national_offices)}`);
    }
    if (romania.romania?.counts.other_offices !== 1) {
      fail(`Romania other ${String(romania.romania?.counts.other_offices)}`);
    }
    if (romania.romania?.counts.total_events !== 19343) {
      fail(`Romania events ${String(romania.romania?.counts.total_events)}`);
    }
    if (romania.romania?.counts.result_rows !== 23) {
      fail(`Romania results ${String(romania.romania?.counts.result_rows)}`);
    }
    if (romania.romania?.counts.proceedings !== 0) {
      fail(`Romania proceedings ${String(romania.romania?.counts.proceedings)}`);
    }
    if (romania.romania?.counts.prospective_events !== 0) {
      fail(`Romania prospective ${String(romania.romania?.counts.prospective_events)}`);
    }
    if (romania.romania?.counts.unresolved_evidence !== 7) {
      fail(`Romania unresolved ${String(romania.romania?.counts.unresolved_evidence)}`);
    }
    if (romania.romania?.counts.needs_review_classifications !== 6460) {
      fail(`Romania needs_review ${String(romania.romania?.counts.needs_review_classifications)}`);
    }
    if (romania.romania?.counts.approved_classifications !== 0) {
      fail(`Romania approved ${String(romania.romania?.counts.approved_classifications)}`);
    }
    if (romania.romania?.counts.direct_executive_offices !== 3229) {
      fail(`Romania direct executives ${String(romania.romania?.counts.direct_executive_offices)}`);
    }
    if (romania.romania?.counts.council_assembly_offices !== 3230) {
      fail(`Romania councils ${String(romania.romania?.counts.council_assembly_offices)}`);
    }
    if (romania.greece) {
      fail("romania scope imported Greece");
    }
    const greece = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "greece",
    );
    if (greece.latvia || greece.lithuania || greece.hungary || greece.romania || greece.luxembourg || greece.malta || greece.cyprus) {
      fail("greece scope imported another scoped lineage");
    }
    if (greece.greece?.counts.offices !== 703) fail(`Greece offices ${String(greece.greece?.counts.offices)}`);
    if (greece.greece?.counts.current_offices !== 693) fail(`Greece current ${String(greece.greece?.counts.current_offices)}`);
    if (greece.greece?.counts.historical_offices !== 10) fail(`Greece historical ${String(greece.greece?.counts.historical_offices)}`);
    if (greece.greece?.counts.municipal_offices !== 674) fail(`Greece municipal ${String(greece.greece?.counts.municipal_offices)}`);
    if (greece.greece?.counts.regional_offices !== 26) fail(`Greece regional ${String(greece.greece?.counts.regional_offices)}`);
    if (greece.greece?.counts.national_offices !== 2) fail(`Greece national ${String(greece.greece?.counts.national_offices)}`);
    if (greece.greece?.counts.other_offices !== 1) fail(`Greece other ${String(greece.greece?.counts.other_offices)}`);
    if (greece.greece?.counts.total_events !== 2774) fail(`Greece events ${String(greece.greece?.counts.total_events)}`);
    if (greece.greece?.counts.proceedings !== 3555) fail(`Greece proceedings ${String(greece.greece?.counts.proceedings)}`);
    if (greece.greece?.counts.result_rows !== 14004) fail(`Greece results ${String(greece.greece?.counts.result_rows)}`);
    if (greece.greece?.counts.distinct_observations !== 8021) {
      fail(`Greece observations ${String(greece.greece?.counts.distinct_observations)}`);
    }
    if (greece.greece?.counts.prospective_events !== 0) fail(`Greece prospective ${String(greece.greece?.counts.prospective_events)}`);
    if (greece.greece?.counts.unresolved_evidence !== 24) fail(`Greece unresolved ${String(greece.greece?.counts.unresolved_evidence)}`);
    if (greece.greece?.counts.needs_review_classifications !== 703) {
      fail(`Greece needs_review ${String(greece.greece?.counts.needs_review_classifications)}`);
    }
    if (greece.greece?.counts.approved_classifications !== 0) fail(`Greece approved ${String(greece.greece?.counts.approved_classifications)}`);
    if (greece.greece?.counts.current_direct_executive_offices !== 345) {
      fail(`Greece direct executives ${String(greece.greece?.counts.current_direct_executive_offices)}`);
    }
    if (greece.greece?.counts.sources !== 0) fail(`Greece sources ${String(greece.greece?.counts.sources)}`);
    const luxembourg = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "luxembourg",
    );
    if (luxembourg.latvia || luxembourg.lithuania || luxembourg.hungary || luxembourg.romania || luxembourg.greece || luxembourg.malta || luxembourg.cyprus) {
      fail("luxembourg scope imported another scoped lineage");
    }
    if (luxembourg.luxembourg?.counts.offices !== 130) fail(`Luxembourg offices ${String(luxembourg.luxembourg?.counts.offices)}`);
    if (luxembourg.luxembourg?.counts.current_offices !== 102) {
      fail(`Luxembourg current ${String(luxembourg.luxembourg?.counts.current_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.historical_offices !== 28) {
      fail(`Luxembourg historical ${String(luxembourg.luxembourg?.counts.historical_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.municipal_offices !== 128) {
      fail(`Luxembourg municipal ${String(luxembourg.luxembourg?.counts.municipal_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.regional_offices !== 0) {
      fail(`Luxembourg regional ${String(luxembourg.luxembourg?.counts.regional_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.national_offices !== 1) {
      fail(`Luxembourg national ${String(luxembourg.luxembourg?.counts.national_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.other_offices !== 1) fail(`Luxembourg other ${String(luxembourg.luxembourg?.counts.other_offices)}`);
    if (luxembourg.luxembourg?.counts.total_events !== 438) fail(`Luxembourg events ${String(luxembourg.luxembourg?.counts.total_events)}`);
    if (luxembourg.luxembourg?.counts.result_rows !== 0) fail(`Luxembourg results ${String(luxembourg.luxembourg?.counts.result_rows)}`);
    if (luxembourg.luxembourg?.counts.documented_result_rows_omitted !== 48197) {
      fail(`Luxembourg omitted results ${String(luxembourg.luxembourg?.counts.documented_result_rows_omitted)}`);
    }
    if (luxembourg.luxembourg?.counts.explicit_predecessor_edges !== 28) {
      fail(`Luxembourg predecessor edges ${String(luxembourg.luxembourg?.counts.explicit_predecessor_edges)}`);
    }
    if (luxembourg.luxembourg?.counts.direct_executive_offices !== 0) {
      fail(`Luxembourg direct executives ${String(luxembourg.luxembourg?.counts.direct_executive_offices)}`);
    }
    if (luxembourg.luxembourg?.counts.prospective_events !== 0) {
      fail(`Luxembourg prospective ${String(luxembourg.luxembourg?.counts.prospective_events)}`);
    }
    const malta = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "malta",
    );
    if (malta.latvia || malta.lithuania || malta.hungary || malta.romania || malta.greece || malta.luxembourg || malta.cyprus) {
      fail("malta scope imported another scoped lineage");
    }
    if (malta.malta?.counts.offices !== 215) fail(`Malta offices ${String(malta.malta?.counts.offices)}`);
    if (malta.malta?.counts.current_offices !== 213) fail(`Malta current ${String(malta.malta?.counts.current_offices)}`);
    if (malta.malta?.counts.historical_offices !== 2) fail(`Malta historical ${String(malta.malta?.counts.historical_offices)}`);
    if (malta.malta?.counts.municipal_offices !== 204) fail(`Malta municipal ${String(malta.malta?.counts.municipal_offices)}`);
    if (malta.malta?.counts.regional_offices !== 8) fail(`Malta regional ${String(malta.malta?.counts.regional_offices)}`);
    if (malta.malta?.counts.national_offices !== 2) fail(`Malta national ${String(malta.malta?.counts.national_offices)}`);
    if (malta.malta?.counts.other_offices !== 1) fail(`Malta other ${String(malta.malta?.counts.other_offices)}`);
    if (malta.malta?.counts.total_events !== 223) fail(`Malta events ${String(malta.malta?.counts.total_events)}`);
    if (malta.malta?.counts.result_rows !== 0) fail(`Malta results ${String(malta.malta?.counts.result_rows)}`);
    if (malta.malta?.counts.documented_result_rows_omitted !== 4084) {
      fail(`Malta omitted results ${String(malta.malta?.counts.documented_result_rows_omitted)}`);
    }
    if (malta.malta?.counts.documented_stv_count_observations_omitted !== 64204) {
      fail(`Malta omitted STV ${String(malta.malta?.counts.documented_stv_count_observations_omitted)}`);
    }
    if (malta.malta?.counts.explicit_predecessor_edges !== 0) {
      fail(`Malta predecessor edges ${String(malta.malta?.counts.explicit_predecessor_edges)}`);
    }
    if (malta.malta?.counts.direct_executive_offices !== 0) {
      fail(`Malta direct executives ${String(malta.malta?.counts.direct_executive_offices)}`);
    }
    if (malta.malta?.counts.prospective_events !== 0) {
      fail(`Malta prospective ${String(malta.malta?.counts.prospective_events)}`);
    }
    if (malta.malta?.counts.needs_review_classifications !== 215) {
      fail(`Malta needs_review ${String(malta.malta?.counts.needs_review_classifications)}`);
    }
    const cyprus = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "cyprus",
    );
    if (cyprus.latvia || cyprus.lithuania || cyprus.hungary || cyprus.romania || cyprus.greece || cyprus.luxembourg || cyprus.malta) {
      fail("cyprus scope imported another scoped lineage");
    }
    if (cyprus.cyprus?.counts.offices !== 888) fail(`Cyprus offices ${String(cyprus.cyprus?.counts.offices)}`);
    if (cyprus.cyprus?.counts.current_offices !== 714) fail(`Cyprus current ${String(cyprus.cyprus?.counts.current_offices)}`);
    if (cyprus.cyprus?.counts.historical_offices !== 174) fail(`Cyprus historical ${String(cyprus.cyprus?.counts.historical_offices)}`);
    if (cyprus.cyprus?.counts.municipal_offices !== 877) fail(`Cyprus municipal ${String(cyprus.cyprus?.counts.municipal_offices)}`);
    if (cyprus.cyprus?.counts.regional_offices !== 5) fail(`Cyprus regional ${String(cyprus.cyprus?.counts.regional_offices)}`);
    if (cyprus.cyprus?.counts.national_offices !== 5) fail(`Cyprus national ${String(cyprus.cyprus?.counts.national_offices)}`);
    if (cyprus.cyprus?.counts.other_offices !== 1) fail(`Cyprus other ${String(cyprus.cyprus?.counts.other_offices)}`);
    if (cyprus.cyprus?.counts.total_events !== 1599) fail(`Cyprus events ${String(cyprus.cyprus?.counts.total_events)}`);
    if (cyprus.cyprus?.counts.result_rows !== 0) fail(`Cyprus results ${String(cyprus.cyprus?.counts.result_rows)}`);
    if (cyprus.cyprus?.counts.documented_result_rows_omitted !== 11112) {
      fail(`Cyprus omitted results ${String(cyprus.cyprus?.counts.documented_result_rows_omitted)}`);
    }
    if (cyprus.cyprus?.counts.explicit_predecessor_edges !== 0) {
      fail(`Cyprus predecessor edges ${String(cyprus.cyprus?.counts.explicit_predecessor_edges)}`);
    }
    if (cyprus.cyprus?.counts.direct_executive_offices !== 404) {
      fail(`Cyprus direct executives ${String(cyprus.cyprus?.counts.direct_executive_offices)}`);
    }
    if (cyprus.cyprus?.counts.prospective_events !== 0) {
      fail(`Cyprus prospective ${String(cyprus.cyprus?.counts.prospective_events)}`);
    }
    if (cyprus.cyprus?.counts.needs_review_classifications !== 888) {
      fail(`Cyprus needs_review ${String(cyprus.cyprus?.counts.needs_review_classifications)}`);
    }
    if (cyprus.cyprus?.counts.approved_classifications !== 0) {
      fail(`Cyprus approved ${String(cyprus.cyprus?.counts.approved_classifications)}`);
    }
    const france = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "france",
    );
    if (france.latvia || france.lithuania || france.hungary || france.romania || france.greece || france.luxembourg || france.malta || france.cyprus || france.germany || france.unitedKingdom || france.italy) {
      fail("france scope imported another scoped lineage");
    }
    if (france.france?.counts.offices !== 37850) fail(`France offices ${String(france.france?.counts.offices)}`);
    if (france.france?.counts.current_offices !== 35112) fail(`France current ${String(france.france?.counts.current_offices)}`);
    if (france.france?.counts.historical_offices !== 2738) fail(`France historical ${String(france.france?.counts.historical_offices)}`);
    if (france.france?.counts.municipal_offices !== 37705) fail(`France municipal ${String(france.france?.counts.municipal_offices)}`);
    if (france.france?.counts.regional_offices !== 141) fail(`France regional ${String(france.france?.counts.regional_offices)}`);
    if (france.france?.counts.national_offices !== 4) fail(`France national ${String(france.france?.counts.national_offices)}`);
    if (france.france?.counts.other_offices !== 0) fail(`France other ${String(france.france?.counts.other_offices)}`);
    if (france.france?.counts.total_events !== 0) fail(`France events ${String(france.france?.counts.total_events)}`);
    if (france.france?.counts.result_rows !== 0) fail(`France results ${String(france.france?.counts.result_rows)}`);
    if (france.france?.counts.documented_result_rows_omitted !== 1193657) {
      fail(`France omitted results ${String(france.france?.counts.documented_result_rows_omitted)}`);
    }
    if (france.france?.counts.documented_event_rows_omitted !== 119554) {
      fail(`France omitted events ${String(france.france?.counts.documented_event_rows_omitted)}`);
    }
    if (france.france?.counts.explicit_predecessor_edges !== 0) {
      fail(`France predecessor edges ${String(france.france?.counts.explicit_predecessor_edges)}`);
    }
    if (france.france?.counts.direct_executive_offices !== 1) {
      fail(`France direct executives ${String(france.france?.counts.direct_executive_offices)}`);
    }
    if (france.france?.counts.prospective_events !== 0) {
      fail(`France prospective ${String(france.france?.counts.prospective_events)}`);
    }
    if (france.france?.counts.needs_review_classifications !== 37850) {
      fail(`France needs_review ${String(france.france?.counts.needs_review_classifications)}`);
    }
    if (france.france?.counts.approved_classifications !== 0) {
      fail(`France approved ${String(france.france?.counts.approved_classifications)}`);
    }
    const germany = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "germany",
    );
    if (germany.latvia || germany.lithuania || germany.hungary || germany.romania || germany.greece || germany.luxembourg || germany.malta || germany.cyprus || germany.france || germany.unitedKingdom || germany.italy) {
      fail("germany scope imported another scoped lineage");
    }
    if (germany.germany?.counts.offices !== 22630) fail(`Germany offices ${String(germany.germany?.counts.offices)}`);
    if (germany.germany?.counts.current_offices !== 21960) fail(`Germany current ${String(germany.germany?.counts.current_offices)}`);
    if (germany.germany?.counts.historical_offices !== 670) fail(`Germany historical ${String(germany.germany?.counts.historical_offices)}`);
    if (germany.germany?.counts.draft_tier_1 !== 3) fail(`Germany tier 1 ${String(germany.germany?.counts.draft_tier_1)}`);
    if (germany.germany?.counts.draft_tier_2 !== 20) fail(`Germany tier 2 ${String(germany.germany?.counts.draft_tier_2)}`);
    if (germany.germany?.counts.draft_tier_3 !== 552) fail(`Germany tier 3 ${String(germany.germany?.counts.draft_tier_3)}`);
    if (germany.germany?.counts.draft_tier_4 !== 22055) fail(`Germany tier 4 ${String(germany.germany?.counts.draft_tier_4)}`);
    if (germany.germany?.counts.schema_national !== 3) fail(`Germany national ${String(germany.germany?.counts.schema_national)}`);
    if (germany.germany?.counts.schema_regional !== 572) fail(`Germany regional ${String(germany.germany?.counts.schema_regional)}`);
    if (germany.germany?.counts.schema_municipal !== 22055) fail(`Germany municipal ${String(germany.germany?.counts.schema_municipal)}`);
    if (germany.germany?.counts.schema_other !== 0) fail(`Germany other ${String(germany.germany?.counts.schema_other)}`);
    if (germany.germany?.counts.total_events !== 0) fail(`Germany events ${String(germany.germany?.counts.total_events)}`);
    if (germany.germany?.counts.result_rows !== 0) fail(`Germany results ${String(germany.germany?.counts.result_rows)}`);
    if (germany.germany?.counts.documented_result_rows_omitted != null) {
      fail("Germany must not invent documented omitted result totals");
    }
    if (germany.germany?.counts.explicit_predecessor_edges !== 0) {
      fail(`Germany predecessor edges ${String(germany.germany?.counts.explicit_predecessor_edges)}`);
    }
    if (germany.germany?.counts.direct_executive_offices !== 9585) {
      fail(`Germany direct executives ${String(germany.germany?.counts.direct_executive_offices)}`);
    }
    if (germany.germany?.counts.schleswig_holstein_direct_mayors !== 86) {
      fail(`Germany SH mayors ${String(germany.germany?.counts.schleswig_holstein_direct_mayors)}`);
    }
    if (germany.germany?.counts.prospective_events !== 0) {
      fail(`Germany prospective ${String(germany.germany?.counts.prospective_events)}`);
    }
    if (germany.germany?.counts.needs_review_classifications !== 22630) {
      fail(`Germany needs_review ${String(germany.germany?.counts.needs_review_classifications)}`);
    }
    if (germany.germany?.counts.approved_classifications !== 0) {
      fail(`Germany approved ${String(germany.germany?.counts.approved_classifications)}`);
    }
    const unitedKingdom = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "united_kingdom",
    );
    if (
      unitedKingdom.latvia ||
      unitedKingdom.lithuania ||
      unitedKingdom.hungary ||
      unitedKingdom.romania ||
      unitedKingdom.greece ||
      unitedKingdom.luxembourg ||
      unitedKingdom.malta ||
      unitedKingdom.cyprus ||
      unitedKingdom.france ||
      unitedKingdom.germany ||
      unitedKingdom.italy
    ) {
      fail("united_kingdom scope imported another scoped lineage");
    }
    if (unitedKingdom.unitedKingdom?.counts.offices !== 510) fail(`UK offices ${String(unitedKingdom.unitedKingdom?.counts.offices)}`);
    if (unitedKingdom.unitedKingdom?.counts.current_offices !== 482) fail(`UK current ${String(unitedKingdom.unitedKingdom?.counts.current_offices)}`);
    if (unitedKingdom.unitedKingdom?.counts.current_shadow_offices !== 2) {
      fail(`UK shadow ${String(unitedKingdom.unitedKingdom?.counts.current_shadow_offices)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.historical_offices !== 26) {
      fail(`UK historical ${String(unitedKingdom.unitedKingdom?.counts.historical_offices)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.draft_tier_1 !== 2) fail(`UK tier 1 ${String(unitedKingdom.unitedKingdom?.counts.draft_tier_1)}`);
    if (unitedKingdom.unitedKingdom?.counts.draft_tier_2 !== 5) fail(`UK tier 2 ${String(unitedKingdom.unitedKingdom?.counts.draft_tier_2)}`);
    if (unitedKingdom.unitedKingdom?.counts.draft_tier_3 !== 76) fail(`UK tier 3 ${String(unitedKingdom.unitedKingdom?.counts.draft_tier_3)}`);
    if (unitedKingdom.unitedKingdom?.counts.draft_tier_4 !== 427) fail(`UK tier 4 ${String(unitedKingdom.unitedKingdom?.counts.draft_tier_4)}`);
    if (unitedKingdom.unitedKingdom?.counts.schema_national !== 2) fail(`UK national ${String(unitedKingdom.unitedKingdom?.counts.schema_national)}`);
    if (unitedKingdom.unitedKingdom?.counts.schema_regional !== 81) fail(`UK regional ${String(unitedKingdom.unitedKingdom?.counts.schema_regional)}`);
    if (unitedKingdom.unitedKingdom?.counts.schema_municipal !== 427) fail(`UK municipal ${String(unitedKingdom.unitedKingdom?.counts.schema_municipal)}`);
    if (unitedKingdom.unitedKingdom?.counts.schema_other !== 0) fail(`UK other ${String(unitedKingdom.unitedKingdom?.counts.schema_other)}`);
    if (unitedKingdom.unitedKingdom?.counts.total_events !== 0) fail(`UK events ${String(unitedKingdom.unitedKingdom?.counts.total_events)}`);
    if (unitedKingdom.unitedKingdom?.counts.result_rows !== 0) fail(`UK results ${String(unitedKingdom.unitedKingdom?.counts.result_rows)}`);
    if (unitedKingdom.unitedKingdom?.counts.documented_result_rows_omitted != null) {
      fail("United Kingdom must not invent documented omitted result totals");
    }
    if (unitedKingdom.unitedKingdom?.counts.documented_event_rows_omitted != null) {
      fail("United Kingdom must not invent documented omitted event totals");
    }
    if (unitedKingdom.unitedKingdom?.counts.explicit_predecessor_edges !== 0) {
      fail(`UK predecessor edges ${String(unitedKingdom.unitedKingdom?.counts.explicit_predecessor_edges)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.direct_executive_offices !== 64) {
      fail(`UK direct executives ${String(unitedKingdom.unitedKingdom?.counts.direct_executive_offices)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.principal_councils !== 382) {
      fail(`UK principal councils ${String(unitedKingdom.unitedKingdom?.counts.principal_councils)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.prospective_events !== 0) {
      fail(`UK prospective ${String(unitedKingdom.unitedKingdom?.counts.prospective_events)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.needs_review_classifications !== 510) {
      fail(`UK needs_review ${String(unitedKingdom.unitedKingdom?.counts.needs_review_classifications)}`);
    }
    if (unitedKingdom.unitedKingdom?.counts.approved_classifications !== 0) {
      fail(`UK approved ${String(unitedKingdom.unitedKingdom?.counts.approved_classifications)}`);
    }
    const italy = importAtlasLineages(
      { root, sqlitePath, attemptsPath, operator: "atlas-ci-import" },
      "italy",
    );
    if (
      italy.latvia ||
      italy.lithuania ||
      italy.hungary ||
      italy.romania ||
      italy.greece ||
      italy.luxembourg ||
      italy.malta ||
      italy.cyprus ||
      italy.france ||
      italy.germany ||
      italy.unitedKingdom
    ) {
      fail("italy scope imported another scoped lineage");
    }
    if (italy.italy?.counts.offices !== 16621) fail(`Italy offices ${String(italy.italy?.counts.offices)}`);
    if (italy.italy?.counts.current_offices !== 15917) fail(`Italy current ${String(italy.italy?.counts.current_offices)}`);
    if (italy.italy?.counts.historical_offices !== 696) fail(`Italy historical ${String(italy.italy?.counts.historical_offices)}`);
    if (italy.italy?.counts.pending_fvg_offices !== 8) fail(`Italy pending ${String(italy.italy?.counts.pending_fvg_offices)}`);
    if (italy.italy?.counts.draft_tier_1 !== 4) fail(`Italy tier 1 ${String(italy.italy?.counts.draft_tier_1)}`);
    if (italy.italy?.counts.draft_tier_2 !== 38) fail(`Italy tier 2 ${String(italy.italy?.counts.draft_tier_2)}`);
    if (italy.italy?.counts.draft_tier_3 !== 11) fail(`Italy tier 3 ${String(italy.italy?.counts.draft_tier_3)}`);
    if (italy.italy?.counts.draft_tier_4 !== 16568) fail(`Italy tier 4 ${String(italy.italy?.counts.draft_tier_4)}`);
    if (italy.italy?.counts.schema_national !== 4) fail(`Italy national ${String(italy.italy?.counts.schema_national)}`);
    if (italy.italy?.counts.schema_regional !== 49) fail(`Italy regional ${String(italy.italy?.counts.schema_regional)}`);
    if (italy.italy?.counts.schema_municipal !== 16568) fail(`Italy municipal ${String(italy.italy?.counts.schema_municipal)}`);
    if (italy.italy?.counts.schema_other !== 0) fail(`Italy other ${String(italy.italy?.counts.schema_other)}`);
    if (italy.italy?.counts.total_events !== 0) fail(`Italy events ${String(italy.italy?.counts.total_events)}`);
    if (italy.italy?.counts.result_rows !== 0) fail(`Italy results ${String(italy.italy?.counts.result_rows)}`);
    if (italy.italy?.counts.documented_result_rows_omitted != null) {
      fail("Italy must not invent documented omitted result totals");
    }
    if (italy.italy?.counts.documented_event_rows_omitted != null) {
      fail("Italy must not invent documented omitted event totals");
    }
    if (italy.italy?.counts.explicit_predecessor_edges !== 0) {
      fail(`Italy predecessor edges ${String(italy.italy?.counts.explicit_predecessor_edges)}`);
    }
    if (italy.italy?.counts.direct_executive_offices !== 7992) {
      fail(`Italy direct executives ${String(italy.italy?.counts.direct_executive_offices)}`);
    }
    if (italy.italy?.counts.research_dates !== 0) {
      fail(`Italy research dates ${String(italy.italy?.counts.research_dates)}`);
    }
    if (italy.italy?.counts.prospective_events !== 0) {
      fail(`Italy prospective ${String(italy.italy?.counts.prospective_events)}`);
    }
    if (italy.italy?.counts.needs_review_classifications !== 16621) {
      fail(`Italy needs_review ${String(italy.italy?.counts.needs_review_classifications)}`);
    }
    if (italy.italy?.counts.approved_classifications !== 0) {
      fail(`Italy approved ${String(italy.italy?.counts.approved_classifications)}`);
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
        LITHUANIA_LINEAGE,
        ROMANIA_LINEAGE,
        GREECE_LINEAGE,
        LUXEMBOURG_LINEAGE,
        MALTA_LINEAGE,
        CYPRUS_LINEAGE,
        FRANCE_LINEAGE,
        GERMANY_LINEAGE,
        UNITED_KINGDOM_LINEAGE,
        ITALY_LINEAGE,
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
      `loaded albania=122 andorra=7 alderney=2 armenia=71 austria=2038 belgium=1234 bosnia=13 bulgaria=530 netherlands=501 switzerland=2816 denmark=346 sweden=320 finland=503 norway=926 ireland=122 poland=5312 czechia=6424 croatia=1245 portugal=18834 spain=8208 estonia=281 lithuania=123 romania=6460 greece=703 luxembourg=130 malta=215 cyprus=888 latam=10227 nz=4 skipped_drafts=${skipped.length} mexico_withholds=67`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
