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

/** Current-office namespace supplied by the Iceland register. */
export const CURRENT_NAMESPACE = "iceland-research-av-v1";
/** Historical-office namespace supplied by the Iceland register. */
export const HISTORICAL_NAMESPACE = "iceland-research-av-v2";
export const MERGER_UPSTREAM_NAMESPACE = "iceland-municipality-temporal-office";
export const LINEAGE_ID = "country-package-iceland";
export const SOURCE_NAMESPACE = "country-package-iceland";
export const COUNTRY_ID = "iceland";
export const COUNTRY_CODE = "IS";
export const REGISTER_COUNTRY_ID = "IS";
export const COUNTRY_GEOGRAPHY_ID = "IS";
export const ADAPTER_VERSION = "atlas-iceland-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/iceland.json";
export const DOCS_PREFIX = "docs/phase1/iceland";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/iceland/data/office-register.json";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/iceland/data/draft-tiers.json";
export const GEOGRAPHIES_RELATIVE = "docs/phase1/iceland/data/geographies.json";
export const CROSSWALK_RELATIVE = "docs/phase1/iceland/data/identity-crosswalk.json";
export const COUNTS_RELATIVE = "docs/phase1/iceland/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/iceland/data/research-gaps.json";
export const HUMAN_REVIEW_RELATIVE = "docs/phase1/iceland/human-review.json";
export const METADATA_RELATIVE = "docs/phase1/iceland/metadata.json";

/**
 * Full-pack results, events, and source extracts are not in the slim land.
 * Do not invent those files or omitted-total counters.
 */
export const OMITTED_RESEARCH_DIR = "data/research/iceland";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/iceland/sources",
  "docs/phase1/iceland/data/events.json",
  "docs/phase1/iceland/data/results.json",
] as const;

export const ALTHINGI_ID = "IS-NAT-ALTHINGI";
export const PRESIDENT_ID = "IS-NAT-PRESIDENT";

export const TIER_SHA256 = "ec63cad685bd7eb484958b871f14d056c894ddb84ca63dd0522b76e0b73b8b59";
export const DRAFT_TIERS_SHA256 = TIER_SHA256;
export const OFFICE_REGISTER_SHA256 = "130cd83298eb6602c2b3fe6220073a1596d7caef609d34472c9c2dae977379ad";
export const GEOGRAPHIES_SHA256 = "9dbfc500fcc6377ad79c0a0034315ffbaa6fede19090d934e0bd8bcc900c8082";
export const CROSSWALK_SHA256 = "ef4d92aeebca51f4789b772e88b86af377edadebb411086b09360b7127cad9b0";
/** Full review ZIP. Not this release. */
export const REVIEW_ZIP_SHA256 = "a86c0637188ace9f206ec3de496cc5f27e32ebdf15f5a6aa0e8a05ee02b2bb0a";

