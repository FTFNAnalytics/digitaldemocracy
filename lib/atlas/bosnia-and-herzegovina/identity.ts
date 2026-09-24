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

/** Office namespace supplied by the Prompt AW register, including historical rows. */
export const CURRENT_NAMESPACE = "bosnia-herzegovina-research-aw-v1";
export const LINEAGE_ID = "country-package-bosnia-and-herzegovina";
export const SOURCE_NAMESPACE = "country-package-bosnia-and-herzegovina";
export const COUNTRY_ID = "bosnia-and-herzegovina";
export const COUNTRY_CODE = "BA";
export const COUNTRY_NAME = "Bosnia and Herzegovina";
export const ADAPTER_VERSION = "atlas-bosnia-and-herzegovina-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/bosnia-and-herzegovina.json";
export const DOCS_PREFIX = "docs/phase1/bosnia-and-herzegovina";
export const OFFICE_REGISTER_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/office-register.jsonl";
export const DRAFT_TIERS_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/draft-tiers.jsonl";
export const GEOGRAPHIES_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/geographies.jsonl";
export const TRANSITIONS_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/historical-office-transitions.json";
export const PROMPT_O_REFERENCE_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/prompt-o-detailed-results-reference.json";
export const COUNTS_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/counts.json";
export const RESEARCH_GAPS_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/research-gaps.json";
export const EXCLUDED_OFFICES_RELATIVE = "docs/phase1/bosnia-and-herzegovina/data/excluded-offices.json";
export const METADATA_RELATIVE = "docs/phase1/bosnia-and-herzegovina/metadata.json";
export const IDENTITY_VECTORS_RELATIVE = "docs/phase1/bosnia-and-herzegovina/Bosnia_Identity_Vectors.json";

/**
 * Full-pack results, events, and source extracts are not in the slim land.
 * Do not invent those files or omitted-total counters.
 * The Prompt O country package stays on disk as prior research. It is not the publish source.
 */
export const OMITTED_RESEARCH_DIR = "data/research/bosnia-and-herzegovina";
export const OMITTED_PATHS = [
  OMITTED_RESEARCH_DIR,
  "docs/phase1/bosnia-and-herzegovina/sources",
  "docs/phase1/bosnia-and-herzegovina/data/events.jsonl",
  "docs/phase1/bosnia-and-herzegovina/data/results.jsonl",
] as const;
export const PROMPT_O_PACKAGE_PREFIX = "data/countries/bosnia-and-herzegovina";

export const TIER_SHA256 = "96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9";
export const DRAFT_TIERS_SHA256 = "756923ddf74a9a1a76dfbf3c254a3494f02aae8c96a1b9490a7751ca74dc45fa";
export const OFFICE_REGISTER_SHA256 = "8705aced4d3284a8b70618622d28814565c0e18bae59f1f02cf9067cd14aeae5";
export const GEOGRAPHIES_SHA256 = "cd0ad87f786c5631439dd8205a3f0235d4b676f139e4e06d18208b5bacdec789";
export const PROMPT_O_REFERENCE_SHA256 = "a4b160e27d08c61fa8ae61f188ab7a4ba69b6c9f6bd217d5faaafff3dfb3106e";
export const IDENTITY_VECTORS_SHA256 = "4606e496ff2aa706ea58e10afe87dcbb5df68b8e04cc160b71d53272f01656e7";
/** Git blob of Bosnia_Identity_Vectors.json. Not the file SHA-256. Do not replace this blob. */
export const IDENTITY_VECTOR_GIT_BLOB = "5228f504e759b24e5b6fe36a1ad56db5b0874f29";
export const IDENTITY_VECTOR_BYTE_COUNT = 1159136;

/**
 * Figures recorded in the checked-in counts file for the full pack.
 * Slim land omitted the event, result, and source-extract files. These numbers
 * are not published as omitted-total counters.
 */
export const FULL_PACK_DOCUMENTED_EVENTS = 937;
export const FULL_PACK_DOCUMENTED_RESULTS = 918;
export const FULL_PACK_DOCUMENTED_SOURCE_EXTRACTS = 26;
export const PROMPT_O_DOCUMENTED_RESULT_ROWS = 749;
export const PROMPT_O_DOCUMENTED_HISTORY_EVENTS = 39;
export const PROMPT_O_DOCUMENTED_OFFICES = 13;

