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

/** Namespace for the Ukraine office register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "atlas-research-ua-bd";
export const LINEAGE_ID = "country-package-ukraine";
export const SOURCE_NAMESPACE = "country-package-ukraine";
export const COUNTRY_ID = "ukraine";
export const COUNTRY_CODE = "UA";
export const COUNTRY_NAME = "Ukraine";
export const COUNTRY_GEOGRAPHY_ID = "UA-GEO-NAT";
export const ADAPTER_VERSION = "atlas-ukraine-prompt-bd/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/ukraine.json";
export const DOCS_PREFIX = "docs/phase1/ukraine";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/ukraine/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/ukraine/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/ukraine/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/ukraine/data/research-gaps.json";
export const METADATA_RELATIVE = "docs/phase1/ukraine/metadata.json";
export const VALIDATION_RELATIVE = "docs/phase1/ukraine/validation-report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/ukraine/JUSTIN_ACCEPTANCE.md";
export const TERRITORIAL_HOLDS_RELATIVE = "docs/phase1/ukraine/data/territorial-holds.jsonl";
export const IDENTITY_NOTES_RELATIVE = "docs/phase1/ukraine/data/identity-notes.jsonl";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/ukraine";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/ukraine/data/events.json",
  "docs/phase1/ukraine/data/events.jsonl",
  "docs/phase1/ukraine/data/results.json",
  "docs/phase1/ukraine/data/results.jsonl",
  "docs/phase1/ukraine/data/sources.json",
  "docs/phase1/ukraine/sources",
] as const;

export const PARLIAMENT_ID = "UA-NAT-PARL";
export const PRESIDENT_ID = "UA-NAT-PRES";
export const SAMPLE_OBLAST_ID = "UA-CVK2020-06467-C";
export const SAMPLE_RAION_ID = "UA-CVK2020-63553-C";
export const SAMPLE_MUNICIPAL_COUNCIL_ID = "UA-CVK2020-07199-C";
export const SAMPLE_MUNICIPAL_MAYOR_ID = "UA-CVK2020-07199-H";
export const SAMPLE_CITY_DISTRICT_ID = "UA-CVK2020-12189-C";
export const KYIV_COUNCIL_ID = "UA-CVK2020-00002-C";
export const KYIV_MAYOR_ID = "UA-CVK2020-00002-H";
export const VINNYTSIA_HISTORICAL_RAION_ID = "UA-HIST-VM2015-06528-C";
export const ARC_HISTORICAL_ASSEMBLY_ID = "UA-HIST-ARC-ASSEMBLY";
export const DONETSK_HISTORICAL_OBLAST_ID = "UA-HIST-DONETSK-OBLAST-C";
export const LUHANSK_HISTORICAL_OBLAST_ID = "UA-HIST-LUHANSK-OBLAST-C";
export const SEVASTOPOL_HISTORICAL_COUNCIL_ID = "UA-HIST-SEVASTOPOL-C";
export const OLYKA_COUNCIL_ID = "UA-CVK2020-63929-C";
export const SLOBOZHANSKE_COUNCIL_ID = "UA-CVK2020-64337-C";

/** Historical rows have no territory code. Each keeps its own geography. Parents stay null. */
export const HISTORICAL_GEOGRAPHY_IDS: Readonly<Record<string, string>> = {
  [VINNYTSIA_HISTORICAL_RAION_ID]: "UA-GEO-HIST-VM2015-06528",
  [ARC_HISTORICAL_ASSEMBLY_ID]: "UA-GEO-HIST-ARC",
  [DONETSK_HISTORICAL_OBLAST_ID]: "UA-GEO-HIST-DONETSK",
  [LUHANSK_HISTORICAL_OBLAST_ID]: "UA-GEO-HIST-LUHANSK",
  [SEVASTOPOL_HISTORICAL_COUNCIL_ID]: "UA-GEO-HIST-SEVASTOPOL",
};

export const TIER_SHA256 = "2397895a07472bf1d80a136db9805861b9a4cd5c46e6838ce7dfd5f335f83594";
export const OFFICE_REGISTER_SHA256 = "9088ee8f36be68d1fcd0312b4e092545d785ecf4c989055ab2ba9268080fbad8";
export const DRAFT_TIERS_SHA256 = "be91dde56204e34a15d328f63c8ccf95a78cf994a6a2bfa17c384551e5fbe6d4";

