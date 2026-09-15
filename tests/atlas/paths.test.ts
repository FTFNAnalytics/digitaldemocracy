import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  ATLAS_SQLITE_ENV,
  DEFAULT_ATLAS_SQLITE_RELATIVE,
  PRODUCTION_ATLAS_SQLITE_PATH,
  resolveAtlasSqlitePath,
} from "../../lib/atlas/paths";
import { listAtlasMigrations, parseMigrationFilename } from "../../lib/atlas/migrations";

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

describe("Atlas migrations", () => {
  it("parses versioned SQL filenames", () => {
    expect(parseMigrationFilename("0001_schema_version.sql")).toEqual({
      version: 1,
      name: "schema_version",
      filename: "0001_schema_version.sql",
    });
    expect(parseMigrationFilename("README.md")).toBeNull();
  });

  it("lists the bootstrap migration and no entity DDL", () => {
    const migrations = listAtlasMigrations(path.join(import.meta.dirname, "../.."));
    expect(migrations).toEqual([
      { version: 1, name: "schema_version", filename: "0001_schema_version.sql" },
    ]);
  });
});
