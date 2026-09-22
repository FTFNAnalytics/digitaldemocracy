import { key } from "../../../scripts/import/normalize";
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
  sha256Hex,
  sortByInputPath,
  type HashInputDescriptor,
  type SchemaInputDescriptor,
} from "../identity";

export { OFFICE_NAMESPACE };
export {
  canonical,
  cellText,
  dateId,
  historyKey,
  isFixtureId,
  isHttpUrl,
  locator,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  sha256Hex,
  unresolvedId,
  type HashInputDescriptor,
  type Locator,
} from "../identity";
export { DEFAULT_OPERATOR, SCRIPT_VERSION } from "../identity";

export const LINEAGE_ID = "country-package-spain";
export const SOURCE_NAMESPACE = "country-package-spain";
export const COUNTRY_ID = "spain";
export const COUNTRY_CODE = "ES";
export const ADAPTER_VERSION = "atlas-spain-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/spain.json";
export const RESEARCH_PREFIX = "data/research/spain";
export const REGISTER_RELATIVE = "data/research/spain/office-register.json";
export const EVENTS_RELATIVE = "data/research/spain/events.json.gz";
export const GEOGRAPHY_RELATIVE = "data/research/spain/geography.json";
export const CROSSWALK_RELATIVE = "data/research/spain/identity-crosswalk.json";
export const UNBOUND_RELATIVE = "data/research/spain/unbound-municipal-blocks.json";
export const MUNICIPAL_BLOCKS_RELATIVE = "data/research/spain/municipal-source-blocks.jsonl.gz";
export const ACCEPTANCE_RELATIVE = "docs/phase1/spain/JUSTIN_ACCEPTANCE.md";
export const REGISTER_SHA256 = "5817713d1b14fc6cc4c0f077219112bc8ddafebad809fddc54406edd8431e008";
export const TIER_SHA256 = "61f8176df88a09d097e5d557b5a8cadf91acc7c28b5cf4f4ead79071b4364049";
/** Predecessor draft tier digest from Prompt AE. The approved file must not match it. */
export const DRAFT_TIER_SHA256 = "f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f";
/**
 * Documentary fingerprint of the full review pack (includes omitted results.json,
 * sources/, and identity vectors). The slim land does not contain those bytes.
 */
export const FULL_PACK_DOCUMENTARY_FINGERPRINT =
  "850e7645f7e36731a16041892e0036584039a80c87e111b87568b4bbbc515d17";

/** Pinned after approved-tier slim-pack inventory scan. Results and raw sources are not in the hash. */
export const CANDIDATE_FINGERPRINT = "1a3b9f84b5819cbf1eeb8afacd3fc00106f4281834fa91c24d9aacfa6aa3adfb";
export const CANDIDATE_RELEASE_ID =
  "country-package-spain--sha256-1a3b9f84b5819cbf1eeb8afacd3fc00106f4281834fa91c24d9aacfa6aa3adfb";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21";

export const MADRID_COUNCIL_ID = "ES-M28079-REP";
export const MADRID_GEOGRAPHY_ID = "ES-M28079";
export const MADRID_RECORD_KEY = "rec-e741e77e7360d961f59470fdb85ca55a7297eac3c3fbf31bd98d7e54165c436d";
export const MODE_PENDING_EXAMPLE_ID = "ES-M02001-REP";
export const CONCEJO_EXAMPLE_ID = "ES-M40019-REP";
export const FORMENTERA_ID = "ES-M07024-REP";
export const CEUTA_ID = "ES-M51001-REP";
export const MELILLA_ID = "ES-M52001-REP";
export const NAVARRA_PARLIAMENT_ID = "ES-A15-PARL";
export const BIZKAIA_JUNTAS_ID = "ES-P48-JG";
export const FUERTEVENTURA_CABILDO_ID = "ES-I351-COUNCIL";
export const ARAN_ID = "ES-ARAN-COUNCIL";
export const CONGRESO_ID = "ES-CONGRESO";
export const SENADO_ID = "ES-SENADO";
export const EP_ID = "ES-EP";
export const HISTORICAL_OFFICE_IDS = ["ES-M15026-REP", "ES-M15063-REP", "ES-M36011-REP", "ES-M36012-REP"] as const;
export const DISPUTED_HISTORY_KEYS = [
  "ES-M31243-REP::2015::2015-05-24",
  "ES-M46019-REP::2015::2015-05-24",
] as const;
export const FORBIDDEN_ISLAND_DUPLICATE_ID = "ES-I071-COUNCIL";
export const FORBIDDEN_NAVARRA_DIPUTACION_ID = "ES-P31-DIP";

export const NAMED_HOLDS = [
  "ES-G01",
  "ES-G02",
  "ES-G03",
  "ES-G04",
  "ES-G05",
  "ES-G06",
  "ES-G07",
  "ES-G08",
  "ES-G09",
  "ES-G10",
  "ES-G11",
  "ES-G12",
] as const;

