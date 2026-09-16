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

export const LINEAGE_ID = "country-package-andorra";
export const SOURCE_NAMESPACE = "country-package-andorra";
export const COUNTRY_ID = "andorra";
export const ADAPTER_VERSION = "atlas-andorra-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/andorra.json";
export const PACKAGE_PREFIX = "data/countries/andorra";
export const REGISTER_RELATIVE = "data/countries/andorra/tables/office-register.json";
export const REGISTER_SHA256 = "318db6770a7458b3479a4dcdefeff1b54072f3e50dd05319cd26952776d3076f";
export const TIER_SHA256 = "b3dfa904894f9c83c79989186aa2651f565ac89701e131d91952cbce67237014";
export const MANIFEST_LISTED_FILES = 23;
export const OFFICE_TYPE = "Communal council";
export const REGIONAL_EMPTY_LABEL = "No regional tier in this package; seven municipal councils.";
export const CANDIDATE_FINGERPRINT = "55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983";
export const CANDIDATE_RELEASE_ID =
  "country-package-andorra--sha256-55e3c53d76c1f4a520b1ce02f55f9c1d09670dea3b9ebadffa41b7d80e3da983";
export const METHOD_V2_FINGERPRINT = "cc7bfb98b4267e7442c117867954b39a6ab87f85525831f07ab5c88e218ace3d";

export const EXPECTED_COUNTS = {
  current_offices: 7,
  historical_offices: 0,
  geographies: 7,
  selected_histories: 21,
  result_rows: 53,
  control_observations_retained: 7,
  national_polls_retained: 1,
  source_catalogue_rows: 10,
  inline_only_sources: 3,
  sources: 13,
  briefings_retained: 7,
  municipal_offices: 7,
  regional_offices: 0,
  proceedings: 0,
  party_mappings: 0,
  package_files_retained: 27,
} as const;

export const EXPECTED_GEOGRAPHIES: Record<string, { geographyId: string; jurisdiction: string }> = {
  "AD-M-05": { geographyId: "geo-59eee2ef1a3df387bf66a0f6", jurisdiction: "Andorra la Vella" },
  "AD-M-01": { geographyId: "geo-36b8dc9620cf766f48db2bee", jurisdiction: "Canillo" },
  "AD-M-02": { geographyId: "geo-77f9d074222def8cfec4d3db", jurisdiction: "Encamp" },
  "AD-M-07": { geographyId: "geo-0c64b49ec3938c508ee9c4d1", jurisdiction: "Escaldes-Engordany" },
  "AD-M-04": { geographyId: "geo-0f76b2e75af4d0f456bdd5a6", jurisdiction: "La Massana" },
  "AD-M-03": { geographyId: "geo-e5bb0b1b7b64d5b72362a1f6", jurisdiction: "Ordino" },
  "AD-M-06": { geographyId: "geo-0b914f9f4a92b2a6a7e1f876", jurisdiction: "Sant Julià de Lòria" },
};

export type AndorraHashInputs = {
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
  return key("event", ["andorra", hk]);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", ["andorra", jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `andorra--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `andorra--${key("url", url)}`;
}

export function buildHashInputs(args: {
  inputs: HashInputDescriptor[];
  overrides?: HashInputDescriptor[];
  methodVersion?: string;
  schemaInputs?: SchemaInputDescriptor[];
}): AndorraHashInputs {
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

export function fingerprintSha256(hashInputs: AndorraHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
