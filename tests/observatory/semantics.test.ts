import { describe, expect, it } from "vitest";
import {
  assertNotCoercedToFirstOfMonth,
  formatResearchDate,
  researchDateSortKey,
} from "@/lib/observatory/dates";
import {
  competitionIndex,
  groupedPedersen,
  isClearedMetric,
  isMissing,
  isRecordedZero,
  numericSortKey,
  toPercent,
} from "@/lib/observatory/metrics";
import {
  parseExplorerFilters,
  serializeExplorerFilters,
} from "@/lib/observatory/filters";
import { syntheticFixtureDataset } from "@/data/normalized/synthetic-fixture-v0";
import { filterOffices, getCurrentOffices, getOffices } from "@/lib/observatory/load";

describe("competition index", () => {
  it("matches the documented weighted-gap formula", () => {
    expect(competitionIndex([4, 8, 12])).toBe(70);
  });

  it("does not treat a numeric score as cleared when score_gate is false", () => {
    expect(
      isClearedMetric({ reviewStatus: "provisional", scoreGate: false }),
    ).toBe(false);
  });
});

describe("pedersen", () => {
  it("computes a two-group interval", () => {
    expect(groupedPedersen([52, 48], [54, 46])).toBe(2);
  });
});

describe("shares and missing values", () => {
  it("converts proportion shares only by contract", () => {
    expect(toPercent(0.6, "proportion_0_1")).toBe(60);
    expect(toPercent(60, "percent_0_100")).toBe(60);
  });

  it("keeps recorded zero distinct from unknown", () => {
    expect(isRecordedZero({ status: "zero", value: 0 })).toBe(true);
    expect(isMissing({ status: "unknown", value: null })).toBe(true);
    expect(numericSortKey({ status: "unknown", value: null })).toBeGreaterThan(
      numericSortKey({ status: "zero", value: 0 }),
    );
  });
});

describe("research dates", () => {
  it("does not coerce March 2028 to 1 March 2028", () => {
    const date = {
      precision: "month" as const,
      certainty: "expected" as const,
      year: 2028,
      month: 3,
      label: "March 2028",
    };
    expect(formatResearchDate(date)).toBe("March 2028");
    expect(() => assertNotCoercedToFirstOfMonth(date)).not.toThrow();
    expect(researchDateSortKey(date) % 100).toBe(32);
  });
});

describe("explorer URL filters", () => {
  it("round-trips non-default filters", () => {
    const parsed = parseExplorerFilters({
      q: "governor",
      country: "FIX",
      tier: "regional",
    });
    const params = serializeExplorerFilters(parsed);
    expect(params.get("q")).toBe("governor");
    expect(params.get("country")).toBe("FIX");
    expect(params.get("tier")).toBe("regional");
  });

  it("defaults to current offices", () => {
    const parsed = parseExplorerFilters({});
    expect(parsed.officeStatus).toBe("current");
    const offices = filterOffices(parsed);
    expect(offices.every((office) => office.status === "current")).toBe(true);
    expect(offices.length).toBe(getCurrentOffices().length);
  });
});

describe("synthetic fixture dataset", () => {
  it("is labelled synthetic and incomplete", () => {
    expect(syntheticFixtureDataset.release.provenance.kind).toBe("synthetic_fixture");
    expect(syntheticFixtureDataset.release.researchCoverageComplete).toBe(false);
  });

  it("excludes historical offices from current totals", () => {
    const current = getOffices().filter((office) => office.status === "current");
    const historical = getOffices().filter((office) => office.status === "historical");
    expect(historical.length).toBeGreaterThan(0);
    expect(current).toHaveLength(
      syntheticFixtureDataset.release.validatedCounts.currentOffices,
    );
  });

  it("keeps an annulled event distinct from its replacement", () => {
    const annulled = syntheticFixtureDataset.events.find((event) => event.id === "FIX-P-1-2012-annulled");
    const replacement = syntheticFixtureDataset.events.find((event) => event.id === "FIX-P-1-2013-repeat");
    expect(annulled?.legalOutcome).toBe("annulled");
    expect(replacement?.legalOutcome).toBe("certified");
    expect(replacement?.kind).toBe("repeated");
  });

  it("does not let national approval support a local conclusion", () => {
    const national = syntheticFixtureDataset.polls.find((poll) => poll.id === "POLL-FIX-NAT-1");
    expect(national?.supportsLocalConclusion).toBe(false);
    expect(national?.officeId).toBeNull();
  });
});
