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

export const LINEAGE_ID = "country-package-croatia";
export const SOURCE_NAMESPACE = "country-package-croatia";
export const COUNTRY_ID = "croatia";
export const COUNTRY_CODE = "HR";
export const ADAPTER_VERSION = "atlas-croatia-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/croatia.json";
export const RESEARCH_PREFIX = "data/research/croatia";
export const REGISTER_RELATIVE = "data/research/croatia/office-register.json";
export const EVENTS_RELATIVE = "data/research/croatia/events.json.gz";
export const RESULTS_RELATIVE = "data/research/croatia/results.jsonl.gz";
export const GEOGRAPHY_RELATIVE = "data/research/croatia/geographies.json";
export const SOURCES_RELATIVE = "data/research/croatia/sources.json";
export const GAPS_RELATIVE = "data/research/croatia/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/croatia/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/croatia/proceedings.json";
export const REGISTER_SHA256 = "5c512cdedf3aa5c891c81929d090b45c3a4fa97298f4c1fdf90a9ef9081c7e36";
export const TIER_SHA256 = "2f5c00d677e1756ac3dd553295df5ef84b547bfe0927c1f3c1aa249c433b430a";
/** Predecessor draft tier digest from Prompt W. The approved file must not match it. */
export const DRAFT_TIER_SHA256 = "e5528335fbf28ccec62187574e4928e087cd53f56fa03e47e67f8c8dad58a48d";
/**
 * Documentary fingerprint of the full review pack (draft tiers plus omitted sources/).
 * The approved slim land does not contain those bytes.
 */
export const FULL_PACK_DOCUMENTARY_FINGERPRINT =
  "68badc579e88b5078d2dd00ff4e710acfe3727dfeaa8bf403e87fba7d02edf65";

