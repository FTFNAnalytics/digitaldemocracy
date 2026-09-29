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

/** Namespace supplied by the Georgia office register. Current, hold, and historical rows share it. */
export const CURRENT_NAMESPACE = "georgia_BG_research";
export const LINEAGE_ID = "country-package-georgia";
export const SOURCE_NAMESPACE = "country-package-georgia";
export const COUNTRY_ID = "georgia";
export const COUNTRY_CODE = "GE";
export const COUNTRY_NAME = "Georgia";
export const COUNTRY_GEOGRAPHY_ID = "GE";
export const ADJARA_GEOGRAPHY_ID = "GE-A";
export const ADAPTER_VERSION = "atlas-georgia-prompt-bg/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/georgia.json";
export const DOCS_PREFIX = "docs/phase1/georgia";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/georgia/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/georgia/data/draft-tiers.jsonl";
export const GEOGRAPHY_RELATIVE = "docs/phase1/georgia/data/geography.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/georgia/counts.json";
export const DATA_COUNTS_RELATIVE = "docs/phase1/georgia/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/georgia/research-gaps.json";
export const HOLDS_RELATIVE = "docs/phase1/georgia/data/holds.jsonl";
export const METADATA_RELATIVE = "docs/phase1/georgia/metadata.json";
export const VALIDATION_RELATIVE = "docs/phase1/georgia/validation-report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/georgia/JUSTIN_ACCEPTANCE.md";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/georgia/data/upcoming-calendar.jsonl";
export const IDENTITY_CROSSWALK_RELATIVE = "docs/phase1/georgia/data/identity-crosswalk.jsonl";
export const OBSERVATIONS_RELATIVE = "docs/phase1/georgia/data/unassigned-contest-observations.jsonl";
export const MANIFEST_RELATIVE = "docs/phase1/georgia/manifest.json";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/georgia";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/georgia/data/events.json",
  "docs/phase1/georgia/data/events.jsonl",
  "docs/phase1/georgia/data/results.json",
  "docs/phase1/georgia/data/results.jsonl",
  "docs/phase1/georgia/data/sources.json",
  "docs/phase1/georgia/sources",
] as const;

export const PARLIAMENT_ID = "GE-N-PARL";
export const ADJARA_SUPREME_COUNCIL_ID = "GE-A-ADJ-SC";
export const TBILISI_COUNCIL_ID = "GE-M-001-C";
export const TBILISI_MAYOR_ID = "GE-M-001-M";
export const TBILISI_GEOGRAPHY_ID = "GE-M-001";
export const SAMPLE_HOLD_COUNCIL_ID = "GE-HOLD-01-C";
export const HISTORICAL_PRESIDENT_ID = "GE-H-N-PRES";
export const HISTORICAL_CHAIR_ID = "GE-H-N-CHAIR1992";
export const HISTORICAL_ADJARA_HEAD_ID = "GE-H-A-ADJ-HEAD2001";
export const HISTORICAL_ADJARA_SENATE_ID = "GE-H-A-ADJ-SEN2001";
export const SAMPLE_HISTORICAL_COUNCIL_ID = "GE-H-M-017-PRE14-C";

export const TIER_SHA256 = "23ca79095d4cf79ee01db9c52d201dd1944a6b4d8fde61826942dc5933177011";
export const OFFICE_REGISTER_SHA256 = "5d793c2943c8c62ce3385c9197717ee4269e8a99908ef5f75c52e8d65de45f88";
export const DRAFT_TIERS_SHA256 = "4a5f05b870635084d1934d082e8af01d4688c335b069d5456dda6f5e8f6513f8";
export const GEOGRAPHY_SHA256 = "c7120cebf01a79d3f694abac48112ab2d9af0b4fd9b431ffe808a63fae6fc049";

/**
 * Figures recorded in the landed counts file. They are not published, and they
 * are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 710;
export const FULL_PACK_DOCUMENTED_RESULTS = 4543;
export const FULL_PACK_DOCUMENTED_SOURCE_ROWS = 170;
/** Documentary full-ZIP SHA from metadata.json. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "62e66da9de141f9bc3d634725d2eafc44a0ac75b21dd596ed3293a0db34b8289";

/**
 * Pinned after the slim-pack inventory scan. The full-ZIP SHA is not this release.
 * Replaced once the first scan prints the fingerprint.
 */
