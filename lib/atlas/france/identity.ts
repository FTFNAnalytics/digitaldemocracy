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

/** Research namespace carried on every France office row. */
export const OFFICE_NAMESPACE = "cdd-atlas-fr-research-v1";
export const LINEAGE_ID = "country-package-france";
export const SOURCE_NAMESPACE = "country-package-france";
export const COUNTRY_ID = "france";
export const COUNTRY_CODE = "FR";
export const COUNTRY_GEOGRAPHY_ID = "FR";
export const ADAPTER_VERSION = "atlas-france-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/france.json";
export const RESEARCH_PREFIX = "data/research/france";
export const REGISTER_RELATIVE = "data/research/france/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "data/research/france/draft-tiers.jsonl";
export const CALENDAR_RELATIVE = "data/research/france/calendar.jsonl";
export const CROSSWALK_RELATIVE = "data/research/france/successor-crosswalk.json";
export const COUNTS_RELATIVE = "data/research/france/counts.json";
export const SOURCE_INVENTORY_RELATIVE = "data/research/france/source-inventory.json";
export const FIELD_MAP_RELATIVE = "data/research/france/field-map-223.json";
export const RESEARCH_GAPS_RELATIVE = "data/research/france/research-gaps.json";
export const EXTRACTION_ISSUES_RELATIVE = "data/research/france/extraction-issues.json";
export const ACCEPTANCE_EXAMPLES_RELATIVE = "data/research/france/acceptance-examples.json";
export const HISTORY_COVERAGE_RELATIVE = "data/research/france/history-coverage.json";
export const OFFICE_HISTORY_RELATIVE = "data/research/france/office-history-coverage.jsonl";
export const MOVEMENTS_RELATIVE = "data/research/france/territorial-movements.jsonl";
export const EXCLUSIONS_RELATIVE = "data/research/france/territory-exclusions.json";
export const DISCREPANCIES_RELATIVE = "data/research/france/source-arithmetic-discrepancies.json";
export const SOURCES_NOTE_RELATIVE = "data/research/france/SOURCES_NOTE.md";

/**
 * Full-pack result, event, and reporting-unit rows are not in the slim land.
 * Do not invent those files or their documented totals as published rows.
 */
export const OMITTED_RESULTS_RELATIVE = "data/research/france/results.jsonl";
export const OMITTED_EVENTS_RELATIVE = "data/research/france/events.jsonl";
export const OMITTED_REPORTING_UNITS_RELATIVE = "data/research/france/reporting-units.jsonl";
export const OMITTED_RESULTS_PACK_PATH = "data/results.jsonl";
export const OMITTED_EVENTS_PACK_PATH = "data/events.jsonl";
export const OMITTED_REPORTING_UNITS_PACK_PATH = "data/reporting-units.jsonl";
/** Full-pack source bytes are not in the slim land. Do not invent that directory. */
export const OMITTED_SOURCES_DIR = "data/research/france/sources";

export const AN_ID = "FR-AN";
export const SENATE_ID = "FR-SENATE";
export const PRESIDENT_ID = "FR-PRESIDENT";
export const EP_ID = "FR-EP";
export const LYON_METRO_ID = "FR-CT-69M";
export const MAYOTTE_ID = "FR-CT-976R";
export const PARIS_ID = "FR-MUN-75056";
export const PARIS_HISTORICAL_ID = "FR-MUN-75056@before-2019-01-01";
export const CHATAIN_ID = "FR-MUN-86063";
export const NC_CONGRESS_ID = "FR-NC-CONGRESS";

