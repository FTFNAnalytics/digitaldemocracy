#!/usr/bin/env npx tsx
/**
 * Deterministic import entry.
 *
 * Default: require Latin_America_Races_and_Briefings.zip and fail clearly
 * when it is absent. Import validates source identities and references before
 * publishing the normalized release.
 *
 * --fixtures writes a reconciliation report describing the synthetic
 * smoke-test dataset. It does not claim research coverage is complete.
 *
 * --countries inventories data/countries/* without requiring the Latin
 * America zip. Combine with a zip path to import both.
 */
import { importRelease } from "./release";
import { importCountryPackages } from "./countries";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { INPUT_MANIFEST, RELEASE_PACKAGE_FILENAME } from "../../schemas/v1/input-manifest";
import {
  KNOWN_LEGACY_DEFECTS,
  RECONCILIATION_REPORT_VERSION,
  type ReconciliationReport,
} from "../../schemas/v1/reconciliation";
import { missingZipMessage, resolveReleaseZip } from "../lib/release-paths";
import { syntheticFixtureDataset } from "../../data/normalized/synthetic-fixture-v0";

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function writeReport(report: ReconciliationReport, outDir: string) {
  mkdirSync(outDir, { recursive: true });
  const dest = path.join(outDir, "reconciliation-report.json");
  writeFileSync(dest, `${JSON.stringify(report, null, 2)}\n`);
  return dest;
}

function fixtureReport(): ReconciliationReport {
  const release = syntheticFixtureDataset.release;
  return {
    schemaVersion: RECONCILIATION_REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    releaseId: release.id,
    status: "partial",
    inventory: [],
    legacyDefects: KNOWN_LEGACY_DEFECTS,
    totals: {
      source: "recomputed",
      currentOffices: release.validatedCounts.currentOffices,
      historicalOffices: release.validatedCounts.historicalOffices,
      histories: release.validatedCounts.histories,
      resultRows: release.validatedCounts.resultRows,
      briefings: release.validatedCounts.briefings,
      notes:
        "Totals are from the synthetic fixture only and must not be presented as Latin America coverage.",
    },
    discrepancies: [
      {
        code: "FIXTURE_ONLY",
        severity: "warning",
        message: `This fixture-only run does not inventory ${RELEASE_PACKAGE_FILENAME} or change the real research release.`,
      },
    ],
    unimportedFiles: [
      {
        path: RELEASE_PACKAGE_FILENAME,
        reason: "Fixture mode does not load the research package.",
      },
    ],
    notes: [
      "Adapters for country JSON, supplementary evidence, completion-queue CSV, and briefings are defined in schemas/v1/input-manifest.ts but have not run against real files.",
      "Re-importing the same real release must be identity-stable; this fixture path is exempt because it is not a research release.",
    ],
  };
}

function blockedReport(message: string): ReconciliationReport {
  return {
    schemaVersion: RECONCILIATION_REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    releaseId: null,
    status: "blocked",
    blocker: {
      missing: [RELEASE_PACKAGE_FILENAME],
      message,
    },
    inventory: [],
    legacyDefects: KNOWN_LEGACY_DEFECTS,
    totals: {
      source: "unavailable",
      currentOffices: null,
      historicalOffices: null,
      histories: null,
      resultRows: null,
      briefings: null,
      notes: "No release files were hashed. Do not display handoff headline counts as live totals.",
    },
    discrepancies: [],
    unimportedFiles: [
      {
        path: RELEASE_PACKAGE_FILENAME,
        reason: "Required input is missing. Import did not invent elections.",
      },
    ],
    notes: [
      `Recognized document types: ${INPUT_MANIFEST.map((entry) => entry.documentType).join(", ")}`,
      "When the zip arrives: extract, hash, classify, normalize South America first, then write a fresh reconciliation report.",
    ],
  };
}

function main() {
  const fixtures = hasFlag("--fixtures");
  const countries = hasFlag("--countries");
  const zipArg = argValue("--zip");
  const outDir = argValue("--out") ?? path.join(process.cwd(), "data/releases");

  if (fixtures) {
    const dest = writeReport(fixtureReport(), outDir);
    console.log("Imported synthetic fixtures for layout/smoke tests only.");
    console.log(`Wrote ${dest}`);
    console.log("Research coverage is NOT complete.");
    process.exit(0);
  }

  if (countries && !zipArg) {
    const zip = resolveReleaseZip();
    if (!zip) {
      importCountryPackages(process.cwd(), outDir);
      process.exit(0);
    }
  }

  const zip = resolveReleaseZip(zipArg);
  if (!zip) {
    const message = missingZipMessage(zipArg);
    writeReport(blockedReport(message), outDir);
    console.error(message);
    process.exit(1);
  }

  importRelease(zip);
  if (countries) importCountryPackages(process.cwd(), outDir);
}

main();
