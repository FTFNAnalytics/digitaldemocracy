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

/** Namespace supplied by the Montenegro register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "montenegro-research-ay-v1";
export const LINEAGE_ID = "country-package-montenegro";
export const SOURCE_NAMESPACE = "country-package-montenegro";
export const COUNTRY_ID = "montenegro";
export const COUNTRY_CODE = "ME";
export const COUNTRY_NAME = "Montenegro";
export const ADAPTER_VERSION = "atlas-montenegro-prompt-ay/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/montenegro.json";
export const DOCS_PREFIX = "docs/phase1/montenegro";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/montenegro/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/montenegro/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/montenegro/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/montenegro/data/research-gaps.json";
export const TRANSITIONS_RELATIVE = "docs/phase1/montenegro/data/transition-relations.json";
export const METADATA_RELATIVE = "docs/phase1/montenegro/metadata.json";
export const APPROVAL_STATE_RELATIVE = "docs/phase1/montenegro/data/approval-state.json";
export const SOURCE_INVENTORY_RELATIVE = "docs/phase1/montenegro/data/source-inventory.json";
export const MUNICIPALITIES_RELATIVE = "docs/phase1/montenegro/data/municipalities.json";
export const EVENTS_RELATIVE = "docs/phase1/montenegro/data/events.jsonl";
export const RESULTS_RELATIVE = "docs/phase1/montenegro/data/results.jsonl";

/**
 * Event, result, and source-extract files are checked in. This importer does not
 * project them. It also does not invent omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/montenegro";

export const PARLIAMENT_ID = "ME-NAT-PARLIAMENT";
export const PRESIDENT_ID = "ME-NAT-PRESIDENT";
export const GOLUBOVCI_ID = "ME-HIST-PODGORICA-GOLUBOVCI-ASM";
export const HISTORICAL_TUZI_ID = "ME-HIST-PODGORICA-TUZI-ASM";
export const CURRENT_TUZI_ID = "ME-LOC-TUZI-ASM";
export const ZETA_ID = "ME-LOC-ZETA-ASM";

export const TIER_SHA256 = "4775ac024cda7cd7d33be2c6dc4ef2b10c89dd6ce2304d10aec7811f7601dfbc";
export const DRAFT_TIERS_SHA256 = "8e2d1a7892e60062f021f0b557ec5c1c41e74a09e4685f24a01f95e78a01aed6";
export const OFFICE_REGISTER_SHA256 = "65707a516a680d989f80133c0c57d51bec991d6df7ae905def1738e90e1732a0";

/**
 * Figures recorded in the checked-in counts file.
 * They are not published as omitted-total counters, and the rows are not projected.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 71;
export const FULL_PACK_DOCUMENTED_RESULTS = 153;
export const FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS = 23;

/**
 * Pinned after the pack inventory scan. Tests fail closed if the bytes drift.
 * Placeholder until the first scan; import.ts refuses a mismatch.
 */
