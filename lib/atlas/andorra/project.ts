import type { TableRow } from "../../observatory/adapters/tables";
import { key } from "../../../scripts/import/normalize";
import type { AndorraInventory, WorkbookSlice } from "./inventory";
import {
  COUNTRY_ID,
  EXPECTED_COUNTS,
  EXPECTED_GEOGRAPHIES,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
  OFFICE_TYPE,
  PACKAGE_PREFIX,
  SOURCE_NAMESPACE,
  TIER_PATH,
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
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  unresolvedId,
  urlSourceId,
  type Locator,
} from "./identity";

export type SqlRow = Record<string, unknown>;

export type AndorraProjection = {
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

function sliceHash(inventory: AndorraInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: AndorraInventory,
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
  });
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

function ballotBasis(value: unknown): string {
  if (cellText(value) !== "Valid candidate/list votes") {
    throw new Error(`Andorra baseline vote basis must be Valid candidate/list votes, got ${JSON.stringify(value)}`);
  }
  return "valid_votes";
}

function evidenceStatus(coverage: unknown, votes: unknown, share: unknown): string {
  const text = cellText(coverage).toLowerCase();
  if (text.includes("preliminary") || text.includes("provisional")) return "preliminary";
  if (votes != null || share != null) return "recorded";
  return "unknown";
}

function mapTier(raw: string): string | null {
  if (raw === "municipal") return "municipal";
  if (raw === "regional") return "regional";
  if (raw === "other") return "other";
  if (raw === "national") return "national_context";
  if (raw === "unknown") return null;
  throw new Error(`Unsupported classification tier ${JSON.stringify(raw)}`);
}

function briefingHeadings(html: string): Array<{ date: string; label: string; index: number; text: string }> {
  const headings: Array<{ date: string; label: string; index: number; text: string }> = [];
  const re = /<h3>([^<]+)<\/h3>/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html))) {
    const text = match[1]!;
    const split = text.split(" — ");
    if (split.length >= 2) {
      headings.push({ date: split[0]!.trim(), label: split.slice(1).join(" — ").trim(), index, text });
    }
    index += 1;
  }
  return headings;
}

function htmlAnchors(html: string): Array<{ href: string; index: number }> {
  const anchors: Array<{ href: string; index: number }> = [];
  const re = /<a\s+href="([^"]+)"/gi;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html))) {
    anchors.push({ href: match[1]!, index });
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
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function unresolvedReason(token: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(token) && !isHttpUrl(token)) return "invalid_url";
  return "unmatched_catalogue_token";
}

function originCanonical(rawJson: unknown): string | null {
  const parsed = JSON.parse(String(rawJson)) as { origin?: Locator };
  return parsed.origin ? canonical(parsed.origin) : null;
}

