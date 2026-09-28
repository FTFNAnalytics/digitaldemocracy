import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import AboutPage from "../../app/(center)/about/page";
import CorrectionsPage from "../../app/(center)/corrections/page";
import DataPage from "../../app/(center)/data/page";
import HomePage from "../../app/(center)/page";
import MethodologyPage from "../../app/(center)/methodology/page";
import { Header } from "../../components/interactive";
import { Footer } from "../../components/sections";
import { loadCenterFrontDoor } from "../../lib/center/front-door";
import * as content from "../../lib/content";
import { footerLinks, github, navLinks } from "../../lib/content";

const repoRoot = path.join(import.meta.dirname, "../..");

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(next);
    return [next];
  });
}

const removedPrototypeCopy = [
  "connect@digitaldemocracy.example",
  "555-0199",
  "1200 18th Street",
  "Suite 400",
  "Washington, DC 20036",
  "design prototype",
  "Design prototype",
  "PrototypeBanner",
  "Synthetic Media and the 2026",
  "Auditing Civic AI",
  "Data Brokers and Voter Files",
  "Civic AI Oversight Clinic",
  "Platform Power & Democratic Speech",
  "Community Data Rights Workshop",
  "this prototype",
];

describe("Center content", () => {
  it("snapshots the public content keys and drops the prototype collections", () => {
    expect(Object.keys(content).sort()).toMatchInlineSnapshot(`
      [
        "footerLinks",
        "github",
        "navLinks",
        "org",
        "unconfirmed",
      ]
    `);
    expect(content).not.toHaveProperty("publications");
    expect(content).not.toHaveProperty("events");
    expect(content).not.toHaveProperty("about");
    expect(content).not.toHaveProperty("social");
  });

  it("removes prototype copy from the site source and the README", () => {
    const files = [
      ...walk(path.join(repoRoot, "app")),
      ...walk(path.join(repoRoot, "components")),
      ...walk(path.join(repoRoot, "lib")),
      path.join(repoRoot, "README.md"),
    ];
    const blob = files
      .filter((file) => /\.(tsx?|md)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const phrase of removedPrototypeCopy) {
      expect(blob, phrase).not.toContain(phrase);
    }
  });

  it("fails the build guard while placeholders remain, and passes when the flag is set", () => {
    const script = path.join(repoRoot, "scripts/check-content-placeholders.mjs");
    const blocked = { ...process.env };
    delete blocked.CONTENT_ALLOW_PLACEHOLDERS;
    const failed = spawnSync(process.execPath, [script], { cwd: repoRoot, encoding: "utf8", env: blocked });
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toContain("[CONFIRM: contact email]");
    expect(failed.stderr).toContain("[CONFIRM: postal address]");
    expect(failed.stderr).toContain("[CONFIRM: phone]");
    expect(failed.stderr).toContain("[CONFIRM: site and data licence]");
    expect(failed.stderr.match(/\[CONFIRM:/g)).toHaveLength(4);

    const allowed = spawnSync(process.execPath, [script], {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, CONTENT_ALLOW_PLACEHOLDERS: "1" },
    });
    expect(allowed.status).toBe(0);
  });

  it("resolves every header and footer link to a page", () => {
    const pages: Record<string, string> = {
      "/": "app/(center)/page.tsx",
      "/about": "app/(center)/about/page.tsx",
      "/methodology": "app/(center)/methodology/page.tsx",
      "/data": "app/(center)/data/page.tsx",
      "/corrections": "app/(center)/corrections/page.tsx",
      "/atlas": "app/atlas/page.tsx",
      "/atlas/search": "app/atlas/search/page.tsx",
      "/atlas/explorer": "app/atlas/explorer/page.tsx",
    };
    const header = markup(createElement(Header));
    const footer = markup(createElement(Footer));
    for (const link of navLinks) {
      expect(header).toContain(`href="${link.href}"`);
      expect(pages[link.href]).toBeTruthy();
      expect(readFileSync(path.join(repoRoot, pages[link.href]), "utf8").length).toBeGreaterThan(0);
    }
    for (const link of footerLinks) {
      expect(footer).toContain(`href="${link.href}"`);
      expect(readFileSync(path.join(repoRoot, pages[link.href]), "utf8").length).toBeGreaterThan(0);
    }
    expect(header).not.toContain("#home");
    expect(footer).toContain(github.newIssue);
    expect(footer).toContain("[CONFIRM: contact email]");
    expect(footer).toContain("[CONFIRM: site and data licence]");
  });

  it("shows placeholders and the correction link on the institutional pages", () => {
    const about = markup(AboutPage());
    expect(about).toContain("[CONFIRM: contact email]");
    expect(about).toContain("[CONFIRM: postal address]");
    expect(about).toContain("[CONFIRM: phone]");
    expect(about).toContain(github.newIssue);
    const method = markup(MethodologyPage());
    expect(method).not.toContain("lineage");
    expect(method).not.toContain("namespace");
    expect(method).not.toContain("Prompt B");
    expect(method).toContain("Missing is not zero");
    const data = markup(DataPage());
    expect(data).toContain("/api/atlas/search?mode=seat");
    expect(data).toContain("/electiondatabase/downloads");
    const corrections = markup(CorrectionsPage());
    expect(corrections).toContain(github.correction);
    expect(corrections).toContain("withheld");
  });
});

