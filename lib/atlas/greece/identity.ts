import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  SCHEMA_VERSION,
  canonical,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

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

/** Research namespace carried on every Greece office, event, proceeding, and result row. */
export const OFFICE_NAMESPACE = "greece-ypes-research-v2";
export const LINEAGE_ID = "country-package-greece";
export const SOURCE_NAMESPACE = "country-package-greece";
export const COUNTRY_ID = "greece";
export const COUNTRY_CODE = "GR";
export const ADAPTER_VERSION = "atlas-greece-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/greece.json";
export const RESEARCH_PREFIX = "data/research/greece";
export const REGISTER_RELATIVE = "data/research/greece/office-register.json";
export const EVENTS_RELATIVE = "data/research/greece/events.json";
export const PROCEEDINGS_RELATIVE = "data/research/greece/proceedings.json";
export const RESULTS_RELATIVE = "data/research/greece/results.jsonl.gz";
export const BALLOT_OBSERVATIONS_RELATIVE = "data/research/greece/ballot-observations.jsonl.gz";
export const GEOGRAPHY_RELATIVE = "data/research/greece/geographies.json";
export const GAPS_RELATIVE = "data/research/greece/research-gaps.json";
export const SOURCE_HOLDS_RELATIVE = "data/research/greece/source-holds.json";
export const CROSSWALK_RELATIVE = "data/research/greece/identity-crosswalk.json";
export const EP_OUTGOING_RELATIVE = "data/research/greece/EP-outgoing-snapshot-NOT-election-results.json";
/** Full-pack source bytes are not in the slim land. Do not invent that directory. */
export const OMITTED_SOURCES_DIR = "data/research/greece/sources";

export const REGISTER_SHA256 = "b5c563a5e3f616f210836304258f82cadfa27cdfcdebe46fb8752fa85a769da0";
export const EVENTS_SHA256 = "1a0852f11bcdc588ac3a43465f667a37e35ddbbf908958c34a3c4bec44a9cd0c";
export const PROCEEDINGS_SHA256 = "cfc76302a0b8005fbf61043aaaca0d1bd57e568623c236df7e8dfaaffc776803";
export const RESULTS_SHA256 = "beb9e9faee14384fb6465a255654bc2e3122cb90f569f0b51aae59491215d456";
export const BALLOT_OBSERVATIONS_SHA256 = "a8212b6b298a03d62342bc2e0cc051e56d212fa58dc49d544986e688411b3728";
export const GEOGRAPHY_SHA256 = "7c19cdfb3e6faeaac453b61cf502e065ae09f6e3ba8c9b3088899a2a9f6177a9";
export const GAPS_SHA256 = "9843b5072f229fd1d224c03f3bfebffd49aaf1fbeed85a61f03d1919bf289f3d";
export const SOURCE_HOLDS_SHA256 = "9d2f3452d92266cc5a51c3383fa059dbe80a8e34561d344503c2ad50b86f4331";
export const CROSSWALK_SHA256 = "dd027b1cb838d5ec1961eb926fe0ef3d4f34944c287e5a0c890a48d1789c0507";
export const EP_OUTGOING_SHA256 = "68dce35f671b8b0f4454b80a9aa5940a18c8b254916d55ad6f1921448000d812";
export const TIER_SHA256 = "97c2587226c8e7cb1bf50233e6ff23844eeda52437a6e852efb41266dd3c88b6";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into the fingerprint. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "57f425425b5bbb646df5dee39a04789e6aa4ed8501c7033867b2327f1aee6c59";
export const REVIEW_ZIP_SHA256 = "356ca5f15f68939eb0acacfc5a9817cba35d03e489ecbd3673069cfc136713eb";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "cd6102c446ca8899fc84849521d6c706bcc85c640c05861458ac709c4edec436";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "Ελλάδα";

export const PRESIDENT_ID = "GR-PRES";
export const PARLIAMENT_ID = "GR-PARL";
export const EP_ID = "GR-EP";
export const MESSINI_COUNCIL_ID = "GR-M-9255-C";
export const MESSINI_MAYOR_ID = "GR-M-9255-M";
export const MESSINI_HISTORY_KEY = "2014-local";
export const EP_1981_HISTORY_KEY = "1981";

export const DIRECT_EXECUTIVE_TYPES = ["mayor", "regional_governor"] as const;
export const COUNCIL_TYPES = ["municipal_council", "regional_council", "parliament"] as const;
export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "mayor",
  "regional_council",
  "regional_governor",
  "parliament",
  "president",
  "european_parliament",
] as const;

export const NAMED_HOLDS = [
  { token: "GR-G01", topic: "presidential_indirect_election", status: "open" },
  { token: "GR-G02", topic: "regional_governors_and_councils", status: "open" },
  { token: "GR-G03", topic: "mayoral_direct_election", status: "open" },
  { token: "GR-G04", topic: "Kallikratis_Kleisthenis_succession", status: "partially_resolved" },
  { token: "GR-G05", topic: "earlier_parliamentary_vote_vectors", status: "open" },
  { token: "GR-G06", topic: "European_Parliament", status: "open" },
  { token: "GR-G07", topic: "source_finality", status: "open" },
  { token: "GR-G08", topic: "pre_2010_municipal_history", status: "open" },
  { token: "GR-G09", topic: "party_and_person_identity", status: "review_required" },
  { token: "GR-G10", topic: "retrieval_and_original_bytes", status: "open" },
] as const;

