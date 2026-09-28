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

/** Namespace supplied by the Slovenia identity rules. */
export const CURRENT_NAMESPACE = "cdd-observatory-v1";
export const LINEAGE_ID = "country-package-slovenia";
export const SOURCE_NAMESPACE = "country-package-slovenia";
export const COUNTRY_ID = "slovenia";
export const COUNTRY_CODE = "SI";
export const COUNTRY_NAME = "Slovenija";
export const COUNTRY_GEOGRAPHY_ID = "SI";
export const ADAPTER_VERSION = "atlas-slovenia-prompt-aj/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/slovenia.json";
export const DOCS_PREFIX = "docs/phase1/slovenia";
export const INPUT_INVENTORY_RELATIVE = "docs/phase1/slovenia/Slovenia_Input_Inventory.json";
export const VALIDATION_RELATIVE = "docs/phase1/slovenia/validation.json";

/**
 * Full-pack register, events, results, sources, and identity vectors are not
 * in this land. Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/slovenia";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/slovenia/Slovenia_Identity_Vectors.json",
  "data/research/slovenia/office-register.json",
  "data/research/slovenia/events.json",
  "data/research/slovenia/results.json",
  "data/research/slovenia/sources.json",
  "data/research/slovenia/geography.json",
  "data/research/slovenia/proceedings.json",
  "data/research/slovenia/identity-crosswalk.json",
] as const;

export const DZ_ID = "SI-DZ";
export const DS_ID = "SI-DS";
export const PRESIDENT_ID = "SI-PRESIDENT";
export const EP_ID = "SI-EP";
export const AJDOVSCINA_COUNCIL_ID = "SI-001-C";
export const AJDOVSCINA_MAYOR_ID = "SI-001-M";
export const RIBNICA_COUNCIL_ID = "SI-106-C";

export const TIER_SHA256 = "99d7ae507e2e25c7bb3f112a2fc2f771295fded9499cacc23e3bd1fb59f4a096";
/** Predecessor draft tier file recorded on the pre-acceptance inventory. Not a retained input. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "17a836af07d10fa5ec3c0560c8281f67d60e17cd76b727360aa823b40ab201ee";
export const REVIEW_ZIP_SHA256 = "e89b8d39663ee27b1abd7016cb37e4b1ba2b03f8feea46453c60bb9be1118150";

/**
 * Figures recorded in the landed input inventory.
 * They are not published, and they are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 1706;
export const FULL_PACK_DOCUMENTED_RESULTS = 13830;
export const FULL_PACK_DOCUMENTED_PROCEEDINGS = 801;
export const FULL_PACK_DOCUMENTED_SOURCES = 821;
export const FULL_PACK_DOCUMENTED_HISTORICAL_EVENTS = 1282;
export const FULL_PACK_DOCUMENTED_PROSPECTIVE_EVENTS = 424;
export const FULL_PACK_DAMAGED_LABELS = 1172;
/** LV2018 is one council return short. That gap is not published as a result row. */
export const FULL_PACK_LV2018_EVENTS = 423;

/**
 * Documentary full-pack fingerprint from Slovenia_Identity_Rules.md.
 * It is not this slim-land release.
 */
export const FULL_PACK_FINGERPRINT = "38df9c7cfa588534b5b001a75678acfde165c49d515d0bd65b747d1af6ed8aea";

/**
 * Pinned after the slim-pack inventory scan. The full-pack fingerprint in
 * Slovenia_Identity_Rules.md is not this release.
 */