describe("homepage coverage from a fixture database", () => {
  let dir = "";
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;

  afterEach(() => {
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = "";
  });

  it("renders country-level derived_coverage totals and published snapshot labels", async () => {
    dir = mkdtempSync(path.join(os.tmpdir(), "center-home-"));
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const db = new DatabaseSync(sqlitePath);
    db.exec(`
      CREATE TABLE derived_jurisdiction (
        jurisdiction_key TEXT PRIMARY KEY,
        depth INTEGER NOT NULL,
        country_id TEXT NOT NULL
      );
      CREATE TABLE derived_coverage (
        jurisdiction_key TEXT PRIMARY KEY,
        offices INTEGER NOT NULL,
        offices_with_any_event INTEGER NOT NULL,
        offices_with_results INTEGER NOT NULL,
        events_total INTEGER NOT NULL,
        events_with_results INTEGER NOT NULL,
        not_supplied_next_dates INTEGER NOT NULL,
        latest_snapshot_label TEXT
      );
      CREATE TABLE dataset_release (
        lineage_id TEXT NOT NULL,
        release_id TEXT NOT NULL,
        research_snapshot_label TEXT
      );
      CREATE TABLE publication_release (
        lineage_id TEXT NOT NULL,
        release_id TEXT NOT NULL
      );
      INSERT INTO derived_jurisdiction (jurisdiction_key, depth, country_id)
      VALUES ('country:fixture', 0, 'fixture'), ('place:child', 1, 'fixture');
      INSERT INTO derived_coverage (
        jurisdiction_key, offices, offices_with_any_event, offices_with_results,
        events_total, events_with_results, not_supplied_next_dates, latest_snapshot_label
      ) VALUES
        ('country:fixture', 17041, 8000, 220, 903, 150, 10, 'country rollup label'),
        ('place:child', 864201, 1, 1, 1, 1, 0, 'child label');
      INSERT INTO dataset_release (lineage_id, release_id, research_snapshot_label) VALUES
        ('lineage-live', 'rel-live', 'Fixture snapshot label QX-11'),
        ('lineage-draft', 'rel-draft', 'UNPUBLISHED-SHOULD-NOT-SHOW');
      INSERT INTO publication_release (lineage_id, release_id) VALUES ('lineage-live', 'rel-live');
    `);
    db.close();
    process.env.ATLAS_SQLITE_PATH = sqlitePath;

    const door = loadCenterFrontDoor(sqlitePath);
    expect(door.coverage).toEqual({
      countries: 1,
      offices: 17041,
      officesWithAnyEvent: 8000,
      officesWithResults: 220,
      events: 903,
      eventsWithResults: 150,
    });
    expect(door.snapshots.map((row) => row.snapshotLabel)).toEqual(["Fixture snapshot label QX-11"]);

    const html = markup(await HomePage());
    expect(html).toContain('data-center-offices="17041"');
    expect(html).toContain("17,041");
    expect(html).toContain('data-center-offices-with-results="220"');
    expect(html).toContain('data-center-events="903"');
    expect(html).toContain("Fixture snapshot label QX-11");
    expect(html).not.toContain("864201");
    expect(html).not.toContain("UNPUBLISHED-SHOULD-NOT-SHOW");
    expect(html).toContain('value="seat"');
    expect(html).toContain('value="cycle"');
    expect(html).toContain('value="candidate"');
    expect(html).toContain('data-atlas-world-map="svg"');
  });

  it("renders not supplied when no database is loaded", async () => {
    process.env.ATLAS_SQLITE_PATH = path.join(os.tmpdir(), "center-home-missing.sqlite");
    const html = markup(await HomePage());
    expect(html).toContain('data-center-coverage="not-supplied"');
    expect(html).toContain("not supplied");
    expect(html).not.toContain("data-center-offices=");
    expect(html).toContain("No snapshot labels are loaded.");
  });
});
