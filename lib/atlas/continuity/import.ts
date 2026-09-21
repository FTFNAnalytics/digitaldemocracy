import { importAlbania, type ImportAlbaniaOptions, type ImportAlbaniaResult } from "../albania/import";
import { importAlderney, type ImportAlderneyResult } from "../alderney/import";
import { importAndorra, type ImportAndorraResult } from "../andorra/import";
import { importArmenia, type ImportArmeniaResult } from "../armenia/import";
import { importAustria, type ImportAustriaResult } from "../austria/import";
import { importBelgium, type ImportBelgiumResult } from "../belgium/import";
import { importBosnia, type ImportBosniaResult } from "../bosnia-and-herzegovina/import";
import { importBulgaria, type ImportBulgariaResult } from "../bulgaria/import";
import { importDenmark, type ImportDenmarkResult } from "../denmark/import";
import { importFinland, type ImportFinlandResult } from "../finland/import";
import { importNetherlands, type ImportNetherlandsResult } from "../netherlands/import";
import { importSweden, type ImportSwedenResult } from "../sweden/import";
import { importSwitzerland, type ImportSwitzerlandResult } from "../switzerland/import";
import { importLatAm } from "./latam";
import { importNewZealand } from "./nz";
import type { ContinuityImportOptions, ContinuityImportResult } from "./run";

export type ImportScope =
  | "albania"
  | "andorra"
  | "alderney"
  | "armenia"
  | "austria"
  | "belgium"
  | "bosnia"
  | "bulgaria"
  | "denmark"
  | "finland"
  | "netherlands"
  | "sweden"
  | "switzerland"
  | "latam"
  | "nz"
  | "all";

export function parseImportScope(value = process.env.ATLAS_IMPORT_SCOPE): ImportScope {
  const raw = (value ?? "all").trim().toLowerCase();
  if (
    raw === "albania" ||
    raw === "andorra" ||
    raw === "alderney" ||
    raw === "armenia" ||
    raw === "austria" ||
    raw === "belgium" ||
    raw === "bosnia" ||
    raw === "bulgaria" ||
    raw === "denmark" ||
    raw === "finland" ||
    raw === "netherlands" ||
    raw === "sweden" ||
    raw === "switzerland" ||
    raw === "latam" ||
    raw === "nz" ||
    raw === "all"
  ) {
    return raw;
  }
  throw new Error(
    `Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|andorra|alderney|armenia|austria|belgium|bosnia|bulgaria|denmark|finland|netherlands|sweden|switzerland|latam|nz|all`,
  );
}

export type MultiLineageImportResult = {
  albania?: ImportAlbaniaResult;
  andorra?: ImportAndorraResult;
  alderney?: ImportAlderneyResult;
  armenia?: ImportArmeniaResult;
  austria?: ImportAustriaResult;
  belgium?: ImportBelgiumResult;
  bosnia?: ImportBosniaResult;
  bulgaria?: ImportBulgariaResult;
  denmark?: ImportDenmarkResult;
  finland?: ImportFinlandResult;
  netherlands?: ImportNetherlandsResult;
  sweden?: ImportSwedenResult;
  switzerland?: ImportSwitzerlandResult;
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
  if (scope === "alderney" || scope === "all") {
    result.alderney = importAlderney(options);
  }
  if (scope === "armenia" || scope === "all") {
    result.armenia = importArmenia(options);
  }
  if (scope === "austria" || scope === "all") {
    result.austria = importAustria(options);
  }
  if (scope === "belgium" || scope === "all") {
    result.belgium = importBelgium(options);
  }
  if (scope === "bosnia" || scope === "all") {
    result.bosnia = importBosnia(options);
  }
  if (scope === "bulgaria" || scope === "all") {
    result.bulgaria = importBulgaria(options);
  }
  if (scope === "netherlands" || scope === "all") {
    result.netherlands = importNetherlands(options);
  }
  if (scope === "switzerland" || scope === "all") {
    result.switzerland = importSwitzerland(options);
  }
  if (scope === "latam" || scope === "all") {
    result.latam = importLatAm(options);
  }
  if (scope === "nz" || scope === "all") {
    result.nz = importNewZealand(options);
  }
  // Denmark then Sweden then Finland last on `all`: large result tables would otherwise
  // sit in the published DB that LatAm copies into staging.
  if (scope === "denmark" || scope === "all") {
    result.denmark = importDenmark(options);
  }
  if (scope === "sweden" || scope === "all") {
    result.sweden = importSweden(options);
  }
  if (scope === "finland" || scope === "all") {
    result.finland = importFinland(options);
  }
  return result;
}
