import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import type { DatabaseSync } from "node:sqlite";
import { deleteCountryDerived, rebuildDerivedCountryInFile } from "../derive/run";
import { PRODUCTION_ATLAS_SQLITE_PATH } from "../paths";
import { insertMany, openAtlasDatabase, tableExists } from "../sqlite";
import {
  mapPackEvent,
  mapPackResult,
  parsePackObject,
  type MappedEvent,
  type MappedResult,
  type PublishedContext,
} from "./map";
import { packProfileForScope, type PackProfile } from "./profiles";
import {
  forEachTextLine,
  hashZipMember,
  listZipMembers,
  locatePackMember,
  openZipMemberTextStream,
  readZipMemberText,
  type ZipMember,
} from "./zip-stream";

const BATCH = 400;
const DELETE_BATCH = 500;

export class PackResultsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PackResultsError";
  }
}

export type PackResultsReport = {
  dryRun: boolean;
  fixture: boolean;
  scope: string;
  countryId: string;
  lineageId: string;
  zipPath: string;
  eventsFile: string;
  resultsFile: string;
  eventsSha256: string;
  resultsSha256: string;
  eventsInFile: number;
  resultsInFile: number;
  eventsAccepted: number;
  eventsRejected: number;
  resultsAccepted: number;
  resultsRejected: number;
  officesPublished: number;
  officeRegister: "absent" | "match";
  successorEdgesNoted: number | null;
  upcomingCalendarNoted: number | null;
  ticketComponents: number | null;
  eventOfficeLinks: number;
  eventOfficeLinksRejected: number;
  resultAuditRows: number | null;
  rejectsFile: string;
  derivedCycles: number | null;
  wrote: boolean;
};

export type LoadPackResultsOptions = {
  scope: string;
  zipPath: string;
  sqlitePath: string;
  rejectsPath?: string;
  dryRun?: boolean;
  /** Skip the full-pack byte and count pins. Refused for the production database. */
  fixture?: boolean;
  derive?: boolean;
};

type AcceptEvent = { officeId: string; historyKey: string };

class RejectLog {
  private pending: string[] = [];
  constructor(readonly filePath: string) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, "");
  }
  add(row: Record<string, unknown>): void {
    this.pending.push(JSON.stringify(row));
    if (this.pending.length >= 200) this.flush();
  }
  flush(): void {
    if (this.pending.length === 0) return;
    appendFileSync(this.filePath, `${this.pending.join("\n")}\n`);
    this.pending = [];
  }
}

function fixtureRequested(explicit: boolean | undefined): boolean {
  if (explicit != null) return explicit;
  return process.env.ATLAS_PACK_FIXTURE === "1";
}

function assertFixtureAllowed(sqlitePath: string, fixture: boolean): void {
  if (!fixture) return;
  if (path.resolve(sqlitePath) === path.resolve(PRODUCTION_ATLAS_SQLITE_PATH)) {
    throw new PackResultsError(
      "ATLAS_PACK_FIXTURE=1 is refused for /var/lib/cdd/atlas.sqlite. Production loads must match the pinned full-pack bytes.",
    );
  }
}

function parseManifest(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = /^([0-9a-f]{64}) [ *](.+)$/.exec(line);
    if (!match) throw new PackResultsError(`Unreadable SHA256SUMS line: ${line.slice(0, 120)}`);
    map.set(match[2]!.replace(/^\.\//, ""), match[1]!);
  }
  return map;
}

function countField(record: Record<string, unknown>, keys: string[]): number {
  const found: number[] = [];
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = record[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new PackResultsError(`counts.json ${key} is not a nonnegative integer`);
    }
    found.push(value);
  }
  if (found.length === 0) throw new PackResultsError(`counts.json has no ${keys.join(" or ")} count`);
  if (new Set(found).size > 1) throw new PackResultsError(`counts.json ${keys.join(" and ")} disagree`);
  return found[0]!;
}

async function hashed(
  zipPath: string,
  member: ZipMember,
  manifest: Map<string, string> | null,
  relative: string,
): Promise<string> {
  const actual = await hashZipMember(zipPath, member);
  if (!manifest) return actual;
  const expected = manifest.get(relative);
  if (!expected) throw new PackResultsError(`${relative} is missing from SHA256SUMS. No rows were written.`);
  if (actual !== expected) {
    throw new PackResultsError(
      `${relative} sha256 ${actual} does not match SHA256SUMS ${expected}. No rows were written.`,
    );
  }
  return actual;
}

function jsonLength(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of ["edges", "successor_edges", "rows", "calendar", "components", "ticket_components"]) {
    if (Array.isArray(record[key])) return record[key].length;
  }
  return null;
}

