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

/** Research namespace carried on every Luxembourg office and event row. */
export const OFFICE_NAMESPACE = "cdd-atlas-lu-research-v1";
export const LINEAGE_ID = "country-package-luxembourg";
export const SOURCE_NAMESPACE = "country-package-luxembourg";
export const COUNTRY_ID = "luxembourg";
export const COUNTRY_CODE = "LU";
export const COUNTRY_GEOGRAPHY_ID = "LU";
export const ADAPTER_VERSION = "atlas-luxembourg-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/luxembourg.json";
export const RESEARCH_PREFIX = "data/research/luxembourg";
export const REGISTER_RELATIVE = "data/research/luxembourg/office-register.json";
export const EVENTS_RELATIVE = "data/research/luxembourg/events.json";
export const GAPS_RELATIVE = "data/research/luxembourg/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/luxembourg/merger-crosswalk.json";
export const OBSERVATIONS_RELATIVE = "data/research/luxembourg/observations.json";
export const COUNTS_RELATIVE = "data/research/luxembourg/counts.json";
export const SOURCE_INVENTORY_RELATIVE = "data/research/luxembourg/source-inventory.json";
export const DRAFT_TIERS_RELATIVE = "data/research/luxembourg/draft-tiers.json";
export const FIELD_MAP_RELATIVE = "data/research/luxembourg/field-map-223.json";
/**
 * Full-pack result rows are not in the slim land. Do not invent that file or its 48,197 rows.
 * `observations.json` is 702 source-statistic envelopes and is not a substitute.
 */
export const OMITTED_RESULTS_RELATIVE = "data/research/luxembourg/results.json";
export const OMITTED_RESULTS_PACK_PATH = "data/results.json";
/** Full-pack source bytes are not in the slim land. Do not invent that directory. */
export const OMITTED_SOURCES_DIR = "data/research/luxembourg/sources";
/** Explicit portal predecessor edges. Not an identity-equivalence namespace. */
export const MERGER_UPSTREAM_NAMESPACE = "luxembourg-explicit-predecessor";

export const REGISTER_SHA256 = "4505d3bee3ca17d0eb0917bf8c07e70b22c59f55577e5a38b097f7472ade23a6";
export const EVENTS_SHA256 = "52fad062e34adb0a9afcc10769175fcc88f5261822a23fcb711118dd20f62d5a";
export const GAPS_SHA256 = "57e228cb147f16b017924f0b4c5d0a6d4f1fd6fee6cb5bce124d4503a88bb836";
export const CROSSWALK_SHA256 = "a013ee043e36a84fc1a0e7d79db1c62bc495642e71eb9178a705384a8d9fde28";
export const OBSERVATIONS_SHA256 = "f07d8511ac9ca3df70064e55dc96ae2da197e4d64dacd620ba8e31a545633abf";
export const COUNTS_SHA256 = "e4312cc8a5f94340a52e990e823b65c69d45520908585f07fe335603d6bfa000";
export const SOURCE_INVENTORY_SHA256 = "f7371dc2a7670e7729d3df6eab07f7df0add4ece40a35d7d4519836c6891f161";
export const DRAFT_TIERS_SHA256 = "9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad";
export const FIELD_MAP_SHA256 = "bf5e493681f7e3e0f66f1359af660324c699772e6ba6c91cdbd5b9989566b750";
export const TIER_SHA256 = "e1d109b024c466677ef084838192bb2bad101c8ad12010b28f6d35879c736169";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into the fingerprint. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "9d3692b95e7188841cfbeea6bf4bee8c52e299811a56474d87948cbc3b43f3ad";
/** Manifest digest of the omitted full-pack results file. Not a retained input. */
export const OMITTED_RESULTS_SHA256 = "0f6f5d1fd3b1d3d15518ea367327a2a7520ff0b34bc744975b13ab33c144f329";
export const REVIEW_ZIP_SHA256 = "93439d6982d581f669d8f303b1d27542aff360e8be3f33ee3961c594ed0dc6da";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "6635461e4efa9b22ef1aa346e4577c9355912b6e48bceb66a27a7609ad5092ba";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "Luxembourg";

export const PARLIAMENT_ID = "LU-PARLIAMENT";
export const EP_ID = "LU-EP";
export const EP_1994_EVENT_ID = "LU-EP@1994";
export const BERDORF_EVENT_ID = "LU-C-berdorf@2023-10-08";

export const ALLOWED_OFFICE_TYPES = ["communal_council", "parliament", "ep_delegation"] as const;

export const RESOLVED_EXCLUSIONS = [
  { token: "LU-G01", topic: "Grand Duke", status: "resolved_exclusion" },
  { token: "LU-G02", topic: "Mayoral selection", status: "resolved_exclusion" },
] as const;

