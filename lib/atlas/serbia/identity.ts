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

export const CURRENT_NAMESPACE = "serbia-research-ax-v1";
export const STATUS_CHANGE_NAMESPACE = "serbia:same_territory_status_change";
export const LINEAGE_ID = "country-package-serbia";
export const SOURCE_NAMESPACE = "country-package-serbia";
export const COUNTRY_ID = "serbia";
export const COUNTRY_CODE = "RS";
export const COUNTRY_NAME = "Serbia";
export const ADAPTER_VERSION = "atlas-serbia-prompt-ax/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/serbia.json";
export const DOCS_PREFIX = "docs/phase1/serbia";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/serbia/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/serbia/data/draft-tiers.jsonl";
export const COUNTS_RELATIVE = "docs/phase1/serbia/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/serbia/data/research-gaps.json";
export const CROSSWALK_RELATIVE = "docs/phase1/serbia/data/successor-crosswalk.json";
export const METADATA_RELATIVE = "docs/phase1/serbia/metadata.json";
export const SOURCE_INVENTORY_RELATIVE = "docs/phase1/serbia/data/source-inventory.json";
export const EVENTS_RELATIVE = "docs/phase1/serbia/data/events.jsonl";
export const RESULTS_RELATIVE = "docs/phase1/serbia/data/results.jsonl";
export const RESEARCH_DATES_RELATIVE = "docs/phase1/serbia/data/research-dates.jsonl";
export const LOCAL_AGGREGATES_RELATIVE = "docs/phase1/serbia/data/local-cycle-aggregates.json";
export const OMITTED_RESEARCH_DIR = "data/research/serbia";

export const ASSEMBLY_ID = "RS-NAT-ASSEMBLY";
export const PRESIDENT_ID = "RS-NAT-PRESIDENT";
export const VOJVODINA_ID = "RS-VOJ-ASSEMBLY";

export const TIER_SHA256 = "16f3dad98905ba545a5dc05686a189b465b87212850b319ae21b7db045d3785c";
export const DRAFT_TIERS_SHA256 = "2026fe95b998127d55f84e61f6c913097c65ebe38e4c6a0cc9472c6815a5ca54";
export const OFFICE_REGISTER_SHA256 = "62bcf627b04c7a19664ada09aac6c167f7e9e1e01f6ccdc74443df7c19f35d8d";

export const FULL_PACK_DOCUMENTED_EVENTS = 531;
export const FULL_PACK_DOCUMENTED_RESULTS = 671;
export const FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS = 30;
export const FULL_PACK_DOCUMENTED_RESEARCH_DATES = 531;

