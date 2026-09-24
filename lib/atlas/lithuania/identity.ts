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

export const LINEAGE_ID = "country-package-lithuania";
export const SOURCE_NAMESPACE = "country-package-lithuania";
export const COUNTRY_ID = "lithuania";
export const COUNTRY_CODE = "LT";
export const ADAPTER_VERSION = "atlas-lithuania-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/lithuania.json";
export const RESEARCH_PREFIX = "data/research/lithuania";
export const REGISTER_RELATIVE = "data/research/lithuania/office-register.json";
export const EVENTS_RELATIVE = "data/research/lithuania/events.json";
export const RESULTS_RELATIVE = "data/research/lithuania/results.json";
export const GEOGRAPHY_RELATIVE = "data/research/lithuania/geography.json";
export const SOURCES_RELATIVE = "data/research/lithuania/sources.json";
export const CROSSWALK_RELATIVE = "data/research/lithuania/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/lithuania/proceedings.json";
export const COUNTRY_RELATIVE = "data/research/lithuania/country.json";
export const COUNTS_RELATIVE = "data/research/lithuania/counts.json";
export const UNRESOLVED_RELATIVE = "data/research/lithuania/unresolved-aggregate-claims.json";
export const RECONCILIATION_RELATIVE = "data/research/lithuania/return-reconciliation.json";
export const BINDINGS_RELATIVE = "data/research/lithuania/register-bindings.json";
export const GAPS_RELATIVE = "data/research/lithuania/source-acquisition-gaps.json";
export const SOURCES_NOTE_RELATIVE = "data/research/lithuania/SOURCES_NOTE.md";
/** Omitted from the slim land. Do not invent these bytes to recreate the documentary fingerprint. */
export const OMITTED_SOURCES_PREFIX = "data/research/lithuania/sources/";
export const OMITTED_VALIDATOR_RELATIVE = "data/research/lithuania/validate.py";
export const REGISTER_SHA256 = "af5db7786c6d271db38ecc44734aae160534a0c1f183d51fa2cd23b89985d6b3";
export const RESULTS_SHA256 = "00d39867d31e3356896ecdd0adbbe097d96d9cb81dca164242d9992285c8bcac";
export const TIER_SHA256 = "43933567bfa84c95d354e4b1eb9a02d43123b3a802b057eca319a0b6b1fe2e39";
/**
 * Documentary full-pack fingerprint from Prompt AH identity rules, including omitted raw sources/.
 * Not the slim import. Approval was not a byte rewrite of the draft tier file.
 */
export const DOCUMENTARY_DRAFT_FINGERPRINT = "921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918";
export const DOCUMENTARY_DRAFT_RELEASE_ID =
  "country-package-lithuania--sha256-921981fee160b1f146ab20fdeae230b6928381190d124030f48ffbae5d8bf918";

/** Pinned after the slim-pack inventory scan. Raw sources/ are not part of this release. */
export const CANDIDATE_FINGERPRINT = "dfabafab9ca296bc0a1b63cd34cfbe77d76cf732b99de592d338e73cec4155eb";
export const CANDIDATE_RELEASE_ID =
  "country-package-lithuania--sha256-dfabafab9ca296bc0a1b63cd34cfbe77d76cf732b99de592d338e73cec4155eb";

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-21; underlying source dates differ";

export const NATIONAL_GEOGRAPHY_ID = "LT";
export const SEIMAS_ID = "LT-SEIMAS";
export const PRESIDENT_ID = "LT-PRESIDENT";
export const EP_ID = "LT-EP";
export const AKMENE_GEOGRAPHY_ID = "LT-lsa-61244a98ecf1b6948da37f0c";
export const AKMENE_COUNCIL_ID = "LT-lsa-61244a98ecf1b6948da37f0c-C";
export const AKMENE_MAYOR_ID = "LT-lsa-61244a98ecf1b6948da37f0c-M";
export const AKMENE_COUNCIL_RECORD_KEY = "rec-754540e3e4700c0411642bd3caf8e67c6d0a447255526c0c852135f9ad2e9d92";
export const COUNTRY_RECORD_KEY = "rec-38dcf4367f91f54de669e70b1dd22ad9aeca1effc0853faa5b0c0e3046d4b98d";
export const EP_2004_HK = "LT-EP::EP2004";
export const EP_2004_EVENT_ID = "event-3d387a9f91ad362847a8fb6a";
export const PRESIDENT_2019_HK = "LT-PRESIDENT::PRE2019";
export const PRESIDENT_2019_EVENT_ID = "event-161ed64ee44d4e92e516d7de";
export const PRESIDENT_2019_FIRST_ID = "proceeding-a9fb2536bc45cf80b6bbdcbc";
export const PRESIDENT_2019_RUNOFF_ID = "proceeding-c14a7c59881496c1c079089c";
export const PRESIDENT_DISPUTED_RESULT_ID = "result-aba5f2db8a9d584157da8c94";
export const SEIMAS_2016_HK = "LT-SEIMAS::SEI2016";
export const SEIMAS_2016_EVENT_ID = "event-0f5a78d003fd58aac869a7b5";
export const MALFORMED_INVALID_TOKEN = "1,7205";
export const CROSSWALK_NAMESPACE_PREFIX = "lsa:municipality-website:2026-snapshot:";

