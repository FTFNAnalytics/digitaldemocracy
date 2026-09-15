import { describe, expect, it } from "vitest";
import {
  dateValue,
  legalOutcome,
  normalizeCountry,
  numberValue,
} from "../../scripts/import/normalize";
import { cleanBriefing, csvRows } from "../../scripts/import/release";
import { syntheticFixtureDataset } from "../../data/normalized/synthetic-fixture-v0";
import { paginate } from "../../components/observatory/pagination";
const release = syntheticFixtureDataset.release;
describe("source semantics", () => {
  it("preserves partial dates and rejects invalid days", () => {
    expect(dateValue("March 2028")).toMatchObject({
      precision: "month",
      month: 3,
      year: 2028,
    });
    expect(dateValue("March 2028").day).toBeUndefined();
    expect(dateValue("2027-02-30").precision).toBe("unknown");
    expect(
      dateValue("21 February 2027; conditional CEP calendar", "conditional"),
    ).toMatchObject({ day: 21, month: 2, certainty: "conditional" });
  });
  it("does not promote statistical evidence to legal certification", () => {
    expect(legalOutcome({ coverage: "Complete statistical returns" })).toBe(
      "unknown",
    );
    expect(legalOutcome({ event_validity: "Annulled election" })).toBe(
      "annulled",
    );
    expect(legalOutcome({ event_validity: "Final proclaimed election" })).toBe(
      "certified",
    );
  });
  it("distinguishes missing values and recorded zeros", () => {
    expect(numberValue(null)).toEqual({ status: "unknown", value: null });
    expect(numberValue(0)).toEqual({ status: "zero", value: 0 });
  });
  it("keeps score gates, stable history keys and mirrored issues", () => {
    const issue = {
      id: "O",
      issue: "Missing returns",
      detail: "Need primary return",
    };
    const raw = {
      country: "Ecuador",
      coverage: {},
      sources: [{ id: "S", url: "https://example.org" }],
      offices: [
        {
          id: "O",
          current: true,
          date: "March 2028",
          name: "Example",
          office: "Mayor",
          tier: "Municipal",
          selected_keys: ["H"],
          all_keys: ["H"],
          score_gate: false,
          comparison_ci: 80,
          gaps: [1, 2, 3],
          sources: ["S"],
        },
      ],
      histories: [
        {
          _key: "H",
          jurisdiction_id: "O",
          year: 2023,
          source_id: "S",
          parties: [{ party: "A", votes: 0, share: 0, seats: null }],
        },
      ],
      rosters: [],
      issues: [issue, issue],
    };
    const d = normalizeCountry(raw, release);
    expect(d.metrics[0]).toMatchObject({
      scoreGate: false,
      reviewStatus: "provisional",
    });
    expect(d.events[1].historyKey).toBe("H");
    expect(d.events[1].legalOutcome).toBe("unknown");
    expect(d.events[1].resultRows[0].seats.value).toBeNull();
    expect(d.issues).toHaveLength(1);
    expect(d.sources[0].id).toBe("ecuador--S");
  });
  it("sanitizes scripts and unsafe links while rewriting office links", () => {
    const html = cleanBriefing(
      '<script>alert(1)</script><p onclick="x()">Text</p><a href="../Chile/abc.html">Office</a><a href="javascript:x()">bad</a>',
      new Map([["abc.html", "CL-1"]]),
    );
    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).toContain("/electiondatabase/offices/CL-1");
  });
  it("handles quoted CSV fields and bounds pagination", () => {
    expect(csvRows('\ufeffid,note\n1,"A, B"\n')).toEqual([
      { id: "1", note: "A, B" },
    ]);
    expect(paginate([1, 2, 3], { page: "999" }, "page", 2).items).toEqual([3]);
    expect(paginate([1, 2, 3], { page: "NaN" }).page).toBe(1);
  });
});
