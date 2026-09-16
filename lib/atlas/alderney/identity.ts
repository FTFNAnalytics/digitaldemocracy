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

export const LINEAGE_ID = "country-package-alderney";
export const SOURCE_NAMESPACE = "country-package-alderney";
export const COUNTRY_ID = "alderney";
export const ADAPTER_VERSION = "atlas-alderney-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/alderney.json";
export const PACKAGE_PREFIX = "data/countries/alderney";
export const REGISTER_RELATIVE = "data/countries/alderney/tables/office-register.json";
export const REGISTER_SHA256 = "46dcd2afececa8e2ab46383d306003b941e6ca0ef9dac8e77dfc4435444a72f9";
export const TIER_SHA256 = "e321762fb97ea8971e999fb699113312c80ddf171bcc3f40cd929252c6cd7fb7";
export const MANIFEST_LISTED_FILES = 16;
export const REGIONAL_EMPTY_LABEL =
  "No regional tier in this package; two territorial office/contest records classified other.";
export const CANDIDATE_FINGERPRINT = "c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706";
export const CANDIDATE_RELEASE_ID =
  "country-package-alderney--sha256-c692ba2d1329e5af1a23f3f9484771b330bd8388348197552aef56dd25bc2706";
export const METHOD_V2_FINGERPRINT = "5a406722c1c3ca597cf66a64cb7895c34b41652aab330c40f1917807a43b2baa";
export const CALENDAR_STATUS = "Official July proposal; final resolution not yet verified";
export const CANDIDATE_MARKS_BASIS =
  "Candidate marks; overlapping voter choices, normalized to all recorded candidate marks";

export const EXPECTED_COUNTS = {
  current_offices: 2,
  historical_offices: 0,
  geographies: 2,
  selected_histories: 6,
  prospective_events: 2,
  total_events: 8,
  research_dates: 8,
  result_rows: 27,
  control_observations_supplied: 0,
  poll_records_supplied: 0,
  source_catalogue_rows: 6,
  inline_only_sources: 1,
  sources: 7,
  briefings_retained: 2,
  other_offices: 2,
  regional_offices: 0,
  municipal_offices: 0,
  proceedings: 0,
  party_mappings: 0,
  package_files_retained: 20,
  retained_inputs: 21,
} as const;

export const EXPECTED_OFFICES: Record<
  string,
  {
    geographyId: string;
    jurisdiction: string;
    officeType: string;
    nextEventId: string;
    nextDate: string;
    calendarColumn: "First or scheduled date" | "End or runoff date";
  }
> = {
  "GG-ALD-PLEB": {
    geographyId: "geo-e421db320af0c5c106f24293",
    jurisdiction: "Alderney",
    officeType: "Plebiscite nominating two Guernsey States representatives",
    nextEventId: "next-f2267589582f25eae0c65e96",
    nextDate: "2026-12-12",
    calendarColumn: "End or runoff date",
  },
  "GG-ALD-STATES": {
    geographyId: "geo-5b23b4b4235736678bfe4b68",
    jurisdiction: "Alderney",
    officeType: "States members (five of ten ordinary seats)",
    nextEventId: "next-166ad22fe0872fb2402d3f93",
    nextDate: "2026-11-21",
    calendarColumn: "First or scheduled date",
  },
};

export type AlderneyHashInputs = {
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
  return key("event", ["alderney", hk]);
}

export function nextEventIdFor(officeId: string): string {
  return key("next", officeId);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["alderney", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `alderney--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `alderney--${key("url", url)}`;
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): AlderneyHashInputs {
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

export function fingerprintSha256(hashInputs: AlderneyHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
