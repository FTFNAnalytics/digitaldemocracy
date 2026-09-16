import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STATIC_SITEMAP_PATHS } from "@/lib/seo";
import { OBS_BASE } from "@/lib/observatory/routes";

const repoRoot = path.join(import.meta.dirname, "../..");

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(next) : [next];
  });
}

describe("Phase 1 public routes", () => {
  it("keeps the observatory base path at /electiondatabase", () => {
    expect(OBS_BASE).toBe("/electiondatabase");
  });

  it("adds a public /atlas app route without replacing /electiondatabase", () => {
    expect(existsSync(path.join(repoRoot, "app/atlas/page.tsx"))).toBe(true);
    expect(STATIC_SITEMAP_PATHS).toContain("/atlas");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase");
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).not.toMatch(/destination:\s*["']\/atlas/);
    const appFiles = listFiles(path.join(repoRoot, "app"));
    expect(appFiles.some((file) => file.includes(`${path.sep}electiondatabase${path.sep}`))).toBe(true);
  });
});
