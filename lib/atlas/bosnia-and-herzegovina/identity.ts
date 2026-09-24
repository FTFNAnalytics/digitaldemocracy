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
  cellYear,
  dateId,
  evidenceId,
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

export const LINEAGE_ID = "country-package-bosnia-and-herzegovina";
export const SOURCE_NAMESPACE = "country-package-bosnia-and-herzegovina";
export const COUNTRY_ID = "bosnia-and-herzegovina";
export const COUNTRY_CODE = "BA";
export const ADAPTER_VERSION = "atlas-bosnia-and-herzegovina-field-map/1";
export const METHOD_VERSION = "atlas-preserve-evidence/1";
export { SCHEMA_VERSION, CANONICALIZATION, HASH_ALGORITHM };
export const TIER_PATH = "schemas/atlas/tiers/bosnia-and-herzegovina.json";
export const APPROVED_TIER_PATH = "docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json";
export const PACKAGE_PREFIX = "data/countries/bosnia-and-herzegovina";
export const UNPACKED_PREFIX = "data/countries/bosnia-and-herzegovina/unpacked";
export const REGISTER_RELATIVE =
  "data/countries/bosnia-and-herzegovina/unpacked/tables/master/office-register.json";
export const REGISTER_SHA256 = "504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4";
export const TIER_SHA256 = "96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9";
export const APPROVED_TIER_SHA256 = "2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501";
export const DRAFT_TIER_SHA256 = "3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1";
export const REGIONAL_CALENDAR_LABEL =
  "13 regional offices (10 cantonal assemblies + Federation House of Representatives + RS National Assembly + RS President). Research holds remain open: RS presidential replacement/repeat, governing coalitions, and 2026-10-04 calendar certainty. No Brčko or municipal offices are supplied.";
export const CANDIDATE_FINGERPRINT = "529a7a2e0fc7d77df4acc0b70fc1409d318257167f4501fb2280ac0bae24b5d2";
export const CANDIDATE_RELEASE_ID =
  "country-package-bosnia-and-herzegovina--sha256-529a7a2e0fc7d77df4acc0b70fc1409d318257167f4501fb2280ac0bae24b5d2";
export const DRAFT_FINGERPRINT = "a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b";
export const DRAFT_RELEASE_ID =
  "country-package-bosnia-and-herzegovina--sha256-a51de5f8c31439521fb50220dabe3ea6c742095983ced8892a932235752dc99b";
export const METHOD_V2_FINGERPRINT = "568c9e8a3778a5306e6fd6ac92696bd6d5d3094523d9efa15487031b20d30351";
export const DRAFT_METHOD_V2_FINGERPRINT = "57371f03f479f2830285d41557afb7a103155541ef86d1924838be65c9b4eeb2";
export const CEC_HOMEPAGE_URL = "https://www.izbori.ba/";
export const SCREENING_URL = "https://en.wikipedia.org/wiki/List_of_elections_in_2027";
export const CEC_HOMEPAGE_SOURCE_ID = "bosnia-and-herzegovina--url-5cc60e1095b91895a8fff765";
export const SCREENING_SOURCE_ID = "bosnia-and-herzegovina--url-cf2bb89cf27bd488108c1dea";
export const GORAZDE_2022_SOURCE_ID = "bosnia-and-herzegovina--S7dc4e82fd3";
export const GORAZDE_2022_URL_ALIAS = "bosnia-and-herzegovina--url-788d32fd8299a35538073420";
export const GORAZDE_2022_EVENT_ID = "event-14c7b27732da1f7ba5ce6b91";
export const GORAZDE_NEXT_EVENT_ID = "next-832e95dbde07b6149bf81b22";
export const RS_PRESIDENT_2022_EVENT_ID = "event-b8860fec4f88ded2c130151e";
export const CAL_EXPECTED_STATUS = "Scheduled cycle / expected; details vary";
export const NEXT_POLLING_DATE = "2026-10-04";
export const FORBIDDEN_BRCKO_TOKENS = ["BA-BRC", "BA-BRCKO", "BA-BRČKO", "BRCKO", "BRČKO"] as const;

export const REQUIRED_OFFICE_IDS = [
  "BA-201",
  "BA-202",
  "BA-203",
  "BA-204",
  "BA-205",
  "BA-206",
  "BA-207",
  "BA-208",
  "BA-209",
  "BA-210",
  "BA-F",
  "BA-R",
  "BA-G",
] as const;

export const ENTITY_OFFICE_IDS = ["BA-F", "BA-R", "BA-G"] as const;
export const CANTONAL_OFFICE_IDS = [
  "BA-201",
  "BA-202",
  "BA-203",
  "BA-204",
  "BA-205",
  "BA-206",
  "BA-207",
  "BA-208",
  "BA-209",
  "BA-210",
] as const;

