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
  office?: string;
  rationale: string;
  confidence: string;
  human_review_required?: boolean;
  human_review?: { queue?: string; prompt_token?: string };
  review_category?: string | null;
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

function packedXzRegisterIds(
  relativeDir: string,
): { ids: string[]; registerSha256: string; payloadSha256: string } {
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
    ["-c", script, path.join(repoRoot, relativeDir)],
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

function austriaRegisterIds(): { ids: string[]; registerSha256: string; payloadSha256: string } {
  return packedXzRegisterIds("data/countries/austria");
}

function bulgariaRegisterIds(): { ids: string[]; registerSha256: string; payloadSha256: string } {
  return packedXzRegisterIds("data/countries/bulgaria");
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

  it("keeps Bulgaria 530 municipality-wide accepted and 3067 submunicipal held", () => {
    const bulgaria = readJson<
      TierFile & {
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        counts_by_approval?: Record<string, number>;
        importer_policy?: {
          load?: string;
          approved_count?: number;
          held_count?: number;
          held_review_category?: string;
        };
        notes?: Array<{ scope?: string; status?: string; office_ids?: string[]; note?: string }>;
        source_register: { path: string; sha256: string; payload_sha256?: string };
      }
    >("schemas/atlas/tiers/bulgaria.json");
    expect(bulgaria.status).toBe("approved");
    expect(bulgaria.country_slug).toBe("bulgaria");
    expect(bulgaria.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(bulgaria.approval?.notes).toMatch(/530 municipality-wide/i);
    expect(bulgaria.approval?.notes).toMatch(/HOLD 3067/i);
    expect(bulgaria.approval?.notes).toMatch(/Do not invent a regional layer/i);
    expect(bulgaria.predecessor_draft_sha256).toBe(
      "cff8fcabb12716230a314309162a40c72a3d7d13fe1aa4469cfb1655767c48f0",
    );
    expect(sha256("schemas/atlas/tiers/bulgaria.json")).toBe(
      "9a6718fe301f440511cc9e9f9b4139b3a1e0332ef2e3e6c9b3063f67f04652ab",
    );
    expect(bulgaria.classifications).toHaveLength(3597);
    expect(bulgaria.counts_by_proposed_tier).toEqual({
      national: 0,
      regional: 0,
      municipal: 3597,
      council: 0,
      other: 0,
    });
    expect(bulgaria.counts_by_approval).toEqual({
      production_approved_municipal: 530,
      held_submunicipal_scope: 3067,
      regional: 0,
    });
    expect(bulgaria.importer_policy).toMatchObject({
      load: "production_approved_rows_only",
      approved_count: 530,
      held_count: 3067,
      held_review_category: "submunicipal_scope",
    });
    const mayors = bulgaria.classifications.filter((row) => row.office === "Mayor");
    const councils = bulgaria.classifications.filter((row) => row.office === "Municipal council");
    const district = bulgaria.classifications.filter((row) => row.office === "District mayor");
    const village = bulgaria.classifications.filter((row) => row.office === "Village mayor");
    expect(mayors).toHaveLength(265);
    expect(councils).toHaveLength(265);
    expect(district).toHaveLength(35);
    expect(village).toHaveLength(3032);
    expect(
      [...mayors, ...councils].every(
        (row) =>
          row.tier === "municipal" &&
          row.schema_v1_tier === "municipal" &&
          row.human_review_required === false &&
          row.tier_uncertain === false &&
          (row.review_category == null),
      ),
    ).toBe(true);
    expect(
      [...district, ...village].every(
        (row) =>
          row.tier === "municipal" &&
          row.schema_v1_tier === "municipal" &&
          row.human_review_required === true &&
          row.tier_uncertain === true &&
          row.review_category === "submunicipal_scope",
      ),
    ).toBe(true);
    expect(bulgaria.classifications.every((row) => row.tier === "municipal")).toBe(true);
    const hold = bulgaria.notes?.find((note) => note.scope === "submunicipal_tier_policy_and_2027_roster");
    expect(hold).toMatchObject({ status: "open" });
    expect(hold?.note).toMatch(/Justin HOLD 2026-09-19/i);
    expect(hold?.note).toMatch(/530 municipality-wide/i);
    const gradets = bulgaria.notes?.find((note) => note.scope === "qualification_change");
    expect(gradets).toMatchObject({
      status: "open",
      office_ids: ["BG-SLV11-b88d0d4475-V"],
    });
    expect(bulgaria.notes?.every((note) => note.status === "open")).toBe(true);
    expect(bulgaria.source_register.sha256).toBe(
      "00ddcca3c48141302a7432f97effd017a009fee3d64fb7f9000a72ef79663559",
    );
    const packed = bulgariaRegisterIds();
    expectExactIds(bulgaria, packed.ids);
    expect(bulgaria.source_register.sha256).toBe(packed.registerSha256);
    expect(bulgaria.source_register.payload_sha256).toBe(packed.payloadSha256);
    expect(packed.payloadSha256).toBe(
      "0b6b2c05dd8906f7e7a19927e847d4bc0aa83da8769e70ebbef012b13d0d287e",
    );
  });

  it("keeps Belgium Prompt S2 1179 current / 55 historical fully accepted", () => {
    const belgium = readJson<
      TierFile & {
        production_accepted?: boolean;
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        counts_by_approval?: Record<string, number>;
        importer_policy?: {
          load?: string;
          authorized_in_this_landing?: boolean;
          approved_count?: number;
          held_count?: number;
        };
        justin_approval?: { accepted?: boolean; current_offices?: number; historical_offices?: number };
        notes?: Array<{ scope?: string; status?: string; office_ids?: string[]; note?: string }>;
        source_register: { path: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/belgium.json");
    expect(belgium.status).toBe("approved");
    expect(belgium.production_accepted).toBe(true);
    expect(belgium.country_slug).toBe("belgium");
    expect(belgium.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(belgium.approval?.notes).toMatch(/1,179 current \+ 55 historical/i);
    expect(belgium.approval?.notes).toMatch(/retain offices and historic/i);
    expect(belgium.approval?.notes).toMatch(/remaining_universe/i);
    expect(belgium.predecessor_draft_sha256).toBe(
      "8dec06a21c01e0f0aa0228e3d152b795b0fff9522c96b2071fec334f5070ccb6",
    );
    expect(sha256("schemas/atlas/tiers/belgium.json")).toBe(
      "adc7108868d7d8a7df3f6888de9dee05d4b799c2ebbc3a571e83a0ea8fe284cf",
    );
    expect(belgium.classifications).toHaveLength(1234);
    expect(belgium.counts_by_proposed_tier).toEqual({
      national: 2,
      regional: 15,
      municipal: 1185,
      council: 0,
      other: 32,
      unknown: 0,
    });
    expect(belgium.counts_by_approval).toEqual({
      production_approved_current: 1179,
      production_approved_historical: 55,
      production_approved_total: 1234,
      municipal: 1185,
      regional: 15,
      national: 2,
      other: 32,
      held: 0,
    });
    expect(belgium.importer_policy).toMatchObject({
      load: "not_implemented",
      authorized_in_this_landing: false,
      approved_count: 1234,
      held_count: 0,
    });
    expect(belgium.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 1179,
      historical_offices: 55,
    });
    expect(belgium.classifications.every((row) => row.human_review_required === false)).toBe(true);
    expect(belgium.classifications.every((row) => row.tier_uncertain === false)).toBe(true);
    expect(belgium.classifications.every((row) => row.review_category == null)).toBe(true);
    expect(belgium.classifications.filter((row) => row.tier === "municipal")).toHaveLength(1185);
    expect(belgium.classifications.filter((row) => row.tier === "regional")).toHaveLength(15);
    expect(belgium.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(belgium.classifications.filter((row) => row.tier === "other")).toHaveLength(32);
    expect(
      belgium.classifications.every((row) =>
        row.tier === "national" ? row.schema_v1_tier === "national_context" : row.tier === row.schema_v1_tier,
      ),
    ).toBe(true);
    const register = readJson<Array<{ office_id: string; current: boolean }>>(
      "data/research/belgium-s2/office-register.json",
    );
    expect(register.filter((row) => row.current)).toHaveLength(1179);
    expect(register.filter((row) => !row.current)).toHaveLength(55);
    expectExactIds(belgium, register.map((row) => row.office_id));
    expect(belgium.source_register.sha256).toBe(
      "4b6ccb857bf22dbef2c8dbe8b3be72f7718b5f36aacda28e4b0ca212fce1bfd0",
    );
    expect(belgium.source_register.sha256).toBe(sha256("data/research/belgium-s2/office-register.json"));
    expect(belgium.source_register.path).toBe("data/research/belgium-s2/office-register.json");
    const remaining = belgium.notes?.find((note) => note.scope === "remaining_universe");
    expect(remaining).toMatchObject({ status: "open" });
    expect(remaining?.note).toMatch(/Indirect social-welfare/i);
    expect(belgium.notes?.find((note) => note.scope === "historic_binding")).toMatchObject({
      status: "open",
    });
    expect(belgium.notes?.find((note) => note.scope === "special_body_policy")).toMatchObject({
      status: "open",
    });
    expect(belgium.notes?.every((note) => note.status === "open")).toBe(true);
    expect(belgium.schema_compatibility).toMatchObject({ national: "national_context" });
  });

  it("keeps Netherlands Prompt T 432 current / 69 historical fully accepted", () => {
    const netherlands = readJson<
      TierFile & {
        production_accepted?: boolean;
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        counts_by_approval?: Record<string, number>;
        importer_policy?: {
          load?: string;
          authorized_in_this_landing?: boolean;
          approved_count?: number;
          held_count?: number;
        };
        justin_approval?: {
          accepted?: boolean;
          current_offices?: number;
          historical_offices?: number;
          focused_tier_reviews_retained?: number;
        };
        notes?: Array<{ category?: string; status?: string; office_ids?: string[]; note?: string }>;
        source_register: { path: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/netherlands.json");
    expect(netherlands.status).toBe("approved");
    expect(netherlands.production_accepted).toBe(true);
    expect(netherlands.country_slug).toBe("netherlands");
    expect(netherlands.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(netherlands.approval?.notes).toMatch(/432 current \+ 69 historical/i);
    expect(netherlands.approval?.notes).toMatch(/retain offices and historic/i);
    expect(netherlands.approval?.notes).toMatch(/Hilversum\/Wijdemeren/i);
    expect(netherlands.approval?.notes).toMatch(/147 focused-review/i);
    expect(netherlands.approval?.notes).toMatch(/no mayoral election/i);
    expect(netherlands.predecessor_draft_sha256).toBe(
      "81dc30e718355573cd15e3c93ff8f75364e4223612efab23cbd3393c5c94ea89",
    );
    expect(sha256("schemas/atlas/tiers/netherlands.json")).toBe(
      "faaf7573c678887004bc1f36f00a8496294ae23db5569278280a45642f0631b7",
    );
    expect(netherlands.classifications).toHaveLength(501);
    expect(netherlands.counts_by_proposed_tier).toEqual({
      national: 3,
      regional: 12,
      municipal: 414,
      council: 0,
      other: 72,
      unknown: 0,
    });
    expect(netherlands.counts_by_approval).toEqual({
      production_approved_current: 432,
      production_approved_historical: 69,
      production_approved_total: 501,
      municipal: 414,
      regional: 12,
      national: 3,
      other: 72,
      held: 0,
      focused_tier_reviews_retained: 147,
    });
    expect(netherlands.importer_policy).toMatchObject({
      load: "not_implemented",
      authorized_in_this_landing: false,
      approved_count: 501,
      held_count: 0,
    });
    expect(netherlands.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 432,
      historical_offices: 69,
      focused_tier_reviews_retained: 147,
    });
    expect(netherlands.classifications.filter((row) => row.human_review_required === true)).toHaveLength(147);
    expect(netherlands.classifications.filter((row) => row.tier === "municipal")).toHaveLength(414);
    expect(netherlands.classifications.filter((row) => row.tier === "regional")).toHaveLength(12);
    expect(netherlands.classifications.filter((row) => row.tier === "national")).toHaveLength(3);
    expect(netherlands.classifications.filter((row) => row.tier === "other")).toHaveLength(72);
    const register = readJson<Array<{ office_id: string; current: boolean; office_type?: string }>>(
      "data/research/netherlands/office-register.json",
    );
    expect(register.filter((row) => row.current)).toHaveLength(432);
    expect(register.filter((row) => !row.current)).toHaveLength(69);
    expect(register.some((row) => row.office_type === "mayor")).toBe(false);
    expect(readJson<unknown[]>("data/research/netherlands/events.json")).toHaveLength(1475);
    expect(readJson<unknown[]>("data/research/netherlands/results.json")).toHaveLength(13050);
    expectExactIds(netherlands, register.map((row) => row.office_id));
    expect(netherlands.source_register.sha256).toBe(
      "8fdcef170f27cc5c2eeda7d563ba7d7238d24833bb59b0278682b7c2590f6640",
    );
    expect(netherlands.source_register.sha256).toBe(sha256("data/research/netherlands/office-register.json"));
    expect(netherlands.source_register.path).toBe("data/research/netherlands/office-register.json");
    const merger = netherlands.notes?.find((note) => note.category === "latest_cycle_coverage");
    expect(merger).toMatchObject({
      status: "open",
      office_ids: ["NL-GM0402-C", "NL-GM1696-C"],
    });
    expect(merger?.note).toMatch(/successor/i);
    expect(netherlands.notes?.find((note) => note.category === "historical_code_binding")).toMatchObject({
      status: "open",
    });
    expect(netherlands.notes?.find((note) => note.category === "scope_policy")).toMatchObject({
      status: "open",
    });
    expect(netherlands.notes?.every((note) => note.status === "open")).toBe(true);
    expect(netherlands.schema_compatibility).toMatchObject({ national: "national_context" });
  });

  it("keeps Switzerland Prompt U 2805 current / 11 historical accepted with holds", () => {
    const switzerland = readJson<
      TierFile & {
        production_accepted?: boolean;
        full_register_certified?: boolean;
        approval_scope?: string;
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          scope?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        counts_by_approval?: Record<string, number>;
        importer_policy?: {
          load?: string;
          authorized_in_this_landing?: boolean;
          approved_count?: number;
          held_count?: number;
          held_universe_gaps?: number;
        };
        justin_approval?: {
          accepted?: boolean;
          current_offices?: number;
          historical_offices?: number;
          scope?: string;
          full_register_certified?: boolean;
          held_commune_executive_gaps?: number;
          held_commune_executive_gaps_by_canton?: Record<string, number>;
          held_historical_geographies_without_offices?: number;
          held_communes_without_positive_parliament_evidence?: number;
        };
        notes?: Array<{ category?: string; status?: string; count?: number; note?: string }>;
        source_register: { path: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/switzerland.json");
    expect(switzerland.status).toBe("approved");
    expect(switzerland.production_accepted).toBe(true);
    expect(switzerland.full_register_certified).toBe(false);
    expect(switzerland.approval_scope).toBe("evidenced_subset");
    expect(switzerland.country_slug).toBe("switzerland");
    expect(switzerland.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
      scope: "evidenced_subset",
    });
    expect(switzerland.approval?.notes).toMatch(/2,805 current \+ 11 historical/i);
    expect(switzerland.approval?.notes).toMatch(/Accepted-with-holds/i);
    expect(switzerland.approval?.notes).toMatch(/308 communes/i);
    expect(switzerland.approval?.notes).toMatch(/VD 284, SZ 24/);
    expect(switzerland.approval?.notes).toMatch(/1,938 communes/i);
    expect(switzerland.approval?.notes).toMatch(/Full-register certification remains OPEN/i);
    expect(switzerland.approval?.notes).toMatch(/Do not invent the 308 missing commune executives/i);
    expect(switzerland.predecessor_draft_sha256).toBe(
      "0cddfca20fab058ed9f1a712515fdfd1725abda7a2e5a1b7903087135893d4bf",
    );
    expect(sha256("schemas/atlas/tiers/switzerland.json")).toBe(
      "d1ebccfd1633aacd9b70732dcfe1f3e01df9549076d4b71efce38d436a2749f1",
    );
    expect(switzerland.classifications).toHaveLength(2816);
    expect(switzerland.counts_by_proposed_tier).toEqual({
      national: 2,
      regional: 52,
      municipal: 2402,
      council: 0,
      other: 360,
      unknown: 0,
    });
    expect(switzerland.counts_by_approval).toEqual({
      production_approved_current: 2805,
      production_approved_historical: 11,
      production_approved_total: 2816,
      municipal: 2402,
      regional: 52,
      national: 2,
      other: 360,
      held_offices_in_register: 0,
      held_commune_executive_gaps: 308,
      held_historical_geographies: 586,
      held_communes_without_positive_parliament_evidence: 1938,
    });
    expect(switzerland.importer_policy).toMatchObject({
      load: "not_implemented",
      authorized_in_this_landing: false,
      approved_count: 2816,
      held_count: 0,
      held_universe_gaps: 308,
    });
    expect(switzerland.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 2805,
      historical_offices: 11,
      scope: "evidenced_subset",
      full_register_certified: false,
      held_commune_executive_gaps: 308,
      held_commune_executive_gaps_by_canton: { VD: 284, SZ: 24 },
      held_historical_geographies_without_offices: 586,
      held_communes_without_positive_parliament_evidence: 1938,
    });
    expect(switzerland.classifications.filter((row) => row.tier === "municipal")).toHaveLength(2402);
    expect(switzerland.classifications.filter((row) => row.tier === "regional")).toHaveLength(52);
    expect(switzerland.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(switzerland.classifications.filter((row) => row.tier === "other")).toHaveLength(360);
    const register = readJson<Array<{ office_id: string; current: boolean }>>(
      "data/research/switzerland/office-register.json",
    );
    expect(register.filter((row) => row.current)).toHaveLength(2805);
    expect(register.filter((row) => !row.current)).toHaveLength(11);
    expect(readJson<unknown[]>("data/research/switzerland/events.json")).toHaveLength(1443);
    expect(readJson<unknown[]>("data/research/switzerland/results.json")).toHaveLength(8094);
    expectExactIds(
      switzerland,
      register.map((row) => row.office_id),
    );
    expect(switzerland.source_register.sha256).toBe(
      "f575711d0149660ad7b72e661d65ed9658f4bddf29045f804ef50188b34d0987",
    );
    expect(switzerland.source_register.sha256).toBe(sha256("data/research/switzerland/office-register.json"));
    expect(switzerland.source_register.path).toBe("data/research/switzerland/office-register.json");
    const executiveGap = switzerland.notes?.find((note) => note.category === "commune_executive_gap");
    expect(executiveGap).toMatchObject({ status: "open", count: 308 });
    expect(executiveGap?.note).toMatch(/Do not invent missing commune executives/i);
    expect(switzerland.notes?.find((note) => note.category === "thin_historic_merger_archive")).toMatchObject({
      status: "open",
    });
    expect(switzerland.notes?.find((note) => note.category === "citizen_assembly_parliament_caveat")).toMatchObject({
      status: "open",
      count: 1938,
    });
    expect(switzerland.notes?.find((note) => note.category === "mode_variance_disputed_results")).toMatchObject({
      status: "open",
    });
    expect(switzerland.notes?.find((note) => note.category === "full_register_certification")).toMatchObject({
      status: "open",
    });
    const audit = readJson<Array<{ canton: string; executive_body_recorded: boolean }>>(
      "data/research/switzerland/commune-coverage-audit.json",
    );
    const missingExec = audit.filter((row) => !row.executive_body_recorded);
    expect(missingExec).toHaveLength(308);
    expect(missingExec.filter((row) => row.canton === "VD")).toHaveLength(284);
    expect(missingExec.filter((row) => row.canton === "SZ")).toHaveLength(24);
    expect(switzerland.schema_compatibility).toMatchObject({ national: "national_context" });
  });

  it("keeps Denmark Prompt X 106 current / 240 historical fully accepted", () => {
    const denmark = readJson<
      TierFile & {
        production_accepted?: boolean;
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        counts_by_approval?: Record<string, number>;
        importer_policy?: {
          load?: string;
          authorized_in_this_landing?: boolean;
          approved_count?: number;
          held_count?: number;
        };
        justin_approval?: {
          accepted?: boolean;
          current_offices?: number;
          historical_offices?: number;
          focused_tier_reviews_retained?: number;
          unresolved_candidate_bindings?: number;
        };
        notes?: Array<{ category?: string; status?: string; count?: number; office_ids?: string[]; note?: string }>;
        source_register: { path: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/denmark.json");
    expect(denmark.status).toBe("approved");
    expect(denmark.production_accepted).toBe(true);
    expect(denmark.country_slug).toBe("denmark");
    expect(denmark.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(denmark.approval?.notes).toMatch(/106 current \+ 240 historical/i);
    expect(denmark.approval?.notes).toMatch(/retain offices and historic/i);
    expect(denmark.approval?.notes).toMatch(/Greenland\/Faroe/i);
    expect(denmark.approval?.notes).toMatch(/2007\/earlier merger/i);
    expect(denmark.approval?.notes).toMatch(/KMD\/DST/i);
    expect(denmark.approval?.notes).toMatch(/98 unresolved candidate/i);
    expect(denmark.approval?.notes).toMatch(/EP detail/i);
    expect(denmark.approval?.notes).toMatch(/no popular mayor/i);
    expect(denmark.predecessor_draft_sha256).toBe(
      "ba4626ab06fb811261b9e16972e3708497b63ec5717df046a3fcfaf716f811f5",
    );
    expect(sha256("schemas/atlas/tiers/denmark.json")).toBe(
      "672d8cf0fa57345010eb03ff0cfb905574ff1394f045a60119967d9a6ed8f57e",
    );
    expect(denmark.classifications).toHaveLength(346);
    expect(denmark.counts_by_proposed_tier).toEqual({
      national: 1,
      regional: 20,
      municipal: 324,
      council: 0,
      other: 1,
      unknown: 0,
    });
    expect(denmark.counts_by_approval).toEqual({
      production_approved_current: 106,
      production_approved_historical: 240,
      production_approved_total: 346,
      municipal: 324,
      regional: 20,
      national: 1,
      other: 1,
      held: 0,
      focused_tier_reviews_retained: 293,
      unresolved_candidate_bindings: 98,
    });
    expect(denmark.importer_policy).toMatchObject({
      load: "not_implemented",
      authorized_in_this_landing: false,
      approved_count: 346,
      held_count: 0,
    });
    expect(denmark.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 106,
      historical_offices: 240,
      focused_tier_reviews_retained: 293,
      unresolved_candidate_bindings: 98,
    });
    expect(denmark.classifications.filter((row) => row.human_review_required === true)).toHaveLength(293);
    expect(denmark.classifications.filter((row) => row.tier === "municipal")).toHaveLength(324);
    expect(denmark.classifications.filter((row) => row.tier === "regional")).toHaveLength(20);
    expect(denmark.classifications.filter((row) => row.tier === "national")).toHaveLength(1);
    expect(denmark.classifications.filter((row) => row.tier === "other")).toHaveLength(1);
    const register = readJson<Array<{ office_id: string; current: boolean; office_type?: string }>>(
      "data/research/denmark/office-register.json",
    );
    expect(register.filter((row) => row.current)).toHaveLength(106);
    expect(register.filter((row) => !row.current)).toHaveLength(240);
    expect(register.some((row) => /mayor|borgmester/i.test(String(row.office_type ?? "")))).toBe(false);
    expect(readJson<unknown[]>("data/research/denmark/events.json")).toHaveLength(1849);
    expect(readJson<unknown[]>("data/research/denmark/results.json")).toHaveLength(25391);
    expect(readJson<unknown[]>("data/research/denmark/unresolved-candidate-bindings.json")).toHaveLength(98);
    expectExactIds(
      denmark,
      register.map((row) => row.office_id),
    );
    expect(denmark.source_register.sha256).toBe(
      "eb510c0d537fe82cdb1e56a4fda2a7a9924f9f15818b701df8ba5d9e3be23f1f",
    );
    expect(denmark.source_register.sha256).toBe(sha256("data/research/denmark/office-register.json"));
    expect(denmark.source_register.path).toBe("data/research/denmark/office-register.json");
    expect(denmark.notes?.find((note) => note.category === "realm_coverage")).toMatchObject({
      status: "open",
    });
    expect(denmark.notes?.find((note) => note.category === "merger_successor_binding")).toMatchObject({
      status: "open",
    });
    expect(denmark.notes?.find((note) => note.category === "kmd_dst_detail_holes")).toMatchObject({
      status: "open",
    });
    expect(denmark.notes?.find((note) => note.category === "unresolved_candidate_bindings")).toMatchObject({
      status: "open",
      count: 98,
    });
    expect(denmark.notes?.find((note) => note.category === "ep_detail_gaps")).toMatchObject({
      status: "open",
    });
    expect(denmark.notes?.find((note) => note.category === "scope_policy")).toMatchObject({
      status: "open",
    });
    expect(denmark.notes?.filter((note) => note.category).every((note) => note.status === "open")).toBe(true);
    expect(denmark.schema_compatibility).toMatchObject({ national: "national_context" });
  });

  it("keeps Finland Prompt Z 333 current / 170 historical accepted with named holds", () => {
    const finland = readJson<
      TierFile & {
        production_accepted?: boolean;
        approval?: {
          by?: string;
          accepted_by?: string;
          date?: string;
          timezone?: string;
          notes?: string;
        };
        predecessor_draft_sha256?: string;
        justin_approval?: {
          accepted?: boolean;
          current_offices?: number;
          historical_offices?: number;
          scope?: string;
          holds?: string[];
        };
        notes?: Array<{ office_id?: string; reviews?: string[] }>;
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/finland.json");
    expect(finland.status).toBe("approved");
    expect(finland.production_accepted).toBe(true);
    expect(finland.country_slug).toBe("finland");
    expect(finland.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(finland.approval?.notes).toMatch(/333 current \+ 170 historical/i);
    expect(finland.approval?.notes).toMatch(/named holds/i);
    expect(finland.approval?.notes).toMatch(/FI-HISTORIC-MERGERS/);
    expect(finland.approval?.notes).toMatch(/FI-ALAND-EARLY-AND-DATES/);
    expect(finland.approval?.notes).toMatch(/FI-WELLBEING-TRANSITION/);
    expect(finland.approval?.notes).toMatch(/FI-EP-DETAIL/);
    expect(finland.approval?.notes).toMatch(/FI-CYCLE-LEGAL-DETAIL/);
    expect(finland.approval?.notes).toMatch(/FI-PARTY-CATEGORIES/);
    expect(finland.approval?.notes).toMatch(/FI-MISSING-RESULTS/);
    expect(finland.approval?.notes).toMatch(/No popular manager\/PM\/cabinet/i);
    expect(finland.predecessor_draft_sha256).toBe(
      "7c3a4c1c17538d5600a10c655e7fb18b12f977a1ef79c7608f9869d813df2797",
    );
    expect(sha256("schemas/atlas/tiers/finland.json")).toBe(
      "15edd48df39caae6cfefec9b20b0a20a7bafcfe7e919accbb46d056924083d53",
    );
    expect(finland.classifications).toHaveLength(503);
    expect(finland.counts_by_proposed_tier).toEqual({
      national: 2,
      regional: 22,
      municipal: 478,
      other: 1,
      unknown: 0,
    });
    expect(finland.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 333,
      historical_offices: 170,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "FI-HISTORIC-MERGERS",
        "FI-ALAND-EARLY-AND-DATES",
        "FI-WELLBEING-TRANSITION",
        "FI-EP-DETAIL",
        "FI-CYCLE-LEGAL-DETAIL",
        "FI-PARTY-CATEGORIES",
        "FI-MISSING-RESULTS",
      ],
    });
    expect(finland.classifications.filter((row) => row.human_review_required === true)).toHaveLength(171);
    expect(finland.classifications.filter((row) => row.tier === "municipal")).toHaveLength(478);
    expect(finland.classifications.filter((row) => row.tier === "regional")).toHaveLength(22);
    expect(finland.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(finland.classifications.filter((row) => row.tier === "other")).toHaveLength(1);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string; name?: string }>>(
      "data/research/finland/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(333);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(170);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_council"),
    ).toHaveLength(308);
    expect(register.filter((row) => row.office_id === "FI-M091-C")).toEqual([
      expect.objectContaining({ name: "Helsinki — kunnanvaltuusto", office_status: "current" }),
    ]);
    expect(register.some((row) => /mayor|manager|prime.?minister|cabinet/i.test(String(row.office_type ?? "")))).toBe(
      false,
    );
    expect(readJson<unknown[]>("data/research/finland/events.json")).toHaveLength(5241);
    expect(readJson<unknown[]>("data/research/finland/results.json")).toHaveLength(37471);
    expect(readJson<unknown[]>("data/research/finland/proceedings.json")).toHaveLength(11);
    const gaps = readJson<Array<{ original_token?: string; status?: string; office_ids?: string[] }>>(
      "data/research/finland/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "FI-HISTORIC-MERGERS",
      "FI-ALAND-EARLY-AND-DATES",
      "FI-WELLBEING-TRANSITION",
      "FI-EP-DETAIL",
      "FI-CYCLE-LEGAL-DETAIL",
      "FI-PARTY-CATEGORIES",
      "FI-MISSING-RESULTS",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    const alandMunicipal = gaps.find((row) => row.original_token === "FI-ALAND-EARLY-AND-DATES")?.office_ids ?? [];
    expect(alandMunicipal.filter((id) => id.startsWith("FI-M"))).toHaveLength(16);
    expectExactIds(
      finland,
      register.map((row) => row.office_id),
    );
    expect(finland.source_register.sha256).toBe(
      "150ede883757d5945c3bdd1fab027c9d084a1d24fb539add2c8c4f916268fed7",
    );
    expect(finland.source_register.sha256).toBe(sha256("data/research/finland/office-register.json"));
    expect(finland.source_register.input_path).toBe("data/research/finland/office-register.json");
    expect(finland.notes?.find((note) => note.office_id === "FI-EP")?.reviews?.[0]).toMatch(/supranational/i);
    expect(finland.classifications.find((row) => row.office_id === "FI-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(finland.classifications.find((row) => row.office_id === "FI-EDUSKUNTA")).toMatchObject({
      tier: "national",
    });
    expect(finland.classifications.find((row) => row.office_id === "FI-PRESIDENT")).toMatchObject({
      tier: "national",
    });
    expect(finland.classifications.find((row) => row.office_id === "FI-AX-LAGTING")).toMatchObject({
      tier: "regional",
    });
    expect(finland.classifications.find((row) => row.office_id === "FI-M091-C")).toMatchObject({
      tier: "municipal",
    });
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