/**
 * Pinned after the slim-pack inventory scan. Tests fail closed if the bytes drift.
 */
export const CANDIDATE_FINGERPRINT = "a74e490721ad026ff104a643268d6929961cece6702e1dd1a2aa2c497c73a87d";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-23";

export const BRCKO_ASSEMBLY_ID = "BA-LOC-BRCKO-ASSEMBLY";
export const RS_PRESIDENT_ID = "BA-REG-RS-PRES";
export const RS_VP_IDS = ["BA-REG-RS-VP-01", "BA-REG-RS-VP-02"] as const;
export const SARAJEVO_COUNCIL_ID = "BA-LOC-SARAJEVO-CITY-COUNCIL";
export const ISTOCNO_SARAJEVO_ASSEMBLY_ID = "BA-LOC-ISTOCNO-SARAJEVO-CITY-ASSEMBLY";
export const STATE_HOR_ID = "BA-NAT-HOR";
export const COUNTRY_GEOGRAPHY_ID = "BA-GEO-STATE-BOSNIA-AND-HERZEGOVINA";

/** Prompt O office ids mapped to AW ids. Documentary only. Not successor edges and not result rows. */
export const PROMPT_O_OFFICE_CROSSWALK: Readonly<Record<string, string>> = {
  "BA-F": "BA-REG-FBIH-HOR",
  "BA-R": "BA-REG-RS-NA",
  "BA-G": "BA-REG-RS-PRES",
  "BA-201": "BA-REG-CANTON-01",
  "BA-202": "BA-REG-CANTON-02",
  "BA-203": "BA-REG-CANTON-03",
  "BA-204": "BA-REG-CANTON-04",
  "BA-205": "BA-REG-CANTON-05",
  "BA-206": "BA-REG-CANTON-06",
  "BA-207": "BA-REG-CANTON-07",
  "BA-208": "BA-REG-CANTON-08",
  "BA-209": "BA-REG-CANTON-09",
  "BA-210": "BA-REG-CANTON-10",
};

