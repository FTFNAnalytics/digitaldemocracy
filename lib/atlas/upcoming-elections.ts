import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { UPCOMING_CALENDAR_RELATIVE as BULGARIA_CALENDAR } from "./bulgaria/identity";
import { UPCOMING_CALENDAR_RELATIVE as GEORGIA_CALENDAR } from "./georgia/identity";
import { UPCOMING_CALENDAR_RELATIVE as KOSOVO_CALENDAR } from "./kosovo/identity";
import { repoRoot } from "./paths";
import { UPCOMING_CALENDAR_RELATIVE as URUGUAY_CALENDAR } from "./uruguay/identity";

/** Documentary Chile country-surface calendar. Not an importer input. */
export const CHILE_UPCOMING_CALENDAR_RELATIVE = "docs/phase1/chile/data/upcoming_calendar.json";

/**
 * Documentary next-cycle families for country surfaces.
 * Reads the landed upcoming-calendar files. Does not create election events,
 * results, or sources. Exact calendar days are shown only when the pack
 * already records them as official calls.
 */

const ISO_DAY = /\b\d{4}-\d{2}-\d{2}\b/;
const ISO_DAY_EXACT = /^\d{4}-\d{2}-\d{2}$/;
const STATED_DAY = /\b\d{1,2} [A-Z][a-z]+ \d{4}\b/;

const CALENDAR_FILES = {
  uruguay: URUGUAY_CALENDAR,
  georgia: GEORGIA_CALENDAR,
  kosovo: KOSOVO_CALENDAR,
  bulgaria: BULGARIA_CALENDAR,
  chile: CHILE_UPCOMING_CALENDAR_RELATIVE,
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
  kosovo:
    "Ordinary contest families for Kosovo. Each date is a constitutional or statutory formula and year. Exact calendar days are not asserted, and formal calls remain pending.",
  bulgaria:
    "Documentary contest families for Bulgaria. Formula rows state a constitutional or statutory formula and year, and their formal calls remain pending. Official calls already recorded in the pack are shown as stated. No polling day is invented beyond those calls.",
  chile:
    "Documentary contest families for Chile. Ordinary rows state a constitutional or statutory formula and year from the pack. Exact calendar days are not asserted, and formal calls remain unverified. Policy and research rows stay holds rather than ordinary production dates.",
};

const cache = new Map<string, UpcomingElectionsModel | null>();

function isCountryId(value: string): value is UpcomingElectionCountryId {
  return value === "uruguay" || value === "georgia" || value === "kosovo" || value === "bulgaria" || value === "chile";
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
  const text = readFileSync(absPath, "utf8").replace(/^\uFEFF/, "").trim();
  if (!text) return [];
  // Bulgaria BI and Chile BJ land cards arrays. Uruguay, Georgia, and Kosovo stay JSONL.
  if (text.startsWith("[")) {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error(`Upcoming calendar ${relativePath} is not an array`);
    }
    return parsed;
  }
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as unknown);
}

function yearOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): number | null {
  const value =
    countryId === "uruguay" || countryId === "kosovo" || countryId === "chile"
      ? row.next_occurrence_year
      : row.next_year;
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`Upcoming calendar ${String(row.calendar_id ?? "")} year is not an integer`);
  }
  return value;
}

function prominent(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): boolean {
  // Uruguay uses must_surface_prominently_on_country_surface. Chile BJ uses country_surface_required.
  // Georgia, Kosovo, and Bulgaria use country_surface_prominent.
  if (countryId === "uruguay") return row.must_surface_prominently_on_country_surface === true;
  if (countryId === "chile") return row.country_surface_required === true;
  return row.country_surface_prominent === true;
}

function isResearchHold(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): boolean {
  if (countryId === "georgia") {
    return row.date_formula == null || row.next_year == null || row.date_basis === "research hold";
  }
  if (countryId === "kosovo") {
    return row.date_formula == null || row.next_occurrence_year == null || row.date_basis === "research_hold";
  }
  if (countryId === "bulgaria") {
    return row.date_basis === "research hold" || row.next_year == null;
  }
  if (countryId === "chile") {
    const basis = typeof row.date_basis === "string" ? row.date_basis : "";
    return basis.includes("policy_hold") || basis.includes("research_hold");
  }
  return false;
}

