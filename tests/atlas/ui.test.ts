import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAndorra } from "../../lib/atlas/andorra/import";
import { importNewZealand } from "../../lib/atlas/continuity/nz";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { loadAtlasCatalog, getAtlasCountry, listAtlasOffices, listAtlasRegionalCalendar } from "../../lib/atlas/read";

const repoRoot = path.join(import.meta.dirname, "../..");

describe("Atlas SQLite UI catalog", () => {
  const tempDirs: string[] = [];

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("renders a missing-database empty state instead of throwing", () => {
    const missing = path.join(os.tmpdir(), "atlas-missing-ui.sqlite");
    const catalog = loadAtlasCatalog(missing);
    expect(catalog.status).toBe("missing");
    expect(catalog.countries).toEqual([]);
    expect(catalog.message).toMatch(/No Atlas SQLite file/);
  });

  it("renders an empty-database state after migrate with no import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-empty-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("empty");
    expect(catalog.totals.offices).toBe(0);
    expect(catalog.message).toMatch(/no published lineages/);
  });

  it("lists New Zealand offices from an imported Atlas file", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-nz-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importNewZealand({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["new-zealand"]);
    expect(catalog.countries[0]?.officeCount).toBe(4);
    const country = getAtlasCountry("new-zealand", sqlitePath);
    expect(country?.name).toBe("New Zealand");
    const offices = listAtlasOffices("new-zealand", sqlitePath);
    expect(offices).toHaveLength(4);
    expect(offices.some((row) => row.officeId === "NZ-BULLER-WESTPORT-2026")).toBe(true);
    expect(getAtlasCountry("argentina", sqlitePath)).toBeNull();
  });

  it("shows Andorra's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-andorra-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAndorra({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["andorra"]);
    expect(catalog.countries[0]?.officeCount).toBe(7);
    const country = getAtlasCountry("andorra", sqlitePath);
    expect(country?.name).toBe("Andorra");
    expect(listAtlasOffices("andorra", sqlitePath)).toHaveLength(7);
    const regional = listAtlasRegionalCalendar("andorra", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe("No regional tier in this package; seven municipal councils.");
    expect(regional.denominatorKnown).toBe(false);
  });
});
