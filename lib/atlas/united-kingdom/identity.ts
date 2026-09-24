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

/** Research namespace carried on every United Kingdom office row. */
export const OFFICE_NAMESPACE = "cdd-atlas-gb-research-v1";
export const LINEAGE_ID = "country-package-united-kingdom";
export const SOURCE_NAMESPACE = "country-package-united-kingdom";
export const COUNTRY_ID = "united-kingdom";
export const COUNTRY_CODE = "GB";
export const COUNTRY_GEOGRAPHY_ID = "GB";
export const ADAPTER_VERSION = "atlas-united-kingdom-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/united-kingdom.json";
export const DOCS_PREFIX = "docs/phase1/united-kingdom";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/united-kingdom/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/united-kingdom/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/united-kingdom/data/counts.json";
export const RESEARCH_GAPS_JSONL_RELATIVE = "docs/phase1/united-kingdom/research-gaps.jsonl";
export const METADATA_RELATIVE = "docs/phase1/united-kingdom/release-metadata.json";

/**
 * Full-pack results, events, reporting units, and sources are not in the slim land.
 * Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/united-kingdom";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/united-kingdom/sources",
  "docs/phase1/united-kingdom/data/events.jsonl",
  "docs/phase1/united-kingdom/data/results.jsonl",
  "docs/phase1/united-kingdom/data/results.jsonl.gz",
  "docs/phase1/united-kingdom/data/reporting-units.jsonl",
] as const;

export const COMMONS_ID = "GB.COMMONS";
export const EP_ID = "GB.EP";
export const SCILLY_COUNCIL_ID = "GB.LOCAL.E06000053.council";
export const SCILLY_NEXT_DATE = "2029-05-03";
export const SHADOW_EAST_ID = "GB.SHADOW.east-surrey";
export const SHADOW_WEST_ID = "GB.SHADOW.west-surrey";
export const LONDON_MAYOR_ID = "GB.LONDON.mayor";
export const LONDON_ASSEMBLY_ID = "GB.LONDON-ASSEMBLY";

export const TIER_SHA256 = "1f268369474f533b4af58e80b997176d7dac676f13ccdace2be7ec1111457334";
export const OFFICE_REGISTER_SHA256 = "0a7583b5b220c293d7d307ab5fde325772a99e740468029343451f1ddcea12a9";
/** Full review ZIP. Not this release. */
export const REVIEW_ZIP_SHA256 = "57dc361fe4043f8a5cdc430f482864f0fcd51cea6ef90319c74c85ca7cba1303";

