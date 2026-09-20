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

export const LINEAGE_ID = "country-package-netherlands";
export const SOURCE_NAMESPACE = "country-package-netherlands";
export const COUNTRY_ID = "netherlands";
export const COUNTRY_CODE = "NL";
export const ADAPTER_VERSION = "atlas-netherlands-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/netherlands.json";
export const RESEARCH_PREFIX = "data/research/netherlands";
export const REGISTER_RELATIVE = "data/research/netherlands/office-register.json";
export const EVENTS_RELATIVE = "data/research/netherlands/events.json";
export const RESULTS_RELATIVE = "data/research/netherlands/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/netherlands/geography.json";
export const UNRESOLVED_RELATIVE = "data/research/netherlands/unresolved-bindings.json";
export const SOURCES_RELATIVE = "data/research/netherlands/source-catalogue.json";
export const CATALOGUE_LOOKUP_PATH = "docs/phase1/netherlands/Netherlands_Input_Inventory.json";
export const REGISTER_SHA256 = "8fdcef170f27cc5c2eeda7d563ba7d7238d24833bb59b0278682b7c2590f6640";
export const TIER_SHA256 = "faaf7573c678887004bc1f36f00a8496294ae23db5569278280a45642f0631b7";
export const DRAFT_TIER_SHA256 = "81dc30e718355573cd15e3c93ff8f75364e4223612efab23cbd3393c5c94ea89";
export const DRAFT_FINGERPRINT = "63eb6c893dfd62029b9c2b400075a8beddde4675a454d4621743eaf930fb8e48";
export const DRAFT_RELEASE_ID =
  "country-package-netherlands--sha256-63eb6c893dfd62029b9c2b400075a8beddde4675a454d4621743eaf930fb8e48";

/** Slim landed pack + accepted tier. Documentary full-pack draft fingerprint is 63eb6c89… */
export const CANDIDATE_FINGERPRINT = "6df2851ea370d44d75aef06c3e3a8b5e1b7f3dcc94d3943786a91f2a9d1d6f54";
export const CANDIDATE_RELEASE_ID =
  "country-package-netherlands--sha256-6df2851ea370d44d75aef06c3e3a8b5e1b7f3dcc94d3943786a91f2a9d1d6f54";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-19";
export const MUNICIPAL_ROSTER_AS_OF = "2026-01-01";

export const AALSMEER_COUNCIL_ID = "NL-GM0358-C";
export const AALSMEER_GEOGRAPHY_ID = "NL-GM0358";
export const AALSMEER_COUNCIL_RECORD_KEY =
  "rec-fa82c7a80356ead7bf5c45b06a0505b775749942d8a33c8b5f3b21016fa8011f";
export const HISTORICAL_EXAMPLE_ID = "NL-GM0003-C";
export const HILVERSUM_ID = "NL-GM0402-C";
export const WIJDEMEREN_ID = "NL-GM1696-C";
export const LEEUWARDERADEEL_ID = "NL-GM0081-C";
export const LEEUWARDERADEEL_2014_HK = "NL-GM0081-C::2014::2014";
export const LEEUWARDERADEEL_RESULT_ID = "result-5e4d8227e9786375e493110f";
export const TK_ID = "NL-TK";
export const TK_2025_HK = "NL-TK::2025::2025-10-29";
export const EK_ID = "NL-EK";
export const EP_ID = "NL-EP";
export const GRONINGEN_PS_ID = "NL-PV20-PS";
export const BONAIRE_ER_ID = "NL-O9001-ER";
export const ZERO_SEAT_RESULT_ID = "result-13c6a7ec8040889ca64d91ee";
export const UNKNOWN_SEAT_RESULT_ID = "result-cbe842e437c2264f75c845d3";

export const REGIONAL_CALENDAR_LABEL =
  "12 regional offices (provincial states). Sourced 17 March 2027 next-date metadata is expected, not a prospective event. Hilversum/Wijdemeren merger successor binding, named historic gaps, and focused-tier reviews stay open. Appointed mayors have no election rows.";

export const COUNTRY_NOTES = [
  "Prompt T full register: 432 current + 69 historical offices. Coverage partial.",
  "Municipal roster as_of=2026-01-01 is a raw observation date, not a boundary-effective date.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open research: Hilversum/Wijdemeren 18 November 2026 merger successor binding; named historic gaps / partial coverage; ~147 focused-tier reviews; appointed mayors (no mayoral election rows).",
  "Bulky primary-source bytes remain omitted from the slim landed pack; do not invent those files.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 432,
  historical_offices: 69,
  offices: 501,
  geographies: 496,
  selected_histories: 1474,
  other_histories: 1,
  prospective_events: 0,
  total_events: 1475,
  result_rows: 13050,
  municipal_offices: 414,
  regional_offices: 12,
  national_offices: 3,
  other_offices: 72,
  approved_classifications: 354,
  needs_review_classifications: 147,
  sources: 77,
  catalogue_rows: 77,
  unresolved_evidence: 2,
  unresolved_merger_claims: 1,
  unresolved_collapsed_results: 1,
  retained_inputs: 6,
  research_dates: 1858,
  event_dates_day_called: 342,
  event_dates_year_called: 1133,
  next_dates_month_expected: 340,
  next_dates_day_expected: 43,
  proceedings: 0,
  party_mappings: 0,
  mayor_offices: 0,
  mayor_result_rows: 0,
  explicit_zero_seats: 4,
  missing_seats: 10308,
} as const;

export type NetherlandsHashInputs = {
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

export function netherlandsEvidenceId(
  rec: string,
  inputPath: string,
  locatorText: string,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, inputPath, locatorText, claimKind]))}`;
}

export function netherlandsUnresolvedId(
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
}): NetherlandsHashInputs {
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

export function fingerprintSha256(hashInputs: NetherlandsHashInputs): string {
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
