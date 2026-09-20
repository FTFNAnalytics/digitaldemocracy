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
  unresolvedId,
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
export const SOURCES_RELATIVE = "data/research/denmark/sources.json";
export const UNRESOLVED_RELATIVE = "data/research/denmark/unresolved-candidate-bindings.json";
export const GAPS_RELATIVE = "data/research/denmark/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/denmark/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/denmark/proceedings.json";
export const AUDIT_RELATIVE = "data/research/denmark/aggregate-audit.json";
export const REGISTER_SHA256 = "eb510c0d537fe82cdb1e56a4fda2a7a9924f9f15818b701df8ba5d9e3be23f1f";
export const RESULTS_SHA256 = "35b1e1dcf373d38398113af9c6246e64fc5c47bd3cb3f12b961f862adda596be";
export const RESULTS_PRETTY_SHA256 = "85b106fa0c89e226a9c46ae9ea704b980d1960ebd6d11ab5366701afefa5f7e4";
export const TIER_SHA256 = "672d8cf0fa57345010eb03ff0cfb905574ff1394f045a60119967d9a6ed8f57e";
export const DRAFT_TIER_SHA256 = "ba4626ab06fb811261b9e16972e3708497b63ec5717df046a3fcfaf716f811f5";
/** Full-pack + draft-tier documentary fingerprint from Prompt X inventory. */
export const DRAFT_FINGERPRINT = "02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737";
export const DRAFT_RELEASE_ID = "country-package-denmark--sha256-02f73c10bfe286d2438c417d9fa83782b96674f7bf4bbb2200735f0e01f80737";

/** Pinned after approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "f64d893ccca3699d95d1695236c503842559cac3ead20fe17ab0544b282cc5ed";
export const CANDIDATE_RELEASE_ID =
  "country-package-denmark--sha256-f64d893ccca3699d95d1695236c503842559cac3ead20fe17ab0544b282cc5ed";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-19";

export const COPENHAGEN_COUNCIL_ID = "DK-K101-C";
export const COPENHAGEN_GEOGRAPHY_ID = "DK-K101";
export const COPENHAGEN_2025_HISTORY_KEY = "DK-K101-C::2025::2025-11-18::body";
export const COPENHAGEN_2025_EVENT_ID = "event-18b2bd10c2c98017e8e70fc1";
export const COPENHAGEN_RECORD_KEY = "rec-e25353be70e72e4c3505dad99a0bd141a0e84c069ddcc0eb048d29c1afc4cff0";
export const COPENHAGEN_NEXT_DATE_ID = "date-de2b2ccc5122ce3ce4d379929f39bd1bc345194d6e5623ecf801cd7f8c15e851";
export const GRENAA_HISTORICAL_ID = "DK-KPRE2007-707-C";
export const NORDDJURS_ID = "DK-K707-C";
export const RETIRING_REGION_ID = "DK-R084-C";
export const RETIRING_REGION_2021_HK = "DK-R084-C::2021::2021-11-16::body";
export const RETIRING_REGION_2021_EVENT_ID = "event-eef8e272601b9352701353ab";
export const SIBLING_RETIRING_REGION_ID = "DK-R085-C";
export const OEST_REGION_ID = "DK-R086-C";
export const OEST_2025_HISTORY_KEY = "DK-R086-C::2025::2025-11-18::body";
export const OEST_2025_EVENT_ID = "event-6bdd9d063d0545acb406022d";
export const COUNTY_EXAMPLE_ID = "DK-AMT015-C";
export const COUNTY_2001_HISTORY_KEY = "DK-AMT015-C::2001::2001-11-20::body";
export const COUNTY_2001_EVENT_ID = "event-3679d1af9e31017d5f62edfa";
export const FOLKETING_ID = "DK-FT";
export const EP_ID = "DK-EP";
export const EP_2009_HISTORY_KEY = "DK-EP::2009::year::body";
export const ZERO_SEAT_RESULT_ID = "result-1e41b93a7a9e4cc8906f2761";
export const ELECTED_CANDIDATE_RESULT_ID = "result-2abe23e798aac6eb6ff4afbd";

export const REGIONAL_CALENDAR_LABEL =
  "20 regional offices (five operating region councils + elected preparatory Østdanmark + 14 historical county councils). 2029 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Greenland/Faroe Realm, 2007/earlier merger successor, KMD/DST, 98 candidate-binding, and EP-detail notes stay open. No popular mayor rows.";

export const COUNTRY_NOTES = [
  "Prompt X full register: 106 current + 240 historical offices. Coverage partial.",
  "Five operating region councils coexist with the elected preparatory Østdanmark council in 2026.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open research: Greenland/Faroe Realm coverage gates; 2007/earlier merger successor bindings; KMD/DST detail holes; 98 unresolved candidate bindings; EP detail gaps.",
  "No popular mayor rows (council-elected borgmester). Do not invent Greenland/Faroe offices or fabricate merger clearances.",
  "Slim pack omits bulky primary-source bytes; sources.json remains the catalogue. Compact results.json is the same 25,391 rows as the pretty-print extract.",
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
  result_rows_party: 12179,
  result_rows_statistical_group: 1546,
  result_rows_elected_candidate: 11666,
  municipal_offices: 324,
  regional_offices: 20,
  national_offices: 1,
  other_offices: 1,
  approved_classifications: 53,
  needs_review_classifications: 293,
  sources: 49,
  catalogue_rows: 49,
  unresolved_evidence: 105,
  unresolved_research_gaps: 7,
  unresolved_candidate_bindings: 98,
  identity_crosswalks: 275,
  retained_inputs: 11,
  research_dates: 1951,
  event_dates_day_called: 1845,
  event_dates_year_called: 4,
  next_dates_day_statutory: 102,
  proceedings: 0,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
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

export function denmarkEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return evidenceIdFromRules(rec, sourceId, inputPath, pointerOrLocator, claimKind);
}

function evidenceIdFromRules(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function denmarkUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [sourceLocator], originalToken]))}`;
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

export function isMayorToken(value: string | null | undefined): boolean {
  if (!value) return false;
  return /mayor|borgmester/i.test(value) || /(?:^|-)M$/.test(value);
}
