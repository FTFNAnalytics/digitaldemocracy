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

export const LINEAGE_ID = "country-package-ireland";
export const SOURCE_NAMESPACE = "country-package-ireland";
export const COUNTRY_ID = "ireland";
export const COUNTRY_CODE = "IE";
export const ADAPTER_VERSION = "atlas-ireland-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/ireland.json";
export const RESEARCH_PREFIX = "data/research/ireland";
export const REGISTER_RELATIVE = "data/research/ireland/office-register.json";
export const EVENTS_RELATIVE = "data/research/ireland/events.json";
export const RESULTS_RELATIVE = "data/research/ireland/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/ireland/geographies.json";
export const SOURCES_RELATIVE = "data/research/ireland/sources.json";
export const GAPS_RELATIVE = "data/research/ireland/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/ireland/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/ireland/proceedings.json";
export const LOCAL_BOOK_RELATIVE = "data/research/ireland/local-book-extract.json";
export const AUDIT_RELATIVE = "data/research/ireland/source-extraction-audit.json";
export const SOURCES_NOTE_RELATIVE = "data/research/ireland/SOURCES_NOTE.md";
export const REGISTER_SHA256 = "329bfaadd79d41a5772e7b9070e7d67ef3e7810fd41dd0a22fdfda17b723f1cc";
export const RESULTS_SHA256 = "380dc9071686fcdaf17bd50e0352cf21b6db0bfbf6647f1acb231eb3a4b6269b";
export const TIER_SHA256 = "f4426e0df1b99d6e3330c345e33a83022cf654b180c659e03c0e889ae4327ca0";
export const DRAFT_TIER_SHA256 = "0683410a3e3b8f1c1bc5b69df0793fd5bbba524658556a51ca76d3aeb7ae3470";
/** Documentary fingerprint from the Prompt AB identity rules (draft tier, full pack). */
export const DRAFT_FINGERPRINT = "b6145edbe4ab2c4ba5b9e41d340edb515a9a8acecb12f125b3d868d8a100c5fc";
export const DRAFT_RELEASE_ID =
  "country-package-ireland--sha256-b6145edbe4ab2c4ba5b9e41d340edb515a9a8acecb12f125b3d868d8a100c5fc";

/** Pinned after approved-tier slim-pack inventory scan. Slim pack omits bulky source bytes. */
export const CANDIDATE_FINGERPRINT = "024c272d64563535f4c98fa4552ba28aff46a9542584a38f40e1d885ce70afc6";
export const CANDIDATE_RELEASE_ID =
  "country-package-ireland--sha256-024c272d64563535f4c98fa4552ba28aff46a9542584a38f40e1d885ce70afc6";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const NAMED_HOLDS = [
  "IE-2014-REFORM",
  "IE-LOCAL-2019-2024",
  "IE-SEANAD-PANELS",
  "IE-EP-RESULTS",
  "IE-DAIL-ENCODING-AND-STV",
  "IE-PRESIDENT-LATEST",
  "IE-MAYOR-LIMIT",
  "IE-NORTHERN-IRELAND-EXCLUSION",
  "IE-REGIONAL-APPOINTMENTS",
] as const;

export const DAIL_ID = "IE-DAIL";
export const DAIL_RECORD_KEY = "rec-a072234952b0e670bed5d3abc9bcef04722b240648a7c2f185cec47d8ea0a570";
export const DAIL_DUBLIN_HISTORY_KEY = "IE-DAIL::2026-05-22::special::Dublin Central";
export const DAIL_DUBLIN_EVENT_ID = "event-8ec7fd1cfebd286c600d6154";
export const DAIL_GALWAY_HISTORY_KEY = "IE-DAIL::2026-05-22::special::Galway West";
export const DAIL_GALWAY_EVENT_ID = "event-a878d3dea6a59ec8477ede76";
export const EP_ID = "IE-EP";
export const EP_RECORD_KEY = "rec-0c5a0977703b214f2a0c0d2b1ebca48b0d4f80233f2e316471f0a8db6bc7d541";
export const EP_NEXT_DATE_ID = "date-8bb7926a7b954f14742656e44ba2827e649ec9b60baae9f1c6a9eb5389d24f2c";
export const EP_2024_HISTORY_KEY = "IE-EP::2024-06-07::ordinary::whole-office";
export const EP_2024_EVENT_ID = "event-d694db89c31ef2d3f42adaea";
export const SEANAD_ID = "IE-SEANAD";
export const SEANAD_HISTORY_KEY = "IE-SEANAD::2025-01::indirect::whole-office";
export const SEANAD_EVENT_ID = "event-6049c2691c9d6e0f47cbd437";
export const PRESIDENT_ID = "IE-PRESIDENT";
export const PRESIDENT_2011_HISTORY_KEY = "IE-PRESIDENT::2011::ordinary::whole-office";
export const PRESIDENT_2011_EVENT_ID = "event-9508e4c352f4f3bb31424bbd";
export const LIMERICK_MAYOR_ID = "IE-LIMERICK-MAYOR";
export const LIMERICK_MAYOR_HISTORY_KEY = "IE-LIMERICK-MAYOR::2024-06-07::ordinary::whole-office";
export const LIMERICK_MAYOR_EVENT_ID = "event-15c7d1a0046e852dbf21e68d";
export const LIMERICK_GEOGRAPHY_ID = "IE-LA-2ae19629-148f-13a3-e055-000000000001";
export const LIMERICK_COUNCIL_ID = "IE-LA-2ae19629-148f-13a3-e055-000000000001-C";
export const CLONMEL_ID = "IE-HIST-CLONMEL-B-C";
export const CLONMEL_2009_HISTORY_KEY = "IE-HIST-CLONMEL-B-C::2009-06-05::ordinary::whole-office";
export const CLONMEL_2009_EVENT_ID = "event-86bcccd180d2cb978db039b0";
export const COUNCIL_EXAMPLE_ID = "IE-LA-2ae19629-1433-13a3-e055-000000000001-C";
export const COUNCIL_EXAMPLE_NEXT_DATE_ID = "date-c10469cf15b208bcfe5f65992642451df866095ff0c410cdae2971a1b534c675";

