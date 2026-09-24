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

/** Research namespace carried on every Italy office row. */
export const OFFICE_NAMESPACE = "cdd-atlas-it-research-v1";
export const LINEAGE_ID = "country-package-italy";
export const SOURCE_NAMESPACE = "country-package-italy";
export const COUNTRY_ID = "italy";
export const COUNTRY_CODE = "IT";
export const COUNTRY_GEOGRAPHY_ID = "IT";
export const ADAPTER_VERSION = "atlas-italy-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/italy.json";
export const DOCS_PREFIX = "docs/phase1/italy";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/italy/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/italy/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/italy/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/italy/data/research-gaps.json";
export const APPROVAL_STATE_RELATIVE = "docs/phase1/italy/data/approval-state.json";

/**
 * Full-pack results, events, reporting units, sources, calendar, and territorial
 * dumps are not in the slim land. Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/italy";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/italy/sources",
  "docs/phase1/italy/data/events.jsonl",
  "docs/phase1/italy/data/results.jsonl",
  "docs/phase1/italy/data/results.jsonl.gz",
  "docs/phase1/italy/data/reporting-units.jsonl",
  "docs/phase1/italy/data/calendar.jsonl",
  "docs/phase1/italy/data/territorial-register.jsonl",
  "docs/phase1/italy/data/office-history-coverage.jsonl",
  "docs/phase1/italy/data/successor-crosswalk.jsonl",
] as const;

export const CAMERA_ID = "IT.NATIONAL.camera";
export const SENATE_ID = "IT.NATIONAL.senato";
export const PRESIDENT_ID = "IT.NATIONAL.president";
export const EP_ID = "IT.EP";
export const VDA_COUNCIL_ID = "IT.REGIONE.02.council";
export const TAA_COUNCIL_ID = "IT.REGIONE.04.council";
export const BOLZANO_COUNCIL_ID = "IT.PROVINCE.021.council";
export const TRENTO_PRESIDENT_ID = "IT.PROVINCE.022.president";
export const FVG_UDINE_COUNCIL_ID = "IT.FVG.2026.030.council";
export const FIRENZE_Q1_COUNCIL_ID = "IT.FIRENZE.Q1.council";
export const PENDING_STATE_NOTE = "statutory_pending_first_election";
export const FVG_ID_PREFIX = "IT.FVG.2026.";

export const TIER_SHA256 = "d286962e262a2fbf35deed41b96a98c11a0c7a4d88de239420a23e5fd6aa55fb";
export const DRAFT_TIERS_SHA256 = "78ded26d2829452862245330bfc99131d890436d46709021db5aa176db963d8e";
export const OFFICE_REGISTER_SHA256 = "6eb39d5dde93ede9b1199d67bb123af8241de10c237c02d65cc3c17c7f6e1ff8";
/** Full review ZIP. Not this release. */
export const REVIEW_ZIP_SHA256 = "4e8a6b6d0006727e2af2b10fb4054679861656b94ef4147c8ff927c56396809d";

