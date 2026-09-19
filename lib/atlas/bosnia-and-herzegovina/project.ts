import type { TableRow } from "../../observatory/adapters/tables";
import type { BosniaInventory, HistoryIndexSlice, WorkbookSlice } from "./inventory";
import {
  CAL_EXPECTED_STATUS,
  CANTONAL_OFFICE_IDS,
  CEC_HOMEPAGE_URL,
  COUNTRY_CODE,
  COUNTRY_ID,
  ENTITY_OFFICE_IDS,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  LINEAGE_ID,
  NEXT_POLLING_DATE,
  OFFICE_NAMESPACE,
  PACKAGE_PREFIX,
  REQUIRED_OFFICE_IDS,
  SCREENING_URL,
  SOURCE_NAMESPACE,
  TIER_PATH,
  UNPACKED_PREFIX,
  canonical,
  catalogueSourceId,
  cellText,
  cellYear,
  dateId,
  evidenceId,
  eventIdFor,
  geographyIdFor,
  historyKey,
  isFixtureId,
  isHttpUrl,
  locator,
  looksLikeBrcko,
  nextEventIdFor,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  unresolvedId,
  unpackedPath,
  urlSourceId,
  type Locator,
} from "./identity";

export type SqlRow = Record<string, unknown>;

export type BosniaProjection = {
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
  sources: SqlRow[];
  results: SqlRow[];
  locators: SqlRow[];
  evidence: SqlRow[];
  unresolved: SqlRow[];
  crosswalks: SqlRow[];
  validatedCounts: Record<string, number>;
};

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;
const ISO_YEAR = /^(\d{4})$/;
const MONTH_NAMES: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function columnIndex(slice: WorkbookSlice, column: string): number {
  const index = slice.table.columns.indexOf(column);
  if (index < 0) throw new Error(`Missing column ${column} in ${slice.relativePath}`);
  return index;
}

function sliceHash(inventory: BosniaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: BosniaInventory,
  rowIndex: number,
  column?: string,
): Locator {
  const j = column ? columnIndex(slice, column) : null;
  return locator({
    input_path: slice.relativePath,
    sha256: sliceHash(inventory, slice.relativePath),
    json_pointer: j == null ? `/rows/${rowIndex}` : `/rows/${rowIndex}/${j}`,
    sheet: slice.table.sheet,
    source_row: slice.table.source_rows[rowIndex] ?? null,
    column: column ?? null,
    ...(slice.archiveEntry ? { archive_entry: slice.archiveEntry } : {}),
  });
}

function indexOrigin(
  slice: HistoryIndexSlice,
  inventory: BosniaInventory,
  rowIndex: number,
  column?: string,
): Locator {
  const pointer = column ? `/${rowIndex}/${escapePointer(column)}` : `/${rowIndex}`;
  return locator({
    input_path: slice.relativePath,
    sha256: sliceHash(inventory, slice.relativePath),
    json_pointer: pointer,
    sheet: null,
    source_row: null,
    column: column ?? null,
    archive_entry: slice.archiveEntry,
  });
}

function escapePointer(token: string): string {
  return token.replaceAll("~", "~0").replaceAll("/", "~1");
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseDateLabel(label: string): {
  precision: "day" | "month" | "year" | "unknown";
  year: number | null;
  month: number | null;
  day: number | null;
} {
  const trimmed = label.trim();
  const dayMatch = ISO_DAY.exec(trimmed);
  if (dayMatch) {
    const year = Number(dayMatch[1]);
    const month = Number(dayMatch[2]);
    const day = Number(dayMatch[3]);
    if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
      throw new Error(`Invalid Gregorian date ${label}`);
    }
    return { precision: "day", year, month, day };
  }
  const monthMatch = ISO_MONTH.exec(trimmed);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]);
    if (year < 1 || year > 9999 || month < 1 || month > 12) {
      throw new Error(`Invalid month date ${label}`);
    }
    return { precision: "month", year, month, day: null };
  }
  const yearMatch = ISO_YEAR.exec(trimmed);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    if (year < 1 || year > 9999) throw new Error(`Invalid year ${label}`);
    return { precision: "year", year, month: null, day: null };
  }
  const monthDay = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(trimmed);
  if (monthDay) {
    const day = Number(monthDay[1]);
    const month = MONTH_NAMES[monthDay[2]!.toLowerCase()];
    const year = Number(monthDay[3]);
    if (!month || year < 1 || year > 9999 || day < 1 || day > daysInMonth(year, month)) {
      throw new Error(`Invalid English date ${label}`);
    }
    return { precision: "day", year, month, day };
  }
  const monthYear = /^([A-Za-z]+)\s+(\d{4})$/.exec(trimmed);
  if (monthYear) {
    const month = MONTH_NAMES[monthYear[1]!.toLowerCase()];
    const year = Number(monthYear[2]);
    if (!month || year < 1 || year > 9999) throw new Error(`Invalid English month date ${label}`);
    return { precision: "month", year, month, day: null };
  }
  return { precision: "unknown", year: null, month: null, day: null };
}

function researchDateFromHistory(ballot: string, yearValue: unknown): {
  label: string;
  precision: "day" | "month" | "year" | "unknown";
  certainty: "unknown";
  year: number | null;
  month: number | null;
  day: number | null;
} {
  const yearFromCell = cellYear(yearValue);
  if (ballot) {
    const parsed = parseDateLabel(ballot);
    if (parsed.precision === "unknown") {
      throw new Error(`Unrecognized historical date label ${JSON.stringify(ballot)}`);
    }
    if (yearFromCell != null && parsed.year != null && yearFromCell !== parsed.year) {
      throw new Error(`Year/date conflict ${ballot} vs ${yearFromCell}`);
    }
    return { ...parsed, certainty: "unknown", label: ballot };
  }
  if (yearFromCell == null) {
    return { label: "", precision: "unknown", certainty: "unknown", year: null, month: null, day: null };
  }
  if (yearFromCell < 1 || yearFromCell > 9999) {
    throw new Error(`Invalid fallback year ${yearFromCell}`);
  }
  return {
    label: String(yearFromCell),
    precision: "year",
    certainty: "unknown",
    year: yearFromCell,
    month: null,
    day: null,
  };
}

