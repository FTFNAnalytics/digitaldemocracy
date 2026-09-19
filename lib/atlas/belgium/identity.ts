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

export const LINEAGE_ID = "country-package-belgium";
export const SOURCE_NAMESPACE = "country-package-belgium";
export const COUNTRY_ID = "belgium";
export const COUNTRY_CODE = "BE";
export const ADAPTER_VERSION = "atlas-belgium-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/belgium.json";
export const RESEARCH_PREFIX = "data/research/belgium-s2";
export const REGISTER_RELATIVE = "data/research/belgium-s2/office-register.json";
export const EVENTS_RELATIVE = "data/research/belgium-s2/events.json";
export const RESULTS_RELATIVE = "data/research/belgium-s2/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/belgium-s2/geography.json";
export const SOURCES_RELATIVE = "data/research/belgium-s2/source-catalogue.json";
export const UNRESOLVED_RELATIVE = "data/research/belgium-s2/unresolved-bindings.json";
export const REGISTER_SHA256 = "4b6ccb857bf22dbef2c8dbe8b3be72f7718b5f36aacda28e4b0ca212fce1bfd0";
export const TIER_SHA256 = "adc7108868d7d8a7df3f6888de9dee05d4b799c2ebbc3a571e83a0ea8fe284cf";
export const DRAFT_TIER_SHA256 = "8dec06a21c01e0f0aa0228e3d152b795b0fff9522c96b2071fec334f5070ccb6";
export const DRAFT_FINGERPRINT = "697589ef03168fe60be3ed6a8c761dc455ce20b59453142d03053c2294498073";
export const DRAFT_RELEASE_ID = "country-package-belgium--sha256-697589ef03168fe60be3ed6a8c761dc455ce20b59453142d03053c2294498073";

/** Pinned after approved-tier inventory scan; draft-tier fingerprint is 697589ef… */
export const CANDIDATE_FINGERPRINT = "e936b937fd12f100e8ea3c9e8fd8f1fa155effa296ee829fdd52148f97ac0a8f";
export const CANDIDATE_RELEASE_ID =
  "country-package-belgium--sha256-e936b937fd12f100e8ea3c9e8fd8f1fa155effa296ee829fdd52148f97ac0a8f";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-19";
export const MUNICIPAL_ROSTER_AS_OF = "2026-07-01";

export const BILZEN_2018_HISTORY_KEY = "BE-73006-C::2018::2018-10-14";
export const BILZEN_OFFICE_ID = "BE-73006-C";
export const SAINT_JOSSE_2024_HISTORY_KEY = "BE-21014-C::2024::2024-10-13";
export const SAINT_JOSSE_OFFICE_ID = "BE-21014-C";
export const AARTSELAAR_COUNCIL_ID = "BE-11001-C";
export const AARTSELAAR_MAYOR_ID = "BE-11001-M";
export const AARTSELAAR_GEOGRAPHY_ID = "BE-NIS-11001";
export const HISTORICAL_EXAMPLE_ID = "BE-46003-C";
export const FLEMISH_PARLIAMENT_ID = "BE-FL-P";
export const FLEMISH_PARLIAMENT_2024_HK = "BE-FL-P::2024::2024-06-09";
export const FLEMISH_PARLIAMENT_2024_EVENT_ID = "event-fb50575be3efd990070a2a32";
export const CHAMBER_ID = "BE-FED-CH-P";
export const SENATE_ID = "BE-FED-SEN-P";
export const FRENCH_COMMUNITY_ID = "BE-FR-COM-P";
export const ZERO_SEAT_RESULT_ID = "result-08480e02590247a94765029c";
export const UNKNOWN_SEAT_RESULT_ID = "result-589b451cdbcbc82715e90d8c";
export const AARTSELAAR_COUNCIL_RECORD_KEY =
  "rec-b28e3d35df7de7641b7f25131ce48455f3b445c66e90ac5d418dd0d99442ed28";

export const REGIONAL_CALENDAR_LABEL =
  "15 regional offices (10 provincial councils + Flemish, Walloon, Brussels, German-speaking Community, and French Community parliaments). Historic regional depth is not a forthcoming alert. Remaining-universe notes stay open; no invented municipal or indirect rows beyond the accepted S2 pack.";

export const COUNTRY_NOTES = [
  "Prompt S2 full register: 1,179 current + 55 historical offices. Coverage partial.",
  "Municipal roster as_of=2026-07-01 is a raw observation date, not a boundary-effective date.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open research: remaining-universe (indirect bodies, community commissions, executive seats); historic successor/code-change review for 55 historical IDs; Bilzen 2018 date conflict; Saint-Josse 2024 repeat; 35 unbound IBZ 2000 municipal aliases.",
  "Frozen PR #14 zero-office screening extract is not the election universe.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 1179,
  historical_offices: 55,
  offices: 1234,
  geographies: 647,
  selected_histories: 1770,
  other_histories: 2,
  prospective_events: 0,
  total_events: 1772,
  result_rows: 9238,
  municipal_offices: 1185,
  regional_offices: 15,
  national_offices: 2,
  other_offices: 32,
  approved_classifications: 1234,
  needs_review_classifications: 0,
  sources: 459,
  catalogue_rows: 470,
  diagnostic_sources_excluded: 10,
  duplicate_source_aliases: 1,
  unresolved_evidence: 37,
  unresolved_event_holds: 2,
  unresolved_ibz_bindings: 35,
  retained_inputs: 477,
  research_dates: 2341,
  event_dates_day_called: 1771,
  next_dates_year_expected: 570,
  proceedings: 0,
  party_mappings: 0,
  mayor_result_rows: 0,
} as const;

export type BelgiumHashInputs = {
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

export function belgiumEvidenceId(
  rec: string,
  inputPath: string,
  locatorText: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, inputPath, locatorText, claimKind]))}`;
}

export function belgiumUnresolvedId(
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
}): BelgiumHashInputs {
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

export function fingerprintSha256(hashInputs: BelgiumHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function isWalloniaPortalPath(inputPath: string): boolean {
  return /\/(wa2018-|wacpas2018-|waprov2018-|wallonia-2018)/.test(inputPath);
}

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
