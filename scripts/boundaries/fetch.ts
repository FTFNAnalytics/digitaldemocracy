#!/usr/bin/env npx tsx
/**
 * Download boundary sources listed in data/boundaries/manifest.json.
 * Writes only under data/boundaries/incoming/ (gitignored) after the
 * committed sha256 and byte count match. Does not draw shapes.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { ensureManifestSource, parseManifest } from "../../lib/atlas/boundaries/manifest";

const MANIFEST_PATH = path.join("data", "boundaries", "manifest.json");
const INCOMING_DIR = path.join("data", "boundaries", "incoming");

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  return process.argv[index + 1];
}

async function main(): Promise<void> {
  const manifest = parseManifest(JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as unknown);
  const only = argument("--source");
  const sources = only ? manifest.sources.filter((source) => source.id === only) : manifest.sources;
  if (only && sources.length === 0) {
    throw new Error(`manifest has no source ${only}`);
  }
  for (const source of sources) {
    const result = await ensureManifestSource(source, INCOMING_DIR);
    console.log(
      result.skipped
        ? `checksum ok, skipped download: ${source.id} → ${result.path}`
        : `downloaded ${source.id} → ${result.path} (${source.bytes} bytes)`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
