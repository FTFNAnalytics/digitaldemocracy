import Link from "next/link";
import { CoverageChip } from "@/components/atlas/coverage";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { PlainTable } from "@/components/atlas/plain-table";
import { RecordDetails } from "@/components/atlas/record-details";
import { formatAtlasRegion, loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

export default function AtlasIndexPage() {
  const catalog = loadAtlasCatalog();

  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  return (
    <>
      <PageHeader
        name="Election Atlas"
        level="World"
        facts={[
          { label: "Countries", value: catalog.totals.countriesWithOffices.toLocaleString() },
          { label: "Offices", value: catalog.totals.offices.toLocaleString() },
          { label: "Elections", value: catalog.totals.events.toLocaleString() },
        ]}
      />
      <section className="rounded-3xl border border-atlas-line bg-atlas-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-atlas-accent">Europe first</p>
        <h2 className="mt-2 font-atlas-heading text-2xl text-atlas-ink sm:text-3xl">Countries and offices</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">
          Calendar coverage starts with Europe. Countries outside Europe appear when they are loaded.
          They do not change that focus.
        </p>
        <div className="mt-5">
          <Link href={atlasRoutes.explorer} className="obs-btn">
            Open the explorer
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Latest snapshots</h2>
        <ul className="mt-4 grid gap-3">
          {catalog.lineages.map((row) => (
            <li key={row.lineageId} className="rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
              <p className="font-semibold text-atlas-ink">{row.snapshotLabel ?? "Snapshot not supplied"}</p>
              <p className="mt-1 text-sm text-atlas-ink-2">{row.officeCount.toLocaleString()} offices</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Countries</h2>
        <p className="mt-2 text-sm text-atlas-ink-2">Europe is listed first, then other loaded regions.</p>
        <div className="mt-4">
          <PlainTable
            caption="Loaded Atlas countries"
            columns={["Country", "Region", "Offices", "Elections", "Coverage"]}
            empty="No countries with offices are loaded."
            rows={catalog.countries.map((country) => [
              <Link key={country.countryId} href={atlasRoutes.country(country.countryId)} className="font-semibold text-atlas-accent hover:underline">
                {country.name}
              </Link>,
              formatAtlasRegion(country.regionId),
              country.officeCount.toLocaleString(),
              country.eventCount.toLocaleString(),
              <CoverageChip key={`${country.countryId}-coverage`} storedStatus={country.coverageStatus} />,
            ])}
          />
        </div>
      </section>

      {catalog.statusOnlyCountries.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-atlas-heading text-xl text-atlas-ink">Countries with no offices loaded</h2>
          <p className="mt-2 text-sm text-atlas-ink-2">
            {catalog.statusOnlyCountries.map((row) => row.name).join(", ")}
          </p>
        </section>
      ) : null}

      <RecordDetails>
        {catalog.lineages.map((row) => (
          <p key={row.lineageId}>
            lineage {row.lineageId}
            {row.releaseId ? ` · release ${row.releaseId}` : ""}
            {row.description ? ` · ${row.description}` : ""}
          </p>
        ))}
        <p>SQLite path: {catalog.sqlitePath}</p>
      </RecordDetails>
    </>
  );
}
