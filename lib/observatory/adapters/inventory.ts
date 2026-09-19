import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export type CountryPackageKind =
  | "europe-country-extract/1"
  | "nz-research-batch/1"
  | "armenia-packed-europe/1";

export type CountryPackageInventory = {
  slug: string;
  dir: string;
  kind: CountryPackageKind;
  country: string;
  region: string;
  coverageComplete: false;
  siteIngestionStatus: string;
  adapter: string;
};

function readJson(file: string): Record<string, unknown> | null {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
}

export function classifyCountryPackage(
  dir: string,
): CountryPackageInventory | { slug: string; dir: string; kind: "unknown"; reason: string } {
  const slug = path.basename(dir);
  const manifest = readJson(path.join(dir, "manifest.json"));
  const dataset = readJson(path.join(dir, "dataset.json"));

  if (dataset?.schema_version === "nz-research-batch/1") {
    return {
      slug,
      dir,
      kind: "nz-research-batch/1",
      country: String(dataset.country ?? "New Zealand"),
      region: String(dataset.region ?? "Oceania"),
      coverageComplete: false,
      siteIngestionStatus: String(dataset.site_ingestion_status ?? "pending_adapter"),
      adapter: "new-zealand-batch",
    };
  }

  if (manifest?.schema_version === "europe-country-extract/1") {
    return {
      slug,
      dir,
      kind: "europe-country-extract/1",
      country: String(manifest.country ?? slug),
      region: String(manifest.region ?? "Europe"),
      coverageComplete: false,
      siteIngestionStatus: String(manifest.site_ingestion_status ?? "pending_adapter"),
      adapter: "europe-workbook-extract",
    };
  }

  if (manifest?.chunks && manifest.payload_sha256 && manifest.country) {
    const chunkNames = Object.keys(manifest.chunks as Record<string, unknown>);
    const gzipPacked = chunkNames.some((name) => name.includes(".tar.gz."));
    if (!gzipPacked) {
      return {
        slug,
        dir,
        kind: "unknown",
        reason:
          "Packed Europe payload is not armenia-packed-europe/1 gzip tar chunks. Austria/Bulgaria XZ payloads have no observatory adapter yet; Atlas import is a separate `import:atlas` path.",
      };
    }
    if (manifest.country !== "Armenia") {
      return {
        slug,
        dir,
        kind: "unknown",
        reason: `Packed payload for ${String(manifest.country)} has no website adapter yet (website ingestion pending).`,
      };
    }
    return {
      slug,
      dir,
      kind: "armenia-packed-europe/1",
      country: String(manifest.country),
      region: "Europe",
      coverageComplete: false,
      siteIngestionStatus: String(
        manifest.website_ingestion ?? manifest.site_ingestion_status ?? "pending",
      ),
      adapter: "armenia-packed-payload",
    };
  }

  return {
    slug,
    dir,
    kind: "unknown",
    reason:
      "No supported country-package manifest or dataset.json. The loader does not invent a country from a bare folder.",
  };
}

export function inventoryCountryPackages(
  root = process.cwd(),
): {
  packages: CountryPackageInventory[];
  skipped: Array<{ slug: string; dir: string; reason: string }>;
} {
  const base = path.join(root, "data/countries");
  const packages: CountryPackageInventory[] = [];
  const skipped: Array<{ slug: string; dir: string; reason: string }> = [];
  if (!existsSync(base)) return { packages, skipped };
  for (const name of readdirSync(base).sort()) {
    const dir = path.join(base, name);
    if (!statSync(dir).isDirectory()) continue;
    const classified = classifyCountryPackage(dir);
    if (classified.kind === "unknown") {
      skipped.push({
        slug: classified.slug,
        dir: classified.dir,
        reason: classified.reason,
      });
      continue;
    }
    packages.push(classified);
  }
  return { packages, skipped };
}
