import type { DatabaseSync } from "node:sqlite";
import { isSingleSeatOfficeType } from "../derive/seat";
import { turnoutFromEventRaw } from "../seat/history";
import { tableExists } from "../sqlite";

export type SeatMetricRow = {
  jurisdictionKey: string;
  executive: boolean;
  nextDateId: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
  margin: number | null;
  marginUnit: string | null;
};

export type TurnoutEventRow = {
  jurisdictionKey: string;
  eventId: string;
  year: number | null;
  month: number | null;
  day: number | null;
  turnout: number | null;
};

export type PlaceMetric = {
  nextDateId: string | null;
  nextYear: number | null;
  margin: number | null;
  marginUnit: string | null;
  turnout: number | null;
};

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

/** Earliest supplied next_date_id. A date id without a year is kept only when nothing is dated. */
export function earliestNextDate(rows: SeatMetricRow[]): { nextDateId: string | null; nextYear: number | null } {
  const dated = rows.filter((row) => row.nextDateId && row.year != null);
  if (dated.length === 0) {
    const any = rows.find((row) => row.nextDateId);
    return any ? { nextDateId: any.nextDateId, nextYear: null } : { nextDateId: null, nextYear: null };
  }
  dated.sort(
    (a, b) =>
      a.year! - b.year! ||
      (a.month ?? 0) - (b.month ?? 0) ||
      (a.day ?? 0) - (b.day ?? 0) ||
      a.nextDateId!.localeCompare(b.nextDateId!),
  );
  return { nextDateId: dated[0]!.nextDateId, nextYear: dated[0]!.year };
}

/**
 * One margin only. Two supplied margins are not averaged.
 * A single-seat office wins when it is the only one with a margin.
 */
export function suppliedMargin(rows: SeatMetricRow[]): { margin: number | null; marginUnit: string | null } {
  const present = rows.filter((row) => row.margin != null && row.marginUnit);
  const executives = present.filter((row) => row.executive);
  const pool = executives.length > 0 ? executives : present;
  if (pool.length !== 1) return { margin: null, marginUnit: null };
  return { margin: pool[0]!.margin, marginUnit: pool[0]!.marginUnit };
}

/** Latest event that supplies both registered voters and ballots. Tied dates must agree. */
export function latestTurnout(events: TurnoutEventRow[]): number | null {
  const dated = events.filter(
    (event) => event.turnout != null && event.year != null && event.month != null && event.day != null,
  );
  if (dated.length === 0) {
    const undated = events.filter((event) => event.turnout != null);
    return undated.length === 1 ? undated[0]!.turnout : null;
  }
  dated.sort(
    (a, b) => b.year! - a.year! || b.month! - a.month! || b.day! - a.day! || a.eventId.localeCompare(b.eventId),
  );
  const top = dated[0]!;
  const ties = dated.filter((event) => event.year === top.year && event.month === top.month && event.day === top.day);
  const values = new Set(ties.map((event) => event.turnout));
  if (values.size !== 1) return null;
  return top.turnout;
}

export function reducePlaceMetrics(seats: SeatMetricRow[], turnouts: TurnoutEventRow[]): Map<string, PlaceMetric> {
  const seatGroups = new Map<string, SeatMetricRow[]>();
  for (const row of seats) {
    const list = seatGroups.get(row.jurisdictionKey) ?? [];
    list.push(row);
    seatGroups.set(row.jurisdictionKey, list);
  }
  const turnoutGroups = new Map<string, TurnoutEventRow[]>();
  for (const row of turnouts) {
    const list = turnoutGroups.get(row.jurisdictionKey) ?? [];
    list.push(row);
    turnoutGroups.set(row.jurisdictionKey, list);
  }
  const keys = new Set([...seatGroups.keys(), ...turnoutGroups.keys()]);
  const metrics = new Map<string, PlaceMetric>();
  for (const key of keys) {
    const next = earliestNextDate(seatGroups.get(key) ?? []);
    const margin = suppliedMargin(seatGroups.get(key) ?? []);
    metrics.set(key, {
      nextDateId: next.nextDateId,
      nextYear: next.nextYear,
      margin: margin.margin,
      marginUnit: margin.marginUnit,
      turnout: latestTurnout(turnoutGroups.get(key) ?? []),
    });
  }
  return metrics;
}

export function loadPlaceMetrics(db: DatabaseSync, parentKey: string): Map<string, PlaceMetric> {
  try {
    return loadPlaceMetricsUnsafe(db, parentKey);
  } catch {
    return new Map();
  }
}

function loadPlaceMetricsUnsafe(db: DatabaseSync, parentKey: string): Map<string, PlaceMetric> {
  if (!tableExists(db, "office") || !tableExists(db, "derived_jurisdiction")) return new Map();
  const seats: SeatMetricRow[] = tableExists(db, "derived_seat_status")
    ? (
        db
          .prepare(
            `SELECT j.jurisdiction_key AS jurisdiction_key,
                    o.office_type AS office_type,
                    s.next_date_id AS next_date_id,
                    d.year AS year,
                    d.month AS month,
                    d.day AS day,
                    s.last_margin AS last_margin,
                    s.last_share_unit AS last_share_unit
             FROM derived_jurisdiction j
             JOIN office o ON o.country_id = j.country_id AND o.geography_id = j.geography_id
             LEFT JOIN derived_seat_status s
               ON s.id_namespace = o.id_namespace AND s.office_id = o.office_id
             LEFT JOIN research_date d ON d.date_id = s.next_date_id
             WHERE j.parent_key = ?`,
          )
          .all(parentKey) as Array<Record<string, unknown>>
      ).map((row) => ({
        jurisdictionKey: String(row.jurisdiction_key),
        executive: isSingleSeatOfficeType(String(row.office_type ?? "")),
        nextDateId: textOrNull(row.next_date_id),
        year: numOrNull(row.year),
        month: numOrNull(row.month),
        day: numOrNull(row.day),
        margin: numOrNull(row.last_margin),
        marginUnit: textOrNull(row.last_share_unit),
      }))
    : [];

  const turnouts: TurnoutEventRow[] =
    tableExists(db, "election_event")
      ? (
          db
            .prepare(
              `SELECT j.jurisdiction_key AS jurisdiction_key,
                      e.event_id AS event_id,
                      e.raw_json AS raw_json,
                      d.year AS year,
                      d.month AS month,
                      d.day AS day
               FROM derived_jurisdiction j
               JOIN office o ON o.country_id = j.country_id AND o.geography_id = j.geography_id
               JOIN election_event e ON e.id_namespace = o.id_namespace AND e.office_id = o.office_id
               LEFT JOIN research_date d ON d.date_id = e.date_id
               WHERE j.parent_key = ?`,
            )
            .all(parentKey) as Array<Record<string, unknown>>
        ).map((row) => ({
          jurisdictionKey: String(row.jurisdiction_key),
          eventId: String(row.event_id ?? ""),
          year: numOrNull(row.year),
          month: numOrNull(row.month),
          day: numOrNull(row.day),
          turnout: turnoutFromEventRaw(textOrNull(row.raw_json)),
        }))
      : [];

  return reducePlaceMetrics(seats, turnouts);
}
