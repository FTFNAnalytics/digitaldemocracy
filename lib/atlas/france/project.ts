import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  AN_ID,
  CALENDAR_RELATIVE,
  CHATAIN_ID,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  EP_ID,
  EXPECTED_COUNTS,
  HOLD_STATUS,
  LINEAGE_ID,
  LYON_METRO_ID,
  MAYOTTE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  NATIONAL_OFFICE_IDS,
  NC_CONGRESS_ID,
  OFFICE_NAMESPACE,
  OMITTED_EVENTS_RELATIVE,
  OMITTED_REPORTING_UNITS_RELATIVE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  PARIS_HISTORICAL_ID,
  PARIS_ID,
  PRESIDENT_ID,
  REGISTER_RELATIVE,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SENATE_ID,
  TIER_PATH,
  TIER_SHA256,
  canonical,
  dateId,
  franceUnresolvedId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type { FranceCalendarRow, FranceInventory, FranceOfficeRow } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type FranceProjection = {
  lineage: SqlRow;
  release: SqlRow;
  publicationRelease: SqlRow;
  retainedInputs: SqlRow[];
  country: SqlRow;
  geographies: SqlRow[];
  offices: SqlRow[];
  tiers: SqlRow[];
  dates: SqlRow[];
  events: SqlRow[];
  proceedings: SqlRow[];
  sources: SqlRow[];
  results: SqlRow[];
  locators: SqlRow[];
  evidence: SqlRow[];
  unresolved: SqlRow[];
  crosswalks: SqlRow[];
  validatedCounts: Record<string, number>;
};

const ALLOWED_TYPES = new Set<string>(ALLOWED_OFFICE_TYPES);
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;
const ISO_YEAR = /^(\d{4})$/;
const PLACE_SEPARATOR = " — ";
const NATIONAL_IDS = new Set<string>(NATIONAL_OFFICE_IDS);
const ALLOWED_SELECTION = new Set(["direct_popular", "direct_via_provincial_ballot", "indirect_electoral_college"]);
const ALLOWED_EXECUTIVE_MODES = new Set([
  "council_selected_mayor",
  "council_selected_president",
  "council_selected_arrondissement_mayor",
  "assembly_selected_or_statutory_executive; no separate popular executive",
  "assembly_selected_executive",
  "council_selected_executive",
]);
const MONTH_DATE_STATUS = "ordinary_renewal_month; Mayotte new institutional election also gated";
const SENATE_DATE = "2026-09-27";
const PRESIDENT_DATE = "2027";
const RENEWAL_MONTH = "2028-03";

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function originFor(relativePath: string, sha256: string, index: number): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: `/${index}`,
  });
}

