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
export type { HashInputDescriptor } from "../identity";
import {
  COUNTRY_CODE,
  COUNTRY_ID,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
  PROMPT_P_TIER_PATH,
  TIER_PATH,
  TIER_SHA256,
} from "./identity";

export {
  canonical,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  unresolvedId,
  type Locator,
} from "./identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "./identity";

export { COUNTRY_CODE, COUNTRY_ID, LINEAGE_ID, OFFICE_NAMESPACE, PROMPT_P_TIER_PATH, TIER_PATH, TIER_SHA256 };

export const BI_ADAPTER_VERSION = "atlas-bulgaria-prompt-bi/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };

export const OFFICE_REGISTER_RELATIVE = "docs/phase1/bulgaria/Bulgaria_Office_Register.json";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/bulgaria/Bulgaria_Draft_Tiers.json";
export const COUNTS_RELATIVE = "docs/phase1/bulgaria/Bulgaria_Counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/bulgaria/Bulgaria_Research_Gaps.json";
export const SUCCESSOR_LINKS_RELATIVE = "docs/phase1/bulgaria/data/Successor_Links.json";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/bulgaria/data/Upcoming_Elections.json";

export const OFFICE_REGISTER_SHA256 = "4f50225c919fb5895bb186eb00fd0ccae5f40f5801dba50fa8f4c1a1e5f25894";
export const DRAFT_TIERS_SHA256 = "9485d8f7e8a1d4bea1aca95ced17beccbfed7b0791acc5bff212451294b45318";
export const COUNTS_SHA256 = "4627ae19f6beff367dff827bea0487dd99b984ecf86e3ef9c39a8602afed0f57";
export const RESEARCH_GAPS_SHA256 = "7b16164516a77ee7240a6ee2f0bd8f1daa9d8c749373bf6e4eacc9c8155622eb";
export const SUCCESSOR_LINKS_SHA256 = "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570";
export const UPCOMING_CALENDAR_SHA256 = "f9cd33c444b9a0d452cb103cbe0246d44b8b29decceb7befd8bf30082d63d2d4";
export const BI_SCHEMA_TIER_SHA256 = "82af6120d5372e97c73fb84df294ed99d44c1ccc433a1feaf8637f92b00dcae3";

/** Geography key for national/EP/GNA rows whose register geography_id is null. */
export const COUNTRY_GEOGRAPHY_ID = "BG";

export const BI_DRAFT_OFFICE_IDS = [
  "BG-NATIONAL-ASSEMBLY",
  "BG-PRESIDENT-JOINT-TICKET",
  "BG-EUROPEAN-PARLIAMENT",
  "BG-GRAND-NATIONAL-ASSEMBLY-1990",
] as const;

export const GRADEC_OFFICE_ID = "BG-SLV11-b88d0d4475-V";
export const SAMPLE_MAYOR_ID = "BG-VAR01-M";
export const SAMPLE_COUNCIL_ID = "BG-VAR01-C";

export const OMITTED_PATHS = [
  "docs/phase1/bulgaria/data/BI_New_Events.json",
  "docs/phase1/bulgaria/data/BI_New_Results.json",
  "docs/phase1/bulgaria/data/Result_Reconciliation_Holds.json",
  "docs/phase1/bulgaria/data/Territorial_Change_Observations.json",
] as const;

export const OPEN_HOLD_IDS = [
  "G01",
  "G02",
  "G03",
  "G04",
  "G05",
  "G06",
  "G07",
  "G08",
  "G09",
  "G10",
  "G11",
  "G12",
  "G13",
  "G14",
  "G15",
  "G16",
] as const;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-29";

/** Pinned slim-land fingerprint. The full-pack ZIP SHA is not this release. */
export const BI_CANDIDATE_FINGERPRINT = "589023069166df181afac95971b757447693d4b87e5d8eee14359593be2c9d2a";
export const BI_CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${BI_CANDIDATE_FINGERPRINT}`;

export const EXPECTED_BI_COUNTS = {
  register_rows: 3601,
  offices: 534,
  preserved_offices: 530,
  current_offices: 533,
  historical_offices: 1,
  bi_draft_offices: 4,
  needs_review_classifications: 4,
  approved_classifications: 530,
  held_offices: 3067,
  municipal_offices: 530,
  national_offices: 3,
  other_offices: 1,
  regional_offices: 0,
  ep_offices: 1,
  geographies: 531,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  result_rows: 0,
  sources: 0,
  research_dates: 0,
  applied_calendar_rows: 0,
  successor_edges: 0,
  named_open_holds: 16,
  mayor_offices: 265,
  municipal_council_offices: 265,
  prompt_bi: 1,
} as const;

export const COUNTRY_NOTES = [
  "Prompt BI additive import on country-package-bulgaria. 530 Prompt P municipality-wide office IDs stay published.",
  "Four national/EP/GNA drafts publish as needs_review. justin_approved and applied stay false.",
  "3,067 submunicipal holds, including Градец 2015, stay unpublished.",
  "Slim land publishes 0 events, 0 results, and 0 sources. Regional elected offices stay 0.",
  "Upcoming calendar rows stay documentary and are not applied. Successor links stay 0.",
  "Holds G01–G16 stay open. research_coverage_complete stays false. ATLAS_IMPORT_SCOPE=all does not load this draft.",
].join(" ");

export function schemaInterchangeTier(draftTier: string): "national_context" | "municipal" | "other" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  if (draftTier === "other") return "other";
  throw new Error(`Unsupported Bulgaria BI tier ${draftTier}`);
}

export function inputKindFor(inputPath: string): HashInputDescriptor["input_kind"] {
  // The preserved Prompt P classifier moved off TIER_PATH, but office_tier_classification
  // can only cite input_kind tier_classification. Both files are classifiers.
  if (inputPath === TIER_PATH || inputPath === PROMPT_P_TIER_PATH) return "tier_classification";
  return "package";
}

export type BulgariaBiHashInputs = {
  canonicalization: typeof CANONICALIZATION;
  hash_algorithm: typeof HASH_ALGORITHM;
  lineage_id: typeof LINEAGE_ID;
  inputs: HashInputDescriptor[];
  overrides: HashInputDescriptor[];
  adapter_version: typeof BI_ADAPTER_VERSION;
  method_version: string;
  schema_version: typeof SCHEMA_VERSION;
  schema_inputs: SchemaInputDescriptor[];
};

export function buildBiHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
}): BulgariaBiHashInputs {
  return {
    canonicalization: CANONICALIZATION,
    hash_algorithm: HASH_ALGORITHM,
    lineage_id: LINEAGE_ID,
    inputs: sortByInputPath(args.inputs),
    overrides: sortByInputPath(args.overrides ?? []),
    adapter_version: BI_ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    schema_inputs: sortByInputPath([
      { input_path: ATTEMPT_LOG_SCHEMA_PATH, sha256: ATTEMPT_LOG_SHA256 },
      { input_path: MASTER_SCHEMA_PATH, sha256: MASTER_SCHEMA_SHA256 },
    ]),
  };
}

export function fingerprintSha256(hashInputs: BulgariaBiHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
