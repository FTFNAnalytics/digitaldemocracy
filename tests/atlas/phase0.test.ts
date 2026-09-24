import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
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

function readJsonGz<T>(relative: string): T {
  return JSON.parse(gunzipSync(readFileSync(path.join(repoRoot, relative))).toString("utf8")) as T;
}

function countJsonlGzLines(relative: string): number {
  return gunzipSync(readFileSync(path.join(repoRoot, relative)))
    .toString("utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0).length;
}

function sha256(relative: string): string {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relative)))
    .digest("hex");
}

function sha256Gunzip(relative: string): string {
  return createHash("sha256")
    .update(gunzipSync(readFileSync(path.join(repoRoot, relative))))
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
    >("docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json");
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
    expect(sha256("docs/phase1/bosnia-and-herzegovina/Prompt_O_approved_tiers.json")).toBe(
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

  it("pins the Bosnia schema path to the Prompt AW draft checksum", () => {
    const rows = readJson<
      Array<{
        office_id: string;
        tier: string;
        justin_approved: boolean;
        review_status: string;
      }>
    >("schemas/atlas/tiers/bosnia-and-herzegovina.json");
    expect(sha256("schemas/atlas/tiers/bosnia-and-herzegovina.json")).toBe(
      "96c7372d9395b1a35caa8ccbe68cffa95a8324d2d05081b9aea29706651e45a9",
    );
    expect(rows).toHaveLength(346);
    expect(rows.every((row) => row.justin_approved === false)).toBe(true);
    expect(rows.every((row) => row.review_status === "draft_for_human_review")).toBe(true);
    const histogram = { national: 0, regional: 0, municipal: 0 };
    for (const row of rows) {
      if (row.tier !== "national" && row.tier !== "regional" && row.tier !== "municipal") {
        throw new Error(`Unexpected Bosnia tier ${row.tier}`);
      }
      histogram[row.tier] += 1;
    }
    expect(histogram).toEqual({ national: 4, regional: 15, municipal: 327 });
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

  it("keeps Sweden Prompt Y 313 current / 7 historical accepted with named holds", () => {
    const sweden = readJson<
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
          named_holds?: string[];
        };
        justin_approval?: {
          accepted?: boolean;
          current_offices?: number;
          historical_offices?: number;
          scope?: string;
          holds?: string[];
        };
        notes?: Array<{ office_id?: string; reviews?: string[] }>;
        source_register: { path: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/sweden.json");
    expect(sweden.status).toBe("approved");
    expect(sweden.production_accepted).toBe(true);
    expect(sweden.country_slug).toBe("sweden");
    expect(sweden.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(sweden.approval?.notes).toMatch(/313 current \+ 7 historical/i);
    expect(sweden.approval?.notes).toMatch(/named holds/i);
    expect(sweden.approval?.notes).toMatch(/SE-GOTLAND-TIER/);
    expect(sweden.approval?.notes).toMatch(/SE-EP-SAM-TIER/);
    expect(sweden.approval?.notes).toMatch(/SE-2026-COUNT-IN-PROGRESS/);
    expect(sweden.approval?.notes).toMatch(/SE-HISTORICAL-BOUNDARIES/);
    expect(sweden.approval?.notes).toMatch(/SE-HISTORIC-PARTY-DETAIL/);
    expect(sweden.approval?.notes).toMatch(/SE-REPEAT-AND-RECOUNT/);
    expect(sweden.approval?.notes).toMatch(/SE-FARGELANDA-1973/);
    expect(sweden.approval?.notes).toMatch(/No popular mayor\/executive/i);
    expect(sweden.predecessor_draft_sha256).toBe(
      "ba95b2671f56b45077e9a4987e54d59438793cdfe053d8486de04dc54c0f2139",
    );
    expect(sha256("schemas/atlas/tiers/sweden.json")).toBe(
      "dc13885023d2d454dae39272a5fe668e384e7606d4f2f89a3df136e9f0170ef7",
    );
    expect(sweden.classifications).toHaveLength(320);
    expect(sweden.counts_by_proposed_tier).toEqual({
      national: 1,
      regional: 25,
      municipal: 292,
      council: 0,
      other: 2,
      unknown: 0,
    });
    expect(sweden.counts_by_approval).toEqual({
      production_approved_current: 313,
      production_approved_historical: 7,
      production_approved_total: 320,
      municipal: 292,
      regional: 25,
      national: 1,
      other: 2,
      held: 0,
      focused_tier_reviews_retained: 10,
      named_holds: 7,
    });
    expect(sweden.importer_policy).toMatchObject({
      load: "not_implemented",
      authorized_in_this_landing: false,
      approved_count: 320,
      held_count: 0,
    });
    expect(sweden.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 313,
      historical_offices: 7,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "SE-GOTLAND-TIER",
        "SE-EP-SAM-TIER",
        "SE-2026-COUNT-IN-PROGRESS",
        "SE-HISTORICAL-BOUNDARIES",
        "SE-HISTORIC-PARTY-DETAIL",
        "SE-REPEAT-AND-RECOUNT",
        "SE-FARGELANDA-1973",
      ],
    });
    expect(sweden.classifications.filter((row) => row.human_review_required === true)).toHaveLength(10);
    expect(sweden.classifications.filter((row) => row.tier === "municipal")).toHaveLength(292);
    expect(sweden.classifications.filter((row) => row.tier === "regional")).toHaveLength(25);
    expect(sweden.classifications.filter((row) => row.tier === "national")).toHaveLength(1);
    expect(sweden.classifications.filter((row) => row.tier === "other")).toHaveLength(2);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string }>>(
      "data/research/sweden/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(313);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(7);
    expect(register.some((row) => /kommunalråd|prime.?minister|cabinet|mayor/i.test(String(row.office_type ?? "")))).toBe(
      false,
    );
    expect(readJson<unknown[]>("data/research/sweden/events.json")).toHaveLength(4951);
    expect(readJson<unknown[]>("data/research/sweden/results.json")).toHaveLength(40991);
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/sweden/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "SE-HISTORICAL-BOUNDARIES",
      "SE-HISTORIC-PARTY-DETAIL",
      "SE-REPEAT-AND-RECOUNT",
      "SE-2026-COUNT-IN-PROGRESS",
      "SE-GOTLAND-TIER",
      "SE-EP-SAM-TIER",
      "SE-FARGELANDA-1973",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      sweden,
      register.map((row) => row.office_id),
    );
    expect(sweden.source_register.sha256).toBe(
      "6a787b86920238eb78f4f9e8dd170b58785e5ed10f182442fd08015f4bfb5ae9",
    );
    expect(sweden.source_register.sha256).toBe(sha256("data/research/sweden/office-register.json"));
    expect(sweden.source_register.path).toBe("data/research/sweden/office-register.json");
    expect(sweden.notes?.find((note) => note.office_id === "SE-K0980-C")?.reviews?.[0]).toMatch(/Gotlands kommun/i);
    expect(sweden.notes?.find((note) => note.office_id === "SE-EP")?.reviews?.[0]).toMatch(/Supranational/i);
    expect(sweden.notes?.find((note) => note.office_id === "SE-SAM")?.reviews?.[0]).toMatch(/Sami parliament/i);
    expect(sweden.schema_compatibility).toMatchObject({ national: "national_context" });
    const gotland = sweden.classifications.find((row) => row.office_id === "SE-K0980-C");
    expect(gotland).toMatchObject({ tier: "municipal", human_review_required: true });
    expect(sweden.classifications.find((row) => row.office_id === "SE-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(sweden.classifications.find((row) => row.office_id === "SE-SAM")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(sweden.classifications.find((row) => row.office_id === "SE-RD")).toMatchObject({
      tier: "national",
    });
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

  it("keeps Norway Prompt AA 389 current / 537 historical accepted with named holds", () => {
    const norway = readJson<
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
    >("schemas/atlas/tiers/norway.json");
    expect(norway.status).toBe("approved");
    expect(norway.production_accepted).toBe(true);
    expect(norway.country_slug).toBe("norway");
    expect(norway.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-19",
      timezone: "America/Edmonton",
    });
    expect(norway.approval?.notes).toMatch(/389 current \+ 537 historical/i);
    expect(norway.approval?.notes).toMatch(/named holds/i);
    expect(norway.approval?.notes).toMatch(/SAMI-2025-ZERO-VOTE-SEAT-98d/);
    expect(norway.approval?.notes).toMatch(/REFORM-2020-2024/);
    expect(norway.approval?.notes).toMatch(/OSLO-BOROUGH-HISTORY/);
    expect(norway.approval?.notes).toMatch(/LONGYEARBYEN-HISTORY/);
    expect(norway.approval?.notes).toMatch(/LEGAL-STATUS-REPEATS/);
    expect(norway.approval?.notes).toMatch(/COUNTY-AGGREGATES/);
    expect(norway.approval?.notes).toMatch(/SAMI-OLDER-HISTORY/);
    expect(norway.approval?.notes).toMatch(/MUNICIPAL-HISTORY-DEPTH/);
    expect(norway.approval?.notes).toMatch(/PARTY-CATEGORIES/);
    expect(norway.approval?.notes).toMatch(/No popular mayor\/PM\/cabinet or EP/i);
    expect(norway.predecessor_draft_sha256).toBe(
      "dba7a879edae7f6ad44c3d3964fe345f375fe933f3549c98cfd99b361328a5f0",
    );
    expect(sha256("schemas/atlas/tiers/norway.json")).toBe(
      "8ff8fc545ab326b135ac8a116d013c3dbecce377750e26dfc008bcea134db827",
    );
    expect(norway.classifications).toHaveLength(926);
    expect(norway.counts_by_proposed_tier).toEqual({
      national: 1,
      regional: 32,
      municipal: 876,
      other: 17,
      unknown: 0,
    });
    expect(norway.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 389,
      historical_offices: 537,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "SAMI-2025-ZERO-VOTE-SEAT-98d",
        "REFORM-2020-2024",
        "OSLO-BOROUGH-HISTORY",
        "LONGYEARBYEN-HISTORY",
        "LEGAL-STATUS-REPEATS",
        "COUNTY-AGGREGATES",
        "SAMI-OLDER-HISTORY",
        "MUNICIPAL-HISTORY-DEPTH",
        "PARTY-CATEGORIES",
      ],
    });
    expect(norway.classifications.filter((row) => row.human_review_required === true)).toHaveLength(555);
    expect(norway.classifications.filter((row) => row.tier === "municipal")).toHaveLength(876);
    expect(norway.classifications.filter((row) => row.tier === "regional")).toHaveLength(32);
    expect(norway.classifications.filter((row) => row.tier === "national")).toHaveLength(1);
    expect(norway.classifications.filter((row) => row.tier === "other")).toHaveLength(17);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string; name?: string }>>(
      "data/research/norway/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(389);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(537);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_council"),
    ).toHaveLength(357);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "county_council"),
    ).toHaveLength(14);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "borough_committee"),
    ).toHaveLength(15);
    expect(register.filter((row) => row.office_id === "NO-M0301-C")).toEqual([
      expect.objectContaining({ name: "Oslo - Oslove — bystyre", office_status: "current" }),
    ]);
    expect(register.some((row) => /mayor|prime.?minister|cabinet/i.test(String(row.office_type ?? "")))).toBe(false);
    expect(register.some((row) => /european.?parliament|^ep$/i.test(String(row.office_type ?? "")))).toBe(false);
    expect(readJson<unknown[]>("data/research/norway/events.json")).toHaveLength(10777);
    expect(readJson<unknown[]>("data/research/norway/results.json")).toHaveLength(59033);
    expect(readJson<unknown[]>("data/research/norway/proceedings.json")).toHaveLength(0);
    const gaps = readJson<Array<{ original_token?: string; status?: string; office_ids?: string[] }>>(
      "data/research/norway/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "SAMI-2025-ZERO-VOTE-SEAT-98d",
      "REFORM-2020-2024",
      "OSLO-BOROUGH-HISTORY",
      "LONGYEARBYEN-HISTORY",
      "LEGAL-STATUS-REPEATS",
      "COUNTY-AGGREGATES",
      "SAMI-OLDER-HISTORY",
      "MUNICIPAL-HISTORY-DEPTH",
      "PARTY-CATEGORIES",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    const boroughs = gaps.find((row) => row.original_token === "OSLO-BOROUGH-HISTORY")?.office_ids ?? [];
    expect(boroughs).toHaveLength(15);
    expect(boroughs.every((id) => id.startsWith("NO-B0301"))).toBe(true);
    expectExactIds(
      norway,
      register.map((row) => row.office_id),
    );
    expect(norway.source_register.sha256).toBe(
      "a45c2cbde38bcaa12b0094a701140674841ed484a85f519faa2b8a75582c95a0",
    );
    expect(norway.source_register.sha256).toBe(sha256("data/research/norway/office-register.json"));
    expect(norway.source_register.input_path).toBe("data/research/norway/office-register.json");
    expect(norway.notes?.find((note) => note.office_id === "NO-M0301-C")?.reviews?.[0]).toMatch(/Oslo bystyre/i);
    expect(norway.classifications.find((row) => row.office_id === "NO-STORTING")).toMatchObject({
      tier: "national",
    });
    expect(norway.classifications.find((row) => row.office_id === "NO-SAMEDIGGI")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(norway.classifications.find((row) => row.office_id === "NO-LONGYEARBYEN-C")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(norway.classifications.find((row) => row.office_id === "NO-M0301-C")).toMatchObject({
      tier: "municipal",
    });
    expect(norway.classifications.find((row) => row.office_id === "NO-B030101-C")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
  });

  it("keeps Ireland Prompt AB 36 current / 86 historical accepted with named holds", () => {
    const ireland = readJson<
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
    >("schemas/atlas/tiers/ireland.json");
    expect(ireland.status).toBe("approved");
    expect(ireland.production_accepted).toBe(true);
    expect(ireland.country_slug).toBe("ireland");
    expect(ireland.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-20",
      timezone: "America/Edmonton",
    });
    expect(ireland.approval?.notes).toMatch(/36 current \+ 86 historical/i);
    expect(ireland.approval?.notes).toMatch(/named holds/i);
    expect(ireland.approval?.notes).toMatch(/IE-2014-REFORM/);
    expect(ireland.approval?.notes).toMatch(/IE-LOCAL-2019-2024/);
    expect(ireland.approval?.notes).toMatch(/IE-SEANAD-PANELS/);
    expect(ireland.approval?.notes).toMatch(/IE-EP-RESULTS/);
    expect(ireland.approval?.notes).toMatch(/IE-DAIL-ENCODING-AND-STV/);
    expect(ireland.approval?.notes).toMatch(/IE-PRESIDENT-LATEST/);
    expect(ireland.approval?.notes).toMatch(/IE-MAYOR-LIMIT/);
    expect(ireland.approval?.notes).toMatch(/IE-NORTHERN-IRELAND-EXCLUSION/);
    expect(ireland.approval?.notes).toMatch(/IE-REGIONAL-APPOINTMENTS/);
    expect(ireland.approval?.notes).toMatch(/Northern Ireland excluded/i);
    expect(ireland.predecessor_draft_sha256).toBe(
      "0683410a3e3b8f1c1bc5b69df0793fd5bbba524658556a51ca76d3aeb7ae3470",
    );
    expect(sha256("schemas/atlas/tiers/ireland.json")).toBe(
      "f4426e0df1b99d6e3330c345e33a83022cf654b180c659e03c0e889ae4327ca0",
    );
    expect(ireland.classifications).toHaveLength(122);
    expect(ireland.counts_by_proposed_tier).toEqual({
      national: 3,
      regional: 0,
      municipal: 118,
      other: 1,
      unknown: 0,
    });
    expect(ireland.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 36,
      historical_offices: 86,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "IE-2014-REFORM",
        "IE-LOCAL-2019-2024",
        "IE-SEANAD-PANELS",
        "IE-EP-RESULTS",
        "IE-DAIL-ENCODING-AND-STV",
        "IE-PRESIDENT-LATEST",
        "IE-MAYOR-LIMIT",
        "IE-NORTHERN-IRELAND-EXCLUSION",
        "IE-REGIONAL-APPOINTMENTS",
      ],
    });
    expect(ireland.classifications.filter((row) => row.human_review_required === true)).toHaveLength(88);
    expect(ireland.classifications.filter((row) => row.tier === "municipal")).toHaveLength(118);
    expect(ireland.classifications.filter((row) => row.tier === "regional")).toHaveLength(0);
    expect(ireland.classifications.filter((row) => row.tier === "national")).toHaveLength(3);
    expect(ireland.classifications.filter((row) => row.tier === "other")).toHaveLength(1);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string; name?: string }>>(
      "data/research/ireland/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(36);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(86);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "local_authority_council"),
    ).toHaveLength(31);
    expect(register.filter((row) => row.office_type === "town_council")).toHaveLength(75);
    expect(register.filter((row) => row.office_type === "borough_council")).toHaveLength(5);
    expect(
      register.filter((row) => row.office_status === "historical" && row.office_type === "local_authority_council"),
    ).toHaveLength(6);
    expect(register.some((row) => /northern ireland/i.test(String(row.name ?? "")))).toBe(false);
    expect(register.some((row) => /northern.?ireland/i.test(row.office_id))).toBe(false);
    expect(readJson<unknown[]>("data/research/ireland/events.json")).toHaveLength(196);
    expect(readJson<unknown[]>("data/research/ireland/results.json")).toHaveLength(7254);
    expect(readJson<unknown[]>("data/research/ireland/proceedings.json")).toHaveLength(0);
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/ireland/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "IE-2014-REFORM",
      "IE-LOCAL-2019-2024",
      "IE-SEANAD-PANELS",
      "IE-EP-RESULTS",
      "IE-DAIL-ENCODING-AND-STV",
      "IE-PRESIDENT-LATEST",
      "IE-MAYOR-LIMIT",
      "IE-NORTHERN-IRELAND-EXCLUSION",
      "IE-REGIONAL-APPOINTMENTS",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      ireland,
      register.map((row) => row.office_id),
    );
    expect(ireland.source_register.sha256).toBe(
      "329bfaadd79d41a5772e7b9070e7d67ef3e7810fd41dd0a22fdfda17b723f1cc",
    );
    expect(ireland.source_register.sha256).toBe(sha256("data/research/ireland/office-register.json"));
    expect(ireland.source_register.input_path).toBe("data/research/ireland/office-register.json");
    expect(ireland.notes?.find((note) => note.office_id === "IE-EP")?.reviews?.[0]).toMatch(/Supranational/i);
    expect(ireland.notes?.find((note) => note.office_id === "IE-SEANAD")?.reviews?.[0]).toMatch(/Taoiseach nominees/i);
    expect(ireland.classifications.find((row) => row.office_id === "IE-DAIL")).toMatchObject({
      tier: "national",
    });
    expect(ireland.classifications.find((row) => row.office_id === "IE-SEANAD")).toMatchObject({
      tier: "national",
      human_review_required: true,
    });
    expect(ireland.classifications.find((row) => row.office_id === "IE-PRESIDENT")).toMatchObject({
      tier: "national",
    });
    expect(ireland.classifications.find((row) => row.office_id === "IE-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(ireland.classifications.find((row) => row.office_id === "IE-LIMERICK-MAYOR")).toMatchObject({
      tier: "municipal",
    });
  });

  it("keeps Poland Prompt AC 5310 current / 2 historical accepted with named holds", () => {
    const poland = readJson<
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
          events?: number;
          results?: number;
          scope?: string;
          holds?: string[];
        };
        notes?: Array<{ review_token?: string }>;
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/poland.json");
    expect(poland.status).toBe("approved");
    expect(poland.production_accepted).toBe(true);
    expect(poland.country_slug).toBe("poland");
    expect(poland.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-20",
      timezone: "America/Edmonton",
    });
    expect(poland.approval?.notes).toMatch(/5310 current \+ 2 historical/i);
    expect(poland.approval?.notes).toMatch(/named holds/i);
    expect(poland.approval?.notes).toMatch(/PL-POWIAT-TIER/);
    expect(poland.approval?.notes).toMatch(/do not reclassify/i);
    expect(poland.approval?.notes).toMatch(/Results omitted from land slim/);
    expect(poland.predecessor_draft_sha256).toBe(
      "bd11a49634b12aa699e0ead91aff64a68e257efe6fc3fc542c44818a2167f2cd",
    );
    expect(sha256("schemas/atlas/tiers/poland.json")).toBe(
      "8316357779f24b8f0ffe58640ef6d32370dff2c2e4f7e7dcf7e4ee23440e6d14",
    );
    expect(poland.classifications).toHaveLength(5312);
    expect(poland.counts_by_proposed_tier).toEqual({
      national: 3,
      regional: 330,
      municipal: 4960,
      other: 19,
      unknown: 0,
    });
    expect(poland.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 5310,
      historical_offices: 2,
      events: 16767,
      results: 641493,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "PL-HISTORIC-TERRITORIES",
        "PL-1990-1999-REFORMS",
        "PL-CYCLE-LEGAL-STATUS",
        "PL-2019-SHARE-UNIT",
        "PL-SPECIAL-RETURN-DETAIL",
        "PL-WARSAW-AUXILIARY",
        "PL-POWIAT-TIER",
        "PL-EP-SCOPE",
        "PL-TITLE-AND-BOUNDARY-CHANGES",
        "PL-OLDER-NATIONAL-HISTORY",
        "PL-MARGINS-AND-PARTIES",
        "PL-NEXT-DATES",
      ],
    });
    expect(poland.classifications.filter((row) => row.human_review_required === true)).toHaveLength(333);
    expect(poland.classifications.filter((row) => row.tier === "municipal")).toHaveLength(4960);
    expect(poland.classifications.filter((row) => row.tier === "regional")).toHaveLength(330);
    expect(poland.classifications.filter((row) => row.tier === "national")).toHaveLength(3);
    expect(poland.classifications.filter((row) => row.tier === "other")).toHaveLength(19);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string; name?: string }>>(
      "data/research/poland/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(5310);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(2);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_council"),
    ).toHaveLength(2479);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "direct_municipal_executive"),
    ).toHaveLength(2479);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "voivodeship_sejmik"),
    ).toHaveLength(16);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "county_council"),
    ).toHaveLength(314);
    expect(register.filter((row) => row.office_id === "PL-320304-C")).toEqual([
      expect.objectContaining({ name: "Rada gminy — Ostrowice, gm.", office_status: "historical" }),
    ]);
    expect(register.filter((row) => row.office_id === "PL-320304-X")).toEqual([
      expect.objectContaining({ name: "Wójt — gm. Ostrowice", office_status: "historical" }),
    ]);
    expect(
      register.some((row) =>
        /prime.?minister|cabinet|appointed.?voivode|wojewoda/i.test(String(row.office_type ?? "")),
      ),
    ).toBe(false);
    expect(readJson<unknown[]>("data/research/poland/events.json")).toHaveLength(16767);
    expect(readJson<unknown[]>("data/research/poland/proceedings.json")).toHaveLength(9773);
    expect(existsSync(path.join(repoRoot, "data/research/poland/results.json"))).toBe(false);
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/poland/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "PL-HISTORIC-TERRITORIES",
      "PL-1990-1999-REFORMS",
      "PL-CYCLE-LEGAL-STATUS",
      "PL-2019-SHARE-UNIT",
      "PL-SPECIAL-RETURN-DETAIL",
      "PL-WARSAW-AUXILIARY",
      "PL-POWIAT-TIER",
      "PL-EP-SCOPE",
      "PL-TITLE-AND-BOUNDARY-CHANGES",
      "PL-OLDER-NATIONAL-HISTORY",
      "PL-MARGINS-AND-PARTIES",
      "PL-NEXT-DATES",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      poland,
      register.map((row) => row.office_id),
    );
    expect(poland.source_register.sha256).toBe(
      "f7b6061fc348dcfe2184cf39b6866aef37debea8f2f8f7add956b5a76b6f9f4a",
    );
    expect(poland.source_register.sha256).toBe(sha256("data/research/poland/office-register.json"));
    expect(poland.source_register.input_path).toBe("data/research/poland/office-register.json");
    expect(poland.notes?.map((note) => note.review_token)).toEqual([
      "PL-HISTORIC-TERRITORIES",
      "PL-1990-1999-REFORMS",
      "PL-CYCLE-LEGAL-STATUS",
      "PL-2019-SHARE-UNIT",
      "PL-SPECIAL-RETURN-DETAIL",
      "PL-WARSAW-AUXILIARY",
      "PL-POWIAT-TIER",
      "PL-EP-SCOPE",
      "PL-TITLE-AND-BOUNDARY-CHANGES",
      "PL-OLDER-NATIONAL-HISTORY",
      "PL-MARGINS-AND-PARTIES",
      "PL-NEXT-DATES",
    ]);
    expect(poland.classifications.find((row) => row.office_id === "PL-SEJM")).toMatchObject({
      tier: "national",
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-SENAT")).toMatchObject({
      tier: "national",
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-PRESIDENT")).toMatchObject({
      tier: "national",
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-020000-V")).toMatchObject({
      tier: "regional",
      human_review_required: false,
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-020100-P")).toMatchObject({
      tier: "regional",
      human_review_required: true,
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-320304-C")).toMatchObject({
      tier: "municipal",
    });
    expect(poland.classifications.find((row) => row.office_id === "PL-146502-D")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
  });

  it("keeps Czechia Prompt V 6411 current / 13 historical accepted with named holds", () => {
    const czechia = readJson<
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
          events?: number;
          results?: number;
          direct_executive_offices?: number;
          direct_local_executive_offices?: number;
          council_assembly_offices?: number;
          scope?: string;
          holds?: string[];
        };
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/czechia.json");
    expect(czechia.status).toBe("approved");
    expect(czechia.production_accepted).toBe(true);
    expect(czechia.country_slug).toBe("czechia");
    expect(czechia.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-20",
      timezone: "America/Edmonton",
    });
    expect(czechia.approval?.notes).toMatch(/6411 current \+ 13 historical/i);
    expect(czechia.approval?.notes).toMatch(/named holds/i);
    expect(czechia.approval?.notes).toMatch(/MUNICIPAL-RECALCULATED-PERCENT/);
    expect(czechia.approval?.notes).toMatch(/HISTORICAL-CODE-BINDING/);
    expect(czechia.approval?.notes).toMatch(/PRAGUE-DUAL-STATUS/);
    expect(czechia.approval?.notes).toMatch(/MILITARY-CIVILIAN-TRANSITION/);
    expect(czechia.approval?.notes).toMatch(/CURRENT-ROSTER-VALIDITY/);
    expect(czechia.approval?.notes).toMatch(/EXECUTIVE-MODE/);
    expect(czechia.approval?.notes).toMatch(/HISTORIC-DEPTH/);
    expect(czechia.approval?.notes).toMatch(/LEGAL-OUTCOME-REPEAT-AUDIT/);
    expect(czechia.approval?.notes).toMatch(/EP-PARTY-SCOPE/);
    expect(czechia.approval?.notes).toMatch(/DATES-AND-NEXT-CYCLES/);
    expect(czechia.predecessor_draft_sha256).toBe(
      "465c61ab0836ec18fd03c1e6af922e9918a184be00237fd238f0107386235244",
    );
    expect(sha256("schemas/atlas/tiers/czechia.json")).toBe(
      "6b7c856cf164a0d04fc58048783593591855e40c626b0a0ee767d666910bd66a",
    );
    expect(czechia.classifications).toHaveLength(6424);
    expect(czechia.counts_by_proposed_tier).toEqual({
      national: 3,
      regional: 14,
      municipal: 6257,
      other: 150,
      unknown: 0,
    });
    expect(czechia.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 6411,
      historical_offices: 13,
      events: 46236,
      results: 169614,
      direct_executive_offices: 1,
      direct_local_executive_offices: 0,
      council_assembly_offices: 6420,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "MUNICIPAL-RECALCULATED-PERCENT",
        "HISTORICAL-CODE-BINDING",
        "PRAGUE-DUAL-STATUS",
        "MILITARY-CIVILIAN-TRANSITION",
        "CURRENT-ROSTER-VALIDITY",
        "EXECUTIVE-MODE",
        "HISTORIC-DEPTH",
        "LEGAL-OUTCOME-REPEAT-AUDIT",
        "EP-PARTY-SCOPE",
        "DATES-AND-NEXT-CYCLES",
      ],
    });
    expect(czechia.classifications.filter((row) => row.human_review_required === true)).toHaveLength(155);
    expect(czechia.classifications.filter((row) => row.tier === "municipal")).toHaveLength(6257);
    expect(czechia.classifications.filter((row) => row.tier === "regional")).toHaveLength(14);
    expect(czechia.classifications.filter((row) => row.tier === "national")).toHaveLength(3);
    expect(czechia.classifications.filter((row) => row.tier === "other")).toHaveLength(150);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string; name?: string }>>(
      "data/research/czechia/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(6411);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(13);
    expect(register.filter((row) => row.office_type === "direct_national_executive")).toEqual([
      expect.objectContaining({ office_id: "CZ-PRESIDENT", name: "Prezident republiky", office_status: "current" }),
    ]);
    expect(register.filter((row) => row.office_type === "direct_municipal_executive")).toHaveLength(0);
    expect(register.filter((row) => row.office_type === "municipal_council")).toHaveLength(6257);
    expect(register.filter((row) => row.office_type === "capital_regional_municipal_assembly")).toEqual([
      expect.objectContaining({ office_id: "CZ-M554782-C", office_status: "current" }),
    ]);
    expect(readJsonGz<unknown[]>("data/research/czechia/events.json.gz")).toHaveLength(46236);
    expect(readJson<unknown[]>("data/research/czechia/proceedings.json")).toHaveLength(934);
    expect(existsSync(path.join(repoRoot, "data/research/czechia/events.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/czechia/results.jsonl.gz"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "docs/phase1/czechia/Czechia_Identity_Vectors.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "docs/phase1/czechia/Czechia_Result_Identity_Vectors.jsonl.gz"))).toBe(
      false,
    );
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/czechia/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "MUNICIPAL-RECALCULATED-PERCENT",
      "HISTORICAL-CODE-BINDING",
      "PRAGUE-DUAL-STATUS",
      "MILITARY-CIVILIAN-TRANSITION",
      "CURRENT-ROSTER-VALIDITY",
      "EXECUTIVE-MODE",
      "HISTORIC-DEPTH",
      "LEGAL-OUTCOME-REPEAT-AUDIT",
      "EP-PARTY-SCOPE",
      "DATES-AND-NEXT-CYCLES",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      czechia,
      register.map((row) => row.office_id),
    );
    expect(czechia.source_register.sha256).toBe(
      "e3e2e478bd744f7d45f13434121362b6b877928b9251a66cf1f03558a9965e69",
    );
    expect(czechia.source_register.sha256).toBe(sha256("data/research/czechia/office-register.json"));
    expect(czechia.source_register.input_path).toBe("data/research/czechia/office-register.json");
    expect(czechia.classifications.find((row) => row.office_id === "CZ-PRESIDENT")).toMatchObject({
      tier: "national",
    });
    expect(czechia.classifications.find((row) => row.office_id === "CZ-PS")).toMatchObject({
      tier: "national",
    });
    expect(czechia.classifications.find((row) => row.office_id === "CZ-SENAT")).toMatchObject({
      tier: "national",
    });
    expect(czechia.classifications.find((row) => row.office_id === "CZ-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(czechia.classifications.find((row) => row.office_id === "CZ-M554782-C")).toMatchObject({
      tier: "regional",
      human_review_required: true,
    });
  });

  it("keeps Croatia Prompt W 1234 current / 11 historical accepted with named holds", () => {
    const croatia = readJson<
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
          events?: number;
          results?: number;
          executive_tickets?: number;
          independently_elected_deputies?: number;
          assemblies?: number;
          scope?: string;
          holds?: string[];
        };
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/croatia.json");
    expect(croatia.status).toBe("approved");
    expect(croatia.production_accepted).toBe(true);
    expect(croatia.country_slug).toBe("croatia");
    expect(croatia.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-20",
      timezone: "America/Edmonton",
    });
    expect(croatia.approval?.notes).toMatch(/1234 current \+ 11 historical/i);
    expect(croatia.approval?.notes).toMatch(/named holds/i);
    expect(croatia.approval?.notes).toMatch(/CURRENT-ROSTER-VALIDITY/);
    expect(croatia.approval?.notes).toMatch(/ZAGREB-DUAL/);
    expect(croatia.approval?.notes).toMatch(/DEPUTY-ELIGIBILITY/);
    expect(croatia.approval?.notes).toMatch(/TERRITORIAL-REFORMS/);
    expect(croatia.approval?.notes).toMatch(/SPECIAL-AND-SUPPLEMENTARY/);
    expect(croatia.approval?.notes).toMatch(/MISSING-BISKUPIJA-2017/);
    expect(croatia.approval?.notes).toMatch(/TAR-VABRIGA-PLACEHOLDER/);
    expect(croatia.approval?.notes).toMatch(/SEATS-AND-LEGAL-FINALITY/);
    expect(croatia.approval?.notes).toMatch(/SABOR-MINORITY-BASIS/);
    expect(croatia.approval?.notes).toMatch(/PARTY-IDENTITY/);
    expect(croatia.approval?.notes).toMatch(/EP-DETAIL/);
    expect(croatia.approval?.notes).toMatch(/DATES-NEXT-CYCLES/);
    expect(croatia.approval?.notes).toMatch(/EXCLUDED-AUXILIARY/);
    expect(croatia.predecessor_draft_sha256).toBe(
      "e5528335fbf28ccec62187574e4928e087cd53f56fa03e47e67f8c8dad58a48d",
    );
    expect(sha256("schemas/atlas/tiers/croatia.json")).toBe(
      "2f5c00d677e1756ac3dd553295df5ef84b547bfe0927c1f3c1aa249c433b430a",
    );
    expect(croatia.classifications).toHaveLength(1245);
    expect(croatia.counts_by_proposed_tier).toEqual({
      national: 2,
      regional: 55,
      municipal: 1187,
      other: 1,
    });
    expect(croatia.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 1234,
      historical_offices: 11,
      events: 3834,
      results: 15907,
      executive_tickets: 577,
      independently_elected_deputies: 79,
      assemblies: 576,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "CURRENT-ROSTER-VALIDITY",
        "ZAGREB-DUAL",
        "DEPUTY-ELIGIBILITY",
        "TERRITORIAL-REFORMS",
        "SPECIAL-AND-SUPPLEMENTARY",
        "MISSING-BISKUPIJA-2017",
        "TAR-VABRIGA-PLACEHOLDER",
        "SEATS-AND-LEGAL-FINALITY",
        "SABOR-MINORITY-BASIS",
        "PARTY-IDENTITY",
        "EP-DETAIL",
        "DATES-NEXT-CYCLES",
        "EXCLUDED-AUXILIARY",
      ],
    });
    expect(croatia.classifications.filter((row) => row.human_review_required === true)).toHaveLength(93);
    expect(croatia.classifications.filter((row) => row.tier === "municipal")).toHaveLength(1187);
    expect(croatia.classifications.filter((row) => row.tier === "regional")).toHaveLength(55);
    expect(croatia.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(croatia.classifications.filter((row) => row.tier === "other")).toHaveLength(1);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string }>>(
      "data/research/croatia/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(1234);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(11);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "direct_executive"),
    ).toHaveLength(577);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "direct_deputy"),
    ).toHaveLength(79);
    expect(register.filter((row) => row.office_status === "current" && row.office_type === "council")).toHaveLength(
      576,
    );
    expect(register.filter((row) => row.office_status === "historical" && row.office_type === "direct_deputy")).toHaveLength(
      11,
    );
    expect(readJsonGz<unknown[]>("data/research/croatia/events.json.gz")).toHaveLength(3834);
    expect(countJsonlGzLines("data/research/croatia/results.jsonl.gz")).toBe(15907);
    expect(readJson<unknown[]>("data/research/croatia/proceedings.json")).toHaveLength(2418);
    expect(existsSync(path.join(repoRoot, "data/research/croatia/events.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/croatia/sources"))).toBe(false);
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/croatia/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "CURRENT-ROSTER-VALIDITY",
      "ZAGREB-DUAL",
      "DEPUTY-ELIGIBILITY",
      "TERRITORIAL-REFORMS",
      "SPECIAL-AND-SUPPLEMENTARY",
      "MISSING-BISKUPIJA-2017",
      "TAR-VABRIGA-PLACEHOLDER",
      "SEATS-AND-LEGAL-FINALITY",
      "SABOR-MINORITY-BASIS",
      "PARTY-IDENTITY",
      "EP-DETAIL",
      "DATES-NEXT-CYCLES",
      "EXCLUDED-AUXILIARY",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      croatia,
      register.map((row) => row.office_id),
    );
    expect(croatia.source_register.sha256).toBe(
      "5c512cdedf3aa5c891c81929d090b45c3a4fa97298f4c1fdf90a9ef9081c7e36",
    );
    expect(croatia.source_register.sha256).toBe(sha256("data/research/croatia/office-register.json"));
    expect(croatia.source_register.input_path).toBe("data/research/croatia/office-register.json");
    expect(croatia.classifications.find((row) => row.office_id === "HR-PRESIDENT")).toMatchObject({
      tier: "national",
    });
    expect(croatia.classifications.find((row) => row.office_id === "HR-SABOR")).toMatchObject({
      tier: "national",
    });
    expect(croatia.classifications.find((row) => row.office_id === "HR-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(croatia.classifications.find((row) => row.office_id === "HR-Z21-C")).toMatchObject({
      tier: "regional",
      human_review_required: true,
    });
    expect(croatia.classifications.find((row) => row.office_id === "HR-Z21-E")).toMatchObject({
      tier: "regional",
      human_review_required: true,
    });
  });

  it("keeps Portugal Prompt AD 10666 current / 8168 historical accepted with named holds", () => {
    const portugal = readJson<
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
          events?: number;
          results?: number;
          current_municipalities?: number;
          current_freguesias?: number;
          current_plenary_freguesias?: number;
          draft_tiers?: Record<string, number>;
          scope?: string;
          holds?: string[];
          hold_notes?: Record<string, string>;
        };
        notes?: Array<string | { original_token?: string; status?: string }>;
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/portugal.json");
    expect(portugal.status).toBe("approved");
    expect(portugal.production_accepted).toBe(true);
    expect(portugal.country_slug).toBe("portugal");
    expect(portugal.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-21",
      timezone: "America/Edmonton",
    });
    expect(portugal.approval?.notes).toMatch(/10666 current \+ 8168 historical/i);
    expect(portugal.approval?.notes).toMatch(/named holds/i);
    expect(portugal.approval?.notes).toMatch(/CURRENT-REGISTER-DATE/);
    expect(portugal.approval?.notes).toMatch(/INDIRECT-AND-LIST-HEAD/);
    expect(portugal.approval?.notes).toMatch(/PLENARY-37/);
    expect(portugal.approval?.notes).toMatch(/PARISH-REFORM-2013-2025/);
    expect(portugal.approval?.notes).toMatch(/PARISH-TIER/);
    expect(portugal.approval?.notes).toMatch(/LEGACY-CODE-CONFLICTS/);
    expect(portugal.approval?.notes).toMatch(/DATES-REPEATS-SPECIALS/);
    expect(portugal.approval?.notes).toMatch(/PUBLISHED-AGGREGATE-CONFLICTS/);
    expect(portugal.approval?.notes).toMatch(/PR-2026-RUNOFF/);
    expect(portugal.approval?.notes).toMatch(/PR-2016-MARGARITA/);
    expect(portugal.approval?.notes).toMatch(/AZORES-COMPENSATION/);
    expect(portugal.approval?.notes).toMatch(/MADEIRA-CORRECTION/);
    expect(portugal.approval?.notes).toMatch(/AR-EUROPE-2022/);
    expect(portugal.approval?.notes).toMatch(/EP-DETAIL/);
    expect(portugal.approval?.notes).toMatch(/PRE2009-AND-CANDIDATES/);
    expect(portugal.approval?.notes).toMatch(/MAI-FEED-HOLES/);
    expect(portugal.approval?.notes).toMatch(/CERTIFICATION-AND-MARGINS/);
    expect(portugal.approval?.notes).toMatch(/unresolved aliases/i);
    expect(portugal.approval?.notes).toMatch(/do not reclassify/i);
    expect(portugal.predecessor_draft_sha256).toBe(
      "5155830f9141ebe7607d51e888e804f63fe2305426d20998ff6e16917da5d651",
    );
    expect(sha256("schemas/atlas/tiers/portugal.json")).toBe(
      "47f4fac833e61bad953abfb72f6e3253a1f4c2d7f35938b73de57f7b07724caa",
    );
    expect(portugal.classifications).toHaveLength(18834);
    expect(portugal.counts_by_proposed_tier).toEqual({
      municipal: 927,
      other: 17903,
      national: 2,
      regional: 2,
    });
    expect(portugal.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 10666,
      historical_offices: 8168,
      events: 19820,
      results: 66283,
      current_municipalities: 308,
      current_freguesias: 3258,
      current_plenary_freguesias: 37,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "CURRENT-REGISTER-DATE",
        "INDIRECT-AND-LIST-HEAD",
        "PLENARY-37",
        "PARISH-REFORM-2013-2025",
        "PARISH-TIER",
        "LEGACY-CODE-CONFLICTS",
        "DATES-REPEATS-SPECIALS",
        "PUBLISHED-AGGREGATE-CONFLICTS",
        "PR-2026-RUNOFF",
        "PR-2016-MARGARITA",
        "AZORES-COMPENSATION",
        "MADEIRA-CORRECTION",
        "AR-EUROPE-2022",
        "EP-DETAIL",
        "PRE2009-AND-CANDIDATES",
        "MAI-FEED-HOLES",
        "CERTIFICATION-AND-MARGINS",
      ],
      hold_notes: {
        "PARISH-REFORM-2013-2025": "8168 historical = unresolved aliases, not proven abolitions",
        "PARISH-TIER": "17903 other — keep as drafted other; do not reclassify",
      },
    });
    expect(portugal.justin_approval?.holds).toHaveLength(17);
    expect(portugal.classifications.filter((row) => row.human_review_required === true)).toHaveLength(18214);
    expect(portugal.classifications.filter((row) => row.tier === "municipal")).toHaveLength(927);
    expect(portugal.classifications.filter((row) => row.tier === "regional")).toHaveLength(2);
    expect(portugal.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(portugal.classifications.filter((row) => row.tier === "other")).toHaveLength(17903);
    const register = readJsonGz<Array<{ office_id: string; office_status?: string; office_type?: string }>>(
      "data/research/portugal/office-register.json.gz",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(10666);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(8168);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_assembly"),
    ).toHaveLength(308);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_executive_body"),
    ).toHaveLength(308);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "municipal_president"),
    ).toHaveLength(308);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "parish_assembly"),
    ).toHaveLength(3221);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "parish_executive_body"),
    ).toHaveLength(3258);
    expect(
      register.filter((row) => row.office_status === "current" && row.office_type === "parish_president"),
    ).toHaveLength(3258);
    expect(readJsonGz<unknown[]>("data/research/portugal/events.json.gz")).toHaveLength(19820);
    expect(countJsonlGzLines("data/research/portugal/results.jsonl.gz")).toBe(66283);
    expect(readJson<unknown[]>("data/research/portugal/proceedings.json")).toHaveLength(2);
    expect(existsSync(path.join(repoRoot, "data/research/portugal/events.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/portugal/office-register.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/portugal/results.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/portugal/sources"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "docs/phase1/portugal/Portugal_Identity_Vectors.json"))).toBe(false);
    const gaps = readJson<Array<{ original_token?: string; status?: string }>>(
      "data/research/portugal/research-gaps.json",
    );
    expect(gaps.map((row) => row.original_token)).toEqual([
      "CURRENT-REGISTER-DATE",
      "INDIRECT-AND-LIST-HEAD",
      "PLENARY-37",
      "PARISH-REFORM-2013-2025",
      "PARISH-TIER",
      "LEGACY-CODE-CONFLICTS",
      "DATES-REPEATS-SPECIALS",
      "PUBLISHED-AGGREGATE-CONFLICTS",
      "PR-2026-RUNOFF",
      "PR-2016-MARGARITA",
      "AZORES-COMPENSATION",
      "MADEIRA-CORRECTION",
      "AR-EUROPE-2022",
      "EP-DETAIL",
      "PRE2009-AND-CANDIDATES",
      "MAI-FEED-HOLES",
      "CERTIFICATION-AND-MARGINS",
    ]);
    expect(gaps.every((row) => row.status === "open")).toBe(true);
    expectExactIds(
      portugal,
      register.map((row) => row.office_id),
    );
    expect(portugal.source_register.sha256).toBe(
      "62720e750e2ac0c54ff9654b0a5cedca0b98ab4e37c35fa2aca60b0db7925dd6",
    );
    expect(portugal.source_register.sha256).toBe(sha256Gunzip("data/research/portugal/office-register.json.gz"));
    expect(portugal.source_register.input_path).toBe("data/research/portugal/office-register.json");
    expect(portugal.classifications.find((row) => row.office_id === "PT-PR")).toMatchObject({
      tier: "national",
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-AR")).toMatchObject({
      tier: "national",
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-EP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-AC-AL")).toMatchObject({
      tier: "regional",
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-MA-AL")).toMatchObject({
      tier: "regional",
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-M0101-AM")).toMatchObject({
      tier: "municipal",
    });
    expect(portugal.classifications.find((row) => row.office_id === "PT-F010103-AF")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
  });

  it("keeps Spain Prompt AE 8204 current / 4 historical accepted with named holds", () => {
    const spain = readJson<
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
          events?: number;
          results?: number;
          explicit_concejo_abierto_direct_executives?: number;
          municipal_modes_pending?: number;
          scope?: string;
          holds?: string[];
        };
        source_register: { path?: string; input_path?: string; sha256: string; bytes?: number };
      }
    >("schemas/atlas/tiers/spain.json");
    expect(spain.status).toBe("approved");
    expect(spain.production_accepted).toBe(true);
    expect(spain.country_slug).toBe("spain");
    expect(spain.approval).toMatchObject({
      by: "product_owner",
      accepted_by: "Justin",
      date: "2026-09-21",
      timezone: "America/Edmonton",
    });
    expect(spain.approval?.notes).toMatch(/8204 current \+ 4 historical/i);
    expect(spain.approval?.notes).toMatch(/named holds/i);
    expect(spain.approval?.notes).toMatch(/ES-G01/);
    expect(spain.approval?.notes).toMatch(/ES-G02/);
    expect(spain.approval?.notes).toMatch(/ES-G03/);
    expect(spain.approval?.notes).toMatch(/ES-G04/);
    expect(spain.approval?.notes).toMatch(/ES-G05/);
    expect(spain.approval?.notes).toMatch(/ES-G06/);
    expect(spain.approval?.notes).toMatch(/ES-G07/);
    expect(spain.approval?.notes).toMatch(/ES-G08/);
    expect(spain.approval?.notes).toMatch(/ES-G09/);
    expect(spain.approval?.notes).toMatch(/ES-G10/);
    expect(spain.approval?.notes).toMatch(/ES-G11/);
    expect(spain.approval?.notes).toMatch(/ES-G12/);
    expect(spain.predecessor_draft_sha256).toBe(
      "f161ea79405505577fe0127d492d346d6e730537ed21e59b34333fb4023a393f",
    );
    expect(sha256("schemas/atlas/tiers/spain.json")).toBe(
      "61f8176df88a09d097e5d557b5a8cadf91acc7c28b5cf4f4ead79071b4364049",
    );
    expect(spain.classifications).toHaveLength(8208);
    expect(spain.counts_by_proposed_tier).toEqual({
      municipal: 8133,
      other: 5,
      regional: 68,
      national: 2,
    });
    expect(spain.justin_approval).toMatchObject({
      accepted: true,
      current_offices: 8204,
      historical_offices: 4,
      events: 20820,
      results: 91413,
      explicit_concejo_abierto_direct_executives: 78,
      municipal_modes_pending: 3762,
      scope: "all_draft_offices_with_named_holds",
      holds: [
        "ES-G01",
        "ES-G02",
        "ES-G03",
        "ES-G04",
        "ES-G05",
        "ES-G06",
        "ES-G07",
        "ES-G08",
        "ES-G09",
        "ES-G10",
        "ES-G11",
        "ES-G12",
      ],
    });
    expect(spain.classifications.filter((row) => row.human_review_required === true)).toHaveLength(3897);
    expect(spain.classifications.filter((row) => row.tier === "municipal")).toHaveLength(8133);
    expect(spain.classifications.filter((row) => row.tier === "regional")).toHaveLength(68);
    expect(spain.classifications.filter((row) => row.tier === "national")).toHaveLength(2);
    expect(spain.classifications.filter((row) => row.tier === "other")).toHaveLength(5);
    const register = readJson<Array<{ office_id: string; office_status?: string; office_type?: string }>>(
      "data/research/spain/office-register.json",
    );
    expect(register.filter((row) => row.office_status === "current")).toHaveLength(8204);
    expect(register.filter((row) => row.office_status === "historical")).toHaveLength(4);
    expect(
      register.filter(
        (row) => row.office_status === "current" && row.office_type === "municipal_council",
      ),
    ).toHaveLength(4289);
    expect(
      register.filter(
        (row) => row.office_status === "current" && row.office_type === "municipal_elected_mandate_mode_pending",
      ),
    ).toHaveLength(3762);
    expect(
      register.filter(
        (row) => row.office_status === "current" && row.office_type === "concejo_abierto_alcalde",
      ),
    ).toHaveLength(78);
    expect(
      register.filter((row) => row.office_status === "historical").map((row) => row.office_id).sort(),
    ).toEqual(["ES-M15026-REP", "ES-M15063-REP", "ES-M36011-REP", "ES-M36012-REP"]);
    expect(
      register.some((row) =>
        /prime.?minister|cabinet|king|monarch/i.test(String(row.office_type ?? "")),
      ),
    ).toBe(false);
    expect(readJsonGz<unknown[]>("data/research/spain/events.json.gz")).toHaveLength(20820);
    expect(readJson<unknown[]>("data/research/spain/geography.json")).toHaveLength(8220);
    expect(existsSync(path.join(repoRoot, "data/research/spain/events.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/spain/results.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "data/research/spain/sources"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "docs/phase1/spain/Spain_Identity_Vectors.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "docs/phase1/spain/JUSTIN_ACCEPTANCE.md"))).toBe(true);
    expectExactIds(
      spain,
      register.map((row) => row.office_id),
    );
    expect(spain.source_register.sha256).toBe(
      "5817713d1b14fc6cc4c0f077219112bc8ddafebad809fddc54406edd8431e008",
    );
    expect(spain.source_register.sha256).toBe(sha256("data/research/spain/office-register.json"));
    expect(spain.source_register.input_path).toBe("data/research/spain/office-register.json");
    expect(spain.classifications.find((row) => row.office_id === "ES-CONGRESO")).toMatchObject({
      tier: "national",
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-SENADO")).toMatchObject({
      tier: "national",
      human_review_required: true,
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-EP")).toMatchObject({
      tier: "other",
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-M07024-REP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-M51001-REP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-M52001-REP")).toMatchObject({
      tier: "other",
      human_review_required: true,
    });
    expect(spain.classifications.find((row) => row.office_id === "ES-ARAN-COUNCIL")).toMatchObject({
      tier: "other",
      human_review_required: true,
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