export const EXPECTED_COUNTS = {
  current_offices: 13,
  historical_offices: 0,
  geographies: 13,
  entity_offices: 3,
  cantonal_assembly_offices: 10,
  selected_histories: 39,
  prospective_events: 13,
  total_events: 52,
  research_dates: 52,
  historical_dates_year: 39,
  prospective_dates_day_expected: 13,
  result_rows: 749,
  recorded_votes: 749,
  recorded_shares: 749,
  recorded_seats: 293,
  zero_seats: 369,
  unknown_seats: 87,
  source_catalogue_rows: 28,
  inline_only_sources: 2,
  sources: 30,
  office_briefings_retained: 13,
  country_briefings_retained: 1,
  municipal_offices: 0,
  regional_offices: 13,
  approved_classifications: 10,
  needs_review_classifications: 3,
  poll_records_supplied: 0,
  control_observations_supplied: 0,
  proceedings: 0,
  party_mappings: 0,
  outer_package_files: 7,
  payload_member_files: 27,
  retained_inputs: 35,
} as const;

export const EXPECTED_OFFICES: Record<
  string,
  { geographyId: string; jurisdiction: string; officeType: string }
> = {
  "BA-205": {
    geographyId: "geo-6e53e543ce8632cc16493b67",
    jurisdiction: "Bosnian-Podrinje Goražde",
    officeType: "Cantonal assembly",
  },
  "BA-210": {
    geographyId: "geo-fe9010d6995204858c1a5181",
    jurisdiction: "Canton 10",
    officeType: "Cantonal assembly",
  },
  "BA-206": {
    geographyId: "geo-dcb38acd32599dd677d1e39a",
    jurisdiction: "Central Bosnia",
    officeType: "Cantonal assembly",
  },
  "BA-F": {
    geographyId: "geo-b429969299189787eef7f326",
    jurisdiction: "Federation of Bosnia and Herzegovina",
    officeType: "House of Representatives",
  },
  "BA-207": {
    geographyId: "geo-40300bdf9121acd45493928f",
    jurisdiction: "Herzegovina-Neretva",
    officeType: "Cantonal assembly",
  },
  "BA-202": {
    geographyId: "geo-e5ca5f78b0eafbba57edaec5",
    jurisdiction: "Posavina",
    officeType: "Cantonal assembly",
  },
  "BA-R": {
    geographyId: "geo-4a8173515c1229a41834fd01",
    jurisdiction: "Republika Srpska",
    officeType: "National Assembly",
  },
  "BA-G": {
    geographyId: "geo-8c7f8505280a44a31501a4e5",
    jurisdiction: "Republika Srpska",
    officeType: "President",
  },
  "BA-209": {
    geographyId: "geo-bc0d8b40f774461904278835",
    jurisdiction: "Sarajevo",
    officeType: "Cantonal assembly",
  },
  "BA-203": {
    geographyId: "geo-ac30661f161d1a04179c396b",
    jurisdiction: "Tuzla",
    officeType: "Cantonal assembly",
  },
  "BA-201": {
    geographyId: "geo-d8a67a75d63bd46f70e1b6e3",
    jurisdiction: "Una-Sana",
    officeType: "Cantonal assembly",
  },
  "BA-208": {
    geographyId: "geo-99322b5bd3091dfd6be4c71a",
    jurisdiction: "West Herzegovina",
    officeType: "Cantonal assembly",
  },
  "BA-204": {
    geographyId: "geo-f2c0f82ea0e0b0738b91975c",
    jurisdiction: "Zenica-Doboj",
    officeType: "Cantonal assembly",
  },
};

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

export function eventIdFor(hk: string): string {
  return key("event", [COUNTRY_ID, hk]);
}

export function nextEventIdFor(officeId: string): string {
  return key("next", officeId);
}

export function geographyIdFor(jurisdiction: string, office: string): string {
  return key("geo", [COUNTRY_ID, jurisdiction, office]);
}

export function catalogueSourceId(sourceId: string): string {
  return `${COUNTRY_ID}--${sourceId}`;
}

export function urlSourceId(url: string): string {
  return `${COUNTRY_ID}--${key("url", url)}`;
}

export function unpackedPath(archiveEntry: string): string {
  return `${UNPACKED_PREFIX}/${archiveEntry}`;
}

export function looksLikeBrcko(value: string): boolean {
  const upper = value.toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return upper.includes("BRCKO") || FORBIDDEN_BRCKO_TOKENS.some((token) => upper === token || upper.includes(token));
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