export const CANDIDATE_FINGERPRINT = "f3ac881ad73dbca05f507af5457ab1ed5fd1b4dc7750c20ab89640878dee50b7";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;
export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/serbia/JUSTIN_ACCEPTANCE.md": "c50594454f5542d359ba2d9bee31085ae937efc72d5416d8f38947bde81433fc",
  "docs/phase1/serbia/JUSTIN_REPORT.md": "210398b2cfb9174a824f84af6bec096ac65702986d028bb9c2e4fe8369238c34",
  "docs/phase1/serbia/Prompt_AX_Full_Register_Field_Map_and_CI.md": "c65550e19eb5f08dca4241c97c35f1f68b1faddc139ee8e01008baf0bfb15274",
  "docs/phase1/serbia/README.md": "bed4f0071d87f6ebd8b6ce5c067369a0c0d5bd1ae26deea7976c22517e921577",
  "docs/phase1/serbia/SHA256SUMS": "25e14550b75ed39545ca72f9f8d5c5c9244bb1b4547fca64374067e8a13f9a44",
  "docs/phase1/serbia/Serbia_Acceptance_Examples.md": "586ddd5df004cb969266aeef5d8dfd8a822cb24facc3ab072a8cf30a8e4b05a8",
  "docs/phase1/serbia/Serbia_Field_Map.md": "f766b6c27f812409ca4a181f897024d9103bfacd2968938487844127a78dc226",
  "docs/phase1/serbia/Serbia_Full_Register_Report.md": "584991bbc1effb65824781bd835d63061efe0cd84e8d6a6543088e08068ce18f",
  "docs/phase1/serbia/Serbia_Identity_Rules.md": "d444ffc703e7b04900e6daa4fb3077a351236017e2335a958c7ac326e2db46e5",
  "docs/phase1/serbia/Serbia_Import.md": "535078800799934d49c57d9c8a53838d9b626a45436890eb0a7ca501f409b0bf",
  "docs/phase1/serbia/Serbia_Office_Register.md": "9cf7677747856ca9faa5527572d013de1af0b1d2698c8606f3c9ecdbe2a95465",
  "docs/phase1/serbia/Serbia_Research_Gaps.md": "dc2836cd4d4ea0e5cb217b6b4260989d3b15ad1f466802e70e8cdf5d4ac3b8f5",
  "docs/phase1/serbia/Serbia_Source_Inventory.md": "4f81ca29b8bfc678e87757c14a8ad32baf4da1624162de74d303489cf491e9e8",
  "docs/phase1/serbia/contracts/Inherited_223_Column_Contract.md": "a4c16b6509f4e9229de11873313739fee15ca3e52855cb0718f4e9424b5bbed6",
  "docs/phase1/serbia/contracts/columns.json": "50ab3013ed9bdcb9b878356ce3c2f17bc5a2a37fa80e4746332fb82483d4e833",
  "docs/phase1/serbia/data/counts.json": "ba661b86accd985d01606cc72bda30861147316136ed07b40f981237948c36e0",
  "docs/phase1/serbia/data/draft-tiers.jsonl": "2026fe95b998127d55f84e61f6c913097c65ebe38e4c6a0cc9472c6815a5ca54",
  "docs/phase1/serbia/data/events.jsonl": "b4353674c581ab826131a5cfd46e86937db660b29c3690f5f240e1379608640d",
  "docs/phase1/serbia/data/local-cycle-aggregates.json": "8080e1ea128df10167d7d727d9151bff3d5a87235a6a22052978e66f2bd9f6d7",
  "docs/phase1/serbia/data/office-register.jsonl": "62bcf627b04c7a19664ada09aac6c167f7e9e1e01f6ccdc74443df7c19f35d8d",
  "docs/phase1/serbia/data/research-dates.jsonl": "6b7c121ee78be6e43fc3c12726ac3395be1a133ad3be9e4a4341c9d0dd464199",
  "docs/phase1/serbia/data/research-gaps.json": "b680f6d23b99826da02874b74492a5d9a1c95d8cb3c91032ccc00863683b96c3",
  "docs/phase1/serbia/data/results.jsonl": "993a82656f068877ff4ef47fec6776de6fd02e70438d2a7c2cdaef9a590c1ba8",
  "docs/phase1/serbia/data/source-inventory.json": "714ec640506f820483164fde572b57be8244aa8c8894477f6ed8fbd4756b8194",
  "docs/phase1/serbia/data/successor-crosswalk.json": "81e98cc0a11e7fceaa25d9fca53930d701bf80d7319d76013ab492d6c65dc4ba",
  "docs/phase1/serbia/metadata.json": "e207d16c553a58c0287f1d716bade08c6f4c92dbeea249e0698c792191b20aa2",
  "docs/phase1/serbia/sources/RS-S01.json": "20958911c57e7812f938556b4be6534495d0dc5f109fabce6b098ad37e52393f",
  "docs/phase1/serbia/sources/RS-S02.json": "91af9f998466ba77d4b8b09f74c882ed9f527337771fa4d390d4b2d620ff6004",
  "docs/phase1/serbia/sources/RS-S03.json": "6b19adb75b6bd7f31f89d527f747c078473171833a7416a93f29fb5f01f1f460",
  "docs/phase1/serbia/sources/RS-S04.json": "71dad47670ae446cdb14d1f3d0a987049130b7617f248a90c4484575825323ae",
  "docs/phase1/serbia/sources/RS-S05.json": "12f19daa4e39f9f1846fcb1c7801677512f3cc9072aa86743ea9b638a97c7a43",
  "docs/phase1/serbia/sources/RS-S06.json": "c2b15efd629b042d2d64e41792c1ed758ea6f5931f7bf780c0978612924df9ea",
  "docs/phase1/serbia/sources/RS-S07.json": "8a1be13096e911ff486d9c132fc9980c233c19bbfe39d1bdbd8669e136751d93",
  "docs/phase1/serbia/sources/RS-S08.json": "558b3e05335100731e542a5b5ada855298410d181f836f938202f8cb06b870f8",
  "docs/phase1/serbia/sources/RS-S09.json": "ea69ccafe63a3e45694e91a7b0acf8c32ce1d47ce384d686e71c7ac662e4980e",
  "docs/phase1/serbia/sources/RS-S10.json": "4d6db61bcc5dd1dbcac211e61d46c36ed3e73a2694e75a37b47cf201542b4084",
  "docs/phase1/serbia/sources/RS-S11.json": "cac9ec6a45b0a8f3ff780088ccbb0476d8f68a1db3ebc5697f868da05b8724d6",
  "docs/phase1/serbia/sources/RS-S12.json": "89610da5939c2fa49b9dd923ac0572693b7eddb0a5724244b2e6f2d4a963ec55",
  "docs/phase1/serbia/sources/RS-S13.json": "8c85241d46f3375dca5be3d55fae290a197994dcf1d2dfae84ae4bdfa22dd5b1",
  "docs/phase1/serbia/sources/RS-S14.json": "2bcce81adc91bba951c0ea9c295a08888a6ec8a93649a2862b6b605391300e6e",
  "docs/phase1/serbia/sources/RS-S15.json": "9dd12436d35f996d35a0fae1c89b6b6e32f457f27ab34ac24a010f48cffc6c65",
  "docs/phase1/serbia/sources/RS-S16.json": "80b4af35ca36e80d109f1b6d2f8140eed5829abbe2d8364ad9c3ddc0a4367b9b",
  "docs/phase1/serbia/sources/RS-S17.json": "e36abf0b1e966698dfce2caf6b040fabd798343a0f08b5a7355affeef72bbd38",
  "docs/phase1/serbia/sources/RS-S18.json": "9dbf89d993c82c0c7e942629ae606fcf0a592c0a248aed7ebe9fee05b86ed7e5",
  "docs/phase1/serbia/sources/RS-S19.json": "e2f0b584d14c9e7b102687dbbb62f0079524c63b75955e7ecd7bc62ffa5113d1",
  "docs/phase1/serbia/sources/RS-S20.json": "f6d236d6a7980d89b65d7ede2c9c46948522204858f4ae60fd1b23ab24e80f47",
  "docs/phase1/serbia/sources/RS-S21.json": "323d54f199b4c6275270c82b6fc57915cf522fab64a1bee6b5ab9773df6c0e9f",
  "docs/phase1/serbia/sources/RS-S22.json": "fc7e19431eb7443e54043ecb853e9e8b0929e1d097382ef40c0a48b5e167d351",
  "docs/phase1/serbia/sources/RS-S23.json": "c90e5c84c08c008f432828397f88f5a2e0826934407b1b187040bdabbb0c3a80",
  "docs/phase1/serbia/sources/RS-S24.json": "570f9031929165c5581fa1d81e708c5267100c6cade7a708f510b7c6ec513427",
  "docs/phase1/serbia/sources/RS-S25.json": "3b68b1783b3f7f0568885d63d44367ecf99061c26363e5ca797657bad1dca533",
  "docs/phase1/serbia/sources/RS-S26.json": "b49299fbfeab5f151253203dc97ffce100c7e5b5587243d297b4e1b0f984da15",
  "docs/phase1/serbia/sources/RS-S27.json": "548fd7284fdb8c58549a4072ad3ceeeb47b6c84495ab55f1e4b34ec38233a87f",
  "docs/phase1/serbia/sources/RS-S28.json": "4960b82671574d0ad88a4a79e0fa51fe179745fada72e2227ca776f0c1824a7e",
  "docs/phase1/serbia/sources/RS-S29.json": "3b48192072c37beba606460cff46b4fb302c9c170d67f1f97cb738a07634488b",
  "docs/phase1/serbia/sources/RS-S30.json": "9a857f450c8e586409117a4a2197645d478d3aad0f51cb578b3e729a385afd19",
  "docs/phase1/serbia/validate.py": "0c3437dcb2134ec1641070404a921d7ce5f0b33c69d05ffcca6cdd732ba1f6c4",
  "docs/phase1/serbia/validation-report.json": "933dd3be83ac19fb940b7840ce375d98592448c6d7901b35b65a331b34d454e6",
  "schemas/atlas/tiers/serbia.json": "16f3dad98905ba545a5dc05686a189b465b87212850b319ae21b7db045d3785c",
};