export const CANDIDATE_FINGERPRINT = "26f5ed204b66050838cd9252c71671ffddd3fc75d95f9a1421d6439cc3376794";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21";
export const HOLD_STATUS = "open";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/slovenia/JUSTIN_ACCEPTANCE.md": "235c364f728ba2e51b65f559dc3ea47629e0e86a33ff8815a13e4f4440b9b21f",
  "docs/phase1/slovenia/Prompt_AJ_Full_Register_Field_Map_and_CI.md": "309eb927ad4f0b9b8e8361d74b185784cd31b194fc6d19ef3027e99a43d31140",
  "docs/phase1/slovenia/README.md": "36efa81d0101b033aa447603a8487ff45a84789888c4270b4e1d18138345f4f0",
  "docs/phase1/slovenia/SHA256SUMS": "8569bbc8c0fa30316f9d5215ccec24f6c5ecce0fd5728f527a0cdf00a92bcfce",
  "docs/phase1/slovenia/SLIM_LAND_NOTE.md": "3a784b63e43d3f8e0c8e95652d588c9d79b0951b4c2dcfb62d503faa6731f1ac",
  "docs/phase1/slovenia/SOURCES_NOTE.md": "23bcd1b22843314e69ecb545078e9fabcbe9983461d9d8d4f0ee5818fb290331",
  "docs/phase1/slovenia/Slovenia_Acceptance_Examples.md": "2063b064f1bc6d4a6b0ec29c3b604cf75cccb17f556a208f5bf900c6bca01626",
  "docs/phase1/slovenia/Slovenia_Field_Map.md": "5f77c2ef069ca8f267c15694a2b395a780e00a3bbbea4f4cd7ca7a17d4b9dc28",
  "docs/phase1/slovenia/Slovenia_Full_Register_Report.md": "9788ea0cb0a4f8e6054453f9717a767a2ad2e3321ad7a0030137406122f75b5f",
  "docs/phase1/slovenia/Slovenia_Identity_Rules.md": "5d8bd813a54dfe9a4480a8a24ca257ff8ff5b084abaf9beaee337bacbe9b7431",
  "docs/phase1/slovenia/Slovenia_Import.md": "5a950d64921c8606f3fe520c8a0d1db7ba99626ed138530ea3c3d5ad96022951",
  "docs/phase1/slovenia/Slovenia_Input_Inventory.json": "34a7fbfd5b35fdcfea5278b2f289ec61adbbeec41783a1d5461525763b25921b",
  "docs/phase1/slovenia/column-map.json": "9c4a96072cb2787e9340ec31028dc12c1f8d5c75d0252c114db7c037f088f63a",
  "docs/phase1/slovenia/contract-columns.json": "a2d7dcdcd06e18500626e4d590cbe359710ec97f546bebc6b69a9164023a4132",
  "docs/phase1/slovenia/contract-reference/0001_atlas_attempt_log.sql": "e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1",
  "docs/phase1/slovenia/contract-reference/0002_atlas_master.sql": "1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da",
  "docs/phase1/slovenia/contract-reference/atlas-plan.md": "9b12c39af6dc2ef9f7d1807743e4fd3a4d06fc78d23cf12a9df2fe5e63b94330",
  "docs/phase1/slovenia/contract-reference/identity.ts": "8be58bfe59a32110cfe6635c7d51ca73cd469b984179a7ab6083522698626444",
  "docs/phase1/slovenia/contract-reference/normalize.ts": "54450ad61e54d14aa142a69a205ebd42d2b4fac8165da91e55a62f298ba3f06a",
  "docs/phase1/slovenia/source-projection.json": "013bb7568acd31cdeb0a1511293572b534fcc3ccefb84b5646cf250263f73322",
  "docs/phase1/slovenia/validate.py": "b5c289bf78adc60fecb8371f110ad78f2e4a310b45df03e4ed67c4e622e50b1b",
  [VALIDATION_RELATIVE]: "90fe706bcd989f0eedf647f67ed0c6cfceffb9aabe5bbea215095b1700d5a283",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "direct_mayor",
  "national_assembly",
  "national_council",
  "president",
  "european_parliament_delegation",
] as const;

export type SloveniaDraftTier = "national" | "regional" | "municipal" | "other";
export type SloveniaOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];

export type SloveniaOfficeClass = {
  officeType: SloveniaOfficeType;
  directExecutive: boolean;
  expectedDraftTier: SloveniaDraftTier;
  geographyId: string;
  geographyKind: "country" | "municipality";
  localCode: string | null;
};

