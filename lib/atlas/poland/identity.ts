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

export const LINEAGE_ID = "country-package-poland";
export const SOURCE_NAMESPACE = "country-package-poland";
export const COUNTRY_ID = "poland";
export const COUNTRY_CODE = "PL";
export const ADAPTER_VERSION = "atlas-poland-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/poland.json";
export const RESEARCH_PREFIX = "data/research/poland";
export const REGISTER_RELATIVE = "data/research/poland/office-register.json";
export const EVENTS_RELATIVE = "data/research/poland/events.json";
export const GEOGRAPHY_RELATIVE = "data/research/poland/geography.json";
export const SOURCES_RELATIVE = "data/research/poland/source-catalogue.json";
export const GAPS_RELATIVE = "data/research/poland/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/poland/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/poland/proceedings.json";
export const REGISTER_SHA256 = "f7b6061fc348dcfe2184cf39b6866aef37debea8f2f8f7add956b5a76b6f9f4a";
export const TIER_SHA256 = "8316357779f24b8f0ffe58640ef6d32370dff2c2e4f7e7dcf7e4ee23440e6d14";
/** Predecessor draft tier digest from Prompt AC. The approved file must not match it. */
export const DRAFT_TIER_SHA256 = "bd11a49634b12aa699e0ead91aff64a68e257efe6fc3fc542c44818a2167f2cd";
/**
 * Documentary fingerprint of the full review pack (includes omitted results.jsonl.gz and sources/).
 * The slim land does not contain those bytes, so the importer fingerprint is different.
 */
export const FULL_PACK_DOCUMENTARY_FINGERPRINT =
  "186c6fba36fcceddf4d474316ea773adf1f60ba53e526bcc8dea37a5bfbc6944";

/** Pinned after approved-tier slim-pack inventory scan. Results and raw sources are not in the hash. */
export const CANDIDATE_FINGERPRINT = "50d80c24c2f557d2fdc5fd5efc835a96b41f9adf353a3924f481389b5c9cc5a3";
export const CANDIDATE_RELEASE_ID =
  "country-package-poland--sha256-50d80c24c2f557d2fdc5fd5efc835a96b41f9adf353a3924f481389b5c9cc5a3";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const BOLESLAWIEC_COUNCIL_ID = "PL-020101-C";
export const BOLESLAWIEC_GEOGRAPHY_ID = "PL-020101";
export const BOLESLAWIEC_RECORD_KEY = "rec-2f7857cedb50a3865a98bae543069c24f8015fd9cead027f42179ae954325183";
export const OSTROWICE_COUNCIL_ID = "PL-320304-C";
export const OSTROWICE_EXECUTIVE_ID = "PL-320304-X";
export const POWIAT_EXAMPLE_ID = "PL-020100-P";
export const SEJMIK_EXAMPLE_ID = "PL-020000-V";
export const SEJM_ID = "PL-SEJM";
export const SENAT_ID = "PL-SENAT";
export const PRESIDENT_ID = "PL-PRESIDENT";
export const EP_ID = "PL-EP";
export const WARSAW_DISTRICT_EXAMPLE_ID = "PL-146502-D";
export const SEJM_2019_HISTORY_KEY = "PL-SEJM::2019::ordinary::whole-office";
export const PROSPECTIVE_HISTORY_KEY = "PL-302113-X::2026-09-27::special::wojtburmistrz-pkw-4471";

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "direct_municipal_executive",
  "county_council",
  "warsaw_district_council",
  "voivodeship_sejmik",
  "national_lower_chamber",
  "national_upper_chamber",
  "direct_national_executive",
  "european_parliament_delegation",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "330 regional offices (16 voivodeship sejmiks + 314 powiat councils). PL-POWIAT-TIER stays open: powiat rows remain the drafted regional classification and are not reclassified. Do not report 330 as 330 voivodeships. Named historic, 2019 share-unit, special-return, Warsaw auxiliary, and next-date holds stay open. No appointed voivode or PM/cabinet rows. Slim land omits result bytes; none are invented.";

export const COUNTRY_NOTES = [
  "Prompt AC full register: 5,310 current + 2 historical offices. Coverage partial.",
  "16 voivodeship sejmiks and 314 powiat councils are drafted regional. PL-POWIAT-TIER is open; do not reclassify powiat rows or report 330 as voivodeships.",
  "Historic Ostrowice council and wójt stay active historical records with no successor edge.",
  "Open holds: historic territories, 1990–1999 reforms, cycle legal status, 2019 share unit, special-return detail, Warsaw auxiliary, EP scope, title and boundary changes, older national history, margins and parties, next dates.",
  "No appointed voivode or popular PM/cabinet rows.",
  "Slim pack omits sources/ and results.jsonl.gz. Result rows are not invented.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 5310,
  historical_offices: 2,
  offices: 5312,
  geographies: 2829,
  selected_histories: 15914,
  other_histories: 797,
  prospective_events: 56,
  total_events: 16767,
  result_rows: 0,
  municipal_offices: 4960,
  regional_offices: 330,
  national_offices: 3,
  other_offices: 19,
  powiat_councils: 314,
  voivodeship_sejmiks: 16,
  warsaw_district_councils: 18,
  approved_classifications: 4979,
  needs_review_classifications: 333,
  sources: 3181,
  unresolved_evidence: 12,
  identity_crosswalks: 9918,
  retained_inputs: 13,
  research_dates: 22051,
  event_dates_day_called: 16764,
  event_dates_year_called: 3,
  next_dates_year_expected: 5284,
  proceedings: 9773,
  proceedings_first_round: 7469,
  proceedings_runoff: 2304,
  party_mappings: 0,
  successor_edges: 0,
  appointed_voivode_offices: 0,
  cabinet_offices: 0,
} as const;

export type PolandHashInputs = {
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

export function proceedingIdFor(officeId: string, hk: string, sequenceNo: number): string {
  return key("proceeding", [OFFICE_NAMESPACE, officeId, hk, "round", sequenceNo]);
}

export function polandEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function polandUnresolvedId(rec: string, gapPath: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [gapPath, originalToken], originalToken]))}`;
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
}): PolandHashInputs {
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

export function fingerprintSha256(hashInputs: PolandHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function isAppointedVoivodeOrCabinet(officeType: string, name: string): boolean {
  if (/^(appointed_)?voivode$|^wojewoda$|^cabinet$|^premier$|^prime_minister$/i.test(officeType)) return true;
  if (/\bWojewoda\b/u.test(name)) return true;
  if (/Prezes Rady Ministrów/u.test(name)) return true;
  if (/\bRada Ministrów\b/u.test(name)) return true;
  return false;
}
