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

/** Namespace supplied by Kosovo metadata. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "kosovo-research-bb-v1";
export const LINEAGE_ID = "country-package-kosovo";
export const SOURCE_NAMESPACE = "country-package-kosovo";
export const COUNTRY_ID = "kosovo";
export const COUNTRY_CODE = "XK";
export const COUNTRY_NAME = "Kosovo*";
export const COUNTRY_GEOGRAPHY_ID = "geo-5db780af2ba0ba7e0b170c82";
export const COUNTRY_GEOGRAPHY_NAME = "Kosovo*";
export const HISTORICAL_NATIONAL_GEOGRAPHY_LABEL = "Kosovo* — provisional constitutional framework";
export const DECAN_GEOGRAPHY_ID = "geo-426db9d3200aa072de6a7447";
export const ADAPTER_VERSION = "atlas-kosovo-prompt-bh/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/kosovo.json";
export const DOCS_PREFIX = "docs/phase1/kosovo";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/kosovo/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/kosovo/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/kosovo/counts.json";
export const DATA_COUNTS_RELATIVE = "docs/phase1/kosovo/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/kosovo/data/research-gaps.json";
export const RESEARCH_GAPS_COPY_RELATIVE = "docs/phase1/kosovo/research-gaps.json";
export const HOLDS_RELATIVE = "docs/phase1/kosovo/data/holds.jsonl";
export const METADATA_RELATIVE = "docs/phase1/kosovo/metadata.json";
export const VALIDATION_RELATIVE = "docs/phase1/kosovo/validation-report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/kosovo/JUSTIN_ACCEPTANCE.md";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/kosovo/data/upcoming-calendar.jsonl";
export const IDENTITY_CROSSWALK_RELATIVE = "docs/phase1/kosovo/data/identity-crosswalk.json";
export const SERBIA_AX_AUDIT_RELATIVE = "docs/phase1/kosovo/data/serbia-ax-scope-audit.json";
export const APPROVAL_STATE_RELATIVE = "docs/phase1/kosovo/data/approval-state.json";
export const MANIFEST_RELATIVE = "docs/phase1/kosovo/manifest.json";
export const BH_LINEAGE_RELATIVE = "docs/phase1/kosovo/data/BH-lineage.json";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/kosovo";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/kosovo/data/events.json",
  "docs/phase1/kosovo/data/events.jsonl",
  "docs/phase1/kosovo/data/results.json",
  "docs/phase1/kosovo/data/results.jsonl",
  "docs/phase1/kosovo/data/sources.json",
  "docs/phase1/kosovo/data/sources.jsonl",
  "docs/phase1/kosovo/sources",
] as const;

export const ASSEMBLY_ID = "XK-NAT-ASSEMBLY";
export const HISTORICAL_ASSEMBLY_ID = "XK-H-PISG-ASSEMBLY";
export const SAMPLE_COUNCIL_ID = "XK-01-C";
export const SAMPLE_MAYOR_ID = "XK-01-M";
export const SAMPLE_HISTORICAL_COUNCIL_ID = "XK-H-UNMIK-01-C";
export const SAMPLE_HISTORICAL_MAYOR_ID = "XK-H-UNMIK-01-M";

export const TIER_SHA256 = "3ba7f40b73ca81ad2d155d5b03176ed99c3aa12d7e92ca6111985b647fed7504";
export const OFFICE_REGISTER_SHA256 = "bb9ec3de19b0df56103aab44149e01ad72f60685396380d4341e861095d74e27";
export const DRAFT_TIERS_SHA256 = "11ee44a62e119525f33b8cbd7d448e9f0b04304a5109e682f2a814489db8cc25";

/**
 * Figures recorded in the landed counts file. They are not published, and they
 * are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 574;
export const FULL_PACK_DOCUMENTED_RESULTS = 3489;
export const FULL_PACK_DOCUMENTED_SOURCE_ROWS = 372;
/** Documentary full-ZIP SHA from manifest.json. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "336cb6798d286ecf9264e5498f3026de80953c0041eda772867f9de8900c6738";

/**
 * Pinned after the slim-pack inventory scan. The full-ZIP SHA is not this release.
 */
