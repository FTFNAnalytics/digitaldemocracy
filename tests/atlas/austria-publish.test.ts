import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAustria, assertAustriaFidelity } from "../../lib/atlas/austria/import";
import {
  CANDIDATE_FINGERPRINT,
  CANDIDATE_RELEASE_ID,
  LINEAGE_ID,
  REGIONAL_CALENDAR_LABEL,
  REGIONAL_OFFICE_IDS,
  ST_GEORGEN_HOLD_EVENT_ID,
  ST_GEORGEN_HOLD_HISTORY_KEY,
  sha256Hex,
} from "../../lib/atlas/austria/identity";
import { countRows, openAtlasDatabase } from "../../lib/atlas/sqlite";
import { listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

function latestAttempt(attemptsPath: string): Record<string, unknown> {
  const db = openAtlasDatabase(attemptsPath, { readOnly: true });
  try {
    const row = db.prepare("SELECT * FROM ingest_attempt ORDER BY started_at DESC, rowid DESC LIMIT 1").get();
    if (!row) throw new Error("No ingest_attempt rows");
    return row;
  } finally {
    db.close();
  }
}

describe("Prompt N Austria publish gates", () => {
  const tempDirs: string[] = [];
  const originalFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    if (originalFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = originalFixtures;
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it(
    "imports Austria with approved counts, four regional IDs, retained St. Georgen hold, and unchanged re-import",
    () => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-austria-publish-"));
      tempDirs.push(dir);
      const options = {
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "atlas-ci",
      };

      const first = importAustria(options);
      expect(first.reusedRelease).toBe(false);
      expect(first.fingerprint).toBe(CANDIDATE_FINGERPRINT);
      expect(first.releaseId).toBe(CANDIDATE_RELEASE_ID);
      expect(first.counts).toMatchObject({
        current_offices: 2038,
        selected_histories: 5956,
        prospective_events: 0,
        total_events: 5956,
        research_dates: 5956,
        historical_dates_day: 58,
        historical_dates_year: 5898,
        result_rows: 16336,
        sources: 97,
        distinct_catalogue_sources: 93,
        inline_only_sources: 4,
        municipal_offices: 2034,
        regional_offices: 4,
        mayor_offices: 1017,
        municipal_council_offices: 1017,
        unknown_next_dates: 2038,
        office_briefings_retained: 2038,
        country_briefings_retained: 1,
        poll_records_retained: 1,
        control_observations_supplied: 0,
        proceedings: 0,
        party_mappings: 0,
        retained_inputs: 2084,
      });

      const master = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        assertAustriaFidelity(master);
        expect(countRows(master, "office", "lineage_id = ?", [LINEAGE_ID])).toBe(2038);
        expect(countRows(master, "election_event", "lineage_id = ?", [LINEAGE_ID])).toBe(5956);
        expect(countRows(master, "result_row", "lineage_id = ?", [LINEAGE_ID])).toBe(16336);
        expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'municipal'", [LINEAGE_ID])).toBe(2034);
        expect(countRows(master, "office_tier_classification", "lineage_id = ? AND tier = 'regional'", [LINEAGE_ID])).toBe(4);
        expect(countRows(master, "proceeding", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
        expect(countRows(master, "party_mapping", "lineage_id = ?", [LINEAGE_ID])).toBe(0);
        const regionalIds = master
          .prepare(
            `SELECT o.office_id FROM office o
             JOIN office_tier_classification t ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
             WHERE o.country_id = 'austria' AND t.tier = 'regional'
             ORDER BY o.office_id`,
          )
          .all()
          .map((row) => String(row.office_id));
        expect(regionalIds).toEqual([...REGIONAL_OFFICE_IDS].sort());
        expect(
          master
            .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name IN ('tightness','competition_index','metric_observation')")
            .get(),
        ).toMatchObject({ n: 0 });

        const hold = master
          .prepare("SELECT history_key, raw_json FROM election_event WHERE event_id = ?")
          .get(ST_GEORGEN_HOLD_EVENT_ID);
        expect(hold).toMatchObject({ history_key: ST_GEORGEN_HOLD_HISTORY_KEY });
        expect(JSON.parse(String(hold?.raw_json)).supplemental.publication_hold).toBe(true);
        expect(countRows(master, "result_row", "history_key = ?", [ST_GEORGEN_HOLD_HISTORY_KEY])).toBe(4);

        const release = master.prepare("SELECT * FROM dataset_release WHERE lineage_id = ?").get(LINEAGE_ID);
        expect(String(release?.release_id)).toBe(first.releaseId);
        expect(String(release?.fingerprint_sha256)).toBe(first.fingerprint);
        expect(sha256Hex(String(release?.hash_inputs_json))).toBe(first.fingerprint);
        expect(release).toMatchObject({
          adapter_version: "atlas-austria-field-map/1",
          method_version: "atlas-preserve-evidence/1",
          schema_version: "atlas-master/1",
          research_snapshot_label: "2026-09-11",
          upstream_release_id: LINEAGE_ID,
          research_coverage_complete: 0,
        });
      } finally {
        master.close();
      }

      const regional = listAtlasRegionalCalendar("austria", options.sqlitePath);
      expect(regional.count).toBe(4);
      expect(regional.offices.map((row) => row.officeId).sort()).toEqual([...REGIONAL_OFFICE_IDS].sort());
      expect(regional.label).toBe(REGIONAL_CALENDAR_LABEL);
      expect(regional.denominatorKnown).toBe(false);

      const firstAttempt = latestAttempt(options.attemptsPath);
      expect(firstAttempt).toMatchObject({
        attempt_id: first.attemptId,
        status: "succeeded",
        successful_release_id: first.releaseId,
        operator: "atlas-ci",
        script_version: "atlas-import/1.0.0",
      });

      const second = importAustria(options);
      expect(second.attemptId).not.toBe(first.attemptId);
      expect(second.releaseId).toBe(first.releaseId);
      expect(second.fingerprint).toBe(first.fingerprint);
      expect(second.reusedRelease).toBe(true);

      const master2 = openAtlasDatabase(options.sqlitePath, { readOnly: true });
      try {
        expect(master2.prepare("SELECT COUNT(*) AS n FROM dataset_release").get()).toMatchObject({ n: 1 });
        const receipt = master2.prepare("SELECT last_publish_attempt_id, attempted_release_id FROM publication_receipt").get();
        expect(receipt).toMatchObject({
          last_publish_attempt_id: second.attemptId,
          attempted_release_id: first.releaseId,
        });
      } finally {
        master2.close();
      }

    },
    600_000,
  );
});
