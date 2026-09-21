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

export const LINEAGE_ID = "country-package-sweden";
export const SOURCE_NAMESPACE = "country-package-sweden";
export const COUNTRY_ID = "sweden";
export const COUNTRY_CODE = "SE";
export const ADAPTER_VERSION = "atlas-sweden-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/sweden.json";
export const RESEARCH_PREFIX = "data/research/sweden";
export const REGISTER_RELATIVE = "data/research/sweden/office-register.json";
export const EVENTS_RELATIVE = "data/research/sweden/events.json";
export const RESULTS_RELATIVE = "data/research/sweden/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/sweden/geographies.json";
export const SOURCES_RELATIVE = "data/research/sweden/sources.json";
export const GAPS_RELATIVE = "data/research/sweden/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/sweden/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/sweden/proceedings.json";
export const AUDIT_RELATIVE = "data/research/sweden/aggregate-audit.json";
export const REGISTER_SHA256 = "6a787b86920238eb78f4f9e8dd170b58785e5ed10f182442fd08015f4bfb5ae9";
export const RESULTS_SHA256 = "7de7c7d93e433bd8ab0dd772d2ed175c7d757717edfded6faecf94e2b9edc697";
export const RESULTS_PRETTY_SHA256 = "1e2829030bbe73b3f97983cac3ff5829dbe304eb0868177ed000dfc8841ca04e";
export const TIER_SHA256 = "dc13885023d2d454dae39272a5fe668e384e7606d4f2f89a3df136e9f0170ef7";
export const DRAFT_TIER_SHA256 = "ba95b2671f56b45077e9a4987e54d59438793cdfe053d8486de04dc54c0f2139";
/** Full-pack + draft-tier documentary fingerprint from Prompt Y inventory. */
export const DRAFT_FINGERPRINT = "75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75";
export const DRAFT_RELEASE_ID =
  "country-package-sweden--sha256-75a2d2db6d1d889c9181d271d59d88d395048914590a50734cb77aed7c588a75";