/** Pinned after approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "20e54aaa3bc497e0f87d91f85c6b7fa6d7c647ec5c6a33777172c9f7c90ca51f";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const ZAGREB_COUNCIL_ID = "HR-Z21-C";
export const ZAGREB_EXECUTIVE_ID = "HR-Z21-E";
export const ZAGREB_GEOGRAPHY_ID = "HR-Z21";
export const ZAGREBACKA_COUNCIL_ID = "HR-Z01-C";
export const ZAGREBACKA_EXECUTIVE_ID = "HR-Z01-E";
export const FORBIDDEN_ZAGREB_DUPLICATE_IDS = ["HR-G1333-C", "HR-G1333-E"] as const;
export const DUGO_SELO_COUNCIL_ID = "HR-G1015-C";
export const DUGO_SELO_EXECUTIVE_ID = "HR-G1015-E";
export const DUGO_SELO_2017_HISTORY_KEY = "HR-G1015-C::lokalni:2017";
export const DUGO_SELO_2017_EVENT_ID = "event-53f773eb050bed2897634820";
export const DEPUTY_EXAMPLE_ID = "HR-G0051-D-04e76abb7f14";
export const HISTORICAL_DEPUTY_ID = "HR-G1384-D-64f24d618ef7";
export const SABOR_ID = "HR-SABOR";
export const PRESIDENT_ID = "HR-PRESIDENT";
export const EP_ID = "HR-EP";
export const EP_2013_HISTORY_KEY = "HR-EP::euparlament:2013::whole-body";
export const EP_2013_EVENT_ID = "event-7e3b75edc18e36ac1dd9ddc1";
export const STARI_GRAD_2017_HISTORY_KEY = "HR-G4138-E::lokalni:2017";
export const STARI_GRAD_THIRD_PROCEEDING_ID = "proceeding-7362c4486d03658e5f3b6d42";
export const TAR_VABRIGA_OFFICE_ID = "HR-G6319-D-04e76abb7f14";
export const TAR_VABRIGA_HISTORY_KEY = "HR-G6319-D-04e76abb7f14::lokalni:2025";
export const TAR_VABRIGA_EVENT_ID = "event-92192e60ef61ddd977e33cfb";
export const BISKUPIJA_DEPUTY_ID = "HR-G0515-D-64f24d618ef7";
export const BISKUPIJA_2017_HISTORY_KEY = "HR-G0515-D-64f24d618ef7::lokalni:2017";
export const RESULT_EXAMPLE_ID = "result-00000eb1923b571be56f5374";

export const ALLOWED_OFFICE_TYPES = [
  "council",
  "direct_executive",
  "direct_deputy",
  "parliament",
  "european_parliament_delegation",
] as const;

export const NAMED_HOLDS = [
  "CURRENT-ROSTER-VALIDITY",
  "ZAGREB-DUAL",
  "DEPUTY-ELIGIBILITY",
  "TERRITORIAL-REFORMS",
  "SPECIAL-AND-SUPPLEMENTARY",
  "MISSING-BISKUPIJA-2017",
  "TAR-VABRIGA-PLACEHOLDER",
  "SEATS-AND-LEGAL-FINALITY",
  "SABOR-MINORITY-BASIS",
  "PARTY-IDENTITY",
  "EP-DETAIL",
  "DATES-NEXT-CYCLES",
  "EXCLUDED-AUXILIARY",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "55 regional offices (21 county/Zagreb assemblies + 21 executive tickets + 13 independently elected county deputies). Zagreb stays one dual city/county pair (HR-Z21), separate from Zagrebačka županija (HR-Z01). ZAGREB-DUAL stays open. No second Zagreb body. Next dates stay unknown. Named holds stay open. No invented seat allocations or successor edges.";

export const COUNTRY_NOTES = [
  "Prompt W full register: 1,234 current + 11 historical offices. Coverage partial.",
  "Current scope is the captured DIP 2025 ordinary local/regional ballot register plus Sabor, President and EP.",
  "Zagreb is one dual city/county assembly/executive pair (HR-Z21), separate from Zagrebačka županija (HR-Z01). No HR-G1333 duplicate.",
  "Joint-ticket deputies stay inside the executive result. Independently elected deputies keep electorate-specific identities. Eleven historical deputy identities have no invented successors.",
  "Open named holds: CURRENT-ROSTER-VALIDITY; ZAGREB-DUAL; DEPUTY-ELIGIBILITY; TERRITORIAL-REFORMS; SPECIAL-AND-SUPPLEMENTARY; MISSING-BISKUPIJA-2017; TAR-VABRIGA-PLACEHOLDER; SEATS-AND-LEGAL-FINALITY; SABOR-MINORITY-BASIS; PARTY-IDENTITY; EP-DETAIL; DATES-NEXT-CYCLES; EXCLUDED-AUXILIARY.",
  "All typed seats and elected flags stay unknown. Tar-Vabriga 2025 is a placeholder with no typed result rows. Biskupija 2017 deputy return is missing and is not filled with zeros.",
  "Slim pack omits bulky primary-source bytes under sources/. events.json is read from events.json.gz only. results.jsonl.gz is the typed aggregate register.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 1234,
  historical_offices: 11,
  offices: 1245,
  geographies: 577,
  selected_histories: 3833,
  other_histories: 0,
  prospective_events: 0,
  placeholder_events: 1,
  total_events: 3834,
  result_rows: 15907,
  municipal_offices: 1187,
  regional_offices: 55,
  national_offices: 2,
  other_offices: 1,
  executive_tickets: 577,
  current_deputies: 79,
  historical_deputies: 11,
  assemblies: 576,
  approved_classifications: 1152,
  needs_review_classifications: 93,
  sources: 4367,
  unresolved_evidence: 13,
  identity_crosswalks: 3693,
  retained_inputs: 13,
  research_dates: 3834,
  event_dates_day_called: 3689,
  event_dates_year_called: 145,
  next_dates: 0,
  proceedings: 2418,
  proceedings_first_round: 1967,
  proceedings_runoff: 451,
  sequence_3_proceedings: 1,
  party_mappings: 0,
  successor_edges: 0,
  sabor_minority_events: 47,
  share_unknown_results: 1874,
  known_seats: 0,
  elected_flags: 0,
  zagreb_duplicate_offices: 0,
  tar_vabriga_results: 0,
  biskupija_2017_deputy_events: 0,
  named_holds: 13,
} as const;

export type CroatiaHashInputs = {
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

export function resultIdFor(
  officeId: string,
  hk: string,
  proceedingId: string | null,
  identityToken: string,
): string {
  return key("result", [OFFICE_NAMESPACE, officeId, hk, proceedingId, identityToken]);
}

export function croatiaEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  archiveEntry: unknown,
  locatorValue: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(
    canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, archiveEntry, locatorValue], claimKind]),
  )}`;
}

export function croatiaUnresolvedId(rec: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [GAPS_RELATIVE, originalToken], originalToken]))}`;
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
}): CroatiaHashInputs {
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

export function fingerprintSha256(hashInputs: CroatiaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function publisherFor(url: string | null | undefined): string | null {
  if (!url) return null;
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "izbori.hr" || host.endsWith(".izbori.hr")) {
    return "DIP (Državno izborno povjerenstvo Republike Hrvatske)";
  }
  if (host === "mpudt.gov.hr" || host.endsWith(".mpudt.gov.hr")) return "ministry";
  return host.replace(/^www\./, "");
}
