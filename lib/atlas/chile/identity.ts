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

/** Namespace for the Chile Prompt BJ draft register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "chile-research-bj-v1";
export const LINEAGE_ID = "country-package-chile";
export const SOURCE_NAMESPACE = "country-package-chile";
export const COUNTRY_ID = "chile";
export const COUNTRY_CODE = "CL";
export const COUNTRY_NAME = "Chile";
export const COUNTRY_GEOGRAPHY_ID = "CL";
export const ADAPTER_VERSION = "atlas-chile-prompt-bj/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/chile.json";
export const DOCS_PREFIX = "docs/phase1/chile";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/chile/data/office_register.json";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/chile/data/draft_tiers.json";
export const COMUNA_REGISTER_RELATIVE = "docs/phase1/chile/data/comuna_register.json";
export const REGION_REGISTER_RELATIVE = "docs/phase1/chile/data/region_register.json";
export const COUNTS_RELATIVE = "docs/phase1/chile/Count_Summary.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/chile/Research_Gaps.md";
export const VALIDATION_RELATIVE = "docs/phase1/chile/Validation_Report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/chile/JUSTIN_ACCEPTANCE.md";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/chile/data/upcoming_calendar.json";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/chile";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/chile/data/events.json",
  "docs/phase1/chile/data/events.jsonl",
  "docs/phase1/chile/data/results.json",
  "docs/phase1/chile/data/results.jsonl",
  "docs/phase1/chile/data/history_source_facts.jsonl",
  "docs/phase1/chile/sources",
] as const;

export const PRESIDENT_ID = "cl-president";
export const DEPUTIES_ID = "cl-deputies";
export const SENATE_ID = "cl-senate";
export const SAMPLE_GOVERNOR_ID = "cl-gov-01";
export const SAMPLE_CORE_ID = "cl-core-01";
export const SHARED_MAYOR_ID = "cl-mayor-cabodehornos";
export const SHARED_COUNCIL_ID = "cl-council-cabodehornos";
export const SHARED_MUNICIPAL_KEY = "cabodehornos";
export const SHARED_COMUNA_KEY = "antartica";
export const SHARED_GEOGRAPHY_ID = "CL-M-cabodehornos";
export const HISTORICAL_CONVENTION_ID = "cl-convention-2021";
export const HISTORICAL_COUNCIL_ID = "cl-constitutional-council-2023";

export const TIER_SHA256 = "5078997a517faa049a48a410c4b1c12b9515e3d9f077e398e7a911f83a88d312";
export const OFFICE_REGISTER_SHA256 = "13a91003fadbc6fc0e5841b2140a4d6aeb301e411ef29d950a5ad09bc5b0bddd";
export const DRAFT_TIERS_SHA256 = "e01615bd0d07658d6ea138ac97d4a543bfe5a57b42fb1109d69c23fbc6ab4d99";
export const COMUNA_REGISTER_SHA256 = "4aac96b4af30793b0b933e5674ba6599fee2632cd34cdcb0c2f20873aade1c08";
export const REGION_REGISTER_SHA256 = "4414975ba834321528bdbd7d82a109518a580452c4d699bead6b9cccaecf537b";

/**
 * Figures recorded in Count_Summary.json. They are not published, and they
 * are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 5319;
export const FULL_PACK_DOCUMENTED_RESULTS = 99566;
export const FULL_PACK_DOCUMENTED_SOURCE_FILES = 393;
/** Documentary full-ZIP SHA from JUSTIN_ACCEPTANCE.md. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "f94e5926c851d178d376880f2723c6d8569d7eab4116a96eee85f1ba90322947";

/** Pinned slim-pack fingerprint. The full-ZIP SHA is not this release. */
export const CANDIDATE_FINGERPRINT = "8941e7efb8b3e003c01a12d59cd207f3e1447c8a2528b4e0482a608a35989c7f";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-29";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/chile/Acceptance_Examples.md": "ae0088abe5ada895c7c48acc3d02527b0d2d381fa4970bf1925702f8e94417e4",
  "docs/phase1/chile/Chile_223_Column_Field_Map.md": "c89e9040e36588a17913150672872651a99dd18766a4362c747798064f901034",
  "docs/phase1/chile/Chile_Upcoming_Elections.md": "02ac58280d158910b04b1ebc4368aa96d506972bb850a0ae7ba5e9de80263e49",
  [COUNTS_RELATIVE]: "4e659088fd5696147214b5b6613facc702549777227eed71f567bbce842ed7af",
  "docs/phase1/chile/Identity_Rules.md": "30cc395ea5a089b67b188b30b92c5ede683cf605d52ba34577a45e430f39eb1a",
  [ACCEPTANCE_RELATIVE]: "b4cc20509de62fd6c6a0d42165249702463fc2cf1f51295dd14431de22e6221d",
  "docs/phase1/chile/Justin_Report.md": "00893a30e1d89824a0f0ceee56dc0ae51b2da97a98edbe50a4a55fe3377a982f",
  "docs/phase1/chile/README.md": "7539d33743695c9cf4c1a4835d272270243bff7a554773e6c3321e9438966425",
  [RESEARCH_GAPS_RELATIVE]: "de3b5294fe036b006a3710e53a59667be8d2741f4450d90c858bc245977e951c",
  "docs/phase1/chile/SHA256SUMS": "e46b62e6432c7339f82071e3e82915224cfc2c09348a3566516558de49240185",
  "docs/phase1/chile/SLIM_LAND_NOTE.md": "5c6d417882311c2bcb9fdfb5d773f55999b9d6488884a4dfe7f13d4bcda2e57d",
  "docs/phase1/chile/Source_Inventory.json": "101e4a1347c9d7fbb0003c9c6a72ae5eb44240591a1c5a662e59766dfcdf1e18",
  "docs/phase1/chile/Source_Inventory.md": "bbf6147c1e87cebe86bebce30019d499cff858ac6c28c1beaa5a3bee1c0a02e4",
  [VALIDATION_RELATIVE]: "a9f28240118e5f6af709c2577525f604429125f724f9f7224747a01326f47c18",
  "docs/phase1/chile/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/chile/contracts/field_map_223.json": "11458cc060304b28feb0f0b3bc4001170f8ab0bb13a27e1b0a189fe95808d4a8",
  [COMUNA_REGISTER_RELATIVE]: COMUNA_REGISTER_SHA256,
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [REGION_REGISTER_RELATIVE]: REGION_REGISTER_SHA256,
  "docs/phase1/chile/data/source_aliases.json": "599f6e83f91cfa4e7cff6dd2ca0426cb1ebaca80b2c43a4a65481c0fdc57e4f4",
  [UPCOMING_CALENDAR_RELATIVE]: "b4f3f890b025f63362226353da09d74e7cac95b639a0597e59e73f7f986a1f33",
  "docs/phase1/chile/validate.py": "a225e5da16337e0ed3fe0deb1d500b2c9470be1e8887f1c7134c79541ff23b4a",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_FAMILIES = [
  "president",
  "deputies",
  "senate",
  "governor",
  "core",
  "mayor",
  "council",
  "constitutional_convention",
  "constitutional_council",
] as const;

