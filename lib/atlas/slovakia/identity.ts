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

/** Namespace supplied by the Slovakia identity rules. */
export const CURRENT_NAMESPACE = "cdd-observatory-v1";
export const LINEAGE_ID = "country-package-slovakia";
export const SOURCE_NAMESPACE = "country-package-slovakia";
export const COUNTRY_ID = "slovakia";
export const COUNTRY_CODE = "SK";
export const COUNTRY_NAME = "Slovenská republika";
export const COUNTRY_GEOGRAPHY_ID = "SK";
export const ADAPTER_VERSION = "atlas-slovakia-prompt-ai/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/slovakia.json";
export const DOCS_PREFIX = "docs/phase1/slovakia";
export const INPUT_INVENTORY_RELATIVE = "docs/phase1/slovakia/Slovakia_Input_Inventory.json";
export const HUMAN_REVIEW_RELATIVE = "docs/phase1/slovakia/human-review.json";
export const VALIDATION_RELATIVE = "docs/phase1/slovakia/validation.json";

/**
 * Full-pack register, events, results, sources, and identity vectors are not
 * in this land. Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/slovakia";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/slovakia/Slovakia_Identity_Vectors.json",
  "data/research/slovakia/office-register.json",
  "data/research/slovakia/events.json",
  "data/research/slovakia/results.json",
  "data/research/slovakia/sources.json",
  "data/research/slovakia/geography.json",
  "data/research/slovakia/proceedings.json",
  "data/research/slovakia/identity-crosswalk.json",
] as const;

export const NRSR_ID = "SK-NRSR";
export const PRESIDENT_ID = "SK-PRESIDENT";
export const EP_ID = "SK-EP";
export const BRATISLAVA_COUNCIL_ID = "SK-582000-C";
export const BRATISLAVA_MAYOR_ID = "SK-582000-M";
export const STARE_MESTO_COUNCIL_ID = "SK-528595-C";
export const STARE_MESTO_MAYOR_ID = "SK-528595-M";
export const VUC_ASSEMBLY_ID = "SK-VUC-1-C";
export const VUC_CHAIR_ID = "SK-VUC-1-P";

export const TIER_SHA256 = "847c8880342a0cc633b03306b3fac57f04cf93d4da98d4e0854e81db3e3c4010";
/** Predecessor draft tier file. Omitted from this land. Not a retained input. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "ce8c24f7fcc2f41439f16fca0ad428312de913815c542d3c5c46e28275559770";
export const REVIEW_ZIP_SHA256 = "f1fdbec0350399ee0621cb0489a59627b1113f87f7c7f0fe0d5451f12cf25a62";

/**
 * Figures recorded in the landed input inventory.
 * They are not published, and they are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 23437;
export const FULL_PACK_DOCUMENTED_RESULTS = 115217;
export const FULL_PACK_DOCUMENTED_PROCEEDINGS = 19;
export const FULL_PACK_DOCUMENTED_SOURCES = 187;

/**
 * Pinned after the slim-pack inventory scan. The full-pack fingerprint in
 * Slovakia_Identity_Rules.md is not this release.
 */
