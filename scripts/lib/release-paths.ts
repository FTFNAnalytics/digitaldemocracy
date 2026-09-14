import { existsSync } from "node:fs";
import path from "node:path";
import { RELEASE_PACKAGE_FILENAME, ZIP_SEARCH_PATHS } from "../../schemas/v1/input-manifest";

export function repoRoot(): string {
  return process.cwd();
}

export function resolveReleaseZip(cliPath?: string): string | null {
  const fromEnv = process.env.ELECTION_RELEASE_ZIP;
  const candidates = [
    cliPath,
    fromEnv,
    ...ZIP_SEARCH_PATHS.map((rel) => path.join(repoRoot(), rel)),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const resolved = path.isAbsolute(candidate)
      ? candidate
      : path.join(repoRoot(), candidate);
    if (existsSync(resolved)) return resolved;
  }
  return null;
}

export function missingZipMessage(tried?: string): string {
  const searched = [
    tried ? `CLI --zip ${tried}` : null,
    "ELECTION_RELEASE_ZIP",
    ...ZIP_SEARCH_PATHS,
  ]
    .filter(Boolean)
    .join("\n  - ");

  return [
    `Missing required research package: ${RELEASE_PACKAGE_FILENAME}`,
    "",
    "The Subnational Election Observatory will not invent Latin America elections.",
    "Place the zip in one of these locations, or pass --zip / set ELECTION_RELEASE_ZIP:",
    `  - ${searched}`,
    "",
    "Then run: npm run import:data",
    "For layout/smoke tests only: npm run import:data -- --fixtures",
  ].join("\n");
}