export const CANDIDATE_FINGERPRINT = "d3b27dae9004121b51896834106e1edb88ca4133d075a77a662217bcd68e1a36";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-29";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/kosovo/JUSTIN_ACCEPTANCE.md": "9665d2f83a5d4b24fd3de5cdaefb2b86eac77612cd670666e4331e17909bff3a",
  "docs/phase1/kosovo/JUSTIN_REPORT.md": "64bb3e477f9d417c78198390c43767ff37ecab25933709e13369b3c09324453b",
  "docs/phase1/kosovo/Kosovo_Acceptance_Examples.md": "65f95a003379b1c44be507978a6a20385ddc5a80f0d0d9cce985bf0068a1afba",
  "docs/phase1/kosovo/Kosovo_Coverage.md": "854a279a955ace8e70a3bfc1b432011eb4f62f54f76619f068ac4b16990acbfd",
  "docs/phase1/kosovo/Kosovo_Field_Map.md": "75ea4c31cac4718d50e83525430bb12bfa1431114d17615b65245c2e7be4aaae",
  "docs/phase1/kosovo/Kosovo_Identity_Rules.md": "de781c1534fc3a3cbaa4bdfa5fd627488a77df494683d47f16823c9829015a7e",
  "docs/phase1/kosovo/Kosovo_Office_Register.md": "fb53b0291dc4910c38403e15829011d2622c233084f92f0db84ee33ae73f3c8b",
  "docs/phase1/kosovo/Kosovo_Research_Gaps.md": "027c51f953d1c7c350b8deb06a92cfe12df286598f5398dc9ce34092358a49bf",
  "docs/phase1/kosovo/Kosovo_Upcoming_Elections.md": "f3ea9375d0acfa36d8301978556d144dc2d4a6154402f441843e22e76e771502",
  "docs/phase1/kosovo/Prompt_BB_Full_Register_Field_Map_and_CI.md": "170cc9bbf4843f2d298cc9ee6fcd84bd432e2a67bf4beef34d9cea179773e4fa",
  "docs/phase1/kosovo/README.md": "b70a6a5b4dab36af3dd655ef668de4456addb20d5c1d099a69c47c6a669a1776",
  "docs/phase1/kosovo/SHA256SUMS": "cedeedd8d5166a0472e7ddee24301e769c9a386b7fe5cd5790315f5ee289d88b",
  "docs/phase1/kosovo/SLIM_LAND_NOTE.md": "69f95ba596c7b5aef090dfff82cb18aab43978b3ed159943472845c60cb43606",
  "docs/phase1/kosovo/acceptance-examples.json": "64dd436ae0e512b18ba5e15b430d451bce419d2a5c1735b50c2be2105c2c0ed7",
  "docs/phase1/kosovo/acceptance-examples.md": "65f95a003379b1c44be507978a6a20385ddc5a80f0d0d9cce985bf0068a1afba",
  "docs/phase1/kosovo/contract/column-map.json": "3a6653ecd04fd645ad2bdd5e36058a875778e9a5d8875b1709963a5c8104e942",
  "docs/phase1/kosovo/contract/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/kosovo/contract/inheritance.json": "96a34ac35ba5b9b2d7806319758bb6c523d94e7cd8d7f65f4e8a999ad9baddbb",
  "docs/phase1/kosovo/contracts/column-map.json": "3a6653ecd04fd645ad2bdd5e36058a875778e9a5d8875b1709963a5c8104e942",
  "docs/phase1/kosovo/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/kosovo/contracts/inheritance.json": "96a34ac35ba5b9b2d7806319758bb6c523d94e7cd8d7f65f4e8a999ad9baddbb",
  [COUNTS_RELATIVE]: "9ca00b3951dd063804c499c7e5464ac199a6e48b309637883ccf7d2120d7bb37",
  [BH_LINEAGE_RELATIVE]: "09be3193fa57e8df1291283a4f203a7b2e1ae87753cfa85b0f38259f1d9450be",
  [APPROVAL_STATE_RELATIVE]: "937c6c79dd97d7bd904abf368f322fc628b1c7f2d42ffc0aa2784508386773b9",
  [DATA_COUNTS_RELATIVE]: "9ca00b3951dd063804c499c7e5464ac199a6e48b309637883ccf7d2120d7bb37",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [HOLDS_RELATIVE]: "0eb68e67d0858f8d0b5ec4dd1edbf04de12ad411cf15f22bf073dd60f1885a42",
  [IDENTITY_CROSSWALK_RELATIVE]: "dd30151aa932a7e63bc641d959e028b97fb4fed651fb095bd8fb2d1e876d2894",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "72dafb69a947a07dfb805d0045eb7551c5bbad50fbb9b01cdd6f571fd90acd24",
  [SERBIA_AX_AUDIT_RELATIVE]: "b537b1c80ff6c3bbaeb7073edb2c9412cc6649ee42e37afe2e89936876869c74",
  [UPCOMING_CALENDAR_RELATIVE]: "0c838851448f58837a4b69997ea2257af7812b9f3e382d48741c79879e2d93be",
  "docs/phase1/kosovo/field-map-223.json": "3a6653ecd04fd645ad2bdd5e36058a875778e9a5d8875b1709963a5c8104e942",
  "docs/phase1/kosovo/field-map-223.md": "75ea4c31cac4718d50e83525430bb12bfa1431114d17615b65245c2e7be4aaae",
  "docs/phase1/kosovo/history-coverage.md": "854a279a955ace8e70a3bfc1b432011eb4f62f54f76619f068ac4b16990acbfd",
  "docs/phase1/kosovo/identity-rules.md": "de781c1534fc3a3cbaa4bdfa5fd627488a77df494683d47f16823c9829015a7e",
  [MANIFEST_RELATIVE]: "6f84d94f537936f6e52c4621e9ab22730345dfa0e22bcf13f7d27f9d30637910",
  [METADATA_RELATIVE]: "b1027bb5c84b556c21e50ca3d189ed9e1fab62053a45fdcea3dff8606c68c809",
  [RESEARCH_GAPS_COPY_RELATIVE]: "72dafb69a947a07dfb805d0045eb7551c5bbad50fbb9b01cdd6f571fd90acd24",
  "docs/phase1/kosovo/research-gaps.md": "027c51f953d1c7c350b8deb06a92cfe12df286598f5398dc9ce34092358a49bf",
  "docs/phase1/kosovo/validate.py": "538de7bd98599658750e5ef3555f0fbfba212ab75711a962c54a0ccf37d02c73",
  [VALIDATION_RELATIVE]: "d48cb06e09b38fc76110edb43792c128850861ff9d67e92713f092616c444d2a",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = ["national_legislature", "municipal_assembly", "mayor"] as const;

