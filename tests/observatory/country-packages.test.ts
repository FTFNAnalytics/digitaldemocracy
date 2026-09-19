import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  inventoryCountryPackages,
  mergeCountryPackages,
  normalizeCountryPackage,
  validateCountryPackages,
} from "../../lib/observatory/adapters";
import { originalBriefing } from "../../lib/observatory/briefings";
import { competitionIndex } from "../../lib/observatory/metrics";
import { emptyDataset } from "../../scripts/import/normalize";
import { syntheticFixtureDataset } from "../../data/normalized/synthetic-fixture-v0";
import { validateDataset } from "../../scripts/validate/dataset";

const root = path.join(import.meta.dirname, "../..");

describe("country package inventory", () => {
  it("classifies every present standalone folder", () => {
    const { packages, skipped } = inventoryCountryPackages(root);
    expect(skipped.map((row) => row.slug)).toEqual([
      "austria",
      "bosnia-and-herzegovina",
    ]);
    expect(skipped.find((row) => row.slug === "austria")?.reason).toMatch(
      /XZ payload has no observatory adapter/i,
    );
    expect(
      skipped.find((row) => row.slug === "bosnia-and-herzegovina")?.reason,
    ).toMatch(/website ingestion pending/);
    expect(packages.map((row) => row.slug).sort()).toEqual([
      "albania",
      "alderney",
      "andorra",
      "armenia",
      "new-zealand",
    ]);
    expect(packages.find((row) => row.slug === "albania")?.kind).toBe(
      "europe-country-extract/1",
    );
    expect(packages.find((row) => row.slug === "new-zealand")?.kind).toBe(
      "nz-research-batch/1",
    );
    expect(packages.find((row) => row.slug === "armenia")?.kind).toBe(
      "armenia-packed-europe/1",
    );
    // Bosnia gzip is skipped (country !== Armenia). Atlas importer is a later PR.
  });
});

describe("New Zealand adapter", () => {
  const inventory = inventoryCountryPackages(root).packages.find(
    (row) => row.slug === "new-zealand",
  )!;
  const dataset = normalizeCountryPackage(inventory);

  it("keeps fixtures and coverage claims honest", () => {
    expect(dataset.release.provenance.kind).toBe("country_package");
    expect(dataset.release.researchCoverageComplete).toBe(false);
    expect(dataset.countries[0]).toMatchObject({
      id: "new-zealand",
      regionId: "oceania",
      coverageStatus: "partial",
    });
    expect(validateDataset(dataset).errors).toEqual([]);
  });

  it("preserves Takapū and does not invent future results", () => {
    const wellington = dataset.offices.find(
      (office) => office.id === "NZ-WELLINGTON-TAKAPU-NORTHERN-2026",
    );
    expect(wellington?.names.short).toContain("Takapū");
    const upcoming = dataset.events.find(
      (event) => event.officeId === wellington?.id && event.selectedHistoryRole === "none",
    );
    expect(upcoming?.resultRows).toEqual([]);
    expect(upcoming?.legalOutcome).toBe("not_held");
    expect(
      dataset.officeholders.every(
        (row) => row.impliesCurrentTenure === false && row.extensions?.raw && "votes" in row.extensions.raw
          ? row.extensions.raw.votes == null && row.extensions.raw.elected == null
          : true,
      ),
    ).toBe(true);
  });

  it("keeps candidate marks and withheld metrics", () => {
    const westport = dataset.events.find((event) => event.id === "NZ-BULLER-WESTPORT-2025");
    expect(westport?.ballotBasis).toBe("candidate_marks");
    expect(westport?.resultRows.some((row) => row.share.value != null)).toBe(false);
    const ci = dataset.metrics.find((metric) => metric.officeId === "NZ-BULLER-WESTPORT-2026");
    expect(ci?.reviewStatus).toBe("withheld");
    expect(ci?.value.value).toBeNull();
  });
});

