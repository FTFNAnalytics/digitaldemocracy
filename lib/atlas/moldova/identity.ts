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

/** Namespace supplied by the Moldova office register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "atlas-research-md-bc";
/** Namespace recorded on the draft tier file. Offices join on the register namespace. */
export const TIER_FILE_NAMESPACE = "moldova-research-bc-v1";
export const LINEAGE_ID = "country-package-moldova";
export const SOURCE_NAMESPACE = "country-package-moldova";
export const COUNTRY_ID = "moldova";
export const COUNTRY_CODE = "MD";
export const COUNTRY_NAME = "Republic of Moldova";
export const COUNTRY_GEOGRAPHY_ID = "MD-GEO-NAT";
export const ADAPTER_VERSION = "atlas-moldova-prompt-bc/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/moldova.json";
export const DOCS_PREFIX = "docs/phase1/moldova";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/moldova/data/office-register.json";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/moldova/data/draft-tiers.json";
export const GEOGRAPHIES_RELATIVE = "docs/phase1/moldova/data/geographies.json";
export const COUNTS_RELATIVE = "docs/phase1/moldova/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/moldova/data/research-gaps.json";
export const CROSSWALK_RELATIVE = "docs/phase1/moldova/data/identity-crosswalk.json";
export const METADATA_RELATIVE = "docs/phase1/moldova/metadata.json";
export const VALIDATION_RELATIVE = "docs/phase1/moldova/validation-report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/moldova/JUSTIN_ACCEPTANCE.md";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/moldova";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/moldova/data/events.json",
  "docs/phase1/moldova/data/events.jsonl",
  "docs/phase1/moldova/data/results.json",
  "docs/phase1/moldova/data/results.jsonl",
  "docs/phase1/moldova/data/sources.json",
  "docs/phase1/moldova/data/office-history-coverage.jsonl",
  "docs/phase1/moldova/sources",
] as const;

export const PARLIAMENT_ID = "MD-NAT-PARL";
export const PRESIDENT_ID = "MD-NAT-PRES";
export const GAGAUZIA_ASSEMBLY_ID = "MD-GAG-A";
export const GAGAUZIA_GOVERNOR_ID = "MD-GAG-G";
export const SAMPLE_RAION_ID = "MD-RAION-1000-C";
export const SAMPLE_MUNICIPAL_COUNCIL_ID = "MD-MUN-0100-C";
export const SAMPLE_MUNICIPAL_MAYOR_ID = "MD-MUN-0100-M";
export const LEOVA_HISTORICAL_COUNCIL_ID = "MD-MUN-5701-C-PRE2025";
export const CALINESTI_HISTORICAL_MAYOR_ID = "MD-MUN-4315-M-PRE2025";

export const TIER_SHA256 = "9d81bbcab39919cf6af4a87b9d2ea049af61deda1718442f9eff9373e65f5fd9";
export const OFFICE_REGISTER_SHA256 = "4eb0f187809f6e84ed150e7ce1c7db6cc7ce997587447a51219636a13fef34a2";
export const DRAFT_TIERS_SHA256 = "d022b1c6d8ff5f9113433d8e88dec85386bc415c55dafd71316b4d52a561997c";
export const GEOGRAPHIES_SHA256 = "a172536d3693cc10f82315b1b932c60d12e690c4834aa7543104e1f9251ad291";

/**
 * Figures recorded in the landed counts file and validation receipt.
 * They are not published, and they are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 3882;
export const FULL_PACK_DOCUMENTED_RESULTS = 9843;
export const FULL_PACK_DOCUMENTED_SOURCE_INVENTORY_ENTRIES = 110;
export const REFERENCE_CROSSWALK_ROWS = 1802;
/** Documentary full-ZIP SHA from JUSTIN_ACCEPTANCE.md. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "b670de0faf0d7c7a5fae0daa91295e92e9a3ee80fce4f193e6ee6383db774acb";

/**
 * Pinned after the slim-pack inventory scan. The full-ZIP SHA is not this release.
 */
