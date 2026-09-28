import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...props }, children),
  };
});

import { importAlbania } from "../../lib/atlas/albania/import";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";
import {
  historyCsv,
  historyRows,
  officeholderTimeline,
  turnoutFromEventRaw,
  turnoutPercent,
  type SeatCycleEvent,
} from "../../lib/atlas/seat/history";
import { assignOfficeSlugs, emptyOfficeSlugMeanings, officeIdentity } from "../../lib/atlas/seat/slug";
import { readSeatPage } from "../../lib/atlas/seat/read";
import { proxy } from "../../proxy";
import AtlasOfficePage from "../../app/atlas/offices/[officeId]/page";
import { GET as officeCsv } from "../../app/atlas/offices/[officeId]/csv/route";
import AtlasSeatAliasPage from "../../app/atlas/seat-alias/[[...path]]/page";

const repoRoot = path.join(import.meta.dirname, "../..");
const NS = "cdd-observatory-v1";

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node);
}

function outsideRecordDetails(html: string): string {
  return html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, "");
}

function cycle(overrides: Partial<SeatCycleEvent> & Pick<SeatCycleEvent, "eventId">): SeatCycleEvent {
  return {
    historyKey: overrides.eventId,
    selectedHistoryRole: "selected",
    legalOutcome: "certified",
    recordState: "active",
    electoralSystem: null,
    dateResolution: "resolved",
    precision: "day",
    year: 2015,
    month: 6,
    day: 21,
    dateId: `${overrides.eventId}-date`,
    dateLabel: "2015-06-21",
    rawJson: null,
    shareUnit: "percent_0_100",
    results: [],
    proceedings: [],
    ...overrides,
  };
}

function winnerResult(overrides: Partial<SeatCycleEvent["results"][number]> = {}) {
  return {
    resultRowId: "row-1",
    proceedingId: "proc-1",
    label: "Ada",
    partyLabel: "Party A",
    votes: 100,
    votesStatus: "recorded",
    share: 55,
    shareStatus: "recorded",
    shareUnit: "percent_0_100",
    electedFlag: 1,
    evidenceStatus: "recorded",
    ...overrides,
  };
}