function sliceHash(inventory: FranceInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function sourceRowLocator(args: { derivedPath: string; derivedPointer?: string | null }): string {
  return canonical({
    derived_json_pointer: args.derivedPointer ?? null,
    derived_path: args.derivedPath,
    source_row: null,
  });
}

function mapTier(schemaTier: string): string {
  if (schemaTier === "municipal" || schemaTier === "regional" || schemaTier === "other" || schemaTier === "national_context") {
    return schemaTier;
  }
  if (schemaTier === "national") return "national_context";
  throw new Error(`Unsupported France classification tier ${JSON.stringify(schemaTier)}`);
}

function expectedSchemaTier(officeType: string): string {
  if (officeType === "municipal_council" || officeType === "arrondissement_or_sector_council") return "municipal";
  if (
    officeType === "departmental_council" ||
    officeType === "metropolitan_council" ||
    officeType === "regional_council" ||
    officeType === "single_territorial_assembly" ||
    officeType === "overseas_territorial_assembly" ||
    officeType === "new_caledonia_congress" ||
    officeType === "provincial_assembly"
  ) {
    return "regional";
  }
  if (
    officeType === "national_lower_house" ||
    officeType === "national_upper_house" ||
    officeType === "president" ||
    officeType === "european_parliament_delegation"
  ) {
    return "national_context";
  }
  throw new Error(`Unsupported France office type ${officeType}`);
}

function expectedDraftTier(officeType: string): string {
  if (officeType === "municipal_council" || officeType === "arrondissement_or_sector_council") return "4";
  if (officeType === "departmental_council" || officeType === "metropolitan_council") return "3";
  if (
    officeType === "regional_council" ||
    officeType === "single_territorial_assembly" ||
    officeType === "overseas_territorial_assembly" ||
    officeType === "new_caledonia_congress" ||
    officeType === "provincial_assembly"
  ) {
    return "2";
  }
  if (
    officeType === "national_lower_house" ||
    officeType === "national_upper_house" ||
    officeType === "president" ||
    officeType === "european_parliament_delegation"
  ) {
    return "1";
  }
  throw new Error(`Unsupported France office type ${officeType}`);
}

function placeName(label: string, officeId: string): string {
  const index = label.lastIndexOf(PLACE_SEPARATOR);
  if (index >= 0) {
    const place = label.slice(index + PLACE_SEPARATOR.length).trim();
    if (!place) throw new Error(`Office ${officeId} label ${label} has an empty place`);
    return place;
  }
  const whole = label.trim();
  if (!whole) throw new Error(`Office ${officeId} has an empty label`);
  return whole;
}

function geographyIdFor(row: FranceOfficeRow): string {
  if (NATIONAL_IDS.has(row.office_id)) return COUNTRY_GEOGRAPHY_ID;
  return row.office_id;
}

function addLocator(locators: SqlRow[], seen: Set<string>, row: SqlRow): void {
  const id = String(row.record_key);
  if (seen.has(id)) throw new Error(`Duplicate record_key ${id}`);
  seen.add(id);
  locators.push(row);
}

function blankLocator(): SqlRow {
  return {
    country_id: null,
    geography_id: null,
    id_namespace: null,
    office_id: null,
    history_key: null,
    proceeding_id: null,
    result_row_id: null,
    party_namespace: null,
    party_mapping_id: null,
    source_namespace: null,
    source_id: null,
    input_path: null,
  };
}

function parseCalendarDate(
  row: FranceCalendarRow,
): { precision: "day" | "month" | "year"; year: number; month: number | null; day: number | null; certainty: "called" | "expected" } | null {
  if (row.date == null) {
    if (row.date_precision != null || row.date_status !== "not_established_in_this_pack" || row.alert_window_class !== "unresolved") {
      throw new Error(`Null calendar date on ${row.office_id} is not the unresolved pack shape`);
    }
    return null;
  }
  if (row.date === RENEWAL_MONTH && row.date_precision === "month") {
    if (row.date_status !== MONTH_DATE_STATUS || row.alert_window_class !== "overlaps_window_end") {
      throw new Error(`Month calendar row ${row.office_id} drifted`);
    }
    return { precision: "month", year: 2028, month: 3, day: null, certainty: "expected" };
  }
  if (row.date === SENATE_DATE && row.date_precision === "day") {
    if (row.office_id !== SENATE_ID || row.date_status !== "official_scheduled_renewal" || row.alert_window_class !== "inside") {
      throw new Error(`Senate calendar day must stay on ${SENATE_ID}`);
    }
    const match = ISO_DAY.exec(row.date);
    if (!match) throw new Error(`Senate date is not an ISO day`);
    return { precision: "day", year: 2026, month: 9, day: 27, certainty: "called" };
  }
  if (row.date === PRESIDENT_DATE && row.date_precision === "year") {
    if (
      row.office_id !== PRESIDENT_ID ||
      row.date_status !== "ordinary_cycle_year; exact polling decree not pinned" ||
      row.alert_window_class !== "inside"
    ) {
      throw new Error(`Presidential calendar year must stay on ${PRESIDENT_ID} and must not become a called poll`);
    }
    if (!ISO_YEAR.test(row.date) || ISO_DAY.test(row.date) || ISO_MONTH.test(row.date)) {
      throw new Error(`Presidential year label drifted`);
    }
    return { precision: "year", year: 2027, month: null, day: null, certainty: "expected" };
  }
  throw new Error(`Refusing unauthored calendar date ${JSON.stringify(row.date)} on ${row.office_id}`);
}

export function projectFrance(inventory: FranceInventory): FranceProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  rejectFixtures(
    inventory.offices.map((row) => row.office_id),
    "office register",
  );
  for (const item of inventory.tracked) {
    if (
      item.input_path === OMITTED_RESULTS_RELATIVE ||
      item.input_path === OMITTED_EVENTS_RELATIVE ||
      item.input_path === OMITTED_REPORTING_UNITS_RELATIVE ||
      item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`)
    ) {
      throw new Error("Omitted France results, events, reporting units, or sources must not be hashed into the release");
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} France offices, found ${inventory.offices.length}`);
  }
  if (inventory.successorCrosswalk.length !== 0) {
    throw new Error("France successor crosswalk must stay empty");
  }
  if (inventory.calendar.length !== EXPECTED_COUNTS.calendar_rows) {
    throw new Error(`calendar length ${inventory.calendar.length} drifted`);
  }
  if (inventory.researchGaps.length !== EXPECTED_COUNTS.research_gaps) {
    throw new Error(`research gap length ${inventory.researchGaps.length} drifted`);
  }
  if (inventory.extractionIssues.length !== EXPECTED_COUNTS.extraction_issues) {
    throw new Error(`extraction issue length ${inventory.extractionIssues.length} drifted`);
  }
  if (inventory.acceptanceExamples.length !== EXPECTED_COUNTS.acceptance_examples) {
    throw new Error(`acceptance example length ${inventory.acceptanceExamples.length} drifted`);
  }
  if (inventory.draftTiers.length !== EXPECTED_COUNTS.draft_tier_rows) {
    throw new Error(`draft tier length ${inventory.draftTiers.length} drifted`);
  }
  if (inventory.fieldMap.length !== EXPECTED_COUNTS.field_map_rows) {
    throw new Error(`field map length ${inventory.fieldMap.length} drifted`);
  }
  if (inventory.historyCoverage.length !== EXPECTED_COUNTS.history_coverage_rows) {
    throw new Error(`history coverage length ${inventory.historyCoverage.length} drifted`);
  }
  if (inventory.officeHistory.length !== EXPECTED_COUNTS.office_history_coverage_rows) {
    throw new Error(`office history coverage length ${inventory.officeHistory.length} drifted`);
  }
  if (inventory.territorialMovements.length !== EXPECTED_COUNTS.territorial_movements) {
    throw new Error(`territorial movement length ${inventory.territorialMovements.length} drifted`);
  }
  if (inventory.territoryExclusions.length !== EXPECTED_COUNTS.territory_exclusions) {
    throw new Error(`territory exclusion length ${inventory.territoryExclusions.length} drifted`);
  }
  if (inventory.discrepancies.length !== EXPECTED_COUNTS.source_arithmetic_discrepancies) {
    throw new Error(`source arithmetic discrepancy length ${inventory.discrepancies.length} drifted`);
  }
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} France classifications`);
  }
  if (inventory.tiers.status !== "approved" || inventory.tiers.production_accepted !== true) {
    throw new Error("France tier file must stay the approved production-accepted bytes");
  }
  if (inventory.countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error("counts.json omitted result total drifted");
  }
  if (inventory.countsFile.events !== EXPECTED_COUNTS.documented_event_rows_omitted) {
    throw new Error("counts.json omitted event total drifted");
  }
  if (
    inventory.countsFile.direct_executive_current !== EXPECTED_COUNTS.direct_executive_offices ||
    inventory.countsFile.current_overseas_offices !== EXPECTED_COUNTS.current_overseas_offices ||
    inventory.countsFile.cog_COM_units !== EXPECTED_COUNTS.cog_com_units ||
    inventory.countsFile.additional_COM_municipalities !== EXPECTED_COUNTS.additional_com_municipalities ||
    inventory.countsFile.appointed_commune_exclusions !== EXPECTED_COUNTS.appointed_commune_exclusions ||
    inventory.countsFile.issues !== EXPECTED_COUNTS.extraction_issues
  ) {
    throw new Error("counts.json accepted footing drifted");
  }
  for (const row of inventory.draftTiers) {
    if (row.status !== "draft" || row.justin_approved !== false) {
      throw new Error(`Draft tier ${row.office_id} must stay draft and justin_approved false`);
    }
  }
  const holdIds = NAMED_HOLDS.map((hold) => hold.token);
  if (JSON.stringify(inventory.researchGaps.map((row) => row.gap_id)) !== JSON.stringify(holdIds)) {
    throw new Error("research-gaps.json does not list G01 through G21 in order");
  }
  for (const row of inventory.researchGaps) {
    if (row.status !== HOLD_STATUS) throw new Error(`Research gap ${row.gap_id} must stay ${HOLD_STATUS}`);
    if (row.justin_approved !== false) throw new Error(`Research gap ${row.gap_id} justin_approved must stay false`);
  }
  const issueKinds = new Map<string, number>();
  for (const row of inventory.extractionIssues) {
    issueKinds.set(row.kind, (issueKinds.get(row.kind) ?? 0) + 1);
  }
  if ((issueKinds.get("unnamed_source_list") ?? 0) !== EXPECTED_COUNTS.unnamed_source_list_issues) {
    throw new Error("Chatain unnamed source list note drifted");
  }
  if ((issueKinds.get("polynesia_aggregate_without_named_lists") ?? 0) !== EXPECTED_COUNTS.polynesia_aggregate_issues) {
    throw new Error("Polynesia metrics-only notes drifted");
  }
  if ((issueKinds.get("documented_unescaped_tab_in_list_label") ?? 0) !== EXPECTED_COUNTS.tab_label_issues) {
    throw new Error("Documented tab-label repairs drifted");
  }
  if ((issueKinds.get("documented_source_header_misalignment") ?? 0) !== EXPECTED_COUNTS.header_misalignment_issues) {
    throw new Error("Documented header misalignment note drifted");
  }
  const coverageEventSum = inventory.historyCoverage.reduce((sum, row) => sum + row.events, 0);
  const officeEventSum = inventory.officeHistory.reduce((sum, row) => sum + row.normalized_event_count, 0);
  if (coverageEventSum !== EXPECTED_COUNTS.documented_normalized_events || officeEventSum !== EXPECTED_COUNTS.documented_normalized_events) {
    throw new Error("History coverage is not a substitute for the omitted event file, and its documented total drifted");
  }
  if (inventory.officeHistory.some((row) => row.history_complete !== false)) {
    throw new Error("Office history_complete must stay false");
  }
  const excludedCodes = new Set(inventory.territoryExclusions.map((row) => row.code));
  if (excludedCodes.size !== EXPECTED_COUNTS.territory_exclusions) {
    throw new Error("Territory exclusion codes drifted");
  }

  const retainedInputs: SqlRow[] = inventory.tracked.map((item) => ({
    lineage_id: L,
    release_id: R,
    input_path: item.input_path,
    input_kind: item.input_kind,
    sha256: item.sha256,
    byte_count: item.byte_count,
    recovery_locator: `sha256:${item.sha256}`,
    payload_json: item.input_path.endsWith(".json") ? item.text : null,
  }));

  const registerHash = sliceHash(inventory, REGISTER_RELATIVE);
  const calendarHash = sliceHash(inventory, CALENDAR_RELATIVE);
  const countsHash = sliceHash(inventory, COUNTS_RELATIVE);
  const countryRec = recordKey("country", [COUNTRY_ID]);

  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: COUNTRY_NAME,
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: RESEARCH_SNAPSHOT_LABEL,
    notes: COUNTRY_NOTES,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
      row: { country_id: COUNTRY_ID, name: COUNTRY_NAME },
      supplemental: {
        research_prefix: RESEARCH_PREFIX,
        open_holds: NAMED_HOLDS.map((hold) => hold.token),
        omitted_results: OMITTED_RESULTS_RELATIVE,
        omitted_events: OMITTED_EVENTS_RELATIVE,
        omitted_reporting_units: OMITTED_REPORTING_UNITS_RELATIVE,
        omitted_sources_dir: OMITTED_SOURCES_DIR,
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        documented_event_rows_omitted: EXPECTED_COUNTS.documented_event_rows_omitted,
        documented_reporting_units_omitted: EXPECTED_COUNTS.documented_reporting_units_omitted,
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
        successor_crosswalk_rows: 0,
        territorial_movements_are_not_successor_edges: EXPECTED_COUNTS.territorial_movements,
      },
    }),
  };

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const officeById = new Map<string, FranceOfficeRow>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let currentDirect = 0;
  let historicalDirect = 0;
  let currentOverseas = 0;
  const typeCounts = new Map<string, number>();
  const draftHistogram = new Map<string, number>();

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted France office type ${row.office_type}`);
    if (row.office_type === "mayor" || /epci/i.test(row.office_type) || /prime_minister/i.test(row.office_type)) {
      throw new Error(`Refusing invented office type ${row.office_type}`);
    }
    if (row.status !== "current" && row.status !== "historical_only") {
      throw new Error(`Office ${row.office_id} status ${row.status} is not current or historical_only`);
    }
    if (!ALLOWED_SELECTION.has(row.selection_mode)) {
      throw new Error(`Office ${row.office_id} selection mode ${row.selection_mode} is not authored`);
    }
    if (row.justin_approved !== false) throw new Error(`Office ${row.office_id} research justin_approved must stay false`);
    if (!row.territory_code) throw new Error(`Office ${row.office_id} is missing territory_code`);
    if (excludedCodes.has(row.territory_code)) {
      throw new Error(`Excluded territory ${row.territory_code} must not become office ${row.office_id}`);
    }
    const executiveMode = row.executive_mode ?? null;
    if (executiveMode != null && !ALLOWED_EXECUTIVE_MODES.has(executiveMode)) {
      throw new Error(`Office ${row.office_id} executive_mode ${executiveMode} is not an authored council-selected mode`);
    }
    if (row.direct_executive !== (row.office_id === PRESIDENT_ID)) {
      throw new Error(`Office ${row.office_id} direct_executive flag does not match the single presidential executive`);
    }
    if (row.office_id === SENATE_ID && row.selection_mode !== "indirect_electoral_college") {
      throw new Error("Sénat must stay an indirect electoral-college body");
    }
    if (row.office_id === NC_CONGRESS_ID && row.selection_mode !== "direct_via_provincial_ballot") {
      throw new Error("New Caledonia congress must stay direct via the provincial ballot");
    }
    if (row.office_id !== SENATE_ID && row.office_id !== NC_CONGRESS_ID && row.selection_mode !== "direct_popular") {
      throw new Error(`Office ${row.office_id} selection mode drifted from direct_popular`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.review_status !== "needs_review") {
      throw new Error(`Office ${row.office_id} classification must stay needs_review`);
    }
    if (classification.human_review_required !== true || classification.tier_uncertain !== false) {
      throw new Error(`Office ${row.office_id} classification review flags drifted`);
    }
    if (classification.schema_v1_tier !== expectedSchemaTier(row.office_type)) {
      throw new Error(`Office ${row.office_id} schema tier ${classification.schema_v1_tier} does not match ${row.office_type}`);
    }
    if (classification.draft_tier !== expectedDraftTier(row.office_type) || inventory.draftTiers[i]?.tier !== classification.draft_tier) {
      throw new Error(`Office ${row.office_id} draft tier drifted`);
    }
    if (row.office_id === EP_ID && (classification.tier !== "national" || classification.schema_v1_tier !== "national_context")) {
      throw new Error("FR-EP must stay draft tier 1 national_context and must not move to other");
    }
    if (inventory.tiers.classifications[i]?.office_id !== row.office_id) {
      throw new Error(`Classification order drifted at ${row.office_id}`);
    }
    if (inventory.draftTiers[i]?.office_id !== row.office_id) {
      throw new Error(`Draft tier order drifted at ${row.office_id}`);
    }
    if (NATIONAL_IDS.has(row.office_id) && row.territory_code !== COUNTRY_GEOGRAPHY_ID) {
      throw new Error(`${row.office_id} must stay on the France territory code`);
    }
    if (!NATIONAL_IDS.has(row.office_id) && row.territory_code === COUNTRY_GEOGRAPHY_ID) {
      throw new Error(`Office ${row.office_id} must not borrow the country territory code`);
    }
    if (row.status === "historical_only") {
      historicalOffices += 1;
      if (row.direct_executive) historicalDirect += 1;
    } else {
      currentOffices += 1;
      if (row.direct_executive) currentDirect += 1;
      if (row.overseas === true) currentOverseas += 1;
    }
    const bucket = `${row.status}|${row.office_type}`;
    typeCounts.set(bucket, (typeCounts.get(bucket) ?? 0) + 1);
    draftHistogram.set(classification.draft_tier, (draftHistogram.get(classification.draft_tier) ?? 0) + 1);
    officeById.set(row.office_id, row);
  }
  if (officeById.size !== classById.size) throw new Error("France classifications do not match the register");

  const seatPins: Record<string, number> = {
    [AN_ID]: 577,
    [SENATE_ID]: 348,
    [PRESIDENT_ID]: 1,
    [EP_ID]: 81,
    [NC_CONGRESS_ID]: 54,
    "FR-NC-SUD": 40,
    "FR-NC-NORD": 22,
    "FR-NC-ILES": 14,
    "FR-OM-987": 57,
    "FR-OM-986": 20,
    "FR-OM-975": 19,
    "FR-OM-977": 19,
    "FR-OM-978": 23,
  };
  for (const [officeId, seats] of Object.entries(seatPins)) {
    const row = officeById.get(officeId);
    if (!row || row.seats !== seats || row.status !== "current") {
      throw new Error(`${officeId} seat count must stay ${seats}`);
    }
  }
  const mayotte = officeById.get(MAYOTTE_ID);
  if (!mayotte || mayotte.office_type !== "departmental_council" || mayotte.status !== "current" || mayotte.territory_code !== "976R") {
    throw new Error("Mayotte must stay the single transitional departmental council FR-CT-976R");
  }
  if ([...officeById.values()].filter((row) => row.territory_code === "976R").length !== 1) {
    throw new Error("Refusing a second Mayotte assembly");
  }
  const lyon = officeById.get(LYON_METRO_ID);
  if (!lyon || lyon.office_type !== "metropolitan_council" || lyon.status !== "current") {
    throw new Error("Métropole de Lyon must stay the included metropolitan council");
  }
  const paris = officeById.get(PARIS_ID);
  const parisHistorical = officeById.get(PARIS_HISTORICAL_ID);
  if (!paris || paris.status !== "current" || paris.office_type !== "municipal_council" || paris.territory_code !== "75056") {
    throw new Error("Paris must stay one current municipal council");
  }
  if (!parisHistorical || parisHistorical.status !== "historical_only" || parisHistorical.territory_code !== "75056") {
    throw new Error("Historical Paris must stay a separate office");
  }
  const chatain = officeById.get(CHATAIN_ID);
  if (!chatain || chatain.status !== "current" || chatain.territory_code !== "86063" || chatain.office_type !== "municipal_council") {
    throw new Error("Chatain must stay the current municipal council with an empty list label");
  }

  const geographies: SqlRow[] = [];
  const geoIds = new Set<string>();
  const pushGeo = (row: SqlRow) => {
    const id = String(row.geography_id);
    if (geoIds.has(id)) throw new Error(`Duplicate geography ${id}`);
    if (row.effective_from_label != null || row.effective_to_label != null) {
      throw new Error(`Geography ${id} must not gain an effective date or successor interval`);
    }
    geoIds.add(id);
    geographies.push(row);
  };
  pushGeo({
    country_id: COUNTRY_ID,
    geography_id: COUNTRY_GEOGRAPHY_ID,
    name: COUNTRY_NAME,
    parent_geography_id: null,
    effective_from_label: null,
    effective_to_label: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: "/country_id" }),
      row: { geography_id: COUNTRY_GEOGRAPHY_ID, name: COUNTRY_NAME, role: "country" },
    }),
  });

  for (let index = 0; index < inventory.offices.length; index++) {
    const row = inventory.offices[index]!;
    if (NATIONAL_IDS.has(row.office_id)) continue;
    const geographyId = geographyIdFor(row);
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: placeName(row.label, row.office_id),
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(REGISTER_RELATIVE, registerHash, index),
        row: {
          geography_id: geographyId,
          place: placeName(row.label, row.office_id),
          office_id: row.office_id,
          territory_code: row.territory_code,
          successor_edge: null,
        },
      }),
    });
  }
  if (geographyIdFor(paris) === geographyIdFor(parisHistorical)) {
    throw new Error("Refusing to join current and historical Paris into one successor geography");
  }

  const calendarByOffice = new Map<string, FranceCalendarRow>();
  for (const row of inventory.calendar) {
    if (calendarByOffice.has(row.office_id)) throw new Error(`Duplicate calendar row ${row.office_id}`);
    if (row.alert_created !== false) throw new Error(`Calendar alert on ${row.office_id} must stay uncreated`);
    calendarByOffice.set(row.office_id, row);
  }
  const currentIds = new Set(inventory.offices.filter((row) => row.status === "current").map((row) => row.office_id));
  if (calendarByOffice.size !== currentIds.size) throw new Error("Calendar office set drifted");
  for (const id of calendarByOffice.keys()) {
    if (!currentIds.has(id)) throw new Error(`Calendar names a non-current office ${id}`);
  }

  const dates: SqlRow[] = [];
  const nextDateByOffice = new Map<string, { dateId: string; resolution: "resolved" }>();
  let nullDates = 0;
  let monthDates = 0;
  let yearDates = 0;
  let calledDays = 0;
  for (const [officeId, row] of calendarByOffice) {
    const parsed = parseCalendarDate(row);
    if (!parsed) {
      nullDates += 1;
      continue;
    }
    if (parsed.precision === "month") monthDates += 1;
    if (parsed.precision === "year") yearDates += 1;
    if (parsed.precision === "day") calledDays += 1;
    const dateIdValue = dateId("calendar", officeId, "next");
    dates.push({
      date_id: dateIdValue,
      label: row.date,
      precision: parsed.precision,
      certainty: parsed.certainty,
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: CALENDAR_RELATIVE,
          sha256: calendarHash,
          json_pointer: `/${officeId}`,
        }),
        row: { date: row.date, date_precision: row.date_precision, date_status: row.date_status, alert_created: false },
      }),
    });
    nextDateByOffice.set(officeId, { dateId: dateIdValue, resolution: "resolved" });
  }
  if (monthDates !== 0) {
    const monthOffices = [...calendarByOffice.values()].filter((row) => row.date === RENEWAL_MONTH);
    const monthTypes = new Map<string, number>();
    for (const row of monthOffices) {
      const office = officeById.get(row.office_id);
      if (!office) throw new Error(`Month calendar office ${row.office_id} is missing`);
      monthTypes.set(office.office_type, (monthTypes.get(office.office_type) ?? 0) + 1);
    }
    if (
      monthTypes.get("departmental_council") !== 95 ||
      monthTypes.get("regional_council") !== 14 ||
      monthTypes.get("single_territorial_assembly") !== 3 ||
      monthTypes.size !== 3
    ) {
      throw new Error("2028-03 calendar month must stay on the 95+14+3 regional bodies");
    }
  }

  const offices: SqlRow[] = inventory.offices.map((row, index) => {
    const next = nextDateByOffice.get(row.office_id);
    return {
      id_namespace: N,
      office_id: row.office_id,
      country_id: COUNTRY_ID,
      geography_id: geographyIdFor(row),
      name: row.label,
      office_type: row.office_type,
      office_status: row.status === "historical_only" ? "historical" : "current",
      record_state: "active",
      state_note: null,
      registry_qualified: 1,
      next_date_id: next?.dateId ?? null,
      next_date_resolution: next ? "resolved" : "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(REGISTER_RELATIVE, registerHash, index), row }),
    };
  });

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (row.review_status !== "needs_review") {
      throw new Error(`Refusing to rewrite ${row.office_id} review_status ${row.review_status}`);
    }
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapTier(row.schema_v1_tier),
      review_status: "needs_review",
      rationale: row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: TIER_SHA256,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/classifications/${index}` }),
        row,
      }),
    };
  });

  const locators: SqlRow[] = [];
  const locatorSeen = new Set<string>();
  addLocator(locators, locatorSeen, {
    record_key: countryRec,
    entity_kind: "country",
    ...blankLocator(),
    country_id: COUNTRY_ID,
    lineage_id: L,
    release_id: R,
    source_row_locator: sourceRowLocator({ derivedPath: TIER_PATH, derivedPointer: "/country_id" }),
  });
  for (const geo of geographies) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("geography", [COUNTRY_ID, geo.geography_id]),
      entity_kind: "geography",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      geography_id: geo.geography_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE }),
    });
  }
  for (const [index, row] of inventory.offices.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("office", [N, row.office_id]),
      entity_kind: "office",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: REGISTER_RELATIVE, derivedPointer: `/${index}` }),
    });
  }
  for (const item of inventory.tracked) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("input", [L, R, item.input_path]),
      entity_kind: "input",
      ...blankLocator(),
      input_path: item.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: item.input_path }),
    });
  }

  const unresolved: SqlRow[] = NAMED_HOLDS.map((hold, index) => {
    const occurrence = { input_path: TIER_PATH, json_pointer: `/justin_approval/holds_open/${index}`, id: hold.token };
    return {
      unresolved_id: franceUnresolvedId(countryRec, occurrence, hold.token),
      record_key: countryRec,
      original_token: hold.token,
      source_locator: canonical(occurrence),
      reason: hold.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({ input_path: TIER_PATH, sha256: TIER_SHA256, json_pointer: `/justin_approval/holds_open/${index}` }),
        row: { token: hold.token, status: hold.status },
      }),
    };
  });

  const tierCounts = {
    municipal: tiers.filter((row) => row.tier === "municipal").length,
    regional: tiers.filter((row) => row.tier === "regional").length,
    national: tiers.filter((row) => row.tier === "national_context").length,
    other: tiers.filter((row) => row.tier === "other").length,
  };
  const countType = (status: string, officeType: string) => typeCounts.get(`${status}|${officeType}`) ?? 0;

  const validatedCounts: Record<string, number> = {
    current_offices: currentOffices,
    historical_offices: historicalOffices,
    offices: offices.length,
    geographies: geographies.length,
    selected_histories: 0,
    prospective_events: 0,
    total_events: 0,
    proceedings: 0,
    result_rows: 0,
    documented_result_rows_omitted: inventory.countsFile.results,
    documented_event_rows_omitted: inventory.countsFile.events,
    documented_reporting_units_omitted: inventory.countsFile.reporting_units,
    documented_list_ballot_rows_omitted: inventory.countsFile.result_kinds.list_ballot,
    documented_candidate_mark_multi_vote_rows_omitted: inventory.countsFile.result_kinds.candidate_mark_multi_vote,
    documented_candidate_or_list_vote_regime_unresolved_rows_omitted:
      inventory.countsFile.result_kinds.candidate_or_list_vote_regime_unresolved,
    documented_candidate_vote_rows_omitted: inventory.countsFile.result_kinds.candidate_vote,
    documented_binomial_ballot_rows_omitted: inventory.countsFile.result_kinds.binomial_ballot,
    documented_electoral_college_candidate_mark_rows_omitted: inventory.countsFile.result_kinds.electoral_college_candidate_mark,
    documented_electoral_college_list_ballot_rows_omitted: inventory.countsFile.result_kinds.electoral_college_list_ballot,
    documented_party_share_and_seats_rows_omitted: inventory.countsFile.result_kinds.party_share_and_seats,
    documented_returned_representative_rows_omitted: inventory.countsFile.result_kinds.returned_representative,
    municipal_offices: tierCounts.municipal,
    regional_offices: tierCounts.regional,
    national_offices: tierCounts.national,
    other_offices: tierCounts.other,
    approved_classifications: 0,
    needs_review_classifications: tiers.length,
    sources: 0,
    unresolved_evidence: unresolved.length,
    named_holds: NAMED_HOLDS.length,
    resolved_exclusions: 0,
    party_mappings: 0,
    identity_crosswalks: 0,
    explicit_predecessor_edges: 0,
    guessed_merger_edges: 0,
    retained_inputs: retainedInputs.length,
    research_dates: dates.length,
    direct_executive_offices: currentDirect,
    historical_direct_executives: historicalDirect,
    current_municipal_councils: countType("current", "municipal_council"),
    historical_municipal_councils: countType("historical_only", "municipal_council"),
    current_departmental_councils: countType("current", "departmental_council"),
    current_regional_councils: countType("current", "regional_council"),
    historical_regional_councils: countType("historical_only", "regional_council"),
    current_single_territorial_assemblies: countType("current", "single_territorial_assembly"),
    historical_single_territorial_assemblies: countType("historical_only", "single_territorial_assembly"),
    current_metropolitan_councils: countType("current", "metropolitan_council"),
    current_sector_councils: countType("current", "arrondissement_or_sector_council"),
    current_overseas_assemblies: countType("current", "overseas_territorial_assembly"),
    current_nc_congress: countType("current", "new_caledonia_congress"),
    current_provincial_assemblies: countType("current", "provincial_assembly"),
    current_overseas_offices: currentOverseas,
    draft_tier_1: draftHistogram.get("1") ?? 0,
    draft_tier_2: draftHistogram.get("2") ?? 0,
    draft_tier_3: draftHistogram.get("3") ?? 0,
    draft_tier_4: draftHistogram.get("4") ?? 0,
    cog_com_units: inventory.countsFile.cog_COM_units,
    additional_com_municipalities: inventory.countsFile.additional_COM_municipalities,
    appointed_commune_exclusions: inventory.countsFile.appointed_commune_exclusions,
    source_inventory_rows: inventory.sourceInventory.length,
    distinct_source_files_documented: EXPECTED_COUNTS.distinct_source_files_documented,
    calendar_rows: inventory.calendar.length,
    calendar_null_dates: nullDates,
    calendar_month_dates: monthDates,
    calendar_year_dates: yearDates,
    calendar_called_days: calledDays,
    calendar_alerts_created: inventory.calendar.filter((row) => row.alert_created).length,
    extraction_issues: inventory.extractionIssues.length,
    polynesia_aggregate_issues: issueKinds.get("polynesia_aggregate_without_named_lists") ?? 0,
    unnamed_source_list_issues: issueKinds.get("unnamed_source_list") ?? 0,
    tab_label_issues: issueKinds.get("documented_unescaped_tab_in_list_label") ?? 0,
    header_misalignment_issues: issueKinds.get("documented_source_header_misalignment") ?? 0,
    successor_crosswalk_rows: inventory.successorCrosswalk.length,
    field_map_rows: inventory.fieldMap.length,
    research_gaps: inventory.researchGaps.length,
    territory_exclusions: inventory.territoryExclusions.length,
    territorial_movements: inventory.territorialMovements.length,
    history_coverage_rows: inventory.historyCoverage.length,
    office_history_coverage_rows: inventory.officeHistory.length,
    documented_normalized_events: officeEventSum,
    acceptance_examples: inventory.acceptanceExamples.length,
    draft_tier_rows: inventory.draftTiers.length,
    source_arithmetic_discrepancies: inventory.discrepancies.length,
    offices_with_events: 0,
    offices_without_events: offices.length,
    year_only_dates: yearDates,
    month_dates: monthDates,
    day_dates: calledDays,
    evidence_links: 0,
    mayors: countType("current", "mayor") + countType("historical_only", "mayor"),
    epci_offices: 0,
    popular_mayor_contests: 0,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`France ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (validatedCounts.result_rows !== 0) throw new Error("France slim import must publish 0 result rows");
  if (validatedCounts.total_events !== 0) throw new Error("France slim import must publish 0 event rows");
  if (validatedCounts.documented_result_rows_omitted === validatedCounts.territorial_movements) {
    throw new Error("Refusing to treat territorial movements as the omitted result total");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "France Prompt AR register. Justin accepted 35,112 current and 2,738 historical offices with G01 through G21 left open. 0 published events and 0 published result rows. Omitted events.jsonl, results.jsonl, and reporting-units.jsonl are not invented. The successor crosswalk stays empty.",
  };
  const release = {
    lineage_id: L,
    release_id: R,
    fingerprint_sha256: inventory.fingerprint,
    hash_inputs_json: inventory.hashInputsJson,
    adapter_version: ADAPTER_VERSION,
    method_version: METHOD_VERSION,
    schema_version: SCHEMA_VERSION,
    research_snapshot_label: RESEARCH_SNAPSHOT_LABEL,
    upstream_release_id: null,
    validated_counts_json: canonical(validatedCounts),
    research_coverage_complete: 0,
    raw_json: rawEnvelope({
      origin: locator({ input_path: COUNTS_RELATIVE, sha256: countsHash }),
      row: {
        fingerprint: inventory.fingerprint,
        release_id: R,
        coverage_complete: false,
        tier_status: "approved",
        production_accepted: true,
        holds_open: NAMED_HOLDS.map((hold) => hold.token),
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        documented_event_rows_omitted: EXPECTED_COUNTS.documented_event_rows_omitted,
        published_result_rows: 0,
        published_events: 0,
        calendar_not_prospective: CALENDAR_RELATIVE,
      },
    }),
  };

  return {
    lineage,
    release,
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    country,
    geographies,
    offices,
    tiers,
    dates,
    events: [],
    proceedings: [],
    sources: [],
    results: [],
    locators,
    evidence: [],
    unresolved,
    crosswalks: [],
    validatedCounts,
  };
}
