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

export const LINEAGE_ID = "country-package-latvia";
export const SOURCE_NAMESPACE = "country-package-latvia";
export const COUNTRY_ID = "latvia";
export const COUNTRY_CODE = "LV";
export const ADAPTER_VERSION = "atlas-latvia-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/latvia.json";
export const RESEARCH_PREFIX = "data/research/latvia";
export const REGISTER_RELATIVE = "data/research/latvia/office-register.json";
export const EVENTS_RELATIVE = "data/research/latvia/events.json";
export const RESULTS_RELATIVE = "data/research/latvia/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/latvia/geography.json";
export const SOURCES_RELATIVE = "data/research/latvia/sources.json";
export const CROSSWALK_RELATIVE = "data/research/latvia/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/latvia/proceedings.json";
export const COUNTRY_RELATIVE = "data/research/latvia/country.json";
export const COUNTS_RELATIVE = "data/research/latvia/counts.json";
export const CLAIMS_RELATIVE = "data/research/latvia/unresolved-aggregate-claims.json";
/** Omitted from the slim land. Do not invent these bytes. */
export const OMITTED_RAW_SOURCES_PREFIX = "data/research/latvia/sources/";
export const OMITTED_IDENTITY_VECTORS = "docs/phase1/latvia/Latvia_Identity_Vectors.json";
export const REGISTER_SHA256 = "705cdafb1bed115524ff282c02ad2f0341a10a4af728660380ee9109bc6fbada";
export const RESULTS_SHA256 = "fef559a14433c8cb97dd46a91a956bf63fec30cb5415ea653514de705e975ed4";
export const TIER_SHA256 = "227f743ab91c6d86f711be2fd5314e3e7c573da233b9a61187c8a3b37abb34f3";
export const DRAFT_TIER_SHA256 = "7d9dd90af38a532a1148848598aaf90cb6ce95ca4edd7b4aa26d1734452498ce";
/** Documentary full-pack fingerprint from Prompt AG identity rules. Not the approved import. */
export const DOCUMENTARY_DRAFT_FINGERPRINT = "cb5cd35449a13d006e128b40b0e271b0d2312e2738d571377c84c26e86edda90";

