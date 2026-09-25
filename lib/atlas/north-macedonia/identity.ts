import {
  ATTEMPT_LOG_SCHEMA_PATH,
  ATTEMPT_LOG_SHA256,
  CANONICALIZATION,
  HASH_ALGORITHM,
  MASTER_SCHEMA_PATH,
  MASTER_SCHEMA_SHA256,
  SCHEMA_VERSION,
  canonical,
  key,
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export {
  canonical,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  sha256Hex,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

export const CURRENT_NAMESPACE = "north-macedonia-research-az-v1";
export const LINEAGE_ID = "country-package-north-macedonia";
export const SOURCE_NAMESPACE = "country-package-north-macedonia";
export const COUNTRY_ID = "north-macedonia";
export const COUNTRY_CODE = "MK";
export const COUNTRY_NAME = "North Macedonia";
export const ADAPTER_VERSION = "atlas-north-macedonia-prompt-az/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/north-macedonia.json";
export const DOCS_PREFIX = "docs/phase1/north-macedonia";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/north-macedonia/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/north-macedonia/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/north-macedonia/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/north-macedonia/data/research-gaps.json";
export const TRANSITIONS_RELATIVE = "docs/phase1/north-macedonia/data/transition-relations.json";
export const METADATA_RELATIVE = "docs/phase1/north-macedonia/metadata.json";
export const APPROVAL_STATE_RELATIVE = "docs/phase1/north-macedonia/data/approval-state.json";
export const SOURCE_INVENTORY_RELATIVE = "docs/phase1/north-macedonia/data/source-inventory.json";
export const OMITTED_RESEARCH_DIR = "data/research/north-macedonia";
export const OMITTED_PACK_PATHS = [
  "docs/phase1/north-macedonia/sources",
  "docs/phase1/north-macedonia/data/events.jsonl",
  "docs/phase1/north-macedonia/data/results.jsonl",
] as const;

export const PARLIAMENT_ID = "MK-NAT-PARLIAMENT";
export const PRESIDENT_ID = "MK-NAT-PRESIDENT";
export const BRVENICA_MAYOR_ID = "MK-LOC-BRVENICA-MAYOR";
export const BRVENICA_NEXT_DATE_LABEL = "2026-10-18";
export const NATIONAL_PACK_GEOGRAPHY_ID = "MK";
export const SKOPJE_PACK_GEOGRAPHY_ID = "MK-GEO-CITY-OF-SKOPJE";

export const TIER_SHA256 = "3910a381b31456f4a46e52c39825012cb3b1f92c1e4c18ab501a9a713991572d";
export const DRAFT_TIERS_SHA256 = "61335b650f482f461b8545785f24dd8d404087efeca34c9d6dd681c8f4033dea";
export const OFFICE_REGISTER_SHA256 = "1c68f7e09e65701f60d2a91d33643688c67ac0ed72a26abe84615695c7a4762a";

export const FULL_PACK_DOCUMENTED_EVENTS = 813;
export const FULL_PACK_DOCUMENTED_RESULTS = 1700;
export const FULL_PACK_DOCUMENTED_SOURCES = 222;

export const CANDIDATE_FINGERPRINT = "fc04d7bffe18bd866e8d84bec850cf78d2e1e10b0914887c1c3ecaf5c023c4f9";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;
export const RESEARCH_SNAPSHOT_LABEL = "2026-09-24";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/north-macedonia/JUSTIN_ACCEPTANCE.md": "54cd89d9a06a390209cfda91e74c5d80431b0348b41b1487a8f3f46c60b41af3",
  "docs/phase1/north-macedonia/JUSTIN_REPORT.md": "7087960926513609173cd23c2b2d59c4d2e4b2749ea3a0536ea38d386a40826d",
  "docs/phase1/north-macedonia/North_Macedonia_Acceptance_Examples.md": "5d6f26a65e0d2fde9a85d0df292db7ac6153c1cb9d08ab0d0208730b0d7876fe",
  "docs/phase1/north-macedonia/North_Macedonia_Coverage.md": "24a1a2b009fc65bedd1c1c152b98e9c699760b9bbf857616b526edcad595e724",
  "docs/phase1/north-macedonia/North_Macedonia_Field_Map.md": "17a4c96db42641295b4c490f1985a0ef874684f0ffc16c5ed578d9b86cc5469d",
  "docs/phase1/north-macedonia/North_Macedonia_Identity_Rules.md": "9eee5a0c516ad2690cbe5ba5697439e98b75c65c0d78190041a8f76f159c10d5",
  "docs/phase1/north-macedonia/North_Macedonia_Import.md": "967b1b941bc586b8a7a1da5fce91aaaf093da3dda1ad96466a9feb472441f113",
  "docs/phase1/north-macedonia/North_Macedonia_Office_Register.md": "8907f22d563a190aa6c376995d22e2d017af3eb11ededa8136667ad74391645b",
  "docs/phase1/north-macedonia/North_Macedonia_Research_Gaps.md": "ed492367190e526c2f0de6f483c76fa213247bb52a2c0a79be9896a0c0dd5645",
  "docs/phase1/north-macedonia/North_Macedonia_Source_Inventory.md": "4ff44e071a2d0820d3aa904fc62a86989a73b7ddd938dcafc77298777a7af587",
  "docs/phase1/north-macedonia/Prompt_AZ_Full_Register_Field_Map_and_CI.md": "599a53fee7c173efce84202b8225044b353beee406fbe43aee5ffadd4639bbe1",
  "docs/phase1/north-macedonia/README.md": "d473fee5c4e432fd84703e608da07befba4467e1de2c9ac46bec73f1e46c142f",
  "docs/phase1/north-macedonia/SHA256SUMS": "3c3d170ac48c08d34547fc3e03760efeac9ed2a3ffe23698dbe2fb5581b70d22",
  "docs/phase1/north-macedonia/SLIM_LAND_NOTE.md": "a796b5469f8a329a656cb7967ff739b3050a2f8bdb2245c4d855f4c3ff5df108",
  "docs/phase1/north-macedonia/contracts/Contract_Reference.md": "65792a7b03c8157bd80f3cbd3329e1f0bfb4e3ee753d71bfac30a6e6a93a092c",
  "docs/phase1/north-macedonia/contracts/column-map.json": "10c3dd2c545ceb476a39afef8513847cbf6ddd4a7a9edd92fe90c2c8b8c5b729",
  "docs/phase1/north-macedonia/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/north-macedonia/data/acceptance-vectors.json": "ee4ccab9bd57e2680d1169c64205452fc72f146eb4b00bffb13c9c7c828a1e38",
  "docs/phase1/north-macedonia/data/approval-state.json": "7911de7f3f9eb8a67c5fc1b0c02b366b916ec8d2ccd8ad26094f2bef91ebcc5a",
  "docs/phase1/north-macedonia/data/arithmetic-diagnostics.json": "3002a9571fb1f6a9d9be54190c6ef01c907aa9f62323dacc6facc5e4ca62410b",
  "docs/phase1/north-macedonia/data/counts.json": "0e6b83746906ee680da8cad64003b87f99f2982441c185f9633e75e65c144f56",
  "docs/phase1/north-macedonia/data/draft-tiers.jsonl": "61335b650f482f461b8545785f24dd8d404087efeca34c9d6dd681c8f4033dea",
  "docs/phase1/north-macedonia/data/elected-rosters-2025.json": "96288cb5deb4b23ae86fd5e4a2b52d60288468d4cb38fed915990e051b196ea3",
  "docs/phase1/north-macedonia/data/municipalities.json": "c5f18d1e3f5aee9957bab77efad10b8c8e48db6c757e94ce8065b72c64df128a",
  "docs/phase1/north-macedonia/data/office-register.jsonl": "1c68f7e09e65701f60d2a91d33643688c67ac0ed72a26abe84615695c7a4762a",
  "docs/phase1/north-macedonia/data/research-gaps.json": "a16ee61960b41ed65c782b703deaa1c567a18d80dbbdc7d82dd402afd43e1dc1",
  "docs/phase1/north-macedonia/data/source-inventory.json": "c4e6fe0e8526d2a5e4f52e81c0b22fb7aa8e8c521543b909a5d6b58381823187",
  "docs/phase1/north-macedonia/data/supplemental-cycle-results.json": "d2ba06ac7bfbd048bff74e3d16d2cd1229a1fbfef7e93767fdcaef3fcf9e3eeb",
  "docs/phase1/north-macedonia/data/transition-relations.json": "24024504e3d2b188bf8272b7270c4d7097d35a9337451b7e7593763d1eabf9ab",
  "docs/phase1/north-macedonia/metadata.json": "f4db4cef32394fb4d6b46432bac1cd93accadbd015f7969cb3193dd1a7a12991",
  "docs/phase1/north-macedonia/validate.py": "44489f3e0c1d8c1f66c629887a76842d2fb70981a60453fa9eec80bc23632fac",
  "docs/phase1/north-macedonia/validation-report.json": "0c68aa2dde9faf127e75f8d975ebdea92f0cfc7f8bcb575e1f67b994d97c00d4",
  "schemas/atlas/tiers/north-macedonia.json": "3910a381b31456f4a46e52c39825012cb3b1f92c1e4c18ab501a9a713991572d",
};

export const ALLOWED_OFFICE_TYPES = ["national_legislature", "president", "municipal_council", "mayor"] as const;

export type NorthMacedoniaRegisterStatus = "current" | "historical_only";
export type NorthMacedoniaDraftTier = "national" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "direct_executive",
  "geography",
  "geography_id",
  "id_namespace",
  "name",
  "next_date_label",
  "office_id",
  "office_type",
  "parent_geography_id",
  "selection_mode",
  "source_ids",
  "state_note",
  "status",
  "tier_scope",
]);
const HISTORICAL_OFFICE_IDS = new Set([
  "MK-LOC-DRUGOVO-COUNCIL",
  "MK-LOC-DRUGOVO-MAYOR",
  "MK-LOC-VRANESHTICA-COUNCIL",
  "MK-LOC-VRANESHTICA-MAYOR",
  "MK-LOC-ZAJAS-COUNCIL",
  "MK-LOC-ZAJAS-MAYOR",
  "MK-LOC-OSLOMEJ-COUNCIL",
  "MK-LOC-OSLOMEJ-MAYOR",
]);