export const CANDIDATE_FINGERPRINT = "1071482ab197eb6c09734fdc2732e9deea23d71457b5060e2a422d79f64b08a0";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/montenegro/JUSTIN_ACCEPTANCE.md": "b033d9ec2f8f11891fbe3f15508965382eaecf2527ed8027fd922094d6ab6898",
  "docs/phase1/montenegro/JUSTIN_REPORT.md": "673c8c1f54120ded3249fcdfa905910e9cbb227288ea2670de9f641add739f7d",
  "docs/phase1/montenegro/Montenegro_Acceptance_Examples.md": "4507c0acab1e79f68b53b76db37f7c8fffc8b1a9b59b8f9cfecf7caa46b542b9",
  "docs/phase1/montenegro/Montenegro_Field_Map.md": "778432127de06fa5ee610192d0f9fd3358458b7ce31a6a7bc79825b17b3c6799",
  "docs/phase1/montenegro/Montenegro_Identity_Rules.md": "848d12515d188ea33223427cc114127192574aba017bc9c9992043f57fc3408f",
  "docs/phase1/montenegro/Montenegro_Import.md": "a5990fb08e9af4330ce12877e2a7507f39d5373d7496086089ee42ef802232ab",
  "docs/phase1/montenegro/Montenegro_Office_Register.md": "3677644876129d60fe7d8c06e4cb45e92adc7a1f3e3dcbd6b746d3f1ac79c73a",
  "docs/phase1/montenegro/Montenegro_Research_Gaps.md": "aa10b23c4f675c8c0dd8dd598c19bb5cb5b3775e29cc8a9de82d1ddfe05ecb00",
  "docs/phase1/montenegro/Montenegro_Source_Inventory.md": "b4bfbf694842110d3c5751895405b7854d82775e200c687c581c950cd174825e",
  "docs/phase1/montenegro/Prompt_AY_Full_Register_Field_Map_and_CI.md": "4edd0db4375e04420f778cd4b4a7c3bbaef84c5ea60899d84a795523b75539d2",
  "docs/phase1/montenegro/README.md": "93643068dc35571fa636d09856c45134b9ed4437a022072734819ec1a62dbb70",
  "docs/phase1/montenegro/SHA256SUMS": "6d0e2da99b4308338057c819632ce8406a1125c46cd5d9e63f5729b390687545",
  "docs/phase1/montenegro/contracts/Contract_Reference.md": "65792a7b03c8157bd80f3cbd3329e1f0bfb4e3ee753d71bfac30a6e6a93a092c",
  "docs/phase1/montenegro/contracts/column-map.json": "5fead3df895815da48bc83f7e0e121e25f91b334719b16c2d001b184fc88fc12",
  "docs/phase1/montenegro/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/montenegro/data/acceptance-vectors.json": "e6d19dd2b11546ea879724f2137d3314aaa6185ad987314ab5ed66ee5f407b9c",
  [APPROVAL_STATE_RELATIVE]: "4784cec9f6e318d81c9cfb955438641775bd05da98ebdaa3fbc13298e2cead64",
  [COUNTS_RELATIVE]: "9d02c9087b06be4bbaef29c3e90b42639dc0e0ab5d7241f66263b8d473f266dc",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EVENTS_RELATIVE]: "bab4710303c0731be6612c225a7f870cac3e99fc8c058ff5368a2dd0750c1b5b",
  [MUNICIPALITIES_RELATIVE]: "8f4cb54f2606d02a10f36445afbeac685e8069f68fdcd5861599740e91f593f6",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "229fad50356ca292339acfac3259efacf7bdb22ff967c96c4af17ecc192f3cdb",
  [RESULTS_RELATIVE]: "e4366ab0f19d821e8b303a456895c713d52f3908ebfdce718b05250984a4ebfd",
  [SOURCE_INVENTORY_RELATIVE]: "ebdeee16e34d56445dc94f4342b6fe2b0b97f152d1e0bf3f216891c3a51b37a7",
  [TRANSITIONS_RELATIVE]: "c598d2e938d1237edd48963958af07acc9e7d81df7f6c0328dbbc8abf77f1c9b",
  [METADATA_RELATIVE]: "5547dfe829d72f7508d90ee9eea500babc59ba47c5fc5d2f397caf9f1e2a43a0",
  "docs/phase1/montenegro/sources/normalized/dik-local-archive.json": "558d9e464d7b9c1777ce506dcbcd9035a4e1f4fb53ce5a73aa8aa68077fbeb3b",
  "docs/phase1/montenegro/sources/normalized/dik-main.json": "bb25260d3ed75fb08d303bc664574532ff01804fe0056a362c3d9fe4ca77da90",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2006.json": "6a5a199bd9263f6f807a4a796099f26e27945b706a83778c2e05f8bef3281b4b",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2009.json": "e4f64d4393e2735fe8e9a714ed27a11214c86df5536e2c80e0849d15509ea0be",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2012.json": "1feb236d9ee62b75803e9ac0fabae4197749a95411112c792ac1e846f976d5da",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2016.json": "2dc2fc51ffddbbf483eec9ebf5041806245cd50840862c1614020718b371127f",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2020.json": "47b310aba27c0e671328256d728b35828f5bda4a1432755a8f5d74d0fad9e595",
  "docs/phase1/montenegro/sources/normalized/dik-parl-2023.json": "f829baf12cb1593253c9d5e2a1b74d4690437c318a54b7993397d20829f1cf28",
  "docs/phase1/montenegro/sources/normalized/dik-pres-2008.json": "4818d7cfa28843c3ee5a314a9f20374b3eb7826c0fc1d58f39dc98a92f0ac887",
  "docs/phase1/montenegro/sources/normalized/dik-pres-2013.json": "2e919077c4c246bc726e0f34ba261635dffbbf363b72e9016c379f8322551c03",
  "docs/phase1/montenegro/sources/normalized/dik-pres-2018.json": "5f8a12bb0c840ea765dff90d5ca0b595070b9c92d1ccb3ce197be5ebbf7e6329",
  "docs/phase1/montenegro/sources/normalized/dik-pres-2023.json": "be585daecd7b1be563fce30b4cf7c08222e730b48d6c9c1a4d5b181bc0922f66",
  "docs/phase1/montenegro/sources/normalized/dik-savnik-status.json": "d1b31e022bfa80866ada818d770d0bf2d33afd39b5d63dd04de0dcb1fc46df5c",
  "docs/phase1/montenegro/sources/normalized/eu-candidate.json": "c3e718336d3f8e6c22912b470e13357aa87ff1d0bcb8d3e933b855509384c1e5",
  "docs/phase1/montenegro/sources/normalized/gov-current-local-units.json": "024f18832c5b417c82662b404027f4839cc04074708a8e0552af017fdf9840f2",
  "docs/phase1/montenegro/sources/normalized/gov-local-selection.json": "9fdb435d139188fdd286e94b935a24e7cdadc44b75c5013e63c44df5d7a0dc88",
  "docs/phase1/montenegro/sources/normalized/gov-petnjica-2013.json": "9af2266f183830e3d060292581b7a5e3ad9f45d1dd2bfbaede46489338d322e1",
  "docs/phase1/montenegro/sources/normalized/gov-tuzi-historical-election.json": "da033b8cd3302cc8dac9bc7b33ced5e612fbf102e661ee9eefa0d6062e05b92c",
  "docs/phase1/montenegro/sources/normalized/gov-tuzi-transition.json": "16cf31720dd4c147dce0d008b06d95452c527f87286fdf7914dd2178f84ebaca",
  "docs/phase1/montenegro/sources/normalized/mup-local-2022.json": "2ee2f0434989cae4ce41b06af5622c52e1b56aba3ae0338b99f736996dbc515f",
  "docs/phase1/montenegro/sources/normalized/oik-budva-2024.json": "a73df9e1de52be6d2191cd5998493873ebbbcfb125e81381ddc13454766c30ec",
  "docs/phase1/montenegro/sources/normalized/oik-tuzi-2019.json": "17b21ce1aaf65ed798fe770be51f8467a5704c4d7b4d15c3faac4b216fee6bcd",
  "docs/phase1/montenegro/sources/normalized/oik-zabljak-2018.json": "9286aeef74d6ccf8634e39f76d9b4f4eba5a9807ad0af18740d84649950c5176",
  "docs/phase1/montenegro/validate.py": "2467254cdd128d8a0b7d4a4cdc7263852c466682de90a9802f341e943a6396fa",
  "docs/phase1/montenegro/validation-report.json": "d70ce32cef34de1c85517346862bcf742b11cff1ded00ae0aad34cc3fe6c159a",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "national_legislature",
  "president",
  "local_assembly",
  "historical_nested_local_assembly",
] as const;

