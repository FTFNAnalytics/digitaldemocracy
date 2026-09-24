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
  dateId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

export const LINEAGE_ID = "country-package-romania";
export const SOURCE_NAMESPACE = "country-package-romania";
export const COUNTRY_ID = "romania";
export const COUNTRY_CODE = "RO";
export const ADAPTER_VERSION = "atlas-romania-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/romania.json";
export const RESEARCH_PREFIX = "data/research/romania";
export const REGISTER_RELATIVE = "data/research/romania/office-register.json";
export const EVENTS_RELATIVE = "data/research/romania/events.json.gz";
export const RESULTS_RELATIVE = "data/research/romania/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/romania/geographies.json";
export const SOURCES_RELATIVE = "data/research/romania/sources.json";
export const GAPS_RELATIVE = "data/research/romania/research-gaps.json";
export const SIRUTA_RELATIVE = "data/research/romania/siruta_s1_2025.csv";
export const SOURCES_NOTE_RELATIVE = "data/research/romania/SOURCES_NOTE.md";
/** Uncompressed events.json is not in the slim land. Do not invent that twin. */
export const OMITTED_EVENTS_JSON = "data/research/romania/events.json";

export const REGISTER_SHA256 = "7e37135581523739beb5c0f69027ae173f6916484ee53df65acc70320a190f05";
export const EVENTS_SHA256 = "bc7f7284e8abbc844cff5a53caa4766e26b71e812339b0d4b7714983775c2344";
export const RESULTS_SHA256 = "3076ca44ca50274dd6cbdcdcf5dbd8fc4dd1e7ca7b8914950d9bf4615b08ece1";
export const GEOGRAPHY_SHA256 = "3150e9740fc101dd3fb5b5be338c5b7a226fecad837a6cdc9320856ff189583c";
export const SOURCES_SHA256 = "ab3208c39c269fbaa8ba0aa2071d56fc666d6d012f13a560f734d679f1f026e1";
export const GAPS_SHA256 = "232ce1f4ead67e25b8c6e6ef33cd9a7c2e95caaaa5cf6254e8707ba331ea69df";
export const SIRUTA_SHA256 = "757fc7e5d228acad8a9abe99dfa522f30f476562dc1fa92af734a315d554ae02";
export const TIER_SHA256 = "0562adb8ceffe495ab8ceeedbecf2d729a5f54b5f65cb73e6334bf004cd6af04";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into the fingerprint. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "eb64c80668c2f079f33bbfeee765aa63948143f4d273371caa3e35a52ee005ce";
export const REVIEW_ZIP_SHA256 = "4a60f260c4f63102fc7d156ad7038dcc62282839554597aa58ea5ca33706c7bf";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Filled once the scanner is run; tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "6f791ae25a838d7d24a3a660d6e60b38192353c619d44b8c0367e181528376a9";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "România";

export const PRESIDENT_ID = "RO-PRES";
export const CHAMBER_ID = "RO-CD";
export const SENATE_ID = "RO-SEN";
export const EP_ID = "RO-EP";
export const BUCHAREST_COUNCIL_ID = "RO-B-GC";
export const BUCHAREST_MAYOR_ID = "RO-B-GM";
export const SECTOR1_COUNCIL_ID = "RO-B-S1-C";
export const ALBA_COUNCIL_ID = "RO-J-01-C";
export const ALBA_PRESIDENT_ID = "RO-J-01-P";
export const ANNULLED_EVENT_ID = "RO-PRES-2024-R1";
export const PRESIDENT_2025_RUNOFF_EVENT_ID = "RO-PRES-2025-R2";
export const EP_2024_EVENT_ID = "RO-EP-2024";
export const SENATE_2024_EVENT_ID = "RO-SEN-2024";
export const CHAMBER_2024_EVENT_ID = "RO-CD-2024";
export const ZERO_SEAT_RESULT_ID = "RO-EP-2024-0021";
export const PRESIDENT_2025_WINNER_RESULT_ID = "RO-PRES-2025-R2-0022";

export const RESULT_EVENT_IDS = [
  SENATE_2024_EVENT_ID,
  CHAMBER_2024_EVENT_ID,
  EP_2024_EVENT_ID,
  PRESIDENT_2025_RUNOFF_EVENT_ID,
] as const;

export const DIRECT_EXECUTIVE_TYPES = [
  "mayor",
  "county_president",
  "sector_mayor",
  "bucharest_general_mayor",
  "president",
] as const;

export const COUNCIL_ASSEMBLY_TYPES = [
  "local_council",
  "county_council",
  "sector_council",
  "bucharest_general_council",
  "national_chamber",
] as const;

