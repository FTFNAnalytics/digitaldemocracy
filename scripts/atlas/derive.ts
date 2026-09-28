#!/usr/bin/env npx tsx
/**
 * Rebuild derived Atlas tables from the master at ATLAS_SQLITE_PATH.
 * Does not edit master rows. import:atlas also runs this on the staged file
 * before the atomic publish swap.
 */
import { rebuildDerivedInFile } from "../../lib/atlas/derive/run";
import { resolveAtlasSqlitePath } from "../../lib/atlas/paths";
import { revalidateAtlasDerivedTag } from "../../lib/atlas/publication";

async function main() {
  const sqlitePath = resolveAtlasSqlitePath();
  const stats = rebuildDerivedInFile(sqlitePath);
  const revalidated = await revalidateAtlasDerivedTag();
  console.log("derive:atlas");
  console.log(`ATLAS_SQLITE_PATH=${sqlitePath}`);
  console.log(`schema=${stats.schema}`);
  console.log(`jurisdictions=${stats.jurisdictions}`);
  console.log(`slug_aliases=${stats.aliases}`);
  console.log(`seat_status=${stats.seats}`);
  console.log(`office_slugs=${stats.officeSlugs}`);
  console.log(`office_slug_aliases=${stats.officeSlugAliases}`);
  console.log(`cycles=${stats.cycles}`);
  console.log(`unplaced=${stats.unplaced}`);
  console.log(`coverage=${stats.coverage}`);
  console.log(`publication_tag=${revalidated.tag} revalidate=${revalidated.status}`);
}

void main();