export const CANDIDATE_FINGERPRINT = "16da2df38767914646446f1d78ebee594b8a221187f52695606c4da795e3ce44";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-28";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_RELATIVE]: "dafd34abef39e2d5c25e062b8954eb815d67a3aa6f62d570bc1c751c5d898732",
  "docs/phase1/moldova/JUSTIN_REPORT.md": "1126664d12fe9e2dde700b12b249a66bab7f7aa83fd38b90198055b199c9919d",
  "docs/phase1/moldova/Moldova_Acceptance_Examples.md": "3a1679a5bda33ef7e570dd70b45cde460a9207779078f06e4cab05a2a9b2b41c",
  "docs/phase1/moldova/Moldova_Field_Map.md": "84a8001e3c9335d06bde5a0945be3df78e3dbc51c6abbb0bb74bf41532241ae9",
  "docs/phase1/moldova/Moldova_Identity_Rules.md": "ca7ec60dbe1337ec857d7fc5845d8f9b40b78fe151dd04d5eceb9f00858d0b7f",
  "docs/phase1/moldova/Moldova_Office_Register.md": "9e5e3b151279dd330c701e5de062ebe997387155df738d72a282c647a1b01bc6",
  "docs/phase1/moldova/Moldova_Research_Gaps.md": "d8573eccd756bcb3d6b18078e460e16e5fd3b48cc9f4b80a60f2cd7584f1c1df",
  "docs/phase1/moldova/Moldova_Source_Inventory.md": "2ec9426a6f196bad7b0f1701a083c55c96016727258d92139eabce5bf3b4d812",
  "docs/phase1/moldova/README.md": "61987eb5feaa6bd850f08e1c9b7c3547e6774dfcfc4e9bd4e2e4870bcfeeaf0c",
  "docs/phase1/moldova/SHA256SUMS": "8cec88b2a2c1487cf4bd1cf76e5073d504997119d95bccb60ee7b9501480fd06",
  "docs/phase1/moldova/SLIM_LAND_NOTE.md": "9e19e678819ec648b37dc7521ff289811e392c44309e1e35f8dc5c0f6db153d6",
  "docs/phase1/moldova/contract/column-map.json": "eb1c8b4a5026febc8b26633c94ad092f0bbeab0f49804dfb75b421565be64643",
  "docs/phase1/moldova/contract/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/moldova/contract/contract-provenance.json": "0390bdf9a136e3a163f5bf531a1df3afac2b19fedebf6131e6d22237187653a5",
  [COUNTS_RELATIVE]: "a36f407d96e8edb6077a2682ba030d56c9f0b44a6385fccaf3caeff088555095",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [GEOGRAPHIES_RELATIVE]: GEOGRAPHIES_SHA256,
  [CROSSWALK_RELATIVE]: "48961d6188e20e4544e9698f378ea1686f279210d44b4f3235dffcc0b1f0c9d2",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "9fe17698c88f1bd9fe268f993d01400c906cab9387512c08b64fb182b569b899",
  [METADATA_RELATIVE]: "8a7dad164be13d728252c0ce584db0a8e0d99ebe916e5dd59b195004ed0e57af",
  "docs/phase1/moldova/validate.py": "bd8561942c87b9acb9cf001c152c5e79ff29d32c99eb000c24fb82aa7916b4b8",
  [VALIDATION_RELATIVE]: "d2bdd24d48c20c17bb792c9bce213f659c17678996049a8cebfaf5ee5b67eda9",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "national_assembly",
  "president",
  "autonomous_assembly",
  "autonomous_governor",
  "raion_council",
  "local_council",
  "mayor",
] as const;

export type MoldovaDraftTier = "national" | "autonomous" | "raion" | "municipal";
export type MoldovaRegisterStatus = "current" | "historical_only";
export type MoldovaOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const OFFICE_ID_RE = /^(MD-NAT-PARL|MD-NAT-PRES|MD-GAG-A|MD-GAG-G|MD-RAION-\d{4}-C|MD-MUN-\d{4}-[CM](?:-PRE2025)?)$/;
const FORBIDDEN_OFFICE =
  /european parliament|parlamentul european|\bep\b|transnistr|pridnestrov|\bpmr\b|tiraspol|prime minister|prim-ministru|cabinet/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Moldova office id ${officeId}`);
  if (!ALLOWED_TYPE_SET.has(officeType)) throw new Error(`Refusing unlisted Moldova office type ${officeType} on ${officeId}`);
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Moldova office ${officeId}`);
  if (officeType === "president" && officeId !== PRESIDENT_ID) throw new Error(`Refusing a president office that is not ${PRESIDENT_ID}`);
  if (officeType === "national_assembly" && officeId !== PARLIAMENT_ID) {
    throw new Error(`Refusing a national assembly that is not ${PARLIAMENT_ID}`);
  }
  if (officeType === "autonomous_assembly" && officeId !== GAGAUZIA_ASSEMBLY_ID) {
    throw new Error(`Refusing an autonomous assembly that is not ${GAGAUZIA_ASSEMBLY_ID}`);
  }
  if (officeType === "autonomous_governor" && officeId !== GAGAUZIA_GOVERNOR_ID) {
    throw new Error(`Refusing an autonomous governor that is not ${GAGAUZIA_GOVERNOR_ID}`);
  }
}

export function isDirectExecutive(officeType: string): boolean {
  return officeType === "mayor" || officeType === "president" || officeType === "autonomous_governor";
}

export function expectedDraftTier(scopeLevel: string): MoldovaDraftTier {
  if (scopeLevel === "national") return "national";
  if (scopeLevel === "gagauzia") return "autonomous";
  if (scopeLevel === "raion") return "raion";
  if (scopeLevel === "local") return "municipal";
  throw new Error(`Unsupported Moldova scope ${scopeLevel}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national") return "national_context";
  if (draftTier === "autonomous" || draftTier === "raion") return "regional";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Moldova draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: MoldovaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Moldova register status ${String(registerStatus)}`);
}

