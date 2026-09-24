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

/** Research namespace carried on every Malta office and event row. */
export const OFFICE_NAMESPACE = "cdd-atlas-mt-research-v1";
export const LINEAGE_ID = "country-package-malta";
export const SOURCE_NAMESPACE = "country-package-malta";
export const COUNTRY_ID = "malta";
export const COUNTRY_CODE = "MT";
export const COUNTRY_GEOGRAPHY_ID = "MT";
export const ADAPTER_VERSION = "atlas-malta-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/malta.json";
export const RESEARCH_PREFIX = "data/research/malta";
export const REGISTER_RELATIVE = "data/research/malta/office-register.json";
export const EVENTS_RELATIVE = "data/research/malta/events.json";
export const CROSSWALK_RELATIVE = "data/research/malta/successor-crosswalk.json";
export const COUNTS_RELATIVE = "data/research/malta/counts.json";
export const SOURCE_INVENTORY_RELATIVE = "data/research/malta/source-inventory.json";
export const DRAFT_TIERS_RELATIVE = "data/research/malta/draft-tiers.json";
export const FIELD_MAP_RELATIVE = "data/research/malta/field-map-223.json";
export const CALENDAR_RELATIVE = "data/research/malta/calendar.json";
export const COUNT_TOTALS_RELATIVE = "data/research/malta/count-totals.json";
export const PARTY_AGGREGATES_RELATIVE = "data/research/malta/party-aggregates-derived.json";
export const POST_ELECTION_RELATIVE = "data/research/malta/post-election-return-observations.json";
export const NOMINATIONS_RELATIVE = "data/research/malta/regional-nominations-not-results.json";
export const REPORTING_UNITS_RELATIVE = "data/research/malta/reporting-units.json";
export const TERRITORIAL_GATES_RELATIVE = "data/research/malta/territorial-gates.json";
export const EXTRACTION_ISSUES_RELATIVE = "data/research/malta/extraction-issues.json";
/**
 * Full-pack result rows are not in the slim land. Do not invent that file or its 4,084 rows.
 * count-totals, party aggregates, and reporting units are not substitutes.
 */
export const OMITTED_RESULTS_RELATIVE = "data/research/malta/results.json";
export const OMITTED_RESULTS_PACK_PATH = "data/results.json";
/** Full-pack STV count observations are not in the slim land. Do not invent that file or its 64,204 rows. */
export const OMITTED_STV_RELATIVE = "data/research/malta/stv-counts.json";
export const OMITTED_STV_PACK_PATH = "data/stv-counts.json";
/** Full-pack source bytes are not in the slim land. Do not invent that directory. */
export const OMITTED_SOURCES_DIR = "data/research/malta/sources";

export const HOUSE_ID = "MT-HOR";
export const PRESIDENT_ID = "MT-PRESIDENT";
export const EP_ID = "MT-EP";
export const GOZO_CIVIC_ID = "MT-GOZO-CIVIC";
export const GOZO_CIVIC_PRESIDENT_ID = "MT-GOZO-CIVIC-PRESIDENT";
export const GOZO_CIVIC_GEOGRAPHY_ID = "MT-GEO-gozo-civic";