/**
 * Figures recorded in the checked-in counts file for the full pack.
 * Slim land omitted the event and result files. These numbers are not published
 * as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 899;
export const FULL_PACK_DOCUMENTED_RESULTS = 103648;

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "3c7784c2dfaefc2dd134cbf7674161b8a56afd308c1e7398d5db79460b53c996";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";
export const COUNTRY_NAME = "United Kingdom";
export const HOLD_STATUS = "open";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/united-kingdom/ACCEPTANCE_EXAMPLES.md": "fa97c8f7380cae46f3d6761795c3aac1fae2903e77b90cf115cda57f1b473228",
  "docs/phase1/united-kingdom/DRAFT_TIERS.md": "0d6e1cfbee3fd8911ee89d1d6164947bd64ebe0ef30060f242d781245f34703b",
  "docs/phase1/united-kingdom/ELECTORAL_MECHANISMS.md": "943afd1bfffa45591e73794121f606155abf2b883b3a5b296e0393d0c0e7b62f",
  "docs/phase1/united-kingdom/FIELD_MAP_223.md": "7d2dd2b0ad15bd3b41fcfef4c94f06f37be24207893b2e8e7747eddd066c1a0c",
  "docs/phase1/united-kingdom/HISTORY_COVERAGE.md": "0bb344cd2a9e5d5d0fc9a25a51889973cfc93b4f246fa714d226d8b4d7c0abe3",
  "docs/phase1/united-kingdom/IDENTITY_RULES.md": "6340339b0755f13f056a06d1fa26b34245b789da51d5ca290d66ac51d9c2eadd",
  "docs/phase1/united-kingdom/JUSTIN_ACCEPTANCE.md": "268df635c54742d47c5899d30d8069e302f244b030a0c2bcf9c777405390b18b",
  "docs/phase1/united-kingdom/JUSTIN_REPORT.md": "2b2e79eb52da46dbed086d2150d7171984f3d7f18c3a35b13625f3c4b73b8b19",
  "docs/phase1/united-kingdom/OFFICE_REGISTER.md": "6b3a8f9c9375e901d017c8ea5349d2d44b6ab9f9dea7e2926e091d20c0de20d2",
  "docs/phase1/united-kingdom/README.md": "7e880f8db8cbef237d052e092cc8cf87d6249f631161bf102395d7e4652030c8",
  "docs/phase1/united-kingdom/United_Kingdom_Import.md": "668998ae4c188a3a885537bccd6d0dc8a0c7957cc480ead1281b6119a302fb49",
  "docs/phase1/united-kingdom/RESEARCH_GAPS.md": "34e478ec5ee81b6943c3e358bdbfae47f5813d4e6249265a986eb198b0b9d413",
  "docs/phase1/united-kingdom/SHA256SUMS": "ba5d92e30e514eb0b5a8c0777b6d6dfdd75b86df83ed5aa66b72c84da65c907a",
  "docs/phase1/united-kingdom/SLIM_LAND_NOTE.md": "ab808337dd53e189862f1e935e50cafa39335628626d7966c76920219b08df41",
  "docs/phase1/united-kingdom/SOURCE_INVENTORY.md": "719a589bfe59fbfc7515c8c3cc695d70930f36926de70291fd98fe9f4d1e5573",
  "docs/phase1/united-kingdom/acceptance-examples.jsonl": "bbdd1eb0e17da38ef0c4137282d9b13026f1602b5bc09f66ae631848f4b26723",
  "docs/phase1/united-kingdom/contract/columns.json": "50ab3013ed9bdcb9b878356ce3c2f17bc5a2a37fa80e4746332fb82483d4e833",
  "docs/phase1/united-kingdom/contract/field-map-223.jsonl": "0251e1a66b2945da20b6a9ffd87b771aa89a09da30f23da23e9f7c9abf5e9a87",
  [COUNTS_RELATIVE]: "113144002eaf4251662372838d9ad81a306d59ea2d69fe75af3ea5427ab67730",
  [DRAFT_TIERS_RELATIVE]: "3b40dba4fc49d6cdb0809fc8ddd00723571d4e3a5fe03dc7f81c3a88cbf2fc89",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [METADATA_RELATIVE]: "413abfc089c37136080cd48ffa0d7ddd6054c4978f5fd194cdbecb6646447af3",
  [RESEARCH_GAPS_JSONL_RELATIVE]: "302a08fc071dd587765e18929e7f3f9cbf70f59bc6c63627cd3ba05171825b1f",
  "docs/phase1/united-kingdom/source-inventory.jsonl": "d8eb24d67df88caf817d05951e5f1fbe76c97fb043b7da11a4bcc3b052dff5ef",
  "docs/phase1/united-kingdom/validation-report.json": "bdb7785c2b1c32fb133cb57e07cfef8970e2dcda8594302b2dcd4c74eb6d1692",
  [TIER_PATH]: TIER_SHA256,
};

export const PRINCIPAL_OFFICE_TYPES = [
  "unitary_council",
  "isles_of_scilly_council",
  "district_council",
  "metropolitan_borough_council",
  "city_of_london_common_council",
  "london_borough_council",
  "ni_local_council",
  "scottish_council",
  "welsh_principal_council",
  "county_council",
] as const;

export const ALLOWED_OFFICE_TYPES = [
  ...PRINCIPAL_OFFICE_TYPES,
  "national_lower_chamber",
  "devolved_legislature",
  "london_assembly",
  "direct_local_mayor",
  "direct_strategic_authority_mayor",
  "direct_london_mayor",
  "direct_policing_commissioner",
  "elected_aldermanic_body",
  "elected_national_park_component",
  "elected_regulatory_component",
  "parish_council",
  "town_council",
  "shadow_unitary_council",
  "historical_european_parliament_delegation",
  "historical_direct_mayor",
  "historical_district_council",
  "historical_county_council",
] as const;

export type UnitedKingdomRegisterStatus = "current" | "current_shadow" | "historical_only";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const PRINCIPAL_TYPE_SET = new Set<string>(PRINCIPAL_OFFICE_TYPES);

const FORBIDDEN_OFFICE = /LORDS|MONARCH|PRIME[-_ ]?MINISTER|\bCABINET\b|JERSEY|GUERNSEY|ISLE[-_ ]OF[-_ ]MAN|GIBRALTAR|BRITISH[-_ ]OVERSEAS|CROWN[-_ ]DEPENDENC/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted United Kingdom office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) {
    throw new Error(`Refusing excluded United Kingdom office ${officeId}`);
  }
}

export function isPrincipalCouncilType(officeType: string): boolean {
  return PRINCIPAL_TYPE_SET.has(officeType);
}

/** Atlas SQL interchange of a supplied numeric tier. The numeric tier stays on the row. */
export function schemaInterchangeTier(draftTier: number): "national_context" | "regional" | "municipal" {
  if (draftTier === 1) return "national_context";
  if (draftTier === 2 || draftTier === 3) return "regional";
  if (draftTier === 4) return "municipal";
  throw new Error(`Unsupported United Kingdom numeric tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: UnitedKingdomRegisterStatus): "current" | "historical" {
  if (registerStatus === "current" || registerStatus === "current_shadow") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported United Kingdom register status ${String(registerStatus)}`);
}

