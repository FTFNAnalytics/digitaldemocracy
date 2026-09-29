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

/** Namespace for the Uruguay office register. Current and historical rows share it. */
export const CURRENT_NAMESPACE = "atlas-research-uy-bf";
export const LINEAGE_ID = "country-package-uruguay";
export const SOURCE_NAMESPACE = "country-package-uruguay";
export const COUNTRY_ID = "uruguay";
export const COUNTRY_CODE = "UY";
export const COUNTRY_NAME = "Oriental Republic of Uruguay";
export const COUNTRY_SCOPE = "República Oriental del Uruguay";
export const COUNTRY_GEOGRAPHY_ID = "UY";
export const ADAPTER_VERSION = "atlas-uruguay-prompt-bf/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/uruguay.json";
export const DOCS_PREFIX = "docs/phase1/uruguay";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/uruguay/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/uruguay/data/draft-tiers.jsonl";
export const GEOGRAPHY_RELATIVE = "docs/phase1/uruguay/data/geography.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/uruguay/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/uruguay/research-gaps.json";
export const METADATA_RELATIVE = "docs/phase1/uruguay/metadata.json";
export const VALIDATION_RELATIVE = "docs/phase1/uruguay/validation-report.json";
export const ACCEPTANCE_RELATIVE = "docs/phase1/uruguay/JUSTIN_ACCEPTANCE.md";
export const UPCOMING_CALENDAR_RELATIVE = "docs/phase1/uruguay/data/upcoming-calendar.jsonl";
export const IDENTITY_CROSSWALK_RELATIVE = "docs/phase1/uruguay/data/identity-crosswalk.jsonl";
export const DEFERRED_HOLDS_RELATIVE = "docs/phase1/uruguay/data/deferred-calendar-holds.jsonl";
export const MANIFEST_RELATIVE = "docs/phase1/uruguay/manifest.json";

/**
 * Events, results, and sources are not in this slim land. Do not invent those
 * files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/uruguay";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/uruguay/data/events.json",
  "docs/phase1/uruguay/data/events.jsonl",
  "docs/phase1/uruguay/data/results.json",
  "docs/phase1/uruguay/data/results.jsonl",
  "docs/phase1/uruguay/data/sources.json",
  "docs/phase1/uruguay/data/evidence-links.jsonl",
  "docs/phase1/uruguay/sources",
] as const;

export const PRESIDENT_ID = "UY-N-PRES";
export const VICE_PRESIDENT_ID = "UY-N-VP";
export const SENATE_ID = "UY-N-SEN";
export const REPRESENTATIVES_ID = "UY-N-REP";
export const SAMPLE_INTENDENTE_ID = "UY-D-MO-I";
export const SAMPLE_DEPARTMENTAL_COUNCIL_ID = "UY-D-MO-J";
export const SAMPLE_ALCALDE_ID = "UY-M-MO-A-A";
export const SAMPLE_MUNICIPAL_COUNCIL_ID = "UY-M-MO-A-C";
export const SAMPLE_MUNICIPAL_GEOGRAPHY_ID = "UY-M-MO-A";
export const MONTEVIDEO_DEPARTMENT_ID = "UY-D-MO";
export const CANELONES_DEPARTMENT_ID = "UY-D-CA";
export const HISTORICAL_CNA_ID = "UY-H-CNA";
export const HISTORICAL_CNG_ID = "UY-H-CNG";
export const SAMPLE_HISTORICAL_DEPARTMENTAL_ID = "UY-H-D-MO-CD";
export const SAMPLE_HISTORICAL_LOCAL_ID = "UY-H-JLA-CL";

export const TIER_SHA256 = "5669b28f92002aa4e154ea15ab2fcef8ffc478db616f5a41080bf068339f5b22";
export const OFFICE_REGISTER_SHA256 = "ed4f9ab3094a801e1ceaddf6949da238ca66adb8bb254db3ac7bf9d7a9f2d476";
export const DRAFT_TIERS_SHA256 = "daeafca9e29f4a796a9c13df6c0c633772a9a78b7b6152075e07df0d601be7ab";
export const GEOGRAPHY_SHA256 = "1855370c71de959c0b08eab17641d947737f1cd90fc46c9edbc6fd96bb6a1e9f";

/**
 * Figures recorded in the landed counts file and validation receipt.
 * They are not published, and they are not emitted as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 1451;
export const FULL_PACK_DOCUMENTED_RESULTS = 4328;
export const FULL_PACK_DOCUMENTED_SOURCES = 163;
/** Documentary full-ZIP SHA from metadata.json. It is not this slim-land release. */
export const FULL_ZIP_SHA256 = "a5d1f57aeaa5eb64bc7f3857c22296b627a4d36d3b12f0a4eb9546086882aed2";

