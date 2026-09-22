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

export const LINEAGE_ID = "country-package-portugal";
export const SOURCE_NAMESPACE = "country-package-portugal";
export const COUNTRY_ID = "portugal";
export const COUNTRY_CODE = "PT";
export const ADAPTER_VERSION = "atlas-portugal-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/portugal.json";
export const RESEARCH_PREFIX = "data/research/portugal";
export const REGISTER_RELATIVE = "data/research/portugal/office-register.json.gz";
/** Documentary path cited by the approved tier file; bytes live in the gzip sibling. */
export const REGISTER_LOGICAL = "data/research/portugal/office-register.json";
export const EVENTS_RELATIVE = "data/research/portugal/events.json.gz";
export const RESULTS_RELATIVE = "data/research/portugal/results.jsonl.gz";
export const GEOGRAPHY_RELATIVE = "data/research/portugal/geographies.json";
export const SOURCES_RELATIVE = "data/research/portugal/sources.json";
export const GAPS_RELATIVE = "data/research/portugal/research-gaps.json";
export const UNRESOLVED_RELATIVE = "data/research/portugal/unresolved-inputs.json";
export const CROSSWALK_RELATIVE = "data/research/portugal/identity-crosswalk.json.gz";
export const PROCEEDINGS_RELATIVE = "data/research/portugal/proceedings.json";
/** Uncompressed office-register.json SHA-256 pinned by the approved tier file. */
export const REGISTER_CONTENT_SHA256 = "62720e750e2ac0c54ff9654b0a5cedca0b98ab4e37c35fa2aca60b0db7925dd6";
export const TIER_SHA256 = "47f4fac833e61bad953abfb72f6e3253a1f4c2d7f35938b73de57f7b07724caa";
export const DRAFT_TIER_SHA256 = "5155830f9141ebe7607d51e888e804f63fe2305426d20998ff6e16917da5d651";

/** Pinned after the approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "9006f4e259762d9e19ee8702d141237a3e7ba832bbf37ea2b8a8d621c8c44649";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";

export const AGUEDA_AM_ID = "PT-M0101-AM";
export const AGUEDA_CM_ID = "PT-M0101-CM";
export const AGUEDA_PCM_ID = "PT-M0101-PCM";
export const PARISH_AF_ID = "PT-F010103-AF";
export const PARISH_JF_ID = "PT-F010103-JF";
export const PARISH_PJF_ID = "PT-F010103-PJF";
export const ALPHANUMERIC_AF_ID = "PT-F0302FA-AF";
export const ALPHANUMERIC_GEOGRAPHY_ID = "PT-F0302FA";
export const PLENARY_JF_ID = "PT-F040249-JF";
export const PLENARY_AF_ID = "PT-F040249-AF";
export const HISTORICAL_PARISH_AF_ID = "PT-F010121-H0365538da192-AF";
export const AZORES_ID = "PT-AC-AL";
export const MADEIRA_ID = "PT-MA-AL";
export const PARLIAMENT_ID = "PT-AR";
export const PRESIDENT_ID = "PT-PR";
export const EP_ID = "PT-EP";
export const PRESIDENT_2026_HK = "PT-PR::PR:2026";
export const PRESIDENT_2026_EVENT_ID = "event-0df4c7f008ffffe98f152f92";
export const PRESIDENT_2026_FIRST_ID = "proceeding-1e914ae9001c8732879785da";
export const PRESIDENT_2026_RUNOFF_ID = "proceeding-e965271501d97b172edf53d9";

export const NAMED_HOLDS = [
  "CURRENT-REGISTER-DATE",
  "INDIRECT-AND-LIST-HEAD",
  "PLENARY-37",
  "PARISH-REFORM-2013-2025",
  "PARISH-TIER",
  "LEGACY-CODE-CONFLICTS",
  "DATES-REPEATS-SPECIALS",
  "PUBLISHED-AGGREGATE-CONFLICTS",
  "PR-2026-RUNOFF",
  "PR-2016-MARGARITA",
  "AZORES-COMPENSATION",
  "MADEIRA-CORRECTION",
  "AR-EUROPE-2022",
  "EP-DETAIL",
  "PRE2009-AND-CANDIDATES",
  "MAI-FEED-HOLES",
  "CERTIFICATION-AND-MARGINS",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "2 regional offices (Açores and Madeira legislatures). No popular regional-government president. Parish assemblies, juntas, and parish presidents stay other while PARISH-TIER is open. Historical rows are unresolved aliases, not proved abolitions. Named holds stay open.";

export const COUNTRY_NOTES = [
  "Prompt AD full register: 10666 current + 8168 historical offices. Coverage partial.",
  "Câmara and junta presidents are winning-list heads. No second mayoral ballot and no separate popular junta contest.",
  "37 plenary parishes keep junta and president mandates and have no current elected parish assembly.",
  "Parish bodies stay tier other (PARISH-TIER). Do not reclassify them.",
  "Historical office_status marks a source-era identity. registry_qualified 0 withholds treating those rows as proved abolitions.",
  "Open named holds: CURRENT-REGISTER-DATE; INDIRECT-AND-LIST-HEAD; PLENARY-37; PARISH-REFORM-2013-2025; PARISH-TIER; LEGACY-CODE-CONFLICTS; DATES-REPEATS-SPECIALS; PUBLISHED-AGGREGATE-CONFLICTS; PR-2026-RUNOFF; PR-2016-MARGARITA; AZORES-COMPENSATION; MADEIRA-CORRECTION; AR-EUROPE-2022; EP-DETAIL; PRE2009-AND-CANDIDATES; MAI-FEED-HOLES; CERTIFICATION-AND-MARGINS.",
  "Slim pack omits bulky primary-source bytes and uncompressed results.json. results.jsonl.gz is the result table.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 10666,
  historical_offices: 8168,
  offices: 18834,
  geographies: 6328,
  selected_histories: 19820,
  other_histories: 0,
  prospective_events: 0,
  total_events: 19820,
  result_rows: 66283,
  disputed_results: 29,
  seats_unknown: 653,
  seats_zero: 18102,
  municipal_offices: 927,
  regional_offices: 2,
  national_offices: 2,
  other_offices: 17903,
  approved_classifications: 620,
  needs_review_classifications: 18214,
  sources: 895,
  catalogue_rows: 895,
  unresolved_evidence: 347,
  unresolved_research_gaps: 17,
  unresolved_inputs: 330,
  identity_crosswalks: 19866,
  retained_inputs: 31,
  research_dates: 19822,
  event_dates_year_called: 19654,
  event_dates_day_called: 166,
  proceeding_dates: 2,
  next_dates: 0,
  proceedings: 2,
  presidential_first_rounds: 1,
  presidential_runoffs: 1,
  party_mappings: 0,
  list_head_events: 0,
  list_head_results: 0,
  direct_regional_president_offices: 0,
  current_plenary_af_offices: 0,
  named_holds: 17,
} as const;

export const PARISH_OFFICE_TYPES = ["parish_assembly", "parish_executive_body", "parish_president"] as const;
export const MUNICIPAL_OFFICE_TYPES = ["municipal_assembly", "municipal_executive_body", "municipal_president"] as const;
export const LIST_HEAD_OFFICE_TYPES = ["municipal_president", "parish_executive_body", "parish_president"] as const;

export type PortugalHashInputs = {
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

export function portugalEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  archiveEntry: string | null,
  locatorValue: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(
    canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, archiveEntry, locatorValue], claimKind]),
  )}`;
}

export function portugalUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [sourceLocator], originalToken]))}`;
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
}): PortugalHashInputs {
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

export function fingerprintSha256(hashInputs: PortugalHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