function collectIds(value: unknown, into: Set<string>): void {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? ((["components", "ticket_components", "rows"] as const)
          .map((key) => (value as Record<string, unknown>)[key])
          .find((item) => Array.isArray(item)) ?? [])
      : [];
  for (const item of rows) {
    if (item == null || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    for (const key of ["ticket_component_id", "component_id", "id"]) {
      const id = record[key];
      if (typeof id === "string" && id.trim()) into.add(id.trim());
    }
  }
}

function readPublished(
  db: DatabaseSync,
  countryId: string,
): { lineageId: string; namespace: string; releaseId: string } | null {
  const rows = db.prepare("SELECT DISTINCT lineage_id, id_namespace FROM office WHERE country_id = ?").all(countryId);
  if (rows.length === 0) return null;
  if (rows.length > 1) {
    throw new PackResultsError(`Country ${countryId} offices use more than one namespace. No rows were written.`);
  }
  const lineageId = String(rows[0]?.lineage_id ?? "");
  const namespace = String(rows[0]?.id_namespace ?? "");
  const release = db.prepare("SELECT release_id FROM publication_release WHERE lineage_id = ?").get(lineageId);
  return { lineageId, namespace, releaseId: release ? String(release.release_id) : "" };
}

async function notePackCompanions(
  zipPath: string,
  members: ZipMember[],
  topDirectory: string | null,
  manifest: Map<string, string> | null,
): Promise<{
  successorEdges: number | null;
  upcomingCalendar: number | null;
  ticketCount: number | null;
  ticketComponents: Set<string> | null;
}> {
  const readListed = async (relative: string): Promise<unknown | null> => {
    const member = locatePackMember(members, topDirectory, relative);
    if (!member) return null;
    if (manifest?.has(relative)) await hashed(zipPath, member, manifest, relative);
    let value: unknown;
    try {
      value = JSON.parse(await readZipMemberText(zipPath, member, 32 * 1024 * 1024));
    } catch (error) {
      if (error instanceof PackResultsError) throw error;
      throw new PackResultsError(`${relative} is not JSON. No rows were written.`);
    }
    return value;
  };
  const successor = await readListed("successor_edges.json");
  const calendar = await readListed("upcoming_calendar.json");
  const tickets = await readListed("ticket_components.json");
  const ids = new Set<string>();
  if (tickets) collectIds(tickets, ids);
  return {
    successorEdges: successor == null ? null : jsonLength(successor),
    upcomingCalendar: calendar == null ? null : jsonLength(calendar),
    ticketCount: tickets == null ? null : (jsonLength(tickets) ?? ids.size),
    ticketComponents: tickets == null || ids.size === 0 ? null : ids,
  };
}

type OfficeLink = {
  eventId: string;
  officeId: string;
  relationship: string;
};

function envelope(relative: string, sha: string, line: number, row: unknown, links: OfficeLink[] = []): string {
  return JSON.stringify({
    pack_results: true,
    origin: {
      input_path: relative,
      sha256: sha,
      json_pointer: null,
      sheet: null,
      source_row: line,
      column: null,
      html_anchor_index: null,
    },
    row,
    columns: null,
    values: null,
    supplemental: {
      pack_results: true,
      event_office_links: links,
    },
  });
}

/** Read a count from a JSON member without keeping the member in memory. */
async function streamJsonCount(filePath: string, member: ZipMember, keys: string[]): Promise<number | null> {
  const stream = openZipMemberTextStream(filePath, member);
  const decoder = new StringDecoder("utf8");
  const pattern = new RegExp(`"(${keys.join("|")})"\\s*:\\s*(\\d+)`, "g");
  const found = new Map<string, number>();
  let window = "";
  try {
    for await (const chunk of stream) {
      window += decoder.write(chunk as Buffer);
      for (const match of window.matchAll(pattern)) {
        const key = match[1];
        if (key && !found.has(key)) found.set(key, Number(match[2]));
      }
      if (keys.every((key) => found.has(key))) break;
      if (window.length > 8192) window = window.slice(-256);
    }
  } finally {
    stream.destroy();
  }
  for (const key of keys) {
    const value = found.get(key);
    if (value != null) return value;
  }
  return null;
}

function inTransaction(db: DatabaseSync, fn: () => void): void {
  db.exec("BEGIN IMMEDIATE;");
  try {
    fn();
    db.exec("COMMIT;");
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // The statement already failed.
    }
    throw error;
  }
}

function deleteChunked(db: DatabaseSync, sql: string, params: unknown[]): number {
  let total = 0;
  for (;;) {
    let changes = 0;
    inTransaction(db, () => {
      changes = Number(db.prepare(sql).run(...params).changes ?? 0);
    });
    total += changes;
    if (changes === 0) break;
  }
  return total;
}