/**
 * Pinned after the slim-pack inventory scan. The full-ZIP SHA is not this release.
 */
export const CANDIDATE_FINGERPRINT = "5bcfd17aea51272559f23a268139bc816165bd3bbfc28809b6c33f3d7b311314";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-29";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  [ACCEPTANCE_RELATIVE]: "096ea473c3dc3ec54a3b8272097d4c866cf8b7f94f03d0585dd7ef1ca8035bf6",
  "docs/phase1/uruguay/JUSTIN_REPORT.md": "a1f0048fc53c16a4cae39a48b83e6491a3b0f317472d11dc5def36d67a19b99f",
  "docs/phase1/uruguay/Justin-report.md": "a1f0048fc53c16a4cae39a48b83e6491a3b0f317472d11dc5def36d67a19b99f",
  "docs/phase1/uruguay/README.md": "3e08cae4260a014c814689f639b3667931420243cda4f03003177eed7ffbee9d",
  "docs/phase1/uruguay/SHA256SUMS": "cffb6fdd4d495903fd84205008a84715c872cfadf75a7a4f00766d6325cdb82b",
  "docs/phase1/uruguay/SLIM_LAND_NOTE.md": "5ea3e5101939840be8a418bc37fb2c2d351eb52825a3559a6bb160c7ccfdd72f",
  "docs/phase1/uruguay/Uruguay_Upcoming_Elections.md": "394673958345f77d33d097a7c794c315ac2ce09147757c43619aeb8742883a02",
  "docs/phase1/uruguay/acceptance-examples.json": "0da6f5927d21aad2ce4d7a7267f9844cd8303cbd644e7899734d4de7d85e5bad",
  "docs/phase1/uruguay/acceptance-examples.md": "8e84433c3c7d495f7186bae24e5a3302826850730a655dbfb0adfe40e708e79a",
  "docs/phase1/uruguay/contract/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/uruguay/contract/inheritance.json": "176673c7e6bc1680b4f7439e0edbeddc2cdd92e49bc35252807c13a6c790db03",
  "docs/phase1/uruguay/contracts/columns.json": "8d785531d31da3123be64db2a3c3d79183e039ad4f5d99abc505374f17da51ae",
  "docs/phase1/uruguay/contracts/inheritance.json": "176673c7e6bc1680b4f7439e0edbeddc2cdd92e49bc35252807c13a6c790db03",
  [COUNTS_RELATIVE]: "e5702d91ba532596c30c114f7c7d86ed7d99375fd217c21b6fcaa142ff5d78c9",
  [DEFERRED_HOLDS_RELATIVE]: "b699e6dbecc5c0bcee70b170b0678078524ef8edce7e7e9b05c3bcd870f39186",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [GEOGRAPHY_RELATIVE]: GEOGRAPHY_SHA256,
  [IDENTITY_CROSSWALK_RELATIVE]: "52424e4a6eb79cd50a2817dc053261c2ea8d24c609051fe1528245177e428349",
  "docs/phase1/uruguay/data/municipal-register.jsonl": "161acbc3318b92499a9e2ac76feb2b2cbbc89c793fb42d02989ba776797b0c70",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  "docs/phase1/uruguay/data/proceedings.jsonl": "79df3c98498618776e4bcc5c01f9a07c04672dd1639b8b389f8d17123cd3d4df",
  "docs/phase1/uruguay/data/research-dates.jsonl": "efffa32bed7be8e945d105c1b8ddc16096c2a17ea580f4952d40381991c4ba4a",
  [UPCOMING_CALENDAR_RELATIVE]: "6e0b4172333b75ea00c5a67dd2fbad115cf628529e7892c41f49e95a27471431",
  "docs/phase1/uruguay/field-map-223.json": "ac71cb40717c701fabd85f43170582a3f6ae96f42593d71fe5ea3764591ba9cc",
  "docs/phase1/uruguay/field-map-223.md": "ac74a411b844fbfa37911e728c15250080c19626c935d2dbbacdfa80a8ddcd00",
  "docs/phase1/uruguay/history-coverage.md": "3b39ebfa74f3f9893fb3f6a42fac5f45ab62ca61c8386ac7687a30184a1e1e4a",
  "docs/phase1/uruguay/identity-rules.md": "7a8c74a8f7cea3d0a98d80a2d2e91777c1e57dfe0ef807b8eaa67f300236aef6",
  [MANIFEST_RELATIVE]: "856ab8837d3eb20fc434ed16fd5a3966b23c2e81de312edb2291ff9b08d556cd",
  [METADATA_RELATIVE]: "87210d93cc792ce595194286de396283a83950c7b2c55645595f0fff595cdbf8",
  [RESEARCH_GAPS_RELATIVE]: "908596e26442b1577cc55ace9187efb7813343adb1d2ab1a0bb4d641191711fc",
  "docs/phase1/uruguay/research-gaps.md": "e1b03327d96fb37606f652be3b179c0c87bbd66682bf446d19f23d51dd200875",
  "docs/phase1/uruguay/validate.py": "f334f9ee142a07a814d451fd1b38a9dfd28217434ae93b120b6ac79205c08a18",
  [VALIDATION_RELATIVE]: "66bab8579e2b135c65abe43cfdaca6ac7a9eb09cc7e30ffb55b8eb17d11333a6",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "president",
  "vice_president",
  "senate",
  "chamber_of_representatives",
  "departmental_council",
  "intendente",
  "municipal_council",
  "alcalde",
  "national_collective_executive",
  "departmental_collective_executive",
  "historical_local_council",
] as const;