describe("Europe workbook adapter", () => {
  it("maps Andorra diacritics, year-only dates, and a recorded-zero CI", () => {
    const inventory = inventoryCountryPackages(root).packages.find(
      (row) => row.slug === "andorra",
    )!;
    const dataset = normalizeCountryPackage(inventory, { verifyFiles: true });
    expect(validateDataset(dataset).errors).toEqual([]);
    expect(dataset.countries[0]?.kind).toBe("sovereign_country");
    expect(dataset.countries[0]?.regionId).toBe("europe");
    const lauria = dataset.offices.find((office) => office.id === "AD-M-06");
    expect(lauria?.names.official).toContain("Sant Julià de Lòria");
    const undated = dataset.events.find(
      (event) => event.officeId === "AD-M-05" && event.date.year === 2019,
    );
    expect(undated?.date.precision).toBe("year");
    expect(undated?.date.day).toBeUndefined();
    const encamp = dataset.metrics.find(
      (metric) => metric.officeId === "AD-M-02" && metric.kind === "competition_index",
    );
    expect(encamp).toMatchObject({
      reviewStatus: "cleared",
      scoreGate: true,
      value: { status: "zero", value: 0 },
    });
    expect(encamp?.value.value).toBe(competitionIndex([36.47859922178989, 12.880886426592802, 10.071210579857578]));
    expect(dataset.polls[0]?.supportsLocalConclusion).toBe(false);
    expect(originalBriefing("andorra", "AD-M-01")).not.toMatch(/<script/i);
  });

  it("keeps Alderney as a territory with conditional 2026 dates", () => {
    const inventory = inventoryCountryPackages(root).packages.find(
      (row) => row.slug === "alderney",
    )!;
    const dataset = normalizeCountryPackage(inventory, { verifyFiles: true });
    expect(validateDataset(dataset).errors).toEqual([]);
    expect(dataset.countries[0]).toMatchObject({
      id: "alderney",
      kind: "territory",
      regionId: "europe",
      coverageStatus: "partial",
    });
    const states = dataset.offices.find((office) => office.id === "GG-ALD-STATES");
    expect(states?.nextElection?.date).toMatchObject({
      precision: "day",
      day: 21,
      month: 11,
      year: 2026,
      certainty: "conditional",
    });
    expect(states?.nextElection?.date.label).toBe("2026-11-21");
  });

  it("loads Albania offices and selected histories from split tables", () => {
    const inventory = inventoryCountryPackages(root).packages.find(
      (row) => row.slug === "albania",
    )!;
    const dataset = normalizeCountryPackage(inventory, { verifyFiles: true });
    expect(validateDataset(dataset).errors).toEqual([]);
    expect(dataset.offices).toHaveLength(122);
    expect(dataset.events.filter((event) => event.selectedHistoryRole === "selected")).toHaveLength(366);
    expect(dataset.countries[0]?.names.official).toBe("Albania");
    expect(dataset.offices.every((office) => office.id !== "albania")).toBe(true);
    const belsh = dataset.offices.find((office) => office.id === "AL-13-M");
    expect(belsh?.names.official).toContain("Belsh");
    const ci = dataset.metrics.find(
      (metric) => metric.officeId === "AL-13-M" && metric.kind === "competition_index",
    );
    expect(ci?.reviewStatus).toBe("withheld");
    expect(ci?.value.value).toBeNull();
    expect(originalBriefing("albania", "AL-01-M")).toContain("Berat");
    expect(originalBriefing("albania", "AL-01-M")).not.toMatch(/<script/i);
  });
});

describe("Armenia packed adapter", () => {
  it("unpacks the split payload without inventing three-cycle scores", () => {
    const inventory = inventoryCountryPackages(root).packages.find(
      (row) => row.slug === "armenia",
    )!;
    const dataset = normalizeCountryPackage(inventory);
    expect(validateDataset(dataset).errors).toEqual([]);
    expect(dataset.offices).toHaveLength(71);
    expect(
      dataset.events.filter((event) => event.selectedHistoryRole === "selected"),
    ).toHaveLength(33);
    expect(dataset.countries[0]?.regionId).toBe("europe");
    expect(
      dataset.metrics
        .filter((metric) => metric.kind === "competition_index")
        .every((metric) => metric.reviewStatus === "withheld"),
    ).toBe(true);
    expect(originalBriefing("armenia", "AM-ABOVYAN-C")).toContain("Abovyan");
    expect(originalBriefing("armenia", "AM-ABOVYAN-C")).not.toMatch(/<script/i);
  });
});

describe("region merge", () => {
  it("marks Europe and Oceania partial without claiming Latin America completeness", () => {
    const latin = emptyDataset(syntheticFixtureDataset.release);
    latin.regions = [
      {
        id: "south-america",
        name: "South America",
        status: "partial",
        isDefaultLanding: true,
        notes: "Latin America research is available with remaining gaps.",
      },
      {
        id: "europe",
        name: "Europe (Russia excluded)",
        status: "not_supplied",
        isDefaultLanding: false,
        notes: "Not in the Latin America zip.",
      },
      {
        id: "new-zealand",
        name: "New Zealand",
        status: "not_supplied",
        isDefaultLanding: false,
        notes: "Not in the Latin America zip.",
      },
      {
        id: "australia",
        name: "Australia",
        status: "not_supplied",
        isDefaultLanding: false,
        notes: "Not in the Latin America zip.",
      },
    ];
    const extras = inventoryCountryPackages(root).packages.map((row) =>
      normalizeCountryPackage(row),
    );
    const merged = mergeCountryPackages(latin, extras);
    expect(merged.regions.find((row) => row.id === "europe")?.status).toBe("partial");
    expect(merged.regions.find((row) => row.id === "oceania")?.status).toBe("partial");
    expect(merged.regions.find((row) => row.id === "australia")?.status).toBe("not_supplied");
    expect(merged.regions.find((row) => row.id === "south-america")?.status).toBe("partial");
    expect(merged.release.researchCoverageComplete).toBe(false);
    expect(merged.countries.map((row) => row.id).sort()).toEqual([
      "albania",
      "alderney",
      "andorra",
      "armenia",
      "new-zealand",
    ]);
    expect(merged.countries.find((row) => row.id === "alderney")?.kind).toBe(
      "territory",
    );
  });
});

describe("import:countries command", () => {
  it("inventories packages without requiring the Latin America zip", () => {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", "scripts/import/countries.ts"],
      { cwd: root, encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("albania");
    expect(result.stdout).toContain("new-zealand");
    expect(result.stdout).toContain('"researchCoverageComplete": false');
  });

  it("reports package validation from the shared helper", () => {
    const result = validateCountryPackages(root);
    expect(result.errors).toEqual([]);
    expect(result.summaries).toHaveLength(5);
  });
});
