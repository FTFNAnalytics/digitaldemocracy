import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importBulgaria } from "../../lib/atlas/bulgaria/import";
import { BulgariaPreflightError, scanBulgariaInventory } from "../../lib/atlas/bulgaria/inventory";
import {
  AVREN_MAYOR_2023_EVENT_ID,
  AVREN_MAYOR_2023_HISTORY_KEY,
  DRAFT_TIER_SHA256,
  EXPECTED_COUNTS,
  GRADEC_OFFICE_ID,
  HELD_EXAMPLE_OFFICE_IDS,
  LINEAGE_ID,
  TIER_PATH,
  TIER_SHA256,
  geographyIdFor,
} from "../../lib/atlas/bulgaria/identity";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

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

describe("Bulgaria Atlas importer", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("publishes only the 530 accepted municipality-wide offices", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-import-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const first = importBulgaria({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-import-test",
    });
    expect(first.counts.current_offices).toBe(530);
    expect(first.counts.municipal_offices).toBe(530);
    expect(first.counts.regional_offices).toBe(0);
    expect(first.counts.mayor_offices).toBe(265);
    expect(first.counts.municipal_council_offices).toBe(265);
    expect(first.counts.held_offices).toBe(3067);
    expect(first.counts.selected_histories).toBe(1590);
    expect(first.counts.prospective_events).toBe(0);
    expect(first.counts.result_rows).toBe(10343);
    expect(first.reusedRelease).toBe(false);
    expect(first.fingerprint).toHaveLength(64);

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      expect(Number(db.prepare("SELECT COUNT(*) AS n FROM office WHERE lineage_id = ?").get(LINEAGE_ID)?.n)).toBe(530);
      expect(
        Number(
          db
            .prepare("SELECT COUNT(*) AS n FROM office_tier_classification WHERE lineage_id = ? AND tier = 'regional'")
            .get(LINEAGE_ID)?.n,
        ),
      ).toBe(0);
      expect(
        db.prepare("SELECT geography_id, office_type FROM office WHERE office_id = 'BG-VAR01-M'").get(),
      ).toMatchObject({
        geography_id: geographyIdFor("BG-VAR01-M"),
        office_type: "Mayor",
      });
      expect(
        db.prepare("SELECT geography_id FROM office WHERE office_id = 'BG-VAR01-C'").get(),
      ).toMatchObject({ geography_id: "geo-a39fe4d2dca8e2ef1d3f84a9" });
      expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(GRADEC_OFFICE_ID)).toBeUndefined();
      for (const officeId of HELD_EXAMPLE_OFFICE_IDS) {
        expect(db.prepare("SELECT office_id FROM office WHERE office_id = ?").get(officeId)).toBeUndefined();
      }
      expect(
        db.prepare("SELECT event_id, selected_history_role FROM election_event WHERE history_key = ?").get(
          AVREN_MAYOR_2023_HISTORY_KEY,
        ),
      ).toMatchObject({
        event_id: AVREN_MAYOR_2023_EVENT_ID,
        selected_history_role: "selected",
      });
      expect(
        Number(db.prepare("SELECT COUNT(*) AS n FROM election_event WHERE office_id = ?").get(GRADEC_OFFICE_ID)?.n),
      ).toBe(0);
      expect(
        db
          .prepare(
            "SELECT 1 AS ok FROM retained_input WHERE lineage_id = ? AND input_path = 'data/countries/bulgaria/unpacked/tables/companion/first-round-returns.json'",
          )
          .get(LINEAGE_ID),
      ).toMatchObject({ ok: 1 });
      expect(
        db
          .prepare("SELECT sha256 FROM retained_input WHERE lineage_id = ? AND input_path = ?")
          .get(LINEAGE_ID, TIER_PATH),
      ).toMatchObject({ sha256: TIER_SHA256 });
    } finally {
      db.close();
    }

    const second = importBulgaria({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "bulgaria-import-test",
    });
    expect(second.reusedRelease).toBe(true);
    expect(second.releaseId).toBe(first.releaseId);
    expect(second.attemptId).not.toBe(first.attemptId);
    expect(latestAttempt(attemptsPath).status).toBe("succeeded");
  }, 300_000);

  it("rejects a draft or hash-mismatched tier file before publication", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-draft-"));
    tempDirs.push(dir);
    const draftPath = path.join(dir, "bulgaria-draft.json");
    writeFileSync(
      draftPath,
      JSON.stringify({
        status: "draft_for_human_review",
        classifications: [],
        source_register: { sha256: "00" },
      }),
    );
    expect(() =>
      scanBulgariaInventory({
        root: repoRoot,
        tierPath: draftPath,
      }),
    ).toThrow(BulgariaPreflightError);

    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    expect(() =>
      importBulgaria({
        root: repoRoot,
        sqlitePath,
        attemptsPath,
        tierPath: draftPath,
        operator: "bulgaria-draft-test",
      }),
    ).toThrow(/status is "draft_for_human_review"|Approved Bulgaria tier SHA-256 mismatch|not valid JSON|tier/);
    expect(DRAFT_TIER_SHA256).not.toBe(TIER_SHA256);
    expect(EXPECTED_COUNTS.current_offices).toBe(530);
  });

  it("refuses OBSERVATORY_FIXTURES=1 on the production importer path", () => {
    process.env.OBSERVATORY_FIXTURES = "1";
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bulgaria-fixtures-"));
    tempDirs.push(dir);
    expect(() =>
      importBulgaria({
        root: repoRoot,
        sqlitePath: path.join(dir, "atlas.sqlite"),
        attemptsPath: path.join(dir, "atlas-attempts.sqlite"),
        operator: "bulgaria-fixture-test",
      }),
    ).toThrow(/OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows/);
  }, 180_000);
});
