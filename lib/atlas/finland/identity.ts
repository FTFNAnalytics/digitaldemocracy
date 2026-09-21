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

export const LINEAGE_ID = "country-package-finland";
export const SOURCE_NAMESPACE = "country-package-finland";
export const COUNTRY_ID = "finland";
export const COUNTRY_CODE = "FI";
export const ADAPTER_VERSION = "atlas-finland-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/finland.json";
export const RESEARCH_PREFIX = "data/research/finland";
export const REGISTER_RELATIVE = "data/research/finland/office-register.json";
export const EVENTS_RELATIVE = "data/research/finland/events.json";
export const RESULTS_RELATIVE = "data/research/finland/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/finland/geographies.json";
export const SOURCES_RELATIVE = "data/research/finland/sources.json";
export const GAPS_RELATIVE = "data/research/finland/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/finland/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/finland/proceedings.json";
export const AUDIT_RELATIVE = "data/research/finland/aggregate-audit.json";
export const REGISTER_SHA256 = "150ede883757d5945c3bdd1fab027c9d084a1d24fb539add2c8c4f916268fed7";
export const RESULTS_SHA256 = "b0ae52a59cf194bf33efe27d43fce2ff5497ec56b0f1a7c91fc637fee4b59097";
export const TIER_SHA256 = "15edd48df39caae6cfefec9b20b0a20a7bafcfe7e919accbb46d056924083d53";
export const DRAFT_TIER_SHA256 = "7c3a4c1c17538d5600a10c655e7fb18b12f977a1ef79c7608f9869d813df2797";
/** Full-pack + draft-tier documentary fingerprint from Prompt Z inventory. */
export const DRAFT_FINGERPRINT = "f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a";
export const DRAFT_RELEASE_ID =
  "country-package-finland--sha256-f4b424e47bb6101959d9a2ae4e1e15f91b7200d4a5554e0e8a3a4e86fe527d5a";