export const CANDIDATE_FINGERPRINT = "66b25dd0437aa59a8ab976c4f21f6256c1d8f2f2e98b18e1c8f50fbd61da1f3f";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21";
export const HOLD_STATUS = "open";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/slovakia/Archive_Member_Inventory.json": "f8aeb4f28406f52c9dd230d309a24171c62ac5a89e7121a000f072a25aa644a3",
  "docs/phase1/slovakia/JUSTIN_ACCEPTANCE.md": "aa4275c0784809acabd2989d622604104a1ef460bfe277821edb159839b661e6",
  "docs/phase1/slovakia/Prompt_AI_Full_Register_Field_Map_and_CI.md": "09a063078cce94dcb82ccd04e00a7a031396188138e8ead2c9e7ddc5a3de614f",
  "docs/phase1/slovakia/README.md": "a2e9bd2a95b6f77b6683ec8d4b8978bbc295d178db83df77b8adbe701fe90c68",
  "docs/phase1/slovakia/SHA256SUMS": "9ca10335aadd393a579c03c4838c2bd4bdc9a6fe626cbd32276a5aca05b1d0dd",
  "docs/phase1/slovakia/SLIM_LAND_NOTE.md": "3a784b63e43d3f8e0c8e95652d588c9d79b0951b4c2dcfb62d503faa6731f1ac",
  "docs/phase1/slovakia/SOURCES_NOTE.md": "fd3de2697e4a026d941c6ea1a5e97368fc9d5dcfb6f7e42452aabc80e4ce22fe",
  "docs/phase1/slovakia/Slovakia_Acceptance_Examples.md": "54ab8f2da76b63d62b546cdd0814439cc9026e1087ba36d756c6bc2f082c9373",
  "docs/phase1/slovakia/Slovakia_Field_Map.md": "f8347606b4efcdcea793472a3eb1e9f2d816159364ead52b237de2a976bca95c",
  "docs/phase1/slovakia/Slovakia_Full_Register_Report.md": "7a8fbcd6eab05a127a34dcfa8278959fc4ffa5a3b55af8890946448443d1cdb8",
  "docs/phase1/slovakia/Slovakia_Identity_Rules.md": "ec2edefacf3b4ec3ccbc23fbdc3d3e351c33a03e0167a3bc3548f60093278edc",
  "docs/phase1/slovakia/Slovakia_Import.md": "d43df60e13867614f1aa96ec462b5fd7e353b7c0684018203dde1413974fe00d",
  "docs/phase1/slovakia/Slovakia_Input_Inventory.json": "44dd0731be42feaa16623bdaff8e7738b8cdbd9a8a50ee6692aac1dd58b2f43b",
  "docs/phase1/slovakia/column-map.json": "1829d024e4583fc8d62a8c0f0cf71264297d7cfd040a845e2d08cf670f806877",
  "docs/phase1/slovakia/contract-columns.json": "a2d7dcdcd06e18500626e4d590cbe359710ec97f546bebc6b69a9164023a4132",
  "docs/phase1/slovakia/contract-reference/0001_atlas_attempt_log.sql": "e36a15fa7952a1561c17ee663b2544bc43544a7bf1d2e3688ceabf648a8ff4d1",
  "docs/phase1/slovakia/contract-reference/0002_atlas_master.sql": "1c59e81705d2f6172ca4c0e4aea9b4e390c6fa7606ba305a244756ff7e7af8da",
  "docs/phase1/slovakia/contract-reference/atlas-plan.md": "70ecf09d41e4494aafcc9d40d6a50411e5fa45d4a36542100ac9b334ecf976ee",
  "docs/phase1/slovakia/contract-reference/identity.ts": "8be58bfe59a32110cfe6635c7d51ca73cd469b984179a7ab6083522698626444",
  "docs/phase1/slovakia/contract-reference/normalize.ts": "54450ad61e54d14aa142a69a205ebd42d2b4fac8165da91e55a62f298ba3f06a",
  [HUMAN_REVIEW_RELATIVE]: "eb2dbbc4eeece0462824534ace51939db6db9ca88de258f6dfe623c1776d5b4f",
  "docs/phase1/slovakia/source-projection.json": "fbc6d4cd8bcb34d70158a76237ff86176d53acc2ba48898c533150054d2dca37",
  "docs/phase1/slovakia/validate_pack.py": "e9fe392a51f21af6487b7a25e057f4403fc716bc61174f1314affe3bcc78c818",
  [VALIDATION_RELATIVE]: "ea194621c52784b488d9c47323f789603d2bac9991ee1fa1740e6d170f304486",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "direct_mayor",
  "city_part_council",
  "city_part_mayor",
  "vuc_assembly",
  "direct_vuc_chair",
  "national_parliament",
  "president",
  "european_parliament_delegation",
] as const;

export type SlovakiaDraftTier = "national" | "regional" | "municipal" | "other";
export type SlovakiaOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];