export const CANDIDATE_FINGERPRINT = "81cf55a061d03f7521ed7394300c8e8ddbea5efcc2d9b02f031a5e9700ad28b0";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-29";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/georgia/Acceptance_Examples.md": "e68a9d1c235c5254957d1e8e352a6a33aef59ba6a259cbd18aebbe411a7d95a4",
  "docs/phase1/georgia/Field_Map_223.md": "ccb1561c4c97278fd336f2de2ce27396e0ef9641cb334f883e5cb1c52b78eb2c",
  "docs/phase1/georgia/Georgia_Upcoming_Elections.md": "b356cb5a4c2b0469e788fbd98bdb2f45d6eeff4b92545aab8e95c7f1348f7e38",
  "docs/phase1/georgia/History_Coverage.md": "40886c12abfabd56a5b37b2dd29f0b5041a93261e331b847e22d3a7aa4c5ffc4",
  "docs/phase1/georgia/Identity_Rules.md": "1321097c6a9883f697e529ed09d04dd92776ae3d66e864e4dca8b44224dfc63a",
  [ACCEPTANCE_RELATIVE]: "acbe89896c31b446265748710104c62ecadaca931ef9da2e7bdbbcd37bcfbd50",
  "docs/phase1/georgia/JUSTIN_REPORT.md": "20cc908b663a386dda29908842c84b19bd87a2bd5a386bdec3b9aba1b8c6a343",
  "docs/phase1/georgia/Justin_Report.md": "20cc908b663a386dda29908842c84b19bd87a2bd5a386bdec3b9aba1b8c6a343",
  "docs/phase1/georgia/README.md": "585f12ccad92b5cdf48650dadc0370ced90b533c7b00c07ef9587d818db08e1b",
  "docs/phase1/georgia/Research_Gaps.md": "106596b17ebab6f319134d39e63b7354be705ad8282a59533d5cf9124fc7410f",
  "docs/phase1/georgia/SHA256SUMS": "0c8d3c60104cf0de0442243560626c7aea89098376986de93d1d72307807f7dd",
  "docs/phase1/georgia/SLIM_LAND_NOTE.md": "c52a4786c0be36d5c821ac69ca926e2dc41b49ee729f356693f7ff41e5a29f06",
  "docs/phase1/georgia/acceptance-examples.json": "e6105ed6994b445c3498c38a2b1fe7560b2ef3d9c6b4a911ebbbb3270dce78ce",
  "docs/phase1/georgia/acceptance-examples.md": "e68a9d1c235c5254957d1e8e352a6a33aef59ba6a259cbd18aebbe411a7d95a4",
  "docs/phase1/georgia/contract/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/georgia/contract/inheritance.json": "f0361d39e1cc0d57ab897fb1945a530739873b4240219f56b35b24e24f7e1a08",
  "docs/phase1/georgia/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/georgia/contracts/inheritance.json": "f0361d39e1cc0d57ab897fb1945a530739873b4240219f56b35b24e24f7e1a08",
  [COUNTS_RELATIVE]: "c57fddd5deab12cb6e9924827b1fa6f63e56e224c452d70c1db8f92f5cacce30",
  [DATA_COUNTS_RELATIVE]: "c57fddd5deab12cb6e9924827b1fa6f63e56e224c452d70c1db8f92f5cacce30",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  "docs/phase1/georgia/data/field-map-223.jsonl": "9fba6f2eead97cdfa12786d58e448598dca999b4a8690cb96bbd654a91e59dcf",
  [GEOGRAPHY_RELATIVE]: GEOGRAPHY_SHA256,
  [HOLDS_RELATIVE]: "e8314f7e9c93f24359598fd0d53c47e629e4bc80a8c38619460c9290af0027ad",
  [IDENTITY_CROSSWALK_RELATIVE]: "27ac24eabe89b32be4cdc79b941aa1d8e586bd2aabe857d43b2c994a62cdb5c9",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  "docs/phase1/georgia/data/research-gaps.jsonl": "e8314f7e9c93f24359598fd0d53c47e629e4bc80a8c38619460c9290af0027ad",
  [OBSERVATIONS_RELATIVE]: "60572e0006d52db034226f4ca01b77d733ed364bd85f29c2885db477184b868d",
  [UPCOMING_CALENDAR_RELATIVE]: "2158c50e082ab61d788485ba4db151615eac05f484b9d046dd2c0c49c5c63f1d",
  "docs/phase1/georgia/field-map-223.json": "236421dc3f58324a4529c302e8a02d23a65579a3c01595cba77427dd2c36fc23",
  "docs/phase1/georgia/field-map-223.md": "ccb1561c4c97278fd336f2de2ce27396e0ef9641cb334f883e5cb1c52b78eb2c",
  "docs/phase1/georgia/identity-rules.md": "1321097c6a9883f697e529ed09d04dd92776ae3d66e864e4dca8b44224dfc63a",
  [MANIFEST_RELATIVE]: "afe1cf688a55a6eee35678f229b8db0d9488072802c0d6e52d9ddc1038f0a1d3",
  [METADATA_RELATIVE]: "3ed18b95862e5eeee02cc236cbc9d64143f092e405fcb104b94312e15242951e",
  [RESEARCH_GAPS_RELATIVE]: "c89512ba8579bb999ef0ee73879b52ab1b1b76f3ff3708457c9181a7e3c80f27",
  "docs/phase1/georgia/research-gaps.md": "106596b17ebab6f319134d39e63b7354be705ad8282a59533d5cf9124fc7410f",
  "docs/phase1/georgia/validate.py": "a54ef96c8c7e7f5217774a480c10fab231226dd00cd303fe5372fb0ea640d813",
  [VALIDATION_RELATIVE]: "53ba1264c67e6cf747f0b412618e6d78512a95bd662eeca956bdac8725f6fbbf",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "parliament",
  "adjara_supreme_council",
  "municipal_council",
  "municipal_mayor",
  "statutory_continuation_council",
  "historical_municipal_council",
  "historical_municipal_mayor",
  "popular_president",
  "historical_popular_head_of_state",
  "historical_autonomous_legislature",
  "historical_popular_regional_head",
] as const;

