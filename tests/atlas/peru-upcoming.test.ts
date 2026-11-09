import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { UpcomingElectionsCallout } from "../../components/atlas/upcoming-elections-callout";
import {
  PERU_UPCOMING_CALENDAR_RELATIVE,
  upcomingElectionsForCountry,
  upcomingElectionsForJurisdiction,
} from "../../lib/atlas/upcoming-elections";

const repoRoot = path.join(import.meta.dirname, "../..");
const ISO_DAY = /\b\d{4}-\d{2}-\d{2}\b/;

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

describe("Peru upcoming elections", () => {
  it("surfaces 18 calendar rows and keeps holds, Sangani, and centros poblados off ordinary dates", () => {
    const rows = JSON.parse(readFileSync(path.join(repoRoot, PERU_UPCOMING_CALENDAR_RELATIVE), "utf8")) as Array<
      Record<string, unknown>
    >;
    expect(rows).toHaveLength(18);
    const model = upcomingElectionsForCountry("peru", repoRoot);
    expect(model?.countryId).toBe("peru");
    expect(model?.families).toHaveLength(11);
    expect(model?.holds).toHaveLength(7);
    expect(model?.families.filter((row) => row.kind === "conditional")).toHaveLength(1);
    expect(model?.families.map((row) => row.label)).toEqual([
      "President + two Vice Presidents on one ticket — first round",
      "Presidential second round, if required",
      "Senado",
      "Cámara de Diputados",
      "Peruvian representatives to Parlamento Andino",
      "25 Gobernadores + Vicegobernadores — joint regional tickets",
      "25 Consejos Regionales",
      "196 provincial alcaldes",
      "196 provincial concejos / regidores",
      "District alcaldes (1,696 municipalities in 2026 election scope)",
      "District concejos / regidores (1,696 municipalities in 2026 election scope)",
    ]);
    expect(model?.families.find((row) => row.label.startsWith("Presidential second round"))?.kind).toBe("conditional");
    expect(model?.holds.map((row) => row.label)).toEqual([
      "Regional executive second round, where required",
      "Sangani district mayor and council — first election",
      "Early Chamber of Deputies election after constitutional dissolution",
      "Presidential vacancy / succession / exceptional general call",
      "Annulment / complementary / repeat local contests",
      "Formal national / regional primaries",
      "Centros poblados — submunicipal policy context",
    ]);
    const runoff = model?.holds.find((row) => row.label.startsWith("Regional executive second round"));
    expect(runoff?.note).toContain("Verification hold");
    expect(runoff?.note).toContain("6 December 2026");
    const centros = model?.holds.find((row) => row.label.startsWith("Centros poblados"));
    expect(centros?.note).toContain("Scope hold");
    expect(centros?.note).toContain("1 November 2026");
    const sangani = model?.holds.find((row) => row.label.startsWith("Sangani"));
    expect(sangani?.note).toContain("Research hold");
    expect(sangani?.note).toContain("No date established");
    expect(JSON.stringify(model)).not.toMatch(ISO_DAY);
    expect(upcomingElectionsForJurisdiction({ countryId: "peru", levelLabel: "municipality" }, repoRoot)).toBeNull();

    const html = markup(createElement(UpcomingElectionsCallout, { model: model! }));
    expect(html).toContain('data-atlas-upcoming-elections="peru"');
    expect(html).toContain("Second Sunday of April 2031");
    expect(html).toContain("First Sunday of October 2030");
    expect(html).toContain("Centros poblados");
    expect(html).toContain("Sangani");
    expect(html.indexOf("data-atlas-upcoming-family")).toBeLessThan(html.indexOf("data-atlas-upcoming-hold"));
  });
});