export type ChileDraftTier = "national_context" | "regional" | "municipal";
export type ChileRegisterStatus = "current" | "historical_only";
export type ChileOfficeFamily = (typeof ALLOWED_OFFICE_FAMILIES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_FAMILY_SET = new Set<string>(ALLOWED_OFFICE_FAMILIES);
const OFFICE_ID_RE =
  /^(cl-president|cl-deputies|cl-senate|cl-gov-\d{2}|cl-core-\d{2}|cl-mayor-[a-z0-9]+|cl-council-[a-z0-9]+|cl-convention-2021|cl-constitutional-council-2023)$/;
const FORBIDDEN_OFFICE =
  /european parliament|\bmercosur\b|\bmercosul\b|\bandean\b|parlamento andino|\bintendente\b|appointed intendente|provincial elected/i;

export function assertAllowedOfficeIdentity(officeId: string, officeFamily: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Chile office id ${officeId}`);
  if (!ALLOWED_FAMILY_SET.has(officeFamily)) throw new Error(`Refusing unlisted Chile office family ${officeFamily} on ${officeId}`);
  const haystack = `${officeId} ${officeFamily} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Chile office ${officeId}`);
}

export function officeTypeFor(officeFamily: string, historicalOnly: boolean): string {
  if (historicalOnly && officeFamily === "constitutional_convention") return "historical_constitutional_convention";
  if (historicalOnly && officeFamily === "constitutional_council") return "historical_constitutional_council";
  if (!historicalOnly && officeFamily === "president") return "president";
  if (!historicalOnly && officeFamily === "deputies") return "chamber_of_deputies";
  if (!historicalOnly && officeFamily === "senate") return "senate";
  if (!historicalOnly && officeFamily === "governor") return "regional_governor";
  if (!historicalOnly && officeFamily === "core") return "regional_council";
  if (!historicalOnly && officeFamily === "mayor") return "municipal_mayor";
  if (!historicalOnly && officeFamily === "council") return "municipal_council";
  throw new Error(`Unsupported Chile office family ${officeFamily} historical=${String(historicalOnly)}`);
}

export function isDirectExecutive(officeType: string): boolean {
  return officeType === "president" || officeType === "regional_governor" || officeType === "municipal_mayor";
}

/** Atlas SQL tier. Chile draft labels are already schema tiers. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national_context" || draftTier === "regional" || draftTier === "municipal") return draftTier;
  throw new Error(`Unsupported Chile draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: ChileRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Chile register status ${String(registerStatus)}`);
}

export function regionGeographyId(regionCode: string): string {
  return `CL-R-${regionCode}`;
}

export function municipalGeographyId(municipalKey: string): string {
  return `CL-M-${municipalKey}`;
}

export const OPEN_HOLD_IDS = [
  "CL-BJ-G01",
  "CL-BJ-G02",
  "CL-BJ-G03",
  "CL-BJ-G04",
  "CL-BJ-G05",
  "CL-BJ-G06",
  "CL-BJ-G07",
  "CL-BJ-G08",
  "CL-BJ-G09",
  "CL-BJ-G10",
  "CL-BJ-G11",
  "CL-BJ-G12",
  "CL-BJ-G13",
  "CL-BJ-G14",
  "CL-BJ-G15",
  "CL-BJ-G16",
  "CL-BJ-G17",
  "CL-BJ-G18",
  "CL-BJ-G19",
  "CL-BJ-G20",
] as const;

export const CALENDAR_HOLD_IDS = [
  "nationalprimaries2029",
  "localprimaries2028",
  "extraordinary",
  "presidentialvacancy",
  "repeat",
] as const;

/** Source status labels. Every named hold stays open. */
export const GAP_STATUS: Readonly<Record<string, string>> = Object.fromEntries(
  OPEN_HOLD_IDS.map((holdId) => [holdId, "open_research_hold"]),
);

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const COUNTRY_NOTES = [
  "Prompt BJ: 725 current offices and 2 historical extraordinary offices. Coverage partial. research_coverage_complete stays false.",
  "The prior LatAm continuity screened_out stub is replaced by this import. Coverage is partial and draft. Production approval stays false.",
  "Draft tiers stay 5 national_context, 32 regional, and 690 municipal. They are preserved on each classification row.",
  "The schema tier column keeps national_context, regional, and municipal. It does not replace the draft label.",
  "Current direct executives stay 362 (President, 16 regional governors, 345 mayors). Current councils stay 361 (16 CORE plus 345 municipal councils). National chambers stay 2.",
  "346 comunas and 345 municipal administrations. Cabo de Hornos and Antártica share one administration.",
  "EP offices stay 0. Provincial elected offices stay 0. MERCOSUR offices stay 0. Andean offices stay 0. Appointed intendentes stay 0.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Documentary 5319 events and 99566 results stay unpublished.",
  "Successor edges stay empty. Upcoming-calendar docs stay documentary. Exact dates stay null. No applied calendar rows.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved or applied.",
  "Holds CL-BJ-G01 through CL-BJ-G20 stay open. Calendar holds and hold_source_in_review rows are not certified.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 727,
  current_offices: 725,
  historical_offices: 2,
  geographies: 362,
  geographies_without_parent: 362,
  parents_left_null: 0,
  comunas: 346,
  municipal_administrations: 345,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national_context: 5,
  draft_tier_regional: 32,
  draft_tier_municipal: 690,
  schema_national: 5,
  schema_regional: 32,
  schema_municipal: 690,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 727,
  sources: 0,
  unresolved_evidence: 20,
  named_open_holds: 20,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 24,
  research_dates: 0,
  applied_calendar_rows: 0,
  upcoming_calendar_rows: 14,
  current_direct_executives: 362,
  historical_direct_executives: 0,
  current_mayors: 345,
  current_municipal_councils: 345,
  current_governors: 16,
  current_core: 16,
  current_councils: 361,
  current_national_chambers: 2,
  historical_extraordinary_offices: 2,
  ep_offices: 0,
  provincial_elected_offices: 0,
  mercosur_offices: 0,
  andean_offices: 0,
  appointed_intendente_offices: 0,
  evidence_links: 0,
} as const;

export type ChileHashInputs = {
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

export function chileUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): ChileHashInputs {
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

export function fingerprintSha256(hashInputs: ChileHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
