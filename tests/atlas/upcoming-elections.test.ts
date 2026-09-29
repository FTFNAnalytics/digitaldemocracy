import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { UpcomingElectionsCallout } from "../../components/atlas/upcoming-elections-callout";
import { JurisdictionTemplate } from "../../components/atlas/jurisdiction-template";
import AtlasJurisdictionPage from "../../app/atlas/[country]/[[...path]]/page";
import { importBulgaria } from "../../lib/atlas/bulgaria/import";
import { UPCOMING_CALENDAR_RELATIVE as BULGARIA_CALENDAR } from "../../lib/atlas/bulgaria/identity";
import { importGeorgia } from "../../lib/atlas/georgia/import";
import { UPCOMING_CALENDAR_RELATIVE as GEORGIA_CALENDAR } from "../../lib/atlas/georgia/identity";
import { importKosovo } from "../../lib/atlas/kosovo/import";
import { UPCOMING_CALENDAR_RELATIVE as KOSOVO_CALENDAR } from "../../lib/atlas/kosovo/identity";
import { importUruguay } from "../../lib/atlas/uruguay/import";
import { UPCOMING_CALENDAR_RELATIVE as URUGUAY_CALENDAR } from "../../lib/atlas/uruguay/identity";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import {
  projectUpcomingCalendar,
  upcomingElectionsForCountry,
  upcomingElectionsForJurisdiction,
  type UpcomingElectionsModel,
} from "../../lib/atlas/upcoming-elections";