export type KosovoDraftTier = "national" | "municipal";
export type KosovoRegisterStatus = "current" | "historical_only";
export type KosovoOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];
export type SchemaTier = "national_context" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const OFFICE_ID_RE = /^(XK-NAT-ASSEMBLY|XK-H-PISG-ASSEMBLY|XK-(?:H-UNMIK-)?\d{2}-[CM])$/;
const FORBIDDEN_OFFICE =
  /european parliament|parlamenti evropian|popular president|prime minister|kryeminist|serbia|srbija|republika srbija|\bRS-/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Kosovo office id ${officeId}`);
  if (!ALLOWED_TYPE_SET.has(officeType)) throw new Error(`Refusing unlisted Kosovo office type ${officeType} on ${officeId}`);
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Kosovo office ${officeId}`);
  if (officeId.startsWith("RS-") || officeId.startsWith("EP-") || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing Serbia-scope or EP office id ${officeId}`);
  }
  if (officeType === "national_legislature" && officeId !== ASSEMBLY_ID && officeId !== HISTORICAL_ASSEMBLY_ID) {
    throw new Error(`Refusing a national legislature that is not ${ASSEMBLY_ID} or ${HISTORICAL_ASSEMBLY_ID}`);
  }
}

export function officeTypeFor(args: {
  officeId: string;
  officeType: string;
  tierScope: string;
  officeStatus: string;
  directExecutive: boolean;
}): KosovoOfficeType {
  const { officeId, officeType, tierScope, officeStatus, directExecutive } = args;
  if (
    (officeId === ASSEMBLY_ID || officeId === HISTORICAL_ASSEMBLY_ID) &&
    officeType === "national_legislature" &&
    tierScope === "national" &&
    !directExecutive
  ) {
    return "national_legislature";
  }
  if (officeType === "municipal_assembly" && tierScope === "local" && !directExecutive) return "municipal_assembly";
  if (officeType === "mayor" && tierScope === "local" && directExecutive) return "mayor";
  throw new Error(`Unsupported Kosovo office ${officeId} type ${officeType} at ${tierScope} (${officeStatus})`);
}

export function isDirectExecutive(officeType: string): boolean {
  return officeType === "mayor";
}

export function expectedDraftTier(tierScope: string): KosovoDraftTier {
  if (tierScope === "national") return "national";
  if (tierScope === "local") return "municipal";
  throw new Error(`Unsupported Kosovo tier scope ${tierScope}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Kosovo draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: KosovoRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Kosovo register status ${String(registerStatus)}`);
}

/**
 * Documentary open holds. They stay unresolved evidence. This import does not
 * close them or invent the missing census, history, numbers, or calendar anchor.
 */
export const OPEN_HOLD_IDS = [
  "XK-BB-G04",
  "XK-BB-G05",
  "XK-BB-G06",
  "XK-BB-G07",
  "XK-BB-G08",
  "XK-BB-G09",
  "XK-BB-G10",
  "XK-BB-G11",
  "XK-BB-G12",
  "XK-BB-G13",
  "XK-BB-G14",
  "XK-BB-G15",
  "XK-BB-G16",
  "XK-BB-G17",
  "XK-BB-G18",
  "XK-BB-G21",
  "XK-BB-G22",
  "XK-BB-G23",
  "XK-BH-G24",
] as const;

/** Scope rules and resolved inclusions/exclusions. They are not reopened as unresolved holds. */
export const RESOLVED_NOTE_IDS = ["XK-BB-G01", "XK-BB-G02", "XK-BB-G03", "XK-BB-G19", "XK-BB-G20"] as const;

export const ALL_GAP_IDS = [
  "XK-BB-G01",
  "XK-BB-G02",
  "XK-BB-G03",
  "XK-BB-G04",
  "XK-BB-G05",
  "XK-BB-G06",
  "XK-BB-G07",
  "XK-BB-G08",
  "XK-BB-G09",
  "XK-BB-G10",
  "XK-BB-G11",
  "XK-BB-G12",
  "XK-BB-G13",
  "XK-BB-G14",
  "XK-BB-G15",
  "XK-BB-G16",
  "XK-BB-G17",
  "XK-BB-G18",
  "XK-BB-G19",
  "XK-BB-G20",
  "XK-BB-G21",
  "XK-BB-G22",
  "XK-BB-G23",
  "XK-BH-G24",
] as const;

/** Source status labels. Named open holds stay documentary. Resolved notes stay closed as research notes. */
export const GAP_STATUS: Readonly<Record<string, string>> = {
  "XK-BB-G01": "scope_rule_enforced",
  "XK-BB-G02": "resolved_exclusion",
  "XK-BB-G03": "resolved_inclusion",
  "XK-BB-G04": "identity_hold",
  "XK-BB-G05": "identity_hold",
  "XK-BB-G06": "scope_and_history_hold",
  "XK-BB-G07": "open_scope_census",
  "XK-BB-G08": "open_selection_text",
  "XK-BB-G09": "certification_hold",
  "XK-BB-G10": "open_history",
  "XK-BB-G11": "numeric_conflict_hold",
  "XK-BB-G12": "numeric_conflict_hold",
  "XK-BB-G13": "provenance_hold",
  "XK-BB-G14": "open_history",
  "XK-BB-G15": "phase_binding_hold",
  "XK-BB-G16": "contested_local_scope_gate",
  "XK-BB-G17": "numeric_coverage_hold",
  "XK-BB-G18": "numeric_conflict_hold",
  "XK-BB-G19": "resolved_exclusion",
  "XK-BB-G20": "scope_rule_enforced",
  "XK-BB-G21": "source_access_hold",
  "XK-BB-G22": "numeric_semantics_hold",
  "XK-BB-G23": "implementation_hold",
  "XK-BH-G24": "open_calendar_hold",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export function gapIsResolvedNote(gapId: string): boolean {
  return (RESOLVED_NOTE_IDS as readonly string[]).includes(gapId);
}

export const COUNTRY_NOTES = [
  "Prompt BH: 77 current offices and 61 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national and 136 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and municipal to municipal. It does not replace the draft label.",
  "Current direct mayors stay 38. Current municipal assemblies stay 38. The Assembly of Kosovo stays current. The provisional Assembly stays historical-only. No popular president.",
  "EP offices stay 0. Serbia-scope offices stay 0. Serbia Prompt AX is not modified. Kosovo only.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "Successor edges stay empty. The identity crosswalk says no automatic cross-vintage edge; it is not projected as successor links.",
  "Upcoming-calendar docs stay documentary. scheduled_date stays null. No country UI callout and no applied calendar rows.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved.",
  "Holds XK-BB-G04 through XK-BB-G18, XK-BB-G21 through XK-BB-G23, and XK-BH-G24 stay documentary open holds.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 138,
  current_offices: 77,
  historical_offices: 61,
  geographies: 69,
  geographies_without_parent: 69,
  parents_left_null: 0,
  current_municipalities: 38,
  historical_municipalities: 30,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_municipal: 136,
  schema_national: 2,
  schema_regional: 0,
  schema_municipal: 136,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 138,
  sources: 0,
  unresolved_evidence: 19,
  named_open_holds: 19,
  resolved_notes: 5,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  identity_crosswalk_rows: 38,
  explicit_predecessor_edges: 0,
  retained_inputs: 43,
  research_dates: 0,
  applied_calendar_rows: 0,
  upcoming_calendar_rows: 9,
  current_direct_executives: 38,
  historical_direct_executives: 30,
  current_mayors: 38,
  current_municipal_assemblies: 38,
  historical_municipal_assemblies: 30,
  historical_mayors: 30,
  current_national_offices: 1,
  historical_national_offices: 1,
  assembly_offices: 1,
  historical_assembly_offices: 1,
  ep_offices: 0,
  serbia_scope_offices: 0,
  popular_president_offices: 0,
  popular_regional_offices: 0,
  evidence_links: 0,
} as const;

export type KosovoHashInputs = {
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

export function kosovoUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): KosovoHashInputs {
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

export function fingerprintSha256(hashInputs: KosovoHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
