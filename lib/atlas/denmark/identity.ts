import { key } from "../../../scripts/import/normalize";
import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  OFFICE_NAMESPACE,
  SCHEMA_VERSION,
  canonical,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export { OFFICE_NAMESPACE };
export {
  canonical,
  cellText,
  dateId,
  historyKey,
  isFixtureId,
  isHttpUrl,
  locator,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

export const LINEAGE_ID = "country-package-denmark";
export const SOURCE_NAMESPACE = "country-package-denmark";
export const COUNTRY_ID = "denmark";
export const COUNTRY_CODE = "DK";
export const ADAPTER_VERSION = "atlas-denmark-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/denmark.json";
export const RESEARCH_PREFIX = "data/research/denmark";
export const REGISTER_RELATIVE = "data/research/denmark/office-register.json";
export const EVENTS_RELATIVE = "data/research/denmark/events.json";
export const RESULTS_RELATIVE = "data/research/denmark/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/denmark/geographies.json";
export const UNRESOLVED_RELATIVE = "data/research/denmark/unresolved-candidate-bindings.json";
export const GAPS_RELATIVE = "data/research/denmark/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/denmark/identity-crosswalk.json";
export const SOURCES_RELATIVE = "data/research/denmark/sources.json";
export const CATALOGUE_LOOKUP_PATH = "docs/phase1/denmark/Denmark_Input_Inventory.json";
export const REGISTER_SHA256 = "eb510c0d537fe82cdb1e56a4fda2a7a9924f9f15818b701df8ba5d9e3be23f1f";
export const TIER_SHA256 = "672d8cf0fa57345010eb03ff0cfb905574ff1394f045a60119967d9a6ed8f57e";
export const DRAFT_TIER_SHA256 = "ba4626ab06fb811261b9e16972e3708497b63ec5717df046a3fcfaf716f811f5";
export const DRAFT_FINGERPRINT = "02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737";
export const DRAFT_RELEASE_ID =
  "country-package-denmark--sha256-02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737";

/** Slim landed pack + accepted tier. Documentary full-pack draft fingerprint is 02f73c10… */
export const CANDIDATE_FINGERPRINT = "f64d893ccca3699d95d1695236c503842559cac3ead20fe17ab0544b282cc5ed";
export const CANDIDATE_RELEASE_ID =
  "country-package-denmark--sha256-f64d893ccca3699d95d1695236c503842559cac3ead20fe17ab0544b282cc5ed";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-19";

export const COPENHAGEN_COUNCIL_ID = "DK-K101-C";
export const COPENHAGEN_GEOGRAPHY_ID = "DK-K101";
export const COPENHAGEN_COUNCIL_RECORD_KEY =
  "rec-e25353be70e72e4c3505dad99a0bd141a0e84c069ddcc0eb048d29c1afc4cff0";
export const HISTORICAL_EXAMPLE_ID = "DK-KPRE2007-171-C";
export const RETIRING_REGION_ID = "DK-R084-C";
export const CONTINUING_REGION_ID = "DK-R081-C";
export const PREPARATORY_REGION_ID = "DK-R086-C";
export const COUNTY_EXAMPLE_ID = "DK-AMT015-C";
export const FT_ID = "DK-FT";
export const FT_2022_HK = "DK-FT::2022::2022-11-01::body";
export const EP_ID = "DK-EP";
export const EP_2009_HK = "DK-EP::2009::year::body";
export const ZERO_SEAT_RESULT_ID = "result-1e41b93a7a9e4cc8906f2761";
export const UNKNOWN_SEAT_RESULT_ID = "result-75bac5aa149e91f57be7f72a";

export const REGIONAL_CALENDAR_LABEL =
  "20 regional offices (five operating regional councils + elected preparatory Østdanmark council + 14 historical county councils). 2029-11-20 next-date metadata is statutory, not a prospective event. Greenland/Faroe Realm gates, 2007/earlier merger successor bindings, KMD/DST holes, 98 candidate bindings, and EP detail stay open. No popular mayor rows.";

export const COUNTRY_NOTES = [
  "Prompt X full register: 106 current + 240 historical offices. Coverage partial.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open research: Greenland/Faroe Realm coverage gates; 2007/earlier merger successor bindings; KMD/DST detail holes; 98 unresolved candidate bindings; EP detail gaps.",
  "No popular mayor rows (council-elected borgmester). Do not invent Greenland/Faroe offices or fabricate merger clearances.",
  "Bulky primary-source bytes remain omitted from the slim landed pack; do not invent those files.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 106,
  historical_offices: 240,
  offices: 346,
  geographies: 345,
  selected_histories: 1849,
  other_histories: 0,
  prospective_events: 0,
  total_events: 1849,
  result_rows: 25391,
  municipal_offices: 324,
  regional_offices: 20,
  national_offices: 1,
  other_offices: 1,
  approved_classifications: 53,
  needs_review_classifications: 293,
  sources: 49,
  catalogue_rows: 49,
  unresolved_evidence: 105,
  unresolved_candidate_bindings: 98,
  unresolved_research_gaps: 7,
  retained_inputs: 11,
  research_dates: 1951,
  event_dates_day_called: 1845,
  event_dates_year_called: 4,
  next_dates_day_statutory: 102,
  proceedings: 0,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
  explicit_zero_seats: 3793,
  missing_seats: 11704,
  identity_crosswalks: 275,
} as const;

export type DenmarkHashInputs = {
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

export function eventIdFor(hk: string): string {
  return key("event", [COUNTRY_ID, OFFICE_NAMESPACE, hk]);
}

export function resultIdFor(hk: string, sourceRowId: string): string {
  return key("result", [COUNTRY_ID, OFFICE_NAMESPACE, hk, sourceRowId]);
}

export function sourceIdForUrl(url: string): string {
  return key("source", [COUNTRY_ID, url]);
}

export function denmarkEvidenceId(
  rec: string,
  inputPath: string,
  locatorText: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, inputPath, locatorText, claimKind]))}`;
}

export function denmarkUnresolvedId(
  rec: string,
  originalToken: string,
  inputPath: string,
  locatorText: string,
): string {
  return `unres-${sha256Hex(canonical([rec, originalToken, inputPath, locatorText]))}`;
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
}): DenmarkHashInputs {
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

export function fingerprintSha256(hashInputs: DenmarkHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
