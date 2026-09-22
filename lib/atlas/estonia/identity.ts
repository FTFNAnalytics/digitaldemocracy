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

export const LINEAGE_ID = "country-package-estonia";
export const SOURCE_NAMESPACE = "country-package-estonia";
export const COUNTRY_ID = "estonia";
export const COUNTRY_CODE = "EE";
export const ADAPTER_VERSION = "atlas-estonia-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/estonia.json";
export const RESEARCH_PREFIX = "data/research/estonia";
export const REGISTER_RELATIVE = "data/research/estonia/office-register.json";
export const EVENTS_RELATIVE = "data/research/estonia/events.json";
export const GEOGRAPHY_RELATIVE = "data/research/estonia/geography.json";
export const SOURCES_RELATIVE = "data/research/estonia/sources.json";
export const CROSSWALK_RELATIVE = "data/research/estonia/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/estonia/proceedings.json";
export const COUNTRY_RELATIVE = "data/research/estonia/country.json";
export const COUNTS_RELATIVE = "data/research/estonia/counts.json";
export const NONADDITIVE_RELATIVE = "data/research/estonia/nonadditive-list-summaries.json";
/** Omitted from the slim land. Do not invent these bytes or the 49,504 result rows. */
export const OMITTED_RESULTS_RELATIVE = "data/research/estonia/results.json";
export const REGISTER_SHA256 = "f5e41c9673f33777e103afa0ed067b71b5c2b5aee36389816f3b3f1fd4180ba0";
export const TIER_SHA256 = "bf86952fe8966a792166064e6505932ce590c3643951a802ba55896a332cfa8d";
export const DRAFT_TIER_SHA256 = "ae9f02831902fa9981adf3aa034bc92dd6c7861b66621a1ff66652fd4e0daa25";
/** Documentary full-pack fingerprint from Prompt AF identity rules. Not the slim approved import. */
export const DOCUMENTARY_DRAFT_FINGERPRINT = "f28f6134f30031e3b012d9631d69bbf548d18a0bb1e66728d5b097dc9f0ba7ce";

/** Pinned after the approved-tier slim-pack inventory scan. */
export const CANDIDATE_FINGERPRINT = "5f636f95e4727caffc41297a36253b2d5959d851bce626edc8562a5fd07263a4";
export const CANDIDATE_RELEASE_ID =
  "country-package-estonia--sha256-5f636f95e4727caffc41297a36253b2d5959d851bce626edc8562a5fd07263a4";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21";

export const EP_ID = "EE-EP";
export const RIIGIKOGU_ID = "EE-RIIGIKOGU";
export const PRESIDENT_ID = "EE-PRESIDENT";
export const TALLINN_ID = "EE-M0784-C";
export const JOHVI_CURRENT_ID = "EE-M0250-C";
export const JOHVI_HISTORICAL_ID = "EE-M0251-C";
export const TOILA_ID = "EE-M0803-C";
export const PRESIDENT_1992_HK = "EE-PRESIDENT::PRES_1992";
export const PRESIDENT_1992_EVENT_ID = "event-26a2a9b6757e472d8dbd1492";
export const PRESIDENT_1992_FIRST_ID = "proceeding-80bd9a1beb414a4be8f80a25";
export const PRESIDENT_1992_SECOND_ID = "proceeding-3251eba44418f090d4a5ffb9";
export const PRESIDENT_2016_HK = "EE-PRESIDENT::PRES_2016";
export const PRESIDENT_2016_EVENT_ID = "event-09b21320841577a56279e713";
export const PRESIDENT_2016_REPEAT_ID = "proceeding-27053c97c40b19529b38d082";
export const PRESIDENT_2026_HK = "EE-PRESIDENT::PRES_2026";
export const PRESIDENT_2026_EVENT_ID = "event-0be59d7c59d10cbeecf5f200";
export const KOV_2013_EXAMPLE_HK = "EE-M0105-C::KOV_2013";
export const KOV_2013_EXAMPLE_EVENT_ID = "event-95a57d911a1f52355490c894";
export const RIIGIKOGU_2023_HK = "EE-RIIGIKOGU::RK_2023";
export const RIIGIKOGU_2023_EVENT_ID = "event-6d5bad208a9551c351ab4161";
export const COUNTRY_RECORD_KEY = "rec-3c50c13133995488d22099d921404b3529be87b4f96bc6a85009bfb4a83c1738";
export const CROSSWALK_REASON = "Preserve exact source EHAK code; not a legal successor assertion.";