export const OPEN_HOLD_IDS = [
  "MD-BC-G01",
  "MD-BC-G02",
  "MD-BC-G03",
  "MD-BC-G04",
  "MD-BC-G05",
  "MD-BC-G06",
  "MD-BC-G07",
  "MD-BC-G08",
  "MD-BC-G09",
  "MD-BC-G10",
  "MD-BC-G11",
  "MD-BC-G12",
  "MD-BC-G13",
  "MD-BC-G14",
  "MD-BC-G15",
  "MD-BC-G16",
  "MD-BC-G17",
  "MD-BC-G18",
  "MD-BC-G19",
  "MD-BC-G20",
  "MD-BC-G21",
  "MD-BC-G22",
  "MD-BC-G23",
  "MD-BC-G24",
] as const;

/** Source status labels. None of them close the hold. */
export const GAP_STATUS: Readonly<Record<(typeof OPEN_HOLD_IDS)[number], string>> = {
  "MD-BC-G01": "Resolved scope; numeric/legal holds remain",
  "MD-BC-G02": "Era gate applied",
  "MD-BC-G03": "Rule documented; era specificity retained",
  "MD-BC-G04": "Current/covered direct mode established",
  "MD-BC-G05": "Current 32 councils established; older eras held",
  "MD-BC-G06": "Two distinct elected bodies retained",
  "MD-BC-G07": "Source-identified territorial versions; no successor links",
  "MD-BC-G08": "No prospective deletion or twin office",
  "MD-BC-G09": "Distinct elected subordinate bodies retained",
  "MD-BC-G10": "24 source members held unassigned",
  "MD-BC-G11": "Primary counts labelled as derived",
  "MD-BC-G12": "Cycle-only dates; no synthetic executive seat",
  "MD-BC-G13": "Separate polls preserved; later legal outcome hold",
  "MD-BC-G14": "Constituencies are events, not offices",
  "MD-BC-G15": "Exclusion confirmed",
  "MD-BC-G16": "Unapproved documentation",
  "MD-BC-G17": "Incomplete losing-list vectors; 2001 conflict held",
  "MD-BC-G18": "Primary certification retained",
  "MD-BC-G19": "Partial history, not a certified exhaustive archive",
  "MD-BC-G20": "No Soviet/Bessarabian duplicates",
  "MD-BC-G21": "Eight source-confirmed scheduled records",
  "MD-BC-G22": "Bytes and extracts distinguished",
  "MD-BC-G23": "New territories evidenced; four numeric vectors transcribed",
  "MD-BC-G24": "No guessed party/person mergers",
};

/** Every named hold stays open. A status phrase is not a closure. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "34 schema-regional offices: 2 Gagauzia autonomous offices and 32 raion councils. Draft labels autonomous and raion stay on each row. Holds MD-BC-G01 through MD-BC-G24 stay open. No successor edges. Published events, result rows, and sources stay 0; omitted research bytes are not projected and omitted totals are not invented. EP offices stay 0. Transnistria-parallel offices stay 0.";

export const COUNTRY_NOTES = [
  "Prompt BC: 1,822 current offices and 14 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national, 2 autonomous, 32 raion, and 1,800 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, autonomous and raion to regional, and keeps municipal. It does not replace the draft label.",
  "Current direct executives stay 895 (893 mayors, the President, and the Bashkan). Current representative bodies stay 927. Historical-only rows are seven councils and seven mayors.",
  "EP offices stay 0. Transnistria-parallel offices stay 0. Moldova-scope only.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "office_successor_edges stays empty. The identity crosswalk is a reference file, not a successor edge, and is not projected.",
  "Eight source-confirmed next-election labels stay on the register row. They are not coerced into research dates.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved.",
  "Holds MD-BC-G01 through MD-BC-G24 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 1836,
  current_offices: 1822,
  historical_offices: 14,
  geographies: 934,
  geographies_without_parent: 8,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_autonomous: 2,
  draft_tier_raion: 32,
  draft_tier_municipal: 1800,
  schema_national: 2,
  schema_regional: 34,
  schema_municipal: 1800,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 1836,
  sources: 0,
  unresolved_evidence: 24,
  named_open_holds: 24,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 24,
  research_dates: 0,
  direct_executive_offices: 902,
  current_direct_executives: 895,
  historical_direct_executives: 7,
  current_local_mayors: 893,
  historical_local_mayors: 7,
  current_local_councils: 893,
  historical_local_councils: 7,
  current_raion_councils: 32,
  current_autonomous_assemblies: 1,
  current_autonomous_governors: 1,
  current_national_assemblies: 1,
  president_offices: 1,
  ep_offices: 0,
  transnistria_parallel_offices: 0,
  evidence_links: 0,
  current_representative_bodies: 927,
  scheduled_next_labels_uncoerced: 8,
} as const;

export type MoldovaHashInputs = {
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

export function moldovaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): MoldovaHashInputs {
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

export function fingerprintSha256(hashInputs: MoldovaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
