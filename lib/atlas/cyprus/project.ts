import {
  ADAPTER_VERSION,
  ALLOWED_OFFICE_TYPES,
  CALENDAR_RELATIVE,
  COUNTRY_CODE,
  COUNTRY_GEOGRAPHY_ID,
  COUNTRY_ID,
  COUNTRY_NAME,
  COUNTRY_NOTES,
  COUNTS_RELATIVE,
  EP_ID,
  EVENTS_RELATIVE,
  EXPECTED_COUNTS,
  HOUSE_ID,
  LINEAGE_ID,
  METHOD_VERSION,
  NAMED_HOLDS,
  OFFICE_NAMESPACE,
  OMITTED_RESULTS_RELATIVE,
  OMITTED_SOURCES_DIR,
  REGISTER_RELATIVE,
  REL_ARM_ID,
  REL_LAT_ID,
  REL_MAR_ID,
  RESEARCH_PREFIX,
  RESEARCH_SNAPSHOT_LABEL,
  SCHEMA_VERSION,
  SPILIA_ANTONIOS_COUNCIL_ID,
  SPILIA_ANTONIOS_GEOGRAPHY_ID,
  SPILIA_KOURDALI_COUNCIL_ID,
  SPILIA_KOURDALI_GEOGRAPHY_ID,
  TIER_PATH,
  TIER_SHA256,
  UNPAIRED_HISTORICAL_PLACES,
  canonical,
  cyprusUnresolvedId,
  dateId,
  isFixtureId,
  locator,
  rawEnvelope,
  recordKey,
  type Locator,
} from "./identity";
import type { CyprusEventRow, CyprusInventory, CyprusOfficeRow } from "./inventory";

export type SqlRow = Record<string, unknown>;

export type CyprusProjection = {
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
const ISO_YEAR = /^(\d{4})$/;
const ROLE_SUFFIXES = [
  " District Local Government Organisation president",
  " religious-group representative in the House",
  " historical council",
  " historical mayor",
  " historical leader",
  " municipal council",
  " community council",
  " community leader",
  " deputy mayor",
  " mayor",
] as const;
const DIRECT_EXECUTIVE_TYPES = new Set([
  "mayor",
  "deputy_mayor",
  "community_leader",
  "district_organisation_president",
  "president",
]);
const PROSPECTIVE_CALENDAR_YEARS = new Set(["2028", "2029", "2031"]);

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value)) throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
  }
}

