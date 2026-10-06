import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importAlderney } from "../../lib/atlas/alderney/import";
import { importAndorra } from "../../lib/atlas/andorra/import";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { deriveCountry } from "../../lib/atlas/derive/run";
import { endLiveSession, setSkipFullIntegrityCheck } from "../../lib/atlas/live-session";
import {
  backupPublishedToStaging,
  discardStaging,
  publishDiagnostics,
  publishStaging,
  resetPublishDiagnostics,
  stagingPathFor,
} from "../../lib/atlas/publish";
import { countryIdForImportScope, resolveAtlasPublishMode } from "../../lib/atlas/publish-mode";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

let previousScope: string | undefined;
let previousRestage: string | undefined;
let previousFixtures: string | undefined;

beforeEach(() => {
  previousScope = process.env.ATLAS_IMPORT_SCOPE;
  previousRestage = process.env.ATLAS_PUBLISH_RESTAGE;
  previousFixtures = process.env.OBSERVATORY_FIXTURES;
  delete process.env.OBSERVATORY_FIXTURES;
  resetPublishDiagnostics();
  setSkipFullIntegrityCheck(false);
});

afterEach(() => {
  endLiveSession();
  setSkipFullIntegrityCheck(false);
  resetPublishDiagnostics();
  if (previousScope === undefined) delete process.env.ATLAS_IMPORT_SCOPE;
  else process.env.ATLAS_IMPORT_SCOPE = previousScope;
  if (previousRestage === undefined) delete process.env.ATLAS_PUBLISH_RESTAGE;
  else process.env.ATLAS_PUBLISH_RESTAGE = previousRestage;
  if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
  else process.env.OBSERVATORY_FIXTURES = previousFixtures;
});

function tempMaster(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-scoped-publish-"));
  const sqlitePath = path.join(dir, "atlas.sqlite");
  migrateMasterDatabase(repoRoot, sqlitePath);
  return sqlitePath;
}

function rows(sqlitePath: string, sql: string, params: unknown[] = []): unknown[] {
  const db = openAtlasDatabase(sqlitePath, { readOnly: true });
  try {
    return db.prepare(sql).all(...params);
  } finally {
    db.close();
  }
}

