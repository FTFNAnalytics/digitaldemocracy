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
  geographyIdFor,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export {
  canonical,
  dateId,
  geographyIdFor,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

/** Namespace supplied by Prompt BA metadata.json. Current and historical rows share it. */
export const CURRENT_NAMESPACE = OFFICE_NAMESPACE;
export const LINEAGE_ID = "country-package-albania";
export const SOURCE_NAMESPACE = "country-package-albania";
export const COUNTRY_ID = "albania";
export const COUNTRY_CODE = "AL";
export const COUNTRY_NAME = "Albania";
export const ADAPTER_VERSION = "atlas-albania-prompt-ba/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/albania.json";
export const DOCS_PREFIX = "docs/phase1/albania";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/albania/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/albania/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/albania/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/albania/data/research-gaps.json";
export const TRANSITIONS_RELATIVE = "docs/phase1/albania/data/transition-relations.json";
export const IDENTITY_CROSSWALK_RELATIVE = "docs/phase1/albania/data/identity-crosswalk.json";
export const METADATA_RELATIVE = "docs/phase1/albania/metadata.json";
export const APPROVAL_STATE_RELATIVE = "docs/phase1/albania/data/approval-state.json";
/** Documentary Phase 1 classifier. Not the published classification set. */
export const PHASE1_APPROVED_TIER_PATH = "docs/phase1/albania/Phase1_approved_tiers.json";
export const PHASE1_APPROVED_TIER_SHA256 = "53a31d441761952a9f511c58a397e7877616c0ad6af30dce7587bcb6bcbbd93d";
export const PHASE1_PACKAGE_PREFIX = "data/countries/albania";

/**
 * Full-pack results, events, and source extracts are not in the slim land.
 * Do not invent those files or omitted-total counters.
 * The Phase 1 country package stays on disk as prior research. It is not the publish source.
 */
export const OMITTED_RESEARCH_DIR = "data/research/albania";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/albania/sources",
  "docs/phase1/albania/data/events.jsonl",
  "docs/phase1/albania/data/results.jsonl",
] as const;

export const TIER_SHA256 = "38534cec38c039c6807c4b2347fb46bf172ea20aa2252735ca6a6d26a362c8ae";
export const DRAFT_TIERS_SHA256 = "e30634545547376cc5271fbd7c281fec483ebc30e518276e1e78d1eec349e965";
export const OFFICE_REGISTER_SHA256 = "27a3b85eddb28616731aa73425367aa46f20af27480ee3483fdb38a07bba79b2";

/**
 * Figures recorded in the checked-in counts file for the full pack.
 * Slim land omitted the event, result, and source-extract files. These numbers
 * are not published as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 1180;
export const FULL_PACK_DOCUMENTED_RESULTS = 8229;
export const FULL_PACK_DOCUMENTED_SOURCES = 169;
export const PHASE1_DOCUMENTED_OFFICES = 122;

/**
 * Pinned after the slim-pack inventory scan. Tests fail closed if the bytes drift.
 * Placeholder until the first scan; import.ts refuses a mismatch.
 */
export const CANDIDATE_FINGERPRINT = "160c2029406de7e82ebaac29bf77099aaa357933ae27fd07102550c3d4b3ee9a";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-24";