export function usesCountryGeography(officeId: string): boolean {
  return officeId === COMMONS_ID || officeId === EP_ID;
}

export const HOLD_IDS = [
  "G01",
  "G02",
  "G03",
  "G04",
  "G05",
  "G06",
  "G07",
  "G08",
  "G09",
  "G10",
  "G11",
  "G12",
  "G13",
  "G14",
  "G15",
  "G16",
  "G17",
  "G18",
  "G19",
  "G20",
  "G21",
  "G22",
  "G23",
  "G24",
  "G25",
  "G26",
  "G27",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "81 schema-regional offices are supplied numeric tiers 2 (5) and 3 (76), preserved on each row. Holds G01–G27 stay open. No successor edges. Slim land publishes 0 events and 0 result rows; those omitted files are not invented.";

export const COUNTRY_NOTES = [
  "Prompt AU: 482 current offices, 2 current_shadow Surrey authorities, and 26 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Numeric draft tiers stay 2 / 5 / 76 / 427. They are preserved on each classification row.",
  "The schema tier column is the required Atlas interchange: tier 1 national_context, tiers 2 and 3 regional, tier 4 municipal, other 0. It does not replace the numeric label.",
  "Current direct executives: 64 (27 direct mayors + 37 standalone PCC/PFCC). Operational principal councils stay 382. The parish/town subset stays 27.",
  "Published events: 0. Published result rows: 0. Omitted results and events are not reconstructed and are not given omitted-total counters.",
  "Successor edges stay 0. Reorganisation labels do not become successor edges.",
  "The historical EP delegation stays historical-only. No post-Brexit EP office. Crown Dependencies, BOT offices, Lords, the monarch, and the Prime Minister stay absent.",
  "Two Surrey shadow authorities stay current_shadow and outside the 382 operational councils. SQL office_status stores them as current because the schema has no shadow value; state_note keeps current_shadow.",
  "Every classification stays needs_review. Per-office draft review_status stays draft_unapproved and justin_approved stays false.",
  "Holds G01 through G27 stay open.",
  "One explicit Isles of Scilly next date (2029-05-03) is retained from the office register. It is not a prospective event.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 510,
  current_offices: 482,
  current_shadow_offices: 2,
  historical_offices: 26,
  geographies: 496,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_1: 2,
  draft_tier_2: 5,
  draft_tier_3: 76,
  draft_tier_4: 427,
  schema_national: 2,
  schema_regional: 81,
  schema_municipal: 427,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 510,
  sources: 0,
  unresolved_evidence: 27,
  named_holds: 27,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 26,
  research_dates: 1,
  direct_executive_offices: 64,
  historical_direct_executives: 7,
  direct_mayors: 27,
  direct_local_mayors: 13,
  direct_strategic_mayors: 13,
  direct_london_mayors: 1,
  standalone_pcc: 37,
  principal_councils: 382,
  england_principal: 317,
  northern_ireland_principal: 11,
  scotland_principal: 32,
  wales_principal: 22,
  parish_town_councils: 27,
  parish_councils: 24,
  town_councils: 3,
  devolved_legislatures: 3,
  london_assembly: 1,
  commons_offices: 1,
  historical_ep_offices: 1,
  current_ep_offices: 0,
  special_components: 4,
  shadow_authorities: 2,
  current_collective_bodies: 418,
  evidence_links: 0,
  england_current: 406,
  england_shadow: 2,
  england_historical: 25,
  scotland_current: 36,
  wales_current: 27,
  northern_ireland_current: 12,
  united_kingdom_current: 1,
  united_kingdom_historical: 1,
} as const;

export type UnitedKingdomHashInputs = {
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

export function unitedKingdomUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): UnitedKingdomHashInputs {
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

export function fingerprintSha256(hashInputs: UnitedKingdomHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