const LOCAL_ID = /^SI-(\d{3})-([CM])$/;
const FORBIDDEN_OFFICE =
  /prime minister|predsednik vlade|cabinet|neighborhood|četrt|referendum|military|vojsk|regional|okraj/i;

export const OPEN_HOLD_IDS = [
  "SI-HISTORICAL-MUNICIPAL-UNIVERSE",
  "SI-LOCAL-CERTIFICATION-REPEATS",
  "SI-MISSING-LOCAL-CYCLE",
  "SI-SOURCE-TEXT-DAMAGE",
  "SI-ROSTER-ALIASES",
  "SI-DS-COMPONENTS",
  "SI-DZ-MINORITY-MANDATES",
  "SI-EP-DETAIL",
  "SI-LOCAL-PREFERENCE",
  "SI-NEXT-CALLS",
] as const;

export const NAMED_HOLDS: ReadonlyArray<{ token: (typeof OPEN_HOLD_IDS)[number]; status: typeof HOLD_STATUS; reason: string }> = [
  {
    token: "SI-HISTORICAL-MUNICIPAL-UNIVERSE",
    status: HOLD_STATUS,
    reason: "0 historical-only recovered is not proof of zero abolished offices; no guessed successor edges.",
  },
  {
    token: "SI-LOCAL-CERTIFICATION-REPEATS",
    status: HOLD_STATUS,
    reason: "2014/2018 unofficial snapshots stay uncertified; by-elections, recounts, and repeats are not exhaustive.",
  },
  {
    token: "SI-MISSING-LOCAL-CYCLE",
    status: HOLD_STATUS,
    reason: "The 2018 Ribnica council return SI-106-C::LV2018 stays absent. Missing is not zero.",
  },
  {
    token: "SI-SOURCE-TEXT-DAMAGE",
    status: HOLD_STATUS,
    reason: "1,172 result labels contain U+FFFD and stay unrepaired.",
  },
  {
    token: "SI-ROSTER-ALIASES",
    status: HOLD_STATUS,
    reason: "Three government/election naming variants and the 2018 LUŽE binding stay pending. No fuzzy merge.",
  },
  {
    token: "SI-DS-COMPONENTS",
    status: HOLD_STATUS,
    reason: "National Council component repeats and older by-elections are not fully normalized.",
  },
  {
    token: "SI-DZ-MINORITY-MANDATES",
    status: HOLD_STATUS,
    reason: "Italian/Hungarian special ballots, district preference detail, and 2026 mandate allocation stay unnormalized.",
  },
  {
    token: "SI-EP-DETAIL",
    status: HOLD_STATUS,
    reason: "EP stays drafted other. 2014 numeric mandates and preference detail stay incomplete.",
  },
  {
    token: "SI-LOCAL-PREFERENCE",
    status: HOLD_STATUS,
    reason: "Proportional council preference arrays stay raw.",
  },
  {
    token: "SI-NEXT-CALLS",
    status: HOLD_STATUS,
    reason: "Next dates other than the 15 November 2026 local call stay unknown. That call is not coerced into a research date.",
  },
];

