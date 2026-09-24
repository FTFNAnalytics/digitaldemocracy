import { writeSync } from "node:fs";
import { importAlbania, type ImportAlbaniaOptions, type ImportAlbaniaResult } from "../albania/import";
import { importAlderney, type ImportAlderneyResult } from "../alderney/import";
import { importAndorra, type ImportAndorraResult } from "../andorra/import";
import { importArmenia, type ImportArmeniaResult } from "../armenia/import";
import { importAustria, type ImportAustriaResult } from "../austria/import";
import { importBelgium, type ImportBelgiumResult } from "../belgium/import";
import { importBosnia, type ImportBosniaResult } from "../bosnia-and-herzegovina/import";
import { importBulgaria, type ImportBulgariaResult } from "../bulgaria/import";
import { importCroatia, type ImportCroatiaResult } from "../croatia/import";
import { importCzechia, type ImportCzechiaResult } from "../czechia/import";
import { importDenmark, type ImportDenmarkResult } from "../denmark/import";
import { importEstonia, type ImportEstoniaResult } from "../estonia/import";
import { importLatvia, type ImportLatviaResult } from "../latvia/import";
import { importFinland, type ImportFinlandResult } from "../finland/import";
import { importLithuania, type ImportLithuaniaResult } from "../lithuania/import";
import { importIreland, type ImportIrelandResult } from "../ireland/import";
import { importNetherlands, type ImportNetherlandsResult } from "../netherlands/import";
import { importNorway, type ImportNorwayResult } from "../norway/import";
import { importPoland, type ImportPolandResult } from "../poland/import";
import { importPortugal, type ImportPortugalResult } from "../portugal/import";
import { importSpain, type ImportSpainResult } from "../spain/import";
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
  | "croatia"
  | "czechia"
  | "denmark"
  | "estonia"
  | "latvia"
  | "lithuania"
  | "finland"
  | "ireland"
  | "netherlands"
  | "norway"
  | "poland"
  | "portugal"
  | "spain"
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
    raw === "croatia" ||
    raw === "czechia" ||
    raw === "denmark" ||
    raw === "estonia" ||
    raw === "latvia" ||
    raw === "lithuania" ||
    raw === "finland" ||
    raw === "ireland" ||
    raw === "netherlands" ||
    raw === "norway" ||
    raw === "poland" ||
    raw === "portugal" ||
    raw === "spain" ||
    raw === "sweden" ||
    raw === "switzerland" ||
    raw === "latam" ||
    raw === "nz" ||
    raw === "all"
  ) {
    return raw;
  }
  throw new Error(
    `Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|andorra|alderney|armenia|austria|belgium|bosnia|bulgaria|croatia|czechia|denmark|estonia|latvia|lithuania|finland|ireland|netherlands|norway|poland|portugal|spain|sweden|switzerland|latam|nz|all`,
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
  croatia?: ImportCroatiaResult;
  czechia?: ImportCzechiaResult;
  denmark?: ImportDenmarkResult;
  estonia?: ImportEstoniaResult;
  latvia?: ImportLatviaResult;
  lithuania?: ImportLithuaniaResult;
  finland?: ImportFinlandResult;
  ireland?: ImportIrelandResult;
  netherlands?: ImportNetherlandsResult;
  norway?: ImportNorwayResult;
  poland?: ImportPolandResult;
  portugal?: ImportPortugalResult;
  spain?: ImportSpainResult;
  sweden?: ImportSwedenResult;
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
  // Denmark through Estonia last on `all`: large result tables and Poland/Czechia/Croatia/Portugal/Spain
  // events would otherwise sit in the published DB that LatAm copies into staging.
  // Estonia has no result rows in the slim pack and follows Spain.
  // Latvia and Lithuania stay scoped. `all` does not publish those lineages.
  if (scope === "denmark" || scope === "all") {
    result.denmark = runImport("denmark", () => importDenmark(options));
  }
  if (scope === "sweden" || scope === "all") {
    result.sweden = runImport("sweden", () => importSweden(options));
  }
  if (scope === "finland" || scope === "all") {
    result.finland = runImport("finland", () => importFinland(options));
  }
  if (scope === "norway" || scope === "all") {
    result.norway = runImport("norway", () => importNorway(options));
  }
  if (scope === "ireland" || scope === "all") {
    result.ireland = runImport("ireland", () => importIreland(options));
  }
  if (scope === "poland" || scope === "all") {
    result.poland = runImport("poland", () => importPoland(options));
  }
  if (scope === "czechia" || scope === "all") {
    result.czechia = runImport("czechia", () => importCzechia(options));
  }
  if (scope === "croatia" || scope === "all") {
    result.croatia = runImport("croatia", () => importCroatia(options));
  }
  if (scope === "portugal" || scope === "all") {
    result.portugal = runImport("portugal", () => importPortugal(options));
  }
  if (scope === "spain" || scope === "all") {
    result.spain = runImport("spain", () => importSpain(options));
  }
  if (scope === "estonia" || scope === "all") {
    result.estonia = runImport("estonia", () => importEstonia(options));
  }
  // Latvia stays scoped. `all` does not publish this lineage.
  if (scope === "latvia") {
    result.latvia = runImport("latvia", () => importLatvia(options));
  }
  // Lithuania stays scoped. `all` does not publish this lineage.
  if (scope === "lithuania") {
    result.lithuania = runImport("lithuania", () => importLithuania(options));
  }
  return result;
}