export const NAMED_HOLDS = [
  {
    token: "EE-G01",
    reason:
      "2017 reform and successor bindings remain open. 200 historical EHAK-coded councils are retained; disappearance is not a legal abolition date and no successor edges are guessed.",
  },
  {
    token: "EE-G02",
    reason:
      "Pre-2013 and intervening special history remain open. Earlier official counts do not create offices.",
  },
  {
    token: "EE-G03",
    reason:
      "2021 presidential gap remains open. No 2021 numeric row is invented. The current presidency stays indirect; 1992 is the evidenced transitional popular-ballot exception.",
  },
  {
    token: "EE-G04",
    reason:
      "Mayor-mode legal text remains open. No current direct-executive office is asserted. Linnapea and vallavanem are not additional popular ballots.",
  },
  {
    token: "EE-G05",
    reason:
      "EP tier and replacements remain open. One Estonia EP delegation is retained; mandate changes are not new contests.",
  },
  {
    token: "EE-G06",
    reason:
      "2013 archive conflict remains open. Detailed XML sums to 625,334 while official general statistics report 625,336 valid votes. No two-vote correction is applied.",
  },
  {
    token: "EE-G07",
    reason:
      "Date precision remains open. 215 local 2013 events stay year precision. Next 2027 and 2029 metadata is year-only and is not a prospective event.",
  },
  {
    token: "EE-G08",
    reason:
      "Jõhvi–Toila transition remains open. Current council is EE-M0250-C. Earlier Jõhvi EE-M0251-C and Toila EE-M0803-C stay historical with no successor edge.",
  },
  {
    token: "EE-G09",
    reason:
      "Nonadditive interpretation remains open. Party and list totals stay out of result_row. Slim-pack results.json is omitted and its 49,504 rows are not invented.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. County statistical groupings are not elected regional bodies. 78 current municipal councils. Named holds EE-G01–EE-G09 stay open. No mayor, county-governor, cabinet, or Tallinn district office. The presidency stays indirect except the evidenced 1992 popular-ballot exception.";

export const COUNTRY_NOTES = [
  "Prompt AF full register: 81 current + 200 historical offices. Coverage partial.",
  "Current scope is 78 municipal councils, Riigikogu, the indirect presidency, and the Estonia EP delegation.",
  "Current direct-executive offices: 0. No mayor, county-governor, cabinet, or Tallinn district office is invented.",
  "200 historical EHAK-coded councils stay separate. No successor edges.",
  "The presidency stays indirect except the evidenced 1992 transitional popular ballot.",
  "Alert window (~18 months) filters alerts only; historic and out-of-window offices are retained.",
  "Open named holds: EE-G01; EE-G02; EE-G03; EE-G04; EE-G05; EE-G06; EE-G07; EE-G08; EE-G09.",
  "Slim pack omits results.json (49,504 rows), identity vectors, and raw sources/. Those bytes are not invented. nonadditive-list-summaries.json is retained and is not a result table.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 81,
  historical_offices: 200,
  offices: 281,
  geographies: 279,
  selected_histories: 464,
  other_histories: 0,
  prospective_events: 0,
  total_events: 464,
  result_rows: 0,
  documented_result_rows_omitted: 49504,
  municipal_offices: 278,
  regional_offices: 0,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 79,
  needs_review_classifications: 202,
  sources: 223,
  unresolved_evidence: 9,
  unresolved_research_gaps: 9,
  identity_crosswalks: 278,
  retained_inputs: 15,
  research_dates: 497,
  event_dates_year_called: 215,
  event_dates_day_called: 249,
  next_dates_year_expected: 9,
  proceeding_dates_day: 24,
  proceedings: 24,
  presidential_first_rounds: 7,
  presidential_runoffs: 16,
  presidential_repeats: 1,
  party_mappings: 0,
  mayor_offices: 0,
  current_direct_executive_offices: 0,
  current_councils: 78,
  current_indirect_presidential_offices: 1,
  named_holds: 9,
  president_2021_events: 0,
  president_indirect_events: 6,
  president_1992_events: 1,
  roster_2013: 215,
  roster_2017: 79,
  roster_2021: 79,
  roster_2025: 78,
  evidence_links: 1403,
} as const;

export type EstoniaHashInputs = {
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

export function estoniaEvidenceId(
  rec: string,
  sourceId: string,
  occurrence: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], occurrence, claimKind]))}`;
}

export function estoniaUnresolvedId(rec: string, sourceLocator: string, originalToken: string): string {
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
}): EstoniaHashInputs {
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

export function fingerprintSha256(hashInputs: EstoniaHashInputs): string {
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

export function isMayorToken(value: string | null | undefined): boolean {
  if (!value) return false;
  return (
    /linnapea|vallavanem|maavanem|peaminister|prime.?minister|\bcabinet\b|\bmayor\b/i.test(value) ||
    /(?:^|-)M$/.test(value)
  );
}
