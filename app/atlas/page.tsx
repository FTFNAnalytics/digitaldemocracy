import Link from "next/link";
import { CoverageBar, CoverageChip } from "@/components/atlas/coverage";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { formatAtlasRegion, loadAtlasCatalog } from "@/lib/atlas/read";
import { jurisdictionPublicPath, listCountryCards } from "@/lib/atlas/jurisdiction";
import { atlasRoutes } from "@/lib/atlas/routes";
import type { AtlasCoverageSnapshot } from "@/components/atlas/types";

export const dynamic = "force-dynamic";

function coverageSnapshot(card: ReturnType<typeof listCountryCards>[number]): AtlasCoverageSnapshot | null {
  if (!card.coverage) return null;
  return {
    offices: card.coverage.offices,
    officesWithAnyEvent: card.coverage.officesWithAnyEvent,
    officesWithResults: card.coverage.officesWithResults,
    eventsTotal: card.coverage.eventsTotal,
    eventsWithResults: card.coverage.eventsWithResults,
    notSuppliedNextDates: card.coverage.notSuppliedNextDates,
    latestSnapshotLabel: card.coverage.latestSnapshotLabel,
  };
}

export default function AtlasIndexPage() {
  const catalog = loadAtlasCatalog();

  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const cards = new Map(listCountryCards().map((card) => [card.countryId, card]));
  const groups: Array<{ regionId: string; label: string; countries: typeof catalog.countries }> = [];
  for (const country of catalog.countries) {
    const current = groups[groups.length - 1];
    if (!current || current.regionId !== country.regionId) {
      groups.push({ regionId: country.regionId, label: formatAtlasRegion(country.regionId), countries: [country] });
    } else {
      current.countries.push(country);
    }
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
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">
          The Election Atlas starts with Europe and lists every country that is loaded.
        </p>
        <div className="mt-5">
          <Link href={atlasRoutes.explorer} className="obs-btn">
            Open the explorer
          </Link>
        </div>
      </section>

      <section className="mt-10" aria-label="What's new">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">What&apos;s new</h2>
        <ul className="mt-4 grid gap-3">
          {catalog.lineages.length === 0 ? (
            <li className="text-sm text-atlas-ink-2">No snapshots are loaded.</li>
          ) : (
            catalog.lineages.map((row) => (
              <li key={row.lineageId} className="rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
                <p className="font-semibold text-atlas-ink">{row.snapshotLabel ?? "Snapshot not supplied"}</p>
                <p className="mt-1 text-sm text-atlas-ink-2">{row.officeCount.toLocaleString()} offices</p>
              </li>
            ))
          )}
        </ul>
        <p className="mt-3 text-sm">
          <Link href={atlasRoutes.releases} className="font-semibold text-atlas-accent hover:underline">
            Release list
          </Link>
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.regionId} className="mt-10" aria-labelledby={`atlas-region-${group.regionId}`}>
          <h2 id={`atlas-region-${group.regionId}`} className="font-atlas-heading text-2xl text-atlas-ink">
            {group.label}
          </h2>
          <ul className="mt-4 grid gap-3">
            {group.countries.map((country) => {
              const card = cards.get(country.countryId);
              const href = card ? jurisdictionPublicPath(card.slugPath) : atlasRoutes.country(country.countryId);
              const snapshot = card ? coverageSnapshot(card) : null;
              return (
                <li key={country.countryId} className="rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link href={href} className="font-semibold text-atlas-accent hover:underline">
                      {country.name}
                    </Link>
                    <span className="text-sm text-atlas-ink-2">{country.officeCount.toLocaleString()} offices</span>
                  </div>
                  <div className="mt-2">
                    {snapshot ? <CoverageBar coverage={snapshot} /> : <CoverageChip storedStatus={country.coverageStatus} />}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {catalog.statusOnlyCountries.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-atlas-heading text-xl text-atlas-ink">Countries with no offices loaded</h2>
          <p className="mt-2 text-sm text-atlas-ink-2">
            {catalog.statusOnlyCountries.map((row) => row.name).join(", ")}
          </p>
        </section>
      ) : null}
    </>
  );
}
