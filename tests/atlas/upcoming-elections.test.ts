import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { UpcomingElectionsCallout } from "../../components/atlas/upcoming-elections-callout";
import { JurisdictionTemplate } from "../../components/atlas/jurisdiction-template";
import AtlasJurisdictionPage from "../../app/atlas/[country]/[[...path]]/page";
import { importGeorgia } from "../../lib/atlas/georgia/import";
import { UPCOMING_CALENDAR_RELATIVE as GEORGIA_CALENDAR } from "../../lib/atlas/georgia/identity";
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
    expect(upcomingElectionsForJurisdiction({ countryId: "uruguay", levelLabel: "municipality" }, repoRoot)).toBeNull();
    expect(upcomingElectionsForJurisdiction({ countryId: "georgia", levelLabel: "region" }, repoRoot)).toBeNull();
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

describe("Uruguay and Georgia country pages", () => {
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
           WHERE o.country_id IN ('uruguay', 'georgia')`,
        )
        .get() as { n: number };
      expect(Number(events.n)).toBe(0);
    } finally {
      db.close();
    }
  });
});