function parseLabel(
  label: string,
  precision: string,
  where: string,
): { precision: "day" | "year"; year: number; month: number | null; day: number | null } {
  if (precision === "day") {
    const match = ISO_DAY.exec(label.trim());
    if (!match) throw new Error(`Cyprus day label is not ISO at ${where}: ${JSON.stringify(label)}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (utc.getUTCFullYear() !== year || utc.getUTCMonth() + 1 !== month || utc.getUTCDate() !== day) {
      throw new Error(`Invalid Gregorian date ${label} at ${where}`);
    }
    return { precision: "day", year, month, day };
  }
  if (precision === "year") {
    const match = ISO_YEAR.exec(label.trim());
    if (!match) throw new Error(`Cyprus year label is not a year at ${where}: ${JSON.stringify(label)}`);
    if (ISO_DAY.test(label)) throw new Error(`Refusing to keep a filled day on year-only event ${where}`);
    return { precision: "year", year: Number(match[1]), month: null, day: null };
  }
  throw new Error(`Unsupported Cyprus date precision ${precision} at ${where}`);
}

function originFor(relativePath: string, sha256: string, index: number): Locator {
  return locator({
    input_path: relativePath,
    sha256,
    json_pointer: `/${index}`,
  });
}

function sliceHash(inventory: CyprusInventory, relativePath: string): string {
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

function mapTier(tier: string): string {
  if (tier === "municipal" || tier === "regional" || tier === "other") return tier;
  if (tier === "national") return "national_context";
  throw new Error(`Unsupported Cyprus classification tier ${JSON.stringify(tier)}`);
}

function expectedTier(officeType: string): string {
  if (
    officeType === "municipal_council" ||
    officeType === "mayor" ||
    officeType === "deputy_mayor" ||
    officeType === "community_council" ||
    officeType === "community_leader"
  ) {
    return "municipal";
  }
  if (officeType === "district_organisation_president") return "regional";
  if (
    officeType === "national_parliament" ||
    officeType === "president" ||
    officeType === "religious_group_representative"
  ) {
    return "national";
  }
  if (officeType === "european_parliament_delegation") return "other";
  throw new Error(`Unsupported Cyprus office type ${officeType}`);
}

function placeName(name: string, officeId: string): string {
  for (const suffix of ROLE_SUFFIXES) {
    if (name.endsWith(suffix)) {
      const place = name.slice(0, -suffix.length).trim();
      if (!place) throw new Error(`Office ${officeId} name ${name} has no place`);
      return place;
    }
  }
  throw new Error(`Office ${officeId} name ${JSON.stringify(name)} has no known role suffix`);
}

function eventKind(eventType: string): "ordinary" {
  if (eventType === "election" || eventType === "uncontested_return" || eventType === "election_return") return "ordinary";
  throw new Error(`Unsupported Cyprus event_type ${eventType}`);
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

export function projectCyprus(inventory: CyprusInventory): CyprusProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  rejectFixtures(
    inventory.offices.map((row) => row.office_id),
    "office register",
  );
  rejectFixtures(
    inventory.events.map((row) => row.event_id),
    "events",
  );
  for (const item of inventory.tracked) {
    if (item.input_path === OMITTED_RESULTS_RELATIVE || item.input_path.startsWith(`${OMITTED_SOURCES_DIR}/`)) {
      throw new Error("Omitted Cyprus results or sources must not be hashed into the release");
    }
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
  }
  if (inventory.offices.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Cyprus offices, found ${inventory.offices.length}`);
  }
  if (inventory.events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.total_events} Cyprus events, found ${inventory.events.length}`);
  }
  if (inventory.successorCrosswalk.length !== 0) {
    throw new Error("Cyprus successor crosswalk must stay empty");
  }
  if (inventory.reportingUnits.length !== EXPECTED_COUNTS.reporting_units) {
    throw new Error(`reporting unit length ${inventory.reportingUnits.length} drifted`);
  }
  if (inventory.reconciliation.length !== EXPECTED_COUNTS.reconciliation_rows) {
    throw new Error(`reconciliation length ${inventory.reconciliation.length} drifted`);
  }
  if (inventory.communities.length !== EXPECTED_COUNTS.named_communities) {
    throw new Error(`communities length ${inventory.communities.length} drifted`);
  }
  if (inventory.municipalities.length !== EXPECTED_COUNTS.municipalities) {
    throw new Error(`municipalities length ${inventory.municipalities.length} drifted`);
  }
  if (inventory.municipalQuarters.length !== EXPECTED_COUNTS.municipal_quarters) {
    throw new Error(`municipal quarters length ${inventory.municipalQuarters.length} drifted`);
  }
  if (inventory.calendar.length !== EXPECTED_COUNTS.calendar_rows) {
    throw new Error(`calendar length ${inventory.calendar.length} drifted`);
  }
  if (inventory.coverage.length !== EXPECTED_COUNTS.current_office_coverage_rows) {
    throw new Error(`current office coverage length ${inventory.coverage.length} drifted`);
  }
  if (inventory.territorialGates.length !== EXPECTED_COUNTS.territorial_gates) {
    throw new Error(`territorial gate length ${inventory.territorialGates.length} drifted`);
  }
  if (inventory.researchGaps.length !== EXPECTED_COUNTS.research_gaps) {
    throw new Error(`research gap length ${inventory.researchGaps.length} drifted`);
  }
  if (inventory.extractionIssues.length !== EXPECTED_COUNTS.extraction_issues) {
    throw new Error(`extraction issue length ${inventory.extractionIssues.length} drifted`);
  }
  if (inventory.excludedObservations.length !== EXPECTED_COUNTS.excluded_source_observations) {
    throw new Error(`excluded observation length ${inventory.excludedObservations.length} drifted`);
  }
  if (inventory.identityAliases.length !== EXPECTED_COUNTS.identity_aliases) {
    throw new Error(`identity alias length ${inventory.identityAliases.length} drifted`);
  }
  if (inventory.quarterAliases.length !== EXPECTED_COUNTS.quarter_name_aliases) {
    throw new Error(`quarter alias length ${inventory.quarterAliases.length} drifted`);
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
  if (inventory.tiers.classifications.length !== EXPECTED_COUNTS.offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.offices} Cyprus classifications`);
  }
  if (inventory.tiers.status !== "approved" || inventory.tiers.production_accepted !== true) {
    throw new Error("Cyprus tier file must stay the approved production-accepted bytes");
  }
  if (inventory.countsFile.results !== EXPECTED_COUNTS.documented_result_rows_omitted) {
    throw new Error("counts.json omitted result total drifted");
  }
  for (const row of inventory.draftTiers) {
    if (row.status !== "draft" || row.justin_approved !== false) {
      throw new Error(`Draft tier ${row.office_id} must stay draft and justin_approved false`);
    }
  }
  for (const row of inventory.calendar) {
    if (row.date != null) throw new Error(`Calendar date on ${row.office_id} must stay null`);
    if (row.alert_created !== false) throw new Error(`Calendar alert on ${row.office_id} must stay uncreated`);
    if (row.date_precision !== "year_expected" || row.certainty !== "projection_not_called_poll") {
      throw new Error(`Calendar row ${row.office_id} is not a projection`);
    }
  }
  const holdIds = NAMED_HOLDS.map((hold) => hold.token);
  if (JSON.stringify(inventory.researchGaps.map((row) => row.gap_id)) !== JSON.stringify(holdIds)) {
    throw new Error("research-gaps.json does not list CY-G01 through CY-G15 in order");
  }
  for (const row of inventory.researchGaps) {
    if (row.status === "resolved" || row.status === "closed") {
      throw new Error(`Research gap ${row.gap_id} must stay open`);
    }
  }
  const malformed = inventory.extractionIssues.filter((row) => row.kind === "malformed_candidate_preference_row");
  const unpaired = inventory.extractionIssues.filter((row) => row.kind === "historic_type_not_evidenced");
  if (malformed.length !== EXPECTED_COUNTS.malformed_preference_rows) {
    throw new Error("Ora malformed preference rows drifted");
  }
  if (unpaired.length !== EXPECTED_COUNTS.historic_type_not_evidenced) {
    throw new Error("Unpaired historical place notes drifted");
  }
  if (unpaired.map((row) => row.name).join("|") !== UNPAIRED_HISTORICAL_PLACES.join("|")) {
    throw new Error("Alampra, Akoursos, Tera, and Pelathousa notes drifted");
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
  const eventsHash = sliceHash(inventory, EVENTS_RELATIVE);
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
        omitted_sources_dir: OMITTED_SOURCES_DIR,
        reporting_units_are_not_results: REPORTING_UNITS_NOTE,
        reconciliation_is_not_results: RECONCILIATION_NOTE,
        documented_result_rows_omitted: EXPECTED_COUNTS.documented_result_rows_omitted,
        tier_status: inventory.tiers.status,
        research_coverage_complete: false,
        successor_crosswalk_rows: 0,
        named_communities: EXPECTED_COUNTS.named_communities,
        ministry_overview_communities: EXPECTED_COUNTS.ministry_overview_communities,
      },
    }),
  };

  const classById = new Map(inventory.tiers.classifications.map((row) => [row.office_id, row]));
  const officeById = new Map<string, CyprusOfficeRow>();
  const officeIndex = new Map<string, number>();
  let currentOffices = 0;
  let historicalOffices = 0;
  let currentDirect = 0;
  let historicalDirect = 0;
  const typeCounts = new Map<string, number>();

  for (let i = 0; i < inventory.offices.length; i++) {
    const row = inventory.offices[i]!;
    if (officeById.has(row.office_id)) throw new Error(`Duplicate office ${row.office_id}`);
    if (!ALLOWED_TYPES.has(row.office_type)) throw new Error(`Refusing unlisted Cyprus office type ${row.office_type}`);
    if (row.status !== "current" && row.status !== "historical_only") {
      throw new Error(`Office ${row.office_id} status ${row.status} is not current or historical_only`);
    }
    if (row.selection_mode !== "direct_popular") {
      throw new Error(`Office ${row.office_id} selection mode ${row.selection_mode} is not the authored direct_popular label`);
    }
    if (row.justin_approved !== false) throw new Error(`Office ${row.office_id} research justin_approved must stay false`);
    if (/TRNC/i.test(row.office_id) || /TRNC/i.test(row.name)) {
      throw new Error(`Refusing a TRNC office ${row.office_id}`);
    }
    const wantsExecutive = DIRECT_EXECUTIVE_TYPES.has(row.office_type);
    if (row.direct_executive !== wantsExecutive) {
      throw new Error(`Office ${row.office_id} direct_executive flag does not match ${row.office_type}`);
    }
    const classification = classById.get(row.office_id);
    if (!classification) throw new Error(`Office ${row.office_id} is missing a classification`);
    if (classification.review_status !== "needs_review") {
      throw new Error(`Office ${row.office_id} classification must stay needs_review`);
    }
    if (classification.human_review_required !== true) {
      throw new Error(`Office ${row.office_id} classification must stay human_review_required`);
    }
    if (classification.tier !== expectedTier(row.office_type)) {
      throw new Error(`Office ${row.office_id} tier ${classification.tier} does not match ${row.office_type}`);
    }
    if (inventory.tiers.classifications[i]?.office_id !== row.office_id) {
      throw new Error(`Classification order drifted at ${row.office_id}`);
    }
    if (inventory.draftTiers[i]?.office_id !== row.office_id) {
      throw new Error(`Draft tier order drifted at ${row.office_id}`);
    }
    if (row.office_type === "religious_group_representative" && row.parliamentary_voting_right !== false) {
      throw new Error(`${row.office_id} must stay without a plenary vote`);
    }
    if (row.office_id === HOUSE_ID) {
      if (row.seats !== 56 || row.reserved_vacant_seats !== 24 || row.constitutional_seats !== 80) {
        throw new Error("House seat counts drifted; do not infer 59 voting seats");
      }
    }
    if (row.status === "historical_only") {
      historicalOffices += 1;
      if (row.end_date != null) throw new Error(`Historical office ${row.office_id} end_date must stay null`);
      if (row.direct_executive) historicalDirect += 1;
      for (const place of UNPAIRED_HISTORICAL_PLACES) {
        if (row.name === place || row.name.startsWith(`${place} `)) {
          throw new Error(`Refusing a fabricated historical office for ${place}`);
        }
      }
    } else {
      currentOffices += 1;
      if (row.direct_executive) currentDirect += 1;
    }
    if (row.office_type === "deputy_mayor") {
      if (!row.parent_office_id) throw new Error(`${row.office_id} is missing parent_office_id`);
    }
    const bucket = `${row.status}|${row.office_type}`;
    typeCounts.set(bucket, (typeCounts.get(bucket) ?? 0) + 1);
    officeById.set(row.office_id, row);
    officeIndex.set(row.office_id, i);
  }
  if (officeById.size !== classById.size) throw new Error("Cyprus classifications do not match the register");

  const antonios = officeById.get(SPILIA_ANTONIOS_COUNCIL_ID);
  const kourdali = officeById.get(SPILIA_KOURDALI_COUNCIL_ID);
  if (!antonios || antonios.geography_id !== SPILIA_ANTONIOS_GEOGRAPHY_ID || antonios.ec_area_id !== 1401) {
    throw new Error("Spilia Agios Antonios must stay CY-COM-1401");
  }
  if (!kourdali || kourdali.geography_id !== SPILIA_KOURDALI_GEOGRAPHY_ID || kourdali.ec_area_id != null) {
    throw new Error("Spilia Kourdali must stay a separate council with an unresolved area code");
  }
  if (String(antonios.geography_id) === String(kourdali.geography_id)) {
    throw new Error("Refusing to join Spilia Agios Antonios and Spilia Kourdali");
  }

  const geographies: SqlRow[] = [];
  const geoIds = new Set<string>();
  const pushGeo = (row: SqlRow) => {
    const id = String(row.geography_id);
    if (geoIds.has(id)) throw new Error(`Duplicate geography ${id}`);
    if (row.effective_from_label != null || row.effective_to_label != null) {
      throw new Error(`Geography ${id} must not gain an effective date`);
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

  const officesByGeo = new Map<string, CyprusOfficeRow[]>();
  for (const row of inventory.offices) {
    const list = officesByGeo.get(row.geography_id) ?? [];
    list.push(row);
    officesByGeo.set(row.geography_id, list);
  }
  if (!officesByGeo.has(COUNTRY_GEOGRAPHY_ID)) throw new Error("Cyprus country geography CY is missing from the register");
  const geoOrder = [...officesByGeo.keys()].filter((id) => id !== COUNTRY_GEOGRAPHY_ID).sort();
  for (const geographyId of geoOrder) {
    const rows = officesByGeo.get(geographyId)!;
    const names = new Set(rows.map((row) => placeName(row.name, row.office_id)));
    if (names.size !== 1) {
      throw new Error(`Geography ${geographyId} place names disagree: ${[...names].join(" | ")}`);
    }
    const sample = rows[0]!;
    pushGeo({
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: [...names][0],
      parent_geography_id: COUNTRY_GEOGRAPHY_ID,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(REGISTER_RELATIVE, registerHash, officeIndex.get(sample.office_id)!),
        row: {
          geography_id: geographyId,
          place: [...names][0],
          office_ids: rows.map((row) => row.office_id),
          successor_edge: null,
        },
      }),
    });
  }

  for (const row of inventory.offices) {
    if (!geoIds.has(row.geography_id)) throw new Error(`Office ${row.office_id} geography ${row.geography_id} is not authored`);
    if (row.office_type === "deputy_mayor") {
      const parent = officeById.get(row.parent_office_id ?? "");
      if (!parent || parent.office_type !== "municipal_council" || parent.status !== "current") {
        throw new Error(`${row.office_id} parent council ${row.parent_office_id} is missing`);
      }
    }
  }

  const offices: SqlRow[] = inventory.offices.map((row, index) => ({
    id_namespace: N,
    office_id: row.office_id,
    country_id: COUNTRY_ID,
    geography_id: row.geography_id,
    name: row.name,
    office_type: row.office_type,
    office_status: row.status === "historical_only" ? "historical" : "current",
    record_state: "active",
    state_note: null,
    registry_qualified: 1,
    next_date_id: null,
    next_date_resolution: "unknown",
    next_history_key: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({ origin: originFor(REGISTER_RELATIVE, registerHash, index), row }),
  }));

  const tiers: SqlRow[] = inventory.tiers.classifications.map((row, index) => {
    if (row.review_status !== "needs_review") {
      throw new Error(`Refusing to rewrite ${row.office_id} review_status ${row.review_status}`);
    }
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapTier(row.tier),
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

  const currentIds = new Set(inventory.offices.filter((row) => row.status === "current").map((row) => row.office_id));
  const calendarIds = new Set(inventory.calendar.map((row) => row.office_id));
  if (calendarIds.size !== currentIds.size) throw new Error("Calendar office set drifted");
  for (const id of calendarIds) {
    if (!currentIds.has(id)) throw new Error(`Calendar names a non-current office ${id}`);
  }
  const coverageIds = new Set(inventory.coverage.map((row) => row.office_id));
  if (coverageIds.size !== currentIds.size) throw new Error("Current office coverage set drifted");
  for (const id of coverageIds) {
    if (!currentIds.has(id)) throw new Error(`Coverage names a non-current office ${id}`);
  }

  const dates: SqlRow[] = [];
  const dateIds = new Set<string>();
  const events: SqlRow[] = [];
  const eventByKey = new Map<string, CyprusEventRow>();
  const eventsByOffice = new Map<string, number>();
  let ordinaryElections = 0;
  let uncontestedReturns = 0;
  let electionReturns = 0;
  let yearOnly = 0;
  let dayEvents = 0;

  for (let i = 0; i < inventory.events.length; i++) {
    const row = inventory.events[i]!;
    const office = officeById.get(row.office_id);
    if (!office) throw new Error(`Event ${row.event_id} office ${row.office_id} is not in the register`);
    if (eventByKey.has(row.event_id)) throw new Error(`Duplicate event ${row.event_id}`);
    if (row.date_precision !== "day" && row.date_precision !== "year") {
      throw new Error(`Unsupported date_precision ${row.date_precision} on ${row.event_id}`);
    }
    if (row.justin_approved !== false) throw new Error(`Event ${row.event_id} justin_approved must stay false`);
    if (row.certification !== "Gazette certification not independently verified") {
      throw new Error(`Event ${row.event_id} certification label drifted`);
    }
    if (PROSPECTIVE_CALENDAR_YEARS.has(row.date)) {
      throw new Error(`Refusing prospective calendar year ${row.date} on ${row.event_id}`);
    }
    const kind = eventKind(row.event_type);
    if (row.event_type === "election") ordinaryElections += 1;
    if (row.event_type === "uncontested_return") uncontestedReturns += 1;
    if (row.event_type === "election_return") electionReturns += 1;
    const parsed = parseLabel(row.date, row.date_precision, row.event_id);
    if (parsed.precision === "year") yearOnly += 1;
    else dayEvents += 1;
    const dateIdValue = dateId("event", row.event_id, "election");
    if (dateIds.has(dateIdValue)) throw new Error(`Cyprus date_id collided: ${dateIdValue}`);
    dateIds.add(dateIdValue);
    dates.push({
      date_id: dateIdValue,
      label: row.date,
      precision: parsed.precision,
      certainty: parsed.precision === "year" ? "unknown" : "called",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(EVENTS_RELATIVE, eventsHash, i),
        row: { date: row.date, date_precision: row.date_precision },
      }),
    });
    eventByKey.set(row.event_id, row);
    eventsByOffice.set(row.office_id, (eventsByOffice.get(row.office_id) ?? 0) + 1);
    events.push({
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      event_id: row.event_id,
      date_id: dateIdValue,
      date_resolution: "resolved",
      event_kind: kind,
      selected_history_role: "selected",
      electoral_system: row.electoral_system,
      comparability: null,
      ballot_basis: "unknown",
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: `${row.event_type}; date_precision=${row.date_precision}; ballot_basis=${row.ballot_basis}; result_status=${row.result_status}; certification=${row.certification}`,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(EVENTS_RELATIVE, eventsHash, i), row }),
    });
  }

  let officesWithoutEvents = 0;
  for (const row of inventory.offices) {
    if ((eventsByOffice.get(row.office_id) ?? 0) === 0) officesWithoutEvents += 1;
  }

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
  for (const [index, row] of inventory.events.entries()) {
    addLocator(locators, locatorSeen, {
      record_key: recordKey("event", [N, row.office_id, row.event_id]),
      entity_kind: "event",
      ...blankLocator(),
      country_id: COUNTRY_ID,
      id_namespace: N,
      office_id: row.office_id,
      history_key: row.event_id,
      lineage_id: L,
      release_id: R,
      source_row_locator: sourceRowLocator({ derivedPath: EVENTS_RELATIVE, derivedPointer: `/${index}` }),
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
      unresolved_id: cyprusUnresolvedId(countryRec, occurrence, hold.token),
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
    selected_histories: events.length,
    prospective_events: 0,
    total_events: events.length,
    proceedings: 0,
    result_rows: 0,
    documented_result_rows_omitted: inventory.countsFile.results,
    documented_list_ballot_rows_omitted: inventory.countsFile.result_kinds.list_ballot,
    documented_candidate_vote_rows_omitted: inventory.countsFile.result_kinds.candidate_vote,
    documented_candidate_preference_rows_omitted: inventory.countsFile.result_kinds.candidate_preference,
    documented_returned_representative_rows_omitted: inventory.countsFile.result_kinds.returned_representative,
    documented_party_seat_rows_omitted: inventory.countsFile.result_kinds.party_seats,
    reporting_units: inventory.reportingUnits.length,
    reconciliation_rows: inventory.reconciliation.length,
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
    current_local_councils: countType("current", "municipal_council") + countType("current", "community_council"),
    historical_local_councils: countType("historical_only", "municipal_council") + countType("historical_only", "community_council"),
    current_municipal_councils: countType("current", "municipal_council"),
    current_mayors: countType("current", "mayor"),
    current_deputy_mayors: countType("current", "deputy_mayor"),
    current_community_councils: countType("current", "community_council"),
    current_community_leaders: countType("current", "community_leader"),
    current_dlgo_presidents: countType("current", "district_organisation_president"),
    historical_municipal_councils: countType("historical_only", "municipal_council"),
    historical_mayors: countType("historical_only", "mayor"),
    historical_community_councils: countType("historical_only", "community_council"),
    historical_community_leaders: countType("historical_only", "community_leader"),
    municipalities: inventory.municipalities.length,
    named_communities: inventory.communities.length,
    ministry_overview_communities: inventory.countsFile.ministry_overview_communities,
    municipal_quarters: inventory.municipalQuarters.length,
    parliament_offices: officeById.get(HOUSE_ID)?.office_type === "national_parliament" ? 1 : 0,
    ep_delegations: officeById.get(EP_ID)?.office_type === "european_parliament_delegation" ? 1 : 0,
    religious_representatives: [REL_ARM_ID, REL_LAT_ID, REL_MAR_ID].filter(
      (id) => officeById.get(id)?.office_type === "religious_group_representative",
    ).length,
    ordinary_election_events: ordinaryElections,
    uncontested_return_events: uncontestedReturns,
    election_return_events: electionReturns,
    offices_with_events: offices.length - officesWithoutEvents,
    offices_without_events: officesWithoutEvents,
    year_only_events: yearOnly,
    day_events: dayEvents,
    evidence_links: 0,
    source_inventory_rows: inventory.sourceInventory.length,
    distinct_source_files_documented: EXPECTED_COUNTS.distinct_source_files_documented,
    calendar_rows: inventory.calendar.length,
    calendar_called_polls: inventory.calendar.filter((row) => row.date != null || row.alert_created).length,
    extraction_issues: inventory.extractionIssues.length,
    historic_type_not_evidenced: unpaired.length,
    malformed_preference_rows: malformed.length,
    successor_crosswalk_rows: inventory.successorCrosswalk.length,
    field_map_rows: inventory.fieldMap.length,
    territorial_gates: inventory.territorialGates.length,
    research_gaps: inventory.researchGaps.length,
    excluded_source_observations: inventory.excludedObservations.length,
    identity_aliases: inventory.identityAliases.length,
    quarter_name_aliases: inventory.quarterAliases.length,
    acceptance_examples: inventory.acceptanceExamples.length,
    current_office_coverage_rows: inventory.coverage.length,
    draft_tier_rows: inventory.draftTiers.length,
  };

  for (const [countKey, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (validatedCounts[countKey] !== expected) {
      throw new Error(`Cyprus ${countKey} count ${validatedCounts[countKey]} != ${expected}`);
    }
  }
  if (validatedCounts.result_rows !== 0) throw new Error("Cyprus slim import must publish 0 result rows");
  if (validatedCounts.documented_result_rows_omitted === validatedCounts.reporting_units) {
    throw new Error("Refusing to treat reporting-units.json as the omitted result total");
  }

  const lineage = {
    lineage_id: L,
    provenance_kind: "country_package",
    description:
      "Cyprus Prompt AQ register. Justin accepted 714 current and 174 historical offices with CY-G01 through CY-G15 left open. 1,599 events and 0 published result rows. The omitted results.json documents 11,112 rows; that file is not invented. The successor crosswalk stays empty.",
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
        published_result_rows: 0,
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
    events,
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

const REPORTING_UNITS_NOTE = "data/research/cyprus/reporting-units.json";
const RECONCILIATION_NOTE = "data/research/cyprus/reconciliation.json";