const repoRoot = path.join(import.meta.dirname, "../..");
const ISO_DAY = /\b\d{4}-\d{2}-\d{2}\b/;

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function calendarRows(relativePath: string): Array<Record<string, unknown>> {
  return readFileSync(path.join(repoRoot, relativePath), "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

function calendarCards(relativePath: string): Array<Record<string, unknown>> {
  const parsed = JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8")) as unknown;
  if (!Array.isArray(parsed)) throw new Error(`${relativePath} is not a cards array`);
  return parsed as Array<Record<string, unknown>>;
}

function expectNoExactDays(model: UpcomingElectionsModel): void {
  const serialized = JSON.stringify(model);
  expect(serialized).not.toMatch(ISO_DAY);
  for (const family of model.families) {
    expect(family.when).not.toMatch(ISO_DAY);
    expect(family.when).toMatch(/, 20\d{2}$/);
  }
}

describe("documentary upcoming elections", () => {
  it("projects Uruguay families from the landed calendar without exact days", () => {
    const rows = calendarRows(URUGUAY_CALENDAR);
    const model = upcomingElectionsForCountry("uruguay", repoRoot);
    expect(model?.countryId).toBe("uruguay");
    expect(rows).toHaveLength(8);
    expect(model?.families).toHaveLength(8);
    expect(model?.holds).toEqual([]);
    expect(model?.intro).toContain("Uruguay");
    expect(model?.intro).toContain("formal convocatoria remains pending");
    for (const row of rows) {
      expect(row.exact_date).toBeNull();
      expect(row.must_surface_prominently_on_country_surface).toBe(true);
      const family = model?.families.find((item) => item.id === row.calendar_id);
      expect(family?.label).toBe(row.office_family);
      expect(family?.when).toBe(`${row.date_formula}, ${row.next_occurrence_year}`);
      expect(family?.basis).toBe("Constitutional/statutory formula; formal convocatoria pending");
    }
    expect(model?.families.find((item) => item.id === "UY-NEXT-RUNOFF")).toMatchObject({
      kind: "conditional",
      when: "Last Sunday of November, 2029",
      condition: "Only if no presidential ticket obtains an absolute majority of voters in first round",
    });
    expect(model?.families.find((item) => item.id === "UY-NEXT-PRES")?.when).toBe("Last Sunday of October, 2029");
    expect(model?.families.find((item) => item.id === "UY-NEXT-I")?.when).toContain("2030");
    expectNoExactDays(model!);
  });

  it("projects Georgia families and keeps the five councils as a research hold", () => {
    const rows = calendarRows(GEORGIA_CALENDAR);
    const model = upcomingElectionsForCountry("georgia", repoRoot);
    expect(model?.countryId).toBe("georgia");
    expect(rows).toHaveLength(7);
    expect(model?.families.map((item) => item.id)).toEqual([
      "GE-BG-UP-PARL",
      "GE-BG-UP-PRES-INDIRECT",
      "GE-BG-UP-ADJ",
      "GE-BG-UP-COUNCIL",
      "GE-BG-UP-MAYOR",
      "GE-BG-UP-MAYOR-R2",
    ]);
    expect(model?.intro).toContain("Georgia (GE)");
    for (const row of rows) {
      expect(row.next_exact_date).toBeNull();
      expect(row.country_surface_prominent).toBe(true);
      if (row.calendar_id === "GE-BG-UP-HELD") continue;
      const family = model?.families.find((item) => item.id === row.calendar_id);
      expect(family?.label).toBe(row.office_family);
      expect(family?.when).toBe(`${row.date_formula}, ${row.next_year}`);
    }
    expect(model?.families.find((item) => item.id === "GE-BG-UP-PARL")?.when).toBe(
      "Last Saturday of October in the year the four-year parliamentary term expires, 2028",
    );
    expect(model?.families.find((item) => item.id === "GE-BG-UP-ADJ")?.when).toContain("2028");
    expect(model?.families.find((item) => item.id === "GE-BG-UP-COUNCIL")?.when).toContain("2029");
    expect(model?.families.find((item) => item.id === "GE-BG-UP-MAYOR")?.when).toContain("First Saturday of October");
    expect(model?.families.find((item) => item.id === "GE-BG-UP-PRES-INDIRECT")).toMatchObject({
      kind: "indirect",
      label: "President — indirect selection path (context only)",
    });
    expect(model?.families.find((item) => item.id === "GE-BG-UP-MAYOR-R2")?.kind).toBe("conditional");
    expect(model?.holds).toHaveLength(1);
    expect(model?.holds[0]).toMatchObject({
      id: "GE-BG-UP-HELD",
      label: "Five statutory-continuation councils",
    });
    expect(model?.holds[0]?.note).toContain("Research hold");
    expect(model?.holds[0]?.note).toContain("Akhalgori, Eredvi, Kurta, Tighva, Azhara");
    expect(model?.holds[0]?.note).not.toMatch(ISO_DAY);
    expect(model?.holds[0]?.note).not.toContain("2006");
    expectNoExactDays(model!);
  });

  it("ignores an exact date field and stays off other countries and child places", () => {
    const projected = projectUpcomingCalendar("uruguay", [
      {
        calendar_id: "UY-TEST",
        office_family: "Fixture family",
        date_formula: "Last Sunday of October",
        next_occurrence_year: 2029,
        exact_date: "2029-10-28",
        formal_convocatoria_status: "pending_not_found",
        must_surface_prominently_on_country_surface: true,
        conditional: false,
      },
    ]);
    expect(projected?.families[0]?.when).toBe("Last Sunday of October, 2029");
    expect(JSON.stringify(projected)).not.toContain("2029-10-28");
    expect(upcomingElectionsForCountry("albania", repoRoot)).toBeNull();
    expect(upcomingElectionsForCountry("united-states", repoRoot)).toBeNull();
    expect(upcomingElectionsForCountry("serbia", repoRoot)).toBeNull();
    expect(upcomingElectionsForJurisdiction({ countryId: "uruguay", levelLabel: "municipality" }, repoRoot)).toBeNull();
    expect(upcomingElectionsForJurisdiction({ countryId: "georgia", levelLabel: "region" }, repoRoot)).toBeNull();
    expect(upcomingElectionsForJurisdiction({ countryId: "kosovo", levelLabel: "municipality" }, repoRoot)).toBeNull();
  });

  it("projects Kosovo ordinary families and research holds without exact days", () => {
    const rows = calendarRows(KOSOVO_CALENDAR);
    const model = upcomingElectionsForCountry("kosovo", repoRoot);
    expect(model?.countryId).toBe("kosovo");
    expect(rows).toHaveLength(9);
    expect(model?.families.map((item) => item.id)).toEqual(["XK-BH-C01", "XK-BH-C03", "XK-BH-C04", "XK-BH-C05"]);
    expect(model?.holds.map((item) => item.id)).toEqual(["XK-BH-C02", "XK-BH-C06", "XK-BH-C07", "XK-BH-C08", "XK-BH-C09"]);
    expect(model?.intro).toContain("Kosovo");
    expect(model?.intro).toContain("formula and year");
    expect(model?.intro).toContain("Exact calendar days are not asserted");
    expect(model?.intro).toContain("formal calls remain pending");
    for (const row of rows) {
      expect(row.scheduled_date).toBeNull();
      expect(row.country_surface_prominent).toBe(true);
      expect(String(row.date_formula ?? "")).not.toMatch(ISO_DAY);
    }
    expect(model?.families.find((item) => item.id === "XK-BH-C01")).toMatchObject({
      label: "Assembly of Kosovo",
      kind: "ordinary",
      when: "Sunday 60–30 days before expiry of the four-year term beginning at the 2026 constitutive session, 2030",
      basis: "Constitutional_statutory_formula; pending_or_not_retained",
      condition: null,
    });
    expect(model?.families.find((item) => item.id === "XK-BH-C03")).toMatchObject({
      label: "Municipal assemblies (38)",
      kind: "ordinary",
      when: "Sunday in statutory window: 60 days before to 30 days after four-year mandate expiry; article 5 ties expiry month to regular election month, 2029",
    });
    expect(model?.families.find((item) => item.id === "XK-BH-C04")?.when).toContain("2029");
    expect(model?.families.find((item) => item.id === "XK-BH-C04")?.label).toBe("Popular mayors (38)");
    expect(model?.families.find((item) => item.id === "XK-BH-C05")).toMatchObject({
      label: "Conditional mayoral runoffs",
      kind: "conditional",
      when: "Sunday four weeks after first round, only where required, 2029",
      condition: null,
    });
    expect(model?.holds.find((item) => item.id === "XK-BH-C02")).toMatchObject({
      label: "President — indirect Assembly selection",
    });
    expect(model?.holds.find((item) => item.id === "XK-BH-C02")?.note).toContain("Research hold");
    expect(model?.holds.find((item) => item.id === "XK-BH-C02")?.note).toContain("Do not defer presidential selection until 2030");
    expect(model?.holds.find((item) => item.id === "XK-BH-C06")?.label).toBe("Early Assembly election contingency");
    expect(model?.holds.find((item) => item.id === "XK-BH-C07")?.label).toBe("Early/repeat/replacement local contingency");
    expect(model?.holds.find((item) => item.id === "XK-BH-C08")?.note).toContain("Inherited BB G07");
    expect(model?.holds.find((item) => item.id === "XK-BH-C09")?.note).toContain("Inherited BB G08");
    const serialized = JSON.stringify(model);
    expect(serialized).not.toMatch(ISO_DAY);
    expect(serialized).not.toContain("scheduled_date");
    for (const row of rows) {
      if (typeof row.last_comparable_contest === "string") {
        expect(serialized).not.toContain(row.last_comparable_contest);
      }
    }
    expectNoExactDays(model!);

    const ignoredDay = projectUpcomingCalendar("kosovo", [
      {
        calendar_id: "XK-TEST",
        office_family: "Fixture family",
        date_formula: "Sunday in the statutory window",
        next_occurrence_year: 2029,
        scheduled_date: "2029-10-12",
        date_basis: "statutory_formula",
        formal_call_status: "pending_or_not_retained",
        country_surface_prominent: true,
      },
    ]);
    expect(ignoredDay?.families[0]?.when).toBe("Sunday in the statutory window, 2029");
    expect(JSON.stringify(ignoredDay)).not.toContain("2029-10-12");

    expect(() =>
      projectUpcomingCalendar("kosovo", [
        {
          calendar_id: "XK-TEST-ISO",
          office_family: "Fixture family",
          date_formula: "2029-10-12",
          next_occurrence_year: 2029,
          scheduled_date: null,
          date_basis: "statutory_formula",
          formal_call_status: "pending_or_not_retained",
          country_surface_prominent: true,
        },
      ]),
    ).toThrow(/exact day/);

    const heldDespiteYear = projectUpcomingCalendar("kosovo", [
      {
        calendar_id: "XK-TEST-HOLD",
        office_family: "Held family",
        date_formula: "No ordinary polling day",
        next_occurrence_year: 2030,
        scheduled_date: null,
        date_basis: "research_hold",
        formal_call_status: "research_hold",
        notes: "Held even when a year is present.",
        country_surface_prominent: true,
      },
    ]);
    expect(heldDespiteYear?.families).toEqual([]);
    expect(heldDespiteYear?.holds).toHaveLength(1);
    expect(JSON.stringify(heldDespiteYear)).not.toMatch(ISO_DAY);
  });

  it("projects Bulgaria families from the cards array and keeps holds off exact days", () => {
    const rows = calendarCards(BULGARIA_CALENDAR);
    const model = upcomingElectionsForCountry("bulgaria", repoRoot);
    expect(model?.countryId).toBe("bulgaria");
    expect(rows).toHaveLength(11);
    expect(model?.families.map((item) => item.id)).toEqual([
      "BI-CAL-NA",
      "BI-CAL-PRES",
      "BI-CAL-PRES-R2",
      "BI-CAL-EP",
      "BI-CAL-COUNCIL",
      "BI-CAL-MAYOR",
      "BI-CAL-MAYOR-R2",
      "BI-CAL-TRAMBESH",
      "BI-CAL-TRAMBESH-R2",
    ]);
    expect(model?.holds.map((item) => item.id)).toEqual(["BI-CAL-NA-EARLY", "BI-CAL-GNA"]);
    expect(model?.intro).toContain("Bulgaria");
    expect(model?.intro).toContain("Official calls already recorded in the pack");
    expect(model?.intro).toContain("No polling day is invented beyond those calls");
    expect(model?.intro).not.toContain("Exact calendar days are not asserted");

    for (const row of rows) {
      expect(row.country_surface_prominent).toBe(true);
      const comparable = typeof row.last_comparable === "string" ? row.last_comparable : "";
      if (row.date_basis === "research hold") {
        expect(row.scheduled_date).toBeNull();
        expect(row.next_year).toBeNull();
        const hold = model?.holds.find((item) => item.id === row.calendar_id);
        expect(hold?.label).toBe(row.contest_name);
        expect(hold?.note).toContain("Research hold");
        expect(hold?.note).toContain(String(row.next_label));
        expect(hold?.note).not.toContain(comparable);
        continue;
      }
      const family = model?.families.find((item) => item.id === row.calendar_id);
      expect(family?.label).toBe(row.contest_name);
      expect(family?.when).toBe(row.next_label);
      expect(family?.when).not.toContain(comparable);
      if (row.formal_call === "issued") {
        expect(row.date_precision).toBe("day");
        expect(row.scheduled_date).toMatch(ISO_DAY);
        expect(family?.basis).toBe("CIK / official call / decree; issued");
      } else {
        expect(row.scheduled_date).toBeNull();
        expect(family?.basis).toBe("Constitutional/statutory formula; pending_or_not_established");
      }
    }

    expect(model?.families.find((item) => item.id === "BI-CAL-NA")).toMatchObject({
      label: "National Assembly / Народно събрание",
      kind: "ordinary",
      when: "Four-year term; next ordinary occurrence 2030, no later than one month before expiry of current Assembly powers (Article 64). Exact day and formal call pending.",
      condition: null,
    });
    expect(model?.families.find((item) => item.id === "BI-CAL-PRES")).toMatchObject({
      label: "President and Vice-President — first ballot",
      kind: "ordinary",
      when: "25 October 2026",
      condition: null,
    });
    expect(model?.families.find((item) => item.id === "BI-CAL-PRES-R2")).toMatchObject({
      kind: "conditional",
      when: "Within seven days of the first ballot if no candidate is elected (Article 93(4)); exact second-ballot call pending in this evidence set.",
      condition: "No first-round winner under Article 93(3).",
    });
    expect(model?.families.find((item) => item.id === "BI-CAL-EP")?.when).toContain("2029");
    expect(model?.families.find((item) => item.id === "BI-CAL-EP")?.when).toContain("polling day not established");
    expect(model?.families.find((item) => item.id === "BI-CAL-COUNCIL")?.when).toContain("2027");
    expect(model?.families.find((item) => item.id === "BI-CAL-MAYOR")?.when).toContain("2027");
    expect(model?.families.find((item) => item.id === "BI-CAL-MAYOR-R2")).toMatchObject({
      kind: "conditional",
      condition: "No first-ballot winner; no council runoff is inferred.",
    });
    expect(model?.families.find((item) => item.id === "BI-CAL-TRAMBESH")?.when).toBe(
      "18 October 2026 (Decree 155 of 13 May 2026; CIK Decision 126-MI)",
    );
    expect(model?.families.find((item) => item.id === "BI-CAL-TRAMBESH-R2")).toMatchObject({
      kind: "conditional",
      when: "25 October 2026, only if a second ballot is needed",
      condition: "CIK Decision 126-MI explicitly describes a possible second ballot.",
    });
    expect(model?.holds.find((item) => item.id === "BI-CAL-NA-EARLY")?.label).toBe(
      "Early / snap parliamentary contingency",
    );
    expect(model?.holds.find((item) => item.id === "BI-CAL-GNA")?.label).toBe(
      "Grand National Assembly — constitutional extraordinary path",
    );

    const serialized = JSON.stringify(model);
    expect(serialized).not.toMatch(ISO_DAY);
    expect(serialized).not.toContain("2026-10-25");
    expect(serialized).not.toContain("2026-10-18");
    expect(serialized).not.toContain("2026-09-29");
    expect(serialized).not.toContain("http");
    expect(serialized).not.toMatch(/village/i);
    expect(serialized).not.toContain("19 April 2026");
    expect(serialized).not.toContain("27 October 2024");
    expect(serialized).not.toContain("14 November 2021");
    expect(serialized).not.toContain("21 November 2021");
    expect(serialized).not.toContain("9 June 2024");
    expect(serialized).not.toContain("29 October 2023");
    expect(serialized).not.toContain("5 November 2023");
    expect(serialized).not.toContain("June 1990");
    for (const row of rows) {
      if (typeof row.last_comparable === "string") {
        expect(serialized).not.toContain(row.last_comparable);
      }
    }

    const official = projectUpcomingCalendar("bulgaria", [
      {
        calendar_id: "BG-TEST-CALL",
        contest_name: "Fixture official call",
        next_label: "25 October 2026",
        date_basis: "CIK / official call / decree",
        next_year: 2026,
        scheduled_date: "2026-10-25",
        date_precision: "day",
        formal_call: "issued",
        conditional: null,
        country_surface_prominent: true,
      },
    ]);
    expect(official?.families[0]?.when).toBe("25 October 2026");
    expect(JSON.stringify(official)).not.toContain("2026-10-25");

    expect(
      projectUpcomingCalendar("bulgaria", [
        {
          calendar_id: "BG-VILLAGE",
          contest_name: "Village mayor by-election",
          next_label: "18 October 2026",
          date_basis: "CIK / official call / decree",
          next_year: 2026,
          scheduled_date: "2026-10-18",
          date_precision: "day",
          formal_call: "issued",
          country_surface_prominent: false,
        },
      ]),
    ).toBeNull();

    const heldDespiteYear = projectUpcomingCalendar("bulgaria", [
      {
        calendar_id: "BG-TEST-HOLD",
        contest_name: "Held family",
        next_label: "No next date established.",
        date_basis: "research hold",
        next_year: 2030,
        scheduled_date: null,
        date_precision: "unknown_or_conditional",
        formal_call: "pending_or_not_established",
        country_surface_prominent: true,
      },
    ]);
    expect(heldDespiteYear?.families).toEqual([]);
    expect(heldDespiteYear?.holds).toHaveLength(1);
    expect(JSON.stringify(heldDespiteYear)).not.toMatch(ISO_DAY);

    expect(() =>
      projectUpcomingCalendar("bulgaria", [
        {
          calendar_id: "BG-TEST-ISO",
          contest_name: "Fixture family",
          next_label: "2029-10-12",
          date_basis: "constitutional/statutory formula",
          next_year: 2029,
          scheduled_date: null,
          date_precision: "year_or_formula",
          formal_call: "pending_or_not_established",
          country_surface_prominent: true,
        },
      ]),
    ).toThrow(/exact day/);

    expect(() =>
      projectUpcomingCalendar("bulgaria", [
        {
          calendar_id: "BG-TEST-STATED",
          contest_name: "Fixture family",
          next_label: "25 October 2029",
          date_basis: "constitutional/statutory formula",
          next_year: 2029,
          scheduled_date: null,
          date_precision: "year_or_formula",
          formal_call: "pending_or_not_established",
          country_surface_prominent: true,
        },
      ]),
    ).toThrow(/exact day/);

    expect(upcomingElectionsForJurisdiction({ countryId: "bulgaria", levelLabel: "municipality" }, repoRoot)).toBeNull();
    expect(upcomingElectionsForJurisdiction({ countryId: "bulgaria", levelLabel: "country" }, repoRoot)?.countryId).toBe(
      "bulgaria",
    );
    expect(upcomingElectionsForCountry("serbia", repoRoot)).toBeNull();

    const html = markup(createElement(UpcomingElectionsCallout, { model: model! }));
    expect(html).toContain('data-atlas-upcoming-elections="bulgaria"');
    expect(html).toContain("25 October 2026");
    expect(html).toContain("18 October 2026");
    expect(html).toContain("Conditional");
    expect(html).toContain('data-atlas-upcoming-hold-id="BI-CAL-NA-EARLY"');
    expect(html).toContain('data-atlas-upcoming-hold-id="BI-CAL-GNA"');
    expect(html.indexOf('data-atlas-upcoming-family="BI-CAL-NA"')).toBeLessThan(
      html.indexOf('data-atlas-upcoming-hold-id="BI-CAL-NA-EARLY"'),
    );
    expect(html).not.toMatch(ISO_DAY);
    expect(html).not.toMatch(/village/i);
  });

  it("renders the callout above places and labels conditional and indirect rows", () => {
    const uruguay = upcomingElectionsForCountry("uruguay", repoRoot)!;
    const georgia = upcomingElectionsForCountry("georgia", repoRoot)!;
    const uruguayHtml = markup(createElement(UpcomingElectionsCallout, { model: uruguay }));
    expect(uruguayHtml).toContain('data-atlas-upcoming-elections="uruguay"');
    expect(uruguayHtml).toContain("Upcoming elections");
    expect(uruguayHtml).toContain("Last Sunday of October, 2029");
    expect(uruguayHtml).toContain("Second Sunday of May in the year following the national election, 2030");
    expect(uruguayHtml).toContain("Conditional");
    expect(uruguayHtml).toContain("conditional balotaje");
    expect(uruguayHtml).not.toMatch(ISO_DAY);

    const georgiaHtml = markup(createElement(UpcomingElectionsCallout, { model: georgia }));
    expect(georgiaHtml).toContain("Indirect selection / context only");
    expect(georgiaHtml).toContain('data-atlas-upcoming-hold-id="GE-BG-UP-HELD"');
    expect(georgiaHtml).toContain("Research hold");
    expect(georgiaHtml.indexOf("data-atlas-upcoming-family")).toBeLessThan(georgiaHtml.indexOf("data-atlas-upcoming-hold"));
    expect(georgiaHtml).not.toContain("US state");

    const page = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [{ label: "World", href: "/atlas" }, { label: "Uruguay" }],
        name: "Oriental Republic of Uruguay",
        level: "Country",
        upcomingElections: uruguay,
        places: [],
        seats: [],
        cycles: [],
      }),
    );
    expect(page.indexOf("Upcoming elections")).toBeLessThan(page.indexOf('id="atlas-children-heading"'));
    expect(page.indexOf('id="atlas-upcoming-elections-heading"')).toBeGreaterThan(page.indexOf("Oriental Republic of Uruguay"));

    const plain = markup(
      createElement(JurisdictionTemplate, {
        breadcrumb: [{ label: "World" }],
        name: "Albania",
        places: [],
        seats: [],
        cycles: [],
      }),
    );
    expect(plain).not.toContain("data-atlas-upcoming-elections");
  });
});

