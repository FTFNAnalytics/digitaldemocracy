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
import { importFinland, type ImportFinlandResult } from "../finland/import";
import { importHungary, type ImportHungaryResult } from "../hungary/import";
import { importLatvia, type ImportLatviaResult } from "../latvia/import";
import { importLithuania, type ImportLithuaniaResult } from "../lithuania/import";
import { importGreece, type ImportGreeceResult } from "../greece/import";
import { importLuxembourg, type ImportLuxembourgResult } from "../luxembourg/import";
import { importCyprus, type ImportCyprusResult } from "../cyprus/import";
import { importFrance, type ImportFranceResult } from "../france/import";
import { importGermany, type ImportGermanyResult } from "../germany/import";
import { importUnitedKingdom, type ImportUnitedKingdomResult } from "../united-kingdom/import";
import { importItaly, type ImportItalyResult } from "../italy/import";
import { importMalta, type ImportMaltaResult } from "../malta/import";
import { importRomania, type ImportRomaniaResult } from "../romania/import";
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
  | "romania"
  | "greece"
  | "luxembourg"
  | "malta"
  | "cyprus"
  | "france"
  | "germany"
  | "united_kingdom"
  | "italy"
  | "finland"
  | "hungary"
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
    raw === "romania" ||
    raw === "greece" ||
    raw === "luxembourg" ||
    raw === "malta" ||
    raw === "cyprus" ||
    raw === "france" ||
    raw === "germany" ||
    raw === "united_kingdom" ||
    raw === "italy" ||
    raw === "finland" ||
    raw === "hungary" ||
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
    `Unknown ATLAS_IMPORT_SCOPE ${JSON.stringify(value)}; use albania|andorra|alderney|armenia|austria|belgium|bosnia|bulgaria|croatia|czechia|denmark|estonia|latvia|lithuania|romania|greece|luxembourg|malta|cyprus|france|germany|united_kingdom|italy|hungary|finland|ireland|netherlands|norway|poland|portugal|spain|sweden|switzerland|latam|nz|all`,
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
  romania?: ImportRomaniaResult;
  greece?: ImportGreeceResult;
  luxembourg?: ImportLuxembourgResult;
  malta?: ImportMaltaResult;
  cyprus?: ImportCyprusResult;
  france?: ImportFranceResult;
  germany?: ImportGermanyResult;
  unitedKingdom?: ImportUnitedKingdomResult;
  italy?: ImportItalyResult;
  finland?: ImportFinlandResult;
  hungary?: ImportHungaryResult;
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
  // Latvia, Lithuania, Hungary, Romania, Greece, Luxembourg, Malta, Cyprus, France, Germany, the United Kingdom, and Italy stay scoped. `all` does not publish those lineages.
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
  // Hungary is scoped-only. `all` must not be the Hungary path.
  if (scopeImportsHungary(scope)) {
    result.hungary = runImport("hungary", () => importHungary(options));
  }
  // Romania stays scoped. `all` does not publish this lineage.
  if (scopeImportsRomania(scope)) {
    result.romania = runImport("romania", () => importRomania(options));
  }
  // Greece stays scoped. `all` does not publish this lineage.
  if (scopeImportsGreece(scope)) {
    result.greece = runImport("greece", () => importGreece(options));
  }
  // Luxembourg stays scoped. `all` does not publish this lineage.
  if (scopeImportsLuxembourg(scope)) {
    result.luxembourg = runImport("luxembourg", () => importLuxembourg(options));
  }
  // Malta stays scoped. `all` does not publish this lineage.
  if (scopeImportsMalta(scope)) {
    result.malta = runImport("malta", () => importMalta(options));
  }
  // Cyprus stays scoped. `all` does not publish this lineage.
  if (scopeImportsCyprus(scope)) {
    result.cyprus = runImport("cyprus", () => importCyprus(options));
  }
  // France stays scoped. `all` does not publish this lineage.
  if (scopeImportsFrance(scope)) {
    result.france = runImport("france", () => importFrance(options));
  }
  // Germany stays scoped. `all` does not publish this lineage.
  if (scopeImportsGermany(scope)) {
    result.germany = runImport("germany", () => importGermany(options));
  }
  if (scopeImportsUK(scope)) {
    result.unitedKingdom = runImport("united_kingdom", () => importUnitedKingdom(options));
  }
  if (scopeImportsItaly(scope)) {
    result.italy = runImport("italy", () => importItaly(options));
  }
  return result;
}

/** True only for `ATLAS_IMPORT_SCOPE=hungary`. Never true for `all`. */
export function scopeImportsHungary(scope: ImportScope): boolean {
  return scope === "hungary";
}

/** True only for `ATLAS_IMPORT_SCOPE=romania`. Never true for `all`. */
export function scopeImportsRomania(scope: ImportScope): boolean {
  return scope === "romania";
}

/** True only for `ATLAS_IMPORT_SCOPE=greece`. Never true for `all`. */
export function scopeImportsGreece(scope: ImportScope): boolean {
  return scope === "greece";
}

/** True only for `ATLAS_IMPORT_SCOPE=luxembourg`. Never true for `all`. */
export function scopeImportsLuxembourg(scope: ImportScope): boolean {
  return scope === "luxembourg";
}

/** True only for `ATLAS_IMPORT_SCOPE=malta`. Never true for `all`. */
export function scopeImportsMalta(scope: ImportScope): boolean {
  return scope === "malta";
}

/** True only for `ATLAS_IMPORT_SCOPE=cyprus`. Never true for `all`. */
export function scopeImportsCyprus(scope: ImportScope): boolean {
  return scope === "cyprus";
}

/** True only for `ATLAS_IMPORT_SCOPE=france`. Never true for `all`. */
export function scopeImportsFrance(scope: ImportScope): boolean {
  return scope === "france";
}

/** True only for `ATLAS_IMPORT_SCOPE=germany`. Never true for `all`. */
export function scopeImportsGermany(scope: ImportScope): boolean {
  return scope === "germany";
}

/** True only for `ATLAS_IMPORT_SCOPE=united_kingdom`. Never true for `all`. */
export function scopeImportsUK(scope: ImportScope): boolean {
  return scope === "united_kingdom";
}

/** True only for `ATLAS_IMPORT_SCOPE=italy`. Never true for `all`. */
export function scopeImportsItaly(scope: ImportScope): boolean {
  return scope === "italy";
}