export type GeorgiaDraftTier = "national" | "regional" | "local";
export type GeorgiaRegisterStatus = "current" | "current_scope_hold" | "historical_only";
export type GeorgiaOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const OFFICE_ID_RE =
  /^(GE-N-PARL|GE-A-ADJ-SC|GE-M-\d{3}-[CM]|GE-HOLD-0[1-5]-C|GE-H-N-PRES|GE-H-N-CHAIR1992|GE-H-A-ADJ-(SC1991|RC2001|SEN2001|HEAD2001)|GE-H-M-\d{3}-(PRE14-C|2014-[CM]))$/;
const FORBIDDEN_OFFICE =
  /european parliament|\bus-ga\b|united states|\babkhaz|\bsouth ossetia\b|\bossetian\b|prime minister|\bcabinet\b/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Georgia office id ${officeId}`);
  if (!ALLOWED_TYPE_SET.has(officeType)) throw new Error(`Refusing unlisted Georgia office type ${officeType} on ${officeId}`);
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Georgia office ${officeId}`);
  if (officeId.startsWith("US-") || officeId.includes("US-GA")) throw new Error(`Refusing US-GA office id ${officeId}`);
  if (officeType === "parliament" && officeId !== PARLIAMENT_ID) throw new Error(`Refusing a parliament that is not ${PARLIAMENT_ID}`);
  if (officeType === "adjara_supreme_council" && officeId !== ADJARA_SUPREME_COUNCIL_ID) {
    throw new Error(`Refusing an Adjara Supreme Council that is not ${ADJARA_SUPREME_COUNCIL_ID}`);
  }
  if (officeType === "popular_president" && officeId !== HISTORICAL_PRESIDENT_ID) {
    throw new Error(`Refusing a popular president that is not the historical office ${HISTORICAL_PRESIDENT_ID}`);
  }
}

export function officeTypeFor(args: {
  officeId: string;
  officeFamily: string;
  level: string;
  officeStatus: string;
}): GeorgiaOfficeType {
  const { officeId, officeFamily, level, officeStatus } = args;
  if (officeId === PARLIAMENT_ID && officeFamily === "national_legislature" && level === "national" && officeStatus === "current") {
    return "parliament";
  }
  if (
    officeId === ADJARA_SUPREME_COUNCIL_ID &&
    officeFamily === "autonomous_legislature" &&
    level === "Adjara" &&
    officeStatus === "current"
  ) {
    return "adjara_supreme_council";
  }
  if (officeId === HISTORICAL_PRESIDENT_ID && officeFamily === "popular_president" && level === "national" && officeStatus === "historical_only") {
    return "popular_president";
  }
  if (
    officeId === HISTORICAL_CHAIR_ID &&
    officeFamily === "historical_popular_head_of_state" &&
    level === "national" &&
    officeStatus === "historical_only"
  ) {
    return "historical_popular_head_of_state";
  }
  if (
    officeId === HISTORICAL_ADJARA_HEAD_ID &&
    officeFamily === "historical_popular_regional_head" &&
    level === "Adjara" &&
    officeStatus === "historical_only"
  ) {
    return "historical_popular_regional_head";
  }
  if (officeStatus === "historical_only" && officeFamily === "autonomous_legislature" && level === "Adjara") {
    return "historical_autonomous_legislature";
  }
  if (officeStatus === "current" && officeFamily === "municipal_mayor" && level === "municipal") return "municipal_mayor";
  if (officeStatus === "current" && officeFamily === "municipal_council" && level === "municipal") return "municipal_council";
  if (officeStatus === "current_scope_hold" && officeFamily === "municipal_council" && level === "municipal") {
    return "statutory_continuation_council";
  }
  if (officeStatus === "historical_only" && officeFamily === "municipal_mayor" && level === "municipal") return "historical_municipal_mayor";
  if (officeStatus === "historical_only" && officeFamily === "municipal_council" && level === "municipal") {
    return "historical_municipal_council";
  }
  throw new Error(`Unsupported Georgia office ${officeId} family ${officeFamily} at level ${level} (${officeStatus})`);
}