export const REGISTER_SHA256 = "610d1fd26c9ce5515e14a4586942cb006ed5a6e5c33d838d64e653186d1f71d6";
export const EVENTS_SHA256 = "418fbcce1dd3803180294ec5d604ee23dac140001130964737e42d7a1ecadb3f";
export const CROSSWALK_SHA256 = "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570";
export const COUNTS_SHA256 = "daa4e5453afc1a82375f59cec1780f72cf799209dc0b324d389ad783fe5f0204";
export const SOURCE_INVENTORY_SHA256 = "b01f744f403efb838e68ab73b9f46b495334096428ebbacaee7138c26f462dba";
export const DRAFT_TIERS_SHA256 = "5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18";
export const FIELD_MAP_SHA256 = "2cd9fbe53c36e8ee0441c7ae703a135183521445a7a536d2752eb6d93f34f799";
export const CALENDAR_SHA256 = "df5c6a168baedfc6737e841551b14f6359386ae7f6145892c3d95bf242bacbd4";
export const COUNT_TOTALS_SHA256 = "8ff78f78af9d2b94ddc187195db7d6e52114eb04be255e7f56d38ab7d3c9ee7b";
export const PARTY_AGGREGATES_SHA256 = "42f75286f0751af7a61baadd6e37ffa2cb05efc64406651effd02fd162927c9e";
export const POST_ELECTION_SHA256 = "400389f8ebd30c77fa89e7bf3a7d869c7644f52e96a031582715952f01d1e383";
export const NOMINATIONS_SHA256 = "257b8e874440044c7c62a30b6d699e102605d72293f4a0fcfd5af291778e1abd";
export const REPORTING_UNITS_SHA256 = "d7240b68702f3dcbf3c9a44f1b12d4030e48df4b236c56d20da9e77b89cfd809";
export const TERRITORIAL_GATES_SHA256 = "85f08553d24709f97eb5d11afaa1d482b47563f6aa613ecf7e157b08cf3a107b";
export const EXTRACTION_ISSUES_SHA256 = "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570";
export const TIER_SHA256 = "49e0238e4c00ede6839a8c9d77fb11fe43646a8add8c906320da696cad1839c8";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into a new draft. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "5714dde427d288850b4c9c8aa9a5c9000ba803321f9cb6adc66c760b74e06d18";
/** Manifest digest of the omitted full-pack results file. Not a retained input. */
export const OMITTED_RESULTS_SHA256 = "4ecb57ee354b0cc5b9787abae57342cc08fb53eb3c430a2d061e00d8a8bd187f";
/** Manifest digest of the omitted full-pack STV counts file. Not a retained input. */
export const OMITTED_STV_SHA256 = "3fec21da7cd4461bf548df0fb4d1d7c623b62d551b0ce3d91d09a29a0c51693b";
export const REVIEW_ZIP_SHA256 = "ad2fa809d572305e9002fb9cae6ede149ecedb9394cf402eec15ae3ca6716ecb";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "65d2a39b91f07164afd5f12f738252dbe26768bd28bfba2ef1613d87d5ffd338";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "Malta";

export const ALLOWED_OFFICE_TYPES = [
  "local_council",
  "mayor",
  "deputy_mayor",
  "regional_president",
  "national_parliament",
  "head_of_state",
  "ep_delegation",
  "historic_regional_council",
  "historic_regional_president",
] as const;

