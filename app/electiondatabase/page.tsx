import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { CoveragePill, EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import {
  getCountry,
  getDefaultRegion,
  getDataset,
  upcomingEvents,
} from "@/lib/observatory/load";
import { getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";

export const metadata: Metadata = pageMeta(staticPageSeo.observatory);

export default function ObservatoryHomePage() {
  const release = getDataset().release;
  const southAmerica = getDefaultRegion();
  const upcoming = upcomingEvents()
    .filter((e) => getCountry(e.countryId)?.regionId === "south-america")
    .slice(0, 20);

  return (
    <>
      <PageHeader
        eyebrow="The Center for Digital Democracy"
        title="Subnational Election Observatory"
        description="A public research publication for regional, municipal, and council elections: searchable, comparable, and downloadable. Start with South America and explore the imported Latin America release."
      >
        <p className="mt-4 text-sm text-navy/70">
          The SQLite-backed Election Atlas MVP is at{" "}
          <Link href="/atlas" className="obs-link">
            /atlas
          </Link>
          . This observatory catalogue stays at /electiondatabase.
        </p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(162_255_0/0.16)_1px,transparent_0)] bg-[size:22px_22px]"
            aria-hidden
          />
          <div className="relative">
            <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
              Priority region
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {southAmerica?.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {southAmerica?.notes}
            </p>
            <div className="mt-3">
              <CoveragePill status={southAmerica?.status ?? "not_supplied"} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={obsRoutes.regions} className="obs-btn">
                Enter South America
              </Link>
              <Link
                href={obsRoutes.explorer}
                className="inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white hover:border-accent hover:text-accent"
              >
                Open the explorer
              </Link>
            </div>
          </div>
        </section>

        <aside className="obs-card p-6">
          <h2 className="obs-heading text-xl">Release window</h2>
          <p className="mt-2 text-sm text-navy/75">
            Imported inclusive research window:{" "}
            <span className="tabular-nums">
              {release.window.startLabel}–{release.window.endLabel}
            </span>
            .
          </p>
          <p className="mt-3 text-sm text-navy/75">
            Snapshot: {release.snapshotLabel ?? "not imported"}. Retrieval
            range: {release.retrievalRangeLabel ?? "not imported"}.
          </p>
          <p className="mt-3 text-xs text-navy/55">
            Totals below are recomputed from imported records. An imported
            office does not imply complete returns, certified outcomes, or
            confirmed current officeholders.
          </p>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="obs-heading text-2xl">Coverage totals</h2>
        <p className="mt-2 max-w-3xl text-sm text-navy/70">
          Denominators distinguish tracked current offices, historical
          predecessors, and historical event records. Research completeness
          remains a separate assessment.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <TotalCard
            label="Tracked current offices (imported)"
            value={release.validatedCounts.currentOffices.toLocaleString()}
            note="Tracked offices across the imported release"
          />
          <TotalCard
            label="Historical offices (imported)"
            value={release.validatedCounts.historicalOffices.toLocaleString()}
            note="Excluded from current-office totals"
          />
          <TotalCard
            label="Historical event records"
            value={release.validatedCounts.histories.toLocaleString()}
            note={`${release.validatedCounts.resultRows.toLocaleString()} result rows; evidence status varies`}
          />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="obs-heading text-2xl">Upcoming elections</h2>
        <p className="mt-2 text-sm text-navy/70">
          Searchable list of next dates in the loaded dataset. Partial dates
          keep their supplied precision.
        </p>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No upcoming elections imported">
              Drop {RELEASE_PACKAGE_FILENAME} and run{" "}
              <code>npm run import:data</code>.
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              caption="Upcoming elections in the loaded dataset"
              columns={["Date", "Certainty", "Office", "Country"]}
              rows={upcoming.map((event) => {
                const office = getOffice(event.officeId);
                const country = getCountry(event.countryId);
                return [
                  formatResearchDate(event.date),
                  event.date.certainty,
                  office ? (
                    <Link
                      key={event.id}
                      href={obsRoutes.office(office.id)}
                      className="obs-link"
                    >
                      {office.names.short}
                    </Link>
                  ) : (
                    event.officeId
                  ),
                  country?.names.short ?? event.countryId,
                ];
              })}
            />
            <p className="mt-2 text-xs text-navy/55">
              First 20 South American entries.{" "}
              <Link href={obsRoutes.calendar} className="obs-link">
                Browse the full calendar
              </Link>
              .
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function TotalCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="obs-card px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy/55">
        {label}
      </dt>
      <dd className="mt-1 obs-heading text-3xl tabular-nums">{value}</dd>
      <p className="mt-1 text-xs text-navy/60">{note}</p>
    </div>
  );
}
