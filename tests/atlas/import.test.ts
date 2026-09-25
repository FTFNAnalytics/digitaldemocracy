import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  APPROVED_TIER_PATH,
  APPROVED_TIER_SHA256,
  DRAFT_TIER_SHA256,
  TIER_PATH,
  eventIdFor,
  geographyIdFor,
} from "../../lib/atlas/identity";

const repoRoot = path.join(import.meta.dirname, "../..");

function hashFile(relative: string): string {
  return createHash("sha256")
    .update(readFileSync(path.join(repoRoot, relative)))
    .digest("hex");
}

describe("Albania identity anchors", () => {
  it("preserves documented geography and event public IDs", () => {
    expect(geographyIdFor("Belsh", "Mayor")).toBe("geo-99a7b8d0e325a448c5e7c7ca");
    expect(geographyIdFor("Belsh", "Municipal council")).toBe("geo-29ca1a846eec3250b36d39f9");
    expect(geographyIdFor("Rrogozhinë", "Mayor")).toBe("geo-cb91810264cd90d2ef316d0e");
    expect(eventIdFor("AL-13-M::2023::2023-05-14")).toBe("event-9b7cd1a6a6d27850e712e6a7");
  });

  it("hashes the approved Albania tier file bytes and the Prompt BA draft", () => {
    expect(hashFile(APPROVED_TIER_PATH)).toBe(APPROVED_TIER_SHA256);
    expect(hashFile(TIER_PATH)).toBe(DRAFT_TIER_SHA256);
  });
});
