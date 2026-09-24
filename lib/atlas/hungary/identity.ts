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

export const LINEAGE_ID = "country-package-hungary";
export const SOURCE_NAMESPACE = "country-package-hungary";
export const COUNTRY_ID = "hungary";
export const COUNTRY_CODE = "HU";
export const ADAPTER_VERSION = "atlas-hungary-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/hungary.json";
export const RESEARCH_PREFIX = "data/research/hungary";
export const REGISTER_RELATIVE = "data/research/hungary/office-register.json";
export const EVENTS_RELATIVE = "data/research/hungary/events.json";
export const GEOGRAPHY_RELATIVE = "data/research/hungary/geography.json";
export const SOURCES_RELATIVE = "data/research/hungary/sources.json";
export const PROCEEDINGS_RELATIVE = "data/research/hungary/proceedings.json";
export const PARTY_MAPPINGS_RELATIVE = "data/research/hungary/party-mappings.json";
export const COUNTRY_RELATIVE = "data/research/hungary/country.json";
export const COUNTS_RELATIVE = "data/research/hungary/counts.json";
export const GAPS_RELATIVE = "data/research/hungary/research-gaps.json";
export const CYCLE_GAPS_RELATIVE = "data/research/hungary/office-cycle-gaps.json";
export const UNRESOLVED_RELATIVE = "data/research/hungary/unresolved-evidence.json";
export const SUCCESSOR_RELATIVE = "data/research/hungary/successor-crosswalk.json";
/** Omitted from the slim land. Do not invent these bytes or the 101,526 result rows. */
export const OMITTED_RESULTS_RELATIVE = "data/research/hungary/results.json";
/** Omitted from the slim land. Do not invent identity-crosswalk rows. */
export const OMITTED_CROSSWALK_RELATIVE = "data/research/hungary/identity-crosswalk.json";
export const REGISTER_SHA256 = "0f1dfb71e5ad0cdf11db61ac7f8152c998034928bb939e9f7254af639bb973eb";
export const TIER_SHA256 = "3be45f777e8c3c5bcbd02825a18f4cd327c2b31478753b6863de48799dcec9cd";
/** Predecessor draft tier digest recorded inside the landed file. The approved bytes must not match it. */
export const DRAFT_TIER_SHA256 = "fbd68787b8e89f9373c9da19415f1f153609933a37675396afccd8ebdbb3384a";
/**
 * Documentary fingerprint from Prompt AK identity rules (full review pack, including omitted
 * results.json). Not the slim approved import.
 */
export const DOCUMENTARY_DRAFT_FINGERPRINT = "2cb9841dd136b34e21ac1a1373713920cbbd82a60246c55832f9e8e481987ecc";

/** Pinned after the approved-tier slim-pack inventory scan. Results and raw sources/ are not in the hash. */
export const CANDIDATE_FINGERPRINT = "754a6dc3f8ff5cf022a261b394453387a8d5b2feb3ee312ac4234a3013c1ef85";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";

export const PRESIDENT_ID = "HU-PRES";
export const PARLIAMENT_ID = "HU-OGY";
export const EP_ID = "HU-EP";
export const BUDAPEST_ASSEMBLY_ID = "HU-BUDAPEST-A";
export const BUDAPEST_MAYOR_ID = "HU-BUDAPEST-M";
export const PRESIDENT_2017_HK = "HU-PRES::PRES2017";
export const PRESIDENT_2017_EVENT_ID = "event-ea26e1c6720d7c28165ec0cb";
export const PRESIDENT_2022_HK = "HU-PRES::PRES2022";
export const PRESIDENT_2022_EVENT_ID = "event-e85e12dca4661bef0c30c292";
export const PRESIDENT_2024_HK = "HU-PRES::PRES2024";
export const PRESIDENT_2024_EVENT_ID = "event-6338fecede2a1ff470eee046";
export const PARLIAMENT_2022_HK = "HU-OGY::OGY2022";
export const PARLIAMENT_2022_EVENT_ID = "event-30137c07b5dc119a7c653e3f";
export const BUDAPEST_2014_HK = "HU-BUDAPEST-A::ONK2014";
export const MIXED_2014_ELECTORAL_SYSTEM = "mixed_district_mayors_and_compensation_list_2014";