export type SlovakiaOfficeClass = {
  officeType: SlovakiaOfficeType;
  directExecutive: boolean;
  expectedDraftTier: SlovakiaDraftTier;
  geographyId: string;
  geographyKind: "country" | "vuc" | "obec";
  localCode: string | null;
  vucCode: string | null;
};

const LOCAL_ID = /^SK-(\d{6})-([CM])$/;
const VUC_ID = /^SK-VUC-([1-8])-([CP])$/;
const FORBIDDEN_OFFICE =
  /prime minister|predseda vl[aá]dy|okres|military|vojensk|referendum|cabinet|overseas|minister|kancel[aá]r/i;

export const OPEN_HOLD_IDS = [
  "SK-HISTORICAL-UNIVERSE",
  "SK-LOCAL-OLDER-VECTORS",
  "SK-LOCAL-MISSING-CYCLES",
  "SK-REPEATS-CERTIFICATION",
  "SK-VUC-INTRODUCTION",
  "SK-CITY-PART-TIER",
  "SK-EP",
  "SK-HOMONYMS-UNKEYED",
  "SK-2026-CALL",
  "SK-AGGREGATES",
] as const;

export const NAMED_HOLDS: ReadonlyArray<{ token: (typeof OPEN_HOLD_IDS)[number]; status: typeof HOLD_STATUS; reason: string }> = [
  {
    token: "SK-HISTORICAL-UNIVERSE",
    status: HOLD_STATUS,
    reason: "0 historical-only recovered is not proof of zero abolished offices; no guessed successor edges.",
  },
  {
    token: "SK-LOCAL-OLDER-VECTORS",
    status: HOLD_STATUS,
    reason: "2014/2018 council rows stay elected-only; missing votes are not inferred.",
  },
  {
    token: "SK-LOCAL-MISSING-CYCLES",
    status: HOLD_STATUS,
    reason: "44 local office/cycle bindings stay absent. Missing is not zero and missing is not abolition.",
  },
  {
    token: "SK-REPEATS-CERTIFICATION",
    status: HOLD_STATUS,
    reason: "Repeats, annulments, and replacement cycles are not certified here.",
  },
  {
    token: "SK-VUC-INTRODUCTION",
    status: HOLD_STATUS,
    reason: "Pre-2013 VUC returns are not normalized; the 2026 mechanism is not applied retroactively.",
  },
  {
    token: "SK-CITY-PART-TIER",
    status: HOLD_STATUS,
    reason: "78 city-part offices stay drafted other; no invented regional city layer.",
  },
  {
    token: "SK-EP",
    status: HOLD_STATUS,
    reason: "National party vectors only; the EP tier stays other. 2014 seat gaps and later mandate changes stay unconflated.",
  },
  {
    token: "SK-HOMONYMS-UNKEYED",
    status: HOLD_STATUS,
    reason: "Same-name occurrences stay source-record keyed; no name deduplication.",
  },
  {
    token: "SK-2026-CALL",
    status: HOLD_STATUS,
    reason: "24 October 2026 is a prospective call only; no future votes, winners, or certification are published.",
  },
  {
    token: "SK-AGGREGATES",
    status: HOLD_STATUS,
    reason: "No computed margins or cross-district sums.",
  },
];