export const PINNED_INPUTS: Readonly<Record<string, string>> = {
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Acceptance_Examples.md":
    "44ca9b2c1201118239b7d2106d6678773ee94a263d9b515b26580affa78d5276",
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Field_Map.md":
    "62bb3476c3f13ad5c36b05307fc86ca81b54fe8c30862d19baca03a76fc6f44d",
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Full_Register_Report.md":
    "c2054dda8c6419c02ea2f87159e61b84b3ca950f6315b62cb0480575f4ebff59",
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Identity_Rules.md":
    "decc9e3112f3feef6f301464f9fbf820c8564a43f2402ba7da4f6ee9c64c3bab",
  [IDENTITY_VECTORS_RELATIVE]: IDENTITY_VECTORS_SHA256,
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Input_Inventory.json":
    "581c5d4329449cf4ef944a58e677e07ad38f821cd7ce2fee975f7759f0c1200b",
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Research_Gaps.md":
    "ae8c032ec245a930aa745fc28cfbc4e5f344b81beff389a22d1fa8241c440fcc",
  "docs/phase1/bosnia-and-herzegovina/Bosnia_Source_Inventory.md":
    "2307bb90e74be8258d3581229d36e757dfaada6bfcd8d8a3554486c0998f8df7",
  "docs/phase1/bosnia-and-herzegovina/JUSTIN_ACCEPTANCE.md":
    "e65a70a24b6e87446196d4708a45bb092abb51e8c626d45d07b0c5abe185d9ca",
  "docs/phase1/bosnia-and-herzegovina/JUSTIN_REPORT.md":
    "652e048e04ed7a9002db464fdb7fefa7e463c401ebf3a007815bddb81276ecca",
  "docs/phase1/bosnia-and-herzegovina/Prompt_AW_Full_Register_Field_Map_and_CI.md":
    "ab5643586f98e890b806635adb4559ba7aaaef9eb631f89ff7d36689ec44f4b5",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_Bosnia_Acceptance_Examples.md":
    "a171fea5b6be665fdc4b638f0461590cff9340098695df65051bf87952e86a76",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_Bosnia_Field_Map.md":
    "7b75eb871e35d8cda4f0d04c1ca48031386d12bfb6415074e744f889551b438f",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_Bosnia_Identity_Rules.md":
    "87de266d45ce0dd3d43542e267b6d79a15231f0c2706f87d4d22050d29403c03",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_Bosnia_Tiers_Accepted.md":
    "4ae01f12cde0eb1654c3e718686bb750cc8b1d1a02afe96516f481c00fe27303",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_README.md":
    "db39aa1f476990cb65be1a3d125dccdfa6ef18513b328d38243d36267bef238e",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_Tiers_Field_Map_and_CI.md":
    "c3839740b3c644077d24119734b1f10628d3acb94b793b3f085873825170557e",
  "docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json":
    "2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501",
  "docs/phase1/bosnia-and-herzegovina/README.md":
    "253b3b88c23edec2bab1299155651129bf6154c783f4098fc2614786a08e5bd3",
  "docs/phase1/bosnia-and-herzegovina/SHA256SUMS":
    "63daf0f807e47eb508063ac3f02d1f27c707fabf96a091af6be29d9d8f74a6ed",
  "docs/phase1/bosnia-and-herzegovina/contract/Inherited_223_Column_Contract.md":
    "973fe65242e4a6fa1962afbd10b08d1e03f4cfdb4df3f4ff47ddfe56a9d5f771",
  "docs/phase1/bosnia-and-herzegovina/contract/columns.json":
    "50ab3013ed9bdcb9b878356ce3c2f17bc5a2a37fa80e4746332fb82483d4e833",
  [COUNTS_RELATIVE]: "b63e4d2c96f7f791fb00de47d13d305d26bca9d6f7a8427bb4e54d3a7b86f6d3",
  [DRAFT_TIERS_RELATIVE]: DRAFT_TIERS_SHA256,
  [EXCLUDED_OFFICES_RELATIVE]: "0099eb5041a84fd3b5c476f8d073b6bdbf575d432d90adc0f9a460a8aa30bab1",
  [GEOGRAPHIES_RELATIVE]: GEOGRAPHIES_SHA256,
  [TRANSITIONS_RELATIVE]: "9c7152c028d579ff3ddb5be4d8e0a32333a6fec475cdee62b12b650b07ab65e0",
  [OFFICE_REGISTER_RELATIVE]: OFFICE_REGISTER_SHA256,
  [PROMPT_O_REFERENCE_RELATIVE]: PROMPT_O_REFERENCE_SHA256,
  [RESEARCH_GAPS_RELATIVE]: "10a6766c01c7b4b7f971428d7cf7b6a3e8608416730ef0018812dfdbf95351fa",
  "docs/phase1/bosnia-and-herzegovina/data/result-publication-bindings.json":
    "78205e936a341b188e7bb3fc2acd0afe8527308c947eeac00994053626b9c432",
  "docs/phase1/bosnia-and-herzegovina/data/source-inventory.json":
    "08c7b19c100a6ec666a051ead43b82fd0fc11cee8fb15bb0fcc54c3052da8c76",
  [METADATA_RELATIVE]: "b18b6a655850e93ab3d2196a519ea6971f0d25450f9744b4cda0eb8a78c1be5c",
  "docs/phase1/bosnia-and-herzegovina/validate.py":
    "1db8517e5c0eb3564048f567fd897e659ffe46a4d1d7c6ff0aa9115ddebbef38",
  "docs/phase1/bosnia-and-herzegovina/validation-report.json":
    "4cf1b69dedfbf1c91114a390ae8ec13d2cb44cea71cfed89d2fbe43038ab67be",
  "docs/phase1/bosnia-and-herzegovina/validation.json":
    "3a9599bc2de310bc3ba770266895a11cbc017a2064492e7648c45ec69453da34",
  [TIER_PATH]: TIER_SHA256,
};

export const ALLOWED_OFFICE_TYPES = [
  "presidency_member",
  "legislative_chamber",
  "entity_legislature",
  "entity_direct_executive",
  "cantonal_assembly",
  "municipal_council",
  "municipal_assembly",
  "municipal_mayor",
  "city_council",
  "city_assembly",
  "city_mayor",
  "district_assembly",
] as const;

export const DIRECT_EXECUTIVE_TYPES = [
  "municipal_mayor",
  "city_mayor",
  "entity_direct_executive",
  "presidency_member",
] as const;

export const COUNCIL_TYPES = [
  "legislative_chamber",
  "entity_legislature",
  "cantonal_assembly",
  "municipal_council",
  "municipal_assembly",
  "city_council",
  "city_assembly",
  "district_assembly",
] as const;