export const ASSEMBLY_ID = "AL-NAT-ASSEMBLY";
export const DIMAL_MAYOR_ID = "AL-05-M";
export const DIMAL_COUNCIL_ID = "AL-05-C";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/albania/Albania_Acceptance_Examples.md": "7076f9525806016cee4a816b6db647e7f935a96819a5f8acdc8509000a7367b1",
  "docs/phase1/albania/Albania_Coverage.md": "a70948157b4605f256c1221e23cb838214fe1a142094ceeba3a968cf56f30cd7",
  "docs/phase1/albania/Albania_Field_Map.md": "46c5cd1a352aaa1fcd1ec70b04e029b478ce90c45059d487033fdec056102c4c",
  "docs/phase1/albania/Albania_Identity_Rules.md": "c9e270c4ea73b8c9a190b0f3376ebecf7fc5f83826ca0a9bfa8123e4d714c226",
  "docs/phase1/albania/Albania_Import.md": "fa12e12b02d89c47f20b0397e235a302e0c2d6bf363b91db18c51ce21f883e43",
  "docs/phase1/albania/Albania_Office_Register.md": "c2105882ff375f3ae1e1fa7ab6a4fa5550b9bc9e7cb3687cae7870c109f967be",
  "docs/phase1/albania/Albania_Research_Gaps.md": "6316cf8b9e444820e868e7853a9b6f3d89bed9b98016c99ccaa8ae5762841811",
  "docs/phase1/albania/Albania_Source_Inventory.md": "f80bfeda7114314ff4caa30cc3ed97b43747f369e8813afe689fde0cf03f0c0a",
  "docs/phase1/albania/JUSTIN_ACCEPTANCE.md": "2fe623a6d3d0105d9fd4bc0984b2fc0a2207977840b980c51756140dfc5d43c8",
  "docs/phase1/albania/JUSTIN_REPORT.md": "4da9251c2ebbdd46263666b5d3622cac10ae6c7330aeeb45eee0dc8a0bd2d9bb",
  [PHASE1_APPROVED_TIER_PATH]: PHASE1_APPROVED_TIER_SHA256,
  "docs/phase1/albania/Prompt_BA_Full_Register_Field_Map_and_CI.md": "3682b9991aea9d1b426d5f84827cfbbbd61162e059a96987e9b7586aa8d5e67c",
  "docs/phase1/albania/README.md": "d71355f50d329570bebc278e9f961c3bb58b1e3d2b1dd36a1753bdcedb5f3900",
  "docs/phase1/albania/SHA256SUMS": "d711fe7f6091eb8e421899c7ce473c176cbd67628420e68dbb393078004226a2",
  "docs/phase1/albania/SLIM_LAND_NOTE.md": "ac61aa9714020e006a417aa87626e6100c0d4bd213f8d8946a2382fef820b8ae",
  "docs/phase1/albania/contracts/column-map.json": "8da5be508c248833242f6da67fd834117db52cd4b39aa8fa1735e4fe7a7d2ad2",
  "docs/phase1/albania/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/albania/data/2025-preliminary-comparison.json": "70020aa5fd41b1f11cdb1ca4a2a3e6ea1ede690c38669fcc70a11e5b73a906ed",
  "docs/phase1/albania/data/acceptance-examples.json": "579bcf6fad0343311b91d72f1593f2a79d161a1c832b7e4c90759321d14bc52f",
  [APPROVAL_STATE_RELATIVE]: "e37f473dcc1c3a59f55ff4b8e5c304a95a69a0a6c89814acd65be80f7183e9d6",
  "docs/phase1/albania/data/arithmetic-diagnostics.json": "b5cee6773dcdb37506ba724faa24fa90df51ef7bcdbfb5cb2267a0865326549f",
  "docs/phase1/albania/data/baseline-reconciliation.json": "4e156fdfde6bc25950d689be32fdb350002c4718a3defb3636cd4d8643b8bc75",
  [COUNTS_RELATIVE]: "c5c7e18269a730e1c6ffc52c3281920ddeb5ec9683b5c9d8d128d707d07e90a5",
  "docs/phase1/albania/data/current-register-reconciliation.json": "461aebf071cc4b28536cbe7b89257654912e3b8eeed742540d63c18f0a76834d",
  "docs/phase1/albania/data/cycle-outlook.json": "dbea0f277a5b2e2c3bdedf8c86fe8c595960d79752db44cfd48e547271f082de",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  "docs/phase1/albania/data/historical-2011-blank-seat-cells.json": "b5cc6289cbb2bfbf5e124820aae2c7069d54c84888215475974d27dc6911cde1",
  "docs/phase1/albania/data/historical-2011-unresolved-proceedings.json": "ee0609028c8e72676f4bbe067868ccb6ea20da6f67da68c5885019d1b80e8918",
  [IDENTITY_CROSSWALK_RELATIVE]: "042cbd1ca4bbcb62a11521c531dc33cf12f4fd2cdbb52cfb95145e11f4f8cf5d",
  "docs/phase1/albania/data/input-inventory.json": "2f85429a595b24ca5440285479a041e609976a2e2a777abffd0e2f141649ad6f",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "37c5d86395743d02f937e372659f62c90672d62f012e728e373a34c66a88e7a8",
  "docs/phase1/albania/data/source-inventory.json": "c4bd76929010159ee99046a2a0f8905e3ddd169da5eaa3569ac4fd67da3561b2",
  [TRANSITIONS_RELATIVE]: "18e0a8c8f79ae400c24e15f39a38ee4c9874693e5983fbb80eb05e12fd5eb8d0",
  [METADATA_RELATIVE]: "e6a593ea797c4320ec208575ec9e4c4bcfe2d4592b5cb312052ecef6e26f9921",
  "docs/phase1/albania/reference/Prior_Albania_Field_Map.md": "b2386dc56c19fccb13f91c8acd2b07a1f662a6a6f7b8da5abe55149b3e4c27fb",
  "docs/phase1/albania/reference/Prior_Albania_Identity_Rules.md": "def15d98a8bf41cad8623bc09b65ee55af499edb2dc1c4c65a41216d95ed4d0c",
  "docs/phase1/albania/validate.py": "e332d68120dd5199deb7ac74ad77c9e2a9b4760dcb2c13ea37ac2b3db54aeff9",
  "docs/phase1/albania/validation-report.json": "421342fb3ffa0b4b7ecbe97f0fcc122b9719d3961babc8e569ca5751a8761182",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "national_legislature",
  "municipal_council",
  "mayor",
  "borough_council",
  "borough_mayor",
] as const;