export function projectAndorra(inventory: AndorraInventory): AndorraProjection {
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

  if (
    retainedInputs.filter((row) => String(row.input_kind) === "package" || String(row.input_kind) === "artifact")
      .length !== EXPECTED_COUNTS.package_files_retained
  ) {
    throw new Error(`Retained package/artifact count must be ${EXPECTED_COUNTS.package_files_retained}`);
  }

  const notesRow = inventory.countryNotes.rows[0];
  const countryLocator = originFor(inventory.countryNotes, inventory, 0);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: inventory.manifest.country_code,
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
  const offices: SqlRow[] = [];
  const officeById = new Map<string, { geographyId: string; rowIndex: number; row: TableRow }>();
  const geoSeen = new Set<string>();

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    if (cellText(row.Country) !== "Andorra") {
      throw new Error(`Office ${officeId} country is not Andorra`);
    }
    if (officeType !== OFFICE_TYPE) {
      throw new Error(`Unexpected office type ${officeType}`);
    }
    const geographyId = geographyIdFor(jurisdiction, officeType);
    const expected = EXPECTED_GEOGRAPHIES[officeId];
    if (!expected) throw new Error(`Unexpected Andorra office ${officeId}`);
    if (expected.jurisdiction !== jurisdiction || expected.geographyId !== geographyId) {
      throw new Error(`Geography binding mismatch for ${officeId}`);
    }
    if (row["Next polling date"] != null && cellText(row["Next polling date"]) !== "") {
      throw new Error(`Andorra baseline next date must be null for ${officeId}`);
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
        }),
      });
    }
    officeById.set(officeId, { geographyId, rowIndex: i, row });
    offices.push({
      id_namespace: N,
      office_id: officeId,
      country_id: COUNTRY_ID,
      geography_id: geographyId,
      name: `${jurisdiction} — ${officeType}`,
      office_type: officeType,
      office_status: "current",
      record_state: "active",
      state_note: null,
      registry_qualified: null,
      next_date_id: null,
      next_date_resolution: "unknown",
      next_history_key: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, i),
        row,
        columns: inventory.officeRegister.table.columns,
        values: inventory.officeRegister.table.rows[i],
      }),
    });
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} geographies, found ${geographies.length}`);
  }

  const registerIds = new Set(offices.map((row) => String(row.office_id)));
  const classifications = inventory.tiers.classifications;
  if (classifications.length !== EXPECTED_COUNTS.municipal_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.municipal_offices} classifications, found ${classifications.length}`);
  }
  const classIds = new Set(classifications.map((row) => row.office_id));
  for (const id of registerIds) {
    if (!classIds.has(id)) throw new Error(`Classification missing office ${id}`);
  }
  for (const id of classIds) {
    if (!registerIds.has(id)) throw new Error(`Classification extra office ${id}`);
  }

  const tierSha = inventory.byPath.get(TIER_PATH)!.sha256;
  const tiers: SqlRow[] = classifications.map((row, index) => {
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
        origin: locator({ input_path: TIER_PATH, sha256: tierSha, json_pointer: `/classifications/${index}` }),
        row,
      }),
    };
  });
  if (tiers.some((row) => row.tier !== "municipal" || row.review_status !== "approved")) {
    throw new Error("All 7 Andorra offices must be approved municipal");
  }

  const catalogueById = new Map<string, { sourceId: string; row: TableRow; index: number }>();
  const catalogueByUrl = new Map<string, string>();
  const sources: SqlRow[] = [];
  for (let i = 0; i < inventory.sources.rows.length; i++) {
    const row = inventory.sources.rows[i]!;
    const originalId = cellText(row["Source ID"]);
    const url = cellText(row["Source URL"]);
    if (!originalId || !isHttpUrl(url)) {
      throw new Error(`Catalogue row ${i} missing Source ID or HTTP URL`);
    }
    if (catalogueById.has(originalId) || catalogueByUrl.has(url)) {
      throw new Error(`Duplicate catalogue source ${originalId}`);
    }
    const sourceId = catalogueSourceId(originalId);
    rejectFixtures([sourceId, originalId], "source catalogue");
    catalogueById.set(originalId, { sourceId, row, index: i });
    catalogueByUrl.set(url, sourceId);
    sources.push({
      country_id: COUNTRY_ID,
      source_namespace: SOURCE_NAMESPACE,
      source_id: sourceId,
      publisher: null,
      title: cellText(row.Title) || null,
      url,
      checked_as_of_label: cellText(row.Accessed) || null,
      evidence_grade: cellText(row["Evidence grade"]) || null,
      file_sha256: null,
      locator: null,
      data_rights: "unknown",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.sources, inventory, i),
        row,
        columns: inventory.sources.table.columns,
        values: inventory.sources.table.rows[i],
      }),
    });
  }
  if (inventory.sources.rows.length !== EXPECTED_COUNTS.source_catalogue_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.source_catalogue_rows} catalogue sources`);
  }

  const inlineUrls = inventory.sourceLinks.urls_without_master_source_row;
  if (inlineUrls.length !== EXPECTED_COUNTS.inline_only_sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.inline_only_sources} inline-only URLs, found ${inlineUrls.length}`);
  }
  for (const url of inlineUrls) {
    if (catalogueByUrl.has(url)) {
      throw new Error(`Inline-only URL unexpectedly present in catalogue: ${url}`);
    }
    const sourceId = urlSourceId(url);
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
        origin: locator({
          input_path: `${PACKAGE_PREFIX}/source-links.json`,
          sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/source-links.json`),
          json_pointer: "/urls_without_master_source_row",
        }),
        row: { url },
        supplemental: { inline_only: true },
      }),
    });
    catalogueByUrl.set(url, sourceId);
  }
  if (sources.length !== EXPECTED_COUNTS.sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.sources} sources, found ${sources.length}`);
  }

  function resolveCitation(token: string): string | null {
    if (!token) return null;
    if (catalogueById.has(token)) return catalogueById.get(token)!.sourceId;
    if (catalogueByUrl.has(token)) return catalogueByUrl.get(token)!;
    return null;
  }

  const historyEntries: Array<{
    slice: WorkbookSlice;
    rowIndex: number;
    row: TableRow;
    officeId: string;
    hk: string;
    eventId: string;
    ballot: string;
    dateLabel: string;
  }> = [];
  const historyByHk = new Map<string, (typeof historyEntries)[number]>();
  for (let i = 0; i < inventory.history.rows.length; i++) {
    const row = inventory.history.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (!officeById.has(officeId)) throw new Error(`History office ${officeId} missing from register`);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const eventPublicId = eventIdFor(hk);
    rejectFixtures([officeId, eventPublicId, hk], "history");
    const ballot = cellText(row["Ballot date if recorded"]);
    const parsed = researchDateFromHistory(ballot, row.Year);
    const entry = {
      slice: inventory.history,
      rowIndex: i,
      row,
      officeId,
      hk,
      eventId: eventPublicId,
      ballot,
      dateLabel: parsed.label,
    };
    if (historyByHk.has(hk)) throw new Error(`Duplicate history key ${hk}`);
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
  }
  if (historyEntries.length !== EXPECTED_COUNTS.selected_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.selected_histories} selected histories, found ${historyEntries.length}`);
  }
  const historiesPerOffice = new Map<string, number>();
  for (const entry of historyEntries) {
    historiesPerOffice.set(entry.officeId, (historiesPerOffice.get(entry.officeId) ?? 0) + 1);
  }
  for (const officeId of registerIds) {
    if (historiesPerOffice.get(officeId) !== 3) {
      throw new Error(`Office ${officeId} must have exactly three selected histories`);
    }
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  let dayDates = 0;
  let yearDates = 0;
  for (const entry of historyEntries) {
    const parsed = researchDateFromHistory(entry.ballot, entry.row.Year);
    if (parsed.precision === "day") dayDates += 1;
    else if (parsed.precision === "year") yearDates += 1;
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
        origin: originFor(entry.slice, inventory, entry.rowIndex, "Ballot date if recorded"),
        row: { ballot: entry.row["Ballot date if recorded"], year: entry.row.Year },
      }),
    });
    const briefingPath = `${PACKAGE_PREFIX}/briefings/${entry.officeId}.html`;
    const briefing = inventory.byPath.get(briefingPath);
    if (!briefing?.text) throw new Error(`Missing briefing ${briefingPath}`);
    const matches = briefingHeadings(briefing.text).filter((heading) => heading.date === entry.dateLabel);
    if (matches.length !== 1) {
      throw new Error(`Expected unique briefing h3 for ${entry.officeId} ${entry.dateLabel}`);
    }
    if (matches[0]!.label !== "Ordinary election") {
      throw new Error(`Andorra baseline heading must be Ordinary election for ${entry.hk}`);
    }
    events.push({
      id_namespace: N,
      office_id: entry.officeId,
      history_key: entry.hk,
      event_id: entry.eventId,
      date_id: dId,
      date_resolution: parsed.precision === "unknown" ? "unknown" : "resolved",
      event_kind: "ordinary",
      selected_history_role: "selected",
      electoral_system: null,
      comparability: comparability(entry.row),
      ballot_basis: ballotBasis(entry.row["Vote basis"]),
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(entry.slice, inventory, entry.rowIndex),
        row: entry.row,
        columns: entry.slice.table.columns,
        values: entry.slice.table.rows[entry.rowIndex],
        supplemental: { briefing_h3: matches[0], briefing_path: briefingPath },
      }),
    });
  }
  if (dayDates !== 7 || yearDates !== 14) {
    throw new Error(`Expected 7 day + 14 year dates, found ${dayDates}/${yearDates}`);
  }

  const results: SqlRow[] = [];
  const resultIndex = new Map<string, number>();
  const semanticBindings = new Set<string>();
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
    const year = cellYear(row.Year);
    const semantic = canonical([
      N,
      officeId,
      hk,
      row["Electoral unit"] ?? null,
      row["Candidate or list"] ?? null,
      row["Party or proposer"] ?? null,
    ]);
    if (semanticBindings.has(semantic)) {
      throw new Error(`Duplicate semantic result binding ${semantic}`);
    }
    semanticBindings.add(semantic);
    results.push({
      id_namespace: N,
      office_id: officeId,
      history_key: hk,
      result_row_id: resultId,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: cellText(row["Candidate or list"]) || null,
      original_party_label: row["Party or proposer"] == null ? null : cellText(row["Party or proposer"]),
      original_party_code: row["Party or proposer"] == null ? null : cellText(row["Party or proposer"]),
      party_namespace: year == null ? "unknown" : `andorra/${year}`,
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
      evidence_status: evidenceStatus(row["Result coverage"], row["Votes or marks"], row["Share on stated basis"]),
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

  const locators: SqlRow[] = [];
  const locatorKeys = new Set<string>();
  function addLocator(row: SqlRow): string {
    const rec = String(row.record_key);
    if (locatorKeys.has(rec)) return rec;
    locatorKeys.add(rec);
    locators.push(row);
    return rec;
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
      source_row_locator: originCanonical(geo.raw_json),
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
        originFor(historyByHk.get(String(event.history_key))!.slice, inventory, historyByHk.get(String(event.history_key))!.rowIndex),
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
      source_row_locator: originCanonical(result.raw_json),
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
      source_row_locator: originCanonical(source.raw_json),
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
  const unresolved: SqlRow[] = [];
  const unresolvedIds = new Set<string>();

  function addEvidence(args: {
    recordKey: string;
    sourceId: string;
    loc: Locator;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }): void {
    const id = evidenceId(args.recordKey, [COUNTRY_ID, SOURCE_NAMESPACE, args.sourceId], occurrenceIdentity(args.loc), args.claimKind);
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

  function addUnresolved(args: { recordKey: string; token: string; loc: Locator; claim: unknown }): void {
    const id = unresolvedId(args.recordKey, occurrenceIdentity(args.loc), args.token);
    if (unresolvedIds.has(id)) return;
    unresolvedIds.add(id);
    unresolved.push({
      unresolved_id: id,
      record_key: args.recordKey,
      original_token: args.token,
      source_locator: canonical(args.loc),
      reason: unresolvedReason(args.token),
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: args.loc, row: args.claim }),
    });
  }

  function cite(args: {
    token: string;
    recordKey: string;
    loc: Locator;
    claimKind: string;
    dateClaimId?: string | null;
    claim: unknown;
  }): void {
    if (!args.token) return;
    const sourceId = resolveCitation(args.token);
    if (sourceId) {
      addEvidence({
        recordKey: args.recordKey,
        sourceId,
        loc: args.loc,
        claimKind: args.claimKind,
        dateClaimId: args.dateClaimId,
        claim: args.claim,
      });
      return;
    }
    addUnresolved({ recordKey: args.recordKey, token: args.token, loc: args.loc, claim: args.claim });
  }

  for (const entry of historyEntries) {
    const url = cellText(entry.row["Source URL"]);
    const rec = recordKey("event", [N, entry.officeId, entry.hk]);
    const loc = originFor(entry.slice, inventory, entry.rowIndex, "Source URL");
    cite({ token: url, recordKey: rec, loc, claimKind: "history", claim: { token: url, row: entry.row } });
    cite({
      token: url,
      recordKey: rec,
      loc,
      claimKind: "date",
      dateClaimId: dateId("event", entry.eventId, "ballot"),
      claim: { ballot: entry.ballot, year: entry.row.Year },
    });
  }

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const url = cellText(inventory.returns.rows[i]!["Source URL"]);
    cite({
      token: url,
      recordKey: recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]),
      loc: originFor(inventory.returns, inventory, i, "Source URL"),
      claimKind: "result",
      claim: { token: url, row: inventory.returns.rows[i] },
    });
  }

  const notesScreen = cellText(notesRow?.["Screen evidence"]);
  if (notesScreen) {
    cite({
      token: notesScreen,
      recordKey: countryKey,
      loc: originFor(inventory.countryNotes, inventory, 0, "Screen evidence"),
      claimKind: "calendar_context",
      claim: { token: notesScreen },
    });
  }
  const coverageScreen = cellText(inventory.coverage.screen_source);
  if (coverageScreen) {
    cite({
      token: coverageScreen,
      recordKey: countryKey,
      loc: locator({
        input_path: `${PACKAGE_PREFIX}/coverage.json`,
        sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/coverage.json`),
        json_pointer: "/screen_source",
      }),
      claimKind: "calendar_context",
      claim: { token: coverageScreen },
    });
  }

  const calInputKey = recordKey("input", [L, inventory.calendar.relativePath]);
  for (let i = 0; i < inventory.calendar.rows.length; i++) {
    const url = cellText(inventory.calendar.rows[i]!["Source URL"]);
    if (!url) continue;
    cite({
      token: url,
      recordKey: calInputKey,
      loc: originFor(inventory.calendar, inventory, i, "Source URL"),
      claimKind: "calendar_context",
      claim: { token: url, row: inventory.calendar.rows[i] },
    });
  }

  for (let i = 0; i < inventory.officeRegister.rows.length; i++) {
    const token = cellText(inventory.officeRegister.rows[i]!["Calendar evidence"]);
    if (!token) continue;
    cite({
      token,
      recordKey: recordKey("office", [N, cellText(inventory.officeRegister.rows[i]!["Office ID"])]),
      loc: originFor(inventory.officeRegister, inventory, i, "Calendar evidence"),
      claimKind: "calendar_context",
      claim: { token, row: inventory.officeRegister.rows[i] },
    });
  }

  const controlInputKey = recordKey("input", [L, inventory.control.relativePath]);
  if (inventory.control.rows.length !== EXPECTED_COUNTS.control_observations_retained) {
    throw new Error(`Expected ${EXPECTED_COUNTS.control_observations_retained} control rows`);
  }
  for (let i = 0; i < inventory.control.rows.length; i++) {
    const row = inventory.control.rows[i]!;
    const controlUrl = cellText(row["Control source"]);
    const pollUrl = cellText(row["Poll source"]);
    if (controlUrl) {
      cite({
        token: controlUrl,
        recordKey: controlInputKey,
        loc: originFor(inventory.control, inventory, i, "Control source"),
        claimKind: "control_observation",
        claim: { token: controlUrl, row },
      });
    }
    if (pollUrl) {
      cite({
        token: pollUrl,
        recordKey: controlInputKey,
        loc: originFor(inventory.control, inventory, i, "Poll source"),
        claimKind: "national_poll",
        claim: { token: pollUrl, row },
      });
    }
  }

  const pollInputKey = recordKey("input", [L, inventory.poll.relativePath]);
  if (inventory.poll.rows.length !== EXPECTED_COUNTS.national_polls_retained) {
    throw new Error(`Expected 1 poll row`);
  }
  const pollRow = inventory.poll.rows[0]!;
  cite({
    token: cellText(pollRow["Source URL"]),
    recordKey: pollInputKey,
    loc: originFor(inventory.poll, inventory, 0, "Source URL"),
    claimKind: "national_poll",
    claim: { token: cellText(pollRow["Source URL"]), row: pollRow },
  });

  for (const item of inventory.tracked.filter((row) => row.input_path.endsWith(".html"))) {
    const html = item.text ?? "";
    const rec = recordKey("input", [L, item.input_path]);
    for (const anchor of htmlAnchors(html)) {
      if (!isHttpUrl(anchor.href)) continue;
      cite({
        token: anchor.href,
        recordKey: rec,
        loc: locator({
          input_path: item.input_path,
          sha256: item.sha256,
          html_anchor_index: anchor.index,
        }),
        claimKind: "artifact_reference",
        claim: { href: anchor.href, html_anchor_index: anchor.index },
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
    crosswalkKeys.add(pk);
    crosswalks.push(row);
  }

  addCrosswalk({
    entity_kind: "country",
    upstream_namespace: "observatory:andorra",
    upstream_id: "andorra",
    record_key: countryKey,
    reason: "preserved_bridge_id",
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
    const officeOrigin = originFor(inventory.officeRegister, inventory, officeById.get(String(office.office_id))!.rowIndex);
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "andorra:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: officeOrigin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:andorra",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: officeOrigin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "andorra:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: officeOrigin,
        row: { office_id: office.office_id, geography_id: office.geography_id },
      }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:andorra",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: officeOrigin, row: { geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "andorra:briefing",
      upstream_id: `${office.office_id}.html`,
      record_key: recordKey("input", [L, `${PACKAGE_PREFIX}/briefings/${office.office_id}.html`]),
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: `${PACKAGE_PREFIX}/briefings/${office.office_id}.html`,
          sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/briefings/${office.office_id}.html`),
        }),
        row: { office_id: office.office_id },
      }),
    });
  }

  for (const event of events) {
    const rec = recordKey("event", [N, event.office_id, event.history_key]);
    const history = historyByHk.get(String(event.history_key))!;
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "andorra:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(history.slice, inventory, history.rowIndex),
        row: { history_key: event.history_key },
      }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:andorra",
      upstream_id: event.event_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(history.slice, inventory, history.rowIndex),
        row: { event_id: event.event_id },
      }),
    });
  }

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const row = inventory.returns.rows[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "observatory:andorra",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.returns, inventory, i),
        row: { result_row_id: result.result_row_id },
      }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "andorra:baseline-result-row",
      upstream_id: canonical([inventory.returns.relativePath, inventory.returns.table.sheet, inventory.returns.table.source_rows[i]]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.returns, inventory, i), row }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "andorra:result-identity",
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
      raw_json: rawEnvelope({ origin: originFor(inventory.returns, inventory, i), row }),
    });
  }

  for (const [originalId, info] of catalogueById) {
    const sourceId = info.sourceId;
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    const url = cellText(info.row["Source URL"]);
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "andorra:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:andorra",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "andorra:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index, "Source URL"), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:andorra",
      upstream_id: urlSourceId(url),
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.sources, inventory, info.index, "Source URL"),
        row: { url, alias: urlSourceId(url) },
      }),
    });
  }
  for (const url of inlineUrls) {
    const sourceId = urlSourceId(url);
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "andorra:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: `${PACKAGE_PREFIX}/source-links.json`,
          sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/source-links.json`),
        }),
        row: { url },
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:andorra",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: `${PACKAGE_PREFIX}/source-links.json`,
          sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/source-links.json`),
        }),
        row: { url, source_id: sourceId },
      }),
    });
  }

  for (let i = 0; i < inventory.control.rows.length; i++) {
    const row = inventory.control.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const alias = key("person-observation", [officeId, row["Source date"], row["Reported current control"]]);
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "observatory:andorra:dated_governing_control",
      upstream_id: alias,
      record_key: controlInputKey,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.control, inventory, i),
        row,
        columns: inventory.control.table.columns,
        values: inventory.control.table.rows[i],
        supplemental: { original_entity_type: "dated_governing_control" },
      }),
    });
  }
  addCrosswalk({
    entity_kind: "input",
    upstream_namespace: "observatory:andorra:poll",
    upstream_id: key("poll", ["andorra", pollRow.Pollster, pollRow["Publication date"]]),
    record_key: pollInputKey,
    reason: "preserved_bridge_id",
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: originFor(inventory.poll, inventory, 0),
      row: pollRow,
      columns: inventory.poll.table.columns,
      values: inventory.poll.table.rows[0],
      supplemental: { original_entity_type: "poll" },
    }),
  });

  const briefingCount = inventory.tracked.filter(
    (item) => item.input_path.startsWith(`${PACKAGE_PREFIX}/briefings/`) && item.input_path.endsWith(".html"),
  ).length;
  if (briefingCount !== EXPECTED_COUNTS.briefings_retained) {
    throw new Error(`Expected ${EXPECTED_COUNTS.briefings_retained} briefings`);
  }

  const validatedCounts = {
    current_offices: offices.length,
    historical_offices: 0,
    geographies: geographies.length,
    selected_histories: events.length,
    result_rows: results.length,
    control_observations_retained: inventory.control.rows.length,
    national_polls_retained: inventory.poll.rows.length,
    source_catalogue_rows: EXPECTED_COUNTS.source_catalogue_rows,
    inline_only_sources: EXPECTED_COUNTS.inline_only_sources,
    sources: sources.length,
    briefings_retained: briefingCount,
    municipal_offices: tiers.filter((row) => row.tier === "municipal").length,
    regional_offices: tiers.filter((row) => row.tier === "regional").length,
    proceedings: 0,
    party_mappings: 0,
    package_files_retained: EXPECTED_COUNTS.package_files_retained,
  };
  if (validatedCounts.regional_offices !== 0) {
    throw new Error("Andorra regional offices must be 0");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Andorra frozen country package",
    },
    release: {
      lineage_id: L,
      release_id: R,
      fingerprint_sha256: inventory.fingerprint,
      hash_inputs_json: inventory.hashInputsJson,
      adapter_version: inventory.hashInputs.adapter_version,
      method_version: inventory.hashInputs.method_version,
      schema_version: inventory.hashInputs.schema_version,
      research_snapshot_label: inventory.manifest.research_checked_through,
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