export type BosniaRegisterStatus = "current" | "historical_only";
export type BosniaDraftTier = "national" | "regional" | "municipal";
export type BosniaLevel = "state" | "entity" | "canton" | "municipal";

const ALLOWED_TYPE_SET = new Set<string>(ALLOWED_OFFICE_TYPES);
const REGISTER_KEYS = new Set([
  "id_namespace",
  "country_id",
  "record_state",
  "registry_qualified",
  "next_date",
  "next_date_resolution",
  "justin_approved",
  "office_id",
  "name",
  "office_type",
  "level",
  "tier",
  "office_status",
  "selection_mode",
  "direct_popular",
  "geography",
  "source_ids",
  "state_note",
  "entity",
  "basic_constituency_code",
]);
const REQUIRED_REGISTER_KEYS = [
  "id_namespace",
  "country_id",
  "record_state",
  "registry_qualified",
  "next_date",
  "next_date_resolution",
  "justin_approved",
  "office_id",
  "name",
  "office_type",
  "level",
  "tier",
  "office_status",
  "selection_mode",
  "direct_popular",
  "geography",
  "source_ids",
] as const;

const FORBIDDEN_OFFICE =
  /european parliament|house of peoples|council of peoples|mayor of sarajevo|mayor of mostar|mayor of brčko|mayor of brcko|council of ministers/i;
const PROMPT_O_OFFICE_IDS = new Set(Object.keys(PROMPT_O_OFFICE_CROSSWALK));

export function assertAllowedOfficeIdentity(officeId: string, officeType: string, name: string): void {
  if (!ALLOWED_TYPE_SET.has(officeType)) {
    throw new Error(`Refusing unlisted Bosnia office type ${officeType} on ${officeId}`);
  }
  if (PROMPT_O_OFFICE_IDS.has(officeId)) {
    throw new Error(`Refusing to publish Prompt O subset id ${officeId} as an AW office`);
  }
  const haystack = `${officeId} ${officeType} ${name}`;
  if (FORBIDDEN_OFFICE.test(haystack)) {
    throw new Error(`Refusing excluded Bosnia office ${officeId}`);
  }
  if (/european parliament/i.test(haystack) || /(^|[-_])EP($|[-_])/i.test(officeId)) {
    throw new Error(`Refusing a European Parliament office ${officeId}`);
  }
}

export function assertKnownRegisterKeys(officeId: string, row: object): void {
  const keys = new Set(Object.keys(row));
  for (const key of keys) {
    if (!REGISTER_KEYS.has(key)) {
      throw new Error(`Refusing undocumented Bosnia office field ${key} on ${officeId}`);
    }
    if (/predecessor|successor|fusion/i.test(key)) {
      throw new Error(`Refusing Bosnia successor field ${key} on ${officeId}`);
    }
  }
  for (const key of REQUIRED_REGISTER_KEYS) {
    if (!keys.has(key)) {
      throw new Error(`Bosnia office ${officeId} is missing ${key}`);
    }
  }
}

/** Atlas SQL interchange of a supplied draft tier. The draft label stays on the row. */
export function schemaInterchangeTier(draftTier: string): "national_context" | "regional" | "municipal" {
  if (draftTier === "national") return "national_context";
  if (draftTier === "regional") return "regional";
  if (draftTier === "municipal") return "municipal";
  throw new Error(`Unsupported Bosnia draft tier ${draftTier}`);
}

export function sqlOfficeStatus(registerStatus: BosniaRegisterStatus): "current" | "historical" {
  if (registerStatus === "current") return "current";
  if (registerStatus === "historical_only") return "historical";
  throw new Error(`Unsupported Bosnia register status ${String(registerStatus)}`);
}

export function isDirectExecutiveType(officeType: string): boolean {
  return (DIRECT_EXECUTIVE_TYPES as readonly string[]).includes(officeType);
}

export function isCouncilType(officeType: string): boolean {
  return (COUNCIL_TYPES as readonly string[]).includes(officeType);
}

export const OPEN_HOLD_IDS = [
  "BA-AW-G01",
  "BA-AW-G02",
  "BA-AW-G03",
  "BA-AW-G04",
  "BA-AW-G05",
  "BA-AW-G06",
  "BA-AW-G07",
  "BA-AW-G08",
  "BA-AW-G09",
] as const;
export const GAP_IDS = OPEN_HOLD_IDS;

