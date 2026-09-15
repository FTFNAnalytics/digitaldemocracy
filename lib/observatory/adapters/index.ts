import type { NormalizedDataset } from "../../../schemas/v1/normalized";
import { validateDataset } from "../../../scripts/validate/dataset";
import { normalizeArmeniaPackage } from "./armenia";
import { normalizeEuropeExtract } from "./europe";
import {
  inventoryCountryPackages,
  type CountryPackageInventory,
} from "./inventory";
import { mergeCountryPackages } from "./merge";
import { normalizeNewZealandPackage } from "./new-zealand";

export type LoadedCountryPackage = {
  inventory: CountryPackageInventory;
  dataset: NormalizedDataset;
};

export function normalizeCountryPackage(
  inventory: CountryPackageInventory,
  options?: { verifyFiles?: boolean },
): NormalizedDataset {
  switch (inventory.kind) {
    case "europe-country-extract/1":
      return normalizeEuropeExtract(inventory, options);
    case "nz-research-batch/1":
      return normalizeNewZealandPackage(inventory);
    case "armenia-packed-europe/1":
      return normalizeArmeniaPackage(inventory);
    default: {
      const never: never = inventory.kind;
      throw new Error(`Unsupported country package: ${never}`);
    }
  }
}

export function loadAllCountryPackages(
  root = process.cwd(),
  options?: { verifyFiles?: boolean },
): LoadedCountryPackage[] {
  const { packages } = inventoryCountryPackages(root);
  return packages.map((inventory) => ({
    inventory,
    dataset: normalizeCountryPackage(inventory, options),
  }));
}

export function attachCountryPackages(
  latin: NormalizedDataset,
  root = process.cwd(),
): NormalizedDataset {
  const loaded = loadAllCountryPackages(root);
  return mergeCountryPackages(
    latin,
    loaded.map((row) => row.dataset),
  );
}

export function validateCountryPackages(root = process.cwd()) {
  const { packages, skipped } = inventoryCountryPackages(root);
  const errors: string[] = [];
  const summaries: Array<{
    slug: string;
    kind: string;
    country: string;
    offices: number;
    events: number;
    resultRows: number;
    briefings: number;
  }> = [];
  for (const inventory of packages) {
    try {
      const dataset = normalizeCountryPackage(inventory, { verifyFiles: true });
      const result = validateDataset(dataset);
      if (result.errors.length) {
        errors.push(
          `${inventory.slug}: ${result.errors.slice(0, 12).join("; ")}`,
        );
      }
      summaries.push({
        slug: inventory.slug,
        kind: inventory.kind,
        country: inventory.country,
        offices: dataset.offices.length,
        events: dataset.events.filter((e) => e.selectedHistoryRole !== "none")
          .length,
        resultRows: dataset.events.reduce((n, e) => n + e.resultRows.length, 0),
        briefings: dataset.release.validatedCounts.briefings,
      });
    } catch (error) {
      errors.push(
        `${inventory.slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return { packages, skipped, summaries, errors };
}

export {
  inventoryCountryPackages,
  mergeCountryPackages,
  normalizeArmeniaPackage,
  normalizeEuropeExtract,
  normalizeNewZealandPackage,
};
