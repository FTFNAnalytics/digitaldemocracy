import type { TableRow } from "../../observatory/adapters/tables";
import type { BulgariaInventory, HistoryIndexSlice, WorkbookSlice } from "./inventory";
import {
  AVREN_MAYOR_2023_DATE_ID,
  AVREN_MAYOR_2023_EVENT_ID,
  AVREN_MAYOR_2023_HISTORY_KEY,
  COUNTRY_CODE,
  COUNTRY_ID,
  EXPECTED_COUNTS,
  EXPECTED_OFFICES,
  GRADEC_FIRST_ROUND_ROW_INDEXES,
  GRADEC_OFFICE_ID,
  HELD_EXAMPLE_OFFICE_IDS,
  INLINE_ONLY_URLS,
  LINEAGE_ID,
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
  isApprovedOfficeType,
  isFixtureId,
  isHeldOfficeType,
  isHttpUrl,
  legacyGeographyIdFor,
  locator,
  occurrenceIdentity,
  rawEnvelope,
  recordKey,
  unpackedPath,
  unresolvedId,
  urlSourceId,
  type Locator,
} from "./identity";

export type SqlRow = Record<string, unknown>;

export type BulgariaProjection = {
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

function columnIndex(slice: WorkbookSlice, column: string): number {
  const index = slice.table.columns.indexOf(column);
  if (index < 0) throw new Error(`Missing column ${column} in ${slice.relativePath}`);
  return index;
}

function sliceHash(inventory: BulgariaInventory, relativePath: string): string {
  const item = inventory.byPath.get(relativePath);
  if (!item) throw new Error(`Missing retained input ${relativePath}`);
  return item.sha256;
}

function originFor(
  slice: WorkbookSlice,
  inventory: BulgariaInventory,
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
  inventory: BulgariaInventory,
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

function numericInteger(value: unknown, label: string): { value: number | null; status: string } {
  if (value == null || value === "") return { value: null, status: "unknown" };
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a finite nonnegative integer or null`);
  }
  return { value, status: value === 0 ? "zero" : "recorded" };
}

function numericShare(value: unknown, label: string): { value: number | null; status: string } {
  if (value == null || value === "") return { value: null, status: "unknown" };
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be a finite 0..100 number or null`);
  }
  return { value, status: value === 0 ? "zero" : "recorded" };
}

function ballotBasis(value: unknown): "list_votes" | "valid_votes" | "unknown" {
  const text = cellText(value);
  if (text === "Votes for electoral lists, excluding none-of-the-above") return "list_votes";
  if (
    text === "Votes for named candidates, excluding none-of-the-above" ||
    text === "Votes for named candidates"
  ) {
    return "valid_votes";
  }
  if (text === "Official rounded candidate percentages; vote counts unavailable") return "unknown";
  throw new Error(`Unsupported Bulgaria vote basis ${JSON.stringify(value)}`);
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
    if (isFixtureId(value)) {
      throw new Error(`Fixture identity ${JSON.stringify(value)} rejected in ${where}`);
    }
  }
}