/** Pinned after the approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "cfa671671ead18cac2ab340598b9eccb5f102ad75004223538089dbcc96ccf3c";
export const CANDIDATE_RELEASE_ID =
  "country-package-latvia--sha256-cfa671671ead18cac2ab340598b9eccb5f102ad75004223538089dbcc96ccf3c";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21";

export const EP_ID = "LV-EP";
export const SAEIMA_ID = "LV-SAEIMA";
export const PRESIDENT_ID = "LV-PRESIDENT";
export const RIGA_ID = "LV-LOCAL-2021-riga-C";
export const RIGA_GEOGRAPHY_ID = "LV-LOCAL-2021-riga";
export const MADONA_2025_ID = "LV-LOCAL-2025-madonas-novads-C";
export const MADONA_2021_ID = "LV-LOCAL-2021-madonas-novads-C";
export const VARAKLANI_2021_ID = "LV-LOCAL-2021-varaklanu-novads-C";
export const HISTORICAL_COUNCIL_EXAMPLE_ID = "LV-LOCAL-2017-cvk-b1d419b64aeed8ddeb9738e5-C";
export const RIGA_2020_HK = "LV-LOCAL-2021-riga-C::RD2020";
export const RIGA_2020_EVENT_ID = "event-87893be979d9c2905f2e8360";
export const RIGA_2025_HK = "LV-LOCAL-2021-riga-C::PV2025";
export const SAEIMA_2026_HK = "LV-SAEIMA::SV2026";
export const SAEIMA_2026_EVENT_ID = "event-44b77f5cab63aae83685f132";
export const SAEIMA_2022_HK = "LV-SAEIMA::SV2022";
export const EP_2014_HK = "LV-EP::EP2014";
export const EP_2014_EVENT_ID = "event-578f28a7ace27c5d6832a3ab";
export const PRESIDENT_2003_HK = "LV-PRESIDENT::PRES2003";
export const PRESIDENT_2003_EVENT_ID = "event-3dc20d50c280d2069c4c1dd1";
export const PRESIDENT_2015_HK = "LV-PRESIDENT::PRES2015";
export const PRESIDENT_2015_EVENT_ID = "event-37060bdb3aff7f17cbc9e0fe";
export const PRESIDENT_2015_PROCEEDING_ID = "proceeding-d7da8b78eaf3b484d34e8c8e";
export const PRESIDENT_2023_HK = "LV-PRESIDENT::PRES2023";
export const PRESIDENT_2023_EVENT_ID = "event-512a46cff5d8b25eb1f60d35";
export const PRESIDENT_2023_PROCEEDING_ID = "proceeding-3da7d0fa832ce5544c9a996e";
export const DISPUTED_SHARE_RESULT_ID = "result-18e570d4e26f446809537fc3";
export const COUNTRY_RECORD_KEY = "rec-bba56b86705fbb041d2f89d34a024e74e1a9ded0025467965c8b570217092562";
export const CROSSWALK_REASON = "Exact source-scoped register alias; NOT a predecessor/successor relation.";

export const NAMED_HOLDS = [
  {
    token: "LV-G01",
    reason:
      "2021 reform and cross-epoch identities remain open. 121 historical rows are identity records, not an abolished-council count, and no successor edges are guessed.",
  },
  {
    token: "LV-G02",
    reason:
      "Earlier history and repeat ballots remain open. 1994–2013 cycle pages and the 2017 Ķekava precinct note do not create extra offices or a second completed council cycle.",
  },
  {
    token: "LV-G03",
    reason:
      "Presidential ballots remain incomplete and indirect. No popular presidential ballot, missing round, or 2007/2011/2019 vector is invented.",
  },
  {
    token: "LV-G04",
    reason:
      "Council chair versus executive director remains open. Neither is an additional popular ballot. No direct-executive office is asserted.",
  },
  {
    token: "LV-G05",
    reason:
      "EP delegation tier and replacements remain open. One Latvia EP delegation is retained; mandate changes are not new contests.",
  },
  {
    token: "LV-G06",
    reason:
      "Seven competing 2022 percentage claims remain open. Archive shares stay disputed. No alternate percentage is selected.",
  },
  {
    token: "LV-G07",
    reason:
      "Certification, result grain, and absent fields remain open. Blank seats stay unknown. Official provenance is not a blanket certification.",
  },
  {
    token: "LV-G08",
    reason:
      "Dates and out-of-window alerts remain open. Only the announced Saeima 2026-10-03 contest is prospective. No synthetic municipal or EP next event is created.",
  },
  {
    token: "LV-G09",
    reason:
      "Retained source scope remains open. Raw sources/ and identity vectors were omitted from the slim land and are not invented. Navigation pages are not evidence of absent numeric facts.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. Planning regions and Vidzeme/Latgale groupings are not elected regional bodies. 42 current municipal councils (7 state-city + 35 novadi). Named holds LV-G01–LV-G09 stay open. No popular mayor, appointed executive director, or planning-region office. The presidency stays Saeima-indirect.";

export const COUNTRY_NOTES = [
  "Prompt AG full register: 45 current + 121 historical offices. Coverage partial.",
  "Current scope is 42 municipal councils (7 state-city + 35 novadi), Saeima, the indirect presidency, and the Latvia EP delegation.",
  "Current direct-executive offices: 0. No popular mayor, appointed executive director, or planning-region office is invented.",
  "121 historical identity records stay separate. They are not an abolished-council count. No successor edges.",
  "The presidency stays Saeima-indirect. 2003 is year precision. 2015 keeps sequence 5 and 2023 keeps sequence 1. Missing rounds are not synthesized.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open named holds: LV-G01; LV-G02; LV-G03; LV-G04; LV-G05; LV-G06; LV-G07; LV-G08; LV-G09.",
  "Seven 2022 Saeima percentage conflicts stay disputed. Archive shares are retained and no alternate is selected.",
  "Slim pack omits raw sources/ and identity vectors. Those bytes are not invented. results.json (1,383 rows) is published.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 45,
  historical_offices: 121,
  offices: 166,
  geographies: 164,
  selected_histories: 216,
  other_histories: 0,
  prospective_events: 1,
  total_events: 217,
  result_rows: 1383,
  disputed_share_rows: 7,
  presidential_result_rows: 5,
  elected_true_rows: 2,
  elected_false_rows: 3,
  municipal_offices: 163,
  regional_offices: 0,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 42,
  needs_review_classifications: 124,
  sources: 188,
  unresolved_evidence: 16,
  unresolved_named_holds: 9,
  unresolved_share_claims: 7,
  unresolved_research_gaps: 9,
  identity_crosswalks: 163,
  retained_inputs: 16,
  research_dates: 220,
  event_dates_year_called: 1,
  event_dates_day_called: 216,
  next_dates_day_called: 1,
  proceeding_dates_day: 2,
  proceedings: 2,
  party_mappings: 0,
  mayor_offices: 0,
  current_direct_executive_offices: 0,
  current_councils: 42,
  current_indirect_presidential_offices: 1,
  current_state_city_councils: 7,
  current_novads_councils: 35,
  named_holds: 9,
  president_indirect_events: 6,
  president_popular_events: 0,
  roster_pv2017: 119,
  roster_pv2021: 40,
  roster_vrd2021: 2,
  roster_rd2020: 1,
  roster_pv2025: 42,
  evidence_links: 2225,
} as const;

export type LatviaHashInputs = {
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

export function latviaEvidenceId(
  rec: string,
  sourceId: string,
  occurrence: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], occurrence, claimKind]))}`;
}

export function latviaUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): LatviaHashInputs {
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

export function fingerprintSha256(hashInputs: LatviaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function hostnameOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