/** Pinned after approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "a745392f5480856a1917091c935e98eb9245f82445297d040433c3c4bc6275a6";
export const CANDIDATE_RELEASE_ID =
  "country-package-sweden--sha256-a745392f5480856a1917091c935e98eb9245f82445297d040433c3c4bc6275a6";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const STOCKHOLM_COUNCIL_ID = "SE-K0180-C";
export const STOCKHOLM_GEOGRAPHY_ID = "SE-K0180";
export const STOCKHOLM_RECORD_KEY = "rec-f62810c5d3b7ee941c8ca273deba894103394f63076bf73032a1c579ebfde196";
export const STOCKHOLM_NEXT_DATE_ID = "date-a2ed8c36366136c5f74fd2e1365a4db836f9582b224ae6f6cc271699d46a3656";
export const GOTLAND_COUNCIL_ID = "SE-K0980-C";
export const GOTLAND_GEOGRAPHY_ID = "SE-K0980";
export const GOTLAND_RECORD_KEY = "rec-19c327f1137b966bc51281157de9c9c42df22a3e9c80bb5df11c8a1033d2e4c9";
export const BARA_HISTORICAL_ID = "SE-K1229-C";
export const SVEDALA_PRE1976_ID = "SE-K1263-PRE1976-C";
export const SVEDALA_CURRENT_ID = "SE-K1263-C";
export const LANDSTING_EXAMPLE_ID = "SE-LT11L-C";
export const DALARNA_REGION_ID = "SE-R20-C";
export const RIKSDAG_ID = "SE-RD";
export const EP_ID = "SE-EP";
export const SAMI_ID = "SE-SAM";
export const SAMI_NEXT_DATE_ID = "date-ed63db46dfda10203f221a4b23c63102ac5eb716ec010836afe795e980400fc5";
export const FALUN_REPEAT_ID = "SE-K2080-C";
export const FALUN_2018_HK = "SE-K2080-C::2018::2019-04-07::repeated";
export const FALUN_2018_EVENT_ID = "event-a106bd1a4bb0d640ea2081b2";
export const BASTAD_ID = "SE-K1278-C";
export const BASTAD_2014_HK = "SE-K1278-C::2014::2014::ordinary";
export const BASTAD_2015_HK = "SE-K1278-C::2015::2015-05-10::repeated";
export const BASTAD_2015_EVENT_ID = "event-24764c1f10122d43a67a8282";
export const SAMI_MAY_2025_HK = "SE-SAM::2025::2025-05-18::ordinary";
export const SAMI_MAY_2025_EVENT_ID = "event-fc4e090f4d00b8bb6e98e09c";
export const SAMI_OCT_2025_HK = "SE-SAM::2025::2025-10-05::repeated";
export const SAMI_OCT_2025_EVENT_ID = "event-b79ca79d1d12cec21158b986";
export const FARGELANDA_ID = "SE-K1439-C";
export const FARGELANDA_DISPUTED_RESULT_ID = "result-16f393e8c3a19511285b6d41";
export const ZERO_SEAT_RESULT_ID = "result-61c0af9eaf31a241233ebc7d";
export const UNKNOWN_SEAT_RESULT_ID = "result-0a0fb98ee69be337c9b91063";
export const EP_1995_HK = "SE-EP::1995::1995::ordinary";
export const EP_1995_EVENT_ID = "event-304890fbf56a48e9d99e1840";
export const LIVE_2026_SAMPLE_HK = "SE-K0114-C::2026::2026-09-13::ordinary";

export const NAMED_HOLDS = [
  "SE-GOTLAND-TIER",
  "SE-EP-SAM-TIER",
  "SE-2026-COUNT-IN-PROGRESS",
  "SE-HISTORICAL-BOUNDARIES",
  "SE-HISTORIC-PARTY-DETAIL",
  "SE-REPEAT-AND-RECOUNT",
  "SE-FARGELANDA-1973",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "25 regional offices (20 current regionfullmäktige + 5 historical landsting). Gotland stays the municipal SE-K0980-C office; no second regional office. 2030/EP 2029 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Named holds stay open. No popular kommunalråd / prime-minister / cabinet rows.";

export const COUNTRY_NOTES = [
  "Prompt Y full register: 313 current + 7 historical offices. Coverage partial.",
  "Gotland is one municipal electoral body with combined responsibilities; keep SE-K0980-C municipal.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open named holds: SE-GOTLAND-TIER; SE-EP-SAM-TIER; SE-2026-COUNT-IN-PROGRESS; SE-HISTORICAL-BOUNDARIES; SE-HISTORIC-PARTY-DETAIL; SE-REPEAT-AND-RECOUNT; SE-FARGELANDA-1973.",
  "No popular kommunalråd / prime-minister / cabinet rows. Do not invent a second Gotland regional office or fabricate 2026 final local counts.",
  "Slim pack omits bulky primary-source bytes; sources.json remains the catalogue. Compact results.json is the same 40,991 rows as the pretty-print extract.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 313,
  historical_offices: 7,
  offices: 320,
  geographies: 318,
  selected_histories: 4639,
  other_histories: 2,
  prospective_events: 310,
  total_events: 4951,
  result_rows: 40991,
  result_rows_party: 36103,
  result_rows_statistical_group: 4888,
  municipal_offices: 292,
  regional_offices: 25,
  national_offices: 1,
  other_offices: 2,
  approved_classifications: 310,
  needs_review_classifications: 10,
  sources: 356,
  catalogue_rows: 356,
  unresolved_evidence: 7,
  unresolved_research_gaps: 7,
  identity_crosswalks: 317,
  retained_inputs: 11,
  research_dates: 5264,
  event_dates_day_called: 320,
  event_dates_year_called: 4631,
  next_dates_year_statutory: 311,
  next_dates_year_expected: 1,
  next_dates_day_statutory: 1,
  proceedings: 0,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
  named_holds: 7,
  gotland_offices: 1,
  bastad_2015_result_rows: 0,
  fargelanda_1973_disputed: 7,
  repeated_events: 8,
} as const;

export type SwedenHashInputs = {
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

export function swedenEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function swedenUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): SwedenHashInputs {
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

export function fingerprintSha256(hashInputs: SwedenHashInputs): string {
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
  return /kommunalråd|statsminister|prime.?minister|\bcabinet\b|borgmästare|\bmayor\b/i.test(value) || /(?:^|-)M$/.test(value);
}