/** Every named hold stays open. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "16 regional offices: 8 VUC assemblies and 8 direct VUC chairs. Holds SK-HISTORICAL-UNIVERSE, SK-LOCAL-OLDER-VECTORS, SK-LOCAL-MISSING-CYCLES, SK-REPEATS-CERTIFICATION, SK-VUC-INTRODUCTION, SK-CITY-PART-TIER, SK-EP, SK-HOMONYMS-UNKEYED, SK-2026-CALL, and SK-AGGREGATES stay open. No successor edges. Published events, result rows, and sources stay 0. City-part offices stay other. EP stays other.";

export const COUNTRY_NOTES = [
  "Prompt AI: 5,871 current offices and 0 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 5,774 municipal, 16 regional, 2 national, and 79 other. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps regional, municipal, and other.",
  "Current offices are 2,887 municipal council/mayor pairs, 39 city-part council/mayor pairs, 8 VUC assemblies, 8 direct VUC chairs, the National Council, the direct presidency, and the EP delegation.",
  "Direct executives stay 2,935. Councils, assemblies, the chamber, and the delegation stay 2,936.",
  "City-part offices stay drafted other. EP stays drafted other. No appointed okres governor, prime minister, cabinet, military-area, overseas, or referendum office.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "office_successor_edges stays empty. Next dates stay unknown. The 2026 call is not coerced into a research date.",
  "Every classification stays needs_review. Pack approval does not mark a row justin_approved.",
  "Holds SK-HISTORICAL-UNIVERSE through SK-AGGREGATES stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 5871,
  current_offices: 5871,
  historical_offices: 0,
  geographies: 2935,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_municipal: 5774,
  draft_tier_regional: 16,
  draft_tier_national: 2,
  draft_tier_other: 79,
  schema_national: 2,
  schema_regional: 16,
  schema_municipal: 5774,
  schema_other: 79,
  approved_classifications: 0,
  needs_review_classifications: 5871,
  sources: 0,
  unresolved_evidence: 10,
  named_open_holds: 10,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 25,
  research_dates: 0,
  direct_executive_offices: 2935,
  councils_assemblies_chambers_delegation: 2936,
  municipal_councils: 2887,
  municipal_mayors: 2887,
  city_part_councils: 39,
  city_part_mayors: 39,
  vuc_assemblies: 8,
  vuc_chairs: 8,
  national_parliament_offices: 1,
  president_offices: 1,
  ep_offices: 1,
  evidence_links: 0,
  local_jurisdictions: 2926,
  focused_review_offices: 79,
} as const;

export type SlovakiaHashInputs = {
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
export function classifySlovakiaOffice(officeId: string, draftTier: string): SlovakiaOfficeClass {
  if (FORBIDDEN_OFFICE.test(officeId) || /HIST|SUCCESSOR|PREDECESSOR/i.test(officeId)) {
    throw new Error(`Refusing excluded Slovakia office ${officeId}`);
  }
  if (officeId === NRSR_ID) {
    if (draftTier !== "national") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    return {
      officeType: "national_parliament",
      directExecutive: false,
      expectedDraftTier: "national",
      geographyId: COUNTRY_GEOGRAPHY_ID,
      geographyKind: "country",
      localCode: null,
      vucCode: null,
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
      vucCode: null,
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
      vucCode: null,
    };
  }
  const local = LOCAL_ID.exec(officeId);
  if (local) {
    if (draftTier !== "municipal" && draftTier !== "other") {
      throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    }
    const cityPart = draftTier === "other";
    const side = local[2];
    return {
      officeType:
        side === "C" ? (cityPart ? "city_part_council" : "municipal_council") : cityPart ? "city_part_mayor" : "direct_mayor",
      directExecutive: side === "M",
      expectedDraftTier: cityPart ? "other" : "municipal",
      geographyId: `SK-OBEC-${local[1]}`,
      geographyKind: "obec",
      localCode: local[1] ?? null,
      vucCode: null,
    };
  }
  const vuc = VUC_ID.exec(officeId);
  if (vuc) {
    if (draftTier !== "regional") throw new Error(`Refusing to remap ${officeId} from tier ${draftTier}`);
    const side = vuc[2];
    return {
      officeType: side === "C" ? "vuc_assembly" : "direct_vuc_chair",
      directExecutive: side === "P",
      expectedDraftTier: "regional",
      geographyId: `SK-VUC-${vuc[1]}`,
      geographyKind: "vuc",
      localCode: null,
      vucCode: vuc[1] ?? null,
    };
  }
  throw new Error(`Refusing unlisted Slovakia office ${officeId}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "regional" | "municipal" | "other" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "municipal") return "municipal";
  if (draftTier === "other") return "other";
  throw new Error(`Unsupported Slovakia draft tier ${draftTier}`);
}

export function slovakiaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): SlovakiaHashInputs {
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

export function fingerprintSha256(hashInputs: SlovakiaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
