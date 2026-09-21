import { writeSync } from "node:fs";
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
import { importIreland, type ImportIrelandResult } from "../ireland/import";
import { importNetherlands, type ImportNetherlandsResult } from "../netherlands/import";
import { importSweden, type ImportSwedenResult } from "../sweden/import";
import { importNorway, type ImportNorwayResult } from "../norway/import";
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
  | "ireland"
  | "netherlands"
  | "norway"
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
    raw === "ireland" ||
    raw === "netherlands" ||
    raw === "norway" ||
    raw === "sweden" ||
    raw === "switzerland" ||
    raw === "latam" ||
    raw === "nz" ||
    raw === "all"
  ) {
    return raw;
  }
  throw new Error(
    `Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|andorra|alderney|armenia|austria|belgium|bosnia|bulgaria|denmark|finland|ireland|netherlands|norway|sweden|switzerland|latam|nz|all`,
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
  ireland?: ImportIrelandResult;
  netherlands?: ImportNetherlandsResult;
  sweden?: ImportSwedenResult;
  norway?: ImportNorwayResult;
  switzerland?: ImportSwitzerlandResult;
  latam?: ContinuityImportResult;
  nz?: ContinuityImportResult;
};

function noteImport(label: string): void {
  if (process.env.ATLAS_IMPORT_PROGRESS !== "1") return;
  writeSync(1, `import:atlas ${label} ${new Date().toISOString()}\n`);
}

function runImport<T>(label: string, load: () => T): T {
  noteImport(`start ${label}`);
  const value = load();
  noteImport(`done ${label}`);
  return value;
}

export function importAtlasLineages(
  options: ContinuityImportOptions & ImportAlbaniaOptions,
  scope: ImportScope = parseImportScope(),
): MultiLineageImportResult {
  const result: MultiLineageImportResult = {};
  if (scope === "albania" || scope === "all") {
    result.albania = runImport("albania", () => importAlbania(options));
  }
  if (scope === "andorra" || scope === "all") {
    result.andorra = runImport("andorra", () => importAndorra(options));
  }
  if (scope === "alderney" || scope === "all") {
    result.alderney = runImport("alderney", () => importAlderney(options));
  }
  if (scope === "armenia" || scope === "all") {
    result.armenia = runImport("armenia", () => importArmenia(options));
  }
  if (scope === "austria" || scope === "all") {
    result.austria = runImport("austria", () => importAustria(options));
  }
  if (scope === "belgium" || scope === "all") {
    result.belgium = runImport("belgium", () => importBelgium(options));
  }
  if (scope === "bosnia" || scope === "all") {
    result.bosnia = runImport("bosnia", () => importBosnia(options));
  }
  if (scope === "bulgaria" || scope === "all") {
    result.bulgaria = runImport("bulgaria", () => importBulgaria(options));
  }
  if (scope === "netherlands" || scope === "all") {
    result.netherlands = runImport("netherlands", () => importNetherlands(options));
  }
  if (scope === "switzerland" || scope === "all") {
    result.switzerland = runImport("switzerland", () => importSwitzerland(options));
  }
  if (scope === "latam" || scope === "all") {
    result.latam = runImport("latam", () => importLatAm(options));
  }
  if (scope === "nz" || scope === "all") {
    result.nz = runImport("nz", () => importNewZealand(options));
  }
  // Denmark then Sweden then Finland then Norway then Ireland last on `all`:
  // large result tables would otherwise sit in the published DB that LatAm copies into staging.
  if (scope === "denmark" || scope === "all") {
    result.denmark = runImport("denmark", () => importDenmark(options));
  }
  if (scope === "sweden" || scope === "all") {
    result.sweden = importSweden(options);
  }
  if (scope === "finland" || scope === "all") {
    result.finland = importFinland(options);
  }
  if (scope === "norway" || scope === "all") {
    result.norway = importNorway(options);
  }
  if (scope === "ireland" || scope === "all") {
    result.ireland = runImport("ireland", () => importIreland(options));
  }
  return result;
}
