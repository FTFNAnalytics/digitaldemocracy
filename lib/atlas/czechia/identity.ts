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

export const LINEAGE_ID = "country-package-czechia";
export const SOURCE_NAMESPACE = "country-package-czechia";
export const COUNTRY_ID = "czechia";
export const COUNTRY_CODE = "CZ";
export const ADAPTER_VERSION = "atlas-czechia-full-register/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/czechia.json";
export const RESEARCH_PREFIX = "data/research/czechia";
export const REGISTER_RELATIVE = "data/research/czechia/office-register.json";
export const EVENTS_RELATIVE = "data/research/czechia/events.json.gz";
export const GEOGRAPHY_RELATIVE = "data/research/czechia/geographies.json";
export const SOURCES_RELATIVE = "data/research/czechia/sources.json";
export const GAPS_RELATIVE = "data/research/czechia/research-gaps.json";
export const CROSSWALK_RELATIVE = "data/research/czechia/identity-crosswalk.json";
export const PROCEEDINGS_RELATIVE = "data/research/czechia/proceedings.json";
export const SHARE_REVIEW_RELATIVE = "data/research/czechia/share-semantic-review.json";
export const TERRITORIAL_RELATIVE = "data/research/czechia/territorial-reconciliation.json";
export const RETAINED_CANDIDATES_RELATIVE = "data/research/czechia/retained-only-candidate-index.json";
export const REGISTER_SHA256 = "e3e2e478bd744f7d45f13434121362b6b877928b9251a66cf1f03558a9965e69";
export const TIER_SHA256 = "6b7c856cf164a0d04fc58048783593591855e40c626b0a0ee767d666910bd66a";
/** Predecessor draft tier digest from Prompt V. The approved file must not match it. */
export const DRAFT_TIER_SHA256 = "465c61ab0836ec18fd03c1e6af922e9918a184be00237fd238f0107386235244";
/**
 * Documentary fingerprint of the full review pack (includes omitted results.jsonl.gz,
 * identity vectors, and sources/). The slim land does not contain those bytes.
 */
export const FULL_PACK_DOCUMENTARY_FINGERPRINT =
  "3f4571dd4ac0eebbb7518de0ba08a0a2ac96a306be92bc2ee266559d13d8c3ec";

/** Pinned after approved-tier slim-pack inventory scan. Results and raw sources are not in the hash. */
export const CANDIDATE_FINGERPRINT = "5fde2d2069ce22fdf03ab03794c6322253bb48a7c2d0391b095a3a5c52f6ccb4";
export const CANDIDATE_RELEASE_ID = `${LINEAGE_ID}--sha256-${CANDIDATE_FINGERPRINT}`;

export const RESEARCH_SNAPSHOT_LABEL = "2026-09-20";
export const PROSPECTIVE_LOCAL_DATE = "2026-10-09";
export const PROSPECTIVE_LOCAL_TOKEN = "kv:20261009";

export const PRAGUE_ASSEMBLY_ID = "CZ-M554782-C";
export const PRAGUE_GEOGRAPHY_ID = "CZ-M554782";
export const PRAGUE_RECORD_KEY = "rec-8beefc1fca6da34eb58afa3143f985fc661beb3a21664a7168e068e5c751441b";
export const PRAGUE_NEXT_DATE_ID = "date-bff3419cab4d23c847f45fec929ffd461a47f0dbd595ea83725deb5dc7a0b184";
export const PRAGUE_NEXT_HISTORY_KEY = "CZ-M554782-C::kv:20261009";
export const BOROUGH_EXAMPLE_ID = "CZ-M500054-C";
export const REGIONAL_EXAMPLE_ID = "CZ-K01-C";
export const REGIONAL_2008_HISTORY_KEY = "CZ-K01-C::kz:2008";
export const REGIONAL_2008_EVENT_ID = "event-bc07776154c21acdd246ed88";
export const HISTORICAL_EXAMPLE_ID = "CZ-M530255-C";
export const PRESIDENT_ID = "CZ-PRESIDENT";
export const CHAMBER_ID = "CZ-PS";
export const SENATE_ID = "CZ-SENAT";
export const EP_ID = "CZ-EP";
export const PROSPECTIVE_EXAMPLE_ID = "CZ-M500011-C";
export const PROSPECTIVE_EXAMPLE_HISTORY_KEY = "CZ-M500011-C::kv:20261009";
export const PROSPECTIVE_EXAMPLE_EVENT_ID = "event-3c2d97eca59d8859c509c816";
export const SENATE_REPEAT_HISTORY_KEY = "CZ-SENAT::senat:20170127::obvod:4";
export const SENATE_REPEAT_EVENT_ID = "event-f51fe6b645d3c4bda53c8d11";

export const ALLOWED_OFFICE_TYPES = [
  "municipal_council",
  "borough_council",
  "capital_regional_municipal_assembly",
  "regional_assembly",
  "national_lower_chamber",
  "national_upper_chamber",
  "direct_national_executive",
  "european_parliament_delegation",
] as const;

