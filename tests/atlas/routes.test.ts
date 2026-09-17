import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STATIC_SITEMAP_PATHS } from "@/lib/seo";
import { OBS_BASE } from "@/lib/observatory/routes";
import { atlasRoutes } from "@/lib/atlas/routes";

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

  it("ships /atlas/explorer and soft office/event compatibility without cutover redirects", () => {
    expect(existsSync(path.join(repoRoot, "app/atlas/explorer/page.tsx"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "app/atlas/offices/[officeId]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(repoRoot, "app/atlas/elections/[eventId]/page.tsx"))).toBe(true);
    expect(atlasRoutes.explorer).toBe("/atlas/explorer");
    expect(atlasRoutes.office("NZ-BULLER-WESTPORT-2026")).toBe("/atlas/offices/NZ-BULLER-WESTPORT-2026");
    expect(atlasRoutes.event("next-154f7bfa6ea99d09c5a47d7c")).toBe(
      "/atlas/elections/next-154f7bfa6ea99d09c5a47d7c",
    );
    expect(STATIC_SITEMAP_PATHS).toContain("/atlas/explorer");
    expect(STATIC_SITEMAP_PATHS).toContain("/electiondatabase/explorer");
    expect(existsSync(path.join(repoRoot, "app/electiondatabase/explorer/page.tsx"))).toBe(true);
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).not.toMatch(/source:\s*["']\/electiondatabase/);
    expect(nextConfig).not.toMatch(/permanent:\s*true/);
    const chrome = readFileSync(path.join(repoRoot, "components/atlas/chrome.tsx"), "utf8");
    expect(chrome).toMatch(/atlasRoutes\.explorer/);
    const index = readFileSync(path.join(repoRoot, "app/atlas/page.tsx"), "utf8");
    expect(index).toMatch(/Open the explorer/);
  });
});
