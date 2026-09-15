import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cleanBriefing } from "../../../scripts/import/briefing-html";
import { armeniaBriefingFiles } from "./armenia";
import { inventoryCountryPackages } from "./inventory";

const cache = new Map<string, Record<string, string>>();

function officeLinkMap(officeIds: string[]): Map<string, string> {
  return new Map(officeIds.flatMap((id) => [[`${id}.html`, id], [id, id]]));
}

export function loadPackageBriefings(
  countryId: string,
  officeIds: string[] = [],
  root = process.cwd(),
): Record<string, string> {
  const cached = cache.get(countryId);
  if (cached) return cached;
  const { packages } = inventoryCountryPackages(root);
  const pkg = packages.find((row) => row.slug === countryId);
  const records: Record<string, string> = {};
  if (!pkg) {
    cache.set(countryId, records);
    return records;
  }
  if (pkg.kind === "armenia-packed-europe/1") {
    const files = armeniaBriefingFiles(pkg.dir);
    const links = officeLinkMap([...new Set([...officeIds, ...files.keys()])]);
    for (const [id, html] of files) {
      records[id] = cleanBriefing(html, links);
    }
  } else if (pkg.kind === "europe-country-extract/1") {
    const dir = path.join(pkg.dir, "briefings");
    if (existsSync(dir)) {
      const names = readdirSync(dir).filter((file) => {
        if (!file.endsWith(".html")) return false;
        const id = file.replace(/\.html$/, "");
        // Country-folder navigation HTML is not an office briefing.
        return (
          id !== countryId &&
          !/^(index|start_here|readme)$/i.test(id)
        );
      });
      const ids = names.map((name) => name.replace(/\.html$/, ""));
      const links = officeLinkMap([...new Set([...officeIds, ...ids])]);
      for (const name of names) {
        const id = name.replace(/\.html$/, "");
        records[id] = cleanBriefing(
          readFileSync(path.join(dir, name), "utf8"),
          links,
        );
      }
    }
  }
  cache.set(countryId, records);
  return records;
}

export function packageBriefingExists(
  countryId: string,
  officeId: string,
  root = process.cwd(),
): boolean {
  const { packages } = inventoryCountryPackages(root);
  const pkg = packages.find((row) => row.slug === countryId);
  if (!pkg) return false;
  if (pkg.kind === "armenia-packed-europe/1") {
    return armeniaBriefingFiles(pkg.dir).has(officeId);
  }
  if (pkg.kind === "europe-country-extract/1") {
    return existsSync(path.join(pkg.dir, "briefings", `${officeId}.html`));
  }
  return false;
}
