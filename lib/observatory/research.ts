import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import type { NormalizedDataset } from "../../schemas/v1/normalized";
import { attachCountryPackages } from "./adapters";

/** Latin America release only. Country packages are attached in loadObservatoryDataset. */
export function loadResearch(root = process.cwd()): NormalizedDataset {
  const dir = path.join(root, "data/research");
  const manifest = JSON.parse(
    readFileSync(path.join(dir, "manifest.json"), "utf8"),
  );
  if (manifest.schemaVersion !== "1.1.0")
    throw new Error("Unsupported research schema");
  const read = (name: string, sha: string) => {
    const bytes = readFileSync(path.join(dir, name));
    if (createHash("sha256").update(bytes).digest("hex") !== sha)
      throw new Error(`Research checksum mismatch: ${name}`);
    return JSON.parse(gunzipSync(bytes).toString("utf8")) as NormalizedDataset;
  };
  const data = read("base.json.gz", manifest.baseSha256);
  for (const f of manifest.countryFiles) {
    const part = read(f.path, f.sha256);
    for (const k of Object.keys(data) as (keyof NormalizedDataset)[]) {
      if (k === "release") continue;
      (data[k] as unknown[]).push(...(part[k] as unknown[]));
    }
  }
  return data;
}

/** Latin America release plus standalone `data/countries/*` packages. */
export function loadObservatoryDataset(root = process.cwd()): NormalizedDataset {
  return attachCountryPackages(loadResearch(root), root);
}