function isBulgariaOfficialCall(row: Record<string, unknown>): boolean {
  return (
    row.date_basis === "CIK / official call / decree" &&
    row.formal_call === "issued" &&
    row.date_precision === "day"
  );
}

function inventedDay(text: string): boolean {
  return ISO_DAY.test(text) || STATED_DAY.test(text);
}

function bulgariaWhen(row: Record<string, unknown>, id: string): string {
  const nextLabel = requireString(row, "next_label", id);
  if (isBulgariaOfficialCall(row)) {
    const scheduled = row.scheduled_date;
    if (typeof scheduled !== "string" || !ISO_DAY_EXACT.test(scheduled)) {
      throw new Error(`Upcoming calendar ${id} official call is missing the pack scheduled day`);
    }
    const isoDays = nextLabel.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
    for (const day of isoDays) {
      if (day !== scheduled) {
        throw new Error(`Upcoming calendar ${id} label includes a day other than the official call`);
      }
    }
    return nextLabel;
  }
  if (row.scheduled_date != null) {
    throw new Error(`Upcoming calendar ${id} formula row records a scheduled day`);
  }
  if (inventedDay(nextLabel)) {
    throw new Error(`Upcoming calendar ${id} formula includes an exact day`);
  }
  return nextLabel;
}

function kindOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId): UpcomingElectionKind {
  if (countryId === "chile") {
    const basis = typeof row.date_basis === "string" ? row.date_basis : "";
    return basis.includes("conditional") ? "conditional" : "ordinary";
  }
  if (countryId === "bulgaria") {
    return typeof row.conditional === "string" && row.conditional.trim() !== "" ? "conditional" : "ordinary";
  }
  if (countryId === "georgia" && row.selection_mode === "indirect_electoral_college") return "indirect";
  if (row.conditional === true) return "conditional";
  const basis = typeof row.date_basis === "string" ? row.date_basis : "";
  const label = typeof row.office_family === "string" ? row.office_family : "";
  if (basis.startsWith("conditional") || label.startsWith("Conditional")) return "conditional";
  return "ordinary";
}

function labelOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId, id: string): string {
  if (countryId === "bulgaria") return requireString(row, "contest_name", id);
  if (countryId === "chile") return requireString(row, "office_family_label", id);
  return requireString(row, "office_family", id);
}

function humanPhrase(value: string): string {
  return value.trim().replaceAll("_", " ");
}

