import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { CoveragePill, EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import { getCountry, getDefaultRegion, getDataset, upcomingEvents } from "@/lib/observatory/load";
import { getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";

export const metadata: Metadata = {
  title: "Home",
};

export default function ObservatoryHomePage() {
  const release = getDataset().release;
  const southAmerica = getDefaultRegion();
  const upcoming = upcomingEvents();

  return (
    <>
      <PageHeader
        eyebrow="The Center for Digital Democracy"
        title="Subnational Election Observatory"
        description="A public research publication for regional, municipal, and council elections: searchable, comparable, and downloadable once a validated release is imported. South America is the default landing region and the first import priority."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-sm border border-obs-rule bg-white p-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-obs-teal">
            Priority region
          </p>
          <h2 className="mt-2 font-serif text-2xl text-navy">{southAmerica?.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-navy/75">{southAmerica?.notes}</p>
          <div className="mt-3">
            <CoveragePill status={southAmerica?.status ?? "not_supplied"} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={obsRoutes.regions}
              className="rounded-sm bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
            >
              Enter South America
            </Link>
            <Link
              href={obsRoutes.explorer}
              className="rounded-sm border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-obs-paper"
            >
              Open the explorer
            </Link>
          </div>
        </section>

        <aside className="rounded-sm border border-obs-rule bg-white p-6">
          <h2 className="font-serif text-xl text-navy">Release window</h2>
          <p className="mt-2 text-sm text-navy/75">
            Expected inclusive window from the build prompt (not yet imported):{" "}
            <span className="tabular-nums">
              {release.window.startLabel}–{release.window.endLabel}
            </span>
            .
          </p>
          <p className="mt-3 text-sm text-navy/75">
            Snapshot: {release.snapshotLabel ?? "not imported"}. Retrieval range:{" "}
            {release.retrievalRangeLabel ?? "not imported"}.
          </p>
          <p className="mt-3 text-xs text-navy/55">
            Handoff headline counts (12,738 South American current offices, and the broader
            18,229 figure) are reconciliation expectations for the missing zip — they are not
            shown as live coverage totals.
          </p>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-navy">Coverage totals</h2>
        <p className="mt-2 max-w-3xl text-sm text-navy/70">
          Denominators stay explicit. Fixture counts are labelled and excluded from any
          “research complete” claim. Unknown real-world totals remain unknown.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <TotalCard
            label="Tracked current offices (imported)"
            value="—"
            note={`Awaiting ${RELEASE_PACKAGE_FILENAME}`}
          />
          <TotalCard
            label="Historical offices (imported)"
            value="—"
            note="Excluded from current-office totals once imported"
          />
          <TotalCard
            label="Synthetic fixture offices (smoke tests)"
            value={String(release.validatedCounts.currentOffices)}
            note="Not Latin America research"
          />
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-navy">Upcoming elections</h2>
        <p className="mt-2 text-sm text-navy/70">
          Searchable list of next dates in the loaded dataset. Partial dates keep their
          supplied precision.
        </p>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No upcoming elections imported">
              Drop {RELEASE_PACKAGE_FILENAME} and run <code>npm run import:data</code>.
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
                    <Link key={event.id} href={obsRoutes.office(office.id)} className="text-obs-teal hover:underline">
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
              Rows above are synthetic fixtures used to prove the table and URL routes.
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
    <div className="rounded-sm border border-obs-rule bg-white px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy/55">{label}</dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums text-navy">{value}</dd>
      <p className="mt-1 text-xs text-navy/60">{note}</p>
    </div>
  );
}
