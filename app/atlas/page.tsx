import Link from "next/link";
import { AtlasPageHeader } from "@/components/atlas/chrome";
import { EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatAtlasRegion, formatAtlasTier, loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

export default function AtlasIndexPage() {
  const catalog = loadAtlasCatalog();

  return (
    <>
      <AtlasPageHeader
        eyebrow="Center for Digital Democracy"
        title="Election Atlas"
        description="Europe-first calendar and regional-depth reading of the Atlas SQLite master. This index lists countries and offices that are actually loaded — Albania as the Europe storage proof, plus approved continuity packs. Latin America is not treated as the launch vertical."
      />

      {catalog.status !== "ready" ? (
        <EmptyState title="Atlas database is not loaded">
          <p>{catalog.message}</p>
          <p className="mt-2">
            Resolved path: <code className="text-navy">{catalog.sqlitePath}</code>
          </p>
        </EmptyState>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(162_255_0/0.16)_1px,transparent_0)] bg-[size:22px_22px]"
              aria-hidden
            />
            <div className="relative">
              <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
                Launch framing
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Europe first</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
                Calendar coverage and municipal/regional depth start with Europe. Albania is the
                Phase 1 storage-proof lineage. Approved Latin America and New Zealand packs appear
                below only because they are in this SQLite file — they do not change the landing
                vertical.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={atlasRoutes.explorer} className="obs-btn">
                  Open the explorer
                </Link>
              </div>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <dt className="text-xs uppercase tracking-wider text-white/55">Countries with offices</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {catalog.totals.countriesWithOffices.toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <dt className="text-xs uppercase tracking-wider text-white/55">Offices</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {catalog.totals.offices.toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <dt className="text-xs uppercase tracking-wider text-white/55">Election events</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums">
                    {catalog.totals.events.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="obs-heading text-2xl">Published lineages</h2>
            <p className="mt-2 text-sm text-navy/70">
              Each lineage is a serial publication in the same master file. Draft residual-heavy
              packs are not imported.
            </p>
            <ul className="mt-4 grid gap-3">
              {catalog.lineages.map((lineage) => (
                <li key={lineage.lineageId} className="obs-card p-4">
                  <p className="font-semibold text-navy">{lineage.description}</p>
                  <p className="mt-1 text-sm text-navy/70">
                    {lineage.lineageId} · {lineage.officeCount.toLocaleString()} offices
                    {lineage.snapshotLabel ? ` · snapshot ${lineage.snapshotLabel}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="obs-heading text-2xl">Countries and offices</h2>
            <p className="mt-2 text-sm text-navy/70">
              Sorted Europe first, then other loaded regions. Counts are recomputed from SQLite.
            </p>
            <div className="mt-4">
              <DataTable
                caption="Loaded Atlas countries"
                columns={["Country", "Region", "Offices", "Events", "Coverage"]}
                empty="No office-bearing countries are loaded."
                rows={catalog.countries.map((country) => [
                  <Link key={country.countryId} href={atlasRoutes.country(country.countryId)} className="obs-link">
                    {country.name}
                  </Link>,
                  formatAtlasRegion(country.regionId),
                  country.officeCount.toLocaleString(),
                  country.eventCount.toLocaleString(),
                  country.coverageStatus.replaceAll("_", " "),
                ])}
              />
            </div>
          </section>

          {catalog.statusOnlyCountries.length > 0 ? (
            <section className="mt-10">
              <h2 className="obs-heading text-xl">Status-only country rows</h2>
              <p className="mt-2 text-sm text-navy/70">
                These rows come from LatAm <code>base.json.gz</code> and have no imported offices.
                Residual-heavy draft packs remain skipped.
              </p>
              <p className="mt-2 text-sm text-navy/65">
                {catalog.statusOnlyCountries.map((row) => row.name).join(", ")}
              </p>
            </section>
          ) : null}

          <p className="mt-10 text-xs text-navy/55">
            SQLite path: {catalog.sqlitePath}. Tier vocabulary: {formatAtlasTier("municipal")},{" "}
            {formatAtlasTier("regional")}, {formatAtlasTier("national_context")}. The observatory
            catalogue at /electiondatabase is unchanged.
          </p>
        </>
      )}
    </>
  );
}