function clearCountryResults(db: DatabaseSync, lineageId: string, countryId: string): void {
  if (tableExists(db, "derived_jurisdiction")) deleteCountryDerived(db, countryId);
  const referenced = db
    .prepare(
      `SELECT COUNT(*) AS n FROM office
       WHERE lineage_id = ? AND next_history_key IS NOT NULL AND length(trim(next_history_key)) > 0`,
    )
    .get(lineageId);
  if (Number(referenced?.n ?? 0) > 0) {
    throw new PackResultsError(
      "Published offices point at election history keys. This loader does not edit the office register to detach them.",
    );
  }
  const locatorFilter = `record_key IN (
    SELECT record_key FROM record_locator
    WHERE lineage_id = ? AND entity_kind IN ('event', 'result_row')
  )`;
  deleteChunked(
    db,
    `DELETE FROM identity_crosswalk WHERE rowid IN (
       SELECT identity_crosswalk.rowid FROM identity_crosswalk WHERE lineage_id = ? AND ${locatorFilter} LIMIT ${DELETE_BATCH}
     )`,
    [lineageId, lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM unresolved_evidence WHERE rowid IN (
       SELECT unresolved_evidence.rowid FROM unresolved_evidence WHERE lineage_id = ? AND ${locatorFilter} LIMIT ${DELETE_BATCH}
     )`,
    [lineageId, lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM evidence_link WHERE rowid IN (
       SELECT evidence_link.rowid FROM evidence_link WHERE lineage_id = ? AND ${locatorFilter} LIMIT ${DELETE_BATCH}
     )`,
    [lineageId, lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM record_locator WHERE rowid IN (
       SELECT rowid FROM record_locator
       WHERE lineage_id = ? AND entity_kind IN ('event', 'result_row') LIMIT ${DELETE_BATCH}
     )`,
    [lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM result_row WHERE rowid IN (
       SELECT rowid FROM result_row WHERE lineage_id = ? LIMIT ${DELETE_BATCH}
     )`,
    [lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM proceeding WHERE rowid IN (
       SELECT rowid FROM proceeding WHERE lineage_id = ? LIMIT ${DELETE_BATCH}
     )`,
    [lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM election_event WHERE rowid IN (
       SELECT rowid FROM election_event WHERE lineage_id = ? LIMIT ${DELETE_BATCH}
     )`,
    [lineageId],
  );
  deleteChunked(
    db,
    `DELETE FROM research_date WHERE rowid IN (
       SELECT rowid FROM research_date
       WHERE lineage_id = ?
         AND json_extract(raw_json, '$.pack_results') = 1
         AND date_id NOT IN (SELECT next_date_id FROM office WHERE next_date_id IS NOT NULL)
       LIMIT ${DELETE_BATCH}
     )`,
    [lineageId],
  );
}

function eventRow(
  profile: PackProfile,
  releaseId: string,
  sha: string,
  line: number,
  mapped: MappedEvent,
  links: OfficeLink[],
): {
  date: Record<string, unknown> | null;
  event: Record<string, unknown>;
} {
  return {
    date: mapped.date.dateId
      ? {
      date_id: mapped.date.dateId,
      label: mapped.date.label,
      precision: mapped.date.precision,
      certainty: mapped.date.certainty,
      year: mapped.date.year,
      month: mapped.date.month,
      day: mapped.date.day,
      range_start_id: null,
      range_end_id: null,
      lineage_id: profile.lineageId,
      release_id: releaseId,
      raw_json: JSON.stringify({ pack_results: true, event_id: mapped.eventId, label: mapped.date.label }),
    }
      : null,
    event: {
      id_namespace: profile.idNamespace,
      office_id: mapped.officeId,
      history_key: mapped.historyKey,
      event_id: mapped.eventId,
      date_id: mapped.date.dateId,
      date_resolution: mapped.date.resolution,
      event_kind: mapped.eventKind,
      selected_history_role: mapped.selectedHistoryRole,
      electoral_system: mapped.electoralSystem,
      comparability: mapped.comparability,
      ballot_basis: mapped.ballotBasis,
      share_unit: mapped.shareUnit,
      legal_outcome: mapped.legalOutcome,
      record_state: "active",
      state_note: mapped.stateNote,
      lineage_id: profile.lineageId,
      release_id: releaseId,
      raw_json: envelope(profile.eventsPath, sha, line, mapped.source, links),
    },
  };
}

function resultRow(profile: PackProfile, releaseId: string, sha: string, line: number, mapped: MappedResult): Record<string, unknown> {
  return {
    id_namespace: profile.idNamespace,
    office_id: mapped.officeId,
    history_key: mapped.historyKey,
    result_row_id: mapped.resultId,
    proceeding_id: null,
    country_id: profile.countryId,
    candidate_or_list_label: mapped.label,
    original_party_label: mapped.partyLabel,
    original_party_code: mapped.partyCode,
    party_namespace: mapped.partyNamespace,
    party_mapping_id: null,
    votes: mapped.votes,
    votes_status: mapped.votesStatus,
    share: mapped.share,
    share_status: mapped.shareStatus,
    share_unit: mapped.shareUnit,
    seats: mapped.seats,
    seats_status: mapped.seatsStatus,
    elected_flag: mapped.electedFlag,
    is_substitute: mapped.isSubstitute,
    evidence_status: mapped.evidenceStatus,
    lineage_id: profile.lineageId,
    release_id: releaseId,
    raw_json: envelope(profile.resultsPath, sha, line, mapped.source),
  };
}

function idText(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" ? value : undefined;
}

async function indexUnits(
  zipPath: string,
  member: ZipMember,
): Promise<Map<string, string>> {
  const units = new Map<string, string>();
  await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    if ("reason" in parsed) {
      throw new PackResultsError(`reporting-units.jsonl line ${lineNumber} is ${parsed.reason}`);
    }
    const eventId = parsed.event_id;
    if (typeof eventId !== "string" || !eventId) {
      throw new PackResultsError(`reporting-units.jsonl line ${lineNumber} has no event_id`);
    }
    for (const key of ["reporting_unit_id", "unit_id"]) {
      const id = parsed[key];
      if (typeof id !== "string" || !id) continue;
      const existing = units.get(id);
      if (existing && existing !== eventId) {
        throw new PackResultsError(`reporting unit ${id} is attached to two events`);
      }
      units.set(id, eventId);
    }
  });
  return units;
}

async function scanEvents(
  zipPath: string,
  member: ZipMember,
  profile: PackProfile,
  offices: Set<string>,
  geographies: Set<string>,
  rejects: RejectLog,
): Promise<{ accepted: Map<string, AcceptEvent>; inFile: number; rejected: number }> {
  const accepted = new Map<string, AcceptEvent>();
  const history = new Map<string, string>();
  let rejected = 0;
  const inFile = await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    if ("reason" in parsed) {
      rejected += 1;
      rejects.add({ file: profile.eventsPath, line: lineNumber, reason: parsed.reason });
      return;
    }
    const mapped = mapPackEvent(profile.idNamespace, parsed, offices, geographies, profile.shareConvention);
    if ("reason" in mapped) {
      rejected += 1;
      rejects.add({
        file: profile.eventsPath,
        line: lineNumber,
        reason: mapped.reason,
        event_id: idText(parsed, "event_id"),
        office_id: idText(parsed, "office_id"),
      });
      return;
    }
    if (accepted.has(mapped.eventId)) {
      rejected += 1;
      rejects.add({ file: profile.eventsPath, line: lineNumber, reason: "duplicate_event_id", event_id: mapped.eventId });
      return;
    }
    const historySlot = `${mapped.officeId}\0${mapped.historyKey}`;
    if (history.has(historySlot)) {
      rejected += 1;
      rejects.add({
        file: profile.eventsPath,
        line: lineNumber,
        reason: "duplicate_history_key",
        event_id: mapped.eventId,
        office_id: mapped.officeId,
      });
      return;
    }
    accepted.set(mapped.eventId, { officeId: mapped.officeId, historyKey: mapped.historyKey });
    history.set(historySlot, mapped.eventId);
  });
  return { accepted, inFile, rejected };
}

