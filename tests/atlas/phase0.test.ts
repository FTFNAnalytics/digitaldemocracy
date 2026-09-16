import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { unpackArmeniaPayload } from "../../lib/observatory/adapters/armenia";
import { zipTable, type WorkbookTable } from "../../lib/observatory/adapters/tables";

const repoRoot = path.join(import.meta.dirname, "../..");

type Classification = {
  office_id: string;
  tier: string;
  schema_v1_tier: string;
  jurisdiction: string;
  rationale: string;
  confidence: string;
  human_review_required?: boolean;
  human_review?: { queue?: string; prompt_token?: string };
};

type TierFile = {
  status: string;
  country_slug: string;
  source_register: { path: string; sha256: string; package_dir?: string };
  classification_vocabulary: string[];
  schema_compatibility: Record<string, string>;
  rules: unknown[];
  counts_by_proposed_tier: Record<string, number>;
  classifications: Classification[];
};

function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(repoRoot, relative), "utf8")) as T;
}

function sha256(relative: string): string {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relative)))
    .digest("hex");
}

function registerIdsFromTable(relative: string): string[] {
  const table = readJson<WorkbookTable>(relative);
  return zipTable(table).map((row) => String(row["Office ID"]));
}

function armeniaRegisterIds(): { ids: string[]; registerSha256: string } {
  const files = unpackArmeniaPayload(path.join(repoRoot, "data/countries/armenia"));
  const bytes = files.get("tables/master/office-register.json");
  expect(bytes).toBeTruthy();
  const table = JSON.parse(bytes!.toString("utf8")) as WorkbookTable;
  return {
    ids: zipTable(table).map((row) => String(row["Office ID"])),
    registerSha256: createHash("sha256").update(bytes!).digest("hex"),
  };
}

function expectExactIds(file: TierFile, expected: string[]) {
  const got = file.classifications.map((row) => row.office_id);
  expect(got).toEqual(expected);
  expect(new Set(got).size).toBe(expected.length);
}

