import { importAlbania, type ImportAlbaniaOptions, type ImportAlbaniaResult } from "../albania/import";
import { importAlderney, type ImportAlderneyResult } from "../alderney/import";
import { importLatAm } from "./latam";
import { importNewZealand } from "./nz";
import type { ContinuityImportOptions, ContinuityImportResult } from "./run";

export type ImportScope = "albania" | "alderney" | "latam" | "nz" | "all";

export function parseImportScope(value = process.env.ATLAS_IMPORT_SCOPE): ImportScope {
  const raw = (value ?? "all").trim().toLowerCase();
  if (raw === "albania" || raw === "alderney" || raw === "latam" || raw === "nz" || raw === "all") return raw;
  throw new Error(`Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|alderney|latam|nz|all`);
}

export type MultiLineageImportResult = {
  albania?: ImportAlbaniaResult;
  alderney?: ImportAlderneyResult;
  latam?: ContinuityImportResult;
  nz?: ContinuityImportResult;
};

export function importAtlasLineages(
  options: ContinuityImportOptions & ImportAlbaniaOptions,
  scope: ImportScope = parseImportScope(),
): MultiLineageImportResult {
  const result: MultiLineageImportResult = {};
  if (scope === "albania" || scope === "all") {
    result.albania = importAlbania(options);
  }
  if (scope === "alderney" || scope === "all") {
    result.alderney = importAlderney(options);
  }
  if (scope === "latam" || scope === "all") {
    result.latam = importLatAm(options);
  }
  if (scope === "nz" || scope === "all") {
    result.nz = importNewZealand(options);
  }
  return result;
}