export const LOCAL_SOURCE_HOLD_AUTHORITIES = [
  "2014::dhm_d::9255",
  "2019::snom_n::1",
  "2019::snom_n::2",
  "2019::snom_n::3",
  "2019::snom_n::4",
  "2019::snom_n::5",
  "2019::snom_n::6",
  "2019::snom_n::7",
  "2019::snom_n::8",
  "2019::snom_n::9",
  "2019::snom_n::10",
  "2019::snom_n::11",
  "2019::snom_n::12",
  "2019::snom_n::13",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "26 regional offices (13 regional councils and 13 regional governors). Named holds GR-G01–GR-G10 stay open, including GR-G04 partially_resolved with no Kallikratis or Kleisthenis successor edges. 14 local source holds stay open (Messini 2014 tied runoff and 13 regional 2019 station snapshots). No PM, cabinet, or prefect rows. President GR-PRES stays parliamentary indirect.";

export const COUNTRY_NOTES = [
  "Prompt AM Rebuilt: 693 current offices and 10 historical offices. Coverage partial.",
  "Current scope is 332 municipal councils, 332 direct mayors, 13 regional councils, 13 direct governors, Parliament, the indirect presidency, and one Greek EP delegation.",
  "Current direct executives: 345. Historical direct executives: 5. Draft tiers stay needs_review on every classification: 674 municipal / 26 regional / 2 national / 1 other.",
  "2774 events, 3555 proceedings, and 14004 result rows projected from 8021 distinct observations. Missing results stay gaps, not zeros.",
  "GR-PRES stays parliamentary_indirect. No popular presidential ballot is invented.",
  "Five abolished municipalities stay historical council/mayor pairs. No Kallikratis or Kleisthenis successor edges.",
  "GR-G04 stays partially_resolved as supplied and is not closed. GR-G09 stays review_required. Named holds GR-G01–GR-G10 and 14 local source holds stay unresolved.",
  "Slim land omits sources/ (2807 hashed artifacts). Source rows are not invented from source_id strings.",
  "The 1979–1984 EP outgoing snapshot is retained and is not an election result.",
  "Alert window (~18 months) filters alerts only. No next-date rows and no prospective events.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 693,
  historical_offices: 10,
  offices: 703,
  geographies: 351,
  selected_histories: 2774,
  prospective_events: 0,
  total_events: 2774,
  proceedings: 3555,
  result_rows: 14004,
  distinct_observations: 8021,
  municipal_offices: 674,
  regional_offices: 26,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 703,
  sources: 0,
  unresolved_evidence: 24,
  named_holds: 10,
  local_source_holds: 14,
  party_mappings: 0,
  identity_crosswalks: 703,
  successor_edges: 0,
  retained_inputs: 19,
  research_dates: 6329,
  current_direct_executive_offices: 345,
  historical_direct_executive_offices: 5,
  direct_executive_offices: 350,
  current_municipal_councils: 332,
  current_mayors: 332,
  current_regional_councils: 13,
  current_governors: 13,
  current_councils_plus_parliament: 346,
  historical_councils: 5,
  evidence_links: 0,
  ep_1981_result_rows: 0,
  messini_runoff_tie_rows: 2,
  preliminary_events: 28,
} as const;

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "data/research/greece/EP-outgoing-snapshot-NOT-election-results.json": EP_OUTGOING_SHA256,
  "data/research/greece/acceptance-examples.json": "82bc149e5fe46d9a740f8eef91cf6e0c47297eca28e73b0a526c598c4cd814b8",
  "data/research/greece/ballot-observations.jsonl.gz": BALLOT_OBSERVATIONS_SHA256,
  "data/research/greece/coverage-by-authority-cycle.json": "40275bddf0bbb93b731008a740da2cf0d421357d4c9f58065539342917f49f1d",
  "data/research/greece/cycle-registers.json": "521e1f802facc0decdc9604d705ab20519659d9e3ef0bd56ac1d7d98f811130b",
  "data/research/greece/events.json": EVENTS_SHA256,
  "data/research/greece/geographies.json": GEOGRAPHY_SHA256,
  "data/research/greece/identity-crosswalk.json": CROSSWALK_SHA256,
  "data/research/greece/municipality-register-2026-reconciliation.json": "b4df776836e6dfc61f3193e6362e15047cc5c7940c6b3f24ae8a29ecb379abed",
  "data/research/greece/national-coverage.json": "30083da87505e2c297a347fa39acc14522ca59be04bd234384b726f65010dd43",
  "data/research/greece/national-source-comparisons.json": "f09aeacd681d59eca0aaef1e9ede2b4ae8a062389d9de536f061fac4f5b62d67",
  "data/research/greece/office-register.csv": "f4cf1647b1fb56aa0e06e91d0701dd72f3d5f3ea617eb18d99781d633fc82932",
  "data/research/greece/office-register.json": REGISTER_SHA256,
  "data/research/greece/presidential-extraction.json": "3992724bdf7cb8aaecfe7f76007290a3bdc98e32a757b1554bdde2825a968421",
  "data/research/greece/proceedings.json": PROCEEDINGS_SHA256,
  "data/research/greece/research-gaps.json": GAPS_SHA256,
  "data/research/greece/results.jsonl.gz": RESULTS_SHA256,
  "data/research/greece/source-holds.json": SOURCE_HOLDS_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export type GreeceHashInputs = {
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

export function greeceUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): GreeceHashInputs {
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

export function fingerprintSha256(hashInputs: GreeceHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