describe("Phase 0 tier-classification drafts", () => {
  const albania = readJson<TierFile>("schemas/atlas/tiers/albania.json");
  const andorra = readJson<TierFile>("schemas/atlas/tiers/andorra.json");
  const alderney = readJson<TierFile>("schemas/atlas/tiers/alderney.json");
  const armenia = readJson<TierFile>("schemas/atlas/tiers/armenia.json");
  const files = { albania, andorra, alderney, armenia };

  it("maps national to national_context and keeps Europe regional at zero", () => {
    for (const [slug, file] of Object.entries(files)) {
      expect(file.country_slug).toBe(slug);
      expect(file.classification_vocabulary).toEqual([
        "national",
        "regional",
        "municipal",
        "council",
        "other",
      ]);
      expect(file.schema_compatibility).toMatchObject({ national: "national_context" });
      expect(file.rules.length).toBeGreaterThan(0);
      expect(file.counts_by_proposed_tier.regional).toBe(0);
    }
    expect(albania.status).toBe("approved");
    expect(andorra.status).toBe("draft_for_human_review");
    expect(armenia.status).toBe("draft_for_human_review");
    expect(alderney.status).toBe("approved");
  });

  it("matches each source register office_id set exactly", () => {
    expectExactIds(albania, registerIdsFromTable("data/countries/albania/tables/office-register.json"));
    expect(albania.classifications).toHaveLength(122);
    expect(albania.counts_by_proposed_tier.municipal).toBe(122);
    expect(albania.source_register.sha256).toBe(
      sha256("data/countries/albania/tables/office-register.json"),
    );
    expect(albania.classifications.every((row) => row.tier === "municipal" && row.schema_v1_tier === "municipal")).toBe(
      true,
    );
    expect(albania.classifications.filter((row) => row.office_id.endsWith("-M"))).toHaveLength(61);
    expect(albania.classifications.filter((row) => row.office_id.endsWith("-C"))).toHaveLength(61);

    expectExactIds(andorra, registerIdsFromTable("data/countries/andorra/tables/office-register.json"));
    expect(andorra.classifications).toHaveLength(7);
    expect(andorra.counts_by_proposed_tier.municipal).toBe(7);
    expect(andorra.source_register.sha256).toBe(
      sha256("data/countries/andorra/tables/office-register.json"),
    );

    expectExactIds(alderney, registerIdsFromTable("data/countries/alderney/tables/office-register.json"));
    expect(alderney.classifications).toHaveLength(2);
    expect(alderney.counts_by_proposed_tier.other).toBe(2);
    expect(alderney.source_register.sha256).toBe(
      sha256("data/countries/alderney/tables/office-register.json"),
    );

    const packed = armeniaRegisterIds();
    expectExactIds(armenia, packed.ids);
    expect(armenia.classifications).toHaveLength(71);
    expect(armenia.counts_by_proposed_tier.municipal).toBe(71);
    expect(armenia.source_register.sha256).toBe(packed.registerSha256);
    expect(armenia.classifications.some((row) => row.office_id === "AM-VEDI")).toBe(false);
  });

  it("does not classify from calendar Regional / municipal labels", () => {
    const blob = JSON.stringify({ albania, andorra });
    expect(blob).not.toMatch(/"tier": "regional"/);
    expect(albania.rules[0]).toEqual(
      expect.objectContaining({
        statement: expect.stringMatching(/Ignore calendar/i),
      }),
    );
  });

  it("keeps approved Albania municipal without blocking review flags", () => {
    const approved = albania as TierFile & {
      approval?: { by?: string; date?: string; notes?: string };
    };
    expect(approved.status).toBe("approved");
    expect(approved.approval).toMatchObject({ by: "product_owner", date: "2026-09-16" });
    expect(approved.approval?.notes).toMatch(/Justin approved/i);
    expect(approved.approval?.notes).toMatch(/regional count is 0/i);
    expect(albania.classifications).toHaveLength(122);
    expect(albania.counts_by_proposed_tier.municipal).toBe(122);
    expect(albania.counts_by_proposed_tier.regional).toBe(0);
    expect(albania.source_register.sha256).toBe(
      "7d5a3735e83f95ee82deb76c60c6d391fa5faadfd3f660fe71ca8ca0ca05ad62",
    );
    for (const row of albania.classifications) {
      expect(row.tier).toBe("municipal");
      expect(row.schema_v1_tier).toBe("municipal");
      expect(row.human_review_required).not.toBe(true);
      expect(row.human_review).toBeUndefined();
      expect(row).not.toHaveProperty("tier_uncertain");
    }
  });

  it("keeps approved Alderney other without human-review flags", () => {
    const approved = alderney as TierFile & {
      approval?: { by?: string; date?: string };
    };
    expect(approved.status).toBe("approved");
    expect(approved.approval).toMatchObject({ by: "product_owner", date: "2026-09-16" });
    for (const row of alderney.classifications) {
      expect(row.tier).toBe("other");
      expect(row.schema_v1_tier).toBe("other");
      expect(row.human_review_required).toBeUndefined();
      expect(row.human_review).toBeUndefined();
      expect(row).not.toHaveProperty("tier_uncertain");
      expect(row.rationale).toMatch(/seat/i);
      expect(row.rationale).not.toMatch(/not final/i);
    }
    expect(alderney.classifications.map((row) => row.office_id).sort()).toEqual([
      "GG-ALD-PLEB",
      "GG-ALD-STATES",
    ]);
  });

  it("keeps Armenia municipal while flagging boundary/calendar offices", () => {
    const flagged = ["AM-ARARAT-C", "AM-MASIS-C", "AM-PAMBAK-C", "AM-VANADZOR-C", "AM-VEDI-C"];
    for (const row of armenia.classifications) {
      expect(row.tier).toBe("municipal");
      expect(row.schema_v1_tier).toBe("municipal");
      if (flagged.includes(row.office_id)) {
        expect(row.human_review_required).toBe(true);
        expect(row.human_review?.queue).toBe("boundary_calendar");
      } else {
        expect(row.human_review_required).toBe(false);
      }
    }
    const vedi = armenia.classifications.find((row) => row.office_id === "AM-VEDI-C");
    expect(vedi?.human_review?.prompt_token).toBe("AM-VEDI");
  });
});