async function scanResults(
  zipPath: string,
  member: ZipMember,
  profile: PackProfile,
  context: PublishedContext,
  rejects: RejectLog,
): Promise<{ inFile: number; accepted: number; rejected: number }> {
  const seen = new Set<string>();
  let accepted = 0;
  let rejected = 0;
  const inFile = await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    if ("reason" in parsed) {
      rejected += 1;
      rejects.add({ file: profile.resultsPath, line: lineNumber, reason: parsed.reason });
      return;
    }
    const mapped = mapPackResult(parsed, context);
    if ("reason" in mapped) {
      rejected += 1;
      rejects.add({
        file: profile.resultsPath,
        line: lineNumber,
        reason: mapped.reason,
        event_id: idText(parsed, "event_id"),
        result_id: idText(parsed, "result_row_id") ?? idText(parsed, "result_id"),
        office_id: idText(parsed, "office_id"),
      });
      return;
    }
    if (seen.has(mapped.resultId)) {
      rejected += 1;
      rejects.add({
        file: profile.resultsPath,
        line: lineNumber,
        reason: "duplicate_result_id",
        result_id: mapped.resultId,
        event_id: mapped.eventId,
      });
      return;
    }
    seen.add(mapped.resultId);
    accepted += 1;
  });
  return { inFile, accepted, rejected };
}