function numericInteger(value: unknown, label: string): { value: number | null; status: string } {
  if (value == null) return { value: null, status: "unknown" };
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a finite nonnegative integer or null`);
  }
  return { value, status: value === 0 ? "zero" : "recorded" };
}

function numericShare(value: unknown, label: string): { value: number | null; status: string } {
  if (value == null) return { value: null, status: "unknown" };
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be a finite 0..100 number or null`);
  }
  return { value, status: value === 0 ? "zero" : "recorded" };
}

function ballotBasis(value: unknown): "valid_votes" | "unknown" {
  if (cellText(value) !== "Valid candidate/list votes") {
    throw new Error(`Bosnia baseline vote basis must be Valid candidate/list votes, got ${JSON.stringify(value)}`);
  }
  return "valid_votes";
}

function mapTier(raw: string): string | null {
  if (raw === "municipal") return "municipal";
  if (raw === "regional") return "regional";
  if (raw === "other") return "other";
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  if (raw === "council") {
    throw new Error("Legacy council metadata is not an allowed Atlas geographic tier");
  }
  throw new Error(`Unsupported classification tier ${JSON.stringify(raw)}`);
}

function decodeHtmlHref(href: string): string {
  return href
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"');
}

function htmlAnchors(html: string): Array<{ href: string; decoded: string; index: number }> {
  const anchors: Array<{ href: string; decoded: string; index: number }> = [];
  const re = /<a\s+href="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html))) {
    const href = match[1]!;
    anchors.push({ href, decoded: decodeHtmlHref(href), index });
    index += 1;
  }
  return anchors;
}

