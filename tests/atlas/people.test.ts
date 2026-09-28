import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import AtlasPersonPage from "../../app/atlas/people/[personSlug]/page";
import AtlasSearchPage from "../../app/atlas/search/page";
import { importAlbania } from "../../lib/atlas/albania/import";
import { migrateMasterDatabase } from "../../lib/atlas/apply-migrations";
import { deriveAtlas } from "../../lib/atlas/derive/run";
import { loadApprovedPeople } from "../../lib/atlas/people/load";
import {
  chooseCanonicalLabel,
  isInitialsOnlyLabel,
  isListLabel,
  proposePeopleForCountry,
  serializePeopleProposal,
} from "../../lib/atlas/people/propose";
import { readPersonPage } from "../../lib/atlas/people/read";
import { assignPersonSlugs } from "../../lib/atlas/people/slug";
import type { PeopleProposalFile } from "../../lib/atlas/people/types";
import { assertApprovedForLoad, PeopleProposalError, validatePeopleProposal } from "../../lib/atlas/people/validate";
import { search } from "../../lib/atlas/search";
import { openAtlasDatabase } from "../../lib/atlas/sqlite";

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: { href: string; children?: ReactNode }) =>
      React.createElement("a", { href, ...props }, children),
  };
});

const repoRoot = path.join(import.meta.dirname, "../..");
const SHA = "a".repeat(64);

function markup(node: ReactNode): string {
  return renderToStaticMarkup(node as ReturnType<typeof createElement>);
}

function outsideRecordDetails(html: string): string {
  return html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/gi, "");
}

function insertCountry(
  db: DatabaseSync,
  countryId: string,
  code: string,
  name: string,
  regionId: string,
  lineageId: string,
  releaseId: string,
) {
  db.prepare("INSERT INTO dataset_lineage (lineage_id, provenance_kind, description) VALUES (?, 'country_package', ?)").run(
    lineageId,
    name,
  );
  db.prepare(
    `INSERT INTO dataset_release (
       lineage_id, release_id, fingerprint_sha256, hash_inputs_json, adapter_version, method_version,
       schema_version, validated_counts_json, research_coverage_complete
     ) VALUES (?, ?, ?, '{}', 'fixture', 'fixture', 'fixture', '{}', 0)`,
  ).run(lineageId, releaseId, SHA);
  db.prepare("INSERT INTO publication_release (lineage_id, release_id) VALUES (?, ?)").run(lineageId, releaseId);
  db.prepare(
    `INSERT INTO retained_input (
       lineage_id, release_id, input_path, input_kind, sha256, byte_count, recovery_locator
     ) VALUES (?, ?, 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?, 2, 'fixture')`,
  ).run(lineageId, releaseId, SHA);
  db.prepare(
    `INSERT INTO country (
       country_id, country_code, name, polity_kind, region_id, coverage_status, lineage_id, release_id
     ) VALUES (?, ?, ?, 'sovereign_country', ?, 'partial', ?, ?)`,
  ).run(countryId, code, name, regionId, lineageId, releaseId);
}