/**
 * Figures recorded in the landed counts file and validation receipt.
 * They are not published, and they are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 3322;
export const FULL_PACK_DOCUMENTED_RESULTS = 46800;
/** Documentary full-ZIP SHA from JUSTIN_ACCEPTANCE.md. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "7341ecfa1400c5bec0601443a74923bd1358a0076a8e3c2c75315b8ce045cfac";

/**
 * Pinned after the slim-pack inventory scan. The full-ZIP SHA is not this release.
 */
export const CANDIDATE_FINGERPRINT = "3df9efe58ec65dacfb6fa1d518b6150e1d530c2c163110a77c679f209f739025";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-28";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_RELATIVE]: "70eaf4fdfeaa2f2e8022b0f2d8704dcc8041b2b05379906256e9c80aac3c3886",
  "docs/phase1/ukraine/JUSTIN_REPORT.md": "52dd3599320f81d869e13210e5f45084a06501c5f17e7d6e9b51603606c6952a",
  "docs/phase1/ukraine/README.md": "006d2c53c5a949322eb2d00721fbfcde5bd40b3b2baef4c40f6cc0e9114bcbc7",
  "docs/phase1/ukraine/SHA256SUMS": "726685251058fd7cd3d4aac1c0665cedb3c9bd074ba85d2da1d6a510affa501a",
  "docs/phase1/ukraine/SLIM_LAND_NOTE.md": "dd759dbb841bf9030c2da6db0cd32e8863aab9b308f6231585897d38d2e80ff3",
  "docs/phase1/ukraine/acceptance-examples.json": "80da4ea2aeb999f7ce7ec12229582ae2c49ebce25959bedb603d1a0c8ed59721",
  "docs/phase1/ukraine/acceptance-examples.md": "d7bfbc0ce607b24dad7e9817883ed3def25d2d448cb2e3d6102e336ff7ac575e",
  "docs/phase1/ukraine/contract/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/ukraine/contract/inheritance.json": "e6c772e24012981056ae0c9a6546ce04f932f1591f5a0d4aba02b53d85ab4a77",
  "docs/phase1/ukraine/counts.json": "3bd5f7b470b845c1da4a6c090721e993f801812a4cc262b80600a9dc7dab6efb",
  [COUNTS_RELATIVE]: "3bd5f7b470b845c1da4a6c090721e993f801812a4cc262b80600a9dc7dab6efb",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [IDENTITY_NOTES_RELATIVE]: "3a479968846cd4b04959f26234ed7b0fae99020d604a187e6ae29d6198cbf66e",
  "docs/phase1/ukraine/data/nested-district-audit.jsonl": "c7c450a8f60de6b6f3775fffc0c6d200d9aed948b142a8d2fbc4ea85aa5f9e10",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  "docs/phase1/ukraine/data/parse-repair.json": "dda7ece5867bca43ec918a3d72c7678469fb4722445e405cc2c9e6c775886c14",
  [RESEARCH_GAPS_RELATIVE]: "67ed75e154e196f0f26c63ebdb5495690708aae890e60f9237c01a1b5343f32f",
  [TERRITORIAL_HOLDS_RELATIVE]: "0344fd58ed8697cbe0c9fba1713240f4adc99b11e0880b80c88ad574a5f72bf5",
  "docs/phase1/ukraine/data/territorial-register.jsonl": "91e48b856af82e515237447ddebf2d42989ef3dec8209723aa78731620df294c",
  "docs/phase1/ukraine/field-map-223.json": "3dc730cffde702365c9274a58d3de0cdbbc6516ba2c53daaf7fcb1375e30d0bb",
  "docs/phase1/ukraine/field-map-223.md": "538fa72a6d0fd256b85e880be95ffbdc8b2b6b3210b29c234fa96fa6bcc9fab3",
  "docs/phase1/ukraine/history-coverage.md": "2d877fd153a541dd6d1b73dea6d89d20a45a5df989beb7d8269ec69442612e78",
  "docs/phase1/ukraine/identity-rules.md": "b43c645ca4cd134f0f1849a8798758cea307079cd9637c52f08e7da09f277f5b",
  [METADATA_RELATIVE]: "a13fa2234b3d0ee481a0e67e7a8e651197422254388da786bba86e73796c4112",
  "docs/phase1/ukraine/research-gaps.json": "67ed75e154e196f0f26c63ebdb5495690708aae890e60f9237c01a1b5343f32f",
  "docs/phase1/ukraine/research-gaps.md": "7743230a86594c358669e1d9eb226004aa5762529d5d2a46a871d388ebc0ec90",
  "docs/phase1/ukraine/validate.py": "58b71df850bf263ced10225db12c6ecfae20f0c63559a0170e66190c4cf280f2",
  [VALIDATION_RELATIVE]: "aefd49b216b52bcd554b1b38b6b151570d50e7106b989e1231085541dc20bd20",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "national_assembly",
  "president",
  "oblast_council",
  "raion_council",
  "local_council",
  "mayor",
  "city_district_council",
  "autonomous_assembly",
  "special_city_council",
] as const;