function comparability(row: TableRow): string | null {
  const parts = [cellText(row.Coverage), cellText(row["Comparability status"])].filter((part) => part.length > 0);
  return parts.length ? parts.join(" · ") : null;
}

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value) || (value && looksLikeBrcko(value))) {
      throw new Error(`Fixture or forbidden identity ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function csvScalarEqual(tableVal: unknown, csvVal: unknown): boolean {
  if (tableVal == null && (csvVal == null || csvVal === "")) return true;
  if (csvVal == null && (tableVal == null || tableVal === "")) return true;
  if (typeof tableVal === "number" && typeof csvVal === "string") {
    if (csvVal.trim() === "") return false;
    return Number(csvVal) === tableVal;
  }
  if (typeof csvVal === "number" && typeof tableVal === "string") {
    if (tableVal.trim() === "") return false;
    return Number(tableVal) === csvVal;
  }
  return tableVal === csvVal;
}

export function projectBosnia(inventory: BosniaInventory): BosniaProjection {
  const L = LINEAGE_ID;
  const R = inventory.releaseId;
  const N = OFFICE_NAMESPACE;

  rejectFixtures(
    inventory.officeRegister.rows.map((row) => cellText(row["Office ID"])),
    "office register",
  );
  for (const item of inventory.tracked) {
    if (item.text && (/\bFIX-/i.test(item.text) || /\bFXT-/i.test(item.text))) {
      throw new Error(`Fixture token rejected in retained input ${item.input_path}`);
    }
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
  if (retainedInputs.length !== EXPECTED_COUNTS.retained_inputs) {
    throw new Error(`Retained input count must be ${EXPECTED_COUNTS.retained_inputs}, found ${retainedInputs.length}`);
  }

  const notesRow = inventory.countryNotes.rows[0];
  const countryLocator = originFor(inventory.countryNotes, inventory, 0);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: COUNTRY_CODE,
    name: inventory.manifest.country,
    polity_kind: "sovereign_country",
    region_id: "europe",
    coverage_status: "partial",
    screening_as_of_label: null,
    notes: notesRow ? cellText(notesRow["Scope and remaining gaps"]) : null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: `${PACKAGE_PREFIX}/manifest.json`,
        sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/manifest.json`),
      }),
      row: inventory.manifest,
      supplemental: {
        coverage: inventory.coverage,
        country_notes: notesRow ?? null,
        country_notes_origin: countryLocator,
      },
    }),
  };

  const officeRows = inventory.officeRegister.rows;
  if (officeRows.length !== EXPECTED_COUNTS.current_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.current_offices} offices, found ${officeRows.length}`);
  }

  const geographies: SqlRow[] = [];
  const officeMeta: Array<{
    officeId: string;
    geographyId: string;
    rowIndex: number;
    row: TableRow;
    jurisdiction: string;
    officeType: string;
    nextDate: string;
    historicalCoverage: string;
    calendarEvidence: string;
  }> = [];
  const officeById = new Map<(typeof officeMeta)[number]["officeId"], (typeof officeMeta)[number]>();
  const geoSeen = new Set<string>();
  let cantonal = 0;
  let entity = 0;

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (looksLikeBrcko(officeId) || looksLikeBrcko(cellText(row.Jurisdiction))) {
      throw new Error(`Brčko identity must not be invented or imported: ${officeId}`);
    }
    if (cellText(row.Country) !== "Bosnia and Herzegovina") {
      throw new Error(`Office ${officeId} country is not Bosnia and Herzegovina`);
    }
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    if (officeType === "Mayor" || /municipal/i.test(officeType)) {
      throw new Error(`Municipal office invented or supplied: ${officeId}`);
    }
    const geographyId = geographyIdFor(jurisdiction, officeType);
    const expected = EXPECTED_OFFICES[officeId];
    if (
      !expected ||
      expected.jurisdiction !== jurisdiction ||
      expected.officeType !== officeType ||
      expected.geographyId !== geographyId
    ) {
      throw new Error(`Office ${officeId} geography/type mismatch`);
    }
    if (officeType === "Cantonal assembly") cantonal += 1;
    else if (
      officeType === "House of Representatives" ||
      officeType === "National Assembly" ||
      officeType === "President"
    ) {
      entity += 1;
    } else {
      throw new Error(`Unexpected office type ${officeType} for ${officeId}`);
    }
    if (!geoSeen.has(geographyId)) {
      geoSeen.add(geographyId);
      geographies.push({
        country_id: COUNTRY_ID,
        geography_id: geographyId,
        name: jurisdiction,
        parent_geography_id: null,
        effective_from_label: null,
        effective_to_label: null,
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin: originFor(inventory.officeRegister, inventory, i),
          row,
          columns: inventory.officeRegister.table.columns,
          values: inventory.officeRegister.table.rows[i],
          supplemental: {
            institution_scope: ENTITY_OFFICE_IDS.includes(officeId as (typeof ENTITY_OFFICE_IDS)[number])
              ? "entity"
              : "canton",
          },
        }),
      });
    }
    const nextDate = cellText(row["Next polling date"]);
    if (nextDate !== NEXT_POLLING_DATE) {
      throw new Error(`Office ${officeId} next date must stay ${NEXT_POLLING_DATE}`);
    }
    const meta = {
      officeId,
      geographyId,
      rowIndex: i,
      row,
      jurisdiction,
      officeType,
      nextDate,
      historicalCoverage: cellText(row["Historical coverage"]),
      calendarEvidence: cellText(row["Calendar evidence"]),
    };
    officeMeta.push(meta);
    officeById.set(officeId, meta);
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} geographies, found ${geographies.length}`);
  }
  if (cantonal !== EXPECTED_COUNTS.cantonal_assembly_offices || entity !== EXPECTED_COUNTS.entity_offices) {
    throw new Error(`Office type counts ${cantonal}/${entity}`);
  }
  const registerIds = new Set(officeMeta.map((row) => row.officeId));
  for (const id of REQUIRED_OFFICE_IDS) {
    if (!registerIds.has(id)) throw new Error(`Missing required office ${id}`);
  }
  if (registerIds.size !== REQUIRED_OFFICE_IDS.length) {
    throw new Error("Office ID set mismatch");
  }
  const rsAssembly = officeById.get("BA-R");
  const rsPresident = officeById.get("BA-G");
  if (!rsAssembly || !rsPresident || rsAssembly.geographyId === rsPresident.geographyId) {
    throw new Error("BA-R and BA-G must keep distinct type-scoped geography IDs");
  }
  if (rsPresident.officeType !== "President" || rsPresident.jurisdiction !== "Republika Srpska") {
    throw new Error("BA-G must remain the Republika Srpska President, not Brčko");
  }

  const classifications = inventory.tiers.classifications;
  if (classifications.length !== EXPECTED_COUNTS.current_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.current_offices} classifications, found ${classifications.length}`);
  }
  const classIds = new Set(classifications.map((row) => row.office_id));
  for (const id of registerIds) {
    if (!classIds.has(id)) throw new Error(`Classification missing office ${id}`);
  }
  for (const id of classIds) {
    if (!registerIds.has(id) || looksLikeBrcko(id)) {
      throw new Error(`Classification extra or forbidden office ${id}`);
    }
  }

  const tierSha = inventory.byPath.get(TIER_PATH)!.sha256;
  const tiers: SqlRow[] = classifications.map((row, classIndex) => {
    const mapped = mapTier(row.tier);
    const needsReview = Boolean(row.human_review_required || row.tier_uncertain);
    const reviewStatus =
      mapped == null ? "unknown" : inventory.tiers.status === "approved" && !needsReview ? "approved" : "needs_review";
    return {
      id_namespace: N,
      office_id: row.office_id,
      tier: mapped,
      review_status: reviewStatus,
      rationale: row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: tierSha,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: TIER_PATH,
          sha256: tierSha,
          json_pointer: `/classifications/${classIndex}`,
        }),
        row,
      }),
    };
  });
  if (tiers.some((row) => row.tier !== "regional")) {
    throw new Error("All 13 Bosnia and Herzegovina offices must be regional");
  }
  if (tiers.some((row) => row.tier === "municipal")) {
    throw new Error("Bosnia and Herzegovina must not invent municipal classifications");
  }
  for (const officeId of ENTITY_OFFICE_IDS) {
    const row = classifications.find((item) => item.office_id === officeId);
    if (!row || row.human_review_required !== true) {
      throw new Error(`${officeId} must retain focused human_review_required`);
    }
  }
  for (const officeId of CANTONAL_OFFICE_IDS) {
    const row = classifications.find((item) => item.office_id === officeId);
    if (!row || row.human_review_required !== false) {
      throw new Error(`${officeId} canton row must not silently require review`);
    }
  }
  const openNotes = (inventory.tiers.notes ?? []).filter((note) => note.status === "open").map((note) => note.scope);
  if (
    !openNotes.includes("presidential_event_reconciliation") ||
    !openNotes.includes("governing_coalition_history") ||
    !openNotes.includes("calendar_certainty") ||
    !openNotes.includes("not_supplied")
  ) {
    throw new Error("Prompt O research holds must remain open");
  }

  type CatalogueInfo = {
    sourceId: string;
    originalId: string;
    title: string;
    url: string;
    grade: string;
    accessed: string;
    index: number;
    row: TableRow;
  };
  const catalogueById = new Map<string, CatalogueInfo>();
  const catalogueByUrl = new Map<string, string>();
  for (let i = 0; i < inventory.masterSources.rows.length; i++) {
    const row = inventory.masterSources.rows[i]!;
    const originalId = cellText(row["Source ID"]);
    const title = cellText(row.Title);
    const url = cellText(row["Source URL"]);
    const grade = cellText(row["Evidence grade"]);
    const accessed = cellText(row.Accessed);
    if (!originalId || !isHttpUrl(url)) {
      throw new Error(`Catalogue row ${i} missing Source ID or HTTP URL`);
    }
    rejectFixtures([originalId], "source catalogue");
    if (catalogueById.has(originalId) || catalogueByUrl.has(url)) {
      throw new Error(`Duplicate catalogue identity ${originalId} / ${url}`);
    }
    const sourceId = catalogueSourceId(originalId);
    catalogueById.set(originalId, {
      sourceId,
      originalId,
      title,
      url,
      grade,
      accessed,
      index: i,
      row,
    });
    catalogueByUrl.set(url, sourceId);
  }
  if (inventory.masterSources.rows.length !== EXPECTED_COUNTS.source_catalogue_rows) {
    throw new Error("Master source catalogue row count mismatch");
  }

  const sources: SqlRow[] = [];
  for (const info of catalogueById.values()) {
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: info.sourceId,
      publisher: null,
      title: info.title || null,
      url: info.url,
      checked_as_of_label: info.accessed || null,
      evidence_grade: info.grade || null,
      file_sha256: null,
      locator: null,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.masterSources, inventory, info.index),
        row: info.row,
      }),
    });
  }

  const inlineUrls = (inventory.sourceLinks.without_master_source_row ?? []).filter((url) => !catalogueByUrl.has(url));
  if (inlineUrls.length !== EXPECTED_COUNTS.inline_only_sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.inline_only_sources} inline-only URLs, found ${inlineUrls.length}`);
  }
  if (!inlineUrls.includes(CEC_HOMEPAGE_URL) || !inlineUrls.includes(SCREENING_URL)) {
    throw new Error("Inline-only sources must be the CEC homepage and 2027 screening URL");
  }
  for (const url of inlineUrls) {
    const sourceId = urlSourceId(url);
    const origin =
      url === SCREENING_URL
        ? originFor(inventory.countryNotes, inventory, 0, "Screen evidence")
        : originFor(inventory.calendar, inventory, 0, "Source URL");
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: sourceId,
      publisher: null,
      title: null,
      url,
      checked_as_of_label: null,
      evidence_grade: null,
      file_sha256: null,
      locator: null,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin,
        row: { url },
        supplemental: { inline_only: true },
      }),
    });
    catalogueByUrl.set(url, sourceId);
  }
  if (sources.length !== EXPECTED_COUNTS.sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.sources} sources, found ${sources.length}`);
  }

  const locators: SqlRow[] = [];
  const locatorKeys = new Set<string>();
  function addLocator(row: SqlRow): string {
    const rec = String(row.record_key);
    if (locatorKeys.has(rec)) return rec;
    locatorKeys.add(rec);
    locators.push(row);
    return rec;
  }

  const unresolved: SqlRow[] = [];
  function addUnresolved(args: { recordKey: string; loc: Locator; token: string; reason: string; row: unknown }): void {
    unresolved.push({
      unresolved_id: unresolvedId(args.recordKey, occurrenceIdentity(args.loc), args.token),
      record_key: args.recordKey,
      original_token: args.token,
      source_locator: canonical(args.loc),
      reason: args.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: args.loc, row: args.row }),
    });
  }

  function tryResolve(token: string): string | null {
    if (!token) return null;
    if (catalogueById.has(token)) return catalogueById.get(token)!.sourceId;
    const prefixed = token.startsWith(`${COUNTRY_ID}--`) ? token.slice(`${COUNTRY_ID}--`.length) : null;
    if (prefixed && catalogueById.has(prefixed)) return catalogueById.get(prefixed)!.sourceId;
    if (catalogueByUrl.has(token)) return catalogueByUrl.get(token)!;
    const existing = sources.find((row) => String(row.source_id) === token);
    return existing ? String(existing.source_id) : null;
  }

  function resolveCitation(
    token: string,
    rec: string,
    loc: Locator,
    context: string,
    originalRow: unknown,
  ): string | null {
    if (!token) throw new Error(`Empty citation in ${context}`);
    const resolved = tryResolve(token);
    if (resolved) return resolved;
    const reason = /^[a-z][a-z0-9+.-]*:/i.test(token) && !isHttpUrl(token) ? "invalid_url" : "unmatched_catalogue_token";
    addUnresolved({ recordKey: rec, loc, token, reason, row: originalRow });
    return null;
  }

  const historyEntries: Array<{
    rowIndex: number;
    row: TableRow;
    officeId: string;
    hk: string;
    eventId: string;
    ballot: string;
    indexRow?: Record<string, unknown>;
    indexIndex?: number;
  }> = [];
  const historyByHk = new Map<string, (typeof historyEntries)[number]>();
  for (let i = 0; i < inventory.histories.rows.length; i++) {
    const row = inventory.histories.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (!officeById.has(officeId)) throw new Error(`History office ${officeId} missing from register`);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const eventPublicId = eventIdFor(hk);
    rejectFixtures([officeId, eventPublicId, hk], "history");
    const entry = {
      rowIndex: i,
      row,
      officeId,
      hk,
      eventId: eventPublicId,
      ballot: cellText(row["Ballot date if recorded"]),
    };
    if (historyByHk.has(hk)) throw new Error(`Duplicate history key ${hk}`);
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
  }
  if (historyEntries.length !== EXPECTED_COUNTS.selected_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.selected_histories} selected histories, found ${historyEntries.length}`);
  }
  for (const office of officeMeta) {
    const years = historyEntries.filter((row) => row.officeId === office.officeId).map((row) => cellYear(row.row.Year));
    if (years.length !== 3 || !years.includes(2014) || !years.includes(2018) || !years.includes(2022)) {
      throw new Error(`${office.officeId} must keep exactly the 2014/2018/2022 regular-cycle histories`);
    }
  }
  const extraPresidential = historyEntries.filter(
    (row) => row.officeId === "BA-G" && !["BA-G::2014::", "BA-G::2018::", "BA-G::2022::"].includes(row.hk),
  );
  if (extraPresidential.length !== 0) {
    throw new Error("RS replacement/repeat presidential events must not be invented");
  }

  const indexKeys = new Set<string>();
  for (let i = 0; i < inventory.historyIndex.rows.length; i++) {
    const row = inventory.historyIndex.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    indexKeys.add(hk);
    const historical = historyByHk.get(hk);
    if (!historical) throw new Error(`History-index key ${hk} is not a selected H event`);
    for (const column of inventory.histories.table.columns) {
      if (!csvScalarEqual(historical.row[column], row[column])) {
        throw new Error(`H/IX scalar mismatch for ${hk} column ${column}`);
      }
    }
    historical.indexRow = row;
    historical.indexIndex = i;
  }
  if (indexKeys.size !== EXPECTED_COUNTS.selected_histories) {
    throw new Error("H and IX key sets must be identical 39");
  }
  for (const hk of historyByHk.keys()) {
    if (!indexKeys.has(hk)) throw new Error(`Selected history ${hk} missing from history-index`);
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  let eligible = 0;
  let unscored = 0;

  for (const entry of historyEntries) {
    const parsed = researchDateFromHistory(entry.ballot, entry.row.Year);
    if (parsed.precision !== "year" || parsed.certainty !== "unknown") {
      throw new Error(`Baseline historical date must be year/unknown: ${entry.hk}`);
    }
    const dId = dateId("event", entry.eventId, "ballot");
    dates.push({
      date_id: dId,
      label: parsed.label,
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
        origin: originFor(inventory.histories, inventory, entry.rowIndex, "Ballot date if recorded"),
        row: { ballot: entry.row["Ballot date if recorded"], year: entry.row.Year },
        supplemental: {
          history_index: entry.indexRow ?? null,
          history_index_origin:
            entry.indexIndex == null
              ? null
              : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex, "Ballot date if recorded"),
        },
      }),
    });
    const basis = ballotBasis(entry.row["Vote basis"]);
    const comparabilityStatus = cellText(entry.row["Comparability status"]);
    if (comparabilityStatus === "Eligible vote basis") eligible += 1;
    else if (comparabilityStatus === "Unscored / inapplicable") unscored += 1;
    else throw new Error(`Unexpected comparability ${comparabilityStatus} for ${entry.hk}`);
    events.push({
      id_namespace: N,
      office_id: entry.officeId,
      history_key: entry.hk,
      event_id: entry.eventId,
      date_id: dId,
      date_resolution: "resolved",
      event_kind: "unknown",
      selected_history_role: "selected",
      electoral_system: null,
      comparability: comparability(entry.row),
      ballot_basis: basis,
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.histories, inventory, entry.rowIndex),
        row: entry.row,
        columns: inventory.histories.table.columns,
        values: inventory.histories.table.rows[entry.rowIndex],
        supplemental: {
          history_index: entry.indexRow ?? null,
          history_index_origin:
            entry.indexIndex == null ? null : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex),
        },
      }),
    });
  }
  if (eligible !== 36 || unscored !== 3) {
    throw new Error(`Unexpected comparability counts ${eligible}/${unscored}`);
  }

  const calRow = inventory.calendar.rows[0];
  if (!calRow) throw new Error("Missing election-calendar row");
  if (cellText(calRow["Date status"]) !== CAL_EXPECTED_STATUS) {
    throw new Error("Calendar date status must remain Scheduled cycle / expected; details vary");
  }
  if (cellText(calRow["First or scheduled date"]) !== NEXT_POLLING_DATE) {
    throw new Error("Calendar scheduled date mismatch");
  }
  if (cellText(calRow["Source URL"]) !== CEC_HOMEPAGE_URL) {
    throw new Error("Calendar source URL must remain the CEC homepage");
  }
  if (cellText(calRow.Tier) === "regional" || cellText(calRow.Tier) === "municipal") {
    throw new Error("Calendar cohort Tier must not classify offices");
  }

  const prospectiveByOffice = new Map<string, { eventId: string; dateId: string; hk: string; officeIndex: number }>();
  for (const office of officeMeta) {
    const eventId = nextEventIdFor(office.officeId);
    const parsed = parseDateLabel(office.nextDate);
    if (parsed.precision !== "day") {
      throw new Error(`Prospective date must stay day precision for ${office.officeId}`);
    }
    const dId = dateId("event", eventId, "ballot");
    dates.push({
      date_id: dId,
      label: office.nextDate,
      precision: "day",
      certainty: "expected",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, office.rowIndex, "Next polling date"),
        row: office.row,
        supplemental: {
          calendar_date: originFor(inventory.calendar, inventory, 0, "First or scheduled date"),
          calendar_status: originFor(inventory.calendar, inventory, 0, "Date status"),
          calendar_url: originFor(inventory.calendar, inventory, 0, "Source URL"),
        },
      }),
    });
    events.push({
      id_namespace: N,
      office_id: office.officeId,
      history_key: eventId,
      event_id: eventId,
      date_id: dId,
      date_resolution: "resolved",
      event_kind: "unknown",
      selected_history_role: "none",
      electoral_system: null,
      comparability: office.historicalCoverage || null,
      ballot_basis: "unknown",
      share_unit: "percent_0_100",
      legal_outcome: "not_held",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, office.rowIndex),
        row: office.row,
        columns: inventory.officeRegister.table.columns,
        values: inventory.officeRegister.table.rows[office.rowIndex],
        supplemental: {
          calendar: calRow,
          calendar_origin: originFor(inventory.calendar, inventory, 0),
        },
      }),
    });
    prospectiveByOffice.set(office.officeId, {
      eventId,
      dateId: dId,
      hk: eventId,
      officeIndex: office.rowIndex,
    });
  }
  if (prospectiveByOffice.size !== EXPECTED_COUNTS.prospective_events) {
    throw new Error(`Expected ${EXPECTED_COUNTS.prospective_events} prospective events`);
  }
  if (dates.length !== EXPECTED_COUNTS.research_dates || events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected 52 dates/events, found ${dates.length}/${events.length}`);
  }

  const offices: SqlRow[] = officeMeta.map((office) => {
    const next = prospectiveByOffice.get(office.officeId);
    return {
      id_namespace: N,
      office_id: office.officeId,
      country_id: COUNTRY_ID,
      geography_id: office.geographyId,
      name: `${office.jurisdiction} — ${office.officeType}`,
      office_type: office.officeType,
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: null,
      next_date_id: next?.dateId ?? null,
      next_date_resolution: next ? "resolved" : "unknown",
      next_history_key: next?.hk ?? null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, office.rowIndex),
        row: office.row,
        columns: inventory.officeRegister.table.columns,
        values: inventory.officeRegister.table.rows[office.rowIndex],
        supplemental: {
          briefing_path: unpackedPath(`Office_Briefings/Offices/${office.officeId}.html`),
          institution_scope: ENTITY_OFFICE_IDS.includes(office.officeId as (typeof ENTITY_OFFICE_IDS)[number])
            ? "entity"
            : "canton",
          calendar_qualifier: originFor(inventory.calendar, inventory, 0, "Date status"),
        },
      }),
    };
  });

  const results: SqlRow[] = [];
  const resultIndex = new Map<string, number>();
  let recordedVotes = 0;
  let recordedShares = 0;
  let recordedSeats = 0;
  let zeroSeats = 0;
  let unknownSeats = 0;
  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const row = inventory.returns.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const history = historyByHk.get(hk);
    if (!history) throw new Error(`Result row does not match a selected history: ${hk}`);
    if (cellText(row["Vote basis"]) !== cellText(history.row["Vote basis"])) {
      throw new Error(`Vote basis mismatch for ${hk}`);
    }
    const next = resultIndex.get(history.eventId) ?? 0;
    resultIndex.set(history.eventId, next + 1);
    const resultId = `${history.eventId}-r${next}`;
    const votes = numericInteger(row["Votes or marks"], `votes ${resultId}`);
    const share = numericShare(row["Share on stated basis"], `share ${resultId}`);
    const seats = numericInteger(row.Seats, `seats ${resultId}`);
    if (votes.value == null || votes.value <= 0) throw new Error(`Baseline votes must be positive (${resultId})`);
    if (share.value == null || share.value <= 0) throw new Error(`Baseline share must be positive (${resultId})`);
    recordedVotes += 1;
    recordedShares += 1;
    if (seats.value == null) unknownSeats += 1;
    else if (seats.value === 0) zeroSeats += 1;
    else recordedSeats += 1;
    const year = cellYear(row.Year);
    const candidate = row["Candidate or list"] == null ? "" : cellText(row["Candidate or list"]);
    const party = row["Party or proposer"] == null ? "" : cellText(row["Party or proposer"]);
    results.push({
      id_namespace: N,
      office_id: officeId,
      history_key: hk,
      result_row_id: resultId,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: candidate || party || null,
      original_party_label: party || null,
      original_party_code: party || null,
      party_namespace: year == null ? "unknown" : `${COUNTRY_ID}/${year}`,
      party_mapping_id: null,
      votes: votes.value,
      votes_status: votes.status,
      share: share.value,
      share_status: share.status,
      share_unit: "percent_0_100",
      seats: seats.value,
      seats_status: seats.status,
      elected_flag: null,
      is_substitute: null,
      evidence_status: "recorded",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.returns, inventory, i),
        row,
        columns: inventory.returns.table.columns,
        values: inventory.returns.table.rows[i],
      }),
    });
  }
  if (results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} result rows, found ${results.length}`);
  }
  if (
    recordedVotes !== EXPECTED_COUNTS.recorded_votes ||
    recordedShares !== EXPECTED_COUNTS.recorded_shares ||
    recordedSeats !== EXPECTED_COUNTS.recorded_seats ||
    zeroSeats !== EXPECTED_COUNTS.zero_seats ||
    unknownSeats !== EXPECTED_COUNTS.unknown_seats
  ) {
    throw new Error(`Bosnia numeric counts votes ${recordedVotes} shares ${recordedShares} seats ${recordedSeats}/${zeroSeats}/${unknownSeats}`);
  }
  if (results.some((row) => String(row.history_key).startsWith("next-"))) {
    throw new Error("Prospective events must have zero result rows");
  }

  const countryKey = addLocator({
    record_key: recordKey("country", [COUNTRY_ID]),
    entity_kind: "country",
    country_id: COUNTRY_ID,
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
    lineage_id: L,
    release_id: R,
    source_row_locator: canonical(
      locator({
        input_path: `${PACKAGE_PREFIX}/manifest.json`,
        sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/manifest.json`),
      }),
    ),
  });

  for (const geo of geographies) {
    addLocator({
      record_key: recordKey("geography", [COUNTRY_ID, geo.geography_id]),
      entity_kind: "geography",
      country_id: COUNTRY_ID,
      geography_id: geo.geography_id,
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
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(JSON.parse(String(geo.raw_json)).origin),
    });
  }
  for (const office of offices) {
    addLocator({
      record_key: recordKey("office", [N, office.office_id]),
      entity_kind: "office",
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: office.office_id,
      history_key: null,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(
        originFor(inventory.officeRegister, inventory, officeById.get(String(office.office_id))!.rowIndex),
      ),
    });
  }
  for (const event of events) {
    const historical = historyByHk.get(String(event.history_key));
    const office = officeById.get(String(event.office_id));
    addLocator({
      record_key: recordKey("event", [N, event.office_id, event.history_key]),
      entity_kind: "event",
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: event.office_id,
      history_key: event.history_key,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(
        historical
          ? originFor(inventory.histories, inventory, historical.rowIndex)
          : originFor(inventory.officeRegister, inventory, office!.rowIndex, "Next polling date"),
      ),
    });
  }
  for (const result of results) {
    addLocator({
      record_key: recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]),
      entity_kind: "result_row",
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: N,
      office_id: result.office_id,
      history_key: result.history_key,
      proceeding_id: null,
      result_row_id: result.result_row_id,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: null,
      source_id: null,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(JSON.parse(String(result.raw_json)).origin),
    });
  }
  for (const source of sources) {
    addLocator({
      record_key: recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, source.source_id]),
      entity_kind: "source",
      country_id: COUNTRY_ID,
      geography_id: null,
      id_namespace: null,
      office_id: null,
      history_key: null,
      proceeding_id: null,
      result_row_id: null,
      party_namespace: null,
      party_mapping_id: null,
      source_namespace: SOURCE_NAMESPACE,
      source_id: source.source_id,
      input_path: null,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(JSON.parse(String(source.raw_json)).origin),
    });
  }
  for (const input of retainedInputs) {
    addLocator({
      record_key: recordKey("input", [L, input.input_path]),
      entity_kind: "input",
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
      input_path: input.input_path,
      lineage_id: L,
      release_id: R,
      source_row_locator: canonical(locator({ input_path: String(input.input_path), sha256: String(input.sha256) })),
    });
  }

  const evidence: SqlRow[] = [];
  const evidenceIds = new Set<string>();
  function addEvidence(args: {
    recordKey: string;
    sourceId: string;
    loc: Locator;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }): void {
    const id = evidenceId(
      args.recordKey,
      [COUNTRY_ID, SOURCE_NAMESPACE, args.sourceId],
      occurrenceIdentity(args.loc),
      args.claimKind,
    );
    if (evidenceIds.has(id)) return;
    evidenceIds.add(id);
    evidence.push({
      evidence_id: id,
      record_key: args.recordKey,
      source_country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: args.sourceId,
      source_locator: canonical(args.loc),
      claim_kind: args.claimKind,
      date_claim_id: args.dateClaimId ?? null,
      claim_json: JSON.stringify(args.claim),
      lineage_id: L,
      release_id: R,
    });
  }

  for (const entry of historyEntries) {
    const rec = recordKey("event", [N, entry.officeId, entry.hk]);
    const urlToken = cellText(entry.row["Source URL"]);
    const urlLoc = originFor(inventory.histories, inventory, entry.rowIndex, "Source URL");
    const sourceId = resolveCitation(urlToken, rec, urlLoc, `history ${entry.hk} url`, entry.row);
    if (sourceId) {
      addEvidence({ recordKey: rec, sourceId, loc: urlLoc, claimKind: "event", claim: { token: urlToken, row: entry.row } });
      addEvidence({
        recordKey: rec,
        sourceId,
        loc: urlLoc,
        claimKind: "date",
        dateClaimId: dateId("event", entry.eventId, "ballot"),
        claim: { ballot: entry.ballot, year: entry.row.Year },
      });
    }
    if (entry.indexRow && entry.indexIndex != null) {
      const indexToken = cellText(entry.indexRow["Source URL"]);
      const indexLoc = indexOrigin(inventory.historyIndex, inventory, entry.indexIndex, "Source URL");
      const indexSource = resolveCitation(indexToken, rec, indexLoc, `history-index ${entry.hk} url`, entry.indexRow);
      if (indexSource) {
        addEvidence({
          recordKey: rec,
          sourceId: indexSource,
          loc: indexLoc,
          claimKind: "event",
          claim: { token: indexToken, row: entry.indexRow },
        });
      }
    }
  }

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const row = inventory.returns.rows[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const urlToken = cellText(row["Source URL"]);
    const urlLoc = originFor(inventory.returns, inventory, i, "Source URL");
    const sourceId = resolveCitation(urlToken, rec, urlLoc, `result ${result.result_row_id} url`, row);
    if (!sourceId) continue;
    addEvidence({
      recordKey: rec,
      sourceId,
      loc: urlLoc,
      claimKind: "result",
      claim: { token: urlToken, row },
    });
  }

  const notesScreen = cellText(notesRow?.["Screen evidence"]);
  if (notesScreen) {
    const loc = originFor(inventory.countryNotes, inventory, 0, "Screen evidence");
    const sourceId = resolveCitation(notesScreen, countryKey, loc, "country notes screen evidence", notesRow);
    if (sourceId) {
      addEvidence({
        recordKey: countryKey,
        sourceId,
        loc,
        claimKind: "calendar_context",
        claim: { token: notesScreen },
      });
    }
  }
  const coverageScreen = cellText(inventory.coverage.screen_source);
  if (coverageScreen) {
    const loc = locator({
      input_path: `${PACKAGE_PREFIX}/coverage.json`,
      sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/coverage.json`),
      json_pointer: "/screen_source",
    });
    const sourceId = resolveCitation(coverageScreen, countryKey, loc, "coverage.screen_source", inventory.coverage);
    if (sourceId) {
      addEvidence({
        recordKey: countryKey,
        sourceId,
        loc,
        claimKind: "calendar_context",
        claim: { token: coverageScreen },
      });
    }
  }

  const calInputKey = recordKey("input", [L, inventory.calendar.relativePath]);
  const calUrl = cellText(calRow["Source URL"]);
  if (calUrl) {
    const loc = originFor(inventory.calendar, inventory, 0, "Source URL");
    const sourceId = resolveCitation(calUrl, calInputKey, loc, "calendar source", calRow);
    if (sourceId) {
      addEvidence({
        recordKey: calInputKey,
        sourceId,
        loc,
        claimKind: "calendar_context",
        claim: { token: calUrl, row: calRow },
      });
    }
  }

  for (const office of officeMeta) {
    const officeRec = recordKey("office", [N, office.officeId]);
    const dateLoc = originFor(inventory.officeRegister, inventory, office.rowIndex, "Next polling date");
    const statusLoc = originFor(inventory.calendar, inventory, 0, "Date status");
    const urlLoc = originFor(inventory.calendar, inventory, 0, "Source URL");
    const sourceId = resolveCitation(calUrl, officeRec, urlLoc, `office calendar ${office.officeId}`, office.row);
    if (!sourceId) continue;
    const next = prospectiveByOffice.get(office.officeId);
    const claim = {
      office_date: office.nextDate,
      calendar_date_locator: originFor(inventory.calendar, inventory, 0, "First or scheduled date"),
      calendar_status_locator: statusLoc,
      calendar_source_locator: urlLoc,
      office_date_locator: dateLoc,
      calendar_status: CAL_EXPECTED_STATUS,
    };
    addEvidence({ recordKey: officeRec, sourceId, loc: dateLoc, claimKind: "calendar_context", claim });
    if (next) {
      const eventRec = recordKey("event", [N, office.officeId, next.hk]);
      addEvidence({ recordKey: eventRec, sourceId, loc: dateLoc, claimKind: "event", claim });
      addEvidence({
        recordKey: eventRec,
        sourceId,
        loc: dateLoc,
        claimKind: "date",
        dateClaimId: next.dateId,
        claim,
      });
    }
  }

  for (const item of inventory.tracked.filter((row) => row.input_path.endsWith(".html"))) {
    const html = item.text ?? "";
    const rec = recordKey("input", [L, item.input_path]);
    for (const anchor of htmlAnchors(html)) {
      if (!isHttpUrl(anchor.decoded)) continue;
      const loc = locator({
        input_path: item.input_path,
        sha256: item.sha256,
        html_anchor_index: anchor.index,
        ...(item.archiveEntry ? { archive_entry: item.archiveEntry } : {}),
      });
      const sourceId = resolveCitation(
        anchor.decoded,
        rec,
        loc,
        `html ${item.input_path} #${anchor.index}`,
        { href: anchor.href },
      );
      if (!sourceId) continue;
      addEvidence({
        recordKey: rec,
        sourceId,
        loc,
        claimKind: "artifact_reference",
        claim: { href: anchor.href, decoded: anchor.decoded, html_anchor_index: anchor.index },
      });
    }
  }

  const crosswalks: SqlRow[] = [];
  const crosswalkKeys = new Set<string>();
  function addCrosswalk(row: SqlRow): void {
    const pk = `${row.entity_kind}\0${row.upstream_namespace}\0${row.upstream_id}`;
    if (crosswalkKeys.has(pk)) {
      const existing = crosswalks.find(
        (item) =>
          item.entity_kind === row.entity_kind &&
          item.upstream_namespace === row.upstream_namespace &&
          item.upstream_id === row.upstream_id,
      );
      if (existing && existing.record_key !== row.record_key) {
        throw new Error(`Ambiguous crosswalk ${pk}`);
      }
      return;
    }
    if (looksLikeBrcko(String(row.upstream_id))) {
      throw new Error("Brčko token cannot be an alias");
    }
    crosswalkKeys.add(pk);
    crosswalks.push(row);
  }

  addCrosswalk({
    entity_kind: "country",
    upstream_namespace: "observatory:bosnia-and-herzegovina",
    upstream_id: COUNTRY_ID,
    record_key: countryKey,
    reason: "proposed_bridge_compatible_id",
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: locator({
        input_path: `${PACKAGE_PREFIX}/manifest.json`,
        sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/manifest.json`),
      }),
      row: { country_id: COUNTRY_ID },
    }),
  });

  for (const office of offices) {
    const rec = recordKey("office", [N, office.office_id]);
    const origin = originFor(inventory.officeRegister, inventory, officeById.get(String(office.office_id))!.rowIndex);
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "bosnia-and-herzegovina:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "bosnia-and-herzegovina:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id, geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "bosnia-and-herzegovina:briefing",
      upstream_id: `${office.office_id}.html`,
      record_key: recordKey("input", [L, unpackedPath(`Office_Briefings/Offices/${office.office_id}.html`)]),
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: unpackedPath(`Office_Briefings/Offices/${office.office_id}.html`),
          sha256: sliceHash(inventory, unpackedPath(`Office_Briefings/Offices/${office.office_id}.html`)),
          archive_entry: `Office_Briefings/Offices/${office.office_id}.html`,
        }),
        row: { office_id: office.office_id },
      }),
    });
  }

  for (const event of events) {
    const rec = recordKey("event", [N, event.office_id, event.history_key]);
    const historical = historyByHk.get(String(event.history_key));
    const origin = historical
      ? originFor(inventory.histories, inventory, historical.rowIndex)
      : originFor(inventory.officeRegister, inventory, officeById.get(String(event.office_id))!.rowIndex, "Next polling date");
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "bosnia-and-herzegovina:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { history_key: event.history_key } }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: event.event_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { event_id: event.event_id } }),
    });
  }

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const row = inventory.returns.rows[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const origin = originFor(inventory.returns, inventory, i);
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { result_row_id: result.result_row_id } }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "bosnia-and-herzegovina:baseline-result-row",
      upstream_id: canonical([
        inventory.returns.relativePath,
        inventory.returns.table.sheet,
        inventory.returns.table.source_rows[i],
      ]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "bosnia-and-herzegovina:result-identity",
      upstream_id: canonical([
        N,
        result.office_id,
        result.history_key,
        row["Electoral unit"] ?? null,
        row["Candidate or list"] ?? null,
        row["Party or proposer"] ?? null,
      ]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
  }

  for (const [originalId, info] of catalogueById) {
    const sourceId = info.sourceId;
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bosnia-and-herzegovina:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.masterSources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: sourceId,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.masterSources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bosnia-and-herzegovina:source-url",
      upstream_id: info.url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.masterSources, inventory, info.index, "Source URL"),
        row: info.row,
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: urlSourceId(info.url),
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.masterSources, inventory, info.index, "Source URL"),
        row: { url: info.url, alias: urlSourceId(info.url) },
      }),
    });
  }
  for (const url of inlineUrls) {
    const sourceId = urlSourceId(url);
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    const origin =
      url === SCREENING_URL
        ? originFor(inventory.countryNotes, inventory, 0, "Screen evidence")
        : originFor(inventory.calendar, inventory, 0, "Source URL");
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bosnia-and-herzegovina:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { url } }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bosnia-and-herzegovina",
      upstream_id: sourceId,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { url, source_id: sourceId } }),
    });
  }

  const officeBriefings = inventory.tracked.filter(
    (item) =>
      item.input_path.startsWith(`${UNPACKED_PREFIX}/Office_Briefings/Offices/`) && item.input_path.endsWith(".html"),
  ).length;
  const countryBriefings = inventory.tracked.filter(
    (item) => item.input_path === `${UNPACKED_PREFIX}/Office_Briefings/bosnia_and_herzegovina.html`,
  ).length;
  if (
    officeBriefings !== EXPECTED_COUNTS.office_briefings_retained ||
    countryBriefings !== EXPECTED_COUNTS.country_briefings_retained
  ) {
    throw new Error(`Expected 13 office + 1 country briefings, found ${officeBriefings}/${countryBriefings}`);
  }

  const approvedTiers = tiers.filter((row) => row.review_status === "approved").length;
  const needsReviewTiers = tiers.filter((row) => row.review_status === "needs_review").length;
  const validatedCounts = {
    current_offices: offices.length,
    historical_offices: 0,
    geographies: geographies.length,
    entity_offices: entity,
    cantonal_assembly_offices: cantonal,
    selected_histories: historyEntries.length,
    prospective_events: prospectiveByOffice.size,
    total_events: events.length,
    research_dates: dates.length,
    historical_dates_year: dates.filter((row) => row.precision === "year").length,
    prospective_dates_day_expected: dates.filter((row) => row.precision === "day" && row.certainty === "expected").length,
    result_rows: results.length,
    recorded_votes: recordedVotes,
    recorded_shares: recordedShares,
    recorded_seats: recordedSeats,
    zero_seats: zeroSeats,
    unknown_seats: unknownSeats,
    source_catalogue_rows: EXPECTED_COUNTS.source_catalogue_rows,
    inline_only_sources: EXPECTED_COUNTS.inline_only_sources,
    sources: sources.length,
    office_briefings_retained: officeBriefings,
    country_briefings_retained: countryBriefings,
    municipal_offices: tiers.filter((row) => row.tier === "municipal").length,
    regional_offices: tiers.filter((row) => row.tier === "regional").length,
    approved_classifications: approvedTiers,
    needs_review_classifications: needsReviewTiers,
    poll_records_supplied: 0,
    control_observations_supplied: 0,
    proceedings: 0,
    party_mappings: 0,
    outer_package_files: EXPECTED_COUNTS.outer_package_files,
    payload_member_files: EXPECTED_COUNTS.payload_member_files,
    retained_inputs: retainedInputs.length,
  };
  if (validatedCounts.regional_offices !== 13 || validatedCounts.municipal_offices !== 0) {
    throw new Error("Bosnia and Herzegovina must have 13 regional and 0 municipal offices");
  }
  if (validatedCounts.approved_classifications !== 10 || validatedCounts.needs_review_classifications !== 3) {
    throw new Error("Entity focused-review flags must remain needs_review after geographic approval");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Bosnia and Herzegovina frozen country package",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: inventory.hashInputs.adapter_version,
      method_version: inventory.hashInputs.method_version,
      schema_version: inventory.hashInputs.schema_version,
      research_snapshot_label: inventory.manifest.research_snapshot,
      upstream_release_id: L,
      validated_counts_json: canonical(validatedCounts),
      research_coverage_complete: 0,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: `${PACKAGE_PREFIX}/manifest.json`,
          sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/manifest.json`),
        }),
        row: inventory.manifest,
        supplemental: { coverage: inventory.coverage },
      }),
    },
    publicationRelease: { lineage_id: L, release_id: R },
    retainedInputs,
    country,
    geographies,
    offices,
    tiers,
    dates,
    events,
    sources,
    results,
    locators,
    evidence,
    unresolved,
    crosswalks,
    validatedCounts,
  };
}