export const REGIONAL_CALENDAR_LABEL =
  "No regional offices in the supplied Ireland package. Regional assemblies are councillor appointments, not a popular regional tier. 118 municipal offices (31 current local authority councils, the directly elected Mayor of Limerick, and 86 historical town, borough, and pre-2014 city/county councils). Named holds stay open. Northern Ireland is excluded.";

export const COUNTRY_NOTES = [
  "Prompt AB full register: 36 current + 86 historical offices. Coverage partial.",
  "All 31 current local authority councils, Dáil Éireann, Seanad Éireann, President of Ireland, the Ireland EP delegation, and the directly elected Mayor of Limerick are present.",
  "86 historical councils stay with sourced contexts. No guessed 2014 merger successors.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open holds: IE-2014-REFORM; IE-LOCAL-2019-2024; IE-SEANAD-PANELS; IE-EP-RESULTS; IE-DAIL-ENCODING-AND-STV; IE-PRESIDENT-LATEST; IE-MAYOR-LIMIT; IE-NORTHERN-IRELAND-EXCLUSION; IE-REGIONAL-APPOINTMENTS.",
  "Northern Ireland is excluded. Regional assemblies are appointments, not a popular regional tier. No Taoiseach nominee rows and no council-selected mayor contests.",
  "Slim pack omits bulky primary-source bytes; sources.json remains the catalogue. Do not invent those bytes.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 36,
  historical_offices: 86,
  offices: 122,
  geographies: 118,
  selected_histories: 196,
  other_histories: 0,
  prospective_events: 0,
  total_events: 196,
  result_rows: 7254,
  result_rows_party: 34,
  result_rows_candidate: 7220,
  municipal_offices: 118,
  regional_offices: 0,
  national_offices: 3,
  other_offices: 1,
  approved_classifications: 34,
  needs_review_classifications: 88,
  sources: 52,
  catalogue_rows: 52,
  unresolved_evidence: 9,
  unresolved_research_gaps: 9,
  identity_crosswalks: 395,
  retained_inputs: 12,
  research_dates: 229,
  event_dates_day_called: 181,
  event_dates_month_called: 1,
  event_dates_year_called: 14,
  next_dates_year_expected: 33,
  proceedings: 0,
  party_mappings: 0,
  direct_mayor_offices: 1,
  limerick_mayor_result_rows: 15,
  ep_result_rows: 0,
  seanad_result_rows: 140,
  northern_ireland_offices: 0,
} as const;

export type IrelandHashInputs = {
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

export function resultIdFor(officeId: string, historyKey: string, identityToken: string): string {
  return key("result", [OFFICE_NAMESPACE, officeId, historyKey, null, identityToken]);
}

export function sourceIdFor(url: string, request: unknown): string {
  return `ireland--${key("source", [url, request ?? null])}`;
}

export function irelandEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function irelandUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): IrelandHashInputs {
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

export function fingerprintSha256(hashInputs: IrelandHashInputs): string {
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

const PR_STV_OFFICE_TYPES = new Set([
  "local_authority_council",
  "town_council",
  "borough_council",
  "national_lower_chamber",
  "national_upper_chamber",
  "european_parliament_delegation",
]);

export function electoralSystemFor(officeType: string): string | null {
  if (PR_STV_OFFICE_TYPES.has(officeType)) return "PR-STV";
  return null;
}

export function isNorthernIrelandToken(value: string | null | undefined): boolean {
  if (!value) return false;
  return /northern ireland|\bstormont\b|\bbelfast\b|\bnewry\b|\blisburn\b|\bomagh\b|\bennis killen\b|\blondonderry\b|\bderry city\b/i.test(
    value,
  );
}
