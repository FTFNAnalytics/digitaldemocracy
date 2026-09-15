import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
// Bounded server cache, independent of React render state.
let cachedCountry = "";
let cachedBriefings: Record<string, string> = {};
export function originalBriefing(countryId: string, officeId: string) {
  if (!/^[a-z-]+$/.test(countryId)) throw new Error("Invalid country slug");
  if (cachedCountry !== countryId) {
    cachedBriefings = JSON.parse(
      gunzipSync(
        readFileSync(
          path.join(
            process.cwd(),
            "data/research/briefings",
            `${countryId}.json.gz`,
          ),
        ),
      ).toString("utf8"),
    );
    cachedCountry = countryId;
  }
  return cachedBriefings[officeId];
}