export const REGISTER_SHA256 = "8801b85152572cb326750b04207e12559b4d0cea3ebb19e2769126f0892b7d58";
export const DRAFT_TIERS_SHA256 = "8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a";
export const CALENDAR_SHA256 = "df90d50b354604ea463b5d1c03e421fd1758ed2c502f8957feffe4cc2b2901bc";
export const CROSSWALK_SHA256 = "37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570";
export const COUNTS_SHA256 = "b32d546413b2648d5debd07abd8ce98c63c7ba93bd969e84292f11cd8b872e85";
export const SOURCE_INVENTORY_SHA256 = "f926800e64caa59abf9ee6600120223a74efe7fb278c215e5d465a577c8016b0";
export const FIELD_MAP_SHA256 = "ad56c2adbe3f202a3de6be176902b8a4018173796e49442b0a8c37eae9e57a9a";
export const RESEARCH_GAPS_SHA256 = "19846fd855c5656de47e68750e57903cf9db2344f722835989600b69d040604e";
export const EXTRACTION_ISSUES_SHA256 = "ccdd4ef729c1ff91ff700110d88ffee65037e599223d5deada8768364c8bc936";
export const ACCEPTANCE_EXAMPLES_SHA256 = "28bb53daa3c05502f18003a7996956e8f6a4e9b8fb4579ec8ace425c54d356ad";
export const HISTORY_COVERAGE_SHA256 = "a3fcdebd1bdf4b61e534e252169e8cecb845bf534d5a454ed116f4bf6329ec25";
export const OFFICE_HISTORY_SHA256 = "807a7ce84149a6d45770d39a007146f31044ab9ff49c7d33e349f0b4dec3aa2d";
export const MOVEMENTS_SHA256 = "5ee09b0d46c5ed20560aa2b4fe7a4325af6dfc2e36f317eed3d4a8b4978ce3a4";
export const EXCLUSIONS_SHA256 = "d6a879353f87e9337950770574393357e73d8a284d62a4564e08068b79382cf5";
export const DISCREPANCIES_SHA256 = "961f9e98793003d0e6631f8a82f702f30861e158a6cc285836ef4ad219f425db";
export const SOURCES_NOTE_SHA256 = "97495ad4180ce50cf5d66f032a103319be95b5cf3f08789a51503edb27a7abec";
export const TIER_SHA256 = "727dd2d4152b46c65a77ec0fb73d606631dad2c567474fb61a12d7bd596a970a";
/** Predecessor draft tier bytes. Not this release. Approval did not rewrite them into a new draft. */
export const PREDECESSOR_DRAFT_TIER_SHA256 = "8d103d5733f8bcd15dccf167d8e6e7cab2814b124f3a8f20564a05d5ec0ec16a";
/** Manifest digest of the omitted full-pack results file. Not a retained input. */
export const OMITTED_RESULTS_SHA256 = "b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9";
export const OMITTED_EVENTS_SHA256 = "dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03";
export const OMITTED_REPORTING_UNITS_SHA256 = "2a4fedbf8a111719eec65d4ec3bb4261ac2b9c16627adc8f3402d278f7d5b89d";
export const REVIEW_ZIP_SHA256 = "c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9";
export const SLIM_LAND_SHA256 = "0cd3af1b55ce18b6d0985fbd5c62fb91988a1037ddfe30e55b0e37ef77265498";

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "c16f647d9ac17cc021fdc3f07e5f1e951ae2f0a75a2c70878f8a908eb3c5f5e7";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-22";
export const COUNTRY_NAME = "France";
export const HOLD_STATUS = "open_or_explicit_exclusion";

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "departmental_council",
  "single_territorial_assembly",
  "metropolitan_council",
  "regional_council",
  "arrondissement_or_sector_council",
  "overseas_territorial_assembly",
  "new_caledonia_congress",
  "provincial_assembly",
  "national_lower_house",
  "national_upper_house",
  "president",
  "european_parliament_delegation",
] as const;

export const NATIONAL_OFFICE_IDS = [AN_ID, SENATE_ID, PRESIDENT_ID, EP_ID] as const;