describe("Phase 0 inventory artifacts", () => {
  it("records four Europe packages, zero regional, and register checksums", () => {
    const inventory = readJson<{
      status: string;
      scope: { europe_package_count: number; regional_offices: number };
      europe_totals: { offices: number; regional_offices: number };
      packages: Array<{
        slug: string;
        adapter_kind: string;
        office_count: number;
        checksums: Record<string, { path?: string; sha256?: string }>;
      }>;
    }>("docs/phase0/inventory.json");
    expect(inventory.status).toBe("draft_for_human_review");
    expect(inventory.scope.europe_package_count).toBe(4);
    expect(inventory.scope.regional_offices).toBe(0);
    expect(inventory.europe_totals.offices).toBe(202);
    expect(inventory.europe_totals.regional_offices).toBe(0);
    expect(inventory.packages.map((row) => row.slug)).toEqual([
      "albania",
      "andorra",
      "alderney",
      "armenia",
      "new-zealand",
    ]);
    expect(inventory.packages.find((row) => row.slug === "albania")?.adapter_kind).toBe(
      "europe-country-extract/1",
    );
    expect(inventory.packages.find((row) => row.slug === "armenia")?.adapter_kind).toBe(
      "armenia-packed-europe/1",
    );
    const albaniaRegister = inventory.packages.find((row) => row.slug === "albania")?.checksums[
      "tables/office-register.json"
    ];
    expect(albaniaRegister?.sha256).toBe(sha256("data/countries/albania/tables/office-register.json"));
  });

  it("recomputes LatAm lineage totals and NZ office count from committed files", () => {
    const continuity = readJson<{
      latin_america: {
        lineage_id: string;
        totals: { match: boolean; recomputed_from_country_and_briefing_shards: Record<string, number> };
      };
      new_zealand: { office_count: number; verification: string; offices: Array<{ office_id: string }> };
    }>("docs/phase0/continuity-counts.json");
    expect(continuity.latin_america.lineage_id).toBe("latin-america-fe5e91689def");
    expect(continuity.latin_america.totals.match).toBe(true);
    expect(continuity.latin_america.totals.recomputed_from_country_and_briefing_shards).toMatchObject({
      currentOffices: 18229,
      historicalOffices: 414,
      histories: 40509,
      resultRows: 269740,
      briefings: 18643,
    });
    expect(continuity.new_zealand.office_count).toBe(4);
    expect(continuity.new_zealand.verification).toBe("recomputed_from_dataset.json_races");
    expect(continuity.new_zealand.offices.map((row) => row.office_id)).toEqual([
      "NZ-BULLER-WESTPORT-2026",
      "NZ-CLUTHA-LAWRENCE-TUAPEKA-2026",
      "NZ-PORIRUA-ONEPOTO-2026",
      "NZ-WELLINGTON-TAKAPU-NORTHERN-2026",
    ]);
  });

  it("resolves Albania and Alderney tier_mapping and keeps Armenia boundary/calendar flags", () => {
    const review = readJson<{
      items: Array<{
        queue: string;
        office_id: string;
        prompt_token?: string;
        proposed_tier: string;
        country_slug?: string;
      }>;
      resolved: Array<{
        queue: string;
        office_id?: string;
        country_slug?: string;
        proposed_tier: string;
        status: string;
        resolved_at: string;
        office_count?: number;
      }>;
    }>("docs/phase0/human-review.json");
    expect(review.items.filter((row) => row.queue === "tier_mapping")).toEqual([]);
    const albania = review.resolved.filter((row) => row.country_slug === "albania");
    expect(albania).toHaveLength(1);
    expect(albania[0]).toMatchObject({
      queue: "tier_mapping",
      proposed_tier: "municipal",
      office_count: 122,
      status: "resolved",
      resolved_at: "2026-09-16",
    });
    const alderney = review.resolved.filter((row) => row.country_slug === "alderney");
    expect(alderney.map((row) => row.office_id).sort()).toEqual(["GG-ALD-PLEB", "GG-ALD-STATES"]);
    expect(alderney.every((row) => row.proposed_tier === "other" && row.status === "resolved")).toBe(
      true,
    );
    expect(alderney.every((row) => row.resolved_at === "2026-09-16")).toBe(true);
    const armenia = review.items.filter((row) => row.queue === "boundary_calendar");
    expect(armenia.map((row) => row.office_id)).toEqual([
      "AM-ARARAT-C",
      "AM-MASIS-C",
      "AM-PAMBAK-C",
      "AM-VANADZOR-C",
      "AM-VEDI-C",
    ]);
    expect(armenia.every((row) => row.proposed_tier === "municipal")).toBe(true);
    expect(armenia.find((row) => row.office_id === "AM-VEDI-C")?.prompt_token).toBe("AM-VEDI");
  });
});