/** Named holds from the approved tier file. Status stays open. */
export const NAMED_HOLDS = [
  {
    token: "Presidential indirect election",
    status: "open",
    reason:
      "2019 and 2024 resolutions are documented. Numeric House division tallies and the earlier presidential-resolution series remain uncollected.",
  },
  {
    token: "STV transfers",
    status: "open",
    reason:
      "Published count tallies stay in the omitted STV file. Paper-level transfers and recounts are not invented.",
  },
  {
    token: "Post-election changes",
    status: "open",
    reason:
      "Casual-election count tables, co-option instruments, and legal/court adjustments are not exhaustively normalized.",
  },
  {
    token: "Mayoral selection",
    status: "open",
    reason:
      "Council-by-council first meetings, refusals, tie rules, no-confidence replacements, and current incumbencies are not exhaustively audited.",
  },
  {
    token: "Local creation and boundaries",
    status: "open",
    reason:
      "1993 founding 67 and Mtarfa's December 1999 addition are source-established gates. Exact effective territorial versions remain open.",
  },
  {
    token: "Regional bodies",
    status: "open",
    reason:
      "Six current regional presidencies stay indirect. Four 2021 sole nominees stay nominations. No old/new regional successor map is guessed.",
  },
  {
    token: "Gozo Civic Council",
    status: "open",
    reason:
      "Establishment, the 4 June 1961 election, and the 4 July council election are recorded. Candidate votes and a successor link to the modern Gozo Region are not invented.",
  },
  {
    token: "European Parliament",
    status: "open",
    reason:
      "Five ordinary returns are events only. The sixth-seat transition and subsequent MEP replacements are not a new popular election.",
  },
  {
    token: "Certified versus preliminary",
    status: "open",
    reason:
      "EC official-result publication status is retained. Independent Government Gazette certification is not asserted for every row.",
  },
  {
    token: "Exact inherited field contract",
    status: "open",
    reason: "223 table-column pairs are retained from the prior Atlas contract. A new production-schema pin was not checked.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "8 regional offices (6 current indirect regional presidents + the historical Gozo Civic Council and its president). Four 2021 sole nominees stay nominations, not certified wins. Named holds stay open, including Regional bodies and Gozo Civic Council. The successor crosswalk stays empty. Slim land omits results.json and stv-counts.json; those rows are not invented. Exact poll days in calendar.json stay null and are not prospective events.";

export const COUNTRY_NOTES = [
  "Prompt AP: 213 current offices and 2 historical offices. Coverage partial.",
  "Current scope is 68 local councils (54 Malta / 14 Gozo), 68 mayors, 68 deputy mayors, 6 indirect regional presidents, the House, the indirect President, and one Malta EP delegation.",
  "Historical scope is the Gozo Civic Council and its president. Standalone direct-executive offices: 0.",
  "Draft tiers stay needs_review on every classification: 204 municipal / 8 regional / 2 national / 1 other.",
  "223 events. Published result rows: 0. The full pack documents 4,084 result rows and 64,204 STV count observations in omitted files. count-totals.json, party aggregates, and reporting units are not substitutes.",
  "Mayors and deputy mayors stay conditional first-preference or council election. No separate popular mayor or deputy contest is invented.",
  "The President stays an indirect House resolution. No popular presidential ballot and no House division tally is invented.",
  "The successor crosswalk stays empty. No Gozo Civic Council successor edge is added.",
  "Four 2021 regional sole nominees stay nominations. Named holds stay open.",
  "Slim land omits sources/ (1,139 hashed captures). Source rows are not invented from the inventory.",
  "Alert window (~18 months) filters alerts only. Calendar exact poll days stay null. No prospective events.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 213,
  historical_offices: 2,
  offices: 215,
  geographies: 76,
  selected_histories: 223,
  prospective_events: 0,
  total_events: 223,
  proceedings: 0,
  result_rows: 0,
  documented_result_rows_omitted: 4084,
  documented_numeric_first_preference_rows_omitted: 4050,
  documented_stv_count_observations_omitted: 64204,
  count_total_rows: 7118,
  party_aggregate_rows: 880,
  reporting_units: 287,
  post_election_observations: 451,
  regional_nominations: 4,
  municipal_offices: 204,
  regional_offices: 8,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 215,
  sources: 0,
  unresolved_evidence: 10,
  named_holds: 10,
  resolved_exclusions: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  guessed_merger_edges: 0,
  retained_inputs: 16,
  research_dates: 223,
  direct_executive_offices: 0,
  standalone_popular_executive_offices: 0,
  current_local_councils: 68,
  malta_local_councils: 54,
  gozo_local_councils: 14,
  current_mayors: 68,
  current_deputy_mayors: 68,
  current_indirect_regional_presidents: 6,
  historical_gozo_civic_offices: 2,
  parliament_offices: 1,
  ep_delegations: 1,
  ordinary_election_events: 212,
  uncontested_return_events: 3,
  indirect_events: 5,
  historic_events: 1,
  additional_seat_events: 2,
  offices_without_events: 140,
  year_only_events: 0,
  evidence_links: 0,
  source_inventory_rows: 1144,
  distinct_source_files_documented: 1139,
  calendar_rows: 5,
  extraction_issues: 0,
  successor_crosswalk_rows: 0,
  field_map_rows: 223,
  territorial_gates: 5,
} as const;

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [CALENDAR_RELATIVE]: CALENDAR_SHA256,
  [COUNT_TOTALS_RELATIVE]: COUNT_TOTALS_SHA256,
  [COUNTS_RELATIVE]: COUNTS_SHA256,
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EVENTS_RELATIVE]: EVENTS_SHA256,
  [EXTRACTION_ISSUES_RELATIVE]: EXTRACTION_ISSUES_SHA256,
  [FIELD_MAP_RELATIVE]: FIELD_MAP_SHA256,
  [REGISTER_RELATIVE]: REGISTER_SHA256,
  [PARTY_AGGREGATES_RELATIVE]: PARTY_AGGREGATES_SHA256,
  [POST_ELECTION_RELATIVE]: POST_ELECTION_SHA256,
  [NOMINATIONS_RELATIVE]: NOMINATIONS_SHA256,
  [REPORTING_UNITS_RELATIVE]: REPORTING_UNITS_SHA256,
  [SOURCE_INVENTORY_RELATIVE]: SOURCE_INVENTORY_SHA256,
  [CROSSWALK_RELATIVE]: CROSSWALK_SHA256,
  [TERRITORIAL_GATES_RELATIVE]: TERRITORIAL_GATES_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export type MaltaHashInputs = {
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

export function maltaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): MaltaHashInputs {
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

export function fingerprintSha256(hashInputs: MaltaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
