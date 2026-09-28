import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { formatAtlasTier } from "../read";
import { atlasRoutes } from "../routes";
import { resolveAtlasSqlitePath } from "../paths";
import { openAtlasDatabase, tableExists } from "../sqlite";
import {
  adjacentCycles,
  electoralSystemFromLatest,
  historyRows,
  holderPhrase,
  kindChip,
  officeholderTimeline,
  termYearsFromOfficeRaw,
  type HistoryDisplayRow,
  type SeatCycleEvent,
  type SeatCycleProceeding,
  type SeatCycleResult,
  type TimelineEntry,
} from "./history";

export type SeatCrumb = { label: string; href?: string };

export type SeatLink = { label: string; href: string };

export type SeatProvenance = {
  eventId: string | null;
  publisher: string | null;
  title: string | null;
  url: string | null;
  snapshotLabel: string | null;
  evidenceGrade: string | null;
  recordId: string;
};

export type SeatPageModel = {
  officeId: string;
  officeName: string;
  countryId: string;
  countryName: string;
  idNamespace: string;
  lineageId: string;
  releaseId: string | null;
  kind: string;
  electoralSystem: string | null;
  termYears: number | null;
  holderPhrase: string;
  holderShown: boolean;
  nextElectionLabel: string | null;
  crumbs: SeatCrumb[];
  readablePath: string | null;
  history: HistoryDisplayRow[];
  timeline: TimelineEntry[];
  related: {
    parent: SeatLink | null;
    siblings: SeatLink[];
    previous: SeatLink | null;
    next: SeatLink | null;
  };
  provenance: SeatProvenance[];
  historyKeys: string[];
};

export type OfficeCandidate = {
  idNamespace: string;
  officeId: string;
  name: string;
  jurisdiction: string;
  href: string | null;
};

export type SeatAliasResolution =
  | { status: "canonical"; idNamespace: string; officeId: string }
  | { status: "redirect"; href: string }
  | { status: "missing" };

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function numOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function withDatabase<T>(sqlitePath: string, fallback: T, fn: (db: DatabaseSync) => T): T {
  if (!existsSync(sqlitePath)) return fallback;
  try {
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      return fn(db);
    } finally {
      db.close();
    }
  } catch {
    return fallback;
  }
}

