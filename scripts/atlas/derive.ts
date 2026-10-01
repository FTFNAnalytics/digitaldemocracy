#!/usr/bin/env npx tsx
/**
 * Rebuild derived Atlas tables from the master at ATLAS_SQLITE_PATH.
 * Does not edit master rows.
 *
 * No country argument: full-master rebuild. Use this for a night job or after
 * a full restage. Do not run it after a single-country import on the live VPS.
 *
 * Country slice: `npm run derive:atlas:country -- --country=<country_id>`
 * or `ATLAS_DERIVE_COUNTRY=<country_id> npm run derive:atlas:country`.
 * A scoped `import:atlas` already does this for the imported country.
 */
import { rebuildDerivedCountryInFile, rebuildDerivedInFile } from "../../lib/atlas/derive/run";
import { SEARCH_ENGINE, sqliteFts5Enabled } from "../../lib/atlas/search/schema";
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";
import { revalidateAtlasDerivedTag } from "../../lib/atlas/publication";

function countryArgument(): string | undefined {
  const fromArg = process.argv
    .slice(2)
    .find((arg) => arg.startsWith("--country="))
    ?.slice("--country=".length)
    .trim();
  const fromEnv = process.env.ATLAS_DERIVE_COUNTRY?.trim();
  const country = fromArg || fromEnv || "";
  if (!country) {
    if (process.env.npm_lifecycle_event === "derive:atlas:country") {
      throw new Error("derive:atlas:country requires --country=<country_id> or ATLAS_DERIVE_COUNTRY");
    }
    return undefined;
  }
  if (country.toLowerCase() === "all") {
    throw new Error(
      "Refusing country derive for all. Run npm run derive:atlas with no country filter for a full-master rebuild.",
    );
  }
  return country;
}

async function main() {
  const sqlitePath = resolveAtlasSqlitePath();
  const countryId = countryArgument();
  const stats = countryId ? rebuildDerivedCountryInFile(sqlitePath, countryId) : rebuildDerivedInFile(sqlitePath);
  const revalidated = await revalidateAtlasDerivedTag();
  console.log(countryId ? "derive:atlas:country" : "derive:atlas");
  console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
  if (countryId) console.log(`country_id=${countryId}`);
  console.log(`schema=${stats.schema}`);
  console.log(`jurisdictions=${stats.jurisdictions}`);
  console.log(`slug_aliases=${stats.aliases}`);
  console.log(`seat_status=${stats.seats}`);
  console.log(`office_slugs=${stats.officeSlugs}`);
  console.log(`office_slug_aliases=${stats.officeSlugAliases}`);
  console.log(`cycles=${stats.cycles}`);
  console.log(`unplaced=${stats.unplaced}`);
  console.log(`coverage=${stats.coverage}`);
  console.log(`search_schema=${stats.searchSchema}`);
  console.log(`search_seats=${stats.searchSeats}`);
  console.log(`search_cycles=${stats.searchCycles}`);
  console.log(`search_candidates=${stats.searchCandidates}`);
  console.log(`persons=${stats.persons}`);
  console.log(`person_aliases=${stats.personAliases}`);
  console.log(`search_engine=${SEARCH_ENGINE}`);
  console.log(`fts5=${sqliteFts5Enabled() ? 1 : 0}`);
  console.log(`downloads=${stats.downloads}`);
  console.log(`publication_tag=${revalidated.tag} revalidate=${revalidated.status}`);
}

void main();
