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

/** Research namespace carried on every Cyprus office and event row. */
export const OFFICE_NAMESPACE = "cdd-atlas-cy-research-v1";
export const LINEAGE_ID = "country-package-cyprus";
export const SOURCE_NAMESPACE = "country-package-cyprus";
export const COUNTRY_ID = "cyprus";
export const COUNTRY_CODE = "CY";
export const COUNTRY_GEOGRAPHY_ID = "CY";
export const ADAPTER_VERSION = "atlas-cyprus-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/cyprus.json";
export const RESEARCH_PREFIX = "data/research/cyprus";
export const REGISTER_RELATIVE = "data/research/cyprus/office-register.json";
export const EVENTS_RELATIVE = "data/research/cyprus/events.json";
export const CROSSWALK_RELATIVE = "data/research/cyprus/successor-crosswalk.json";
export const COUNTS_RELATIVE = "data/research/cyprus/counts.json";
export const SOURCE_INVENTORY_RELATIVE = "data/research/cyprus/source-inventory.json";
export const DRAFT_TIERS_RELATIVE = "data/research/cyprus/draft-tiers.json";
export const FIELD_MAP_RELATIVE = "data/research/cyprus/field-map-223.json";
export const CALENDAR_RELATIVE = "data/research/cyprus/calendar.json";
export const COMMUNITIES_RELATIVE = "data/research/cyprus/communities.json";
export const MUNICIPALITIES_RELATIVE = "data/research/cyprus/municipalities.json";
export const QUARTERS_RELATIVE = "data/research/cyprus/municipal-quarters.json";
export const REPORTING_UNITS_RELATIVE = "data/research/cyprus/reporting-units.json";
export const RECONCILIATION_RELATIVE = "data/research/cyprus/reconciliation.json";
export const COVERAGE_RELATIVE = "data/research/cyprus/current-office-coverage.json";
export const TERRITORIAL_GATES_RELATIVE = "data/research/cyprus/territorial-gates.json";
export const RESEARCH_GAPS_RELATIVE = "data/research/cyprus/research-gaps.json";
export const EXTRACTION_ISSUES_RELATIVE = "data/research/cyprus/extraction-issues.json";
export const EXCLUDED_RELATIVE = "data/research/cyprus/excluded-source-observations.json";
export const IDENTITY_ALIASES_RELATIVE = "data/research/cyprus/identity-aliases.json";
export const QUARTER_ALIASES_RELATIVE = "data/research/cyprus/quarter-name-aliases.json";
export const ACCEPTANCE_EXAMPLES_RELATIVE = "data/research/cyprus/acceptance-examples.json";
/**
 * Full-pack result rows are not in the slim land. Do not invent that file or its 11,112 rows.
 * Reporting units and reconciliation checks are not substitutes.
 */
export const OMITTED_RESULTS_RELATIVE = "data/research/cyprus/results.json";
export const OMITTED_RESULTS_PACK_PATH = "data/results.json";
/** Full-pack source bytes are not in the slim land. Do not invent that directory. */
export const OMITTED_SOURCES_DIR = "data/research/cyprus/sources";

export const HOUSE_ID = "CY-HOUSE";
export const PRESIDENT_ID = "CY-PRESIDENT";
export const EP_ID = "CY-EP";
export const REL_ARM_ID = "CY-HOUSE-REL-ARM";
export const REL_LAT_ID = "CY-HOUSE-REL-LAT";
export const REL_MAR_ID = "CY-HOUSE-REL-MAR";
export const SPILIA_ANTONIOS_COUNCIL_ID = "CY-COM-1401-council";
export const SPILIA_KOURDALI_COUNCIL_ID = "CY-COM-SPILIA-KOURDALI-council";
export const SPILIA_ANTONIOS_GEOGRAPHY_ID = "CY-COM-1401";
export const SPILIA_KOURDALI_GEOGRAPHY_ID = "CY-COM-SPILIA-KOURDALI";

