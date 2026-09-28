import Link from "next/link";
import { Breadcrumb } from "./breadcrumb";
import { CycleShareChart } from "./cycle-share-chart";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import type { PersonPageModel } from "@/lib/atlas/people/read";

function sourceLine(count: number, reviewedOn: string | null): string {
  const labels = count === 1 ? "1 source label" : `${count} source labels`;
  return `Merged from ${labels} · reviewed ${reviewedOn ?? "not supplied"}`;
}

export function PersonPageView({ model }: { model: PersonPageModel }) {
  return (
    <article data-person-id={model.personId} data-person-slug={model.slug}>
      <Breadcrumb items={model.crumbs} />
      <PageHeader
        name={model.canonicalLabel}
        level={model.countryName}
        facts={[
          { label: "Source labels", value: String(model.sourceLabelCount) },
          { label: "Reviewed", value: model.reviewedOn ?? "not supplied" },
        ]}
        summary={
          <div className="space-y-2">
            {model.inOffice ? (
              <p>
                <span
                  data-in-office="yes"
                  className="inline-flex rounded-full bg-atlas-accent px-2.5 py-0.5 text-sm font-semibold text-atlas-on-accent"
                >
                  In office
                </span>
              </p>
            ) : (
              <p data-in-office="no" className="sr-only">
                No current office on file
              </p>
            )}
            {model.alsoRecordedAs.length > 0 ? (
              <p data-also-recorded-as="yes">
                Also recorded as {model.alsoRecordedAs.join(", ")}
              </p>
            ) : null}
            <p data-merge-line="yes">{sourceLine(model.sourceLabelCount, model.reviewedOn)}</p>
          </div>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h2 className="font-atlas-heading text-2xl text-atlas-ink">Electoral history</h2>
          {model.history.length === 0 ? (
            <div className="mt-4">
              <EmptyState variant="queued" title="No results on file">
                <p>No election result on file for the approved names.</p>
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <h3 className="mb-3 text-sm font-semibold text-atlas-ink">Share by race</h3>
                <CycleShareChart
                  points={model.history.map((row) => ({
                    id: row.id,
                    label: row.year,
                    share: row.shareValue,
                    shareUnit: row.shareUnit,
                  }))}
                />
              </div>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-atlas-line bg-atlas-card">
                <table className="w-full min-w-[48rem] border-collapse text-sm text-atlas-ink">
                  <caption className="px-3 py-3 text-left text-sm font-semibold text-atlas-ink">Electoral history</caption>
                  <thead>
                    <tr className="border-b border-atlas-line text-left">
                      {["Year", "Election", "Seat", "Result", "Votes", "Share", "Margin"].map((column) => (
                        <th key={column} scope="col" className="px-3 py-2 font-semibold">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {model.history.map((row) => (
                      <tr key={row.id} data-history-label={row.label} className="border-b border-atlas-line align-top last:border-0">
                        <td className="px-3 py-2.5">{row.year}</td>
                        <td className="px-3 py-2.5">{row.election}</td>
                        <td className="px-3 py-2.5">
                          <Link href={row.seatHref} className="font-medium text-atlas-accent hover:underline">
                            {row.seat}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5">{row.result}</td>
                        <td className="px-3 py-2.5">{row.votes}</td>
                        <td className="px-3 py-2.5">{row.share}</td>
                        <td className="px-3 py-2.5">{row.margin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="font-atlas-heading text-xl text-atlas-ink">Offices held</h2>
            {model.officesHeld.length === 0 ? (
              <p className="mt-3 text-sm text-atlas-ink-2">No office is on file.</p>
            ) : (
              <ol className="mt-3 space-y-3 border-l border-atlas-line pl-4">
                {model.officesHeld.map((entry) => (
                  <li key={entry.id} data-office-held={entry.id}>
                    <p className="text-sm text-atlas-ink-2">{entry.when}</p>
                    <p>
                      <Link href={entry.href} className="text-atlas-accent hover:underline">
                        {entry.officeName}
                      </Link>
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <p>
            <a href={model.splitHref} className="font-semibold text-atlas-accent hover:underline">
              These are two different people
            </a>
          </p>
        </aside>
      </div>

      <details data-atlas-record-details="true" className="mt-8 rounded-xl border border-atlas-line bg-atlas-card px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold text-atlas-ink">Record details</summary>
        <dl className="mt-3 grid gap-1 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold text-atlas-ink">person_id</dt>
          <dd className="text-atlas-ink-2">{model.personId}</dd>
          <dt className="font-semibold text-atlas-ink">release_id</dt>
          <dd className="text-atlas-ink-2">{model.releaseId ?? "not supplied"}</dd>
        </dl>
      </details>
    </article>
  );
}