function parseDayLabel(label: string): { precision: "day"; year: number; month: number; day: number } {
  const match = ISO_DAY.exec(label.trim());
  if (!match) {
    throw new Error(`Baseline event date is not a valid ISO day: ${JSON.stringify(label)}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return { precision: "day", year, month, day };
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

function classificationAccepted(row: { human_review_required?: boolean }): boolean {
  return row.human_review_required === false;
}

export function projectBulgaria(inventory: BulgariaInventory): BulgariaProjection {
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
        importer_policy: inventory.tiers.importer_policy ?? null,
        counts_by_approval: inventory.tiers.counts_by_approval ?? null,
      },
    }),
  };

  const officeRows = inventory.officeRegister.rows;
  if (officeRows.length !== EXPECTED_COUNTS.register_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.register_offices} register offices, found ${officeRows.length}`);
  }
  if (inventory.companionRegister.rows.length !== EXPECTED_COUNTS.companion_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.companion_offices} companion offices`);
  }
  for (let i = 0; i < officeRows.length; i++) {
    const master = officeRows[i]!;
    const companion = inventory.companionRegister.rows[i]!;
    for (const column of inventory.officeRegister.table.columns) {
      if (master[column] !== companion[column]) {
        throw new Error(`O/J mismatch at row ${i} column ${column}`);
      }
    }
  }

  const classifications = inventory.tiers.classifications;
  if (classifications.length !== EXPECTED_COUNTS.register_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.register_offices} classifications, found ${classifications.length}`);
  }
  const classById = new Map(classifications.map((row, index) => [row.office_id, { row, index }]));
  const approvedIds = new Set(
    classifications.filter((row) => classificationAccepted(row)).map((row) => row.office_id),
  );
  const heldIds = new Set(classifications.filter((row) => !classificationAccepted(row)).map((row) => row.office_id));
  if (approvedIds.size !== EXPECTED_COUNTS.current_offices || heldIds.size !== EXPECTED_COUNTS.held_offices) {
    throw new Error(`Approval split ${approvedIds.size}/${heldIds.size}`);
  }
  if (inventory.tiers.counts_by_approval?.production_approved_municipal !== EXPECTED_COUNTS.current_offices) {
    throw new Error("counts_by_approval.production_approved_municipal must stay 530");
  }
  if (inventory.tiers.counts_by_approval?.held_submunicipal_scope !== EXPECTED_COUNTS.held_offices) {
    throw new Error("counts_by_approval.held_submunicipal_scope must stay 3067");
  }
  if (inventory.tiers.counts_by_approval?.regional !== 0) {
    throw new Error("Bulgaria must not invent a regional approval bucket");
  }
  if (inventory.tiers.importer_policy?.load !== "production_approved_rows_only") {
    throw new Error("Importer policy must remain production_approved_rows_only");
  }

  for (const officeId of HELD_EXAMPLE_OFFICE_IDS) {
    if (approvedIds.has(officeId) || !heldIds.has(officeId)) {
      throw new Error(`Held research office ${officeId} must not be production-approved`);
    }
  }
  if (approvedIds.has(GRADEC_OFFICE_ID)) {
    throw new Error("Градец village office must remain held");
  }

  const geographies: SqlRow[] = [];
  const officeMeta: Array<{
    officeId: string;
    geographyId: string;
    legacyGeographyId: string;
    rowIndex: number;
    row: TableRow;
    jurisdiction: string;
    officeType: string;
    historicalCoverage: string;
    calendarEvidence: string;
    approved: boolean;
  }> = [];
  const officeById = new Map<(typeof officeMeta)[number]["officeId"], (typeof officeMeta)[number]>();
  const legacyCounts = new Map<string, string[]>();
  let mayors = 0;
  let councils = 0;
  let districtMayors = 0;
  let villageMayors = 0;

  for (let i = 0; i < officeRows.length; i++) {
    const row = officeRows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (cellText(row.Country) !== "Bulgaria") {
      throw new Error(`Office ${officeId} country is not Bulgaria`);
    }
    const jurisdiction = cellText(row.Jurisdiction);
    const officeType = cellText(row.Office);
    const classification = classById.get(officeId);
    if (!classification) throw new Error(`Classification missing office ${officeId}`);
    const approved = classificationAccepted(classification.row);
    if (isApprovedOfficeType(officeType)) {
      if (!approved) throw new Error(`Municipality-wide ${officeId} must be accepted`);
      if (officeType === "Mayor") mayors += 1;
      else councils += 1;
    } else if (isHeldOfficeType(officeType)) {
      if (approved) throw new Error(`Held ${officeType} ${officeId} must not be accepted`);
      if (officeType === "District mayor") districtMayors += 1;
      else villageMayors += 1;
    } else {
      throw new Error(`Unexpected office type ${officeType} for ${officeId}`);
    }
    if (cellText(row["Next polling date"])) {
      throw new Error(`Bulgaria must not invent a next date for ${officeId}`);
    }
    const geographyId = geographyIdFor(officeId);
    const legacyGeographyId = legacyGeographyIdFor(jurisdiction, officeType);
    const owners = legacyCounts.get(legacyGeographyId) ?? [];
    owners.push(officeId);
    legacyCounts.set(legacyGeographyId, owners);
    const expected = EXPECTED_OFFICES[officeId];
    if (
      expected &&
      (expected.jurisdiction !== jurisdiction ||
        expected.officeType !== officeType ||
        expected.geographyId !== geographyId)
    ) {
      throw new Error(`Office ${officeId} geography/type mismatch`);
    }
    const meta = {
      officeId,
      geographyId,
      legacyGeographyId,
      rowIndex: i,
      row,
      jurisdiction,
      officeType,
      historicalCoverage: cellText(row["Historical coverage"]),
      calendarEvidence: cellText(row["Calendar evidence"]),
      approved,
    };
    officeMeta.push(meta);
    officeById.set(officeId, meta);
  }
  if (
    mayors !== EXPECTED_COUNTS.mayor_offices ||
    councils !== EXPECTED_COUNTS.municipal_council_offices ||
    districtMayors !== EXPECTED_COUNTS.district_mayor_offices ||
    villageMayors !== EXPECTED_COUNTS.village_mayor_offices
  ) {
    throw new Error(`Office type counts ${mayors}/${councils}/${districtMayors}/${villageMayors}`);
  }
  if (officeById.size !== EXPECTED_COUNTS.register_offices) {
    throw new Error("Duplicate office IDs in the Bulgaria register");
  }
  for (const id of classById.keys()) {
    if (!officeById.has(id)) throw new Error(`Classification extra office ${id}`);
  }

  const publishedOffices = officeMeta.filter((row) => row.approved);
  if (publishedOffices.length !== EXPECTED_COUNTS.current_offices) {
    throw new Error(`Expected ${EXPECTED_COUNTS.current_offices} approved offices, found ${publishedOffices.length}`);
  }
  for (const office of publishedOffices) {
    geographies.push({
      country_id: COUNTRY_ID,
      geography_id: office.geographyId,
      name: office.jurisdiction,
      parent_geography_id: null,
      effective_from_label: null,
      effective_to_label: null,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(inventory.officeRegister, inventory, office.rowIndex),
        row: office.row,
        columns: inventory.officeRegister.table.columns,
        values: inventory.officeRegister.table.rows[office.rowIndex],
        supplemental: {
          geography_rule: "key(geo,[bulgaria,exact_office_id])",
          legacy_name_type_geography_id: office.legacyGeographyId,
          legacy_alias_safe: (legacyCounts.get(office.legacyGeographyId) ?? []).length === 1,
        },
      }),
    });
  }
  if (geographies.length !== EXPECTED_COUNTS.geographies) {
    throw new Error(`Expected ${EXPECTED_COUNTS.geographies} geographies, found ${geographies.length}`);
  }

  const ablanitsa = ["BG-BLG52-fc5837f6a1-V", "BG-PAZ08-fc5837f6a1-V"].map((id) => officeById.get(id)!);
  if (ablanitsa[0]!.legacyGeographyId !== ablanitsa[1]!.legacyGeographyId) {
    throw new Error("Ablanitsa village pair must share an unsafe legacy geography key");
  }
  if ((legacyCounts.get(ablanitsa[0]!.legacyGeographyId) ?? []).length < 2) {
    throw new Error("Ablanitsa collision group was lost");
  }

  const tierSha = inventory.byPath.get(TIER_PATH)!.sha256;
  const tiers: SqlRow[] = [];
  for (const office of publishedOffices) {
    const classification = classById.get(office.officeId)!;
    const mapped = mapTier(classification.row.tier);
    if (mapped !== "municipal") {
      throw new Error(`Approved Bulgaria office ${office.officeId} must stay municipal`);
    }
    if (classification.row.human_review_required !== false || classification.row.tier_uncertain === true) {
      throw new Error(`Approved office ${office.officeId} still carries a focused review flag`);
    }
    tiers.push({
      id_namespace: N,
      office_id: office.officeId,
      tier: mapped,
      review_status: "approved",
      rationale: classification.row.rationale,
      lineage_id: L,
      release_id: R,
      classification_path: TIER_PATH,
      classification_kind: "tier_classification",
      classification_sha256: tierSha,
      raw_json: rawEnvelope({
        origin: locator({
          input_path: TIER_PATH,
          sha256: tierSha,
          json_pointer: `/classifications/${classification.index}`,
        }),
        row: classification.row,
      }),
    });
  }
  if (tiers.some((row) => row.tier === "regional") || tiers.length !== EXPECTED_COUNTS.municipal_offices) {
    throw new Error("Bulgaria must publish 530 approved municipal tiers and 0 regional");
  }
  const openNotes = (inventory.tiers.notes ?? []).filter((note) => note.status === "open").map((note) => note.scope);
  for (const scope of [
    "submunicipal_tier_policy_and_2027_roster",
    "qualification_change",
    "country_research_watch",
    "partial_selected_history",
    "unresolved_outcomes",
  ]) {
    if (!openNotes.includes(scope)) {
      throw new Error(`Prompt P research hold ${scope} must remain open`);
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
      const originalId = cellText(row["Source ID"]);
      const title = cellText(row.Title);
      const url = cellText(row["Source URL"]);
      const grade = cellText(row["Evidence grade"]);
      const accessed = cellText(row.Accessed);
      if (!originalId || !isHttpUrl(url)) {
        throw new Error(`${kind} catalogue row ${i} missing Source ID or HTTP URL`);
      }
      rejectFixtures([originalId], `${kind} source catalogue`);
      const existing = catalogueById.get(originalId);
      if (existing) {
        if (
          existing.title !== title ||
          existing.url !== url ||
          existing.grade !== grade ||
          existing.accessed !== accessed
        ) {
          throw new Error(`Catalogue metadata disagreement for ${originalId}`);
        }
        existing.origins.push({ kind, row, index: i });
        continue;
      }
      if (catalogueByUrl.has(url)) {
        throw new Error(`Duplicate catalogue URL ${url}`);
      }
      const sourceId = catalogueSourceId(originalId);
      catalogueById.set(originalId, {
        sourceId,
        originalId,
        title,
        url,
        grade,
        accessed,
        origins: [{ kind, row, index: i }],
      });
      catalogueByUrl.set(url, sourceId);
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
  if (JSON.stringify([...inlineUrls].sort()) !== JSON.stringify([...INLINE_ONLY_URLS].sort())) {
    throw new Error(`Inline-only URLs drifted: ${inlineUrls.join(",")}`);
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

  const unresolved: SqlRow[] = [];
  function addUnresolved(args: {
    recordKey: string;
    loc: Locator;
    token: string;
    reason: string;
    row: unknown;
  }): void {
    unresolved.push({
      unresolved_id: unresolvedId(args.recordKey, occurrenceIdentity(args.loc), args.token),
      record_key: args.recordKey,
      occurrence_json: canonical(occurrenceIdentity(args.loc)),
      original_token: args.token,
      reason: args.reason,
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: args.loc, row: args.row }),
    });
  }

  function tryResolve(token: string): string | null {
    if (!token) return null;
    if (catalogueById.has(token)) return catalogueById.get(token)!.sourceId;
    const prefixed = token.startsWith("bulgaria--") ? token.slice("bulgaria--".length) : null;
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

  if (inventory.histories.rows.length !== EXPECTED_COUNTS.companion_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.companion_histories} companion histories`);
  }
  if (inventory.historyIndex.rows.length !== EXPECTED_COUNTS.index_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.index_histories} history-index rows`);
  }

  type HistoryEntry = {
    officeId: string;
    hk: string;
    eventId: string;
    rowIndex: number;
    row: TableRow;
    indexRow?: Record<string, unknown>;
    indexIndex?: number;
    approved: boolean;
  };
  const historyEntries: HistoryEntry[] = [];
  const historyByHk = new Map<string, HistoryEntry>();
  for (let i = 0; i < inventory.histories.rows.length; i++) {
    const row = inventory.histories.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    if (!officeById.has(officeId)) throw new Error(`History office ${officeId} missing from register`);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const eventPublicId = eventIdFor(hk);
    rejectFixtures([officeId, eventPublicId, hk], "history");
    const entry: HistoryEntry = {
      officeId,
      hk,
      eventId: eventPublicId,
      rowIndex: i,
      row,
      approved: approvedIds.has(officeId),
    };
    if (historyByHk.has(hk)) throw new Error(`Duplicate history key ${hk}`);
    historyByHk.set(hk, entry);
    historyEntries.push(entry);
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
  if (indexKeys.size !== EXPECTED_COUNTS.overlap_histories) {
    throw new Error("H and IX key sets must be identical 8661");
  }
  for (const hk of historyByHk.keys()) {
    if (!indexKeys.has(hk)) throw new Error(`Selected history ${hk} missing from history-index`);
  }

  const publishedHistories = historyEntries.filter((row) => row.approved);
  if (publishedHistories.length !== EXPECTED_COUNTS.selected_histories) {
    throw new Error(`Expected ${EXPECTED_COUNTS.selected_histories} approved histories, found ${publishedHistories.length}`);
  }
  if (historyEntries.length - publishedHistories.length !== EXPECTED_COUNTS.held_histories) {
    throw new Error("Held history count drifted");
  }

  const dates: SqlRow[] = [];
  const events: SqlRow[] = [];
  let listVotes = 0;
  let validVotes = 0;
  for (const entry of publishedHistories) {
    const ballot = cellText(entry.row["Ballot date if recorded"]);
    const parsed = parseDayLabel(ballot);
    const year = cellYear(entry.row.Year);
    if (year !== parsed.year) {
      throw new Error(`Year mismatch for ${entry.hk}`);
    }
    const dId = dateId("event", entry.eventId, "ballot");
    dates.push({
      date_id: dId,
      label: ballot,
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
    if (basis === "list_votes") listVotes += 1;
    else if (basis === "valid_votes") validVotes += 1;
    else throw new Error(`Approved history ${entry.hk} must not be percentage-only`);
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
  if (listVotes !== 795 || validVotes !== 795) {
    throw new Error(`Approved ballot-basis counts ${listVotes}/${validVotes}`);
  }
  if (dates.length !== EXPECTED_COUNTS.research_dates || events.length !== EXPECTED_COUNTS.total_events) {
    throw new Error(`Expected 1590 dates/events, found ${dates.length}/${events.length}`);
  }

  const avren = events.find((row) => row.history_key === AVREN_MAYOR_2023_HISTORY_KEY);
  if (
    !avren ||
    String(avren.event_id) !== AVREN_MAYOR_2023_EVENT_ID ||
    String(avren.date_id) !== AVREN_MAYOR_2023_DATE_ID
  ) {
    throw new Error("BG-VAR01-M 2023 identity mismatch");
  }

  const calRow = inventory.calendar.rows[0];
  if (!calRow) throw new Error("Missing election-calendar row");
  if (cellText(calRow["First or scheduled date"]) || cellText(calRow["End or runoff date"])) {
    throw new Error("Calendar must not invent a scheduled/end date");
  }
  if (cellText(calRow.Tier) === "regional" || cellText(calRow.Tier) === "municipal") {
    throw new Error("Calendar cohort Tier must not classify offices");
  }
  if (cellText(calRow["Source URL"]) !== "https://www.cik.bg/") {
    throw new Error("Calendar source URL must remain the CIK homepage");
  }

  const offices: SqlRow[] = publishedOffices.map((office) => ({
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
        briefing_path: unpackedPath(`Office_Briefings/Offices/${office.officeId}.html`),
        companion_origin: originFor(inventory.companionRegister, inventory, office.rowIndex),
        calendar_origin: originFor(inventory.calendar, inventory, 0),
      },
    }),
  }));

  if (inventory.firstRound.rows.length !== EXPECTED_COUNTS.first_round_retained_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.first_round_retained_rows} first-round rows`);
  }
  if (inventory.unresolvedHistory.rows.length !== EXPECTED_COUNTS.unresolved_retained_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.unresolved_retained_rows} unresolved-history rows`);
  }
  for (const index of GRADEC_FIRST_ROUND_ROW_INDEXES) {
    const row = inventory.firstRound.rows[index];
    if (!row || cellText(row["Office ID"]) !== GRADEC_OFFICE_ID) {
      throw new Error(`Градец first-round row ${index} must remain unbound retained input`);
    }
  }
  const gradecHistories = historyEntries.filter((row) => row.officeId === GRADEC_OFFICE_ID);
  if (gradecHistories.length !== 0) {
    throw new Error("Градец must not have a selected H row in this snapshot");
  }
  const gradecX = inventory.unresolvedHistory.rows.filter(
    (row) => cellText(row["Office ID"]) === GRADEC_OFFICE_ID,
  );
  if (gradecX.length !== 2) {
    throw new Error(`Градец unresolved runoff rows ${gradecX.length}`);
  }
  if (
    !gradecX.every(
      (row) => cellText(row.Phase) === "Historical runoff with unresolved qualification change",
    )
  ) {
    throw new Error("Градец X rows must keep the qualification-change phase");
  }

  const results: SqlRow[] = [];
  const resultBindings: Array<{ row: TableRow; index: number }> = [];
  const resultIndex = new Map<string, number>();
  let votesRecorded = 0;
  let votesZero = 0;
  let sharesRecorded = 0;
  let sharesZero = 0;
  let seatsRecorded = 0;
  let seatsZero = 0;
  let heldResults = 0;
  for (let i = 0; i < inventory.returns.rows.length; i++) {
    const row = inventory.returns.rows[i]!;
    const officeId = cellText(row["Office ID"]);
    const hk = historyKey(officeId, row.Year, row["Ballot date if recorded"]);
    const history = historyByHk.get(hk);
    if (!history) throw new Error(`Result row does not match a selected history: ${hk}`);
    if (!history.approved) {
      heldResults += 1;
      continue;
    }
    const next = resultIndex.get(history.eventId) ?? 0;
    resultIndex.set(history.eventId, next + 1);
    const resultId = `${history.eventId}-r${next}`;
    const votes = numericInteger(row["Votes or marks"], `votes ${resultId}`);
    const share = numericShare(row["Share on stated basis"], `share ${resultId}`);
    const seats = numericInteger(row.Seats, `seats ${resultId}`);
    if (votes.status === "recorded") votesRecorded += 1;
    else if (votes.status === "zero") votesZero += 1;
    if (share.status === "recorded") sharesRecorded += 1;
    else if (share.status === "zero") sharesZero += 1;
    if (seats.status === "recorded") seatsRecorded += 1;
    else if (seats.status === "zero") seatsZero += 1;
    else throw new Error(`Approved result ${resultId} must not have missing seats`);
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
    resultBindings.push({ row, index: i });
  }
  if (results.length !== EXPECTED_COUNTS.result_rows) {
    throw new Error(`Expected ${EXPECTED_COUNTS.result_rows} approved result rows, found ${results.length}`);
  }
  if (heldResults !== EXPECTED_COUNTS.held_result_rows) {
    throw new Error(`Held detailed-return rows ${heldResults}`);
  }
  if (
    votesRecorded !== EXPECTED_COUNTS.votes_recorded ||
    votesZero !== EXPECTED_COUNTS.votes_zero ||
    sharesRecorded !== EXPECTED_COUNTS.shares_recorded ||
    sharesZero !== EXPECTED_COUNTS.shares_zero ||
    seatsRecorded !== EXPECTED_COUNTS.seats_recorded ||
    seatsZero !== EXPECTED_COUNTS.seats_zero
  ) {
    throw new Error(
      `Approved numeric counts votes ${votesRecorded}/${votesZero} shares ${sharesRecorded}/${sharesZero} seats ${seatsRecorded}/${seatsZero}`,
    );
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
    const historical = historyByHk.get(String(event.history_key))!;
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
      source_row_locator: canonical(originFor(inventory.histories, inventory, historical.rowIndex)),
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

  for (const entry of publishedHistories) {
    const rec = recordKey("event", [N, entry.officeId, entry.hk]);
    const urlToken = cellText(entry.row["Source URL"]);
    if (urlToken) {
      const loc = originFor(inventory.histories, inventory, entry.rowIndex, "Source URL");
      const sourceId = resolveCitation(urlToken, rec, loc, `history ${entry.hk} url`, entry.row);
      if (sourceId) {
        addEvidence({
          recordKey: rec,
          sourceId,
          loc,
          claimKind: "event",
          claim: { token: urlToken, row: entry.row },
        });
        addEvidence({
          recordKey: rec,
          sourceId,
          loc,
          claimKind: "date",
          dateClaimId: dateId("event", entry.eventId, "ballot"),
          claim: { year: entry.row.Year, ballot: entry.row["Ballot date if recorded"] },
        });
      }
    }
  }
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    const binding = resultBindings[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const urlToken = cellText(binding.row["Source URL"]);
    if (!urlToken) continue;
    const loc = originFor(inventory.returns, inventory, binding.index, "Source URL");
    const sourceId = resolveCitation(urlToken, rec, loc, `result ${result.result_row_id} url`, binding.row);
    if (!sourceId) continue;
    addEvidence({
      recordKey: rec,
      sourceId,
      loc,
      claimKind: "result",
      claim: { token: urlToken, row: binding.row },
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
  const calUrl = cellText(calRow["Source URL"]);
  if (calUrl) {
    const calInputKey = recordKey("input", [L, inventory.calendar.relativePath]);
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
  for (const office of publishedOffices) {
    if (!office.calendarEvidence) continue;
    const officeRec = recordKey("office", [N, office.officeId]);
    const loc = originFor(inventory.officeRegister, inventory, office.rowIndex, "Calendar evidence");
    const sourceId = resolveCitation(
      office.calendarEvidence,
      officeRec,
      loc,
      `office calendar ${office.officeId}`,
      office.row,
    );
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

  const publishedBriefingPaths = new Set([
    unpackedPath("Office_Briefings/bulgaria.html"),
    ...publishedOffices.map((office) => unpackedPath(`Office_Briefings/Offices/${office.officeId}.html`)),
  ]);
  for (const item of inventory.tracked.filter((row) => publishedBriefingPaths.has(row.input_path))) {
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

  const firstRoundInputKey = recordKey("input", [L, inventory.firstRound.relativePath]);
  for (const index of GRADEC_FIRST_ROUND_ROW_INDEXES) {
    const row = inventory.firstRound.rows[index]!;
    const urlToken = cellText(row["Source URL"]);
    const loc = originFor(inventory.firstRound, inventory, index, "Source URL");
    const sourceId = resolveCitation(urlToken, firstRoundInputKey, loc, `Градец F${index}`, row);
    if (sourceId) {
      addEvidence({
        recordKey: firstRoundInputKey,
        sourceId,
        loc,
        claimKind: "retained_stage_observation",
        claim: {
          office_id: GRADEC_OFFICE_ID,
          row_index: index,
          disposition: "retained_input_only_no_typed_event_proceeding_or_result",
        },
      });
    }
  }
  const unresolvedInputKey = recordKey("input", [L, inventory.unresolvedHistory.relativePath]);
  for (let i = 0; i < inventory.unresolvedHistory.rows.length; i++) {
    const row = inventory.unresolvedHistory.rows[i]!;
    if (cellText(row["Office ID"]) !== GRADEC_OFFICE_ID) continue;
    const urlToken = cellText(row["Source URL"]);
    const loc = originFor(inventory.unresolvedHistory, inventory, i, "Source URL");
    const sourceId = resolveCitation(urlToken, unresolvedInputKey, loc, `Градец X${i}`, row);
    if (sourceId) {
      addEvidence({
        recordKey: unresolvedInputKey,
        sourceId,
        loc,
        claimKind: "retained_stage_observation",
        claim: {
          office_id: GRADEC_OFFICE_ID,
          phase: cellText(row.Phase),
          disposition: "retained_input_only_no_typed_event_proceeding_or_result",
        },
      });
    }
  }
  if (unresolved.length !== 0) {
    throw new Error(`Baseline designated URLs must resolve; unresolved=${unresolved.length}`);
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
    upstream_namespace: "observatory:bulgaria",
    upstream_id: "bulgaria",
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
      upstream_namespace: "bulgaria:office-register",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "office",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: office.office_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "bulgaria:geography-office-code",
      upstream_id: office.office_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { office_id: office.office_id, geography_id: office.geography_id } }),
    });
    addCrosswalk({
      entity_kind: "geography",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: office.geography_id,
      record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { geography_id: office.geography_id } }),
    });
    const meta = officeById.get(String(office.office_id))!;
    if ((legacyCounts.get(meta.legacyGeographyId) ?? []).length === 1) {
      addCrosswalk({
        entity_kind: "geography",
        upstream_namespace: "bulgaria:legacy-geography-name-type",
        upstream_id: meta.legacyGeographyId,
        record_key: recordKey("geography", [COUNTRY_ID, office.geography_id]),
        reason: "unambiguous_legacy_name_type",
        lineage_id: L,
        release_id: R,
        raw_json: rawEnvelope({
          origin,
          row: { legacy_geography_id: meta.legacyGeographyId, office_id: office.office_id },
        }),
      });
    }
    addCrosswalk({
      entity_kind: "input",
      upstream_namespace: "bulgaria:briefing",
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
    const historical = historyByHk.get(String(event.history_key))!;
    const origin = originFor(inventory.histories, inventory, historical.rowIndex);
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "bulgaria:history-key",
      upstream_id: event.history_key,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { history_key: event.history_key } }),
    });
    addCrosswalk({
      entity_kind: "event",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: event.event_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { event_id: event.event_id } }),
    });
  }

  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    const binding = resultBindings[i]!;
    const rec = recordKey("result_row", [N, result.office_id, result.history_key, result.result_row_id]);
    const origin = originFor(inventory.returns, inventory, binding.index);
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: result.result_row_id,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: { result_row_id: result.result_row_id } }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "bulgaria:baseline-result-row",
      upstream_id: canonical([
        inventory.returns.relativePath,
        inventory.returns.table.sheet,
        inventory.returns.table.source_rows[binding.index],
      ]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: binding.row }),
    });
    addCrosswalk({
      entity_kind: "result_row",
      upstream_namespace: "bulgaria:result-identity",
      upstream_id: canonical([
        N,
        result.office_id,
        result.history_key,
        binding.row["Electoral unit"] ?? null,
        binding.row["Candidate or list"] ?? null,
        binding.row["Party or proposer"] ?? null,
      ]),
      record_key: rec,
      reason: "baseline_row_binding",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin, row: binding.row }),
    });
  }

  for (const [originalId, info] of catalogueById) {
    const sourceId = info.sourceId;
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    const originSlice = info.origins[0]!.kind === "master" ? inventory.masterSources : inventory.companionSources;
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bulgaria:source-catalogue",
      upstream_id: originalId,
      record_key: rec,
      reason: "package_source_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index),
        row: info.origins[0]!.row,
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: sourceId,
      record_key: rec,
      reason: "proposed_bridge_compatible_id",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index),
        row: info.origins[0]!.row,
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bulgaria:source-url",
      upstream_id: info.url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index, "Source URL"),
        row: info.origins[0]!.row,
      }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bulgaria",
      upstream_id: urlSourceId(info.url),
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({
        origin: originFor(originSlice, inventory, info.origins[0]!.index, "Source URL"),
        row: { url: info.url, alias: urlSourceId(info.url) },
      }),
    });
  }
  for (const url of inlineUrls) {
    const sourceId = urlSourceId(url);
    const rec = recordKey("source", [COUNTRY_ID, SOURCE_NAMESPACE, sourceId]);
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "bulgaria:source-url",
      upstream_id: url,
      record_key: rec,
      reason: "exact_url_catalogue_alias",
      lineage_id: L,
      release_id: R,
      raw_json: rawEnvelope({ origin: sourceLinksOrigin, row: { url } }),
    });
    addCrosswalk({
      entity_kind: "source",
      upstream_namespace: "observatory:bulgaria",
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
    (item) => item.input_path === `${UNPACKED_PREFIX}/Office_Briefings/bulgaria.html`,
  ).length;
  if (
    officeBriefings !== EXPECTED_COUNTS.office_briefings_retained ||
    countryBriefings !== EXPECTED_COUNTS.country_briefings_retained
  ) {
    throw new Error(`Expected 3597 office + 1 country briefings, found ${officeBriefings}/${countryBriefings}`);
  }

  const pollInput = inventory.tracked.some((item) => item.input_path.includes("polling-evidence.json"));
  const controlInput = inventory.tracked.some((item) => item.input_path.includes("governing-control.json"));
  if (pollInput || controlInput) {
    throw new Error("Absent poll/control tables must not be fabricated");
  }

  const validatedCounts = {
    current_offices: offices.length,
    historical_offices: 0,
    geographies: geographies.length,
    mayor_offices: mayors,
    municipal_council_offices: councils,
    register_offices: EXPECTED_COUNTS.register_offices,
    held_offices: EXPECTED_COUNTS.held_offices,
    companion_offices: EXPECTED_COUNTS.companion_offices,
    companion_histories: EXPECTED_COUNTS.companion_histories,
    index_histories: EXPECTED_COUNTS.index_histories,
    overlap_histories: EXPECTED_COUNTS.overlap_histories,
    selected_histories: publishedHistories.length,
    held_histories: EXPECTED_COUNTS.held_histories,
    prospective_events: 0,
    total_events: events.length,
    research_dates: dates.length,
    historical_dates_day: dates.length,
    result_rows: results.length,
    held_result_rows: heldResults,
    unknown_next_dates: offices.length,
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
    unresolved_evidence: unresolved.length,
  };
  if (validatedCounts.regional_offices !== 0 || validatedCounts.municipal_offices !== 530) {
    throw new Error("Bulgaria must publish 530 municipal and 0 regional offices");
  }
  if (validatedCounts.prospective_events !== 0) {
    throw new Error("Bulgaria must not invent prospective events");
  }
  if (validatedCounts.current_offices !== 530) {
    throw new Error(`Published office count ${validatedCounts.current_offices}`);
  }

  return {
    lineage: {
      lineage_id: L,
      provenance_kind: "country_package",
      description: "Bulgaria frozen country package",
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
        supplemental: { coverage: inventory.coverage, counts_by_approval: inventory.tiers.counts_by_approval },
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
