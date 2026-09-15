import path from "node:path";

/** Preferred production path on the VPS. Override with ATLAS_SQLITE_PATH. */
export const PRODUCTION_ATLAS_SQLITE_PATH = "/var/lib/cdd/atlas.sqlite";

/** Default local / CI file, relative to the repo root (gitignored). */
export const DEFAULT_ATLAS_SQLITE_RELATIVE = "data/master/atlas.sqlite";

export const ATLAS_SQLITE_ENV = "ATLAS_SQLITE_PATH";

export function repoRoot(cwd = process.cwd()): string {
  return path.resolve(cwd);
}

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Resolve the Atlas master SQLite path.
 *
 * `ATLAS_SQLITE_PATH` wins when set (absolute, or relative to cwd).
 * Otherwise local/CI default to `data/master/atlas.sqlite` under cwd.
 * Production should set the env var to `/var/lib/cdd/atlas.sqlite`
 * (or the app-local fallback documented in docs/atlas-plan.md).
 */
export function resolveAtlasSqlitePath(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): string {
  const override = trimEnv(env[ATLAS_SQLITE_ENV]);
  if (override) {
    return path.isAbsolute(override) ? override : path.resolve(cwd, override);
  }
  return path.resolve(cwd, DEFAULT_ATLAS_SQLITE_RELATIVE);
}