describe("Uruguay, Georgia, and Kosovo country pages", () => {
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  let dir = "";
  let sqlitePath = "";

  beforeAll(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    dir = mkdtempSync(path.join(os.tmpdir(), "atlas-upcoming-"));
    sqlitePath = path.join(dir, "atlas.sqlite");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importUruguay({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "uruguay-attempts.sqlite"),
      operator: "upcoming-elections-test",
    });
    importGeorgia({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "georgia-attempts.sqlite"),
      operator: "upcoming-elections-test",
    });
    importKosovo({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "kosovo-attempts.sqlite"),
      operator: "upcoming-elections-test",
    });
  });

  afterAll(() => {
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  function childSlug(countryId: string): string {
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const row = db
        .prepare(
          `SELECT slug_path FROM derived_jurisdiction
           WHERE country_id = ? AND level_label != 'country'
           ORDER BY slug_path LIMIT 1`,
        )
        .get(countryId) as { slug_path?: string } | undefined;
      expect(row?.slug_path).toBeTruthy();
      return String(row?.slug_path);
    } finally {
      db.close();
    }
  }

  it("shows Uruguay families on the country page and not on a child place", async () => {
    const html = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "uruguay" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(html).toContain('data-atlas-upcoming-elections="uruguay"');
    expect(html).toContain("Upcoming elections");
    expect(html).toContain("Last Sunday of October, 2029");
    expect(html).toContain("Cámara de Senadores");
    expect(html).toContain("Cámara de Representantes");
    expect(html).toContain("conditional balotaje");
    expect(html).toContain("Conditional");
    expect(html).toContain("19 Intendentes");
    expect(html).toContain("19 Juntas Departamentales");
    expect(html).toContain("136 municipal councils");
    expect(html).toContain("136 alcaldes");
    expect(html).toContain("Second Sunday of May in the year following the national election, 2030");
    expect(html).toContain("formal convocatoria remains pending");
    expect(html.indexOf("Upcoming elections")).toBeLessThan(html.indexOf('id="atlas-children-heading"'));
    expect(html).not.toContain("Next election not supplied");
    expect(html).not.toMatch(/2029-\d{2}-\d{2}/);
    expect(html).not.toMatch(/2030-\d{2}-\d{2}/);

    const child = childSlug("uruguay").split("/");
    const childHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: child[0]!, path: child.slice(1) }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(childHtml).not.toContain("data-atlas-upcoming-elections");
  });

  it("shows Georgia families on the country page, including the hold and indirect presidency", async () => {
    const html = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "georgia" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(html).toContain('data-atlas-upcoming-elections="georgia"');
    expect(html).toContain("Georgia (GE)");
    expect(html).toContain("Parliament");
    expect(html).toContain("Last Saturday of October in the year the four-year parliamentary term expires, 2028");
    expect(html).toContain("Adjara Supreme Council");
    expect(html).toContain("Municipal Sakrebulo — 64 ordinary-cycle municipalities");
    expect(html).toContain("Popular mayors — same 64 municipalities");
    expect(html).toContain("First Saturday of October in the regular local-election year; four-year term, 2029");
    expect(html).toContain("Conditional mayoral runoffs");
    expect(html).toContain("Conditional");
    expect(html).toContain("Indirect selection / context only");
    expect(html).toContain("President — indirect selection path (context only)");
    expect(html).toContain("Five statutory-continuation councils");
    expect(html).toContain("Research hold");
    expect(html).toContain("Akhalgori, Eredvi, Kurta, Tighva, Azhara");
    expect(html).not.toContain("Next election not supplied");
    expect(html).not.toMatch(/2028-\d{2}-\d{2}/);
    expect(html).not.toMatch(/2029-\d{2}-\d{2}/);
    const holdAt = html.indexOf('data-atlas-upcoming-hold-id="GE-BG-UP-HELD"');
    const placesAt = html.indexOf('id="atlas-children-heading"');
    expect(holdAt).toBeGreaterThan(html.indexOf('data-atlas-upcoming-family="GE-BG-UP-PARL"'));
    expect(holdAt).toBeLessThan(placesAt);
    expect(html.slice(holdAt, placesAt)).not.toMatch(/, 20\d{2}/);

    const child = childSlug("georgia").split("/");
    const childHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: child[0]!, path: child.slice(1) }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(childHtml).not.toContain("data-atlas-upcoming-elections");

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const events = db
        .prepare(
          `SELECT COUNT(*) AS n
           FROM election_event e
           JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
           WHERE o.country_id IN ('uruguay', 'georgia', 'kosovo')`,
        )
        .get() as { n: number };
      expect(Number(events.n)).toBe(0);
    } finally {
      db.close();
    }
  });

  it("shows Kosovo families and holds on the country page and not on a child place", async () => {
    const html = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "kosovo" }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(html).toContain('data-atlas-upcoming-elections="kosovo"');
    expect(html).toContain("Upcoming elections");
    expect(html).toContain("Ordinary contest families for Kosovo");
    expect(html).toContain("formal calls remain pending");
    expect(html).toContain("Assembly of Kosovo");
    expect(html).toContain(
      "Sunday 60–30 days before expiry of the four-year term beginning at the 2026 constitutive session, 2030",
    );
    expect(html).toContain("Municipal assemblies (38)");
    expect(html).toContain("Popular mayors (38)");
    expect(html).toContain("Conditional mayoral runoffs");
    expect(html).toContain("Sunday four weeks after first round, only where required, 2029");
    expect(html).toContain("Conditional");
    expect(html).toContain("President — indirect Assembly selection");
    expect(html).toContain("Early Assembly election contingency");
    expect(html).toContain("Early/repeat/replacement local contingency");
    expect(html).toContain("Village/urban-quarter advisory councils");
    expect(html).toContain("Joint Mitrovica board scope question");
    expect(html).toContain("Research hold");
    expect(html).toContain("Do not defer presidential selection until 2030");
    expect(html).not.toContain("Next election not supplied");
    expect(html).not.toMatch(/2029-\d{2}-\d{2}/);
    expect(html).not.toMatch(/2030-\d{2}-\d{2}/);
    expect(html).not.toContain("2026-06-07");
    expect(html).not.toContain("2025-10-12");
    expect(html).not.toContain("2025-11-09");
    expect(html).not.toContain("2021-04-04");
    expect(html).not.toContain("2023-04-23");
    const holdAt = html.indexOf('data-atlas-upcoming-hold-id="XK-BH-C02"');
    const placesAt = html.indexOf('id="atlas-children-heading"');
    expect(holdAt).toBeGreaterThan(html.indexOf('data-atlas-upcoming-family="XK-BH-C01"'));
    expect(holdAt).toBeLessThan(placesAt);
    expect(html.indexOf('id="atlas-upcoming-elections-heading"')).toBeGreaterThan(html.indexOf("Kosovo*"));

    const child = childSlug("kosovo").split("/");
    const childHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: child[0]!, path: child.slice(1) }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(childHtml).not.toContain("data-atlas-upcoming-elections");
  });
});