export type UkraineDraftTier = "national" | "regional" | "autonomous" | "raion" | "local" | "city_district";
export type UkraineRegisterStatus = "current" | "historical_only";
export type UkraineOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const OFFICE_ID_RE =
  /^(UA-NAT-PARL|UA-NAT-PRES|UA-CVK2020-\d{5}-[CH]|UA-HIST-VM2015-\d{5}-C|UA-HIST-ARC-ASSEMBLY|UA-HIST-DONETSK-OBLAST-C|UA-HIST-LUHANSK-OBLAST-C|UA-HIST-SEVASTOPOL-C)$/;
const FORBIDDEN_OFFICE =
  /european parliament|європейськ(ий|ого) парламент|\bep\b|people'?s republic|народн(а|ої) республік|\b(dnr|lnr|dpr|lpr)\b|окупаційн/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Ukraine office id ${officeId}`);
  if (!ALLOWED_TYPE_SET.has(officeType)) throw new Error(`Refusing unlisted Ukraine office type ${officeType} on ${officeId}`);
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Ukraine office ${officeId}`);
  if (officeType === "president" && officeId !== PRESIDENT_ID) throw new Error(`Refusing a president office that is not ${PRESIDENT_ID}`);
  if (officeType === "national_assembly" && officeId !== PARLIAMENT_ID) {
    throw new Error(`Refusing a national assembly that is not ${PARLIAMENT_ID}`);
  }
  if (officeType === "autonomous_assembly" && officeId !== ARC_HISTORICAL_ASSEMBLY_ID) {
    throw new Error(`Refusing an autonomous assembly that is not ${ARC_HISTORICAL_ASSEMBLY_ID}`);
  }
  if (officeType === "special_city_council" && officeId !== SEVASTOPOL_HISTORICAL_COUNCIL_ID) {
    throw new Error(`Refusing a special-city council that is not ${SEVASTOPOL_HISTORICAL_COUNCIL_ID}`);
  }
}

export function officeTypeFor(officeKind: string, scopeLevel: string): UkraineOfficeType {
  if (officeKind === "legislature" && scopeLevel === "national") return "national_assembly";
  if (officeKind === "direct_executive" && scopeLevel === "national") return "president";
  if (officeKind === "direct_executive" && scopeLevel === "hromada") return "mayor";
  if (officeKind === "council" && scopeLevel === "oblast") return "oblast_council";
  if (officeKind === "council" && scopeLevel === "raion") return "raion_council";
  if (officeKind === "council" && scopeLevel === "hromada") return "local_council";
  if (officeKind === "council" && scopeLevel === "city_district") return "city_district_council";
  if (officeKind === "council" && scopeLevel === "autonomous") return "autonomous_assembly";
  if (officeKind === "council" && scopeLevel === "special_city") return "special_city_council";
  throw new Error(`Unsupported Ukraine office kind ${officeKind} at scope ${scopeLevel}`);
}

export function isDirectExecutive(officeType: string): boolean {
  return officeType === "mayor" || officeType === "president";
}

export function expectedDraftTier(scopeLevel: string): UkraineDraftTier {
  if (scopeLevel === "national") return "national";
  if (scopeLevel === "oblast") return "regional";
  if (scopeLevel === "autonomous") return "autonomous";
  if (scopeLevel === "raion") return "raion";
  if (scopeLevel === "hromada" || scopeLevel === "special_city") return "local";
  if (scopeLevel === "city_district") return "city_district";
  throw new Error(`Unsupported Ukraine scope ${scopeLevel}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional" || draftTier === "autonomous" || draftTier === "raion") return "regional";
  if (draftTier === "local" || draftTier === "city_district") return "municipal";
  throw new Error(`Unsupported Ukraine draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: UkraineRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Ukraine register status ${String(registerStatus)}`);
}