export const DIRECT_EXECUTIVE_TYPES = ["mayor", "borough_mayor"] as const;
export const COUNCIL_TYPES = ["national_legislature", "municipal_council", "borough_council"] as const;

export type AlbaniaRegisterStatus = "current" | "historical_only";
export type AlbaniaDraftTier = "national" | "municipal" | "other";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "office_id",
  "country_code",
  "country_id",
  "name",
  "geography",
  "geography_id",
  "territorial_unit_id",
  "office_type",
  "status",
  "tier_scope",
  "selection_mode",
  "direct_executive",
  "term_years",
  "next_polling_date",
  "territory_vintage",
  "parent_office_ids",
  "source_ids",
  "legacy_office_id",
  "identity_status",
  "district_source_label",
  "qark_source_label",
  "seats_2011",
  "seats_current",
]);

const FORBIDDEN_OFFICE =
  /european parliament|president of the republic|presidenti i republik|kryetar i republik|qark council|prefecture|prefekt/i;

/** Phase 1 bridge label for offices that already carry a frozen geography id. */
const SUPPLIED_GEOGRAPHY_LABEL: Readonly<Record<string, string>> = {
  mayor: "Mayor",
  municipal_council: "Municipal council",
};

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Albania office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack) || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing excluded Albania office ${officeId}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  for (const key of Object.keys(row)) {
    if (!REGISTER_KEYS.has(key)) {
      throw new Error(`Refusing undocumented Albania office field ${key} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(key)) {
      throw new Error(`Refusing Albania successor field ${key} on ${officeId}`);
    }
  }
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "municipal" | "other" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  if (draftTier === "other") return "other";
  throw new Error(`Unsupported Albania draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: AlbaniaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Albania register status ${String(registerStatus)}`);
}

export function isDirectExecutiveType(officeType: string): boolean {
  return (DIRECT_EXECUTIVE_TYPES as readonly string[]).includes(officeType);
}

export function isCouncilType(officeType: string): boolean {
  return (COUNCIL_TYPES as readonly string[]).includes(officeType);
}

/**
 * SQL geography_id is not nullable. Supplied ids are kept exactly.
 * A null register geography_id is bound with the existing bridge key of the
 * supplied geography name and office id. That binding is not a researched
 * geography identity and is not a successor edge.
 */
export function publishGeographyId(geographyName: string, officeId: string, supplied: unknown, officeType: string): {
  geographyId: string;
  supplied: boolean;
} {
  if (typeof supplied === "string" && supplied.trim()) {
    const label = SUPPLIED_GEOGRAPHY_LABEL[officeType];
    if (!label) {
      throw new Error(`Office ${officeId} carries a geography id but is not a current municipal office`);
    }
    const expected = geographyIdFor(geographyName, label);
    if (supplied !== expected) {
      throw new Error(`Office ${officeId} geography id does not match the frozen Phase 1 bridge`);
    }
    return { geographyId: supplied, supplied: true };
  }
  return { geographyId: geographyIdFor(geographyName, officeId), supplied: false };
}

export const OPEN_HOLD_IDS = [
  "AL-BA-G01",
  "AL-BA-G02",
  "AL-BA-G03",
  "AL-BA-G04",
  "AL-BA-G05",
  "AL-BA-G06",
  "AL-BA-G07",
  "AL-BA-G08",
  "AL-BA-G09",
  "AL-BA-G10",
  "AL-BA-G11",
  "AL-BA-G12",
  "AL-BA-G13",
  "AL-BA-G14",
  "AL-BA-G15",
  "AL-BA-G16",
  "AL-BA-G17",
  "AL-BA-G18",
  "AL-BA-G19",
  "AL-BA-G20",
  "AL-BA-G21",
] as const;
export const GAP_IDS = OPEN_HOLD_IDS;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "AL-BA-G01": "policy_confirmed",
  "AL-BA-G02": "policy_confirmed",
  "AL-BA-G03": "research_hold",
  "AL-BA-G04": "partial_resolution",
  "AL-BA-G05": "research_hold",
  "AL-BA-G06": "policy_confirmed",
  "AL-BA-G07": "policy_confirmed",
  "AL-BA-G08": "partial_resolution",
  "AL-BA-G09": "research_hold",
  "AL-BA-G10": "policy_confirmed",
  "AL-BA-G11": "research_hold",
  "AL-BA-G12": "research_hold",
  "AL-BA-G13": "research_hold",
  "AL-BA-G14": "research_hold",
  "AL-BA-G15": "partial_resolution",
  "AL-BA-G16": "research_hold",
  "AL-BA-G17": "research_hold",
  "AL-BA-G18": "research_hold",
  "AL-BA-G19": "research_hold",
  "AL-BA-G20": "research_hold",
  "AL-BA-G21": "research_hold",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. Popular qark and prefecture offices stay 0. Holds AL-BA-G01 through AL-BA-G21 stay open. No successor edges. Slim land publishes 0 events and 0 result rows; those omitted files are not invented.";

export const COUNTRY_NOTES = [
  "Prompt BA: 123 current offices and 768 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 1 national, 868 municipal, and 22 other. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, keeps municipal, and keeps other. It does not replace the draft label.",
  "Current offices are the Assembly, 61 municipal councils, and 61 directly elected mayors. Popular presidential offices stay 0. European Parliament offices stay 0. Popular regional offices stay 0.",
  "Historical-only rows are 2011 source-vintage identities, not 768 proved abolitions.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted results, events, and source extracts are not reconstructed and are not given omitted-total counters.",
  "office_successor_edges stays empty. The Dimal rename does not create a new office or a successor edge. Phase 1 approved tiers stay documentary.",
  "Every classification stays needs_review. Per-office file review_status stays draft_unapproved and justin_approved stays false.",
  "Holds AL-BA-G01 through AL-BA-G21 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 891,
  current_offices: 123,
  historical_offices: 768,
  geographies: 891,
  supplied_geography_ids: 122,
  schema_bound_geographies: 769,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 1,
  draft_tier_municipal: 868,
  draft_tier_other: 22,
  schema_national: 1,
  schema_regional: 0,
  schema_municipal: 868,
  schema_other: 22,
  approved_classifications: 0,
  needs_review_classifications: 891,
  sources: 0,
  unresolved_evidence: 21,
  named_open_holds: 21,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 40,
  research_dates: 0,
  current_direct_executives: 61,
  historical_direct_executives: 384,
  current_mayors: 61,
  current_councils: 61,
  current_national: 1,
  historical_borough_offices: 22,
  ep_offices: 0,
  popular_presidential_offices: 0,
  popular_regional_offices: 0,
  phase1_ids_still_current: 122,
  evidence_links: 0,
  regional_offices: 0,
  municipal_offices: 868,
} as const;

export type AlbaniaHashInputs = {
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

export function albaniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): AlbaniaHashInputs {
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

export function fingerprintSha256(hashInputs: AlbaniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
