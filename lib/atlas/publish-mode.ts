/**
 * How an Atlas import publishes the master.
 *
 * `live` — open the existing master in WAL mode and commit one country-scoped
 * transaction. No `VACUUM INTO` copy of the multi-GB file.
 * `restage` — `VACUUM INTO` a sibling staging file, rebuild every derived row,
 * then atomically rename over the master.
 *
 * A scoped import (`ATLAS_IMPORT_SCOPE` set to one country, `nz`, or `latam`)
 * uses `live` when the master file already exists. The full-master restage
 * runs when the scope is unset or `all`, or when the operator sets
 * `ATLAS_PUBLISH_RESTAGE=1`.
 */

export type AtlasPublishMode = "live" | "restage";

/**
 * Next.js declares `NODE_ENV` required on `NodeJS.ProcessEnv`, so a fixture
 * that only sets `ATLAS_IMPORT_SCOPE` is not a `ProcessEnv`. These helpers
 * read two variables and accept a partial env, including `process.env`.
 */
type AtlasPublishEnv = Partial<NodeJS.ProcessEnv>;

const SCOPE_COUNTRY_ID: Record<string, string> = {
  united_kingdom: "united-kingdom",
  bosnia: "bosnia-and-herzegovina",
  north_macedonia: "north-macedonia",
  nz: "new-zealand",
};

/** Lineage id for the LatAm continuity pack. Kept here to avoid an import cycle. */
export const LATAM_LINEAGE_ID = "latin-america-fe5e91689def";

export function atlasPublishRestageRequested(
  env: AtlasPublishEnv = process.env,
): boolean {
  const flag = (env.ATLAS_PUBLISH_RESTAGE ?? "").trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export function resolveAtlasPublishMode(env: AtlasPublishEnv = process.env): AtlasPublishMode {
  if (atlasPublishRestageRequested(env)) return "restage";
  const scope = (env.ATLAS_IMPORT_SCOPE ?? "").trim().toLowerCase();
  // Unset scope is the full-master rebuild path (the CLI treats that as every
  // lineage in the default set). A named country scope publishes in place.
  if (scope === "" || scope === "all") return "restage";
  return "live";
}

/**
 * `country_id` for a single-country scope.
 * `latam` covers many countries and returns null; callers list them from the master.
 * `all` and an unset scope return null.
 */
export function countryIdForImportScope(scope: string | undefined | null): string | null {
  const raw = (scope ?? "").trim().toLowerCase();
  if (raw === "" || raw === "all" || raw === "latam") return null;
  return SCOPE_COUNTRY_ID[raw] ?? raw;
}

export function describeAtlasPublishMode(env: AtlasPublishEnv = process.env): string {
  const mode = resolveAtlasPublishMode(env);
  // An empty env is the full-master path. import:atlas names that path `all`.
  const scope = (env.ATLAS_IMPORT_SCOPE ?? "").trim() || "all";
  if (mode === "restage") {
    const reason = atlasPublishRestageRequested(env) ? "ATLAS_PUBLISH_RESTAGE" : "full-master";
    return `publish_mode=restage vacuum_into=yes reason=${reason} scope=${scope}`;
  }
  return `publish_mode=live vacuum_into=no scope=${scope}`;
}
