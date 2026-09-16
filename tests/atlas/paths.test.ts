import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  ATLAS_ATTEMPTS_SQLITE_ENV,
  ATLAS_SQLITE_ENV,
  DEFAULT_ATLAS_ATTEMPTS_SQLITE_RELATIVE,
  DEFAULT_ATLAS_SQLITE_RELATIVE,
  PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH,
  PRODUCTION_ATLAS_SQLITE_PATH,
  resolveAtlasAttemptsSqlitePath,
  resolveAtlasSqlitePath,
} from "../../lib/atlas/paths";
import {
  ATLAS_ATTEMPT_LOG_FILENAME,
  ATLAS_MASTER_FILENAME,
  listAtlasMigrations,
  parseMigrationFilename,
} from "../../lib/atlas/migrations";

describe("ATLAS_SQLITE_PATH", () => {
  const cwd = "/repo";

  it("defaults to data/master/atlas.sqlite under cwd", () => {
    expect(resolveAtlasSqlitePath({}, cwd)).toBe(path.join(cwd, DEFAULT_ATLAS_SQLITE_RELATIVE));
  });

  it("uses an absolute ATLAS_SQLITE_PATH override", () => {
    expect(
      resolveAtlasSqlitePath({ [ATLAS_SQLITE_ENV]: PRODUCTION_ATLAS_SQLITE_PATH }, cwd),
    ).toBe(PRODUCTION_ATLAS_SQLITE_PATH);
  });

  it("resolves a relative ATLAS_SQLITE_PATH override against cwd", () => {
    expect(resolveAtlasSqlitePath({ [ATLAS_SQLITE_ENV]: "tmp/atlas.sqlite" }, cwd)).toBe(
      path.join(cwd, "tmp/atlas.sqlite"),
    );
  });

  it("treats a blank ATLAS_SQLITE_PATH as unset", () => {
    expect(resolveAtlasSqlitePath({ [ATLAS_SQLITE_ENV]: "   " }, cwd)).toBe(
      path.join(cwd, DEFAULT_ATLAS_SQLITE_RELATIVE),
    );
  });
});

describe("ATLAS_ATTEMPTS_SQLITE_PATH", () => {
  const cwd = "/repo";

  it("defaults to data/master/atlas-attempts.sqlite under cwd", () => {
    expect(resolveAtlasAttemptsSqlitePath({}, cwd)).toBe(
      path.join(cwd, DEFAULT_ATLAS_ATTEMPTS_SQLITE_RELATIVE),
    );
  });

  it("uses an absolute ATLAS_ATTEMPTS_SQLITE_PATH override", () => {
    expect(
      resolveAtlasAttemptsSqlitePath(
        { [ATLAS_ATTEMPTS_SQLITE_ENV]: PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH },
        cwd,
      ),
    ).toBe(PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH);
  });

  it("resolves independently of ATLAS_SQLITE_PATH", () => {
    expect(
      resolveAtlasAttemptsSqlitePath(
        {
          [ATLAS_SQLITE_ENV]: PRODUCTION_ATLAS_SQLITE_PATH,
          [ATLAS_ATTEMPTS_SQLITE_ENV]: "tmp/ledger.sqlite",
        },
        cwd,
      ),
    ).toBe(path.join(cwd, "tmp/ledger.sqlite"));
  });
});

describe("Atlas migrations", () => {
  it("parses versioned SQL filenames", () => {
    expect(parseMigrationFilename(ATLAS_ATTEMPT_LOG_FILENAME)).toEqual({
      version: 1,
      name: "atlas_attempt_log",
      filename: ATLAS_ATTEMPT_LOG_FILENAME,
    });
    expect(parseMigrationFilename(ATLAS_MASTER_FILENAME)).toEqual({
      version: 2,
      name: "atlas_master",
      filename: ATLAS_MASTER_FILENAME,
    });
    expect(parseMigrationFilename("README.md")).toBeNull();
  });

  it("lists the Prompt B attempt-log and master migrations", () => {
    const migrations = listAtlasMigrations(path.join(import.meta.dirname, "../.."));
    expect(migrations).toEqual([
      { version: 1, name: "atlas_attempt_log", filename: ATLAS_ATTEMPT_LOG_FILENAME },
      { version: 2, name: "atlas_master", filename: ATLAS_MASTER_FILENAME },
    ]);
  });
});