async function readOfficeLinks(
  zipPath: string,
  member: ZipMember,
  events: Map<string, { officeId: string; historyKey: string }>,
  offices: Set<string>,
  rejects: RejectLog,
): Promise<{ byEvent: Map<string, OfficeLink[]>; accepted: number; rejected: number }> {
  const byEvent = new Map<string, OfficeLink[]>();
  let accepted = 0;
  let rejected = 0;
  await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    const reject = (reason: string, eventId?: string, officeId?: string) => {
      rejected += 1;
      rejects.add({ file: member.name, line: lineNumber, reason, event_id: eventId, office_id: officeId });
    };
    if ("reason" in parsed && typeof parsed.reason === "string" && Object.keys(parsed).length === 1) {
      reject(parsed.reason);
      return;
    }
    const row = parsed as Record<string, unknown>;
    const eventId = typeof row.event_id === "string" ? row.event_id.trim() : "";
    const officeId = typeof row.office_id === "string" ? row.office_id.trim() : "";
    const relationship = typeof row.relationship === "string" ? row.relationship.trim() : "";
    if (!eventId || !officeId || !relationship) {
      reject("event_office_link_missing_field", eventId || undefined, officeId || undefined);
      return;
    }
    if (!events.has(eventId)) {
      reject("event_office_link_unknown_event", eventId, officeId);
      return;
    }
    if (!offices.has(officeId)) {
      reject("event_office_link_office_not_published", eventId, officeId);
      return;
    }
    if (row.vote_duplication_permitted !== false) {
      reject("event_office_link_would_duplicate_votes", eventId, officeId);
      return;
    }
    const link = { eventId, officeId, relationship };
    const list = byEvent.get(eventId) ?? [];
    list.push(link);
    byEvent.set(eventId, list);
    accepted += 1;
  });
  return { byEvent, accepted, rejected };
}

export function packReportLines(report: PackResultsReport): string[] {
  return [
    `pack_zip=${report.zipPath}`,
    `pack_scope=${report.scope}`,
    `pack_country=${report.countryId}`,
    `pack_lineage=${report.lineageId}`,
    `pack_dry_run=${report.dryRun ? "yes" : "no"}`,
    `pack_fixture=${report.fixture ? "yes" : "no"}`,
    `pack_layout=${report.eventsFile.includes("/data/") || report.eventsFile.startsWith("data/") ? "data-dir" : "pack-root"}`,
    `pack_office_register=${report.officeRegister}`,
    `pack_successor_edges_noted=${report.successorEdgesNoted ?? ""}`,
    `pack_upcoming_calendar_noted=${report.upcomingCalendarNoted ?? ""}`,
    `pack_ticket_components=${report.ticketComponents ?? ""}`,
    `pack_event_office_links=${report.eventOfficeLinks}`,
    `pack_event_office_links_rejected=${report.eventOfficeLinksRejected}`,
    `pack_result_audit_rows=${report.resultAuditRows ?? ""}`,
    `pack_offices_published=${report.officesPublished}`,
    `pack_events_file=${report.eventsFile}`,
    `pack_events_sha256=${report.eventsSha256}`,
    `pack_events_in_file=${report.eventsInFile}`,
    `pack_events_accepted=${report.eventsAccepted}`,
    `pack_events_rejected=${report.eventsRejected}`,
    `pack_results_file=${report.resultsFile}`,
    `pack_results_sha256=${report.resultsSha256}`,
    `pack_results_in_file=${report.resultsInFile}`,
    `pack_results_accepted=${report.resultsAccepted}`,
    `pack_results_rejected=${report.resultsRejected}`,
    `pack_rejects_file=${report.rejectsFile}`,
    `pack_wrote=${report.wrote ? "yes" : "no"}`,
    `pack_derived_cycles=${report.derivedCycles ?? ""}`,
  ];
}