describe("Bulgaria country page", () => {
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  let dir = "";
  let sqlitePath = "";

  beforeAll(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    dir = mkdtempSync(path.join(os.tmpdir(), "atlas-upcoming-bulgaria-"));
    sqlitePath = path.join(dir, "atlas.sqlite");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importBulgaria({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "bulgaria-attempts.sqlite"),
      operator: "upcoming-elections-test",
    });
  });

  afterAll(() => {
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("shows Bulgaria families and holds on the country page and not on a child place", async () => {
    const html = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: "bulgaria" }),
        searchParams: Promise.resolve({}),
      }),
    );
    const calloutStart = html.indexOf('data-atlas-upcoming-elections="bulgaria"');
    const placesAt = html.indexOf('id="atlas-children-heading"');
    const callout = html.slice(calloutStart, placesAt);
    expect(calloutStart).toBeGreaterThan(html.indexOf("Bulgaria"));
    expect(placesAt).toBeGreaterThan(calloutStart);
    expect(callout).toContain("Upcoming elections");
    expect(callout).toContain("Documentary contest families for Bulgaria");
    expect(callout).toContain("Official calls already recorded in the pack");
    expect(callout).toContain("National Assembly / Народно събрание");
    expect(callout).toContain("next ordinary occurrence 2030");
    expect(callout).toContain("President and Vice-President — first ballot");
    expect(callout).toContain("25 October 2026");
    expect(callout).toContain("exact second-ballot call pending");
    expect(callout).toContain("European Parliament — Bulgaria");
    expect(callout).toContain("next election year 2029");
    expect(callout).toContain("Municipal councils — all 265 municipalities");
    expect(callout).toContain("Municipality-wide directly elected mayors — all 265 municipalities");
    expect(callout).toContain("conditional ordinary runoff");
    expect(callout).toContain("Polski Trambesh municipality mayor — by-election");
    expect(callout).toContain("18 October 2026");
    expect(callout).toContain("25 October 2026, only if a second ballot is needed");
    expect(callout).toContain("Conditional");
    expect(callout).toContain("Early / snap parliamentary contingency");
    expect(callout).toContain("Grand National Assembly — constitutional extraordinary path");
    expect(callout).toContain("Research hold");
    expect(callout).toContain('data-atlas-upcoming-family="BI-CAL-PRES"');
    expect(callout).toContain('data-atlas-upcoming-hold-id="BI-CAL-NA-EARLY"');
    expect(callout).toContain('data-atlas-upcoming-hold-id="BI-CAL-GNA"');
    expect(callout.indexOf('data-atlas-upcoming-family="BI-CAL-NA"')).toBeLessThan(
      callout.indexOf('data-atlas-upcoming-hold-id="BI-CAL-NA-EARLY"'),
    );
    expect(callout).not.toMatch(ISO_DAY);
    expect(callout).not.toContain("2026-10-25");
    expect(callout).not.toContain("2026-10-18");
    expect(callout).not.toContain("2026-09-29");
    expect(callout).not.toMatch(/village/i);
    expect(callout).not.toContain("19 April 2026");
    expect(callout).not.toContain("29 October 2023");
    expect(html).not.toContain("Next election not supplied");

    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    let child = "";
    try {
      const row = db
        .prepare(
          `SELECT slug_path FROM derived_jurisdiction
           WHERE country_id = 'bulgaria' AND level_label != 'country'
           ORDER BY slug_path LIMIT 1`,
        )
        .get() as { slug_path?: string } | undefined;
      expect(row?.slug_path).toBeTruthy();
      child = String(row?.slug_path);
    } finally {
      db.close();
    }
    const parts = child.split("/");
    const childHtml = markup(
      await AtlasJurisdictionPage({
        params: Promise.resolve({ country: parts[0]!, path: parts.slice(1) }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(childHtml).not.toContain("data-atlas-upcoming-elections");
  });
});
