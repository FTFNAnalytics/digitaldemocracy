import { importAlbania, type ImportAlbaniaOptions, type ImportAlbaniaResult } from "../albania/import";
import { importAndorra, type ImportAndorraResult } from "../andorra/import";
import { importLatAm } from "./latam";
import { importNewZealand } from "./nz";
import type { ContinuityImportOptions, ContinuityImportResult } from "./run";

export type ImportScope = "albania" | "andorra" | "latam" | "nz" | "all";

export function parseImportScope(value = process.env.ATLAS_IMPORT_SCOPE): ImportScope {
  const raw = (value ?? "all").trim().toLowerCase();
  if (raw === "albania" || raw === "andorra" || raw === "latam" || raw === "nz" || raw === "all") return raw;
  throw new Error(`Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|andorra|latam|nz|all`);
}

export type MultiLineageImportResult = {
  albania?: ImportAlbaniaResult;
  andorra?: ImportAndorraResult;
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
  if (scope === "andorra" || scope === "all") {
    result.andorra = importAndorra(options);
  }
  if (scope === "latam" || scope === "all") {
    result.latam = importLatAm(options);
  }
  if (scope === "nz" || scope === "all") {
    result.nz = importNewZealand(options);
  }
  return result;
}