export async function loadCountryPackResults(options: LoadPackResultsOptions): Promise<PackResultsReport> {
  const scope = options.scope.trim().toLowerCase();
  if (scope === "all" || scope === "") {
    throw new PackResultsError(
      "Refusing a research ZIP when ATLAS_IMPORT_SCOPE is all or unset. Set ATLAS_IMPORT_SCOPE to one country.",
    );
  }
  const profile = packProfileForScope(scope);
  if (!profile) {
    throw new PackResultsError(
      `No full-pack results profile for ${JSON.stringify(scope)}. This loader does not invent events or results for other countries.`,
    );
  }
  const fixture = fixtureRequested(options.fixture);
  assertFixtureAllowed(options.sqlitePath, fixture);
  const dryRun = options.dryRun === true;
  const rejectsFile =
    options.rejectsPath?.trim() ||
    process.env.ATLAS_PACK_REJECTS?.trim() ||
    path.join(path.dirname(options.sqlitePath), `pack-rejects-${profile.countryId}.jsonl`);

  const members = listZipMembers(options.zipPath);
  const locate = (relative: string) => locatePackMember(members, profile.topDirectory, relative);
  const manifestMember = locate("SHA256SUMS");
  if (!manifestMember && profile.requireManifest) {
    throw new PackResultsError("SHA256SUMS is missing from the research ZIP. No rows were written.");
  }
  const manifest = manifestMember ? parseManifest(await readZipMemberText(options.zipPath, manifestMember)) : null;
  const eventsMember = locate(profile.eventsPath);
  const resultsMember = locate(profile.resultsPath);
  if (!eventsMember || !resultsMember) {
    throw new PackResultsError(
      `ZIP is missing ${profile.eventsPath} or ${profile.resultsPath} for the ${profile.layout} pack. No rows were written.`,
    );
  }
  const eventsSha256 = await hashed(options.zipPath, eventsMember, manifest, profile.eventsPath);
  const resultsSha256 = await hashed(options.zipPath, resultsMember, manifest, profile.resultsPath);
  if (!fixture && profile.eventsSha256 && profile.resultsSha256) {
    if (eventsSha256 !== profile.eventsSha256 || resultsSha256 !== profile.resultsSha256) {
      throw new PackResultsError(
        `ZIP events/results bytes do not match the accepted ${profile.prompt} full pack. No rows were written.`,
      );
    }
  }

  const countsMember = profile.countsPath
    ? locate(profile.countsPath)
    : locate("counts.json") ?? locate("data/counts.json") ?? locate("Count_Summary.json");
  if (profile.countsPath && !countsMember) {
    throw new PackResultsError(`ZIP is missing ${profile.countsPath}. No rows were written.`);
  }
  let expectedEvents: number | null = fixture ? null : profile.expectedEvents;
  let expectedResults: number | null = fixture ? null : profile.expectedResults;
  if (countsMember) {
    const countsRelative = profile.countsPath ?? "counts.json";
    await hashed(options.zipPath, countsMember, manifest, countsRelative);
    let countsJson: unknown;
    try {
      countsJson = JSON.parse(await readZipMemberText(options.zipPath, countsMember));
    } catch {
      throw new PackResultsError(`${countsRelative} is not JSON. No rows were written.`);
    }
    if (countsJson == null || typeof countsJson !== "object" || Array.isArray(countsJson)) {
      throw new PackResultsError(`${countsRelative} is not an object. No rows were written.`);
    }
    const fileEvents = countField(countsJson as Record<string, unknown>, ["events", "election_events", "event_records"]);
    const fileResults = countField(countsJson as Record<string, unknown>, ["results", "result_rows", "result_records"]);
    if (!fixture && (fileEvents !== profile.expectedEvents || fileResults !== profile.expectedResults)) {
      throw new PackResultsError(
        `${countsRelative} events=${fileEvents} results=${fileResults} does not match the accepted ${profile.prompt} pack (${profile.expectedEvents} events / ${profile.expectedResults} results). No rows were written.`,
      );
    }
    expectedEvents = fileEvents;
    expectedResults = fileResults;
  }

  const auditMember = profile.resultAuditPath ? locate(profile.resultAuditPath) : locate("data/result-audit.json");
  if (profile.resultAuditRequired && !auditMember) {
    throw new PackResultsError(
      `${profile.resultAuditPath ?? "data/result-audit.json"} is missing. No rows were written.`,
    );
  }
  let resultAuditRows: number | null = null;
  if (auditMember) {
    if (manifest?.has(profile.resultAuditPath ?? "data/result-audit.json")) {
      await hashed(options.zipPath, auditMember, manifest, profile.resultAuditPath ?? "data/result-audit.json");
    }
    resultAuditRows = await streamJsonCount(options.zipPath, auditMember, ["result_rows", "results", "result_count"]);
    if (resultAuditRows == null) {
      throw new PackResultsError(
        `${auditMember.name} has no result_rows count. No rows were written.`,
      );
    }
    if (expectedResults != null && expectedResults !== resultAuditRows) {
      throw new PackResultsError(
        `result-audit.json result_rows=${resultAuditRows} does not match the pack result count ${expectedResults}. No rows were written.`,
      );
    }
    expectedResults = resultAuditRows;
  }

  let officeRegister: "absent" | "match" = "absent";
  if (profile.officeRegisterPath) {
    const officeMember = locate(profile.officeRegisterPath);
    if (officeMember) {
      const actual = await hashed(options.zipPath, officeMember, manifest, profile.officeRegisterPath);
      if (profile.officeRegisterSha256 && actual !== profile.officeRegisterSha256) {
        throw new PackResultsError(
          `${profile.officeRegisterPath} sha256 ${actual} does not match the published register ${profile.officeRegisterSha256}. Offices were not modified and no events or results were written.`,
        );
      }
      officeRegister = "match";
    }
  }

  let units: Map<string, string> | null = null;
  if (profile.reportingUnitsPath) {
    const unitsMember = locate(profile.reportingUnitsPath);
    if (unitsMember) {
      await hashed(options.zipPath, unitsMember, manifest, profile.reportingUnitsPath);
      units = await indexUnits(options.zipPath, unitsMember);
    }
  }

  const noted = await notePackCompanions(options.zipPath, members, profile.topDirectory, manifest);
  const ticketComponents = noted.ticketComponents;

  const db = openAtlasDatabase(options.sqlitePath, dryRun ? { readOnly: true } : undefined);
  const rejects = new RejectLog(path.resolve(rejectsFile));
  try {
    const officeTable = db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'office'").get();
    if (!officeTable) {
      throw new PackResultsError("Atlas master has no office table. Run the scoped office import before loading a pack. No rows were written.");
    }
    const published = readPublished(db, profile.countryId);
    const runtime: PackProfile = published
      ? { ...profile, lineageId: published.lineageId, idNamespace: published.namespace }
      : profile;
    const releaseId = published?.releaseId ?? "";
    const offices = new Set(
      db
        .prepare("SELECT office_id FROM office WHERE country_id = ? AND lineage_id = ? AND id_namespace = ?")
        .all(runtime.countryId, runtime.lineageId, runtime.idNamespace)
        .map((row) => String(row.office_id)),
    );
    const geographies = new Set(
      db
        .prepare("SELECT geography_id FROM geography WHERE country_id = ?")
        .all(profile.countryId)
        .map((row) => String(row.geography_id)),
    );
    const events = await scanEvents(options.zipPath, eventsMember, runtime, offices, geographies, rejects);
    if (expectedEvents != null && events.inFile !== expectedEvents) {
      throw new PackResultsError(
        `${runtime.eventsPath} has ${events.inFile} rows; the pack count is ${expectedEvents}. No rows were written.`,
      );
    }
    const context: PublishedContext = {
      offices,
      geographies,
      units,
      ticketComponents,
      events: events.accepted,
      shareConvention: runtime.shareConvention,
    };
    const linksMember = locate(profile.eventOfficeLinksPath ?? "data/event-office-links.jsonl");
    if (profile.eventOfficeLinksRequired && !linksMember) {
      throw new PackResultsError(
        `${profile.eventOfficeLinksPath} is missing. No rows were written.`,
      );
    }
    const officeLinks = linksMember
      ? await readOfficeLinks(options.zipPath, linksMember, events.accepted, offices, rejects)
      : { byEvent: new Map<string, OfficeLink[]>(), accepted: 0, rejected: 0 };
    const results = await scanResults(options.zipPath, resultsMember, runtime, context, rejects);
    if (expectedResults != null && results.inFile !== expectedResults) {
      throw new PackResultsError(
        `${runtime.resultsPath} has ${results.inFile} rows; the pack count is ${expectedResults}. No rows were written.`,
      );
    }
    rejects.flush();

    const base: PackResultsReport = {
      dryRun,
      fixture,
      scope: profile.scope,
      countryId: profile.countryId,
      lineageId: runtime.lineageId,
      zipPath: options.zipPath,
      eventsFile: eventsMember.name,
      resultsFile: resultsMember.name,
      eventsSha256,
      resultsSha256,
      eventsInFile: events.inFile,
      resultsInFile: results.inFile,
      eventsAccepted: events.accepted.size,
      eventsRejected: events.rejected,
      resultsAccepted: results.accepted,
      resultsRejected: results.rejected,
      officesPublished: offices.size,
      officeRegister,
      successorEdgesNoted: noted.successorEdges,
      upcomingCalendarNoted: noted.upcomingCalendar,
      ticketComponents: noted.ticketCount,
      eventOfficeLinks: officeLinks.accepted,
      eventOfficeLinksRejected: officeLinks.rejected,
      resultAuditRows,
      rejectsFile: rejects.filePath,
      derivedCycles: null,
      wrote: false,
    };

    if (dryRun) return base;
    if (!releaseId) {
      throw new PackResultsError(
        `No published release for ${runtime.countryId}. Run the scoped office import before loading the pack. No rows were written.`,
      );
    }
    if (events.accepted.size === 0 && results.accepted === 0) {
      throw new PackResultsError(
        `Refusing to replace ${runtime.countryId} events and results because the pack accepted 0 rows. The database was not modified.`,
      );
    }

    try {
      clearCountryResults(db, runtime.lineageId, runtime.countryId);
      await writeEvents(
        db,
        options.zipPath,
        eventsMember,
        runtime,
        releaseId,
        eventsSha256,
        offices,
        geographies,
        events.accepted,
        officeLinks.byEvent,
      );
      await writeResults(db, options.zipPath, resultsMember, runtime, releaseId, resultsSha256, context);
    } catch (error) {
      try {
        clearCountryResults(db, runtime.lineageId, runtime.countryId);
      } catch {
        // Keep the original write error.
      }
      throw error;
    }

    let derivedCycles: number | null = null;
    if (options.derive !== false) {
      db.close();
      const stats = rebuildDerivedCountryInFile(options.sqlitePath, profile.countryId);
      derivedCycles = stats.cycles;
      return { ...base, wrote: true, derivedCycles };
    }
    return { ...base, wrote: true, derivedCycles };
  } finally {
    rejects.flush();
    try {
      db.close();
    } catch {
      // derive path already closed it
    }
  }
}