describe("seat history rules", () => {
  it("keeps gaps between officeholders and does not copy an earlier party", () => {
    const events = [
      cycle({
        eventId: "2015",
        year: 2015,
        dateLabel: "2015-06-21",
        results: [winnerResult()],
        proceedings: [{ proceedingId: "proc-1", kind: "first_round", sequenceNo: 1, legalOutcome: "certified" }],
      }),
      cycle({
        eventId: "2019",
        year: 2019,
        month: 6,
        day: 30,
        dateLabel: "2019-06-30",
        results: [],
      }),
      cycle({
        eventId: "2023",
        year: 2023,
        month: 5,
        day: 14,
        dateLabel: "2023-05-14",
        results: [winnerResult({ partyLabel: null, share: 60, votes: 120 })],
        proceedings: [{ proceedingId: "proc-1", kind: "first_round", sequenceNo: 1, legalOutcome: "certified" }],
      }),
    ];
    const timeline = officeholderTimeline(events);
    expect(timeline.map((entry) => entry.kind)).toEqual(["holder", "gap", "holder"]);
    expect(timeline[0]).toMatchObject({ holder: "Ada", party: "Party A" });
    expect(timeline[2]).toMatchObject({ holder: "Ada", party: null });
    const rows = historyRows(events);
    expect(rows[2]?.party).toBe("not supplied");
    expect(rows[2]?.party).not.toBe("Party A");
  });

  it("computes turnout only when registered voters and ballots cast are both supplied", () => {
    expect(turnoutPercent(1000, 800)).toBe(80);
    expect(turnoutPercent(0, 0)).toBeNull();
    expect(turnoutPercent(100, 140)).toBeNull();
    expect(turnoutFromEventRaw(JSON.stringify({ row: { registered_voters: 1000 } }))).toBeNull();
    expect(turnoutFromEventRaw(JSON.stringify({ row: { votes_cast: 800 } }))).toBeNull();
    expect(
      turnoutFromEventRaw(JSON.stringify({ row: { registered_voters: 1000, votes_cast: 800 } })),
    ).toBe(80);
    const rows = historyRows([
      cycle({
        eventId: "partial",
        rawJson: JSON.stringify({ row: { registered_voters: 1000 } }),
        results: [winnerResult()],
        proceedings: [{ proceedingId: "proc-1", kind: "first_round", sequenceNo: 1, legalOutcome: "certified" }],
      }),
    ]);
    expect(rows[0]?.turnout).toBe("not supplied");
  });

  it("shows a margin only when both shares are supplied and labels a superseded proceeding", () => {
    const rows = historyRows([
      cycle({
        eventId: "one-share",
        results: [
          winnerResult({ share: 55 }),
          winnerResult({ resultRowId: "row-2", label: "Besa", electedFlag: 0, share: null, shareStatus: "unknown" }),
        ],
        proceedings: [{ proceedingId: "proc-1", kind: "first_round", sequenceNo: 1, legalOutcome: "certified" }],
      }),
      cycle({
        eventId: "two-share",
        year: 2023,
        dateLabel: "2023-05-14",
        results: [
          winnerResult({ share: 62, proceedingId: "first" }),
          winnerResult({
            resultRowId: "row-2",
            label: "Besa",
            electedFlag: 0,
            share: 38,
            proceedingId: "first",
          }),
          winnerResult({
            resultRowId: "row-3",
            label: "Struck Candidate",
            electedFlag: 0,
            share: 10,
            proceedingId: "runoff",
          }),
        ],
        proceedings: [
          { proceedingId: "runoff", kind: "runoff", sequenceNo: 2, legalOutcome: "superseded" },
          { proceedingId: "first", kind: "first_round", sequenceNo: 1, legalOutcome: "certified" },
        ],
      }),
    ]);
    expect(rows[0]?.margin).toBe("not supplied");
    expect(rows[1]?.margin).toBe("24%");
    expect(rows[1]?.proceedings.map((proceeding) => proceeding.kindLabel)).toEqual(["First round", "Runoff"]);
    expect(rows[1]?.proceedings[1]).toMatchObject({ superseded: true, legalOutcomeLabel: "Superseded" });
    expect(historyCsv(rows).trim().split("\n")).toHaveLength(rows.length + 1);
  });

  it("keeps a published office slug on the same office", () => {
    const input = {
      idNamespace: "ns",
      officeId: "office-1",
      name: "Mayor",
      jurisdictionKey: "geo:albania:dimal",
      jurisdictionSlugPath: "albania/dimal",
    };
    const first = assignOfficeSlugs([input], emptyOfficeSlugMeanings());
    const prior = emptyOfficeSlugMeanings();
    prior.meaning.set(first.rows[0]!.slug_path, officeIdentity(input.idNamespace, input.officeId));
    const renamed = assignOfficeSlugs([{ ...input, name: "Chair" }], prior);
    expect(renamed.rows[0]?.slug).toBe("chair");
    expect(renamed.aliases).toEqual([
      {
        slug_path: "albania/dimal/seats/mayor",
        id_namespace: "ns",
        office_id: "office-1",
        reason: "rename",
      },
    ]);
    const pair = assignOfficeSlugs(
      [
        { ...input, officeId: "b", name: "Mayor" },
        { ...input, officeId: "a", name: "Mayor" },
      ],
      emptyOfficeSlugMeanings(),
    );
    expect(pair.rows.map((row) => row.slug)).toEqual(["mayor", "mayor-2"]);
  });
});