export type UruguayDraftTier = "national" | "regional" | "local";
export type UruguayRegisterStatus = "current" | "historical_only";
export type UruguayOfficeType = (typeof ALLOWED_OFFICE_TYPES)[number];
export type SchemaTier = "national_context" | "regional" | "municipal" | "other";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const OFFICE_ID_RE =
  /^(UY-N-(PRES|VP|SEN|REP)|UY-D-[A-Z]{2}-(J|I)|UY-M-[A-Z]{2}-[A-Z]+-(C|A)|UY-H-CNA|UY-H-CNG|UY-H-D-[A-Z]{2}-CD|UY-H-JLA-[A-Z]{2})$/;
const FORBIDDEN_OFFICE = /european parliament|parlamento europeo|\bmercosur\b|partido pol[ií]tico|gabinete|ministro/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!OFFICE_ID_RE.test(officeId)) throw new Error(`Refusing unlisted Uruguay office id ${officeId}`);
  if (!ALLOWED_TYPE_SET.has(officeType)) throw new Error(`Refusing unlisted Uruguay office type ${officeType} on ${officeId}`);
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) throw new Error(`Refusing excluded Uruguay office ${officeId}`);
  if (officeType === "president" && officeId !== PRESIDENT_ID) throw new Error(`Refusing a president office that is not ${PRESIDENT_ID}`);
  if (officeType === "vice_president" && officeId !== VICE_PRESIDENT_ID) {
    throw new Error(`Refusing a vice president office that is not ${VICE_PRESIDENT_ID}`);
  }
  if (officeType === "senate" && officeId !== SENATE_ID) throw new Error(`Refusing a senate that is not ${SENATE_ID}`);
  if (officeType === "chamber_of_representatives" && officeId !== REPRESENTATIVES_ID) {
    throw new Error(`Refusing a chamber of representatives that is not ${REPRESENTATIVES_ID}`);
  }
}