export const ALLOWED_OFFICE_TYPES = [
  "national_assembly",
  "president",
  "provincial_assembly",
  "local_assembly",
  "city_municipality_assembly",
  "municipality_assembly",
] as const;

export type SerbiaRegisterStatus = "current" | "historical_only";
export type SerbiaDraftTier = "national" | "regional" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "office_id",
  "country_id",
  "name",
  "office_type",
  "scope",
  "tier",
  "status",
  "selection_mode",
  "direct_executive",
  "geography_name",
  "parent_geography",
  "statistical_region",
  "source_ids",
  "state_note",
]);

const FORBIDDEN_OFFICE = /european parliament|evropski parlament|kosov|metohij|mayor|predsednik op[sš]tine|gradona[cč]elnik/i;

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Serbia office type ${officeType} on ${officeId}`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack) || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing excluded Serbia office ${officeId}`);
  }
  if (officeType === "president" && officeId !== PRESIDENT_ID) {
    throw new Error(`Refusing a president office that is not ${PRESIDENT_ID}`);
  }
  if (officeType === "national_assembly" && officeId !== ASSEMBLY_ID) {
    throw new Error(`Refusing a national assembly that is not ${ASSEMBLY_ID}`);
  }
  if (officeType === "provincial_assembly" && officeId !== VOJVODINA_ID) {
    throw new Error(`Refusing a provincial assembly that is not ${VOJVODINA_ID}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  for (const field of Object.keys(row)) {
    if (!REGISTER_KEYS.has(field)) {
      throw new Error(`Refusing undocumented Serbia office field ${field} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(field)) {
      throw new Error(`Refusing Serbia successor field ${field} on ${officeId}`);
    }
  }
}