describe("Atlas publish mode", () => {
  it("uses live publish for a named country and restage for a full master", () => {
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "austria" })).toBe("live");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "bulgaria" })).toBe("live");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "united_kingdom" })).toBe("live");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "nz" })).toBe("live");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "latam" })).toBe("live");
    expect(resolveAtlasPublishMode({})).toBe("restage");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "all" })).toBe("restage");
    expect(resolveAtlasPublishMode({ ATLAS_IMPORT_SCOPE: "austria", ATLAS_PUBLISH_RESTAGE: "1" })).toBe("restage");
    expect(countryIdForImportScope("united_kingdom")).toBe("united-kingdom");
    expect(countryIdForImportScope("bosnia")).toBe("bosnia-and-herzegovina");
    expect(countryIdForImportScope("north_macedonia")).toBe("north-macedonia");
    expect(countryIdForImportScope("nz")).toBe("new-zealand");
    expect(countryIdForImportScope("andorra")).toBe("andorra");
    expect(countryIdForImportScope("all")).toBeNull();
    expect(countryIdForImportScope("latam")).toBeNull();
  });

  it("does not VACUUM INTO a staging file for a scoped live publish", () => {
    const sqlitePath = tempMaster();
    try {
      process.env.ATLAS_IMPORT_SCOPE = "andorra";
      delete process.env.ATLAS_PUBLISH_RESTAGE;
      backupPublishedToStaging(sqlitePath);
      expect(publishDiagnostics.vacuumInto).toBe(0);
      expect(publishDiagnostics.liveSessions).toBe(1);
      expect(existsSync(`${sqlitePath}.staging`)).toBe(false);
      expect(stagingPathFor(sqlitePath)).toBe(sqlitePath);
      const db = openAtlasDatabase(sqlitePath);
      try {
        const mode = db.prepare("PRAGMA journal_mode;").get() as { journal_mode?: string };
        expect(String(mode.journal_mode).toLowerCase()).toBe("wal");
        db.exec("BEGIN IMMEDIATE;");
        db.prepare(
          "INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'country_package', ?)",
        ).run("live-probe", "rolled back");
        db.exec("COMMIT;");
      } finally {
        db.close();
      }
      discardStaging(sqlitePath);
      expect(rows(sqlitePath, "SELECT lineage_id FROM dataset_lineage WHERE lineage_id = 'live-probe'")).toEqual([]);
      expect(existsSync(sqlitePath)).toBe(true);
    } finally {
      rmSync(path.dirname(sqlitePath), { recursive: true, force: true });
    }
  });

  it("commits a scoped live publish without a staging swap and country-derives only the scope", () => {
    const sqlitePath = tempMaster();
    try {
      process.env.ATLAS_IMPORT_SCOPE = "andorra";
      backupPublishedToStaging(sqlitePath);
      const db = openAtlasDatabase(stagingPathFor(sqlitePath));
      try {
        db.exec("BEGIN IMMEDIATE;");
        db.prepare(
          "INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'country_package', ?)",
        ).run("live-probe", "committed");
        db.exec("COMMIT;");
      } finally {
        db.close();
      }
      publishStaging(sqlitePath);
      expect(publishDiagnostics.vacuumInto).toBe(0);
      expect(publishDiagnostics.fullDerives).toBe(0);
      expect(publishDiagnostics.countryDerives).toEqual(["andorra"]);
      expect(existsSync(`${sqlitePath}.staging`)).toBe(false);
      expect(rows(sqlitePath, "SELECT description FROM dataset_lineage WHERE lineage_id = 'live-probe'")).toEqual([
        { description: "committed" },
      ]);
      const mode = rows(sqlitePath, "PRAGMA journal_mode;")[0] as { journal_mode?: string };
      expect(String(mode.journal_mode).toLowerCase()).toBe("wal");
    } finally {
      rmSync(path.dirname(sqlitePath), { recursive: true, force: true });
    }
  });

  it("still VACUUM INTO when restage is explicit", () => {
    const sqlitePath = tempMaster();
    try {
      process.env.ATLAS_IMPORT_SCOPE = "andorra";
      process.env.ATLAS_PUBLISH_RESTAGE = "1";
      backupPublishedToStaging(sqlitePath);
      expect(publishDiagnostics.vacuumInto).toBe(1);
      expect(publishDiagnostics.liveSessions).toBe(0);
      expect(existsSync(`${sqlitePath}.staging`)).toBe(true);
      discardStaging(sqlitePath);
      expect(existsSync(`${sqlitePath}.staging`)).toBe(false);
      expect(existsSync(sqlitePath)).toBe(true);
    } finally {
      rmSync(path.dirname(sqlitePath), { recursive: true, force: true });
    }
  });
});