function basisOf(row: Record<string, unknown>, countryId: UpcomingElectionCountryId, id: string): string {
  if (countryId === "uruguay") {
    const status = typeof row.formal_convocatoria_status === "string" ? row.formal_convocatoria_status : "";
    return status.includes("pending")
      ? "Constitutional/statutory formula; formal convocatoria pending"
      : "Constitutional/statutory formula";
  }
  if (countryId === "bulgaria") {
    const basis = requireString(row, "date_basis", id);
    const call = typeof row.formal_call === "string" ? row.formal_call.trim() : "";
    return call ? `${sentence(basis)}; ${call}` : sentence(basis);
  }
  if (countryId === "chile") {
    const basis = sentence(humanPhrase(requireString(row, "date_basis", id)));
    const call = typeof row.formal_call_status === "string" ? humanPhrase(row.formal_call_status) : "";
    const head = call ? `${basis}; ${call}` : basis;
    const notes = typeof row.notes === "string" ? row.notes.trim() : "";
    // Term-start and comparable days in notes are not polling calls. Drop them rather than surface a day.
    if (notes === "" || inventedDay(notes)) return head;
    return `${head}. ${notes}`;
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

/** Chile display dates are the pack date_formula. exact_date is never copied or invented. */
function assertChileDocumentaryCard(row: Record<string, unknown>, id: string): void {
  if (row.exact_date != null) {
    throw new Error(`Upcoming calendar ${id} records an exact day`);
  }
  if (row.production_applied === true) {
    throw new Error(`Upcoming calendar ${id} is marked production applied`);
  }
  if (row.global_alert_window_changes_coverage === true) {
    throw new Error(`Upcoming calendar ${id} changes alert-window coverage`);
  }
}

function chileWhen(row: Record<string, unknown>, id: string): string {
  const formula = requireString(row, "date_formula", id);
  if (inventedDay(formula)) {
    throw new Error(`Upcoming calendar ${id} formula includes an exact day`);
  }
  return formula;
}

function chileHoldNote(row: Record<string, unknown>, id: string): string {
  if (row.exact_date != null) {
    throw new Error(`Upcoming calendar ${id} hold records an exact day`);
  }
  const basis = requireString(row, "date_basis", id);
  const prefix = basis.includes("policy_hold") ? "Policy hold" : "Research hold";
  const status = sentence(humanPhrase(requireString(row, "formal_call_status", id))).replace(/\.$/, "");
  const formula = typeof row.date_formula === "string" ? row.date_formula.trim() : "";
  const notes = typeof row.notes === "string" ? row.notes.trim() : "";
  const condition = typeof row.condition === "string" ? row.condition.trim() : "";
  const bodyParts: string[] = [];
  for (const part of [formula, notes, condition]) {
    if (part === "") continue;
    if (bodyParts.some((existing) => existing.includes(part))) continue;
    if (inventedDay(part)) {
      throw new Error(`Upcoming calendar ${id} hold includes an exact day`);
    }
    bodyParts.push(part);
  }
  const body = bodyParts.join(" ");
  return body ? `${prefix}. ${status}. ${body}` : `${prefix}. ${status}.`;
}

function holdNote(row: Record<string, unknown>, countryId: UpcomingElectionCountryId, id: string): string {
  if (countryId === "chile") return chileHoldNote(row, id);
  if (countryId === "bulgaria") {
    if (row.scheduled_date != null) {
      throw new Error(`Upcoming calendar ${id} research hold records a scheduled day`);
    }
    const status = sentence(requireString(row, "formal_call", id)).replace(/\.$/, "");
    const detail = typeof row.next_label === "string" ? row.next_label.trim() : "";
    const extra = typeof row.conditional === "string" ? row.conditional.trim() : "";
    if (inventedDay(detail) || (extra !== "" && inventedDay(extra))) {
      throw new Error(`Upcoming calendar ${id} research hold includes an exact day`);
    }
    const body = [detail, extra && !detail.includes(extra) ? extra : ""].filter((part) => part !== "").join(" ");
    return body ? `Research hold. ${status}. ${body}` : `Research hold. ${status}.`;
  }
  const status = sentence(requireString(row, "formal_call_status", id)).replace(/\.$/, "");
  const notes = typeof row.notes === "string" ? row.notes.trim() : "";
  return notes ? `Research hold. ${status}. ${notes}` : `Research hold. ${status}.`;
}

/** Turn landed calendar rows into the country-surface model. Exact date fields are not copied. */
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
    if (countryId === "chile") assertChileDocumentaryCard(row, id);
    if (!prominent(row, countryId)) continue;
    const label = labelOf(row, countryId, id);
    if (isResearchHold(row, countryId)) {
      holds.push({ id, label, note: holdNote(row, countryId, id) });
      continue;
    }
    const year = yearOf(row, countryId);
    if (year == null) {
      throw new Error(`Upcoming calendar ${id} has no year`);
    }
    const when =
      countryId === "bulgaria"
        ? bulgariaWhen(row, id)
        : countryId === "chile"
          ? chileWhen(row, id)
          : whenOf(requireString(row, "date_formula", id), year, id);
    const conditionSource = countryId === "bulgaria" ? row.conditional : row.condition;
    const condition = typeof conditionSource === "string" && conditionSource.trim() ? conditionSource.trim() : null;
    families.push({
      id,
      label,
      when,
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