export function officeTypeFor(args: {
  officeId: string;
  officeKind: string;
  scopeLevel: string;
  officeStatus: string;
}): UruguayOfficeType {
  const { officeId, officeKind, scopeLevel, officeStatus } = args;
  if (officeId === PRESIDENT_ID && officeKind === "direct_executive" && scopeLevel === "national" && officeStatus === "current") {
    return "president";
  }
  if (officeId === VICE_PRESIDENT_ID && officeKind === "direct_executive" && scopeLevel === "national" && officeStatus === "current") {
    return "vice_president";
  }
  if (officeId === SENATE_ID && officeKind === "legislature" && scopeLevel === "national" && officeStatus === "current") return "senate";
  if (officeId === REPRESENTATIVES_ID && officeKind === "legislature" && scopeLevel === "national" && officeStatus === "current") {
    return "chamber_of_representatives";
  }
  if (officeStatus === "historical_only" && officeKind === "collective_executive" && scopeLevel === "national") {
    return "national_collective_executive";
  }
  if (officeStatus === "historical_only" && officeKind === "collective_executive" && scopeLevel === "departmental") {
    return "departmental_collective_executive";
  }
  if (officeStatus === "historical_only" && officeKind === "council" && scopeLevel === "municipal") return "historical_local_council";
  if (officeStatus === "current" && officeKind === "direct_executive" && scopeLevel === "departmental") return "intendente";
  if (officeStatus === "current" && officeKind === "council" && scopeLevel === "departmental") return "departmental_council";
  if (officeStatus === "current" && officeKind === "direct_executive" && scopeLevel === "municipal") return "alcalde";
  if (officeStatus === "current" && officeKind === "council" && scopeLevel === "municipal") return "municipal_council";
  throw new Error(`Unsupported Uruguay office ${officeId} kind ${officeKind} at scope ${scopeLevel} (${officeStatus})`);
}

export function isDirectExecutive(officeType: string): boolean {
  return officeType === "president" || officeType === "vice_president" || officeType === "intendente" || officeType === "alcalde";
}

export function isListSelectedAlcalde(officeType: string): boolean {
  return officeType === "alcalde";
}

export function expectedDraftTier(scopeLevel: string): UruguayDraftTier {
  if (scopeLevel === "national") return "national";
  if (scopeLevel === "departmental") return "regional";
  if (scopeLevel === "municipal") return "local";
  throw new Error(`Unsupported Uruguay scope ${scopeLevel}`);
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): SchemaTier {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "local") return "municipal";
  throw new Error(`Unsupported Uruguay draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: UruguayRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Uruguay register status ${String(registerStatus)}`);
}

export const OPEN_HOLD_IDS = [
  "UY-BF-G03",
  "UY-BF-G05",
  "UY-BF-G08",
  "UY-BF-G11",
  "UY-BF-G12",
  "UY-BF-G13",
  "UY-BF-G17",
  "UY-BF-G18",
  "UY-BF-G19",
  "UY-BF-G22",
  "UY-BF-G01",
  "UY-BF-G04",
  "UY-BF-G09",
  "UY-BF-G20",
] as const;

export const DOCUMENTED_NOT_IMPLEMENTED_ID = "UY-BF-G06";

export const RESOLVED_NOTE_IDS = [
  "UY-BF-G02",
  "UY-BF-G07",
  "UY-BF-G10",
  "UY-BF-G14",
  "UY-BF-G15",
  "UY-BF-G16",
  "UY-BF-G21",
] as const;

