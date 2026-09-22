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

export const LINEAGE_ID = "country-package-norway";
export const SOURCE_NAMESPACE = "country-package-norway";
export const COUNTRY_ID = "norway";
export const COUNTRY_CODE = "NO";
export const ADAPTER_VERSION = "atlas-norway-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/norway.json";
export const RESEARCH_PREFIX = "data/research/norway";
export const REGISTER_RELATIVE = "data/research/norway/office-register.json";
export const EVENTS_RELATIVE = "data/research/norway/events.json";
export const RESULTS_RELATIVE = "data/research/norway/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/norway/geographies.json";
export const SOURCES_RELATIVE = "data/research/norway/sources.json";
export const GAPS_RELATIVE = "data/research/norway/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/norway/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/norway/proceedings.json";
export const REFORM_CLAIMS_RELATIVE = "data/research/norway/reform-source-claims.json";
export const REGISTER_SHA256 = "a45c2cbde38bcaa12b0094a701140674841ed484a85f519faa2b8a75582c95a0";
export const RESULTS_SHA256 = "0932c1a41489fdff16d7cb8d252286924e41935191c5cf494a713bee84b02932";
export const RESULTS_PRETTY_SHA256 = "9d8c9eab7f968da3019508e7a0c36ba4409ff6ea9d7517814641b3d0736c8276";
export const TIER_SHA256 = "8ff8fc545ab326b135ac8a116d013c3dbecce377750e26dfc008bcea134db827";
export const DRAFT_TIER_SHA256 = "dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0";
/** Full-pack + draft-tier documentary fingerprint from Prompt AA inventory. */
export const DRAFT_FINGERPRINT = "d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd";
export const DRAFT_RELEASE_ID =
  "country-package-norway--sha256-d0f8b70258ef1e67c360b51c9297fe0d6efe825e9eaa74ae7c42ba7b3bbcb2bd";

/** Pinned after approved-tier slim-pack inventory scan. Documentary full-pack draft fingerprint is d0f8b702… */
export const CANDIDATE_FINGERPRINT = "676f8a3d8204b2202546c5782c106a3f4f5b5f3dc9816f26012c0def26dd3965";
export const CANDIDATE_RELEASE_ID =
  "country-package-norway--sha256-676f8a3d8204b2202546c5782c106a3f4f5b5f3dc9816f26012c0def26dd3965";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const OSLO_COUNCIL_ID = "NO-M0301-C";
export const OSLO_GEOGRAPHY_ID = "NO-M0301";
export const OSLO_RECORD_KEY = "rec-d95e003463436b1010201da33aadd5a07d4164b387990e0a135287723f1300b2";
export const OSLO_NEXT_DATE_ID = "date-ff3a2a6eafad063f33d3c8566483071e936e799fb7cb2746c643038fe2f6f176";
export const OSLO_COUNTY_OFFICE_ID = "NO-F03-C";
export const OSLO_COUNTY_GEOGRAPHY_ID = "NO-F03";
export const ROGALAND_COUNCIL_ID = "NO-F11-C";
export const ROGALAND_GEOGRAPHY_ID = "NO-F11";
export const ROGALAND_RECORD_KEY = "rec-5c548049c22181da4347344397ce676921ad65decfa19836ac994286025b184f";
export const ROGALAND_NEXT_DATE_ID = "date-0d23a02ff9c4dad65e54abe34b11c41460ebd82e9b43f833ab86487f21954ddf";
export const OSTFOLD_HISTORICAL_ID = "NO-F01-C";
export const STORTING_ID = "NO-STORTING";
export const STORTING_RECORD_KEY = "rec-6126f1fe34998f61d2e518daaf308f73f45935ed5269c1c54c38caa9299fd1ad";
export const STORTING_NEXT_DATE_ID = "date-3a00e687e64195a155ae82f029ddeba12bcd79401d4310d4cd2be1580c46ef3c";
export const STORTING_1945_HK = "NO-STORTING::1945::1945::ordinary";
export const STORTING_1945_EVENT_ID = "event-7fa599c5c8afaa465d535fd0";
export const SAMI_ID = "NO-SAMEDIGGI";
export const SAMI_RECORD_KEY = "rec-71eec3f943d715758a446525b625351314869f5ed230a4d94df6f4555a252a21";
export const SAMI_NEXT_DATE_ID = "date-c94604c0c31410428fc386509279155ac29c943308a5c5d20d9fe2aca7047fc4";
export const SAMI_2025_HK = "NO-SAMEDIGGI::2025::2025::ordinary";
export const SAMI_2025_EVENT_ID = "event-6a59aaf872387d56f73acf92";
export const SAMI_2025_DISPUTED_RESULT_ID = "result-adf589962b4ccf83cae58988";
export const LONGYEARBYEN_ID = "NO-LONGYEARBYEN-C";
export const LONGYEARBYEN_GEOGRAPHY_ID = "NO-LONGYEARBYEN";
export const LONGYEARBYEN_RECORD_KEY = "rec-0348940e6144fb9ac0ef0976d2700e08175d07c30976be542ecf733afe333064";
export const BOROUGH_EXAMPLE_ID = "NO-B030101-C";
export const BOROUGH_EXAMPLE_GEOGRAPHY_ID = "NO-B030101";
export const BOROUGH_EXAMPLE_RECORD_KEY = "rec-312044a9b919b612c710e6487f362851ceb5c837646e00a8259786a17b738408";
export const HISTORICAL_METADATA_ID = "NO-M0119u-C";
export const HISTORICAL_METADATA_RECORD_KEY =
  "rec-6018dc1954cad464958fcbe9a01500c3a7dcab4b01b131d2faa042fa9cf435bd";

