import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  SCHEMA_VERSION,
  canonical,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export {
  canonical,
  dateId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

/** Research namespace carried on every Germany office row. */
export const OFFICE_NAMESPACE = "cdd-atlas-de-research-v1";
export const LINEAGE_ID = "country-package-germany";
export const SOURCE_NAMESPACE = "country-package-germany";
export const COUNTRY_ID = "germany";
export const COUNTRY_CODE = "DE";
export const COUNTRY_GEOGRAPHY_ID = "DE";
export const ADAPTER_VERSION = "atlas-germany-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/germany.json";
export const DOCS_PREFIX = "docs/phase1/germany";

/**
 * Full-pack register, results, events, reporting units, calendar, and sources
 * are not in the slim land. Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/germany";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "data/research/germany/office-register.jsonl",
  "data/research/germany/results.jsonl",
  "data/research/germany/events.jsonl",
  "data/research/germany/reporting-units.jsonl",
  "data/research/germany/successor-crosswalk.jsonl",
  "data/research/germany/calendar.jsonl",
  "data/research/germany/counts.json",
  "data/research/germany/sources",
] as const;

export const BUNDESTAG_ID = "DE-BT";
export const BUNDESPRAESIDENT_ID = "DE-BP";
export const EP_ID = "DE-EP";
export const INHABITANTS_COUNCIL_IDS = ["DE-NI-EINWOHNER-03351501", "DE-NI-EINWOHNER-03358501"] as const;
export const HISTORICAL_ASSEMBLY_IDS = [
  "DE-HIST-LAND-WUERTTEMBERG-BADEN",
  "DE-HIST-LAND-WUERTTEMBERG-HOHENZOLLERN",
  "DE-HIST-BW-CONSTITUENT-1952",
  "DE-HIST-LAND-BADEN",
  "DE-HIST-BERLIN-STVV",
  "DE-HIST-HB-BUERGERSCHAFT-1946",
] as const;
export const REGIONAL_ASSEMBLY_IDS = ["DE-REGION-STUTTGART", "DE-REGION-PFALZ", "DE-REGION-RUHR"] as const;

export const TIER_SHA256 = "99a83b35f8d5e71c7249a70db6c8b7fb71d2f2f1f5a6234eeec8fd3a17a2e89a";
/** Predecessor draft-tiers.jsonl. Omitted from this land. Not a retained input. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "0f27312e722d89f7dee08543febf8eeacde0e953b82c5a78a6564ccadd0a5806";
export const REVIEW_ZIP_SHA256 = "c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "263aa5fed9eb89b812adf03ab2148245bff2f4fc978b3868fc84265bf354a0c3";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";
export const COUNTRY_NAME = "Germany";
export const HOLD_STATUS = "open";

export const ACCEPTANCE_EXAMPLES_SHA256 = "b2c129080a390dbcf660069bf2e95722106eb1f5e8ef3dcbd8bb7261e5587f5e";
export const EXTRACTION_SPEC_SHA256 = "814aa470734b54b5516e6d5fcf9e0d7d7bb4fe7f4bfe63844722b3ab48da1745";
export const FIELD_MAP_SHA256 = "bcf2bd9fc00f53c348d883f5bfaa8b836a582ace04f816fc64877b9493200faa";
export const GAP_CLOSURE_SHA256 = "67a3c6c1d64529f2f70ba4d8844879939fc172e1b39b7b5de9f0ecc3d56319fd";
export const PACK_README_SHA256 = "49d40df44202dd317ebe1a66491ef429c26577023d109922a4bb035cfa56600f";
export const IDENTITY_RULES_SHA256 = "971c1e781be1127de48075676750a7c9551585fceab72556621ff8ffb6bc1a7c";
export const JUSTIN_ACCEPTANCE_SHA256 = "b9244341897875fa7c125290388f2bca00dc99ee4aa2130fafd33c6a198eed6d";
export const JUSTIN_REPORT_SHA256 = "18ed0b383258a2e67f83899598b0d2f1b17944c4af4fa417583ecf4d9efcaaaf";
export const LAND_COUNTS_SHA256 = "49726c1df02647f194fb3093477c1fd5dff026db39800bdba9e30825121bdcd3";
export const PROMPT_AS_SHA256 = "44e68c9d3e610415b17f3b72947f1de86d64762887299ef9ca117de427d2136a";
export const README_SHA256 = "3178638a825334127d3a3fc60cc4f0f339be5ad6c35274885508ffd1f167f66a";
export const RESEARCH_GAPS_SHA256 = "85493550627ff7c70cf93bb77c4663cf043ca046ce11650068fcfd6f13f3b203";
export const SHA256SUMS_SHA256 = "cb17ac003f14dbfb398484168c9b495f5d9345115c1544a19d4ae99a6b8cef07";
export const SLIM_LAND_SHA256 = "e431adc838c4d03f44141143cdd4f05010be5200241e3845146eb5ae05911cd2";
export const SOURCE_INVENTORY_SHA256 = "29c9456916fe3ac3c0cd90e1d6f448d9a62d7f39e14700c332ba0832a49168b6";
export const METADATA_SHA256 = "7055f799af2e674d0a1c187afaa3d6d70d1f359392015d3a1881fd6aa5ad43ec";

export const ACCEPTANCE_EXAMPLES_RELATIVE = "docs/phase1/germany/Acceptance_Examples.md";
export const EXTRACTION_SPEC_RELATIVE = "docs/phase1/germany/Extraction_Specification.md";
export const FIELD_MAP_RELATIVE = "docs/phase1/germany/Field_Map_223.md";
export const GAP_CLOSURE_RELATIVE = "docs/phase1/germany/Gap_Closure_Report.md";
export const PACK_README_RELATIVE = "docs/phase1/germany/Germany_Pack_README.md";
export const IDENTITY_RULES_RELATIVE = "docs/phase1/germany/Identity_Rules.md";
export const JUSTIN_ACCEPTANCE_RELATIVE = "docs/phase1/germany/JUSTIN_ACCEPTANCE.md";
export const JUSTIN_REPORT_RELATIVE = "docs/phase1/germany/Justin_Report.md";
export const LAND_COUNTS_RELATIVE = "docs/phase1/germany/Land_Counts_and_Mechanisms.md";
export const PROMPT_AS_RELATIVE = "docs/phase1/germany/Prompt_AS_Full_Register_Field_Map_and_CI.md";
export const README_RELATIVE = "docs/phase1/germany/README.md";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/germany/Research_Gaps.md";
export const SHA256SUMS_RELATIVE = "docs/phase1/germany/SHA256SUMS";
export const SLIM_LAND_RELATIVE = "docs/phase1/germany/SLIM_LAND_NOTE.md";
export const SOURCE_INVENTORY_RELATIVE = "docs/phase1/germany/Source_Inventory.md";
export const METADATA_RELATIVE = "docs/phase1/germany/metadata.json";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_EXAMPLES_RELATIVE]: ACCEPTANCE_EXAMPLES_SHA256,
  [EXTRACTION_SPEC_RELATIVE]: EXTRACTION_SPEC_SHA256,
  [FIELD_MAP_RELATIVE]: FIELD_MAP_SHA256,
  [GAP_CLOSURE_RELATIVE]: GAP_CLOSURE_SHA256,
  [PACK_README_RELATIVE]: PACK_README_SHA256,
  [IDENTITY_RULES_RELATIVE]: IDENTITY_RULES_SHA256,
  [JUSTIN_ACCEPTANCE_RELATIVE]: JUSTIN_ACCEPTANCE_SHA256,
  [JUSTIN_REPORT_RELATIVE]: JUSTIN_REPORT_SHA256,
  [LAND_COUNTS_RELATIVE]: LAND_COUNTS_SHA256,
  [PROMPT_AS_RELATIVE]: PROMPT_AS_SHA256,
  [README_RELATIVE]: README_SHA256,
  [RESEARCH_GAPS_RELATIVE]: RESEARCH_GAPS_SHA256,
  [SHA256SUMS_RELATIVE]: SHA256SUMS_SHA256,
  [SLIM_LAND_RELATIVE]: SLIM_LAND_SHA256,
  [SOURCE_INVENTORY_RELATIVE]: SOURCE_INVENTORY_SHA256,
  [METADATA_RELATIVE]: METADATA_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export const LAND_CODES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16"] as const;

/** Current direct municipal mayors by Land code. SH stays 86. HH, HB, and BE stay 0. */
export const MAYOR_BY_LAND: Record<(typeof LAND_CODES)[number], number> = {
  "01": 86,
  "02": 0,
  "03": 289,
  "04": 0,
  "05": 396,
  "06": 421,
  "07": 2300,
  "08": 1101,
  "09": 2056,
  "10": 52,
  "11": 0,
  "12": 413,
  "13": 724,
  "14": 418,
  "15": 218,
  "16": 601,
};

/** Current municipal councils by Land code. Berlin and Hamburg stay 0. */
export const COUNCIL_BY_LAND: Record<(typeof LAND_CODES)[number], number> = {
  "01": 1077,
  "02": 0,
  "03": 939,
  "04": 2,
  "05": 396,
  "06": 421,
  "07": 2300,
  "08": 1101,
  "09": 2056,
  "10": 52,
  "11": 0,
  "12": 413,
  "13": 724,
  "14": 418,
  "15": 218,
  "16": 601,
};

export const KREIS_BY_LAND: Record<(typeof LAND_CODES)[number], number> = {
  "01": 11,
  "02": 0,
  "03": 37,
  "04": 0,
  "05": 31,
  "06": 21,
  "07": 24,
  "08": 35,
  "09": 71,
  "10": 6,
  "11": 0,
  "12": 14,
  "13": 6,
  "14": 10,
  "15": 11,
  "16": 17,
};

/** Direct Kreis executives. SH and BW stay 0. */
export const LANDRAT_BY_LAND: Record<(typeof LAND_CODES)[number], number> = {
  "01": 0,
  "02": 0,
  "03": 37,
  "04": 0,
  "05": 31,
  "06": 21,
  "07": 24,
  "08": 0,
  "09": 71,
  "10": 6,
  "11": 0,
  "12": 14,
  "13": 6,
  "14": 10,
  "15": 11,
  "16": 17,
};

export const VERBAND_COUNCIL_BY_LAND: Record<(typeof LAND_CODES)[number], number> = {
  "01": 0,
  "02": 0,
  "03": 114,
  "04": 0,
  "05": 0,
  "06": 0,
  "07": 129,
  "08": 0,
  "09": 0,
  "10": 0,
  "11": 0,
  "12": 1,
  "13": 0,
  "14": 0,
  "15": 18,
  "16": 0,
};

export const ALLOWED_OFFICE_TYPES = [
  "bundestag",
  "bundesprasident",
  "european_parliament_delegation",
  "land_parliament",
  "historical_land_assembly",
  "historical_city_assembly",
  "kreis_council",
  "kreis_executive",
  "bezirkstag",
  "regional_assembly",
  "municipal_mayor",
  "municipal_council",
  "association_council",
  "association_executive",
  "berlin_borough_assembly",
  "hamburg_district_assembly",
  "bremen_beirat",
  "munich_borough_assembly",
  "nrw_borough_council",
  "saxony_local_council",
  "inhabitants_council",
] as const;

export type GermanyOfficeClass = {
  officeType: (typeof ALLOWED_OFFICE_TYPES)[number];
  officeStatus: "current" | "historical";
  directExecutive: boolean;
  expectedDraftTier: 1 | 2 | 3 | 4;
  landCode: string | null;
  national: boolean;
};

const LAND_CODE = /^(0[1-9]|1[0-6])/;

function landCodeOf(suffix: string, officeId: string): string {
  const code = suffix.slice(0, 2);
  if (!LAND_CODE.test(code)) throw new Error(`Office ${officeId} has no Destatis land code`);
  return code;
}

/**
 * Classify a supplied tier-file office id. Unknown ids throw.
 * This does not create offices that are absent from the tier file.
 */
export function classifyGermanyOffice(officeId: string): GermanyOfficeClass {
  if (officeId === BUNDESTAG_ID) {
    return { officeType: "bundestag", officeStatus: "current", directExecutive: false, expectedDraftTier: 1, landCode: null, national: true };
  }
  if (officeId === BUNDESPRAESIDENT_ID) {
    return {
      officeType: "bundesprasident",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 1,
      landCode: null,
      national: true,
    };
  }
  if (officeId === EP_ID) {
    return {
      officeType: "european_parliament_delegation",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 1,
      landCode: null,
      national: true,
    };
  }
  if (officeId === "DE-HIST-BERLIN-STVV" || officeId === "DE-HIST-HB-BUERGERSCHAFT-1946") {
    return {
      officeType: "historical_city_assembly",
      officeStatus: "historical",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if (
    officeId === "DE-HIST-LAND-WUERTTEMBERG-BADEN" ||
    officeId === "DE-HIST-LAND-WUERTTEMBERG-HOHENZOLLERN" ||
    officeId === "DE-HIST-BW-CONSTITUENT-1952" ||
    officeId === "DE-HIST-LAND-BADEN"
  ) {
    return {
      officeType: "historical_land_assembly",
      officeStatus: "historical",
      directExecutive: false,
      expectedDraftTier: 2,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-HIST-")) throw new Error(`Unlisted historical assembly ${officeId}`);
  if (/^DE-LAND-\d{2}$/.test(officeId)) {
    return {
      officeType: "land_parliament",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 2,
      landCode: landCodeOf(officeId.slice("DE-LAND-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-LANDRAT-")) {
    return {
      officeType: "kreis_executive",
      officeStatus: "current",
      directExecutive: true,
      expectedDraftTier: 3,
      landCode: landCodeOf(officeId.slice("DE-LANDRAT-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-KREIS-")) {
    return {
      officeType: "kreis_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 3,
      landCode: landCodeOf(officeId.slice("DE-KREIS-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-BEZIRK-")) {
    return { officeType: "bezirkstag", officeStatus: "current", directExecutive: false, expectedDraftTier: 3, landCode: null, national: false };
  }
  if ((REGIONAL_ASSEMBLY_IDS as readonly string[]).includes(officeId)) {
    return {
      officeType: "regional_assembly",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 3,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-REGION-")) throw new Error(`Unlisted regional assembly ${officeId}`);
  if (officeId.startsWith("DE-MAYOR-HIST-")) {
    return {
      officeType: "municipal_mayor",
      officeStatus: "historical",
      directExecutive: true,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-MAYOR-HIST-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-MAYOR-")) {
    return {
      officeType: "municipal_mayor",
      officeStatus: "current",
      directExecutive: true,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-MAYOR-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-MUN-HIST-")) {
    return {
      officeType: "municipal_council",
      officeStatus: "historical",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-MUN-HIST-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-MUN-")) {
    return {
      officeType: "municipal_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-MUN-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-VERBAND-MAYOR-")) {
    return {
      officeType: "association_executive",
      officeStatus: "current",
      directExecutive: true,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-VERBAND-MAYOR-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-VERBAND-")) {
    return {
      officeType: "association_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: landCodeOf(officeId.slice("DE-VERBAND-".length), officeId),
      national: false,
    };
  }
  if (officeId.startsWith("DE-BVV-")) {
    return {
      officeType: "berlin_borough_assembly",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-HH-BEZIRK-")) {
    return {
      officeType: "hamburg_district_assembly",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-HB-BEIRAT-")) {
    return { officeType: "bremen_beirat", officeStatus: "current", directExecutive: false, expectedDraftTier: 4, landCode: null, national: false };
  }
  if (officeId.startsWith("DE-MUC-BA-")) {
    return {
      officeType: "munich_borough_assembly",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-NW-BV-")) {
    return {
      officeType: "nrw_borough_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if (officeId.startsWith("DE-SN-OS-")) {
    return {
      officeType: "saxony_local_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: null,
      national: false,
    };
  }
  if ((INHABITANTS_COUNCIL_IDS as readonly string[]).includes(officeId)) {
    return {
      officeType: "inhabitants_council",
      officeStatus: "current",
      directExecutive: false,
      expectedDraftTier: 4,
      landCode: "03",
      national: false,
    };
  }
  throw new Error(`Refusing unlisted Germany office id ${officeId}`);
}

/** Atlas SQL interchange of a supplied numeric tier. The numeric tier stays on the row. */
export function schemaInterchangeTier(draftTier: number): "national_context" | "regional" | "municipal" {
  if (draftTier === 1) return "national_context";
  if (draftTier === 2 || draftTier === 3) return "regional";
  if (draftTier === 4) return "municipal";
  throw new Error(`Unsupported Germany numeric tier ${draftTier}`);
}

/** Named holds DE-G01–DE-G23. Status stays open. Pack disposition labels are retained. */
export const NAMED_HOLDS = [
  {
    token: "DE-G01",
    disposition: "open",
    status: HOLD_STATUS,
    reason:
      "The full requested office scope is not yet complete. Territorial municipal/Kreis/Land core is enumerated at 2026-08-31, with documented city-state and small-assembly exceptions. Some direct local executives and elected subdivisions remain unenumerated.",
  },
  {
    token: "DE-G02",
    disposition: "history_extended",
    status: HOLD_STATUS,
    reason:
      "Bundespräsident stays indirect under the Federal Convention. No popular nationwide first-preference universe exists. The hold stays open.",
  },
  {
    token: "DE-G03",
    disposition: "explicit_exclusion",
    status: HOLD_STATUS,
    reason: "Bundesrat stays excluded. No popular Bundesrat office or return is created. The hold stays open.",
  },
  {
    token: "DE-G04",
    disposition: "version_gate",
    status: HOLD_STATUS,
    reason:
      "Bundestag seat mechanics stay cycle-specific. The 2025 system is not projected onto earlier overhang/balance elections. No seat calculator is added. The hold stays open.",
  },
  {
    token: "DE-G05",
    disposition: "explicit_exclusion",
    status: HOLD_STATUS,
    reason: "Land executives stay excluded. No popular Minister-President, Senate, or Chancellor office is created. The hold stays open.",
  },
  {
    token: "DE-G06",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason:
      "Schleswig-Holstein stays at 86 verified direct mayors. Remaining modes stay unresolved. No missing mayor is invented. The hold stays open.",
  },
  {
    token: "DE-G07",
    disposition: "mechanism_gate",
    status: HOLD_STATUS,
    reason:
      "Lower Saxony member-municipal mayors stay out of the direct-executive roster. Samtgemeinde and unitary direct mayors stay the supplied rows. The hold stays open.",
  },
  {
    token: "DE-G08",
    disposition: "explicit_exclusion",
    status: HOLD_STATUS,
    reason: "Baden-Württemberg Landräte stay excluded. Kreis councils remain. No direct Landrat office is added for Land 08. The hold stays open.",
  },
  {
    token: "DE-G09",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason:
      "26 source-coded whole-unit territorial relations do not assert office continuity. No successor edge is written. The hold stays open.",
  },
  {
    token: "DE-G10",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason: "Named subdivision rosters for the open Länder stay unenumerated. Aggregate counts are not register rows. The hold stays open.",
  },
  {
    token: "DE-G11",
    disposition: "historical_boundary",
    status: HOLD_STATUS,
    reason:
      "Six source-established former assemblies stay historical-only. No GDR body is a current office. No reunification successor is inferred. The hold stays open.",
  },
  {
    token: "DE-G12",
    disposition: "bounded_history",
    status: HOLD_STATUS,
    reason: "The Germany EP delegation stays one office. No 2029 result is fabricated. The hold stays open.",
  },
  {
    token: "DE-G13",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason: "Local history stays partial. Omitted event and result files are not reconstructed. The hold stays open.",
  },
  {
    token: "DE-G14",
    disposition: "quarantined",
    status: HOLD_STATUS,
    reason: "Berlin 2026 export conflict stays quarantined. No numbers from those exports are published. The hold stays open.",
  },
  {
    token: "DE-G15",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason: "Mecklenburg-Vorpommern 2026 preliminary totals stay preliminary. They are not republished from omitted files. The hold stays open.",
  },
  {
    token: "DE-G16",
    disposition: "resolved_retained_original",
    status: HOLD_STATUS,
    reason:
      "Hamburg historical source conflict keeps the original panel. The disposition stays resolved_retained_original and the hold stays open.",
  },
  {
    token: "DE-G17",
    disposition: "open",
    status: HOLD_STATUS,
    reason: "Certification and preliminary statuses stay distinct. No omitted return is marked certified. The hold stays open.",
  },
  {
    token: "DE-G18",
    disposition: "open",
    status: HOLD_STATUS,
    reason: "Source-missing labels stay unresolved. No candidate identity is invented for quarantined rows. The hold stays open.",
  },
  {
    token: "DE-G19",
    disposition: "partially_resolved",
    status: HOLD_STATUS,
    reason:
      "Municipal vintage and small assemblies stay as supplied. SH Gemeindeversammlungen do not gain invented elected councils. The hold stays open.",
  },
  {
    token: "DE-G20",
    disposition: "mechanism_gate",
    status: HOLD_STATUS,
    reason:
      "Association transition stays a mechanism gate. Supplied NI/RP/ST/BB association offices stay. Other association classes are not added. The hold stays open.",
  },
  {
    token: "DE-G21",
    disposition: "open",
    status: HOLD_STATUS,
    reason: "Future calendar stays unresolved. No next-date metadata and no prospective event is created from term length. The hold stays open.",
  },
  {
    token: "DE-G22",
    disposition: "review_required",
    status: HOLD_STATUS,
    reason: "The inherited 223-column map stays review_required. Per-office review stays needs_review. The hold stays open.",
  },
  {
    token: "DE-G23",
    disposition: "withheld_pending_corroboration",
    status: HOLD_STATUS,
    reason:
      "Fifteen Land seat panels and Bavaria 1950 party votes stay withheld. No repaired panel is published. The hold stays open.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "572 schema-regional offices are supplied numeric tiers 2 (20) and 3 (552), preserved on each row. Holds DE-G01–DE-G23 stay open. No successor edges. Slim land publishes 0 events and 0 result rows; those omitted files are not invented.";

export const COUNTRY_NOTES = [
  "Prompt AS: 21,960 current offices and 670 historical offices. Coverage partial. research_coverage_complete stays false.",
  "Numeric jurisdiction tiers stay 3 / 20 / 552 / 22,055. They are preserved on each classification row.",
  "The schema tier column is the required Atlas interchange: tier 1 national_context, tiers 2 and 3 regional, tier 4 municipal, other 0. It does not replace the numeric label.",
  "Current direct executives in the delivered subset: 9,585 (9,075 municipal mayors, 248 Kreis executives, 262 association executives). Schleswig-Holstein direct mayors stay 86.",
  "Published events: 0. Published result rows: 0. Omitted results, events, and reporting units are not reconstructed and are not given omitted-total counters.",
  "Successor edges stay 0. The 26 territorial relations do not assert office continuity.",
  "Bundespräsident stays indirect. Bundesrat, Land executives, BW/SH Landräte, and NI member-municipal mayors stay absent.",
  "Every classification stays needs_review. Per-office draft review_status stays draft_unapproved and justin_approved stays false.",
  "Holds DE-G01 through DE-G23 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 21960,
  historical_offices: 670,
  offices: 22630,
  geographies: 22628,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_1: 3,
  draft_tier_2: 20,
  draft_tier_3: 552,
  draft_tier_4: 22055,
  schema_national: 3,
  schema_regional: 572,
  schema_municipal: 22055,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 22630,
  sources: 0,
  unresolved_evidence: 23,
  named_holds: 23,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 17,
  research_dates: 0,
  direct_executive_offices: 9585,
  historical_direct_executives: 610,
  current_municipal_councils: 10718,
  current_municipal_mayors: 9075,
  historical_mayor_codes: 610,
  historical_council_codes: 54,
  historical_assemblies: 6,
  current_kreis_councils: 294,
  current_kreis_executives: 248,
  current_association_councils: 262,
  current_association_executives: 262,
  current_land_parliaments: 16,
  current_local_councils: 12356,
  other_elected_bodies: 1082,
  schleswig_holstein_direct_mayors: 86,
  bundestag_offices: 1,
  bundesprasident_offices: 1,
  ep_offices: 1,
  evidence_links: 0,
} as const;

export type GermanyHashInputs = {
  canonicalization: typeof CANONICALIZATION;
  hash_algorithm: typeof HASH_ALGORITHM;
  lineage_id: typeof LINEAGE_ID;
  inputs: HashInputDescriptor[];
  overrides: HashInputDescriptor[];
  adapter_version: typeof ADAPTER_VERSION;
  method_version: string;
  schema_version: typeof SCHEMA_VERSION;
  schema_inputs: SchemaInputDescriptor[];
};

export function germanyUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, occurrence, originalToken]))}`;
}

export function inputKindFor(inputPath: string): HashInputDescriptor["input_kind"] {
  if (inputPath === TIER_PATH) return "tier_classification";
  return "package";
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): GermanyHashInputs {
  const schemaInputs = sortByInputPath(
    args.schemaInputs ?? [
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ],
  );
  return {
    canonicalization: CANONICALIZATION,
    hash_algorithm: HASH_ALGORITHM,
    lineage_id: LINEAGE_ID,
    inputs: sortByInputPath(args.inputs),
    overrides: sortByInputPath(args.overrides ?? []),
    adapter_version: ADAPTER_VERSION,
    method_version: args.methodVersion ?? METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: schemaInputs,
  };
}

export function fingerprintSha256(hashInputs: GermanyHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