/**
 * Figures recorded in the checked-in counts file for the full pack.
 * Slim land omitted the event, result, and source-extract files. These numbers
 * are not published as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 277;
export const FULL_PACK_DOCUMENTED_RESULTS = 393;
export const FULL_PACK_DOCUMENTED_SOURCES = 45;

/**
 * Pinned after the slim-pack inventory scan. The review ZIP hash is not this release.
 * Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "fe499539c383e89dcf2ab3dab7fab00c1a28b6cc229cdf44256a14dc4755639a";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";
export const COUNTRY_NAME = "Iceland";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/iceland/Iceland_Acceptance_Examples.md": "edb09b26ad04e9c091dbe9b5706d4a1c8ebc0b40e81edca11e3e463ac54d6fcc",
  "docs/phase1/iceland/Iceland_Field_Map.md": "bceb5cc3984ea316f5c8874ccd1308b7015e7033fdad465d76cb10af3aabdef2",
  "docs/phase1/iceland/Iceland_Identity_Rules.md": "9c35ed9da2a07f8933f2234529227db72d0121279db51d47ed20a0eb241804fa",
  "docs/phase1/iceland/Iceland_Office_Register.md": "1ee8681195aa705fcff8c7a49460d41e41293b0d8a72bddf15a542fa6d96e74a",
  "docs/phase1/iceland/Iceland_Research_Gaps.md": "ce36deecd681b9d457aa4a1ece9c4276889e02f3a4aa11720c6c1361bae29fe3",
  "docs/phase1/iceland/Iceland_Source_Inventory.md": "aabd4ac5d1632e98b8e583be877541b7499c129db2d06fe3b3729663a2120bf6",
  "docs/phase1/iceland/JUSTIN_ACCEPTANCE.md": "32fa073722dbc27cffe104ae03acc0111ba899ab3577c63650ec41f93bcade9e",
  "docs/phase1/iceland/JUSTIN_REPORT.md": "2473fbcf6b1afa8a5ce1e4987c3c7a2f743fc5647e766bb208cbaa8827f2742b",
  "docs/phase1/iceland/Prompt_AV_Full_Register_Field_Map_and_CI.md": "5d0bb545b94f44c48eae32d71e345dda968fc51c15bad0d6e1abe4a7b017e028",
  "docs/phase1/iceland/README.md": "780f0d5b1531e224e2cf6495ecf584ea5c2a3e010fdfc69be38cd05f06bd86aa",
  "docs/phase1/iceland/SHA256SUMS": "531bf3214bd58186e4c284828d0e3bdb3c4b03687c15dc8096ddda75919c65aa",
  "docs/phase1/iceland/SLIM_LAND_NOTE.md": "79ec04e24d263f2fc8df8f0dd6bcfdd00ca16dbc4382003de6dab76acfa74385",
  "docs/phase1/iceland/contract/Inherited_223_Column_Contract.md": "9a8e74fccf82e2f300a9a680bec2d584b16dbbe37c60855b340f9f7ffb5abc73",
  "docs/phase1/iceland/contract/columns.json": "50ab3013ed9bdcb9b878356ce3c2f17bc5a2a37fa80e4746332fb82483d4e833",
  [COUNTS_RELATIVE]: "cdd9e0012de88d679471a473e6176ef85acebc270b36192ae8d6bfbf76e63b55",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [GEOGRAPHIES_RELATIVE]: GEOGRAPHIES_SHA256,
  [CROSSWALK_RELATIVE]: CROSSWALK_SHA256,
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "382d0c1d869f58f0a09974fa7682c21bbe9dd622bd620941e1f3597800f41db3",
  "docs/phase1/iceland/data/source-discrepancies.json": "31cb64104ce29691a37c9f53ea8df0bc366b2f3d05f2b48fb90da6e0358bc1b5",
  "docs/phase1/iceland/data/source-inventory.json": "f823b882237387ed0e8102417a1f97003dc8df99d1cc38819107f12f67f82b59",
  [HUMAN_REVIEW_RELATIVE]: "31abe1255ba83191312c9e2b46c83db607f5073f8b5adc8e6111b630b96d6c90",
  [METADATA_RELATIVE]: "8f5368ba5f788b0bdf8f9a9d3ff9f961457a57d552b4827f346fa6afa2c3b97a",
  "docs/phase1/iceland/validate.py": "2b3e8cadce50a96bf206284648e5156f3c96fd3001160f9b19007129881d9a24",
  "docs/phase1/iceland/validation-report.json": "1e01a0d793d69224320f719e7d86aa1cc36e6c926321d1673ca14ccf4b2c8f42",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = ["legislature", "direct_executive", "municipal_council"] as const;

export type IcelandRegisterStatus = "current" | "historical_only";
export type IcelandDraftTier = "national" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "office_id",
  "id_namespace",
  "country_id",
  "geography_id",
  "name",
  "jurisdiction_name",
  "office_type",
  "status",
  "popular_selection",
  "direct_executive",
  "tier_draft",
  "source_ids",
  "record_state",
  "registry_qualified",
  "next_date",
  "state_note",
  "election_mode_2026",
  "successor_office_id",
  "observed_cycles",
]);

const FORBIDDEN_OFFICE = /european.?parliament|ep[-_ ]?delegation|forsætisráðherra|prime[-_ ]?minister|\bcabinet\b|borgarstjóri/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Iceland office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) {
    throw new Error(`Refusing excluded Iceland office ${officeId}`);
  }
  if (officeType === "direct_executive" && officeId !== PRESIDENT_ID) {
    throw new Error(`Refusing a direct executive that is not the President on ${officeId}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  for (const key of Object.keys(row)) {
    if (!REGISTER_KEYS.has(key)) {
      throw new Error(`Refusing undocumented Iceland office field ${key} on ${officeId}`);
    }
  }
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "municipal" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Iceland draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: IcelandRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Iceland register status ${String(registerStatus)}`);
}

export const OPEN_HOLD_IDS = ["IS-G01", "IS-G06"] as const;
export const CLOSED_GAP_IDS = ["IS-G02", "IS-G03", "IS-G04", "IS-G05"] as const;
export const GAP_IDS = ["IS-G01", "IS-G02", "IS-G03", "IS-G04", "IS-G05", "IS-G06"] as const;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "IS-G01": "open_nonblocking_for_office_event_register",
  "IS-G02": "closed_for_cycle_reconciliation",
  "IS-G03": "closed",
  "IS-G04": "closed",
  "IS-G05": "closed",
  "IS-G06": "open_documented_discrepancy",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. 61 current municipal councils plus Alþingi and the President. Holds IS-G01 and IS-G06 stay open. 24 source-supported predecessor edges only. Slim land publishes 0 events and 0 result rows; those omitted files are not invented.";

export const COUNTRY_NOTES = [
  "Prompt AV: 63 current offices and 24 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national and 85 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps municipal. It does not replace the draft label.",
  "Current offices are 61 municipal councils, Alþingi, and the President. Current direct executives stay 1. Direct municipal executives stay 0. European Parliament offices stay 0.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted results, events, and source extracts are not reconstructed and are not given omitted-total counters.",
  "Identity-crosswalk predecessor edges stay the 24 source-supported links. No guessed merger edge is added.",
  "Every classification stays needs_review. Per-office review_status stays draft_for_human_review and justin_approved stays false.",
  "Holds IS-G01 and IS-G06 stay open. IS-G02 through IS-G05 stay closed as supplied.",
  "Supplied next-date labels stay on the office row. Their precision and certainty are not coerced into research_date rows.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 87,
  current_offices: 63,
  historical_offices: 24,
  geographies: 86,
  current_geographies: 62,
  historical_geographies: 24,
  municipality_geographies: 85,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_municipal: 85,
  schema_national: 2,
  schema_regional: 0,
  schema_municipal: 85,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 87,
  sources: 0,
  unresolved_evidence: 6,
  named_open_holds: 2,
  closed_gaps: 4,
  party_mappings: 0,
  identity_crosswalks: 24,
  explicit_predecessor_edges: 24,
  retained_inputs: 27,
  research_dates: 0,
  direct_executive_offices: 1,
  direct_municipal_executive_offices: 0,
  current_municipal_councils: 61,
  historical_municipal_councils: 24,
  current_council_or_chamber_offices: 62,
  ep_offices: 0,
  althingi_offices: 1,
  president_offices: 1,
  evidence_links: 0,
  current_namespace_offices: 63,
  historical_namespace_offices: 24,
  election_mode_restricted_proportional_list: 50,
  election_mode_unrestricted: 7,
  election_mode_unopposed_no_poll: 4,
} as const;

export type IcelandHashInputs = {
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

export function icelandUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): IcelandHashInputs {
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

export function fingerprintSha256(hashInputs: IcelandHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