/**
 * Figures recorded in the checked-in counts file for the full pack.
 * Slim land omitted the event and result files. These numbers are not published
 * as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 515;
export const FULL_PACK_DOCUMENTED_RESULTS = 606051;

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "d5c6c67d68d4f009e45fcfeeb284df74fe6daf75f81b1526627c32b74b38c2c2";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";
export const COUNTRY_NAME = "Italy";
export const HOLD_STATUS = "open";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/italy/Italy_Import.md": "70ada52ff49717824512b71edd107957405ef6ffc7868ff7386bf4190b53560d",
  "docs/phase1/italy/JUSTIN_ACCEPTANCE.md": "7d68a73d8b7044b9bbd44340cb58c9661382c339b9597aa064fa21e96e6bef0a",
  "docs/phase1/italy/README.md": "46225eaaccc8aaa6390e1587192fa553afef8f1e9ce242238a0029ec9d16c297",
  "docs/phase1/italy/SHA256SUMS": "5f2eaf8b9a59ac4ff9bc2f2b694b81722c8b4095cbdaa1a518b19c1acd282241",
  "docs/phase1/italy/SLIM_LAND_NOTE.md": "7d8d224bf2541b4b5d9afa53300ea68044db80ef0350b0fb482bbbb43b35f522",
  "docs/phase1/italy/acceptance-examples.md": "a7ff48cc3c15d7d6c1c1b5de389c02e5e75ad1ccf3a7e009a55f2ee47ad64572",
  "docs/phase1/italy/contract/columns.json": "50ab3013ed9bdcb9b878356ce3c2f17bc5a2a37fa80e4746332fb82483d4e833",
  "docs/phase1/italy/contract/provenance.json": "656ae273242e9e9cdbd47308f7fe52a56f33c78c7f1c3aa1b6362c06fa825474",
  "docs/phase1/italy/count-summary.md": "ab33250293aa4729f5853ac43c652739ea9167e7d2a6bdf4731ce49a74761921",
  "docs/phase1/italy/data/acceptance-examples.json": "3d38bab78ace804e6f39cf2b5f37e3e2cf8121d32b59027b5533ca590b8bd6d4",
  [APPROVAL_STATE_RELATIVE]: "dc49cd4981b63d69ece6b2429814a0b40bade98a6be6f58bfe391d27958e2038",
  "docs/phase1/italy/data/arithmetic-audit.json": "26c2a7623ff3adb800cf6b358e8d58f8e5bea65c7a70e4952b4842d4b2569ff3",
  [COUNTS_RELATIVE]: "b7963801ce1d6d1b04477debedd1e59918bd1a5174de82a75ddac7147c616c97",
  "docs/phase1/italy/data/documented-name-aliases.jsonl": "3c3edee29ec0448a5f1d7fd3c069894bf41b6b5f218ea1d8411831d2e6fb37f9",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  "docs/phase1/italy/data/event-office-links.jsonl": "4d01f6c46610c769580b69fca18ed5a9f7779cfdad5494655c8e19770d644b5d",
  "docs/phase1/italy/data/extraction-issues.json": "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570",
  "docs/phase1/italy/data/field-map-223.jsonl": "6c9e64089bc2e6ace1daaeadf052b9e3ab6ead69a3062ac19715367737fcd150",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  "docs/phase1/italy/data/provincial-metropolitan-dispositions.jsonl": "d1b86358a3af04be6ffb723b3d0ba1bb19af26308a5e2f05b53b6f853244ebef",
  [RESEARCH_GAPS_RELATIVE]: "a5cf05f2c2308a7267efb15d9683f39c58c5dac14705d440751b7b715bbec6dc",
  "docs/phase1/italy/data/result-audit.json": "3166059cf8fbd4a120f72a4aecb1255e78f142438b437d270f45b7e93eae8a9f",
  "docs/phase1/italy/data/source-inventory.json": "4db433e6073cbb821f800db9d4ddeec743c4cadd8034f29fae6c7ab5f9741c07",
  "docs/phase1/italy/data/taa-extraction-audit.json": "eb74b4c517560edd0b0445d54759b394a7fea86b1356b8d6f352cc59a15d6eb4",
  "docs/phase1/italy/field-map-223.md": "4fdd866d62b0a95998002db78906fcc3ccc069afe68056f8577dfdff213f0597",
  "docs/phase1/italy/identity-rules.md": "b58eb6b0676c4e4c37e50e82648ff961119456c02fc056510e4ccd3bf5886338",
  "docs/phase1/italy/justin-report.md": "33a825b89edc1bf7139dbd0afd87bfaa612b2a997dd22b152e4e53026d7339c6",
  "docs/phase1/italy/mechanisms-and-law-vintages.md": "c6f7b4a1fcb30b02a0515bc43f2f420fd35bed30900daa09bdfb8c33ae517d98",
  "docs/phase1/italy/methodology.md": "af635bb6e653d3e2d5126a70afade5309ce81a614e2cec1f98e64e4595109a93",
  "docs/phase1/italy/research-gaps.md": "711e4e366747da22c3f6ece15eeb0da4ed16096ede4738d530ab5e0bb0a756ae",
  "docs/phase1/italy/source-inventory.md": "eab875ad6241c549a681f59c04791ed23eb349b68275e49fd86ab4f0560d4584",
  "docs/phase1/italy/validate.py": "8150ebc8f5fde445752602ee43efe1c97227a5dec5e0916c05554e38d5d07aaa",
  "docs/phase1/italy/validation-report.json": "e14874dee418af7ea85f75898b7748dcc3da51b93996de9cf65947fcecd21dd8",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "direct_mayor",
  "direct_deputy_mayor",
  "regional_council",
  "direct_regional_president",
  "autonomous_provincial_council",
  "direct_autonomous_provincial_president",
  "provincial_council",
  "direct_provincial_president",
  "national_lower_chamber",
  "national_upper_chamber",
  "indirect_head_of_state",
  "european_parliament_delegation",
  "quartiere_council",
  "direct_quartiere_president",
] as const;

export type ItalyRegisterStatus = "current" | "historical_only" | "statutory_pending_first_election";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "office_id",
  "country",
  "name",
  "office_type",
  "level",
  "region_code",
  "territory_code",
  "status",
  "selection_mode",
  "direct_executive",
  "source_id",
  "legal_source_id",
  "as_of",
  "effective_from",
  "effective_to",
  "notes",
  "justin_approved",
  "cadastral_code",
  "source_row",
]);

const FORBIDDEN_OFFICE = /circoscrizion|CIRCOSCRIZ|DELRIO|PRIME[-_ ]?MINISTER|PRESIDENTE DEL CONSIGLIO|PREFET/i;
const COUNTRY_OFFICE_IDS = new Set<string>([CAMERA_ID, SENATE_ID, PRESIDENT_ID, EP_ID]);

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Italy office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) {
    throw new Error(`Refusing excluded Italy office ${officeId}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  for (const key of Object.keys(row)) {
    if (!REGISTER_KEYS.has(key)) {
      throw new Error(`Refusing undocumented Italy office field ${key} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(key)) {
      throw new Error(`Refusing Italy successor field ${key} on ${officeId}`);
    }
  }
}

/** Atlas SQL interchange of a supplied numeric tier. The numeric tier stays on the row. */
export function schemaInterchangeTier(draftTier: number): "national_context" | "regional" | "municipal" {
  if (draftTier === 1) return "national_context";
  if (draftTier === 2 || draftTier === 3) return "regional";
  if (draftTier === 4) return "municipal";
  throw new Error(`Unsupported Italy numeric tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: ItalyRegisterStatus): "current" | "historical" {
  if (registerStatus === "current" || registerStatus === "statutory_pending_first_election") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Italy register status ${String(registerStatus)}`);
}