function insertOffice(
  db: DatabaseSync,
  args: {
    officeId: string;
    officeName: string;
    officeType: string;
    geographyId: string;
    geographyName: string;
    ballotBasis: string;
    historyKey: string;
    eventId: string;
    dateId: string;
    year: number;
    month: number;
    day: number;
  },
) {
  const geography = db.prepare("SELECT 1 AS ok FROM geography WHERE country_id = 'albania' AND geography_id = ?").get(args.geographyId);
  if (!geography) {
    db.prepare(
      `INSERT INTO geography (country_id, geography_id, name, lineage_id, release_id) VALUES ('albania', ?, ?, 'lineage-al', 'rel-al')`,
    ).run(args.geographyId, args.geographyName);
  }
  db.prepare(
    `INSERT INTO research_date (date_id, label, precision, certainty, year, month, day, lineage_id, release_id)
     VALUES (?, ?, 'day', 'called', ?, ?, ?, 'lineage-al', 'rel-al')`,
  ).run(args.dateId, args.dateId, args.year, args.month, args.day);
  db.prepare(
    `INSERT INTO office (
       id_namespace, office_id, country_id, geography_id, name, office_type, office_status,
       record_state, next_date_resolution, lineage_id, release_id
     ) VALUES ('ns', ?, 'albania', ?, ?, ?, 'current', 'active', 'unknown', 'lineage-al', 'rel-al')`,
  ).run(args.officeId, args.geographyId, args.officeName, args.officeType);
  db.prepare(
    `INSERT INTO office_tier_classification (
       id_namespace, office_id, tier, review_status, rationale, lineage_id, release_id,
       classification_path, classification_kind, classification_sha256
     ) VALUES ('ns', ?, 'municipal', 'needs_review', 'fixture', 'lineage-al', 'rel-al', 'schemas/atlas/tiers/fixture.json', 'tier_classification', ?)`,
  ).run(args.officeId, SHA);
  db.prepare(
    `INSERT INTO election_event (
       id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind,
       selected_history_role, ballot_basis, share_unit, legal_outcome, record_state, lineage_id, release_id
     ) VALUES ('ns', ?, ?, ?, ?, 'resolved', 'ordinary', 'selected', ?, 'percent_0_100', 'certified', 'active', 'lineage-al', 'rel-al')`,
  ).run(args.officeId, args.historyKey, args.eventId, args.dateId, args.ballotBasis);
}

function insertResult(
  db: DatabaseSync,
  args: {
    officeId: string;
    historyKey: string;
    resultId: string;
    label: string;
    elected: number | null;
    evidence?: string;
    votes?: number | null;
    share?: number | null;
  },
) {
  const votes = args.votes ?? null;
  const share = args.share ?? null;
  db.prepare(
    `INSERT INTO result_row (
       id_namespace, office_id, history_key, result_row_id, country_id, candidate_or_list_label,
       votes, votes_status, share, share_status, share_unit, seats_status, elected_flag,
       evidence_status, lineage_id, release_id
     ) VALUES ('ns', ?, ?, ?, 'albania', ?, ?, ?, ?, ?, 'percent_0_100', 'unknown', ?, ?, 'lineage-al', 'rel-al')`,
  ).run(
    args.officeId,
    args.historyKey,
    args.resultId,
    args.label,
    votes,
    votes == null ? "unknown" : "recorded",
    share,
    share == null ? "unknown" : "recorded",
    args.elected,
    args.evidence ?? "recorded",
  );
}

function approve(file: PeopleProposalFile, reviewedOn: string): PeopleProposalFile {
  return {
    ...file,
    review_status: "approved",
    reviewed_on: reviewedOn,
    persons: file.persons.map((person) => ({
      ...person,
      review_status: "approved",
      reviewed_on: reviewedOn,
      aliases: person.aliases.map((alias) => ({ ...alias, review_status: "approved" })),
    })),
  };
}

