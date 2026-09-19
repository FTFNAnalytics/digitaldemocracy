import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { importAlderney } from "../../lib/atlas/alderney/import";
import { importAndorra } from "../../lib/atlas/andorra/import";
import { importArmenia } from "../../lib/atlas/armenia/import";
import { importBosnia } from "../../lib/atlas/bosnia-and-herzegovina/import";
import { importNewZealand } from "../../lib/atlas/continuity/nz";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { loadAtlasCatalog, getAtlasCountry, listAtlasOffices, listAtlasRegionalCalendar, listAtlasExplorerOffices, lookupAtlasEvent, lookupAtlasOffice } from "../../lib/atlas/read";
import { parseAtlasExplorerFilters, serializeAtlasExplorerFilters, emptyAtlasExplorerFilters } from "../../lib/atlas/filters";

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
    expect(listAtlasExplorerOffices({ q: "westport", country: "", tier: "", region: "" }, missing)).toEqual([]);
    expect(lookupAtlasEvent("next-154f7bfa6ea99d09c5a47d7c", missing)).toEqual({ status: "missing" });
    expect(lookupAtlasOffice("NZ-BULLER-WESTPORT-2026", missing)).toEqual({ status: "missing" });
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
    expect(lookupAtlasOffice("NZ-BULLER-WESTPORT-2026", sqlitePath).status).toBe("found");
    const event = lookupAtlasEvent("next-154f7bfa6ea99d09c5a47d7c", sqlitePath);
    expect(event.status).toBe("found");
    if (event.status === "found") {
      expect(event.record.officeId).toBe("NZ-BULLER-WESTPORT-2026");
      expect(event.record.selectedHistoryRole).toBe("none");
    }
    expect(lookupAtlasEvent("missing-event-id", sqlitePath)).toEqual({ status: "missing" });
    expect(lookupAtlasOffice("missing-office-id", sqlitePath)).toEqual({ status: "missing" });

    const explorer = listAtlasExplorerOffices(emptyAtlasExplorerFilters(), sqlitePath);
    expect(explorer).toHaveLength(4);
    expect(explorer.every((row) => row.regionId === "oceania")).toBe(true);
    expect(listAtlasExplorerOffices({ q: "westport", country: "", tier: "", region: "" }, sqlitePath).map((row) => row.officeId)).toEqual([
      "NZ-BULLER-WESTPORT-2026",
    ]);
    expect(listAtlasExplorerOffices({ q: "", country: "new-zealand", tier: "municipal", region: "" }, sqlitePath)).toHaveLength(3);
    expect(listAtlasExplorerOffices({ q: "", country: "", tier: "", region: "europe" }, sqlitePath)).toEqual([]);
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
    expect(listAtlasExplorerOffices({ q: "", country: "andorra", tier: "", region: "europe" }, sqlitePath)).toHaveLength(7);
    const regional = listAtlasRegionalCalendar("andorra", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe("No regional tier in this package; seven municipal councils.");
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Alderney's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-alderney-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAlderney({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["alderney"]);
    expect(catalog.countries[0]?.officeCount).toBe(2);
    const country = getAtlasCountry("alderney", sqlitePath);
    expect(country?.name).toBe("Alderney");
    expect(country?.polityKind).toBe("territory");
    const offices = listAtlasOffices("alderney", sqlitePath);
    expect(offices).toHaveLength(2);
    expect(offices.every((row) => row.tier === "other")).toBe(true);
    expect(offices.find((row) => row.officeId === "GG-ALD-STATES")?.nextCertainty).toBe("conditional");
    expect(offices.find((row) => row.officeId === "GG-ALD-PLEB")?.nextCertainty).toBe("conditional");
    const regional = listAtlasRegionalCalendar("alderney", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe(
      "No regional tier in this package; two territorial office/contest records classified other.",
    );
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Armenia's honest empty regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-armenia-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importArmenia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["armenia"]);
    expect(catalog.countries[0]?.officeCount).toBe(71);
    const country = getAtlasCountry("armenia", sqlitePath);
    expect(country?.name).toBe("Armenia");
    expect(country?.polityKind).toBe("sovereign_country");
    const offices = listAtlasOffices("armenia", sqlitePath);
    expect(offices).toHaveLength(71);
    expect(offices.every((row) => row.tier === "municipal")).toBe(true);
    expect(offices.find((row) => row.officeId === "AM-AKHURYAN-C")?.nextCertainty).toBe("called");
    expect(lookupAtlasOffice("AM-AKHURYAN-C", sqlitePath).status).toBe("found");
    expect(offices.find((row) => row.officeId === "AM-VEDI-C")?.nextCertainty).toBeNull();
    const regional = listAtlasRegionalCalendar("armenia", sqlitePath);
    expect(regional.offices).toEqual([]);
    expect(regional.count).toBe(0);
    expect(regional.label).toBe(
      "No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.",
    );
    expect(regional.denominatorKnown).toBe(false);
  });

  it("shows Bosnia and Herzegovina's populated regional calendar after import", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-bosnia-ui-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importBosnia({
      root: repoRoot,
      sqlitePath,
      attemptsPath,
      operator: "atlas-ui-test",
    });
    const catalog = loadAtlasCatalog(sqlitePath);
    expect(catalog.status).toBe("ready");
    expect(catalog.countries.map((row) => row.countryId)).toEqual(["bosnia-and-herzegovina"]);
    expect(catalog.countries[0]?.officeCount).toBe(13);
    const country = getAtlasCountry("bosnia-and-herzegovina", sqlitePath);
    expect(country?.name).toBe("Bosnia and Herzegovina");
    expect(country?.polityKind).toBe("sovereign_country");
    const offices = listAtlasOffices("bosnia-and-herzegovina", sqlitePath);
    expect(offices).toHaveLength(13);
    expect(offices.every((row) => row.tier === "regional")).toBe(true);
    expect(offices.find((row) => row.officeId === "BA-205")?.nextCertainty).toBe("expected");
    expect(offices.find((row) => row.officeId === "BA-G")?.officeType).toBe("President");
    expect(offices.find((row) => row.officeId === "BA-R")?.officeType).toBe("National Assembly");
    expect(lookupAtlasOffice("BA-205", sqlitePath).status).toBe("found");
    expect(offices.some((row) => /Brčko|Brcko|BA-BRC/i.test(row.officeId))).toBe(false);
    const regional = listAtlasRegionalCalendar("bosnia-and-herzegovina", sqlitePath);
    expect(regional.offices).toHaveLength(13);
    expect(regional.count).toBe(13);
    expect(regional.label).toContain("13 regional offices");
    expect(regional.label).toMatch(/No Brčko or municipal/);
    expect(regional.denominatorKnown).toBe(false);
    expect(listAtlasExplorerOffices({ q: "", country: "bosnia-and-herzegovina", tier: "regional", region: "europe" }, sqlitePath)).toHaveLength(13);
    expect(listAtlasExplorerOffices({ q: "", country: "bosnia-and-herzegovina", tier: "municipal", region: "" }, sqlitePath)).toEqual([]);
  });
});

describe("Atlas explorer URL filters", () => {
  it("round-trips q, country, tier, and region", () => {
    const parsed = parseAtlasExplorerFilters({
      q: "westport",
      country: "new-zealand",
      tier: "municipal",
      region: "oceania",
    });
    const params = serializeAtlasExplorerFilters(parsed);
    expect(params.get("q")).toBe("westport");
    expect(params.get("country")).toBe("new-zealand");
    expect(params.get("tier")).toBe("municipal");
    expect(params.get("region")).toBe("oceania");
  });

  it("ignores empty defaults", () => {
    const parsed = parseAtlasExplorerFilters({});
    expect(parsed).toEqual({ q: "", country: "", tier: "", region: "" });
    expect(serializeAtlasExplorerFilters(parsed).toString()).toBe("");
  });
});