export function usesCountryGeography(officeId: string): boolean {
  return COUNTRY_OFFICE_IDS.has(officeId);
}

export const HOLD_IDS = [
  "IT-G01",
  "IT-G02",
  "IT-G03",
  "IT-G04",
  "IT-G05",
  "IT-G06",
  "IT-G07",
  "IT-G08",
  "IT-G09",
  "IT-G10",
  "IT-G11",
  "IT-G12",
  "IT-G13",
  "IT-G14",
  "IT-G15",
  "IT-G16",
  "IT-G17",
  "IT-G18",
  "IT-G19",
] as const;

export const REGION_CURRENT_OFFICES: Readonly<Record<string, number>> = {
  "01": 2362,
  "02": 223,
  "03": 3004,
  "04": 568,
  "05": 1120,
  "06": 432,
  "07": 470,
  "08": 662,
  "09": 558,
  "10": 186,
  "11": 452,
  "12": 758,
  "13": 612,
  "14": 274,
  "15": 1102,
  "16": 516,
  "17": 264,
  "18": 810,
  "19": 784,
  "20": 756,
};

export const REGIONAL_CALENDAR_LABEL =
  "49 schema-regional offices are supplied numeric tiers 2 (38) and 3 (11), preserved on each row. Holds IT-G01–IT-G19 stay open. No successor edges. Slim land publishes 0 events and 0 result rows; those omitted files are not invented. Pending FVG offices are not given election dates.";