/** Named holds G01–G21. Status stays open_or_explicit_exclusion. */
export const NAMED_HOLDS = [
  {
    token: "G01",
    status: HOLD_STATUS,
    reason:
      "National France-entire candidate returns cover 1995, 2002, 2007, 2012, 2017 and 2022, both rounds. Earlier Fifth Republic cycles and annulment-level evidence are not normalized. Each round has its own electorate and valid-vote universe; no transfer arithmetic.",
  },
  {
    token: "G02",
    status: HOLD_STATUS,
    reason:
      "2014/2017/2020/2023 renewals are electoral-college contests, not nationwide popular ballots. Majority districts permit multiple candidate marks. 2020 workbook does not supply seat/elected fields; they stay null. Foreign-resident senators and later partial renewals require separate reconciliation. 27 September 2026 is upcoming at this snapshot.",
  },
  {
    token: "G03",
    status: HOLD_STATUS,
    reason:
      "Mayors are elected by municipal councils; no direct mayor office or popular mayor contest is created. Arrondissement mayors are likewise council-selected. Councils temporarily administered by special delegations remain legal council offices; absent 2026 poll is not zero votes.",
  },
  {
    token: "G04",
    status: HOLD_STATUS,
    reason:
      "Council presidents and the relevant special-collectivity executives are council/assembly-selected. No regional or departmental direct-executive row is created.",
  },
  {
    token: "G05",
    status: HOLD_STATUS,
    reason:
      "All 13,734 COG movement records are retained. Current commune snapshot is 1 January 2026. Historical council identities are separated at documented creation/re-establishment/code-transition gates where old returns exist, including retained-code communes nouvelles. Geographic movement is not asserted legal office succession: successor-crosswalk remains empty pending legal-act review.",
  },
  {
    token: "G06",
    status: HOLD_STATUS,
    reason:
      "2010 pre-reform regions and 2015 post-reform-region ballots remain distinct where the codes changed; 18 historic regional-council identities are retained. December 2015 contests concern the new regions taking effect in 2016. No guessed predecessor-to-successor links. Corsica pre-2018 assembly is historical-only.",
  },
  {
    token: "G07",
    status: HOLD_STATUS,
    reason:
      "101 administrative departments do not imply 101 distinct elected departmental councils. This register contains 95 departmental councils including Alsace and transitional Mayotte, 3 single territorial assemblies, Paris municipal/departmental council once, and Lyon metropolitan council once.",
  },
  {
    token: "G08",
    status: HOLD_STATUS,
    reason:
      "COG territory is 976R from 2026, but the list-elected Assembly of Mayotte starts at the 2028 renewal. The current transitional council and its 2021 binomial ballots are retained; no future 52-seat assembly is inserted as a second current office.",
  },
  {
    token: "G09",
    status: HOLD_STATUS,
    reason:
      "83 additional real communes: Polynésie française 48, Nouvelle-Calédonie 33, Saint-Pierre-et-Miquelon 2. Saint-Barthélemy and Saint-Martin statistical COM rows identify territorial collectivities, not extra municipal councils. Wallis-Futuna districts, TAAF districts, Clipperton and Île des Faisans are not elected municipal offices.",
  },
  {
    token: "G10",
    status: HOLD_STATUS,
    reason:
      "The official portal identifies definitive June 2026 provincial results, but quantitative attachments were not retrievable. Congress and all three provincial assemblies are present; no invented result event, vote or seat allocation.",
  },
  {
    token: "G11",
    status: HOLD_STATUS,
    reason:
      "2022 proclaimed representatives are retained without votes. Sigave is explicitly gated because a later repeat election occurred in 2023; the original return is not a current incumbent list. Quantitative 2022 votes, annulment decision and 2023 repeat results remain to be pinned.",
  },
  {
    token: "G12",
    status: HOLD_STATUS,
    reason:
      "2026 national portal Polynesia tables include aggregate participation without named lists. These 70 commune-round units are retained as metrics-only, not zero-vote elections.",
  },
  {
    token: "G13",
    status: HOLD_STATUS,
    reason:
      "Ordinary EPCI executives are council-selected and excluded, and nationwide EPCI council coverage is outside this requested municipal register. Métropole de Lyon is a territorial collectivity with a separate popular metropolitan council ballot and is included.",
  },
  {
    token: "G14",
    status: HOLD_STATUS,
    reason:
      "34 current arrondissement/sector councils are included from the 2026 dedicated official return. The 45 INSEE administrative arrondissements are not 45 elected councils. Paris Centre covers the first four arrondissements.",
  },
  {
    token: "G15",
    status: HOLD_STATUS,
    reason:
      "Official EP national tables contain published vote percentages and constitutive-session seat composition for 2009/2014/2019/2024. These are not raw votes or necessarily election-night party seats. 2019 records 74 seated MEPs at the constitutive session, not the later Brexit-adjusted 79. No reverse-engineered votes.",
  },
  {
    token: "G16",
    status: HOLD_STATUS,
    reason:
      "Interior data are official published returns with stated appeal/correction reservations. Published arithmetic discrepancies are retained in a named table and must be resolved before any certification claim. An integrity PASS is not election certification.",
  },
  {
    token: "G17",
    status: HOLD_STATUS,
    reason:
      "Selected cycles are normalized. Later by-elections, judicial annulments, repeats, dissolution follow-ups and exhaustive earlier history remain open. Raw retained files sometimes cover more levels than normalized tables.",
  },
  {
    token: "G18",
    status: HOLD_STATUS,
    reason:
      "2014 precinct text uses head-of-list labels even for small-commune candidates. Its mixed vote regime is explicitly unresolved at row level; candidate totals are not tested against one-vote-per-ballot sums and seats/elected flags remain null.",
  },
  {
    token: "G19",
    status: HOLD_STATUS,
    reason:
      "The 18-month window filters only the calendar. All current offices and sourced history are present regardless of future date. 2028 March is month-precision and straddles the window end. Most local exact next dates are deliberately unresolved. No alert was created.",
  },
  {
    token: "G20",
    status: HOLD_STATUS,
    reason:
      "Tiers are provisional body-level classifications, one per current or historical office, not approved Atlas production IDs. Per-office review_status stays needs_review.",
  },
  {
    token: "G21",
    status: HOLD_STATUS,
    reason:
      "Chatain (86063), 2026 round one: source panel 1 has 65 votes and 9 CM seats but no list name. Preserve empty label; no party/candidate identity invented.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "141 regional offices (draft tier 2 regional/single/COM/NC plus draft tier 3 departmental/Lyon). Holds G01–G21 stay open. The successor crosswalk stays empty. Slim land omits results.jsonl, events.jsonl, and reporting-units.jsonl; those rows are not invented. Calendar next dates are not prospective events.";

export const COUNTRY_NOTES = [
  "Prompt AR: 35,112 current offices and 2,738 historical offices. Coverage partial.",
  "Current scope is 34,952 municipal councils, 95 departmental councils, 14 regional councils, 3 single territorial assemblies, the Lyon metropolitan council, 34 PLM sector councils, 5 overseas territorial assemblies, the New Caledonia congress, 3 provincial assemblies, Assemblée nationale, Sénat, the President, and one France EP delegation.",
  "Historical scope is 2,719 municipal councils, 18 regional councils, and 1 single territorial assembly. Current direct executives: 1 (the President). Local direct executives: 0.",
  "Draft tiers stay needs_review on every classification. Schema projection: 4 national / 141 regional / 37,705 municipal / 0 other. FR-EP stays national_context. PLM sector councils stay municipal.",
  "Published events: 0. Published result rows: 0. The full pack documents 119,554 events, 173,409 reporting units, and 1,193,657 result rows in omitted files. Coverage tables are not substitutes.",
  "The successor crosswalk stays empty. No guessed commune-nouvelle successor edge is added. Territorial movements stay geographic evidence.",
  "Mayors and local executive presidents stay council- or assembly-selected. Ordinary EPCI stay excluded. No second Mayotte assembly is added.",
  "Slim land omits sources/ (87 hashed captures). Source rows are not invented from the inventory.",
  "Alert window (~18 months) filters alerts only. No alert was created. Dated calendar rows are next-date metadata, not election events.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 35112,
  historical_offices: 2738,
  offices: 37850,
  geographies: 37847,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  documented_result_rows_omitted: 1193657,
  documented_event_rows_omitted: 119554,
  documented_reporting_units_omitted: 173409,
  documented_list_ballot_rows_omitted: 81091,
  documented_candidate_mark_multi_vote_rows_omitted: 393980,
  documented_candidate_or_list_vote_regime_unresolved_rows_omitted: 692029,
  documented_candidate_vote_rows_omitted: 12623,
  documented_binomial_ballot_rows_omitted: 11681,
  documented_electoral_college_candidate_mark_rows_omitted: 1246,
  documented_electoral_college_list_ballot_rows_omitted: 913,
  documented_party_share_and_seats_rows_omitted: 74,
  documented_returned_representative_rows_omitted: 20,
  municipal_offices: 37705,
  regional_offices: 141,
  national_offices: 4,
  other_offices: 0,
  approved_classifications: 0,
  needs_review_classifications: 37850,
  sources: 0,
  unresolved_evidence: 21,
  named_holds: 21,
  resolved_exclusions: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  guessed_merger_edges: 0,
  retained_inputs: 17,
  research_dates: 114,
  direct_executive_offices: 1,
  historical_direct_executives: 0,
  current_municipal_councils: 34952,
  historical_municipal_councils: 2719,
  current_departmental_councils: 95,
  current_regional_councils: 14,
  historical_regional_councils: 18,
  current_single_territorial_assemblies: 3,
  historical_single_territorial_assemblies: 1,
  current_metropolitan_councils: 1,
  current_sector_councils: 34,
  current_overseas_assemblies: 5,
  current_nc_congress: 1,
  current_provincial_assemblies: 3,
  current_overseas_offices: 228,
  draft_tier_1: 4,
  draft_tier_2: 45,
  draft_tier_3: 96,
  draft_tier_4: 37705,
  cog_com_units: 34875,
  additional_com_municipalities: 83,
  appointed_commune_exclusions: 6,
  source_inventory_rows: 87,
  distinct_source_files_documented: 87,
  calendar_rows: 35112,
  calendar_null_dates: 34998,
  calendar_month_dates: 112,
  calendar_year_dates: 1,
  calendar_called_days: 1,
  calendar_alerts_created: 0,
  extraction_issues: 74,
  polynesia_aggregate_issues: 70,
  unnamed_source_list_issues: 1,
  tab_label_issues: 2,
  header_misalignment_issues: 1,
  successor_crosswalk_rows: 0,
  field_map_rows: 223,
  research_gaps: 21,
  territory_exclusions: 18,
  territorial_movements: 13734,
  history_coverage_rows: 32,
  office_history_coverage_rows: 37850,
  documented_normalized_events: 119554,
  acceptance_examples: 36,
  draft_tier_rows: 37850,
  source_arithmetic_discrepancies: 38,
  offices_with_events: 0,
  offices_without_events: 37850,
  year_only_dates: 1,
  month_dates: 112,
  day_dates: 1,
  evidence_links: 0,
  mayors: 0,
  epci_offices: 0,
  popular_mayor_contests: 0,
} as const;

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_EXAMPLES_RELATIVE]: ACCEPTANCE_EXAMPLES_SHA256,
  [CALENDAR_RELATIVE]: CALENDAR_SHA256,
  [COUNTS_RELATIVE]: COUNTS_SHA256,
  [DISCREPANCIES_RELATIVE]: DISCREPANCIES_SHA256,
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EXCLUSIONS_RELATIVE]: EXCLUSIONS_SHA256,
  [EXTRACTION_ISSUES_RELATIVE]: EXTRACTION_ISSUES_SHA256,
  [FIELD_MAP_RELATIVE]: FIELD_MAP_SHA256,
  [HISTORY_COVERAGE_RELATIVE]: HISTORY_COVERAGE_SHA256,
  [MOVEMENTS_RELATIVE]: MOVEMENTS_SHA256,
  [OFFICE_HISTORY_RELATIVE]: OFFICE_HISTORY_SHA256,
  [REGISTER_RELATIVE]: REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: RESEARCH_GAPS_SHA256,
  [SOURCE_INVENTORY_RELATIVE]: SOURCE_INVENTORY_SHA256,
  [SOURCES_NOTE_RELATIVE]: SOURCES_NOTE_SHA256,
  [CROSSWALK_RELATIVE]: CROSSWALK_SHA256,
  [TIER_PATH]: TIER_SHA256,
};

export type FranceHashInputs = {
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

export function franceUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): FranceHashInputs {
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

export function fingerprintSha256(hashInputs: FranceHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