export const NAMED_HOLDS = [
  "SAMI-2025-ZERO-VOTE-SEAT-98d",
  "REFORM-2020-2024",
  "OSLO-BOROUGH-HISTORY",
  "LONGYEARBYEN-HISTORY",
  "LEGAL-STATUS-REPEATS",
  "COUNTY-AGGREGATES",
  "SAMI-OLDER-HISTORY",
  "MUNICIPAL-HISTORY-DEPTH",
  "PARTY-CATEGORIES",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "32 regional offices (14 current county councils + 18 historical county councils). Oslo bystyre stays the municipal NO-M0301-C office; no separate Oslo fylkesting. 2027 municipal/county next dates sit outside the alert window as day-precision called metadata; Storting/Sámi 2029 stays year-expected. Named holds stay open. No popular mayor / prime-minister / cabinet or EP rows.";

export const COUNTRY_NOTES = [
  "Prompt AA full register: 389 current + 537 historical offices. Coverage partial.",
  "Oslo is one municipal electoral body with combined county functions; keep NO-M0301-C municipal. No NO-F03-C office.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open named holds: SAMI-2025-ZERO-VOTE-SEAT-98d; REFORM-2020-2024; OSLO-BOROUGH-HISTORY; LONGYEARBYEN-HISTORY; LEGAL-STATUS-REPEATS; COUNTY-AGGREGATES; SAMI-OLDER-HISTORY; MUNICIPAL-HISTORY-DEPTH; PARTY-CATEGORIES.",
  "No popular mayor / prime-minister / cabinet or EP rows. Do not invent merger successors, borough/Longyearbyen result histories, certified legal outcomes, or missing result scalars.",
  "Slim pack omits bulky primary-source bytes; sources.json remains the catalogue. Compact results.json is the same 59,033 rows as the pretty-print extract.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 389,
  historical_offices: 537,
  offices: 926,
  geographies: 926,
  selected_histories: 10777,
  other_histories: 0,
  prospective_events: 0,
  total_events: 10777,
  result_rows: 59033,
  result_rows_source_party_category: 59033,
  municipal_offices: 876,
  regional_offices: 32,
  national_offices: 1,
  other_offices: 17,
  approved_classifications: 371,
  needs_review_classifications: 555,
  sources: 82,
  catalogue_rows: 82,
  unresolved_evidence: 9,
  unresolved_research_gaps: 9,
  identity_crosswalks: 11760,
  retained_inputs: 11,
  research_dates: 11165,
  event_dates_day_called: 0,
  event_dates_year_called: 10777,
  next_dates_day_called: 386,
  next_dates_year_expected: 2,
  proceedings: 0,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
  named_holds: 9,
  oslo_county_offices: 0,
  oslo_borough_offices: 15,
  oslo_borough_events: 0,
  longyearbyen_result_rows: 0,
  ep_offices: 0,
  sami_2025_disputed: 1,
  reform_successors_asserted: 0,
} as const;

export type NorwayHashInputs = {
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

export function norwayEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  pointerOrLocator: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, pointerOrLocator], claimKind]))}`;
}

export function norwayUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): NorwayHashInputs {
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

export function fingerprintSha256(hashInputs: NorwayHashInputs): string {
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
  return /ordfører|statsminister|prime.?minister|\bcabinet\b|\bmayor\b|europaparlament|\b-EP\b/i.test(value) ||
    /(?:^|-)M$/.test(value);
}