/** Pinned after approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "8cfd694aa7323f491e147463a37d78d02e0b92c60fb9fdf9e47dae09da9d1224";
export const CANDIDATE_RELEASE_ID =
  "country-package-finland--sha256-8cfd694aa7323f491e147463a37d78d02e0b92c60fb9fdf9e47dae09da9d1224";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const HELSINKI_COUNCIL_ID = "FI-M091-C";
export const HELSINKI_GEOGRAPHY_ID = "FI-M091";
export const HELSINKI_RECORD_KEY = "rec-33ebf7273ea8728e99f7e746742f21bc8a9288fe6267f12655b9b02c0ff16c8d";
export const HELSINKI_NEXT_DATE_ID = "date-db87b5e376cc74ef3b6485617c9e8086c307791ce8b837ea39207d84f22c2df8";
export const ALAHARMA_HISTORICAL_ID = "FI-M004-C";
export const ALAND_LAGTING_ID = "FI-AX-LAGTING";
export const ALAND_MUNICIPAL_EXAMPLE_ID = "FI-M035-C";
export const ALAND_SEAT_ONLY_RESULT_ID = "result-53e5819d5429236bfe2f3534";
export const HVA20_ID = "FI-HVA20-C";
export const HVA20_2022_HK = "FI-HVA20-C::2022::2022::ordinary";
export const HVA20_2022_EVENT_ID = "event-5e6e06781e22744e1a58992e";
export const EDUSKUNTA_ID = "FI-EDUSKUNTA";
export const EDUSKUNTA_NEXT_DATE_ID = "date-cf4f9028a8aafce8af7d7438b202cd405e7146dd80d89f9f59fc0a343c58fb7f";
export const PRESIDENT_ID = "FI-PRESIDENT";
export const PRESIDENT_RECORD_KEY = "rec-7a3cedc6e1f88c507d99a87601d25254d538639a92032ee9ab422d27f382ae73";
export const PRESIDENT_NEXT_DATE_ID = "date-9916ec62b3113a5731ebea999db8f241c6a6e001f8c03eb62a20736ba89de15e";
export const PRESIDENT_2018_HK = "FI-PRESIDENT::2018::2018::ordinary";
export const PRESIDENT_2018_EVENT_ID = "event-ad6ac02aaadbbeda013c0c55";
export const PRESIDENT_2024_HK = "FI-PRESIDENT::2024::2024::ordinary";
export const PRESIDENT_2024_EVENT_ID = "event-41dd2a4b33d13ca4979243a9";
export const PRESIDENT_2024_FIRST_ID = "proceeding-ffc7d7d7db7b7aec348f5a22";
export const PRESIDENT_2024_RUNOFF_ID = "proceeding-b29c9ea03621a332cbf5fade";
export const EP_ID = "FI-EP";
export const EP_NEXT_DATE_ID = "date-e69c5d4f75c33531139b546b2d7352743f03c135373a7a19ef676d9a832b353d";
export const LAGTING_2023_HK = "FI-AX-LAGTING::2023::2023::ordinary";
export const LAGTING_2023_EVENT_ID = "event-48e2c0ccfe8f9ed53fe6ed94";
export const ZERO_SEAT_RESULT_ID = "result-000e727b9719a724b67b828c";
export const MISSING_VOTES_RESULT_ID = "result-050e95b0379c60ebc0a8c3ea";
export const COUNTRY_RECORD_KEY = "rec-fe25faeca21109343d1db9279e2e83d6755fcb3ebb4945fc35d06341eaa8ec6a";

export const NAMED_HOLDS = [
  "FI-HISTORIC-MERGERS",
  "FI-ALAND-EARLY-AND-DATES",
  "FI-WELLBEING-TRANSITION",
  "FI-EP-DETAIL",
  "FI-CYCLE-LEGAL-DETAIL",
  "FI-PARTY-CATEGORIES",
  "FI-MISSING-RESULTS",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "22 regional offices (21 wellbeing-county councils + Åland Lagting). Helsinki has one municipal council and no county office. 2029/2030 next dates sit outside the alert window; in-window dated upcoming regional count is 0. Named holds stay open. No popular appointed-manager / prime-minister / cabinet rows.";

export const COUNTRY_NOTES = [
  "Prompt Z full register: 333 current + 170 historical offices. Coverage partial.",
  "Helsinki is one municipal electoral body with combined responsibilities; keep FI-M091-C municipal.",
  "Åland retains 16 municipal councils and Lagting; next Åland dates stay unknown.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open named holds: FI-HISTORIC-MERGERS; FI-ALAND-EARLY-AND-DATES; FI-WELLBEING-TRANSITION; FI-EP-DETAIL; FI-CYCLE-LEGAL-DETAIL; FI-PARTY-CATEGORIES; FI-MISSING-RESULTS.",
  "No popular appointed-manager / prime-minister / cabinet rows. Do not invent merger successors, early Åland contests, wellbeing predecessors, or missing result scalars.",
  "Slim pack omits bulky primary-source bytes; sources.json remains the catalogue. Compact results.json is the same 37,471 rows as the slim-pack extract.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 333,
  historical_offices: 170,
  offices: 503,
  geographies: 501,
  selected_histories: 5241,
  other_histories: 0,
  prospective_events: 0,
  total_events: 5241,
  result_rows: 37471,
  result_rows_source_party_category: 37410,
  result_rows_candidate: 61,
  municipal_offices: 478,
  regional_offices: 22,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 332,
  needs_review_classifications: 171,
  sources: 67,
  catalogue_rows: 67,
  unresolved_evidence: 7,
  unresolved_research_gaps: 7,
  identity_crosswalks: 5019,
  retained_inputs: 11,
  research_dates: 5557,
  event_dates_year_called: 5241,
  event_dates_day_called: 0,
  next_dates_day_statutory: 316,
  proceedings: 11,
  presidential_first_rounds: 6,
  presidential_runoffs: 5,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
  named_holds: 7,
  helsinki_county_offices: 0,
  aland_current_without_next: 16,
  hva_2023_events: 0,
  president_2018_runoffs: 0,
} as const;

export type FinlandHashInputs = {
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

export function finlandEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function finlandUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): FinlandHashInputs {
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

export function fingerprintSha256(hashInputs: FinlandHashInputs): string {
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
  return (
    /kaupunginjohtaja|kunnanjohtaja|pääministeri|paaministeri|prime.?minister|\bcabinet\b|appointed.?manager|\bmayor\b|borgmästare/i.test(
      value,
    ) || /(?:^|-)M$/.test(value)
  );
}