export const NAMED_HOLDS = [
  {
    token: "LT-HISTORY",
    reason:
      "Municipal and older national history remain open. Unavailable VRK returns are not zero-vote contests, and 0 recovered historical offices is not proof that none existed.",
  },
  {
    token: "LT-TERRITORIAL-ID",
    reason:
      "Official territorial codes and historic municipalities remain open. Website aliases are not legal codes, and no merger or successor edge is guessed.",
  },
  {
    token: "LT-MAYOR-LAW",
    reason:
      "Direct-mayor introduction and the 2023 institutional change remain open. 2015 is introduction-cycle context, not a fabricated ballot day. No deputy or director office is added.",
  },
  {
    token: "LT-PRESIDENT-DENOMINATOR",
    reason:
      "2019 presidential percentage basis remains disputed. Eleven shares stay disputed. The malformed runoff invalid text is retained and is not corrected.",
  },
  {
    token: "LT-SEIMAS-GRAIN",
    reason:
      "Mixed-system grain remains open. PR and SMC components stay distinct. The 2012 narrative subtotal of 139 is not balanced to 141, and 2024 has no result vector.",
  },
  {
    token: "LT-EP-DETAIL",
    reason:
      "EP delegation detail remains open. One delegation office stays other. Published Other parties is an aggregate label, not a legal party. Year precision stays where no day was recovered.",
  },
  {
    token: "LT-PARTY-PRECISION",
    reason:
      "Party labels and approximate percentages remain open. No canonical party mapping is created. Missing loser rows are not uncontested elections.",
  },
  {
    token: "LT-NEXT-AND-LEGAL",
    reason:
      "Next dates and certification remain open. Current offices stay with NULL next dates. Term length does not generate a future election day.",
  },
  {
    token: "LT-EXCLUSIONS",
    reason:
      "No popular county governor, cabinet, prime minister, administration director, deputy mayor, or seniūnija board is created. Zero regional offices is not a phase failure.",
  },
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "0 regional offices. County labels are geographic context, not elected regional bodies. 60 municipal councils and 60 direct mayors. Named holds LT-HISTORY, LT-TERRITORIAL-ID, LT-MAYOR-LAW, LT-PRESIDENT-DENOMINATOR, LT-SEIMAS-GRAIN, LT-EP-DETAIL, LT-PARTY-PRECISION, LT-NEXT-AND-LEGAL, and LT-EXCLUSIONS stay open. The presidency is directly popular; 2019 keeps a first round and a runoff on one cycle. No guessed successor edges.";

export const COUNTRY_NOTES = [
  "Prompt AH full register: 123 current offices and 0 recovered historical offices. Coverage partial. historical_office_universe_complete is false.",
  "Current scope is 60 municipal councils, 60 directly elected mayors, Seimas, the directly elected president, and the Lithuania EP delegation.",
  "Direct executives: 61. Draft tiers stay draft_for_human_review: 120 municipal / 0 regional / 2 national / 1 other, all needs_review.",
  "30 historic events and 130 result rows. Mayor history is 19 winner observations from 2019, not complete returns. Missing results stay gaps, not zeros.",
  "The presidency is directly popular. 2019 is one cycle with a first round and a runoff. Eleven percentage shares stay disputed. Malformed invalid text 1,7205 is not corrected.",
  "Alert window (~18 months) filters alerts only. No next-date rows and no prospective events.",
  "Open named holds: LT-HISTORY; LT-TERRITORIAL-ID; LT-MAYOR-LAW; LT-PRESIDENT-DENOMINATOR; LT-SEIMAS-GRAIN; LT-EP-DETAIL; LT-PARTY-PRECISION; LT-NEXT-AND-LEGAL; LT-EXCLUSIONS.",
  "Slim pack omits raw sources/ and validate.py. Those bytes are not invented. sources.json is the catalogue.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 123,
  historical_offices: 0,
  offices: 123,
  geographies: 61,
  selected_histories: 30,
  other_histories: 0,
  prospective_events: 0,
  total_events: 30,
  result_rows: 130,
  council_result_rows: 0,
  mayor_result_rows: 19,
  presidential_result_rows: 11,
  seimas_result_rows: 49,
  ep_result_rows: 51,
  disputed_shares: 11,
  municipal_offices: 120,
  regional_offices: 0,
  national_offices: 2,
  other_offices: 1,
  approved_classifications: 0,
  needs_review_classifications: 123,
  sources: 53,
  unresolved_evidence: 21,
  unresolved_denominator_claims: 11,
  malformed_invalid_claims: 1,
  named_holds: 9,
  identity_crosswalks: 120,
  retained_inputs: 15,
  research_dates: 55,
  event_dates_year_called: 7,
  event_dates_month_called: 1,
  event_dates_day_called: 22,
  proceeding_dates_day: 25,
  proceedings: 25,
  presidential_first_rounds: 1,
  presidential_runoffs: 1,
  seimas_proceedings: 4,
  mayor_proceedings: 19,
  party_mappings: 0,
  mayor_offices: 60,
  current_direct_executive_offices: 61,
  current_councils: 60,
  current_direct_presidents: 1,
  council_events: 0,
  mayor_events: 19,
  evidence_links: 508,
} as const;

export type LithuaniaHashInputs = {
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

export function proceedingIdFor(officeId: string, hk: string, sequence: number): string {
  return key("proceeding", [OFFICE_NAMESPACE, officeId, hk, `ballot-${sequence}`]);
}

export function resultIdFor(
  officeId: string,
  hk: string,
  proceedingId: string | null,
  candidateSourceId: string,
): string {
  return key("result", [OFFICE_NAMESPACE, officeId, hk, proceedingId ?? "main", candidateSourceId]);
}

export function lithuaniaEvidenceId(
  rec: string,
  sourceId: string,
  occurrence: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], occurrence, claimKind]))}`;
}

export function lithuaniaUnresolvedId(rec: string, occurrence: unknown, originalToken: string): string {
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
}): LithuaniaHashInputs {
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

export function fingerprintSha256(hashInputs: LithuaniaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}