export const LOCAL_COUNCIL_TYPES = new Set<string>([
  "municipal_council",
  "borough_council",
  "capital_regional_municipal_assembly",
]);

export const NAMED_HOLDS = [
  "MUNICIPAL-RECALCULATED-PERCENT",
  "HISTORICAL-CODE-BINDING",
  "PRAGUE-DUAL-STATUS",
  "MILITARY-CIVILIAN-TRANSITION",
  "CURRENT-ROSTER-VALIDITY",
  "EXECUTIVE-MODE",
  "HISTORIC-DEPTH",
  "LEGAL-OUTCOME-REPEAT-AUDIT",
  "EP-PARTY-SCOPE",
  "DATES-AND-NEXT-CYCLES",
] as const;

export const REGIONAL_CALENDAR_LABEL =
  "14 regional offices (13 kraj assemblies + one Prague city assembly). PRAGUE-DUAL-STATUS stays open: Prague is one body, not a second regional office, and borough councils stay other. 13 kraj assemblies have unknown next dates. Named holds stay open. No council-selected mayor or governor rows. Slim land omits result bytes; none are invented.";

export const COUNTRY_NOTES = [
  "Prompt V full register: 6,411 current + 13 historical offices. Coverage partial.",
  "President is the only direct executive. Council-selected mayors and governors are not offices.",
  "Prague stays one city/region body (CZ-M554782-C). Borough councils stay other. No second Prague office.",
  "Historical CISOB / municipal codes stay unbound. No invented successors.",
  "Open named holds: MUNICIPAL-RECALCULATED-PERCENT; HISTORICAL-CODE-BINDING; PRAGUE-DUAL-STATUS; MILITARY-CIVILIAN-TRANSITION; CURRENT-ROSTER-VALIDITY; EXECUTIVE-MODE; HISTORIC-DEPTH; LEGAL-OUTCOME-REPEAT-AUDIT; EP-PARTY-SCOPE; DATES-AND-NEXT-CYCLES.",
  "Slim pack omits sources/ and results.jsonl.gz. Result rows are not invented. Municipal PROCHLSTR shares stay unprojected.",
].join(" ");

export const EXPECTED_COUNTS = {
  current_offices: 6411,
  historical_offices: 13,
  offices: 6424,
  geographies: 6421,
  selected_histories: 38749,
  other_histories: 1066,
  prospective_events: 6421,
  total_events: 46236,
  result_rows: 0,
  municipal_offices: 6257,
  regional_offices: 14,
  national_offices: 3,
  other_offices: 150,
  borough_councils: 149,
  regional_assemblies: 13,
  prague_assemblies: 1,
  direct_national_executives: 1,
  direct_local_executives: 0,
  council_assembly_offices: 6420,
  approved_classifications: 6269,
  needs_review_classifications: 155,
  sources: 221,
  unresolved_evidence: 10,
  identity_crosswalks: 6424,
  retained_inputs: 11,
  research_dates: 52630,
  event_dates_day_called: 46157,
  event_dates_year_called: 79,
  next_dates_day_called: 6394,
  next_history_keys: 6394,
  proceedings: 934,
  proceedings_first_round: 478,
  proceedings_runoff: 456,
  party_mappings: 0,
  successor_edges: 0,
  repeated_events: 1,
  special_events: 946,
  not_held_events: 141,
} as const;

export type CzechiaHashInputs = {
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

export function proceedingIdFor(officeId: string, hk: string, sequenceNo: number): string {
  return key("proceeding", [OFFICE_NAMESPACE, officeId, hk, "round", sequenceNo]);
}

export function czechiaEvidenceId(
  rec: string,
  sourceId: string,
  inputPath: string,
  archiveEntry: unknown,
  locatorValue: unknown,
  claimKind: string,
): string {
  return `ev-${sha256Hex(
    canonical([rec, [COUNTRY_ID, LINEAGE_ID, sourceId], [inputPath, archiveEntry, locatorValue], claimKind]),
  )}`;
}

export function czechiaUnresolvedId(rec: string, originalToken: string): string {
  return `unres-${sha256Hex(canonical([rec, [GAPS_RELATIVE, originalToken], originalToken]))}`;
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
}): CzechiaHashInputs {
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

export function fingerprintSha256(hashInputs: CzechiaHashInputs): string {
  return sha256Hex(canonical(hashInputs));
}

export function releaseIdFor(fingerprint: string): string {
  return `${LINEAGE_ID}--sha256-${fingerprint}`;
}

export function prospectiveHistoryKey(officeId: string): string {
  return `${officeId}::${PROSPECTIVE_LOCAL_TOKEN}`;
}

export function isCouncilSelectedExecutive(officeType: string, name: string): boolean {
  if (/mayor|starosta|prim[aá]tor|hejtman|governor/i.test(officeType)) return true;
  if (officeType !== "direct_national_executive" && /^(starosta|prim[aá]tor|hejtman)\b/iu.test(name)) return true;
  return false;
}