export const REGISTER_SHA256 = "8523b4a2a6179584b7beb8a7b0c83c21b4b89cce761d696f232e3e8e74e2b47c";
export const EVENTS_SHA256 = "a551a9388b36b0dd4e9ddd4fc6568663feca37080cc6f19440acedaecde054db";
export const CROSSWALK_SHA256 = "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570";
export const COUNTS_SHA256 = "b997293b5906400b73c97cde8c6529a8402d244ceebc1084bc9988b68de99a80";
export const SOURCE_INVENTORY_SHA256 = "0bdbfaecdf5c1dea6e0fd831c577765d5cd39d98bc8f83e0cf40199cc5b32913";
export const DRAFT_TIERS_SHA256 = "bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde";
export const FIELD_MAP_SHA256 = "8db647c6edc5416f3b5405798c7378831cd1a4b61ec3ab3d5010e755bfc4b643";
export const CALENDAR_SHA256 = "b3233194d30f88c5a6927d398435aa90c1ceea78fc550617ae945b37719db1c7";
export const COMMUNITIES_SHA256 = "4f225f4285cf71da7d0369bb20a20a328a68baff82379c4ee242edbb98fcaf9a";
export const MUNICIPALITIES_SHA256 = "d9d88c274f46d1de647d8c595eb5a767695b8b80f28109eea72083484b605016";
export const QUARTERS_SHA256 = "b38ccc19206c9c2b7a3e98e50eb87d6865732e29ae04ab70dbf4a085d85bd470";
export const REPORTING_UNITS_SHA256 = "1cf4de719726fff0ae3c3e438fb863e4d2077a24ac90bf018c3d0913f3b7fa1a";
export const RECONCILIATION_SHA256 = "f2e4e22b9255728571f730d47803362c52b32d971d3ad8478847e37261e1ca2d";
export const COVERAGE_SHA256 = "0ffd8cdca07b519ec919be8a32bd883c1222d0a34ad1d3b5ed5f6333b48ba763";
export const TERRITORIAL_GATES_SHA256 = "1ffae35c7b8ec22ad8b17d48ba84c261fc4f980e90adec3958f46f6caa49d776";
export const RESEARCH_GAPS_SHA256 = "d6017b6ab8b828e1e6ff5543fe53c58c3db50c80ec4482828b4c25d6e1cf20b2";
export const EXTRACTION_ISSUES_SHA256 = "ef6508ac2f8031d297473ea5ea7fd9abdf173333e4f2d7935bbaf580d9b33c48";
export const EXCLUDED_SHA256 = "05ec3b0db5dbb8d4bb366263ec625cd1985c7c1ce6d36e0ae97c187e38301d5c";
export const IDENTITY_ALIASES_SHA256 = "aed787d2fc00e78688b76485ed513448813711aa89dc566a3f7b490dc38944f1";
export const QUARTER_ALIASES_SHA256 = "6d1c50acb47f546e3c1e84e46dc7c4cdfa4af099c3af39b876e7f2c2c86602d0";
export const ACCEPTANCE_EXAMPLES_SHA256 = "e3af567c7c799aa3e08fc9543fcf6aee7d241b67afe207770b415c6b2a1d48a6";
export const TIER_SHA256 = "383512b2601296f78fa33da1376a387ebdb488bd80b426c0a94e2b22efb3eebb";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into a new draft. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "bee8a11e4909bf3b587a31c258ace4214dd510489c185301e4bec491afc2ddde";
/** Manifest digest of the omitted full-pack results file. Not a retained input. */
export const OMITTED_RESULTS_SHA256 = "13abc8a38053bdf44146be63fb15a1673137ed868054ebd4880146c2e44a3b04";
export const REVIEW_ZIP_SHA256 = "0e6108950460e0a23d0af512959a91957d892c67dc63a21654b450edb9afadad";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "e1de107d562ffe88d990aa211a7c23e3d6c30911d0d0bf3b7f362e7863ff1cd1";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "Cyprus";

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "mayor",
  "deputy_mayor",
  "community_council",
  "community_leader",
  "district_organisation_president",
  "national_parliament",
  "president",
  "european_parliament_delegation",
  "religious_group_representative",
] as const;