const FORBIDDEN_OFFICE = /european parliament|evropski parlament/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted North Macedonia office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack) || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing excluded North Macedonia office ${officeId}`);
  }
  if (officeType === "president" && officeId !== PRESIDENT_ID) {
    throw new Error(`Refusing a president office that is not ${PRESIDENT_ID}`);
  }
  if (officeType === "national_legislature" && officeId !== PARLIAMENT_ID) {
    throw new Error(`Refusing a national legislature that is not ${PARLIAMENT_ID}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  for (const field of Object.keys(row)) {
    if (!REGISTER_KEYS.has(field)) {
      throw new Error(`Refusing undocumented North Macedonia office field ${field} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(field)) {
      throw new Error(`Refusing North Macedonia successor field ${field} on ${officeId}`);
    }
  }
}

export function isHistoricalOffice(officeId: string): boolean {
  return HISTORICAL_OFFICE_IDS.has(officeId);
}

export function schemaInterchangeTier(draftTier: string): "national_context" | "municipal" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported North Macedonia draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: NorthMacedoniaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported North Macedonia register status ${String(registerStatus)}`);
}

export function geographyIdForPackId(packGeographyId: string): string {
  return key("geo", ["north-macedonia", packGeographyId]);
}

export const GAP_FILE_ORDER = [
  "MK-AZ-G01",
  "MK-AZ-G02",
  "MK-AZ-G03",
  "MK-AZ-G04",
  "MK-AZ-G05",
  "MK-AZ-G06",
  "MK-AZ-G07",
  "MK-AZ-G08",
  "MK-AZ-G09",
  "MK-AZ-G10",
  "MK-AZ-G11",
  "MK-AZ-G12",
  "MK-AZ-G13",
  "MK-AZ-G14",
  "MK-AZ-G15",
  "MK-AZ-G16",
  "MK-AZ-G17",
  "MK-AZ-G18",
  "MK-AZ-G19",
  "MK-AZ-G20",
  "MK-AZ-G21",
  "MK-AZ-G22",
  "MK-AZ-G23",
] as const;

export const GAP_TOPICS = [
  "presidential-runoff",
  "mayor-selection-mode",
  "skopje-nesting",
  "municipal-reforms-2004",
  "municipal-reforms-2013",
  "name-change-2019",
  "no-ep",
  "independence-and-1991-president",
  "local-council-history",
  "local-mayor-history",
  "2026-repeated-mayors",
  "current-law-original",
  "ministry-directory-omission",
  "certification-2025",
  "national-2014-runoff-conflict",
  "national-arithmetic",
  "portal-reconstruction-conflict",
  "debar-2021-date",
  "blank-dash-and-seats",
  "older-national-history",
  "2013-runoffs",
  "future-cycles",
  "2017-anomalous-share-tokens",
] as const;

export const OPEN_HOLD_IDS = [
  "MK-AZ-G01",
  "MK-AZ-G04",
  "MK-AZ-G05",
  "MK-AZ-G09",
  "MK-AZ-G10",
  "MK-AZ-G11",
  "MK-AZ-G12",
  "MK-AZ-G14",
  "MK-AZ-G15",
  "MK-AZ-G16",
  "MK-AZ-G17",
  "MK-AZ-G19",
  "MK-AZ-G20",
  "MK-AZ-G21",
  "MK-AZ-G22",
  "MK-AZ-G23",
] as const;

export const CLOSED_GAP_IDS = ["MK-AZ-G02", "MK-AZ-G03", "MK-AZ-G06", "MK-AZ-G07", "MK-AZ-G08", "MK-AZ-G13", "MK-AZ-G18"] as const;
export const GAP_IDS = GAP_FILE_ORDER;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "MK-AZ-G01": "open",
  "MK-AZ-G02": "resolved",
  "MK-AZ-G03": "resolved",
  "MK-AZ-G04": "open",
  "MK-AZ-G05": "partly_resolved",
  "MK-AZ-G06": "resolved",
  "MK-AZ-G07": "resolved",
  "MK-AZ-G08": "resolved",
  "MK-AZ-G09": "open",
  "MK-AZ-G10": "open",
  "MK-AZ-G11": "open",
  "MK-AZ-G12": "open",
  "MK-AZ-G13": "resolved_by_crosscheck",
  "MK-AZ-G14": "open",
  "MK-AZ-G15": "open",
  "MK-AZ-G16": "open",
  "MK-AZ-G17": "open",
  "MK-AZ-G18": "resolved_with_source_conflict_retained",
  "MK-AZ-G19": "open",
  "MK-AZ-G20": "open",
  "MK-AZ-G21": "open",
  "MK-AZ-G22": "open",
  "MK-AZ-G23": "open",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. Holds MK-AZ-G01, MK-AZ-G04, MK-AZ-G05, MK-AZ-G09 through MK-AZ-G12, MK-AZ-G14 through MK-AZ-G17, and MK-AZ-G19 through MK-AZ-G23 stay open. Successor edges stay empty. Slim-land events, results, and sources are not projected.";

export const COUNTRY_NOTES = [
  "Prompt AZ: 164 current offices and 8 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national and 170 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps municipal. Regional stays 0.",
  "Current offices are Parliament, the President, 81 councils, and 81 popular mayors.",
  "Current direct executives stay 82. Current local direct executives stay 81. European Parliament offices stay 0. Regional offices stay 0.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted events, results, and source extracts are not reconstructed.",
  "office_successor_edges stays empty. The 2013 Kichevo claim is a territorial reorganization, not an office identity.",
  "Every classification stays needs_review. Per-office review_status stays draft_for_human_review and justin_approved stays false.",
  "Open holds stay open. Pack-resolved gaps stay closed as supplied.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 172,
  current_offices: 164,
  historical_offices: 8,
  geographies: 86,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_regional: 0,
  draft_tier_municipal: 170,
  schema_national: 2,
  schema_regional: 0,
  schema_municipal: 170,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 172,
  sources: 0,
  unresolved_evidence: 23,
  named_open_holds: 16,
  closed_gaps: 7,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 33,
  research_dates: 0,
  current_direct_executives: 82,
  current_local_direct_executives: 81,
  historical_direct_executives: 4,
  current_councils: 81,
  current_mayors: 81,
  historical_councils: 4,
  historical_mayors: 4,
  current_national: 2,
  regional_offices: 0,
  ep_offices: 0,
  evidence_links: 0,
} as const;

export type NorthMacedoniaHashInputs = {
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

export function northMacedoniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): NorthMacedoniaHashInputs {
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

export function fingerprintSha256(hashInputs: NorthMacedoniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
