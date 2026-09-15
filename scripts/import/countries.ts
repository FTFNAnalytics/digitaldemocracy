#!/usr/bin/env npx tsx
/**
 * Inventory and validate standalone country research packages under
 * data/countries/*, then print how they map into the observatory schema.
 *
 * Does not invent elections. Source packages remain immutable; site_ingestion_status
 * on the package files stays pending_adapter until a later research revision.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { validateCountryPackages } from "../../lib/observatory/adapters";

export function importCountryPackages(root = process.cwd(), outDir?: string) {
  const result = validateCountryPackages(root);
  const destDir = outDir ?? path.join(root, "data/releases");
  mkdirSync(destDir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    status: result.errors.length ? "blocked" : "partial",
    researchCoverageComplete: false,
    packages: result.summaries,
    skipped: result.skipped,
    errors: result.errors,
    notes: [
      "Adapters read data/countries/* at observatory load time; this command inventories and validates them.",
      "Latin America remains in data/research and is not rewritten.",
      "Package site_ingestion_status fields are left unchanged so frozen extracts stay byte-stable.",
      "HTML briefings are sanitized on display; original bytes stay in the package folders.",
    ],
  };
  const dest = path.join(destDir, "country-packages-report.json");
  writeFileSync(dest, `${JSON.stringify(report, null, 2)}\n`);
  if (result.errors.length) {
    console.error(JSON.stringify(report, null, 2));
    throw new Error(result.errors.join("\n"));
  }
  console.log(
    JSON.stringify(
      {
        command: "import:countries",
        report: dest,
        packages: result.summaries,
        skipped: result.skipped,
        researchCoverageComplete: false,
      },
      null,
      2,
    ),
  );
  return report;
}

const isDirect =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirect) {
  try {
    importCountryPackages();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
