import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { WITHHELD_EVIDENCE, marginFromResults, type ResultFacts } from "../derive/seat";
import { countryCanonicalPath } from "../jurisdiction";
import { resolveAtlasSqlitePath } from "../paths";
import { atlasRoutes } from "../routes";
import { NOT_SUPPLIED, readerMargin, readerNumber, readerShare } from "../seat/history";
import { openAtlasDatabase, tableExists } from "../sqlite";
import { personSplitHref } from "./split";
import { assignPersonSlugs } from "./slug";

export type PersonCrumb = { label: string; href?: string };

export type PersonHistoryRow = {
  id: string;
  year: string;
  election: string;
  seat: string;
  seatHref: string;
  result: string;
  votes: string;
  share: string;
  margin: string;
  shareValue: number | null;
  shareUnit: string | null;
  label: string;
  elected: boolean;
  officeName: string;
  sortKey: string;
};

export type PersonOfficeHeld = {
  id: string;
  officeName: string;
  href: string;
  when: string;
};

export type PersonPageModel = {
  personId: string;
  slug: string;
  canonicalLabel: string;
  countryId: string;
  countryName: string;
  inOffice: boolean;
  alsoRecordedAs: string[];
  sourceLabelCount: number;
  reviewedOn: string | null;
  history: PersonHistoryRow[];
  officesHeld: PersonOfficeHeld[];
  crumbs: PersonCrumb[];
  splitHref: string;
  releaseId: string | null;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function textOrNull(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value);
  return next === "" ? null : next;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function electionLabel(precision: string | null, year: number | null, month: number | null, day: number | null): string {
  if (precision === "day" && year != null && month != null && day != null) return `${year}-${pad(month)}-${pad(day)}`;
  if (precision === "month" && year != null && month != null) return `${year}-${pad(month)}`;
  if (year != null && (precision === "year" || precision == null)) return String(year);
  if (year != null) return String(year);
  return NOT_SUPPLIED;
}

function resultLabel(elected: number | null): string {
  if (elected === 1) return "Elected";
  if (elected === 0) return "Not elected";
  return NOT_SUPPLIED;
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

type ApprovedPerson = {
  personId: string;
  canonicalLabel: string;
  countryId: string;
  countryName: string;
  reviewedOn: string | null;
  releaseId: string | null;
};

function listApprovedPersons(db: DatabaseSync): ApprovedPerson[] {
  if (!tableExists(db, "person")) return [];
  return db
    .prepare(
      `SELECT p.person_id, p.canonical_label, p.country_id, p.reviewed_on, p.created_from_release_id, c.name AS country_name
       FROM person p
       JOIN country c ON c.country_id = p.country_id
       WHERE p.review_status = 'approved'
       ORDER BY p.person_id`,
    )
    .all()
    .map((row) => ({
      personId: text(row.person_id),
      canonicalLabel: text(row.canonical_label),
      countryId: text(row.country_id),
      countryName: text(row.country_name),
      reviewedOn: textOrNull(row.reviewed_on),
      releaseId: textOrNull(row.created_from_release_id),
    }));
}

function inOffice(db: DatabaseSync, personId: string): boolean {
  if (!tableExists(db, "derived_seat_status")) return false;
  const row = db
    .prepare(
      `SELECT 1 AS ok
       FROM person_alias a
       JOIN office o ON o.country_id = a.country_id
       JOIN derived_seat_status s
         ON s.id_namespace = o.id_namespace
        AND s.office_id = o.office_id
        AND s.current_holder_label = a.candidate_or_list_label
       WHERE a.person_id = ?
         AND a.review_status = 'approved'
       LIMIT 1`,
    )
    .get(personId) as { ok?: number } | undefined;
  return Number(row?.ok ?? 0) === 1;
}

export function readPersonPage(slug: string, sqlitePath = resolveAtlasSqlitePath()): PersonPageModel | null {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  return withDatabase(sqlitePath, null, (db) => {
    const persons = listApprovedPersons(db);
    const slugs = assignPersonSlugs(
      persons.map((person) => ({
        personId: person.personId,
        canonicalLabel: person.canonicalLabel,
        countryId: person.countryId,
      })),
    );
    const person = persons.find((candidate) => slugs.get(candidate.personId) === trimmed);
    if (!person || !tableExists(db, "person_alias")) return null;

    const aliases = db
      .prepare(
        `SELECT candidate_or_list_label
         FROM person_alias
         WHERE person_id = ? AND review_status = 'approved'
         ORDER BY candidate_or_list_label`,
      )
      .all(person.personId)
      .map((row) => text(row.candidate_or_list_label));

    const withheld = [...WITHHELD_EVIDENCE];
    const placeholders = withheld.map(() => "?").join(", ");
    const historyRows = db
      .prepare(
        `SELECT r.result_row_id, r.candidate_or_list_label, r.votes, r.votes_status, r.share, r.share_status,
                r.share_unit, r.elected_flag, r.evidence_status, r.proceeding_id, r.id_namespace, r.office_id,
                r.history_key, o.name AS office_name, d.precision, d.year, d.month, d.day,
                p.legal_outcome AS proceeding_outcome
         FROM person_alias a
         JOIN result_row r
           ON r.country_id = a.country_id
          AND r.candidate_or_list_label = a.candidate_or_list_label
         JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
         JOIN election_event e
           ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
         LEFT JOIN research_date d ON d.date_id = e.date_id
         LEFT JOIN proceeding p
           ON p.id_namespace = r.id_namespace AND p.office_id = r.office_id
          AND p.history_key = r.history_key AND p.proceeding_id = r.proceeding_id
         WHERE a.person_id = ?
           AND a.review_status = 'approved'
           AND r.evidence_status NOT IN (${placeholders})
         ORDER BY d.year, d.month, d.day, o.name, r.result_row_id`,
      )
      .all(person.personId, ...withheld) as Array<Record<string, unknown>>;

    const eventKeys = new Map<string, { namespace: string; officeId: string; historyKey: string }>();
    for (const row of historyRows) {
      const key = `${text(row.id_namespace)}\u0000${text(row.office_id)}\u0000${text(row.history_key)}`;
      eventKeys.set(key, {
        namespace: text(row.id_namespace),
        officeId: text(row.office_id),
        historyKey: text(row.history_key),
      });
    }
    const margins = new Map<string, { margin: number | null; unit: string | null }>();
    for (const event of eventKeys.values()) {
      const rows = db
        .prepare(
          `SELECT r.result_row_id, r.proceeding_id, r.candidate_or_list_label, r.original_party_label,
                  r.share, r.share_status, r.share_unit, r.elected_flag, r.evidence_status,
                  p.legal_outcome AS proceeding_outcome
           FROM result_row r
           LEFT JOIN proceeding p
             ON p.id_namespace = r.id_namespace AND p.office_id = r.office_id
            AND p.history_key = r.history_key AND p.proceeding_id = r.proceeding_id
           WHERE r.id_namespace = ? AND r.office_id = ? AND r.history_key = ?`,
        )
        .all(event.namespace, event.officeId, event.historyKey) as Array<Record<string, unknown>>;
      const facts: ResultFacts[] = rows.map((row) => ({
        resultRowId: text(row.result_row_id),
        proceedingId: textOrNull(row.proceeding_id),
        proceedingOutcome: textOrNull(row.proceeding_outcome),
        label: textOrNull(row.candidate_or_list_label),
        partyLabel: textOrNull(row.original_party_label),
        share: numOrNull(row.share),
        shareStatus: text(row.share_status),
        shareUnit: text(row.share_unit),
        electedFlag: numOrNull(row.elected_flag),
        evidenceStatus: text(row.evidence_status),
      }));
      const key = `${event.namespace}\u0000${event.officeId}\u0000${event.historyKey}`;
      const margin = marginFromResults(facts);
      const unit = facts.find((fact) => fact.share != null)?.shareUnit ?? null;
      margins.set(key, { margin, unit });
    }

    const history: PersonHistoryRow[] = historyRows.map((row) => {
      const year = numOrNull(row.year);
      const month = numOrNull(row.month);
      const day = numOrNull(row.day);
      const electedFlag = numOrNull(row.elected_flag);
      const eventKey = `${text(row.id_namespace)}\u0000${text(row.office_id)}\u0000${text(row.history_key)}`;
      const margin = margins.get(eventKey);
      const share = numOrNull(row.share);
      const election = electionLabel(textOrNull(row.precision), year, month, day);
      const officeId = text(row.office_id);
      const sortKey = `${year ?? 0}-${month ?? 0}-${day ?? 0}-${officeId}-${text(row.result_row_id)}`;
      return {
        id: text(row.result_row_id),
        year: year == null ? NOT_SUPPLIED : String(year),
        election,
        seat: text(row.office_name) || NOT_SUPPLIED,
        seatHref: atlasRoutes.office(officeId),
        result: resultLabel(electedFlag),
        votes: readerNumber(numOrNull(row.votes), text(row.votes_status)),
        share: readerShare(share, text(row.share_status), text(row.share_unit)),
        margin: readerMargin(margin?.margin ?? null, margin?.unit ?? null),
        shareValue: share,
        shareUnit: textOrNull(row.share_unit),
        label: text(row.candidate_or_list_label),
        elected: electedFlag === 1,
        officeName: text(row.office_name),
        sortKey,
      };
    });
    history.sort((left, right) => left.sortKey.localeCompare(right.sortKey));

    const officesHeld: PersonOfficeHeld[] = history
      .filter((row) => row.elected)
      .map((row) => ({
        id: row.id,
        officeName: row.officeName || NOT_SUPPLIED,
        href: row.seatHref,
        when: row.election,
      }));

    const countryHref = countryCanonicalPath(person.countryId, sqlitePath);
    const alsoRecordedAs = aliases.filter((label) => label !== person.canonicalLabel);

    return {
      personId: person.personId,
      slug: trimmed,
      canonicalLabel: person.canonicalLabel,
      countryId: person.countryId,
      countryName: person.countryName,
      inOffice: inOffice(db, person.personId),
      alsoRecordedAs,
      sourceLabelCount: aliases.length,
      reviewedOn: person.reviewedOn,
      history,
      officesHeld,
      crumbs: [
        { label: "Atlas", href: atlasRoutes.home },
        { label: "People", href: `${atlasRoutes.search}?mode=person` },
        ...(countryHref ? [{ label: person.countryName, href: countryHref }] : []),
        { label: person.canonicalLabel },
      ],
      splitHref: personSplitHref(person.personId),
      releaseId: person.releaseId,
    };
  });
}
