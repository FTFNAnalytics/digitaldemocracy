import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { importAlbania } from "../../lib/atlas/albania/import";
import { RESEARCH_SNAPSHOT_LABEL } from "../../lib/atlas/albania/identity";
import { cycleLabel, placeEvent } from "../../lib/atlas/derive/cycle";
import { classifyJurisdictionLevel } from "../../lib/atlas/derive/level";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import { deriveSeatStatus, marginFromResults, type ResultFacts, type SelectedEventFacts } from "../../lib/atlas/derive/seat";
import { assignSlugs, emptySlugMeanings, foldSlug, type SlugNode } from "../../lib/atlas/derive/slug";
import {
  getAtlasCoverage,
  getAtlasJurisdictionBySlug,
  listAtlasCycles,
  listAtlasJurisdictions,
  listAtlasOffices,
  listAtlasSeatStatuses,
  listAtlasUnplacedCycles,
} from "../../lib/atlas/read";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

const repoRoot = path.join(import.meta.dirname, "../..");

function quoteIdent(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`Unexpected identifier ${name}`);
  return `"${name}"`;
}

function contentHash(filePath: string, kind: "master" | "derived"): string {
  const db = new DatabaseSync(filePath, { readOnly: true });
  try {
    const tables = db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
           AND name ${kind === "derived" ? "LIKE 'derived_%'" : "NOT LIKE 'derived_%'"}
         ORDER BY name`,
      )
      .all()
      .map((row) => String(row.name));
    const hash = createHash("sha256");
    for (const name of tables) {
      const columns = db.prepare(`PRAGMA table_info(${quoteIdent(name)})`).all();
      const names = columns.map((column) => String(column.name));
      const primary = columns
        .filter((column) => Number(column.pk) > 0)
        .sort((a, b) => Number(a.pk) - Number(b.pk));
      const orderSource = primary.length > 0 ? primary : columns;
      const order = orderSource.map((column) => quoteIdent(String(column.name))).join(", ");
      const rows = db
        .prepare(`SELECT ${names.map(quoteIdent).join(", ")} FROM ${quoteIdent(name)} ORDER BY ${order}`)
        .all();
      hash.update(name);
      hash.update("\n");
      for (const row of rows) {
        hash.update(JSON.stringify(names.map((column) => (row[column] === undefined ? null : row[column]))));
        hash.update("\n");
      }
    }
    return hash.digest("hex");
  } finally {
    db.close();
  }
}

function tableHashes(filePath: string): Record<string, string> {
  const db = new DatabaseSync(filePath, { readOnly: true });
  try {
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'derived_%' ORDER BY name",
      )
      .all()
      .map((row) => String(row.name));
    const hashes: Record<string, string> = {};
    for (const name of tables) {
      const columns = db.prepare(`PRAGMA table_info(${quoteIdent(name)})`).all();
      const names = columns.map((column) => String(column.name));
      const primary = columns
        .filter((column) => Number(column.pk) > 0)
        .sort((a, b) => Number(a.pk) - Number(b.pk));
      const orderSource = primary.length > 0 ? primary : columns;
      const order = orderSource.map((column) => quoteIdent(String(column.name))).join(", ");
      const rows = db
        .prepare(`SELECT ${names.map(quoteIdent).join(", ")} FROM ${quoteIdent(name)} ORDER BY ${order}`)
        .all();
      const hash = createHash("sha256");
      for (const row of rows) {
        hash.update(JSON.stringify(names.map((column) => (row[column] === undefined ? null : row[column]))));
      }
      hashes[name] = hash.digest("hex");
    }
    return hashes;
  } finally {
    db.close();
  }
}

function selectedEvent(overrides: Partial<SelectedEventFacts> = {}): SelectedEventFacts {
  return {
    eventId: "event-1",
    historyKey: "history-1",
    dateId: "date-1",
    dateResolution: "resolved",
    precision: "day",
    year: 2023,
    month: 5,
    day: 14,
    legalOutcome: "certified",
    recordState: "active",
    ...overrides,
  };
}

function resultRow(overrides: Partial<ResultFacts> = {}): ResultFacts {
  return {
    resultRowId: "row-1",
    proceedingId: "proc-1",
    proceedingOutcome: "certified",
    label: "Ada",
    partyLabel: "Party",
    share: 60,
    shareStatus: "recorded",
    shareUnit: "percent_0_100",
    electedFlag: 1,
    evidenceStatus: "recorded",
    ...overrides,
  };
}

function slugNode(overrides: Partial<SlugNode> & Pick<SlugNode, "jurisdictionKey" | "name" | "depth">): SlugNode {
  return {
    parentKey: overrides.depth === 0 ? null : "country:albania",
    countryId: "albania",
    slug: "",
    slugPath: "",
    ...overrides,
  };
}

describe("derived projection rules", () => {
  it("folds place names to ASCII slugs", () => {
    expect(foldSlug("Tiranë")).toBe("tirane");
    expect(foldSlug("Durrës")).toBe("durres");
    expect(foldSlug("Andorra la Vella")).toBe("andorra-la-vella");
  });

  it("keeps a published slug on its jurisdiction and aliases a rename", () => {
    const country = slugNode({
      jurisdictionKey: "country:albania",
      name: "Albania",
      depth: 0,
      parentKey: null,
      countryId: "albania",
    });
    const place = slugNode({
      jurisdictionKey: "geo:albania:tirane",
      name: "Tiranë",
      depth: 1,
    });
    expect(assignSlugs([country, place], emptySlugMeanings())).toEqual([]);
    expect(place.slugPath).toBe("albania/tirane");

    const prior = emptySlugMeanings();
    prior.meaning.set("albania", "country:albania");
    prior.meaning.set("albania/tirane", "geo:albania:tirane");
    const countryAgain = slugNode({
      jurisdictionKey: "country:albania",
      name: "Albania",
      depth: 0,
      parentKey: null,
      countryId: "albania",
    });
    const renamed = slugNode({
      jurisdictionKey: "geo:albania:tirane",
      name: "Durrës",
      depth: 1,
    });
    expect(assignSlugs([countryAgain, renamed], prior)).toEqual([
      { slugPath: "albania/tirane", jurisdictionKey: "geo:albania:tirane", reason: "rename" },
    ]);
    expect(renamed.slugPath).toBe("albania/durres");

    const kept = emptySlugMeanings();
    kept.meaning.set("albania", "country:albania");
    kept.meaning.set("albania/durres", "geo:albania:tirane");
    kept.meaning.set("albania/tirane", "geo:albania:tirane");
    kept.aliasReason.set("albania/tirane", "rename");
    const stablePlace = slugNode({
      jurisdictionKey: "geo:albania:tirane",
      name: "Durrës",
      depth: 1,
    });
    const stableCountry = slugNode({
      jurisdictionKey: "country:albania",
      name: "Albania",
      depth: 0,
      parentKey: null,
      countryId: "albania",
    });
    expect(assignSlugs([stableCountry, stablePlace], kept)).toEqual([
      { slugPath: "albania/tirane", jurisdictionKey: "geo:albania:tirane", reason: "rename" },
    ]);
    expect(stablePlace.slugPath).toBe("albania/durres");
  });

  it("disambiguates sibling slugs and reserves route segments", () => {
    const country = slugNode({
      jurisdictionKey: "country:albania",
      name: "Albania",
      depth: 0,
      parentKey: null,
      countryId: "albania",
    });
    const first = slugNode({ jurisdictionKey: "geo:albania:a", name: "Tiranë", depth: 1 });
    const second = slugNode({ jurisdictionKey: "geo:albania:b", name: "Tiranë", depth: 1 });
    const reserved = slugNode({ jurisdictionKey: "geo:albania:c", name: "Elections", depth: 1 });
    assignSlugs([country, second, first, reserved], emptySlugMeanings());
    expect(first.slugPath).toBe("albania/tirane");
    expect(second.slugPath).toBe("albania/tirane-2");
    expect(reserved.slug).toBe("elections-2");
  });

  it("labels a jurisdiction from depth and office tiers, and refuses a contradiction", () => {
    expect(
      classifyJurisdictionLevel({ isCountry: true, depth: 0, directTiers: [], descendantTiers: [] }),
    ).toEqual({ levelLabel: "country", ambiguous: 0 });
    expect(
      classifyJurisdictionLevel({ isCountry: false, depth: 1, directTiers: ["municipal"], descendantTiers: [] }),
    ).toEqual({ levelLabel: "municipality", ambiguous: 0 });
    expect(
      classifyJurisdictionLevel({
        isCountry: false,
        depth: 1,
        directTiers: ["regional"],
        descendantTiers: ["municipal"],
      }),
    ).toEqual({ levelLabel: "region", ambiguous: 0 });
    expect(
      classifyJurisdictionLevel({
        isCountry: false,
        depth: 1,
        directTiers: ["regional", "municipal"],
        descendantTiers: [],
      }),
    ).toEqual({ levelLabel: "area", ambiguous: 1 });
    expect(
      classifyJurisdictionLevel({
        isCountry: false,
        depth: 1,
        directTiers: ["national_context"],
        descendantTiers: [],
      }),
    ).toEqual({ levelLabel: "area", ambiguous: 1 });
    expect(
      classifyJurisdictionLevel({ isCountry: false, depth: 1, directTiers: ["other"], descendantTiers: [] }),
    ).toEqual({ levelLabel: "area", ambiguous: 1 });
    expect(
      classifyJurisdictionLevel({ isCountry: false, depth: 3, directTiers: ["other"], descendantTiers: [] }),
    ).toEqual({ levelLabel: "ward", ambiguous: 0 });
    expect(
      classifyJurisdictionLevel({
        isCountry: false,
        depth: 2,
        directTiers: ["municipal"],
        descendantTiers: ["regional"],
      }),
    ).toEqual({ levelLabel: "area", ambiguous: 1 });
  });

  it("places each event in a resolved day or an unplaced year", () => {
    expect(placeEvent({ dateResolution: "resolved", precision: "day", year: 2023, month: 5, day: 14 })).toEqual({
      placed: true,
      isoDate: "2023-05-14",
    });
    expect(placeEvent({ dateResolution: "resolved", precision: "month", year: 2023, month: 5, day: null })).toEqual({
      placed: false,
      year: 2023,
    });
    expect(placeEvent({ dateResolution: "resolved", precision: "year", year: 2023, month: null, day: null })).toEqual({
      placed: false,
      year: 2023,
    });
    expect(placeEvent({ dateResolution: "resolved", precision: "range", year: null, month: null, day: null })).toEqual({
      placed: false,
      year: null,
    });
    expect(
      placeEvent({ dateResolution: "resolved", precision: "unknown", year: null, month: null, day: null }),
    ).toEqual({ placed: false, year: null });
    expect(placeEvent({ dateResolution: "conflicting", precision: null, year: null, month: null, day: null })).toEqual({
      placed: false,
      year: null,
    });
    expect(placeEvent({ dateResolution: "unknown", precision: "day", year: 2023, month: 5, day: 14 })).toEqual({
      placed: false,
      year: 2023,
    });
    expect(
      cycleLabel({ isoDate: "2023-05-14", countryName: "Albania", contestCount: 122, tiers: ["municipal"] }),
    ).toBe("2023-05-14 · Albania · 122 municipal contests");
    expect(cycleLabel({ isoDate: "2023-05-14", countryName: "Albania", contestCount: 1, tiers: ["municipal"] })).toBe(
      "2023-05-14 · Albania · 1 municipal contest",
    );
    expect(
      cycleLabel({
        isoDate: "2023-05-14",
        countryName: "Albania",
        contestCount: 4,
        tiers: ["municipal", "regional"],
      }),
    ).toBe("2023-05-14 · Albania · 4 contests");
  });

  it("fills a holder only for one elected row on a single-seat office", () => {
    const winner = resultRow();
    const runner = resultRow({
      resultRowId: "row-2",
      label: "Besa",
      share: 25,
      electedFlag: 0,
    });
    const held = deriveSeatStatus({
      officeType: "mayor",
      nextDateId: null,
      nextDateResolution: "unknown",
      selectedEvents: [selectedEvent()],
      results: [winner, runner],
    });
    expect(held.statusReason).toBeNull();
    expect(held.currentHolderLabel).toBe("Ada");
    expect(held.currentHolderPartyLabel).toBe("Party");
    expect(held.currentSinceDateId).toBe("date-1");
    expect(held.lastShare).toBe(60);
    expect(held.lastMargin).toBe(35);

    const council = deriveSeatStatus({
      officeType: "municipal_council",
      nextDateId: null,
      nextDateResolution: "unknown",
      selectedEvents: [selectedEvent()],
      results: [winner, runner],
    });
    expect(council.statusReason).toBe("multi_seat");
    expect(council.currentHolderLabel).toBeNull();
    expect(council.lastMargin).toBe(35);

    expect(
      deriveSeatStatus({
        officeType: "mayor",
        nextDateId: "date-next",
        nextDateResolution: "resolved",
        selectedEvents: [],
        results: [],
      }).statusReason,
    ).toBe("no_history");

    expect(
      deriveSeatStatus({
        officeType: "mayor",
        nextDateId: null,
        nextDateResolution: "unknown",
        selectedEvents: [selectedEvent()],
        results: [winner, resultRow({ resultRowId: "row-3", electedFlag: 1, label: "Other" })],
      }).statusReason,
    ).toBe("no_elected_flag");

    expect(
      deriveSeatStatus({
        officeType: "mayor",
        nextDateId: null,
        nextDateResolution: "unknown",
        selectedEvents: [selectedEvent()],
        results: [resultRow({ evidenceStatus: "disputed" })],
      }).statusReason,
    ).toBe("withheld");

    expect(
      deriveSeatStatus({
        officeType: "mayor",
        nextDateId: null,
        nextDateResolution: "unknown",
        selectedEvents: [selectedEvent({ dateResolution: "conflicting", dateId: null, precision: null, year: null, month: null, day: null })],
        results: [winner],
      }).statusReason,
    ).toBe("conflicting_date");

    expect(
      deriveSeatStatus({
        officeType: "mayor",
        nextDateId: null,
        nextDateResolution: "unknown",
        selectedEvents: [selectedEvent({ legalOutcome: "annulled" })],
        results: [winner],
      }).statusReason,
    ).toBe("superseded");

    expect(
      marginFromResults([
        resultRow({ share: 40, shareUnit: "percent_0_100" }),
        resultRow({ resultRowId: "row-2", share: 10, shareUnit: "proportion_0_1", electedFlag: 0 }),
      ]),
    ).toBeNull();
    expect(
      marginFromResults([
        resultRow({ proceedingId: "first" }),
        resultRow({ resultRowId: "row-2", proceedingId: "first", share: 20, electedFlag: 0 }),
        resultRow({ resultRowId: "row-3", proceedingId: "runoff", share: 55, electedFlag: 0 }),
        resultRow({ resultRowId: "row-4", proceedingId: "runoff", share: 30, electedFlag: 0 }),
      ]),
    ).toBeNull();
    expect(marginFromResults([resultRow({ share: null, shareStatus: "unknown" })])).toBeNull();
  });
});

describe("Albania derived projection", () => {
  const tempDirs: string[] = [];
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
  });

  afterEach(() => {
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("rebuilds identically from the Albania publication and leaves master hashes unchanged", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-derive-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAlbania({ root: repoRoot, sqlitePath, attemptsPath, operator: "derive-test" });

    const masterBefore = contentHash(sqlitePath, "master");
    const derivedBefore = contentHash(sqlitePath, "derived");
    const db = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(db);
    } finally {
      db.close();
    }
    expect(contentHash(sqlitePath, "master")).toBe(masterBefore);
    expect(contentHash(sqlitePath, "derived")).toBe(derivedBefore);

    const read = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const slugDupes = read
        .prepare("SELECT slug_path, COUNT(*) AS n FROM derived_jurisdiction GROUP BY slug_path HAVING n > 1")
        .all();
      expect(slugDupes).toEqual([]);
      const aliasClash = read
        .prepare(
          `SELECT COUNT(*) AS n FROM derived_slug_alias a
           JOIN derived_jurisdiction j ON j.slug_path = a.slug_path`,
        )
        .get();
      expect(Number(aliasClash?.n)).toBe(0);

      const eventSplit = read
        .prepare(
          `WITH classified AS (
             SELECT e.id_namespace, e.office_id, e.history_key, o.country_id,
                    CASE
                      WHEN e.date_resolution = 'resolved'
                       AND d.precision = 'day'
                       AND d.year IS NOT NULL AND d.month IS NOT NULL AND d.day IS NOT NULL
                      THEN 1 ELSE 0
                    END AS placed,
                    printf('%04d-%02d-%02d', d.year, d.month, d.day) AS iso_date,
                    CASE WHEN d.precision IN ('day','month','year') THEN d.year ELSE NULL END AS unplaced_year
             FROM election_event e
             JOIN office o ON o.id_namespace = e.id_namespace AND o.office_id = e.office_id
             LEFT JOIN research_date d ON d.date_id = e.date_id
           )
           SELECT
             (SELECT COUNT(*) FROM election_event) AS events,
             (SELECT COUNT(*) FROM classified WHERE placed = 1) AS placed,
             (SELECT COUNT(*) FROM classified WHERE placed = 0) AS unplaced,
             (SELECT COALESCE(SUM(contest_count), 0) FROM derived_cycle) AS cycle_contests,
             (SELECT COUNT(*) FROM derived_cycle_unplaced) AS unplaced_rows,
             (SELECT COUNT(*) FROM classified c
               WHERE c.placed = 1 AND EXISTS (
                 SELECT 1 FROM derived_cycle_unplaced u
                 WHERE u.id_namespace = c.id_namespace AND u.office_id = c.office_id AND u.history_key = c.history_key
               )) AS in_both,
             (SELECT COUNT(*) FROM classified c
               WHERE c.placed = 0 AND NOT EXISTS (
                 SELECT 1 FROM derived_cycle_unplaced u
                 WHERE u.id_namespace = c.id_namespace AND u.office_id = c.office_id AND u.history_key = c.history_key
               )) AS missing_unplaced`,
        )
        .get();
      expect(Number(eventSplit?.events)).toBe(Number(eventSplit?.placed) + Number(eventSplit?.unplaced));
      expect(Number(eventSplit?.placed)).toBe(Number(eventSplit?.cycle_contests));
      expect(Number(eventSplit?.unplaced)).toBe(Number(eventSplit?.unplaced_rows));
      expect(Number(eventSplit?.in_both)).toBe(0);
      expect(Number(eventSplit?.missing_unplaced)).toBe(0);

      const holderWithoutFlag = read
        .prepare(
          `SELECT COUNT(*) AS n FROM derived_seat_status s
           WHERE (s.current_holder_label IS NOT NULL
              OR s.current_holder_party_label IS NOT NULL
              OR s.current_since_date_id IS NOT NULL)
             AND NOT EXISTS (
               SELECT 1 FROM result_row r
               JOIN election_event e
                 ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
               WHERE r.id_namespace = s.id_namespace
                 AND r.office_id = s.office_id
                 AND r.elected_flag = 1
                 AND e.event_id = s.last_selected_event_id
             )`,
        )
        .get();
      expect(Number(holderWithoutFlag?.n)).toBe(0);

      const coverageGap = read
        .prepare(
          `WITH RECURSIVE descent AS (
             SELECT jurisdiction_key AS ancestor, jurisdiction_key, geography_id, country_id
             FROM derived_jurisdiction
             UNION ALL
             SELECT d.ancestor, j.jurisdiction_key, j.geography_id, j.country_id
             FROM derived_jurisdiction j
             JOIN descent d ON j.parent_key = d.jurisdiction_key
           ),
           office_counts AS (
             SELECT d.ancestor AS jurisdiction_key, COUNT(o.office_id) AS offices
             FROM descent d
             LEFT JOIN office o
               ON o.country_id = d.country_id AND o.geography_id = d.geography_id
             GROUP BY d.ancestor
           )
           SELECT COUNT(*) AS n
           FROM derived_coverage c
           JOIN office_counts n ON n.jurisdiction_key = c.jurisdiction_key
           WHERE c.offices != n.offices`,
        )
        .get();
      expect(Number(coverageGap?.n)).toBe(0);
      const coverageRows = read.prepare("SELECT COUNT(*) AS n FROM derived_coverage").get();
      const jurisdictionRows = read.prepare("SELECT COUNT(*) AS n FROM derived_jurisdiction").get();
      expect(coverageRows?.n).toBe(jurisdictionRows?.n);

      const levels = read
        .prepare("SELECT level_label, ambiguous, COUNT(*) AS n FROM derived_jurisdiction GROUP BY level_label, ambiguous ORDER BY level_label")
        .all();
      expect(levels).toEqual([
        { level_label: "area", ambiguous: 1, n: 23 },
        { level_label: "country", ambiguous: 0, n: 1 },
        { level_label: "municipality", ambiguous: 0, n: 868 },
      ]);
    } finally {
      read.close();
    }

    expect(listAtlasOffices("albania", sqlitePath)).toHaveLength(891);
    const country = getAtlasJurisdictionBySlug("albania", sqlitePath);
    expect(country?.aliasReason).toBeNull();
    expect(country?.jurisdiction.levelLabel).toBe("country");
    expect(country?.jurisdiction.officeCount).toBe(891);
    expect(listAtlasJurisdictions("albania", sqlitePath).some((row) => row.slugPath === "albania/tirane")).toBe(true);
    expect(listAtlasCycles("albania", sqlitePath)).toEqual([]);
    expect(listAtlasUnplacedCycles("albania", sqlitePath)).toEqual([]);
    const seats = listAtlasSeatStatuses("albania", sqlitePath);
    expect(seats).toHaveLength(891);
    expect(seats.every((row) => row.currentHolderLabel == null && row.statusReason === "no_history")).toBe(true);
    const coverage = getAtlasCoverage("country:albania", sqlitePath);
    expect(coverage?.offices).toBe(891);
    expect(coverage?.officesWithAnyEvent).toBe(0);
    expect(coverage?.eventsTotal).toBe(0);
    expect(coverage?.notSuppliedNextDates).toBe(891);
    expect(coverage?.latestSnapshotLabel).toBe(RESEARCH_SNAPSHOT_LABEL);

    const beforeRename = tableHashes(sqlitePath);
    const writable = openAtlasDatabase(sqlitePath);
    try {
      const target = writable
        .prepare(
          `SELECT j.jurisdiction_key, j.slug_path, g.geography_id
           FROM derived_jurisdiction j
           JOIN geography g ON g.country_id = j.country_id AND g.geography_id = j.geography_id
           WHERE j.slug_path = 'albania/tirane'`,
        )
        .get();
      expect(target?.jurisdiction_key).toBeTruthy();
      writable
        .prepare("UPDATE geography SET name = ? WHERE country_id = 'albania' AND geography_id = ?")
        .run("Durrës Probe", String(target?.geography_id));
      deriveAtlas(writable);
      const alias = writable
        .prepare("SELECT jurisdiction_key, reason FROM derived_slug_alias WHERE slug_path = 'albania/tirane'")
        .get();
      expect(alias).toMatchObject({ jurisdiction_key: target?.jurisdiction_key, reason: "rename" });
      const moved = writable
        .prepare("SELECT slug_path FROM derived_jurisdiction WHERE jurisdiction_key = ?")
        .get(String(target?.jurisdiction_key));
      expect(moved?.slug_path).toBe("albania/durres-probe");
    } finally {
      writable.close();
    }
    const afterRename = tableHashes(sqlitePath);
    expect(afterRename.geography).not.toBe(beforeRename.geography);
    for (const [table, hash] of Object.entries(beforeRename)) {
      if (table === "geography") continue;
      expect(afterRename[table]).toBe(hash);
    }
    const renamedDerived = contentHash(sqlitePath, "derived");
    const again = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(again);
    } finally {
      again.close();
    }
    expect(contentHash(sqlitePath, "derived")).toBe(renamedDerived);
    const masterAfterSecond = contentHash(sqlitePath, "master");
    const onceMore = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(onceMore);
    } finally {
      onceMore.close();
    }
    expect(contentHash(sqlitePath, "master")).toBe(masterAfterSecond);
  });
});
