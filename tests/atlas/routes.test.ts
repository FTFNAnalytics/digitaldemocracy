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
  it("does not add an /atlas app route", () => {
    expect(existsSync(path.join(repoRoot, "app/atlas"))).toBe(false);
  });

  it("keeps the observatory base path at /electiondatabase", () => {
    expect(OBS_BASE).toBe("/electiondatabase");
  });

  it("does not add /atlas sitemap entries or Next.js redirects", () => {
    expect(STATIC_SITEMAP_PATHS.some((route) => route === "/atlas" || route.startsWith("/atlas/"))).toBe(
      false,
    );
    const nextConfig = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(nextConfig).not.toMatch(/\/atlas/);
    const appFiles = listFiles(path.join(repoRoot, "app"));
    expect(appFiles.some((file) => file.includes(`${path.sep}atlas${path.sep}`))).toBe(false);
  });
});