describe("seat pages on the Albania fixture", () => {
  const tempDirs: string[] = [];
  let sqlitePath = "";
  const previous = process.env.ATLAS_SQLITE_PATH;
  const previousFixtures = process.env.OBSERVATORY_FIXTURES;

  beforeEach(() => {
    delete process.env.OBSERVATORY_FIXTURES;
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-seat-"));
    tempDirs.push(dir);
    sqlitePath = path.join(dir, "atlas.sqlite");
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    importAlbania({
      root: repoRoot,
      sqlitePath,
      attemptsPath: path.join(dir, "attempts.sqlite"),
      operator: "seat-page",
    });
    seedSeatFixtures(sqlitePath);
  });

  afterEach(() => {
    if (previous === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previous;
    if (previousFixtures === undefined) delete process.env.OBSERVATORY_FIXTURES;
    else process.env.OBSERVATORY_FIXTURES = previousFixtures;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it("shows a holder only for a single winner, and keeps withheld, council, and conflicting seats open", async () => {
    const mayor = readSeatPage(NS, "AL-05-M", sqlitePath);
    const council = readSeatPage(NS, "AL-05-C", sqlitePath);
    const withheld = readSeatPage(NS, "AL-01-M", sqlitePath);
    const conflicting = readSeatPage(NS, "AL-06-M", sqlitePath);
    expect(mayor?.holderShown).toBe(true);
    expect(council?.holderShown).toBe(false);
    expect(withheld?.holderShown).toBe(false);
    expect(conflicting?.holderShown).toBe(false);
    expect(mayor?.holderPhrase).toContain("Held by Ada Dimal since");
    expect(council?.holderPhrase).toBe("Council seat: results list a slate, not a single holder");
    expect(withheld?.holderPhrase).toContain("withheld");
    expect(conflicting?.holderPhrase).toContain("conflict");
    expect(mayor?.electoralSystem).toBe("plurality");
    expect(mayor?.electoralSystem).not.toBe("earlier-system");
    expect(mayor?.termYears).toBe(4);

    const mayorHtml = markup(await mayorView("AL-05-M"));
    expect(mayorHtml).toContain("Results by election cycle");
    expect(mayorHtml).toContain("Officeholders");
    expect(mayorHtml).toContain("Download");
    expect(mayorHtml).toContain("First round");
    expect(mayorHtml).toContain("Runoff");
    expect(mayorHtml).toContain("line-through");
    expect(mayorHtml).toContain("Superseded");
    expect(mayorHtml).toContain("Struck Candidate");
    expect(mayorHtml).toContain('data-placeholder="true"');
    expect(mayorHtml).toContain("80%");
    expect(mayorHtml).toContain("24%");
    expect(outsideRecordDetails(mayorHtml)).not.toMatch(/prompt b|lineage|namespace/i);
    const historyRowsInHtml = mayorHtml.match(/data-history-row=/g) ?? [];
    const csv = await officeCsv(new Request("http://localhost/csv"), {
      params: Promise.resolve({ officeId: "AL-05-M" }),
    });
    const csvText = await csv.text();
    const csvRows = csvText.trim().split("\n");
    expect(csvRows).toHaveLength(historyRowsInHtml.length + 1);
    expect(csvText).toContain("not supplied");
    expect(csvText).not.toMatch(/,0,/);
    expect(mayor?.history.find((row) => row.cycle.startsWith("2015"))?.margin).toBe("not supplied");
    expect(mayor?.history.find((row) => row.cycle.startsWith("2019"))?.turnout).toBe("not supplied");
    expect(mayor?.history.find((row) => row.cycle.startsWith("2023"))?.party).toBe("Party B");

    const councilHtml = markup(await mayorView("AL-05-C"));
    const withheldHtml = markup(await mayorView("AL-01-M"));
    const conflictHtml = markup(await mayorView("AL-06-M"));
    expect(councilHtml).not.toContain("Held by");
    expect(withheldHtml).not.toContain("Held by");
    expect(conflictHtml).not.toContain("Held by");
    expect(withheldHtml).toContain("not supplied");
  });

  it("serves the readable alias and lists ambiguous offices with their jurisdictions", async () => {
    const mayor = readSeatPage(NS, "AL-05-M", sqlitePath);
    expect(mayor?.readablePath).toMatch(/^\/atlas\/.+\/seats\/.+$/);
    const parts = (mayor?.readablePath ?? "").replace(/^\/atlas\//, "").split("/");
    const seatsAt = parts.indexOf("seats");
    const internalPath = [...parts.slice(0, seatsAt), parts[seatsAt + 1]!];
    const aliasHtml = markup(
      await AtlasSeatAliasPage({ params: Promise.resolve({ path: internalPath }) }),
    );
    expect(aliasHtml).toContain("Held by Ada Dimal");
    await expect(
      AtlasSeatAliasPage({ params: Promise.resolve({ path: ["albania", "missing-place", "missing-seat"] }) }),
    ).rejects.toThrow(/404|NEXT_HTTP_ERROR_FALLBACK/);

    const ambiguous = markup(await AtlasOfficePage({ params: Promise.resolve({ officeId: "AL-SEAT-AMBIG" }) }));
    expect(ambiguous).toContain("More than one record matches");
    expect(ambiguous).toContain("Ambiguous One");
    expect(ambiguous).toContain("Ambiguous Two");
    expect(ambiguous).toContain("/seats/");
    expect(outsideRecordDetails(ambiguous)).not.toMatch(/prompt b|lineage|namespace/i);

    const rewritten = proxy(new NextRequest(`http://localhost${mayor?.readablePath}`));
    const location = rewritten.headers.get("x-middleware-rewrite") ?? rewritten.headers.get("location") ?? "";
    expect(location).toContain("/atlas/seat-alias/");
    const csvRewrite = proxy(new NextRequest("http://localhost/atlas/offices/AL-05-M.csv"));
    const csvLocation = csvRewrite.headers.get("x-middleware-rewrite") ?? csvRewrite.headers.get("location") ?? "";
    expect(csvLocation).toContain("/atlas/offices/AL-05-M/csv");
  });
});

async function mayorView(officeId: string) {
  return AtlasOfficePage({ params: Promise.resolve({ officeId }) });
}

function seedSeatFixtures(sqlitePath: string) {
  const db = openAtlasDatabase(sqlitePath);
  try {
    const publication = db
      .prepare("SELECT lineage_id, release_id FROM publication_release WHERE lineage_id = 'country-package-albania'")
      .get() as { lineage_id: string; release_id: string };
    const office = (officeId: string) =>
      db.prepare("SELECT geography_id, country_id FROM office WHERE id_namespace = ? AND office_id = ?").get(NS, officeId) as {
        geography_id: string;
        country_id: string;
      };

    const insertDate = db.prepare(
      `INSERT INTO research_date (
         date_id, label, precision, certainty, year, month, day, range_start_id, range_end_id, lineage_id, release_id, raw_json
       ) VALUES (?, ?, 'day', 'called', ?, ?, ?, NULL, NULL, ?, ?, '{}')`,
    );
    const insertEvent = db.prepare(
      `INSERT INTO election_event (
         id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind, selected_history_role,
         electoral_system, comparability, ballot_basis, share_unit, legal_outcome, record_state, state_note,
         lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, ?, 'ordinary', 'selected', ?, NULL, 'valid_votes', 'percent_0_100', 'certified', 'active', NULL, ?, ?, ?)`,
    );
    const insertProceeding = db.prepare(
      `INSERT INTO proceeding (
         id_namespace, office_id, history_key, proceeding_id, kind, sequence_no, supersedes_id, legal_outcome,
         lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, '{}')`,
    );
    const insertResult = db.prepare(
      `INSERT INTO result_row (
         id_namespace, office_id, history_key, result_row_id, proceeding_id, country_id, candidate_or_list_label,
         original_party_label, original_party_code, party_namespace, party_mapping_id, votes, votes_status, share,
         share_status, share_unit, seats, seats_status, elected_flag, is_substitute, evidence_status, lineage_id, release_id, raw_json
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, ?, ?, 'percent_0_100', NULL, 'unknown', ?, NULL, ?, ?, ?, '{}')`,
    );

    db.exec("BEGIN IMMEDIATE;");
    const dates: Array<[string, string, number, number, number]> = [
      ["seat-date-2015", "2015-06-21", 2015, 6, 21],
      ["seat-date-2019", "2019-06-30", 2019, 6, 30],
      ["seat-date-2023", "2023-05-14", 2023, 5, 14],
      ["seat-date-council", "2023-05-14", 2023, 5, 14],
      ["seat-date-withheld", "2018-07-01", 2018, 7, 1],
    ];
    for (const [dateId, label, year, month, day] of dates) {
      insertDate.run(dateId, label, year, month, day, publication.lineage_id, publication.release_id);
    }

    const mayorCountry = office("AL-05-M").country_id;
    insertEvent.run(
      NS, "AL-05-M", "h2015", "seat-mayor-2015", "seat-date-2015", "resolved", "earlier-system",
      publication.lineage_id, publication.release_id,
      JSON.stringify({ row: { registered_voters: 1000, votes_cast: 800 } }),
    );
    insertEvent.run(
      NS, "AL-05-M", "h2019", "seat-mayor-2019", "seat-date-2019", "resolved", null,
      publication.lineage_id, publication.release_id,
      JSON.stringify({ row: { registered_voters: 1000 } }),
    );
    insertEvent.run(
      NS, "AL-05-M", "h2023", "seat-mayor-2023", "seat-date-2023", "resolved", "plurality",
      publication.lineage_id, publication.release_id, "{}",
    );
    insertProceeding.run(NS, "AL-05-M", "h2015", "seat-p-2015", "first_round", 1, "certified", publication.lineage_id, publication.release_id);
    insertProceeding.run(NS, "AL-05-M", "h2023", "seat-p-2023-first", "first_round", 1, "certified", publication.lineage_id, publication.release_id);
    insertProceeding.run(NS, "AL-05-M", "h2023", "seat-p-2023-runoff", "runoff", 2, "superseded", publication.lineage_id, publication.release_id);
    insertResult.run(
      NS, "AL-05-M", "h2015", "seat-r-2015-a", "seat-p-2015", mayorCountry, "Ada Dimal", "Party A",
      100, "recorded", 55, "recorded", 1, "recorded", publication.lineage_id, publication.release_id,
    );
    insertResult.run(
      NS, "AL-05-M", "h2015", "seat-r-2015-b", "seat-p-2015", mayorCountry, "Besa", "Party B",
      40, "recorded", null, "unknown", 0, "recorded", publication.lineage_id, publication.release_id,
    );
    insertResult.run(
      NS, "AL-05-M", "h2023", "seat-r-2023-a", "seat-p-2023-first", mayorCountry, "Ada Dimal", "Party B",
      120, "recorded", 62, "recorded", 1, "recorded", publication.lineage_id, publication.release_id,
    );
    insertResult.run(
      NS, "AL-05-M", "h2023", "seat-r-2023-b", "seat-p-2023-first", mayorCountry, "Besa", "Party C",
      70, "recorded", 38, "recorded", 0, "recorded", publication.lineage_id, publication.release_id,
    );
    insertResult.run(
      NS, "AL-05-M", "h2023", "seat-r-2023-c", "seat-p-2023-runoff", mayorCountry, "Struck Candidate", "Party D",
      10, "recorded", 10, "recorded", 0, "recorded", publication.lineage_id, publication.release_id,
    );

    const councilCountry = office("AL-05-C").country_id;
    insertEvent.run(
      NS, "AL-05-C", "h-council", "seat-council-2023", "seat-date-council", "resolved", null,
      publication.lineage_id, publication.release_id, "{}",
    );
    insertProceeding.run(NS, "AL-05-C", "h-council", "seat-p-council", "certification", 1, "certified", publication.lineage_id, publication.release_id);
    insertResult.run(
      NS, "AL-05-C", "h-council", "seat-r-council-a", "seat-p-council", councilCountry, "List A", "List A",
      50, "recorded", 40, "recorded", 1, "recorded", publication.lineage_id, publication.release_id,
    );
    insertResult.run(
      NS, "AL-05-C", "h-council", "seat-r-council-b", "seat-p-council", councilCountry, "List B", "List B",
      30, "recorded", 25, "recorded", 1, "recorded", publication.lineage_id, publication.release_id,
    );

    const withheldCountry = office("AL-01-M").country_id;
    insertEvent.run(
      NS, "AL-01-M", "h-withheld", "seat-withheld-2018", "seat-date-withheld", "resolved", null,
      publication.lineage_id, publication.release_id, "{}",
    );
    insertResult.run(
      NS, "AL-01-M", "h-withheld", "seat-r-withheld", null, withheldCountry, "Withheld Winner", "Party W",
      10, "recorded", null, "unknown", 1, "disputed", publication.lineage_id, publication.release_id,
    );

    insertEvent.run(
      NS, "AL-06-M", "h-conflict", "seat-conflict", null, "conflicting", null,
      publication.lineage_id, publication.release_id, "{}",
    );
    insertResult.run(
      NS, "AL-06-M", "h-conflict", "seat-r-conflict", null, office("AL-06-M").country_id, "Conflict Winner", "Party K",
      10, "recorded", 51, "recorded", 1, "recorded", publication.lineage_id, publication.release_id,
    );

    const tier = db
      .prepare(
        `SELECT tier, review_status, rationale, lineage_id, release_id, classification_path, classification_kind, classification_sha256
         FROM office_tier_classification WHERE id_namespace = ? AND office_id = 'AL-05-M'`,
      )
      .get(NS) as Record<string, string>;
    const dimalGeo = office("AL-05-M").geography_id;
    const beratGeo = office("AL-01-M").geography_id;
    const insertOffice = db.prepare(
      `INSERT INTO office (
         id_namespace, office_id, country_id, geography_id, name, office_type, office_status, record_state, state_note,
         registry_qualified, next_date_id, next_date_resolution, next_history_key, lineage_id, release_id, raw_json
       ) VALUES (?, 'AL-SEAT-AMBIG', 'albania', ?, ?, 'mayor', 'current', 'active', NULL, 1, NULL, 'unknown', NULL, ?, ?, '{}')`,
    );
    const insertTier = db.prepare(
      `INSERT INTO office_tier_classification (
         id_namespace, office_id, tier, review_status, rationale, lineage_id, release_id, classification_path,
         classification_kind, classification_sha256, raw_json
       ) VALUES (?, 'AL-SEAT-AMBIG', ?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
    );
    insertTier.run("seat-fixture-a", tier.tier, tier.review_status, tier.rationale, tier.lineage_id, tier.release_id, tier.classification_path, tier.classification_kind, tier.classification_sha256);
    insertTier.run("seat-fixture-b", tier.tier, tier.review_status, tier.rationale, tier.lineage_id, tier.release_id, tier.classification_path, tier.classification_kind, tier.classification_sha256);
    insertOffice.run("seat-fixture-a", dimalGeo, "Ambiguous One", publication.lineage_id, publication.release_id);
    insertOffice.run("seat-fixture-b", beratGeo, "Ambiguous Two", publication.lineage_id, publication.release_id);
    db.exec("COMMIT;");
  } catch (error) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // The transaction may already be closed.
    }
    throw error;
  } finally {
    db.close();
  }

  const derived = openAtlasDatabase(sqlitePath);
  try {
    deriveAtlas(derived);
  } finally {
    derived.close();
  }
}