export const HOLD_REASONS: Record<(typeof NAMED_HOLDS)[number], string> = {
  "ES-G01":
    "Current municipal ballot modes remain unresolved: 3762 current mode-pending mandates and 78 concejo-abierto currency holds. Do not add a second generic mayor.",
  "ES-G02": "Scanned municipal results and extraction coverage remain incomplete. Do not invent missing transcriptions.",
  "ES-G03":
    "Corrections and conflicting originals remain open. Two non-identical 2015 blocks for ES-M31243-REP and ES-M46019-REP stay disputed.",
  "ES-G04": "Regional, Senate, foral and island numeric depth is not normalized. Do not invent candidate-mark denominators.",
  "ES-G05":
    "38 ordinary provincial councils (Diputaciones) stay indirect. No constitution event or result is inferred from municipal election dates.",
  "ES-G06":
    "Historic municipal changes for INE codes 15026, 15063, 36011 and 36012 have no legal effective dates or successor bindings.",
  "ES-G07":
    "Ceuta, Melilla, Formentera and Aran stay special-regime rows. Basque Juntas stay distinct from executive Diputaciones. No invented direct presidents.",
  "ES-G08": "Island source currency remains open. Ten additional island councils stay; Formentera is not duplicated.",
  "ES-G09": "Every next date is unknown. No polling day is fabricated from an ordinary term or the alert window.",
  "ES-G10":
    "Submunicipal and special-district blocks stay unbound. They are not municipal council offices or events.",
  "ES-G11": "Source acquisition gaps remain. Failed downloads are not successful source rows, and omitted source bytes are not invented.",
  "ES-G12":
    "Result interpretation stays open. Slim land omits results.json, so no shares, winners, or result rows are invented.",
};

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "municipal_elected_mandate_mode_pending",
  "combined_municipal_island_council",
  "concejo_abierto_alcalde",
  "autonomous_city_assembly",
  "autonomous_community_parliament",
  "national_lower_chamber",
  "national_upper_chamber",
  "european_parliament_delegation",
  "provincial_council",
  "foral_general_assembly",
  "island_council",
  "special_territorial_assembly",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "68 regional offices (17 autonomous-community parliaments + 38 ordinary provincial councils + 3 Basque foral assemblies + 10 additional island councils). Do not report 68 as 68 autonomous communities. Diputaciones have no inferred constitution events. Ceuta, Melilla, Formentera and Aran stay other. Named holds ES-G01–ES-G12 stay open. Slim land omits results.json and sources/; none are invented.";

export const COUNTRY_NOTES = [
  "Prompt AE full register: 8,204 current + 4 historical offices. Coverage partial.",
  REGIONAL_CALENDAR_LABEL,
  "Explicit concejo-abierto direct executives: 78, on the same municipal mandate. 3,762 current municipal modes remain pending. No ordinary direct mayor is added.",
  "Formentera is one combined municipal/island body. Ceuta and Melilla are one autonomous-city assembly each.",
  "Four historical INE codes stay active with no successor edge.",
  "Slim pack omits results.json, sources/, and identity vectors. Result rows and source catalogue rows are not invented.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 8204,
  historical_offices: 4,
  offices: 8208,
  geographies: 8220,
  selected_histories: 20401,
  other_histories: 419,
  prospective_events: 0,
  total_events: 20820,
  result_rows: 0,
  municipal_offices: 8133,
  regional_offices: 68,
  national_offices: 2,
  other_offices: 5,
  provincial_councils: 38,
  island_councils: 10,
  foral_assemblies: 3,
  autonomous_parliaments: 17,
  concejo_abierto: 78,
  mode_pending_offices: 3766,
  mode_pending_current: 3762,
  autonomous_cities: 2,
  diputacion_events: 0,
  not_held_events: 69,
  disputed_events: 2,
  approved_classifications: 4311,
  needs_review_classifications: 3897,
  sources: 0,
  unresolved_evidence: 12,
  identity_crosswalks: 16356,
  retained_inputs: 7,
  research_dates: 20820,
  proceedings: 0,
  party_mappings: 0,
  successor_edges: 0,
  unbound_municipal_blocks: 6866,
} as const;

export type SpainHashInputs = {
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

export function eventIdFor(hk: string): string {
  return key("event", [COUNTRY_ID, OFFICE_NAMESPACE, hk]);
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
}): SpainHashInputs {
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

export function fingerprintSha256(hashInputs: SpainHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function isInventedExecutive(officeType: string): boolean {
  if (officeType === "concejo_abierto_alcalde") return false;
  return /mayor|alcalde|president|premier|prime_minister|cabinet/i.test(officeType);
}