describe("person proposal rules", () => {
  it("keeps initials unmerged and does not join different surnames", () => {
    expect(isInitialsOnlyLabel("A. B.")).toBe(true);
    expect(isInitialsOnlyLabel("Ada One")).toBe(false);
    expect(isListLabel("municipal_council", "candidate_marks")).toBe(true);
    expect(isListLabel("mayor", "list_votes")).toBe(true);
    expect(isListLabel("mayor", "valid_votes")).toBe(false);
    expect(chooseCanonicalLabel(new Map([["ADA ONE", 1], ["Ada One", 1], ["Ada-One", 1]]))).toBe("Ada One");
    const slugs = assignPersonSlugs([
      { personId: "person:exampleland:ada-one", canonicalLabel: "Ada One", countryId: "exampleland" },
      { personId: "person:albania:ada-one", canonicalLabel: "Ada One", countryId: "albania" },
    ]);
    expect(slugs.get("person:albania:ada-one")).toBe("ada-one");
    expect(slugs.get("person:exampleland:ada-one")).toBe("ada-one-exampleland");
  });

  it("rejects an alias claimed by two persons and a cross-country alias without a manual row", () => {
    const file: PeopleProposalFile = {
      schema: "atlas-person-proposals/1",
      country_id: "albania",
      review_status: "draft_for_human_review",
      reviewed_on: null,
      eligible_row_count: 2,
      excluded_list_row_count: 0,
      withheld_row_count: 0,
      excluded_lists: [],
      persons: [
        {
          person_id: "person:albania:ada-one",
          canonical_label: "Ada One",
          country_id: "albania",
          review_status: "draft_for_human_review",
          created_from_release_id: null,
          reviewed_on: null,
          hold_reason: null,
          evidence: { offices: [], years: [], row_count: 1 },
          aliases: [
            {
              candidate_or_list_label: "Ada One",
              country_id: "albania",
              office_scope: "AL-M",
              review_status: "draft_for_human_review",
              evidence_note: "rows=1",
              manual_cross_country: false,
            },
          ],
        },
        {
          person_id: "person:albania:ada-one-2",
          canonical_label: "Ada One",
          country_id: "albania",
          review_status: "draft_for_human_review",
          created_from_release_id: null,
          reviewed_on: null,
          hold_reason: null,
          evidence: { offices: [], years: [], row_count: 1 },
          aliases: [
            {
              candidate_or_list_label: "Ada One",
              country_id: "albania",
              office_scope: "AL-M",
              review_status: "draft_for_human_review",
              evidence_note: "rows=1",
              manual_cross_country: false,
            },
          ],
        },
      ],
    };
    expect(() => validatePeopleProposal(file)).toThrow(PeopleProposalError);
    expect(() => validatePeopleProposal(file)).toThrow(/alias claimed by two persons/);

    const cross = structuredClone(file);
    cross.persons = [cross.persons[0]!];
    cross.persons[0]!.aliases[0]!.country_id = "exampleland";
    expect(() => validatePeopleProposal(cross)).toThrow(/manual row/);
    cross.persons[0]!.aliases[0]!.manual_cross_country = true;
    cross.persons[0]!.aliases[0]!.evidence_note = "reviewed against both country files";
    expect(() => validatePeopleProposal(cross)).not.toThrow();
  });
});

