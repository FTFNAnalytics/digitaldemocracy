#!/usr/bin/env npx tsx
/**
 * Integrity, count, link, and methodology checks.
 *
 * Default: validate the versioned normalized research release.
 * --fixtures: validate the synthetic dataset used for smoke tests.
 */
import { validateDataset } from "./dataset";
import { loadResearch } from "../../lib/observatory/research";
import {
  attachCountryPackages,
  validateCountryPackages,
} from "../../lib/observatory/adapters";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { missingZipMessage } from "../lib/release-paths";
import { syntheticFixtureDataset } from "../../data/normalized/synthetic-fixture-v0";
import { assertNotCoercedToFirstOfMonth } from "../../lib/observatory/dates";
import {
  competitionIndex,
  isClearedMetric,
  isMissing,
  isRecordedZero,
} from "../../lib/observatory/metrics";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function validateFixtures() {
  const data = syntheticFixtureDataset;
  const errors: string[] = [];

  if (data.release.provenance.kind !== "synthetic_fixture") {
    errors.push("Fixture dataset must be marked synthetic_fixture.");
  }
  if (data.release.researchCoverageComplete !== false) {
    errors.push("Fixture dataset must not claim research coverage is complete.");
  }

  const current = data.offices.filter((office) => office.status === "current");
  const historical = data.offices.filter((office) => office.status === "historical");
  if (current.length !== data.release.validatedCounts.currentOffices) {
    errors.push("Current-office total does not match recomputed offices.");
  }
  if (historical.length !== data.release.validatedCounts.historicalOffices) {
    errors.push("Historical offices must be excluded from current-office totals.");
  }

  const governor = data.offices.find((office) => office.id === "FIX-P-1");
  const mayor = data.offices.find((office) => office.id === "FIX-M-1");
  if (!governor || governor.selectedHistoryKeys.length !== 3) {
    errors.push("FIX-P-1 should have three selected histories.");
  }
  if (!mayor || mayor.selectedHistoryKeys.length !== 1) {
    errors.push("FIX-M-1 should remain a one-cycle structural shortfall.");
  }

  const ci = data.metrics.find((metric) => metric.id === "MET-FIX-P-1-CI");
  if (!ci) errors.push("Missing FIX-P-1 CI metric.");
  else if (isClearedMetric(ci)) {
    errors.push("score_gate false must prevent a cleared-score claim.");
  } else if (ci.value.value !== competitionIndex([4, 8, 12])) {
    errors.push("FIX-P-1 CI does not match the documented formula.");
  }

  const mayorCi = data.metrics.find((metric) => metric.id === "MET-FIX-M-1-CI");
  if (mayorCi && mayorCi.reviewStatus !== "ineligible") {
    errors.push("Single-cycle office must not receive a cleared or provisional CI badge as if three cycles exist.");
  }

  const zero = data.events
    .flatMap((event) => event.resultRows)
    .find((row) => row.id === "FIX-P-1-2016-Z");
  const missing = data.events
    .flatMap((event) => event.resultRows)
    .find((row) => row.id === "FIX-P-1-2016-U");
  if (!zero || !isRecordedZero(zero.votes)) errors.push("Recorded zero row missing.");
  if (!missing || !isMissing(missing.votes)) errors.push("Unknown votes must stay null, not zero.");

  const march = data.events.find((event) => event.id === "FIX-P-1-2028-expected");
  if (march) {
    try {
      assertNotCoercedToFirstOfMonth(march.date);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
    if (march.date.label !== "March 2028" || march.date.day != null) {
      errors.push("March 2028 must not become 1 March 2028.");
    }
  }

  const annulled = data.events.find((event) => event.id === "FIX-P-1-2012-annulled");
  const replacement = data.events.find((event) => event.id === "FIX-P-1-2013-repeat");
  if (annulled?.legalOutcome !== "annulled" || replacement?.legalOutcome !== "certified") {
    errors.push("Annulled and replacement events must keep distinct legal outcomes.");
  }

  const national = data.polls.find((poll) => poll.id === "POLL-FIX-NAT-1");
  if (national?.supportsLocalConclusion) {
    errors.push("National approval must not support a local conclusion.");
  }

  const officeIds = new Set(data.offices.map((office) => office.id));
  for (const event of data.events) {
    if (!officeIds.has(event.officeId)) {
      errors.push(`Event ${event.id} points at missing office ${event.officeId}`);
    }
  }

  if (errors.length) {
    fail(`Fixture validation failed:\n- ${errors.join("\n- ")}`);
  }

  console.log("Fixture validation passed.");
  console.log("Synthetic fixtures are test data and do not establish research completeness.");
}

function main() {
  const fixtures = hasFlag("--fixtures");
  const zipArg = argValue("--zip");

  if (fixtures) {
    validateFixtures();
    const reportPath = path.join(process.cwd(), "data/releases/reconciliation-report.json");
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, "utf8")) as { status?: string };
      if (report.status === "complete") {
        fail("Reconciliation report must not be marked complete while only fixtures exist.");
      }
    }
    process.exit(0);
  }

  const manifest = path.join(process.cwd(), "data/research/manifest.json");
  if (!existsSync(manifest)) fail(missingZipMessage(zipArg));

  const latin = loadResearch(process.cwd());
  const latinResult = validateDataset(latin);
  if (latinResult.errors.length) fail(latinResult.errors.join("\n"));

  const countries = validateCountryPackages(process.cwd());
  if (countries.errors.length) {
    fail(`Country package validation failed:\n- ${countries.errors.join("\n- ")}`);
  }

  const merged = attachCountryPackages(latin, process.cwd());
  const mergedResult = validateDataset(merged);
  if (mergedResult.errors.length) fail(mergedResult.errors.join("\n"));

  console.log(
    JSON.stringify({
      latinAmerica: latinResult,
      countryPackages: {
        packages: countries.summaries,
        skipped: countries.skipped,
        checks: countries.summaries.length,
      },
      merged: mergedResult,
      researchCoverageComplete: false,
    }),
  );
}

main();