export const OPEN_HOLD_IDS = [
  "UA-BD-G01",
  "UA-BD-G02",
  "UA-BD-G03",
  "UA-BD-G04",
  "UA-BD-G05",
  "UA-BD-G06",
  "UA-BD-G07",
  "UA-BD-G08",
  "UA-BD-G09",
  "UA-BD-G10",
  "UA-BD-G11",
  "UA-BD-G12",
  "UA-BD-G13",
  "UA-BD-G14",
  "UA-BD-G15",
  "UA-BD-G16",
  "UA-BD-G17",
  "UA-BD-G18",
  "UA-BD-G19",
] as const;

/** Source status labels. None of them close the hold. */
export const GAP_STATUS: Readonly<Record<(typeof OPEN_HOLD_IDS)[number], string>> = {
  "UA-BD-G01": "open_research_or_policy_gate",
  "UA-BD-G02": "open_research_or_policy_gate",
  "UA-BD-G03": "open_research_or_policy_gate",
  "UA-BD-G04": "open_research_or_policy_gate",
  "UA-BD-G05": "open_research_or_policy_gate",
  "UA-BD-G06": "open_research_or_policy_gate",
  "UA-BD-G07": "open_research_or_policy_gate",
  "UA-BD-G08": "open_research_or_policy_gate",
  "UA-BD-G09": "open_research_or_policy_gate",
  "UA-BD-G10": "open_research_or_policy_gate",
  "UA-BD-G11": "open_research_or_policy_gate",
  "UA-BD-G12": "open_research_or_policy_gate",
  "UA-BD-G13": "open_research_or_policy_gate",
  "UA-BD-G14": "open_research_or_policy_gate",
  "UA-BD-G15": "open_research_or_policy_gate",
  "UA-BD-G16": "open_research_or_policy_gate",
  "UA-BD-G17": "open_research_or_policy_gate",
  "UA-BD-G18": "open_research_or_policy_gate",
  "UA-BD-G19": "open_research_or_policy_gate",
};

/** Every named hold stays open. A status phrase is not a closure. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "145 schema-regional offices: 24 oblast councils, 1 historical Autonomous Republic of Crimea assembly, and 120 raion councils. Draft labels regional, autonomous, and raion stay on each row. Holds UA-BD-G01 through UA-BD-G19 stay open. No successor edges. Published events, result rows, and sources stay 0; omitted research bytes are not projected and omitted totals are not invented. EP offices stay 0. Occupying-power institutions stay 0.";

export const COUNTRY_NOTES = [
  "Prompt BD: 3,000 current offices and 5 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national, 24 regional, 1 autonomous, 120 raion, 2,843 local, and 15 city_district. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, regional, autonomous, and raion to regional, and local and city_district to municipal. It does not replace the draft label.",
  "Current direct executives stay 1,422 (the President and 1,421 municipal heads). Current councils stay 1,577. The legislature stays 1. Historical-only rows are five Ukrainian councils.",
  "EP offices stay 0. Occupying-power institutions stay 0. Ukraine-scope only. Territorial holds stay holds, not a control census.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "Successor edges stay empty. Identity notes are not successor edges and are not projected.",
  "No upcoming date is calculated. Nationwide martial-law holds stay open and are not coerced into research dates.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved.",
  "Holds UA-BD-G01 through UA-BD-G19 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 3005,
  current_offices: 3000,
  historical_offices: 5,
  geographies: 1583,
  geographies_without_parent: 38,
  parents_left_null: 9,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_regional: 24,
  draft_tier_autonomous: 1,
  draft_tier_raion: 120,
  draft_tier_local: 2843,
  draft_tier_city_district: 15,
  schema_national: 2,
  schema_regional: 145,
  schema_municipal: 2858,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 3005,
  sources: 0,
  unresolved_evidence: 19,
  named_open_holds: 19,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 29,
  research_dates: 0,
  direct_executive_offices: 1422,
  current_direct_executives: 1422,
  historical_direct_executives: 0,
  current_local_mayors: 1421,
  current_local_councils: 1421,
  current_raion_councils: 119,
  historical_raion_councils: 1,
  current_oblast_councils: 22,
  historical_oblast_councils: 2,
  current_city_district_councils: 15,
  current_national_assemblies: 1,
  president_offices: 1,
  historical_autonomous_assemblies: 1,
  historical_special_city_councils: 1,
  current_councils: 1577,
  current_legislatures: 1,
  unnamed_current_heads: 23,
  territorial_hold_rows: 374,
  ep_offices: 0,
  occupying_power_offices: 0,
  evidence_links: 0,
} as const;

export type UkraineHashInputs = {
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

export function ukraineUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): UkraineHashInputs {
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

export function fingerprintSha256(hashInputs: UkraineHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