async function writeEvents(
  db: DatabaseSync,
  zipPath: string,
  member: ZipMember,
  profile: PackProfile,
  releaseId: string,
  sha: string,
  offices: Set<string>,
  geographies: Set<string>,
  accepted: Map<string, AcceptEvent>,
  links: Map<string, OfficeLink[]>,
): Promise<void> {
  let dates: Record<string, unknown>[] = [];
  let events: Record<string, unknown>[] = [];
  let written = 0;
  const pending = new Set(accepted.keys());
  const flush = () => {
    if (events.length === 0) return;
    const dateBatch = dates;
    const eventBatch = events;
    dates = [];
    events = [];
    inTransaction(db, () => {
      insertMany(db, "research_date", dateBatch);
      insertMany(db, "election_event", eventBatch);
    });
    const before = written;
    written += eventBatch.length;
    if (Math.floor(written / 100000) !== Math.floor(before / 100000)) {
      console.log(`pack_progress phase=events inserted=${written}`);
    }
  };
  await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    if ("reason" in parsed || typeof parsed.event_id !== "string" || !pending.has(parsed.event_id)) return;
    const mapped = mapPackEvent(profile.idNamespace, parsed, offices, geographies, profile.shareConvention);
    if ("reason" in mapped) {
      throw new PackResultsError(`Event ${parsed.event_id} was accepted and then rejected (${mapped.reason})`);
    }
    pending.delete(mapped.eventId);
    const row = eventRow(profile, releaseId, sha, lineNumber, mapped, links.get(mapped.eventId) ?? []);
    if (row.date) dates.push(row.date);
    events.push(row.event);
    if (events.length >= BATCH) flush();
  });
  flush();
  if (pending.size !== 0) {
    throw new PackResultsError(`Failed to write ${pending.size} accepted events`);
  }
}

