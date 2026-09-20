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

export const LINEAGE_ID = "country-package-switzerland";
export const SOURCE_NAMESPACE = "country-package-switzerland";
export const COUNTRY_ID = "switzerland";
export const COUNTRY_CODE = "CH";
export const ADAPTER_VERSION = "atlas-switzerland-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/switzerland.json";
export const RESEARCH_PREFIX = "data/research/switzerland";
export const REGISTER_RELATIVE = "data/research/switzerland/office-register.json";
export const EVENTS_RELATIVE = "data/research/switzerland/events.json";
export const RESULTS_RELATIVE = "data/research/switzerland/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/switzerland/geographies.json";
export const PROCEEDINGS_RELATIVE = "data/research/switzerland/proceedings.json";
export const SOURCES_RELATIVE = "data/research/switzerland/sources.json";
export const UNRESOLVED_RELATIVE = "data/research/switzerland/unresolved-evidence.json";
export const AUDIT_RELATIVE = "data/research/switzerland/commune-coverage-audit.json";
export const CONFLICTS_RELATIVE = "data/research/switzerland/conflicting-claims.json";
export const REGISTER_SHA256 = "f575711d0149660ad7b72e661d65ed9658f4bddf29045f804ef50188b34d0987";
export const TIER_SHA256 = "d1ebccfd1633aacd9b70732dcfe1f3e01df9549076d4b71efce38d436a2749f1";
export const DRAFT_TIER_SHA256 = "0cddfca20fab058ed9f1a712515fdfd1725abda7a2e5a1b7903087135893d4bf";
export const DRAFT_FINGERPRINT = "24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6";
export const DRAFT_RELEASE_ID =
  "country-package-switzerland--sha256-24a99825316890d8cba0e5b1bf7e76f5072002b1c0811ebbeaa67f2a7d4c9ff6";

/** Pinned after approved-tier slim-pack inventory scan. Draft-tier fingerprint is 24a99825… */
export const CANDIDATE_FINGERPRINT = "f262322076bc1d2a70373b9b9b30b61695a02ec9c0b8ae84d3f0c8a3da20f812";
export const CANDIDATE_RELEASE_ID =
  "country-package-switzerland--sha256-f262322076bc1d2a70373b9b9b30b61695a02ec9c0b8ae84d3f0c8a3da20f812";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-19";
export const GEOGRAPHY_SNAPSHOT_LABEL = "2026-01-01";

export const NATIONAL_COUNCIL_ID = "CH-FED-NR";
export const COUNCIL_OF_STATES_ID = "CH-FED-SR";
export const NATIONAL_COUNCIL_2023_HK = "CH-FED-NR::2023::CH";
export const NATIONAL_COUNCIL_2023_EVENT_ID = "event-4a7a2fc2e2099d1cc331005c";
export const TICINO_PARLIAMENT_ID = "CH-CT-TI-L";
export const BELLINZONA_EXECUTIVE_ID = "CH-GM5002-E";
export const BELLINZONA_GEOGRAPHY_ID = "CH-GM5002";
export const HISTORICAL_HORGEN_ID = "CH-GM0133-E";
export const HELD_SZ_GAP_GEOGRAPHY_ID = "CH-GM1311";
export const HELD_SZ_GAP_OFFICE_ID = "CH-GM1311-E";
export const HELD_VD_GAP_GEOGRAPHY_ID = "CH-GM5402";
export const HELD_VD_GAP_OFFICE_ID = "CH-GM5402-E";
export const DISPUTED_RESULT_ID = "result-7bcfc043cbc0f8f59edfa119";
export const ZERO_SEAT_RESULT_ID = "result-007577c428b9fb2b9558511e";
export const UNKNOWN_SEAT_RESULT_ID = "result-004f56e0aaebcc414600ae69";
export const NATIONAL_COUNCIL_RECORD_KEY =
  "rec-d28ff9386d1374fcb182d93f78d74bf6ec7ae49c0a343aef27746166657389f4";
export const COUNTRY_RECORD_KEY = "rec-df3ec522b83172abde8c6b88acba10bd4ec023597108b056337c829bccbd5ae5";
export const HISTORICAL_HORGEN_RECORD_KEY =
  "rec-ab2262c8cdde06b840a3b710da3ed226448c4a362a68f39ecb174877a698c901";

export const REGIONAL_CALENDAR_LABEL =
  "52 regional offices (26 cantonal legislatures + 26 cantonal executives). Historic cantonal depth is not a forthcoming alert. 308 commune-executive gaps, thin historic/merger archive, 1,938 citizen-assembly parliament caveats, and disputed-result notes stay open. Do not invent held commune executives.";

export const COUNTRY_NOTES = [
  "Prompt U evidenced subset: 2,805 current + 11 historical offices. Coverage partial. Full-register certification remains OPEN.",
  "BFS current geography snapshot is 2026-01-01; 2,110 communes/equivalent units are not 2,110 elected parliaments.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "HOLD: 308 communes without executive-body evidence (VD 284, SZ 24); thin historic/merger archive (586 historical geographies vs 11 historical offices); 1,938 communes without positive elected-parliament evidence (citizen-assembly caveat); 16 disputed result rows.",
  "Do not invent the 308 missing commune executives or fabricate merger histories. Slim pack omitted bulky primary-source bytes; do not invent those files.",
  "See data/research/switzerland/commune-coverage-audit.json.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 2805,
  historical_offices: 11,
  offices: 2816,
  geographies: 2723,
  selected_histories: 1196,
  other_histories: 247,
  prospective_events: 0,
  total_events: 1443,
  result_rows: 8094,
  disputed_result_rows: 16,
  municipal_offices: 2402,
  regional_offices: 52,
  national_offices: 2,
  other_offices: 360,
  approved_classifications: 2816,
  needs_review_classifications: 0,
  /** Accepted-tier `human_review_required` count (910 office-register flags + 4 historical legislatures). */
  focused_review_flags: 914,
  sources: 57,
  proceedings: 136,
  party_mappings: 0,
  unresolved_evidence: 1938,
  held_commune_executive_gaps: 308,
  held_commune_executive_gaps_vd: 284,
  held_commune_executive_gaps_sz: 24,
  held_historical_geographies: 586,
  held_parliament_caveats: 1938,
  current_communal_executives: 1801,
  retained_inputs: 12,
  research_dates: 1448,
  event_dates_year_called: 1443,
  next_dates_month_expected: 5,
} as const;

export type SwitzerlandHashInputs = {
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
  return key("proceeding", [OFFICE_NAMESPACE, officeId, hk, sequenceNo]);
}

export function sourceIdForUrl(url: string): string {
  return `${COUNTRY_ID}--${key("url", url)}`;
}

export function switzerlandEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  locatorValue: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(
    canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, locatorValue], claimKind]),
  )}`;
}

export function switzerlandUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): SwitzerlandHashInputs {
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

export function fingerprintSha256(hashInputs: SwitzerlandHashInputs): string {
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