/** Source status labels. None of the named holds are closed by this import. */
export const GAP_STATUS: Readonly<Record<string, string>> = {
  "UY-BF-G01": "resolved_current_inventory_history_boundaries_open",
  "UY-BF-G02": "resolved_rule_exception_documented",
  "UY-BF-G03": "open_exhaustive_locality_inventory",
  "UY-BF-G04": "resolved_current_rule_history_transcription_open",
  "UY-BF-G05": "excluded_pending_peer_pack_policy",
  "UY-BF-G06": "resolved_documentation_only",
  "UY-BF-G07": "resolved_scope",
  "UY-BF-G08": "partly_transcribed_historical_hold",
  "UY-BF-G09": "resolved_observed_poll_inventory_legal_creation_dates_open",
  "UY-BF-G10": "resolved_rule",
  "UY-BF-G11": "partly_documented_exception_coverage_open",
  "UY-BF-G12": "open_numeric_hold",
  "UY-BF-G13": "open_numeric_hold",
  "UY-BF-G14": "resolved_with_independent_primary_dates",
  "UY-BF-G15": "resolved_audited_aliases",
  "UY-BF-G16": "resolved_rule",
  "UY-BF-G17": "open_upstream_dataset_hold",
  "UY-BF-G18": "open_remaining_proclamation_transcription",
  "UY-BF-G19": "open_explicit_coverage_limit",
  "UY-BF-G20": "resolved_model_history_detail_open",
  "UY-BF-G21": "resolved_rule",
  "UY-BF-G22": "open_person_level_transcription",
};

/** Named holds and the documented-not-implemented calendar note stay open. */
export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export function gapIsDocumentedNotImplemented(gapId: string): boolean {
  return gapId === DOCUMENTED_NOT_IMPLEMENTED_ID;
}

export const COUNTRY_NOTES = [
  "Prompt BF: 314 current offices and 24 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 6 national, 57 regional, and 275 local. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, regional to regional, and local to municipal. It does not replace the draft label.",
  "Current popular executive roles stay 157: the President, the Vice President, 19 intendentes, and 136 list-selected alcaldes. Current councils stay 155. Current national chambers stay 2.",
  "Alcalde rows stay list-selected offices inside the five-seat municipal council. No separate alcalde ballot contest is invented.",
  "EP offices stay 0. MERCOSUR offices stay 0. Uruguay-scope only.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted research bytes are not projected and omitted totals are not invented.",
  "Successor edges stay empty. The identity crosswalk records annex letters and says no succession edge; it is not projected as successor links.",
  "Upcoming-calendar docs stay documentary. Exact dates stay null. No country UI callout and no applied calendar rows. UY-BF-G06 stays documented-not-implemented.",
  "Every classification stays needs_review. Pack acceptance does not mark a row justin_approved.",
  "Holds UY-BF-G03, UY-BF-G05, UY-BF-G08, UY-BF-G11, UY-BF-G12, UY-BF-G13, UY-BF-G17, UY-BF-G18, UY-BF-G19, UY-BF-G22, UY-BF-G01, UY-BF-G04, UY-BF-G09, and UY-BF-G20 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 338,
  current_offices: 314,
  historical_offices: 24,
  geographies: 159,
  geographies_without_parent: 1,
  parents_left_null: 0,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 6,
  draft_tier_regional: 57,
  draft_tier_local: 275,
  schema_national: 6,
  schema_regional: 57,
  schema_municipal: 275,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 338,
  sources: 0,
  unresolved_evidence: 15,
  named_open_holds: 14,
  documented_not_implemented_holds: 1,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  retained_inputs: 34,
  research_dates: 0,
  applied_calendar_rows: 0,
  upcoming_calendar_family_rows: 8,
  deferred_calendar_hold_rows: 19,
  current_popular_executive_roles: 157,
  current_national_departmental_direct_executives: 21,
  current_list_selected_alcaldes: 136,
  current_councils: 155,
  current_national_chambers: 2,
  current_intendentes: 19,
  current_departmental_councils: 19,
  current_municipal_councils: 136,
  historical_collective_executives: 21,
  historical_national_collective_executives: 2,
  historical_departmental_collective_executives: 19,
  historical_local_councils: 3,
  president_offices: 1,
  vice_president_offices: 1,
  separate_executive_ballot_offices: 20,
  current_departments: 19,
  current_municipalities: 136,
  montevideo_municipalities: 8,
  canelones_municipalities: 32,
  ep_offices: 0,
  mercosur_offices: 0,
  evidence_links: 0,
} as const;

export type UruguayHashInputs = {
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

export function uruguayUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): UruguayHashInputs {
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

export function fingerprintSha256(hashInputs: UruguayHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