export const GAP_STATUS: Readonly<Record<(typeof GAP_IDS)[number], string>> = {
  "BA-AW-G01": "open",
  "BA-AW-G02": "open",
  "BA-AW-G03": "open",
  "BA-AW-G04": "documented_gate",
  "BA-AW-G05": "documented_gate",
  "BA-AW-G06": "documented_gate",
  "BA-AW-G07": "documented_gate",
  "BA-AW-G08": "open",
  "BA-AW-G09": "source_discrepancy",
};

export function gapIsOpen(gapId: string): boolean {
  return (OPEN_HOLD_IDS as readonly string[]).includes(gapId);
}

export const REGIONAL_CALENDAR_LABEL =
  "15 regional offices (10 canton assemblies, the Federation House of Representatives, the RS National Assembly, the RS President, and two RS vice-president offices). Holds BA-AW-G01 through BA-AW-G09 stay open. No successor edges. Brčko Assembly is included; no Brčko mayor is invented. Slim land publishes 0 events and 0 result rows; those omitted files are not invented.";

export const COUNTRY_NOTES = [
  "Prompt AW: 306 current offices and 40 historical-only offices. Coverage partial. research_coverage_complete stays false.",
  "Draft tiers stay national 4, regional 15, and municipal 327. They are preserved on each classification row.",
  "The schema tier column interchanges national to national_context and keeps regional and municipal. It does not replace the draft label.",
  "Current breakout stays state 4, entity 5, canton 10, and municipal-local 287. Current direct executives stay 148. Current councils, chambers, and assemblies stay 158. European Parliament offices stay 0.",
  "Published events: 0. Published result rows: 0. Published sources: 0. Omitted results, events, and source extracts are not reconstructed and are not given omitted-total counters.",
  "Historical city-status transitions stay successor_edge_asserted false. No legal successor edge or effective date is invented.",
  "Prompt O continuity keeps Bosnia_Identity_Vectors.json at git blob 5228f504e759b24e5b6fe36a1ad56db5b0874f29 and the 13-office crosswalk inside prompt-o-detailed-results-reference.json. Those 749 numeric rows are not re-imported.",
  "Every classification stays needs_review. Per-office review_status stays draft_for_human_review and justin_approved stays false.",
  "Holds BA-AW-G01 through BA-AW-G09 stay open. RS vice-president rows stay the supplied VP-01 and VP-02 placeholders. No unidentified 143rd mayor is added.",
  "Supplied next-date fields are null. They are not coerced into research_date rows, and missing numerics are not stored as zero.",
].join(" ");

export const EXPECTED_COUNTS = {
  offices: 346,
  current_offices: 306,
  historical_offices: 40,
  geographies: 160,
  geography_state: 3,
  geography_entity: 2,
  geography_canton: 10,
  geography_municipal: 145,
  selected_histories: 0,
  prospective_events: 0,
  total_events: 0,
  proceedings: 0,
  result_rows: 0,
  draft_tier_national: 4,
  draft_tier_regional: 15,
  draft_tier_municipal: 327,
  schema_national: 4,
  schema_regional: 15,
  schema_municipal: 327,
  schema_other: 0,
  approved_classifications: 0,
  needs_review_classifications: 346,
  sources: 0,
  unresolved_evidence: 9,
  named_open_holds: 9,
  closed_gaps: 0,
  party_mappings: 0,
  identity_crosswalks: 0,
  explicit_predecessor_edges: 0,
  historical_transitions: 20,
  successor_edges_asserted: 0,
  retained_inputs: 37,
  research_dates: 0,
  direct_executive_offices: 148,
  historical_direct_executives: 20,
  current_councils_chambers_assemblies: 158,
  current_local_representative_bodies: 145,
  current_local_direct_executives: 142,
  current_state: 4,
  current_entity: 5,
  current_canton: 10,
  current_municipal_local: 287,
  ep_offices: 0,
  brcko_assembly_offices: 1,
  brcko_mayor_offices: 0,
  indirect_local_bodies: 2,
  prompt_o_subset_office_ids: 0,
  evidence_links: 0,
  namespace_offices: 346,
} as const;

export type BosniaHashInputs = {
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

export function bosniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): BosniaHashInputs {
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

export function fingerprintSha256(hashInputs: BosniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