async function writeResults(
  db: DatabaseSync,
  zipPath: string,
  member: ZipMember,
  profile: PackProfile,
  releaseId: string,
  sha: string,
  context: PublishedContext,
): Promise<void> {
  const seen = new Set<string>();
  let batch: Record<string, unknown>[] = [];
  let written = 0;
  const flush = () => {
    if (batch.length === 0) return;
    const rows = batch;
    batch = [];
    inTransaction(db, () => {
      insertMany(db, "result_row", rows);
    });
    const before = written;
    written += rows.length;
    if (Math.floor(written / 100000) !== Math.floor(before / 100000)) {
      console.log(`pack_progress phase=results inserted=${written}`);
    }
    if (written % (BATCH * 20) === 0) db.exec("PRAGMA wal_checkpoint(PASSIVE);");
  };
  await forEachTextLine(openZipMemberTextStream(zipPath, member), (line, lineNumber) => {
    const parsed = parsePackObject(line);
    if ("reason" in parsed) return;
    const mapped = mapPackResult(parsed, context);
    if ("reason" in mapped) return;
    if (seen.has(mapped.resultId)) return;
    seen.add(mapped.resultId);
    batch.push(resultRow(profile, releaseId, sha, lineNumber, mapped));
    if (batch.length >= BATCH) flush();
  });
  flush();
}
