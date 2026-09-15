import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import {
  loadPackageBriefings,
  packageBriefingExists,
} from "./adapters/briefings";

// Bounded server cache, independent of React render state.
let cachedCountry = "";
let cachedBriefings: Record<string, string> = {};

function researchBriefings(countryId: string): Record<string, string> | null {
  const file = path.join(
    process.cwd(),
    "data/research/briefings",
    `${countryId}.json.gz`,
  );
  if (!existsSync(file)) return null;
  if (cachedCountry !== countryId) {
    cachedBriefings = JSON.parse(gunzipSync(readFileSync(file)).toString("utf8"));
    cachedCountry = countryId;
  }
  return cachedBriefings;
}

export function originalBriefing(countryId: string, officeId: string) {
  if (!/^[a-z-]+$/.test(countryId)) throw new Error("Invalid country slug");
  const fromRelease = researchBriefings(countryId)?.[officeId];
  if (fromRelease) return fromRelease;
  return loadPackageBriefings(countryId)[officeId];
}

export function hasOriginalBriefing(countryId: string, officeId: string) {
  if (!/^[a-z-]+$/.test(countryId)) return false;
  if (packageBriefingExists(countryId, officeId)) return true;
  return Boolean(researchBriefings(countryId)?.[officeId]);
}