export const SELECTION_MODES = [
  "direct_popular_list_election",
  "direct_popular_majority_with_runoff_if_needed",
  "direct_popular_local_assembly",
] as const;

export const UNIT_KINDS = ["capital_city", "royal_capital", "municipality"] as const;

export type MontenegroRegisterStatus = "current" | "historical_only";
export type MontenegroDraftTier = "national" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "office_id",
  "id_namespace",
  "name",
  "geography",
  "office_type",
  "status",
  "tier_scope",
  "selection_mode",
  "direct_executive",
  "source_ids",
  "state_note",
  "unit_kind",
]);

const FORBIDDEN_OFFICE =
  /european parliament|evropski parlament|predsjednik op[sš]tine|municipal president|prime minister|predsjednik vlade|serbia-and-montenegro|srbija i crna gora/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Montenegro office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack) || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing excluded Montenegro office ${officeId}`);
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
      throw new Error(`Refusing undocumented Montenegro office field ${field} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(field)) {
      throw new Error(`Refusing Montenegro successor field ${field} on ${officeId}`);
    }
  }
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "municipal" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Montenegro draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: MontenegroRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Montenegro register status ${String(registerStatus)}`);
}

/** One geography per supplied name. Parliament and the President share Montenegro. */
export function geographyIdForName(name: string): string {
  return key("geo", ["montenegro", name]);
}

export const OPEN_HOLD_IDS = [
  "ME-AY-G01",
  "ME-AY-G02",
  "ME-AY-G03",
  "ME-AY-G04",
  "ME-AY-G05",
  "ME-AY-G06",
  "ME-AY-G07",
  "ME-AY-G08",
  "ME-AY-G09",
  "ME-AY-G10",
  "ME-AY-G11",
] as const;
export const GAP_IDS = OPEN_HOLD_IDS;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "ME-AY-G01": "open",
  "ME-AY-G02": "open",
  "ME-AY-G03": "open",
  "ME-AY-G04": "open",
  "ME-AY-G05": "open",
  "ME-AY-G06": "resolved_scope_rule",
  "ME-AY-G07": "open",
  "ME-AY-G08": "resolved_scope_rule",
  "ME-AY-G09": "open",
  "ME-AY-G10": "open_methodological",
  "ME-AY-G11": "source_discrepancy",
};

/** Every named hold stays open. Pack status labels are not closures. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. Parliament, the President, and 25 current local assemblies, plus 2 historical nested assemblies. Holds ME-AY-G01 through ME-AY-G11 stay open. No successor edges. Published events and result rows stay 0; checked-in event and result files are not projected and omitted totals are not invented.";

export const COUNTRY_NOTES = [
  "Prompt AY: 27 current offices and 2 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national and 27 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps municipal. It does not replace the draft label.",
  "Current offices are Parliament, the President, and 25 local assemblies. Current direct executives stay 1. Direct local executives stay 0. European Parliament offices stay 0.",
  "Historical-only rows are Golubovci and historical Tuzi. They are not successor edges onto Zeta or current Tuzi.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Checked-in event, result, and source-extract files are retained and are not projected. Omitted totals are not invented.",
  "office_successor_edges stays empty. Both territorial relations keep successor_office_id null.",
  "Every classification stays needs_review. Per-office review_status stays draft_for_human_review and justin_approved stays false.",
  "Holds ME-AY-G01 through ME-AY-G11 stay open, including the resolved_scope_rule labels on ME-AY-G06 and ME-AY-G08.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 29,
  current_offices: 27,
  historical_offices: 2,
  geographies: 28,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_municipal: 27,
  schema_national: 2,
  schema_regional: 0,
  schema_municipal: 27,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 29,
  sources: 0,
  unresolved_evidence: 11,
  named_open_holds: 11,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 53,
  research_dates: 0,
  direct_executive_offices: 1,
  direct_local_executive_offices: 0,
  current_local_assemblies: 25,
  historical_nested_assemblies: 2,
  current_national: 2,
  ep_offices: 0,
  evidence_links: 0,
  parliament_offices: 1,
  president_offices: 1,
} as const;

export type MontenegroHashInputs = {
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

export function montenegroUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): MontenegroHashInputs {
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

export function fingerprintSha256(hashInputs: MontenegroHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
