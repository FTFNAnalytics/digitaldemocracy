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

export const LINEAGE_ID = "country-package-austria";
export const SOURCE_NAMESPACE = "country-package-austria";
export const COUNTRY_ID = "austria";
export const COUNTRY_CODE = "AT";
export const ADAPTER_VERSION = "atlas-austria-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/austria.json";
export const PACKAGE_PREFIX = "data/countries/austria";
export const UNPACKED_PREFIX = "data/countries/austria/unpacked";
export const REGISTER_RELATIVE = "data/countries/austria/unpacked/tables/master/office-register.json";
export const REGISTER_SHA256 = "19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68";
export const TIER_SHA256 = "1c303f748b6fa706bea71d750b5e50be8ab27acc7baf166fe01e0b85e9da69eb";
export const DRAFT_TIER_SHA256 = "9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d";
export const DRAFT_FINGERPRINT = "85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005";
export const DRAFT_RELEASE_ID = "country-package-austria--sha256-85eb8f67a6521e85f38babde77546767c862f3e373fee0bfa02e8ac7786ca005";
export const METHOD_V2_FINGERPRINT = "7d77583cc836a98dd0282fa84344fd15dda38325b9cf5b54088ce1f263876ffc";
export const REGIONAL_CALENDAR_LABEL =
  "4 regional offices (Carinthia, Lower Austria, Tyrol, Upper Austria). No dated upcoming regional events; next dates remain unknown. Research coverage remains partial.";

export const CANDIDATE_FINGERPRINT = "57088577a272603291d3f501d5d35256360e67fb17732a6a55893b2ed0bf08b1";
export const CANDIDATE_RELEASE_ID =
  "country-package-austria--sha256-57088577a272603291d3f501d5d35256360e67fb17732a6a55893b2ed0bf08b1";

export const REGIONAL_OFFICE_IDS = ["AT-KTN-A", "AT-NOE-A", "AU-ab9fc7cefb", "AU-9560299fb9"] as const;
export const ST_GEORGEN_HOLD_HISTORY_KEY = "AT-OOE-41119-M::2015::";
export const ST_GEORGEN_HOLD_EVENT_ID = "event-c38c8dd1ab8537426d14d5c0";
export const ST_GEORGEN_HOLD_OFFICE_ID = "AT-OOE-41119-M";

export const DAY_DATE_ALLOWLIST = {
  "Decisive mayoral runoff, 11 October 2015; Valid candidate/list votes": {
    label: "11 October 2015",
    year: 2015,
    month: 10,
    day: 11,
  },
  "Decisive mayoral runoff, 23 October 2022; Valid candidate/list votes": {
    label: "23 October 2022",
    year: 2022,
    month: 10,
    day: 23,
  },
  "2022 cycle: decisive repeat mayoral runoff 3 September 2023; Valid candidate/list votes": {
    label: "3 September 2023",
    year: 2023,
    month: 9,
    day: 3,
  },
  "2017 cycle: decisive repeat council election 9 September 2018; Valid candidate/list votes": {
    label: "9 September 2018",
    year: 2018,
    month: 9,
    day: 9,
  },
  "2017 cycle: decisive repeat mayoral runoff 7 October 2018; Valid candidate/list votes": {
    label: "7 October 2018",
    year: 2018,
    month: 10,
    day: 7,
  },
} as const;

export const EXPECTED_COUNTS = {
  current_offices: 2038,
  historical_offices: 0,
  geographies: 2038,
  mayor_offices: 1017,
  municipal_council_offices: 1017,
  companion_offices: 2034,
  companion_histories: 5944,
  index_histories: 5956,
  overlap_histories: 5944,
  index_only_histories: 12,
  selected_histories: 5956,
  total_events: 5956,
  prospective_events: 0,
  research_dates: 5956,
  historical_dates_day: 58,
  historical_dates_year: 5898,
  unknown_next_dates: 2038,
  result_rows: 16336,
  seats_positive: 8756,
  seats_zero: 400,
  seats_missing: 7180,
  master_source_catalogue_rows: 71,
  companion_source_catalogue_rows: 86,
  overlapping_catalogue_ids: 64,
  distinct_catalogue_sources: 93,
  inline_only_sources: 4,
  sources: 97,
  office_briefings_retained: 2038,
  country_briefings_retained: 1,
  poll_records_retained: 1,
  control_observations_supplied: 0,
  municipal_offices: 2034,
  regional_offices: 4,
  regional_needs_review: 4,
  proceedings: 0,
  party_mappings: 0,
  outer_package_files: 25,
  payload_member_files: 2058,
  retained_inputs: 2084,
} as const;

export const EXPECTED_OFFICES: Record<
  string,
  { geographyId: string; jurisdiction: string; officeType: string }
> = {
  "AT-TY-M-70701": {
    geographyId: "geo-d3a525f5a87408bb04efd267",
    jurisdiction: "Abfaltersbach",
    officeType: "Mayor",
  },
  "AT-TY-C-70201": {
    geographyId: "geo-9b7ac2f9fb24d5b0a3348389",
    jurisdiction: "Arzl im Pitztal",
    officeType: "Municipal council",
  },
  "AT-KTN-A": {
    geographyId: "geo-7842b5b67d2aa6b79214f9f3",
    jurisdiction: "Carinthia",
    officeType: "State legislature",
  },
  "AT-NOE-A": {
    geographyId: "geo-317b016d630f4395a431b124",
    jurisdiction: "Lower Austria",
    officeType: "State legislature",
  },
  "AU-ab9fc7cefb": {
    geographyId: "geo-fd5402858455b6f510931e90",
    jurisdiction: "Tyrol",
    officeType: "Regional legislature",
  },
  "AU-9560299fb9": {
    geographyId: "geo-4ac79136ff60ee3964f87eaa",
    jurisdiction: "Upper Austria",
    officeType: "Regional legislature",
  },
  "AT-OOE-41119-M": {
    geographyId: "geo-71094c0200bc990c72916c31",
    jurisdiction: "St.Georgen am Walde",
    officeType: "Mayor",
  },
};

export type AustriaHashInputs = {
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
  return key("event", ["austria", hk]);
}

export function nextEventIdFor(officeId: string): string {
  return key("next", officeId);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["austria", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `austria--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `austria--${key("url", url)}`;
}

export function unpackedPath(archiveEntry: string): string {
  return `${UNPACKED_PREFIX}/${archiveEntry}`;
}

export function isRegionalOfficeId(officeId: string): boolean {
  return (REGIONAL_OFFICE_IDS as readonly string[]).includes(officeId);
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): AustriaHashInputs {
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

export function fingerprintSha256(hashInputs: AustriaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