/** Every named hold stays open. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. No elected regional office is invented. 212 municipal councils and 212 direct mayors. Holds SI-HISTORICAL-MUNICIPAL-UNIVERSE, SI-LOCAL-CERTIFICATION-REPEATS, SI-MISSING-LOCAL-CYCLE, SI-SOURCE-TEXT-DAMAGE, SI-ROSTER-ALIASES, SI-DS-COMPONENTS, SI-DZ-MINORITY-MANDATES, SI-EP-DETAIL, SI-LOCAL-PREFERENCE, and SI-NEXT-CALLS stay open. No successor edges. Published events, result rows, and sources stay 0. EP stays other. The 2018 Ribnica council return stays missing.";

export const COUNTRY_NOTES = [
  "Prompt AJ: 428 current offices and 0 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 424 municipal, 0 regional, 3 national, and 1 other. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps municipal and other. Regional stays 0.",
  "Current offices are 212 municipal council/mayor pairs, Državni zbor, the indirect Državni svet, the direct presidency, and the EP delegation.",
  "Direct executives stay 213. Councils, chambers, and the delegation stay 215.",
  "The National Council stays national and indirect. EP stays drafted other. No appointed regional, prime-minister, cabinet, or neighborhood office.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "office_successor_edges stays empty. Next dates stay unknown. The 15 November 2026 local call is not coerced into a research date.",
  "Every classification stays needs_review. Pack approval does not mark a row justin_approved.",
  "Holds SI-HISTORICAL-MUNICIPAL-UNIVERSE through SI-NEXT-CALLS stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 428,
  current_offices: 428,
  historical_offices: 0,
  geographies: 213,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_municipal: 424,
  draft_tier_regional: 0,
  draft_tier_national: 3,
  draft_tier_other: 1,
  schema_national: 3,
  schema_regional: 0,
  schema_municipal: 424,
  schema_other: 1,
  approved_classifications: 0,
  needs_review_classifications: 428,
  sources: 0,
  unresolved_evidence: 10,
  named_open_holds: 10,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 23,
  research_dates: 0,
  direct_executive_offices: 213,
  councils_chambers_delegation: 215,
  municipal_councils: 212,
  municipal_mayors: 212,
  national_assembly_offices: 1,
  national_council_offices: 1,
  president_offices: 1,
  ep_offices: 1,
  evidence_links: 0,
  local_jurisdictions: 212,
  focused_review_offices: 1,
} as const;

export type SloveniaHashInputs = {
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

/** Classify a supplied tier-file office id. Unknown ids throw. This does not create offices. */
export function classifySloveniaOffice(officeId: string, draftTier: string): SloveniaOfficeClass {
  if (FORBIDDEN_OFFICE.test(officeId) || /HIST|SUCCESSOR|PREDECESSOR/i.test(officeId)) {
    throw new Error(`Refusing excluded Slovenia office ${officeId}`);
  }
  if (officeId === DZ_ID) {
    if (draftTier !== "national") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    return {
      officeType: "national_assembly",
      directExecutive: false,
      expectedDraftTier: "national",
      geographyId: COUNTRY_GEOGRAPHY_ID,
      geographyKind: "country",
      localCode: null,
    };
  }
  if (officeId === DS_ID) {
    if (draftTier !== "national") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    return {
      officeType: "national_council",
      directExecutive: false,
      expectedDraftTier: "national",
      geographyId: COUNTRY_GEOGRAPHY_ID,
      geographyKind: "country",
      localCode: null,
    };
  }
  if (officeId === PRESIDENT_ID) {
    if (draftTier !== "national") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    return {
      officeType: "president",
      directExecutive: true,
      expectedDraftTier: "national",
      geographyId: COUNTRY_GEOGRAPHY_ID,
      geographyKind: "country",
      localCode: null,
    };
  }
  if (officeId === EP_ID) {
    if (draftTier !== "other") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    return {
      officeType: "european_parliament_delegation",
      directExecutive: false,
      expectedDraftTier: "other",
      geographyId: COUNTRY_GEOGRAPHY_ID,
      geographyKind: "country",
      localCode: null,
    };
  }
  const local = LOCAL_ID.exec(officeId);
  if (local) {
    if (draftTier !== "municipal") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    const side = local[2];
    return {
      officeType: side === "C" ? "municipal_council" : "direct_mayor",
      directExecutive: side === "M",
      expectedDraftTier: "municipal",
      geographyId: `SI-OB-${local[1]}`,
      geographyKind: "municipality",
      localCode: local[1] ?? null,
    };
  }
  throw new Error(`Refusing unlisted Slovenia office ${officeId}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "regional" | "municipal" | "other" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "municipal") return "municipal";
  if (draftTier === "other") return "other";
  throw new Error(`Unsupported Slovenia draft tier ${draftTier}`);
}

export function sloveniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): SloveniaHashInputs {
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

export function fingerprintSha256(hashInputs: SloveniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