function joinDistinct(values: Array<string | null>): string | null {
  const unique = [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
  return unique.length > 0 ? unique.join(" · ") : null;
}

export function readSeatPage(
  idNamespace: string,
  officeId: string,
  sqlitePath = resolveAtlasSqlitePath(),
): SeatPageModel | null {
  return withDatabase(sqlitePath, null, (db) => {
    if (!tableExists(db, "office")) return null;
    const office = db
      .prepare(
        `SELECT o.office_id, o.id_namespace, o.country_id, o.geography_id, o.name, o.office_type, o.lineage_id, o.release_id,
                o.raw_json, c.name AS country_name, t.tier,
                d.label AS next_label
         FROM office o
         LEFT JOIN country c ON c.country_id = o.country_id
         LEFT JOIN office_tier_classification t
           ON t.id_namespace = o.id_namespace AND t.office_id = o.office_id
         LEFT JOIN research_date d ON d.date_id = o.next_date_id
         WHERE o.id_namespace = ? AND o.office_id = ?`,
      )
      .get(idNamespace, officeId);
    if (!office) return null;

    const jurisdiction = tableExists(db, "derived_jurisdiction")
      ? db
          .prepare(
            `SELECT jurisdiction_key, name, slug_path, parent_key
             FROM derived_jurisdiction
             WHERE country_id = ? AND geography_id = ?`,
          )
          .get(text(office.country_id), text(office.geography_id))
      : undefined;

    const slug = tableExists(db, "derived_office_slug")
      ? db
          .prepare(
            `SELECT slug_path FROM derived_office_slug WHERE id_namespace = ? AND office_id = ?`,
          )
          .get(idNamespace, officeId)
      : undefined;

    const status = tableExists(db, "derived_seat_status")
      ? db
          .prepare(
            `SELECT current_holder_label, current_since_date_id, status_reason
             FROM derived_seat_status WHERE id_namespace = ? AND office_id = ?`,
          )
          .get(idNamespace, officeId)
      : undefined;

    const sinceLabel = status?.current_since_date_id
      ? textOrNull(
          db.prepare("SELECT label FROM research_date WHERE date_id = ?").get(text(status.current_since_date_id))?.label,
        )
      : null;

    const events = loadEvents(db, idNamespace, officeId);
    const history = historyRows(events);
    const timeline = officeholderTimeline(events);
    const adjacent = adjacentCycles(events);
    const holder = textOrNull(status?.current_holder_label);
    const crumbs = breadcrumb(db, {
      countryId: text(office.country_id),
      countryName: text(office.country_name) || text(office.country_id),
      officeName: text(office.name),
      jurisdictionKey: jurisdiction ? text(jurisdiction.jurisdiction_key) : null,
    });

    const parent = jurisdiction?.parent_key
      ? db
          .prepare("SELECT name, slug_path, depth FROM derived_jurisdiction WHERE jurisdiction_key = ?")
          .get(text(jurisdiction.parent_key))
      : undefined;

    const siblings =
      jurisdiction && tableExists(db, "derived_office_slug")
      ? db
          .prepare(
            `SELECT o.name, s.slug_path
             FROM office o
             JOIN derived_office_slug s ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id
             WHERE o.country_id = ? AND o.geography_id = ?
               AND NOT (o.id_namespace = ? AND o.office_id = ?)
             ORDER BY o.name, o.office_id, o.id_namespace`,
          )
          .all(text(office.country_id), text(office.geography_id), idNamespace, officeId)
          .map((row) => ({
            label: text(row.name),
            href: atlasRoutes.seat(text(row.slug_path)),
          }))
      : [];

    const provenance = provenanceFor(db, idNamespace, officeId, events, text(office.office_id));

    return {
      officeId: text(office.office_id),
      officeName: text(office.name),
      countryId: text(office.country_id),
      countryName: text(office.country_name) || text(office.country_id),
      idNamespace: text(office.id_namespace),
      lineageId: text(office.lineage_id),
      releaseId: textOrNull(office.release_id),
      kind: kindChip(formatAtlasTier(textOrNull(office.tier)), text(office.office_type)),
      electoralSystem: electoralSystemFromLatest(events),
      termYears: termYearsFromOfficeRaw(textOrNull(office.raw_json)),
      holderPhrase: holderPhrase({
        holder,
        since: sinceLabel,
        statusReason: textOrNull(status?.status_reason),
        officeType: text(office.office_type),
      }),
      holderShown: holder != null,
      nextElectionLabel: textOrNull(office.next_label),
      crumbs,
      readablePath: slug ? atlasRoutes.seat(text(slug.slug_path)) : null,
      history,
      timeline,
      related: {
        parent: parent
          ? {
              label: text(parent.name),
              href:
                numOrNull(parent.depth) === 0
                  ? atlasRoutes.country(text(office.country_id))
                  : atlasRoutes.jurisdiction(text(parent.slug_path)),
            }
          : null,
        siblings,
        previous: adjacent.previous
          ? { label: history.find((row) => row.eventId === adjacent.previous?.eventId)?.cycle ?? adjacent.previous.eventId, href: atlasRoutes.event(adjacent.previous.eventId) }
          : null,
        next: adjacent.next
          ? { label: history.find((row) => row.eventId === adjacent.next?.eventId)?.cycle ?? adjacent.next.eventId, href: atlasRoutes.event(adjacent.next.eventId) }
          : null,
      },
      provenance: provenance.length > 0 ? provenance : [officeProvenance(db, office, text(office.office_id))],
      historyKeys: events.map((event) => event.historyKey),
    };
  });
}

function breadcrumb(
  db: DatabaseSync,
  args: { countryId: string; countryName: string; officeName: string; jurisdictionKey: string | null },
): SeatCrumb[] {
  const crumbs: SeatCrumb[] = [{ label: "World", href: atlasRoutes.home }];
  if (!args.jurisdictionKey || !tableExists(db, "derived_jurisdiction")) {
    crumbs.push({ label: args.countryName, href: atlasRoutes.country(args.countryId) });
    crumbs.push({ label: args.officeName });
    return crumbs;
  }
  const chain: Array<{ name: string; slugPath: string; depth: number; countryId: string }> = [];
  let key: string | null = args.jurisdictionKey;
  const seen = new Set<string>();
  while (key && !seen.has(key)) {
    seen.add(key);
    const row = db
      .prepare(
        "SELECT jurisdiction_key, name, slug_path, parent_key, depth, country_id FROM derived_jurisdiction WHERE jurisdiction_key = ?",
      )
      .get(key);
    if (!row) break;
    chain.push({
      name: text(row.name),
      slugPath: text(row.slug_path),
      depth: Number(row.depth ?? 0),
      countryId: text(row.country_id),
    });
    key = textOrNull(row.parent_key);
  }
  chain.reverse();
  for (const place of chain) {
    crumbs.push({
      label: place.name,
      href: place.depth === 0 ? atlasRoutes.country(place.countryId) : atlasRoutes.jurisdiction(place.slugPath),
    });
  }
  crumbs.push({ label: args.officeName });
  return crumbs;
}

function loadEvents(db: DatabaseSync, idNamespace: string, officeId: string): SeatCycleEvent[] {
  if (!tableExists(db, "election_event")) return [];
  const eventRows = db
    .prepare(
      `SELECT e.event_id, e.history_key, e.selected_history_role, e.legal_outcome, e.record_state,
              e.electoral_system, e.date_resolution, e.date_id, e.share_unit, e.raw_json,
              d.label AS date_label, d.precision, d.year, d.month, d.day
       FROM election_event e
       LEFT JOIN research_date d ON d.date_id = e.date_id
       WHERE e.id_namespace = ? AND e.office_id = ?
       ORDER BY e.event_id`,
    )
    .all(idNamespace, officeId);

  const results = tableExists(db, "result_row")
    ? db
        .prepare(
          `SELECT history_key, result_row_id, proceeding_id, candidate_or_list_label, original_party_label,
                  votes, votes_status, share, share_status, share_unit, elected_flag, evidence_status
           FROM result_row
           WHERE id_namespace = ? AND office_id = ?
           ORDER BY result_row_id`,
        )
        .all(idNamespace, officeId)
    : [];

  const proceedings = tableExists(db, "proceeding")
    ? db
        .prepare(
          `SELECT history_key, proceeding_id, kind, sequence_no, legal_outcome
           FROM proceeding
           WHERE id_namespace = ? AND office_id = ?
           ORDER BY proceeding_id`,
        )
        .all(idNamespace, officeId)
    : [];

  const resultsByHistory = new Map<string, SeatCycleResult[]>();
  for (const row of results) {
    const key = text(row.history_key);
    const list = resultsByHistory.get(key) ?? [];
    list.push({
      resultRowId: text(row.result_row_id),
      proceedingId: textOrNull(row.proceeding_id),
      label: textOrNull(row.candidate_or_list_label),
      partyLabel: textOrNull(row.original_party_label),
      votes: numOrNull(row.votes),
      votesStatus: text(row.votes_status),
      share: numOrNull(row.share),
      shareStatus: text(row.share_status),
      shareUnit: text(row.share_unit),
      electedFlag: numOrNull(row.elected_flag),
      evidenceStatus: text(row.evidence_status),
    });
    resultsByHistory.set(key, list);
  }

  const proceedingsByHistory = new Map<string, SeatCycleProceeding[]>();
  for (const row of proceedings) {
    const key = text(row.history_key);
    const list = proceedingsByHistory.get(key) ?? [];
    list.push({
      proceedingId: text(row.proceeding_id),
      kind: text(row.kind),
      sequenceNo: numOrNull(row.sequence_no),
      legalOutcome: text(row.legal_outcome),
    });
    proceedingsByHistory.set(key, list);
  }

  return eventRows.map((row) => {
    const historyKey = text(row.history_key);
    return {
      eventId: text(row.event_id),
      historyKey,
      selectedHistoryRole: text(row.selected_history_role),
      legalOutcome: text(row.legal_outcome),
      recordState: text(row.record_state),
      electoralSystem: textOrNull(row.electoral_system),
      dateResolution: text(row.date_resolution),
      precision: textOrNull(row.precision),
      year: numOrNull(row.year),
      month: numOrNull(row.month),
      day: numOrNull(row.day),
      dateId: textOrNull(row.date_id),
      dateLabel: textOrNull(row.date_label),
      rawJson: textOrNull(row.raw_json),
      shareUnit: text(row.share_unit),
      results: resultsByHistory.get(historyKey) ?? [],
      proceedings: proceedingsByHistory.get(historyKey) ?? [],
    };
  });
}

function snapshotLabel(db: DatabaseSync, lineageId: string, releaseId: string | null): string | null {
  if (!releaseId || !tableExists(db, "dataset_release")) return null;
  const row = db
    .prepare(
      "SELECT research_snapshot_label FROM dataset_release WHERE lineage_id = ? AND release_id = ?",
    )
    .get(lineageId, releaseId);
  return textOrNull(row?.research_snapshot_label);
}

function sourcesFor(
  db: DatabaseSync,
  idNamespace: string,
  officeId: string,
  historyKey: string | null,
): { publisher: string | null; title: string | null; url: string | null; evidenceGrade: string | null } {
  if (!tableExists(db, "evidence_link") || !tableExists(db, "record_locator") || !tableExists(db, "source")) {
    return { publisher: null, title: null, url: null, evidenceGrade: null };
  }
  const rows = historyKey
    ? db
        .prepare(
          `SELECT s.publisher, s.title, s.url, s.evidence_grade
           FROM record_locator l
           JOIN evidence_link e ON e.record_key = l.record_key
           JOIN source s
             ON s.country_id = e.source_country_id
            AND s.source_namespace = e.source_namespace
            AND s.source_id = e.source_id
           WHERE l.entity_kind = 'event'
             AND l.id_namespace = ? AND l.office_id = ? AND l.history_key = ?
           ORDER BY s.source_id`,
        )
        .all(idNamespace, officeId, historyKey)
    : db
        .prepare(
          `SELECT s.publisher, s.title, s.url, s.evidence_grade
           FROM record_locator l
           JOIN evidence_link e ON e.record_key = l.record_key
           JOIN source s
             ON s.country_id = e.source_country_id
            AND s.source_namespace = e.source_namespace
            AND s.source_id = e.source_id
           WHERE l.entity_kind = 'office'
             AND l.id_namespace = ? AND l.office_id = ?
           ORDER BY s.source_id`,
        )
        .all(idNamespace, officeId);
  return {
    publisher: joinDistinct(rows.map((row) => textOrNull(row.publisher))),
    title: joinDistinct(rows.map((row) => textOrNull(row.title))),
    url: joinDistinct(rows.map((row) => textOrNull(row.url))),
    evidenceGrade: joinDistinct(rows.map((row) => textOrNull(row.evidence_grade))),
  };
}

function provenanceFor(
  db: DatabaseSync,
  idNamespace: string,
  officeId: string,
  events: SeatCycleEvent[],
  recordOfficeId: string,
): SeatProvenance[] {
  if (events.length === 0) return [];
  return events.map((event) => {
    const release = db
      .prepare("SELECT lineage_id, release_id FROM election_event WHERE id_namespace = ? AND event_id = ?")
      .get(idNamespace, event.eventId);
    const source = sourcesFor(db, idNamespace, officeId, event.historyKey);
    return {
      eventId: event.eventId,
      ...source,
      snapshotLabel: snapshotLabel(db, text(release?.lineage_id), textOrNull(release?.release_id)),
      recordId: event.eventId || recordOfficeId,
    };
  });
}

function officeProvenance(db: DatabaseSync, office: Record<string, unknown>, recordId: string): SeatProvenance {
  const source = sourcesFor(db, text(office.id_namespace), text(office.office_id), null);
  return {
    eventId: null,
    ...source,
    snapshotLabel: snapshotLabel(db, text(office.lineage_id), textOrNull(office.release_id)),
    recordId,
  };
}

export function listOfficeCandidates(officeId: string, sqlitePath = resolveAtlasSqlitePath()): OfficeCandidate[] {
  return withDatabase(sqlitePath, [], (db) => {
    if (!tableExists(db, "office")) return [];
    const slugJoin = tableExists(db, "derived_office_slug")
      ? "LEFT JOIN derived_office_slug s ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id"
      : "";
    const slugColumn = tableExists(db, "derived_office_slug") ? "s.slug_path" : "NULL AS slug_path";
    const jurisdictionJoin = tableExists(db, "derived_jurisdiction")
      ? "LEFT JOIN derived_jurisdiction j ON j.country_id = o.country_id AND j.geography_id = o.geography_id"
      : "";
    const jurisdictionColumn = tableExists(db, "derived_jurisdiction")
      ? "COALESCE(j.name, g.name)"
      : "g.name";
    return db
      .prepare(
        `SELECT o.id_namespace, o.office_id, o.name, ${jurisdictionColumn} AS jurisdiction_name, ${slugColumn}
         FROM office o
         LEFT JOIN geography g ON g.country_id = o.country_id AND g.geography_id = o.geography_id
         ${jurisdictionJoin}
         ${slugJoin}
         WHERE o.office_id = ?
         ORDER BY jurisdiction_name, o.name, o.id_namespace`,
      )
      .all(officeId)
      .map((row) => ({
        idNamespace: text(row.id_namespace),
        officeId: text(row.office_id),
        name: text(row.name),
        jurisdiction: text(row.jurisdiction_name) || "Jurisdiction not supplied",
        href: textOrNull(row.slug_path) ? atlasRoutes.seat(text(row.slug_path)) : null,
      }));
  });
}

export function resolveSeatAlias(
  jurisdictionSlugPath: string,
  officeSlug: string,
  sqlitePath = resolveAtlasSqlitePath(),
): SeatAliasResolution {
  const requested = `${jurisdictionSlugPath}/seats/${officeSlug}`;
  return withDatabase(sqlitePath, { status: "missing" } as SeatAliasResolution, (db) => {
    if (!tableExists(db, "derived_office_slug")) return { status: "missing" };
    const canonical = db
      .prepare("SELECT id_namespace, office_id, slug_path FROM derived_office_slug WHERE slug_path = ?")
      .get(requested);
    if (canonical) {
      return { status: "canonical", idNamespace: text(canonical.id_namespace), officeId: text(canonical.office_id) };
    }
    if (!tableExists(db, "derived_office_slug_alias")) return { status: "missing" };
    const alias = db
      .prepare("SELECT id_namespace, office_id FROM derived_office_slug_alias WHERE slug_path = ?")
      .get(requested);
    if (!alias) return { status: "missing" };
    const current = db
      .prepare("SELECT slug_path FROM derived_office_slug WHERE id_namespace = ? AND office_id = ?")
      .get(text(alias.id_namespace), text(alias.office_id));
    if (!current) return { status: "missing" };
    return { status: "redirect", href: atlasRoutes.seat(text(current.slug_path)) };
  });
}