export function isDirectExecutive(officeType: string): boolean {
  return (
    officeType === "municipal_mayor" ||
    officeType === "historical_municipal_mayor" ||
    officeType === "popular_president" ||
    officeType === "historical_popular_head_of_state" ||
    officeType === "historical_popular_regional_head"
  );
}

export function expectedDraftTier(level: string): GeorgiaDraftTier {
  if (level === "national") return "national";
  if (level === "Adjara") return "regional";
  if (level === "municipal") return "local";
  throw new Error(`Unsupported Georgia level ${level}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "local") return "municipal";
  throw new Error(`Unsupported Georgia draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: GeorgiaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current" || registerStatus === "current_scope_hold") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Georgia register status ${String(registerStatus)}`);
}

export function geographyIdForOffice(officeId: string, level: string, supplied: unknown): string {
  if (typeof supplied === "string" && supplied.trim()) return supplied;
  if (level === "national") return COUNTRY_GEOGRAPHY_ID;
  if (level === "Adjara") return ADJARA_GEOGRAPHY_ID;
  throw new Error(`Office ${officeId} has no geography`);
}

export const OPEN_HOLD_IDS = [
  "GE-BG-G01",
  "GE-BG-G02",
  "GE-BG-G03",
  "GE-BG-G04",
  "GE-BG-G05",
  "GE-BG-G06",
  "GE-BG-G07",
  "GE-BG-G08",
  "GE-BG-G09",
  "GE-BG-G10",
  "GE-BG-G11",
  "GE-BG-G12",
  "GE-BG-G13",
  "GE-BG-G14",
  "GE-BG-G15",
  "GE-BG-G16",
  "GE-BG-G17",
  "GE-BG-G18",
  "GE-BG-G19",
  "GE-BG-G20",
  "GE-BG-G21",
] as const;

/** Source status labels. Every named hold stays open. */
export const GAP_STATUS: Readonly<Record<string, string>> = Object.fromEntries(
  OPEN_HOLD_IDS.map((holdId) => [holdId, "open_research_hold"]),
);

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const COUNTRY_NOTES = [
  "Prompt BG: 130 ordinary-cycle current offices, 5 statutory-continuation holds, and 41 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 3 national, 5 regional, and 168 local. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, regional to regional, and local to municipal. It does not replace the draft label.",
  "Current direct mayors stay 64. Current municipal councils stay 69 (64 ordinary-cycle councils plus 5 statutory-continuation councils). Parliament and the Adjara Supreme Council stay current. No current popular president.",
  "The five article-164 councils stay current scope holds. Their gamgebeli are not popular mayor offices.",
  "EP offices stay 0. Abkhazia and South Ossetia parallel institutions stay 0. Country code GE is Georgia, not the US state.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "Successor edges stay empty. The identity crosswalk is an election-geography label check, not a successor link.",
  "Upcoming-calendar docs stay documentary. Exact dates stay null. No country UI callout and no applied calendar rows.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved.",
  "Holds GE-BG-G01 through GE-BG-G21 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 176,
  current_offices: 135,
  ordinary_cycle_offices: 130,
  statutory_continuation_offices: 5,
  historical_offices: 41,
  geographies: 92,
  geographies_without_parent: 92,
  parents_left_null: 0,
  cec_geography_rows: 64,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 3,
  draft_tier_regional: 5,
  draft_tier_local: 168,
  schema_national: 3,
  schema_regional: 5,
  schema_municipal: 168,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 176,
  sources: 0,
  unresolved_evidence: 21,
  named_open_holds: 21,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  identity_crosswalk_rows: 128,
  explicit_predecessor_edges: 0,
  retained_inputs: 39,
  research_dates: 0,
  applied_calendar_rows: 0,
  upcoming_calendar_rows: 7,
  unassigned_observations: 2,
  current_direct_executives: 64,
  historical_direct_executives: 17,
  current_mayors: 64,
  current_municipal_councils: 69,
  current_ordinary_municipal_councils: 64,
  historical_municipal_councils: 21,
  historical_municipal_mayors: 14,
  parliament_offices: 1,
  adjara_supreme_council_offices: 1,
  historical_autonomous_legislatures: 3,
  ep_offices: 0,
  parallel_institution_offices: 0,
  evidence_links: 0,
  current_ordinary_municipalities: 64,
} as const;

export type GeorgiaHashInputs = {
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

export function georgiaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): GeorgiaHashInputs {
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

export function fingerprintSha256(hashInputs: GeorgiaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