/** Named holds CY-G01–CY-G15. Status stays open. */
export const NAMED_HOLDS = [
  {
    token: "CY-G01",
    status: "open",
    reason:
      "Electoral composition names 285 free-area community councils; the ministry overview says 286. No 286th council was identifiable, and none is invented.",
  },
  {
    token: "CY-G02",
    status: "open",
    reason:
      "Only administered local municipalities and communities are instantiated. Occupied local offices and all TRNC offices stay out.",
  },
  {
    token: "CY-G03",
    status: "open",
    reason:
      "28 historical municipal pairs and 59 historical community pairs are source-identified identities. The successor crosswalk stays empty.",
  },
  {
    token: "CY-G04",
    status: "open",
    reason:
      "Spilia Agios Antonios and Spilia Kourdali stay separate councils. Kourdali has no safely matched Electoral Service area ID.",
  },
  {
    token: "CY-G05",
    status: "open",
    reason:
      "Retained presidential cycles stay as in the pack. Earlier cycles and a vice-presidential office are not added.",
  },
  {
    token: "CY-G06",
    status: "open",
    reason:
      "Mayors, deputy mayors, and community leaders keep their authored popular footing. Community deputies are not separate popular offices.",
  },
  {
    token: "CY-G07",
    status: "open",
    reason: "One EP delegation row. Earlier seats and individual preference outcomes are not fully normalized.",
  },
  {
    token: "CY-G08",
    status: "open",
    reason: "A government host or 100% count is not Gazette certification. Legal outcome stays unknown.",
  },
  {
    token: "CY-G09",
    status: "open",
    reason: "Three Ora preference rows stay withheld from normalized results. They are not published as result rows.",
  },
  {
    token: "CY-G10",
    status: "open",
    reason: "Year-only rows stay year-only. Publication dates do not become poll dates.",
  },
  {
    token: "CY-G11",
    status: "open",
    reason: "A missing local return is not an unopposed election, a zero, an abolition, or an appointment.",
  },
  {
    token: "CY-G12",
    status: "open",
    reason:
      "56 filled legislative seats and 24 uncontested Turkish-Cypriot seats stay as sourced. Three religious representatives have no plenary vote.",
  },
  {
    token: "CY-G13",
    status: "open",
    reason: "CYSTAT units without an elected council are not instantiated.",
  },
  {
    token: "CY-G14",
    status: "open",
    reason:
      "Five DLGO presidents stay. Appointed board members and district state administrations were not added as popular contests.",
  },
  {
    token: "CY-G15",
    status: "open",
    reason:
      "The 223-column contract is the inherited pin. Per-office review_status stays needs_review.",
  },
] as const;

export const UNPAIRED_HISTORICAL_PLACES = ["Alampra", "Akoursos", "Tera", "Pelathousa"] as const;

export const REGIONAL_CALENDAR_LABEL =
  "5 regional offices (District Local Government Organisation presidents for Lefkosia, Ammochostos, Larnaka, Lemesos, and Pafos). Holds CY-G01–CY-G15 stay open. The successor crosswalk stays empty. Slim land omits results.json; those rows are not invented. Calendar dates stay null and are not prospective events.";