export const COUNTRY_NOTES = [
  "Prompt AT: 15,917 current offices, 696 historical-only offices, and 8 statutory pending FVG offices. Coverage partial. research_coverage_complete stays false.",
  "Numeric draft tiers stay 4 / 38 / 11 / 16,568. They are preserved on each classification row.",
  "The schema tier column is the required Atlas interchange: tier 1 national_context, tiers 2 and 3 regional, tier 4 municipal, other 0. It does not replace the numeric label.",
  "Current direct executives stay 7,992. Current collective bodies stay 7,924. The indirect presidency is neither.",
  "Published events: 0. Published result rows: 0. Omitted results and events are not reconstructed and are not given omitted-total counters.",
  "Successor edges stay 0. Fusioni and Delrio dispositions do not become successor edges.",
  "Valle d'Aosta and Trentino-Alto Adige have no regional president row. Bolzano has no direct provincial president. Ordinary provincial and metropolitan popular offices stay 0.",
  "Eight FVG offices stay statutory_pending_first_election. SQL office_status stores them as current because the schema has no pending value; state_note keeps statutory_pending_first_election. No election date is invented.",
  "Every classification stays needs_review. Per-office draft review_status stays unapproved_draft and justin_approved stays false.",
  "Holds IT-G01 through IT-G19 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 16621,
  current_offices: 15917,
  historical_offices: 696,
  pending_fvg_offices: 8,
  geographies: 8273,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_1: 4,
  draft_tier_2: 38,
  draft_tier_3: 11,
  draft_tier_4: 16568,
  schema_national: 4,
  schema_regional: 49,
  schema_municipal: 16568,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 16621,
  sources: 0,
  unresolved_evidence: 19,
  named_holds: 19,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 34,
  research_dates: 0,
  direct_executive_offices: 7992,
  historical_direct_executives: 348,
  pending_direct_executives: 4,
  current_collective_bodies: 7924,
  current_municipal_offices: 15862,
  current_municipal_councils: 7894,
  current_direct_mayors: 7894,
  deputy_mayors: 74,
  historical_councils: 348,
  historical_mayors: 348,
  pending_councils: 4,
  regional_councils: 20,
  direct_regional_presidents: 18,
  autonomous_provincial_councils: 2,
  direct_autonomous_provincial_presidents: 1,
  firenze_quartiere_offices: 10,
  national_offices: 3,
  ep_offices: 1,
  ordinary_provincial_popular_offices: 0,
  indirect_head_of_state_offices: 1,
  vda_regional_presidents: 0,
  taa_regional_presidents: 0,
  bolzano_direct_presidents: 0,
  evidence_links: 0,
  region_01: 2362,
  region_02: 223,
  region_03: 3004,
  region_04: 568,
  region_05: 1120,
  region_06: 432,
  region_07: 470,
  region_08: 662,
  region_09: 558,
  region_10: 186,
  region_11: 452,
  region_12: 758,
  region_13: 612,
  region_14: 274,
  region_15: 1102,
  region_16: 516,
  region_17: 264,
  region_18: 810,
  region_19: 784,
  region_20: 756,
} as const;

export type ItalyHashInputs = {
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

export function italyUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): ItalyHashInputs {
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

export function fingerprintSha256(hashInputs: ItalyHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
