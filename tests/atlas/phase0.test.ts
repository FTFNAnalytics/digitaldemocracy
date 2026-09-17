import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
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
  tier_uncertain?: boolean;
  boundary_calendar_review?: {
    status?: string;
    human_review_required?: boolean;
    scope?: string;
    prior_phase0_review?: { queue?: string; prompt_token?: string };
  };
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

function austriaRegisterIds(): { ids: string[]; registerSha256: string; payloadSha256: string } {
  const script = `
import hashlib, io, json, lzma, tarfile, sys
from pathlib import Path
root = Path(sys.argv[1])
manifest = json.loads((root / "manifest.json").read_text())
raw = b"".join((root / name).read_bytes() for name in manifest["chunks"])
payload_sha256 = hashlib.sha256(raw).hexdigest()
assert payload_sha256 == manifest["payload_sha256"]
with tarfile.open(fileobj=io.BytesIO(lzma.decompress(raw)), mode="r:") as tar:
    member = tar.extractfile("tables/master/office-register.json")
    assert member is not None
    data = member.read()
table = json.loads(data)
office_col = table["columns"].index("Office ID")
ids = [row[office_col] for row in table["rows"]]
print(json.dumps({
    "ids": ids,
    "registerSha256": hashlib.sha256(data).hexdigest(),
    "payloadSha256": payload_sha256,
}))
`;
  const result = spawnSync(
    "python3",
    ["-c", script, path.join(repoRoot, "data/countries/austria")],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  expect(result.status).toBe(0);
  expect(result.stderr).toBe("");
  return JSON.parse(result.stdout) as {
    ids: string[];
    registerSha256: string;
    payloadSha256: string;
  };
}

function bosniaRegisterIds(): { ids: string[]; registerSha256: string; payloadSha256: string } {
  const script = `
import gzip, hashlib, io, json, tarfile, sys
from pathlib import Path
root = Path(sys.argv[1])
manifest = json.loads((root / "manifest.json").read_text())
raw = b"".join((root / name).read_bytes() for name in manifest["chunks"])
payload_sha256 = hashlib.sha256(raw).hexdigest()
assert payload_sha256 == manifest["payload_sha256"]
with tarfile.open(fileobj=io.BytesIO(gzip.decompress(raw)), mode="r:") as tar:
    member = tar.extractfile("tables/master/office-register.json")
    assert member is not None
    data = member.read()
table = json.loads(data)
office_col = table["columns"].index("Office ID")
ids = [row[office_col] for row in table["rows"]]
print(json.dumps({
    "ids": ids,
    "registerSha256": hashlib.sha256(data).hexdigest(),
    "payloadSha256": payload_sha256,
}))
`;
  const result = spawnSync(
    "python3",
    ["-c", script, path.join(repoRoot, "data/countries/bosnia-and-herzegovina")],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  expect(result.status).toBe(0);
  expect(result.stderr).toBe("");
  return JSON.parse(result.stdout) as {
    ids: string[];
    registerSha256: string;
    payloadSha256: string;
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
    expect(andorra.status).toBe("approved");
    expect(armenia.status).toBe("approved");
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

  it("keeps approved Armenia municipal with five open boundary/calendar reviews", () => {
    const approved = armenia as TierFile & {
      approval?: {
        authority?: string;
        date?: string;
        scope?: string;
        predecessor_sha256?: string;
      };
    };
    expect(approved.status).toBe("approved");
    expect(approved.approval).toMatchObject({
      authority: "Explicit user authorization in Prompt L",
      date: "2026-09-17",
      predecessor_sha256: "9b100ffab2b9f878914721711d4878567868bd5ac923b294af02ef15bbfaefe5",
    });
    expect(approved.approval?.scope).toMatch(/71 municipal/i);
    expect(approved.approval?.scope).toMatch(/0 regional/i);
    expect(sha256("schemas/atlas/tiers/armenia.json")).toBe(
      "2905af1a2a1465f32e457657f5a900c556757b7964f37c8c57adeb86d4a80b7a",
    );
    const flagged = ["AM-ARARAT-C", "AM-MASIS-C", "AM-PAMBAK-C", "AM-VANADZOR-C", "AM-VEDI-C"];
    for (const row of armenia.classifications) {
      expect(row.tier).toBe("municipal");
      expect(row.schema_v1_tier).toBe("municipal");
      expect(row.human_review_required).toBe(false);
      expect(row.human_review).toBeUndefined();
      expect(row.tier_uncertain).not.toBe(true);
      if (flagged.includes(row.office_id)) {
        expect(row.boundary_calendar_review?.status).toBe("open");
        expect(row.boundary_calendar_review?.human_review_required).toBe(true);
        expect(row.boundary_calendar_review?.scope).toBe("research_boundary_and_calendar_only");
        expect(row.boundary_calendar_review?.prior_phase0_review?.queue).toBe("boundary_calendar");
      } else {
        expect(row.boundary_calendar_review).toBeUndefined();
      }
    }
    const vedi = armenia.classifications.find((row) => row.office_id === "AM-VEDI-C");
    expect(vedi?.boundary_calendar_review?.prior_phase0_review?.prompt_token).toBe("AM-VEDI");
  });

  it("keeps approved Austria 2034 municipal / 4 regional with retained holds", () => {
    const austria = readJson<TierFile & {
      approval?: {
        by?: string;
        accepted_by?: string;
        date?: string;
        timezone?: string;
        notes?: string;
      };
      predecessor_draft_sha256?: string;
      notes?: Array<{ scope?: string; status?: string; office_ids?: string[] }>;
    }>("schemas/atlas/tiers/austria.json");
    expect(austria.status).toBe("approved");
    expect(austria.country_slug).toBe("austria");
    expect(austria.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-17",
      timezone: "America/Edmonton",
    });
    expect(austria.approval?.notes).toMatch(/2034 municipal \+ 4 regional/i);
    expect(austria.approval?.notes).toMatch(/AT-OOE-41119-M::2015::/);
    expect(austria.predecessor_draft_sha256).toBe(
      "9181e0af7f9dd0e3b2a92520de1cb990901c08b6f68afd165608eaf66282283d",
    );
    expect(sha256("schemas/atlas/tiers/austria.json")).toBe(
      "1c303f748b6fa706bea71d750b5e50be8ab27acc7baf166fe01e0b85e9da69eb",
    );
    expect(austria.classifications).toHaveLength(2038);
    expect(austria.counts_by_proposed_tier).toEqual({
      national: 0,
      regional: 4,
      municipal: 2034,
      council: 0,
      other: 0,
    });
    const regional = austria.classifications.filter((row) => row.tier === "regional");
    const municipal = austria.classifications.filter((row) => row.tier === "municipal");
    expect(regional.map((row) => row.office_id)).toEqual([
      "AT-KTN-A",
      "AT-NOE-A",
      "AU-ab9fc7cefb",
      "AU-9560299fb9",
    ]);
    expect(municipal).toHaveLength(2034);
    expect(new Set(austria.classifications.map((row) => row.office_id)).size).toBe(2038);
    expect(
      austria.classifications.every(
        (row) => row.tier === row.schema_v1_tier && (row.tier === "municipal" || row.tier === "regional"),
      ),
    ).toBe(true);
    expect(regional.every((row) => row.human_review_required === true)).toBe(true);
    expect(municipal.every((row) => row.human_review_required === false)).toBe(true);
    const hold = austria.notes?.find((note) => note.scope === "history_stage_binding_conflict");
    expect(hold).toMatchObject({
      status: "open",
      office_ids: ["AT-OOE-41119-M"],
    });
    expect(austria.notes?.every((note) => note.status === "open")).toBe(true);
    expect(austria.notes).toHaveLength(19);
    const packed = austriaRegisterIds();
    expectExactIds(austria, packed.ids);
    expect(austria.source_register.sha256).toBe(packed.registerSha256);
    expect(austria.source_register.sha256).toBe(
      "19e208d578151c01b669e13c3345d88a2cba591517a129f66a228b80b2cc1d68",
    );
    expect(packed.payloadSha256).toBe(
      "8a777132ffec2fff55e36d4bbfbb890b012fd98707132ace7e7c15ef344dc362",
    );
  });

  it("keeps approved Bosnia and Herzegovina all 13 regional with open research notes", () => {
    const bosnia = readJson<
      TierFile & {
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        notes?: Array<{ scope?: string; status?: string; office_ids?: string[] }>;
        source_register: { path: string; sha256: string; payload_sha256?: string };
      }
    >("schemas/atlas/tiers/bosnia-and-herzegovina.json");
    expect(bosnia.status).toBe("approved");
    expect(bosnia.country_slug).toBe("bosnia-and-herzegovina");
    expect(bosnia.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-17",
      timezone: "America/Edmonton",
    });
    expect(bosnia.approval?.notes).toMatch(/all 13 offices regional/i);
    expect(bosnia.approval?.notes).toMatch(/BA-G/);
    expect(bosnia.approval?.notes).toMatch(/2026-10-04/);
    expect(bosnia.predecessor_draft_sha256).toBe(
      "3d0be674f3d5b77b3a92362b82815d7bd3305473820e3279999fc82e5f3c51c1",
    );
    expect(sha256("schemas/atlas/tiers/bosnia-and-herzegovina.json")).toBe(
      "2ff154bf5c47e46c1a13385690466ee11e6b25f9ff5465384b5ce5570d429501",
    );
    expect(bosnia.classifications).toHaveLength(13);
    expect(bosnia.counts_by_proposed_tier).toEqual({
      national: 0,
      regional: 13,
      municipal: 0,
      council: 0,
      other: 0,
    });
    expect(bosnia.classifications.map((row) => row.office_id)).toEqual([
      "BA-205",
      "BA-210",
      "BA-206",
      "BA-F",
      "BA-207",
      "BA-202",
      "BA-R",
      "BA-G",
      "BA-209",
      "BA-203",
      "BA-201",
      "BA-208",
      "BA-204",
    ]);
    expect(
      bosnia.classifications.every(
        (row) => row.tier === "regional" && row.schema_v1_tier === "regional",
      ),
    ).toBe(true);
    const entity = ["BA-F", "BA-R", "BA-G"];
    const cantonal = [
      "BA-201",
      "BA-202",
      "BA-203",
      "BA-204",
      "BA-205",
      "BA-206",
      "BA-207",
      "BA-208",
      "BA-209",
      "BA-210",
    ];
    expect(
      bosnia.classifications
        .filter((row) => entity.includes(row.office_id))
        .every((row) => row.human_review_required === true),
    ).toBe(true);
    expect(
      bosnia.classifications
        .filter((row) => cantonal.includes(row.office_id))
        .every((row) => row.human_review_required === false),
    ).toBe(true);
    expect(bosnia.classifications.every((row) => row.tier_uncertain === false)).toBe(true);
    expect(bosnia.notes?.map((note) => note.scope)).toEqual([
      "presidential_event_reconciliation",
      "governing_coalition_history",
      "calendar_certainty",
      "not_supplied",
    ]);
    expect(bosnia.notes?.every((note) => note.status === "open")).toBe(true);
    expect(bosnia.notes?.find((note) => note.scope === "presidential_event_reconciliation")).toMatchObject({
      office_ids: ["BA-G"],
    });
    expect(bosnia.source_register.sha256).toBe(
      "504673d6437f951aa7cd1dda8aee03d8da23c30885c405aa67ef9df4597d86e4",
    );
    const packed = bosniaRegisterIds();
    expectExactIds(bosnia, packed.ids);
    expect(bosnia.source_register.sha256).toBe(packed.registerSha256);
    expect(bosnia.source_register.payload_sha256).toBe(packed.payloadSha256);
    expect(packed.payloadSha256).toBe(
      "5fb08d2c43f2fff0526c7aa3e95bbd00186aa6a401f409346dd3dbd11ce09c89",
    );
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