export const COUNTRY_NOTES = [
  "Prompt AQ: 714 current offices and 174 historical offices. Coverage partial.",
  "Current scope is 20 municipal councils, 20 mayors, 93 deputy mayors, 285 community councils, 285 community leaders, 5 DLGO presidents, the House, the President, 3 religious-group representatives, and one Cyprus EP delegation.",
  "Historical scope is 28 municipal councils, 28 mayors, 59 community councils, and 59 community leaders. Current direct executives: 404.",
  "Draft tiers stay needs_review on every classification: 877 municipal / 5 regional / 5 national / 1 other.",
  "1,599 events. Published result rows: 0. The full pack documents 11,112 result rows in omitted results.json. Reporting units and reconciliation checks are not substitutes.",
  "The communities file stays at 285 named free-area councils. The ministry overview of 286 stays unresolved. No 286th community is added.",
  "The successor crosswalk stays empty. No 2024 reform successor edge is added.",
  "Spilia Agios Antonios and Spilia Kourdali stay separate. Kourdali keeps an unresolved Electoral Service area code.",
  "Slim land omits sources/ (156 hashed captures). Source rows are not invented from the inventory.",
  "Alert window (~18 months) filters alerts only. Calendar dates stay null. No prospective events.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 714,
  historical_offices: 174,
  offices: 888,
  geographies: 494,
  selected_histories: 1599,
  prospective_events: 0,
  total_events: 1599,
  proceedings: 0,
  result_rows: 0,
  documented_result_rows_omitted: 11112,
  documented_list_ballot_rows_omitted: 3792,
  documented_candidate_vote_rows_omitted: 2103,
  documented_candidate_preference_rows_omitted: 5201,
  documented_returned_representative_rows_omitted: 3,
  documented_party_seat_rows_omitted: 13,
  reporting_units: 1679,
  reconciliation_rows: 1127,
  municipal_offices: 877,
  regional_offices: 5,
  national_offices: 5,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 888,
  sources: 0,
  unresolved_evidence: 15,
  named_holds: 15,
  resolved_exclusions: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  guessed_merger_edges: 0,
  retained_inputs: 22,
  research_dates: 1599,
  direct_executive_offices: 404,
  historical_direct_executives: 87,
  current_local_councils: 305,
  historical_local_councils: 87,
  current_municipal_councils: 20,
  current_mayors: 20,
  current_deputy_mayors: 93,
  current_community_councils: 285,
  current_community_leaders: 285,
  current_dlgo_presidents: 5,
  historical_municipal_councils: 28,
  historical_mayors: 28,
  historical_community_councils: 59,
  historical_community_leaders: 59,
  municipalities: 20,
  named_communities: 285,
  ministry_overview_communities: 286,
  municipal_quarters: 93,
  parliament_offices: 1,
  ep_delegations: 1,
  religious_representatives: 3,
  ordinary_election_events: 1596,
  uncontested_return_events: 2,
  election_return_events: 1,
  offices_with_events: 800,
  offices_without_events: 88,
  year_only_events: 7,
  day_events: 1592,
  evidence_links: 0,
  source_inventory_rows: 156,
  distinct_source_files_documented: 156,
  calendar_rows: 714,
  calendar_called_polls: 0,
  extraction_issues: 7,
  historic_type_not_evidenced: 4,
  malformed_preference_rows: 3,
  successor_crosswalk_rows: 0,
  field_map_rows: 223,
  territorial_gates: 6,
  research_gaps: 15,
  excluded_source_observations: 660,
  identity_aliases: 20,
  quarter_name_aliases: 74,
  acceptance_examples: 33,
  current_office_coverage_rows: 714,
  draft_tier_rows: 888,
} as const;

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_EXAMPLES_RELATIVE]: ACCEPTANCE_EXAMPLES_SHA256,
  [CALENDAR_RELATIVE]: CALENDAR_SHA256,
  [COMMUNITIES_RELATIVE]: COMMUNITIES_SHA256,
  [COUNTS_RELATIVE]: COUNTS_SHA256,
  [COVERAGE_RELATIVE]: COVERAGE_SHA256,
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EVENTS_RELATIVE]: EVENTS_SHA256,
  [EXCLUDED_RELATIVE]: EXCLUDED_SHA256,
  [EXTRACTION_ISSUES_RELATIVE]: EXTRACTION_ISSUES_SHA256,
  [FIELD_MAP_RELATIVE]: FIELD_MAP_SHA256,
  [IDENTITY_ALIASES_RELATIVE]: IDENTITY_ALIASES_SHA256,
  [QUARTERS_RELATIVE]: QUARTERS_SHA256,
  [MUNICIPALITIES_RELATIVE]: MUNICIPALITIES_SHA256,
  [REGISTER_RELATIVE]: REGISTER_SHA256,
  [QUARTER_ALIASES_RELATIVE]: QUARTER_ALIASES_SHA256,
  [RECONCILIATION_RELATIVE]: RECONCILIATION_SHA256,
  [REPORTING_UNITS_RELATIVE]: REPORTING_UNITS_SHA256,
  [RESEARCH_GAPS_RELATIVE]: RESEARCH_GAPS_SHA256,
  [SOURCE_INVENTORY_RELATIVE]: SOURCE_INVENTORY_SHA256,
  [CROSSWALK_RELATIVE]: CROSSWALK_SHA256,
  [TERRITORIAL_GATES_RELATIVE]: TERRITORIAL_GATES_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export type CyprusHashInputs = {
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

export function cyprusUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): CyprusHashInputs {
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

export function fingerprintSha256(hashInputs: CyprusHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
