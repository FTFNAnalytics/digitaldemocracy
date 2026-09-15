import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { MetricPill } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import { parseOfficeListParam } from "@/lib/observatory/filters";
import {
  compareCompatibility,
  getOffice,
  metricsForOffice,
  selectedEventsForOffice,
} from "@/lib/observatory/load";
import { formatNumeric } from "@/lib/observatory/format";
import { obsRoutes } from "@/lib/observatory/routes";

export const metadata: Metadata = { title: "Compare offices" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const fromList = parseOfficeListParam(params.offices);
  const singles = ["a", "b", "c", "d"]
    .map((key) => (Array.isArray(params[key]) ? params[key][0] : params[key]))
    .filter((value): value is string => Boolean(value));
  const ids = [...new Set(fromList.length ? fromList : singles)].slice(0, 4);
  const offices = ids
    .map((id) => getOffice(id))
    .filter((office): office is NonNullable<typeof office> => Boolean(office));
  const notes = compareCompatibility(offices.map((office) => office.id));

  return (
    <>
      <PageHeader
        eyebrow="Comparison"
        title="Compare offices"
        description="Compare two to four offices: next dates, selected histories, and qualified metrics. Incompatible comparisons are explained rather than forced."
      />
      <UrlFilterForm
        fields={[
          {
            key: "a",
            label: "Office A",
            placeholder: "Office ID, e.g. EC-P-1",
          },
          {
            key: "b",
            label: "Office B",
            placeholder: "Office ID, e.g. EC-P-1",
          },
          {
            key: "c",
            label: "Office C",
            placeholder: "Office ID, e.g. EC-P-1",
          },
          {
            key: "d",
            label: "Office D",
            placeholder: "Office ID, e.g. EC-P-1",
          },
        ]}
        submitLabel="Compare"
      />

      {offices.length < 2 ? (
        <p className="text-sm text-navy/70">
          Enter at least two office IDs from the{" "}
          <Link href={obsRoutes.explorer} className="obs-link">
            explorer
          </Link>{" "}
          or office pages. Filters stay in the URL.
        </p>
      ) : (
        <>
          {notes.length > 0 ? (
            <div className="mb-6 rounded-2xl border border-amber-800/25 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold">Comparison limits</p>
              <ul className="mt-2 list-disc pl-5">
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {offices.map((office) => {
              const selected = selectedEventsForOffice(office.id);
              const metrics = metricsForOffice(office.id);
              return (
                <section key={office.id} className="obs-card p-4">
                  <h2 className="obs-heading text-xl">
                    <Link
                      href={obsRoutes.office(office.id)}
                      className="hover:text-navy-600"
                    >
                      {office.names.official}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-navy/65">
                    Next:{" "}
                    {office.nextElection
                      ? formatResearchDate(office.nextElection.date)
                      : "—"}
                  </p>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-navy/55">
                    Selected cycles
                  </h3>
                  <DataTable
                    caption={`Selected cycles for ${office.id}`}
                    columns={["Date", "Outcome"]}
                    rows={selected.map((event) => [
                      formatResearchDate(event.date),
                      event.legalOutcome,
                    ])}
                    empty="No selected cycles."
                  />
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-navy/55">
                    Metrics
                  </h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {metrics.map((metric) => (
                      <li
                        key={metric.id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          {metric.kind.replaceAll("_", " ")} ·{" "}
                          {formatNumeric(metric.value)}
                        </span>
                        <MetricPill
                          status={metric.reviewStatus}
                          kind={metric.kind}
                          scoreGate={metric.scoreGate}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