export function schemaInterchangeTier(draftTier: string): "national_context" | "regional" | "municipal" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Serbia draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: SerbiaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Serbia register status ${String(registerStatus)}`);
}

export function geographyIdForSuppliedName(name: string): string {
  return key("geo", ["serbia", "name", name]);
}

export function geographyIdForUnnamedOffice(officeId: string): string {
  return key("geo", ["serbia", "office", officeId]);
}

export const GAP_FILE_ORDER = [
  "RS-AX-G01",
  "RS-AX-G02",
  "RS-AX-G03",
  "RS-AX-G04",
  "RS-AX-G05",
  "RS-AX-G06",
  "RS-AX-G08",
  "RS-AX-G09",
  "RS-AX-G10",
  "RS-AX-G07",
  "RS-AX-G11",
] as const;
export const OPEN_HOLD_IDS = [
  "RS-AX-G01",
  "RS-AX-G02",
  "RS-AX-G03",
  "RS-AX-G04",
  "RS-AX-G05",
  "RS-AX-G06",
  "RS-AX-G07",
  "RS-AX-G08",
  "RS-AX-G09",
  "RS-AX-G10",
  "RS-AX-G11",
] as const;
export const GAP_IDS = OPEN_HOLD_IDS;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "RS-AX-G01": "open",
  "RS-AX-G02": "documented",
  "RS-AX-G03": "documented",
  "RS-AX-G04": "documented",
  "RS-AX-G05": "scope_gate",
  "RS-AX-G06": "documented",
  "RS-AX-G07": "documented_partial",
  "RS-AX-G08": "open",
  "RS-AX-G09": "documented",
  "RS-AX-G10": "documented",
  "RS-AX-G11": "open",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const STATUS_CHANGE_EDGES = [
  ["RS-HIST-MUN-VRSAC", "RS-LSG-VRSAC", "2016-03-01", "RS-S26"],
  ["RS-HIST-MUN-KIKINDA", "RS-LSG-KIKINDA", "2016-03-01", "RS-S26"],
  ["RS-HIST-MUN-PIROT", "RS-LSG-PIROT", "2016-03-01", "RS-S26"],
  ["RS-HIST-MUN-BOR", "RS-LSG-BOR", "2018-06-20", "RS-S27"],
  ["RS-HIST-MUN-PROKUPLJE", "RS-LSG-PROKUPLJE", "2018-06-20", "RS-S27"],
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "1 regional office (Assembly of the Autonomous Province of Vojvodina). Holds RS-AX-G01 through RS-AX-G11 stay open. Kosovo-scope offices stay 0. Five same-territory status-change edges only. Published events and result rows stay 0; checked-in event and result files are not projected.";

export const COUNTRY_NOTES = [
  "Prompt AX rebuilt: 173 current offices and 5 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay 2 national, 1 regional, and 175 municipal. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context, keeps regional, and keeps municipal.",
  "Current offices are the National Assembly, the President, the Vojvodina Assembly, 145 top-level local assemblies, and 25 city-municipality assemblies.",
  "Current direct executives stay 1. Direct local executives stay 0. Direct provincial executives stay 0. European Parliament offices stay 0. Kosovo-scope offices stay 0.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Checked-in event, result, research-date, and source-extract files are retained and are not projected.",
  "Five same-territory status-change edges are published. boundary_change_claim stays false. They are not merger edges.",
  "Every classification stays needs_review. Per-office review_status stays draft_for_human_review and justin_approved stays false.",
  "Holds RS-AX-G01 through RS-AX-G11 stay open.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 178,
  current_offices: 173,
  historical_offices: 5,
  geographies: 178,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 2,
  draft_tier_regional: 1,
  draft_tier_municipal: 175,
  schema_national: 2,
  schema_regional: 1,
  schema_municipal: 175,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 178,
  sources: 0,
  unresolved_evidence: 11,
  named_open_holds: 11,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 5,
  explicit_predecessor_edges: 5,
  retained_inputs: 59,
  research_dates: 0,
  direct_executive_offices: 1,
  direct_local_executive_offices: 0,
  direct_provincial_executive_offices: 0,
  current_local_assemblies: 145,
  city_municipality_assemblies: 25,
  current_councils_chambers_assemblies: 172,
  current_national: 2,
  provincial_offices: 1,
  ep_offices: 0,
  kosovo_scope_offices: 0,
  evidence_links: 0,
} as const;

export type SerbiaHashInputs = {
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

export function serbiaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): SerbiaHashInputs {
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

export function fingerprintSha256(hashInputs: SerbiaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
