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

export const LINEAGE_ID = "country-package-armenia";
export const SOURCE_NAMESPACE = "country-package-armenia";
export const COUNTRY_ID = "armenia";
export const ADAPTER_VERSION = "atlas-armenia-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/armenia.json";
export const PACKAGE_PREFIX = "data/countries/armenia";
export const UNPACKED_PREFIX = "data/countries/armenia/unpacked";
export const REGISTER_RELATIVE = "data/countries/armenia/unpacked/tables/master/office-register.json";
export const REGISTER_SHA256 = "23588bdc55fc7a6dff8cf322adedd9df085088f12fb018401dda6df5f1ae759d";
export const TIER_SHA256 = "2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a";
export const REGIONAL_EMPTY_LABEL =
  "No regional offices in the supplied Armenia package; 71 municipal offices. Research coverage remains partial.";
export const CANDIDATE_FINGERPRINT = "d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e";
export const CANDIDATE_RELEASE_ID =
  "country-package-armenia--sha256-d0675b6f6d7f94b0fd2eb4027dd42dbd93647ad42c294efe4d69f7f70d566a6e";
export const METHOD_V2_FINGERPRINT = "18079090bcb5ee56b578eab3526cc3fe04e65e582cb9a51ee81752c249773fe0";
export const CEC_CONFIRMED_PHRASE = "CEC day and community confirmed.";
export const FORBIDDEN_VEDI_TOKEN = "AM-VEDI";

export const MAYOR_OFFICE_IDS = [
  "AM-ALAGYAZ-M",
  "AM-AREVUT-M",
  "AM-ARZNI-M",
  "AM-FERIK-M",
  "AM-FIOLETOVO-M",
  "AM-LERMONTOVO-M",
  "AM-METSADZOR-M",
  "AM-SHAMIRAM-M",
] as const;

export const BOUNDARY_CALENDAR_REVIEW_OFFICES = [
  "AM-ARARAT-C",
  "AM-MASIS-C",
  "AM-PAMBAK-C",
  "AM-VANADZOR-C",
  "AM-VEDI-C",
] as const;

export const EXPECTED_COUNTS = {
  current_offices: 71,
  historical_offices: 0,
  geographies: 71,
  proportional_councils: 55,
  majoritarian_councils: 8,
  existing_mayor_offices: 8,
  selected_histories: 33,
  offices_with_histories: 31,
  prospective_events: 30,
  total_events: 63,
  research_dates: 63,
  result_rows: 97,
  offices_without_recorded_histories: 40,
  unknown_next_dates: 41,
  control_observations_supplied: 0,
  poll_records_supplied: 0,
  master_source_catalogue_rows: 15,
  companion_source_catalogue_rows: 19,
  distinct_catalogue_sources: 19,
  inline_only_sources: 1,
  sources: 20,
  office_briefings_retained: 71,
  country_briefings_retained: 1,
  municipal_offices: 71,
  regional_offices: 0,
  proceedings: 0,
  party_mappings: 0,
  outer_package_files: 8,
  payload_member_files: 91,
  retained_inputs: 100,
} as const;

export const EXPECTED_OFFICES: Record<
  string,
  { geographyId: string; jurisdiction: string; officeType: string }
> = {
  "AM-ABOVYAN-C": {
    geographyId: "geo-06fbdce1451cf0b0fa2be8db",
    jurisdiction: "Abovyan",
    officeType: "Municipal council (proportional; mayor elected by council)",
  },
  "AM-AKHURYAN-C": {
    geographyId: "geo-666babfddc7f05e9504687c5",
    jurisdiction: "Akhuryan",
    officeType: "Municipal council (proportional; mayor elected by council)",
  },
  "AM-ALAGYAZ-M": {
    geographyId: "geo-20f09adedcd81820fb8036ac",
    jurisdiction: "Alagyaz",
    officeType: "Mayor",
  },
  "AM-VEDI-C": {
    geographyId: "geo-a071a7401e7dee817cc55eb5",
    jurisdiction: "Vedi",
    officeType: "Municipal council (proportional; mayor elected by council)",
  },
  "AM-TSAGHKAHOVIT-C": {
    geographyId: "geo-f3c505e95e61dedd6bcafd40",
    jurisdiction: "Tsaghkahovit",
    officeType: "Municipal council (proportional; mayor elected by council)",
  },
};

export type ArmeniaHashInputs = {
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
  return key("event", ["armenia", hk]);
}

export function nextEventIdFor(officeId: string): string {
  return key("next", officeId);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["armenia", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `armenia--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `armenia--${key("url", url)}`;
}

export function unpackedPath(archiveEntry: string): string {
  return `${UNPACKED_PREFIX}/${archiveEntry}`;
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): ArmeniaHashInputs {
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

export function fingerprintSha256(hashInputs: ArmeniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
