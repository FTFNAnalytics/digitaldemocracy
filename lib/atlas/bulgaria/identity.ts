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
  cellYear,
  dateId,
  evidenceId,
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

export const LINEAGE_ID = "country-package-bulgaria";
export const SOURCE_NAMESPACE = "country-package-bulgaria";
export const COUNTRY_ID = "bulgaria";
export const COUNTRY_CODE = "BG";
export const ADAPTER_VERSION = "atlas-bulgaria-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/bulgaria.json";
export const PACKAGE_PREFIX = "data/countries/bulgaria";
export const UNPACKED_PREFIX = "data/countries/bulgaria/unpacked";
export const REGISTER_RELATIVE = "data/countries/bulgaria/unpacked/tables/master/office-register.json";
export const REGISTER_SHA256 = "00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559";
export const TIER_SHA256 = "9a6718fe301f440511cc9e9f9b4139b3a1e0332ef2e3e6c9b3063f67f04652ab";
export const DRAFT_TIER_SHA256 = "cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0";
export const DRAFT_FINGERPRINT = "51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba";
export const DRAFT_RELEASE_ID = "country-package-bulgaria--sha256-51cb9381de3e680a9332fd7aaeff3035246f55f9512c723d874a25fb2447afba";
export const REGIONAL_EMPTY_LABEL =
  "No regional offices in the supplied Bulgaria package; 530 approved municipality-wide municipal offices. 3,067 district/village rows remain held. Research coverage remains partial.";

export const CANDIDATE_FINGERPRINT = "0b7b681194ea52dd6aa4ff690f5bdce29463b2f88248b1a3a8099ba423ef880e";
export const CANDIDATE_RELEASE_ID = `country-package-bulgaria--sha256-${CANDIDATE_FINGERPRINT}`;

export const GRADEC_OFFICE_ID = "BG-SLV11-b88d0d4475-V";
export const GRADEC_FIRST_ROUND_ROW_INDEXES = [1665, 1666, 1667, 1668, 1669, 1670] as const;
export const APPROVED_OFFICE_TYPES = ["Mayor", "Municipal council"] as const;
export const HELD_OFFICE_TYPES = ["District mayor", "Village mayor"] as const;
export const INLINE_ONLY_URLS = [
  "https://en.wikipedia.org/wiki/List_of_elections_in_2027",
  "https://www.cik.bg/",
] as const;

export const HELD_EXAMPLE_OFFICE_IDS = [
  "BG-BLG52-fc5837f6a1-V",
  "BG-PAZ08-fc5837f6a1-V",
  "BG-VAR06-cc638e039f-D",
  GRADEC_OFFICE_ID,
] as const;

export const AVREN_MAYOR_2023_HISTORY_KEY = "BG-VAR01-M::2023::2023-11-05";
export const AVREN_MAYOR_2023_EVENT_ID = "event-4dfb3f891b3e9636d4f0727b";
export const AVREN_MAYOR_2023_DATE_ID = "date-6fdfb24f0a8102c17fc8bbf5159c19de3ca4e10c9bdcdeee4c4c9094049c231a";

export const EXPECTED_COUNTS = {
  register_offices: 3597,
  current_offices: 530,
  historical_offices: 0,
  geographies: 530,
  mayor_offices: 265,
  municipal_council_offices: 265,
  district_mayor_offices: 35,
  village_mayor_offices: 3032,
  held_offices: 3067,
  companion_offices: 3597,
  companion_histories: 8661,
  index_histories: 8661,
  overlap_histories: 8661,
  selected_histories: 1590,
  held_histories: 7071,
  total_events: 1590,
  prospective_events: 0,
  research_dates: 1590,
  historical_dates_day: 1590,
  unknown_next_dates: 530,
  result_rows: 10343,
  held_result_rows: 15474,
  votes_recorded: 10338,
  votes_zero: 5,
  votes_missing: 0,
  shares_recorded: 10338,
  shares_zero: 5,
  seats_recorded: 4499,
  seats_zero: 5844,
  seats_missing: 0,
  first_round_retained_rows: 7746,
  unresolved_retained_rows: 2591,
  master_source_catalogue_rows: 2809,
  companion_source_catalogue_rows: 3971,
  overlapping_catalogue_ids: 2809,
  distinct_catalogue_sources: 3971,
  inline_only_sources: 2,
  sources: 3973,
  office_briefings_retained: 3597,
  country_briefings_retained: 1,
  poll_records_supplied: 0,
  control_observations_supplied: 0,
  municipal_offices: 530,
  regional_offices: 0,
  proceedings: 0,
  party_mappings: 0,
  outer_package_files: 54,
  payload_member_files: 3617,
  retained_inputs: 3672,
} as const;

export const EXPECTED_OFFICES: Record<
  string,
  { geographyId: string; jurisdiction: string; officeType: string }
> = {
  "BG-VAR01-M": {
    geographyId: "geo-0f253e2855d47274f7fda71e",
    jurisdiction: "Аврен",
    officeType: "Mayor",
  },
  "BG-VAR01-C": {
    geographyId: "geo-a39fe4d2dca8e2ef1d3f84a9",
    jurisdiction: "Аврен",
    officeType: "Municipal council",
  },
};

export type BulgariaHashInputs = {
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
  return key("event", ["bulgaria", hk]);
}

export function nextEventIdFor(officeId: string): string {
  return key("next", officeId);
}

export function geographyIdFor(officeId: string): string {
  return key("geo", ["bulgaria", officeId]);
}

export function legacyGeographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["bulgaria", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `bulgaria--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `bulgaria--${key("url", url)}`;
}

export function unpackedPath(archiveEntry: string): string {
  return `${UNPACKED_PREFIX}/${archiveEntry}`;
}

export function isApprovedOfficeType(officeType: string): boolean {
  return (APPROVED_OFFICE_TYPES as readonly string[]).includes(officeType);
}

export function isHeldOfficeType(officeType: string): boolean {
  return (HELD_OFFICE_TYPES as readonly string[]).includes(officeType);
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): BulgariaHashInputs {
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

export function fingerprintSha256(hashInputs: BulgariaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