export const NAMED_HOLDS = [
  { token: "LU-G03", topic: "Communal mergers", status: "bounded_gap" },
  { token: "LU-G04", topic: "Supplementary elections / uncontested vacancies", status: "open" },
  { token: "LU-G05", topic: "Certification", status: "open" },
  { token: "LU-G06", topic: "EP", status: "bounded_gap" },
  { token: "LU-G07", topic: "Parliament", status: "bounded_gap" },
  { token: "LU-G08", topic: "Dates", status: "bounded_gap" },
  { token: "LU-G09", topic: "Berdorf", status: "resolved_with_capture_limit" },
  { token: "LU-G10", topic: "Raw totals inconsistencies", status: "review" },
  { token: "LU-G11", topic: "1994 EP archive defect", status: "open" },
] as const;

export const RESEARCH_GAPS = [...RESOLVED_EXCLUSIONS, ...NAMED_HOLDS] as const;

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. Cantons and districts stay geography, not elected bodies. 100 current communal councils and 28 historical communal councils. Named holds LU-G03–LU-G11 stay open. LU-G01 (Grand Duke) and LU-G02 (mayors) stay resolved exclusions. Slim land omits results.json; 48,197 documented result rows are not invented. 28 explicit predecessor edges only.";

export const COUNTRY_NOTES = [
  "Prompt AO: 102 current offices and 28 historical offices. Coverage partial.",
  "Current scope is 100 communal councils, the Chambre des Députés, and one Luxembourg EP delegation.",
  "Historical scope is 28 predecessor communal councils. Direct executives: 0. Regional offices: 0.",
  "Draft tiers stay needs_review on every classification: 128 municipal / 0 regional / 1 national / 1 other.",
  "438 events. Published result rows: 0. The full pack documents 48,197 result observations in omitted results.json. observations.json is 702 source-statistic envelopes and is not a substitute.",
  "LU-G01 and LU-G02 stay resolved exclusions. No Grand Duke or mayor popular contest is invented.",
  "The merger crosswalk stays 28 explicit portal predecessor edges. No guessed edge is added. Unknown effective days stay null.",
  "Named holds LU-G03–LU-G11 stay open, including LU-G09 resolved_with_capture_limit as supplied and LU-G11 for the missing 1994 EP Grevenmacher LSAP block.",
  "Year-only national and EP labels stay year precision. No 1 January fill.",
  "Slim land omits sources/ (388 hashed captures). Source rows are not invented from the inventory.",
  "Alert window (~18 months) filters alerts only. No next-date rows and no prospective events.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 102,
  historical_offices: 28,
  offices: 130,
  geographies: 129,
  selected_histories: 438,
  prospective_events: 0,
  total_events: 438,
  proceedings: 0,
  result_rows: 0,
  documented_result_rows_omitted: 48197,
  observation_envelopes: 702,
  observation_nested_result_counts: 47544,
  municipal_offices: 128,
  regional_offices: 0,
  national_offices: 1,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 130,
  sources: 0,
  unresolved_evidence: 11,
  named_holds: 9,
  resolved_exclusions: 2,
  party_mappings: 0,
  identity_crosswalks: 28,
  explicit_predecessor_edges: 28,
  guessed_merger_edges: 0,
  retained_inputs: 10,
  research_dates: 438,
  direct_executive_offices: 0,
  current_communal_councils: 100,
  historical_communal_councils: 28,
  parliament_offices: 1,
  ep_delegations: 1,
  year_only_events: 8,
  uncontested_return_events: 18,
  official_proclamation_events: 1,
  evidence_links: 0,
  source_inventory_rows: 388,
  dated_predecessor_edges: 10,
  undated_predecessor_edges: 18,
  successor_geographies_with_effective_from: 5,
  predecessor_geographies_with_effective_to: 10,
} as const;

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [COUNTS_RELATIVE]: COUNTS_SHA256,
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EVENTS_RELATIVE]: EVENTS_SHA256,
  [FIELD_MAP_RELATIVE]: FIELD_MAP_SHA256,
  [CROSSWALK_RELATIVE]: CROSSWALK_SHA256,
  [OBSERVATIONS_RELATIVE]: OBSERVATIONS_SHA256,
  [REGISTER_RELATIVE]: REGISTER_SHA256,
  [GAPS_RELATIVE]: GAPS_SHA256,
  [SOURCE_INVENTORY_RELATIVE]: SOURCE_INVENTORY_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export type LuxembourgHashInputs = {
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

export function luxembourgUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): LuxembourgHashInputs {
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

export function fingerprintSha256(hashInputs: LuxembourgHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