describe("country derive leaves other countries", () => {
  it("reimports Andorra in place and keeps Alderney derived and search rows", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-scoped-andorra-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const options = { root: repoRoot, sqlitePath, attemptsPath, operator: "scoped-publish-test" };
    try {
      delete process.env.ATLAS_IMPORT_SCOPE;
      delete process.env.ATLAS_PUBLISH_RESTAGE;
      importAndorra(options);
      importAlderney(options);
      const alderneyBefore = rows(
        sqlitePath,
        `SELECT jurisdiction_key, slug_path, office_count, name
         FROM derived_jurisdiction WHERE country_id = 'alderney' ORDER BY jurisdiction_key`,
      );
      const alderneySearchBefore = rows(
        sqlitePath,
        `SELECT office_id, folded, disambiguation FROM search_seat WHERE country_id = 'alderney' ORDER BY office_id`,
      );
      expect(alderneyBefore.length).toBeGreaterThan(0);
      expect(alderneySearchBefore.length).toBeGreaterThan(0);
      const andorraSeatsBefore = rows(
        sqlitePath,
        "SELECT COUNT(*) AS n FROM derived_seat_status WHERE country_id = 'andorra'",
      );
      const alderneyOfficesBefore = rows(
        sqlitePath,
        "SELECT COUNT(*) AS n FROM office WHERE country_id = 'alderney'",
      );

      resetPublishDiagnostics();
      process.env.ATLAS_IMPORT_SCOPE = "andorra";
      importAndorra(options);

      expect(publishDiagnostics.vacuumInto).toBe(0);
      expect(publishDiagnostics.liveSessions).toBe(1);
      expect(publishDiagnostics.countryDerives).toEqual(["andorra"]);
      expect(publishDiagnostics.fullDerives).toBe(0);
      expect(existsSync(`${sqlitePath}.staging`)).toBe(false);
      expect(
        rows(
          sqlitePath,
          `SELECT jurisdiction_key, slug_path, office_count, name
           FROM derived_jurisdiction WHERE country_id = 'alderney' ORDER BY jurisdiction_key`,
        ),
      ).toEqual(alderneyBefore);
      expect(
        rows(
          sqlitePath,
          `SELECT office_id, folded, disambiguation FROM search_seat WHERE country_id = 'alderney' ORDER BY office_id`,
        ),
      ).toEqual(alderneySearchBefore);
      expect(rows(sqlitePath, "SELECT COUNT(*) AS n FROM office WHERE country_id = 'andorra'")).toEqual([{ n: 7 }]);
      expect(rows(sqlitePath, "SELECT COUNT(*) AS n FROM office WHERE country_id = 'alderney'")).toEqual(
        alderneyOfficesBefore,
      );
      expect(rows(sqlitePath, "SELECT COUNT(*) AS n FROM derived_seat_status WHERE country_id = 'andorra'")).toEqual(
        andorraSeatsBefore,
      );

      const receiptBefore = rows(
        sqlitePath,
        "SELECT last_publish_attempt_id FROM publication_receipt WHERE singleton = 1",
      );
      expect(() => importAndorra({ ...options, failBeforeRename: true })).toThrow(/Injected failure before rename/);
      expect(
        rows(sqlitePath, "SELECT last_publish_attempt_id FROM publication_receipt WHERE singleton = 1"),
      ).toEqual(receiptBefore);
      expect(rows(sqlitePath, "SELECT COUNT(*) AS n FROM office WHERE country_id = 'alderney'")).not.toEqual([{ n: 0 }]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 180_000);

  it("deriveCountry rewrites one country and leaves the other country's seat rows", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-scoped-derive-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    const options = { root: repoRoot, sqlitePath, attemptsPath, operator: "scoped-derive-test" };
    try {
      delete process.env.ATLAS_IMPORT_SCOPE;
      importAndorra(options);
      importAlderney(options);
      const db = openAtlasDatabase(sqlitePath);
      try {
        const before = db
          .prepare(
            "SELECT office_id, current_holder_label FROM derived_seat_status WHERE country_id = 'alderney' ORDER BY office_id",
          )
          .all();
        const summaryBefore = db
          .prepare(
            "SELECT offices, events, result_rows FROM derived_country_summary WHERE country_id = 'alderney'",
          )
          .all();
        expect(summaryBefore.length).toBe(1);
        db.prepare("UPDATE office SET name = name || ' x' WHERE country_id = 'andorra'").run();
        deriveCountry(db, "andorra");
        expect(
          db
            .prepare(
              "SELECT office_id, current_holder_label FROM derived_seat_status WHERE country_id = 'alderney' ORDER BY office_id",
            )
            .all(),
        ).toEqual(before);
        expect(
          db
            .prepare("SELECT offices, events, result_rows FROM derived_country_summary WHERE country_id = 'alderney'")
            .all(),
        ).toEqual(summaryBefore);
        expect(
          Number(
            (
              db.prepare("SELECT COUNT(*) AS n FROM derived_country_summary WHERE country_id = 'andorra'").get() as {
                n?: number;
              }
            ).n,
          ),
        ).toBe(1);
        const renamed = db
          .prepare("SELECT COUNT(*) AS n FROM search_seat WHERE country_id = 'andorra' AND office_name LIKE '% x'")
          .get() as { n?: number };
        expect(Number(renamed.n)).toBeGreaterThan(0);
        const otherNamed = db
          .prepare("SELECT COUNT(*) AS n FROM search_seat WHERE country_id = 'alderney' AND office_name LIKE '% x'")
          .get() as { n?: number };
        expect(Number(otherNamed.n)).toBe(0);
      } finally {
        db.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 180_000);
});
