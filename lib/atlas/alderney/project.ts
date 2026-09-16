import type { TableRow } from "../../observatory/adapters/tables";
import type { AlderneyInventory, WorkbookSlice } from "./inventory";
import {
  CALENDAR_STATUS,
  CANDIDATE_MARKS_BASIS,
  COUNTRY_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
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
  nextEventIdFor,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  unresolvedId,
  urlSourceId,
  type Locator,
} from "./identity";

export type SqlRow = Record<string, unknown>;

export type AlderneyProjection = {
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

function sliceHash(inventory: AlderneyInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: AlderneyInventory,
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
  if (cellText(value) !== CANDIDATE_MARKS_BASIS) {
    throw new Error(`Alderney baseline vote basis must be candidate marks, got ${JSON.stringify(value)}`);
  }
  return "candidate_marks";
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

function eventKindFromHeading(label: string): "ordinary" | "special" {
  if (label === "Ordinary partial renewal") return "ordinary";
  if (label === "Replacement election") return "special";
  throw new Error(`Unrecognized Alderney briefing heading label ${JSON.stringify(label)}`);
}

function recordedHistoricalHeadings(
  html: string,
): Array<{ date: string; label: string; index: number; text: string; section: string }> {
  const headings: Array<{ date: string; label: string; index: number; text: string; start: number }> = [];
  const re = /<h3>([^<]+)<\/h3>/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = re.exec(html))) {
    const text = match[1]!;
    const split = text.split(" — ");
    if (split.length >= 2) {
      headings.push({
        date: split[0]!.trim(),
        label: split.slice(1).join(" — ").trim(),
        index,
        text,
        start: match.index,
      });
    }
    index += 1;
  }

  const marker = "<h2>Recorded historical entries</h2>";
  const h2 = html.indexOf(marker);
  if (h2 < 0) throw new Error("Missing Recorded historical entries heading");
  const after = h2 + marker.length;
  const nextH2Rel = html.slice(after).search(/<h2[\s>]/i);
  const sectionEnd = nextH2Rel >= 0 ? after + nextH2Rel : html.length;

  let excludeStart = Number.POSITIVE_INFINITY;
  let excludeEnd = Number.POSITIVE_INFINITY;
  const extra = html.indexOf("<summary>Additional ordinary-cycle context</summary>");
  if (extra >= 0) {
    const detailsOpen = html.lastIndexOf("<details>", extra);
    const detailsClose = html.indexOf("</details>", extra);
    if (detailsOpen >= 0 && detailsClose >= 0) {
      excludeStart = detailsOpen;
      excludeEnd = detailsClose + "</details>".length;
    }
  }

  return headings
    .filter((heading) => {
      if (heading.start < after || heading.start >= sectionEnd) return false;
      if (heading.start >= excludeStart && heading.start < excludeEnd) return false;
      return true;
    })
    .map(({ date, label, index, text }) => ({
      date,
      label,
      index,
      text,
      section: "Recorded historical entries",
    }));
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
    if (isFixtureId(value)) {
      throw new Error(`Fixture ID ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

export function projectAlderney(inventory: AlderneyInventory): AlderneyProjection {
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
  if (
    retainedInputs.some(
      (row) =>
        String(row.input_path).endsWith("tables/governing-control.json") ||
        String(row.input_path).endsWith("tables/polling-evidence.json"),
    )
  ) {
    throw new Error("Alderney must not fabricate polling or governing-control retained inputs");
  }

  const notesRow = inventory.countryNotes.rows[0];
  const countryLocator = originFor(inventory.countryNotes, inventory, 0);
  const country: SqlRow = {
    country_id: COUNTRY_ID,
    country_code: inventory.manifest.country_code,
    name: inventory.manifest.country,
    polity_kind: "territory",
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

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    const expected = EXPECTED_OFFICES[officeId];
    if (!expected) throw new Error(`Unexpected Alderney office ${officeId}`);
    if (cellText(row.Country) !== "Alderney") {
      throw new Error(`Office ${officeId} country is not Alderney`);
    }
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    if (jurisdiction !== expected.jurisdiction || officeType !== expected.officeType) {
      throw new Error(`Office ${officeId} jurisdiction/type mismatch`);
    }
    const geographyId = geographyIdFor(jurisdiction, officeType);
    if (geographyId !== expected.geographyId) {
      throw new Error(`Office ${officeId} geography ${geographyId} != ${expected.geographyId}`);
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
    const nextDate = cellText(row["Next polling date"]);
    if (nextDate !== expected.nextDate) {
      throw new Error(`Office ${officeId} next date ${nextDate} != ${expected.nextDate}`);
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

  const registerIds = new Set(officeMeta.map((row) => row.officeId));
  const classifications = inventory.tiers.classifications;
  if (classifications.length !== EXPECTED_COUNTS.current_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.current_offices} classifications, found ${classifications.length}`);
  }
  const classIds = new Set(classifications.map((row) => row.office_id));
  for (const id of registerIds) {
    if (!classIds.has(id)) throw new Error(`Classification missing office ${id}`);
  }
  for (const id of classIds) {
    if (!registerIds.has(id)) throw new Error(`Classification extra office ${id}`);
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
  if (tiers.some((row) => row.tier !== "other" || row.review_status !== "approved")) {
    throw new Error("Both Alderney offices must be approved other");
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
          json_pointer: "/urls_without_master_source_row/0",
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
    const prefixed = token.startsWith("alderney--") ? token.slice("alderney--".length) : null;
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
    const reason = isHttpUrl(token) ? "unmatched_catalogue_token" : "unmatched_catalogue_token";
    addUnresolved({ recordKey: rec, loc, token, reason, row: originalRow });
    return null;
  }

  if (inventory.history.relativePath.includes("crosscheck")) {
    throw new Error("Crosscheck file must not be loaded as selected history");
  }

  const historyEntries: Array<{
    rowIndex: number;
    row: TableRow;
    officeId: string;
    hk: string;
    eventId: string;
    ballot: string;
  }> = [];
  const historyByHk = new Map<string, (typeof historyEntries)[number]>();
  for (let i = 0; i < inventory.history.rows.length; i++) {
    const row = inventory.history.rows[i]!;
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

  const calendarRow = inventory.calendar.rows[0];
  if (!calendarRow) throw new Error("Alderney calendar row missing");
  if (cellText(calendarRow["Date status"]) !== CALENDAR_STATUS) {
    throw new Error(`Unexpected calendar date status ${JSON.stringify(calendarRow["Date status"])}`);
  }
  if (cellText(calendarRow["First or scheduled date"]) !== EXPECTED_OFFICES["GG-ALD-STATES"]!.nextDate) {
    throw new Error("Calendar first date must confirm STATES 2026-11-21");
  }
  if (cellText(calendarRow["End or runoff date"]) !== EXPECTED_OFFICES["GG-ALD-PLEB"]!.nextDate) {
    throw new Error("Calendar end date must confirm PLEB 2026-12-12 independently, not as a runoff");
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  const kindCounts = { ordinary: 0, special: 0 };

  for (const entry of historyEntries) {
    const parsed = parseDateLabel(entry.ballot);
    if (parsed.precision !== "day") {
      throw new Error(`Baseline historical date must be day precision: ${entry.hk}`);
    }
    const year = cellYear(entry.row.Year);
    if (year !== parsed.year) {
      throw new Error(`Year mismatch for ${entry.hk}`);
    }
    const dId = dateId("event", entry.eventId, "ballot");
    dates.push({
      date_id: dId,
      label: entry.ballot,
      precision: parsed.precision,
      certainty: "unknown",
      year: parsed.year,
      month: parsed.month,
      day: parsed.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.history, inventory, entry.rowIndex, "Ballot date if recorded"),
        row: { ballot: entry.row["Ballot date if recorded"], year: entry.row.Year },
      }),
    });
    const briefingPath = `${PACKAGE_PREFIX}/briefings/${entry.officeId}.html`;
    const briefing = inventory.byPath.get(briefingPath);
    if (!briefing?.text) throw new Error(`Missing briefing ${briefingPath}`);
    const matches = recordedHistoricalHeadings(briefing.text).filter((heading) => heading.date === entry.ballot);
    if (matches.length !== 1) {
      throw new Error(`Expected unique recorded-historical h3 for ${entry.officeId} ${entry.ballot}`);
    }
    const kind = eventKindFromHeading(matches[0]!.label);
    kindCounts[kind] += 1;
    events.push({
      id_namespace: N,
      office_id: entry.officeId,
      history_key: entry.hk,
      event_id: entry.eventId,
      date_id: dId,
      date_resolution: "resolved",
      event_kind: kind,
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
        origin: originFor(inventory.history, inventory, entry.rowIndex),
        row: entry.row,
        columns: inventory.history.table.columns,
        values: inventory.history.table.rows[entry.rowIndex],
        supplemental: { briefing_h3: matches[0], briefing_path: briefingPath },
      }),
    });
  }
  if (kindCounts.ordinary !== 4 || kindCounts.special !== 2) {
    throw new Error(`Unexpected event kinds ${JSON.stringify(kindCounts)}`);
  }

  const prospectiveByOffice = new Map<
    string,
    { eventId: string; dateId: string; hk: string; officeIndex: number }
  >();
  for (const office of officeMeta) {
    const expected = EXPECTED_OFFICES[office.officeId]!;
    const eventId = nextEventIdFor(office.officeId);
    if (eventId !== expected.nextEventId) {
      throw new Error(`Prospective event ID ${eventId} != ${expected.nextEventId}`);
    }
    const parsed = parseDateLabel(office.nextDate);
    if (parsed.precision !== "day") {
      throw new Error(`Prospective date must stay day precision for ${office.officeId}`);
    }
    const dId = dateId("event", eventId, "ballot");
    dates.push({
      date_id: dId,
      label: office.nextDate,
      precision: "day",
      certainty: "conditional",
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
          calendar_date: originFor(inventory.calendar, inventory, 0, expected.calendarColumn),
          calendar_certainty: originFor(inventory.calendar, inventory, 0, "Date status"),
          calendar_status: CALENDAR_STATUS,
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
          calendar_row: calendarRow,
          calendar_date: originFor(inventory.calendar, inventory, 0, expected.calendarColumn),
          calendar_certainty: originFor(inventory.calendar, inventory, 0, "Date status"),
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
  if (dates.length !== EXPECTED_COUNTS.research_dates || events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected 8 dates/events, found ${dates.length}/${events.length}`);
  }

  const offices: SqlRow[] = officeMeta.map((office) => {
    const next = prospectiveByOffice.get(office.officeId)!;
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
      next_date_id: next.dateId,
      next_date_resolution: "resolved",
      next_history_key: next.hk,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, office.rowIndex),
        row: office.row,
        columns: inventory.officeRegister.table.columns,
        values: inventory.officeRegister.table.rows[office.rowIndex],
      }),
    };
  });

  const results: SqlRow[] = [];
  const resultIndex = new Map<string, number>();
  let zeroSeats = 0;
  let oneSeats = 0;
  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const row = inventory.returns.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const history = historyByHk.get(hk);
    if (!history) throw new Error(`Result row does not match a selected history: ${hk}`);
    if (cellText(row["Vote basis"]) !== CANDIDATE_MARKS_BASIS) {
      throw new Error(`Result vote basis disagrees with history for ${hk}`);
    }
    const next = resultIndex.get(history.eventId) ?? 0;
    resultIndex.set(history.eventId, next + 1);
    const resultId = `${history.eventId}-r${next}`;
    const votes = numericInteger(row["Votes or marks"], `votes ${resultId}`);
    const share = numericShare(row["Share on stated basis"], `share ${resultId}`);
    const seats = numericInteger(row.Seats, `seats ${resultId}`);
    if (votes.value == null || votes.value <= 0) throw new Error(`Baseline votes must be positive (${resultId})`);
    if (share.value == null || share.value <= 0) throw new Error(`Baseline share must be positive (${resultId})`);
    if (seats.value === 0) zeroSeats += 1;
    else if (seats.value === 1) oneSeats += 1;
    else throw new Error(`Unexpected seat count ${String(seats.value)} for ${resultId}`);
    const year = cellYear(row.Year);
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
      party_namespace: year == null ? "unknown" : `alderney/${year}`,
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
  if (zeroSeats !== 13 || oneSeats !== 14) {
    throw new Error(`Seat one/zero counts ${oneSeats}/${zeroSeats}`);
  }
  const prospectiveResults = results.filter((row) => String(row.history_key).startsWith("next-"));
  if (prospectiveResults.length !== 0) {
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
          ? originFor(inventory.history, inventory, historical.rowIndex)
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
    const url = cellText(entry.row["Source URL"]);
    const rec = recordKey("event", [N, entry.officeId, entry.hk]);
    const loc = originFor(inventory.history, inventory, entry.rowIndex, "Source URL");
    const sourceId = resolveCitation(url, rec, loc, `history ${entry.hk}`, entry.row);
    if (!sourceId) continue;
    addEvidence({ recordKey: rec, sourceId, loc, claimKind: "event", claim: { token: url, row: entry.row } });
    addEvidence({
      recordKey: rec,
      sourceId,
      loc,
      claimKind: "date",
      dateClaimId: dateId("event", entry.eventId, "ballot"),
      claim: { ballot: entry.ballot, year: entry.row.Year },
    });
  }

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const url = cellText(inventory.returns.rows[i]!["Source URL"]);
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const loc = originFor(inventory.returns, inventory, i, "Source URL");
    const sourceId = resolveCitation(url, rec, loc, `result ${result.result_row_id}`, inventory.returns.rows[i]);
    if (!sourceId) continue;
    addEvidence({
      recordKey: rec,
      sourceId,
      loc,
      claimKind: "result",
      claim: { token: url, row: inventory.returns.rows[i] },
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
  const calUrl = cellText(calendarRow["Source URL"]);
  if (calUrl) {
    const loc = originFor(inventory.calendar, inventory, 0, "Source URL");
    const sourceId = resolveCitation(calUrl, calInputKey, loc, "calendar source", calendarRow);
    if (sourceId) {
      addEvidence({
        recordKey: calInputKey,
        sourceId,
        loc,
        claimKind: "calendar_context",
        claim: { token: calUrl, row: calendarRow },
      });
    }
  }

  for (const office of officeMeta) {
    const expected = EXPECTED_OFFICES[office.officeId]!;
    const next = prospectiveByOffice.get(office.officeId)!;
    const officeRec = recordKey("office", [N, office.officeId]);
    const eventRec = recordKey("event", [N, office.officeId, next.hk]);
    const loc = originFor(inventory.officeRegister, inventory, office.rowIndex, "Calendar evidence");
    const sourceId = resolveCitation(
      office.calendarEvidence,
      officeRec,
      loc,
      `office calendar ${office.officeId}`,
      office.row,
    );
    if (!sourceId) continue;
    const claim = {
      token: office.calendarEvidence,
      office_date: office.nextDate,
      calendar_status: CALENDAR_STATUS,
      calendar_date_locator: originFor(inventory.calendar, inventory, 0, expected.calendarColumn),
      calendar_certainty_locator: originFor(inventory.calendar, inventory, 0, "Date status"),
    };
    addEvidence({ recordKey: officeRec, sourceId, loc, claimKind: "calendar_context", claim });
    addEvidence({ recordKey: eventRec, sourceId, loc, claimKind: "event", claim });
    addEvidence({
      recordKey: eventRec,
      sourceId,
      loc,
      claimKind: "date",
      dateClaimId: next.dateId,
      claim,
    });
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
    crosswalkKeys.add(pk);
    crosswalks.push(row);
  }

  addCrosswalk({
    entity_kind: "country",
    upstream_namespace: "observatory:alderney",
    upstream_id: "alderney",
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
    const origin = originFor(inventory.officeRegister, inventory, officeById.get(String(office.office_id))!.rowIndex);
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "alderney:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:alderney",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "alderney:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id, geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:alderney",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "alderney:briefing",
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
    const historical = historyByHk.get(String(event.history_key));
    const origin = historical
      ? originFor(inventory.history, inventory, historical.rowIndex)
      : originFor(inventory.officeRegister, inventory, officeById.get(String(event.office_id))!.rowIndex, "Next polling date");
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "alderney:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { history_key: event.history_key } }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:alderney",
      upstream_id: event.event_id,
      record_key: rec,
      reason: "preserved_bridge_id",
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
      upstream_namespace: "observatory:alderney",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { result_row_id: result.result_row_id } }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "alderney:baseline-result-row",
      upstream_id: canonical([inventory.returns.relativePath, inventory.returns.table.sheet, inventory.returns.table.source_rows[i]]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "alderney:result-identity",
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
    const url = cellText(info.row["Source URL"]);
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "alderney:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:alderney",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "alderney:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(inventory.sources, inventory, info.index, "Source URL"), row: info.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:alderney",
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
    const origin = locator({
      input_path: `${PACKAGE_PREFIX}/source-links.json`,
      sha256: sliceHash(inventory, `${PACKAGE_PREFIX}/source-links.json`),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "alderney:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { url } }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:alderney",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { url, source_id: sourceId } }),
    });
  }

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
    selected_histories: historyEntries.length,
    prospective_events: prospectiveByOffice.size,
    total_events: events.length,
    research_dates: dates.length,
    result_rows: results.length,
    control_observations_supplied: 0,
    poll_records_supplied: 0,
    source_catalogue_rows: EXPECTED_COUNTS.source_catalogue_rows,
    inline_only_sources: EXPECTED_COUNTS.inline_only_sources,
    sources: sources.length,
    briefings_retained: briefingCount,
    other_offices: tiers.filter((row) => row.tier === "other").length,
    regional_offices: tiers.filter((row) => row.tier === "regional").length,
    municipal_offices: tiers.filter((row) => row.tier === "municipal").length,
    proceedings: 0,
    party_mappings: 0,
    package_files_retained: EXPECTED_COUNTS.package_files_retained,
    retained_inputs: retainedInputs.length,
  };
  if (validatedCounts.regional_offices !== 0 || validatedCounts.municipal_offices !== 0) {
    throw new Error("Alderney must have 0 regional and 0 municipal offices");
  }
  if (validatedCounts.other_offices !== 2) {
    throw new Error("Alderney must have 2 other offices");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Alderney frozen country package",
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