export const NAMED_HOLDS = [
  {
    token: "RO-G01",
    topic: "local-results",
    reason:
      "Project complete official AEP/BEC 2016, 2020 and 2024 candidate/list result vectors for every council and mayor; absence here is unknown, never zero.",
  },
  {
    token: "RO-G02",
    topic: "president",
    reason:
      "Project complete first-round and runoff vectors for 2014, 2019 and 2025; retain the 2024 annulled round without a guessed successor edge.",
  },
  {
    token: "RO-G03",
    topic: "county-presidents",
    reason:
      "Pin consolidated legal articles and official 2020/2024 returns; 2016 was council investiture and is not a popular-election event.",
  },
  {
    token: "RO-G04",
    topic: "Bucharest-sectors",
    reason: "Reconcile sector electoral-circumscription identifiers across cycles; do not create neighbourhood boards.",
  },
  {
    token: "RO-G05",
    topic: "EP",
    reason:
      "Project full 2014 and 2019 official party vectors and exact national seat allocations; 2024 official aggregate is included.",
  },
  {
    token: "RO-G06",
    topic: "territorial-history",
    reason: "Name and source municipal splits/mergers/status changes; no successor or merger edges are asserted by this pack.",
  },
  {
    token: "RO-G07",
    topic: "parliament",
    reason:
      "Project full 2016/2020 results and minority-seat/circumscription detail; 2024 top seven national vote rows are a limited transcription.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "84 regional offices (41 județ councils, 41 county presidents, Bucharest General Council, and the Bucharest general mayor). Six sector councils and mayors stay municipal. Named holds RO-G01–RO-G07 stay open. No prefect, prime minister, cabinet, neighbourhood board, or guessed merger edge. 2016 county-president investiture is not a popular event. The 2024 presidential first round stays annulled with no successor edge.";

export const COUNTRY_NOTES = [
  "Prompt AL full register: 6460 current offices and 0 historical-only offices. Coverage partial.",
  "Current scope is 3180 ordinary local UAT council/mayor pairs, 41 județ councils, 41 county presidents, Bucharest General Council, the Bucharest general mayor, six sector council/mayor pairs, Camera Deputaților, Senat, the popularly elected president, and the Romania EP delegation.",
  "Councils/assemblies: 3230. Direct executives: 3229. Draft tiers stay needs_review on every classification: 6372 municipal / 84 regional / 3 national / 1 other.",
  "19343 events and 23 national/EP result rows. Local result vectors stay absent. Missing results stay gaps, not zeros.",
  "County presidents are marked direct for current law. 2016 was council investiture and has no popular-election event.",
  "RO-PRES-2024-R1 stays annulled. No successor edge to the 2025 rerun. Rounds stay separate events. No proceeding supersession is invented.",
  "RO-EP stays other with direct_election false as supplied. The explicit 0-seat Other parties row is retained.",
  "Alert window (~18 months) filters alerts only. No next-date rows and no prospective events.",
  "Open named holds: RO-G01; RO-G02; RO-G03; RO-G04; RO-G05; RO-G06; RO-G07.",
  "events.json is carried as events.json.gz only. The uncompressed twin is not invented.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 6460,
  historical_offices: 0,
  offices: 6460,
  geographies: 3229,
  selected_histories: 19343,
  prospective_events: 0,
  total_events: 19343,
  result_rows: 23,
  municipal_offices: 6372,
  regional_offices: 84,
  national_offices: 3,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 6460,
  sources: 6,
  unresolved_evidence: 7,
  named_holds: 7,
  proceedings: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  retained_inputs: 9,
  research_dates: 19343,
  direct_executive_offices: 3229,
  council_assembly_offices: 3230,
  judet_councils: 41,
  judet_presidents: 41,
  bucharest_general_bodies: 2,
  ordinary_local_uats: 3180,
  bucharest_sector_geographies: 6,
  local_council_offices_excluding_general_council: 3186,
  local_mayor_offices_excluding_general_mayor: 3186,
  annulled_events: 1,
  county_president_2016_events: 0,
  explicit_zero_seat_rows: 1,
  evidence_links: 32286,
  successor_edges: 0,
} as const;

export type RomaniaHashInputs = {
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

export function romaniaEvidenceId(rec: string, sourceId: string, occurrence: unknown, claimKind: string): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], occurrence, claimKind]))}`;
}

export function romaniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, occurrence, originalToken]))}`;
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
}): RomaniaHashInputs {
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

export function fingerprintSha256(hashInputs: RomaniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
