import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./paths";
import { UPCOMING_CALENDAR_RELATIVE as GEORGIA_CALENDAR } from "./georgia/identity";
import { UPCOMING_CALENDAR_RELATIVE as URUGUAY_CALENDAR } from "./uruguay/identity";

/**
 * Documentary next-cycle families for country surfaces.
 * Reads the landed upcoming-calendar files. Does not create election events,
 * results, sources, or exact calendar days.
 */

const ISO_DAY = /\b\d{4}-\d{2}-\d{2}\b/;

const CALENDAR_FILES = {
  uruguay: URUGUAY_CALENDAR,
  georgia: GEORGIA_CALENDAR,
} as const;

export type UpcomingElectionCountryId = keyof typeof CALENDAR_FILES;

export type UpcomingElectionKind = "ordinary" | "conditional" | "indirect";

export type UpcomingElectionFamily = {
  id: string;
  label: string;
  when: string;
  basis: string;
  kind: UpcomingElectionKind;
  condition: string | null;
};

export type UpcomingElectionHold = {
  id: string;
  label: string;
  note: string;
};

export type UpcomingElectionsModel = {
  countryId: UpcomingElectionCountryId;
  intro: string;
  families: UpcomingElectionFamily[];
  holds: UpcomingElectionHold[];
};

const INTRO: Record<UpcomingElectionCountryId, string> = {
  uruguay:
    "Ordinary contest families for Uruguay. Each date is a constitutional or statutory formula and year. Exact calendar days are not asserted, and a formal convocatoria remains pending.",
  georgia:
    "Ordinary contest families for Georgia (GE). Each date is a constitutional or statutory formula and year. Exact calendar days are not asserted, and formal calls remain pending.",
};

const cache = new Map<string, UpcomingElectionsModel | null>();

function isCountryId(value: string): value is UpcomingElectionCountryId {
  return value === "uruguay" || value === "georgia";
}

function sentence(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function requireString(row: Record<string, unknown>, key: string, id: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Upcoming calendar ${id} is missing ${key}`);
  }
  return value.trim();
}

function readCalendar(relativePath: string, root: string): unknown[] {
  const absPath = path.join(root, relativePath);
  if (!existsSync(absPath)) return [];
  return readFileSync(absPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as unknown);
}

function yearOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): number | null {
  const value = countryId === "uruguay" ? row.next_occurrence_year : row.next_year;
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`Upcoming calendar ${String(row.calendar_id ?? "")} year is not an integer`);
  }
  return value;
}

function prominent(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): boolean {
  return countryId === "uruguay"
    ? row.must_surface_prominently_on_country_surface === true
    : row.country_surface_prominent === true;
}

function isResearchHold(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): boolean {
  if (countryId !== "georgia") return false;
  return row.date_formula == null || row.next_year == null || row.date_basis === "research hold";
}

function kindOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): UpcomingElectionKind {
  if (countryId === "georgia" && row.selection_mode === "indirect_electoral_college") return "indirect";
  if (row.conditional === true) return "conditional";
  const basis = typeof row.date_basis === "string" ? row.date_basis : "";
  const label = typeof row.office_family === "string" ? row.office_family : "";
  if (basis.startsWith("conditional") || label.startsWith("Conditional")) return "conditional";
  return "ordinary";
}

function basisOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId, id: string): string {
  if (countryId === "uruguay") {
    const status = typeof row.formal_convocatoria_status === "string" ? row.formal_convocatoria_status : "";
    return status.includes("pending")
      ? "Constitutional/statutory formula; formal convocatoria pending"
      : "Constitutional/statutory formula";
  }
  const basis = requireString(row, "date_basis", id);
  const call = typeof row.formal_call_status === "string" ? row.formal_call_status.trim() : "";
  return call ? `${sentence(basis)}; ${call}` : sentence(basis);
}

function whenOf(formula: string, year: number, id: string): string {
  const when = `${formula}, ${year}`;
  if (ISO_DAY.test(when)) {
    throw new Error(`Upcoming calendar ${id} formula includes an exact day`);
  }
  return when;
}

function holdNote(row: Record<string, unknown>, id: string): string {
  const status = sentence(requireString(row, "formal_call_status", id)).replace(/\.$/, "");
  const notes = typeof row.notes === "string" ? row.notes.trim() : "";
  return notes ? `Research hold. ${status}. ${notes}` : `Research hold. ${status}.`;
}

/** Turn landed calendar rows into the country-surface model. Exact date fields are ignored. */
export function projectUpcomingCalendar(countryId: string, rows: unknown[]): UpcomingElectionsModel | null {
  if (!isCountryId(countryId)) return null;
  const families: UpcomingElectionFamily[] = [];
  const holds: UpcomingElectionHold[] = [];
  for (const rowUnknown of rows) {
    if (rowUnknown == null || typeof rowUnknown !== "object" || Array.isArray(rowUnknown)) {
      throw new Error(`Upcoming calendar for ${countryId} has a row that is not an object`);
    }
    const row = rowUnknown as Record<string, unknown>;
    const id = requireString(row, "calendar_id", countryId);
    if (!prominent(row, countryId)) continue;
    const label = requireString(row, "office_family", id);
    if (isResearchHold(row, countryId)) {
      holds.push({ id, label, note: holdNote(row, id) });
      continue;
    }
    const formula = requireString(row, "date_formula", id);
    const year = yearOf(row, countryId);
    if (year == null) {
      throw new Error(`Upcoming calendar ${id} has no year`);
    }
    const condition = typeof row.condition === "string" && row.condition.trim() ? row.condition.trim() : null;
    families.push({
      id,
      label,
      when: whenOf(formula, year, id),
      basis: basisOf(row, countryId, id),
      kind: kindOf(row, countryId),
      condition,
    });
  }
  if (families.length === 0 && holds.length === 0) return null;
  return { countryId, intro: INTRO[countryId], families, holds };
}

export function upcomingElectionsForCountry(countryId: string, root = repoRoot()): UpcomingElectionsModel | null {
  const key = `${root}\n${countryId}`;
  if (cache.has(key)) return cache.get(key) ?? null;
  if (!isCountryId(countryId)) {
    cache.set(key, null);
    return null;
  }
  const rows = readCalendar(CALENDAR_FILES[countryId], root);
  const model = rows.length === 0 ? null : projectUpcomingCalendar(countryId, rows);
  cache.set(key, model);
  return model;
}

/** Country root only. Child places keep the ordinary jurisdiction page. */
export function upcomingElectionsForJurisdiction(
  args: { countryId: string; levelLabel: string },
  root = repoRoot(),
): UpcomingElectionsModel | null {
  if (args.levelLabel !== "country") return null;
  return upcomingElectionsForCountry(args.countryId, root);
}
