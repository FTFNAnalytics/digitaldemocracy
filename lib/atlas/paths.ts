import path from "node:path";

/** Preferred production path on the VPS. Override with ATLAS_SQLITE_PATH. */
export const PRODUCTION_ATLAS_SQLITE_PATH = "/var/lib/cdd/atlas.sqlite";

/** Preferred production sibling ledger. Override with ATLAS_ATTEMPTS_SQLITE_PATH. */
export const PRODUCTION_ATLAS_ATTEMPTS_SQLITE_PATH = "/var/lib/cdd/atlas-attempts.sqlite";

/** Default local / CI master file, relative to the repo root (gitignored). */
export const DEFAULT_ATLAS_SQLITE_RELATIVE = "data/master/atlas.sqlite";

/** Default local / CI durable attempt ledger, relative to the repo root (gitignored). */
export const DEFAULT_ATLAS_ATTEMPTS_SQLITE_RELATIVE = "data/master/atlas-attempts.sqlite";

export const ATLAS_SQLITE_ENV = "ATLAS_SQLITE_PATH";
export const ATLAS_ATTEMPTS_SQLITE_ENV = "ATLAS_ATTEMPTS_SQLITE_PATH";

export function repoRoot(cwd = process.cwd()): string {
  return path.resolve(cwd);
}

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolvePath(
  env: Record<string, string | undefined>,
  cwd: string,
  envName: string,
  relativeDefault: string,
): string {
  const override = trimEnv(env[envName]);
  if (override) {
    return path.isAbsolute(override) ? override : path.resolve(cwd, override);
  }
  return path.resolve(cwd, relativeDefault);
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
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
): string {
  return resolvePath(env, cwd, ATLAS_SQLITE_ENV, DEFAULT_ATLAS_SQLITE_RELATIVE);
}

/**
 * Resolve the durable Atlas attempt ledger path.
 *
 * `ATLAS_ATTEMPTS_SQLITE_PATH` wins when set. Otherwise local/CI default to
 * `data/master/atlas-attempts.sqlite`. This file is a sibling of the master
 * DB and is never renamed/replaced when a publication is swapped.
 */
export function resolveAtlasAttemptsSqlitePath(
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
): string {
  return resolvePath(env, cwd, ATLAS_ATTEMPTS_SQLITE_ENV, DEFAULT_ATLAS_ATTEMPTS_SQLITE_RELATIVE);
}
