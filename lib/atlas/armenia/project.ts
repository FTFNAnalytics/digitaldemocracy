import type { TableRow } from "../../observatory/adapters/tables";
import type { ArmeniaInventory, HistoryIndexSlice, WorkbookSlice } from "./inventory";
import {
  BOUNDARY_CALENDAR_REVIEW_OFFICES,
  CEC_CONFIRMED_PHRASE,
  COUNTRY_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  FORBIDDEN_VEDI_TOKEN,
  LINEAGE_ID,
  MAYOR_OFFICE_IDS,
  OFFICE_NAMESPACE,
  PACKAGE_PREFIX,
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

export type ArmeniaProjection = {
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

function sliceHash(inventory: ArmeniaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: ArmeniaInventory,
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
  inventory: ArmeniaInventory,
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

function eventKindFromRound(value: unknown): "ordinary" | "special" | "unknown" {
  const text = cellText(value);
  if (text.startsWith("Ordinary election;")) return "ordinary";
  if (text.startsWith("Replacement election after mass council resignations;")) return "special";
  if (text.startsWith("Local election;")) return "unknown";
  throw new Error(`Unrecognized Armenia Round / basis ${JSON.stringify(value)}`);
}

function ballotBasisFromRound(value: unknown): "valid_votes" | "unknown" {
  const text = cellText(value);
  if (text.includes("Valid candidate/list votes")) return "valid_votes";
  if (text.includes("incomplete") || text.includes("Seats only")) return "unknown";
  throw new Error(`Unrecognized Armenia ballot basis ${JSON.stringify(value)}`);
}

function legalOutcomeFromCoverage(value: unknown): "preliminary" | "unknown" {
  const text = cellText(value).toLowerCase();
  if (text.includes("preliminary") || text.includes("provisional")) return "preliminary";
  return "unknown";
}

function resultEvidenceStatus(coverage: unknown, votes: unknown, share: unknown, seats: unknown): string {
  const text = cellText(coverage).toLowerCase();
  if (text.includes("preliminary") || text.includes("provisional")) return "preliminary";
  if (votes != null || share != null || seats != null) return "recorded";
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

function comparability(historyCoverage: unknown, indexStatus: unknown): string | null {
  const parts = [cellText(historyCoverage), cellText(indexStatus)].filter((part) => part.length > 0);
  return parts.length ? parts.join(" · ") : null;
}

function rejectFixtures(values: Array<string | null | undefined>, where: string): void {
  for (const value of values) {
    if (isFixtureId(value) || value === FORBIDDEN_VEDI_TOKEN) {
      throw new Error(`Fixture or forbidden identity ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function catalogueFields(row: TableRow, kind: "master" | "companion"): {
  originalId: string;
  title: string;
  url: string;
  grade: string;
  accessed: string;
} {
  return {
    originalId: cellText(row["Source ID"]),
    title: kind === "master" ? cellText(row.Title) : cellText(row["Title / dataset"]),
    url: kind === "master" ? cellText(row["Source URL"]) : cellText(row.URL),
    grade: cellText(row["Evidence grade"]),
    accessed: cellText(row.Accessed),
  };
}

export function projectArmenia(inventory: ArmeniaInventory): ArmeniaProjection {
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
    if (item.input_path.includes(`/${FORBIDDEN_VEDI_TOKEN}.`) || item.input_path.endsWith(`/${FORBIDDEN_VEDI_TOKEN}`)) {
      throw new Error("Unsuffixed Vedi token cannot be an Armenia office identity");
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
    country_code: null,
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

  const jurisdictionById = new Map<string, { row: TableRow; rowIndex: number }>();
  for (let i = 0; i < inventory.jurisdictions.rows.length; i++) {
    const row = inventory.jurisdictions.rows[i]!;
    const officeId = cellText(row["Jurisdiction ID"]);
    if (jurisdictionById.has(officeId)) throw new Error(`Duplicate jurisdiction ${officeId}`);
    jurisdictionById.set(officeId, { row, rowIndex: i });
  }
  if (jurisdictionById.size !== EXPECTED_COUNTS.current_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.current_offices} jurisdiction rows`);
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
    companion: { row: TableRow; rowIndex: number };
  }> = [];
  const officeById = new Map<(typeof officeMeta)[number]["officeId"], (typeof officeMeta)[number]>();
  const geoSeen = new Set<string>();
  let proportional = 0;
  let majoritarian = 0;
  let mayors = 0;

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (officeId === FORBIDDEN_VEDI_TOKEN) {
      throw new Error("Unsuffixed Vedi token is not a valid office ID");
    }
    if (cellText(row.Country) !== "Armenia") {
      throw new Error(`Office ${officeId} country is not Armenia`);
    }
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    const geographyId = geographyIdFor(jurisdiction, officeType);
    const expected = EXPECTED_OFFICES[officeId];
    if (expected && (expected.jurisdiction !== jurisdiction || expected.officeType !== officeType || expected.geographyId !== geographyId)) {
      throw new Error(`Office ${officeId} geography/type mismatch`);
    }
    if (officeType === "Municipal council (proportional; mayor elected by council)") proportional += 1;
    else if (officeType === "Municipal council (majoritarian)") majoritarian += 1;
    else if (officeType === "Mayor") mayors += 1;
    else throw new Error(`Unexpected office type ${officeType} for ${officeId}`);
    if (officeId.endsWith("-M") && officeType !== "Mayor") {
      throw new Error(`Mayor suffix without Mayor type: ${officeId}`);
    }
    const companion = jurisdictionById.get(officeId);
    if (!companion) throw new Error(`Missing companion jurisdiction for ${officeId}`);
    if (cellText(companion.row.Jurisdiction) !== jurisdiction || cellText(companion.row.Office) !== officeType) {
      throw new Error(`O/J mismatch for ${officeId}`);
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
    const companionNext = cellText(companion.row["Next date"]);
    if (nextDate !== companionNext) {
      throw new Error(`Next date O/J mismatch for ${officeId}`);
    }
    if (companion.row["Poll source"] != null && cellText(companion.row["Poll source"]) !== "") {
      throw new Error(`Armenia must not invent poll records for ${officeId}`);
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
      companion,
    };
    officeMeta.push(meta);
    officeById.set(officeId, meta);
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} geographies, found ${geographies.length}`);
  }
  if (
    proportional !== EXPECTED_COUNTS.proportional_councils ||
    majoritarian !== EXPECTED_COUNTS.majoritarian_councils ||
    mayors !== EXPECTED_COUNTS.existing_mayor_offices
  ) {
    throw new Error(`Office type counts ${proportional}/${majoritarian}/${mayors}`);
  }
  for (const mayorId of MAYOR_OFFICE_IDS) {
    if (!officeById.has(mayorId) || officeById.get(mayorId)!.officeType !== "Mayor") {
      throw new Error(`Missing existing mayor ${mayorId}`);
    }
  }
  const inventedMayor = officeMeta.some(
    (office) =>
      office.officeType === "Municipal council (proportional; mayor elected by council)" &&
      officeById.has(office.officeId.replace(/-C$/, "-M")),
  );
  if (inventedMayor) {
    throw new Error("Proportional councils must not mint mayor office IDs");
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
    if (!registerIds.has(id) || id === FORBIDDEN_VEDI_TOKEN) {
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
  if (tiers.some((row) => row.tier !== "municipal" || row.review_status !== "approved")) {
    throw new Error("All 71 Armenia offices must be approved municipal");
  }
  for (const officeId of BOUNDARY_CALENDAR_REVIEW_OFFICES) {
    const row = classifications.find((item) => item.office_id === officeId);
    const nested = row?.boundary_calendar_review as { status?: string } | undefined;
    if (!nested || nested.status !== "open") {
      throw new Error(`${officeId} must retain an open nested boundary/calendar review`);
    }
  }

  type CatalogueInfo = {
    sourceId: string;
    originalId: string;
    title: string;
    url: string;
    grade: string;
    accessed: string;
    origins: Array<{ kind: "master" | "companion"; row: TableRow; index: number }>;
  };
  const catalogueById = new Map<string, CatalogueInfo>();
  const catalogueByUrl = new Map<string, string>();

  function ingestCatalogue(slice: WorkbookSlice, kind: "master" | "companion"): void {
    for (let i = 0; i < slice.rows.length; i++) {
      const row = slice.rows[i]!;
      const fields = catalogueFields(row, kind);
      if (!fields.originalId || !isHttpUrl(fields.url)) {
        throw new Error(`${kind} catalogue row ${i} missing Source ID or HTTP URL`);
      }
      rejectFixtures([fields.originalId], `${kind} source catalogue`);
      const existing = catalogueById.get(fields.originalId);
      if (existing) {
        if (
          existing.title !== fields.title ||
          existing.url !== fields.url ||
          existing.grade !== fields.grade ||
          existing.accessed !== fields.accessed
        ) {
          throw new Error(`Catalogue metadata disagreement for ${fields.originalId}`);
        }
        existing.origins.push({ kind, row, index: i });
        continue;
      }
      if (catalogueByUrl.has(fields.url)) {
        throw new Error(`Duplicate catalogue URL ${fields.url}`);
      }
      const sourceId = catalogueSourceId(fields.originalId);
      catalogueById.set(fields.originalId, {
        sourceId,
        originalId: fields.originalId,
        title: fields.title,
        url: fields.url,
        grade: fields.grade,
        accessed: fields.accessed,
        origins: [{ kind, row, index: i }],
      });
      catalogueByUrl.set(fields.url, sourceId);
    }
  }
  ingestCatalogue(inventory.masterSources, "master");
  ingestCatalogue(inventory.companionSources, "companion");
  if (inventory.masterSources.rows.length !== EXPECTED_COUNTS.master_source_catalogue_rows) {
    throw new Error("Master source catalogue row count mismatch");
  }
  if (inventory.companionSources.rows.length !== EXPECTED_COUNTS.companion_source_catalogue_rows) {
    throw new Error("Companion source catalogue row count mismatch");
  }
  if (catalogueById.size !== EXPECTED_COUNTS.distinct_catalogue_sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.distinct_catalogue_sources} canonical catalogue sources`);
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
        origin: originFor(
          info.origins[0]!.kind === "master" ? inventory.masterSources : inventory.companionSources,
          inventory,
          info.origins[0]!.index,
        ),
        row: info.origins[0]!.row,
        supplemental: { physical_origins: info.origins.map((origin) => origin.kind) },
      }),
    });
  }

  const inlineUrls = (inventory.sourceLinks.without_master_source_row ?? []).filter((url) => !catalogueByUrl.has(url));
  if (inlineUrls.length !== EXPECTED_COUNTS.inline_only_sources) {
    throw new Error(`Expected ${EXPECTED_COUNTS.inline_only_sources} inline-only URLs, found ${inlineUrls.length}`);
  }
  const notesScreen = cellText(notesRow?.["Screen evidence"]);
  if (inlineUrls[0] !== notesScreen) {
    throw new Error("The only inline-only source must be the CRRC screening URL");
  }
  for (const url of inlineUrls) {
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
        origin: originFor(inventory.countryNotes, inventory, 0, "Screen evidence"),
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
    const prefixed = token.startsWith("armenia--") ? token.slice("armenia--".length) : null;
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

  function requireSameResolved(left: string | null, right: string | null, context: string): string | null {
    if (left && right && left !== right) {
      throw new Error(`Source ID/URL disagreement in ${context}`);
    }
    return left ?? right;
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
    const officeId = cellText(row["Jurisdiction ID"]);
    if (!officeById.has(officeId)) throw new Error(`History office ${officeId} missing from register`);
    if (row["Actual election return"] !== true) {
      throw new Error(`History ${officeId} is not an actual election return`);
    }
    if (row["Competition eligible"] !== false) {
      throw new Error(`History ${officeId} competition eligible must stay false`);
    }
    const hk = historyKey(officeId, row.Year, row["Actual ballot date, if recorded"]);
    const eventPublicId = eventIdFor(hk);
    rejectFixtures([officeId, eventPublicId, hk], "history");
    const entry = {
      rowIndex: i,
      row,
      officeId,
      hk,
      eventId: eventPublicId,
      ballot: cellText(row["Actual ballot date, if recorded"]),
    };
    if (historyByHk.has(hk)) throw new Error(`Duplicate history key ${hk}`);
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
  }
  if (historyEntries.length !== EXPECTED_COUNTS.selected_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.selected_histories} selected histories, found ${historyEntries.length}`);
  }

  const indexKeys = new Set<string>();
  for (let i = 0; i < inventory.historyIndex.rows.length; i++) {
    const row = inventory.historyIndex.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    indexKeys.add(hk);
    const historical = historyByHk.get(hk);
    if (!historical) throw new Error(`History-index key ${hk} is not a selected H event`);
    historical.indexRow = row;
    historical.indexIndex = i;
  }
  if (indexKeys.size !== EXPECTED_COUNTS.selected_histories) {
    throw new Error("H and IX key sets must be identical 33");
  }
  for (const hk of historyByHk.keys()) {
    if (!indexKeys.has(hk)) throw new Error(`Selected history ${hk} missing from history-index`);
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  const kindCounts = { ordinary: 0, special: 0, unknown: 0 };
  const basisCounts = { valid_votes: 0, unknown: 0 };

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
        origin: originFor(inventory.histories, inventory, entry.rowIndex, "Actual ballot date, if recorded"),
        row: { ballot: entry.row["Actual ballot date, if recorded"], year: entry.row.Year },
        supplemental: {
          history_index: entry.indexRow ?? null,
          history_index_origin:
            entry.indexIndex == null
              ? null
              : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex, "Ballot date if recorded"),
        },
      }),
    });
    const kind = eventKindFromRound(entry.row["Round / basis"]);
    const basis = ballotBasisFromRound(entry.row["Round / basis"]);
    kindCounts[kind] += 1;
    basisCounts[basis] += 1;
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
      comparability: comparability(entry.row.Coverage, entry.indexRow?.["Comparability status"]),
      ballot_basis: basis,
      share_unit: "percent_0_100",
      legal_outcome: legalOutcomeFromCoverage(entry.row.Coverage),
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
  if (kindCounts.ordinary !== 22 || kindCounts.special !== 1 || kindCounts.unknown !== 10) {
    throw new Error(`Unexpected event kinds ${JSON.stringify(kindCounts)}`);
  }
  if (basisCounts.valid_votes !== 22 || basisCounts.unknown !== 11) {
    throw new Error(`Unexpected ballot bases ${JSON.stringify(basisCounts)}`);
  }

  const prospectiveByOffice = new Map<string, { eventId: string; dateId: string; hk: string; officeIndex: number }>();
  for (const office of officeMeta) {
    if (!office.nextDate) continue;
    if (!cellText(office.companion.row.Notes).includes(CEC_CONFIRMED_PHRASE)) {
      throw new Error(`Prospective ${office.officeId} lacks office-specific CEC confirmation`);
    }
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
      certainty: "called",
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
          notes: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Notes"),
          calendar_source: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Calendar source"),
          companion_next: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Next date"),
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
          jurisdiction: office.companion.row,
          jurisdiction_origin: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex),
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
    throw new Error(`Expected 63 dates/events, found ${dates.length}/${events.length}`);
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
          jurisdiction: office.companion.row,
          briefing_path: unpackedPath(`Office_Briefings/Offices/${office.officeId}.html`),
        },
      }),
    };
  });
  const unknownNext = offices.filter((row) => row.next_date_id == null).length;
  if (unknownNext !== EXPECTED_COUNTS.unknown_next_dates) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unknown_next_dates} unknown next dates, found ${unknownNext}`);
  }
  for (const officeId of BOUNDARY_CALENDAR_REVIEW_OFFICES) {
    const office = offices.find((row) => row.office_id === officeId);
    if (!office || office.next_date_id != null || office.next_history_key != null || office.next_date_resolution !== "unknown") {
      throw new Error(`${officeId} must keep an unknown next date; no invented postponement`);
    }
  }

  const results: SqlRow[] = [];
  const resultIndex = new Map<string, number>();
  let recordedVotes = 0;
  let missingVotes = 0;
  let recordedShares = 0;
  let missingShares = 0;
  let recordedSeats = 0;
  let missingSeats = 0;
  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const row = inventory.returns.rows[i]!;
    const officeId = cellText(row["Jurisdiction ID"]);
    const hk = historyKey(officeId, row.Year, row["Actual ballot date, if recorded"]);
    const history = historyByHk.get(hk);
    if (!history) throw new Error(`Result row does not match a selected history: ${hk}`);
    const next = resultIndex.get(history.eventId) ?? 0;
    resultIndex.set(history.eventId, next + 1);
    const resultId = `${history.eventId}-r${next}`;
    const votes = numericInteger(row.Votes, `votes ${resultId}`);
    const share = numericShare(row.Share, `share ${resultId}`);
    const seats = numericInteger(row.Seats, `seats ${resultId}`);
    if (votes.value == null) missingVotes += 1;
    else recordedVotes += 1;
    if (share.value == null) missingShares += 1;
    else recordedShares += 1;
    if (seats.value == null) missingSeats += 1;
    else recordedSeats += 1;
    if (votes.status === "zero" || share.status === "zero" || seats.status === "zero") {
      throw new Error(`Baseline Armenia results contain no numeric zeros (${resultId})`);
    }
    const year = cellYear(row.Year);
    const party = row["Party / list"] == null ? null : cellText(row["Party / list"]);
    const candidate = row["Candidate / ticket"] == null ? null : cellText(row["Candidate / ticket"]);
    results.push({
      id_namespace: N,
      office_id: officeId,
      history_key: hk,
      result_row_id: resultId,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: party || candidate || null,
      original_party_label: party,
      original_party_code: party,
      party_namespace: year == null ? "unknown" : `armenia/${year}`,
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
      evidence_status: resultEvidenceStatus(history.row.Coverage, row.Votes, row.Share, row.Seats),
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
  if (recordedVotes !== 95 || missingVotes !== 2 || recordedShares !== 77 || missingShares !== 20 || recordedSeats !== 2 || missingSeats !== 95) {
    throw new Error(`Armenia missing/recorded numeric counts votes ${recordedVotes}/${missingVotes} shares ${recordedShares}/${missingShares} seats ${recordedSeats}/${missingSeats}`);
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
    const idToken = cellText(entry.row["Source ID"]);
    const urlToken = cellText(entry.row["Result source URL"]);
    const idLoc = originFor(inventory.histories, inventory, entry.rowIndex, "Source ID");
    const urlLoc = originFor(inventory.histories, inventory, entry.rowIndex, "Result source URL");
    const fromId = resolveCitation(idToken, rec, idLoc, `history ${entry.hk} source id`, entry.row);
    const fromUrl = resolveCitation(urlToken, rec, urlLoc, `history ${entry.hk} url`, entry.row);
    const sourceId = requireSameResolved(fromId, fromUrl, `history ${entry.hk}`);
    if (!sourceId) continue;
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

  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const result = results[i]!;
    const row = inventory.returns.rows[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const idToken = cellText(row["Source ID"]);
    const urlToken = cellText(row["Source URL"]);
    const idLoc = originFor(inventory.returns, inventory, i, "Source ID");
    const urlLoc = originFor(inventory.returns, inventory, i, "Source URL");
    const fromId = resolveCitation(idToken, rec, idLoc, `result ${result.result_row_id} source id`, row);
    const fromUrl = resolveCitation(urlToken, rec, urlLoc, `result ${result.result_row_id} url`, row);
    const sourceId = requireSameResolved(fromId, fromUrl, `result ${result.result_row_id}`);
    if (!sourceId) continue;
    addEvidence({
      recordKey: rec,
      sourceId,
      loc: urlLoc,
      claimKind: "result",
      claim: { token: urlToken, row },
    });
  }

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
  for (let i = 0; i < inventory.calendar.rows.length; i++) {
    const calUrl = cellText(inventory.calendar.rows[i]!["Source URL"]);
    if (!calUrl) continue;
    const loc = originFor(inventory.calendar, inventory, i, "Source URL");
    const sourceId = resolveCitation(calUrl, calInputKey, loc, `calendar source ${i}`, inventory.calendar.rows[i]);
    if (sourceId) {
      addEvidence({
        recordKey: calInputKey,
        sourceId,
        loc,
        claimKind: "calendar_context",
        claim: { token: calUrl, row: inventory.calendar.rows[i] },
      });
    }
  }

  for (const office of officeMeta) {
    const officeRec = recordKey("office", [N, office.officeId]);
    const loc = originFor(inventory.officeRegister, inventory, office.rowIndex, "Calendar evidence");
    const sourceId = office.calendarEvidence
      ? resolveCitation(office.calendarEvidence, officeRec, loc, `office calendar ${office.officeId}`, office.row)
      : null;
    const jLoc = originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Calendar source");
    const jToken = cellText(office.companion.row["Calendar source"]);
    const jSource = jToken ? resolveCitation(jToken, officeRec, jLoc, `jurisdiction calendar ${office.officeId}`, office.companion.row) : null;
    const resolved = requireSameResolved(sourceId, jSource, `office calendar ${office.officeId}`);
    if (!resolved) continue;
    const next = prospectiveByOffice.get(office.officeId);
    const claim = {
      token: office.calendarEvidence || jToken,
      office_date: office.nextDate || null,
      notes_locator: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Notes"),
      calendar_source_locator: jLoc,
    };
    addEvidence({ recordKey: officeRec, sourceId: resolved, loc, claimKind: "calendar_context", claim });
    if (next) {
      const eventRec = recordKey("event", [N, office.officeId, next.hk]);
      addEvidence({ recordKey: eventRec, sourceId: resolved, loc, claimKind: "event", claim });
      addEvidence({
        recordKey: eventRec,
        sourceId: resolved,
        loc,
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
    if (String(row.upstream_id) === FORBIDDEN_VEDI_TOKEN) {
      throw new Error("Unsuffixed Vedi token cannot be an alias");
    }
    crosswalkKeys.add(pk);
    crosswalks.push(row);
  }

  addCrosswalk({
    entity_kind: "country",
    upstream_namespace: "observatory:armenia",
    upstream_id: "armenia",
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
      upstream_namespace: "armenia:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:armenia",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "armenia:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id, geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:armenia",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "armenia:briefing",
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
      upstream_namespace: "armenia:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { history_key: event.history_key } }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:armenia",
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
      upstream_namespace: "observatory:armenia",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { result_row_id: result.result_row_id } }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "armenia:baseline-result-row",
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
      upstream_namespace: "armenia:result-identity",
      upstream_id: canonical([
        N,
        result.office_id,
        result.history_key,
        row["Party / list"] ?? null,
        row["Candidate / ticket"] ?? null,
        row["Election cycle key"] ?? null,
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
    const originSlice = info.origins[0]!.kind === "master" ? inventory.masterSources : inventory.companionSources;
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "armenia:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(originSlice, inventory, info.origins[0]!.index), row: info.origins[0]!.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:armenia",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(originSlice, inventory, info.origins[0]!.index), row: info.origins[0]!.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "armenia:source-url",
      upstream_id: info.url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index, info.origins[0]!.kind === "master" ? "Source URL" : "URL"),
        row: info.origins[0]!.row,
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:armenia",
      upstream_id: urlSourceId(info.url),
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index, info.origins[0]!.kind === "master" ? "Source URL" : "URL"),
        row: { url: info.url, alias: urlSourceId(info.url) },
      }),
    });
  }
  for (const url of inlineUrls) {
    const sourceId = urlSourceId(url);
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    const origin = originFor(inventory.countryNotes, inventory, 0, "Screen evidence");
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "armenia:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { url } }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:armenia",
      upstream_id: sourceId,
      record_key: rec,
      reason: "preserved_bridge_id",
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
    (item) => item.input_path === `${UNPACKED_PREFIX}/Office_Briefings/armenia.html`,
  ).length;
  if (officeBriefings !== EXPECTED_COUNTS.office_briefings_retained || countryBriefings !== EXPECTED_COUNTS.country_briefings_retained) {
    throw new Error(`Expected 71 office + 1 country briefings, found ${officeBriefings}/${countryBriefings}`);
  }

  const officesWithHistories = new Set(historyEntries.map((row) => row.officeId)).size;
  const validatedCounts = {
    current_offices: offices.length,
    historical_offices: 0,
    geographies: geographies.length,
    proportional_councils: proportional,
    majoritarian_councils: majoritarian,
    existing_mayor_offices: mayors,
    selected_histories: historyEntries.length,
    offices_with_histories: officesWithHistories,
    prospective_events: prospectiveByOffice.size,
    total_events: events.length,
    research_dates: dates.length,
    result_rows: results.length,
    offices_without_recorded_histories: offices.length - officesWithHistories,
    unknown_next_dates: unknownNext,
    control_observations_supplied: 0,
    poll_records_supplied: 0,
    master_source_catalogue_rows: EXPECTED_COUNTS.master_source_catalogue_rows,
    companion_source_catalogue_rows: EXPECTED_COUNTS.companion_source_catalogue_rows,
    distinct_catalogue_sources: EXPECTED_COUNTS.distinct_catalogue_sources,
    inline_only_sources: EXPECTED_COUNTS.inline_only_sources,
    sources: sources.length,
    office_briefings_retained: officeBriefings,
    country_briefings_retained: countryBriefings,
    municipal_offices: tiers.filter((row) => row.tier === "municipal").length,
    regional_offices: tiers.filter((row) => row.tier === "regional").length,
    proceedings: 0,
    party_mappings: 0,
    outer_package_files: EXPECTED_COUNTS.outer_package_files,
    payload_member_files: EXPECTED_COUNTS.payload_member_files,
    retained_inputs: retainedInputs.length,
  };
  if (validatedCounts.regional_offices !== 0 || validatedCounts.municipal_offices !== 71) {
    throw new Error("Armenia must have 71 municipal and 0 regional offices");
  }
  if (validatedCounts.offices_without_recorded_histories !== 40 || validatedCounts.offices_with_histories !== 31) {
    throw new Error("Armenia history coverage counts mismatch");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Armenia frozen country package",
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