describe("person proposals from result rows", () => {
  const tempDirs: string[] = [];
  const previousSqlite = process.env.ATLAS_SQLITE_PATH;
  const previousPeople = process.env.ATLAS_PEOPLE_DIR;

  beforeEach(() => {
    delete process.env.ATLAS_PEOPLE_DIR;
  });

  afterEach(() => {
    if (previousSqlite === undefined) delete process.env.ATLAS_SQLITE_PATH;
    else process.env.ATLAS_SQLITE_PATH = previousSqlite;
    if (previousPeople === undefined) delete process.env.ATLAS_PEOPLE_DIR;
    else process.env.ATLAS_PEOPLE_DIR = previousPeople;
    for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function seeded(): { sqlitePath: string; peopleDir: string } {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-people-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const peopleDir = path.join(dir, "people");
    migrateMasterDatabase(repoRoot, sqlitePath);
    const db = openAtlasDatabase(sqlitePath);
    try {
      db.exec("BEGIN IMMEDIATE;");
      insertCountry(db, "albania", "AL", "Albania", "europe", "lineage-al", "rel-al");
      insertCountry(db, "exampleland", "XL", "Example Land", "americas", "lineage-xl", "rel-xl");
      insertOffice(db, {
        officeId: "AL-M",
        officeName: "Mayor of Place",
        officeType: "mayor",
        geographyId: "geo-place",
        geographyName: "Place",
        ballotBasis: "valid_votes",
        historyKey: "h2015",
        eventId: "e2015",
        dateId: "d2015",
        year: 2015,
        month: 6,
        day: 21,
      });
      insertResult(db, { officeId: "AL-M", historyKey: "h2015", resultId: "r-ada-2015", label: "Ada One", elected: 1, votes: 100, share: 55 });
      insertResult(db, { officeId: "AL-M", historyKey: "h2015", resultId: "r-ada-upper", label: "ADA ONE", elected: 0 });
      insertResult(db, { officeId: "AL-M", historyKey: "h2015", resultId: "r-bea-2015", label: "Bea Two", elected: 0, votes: 80, share: 45 });
      insertResult(db, {
        officeId: "AL-M",
        historyKey: "h2015",
        resultId: "r-hidden",
        label: "Hidden Person",
        elected: 0,
        evidence: "disputed",
      });
      db.prepare(
        `INSERT INTO research_date (date_id, label, precision, certainty, year, month, day, lineage_id, release_id)
         VALUES ('d2019', 'd2019', 'day', 'called', 2019, 6, 30, 'lineage-al', 'rel-al')`,
      ).run();
      db.prepare(
        `INSERT INTO election_event (
           id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind,
           selected_history_role, ballot_basis, share_unit, legal_outcome, record_state, lineage_id, release_id
         ) VALUES ('ns', 'AL-M', 'h2019', 'e2019', 'd2019', 'resolved', 'ordinary', 'selected', 'valid_votes', 'percent_0_100', 'certified', 'active', 'lineage-al', 'rel-al')`,
      ).run();
      insertResult(db, { officeId: "AL-M", historyKey: "h2019", resultId: "r-ada-hyphen", label: "Ada-One", elected: 0 });
      insertResult(db, { officeId: "AL-M", historyKey: "h2019", resultId: "r-initials", label: "A. B.", elected: 0 });
      db.prepare(
        `INSERT INTO research_date (date_id, label, precision, certainty, year, month, day, lineage_id, release_id)
         VALUES ('d2023', 'd2023', 'day', 'called', 2023, 5, 14, 'lineage-al', 'rel-al')`,
      ).run();
      db.prepare(
        `INSERT INTO election_event (
           id_namespace, office_id, history_key, event_id, date_id, date_resolution, event_kind,
           selected_history_role, ballot_basis, share_unit, legal_outcome, record_state, lineage_id, release_id
         ) VALUES ('ns', 'AL-M', 'h2023', 'e2023', 'd2023', 'resolved', 'ordinary', 'selected', 'valid_votes', 'percent_0_100', 'certified', 'active', 'lineage-al', 'rel-al')`,
      ).run();
      insertResult(db, { officeId: "AL-M", historyKey: "h2023", resultId: "r-ada-2023", label: "Ada One", elected: 1, votes: 120, share: 60 });
      insertResult(db, { officeId: "AL-M", historyKey: "h2023", resultId: "r-ada-two", label: "Ada Two", elected: 0, votes: 80, share: 40 });
      insertResult(db, { officeId: "AL-M", historyKey: "h2023", resultId: "r-dotted", label: "Ada One.", elected: 0 });
      insertOffice(db, {
        officeId: "AL-C",
        officeName: "Council of Place",
        officeType: "municipal_council",
        geographyId: "geo-place",
        geographyName: "Place",
        ballotBasis: "list_votes",
        historyKey: "h-council",
        eventId: "e-council",
        dateId: "d-council",
        year: 2019,
        month: 6,
        day: 30,
      });
      insertResult(db, { officeId: "AL-C", historyKey: "h-council", resultId: "r-list", label: "Party List", elected: null });
      insertOffice(db, {
        officeId: "AL-SLATE",
        officeName: "Mayor slate",
        officeType: "mayor",
        geographyId: "geo-slate",
        geographyName: "Slate Place",
        ballotBasis: "list_votes",
        historyKey: "h-slate",
        eventId: "e-slate",
        dateId: "d-slate",
        year: 2019,
        month: 6,
        day: 30,
      });
      insertResult(db, { officeId: "AL-SLATE", historyKey: "h-slate", resultId: "r-slate", label: "Slate Name", elected: 1 });
      db.exec("COMMIT;");
    } finally {
      db.close();
    }
    return { sqlitePath, peopleDir };
  }

  it("clusters the Albania-shaped fixture without making list rows into persons", () => {
    const { sqlitePath } = seeded();
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const first = proposePeopleForCountry(db, "albania");
      const second = proposePeopleForCountry(db, "albania");
      expect(serializePeopleProposal(first)).toBe(serializePeopleProposal(second));
      expect(first.review_status).toBe("draft_for_human_review");
      expect(first.persons.every((person) => person.review_status === "draft_for_human_review")).toBe(true);
      expect(first.persons.every((person) => person.aliases.every((alias) => alias.manual_cross_country === false))).toBe(true);

      const labels = first.persons.flatMap((person) => person.aliases.map((alias) => alias.candidate_or_list_label));
      expect(labels).toContain("Ada One");
      expect(labels).toContain("Ada-One");
      expect(labels).toContain("ADA ONE");
      expect(labels).not.toContain("Party List");
      expect(labels).not.toContain("Slate Name");
      expect(labels).not.toContain("Hidden Person");
      expect(first.excluded_lists.map((row) => row.candidate_or_list_label).sort()).toEqual(["Party List", "Slate Name"]);

      const ada = first.persons.find((person) => person.aliases.some((alias) => alias.candidate_or_list_label === "Ada One"));
      const bea = first.persons.find((person) => person.canonical_label === "Bea Two");
      const initials = first.persons.find((person) => person.canonical_label === "A. B.");
      expect(ada?.person_id).toBe("person:albania:ada-one");
      expect(ada?.canonical_label).toBe("Ada One");
      expect(ada?.person_id).not.toBe(bea?.person_id);
      expect(ada?.aliases.map((alias) => alias.candidate_or_list_label).sort()).toEqual([
        "ADA ONE",
        "Ada One",
        "Ada One.",
        "Ada-One",
      ]);
      expect(ada?.evidence.years).toEqual([2015, 2019, 2023]);
      expect(ada?.evidence.offices.map((office) => office.office_id)).toEqual(["AL-M"]);
      expect(ada?.evidence.row_count).toBe(5);
      expect(ada?.hold_reason).toBeNull();
      expect(initials?.hold_reason).toMatch(/initials-only/);
      expect(initials?.person_id).not.toBe(ada?.person_id);
      expect(bea?.aliases.map((alias) => alias.candidate_or_list_label)).toEqual(["Bea Two"]);
    } finally {
      db.close();
    }
  });

  it("does not import drafts, and a person page shows only approved-alias rows", async () => {
    const { sqlitePath, peopleDir } = seeded();
    process.env.ATLAS_SQLITE_PATH = sqlitePath;
    process.env.ATLAS_PEOPLE_DIR = peopleDir;
    const db = openAtlasDatabase(sqlitePath);
    let proposal: PeopleProposalFile;
    try {
      proposal = proposePeopleForCountry(db, "albania");
    } finally {
      db.close();
    }
    mkdirSync(peopleDir, { recursive: true });
    writeFileSync(path.join(peopleDir, "albania.json"), serializePeopleProposal(proposal));
    const draftDb = openAtlasDatabase(sqlitePath);
    try {
      deriveAtlas(draftDb);
      expect(draftDb.prepare("SELECT COUNT(*) AS n FROM person").get()).toMatchObject({ n: 0 });
      expect(draftDb.prepare("SELECT COUNT(*) AS n FROM person_alias").get()).toMatchObject({ n: 0 });
    } finally {
      draftDb.close();
    }
    expect(() => assertApprovedForLoad(proposal)).toThrow(/refusing to load draft/);

    const approved: PeopleProposalFile = {
      ...approve(proposal, "2026-09-28"),
      persons: approve(proposal, "2026-09-28").persons.filter((person) => person.person_id === "person:albania:ada-one"),
    };
    approved.persons[0]!.aliases = approved.persons[0]!.aliases.filter(
      (alias) => alias.candidate_or_list_label === "Ada One" || alias.candidate_or_list_label === "Ada-One",
    );
    writeFileSync(path.join(peopleDir, "albania.json"), serializePeopleProposal(approved));

    const loaded = openAtlasDatabase(sqlitePath);
    try {
      const stats = deriveAtlas(loaded);
      expect(stats.persons).toBe(1);
      expect(stats.personAliases).toBe(2);
      expect(loaded.prepare("SELECT canonical_label, review_status FROM person").all()).toEqual([
        { canonical_label: "Ada One", review_status: "approved" },
      ]);
      expect(
        loaded
          .prepare("SELECT candidate_or_list_label FROM person_alias ORDER BY candidate_or_list_label")
          .all()
          .map((row) => row.candidate_or_list_label),
      ).toEqual(["Ada One", "Ada-One"]);
      loaded.prepare(
        `INSERT INTO person_alias (
           person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
         ) VALUES ('person:albania:ada-one', 'albania', 'Ada One.', 'AL-M', 'draft_for_human_review', 'draft alias', 0)`,
      ).run();
    } finally {
      loaded.close();
    }

    const model = readPersonPage("ada-one", sqlitePath);
    expect(model?.inOffice).toBe(true);
    expect(model?.history.map((row) => row.label)).toEqual(["Ada One", "Ada-One", "Ada One"]);
    expect(model?.history.some((row) => row.label === "Ada Two" || row.label === "Ada One." || row.label === "Party List")).toBe(false);
    expect(model?.alsoRecordedAs).toEqual(["Ada-One"]);
    expect(model?.reviewedOn).toBe("2026-09-28");
    expect(model?.sourceLabelCount).toBe(2);
    expect(model?.officesHeld.map((entry) => entry.officeName)).toContain("Mayor of Place");
    expect(model?.splitHref).toContain("person%3Aalbania%3Aada-one");
    expect(model?.splitHref).toContain("These+are+two+different+people");

    const page = markup(await AtlasPersonPage({ params: Promise.resolve({ personSlug: "ada-one" }) }));
    expect(page).toContain('data-in-office="yes"');
    expect(page).toContain("In office");
    expect(page).toContain("Also recorded as Ada-One");
    expect(page).toContain("Merged from 2 source labels · reviewed 2026-09-28");
    expect(page).toContain("Electoral history");
    expect(page).toContain("Share by race");
    expect(page).toContain("Offices held");
    expect(page).toContain("These are two different people");
    expect(page).toContain("120");
    expect(page).toContain("60%");
    expect(page).not.toContain("Ada Two");
    expect(page).not.toContain("Ada One.");
    expect(page).not.toContain("Party List");
    expect(page).not.toContain("Bea Two");
    expect(outsideRecordDetails(page)).not.toMatch(/lineage|namespace|Prompt B/);
    expect(page).not.toMatch(/#[0-9a-fA-F]{3,8}/);

    const notInOffice = openAtlasDatabase(sqlitePath);
    try {
      notInOffice
        .prepare("UPDATE derived_seat_status SET current_holder_label = ? WHERE office_id = 'AL-M'")
        .run("Someone Else");
    } finally {
      notInOffice.close();
    }
    expect(readPersonPage("ada-one", sqlitePath)?.inOffice).toBe(false);

    const hits = search({ mode: "person", q: "Ada", limit: 10 }, sqlitePath);
    expect(hits[0]?.title).toBe("Ada One");
    expect(hits[0]?.href).toBe("/atlas/people/ada-one");
    const unreviewed = hits.filter((hit) => hit.disambiguation.includes("unreviewed label"));
    expect(unreviewed.some((hit) => hit.title === "Ada Two")).toBe(true);
    expect(hits.findIndex((hit) => hit.title === "Ada One" && hit.href.startsWith("/atlas/people/"))).toBeLessThan(
      hits.findIndex((hit) => hit.title === "Ada Two"),
    );
    expect(search({ mode: "person", q: "Ada", country: "exampleland", limit: 10 }, sqlitePath)).toEqual([]);

    const searchPage = markup(await AtlasSearchPage({ searchParams: Promise.resolve({ mode: "person", q: "Ada" }) }));
    expect(searchPage).toContain("Person");
    expect(searchPage).toContain("unreviewed label");
    expect(searchPage).toContain("/atlas/people/ada-one");
  });

  it("refuses a second approved person for the same label, including a cross-country alias without the manual flag", () => {
    const { sqlitePath } = seeded();
    const db = openAtlasDatabase(sqlitePath);
    try {
      db.exec("BEGIN IMMEDIATE;");
      db.prepare(
        `INSERT INTO person (person_id, canonical_label, country_id, review_status, created_from_release_id, reviewed_on)
         VALUES ('person:albania:ada-one', 'Ada One', 'albania', 'approved', 'rel-al', '2026-09-28')`,
      ).run();
      db.prepare(
        `INSERT INTO person (person_id, canonical_label, country_id, review_status, created_from_release_id, reviewed_on)
         VALUES ('person:albania:other', 'Other', 'albania', 'approved', 'rel-al', '2026-09-28')`,
      ).run();
      db.prepare(
        `INSERT INTO person_alias (
           person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
         ) VALUES ('person:albania:ada-one', 'albania', 'Ada One', 'AL-M', 'approved', 'rows=1', 0)`,
      ).run();
      expect(() =>
        db.prepare(
          `INSERT INTO person_alias (
             person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
           ) VALUES ('person:albania:other', 'albania', 'Ada One', 'AL-M', 'approved', 'rows=1', 0)`,
        ).run(),
      ).toThrow(/UNIQUE/);
      expect(() =>
        db.prepare(
          `INSERT INTO person_alias (
             person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
           ) VALUES ('person:albania:ada-one', 'exampleland', 'Ada One', 'AL-M', 'approved', '', 0)`,
        ).run(),
      ).toThrow(/manual row/);
      db.prepare(
        `INSERT INTO person_alias (
           person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
         ) VALUES ('person:albania:ada-one', 'exampleland', 'Ada Abroad', 'AL-M', 'approved', 'manual review of both files', 1)`,
      ).run();
      db.exec("ROLLBACK;");
    } finally {
      db.close();
    }
  });
});

describe("Albania fixture person proposals", () => {
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

  it("is deterministic and stays draft_for_human_review", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "atlas-people-al-"));
    tempDirs.push(dir);
    const sqlitePath = path.join(dir, "atlas.sqlite");
    const attemptsPath = path.join(dir, "atlas-attempts.sqlite");
    importAlbania({ root: repoRoot, sqlitePath, attemptsPath, operator: "people-test" });
    const db = openAtlasDatabase(sqlitePath, { readOnly: true });
    try {
      const first = proposePeopleForCountry(db, "albania");
      const second = proposePeopleForCountry(db, "albania");
      expect(serializePeopleProposal(first)).toBe(serializePeopleProposal(second));
      expect(first.review_status).toBe("draft_for_human_review");
      expect(first.persons.every((person) => person.review_status === "draft_for_human_review")).toBe(true);
      expect(first.persons.every((person) => person.country_id === "albania")).toBe(true);
      expect(first.excluded_lists.every((row) => row.reason === "list_label")).toBe(true);
      const loaded = openAtlasDatabase(sqlitePath);
      try {
        const peopleDir = path.join(dir, "people");
        mkdirSync(peopleDir, { recursive: true });
        writeFileSync(path.join(peopleDir, "albania.json"), serializePeopleProposal(first));
        process.env.ATLAS_PEOPLE_DIR = peopleDir;
        const counts = loadApprovedPeople(loaded, peopleDir);
        expect(counts.persons).toBe(0);
        expect(counts.skippedDrafts).toBe(1);
        expect(loaded.prepare("SELECT COUNT(*) AS n FROM person").get()).toMatchObject({ n: 0 });
      } finally {
        delete process.env.ATLAS_PEOPLE_DIR;
        loaded.close();
      }
    } finally {
      db.close();
    }
  });
});