export const RETURN_GAP_OFFICE_IDS = ["HU-NVI-18-012-C", "HU-NVI-18-012-M", "HU-NVI-20-160-C"] as const;
export const NEEDS_REVIEW_OFFICE_IDS = [BUDAPEST_ASSEMBLY_ID, BUDAPEST_MAYOR_ID, EP_ID] as const;

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "direct_mayor",
  "county_assembly",
  "capital_assembly",
  "direct_capital_mayor",
  "national_assembly",
  "indirect_president",
  "ep_delegation",
] as const;

export const DIRECT_EXECUTIVE_TYPES = new Set<string>(["direct_mayor", "direct_capital_mayor"]);
export const COUNCIL_ASSEMBLY_TYPES = new Set<string>([
  "municipal_council",
  "county_assembly",
  "capital_assembly",
  "national_assembly",
]);

export const NAMED_HOLDS = [
  {
    token: "HU-CURRENT-LEGAL-REGISTER",
    status: "open",
    reason:
      "NVI2024 territorial codes and the January 2026 roster reconcile 3177 jurisdictions. Later legal/KSH audit stays open. Electoral rosters are not a founding or abolition register.",
  },
  {
    token: "HU-HISTORICAL-REFORMS",
    status: "open",
    reason:
      "Zero historical-only offices recovered is not proof that no abolished bodies existed. No successor edges are guessed.",
  },
  {
    token: "HU-2019-ARCHIVE",
    status: "open",
    reason: "2019 local/EP and 2018 parliamentary contests were not acquired. No synthetic 2019 cycle is attached.",
  },
  {
    token: "HU-SPECIAL-REPEAT",
    status: "open",
    reason: "By-elections, repeats, ties, and no-candidate polls stay incomplete. No zero result is invented.",
  },
  {
    token: "HU-BUDAPEST",
    status: "pending_Justin",
    reason:
      "Capital assembly stays regional and the capital mayor stays municipal, both needs_review. Recount chronology stays open.",
  },
  {
    token: "HU-PRESIDENT",
    status: "open",
    reason:
      "HU-PRES stays indirect_president. Vote totals, opponents, and rounds are not supplied. No popular presidential ballot is invented.",
  },
  {
    token: "HU-NATIONAL-COMPONENTS",
    status: "open",
    reason: "2026 nationality, compensation, and seat components stay unsummarized. No synthetic totals are invented.",
  },
  {
    token: "HU-EP",
    status: "pending_Justin",
    reason: "EP delegation stays other/needs_review. Domestic subsets are not a complete national allocation.",
  },
  {
    token: "HU-NATIONALITY-SELF-GOVERNMENT",
    status: "open",
    reason: "Nationality self-governments stay outside the ordinary territorial register. No extra councils are added.",
  },
  {
    token: "HU-MUNICIPAL-SEATS",
    status: "open",
    reason: "2024 seat allocations absent from the selected tables stay NULL. Missing results are not zeros.",
  },
  {
    token: "HU-CHAIRS-JARAS",
    status: "documented_exclusion",
    reason:
      "Documented exclusion: no direct county chair and no standalone járás council. This hold stays open as an exclusion, not a body to invent.",
  },
  {
    token: "HU-UPCOMING",
    status: "open",
    reason: "Next dates stay NULL. A five-year term does not invent a 2029 polling day. The alert window does not drop offices.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "20 regional offices (19 county assemblies + one Budapest capital assembly). Budapest assembly tier stays needs_review. Direct county chairs and járás councils are excluded (HU-CHAIRS-JARAS). Named holds stay open. No PM, cabinet, or popular presidential ballot. Slim land omits results.json; 101,526 documented rows are not invented. Bozsok and Pakod 2024 return gaps stay open.";

export const COUNTRY_NOTES = [
  "Prompt AK full register: 6,378 current + 0 historical offices. Coverage partial.",
  "3,178 direct mayors (3,177 municipal/district + Budapest capital mayor) and 3,198 councils/assemblies.",
  "President HU-PRES stays indirect_president / indirect_parliamentary. No popular presidential ballot.",
  "No PM, cabinet, direct county chair, or járás council is invented.",
  "Named holds stay open: HU-CURRENT-LEGAL-REGISTER; HU-HISTORICAL-REFORMS; HU-2019-ARCHIVE; HU-SPECIAL-REPEAT; HU-BUDAPEST; HU-PRESIDENT; HU-NATIONAL-COMPONENTS; HU-EP; HU-NATIONALITY-SELF-GOVERNMENT; HU-MUNICIPAL-SEATS; HU-CHAIRS-JARAS; HU-UPCOMING.",
  "Bozsok council/mayor and Pakod council have no 2024 event or numeric return. Offices stay. No zero is invented.",
  "Alert window (~18 months) filters upcoming alerts only. Next dates are NULL and are not prospective events.",
  "Slim pack omits results.json (101,526 rows), identity-crosswalk.json, sources/, and unpacked/. Those bytes are not invented. sources.json remains the catalogue.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 6378,
  historical_offices: 0,
  offices: 6378,
  geographies: 3198,
  selected_histories: 12753,
  other_histories: 0,
  prospective_events: 0,
  total_events: 12753,
  result_rows: 0,
  documented_result_rows_omitted: 101526,
  municipal_offices: 6355,
  regional_offices: 20,
  national_offices: 2,
  other_offices: 1,
  municipal_councils: 3177,
  direct_mayors: 3177,
  direct_capital_mayors: 1,
  county_assemblies: 19,
  capital_assemblies: 1,
  national_assemblies: 1,
  indirect_presidents: 1,
  ep_delegations: 1,
  current_direct_executive_offices: 3178,
  council_assembly_offices: 3198,
  approved_classifications: 6375,
  needs_review_classifications: 3,
  sources: 3335,
  blocked_sources: 7,
  unresolved_evidence: 16,
  named_holds: 12,
  return_gaps: 3,
  identity_crosswalks: 0,
  retained_inputs: 19,
  research_dates: 12753,
  proceedings: 0,
  party_mappings: 0,
  successor_edges: 0,
  president_indirect_events: 3,
  events_onk2014: 6375,
  events_onk2024: 6372,
  unknown_legal_outcomes: 6375,
  evidence_links: 28684,
} as const;

export type HungaryHashInputs = {
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

export function hungaryEvidenceId(
  rec: string,
  sourceId: string,
  occurrence: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], occurrence, claimKind]))}`;
}

export function hungaryUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [sourceLocator], originalToken]))}`;
}

export function returnGapToken(officeId: string): string {
  return `HU-ONK2024-RETURN-GAP:${officeId}`;
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
}): HungaryHashInputs {
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

export function fingerprintSha256(hashInputs: HungaryHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function isOmittedBulkPath(inputPath: string): boolean {
  return (
    inputPath === OMITTED_RESULTS_RELATIVE ||
    inputPath === OMITTED_CROSSWALK_RELATIVE ||
    inputPath.startsWith(`${RESEARCH_PREFIX}/sources/`) ||
    inputPath.startsWith(`${RESEARCH_PREFIX}/unpacked/`)
  );
}

export function isForbiddenInventedOffice(officeId: string, officeType: string, officeName: string): boolean {
  const blob = `${officeId} ${officeType} ${officeName}`;
  if (/járás|jaras/i.test(blob)) return true;
  if (/miniszterelnök|prime minister|\bcabinet\b|kabinet/i.test(blob)) return true;
  if (/county chair|megyei elnök|közgyűlés elnök/i.test(blob)) return true;
  if (/president|elnök/i.test(officeType) && officeType !== "indirect_president") return true;
  return false;
}
