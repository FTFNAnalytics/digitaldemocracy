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
import pinnedInputs from "./pinned-inputs.json";

export {
  canonical,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

/** Namespace for the Peru Prompt BK draft register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "peru-research-bk-v1";
export const LINEAGE_ID = "country-package-peru";
export const SOURCE_NAMESPACE = "country-package-peru";
export const COUNTRY_ID = "peru";
export const COUNTRY_CODE = "PE";
export const COUNTRY_NAME = "Perú";
export const COUNTRY_GEOGRAPHY_ID = "PE";
export const ADAPTER_VERSION = "atlas-peru-prompt-bk/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/peru.json";
export const DOCS_PREFIX = "docs/phase1/peru";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/peru/data/office_register.json";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/peru/data/draft_tiers.json";
export const MUNICIPAL_ROSTER_RELATIVE = "docs/phase1/peru/data/municipal_roster.json";
export const REGIONAL_ROSTER_RELATIVE = "docs/phase1/peru/data/regional_roster.json";
export const COUNTS_RELATIVE = "docs/phase1/peru/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/peru/research_gaps.json";
export const VALIDATION_RELATIVE = "docs/phase1/peru/Validation_Report.json";
export const MANIFEST_RELATIVE = "docs/phase1/peru/manifest.json";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/peru/data/upcoming_calendar.json";
export const SUCCESSOR_EDGES_RELATIVE = "docs/phase1/peru/data/successor_edges.json";

/**
 * The Atlas Phase 2 prerequisite classifier (5,039 offices, lineage
 * latin-america-fe5e91689def, status draft_for_human_review). Those bytes
 * are preserved and are not the Prompt BK register. `all` and `latam` do
 * not import them, and this importer does not read them.
 */
export const PHASE2_TIER_PATH = "docs/phase1/peru/Phase2_prerequisite_tiers.json";
export const PHASE2_TIER_SHA256 = "9483875e4e6aabdf938324aa1849549519962bfe26dde5b359ca00b4e23addfd";
export const PHASE2_OFFICE_COUNT = 5039;

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters. Certified extracts stay with the full ZIP.
 */
export const OMITTED_PATHS = [
  "docs/phase1/peru/data/events.jsonl",
  "docs/phase1/peru/data/results.jsonl",
  "docs/phase1/peru/data/certified_events.json",
  "docs/phase1/peru/data/certified_results.json",
  "docs/phase1/peru/data/certified_controls.json",
  "docs/phase1/peru/sources",
] as const;

export const PRESIDENT_ID = "pe-president-ticket";
export const SENATE_ID = "pe-senate";
export const DEPUTIES_ID = "pe-deputies";
export const ANDEAN_ID = "pe-andean";
export const HISTORICAL_CONGRESS_ID = "pe-congress-unicameral";
export const SAMPLE_GOVERNOR_ID = "pe-region-amazonas-executive";
export const SAMPLE_COUNCIL_ID = "pe-region-amazonas-council";
export const SAMPLE_REGION_GEOGRAPHY_ID = "pe-region-amazonas";
export const SANGANI_MAYOR_ID = "pe-district-120307-mayor";
export const SANGANI_COUNCIL_ID = "pe-district-120307-council";
export const SANGANI_UBIGEO = "120307";
export const SANGANI_GEOGRAPHY_ID = "pe-ubigeo-120307";

export const TIER_SHA256 = "6a8266099646b75431eed7fe8effaa1999f78c7b03bac54d39b20737bf080759";
export const OFFICE_REGISTER_SHA256 = "b25bbc2b8e60f2144715c536e3c8c7811606420e351950b053aa657bad9125e3";

/**
 * Documentary full-pack figures. They are not published, and they are not
 * emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 12460;
export const FULL_PACK_DOCUMENTED_RESULTS = 97260;
/**
 * The slim land prints only this abbreviated full-ZIP digest
 * (`955ca87d…95cb` in SLIM_LAND_NOTE.md). The complete digest is not in the
 * slim land, so this importer does not pin or invent one.
 */
export const FULL_ZIP_SHA256_ABBREVIATION = "955ca87d…95cb";

export const RESEARCH_SNAPSHOT_LABEL = "2026-10-31";

export const PINNED_INPUTS: Readonly<Record<string, string>> = pinnedInputs;

export const OPEN_HOLD_IDS = [
  "BK-G01",
  "BK-G02",
  "BK-G03",
  "BK-G04",
  "BK-G05",
  "BK-G06",
  "BK-G07",
  "BK-G08",
  "BK-G09",
  "BK-G10",
  "BK-G11",
  "BK-G12",
  "BK-G13",
  "BK-G14",
  "BK-G15",
  "BK-G16",
  "BK-G17",
  "BK-G18",
] as const;

export const ALLOWED_OFFICE_FAMILIES = [
  "presidential_ticket",
  "senate",
  "deputies",
  "andean_delegation",
  "unicameral_congress",
  "regional_executive_ticket",
  "regional_council",
  "municipal_mayor",
  "municipal_council",
] as const;

export type PeruDraftTier = "national_context" | "regional" | "municipal";
export type PeruRegisterStatus = "current" | "historical";
export type PeruOfficeFamily = (typeof ALLOWED_OFFICE_FAMILIES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_FAMILY_SET = new Set<string>(ALLOWED_OFFICE_FAMILIES);
const FORBIDDEN_OFFICE = /european parliament|\bmercosur\b|\bmercosul\b|centro poblado|centros poblados/i;

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export function assertAllowedOfficeIdentity(officeId: string, officeFamily: string, name: string): void {
  if (!ALLOWED_FAMILY_SET.has(officeFamily)) {
    throw new Error(`Refusing unlisted Peru office family ${officeFamily} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeFamily} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Peru office ${officeId}`);
}

export function officeTypeFor(officeFamily: string, historical: boolean): string {
  if (historical && officeFamily === "unicameral_congress") return "historical_unicameral_congress";
  if (!historical && officeFamily === "presidential_ticket") return "presidential_ticket";
  if (!historical && officeFamily === "senate") return "senate";
  if (!historical && officeFamily === "deputies") return "chamber_of_deputies";
  if (!historical && officeFamily === "andean_delegation") return "andean_delegation";
  if (!historical && officeFamily === "regional_executive_ticket") return "regional_executive_ticket";
  if (!historical && officeFamily === "regional_council") return "regional_council";
  if (!historical && officeFamily === "municipal_mayor") return "municipal_mayor";
  if (!historical && officeFamily === "municipal_council") return "municipal_council";
  throw new Error(`Unsupported Peru office family ${officeFamily} historical=${String(historical)}`);
}

export function isDirectExecutive(officeType: string): boolean {
  return (
    officeType === "presidential_ticket" ||
    officeType === "regional_executive_ticket" ||
    officeType === "municipal_mayor"
  );
}

/** Atlas SQL tier. Peru draft labels are already schema tiers. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national_context" || draftTier === "regional" || draftTier === "municipal") return draftTier;
  throw new Error(`Unsupported Peru draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: PeruRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical") return "historical";
  throw new Error(`Unsupported Peru register status ${String(registerStatus)}`);
}

export function municipalGeographyId(ubigeo: string): string {
  return `pe-ubigeo-${ubigeo}`;
}

export const COUNTRY_NOTES = [
  "Prompt BK: 3840 current offices (3838 research accepted, 2 Sangani held) and 1 historical unicameral congress.",
  "Coverage partial. research_coverage_complete stays false. Production approval stays false.",
  "Draft tiers stay 5 national_context, 50 regional, and 3786 municipal. Every review_status stays needs_review.",
  "The Phase 2 prerequisite classifier (5039 offices) is preserved at docs/phase1/peru/Phase2_prerequisite_tiers.json and is not this register.",
  "Current direct executives stay 1919, including the held Sangani mayor. Accepted executives stay 1918.",
  "Current councils stay 1918, including the held Sangani council. Accepted councils stay 1917. National chambers stay 2.",
  "INEI municipalities stay 1893 (196 provincial and 1697 district). Sangani ubigeo 120307 stays held.",
  "EP offices stay 0. MERCOSUR offices stay 0. Centros poblados offices stay 0. Parlamento Andino stays 1 current delegation.",
  "Published events: 0. Published result rows: 0. Published sources: 0. October 2026 ERM results stay out (BK-G17).",
  "Successor edges stay empty. Upcoming-calendar docs stay documentary. No applied calendar rows.",
  "Holds BK-G01 through BK-G18 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 3841,
  current_offices: 3840,
  historical_offices: 1,
  current_research_accepted: 3838,
  current_held: 2,
  geographies: 1919,
  geographies_without_parent: 1919,
  parents_left_null: 0,
  municipalities: 1893,
  provincial_municipalities: 196,
  district_municipalities: 1697,
  regions: 25,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national_context: 5,
  draft_tier_regional: 50,
  draft_tier_municipal: 3786,
  schema_national: 5,
  schema_regional: 50,
  schema_municipal: 3786,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 3841,
  sources: 0,
  unresolved_evidence: 18,
  named_open_holds: 18,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 40,
  research_dates: 0,
  applied_calendar_rows: 0,
  upcoming_calendar_rows: 18,
  current_direct_executives: 1919,
  accepted_direct_executives: 1918,
  current_councils: 1918,
  accepted_councils: 1917,
  current_national_chambers: 2,
  current_mayors: 1893,
  current_municipal_councils: 1893,
  current_governors: 25,
  current_regional_councils: 25,
  andean_offices: 1,
  ep_offices: 0,
  mercosur_offices: 0,
  centros_poblados_offices: 0,
  evidence_links: 0,
} as const;

/** Pinned slim-land fingerprint. The full-ZIP digest is not this release. */
export const CANDIDATE_FINGERPRINT = "30ee9150bab1df1b554939f6e560a89b81b20254f110d6e26fb35f2d566f84d3";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export type PeruHashInputs = {
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

export function peruUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): PeruHashInputs {
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

export function fingerprintSha256(hashInputs: PeruHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
