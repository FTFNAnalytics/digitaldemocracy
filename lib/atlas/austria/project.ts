import type { TableRow } from "../../observatory/adapters/tables";
import type { AustriaInventory, HistoryIndexSlice, WorkbookSlice } from "./inventory";
import {
  COUNTRY_CODE,
  COUNTRY_ID,
  DAY_DATE_ALLOWLIST,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  LINEAGE_ID,
  OFFICE_NAMESPACE,
  PACKAGE_PREFIX,
  REGIONAL_OFFICE_IDS,
  SOURCE_NAMESPACE,
  ST_GEORGEN_HOLD_HISTORY_KEY,
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
  isRegionalOfficeId,
  locator,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  unresolvedId,
  unpackedPath,
  urlSourceId,
  type Locator,
} from "./identity";

export type SqlRow = Record<string, unknown>;

export type AustriaProjection = {
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

function columnIndex(slice: WorkbookSlice, column: string): number {
  const index = slice.table.columns.indexOf(column);
  if (index < 0) throw new Error(`Missing column ${column} in ${slice.relativePath}`);
  return index;
}

function sliceHash(inventory: AustriaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: AustriaInventory,
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
  inventory: AustriaInventory,
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

function nonemptyCell(value: unknown): string | null {
  if (value == null) return null;
  const text = cellText(value);
  return text.length ? text : null;
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

function eventKindFromRound(value: unknown): "ordinary" | "repeated" | "unknown" {
  const text = cellText(value);
  if (
    text.startsWith("2022 cycle: decisive repeat") ||
    text.startsWith("2017 cycle: decisive repeat")
  ) {
    return "repeated";
  }
  if (text.startsWith("Ordinary") || text.startsWith("Early ordinary-cycle")) return "ordinary";
  return "unknown";
}

function ballotBasisFromText(value: unknown): "list_votes" | "valid_votes" | "unknown" {
  const text = cellText(value);
  if (text.includes("Valid council-list votes")) return "list_votes";
  if (
    text.includes("Valid candidate/list votes") ||
    text.includes("Valid mayoral candidate votes") ||
    /(^|; )Valid votes$/.test(text) ||
    text === "Valid votes"
  ) {
    return "valid_votes";
  }
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
    if (isFixtureId(value)) {
      throw new Error(`Fixture identity ${JSON.stringify(value)} rejected in ${where}`);
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

function historyDateProjection(roundBasis: unknown, yearValue: unknown): {
  label: string;
  precision: "day" | "year";
  year: number;
  month: number | null;
  day: number | null;
} {
  const exact = DAY_DATE_ALLOWLIST[cellText(roundBasis) as keyof typeof DAY_DATE_ALLOWLIST];
  if (exact) {
    return {
      label: exact.label,
      precision: "day",
      year: exact.year,
      month: exact.month,
      day: exact.day,
    };
  }
  const year = cellYear(yearValue);
  if (year == null) throw new Error(`Missing history year for ${JSON.stringify(yearValue)}`);
  return { label: String(year), precision: "year", year, month: null, day: null };
}

export function projectAustria(inventory: AustriaInventory): AustriaProjection {
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

  const jurisdictionById = new Map<string, { row: TableRow; rowIndex: number }>();
  for (let i = 0; i < inventory.jurisdictions.rows.length; i++) {
    const row = inventory.jurisdictions.rows[i]!;
    const officeId = cellText(row["Jurisdiction ID"]);
    if (jurisdictionById.has(officeId)) throw new Error(`Duplicate jurisdiction ${officeId}`);
    jurisdictionById.set(officeId, { row, rowIndex: i });
  }
  if (jurisdictionById.size !== EXPECTED_COUNTS.companion_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.companion_offices} jurisdiction rows`);
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
    companion: { row: TableRow; rowIndex: number } | null;
  }> = [];
  const officeById = new Map<(typeof officeMeta)[number]["officeId"], (typeof officeMeta)[number]>();
  const geoSeen = new Set<string>();
  let mayors = 0;
  let councils = 0;
  let stateLegislatures = 0;
  let regionalLegislatures = 0;

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (cellText(row.Country) !== "Austria") {
      throw new Error(`Office ${officeId} country is not Austria`);
    }
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    const geographyId = geographyIdFor(jurisdiction, officeType);
    const expected = EXPECTED_OFFICES[officeId];
    if (expected && (expected.jurisdiction !== jurisdiction || expected.officeType !== officeType || expected.geographyId !== geographyId)) {
      throw new Error(`Office ${officeId} geography/type mismatch`);
    }
    if (officeType === "Mayor") mayors += 1;
    else if (officeType === "Municipal council") councils += 1;
    else if (officeType === "State legislature") stateLegislatures += 1;
    else if (officeType === "Regional legislature") regionalLegislatures += 1;
    else throw new Error(`Unexpected office type ${officeType} for ${officeId}`);
    const companion = jurisdictionById.get(officeId) ?? null;
    if (!companion && !isRegionalOfficeId(officeId)) {
      throw new Error(`Missing companion jurisdiction for ${officeId}`);
    }
    if (companion && (cellText(companion.row.Jurisdiction) !== jurisdiction || cellText(companion.row.Office) !== officeType)) {
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
    if (nextDate) {
      throw new Error(`Austria must not invent a next date for ${officeId}`);
    }
    if (companion) {
      const companionNext = cellText(companion.row["Next date"]);
      if (nextDate !== companionNext) {
        throw new Error(`Next date O/J mismatch for ${officeId}`);
      }
      if (companion.row["Poll source"] != null && cellText(companion.row["Poll source"]) !== "") {
        throw new Error(`Austria must not invent poll records for ${officeId}`);
      }
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
    mayors !== EXPECTED_COUNTS.mayor_offices ||
    councils !== EXPECTED_COUNTS.municipal_council_offices ||
    stateLegislatures + regionalLegislatures !== EXPECTED_COUNTS.regional_offices
  ) {
    throw new Error(`Office type counts ${mayors}/${councils}/${stateLegislatures}/${regionalLegislatures}`);
  }
  for (const regionalId of REGIONAL_OFFICE_IDS) {
    if (!officeById.has(regionalId)) throw new Error(`Missing approved regional office ${regionalId}`);
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
    if (!registerIds.has(id)) {
      throw new Error(`Classification extra office ${id}`);
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
  const municipalApproved = tiers.filter((row) => row.tier === "municipal" && row.review_status === "approved").length;
  const regionalReview = tiers.filter((row) => row.tier === "regional" && row.review_status === "needs_review").length;
  if (municipalApproved !== EXPECTED_COUNTS.municipal_offices || regionalReview !== EXPECTED_COUNTS.regional_needs_review) {
    throw new Error(`Austria tier review counts ${municipalApproved}/${regionalReview}`);
  }
  const regionalIds = tiers.filter((row) => row.tier === "regional").map((row) => String(row.office_id)).sort();
  if (JSON.stringify(regionalIds) !== JSON.stringify([...REGIONAL_OFFICE_IDS].sort())) {
    throw new Error(`Austria regional IDs drifted: ${regionalIds.join(",")}`);
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
  const sourceLinksOrigin = locator({
    input_path: `${UNPACKED_PREFIX}/source-links.json`,
    sha256: sliceHash(inventory, `${UNPACKED_PREFIX}/source-links.json`),
    json_pointer: "/without_master_source_row",
    archive_entry: "source-links.json",
  });
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
        origin: sourceLinksOrigin,
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
    const prefixed = token.startsWith("austria--") ? token.slice("austria--".length) : null;
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

  type HistoryEntry = {
    officeId: string;
    hk: string;
    eventId: string;
    fromCompanion: boolean;
    historyIndex?: number;
    historyRow?: TableRow;
    indexRow?: Record<string, unknown>;
    indexIndex?: number;
    falseActualReturn: boolean;
    competitionIneligible: boolean;
  };
  const historyEntries: HistoryEntry[] = [];
  const historyByHk = new Map<string, HistoryEntry>();
  let falseActual = 0;
  let competitionIneligible = 0;
  for (let i = 0; i < inventory.histories.rows.length; i++) {
    const row = inventory.histories.rows[i]!;
    const officeId = cellText(row["Jurisdiction ID"]);
    if (!officeById.has(officeId)) throw new Error(`History office ${officeId} missing from register`);
    if (row["Actual election return"] === false) falseActual += 1;
    if (row["Competition eligible"] === false) competitionIneligible += 1;
    const hk = historyKey(officeId, row.Year, row["Actual ballot date, if recorded"]);
    const eventPublicId = eventIdFor(hk);
    rejectFixtures([officeId, eventPublicId, hk], "history");
    const entry: HistoryEntry = {
      officeId,
      hk,
      eventId: eventPublicId,
      fromCompanion: true,
      historyIndex: i,
      historyRow: row,
      falseActualReturn: row["Actual election return"] === false,
      competitionIneligible: row["Competition eligible"] === false,
    };
    if (historyByHk.has(hk)) throw new Error(`Duplicate history key ${hk}`);
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
  }
  if (historyEntries.length !== EXPECTED_COUNTS.companion_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.companion_histories} companion histories, found ${historyEntries.length}`);
  }
  if (falseActual !== 11 || competitionIneligible !== 12) {
    throw new Error(`Austria history limitation flags ${falseActual}/${competitionIneligible}`);
  }

  const indexKeys = new Set<string>();
  let overlap = 0;
  for (let i = 0; i < inventory.historyIndex.rows.length; i++) {
    const row = inventory.historyIndex.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    indexKeys.add(hk);
    const historical = historyByHk.get(hk);
    if (historical) {
      historical.indexRow = row;
      historical.indexIndex = i;
      overlap += 1;
      continue;
    }
    if (!officeById.has(officeId)) throw new Error(`Index-only history office ${officeId} missing from register`);
    if (!isRegionalOfficeId(officeId)) {
      throw new Error(`Unexpected index-only municipal history ${hk}`);
    }
    const eventPublicId = eventIdFor(hk);
    const entry: HistoryEntry = {
      officeId,
      hk,
      eventId: eventPublicId,
      fromCompanion: false,
      indexRow: row,
      indexIndex: i,
      falseActualReturn: false,
      competitionIneligible: false,
    };
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
  }
  if (indexKeys.size !== EXPECTED_COUNTS.index_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.index_histories} index histories, found ${indexKeys.size}`);
  }
  if (overlap !== EXPECTED_COUNTS.overlap_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.overlap_histories} overlapping histories, found ${overlap}`);
  }
  const indexOnly = historyEntries.filter((row) => !row.fromCompanion).length;
  if (indexOnly !== EXPECTED_COUNTS.index_only_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.index_only_histories} index-only histories, found ${indexOnly}`);
  }
  const selectedHistoryCount: number = historyEntries.length;
  if (selectedHistoryCount !== EXPECTED_COUNTS.selected_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.selected_histories} selected histories, found ${selectedHistoryCount}`);
  }
  if (!historyByHk.has(ST_GEORGEN_HOLD_HISTORY_KEY)) {
    throw new Error("St. Georgen 2015 hold history is missing");
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  let dayDates = 0;
  let yearDates = 0;
  for (const entry of historyEntries) {
    const yearValue = entry.fromCompanion ? entry.historyRow!.Year : entry.indexRow!.Year;
    const roundBasis = entry.fromCompanion ? entry.historyRow!["Round / basis"] : null;
    const parsed = entry.fromCompanion
      ? historyDateProjection(roundBasis, yearValue)
      : historyDateProjection(null, yearValue);
    if (parsed.precision === "day") dayDates += 1;
    else yearDates += 1;
    const dId = dateId("event", entry.eventId, "ballot");
    dates.push({
      date_id: dId,
      label: parsed.label,
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
        origin: entry.fromCompanion
          ? originFor(
              inventory.histories,
              inventory,
              entry.historyIndex!,
              cellText(roundBasis) in DAY_DATE_ALLOWLIST ? "Round / basis" : "Year",
            )
          : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex!, "Year"),
        row: { year: yearValue, round_basis: roundBasis, ballot: entry.fromCompanion ? entry.historyRow!["Actual ballot date, if recorded"] : entry.indexRow!["Ballot date if recorded"] },
        supplemental: {
          history_index: entry.indexRow ?? null,
          history_index_origin:
            entry.indexIndex == null ? null : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex, "Ballot date if recorded"),
          publication_hold: entry.hk === ST_GEORGEN_HOLD_HISTORY_KEY,
        },
      }),
    });
    const kind = entry.fromCompanion ? eventKindFromRound(roundBasis) : "unknown";
    const basis = entry.fromCompanion
      ? ballotBasisFromText(roundBasis)
      : ballotBasisFromText(entry.indexRow!["Vote basis"]);
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
      comparability: comparability(
        entry.fromCompanion ? entry.historyRow!.Coverage : entry.indexRow!.Coverage,
        entry.indexRow?.["Comparability status"],
      ),
      ballot_basis: basis,
      share_unit: "percent_0_100",
      legal_outcome: "unknown",
      record_state: "active",
      state_note: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: entry.fromCompanion
          ? originFor(inventory.histories, inventory, entry.historyIndex!)
          : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex!),
        row: entry.fromCompanion ? entry.historyRow : entry.indexRow,
        columns: entry.fromCompanion ? inventory.histories.table.columns : null,
        values: entry.fromCompanion ? inventory.histories.table.rows[entry.historyIndex!] : null,
        supplemental: {
          history_index: entry.indexRow ?? null,
          history_index_origin:
            entry.indexIndex == null ? null : indexOrigin(inventory.historyIndex, inventory, entry.indexIndex),
          actual_election_return: entry.fromCompanion ? entry.historyRow!["Actual election return"] : null,
          competition_eligible: entry.fromCompanion ? entry.historyRow!["Competition eligible"] : null,
          publication_hold: entry.hk === ST_GEORGEN_HOLD_HISTORY_KEY,
          index_only: !entry.fromCompanion,
        },
      }),
    });
  }
  if (dayDates !== EXPECTED_COUNTS.historical_dates_day || yearDates !== EXPECTED_COUNTS.historical_dates_year) {
    throw new Error(`Austria date precision counts ${dayDates}/${yearDates}`);
  }
  if (dates.length !== EXPECTED_COUNTS.research_dates || events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected 5956 dates/events, found ${dates.length}/${events.length}`);
  }

  const offices: SqlRow[] = officeMeta.map((office) => ({
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
    next_date_id: null,
    next_date_resolution: "unknown",
    next_history_key: null,
    lineage_id: L,
    release_id: R,
    raw_json: rawEnvelope({
      origin: originFor(inventory.officeRegister, inventory, office.rowIndex),
      row: office.row,
      columns: inventory.officeRegister.table.columns,
      values: inventory.officeRegister.table.rows[office.rowIndex],
      supplemental: {
        jurisdiction: office.companion?.row ?? null,
        briefing_path: unpackedPath(`Office_Briefings/Offices/${office.officeId}.html`),
      },
    }),
  }));
  const unknownNext = offices.filter((row) => row.next_date_id == null).length;
  if (unknownNext !== EXPECTED_COUNTS.unknown_next_dates) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unknown_next_dates} unknown next dates, found ${unknownNext}`);
  }

  const results: SqlRow[] = [];
  const resultIndex = new Map<string, number>();
  let seatsPositive = 0;
  let seatsZero = 0;
  let seatsMissing = 0;
  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const row = inventory.returns.rows[i]!;
    const officeId = cellText(row["Jurisdiction ID"]);
    const hk = historyKey(officeId, row.Year, row["Actual ballot date, if recorded"]);
    const history = historyByHk.get(hk);
    if (!history || !history.fromCompanion) throw new Error(`Result row does not match a companion history: ${hk}`);
    const next = resultIndex.get(history.eventId) ?? 0;
    resultIndex.set(history.eventId, next + 1);
    const resultId = `${history.eventId}-r${next}`;
    const votes = numericInteger(row.Votes, `votes ${resultId}`);
    const share = numericShare(row.Share, `share ${resultId}`);
    const seats = numericInteger(row.Seats, `seats ${resultId}`);
    if (votes.value == null || votes.status !== "recorded") {
      throw new Error(`Austria baseline votes must all be recorded positives (${resultId})`);
    }
    if (share.value == null || share.status !== "recorded") {
      throw new Error(`Austria baseline shares must all be recorded positives (${resultId})`);
    }
    if (seats.status === "recorded") seatsPositive += 1;
    else if (seats.status === "zero") seatsZero += 1;
    else seatsMissing += 1;
    const year = cellYear(row.Year);
    const party = nonemptyCell(row["Party / list"]);
    const candidate = nonemptyCell(row["Candidate / ticket"]);
    results.push({
      id_namespace: N,
      office_id: officeId,
      history_key: hk,
      result_row_id: resultId,
      proceeding_id: null,
      country_id: COUNTRY_ID,
      candidate_or_list_label: candidate ?? party,
      original_party_label: party,
      original_party_code: party,
      party_namespace: year == null ? "unknown" : `austria/${year}`,
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
        supplemental: {
          publication_hold: hk === ST_GEORGEN_HOLD_HISTORY_KEY,
        },
      }),
    });
  }
  if (results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} result rows, found ${results.length}`);
  }
  if (
    seatsPositive !== EXPECTED_COUNTS.seats_positive ||
    seatsZero !== EXPECTED_COUNTS.seats_zero ||
    seatsMissing !== EXPECTED_COUNTS.seats_missing
  ) {
    throw new Error(`Austria seat counts ${seatsPositive}/${seatsZero}/${seatsMissing}`);
  }
  const holdResults = results.filter((row) => row.history_key === ST_GEORGEN_HOLD_HISTORY_KEY);
  if (holdResults.length !== 4) {
    throw new Error(`St. Georgen 2015 must retain four first-ballot rows, found ${holdResults.length}`);
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
        historical?.fromCompanion
          ? originFor(inventory.histories, inventory, historical.historyIndex!)
          : indexOrigin(inventory.historyIndex, inventory, historical!.indexIndex!),
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
    if (entry.fromCompanion && entry.historyRow && entry.historyIndex != null) {
      const idToken = cellText(entry.historyRow["Source ID"]);
      const urlToken = cellText(entry.historyRow["Result source URL"]);
      const idLoc = originFor(inventory.histories, inventory, entry.historyIndex, "Source ID");
      const urlLoc = originFor(inventory.histories, inventory, entry.historyIndex, "Result source URL");
      const fromId = resolveCitation(idToken, rec, idLoc, `history ${entry.hk} source id`, entry.historyRow);
      const fromUrl = resolveCitation(urlToken, rec, urlLoc, `history ${entry.hk} url`, entry.historyRow);
      const sourceId = requireSameResolved(fromId, fromUrl, `history ${entry.hk}`);
      if (sourceId) {
        addEvidence({ recordKey: rec, sourceId, loc: urlLoc, claimKind: "event", claim: { token: urlToken, row: entry.historyRow } });
        addEvidence({
          recordKey: rec,
          sourceId,
          loc: urlLoc,
          claimKind: "date",
          dateClaimId: dateId("event", entry.eventId, "ballot"),
          claim: { year: entry.historyRow.Year, round_basis: entry.historyRow["Round / basis"] },
        });
      }
    }
    if (entry.indexRow && entry.indexIndex != null) {
      const ixUrl = cellText(entry.indexRow["Source URL"]);
      if (ixUrl) {
        const ixLoc = indexOrigin(inventory.historyIndex, inventory, entry.indexIndex, "Source URL");
        const ixSource = resolveCitation(ixUrl, rec, ixLoc, `index ${entry.hk} url`, entry.indexRow);
        if (ixSource) {
          addEvidence({
            recordKey: rec,
            sourceId: ixSource,
            loc: ixLoc,
            claimKind: "event",
            claim: { token: ixUrl, row: entry.indexRow, publication_hold: entry.hk === ST_GEORGEN_HOLD_HISTORY_KEY },
          });
        }
      }
    }
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

  if (inventory.pollingEvidence.rows.length !== EXPECTED_COUNTS.poll_records_retained) {
    throw new Error("Austria must retain exactly one polling-evidence row as input");
  }
  const pollUrl = cellText(inventory.pollingEvidence.rows[0]!["Source URL"]);
  if (pollUrl) {
    const pollInputKey = recordKey("input", [L, inventory.pollingEvidence.relativePath]);
    const loc = originFor(inventory.pollingEvidence, inventory, 0, "Source URL");
    const sourceId = resolveCitation(pollUrl, pollInputKey, loc, "polling evidence", inventory.pollingEvidence.rows[0]);
    if (sourceId) {
      addEvidence({
        recordKey: pollInputKey,
        sourceId,
        loc,
        claimKind: "poll",
        claim: { token: pollUrl, row: inventory.pollingEvidence.rows[0] },
      });
    }
  }

  for (const office of officeMeta) {
    const officeRec = recordKey("office", [N, office.officeId]);
    if (office.calendarEvidence) {
      const loc = originFor(inventory.officeRegister, inventory, office.rowIndex, "Calendar evidence");
      const sourceId = resolveCitation(office.calendarEvidence, officeRec, loc, `office calendar ${office.officeId}`, office.row);
      if (sourceId) {
        addEvidence({
          recordKey: officeRec,
          sourceId,
          loc,
          claimKind: "calendar_context",
          claim: { token: office.calendarEvidence, office_date: null },
        });
      }
    }
    if (office.companion) {
      const jLoc = originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Calendar source");
      const jToken = cellText(office.companion.row["Calendar source"]);
      if (jToken) {
        const jSource = resolveCitation(jToken, officeRec, jLoc, `jurisdiction calendar ${office.officeId}`, office.companion.row);
        if (jSource) {
          addEvidence({
            recordKey: officeRec,
            sourceId: jSource,
            loc: jLoc,
            claimKind: "calendar_context",
            claim: { token: jToken, notes_locator: originFor(inventory.jurisdictions, inventory, office.companion.rowIndex, "Notes") },
          });
        }
      }
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
    crosswalkKeys.add(pk);
    crosswalks.push(row);
  }

  addCrosswalk({
    entity_kind: "country",
    upstream_namespace: "observatory:austria",
    upstream_id: "austria",
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
      upstream_namespace: "austria:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:austria",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "austria:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id, geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:austria",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "austria:briefing",
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
    const origin = historical?.fromCompanion
      ? originFor(inventory.histories, inventory, historical.historyIndex!)
      : indexOrigin(inventory.historyIndex, inventory, historical!.indexIndex!);
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "austria:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { history_key: event.history_key } }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:austria",
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
      upstream_namespace: "observatory:austria",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { result_row_id: result.result_row_id } }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "austria:baseline-result-row",
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
      upstream_namespace: "austria:result-identity",
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
      upstream_namespace: "austria:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(originSlice, inventory, info.origins[0]!.index), row: info.origins[0]!.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:austria",
      upstream_id: sourceId,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: originFor(originSlice, inventory, info.origins[0]!.index), row: info.origins[0]!.row }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "austria:source-url",
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
      upstream_namespace: "observatory:austria",
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
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "austria:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: sourceLinksOrigin, row: { url } }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:austria",
      upstream_id: sourceId,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: sourceLinksOrigin, row: { url, source_id: sourceId } }),
    });
  }

  const officeBriefings = inventory.tracked.filter(
    (item) =>
      item.input_path.startsWith(`${UNPACKED_PREFIX}/Office_Briefings/Offices/`) && item.input_path.endsWith(".html"),
  ).length;
  const countryBriefings = inventory.tracked.filter(
    (item) => item.input_path === `${UNPACKED_PREFIX}/Office_Briefings/austria.html`,
  ).length;
  if (officeBriefings !== EXPECTED_COUNTS.office_briefings_retained || countryBriefings !== EXPECTED_COUNTS.country_briefings_retained) {
    throw new Error(`Expected 2038 office + 1 country briefings, found ${officeBriefings}/${countryBriefings}`);
  }

  const validatedCounts = {
    current_offices: offices.length,
    historical_offices: 0,
    geographies: geographies.length,
    mayor_offices: mayors,
    municipal_council_offices: councils,
    companion_offices: EXPECTED_COUNTS.companion_offices,
    companion_histories: EXPECTED_COUNTS.companion_histories,
    index_histories: EXPECTED_COUNTS.index_histories,
    overlap_histories: overlap,
    index_only_histories: indexOnly,
    selected_histories: historyEntries.length,
    prospective_events: 0,
    total_events: events.length,
    research_dates: dates.length,
    historical_dates_day: dayDates,
    historical_dates_year: yearDates,
    result_rows: results.length,
    unknown_next_dates: unknownNext,
    control_observations_supplied: 0,
    poll_records_retained: EXPECTED_COUNTS.poll_records_retained,
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
    unresolved_evidence: unresolved.length,
  };
  if (validatedCounts.regional_offices !== 4 || validatedCounts.municipal_offices !== 2034) {
    throw new Error("Austria must have 2034 municipal and 4 regional offices");
  }
  if (validatedCounts.prospective_events !== 0) {
    throw new Error("Austria must not invent prospective events");
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Austria frozen country package",
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
