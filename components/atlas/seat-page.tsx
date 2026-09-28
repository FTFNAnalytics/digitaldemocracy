import Link from "next/link";
import { Breadcrumb } from "./breadcrumb";
import { CycleShareChart } from "./cycle-share-chart";
import { EmptyState } from "./empty-state";
import { PageHeader } from "./page-header";
import { ProvenanceFooter } from "./provenance-footer";
import { RecordDetails } from "./record-details";
import { SeatHistoryTable } from "./seat-history";
import { atlasRoutes } from "@/lib/atlas/routes";
import type { SeatPageModel } from "@/lib/atlas/seat/read";

export function SeatPageView({ model }: { model: SeatPageModel }) {
  const facts = [
    ...(model.electoralSystem ? [{ label: "Electoral system", value: model.electoralSystem }] : []),
    ...(model.termYears != null ? [{ label: "Term length", value: `${model.termYears} years` }] : []),
  ];

  return (
    <>
      <Breadcrumb items={model.crumbs} />
      <PageHeader
        name={model.officeName}
        level={model.kind}
        facts={facts}
        summary={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p data-seat-holder={model.holderShown ? "yes" : "no"}>{model.holderPhrase}</p>
            <a
              href={atlasRoutes.officeCsv(model.officeId)}
              className="font-semibold text-atlas-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-accent"
            >
              Download
            </a>
          </div>
        }
        nextElection={model.nextElectionLabel ? { label: model.nextElectionLabel } : null}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <h2 className="font-atlas-heading text-2xl text-atlas-ink">Results by election cycle</h2>
          {model.history.length === 0 ? (
            <div className="mt-4">
              <EmptyState variant="queued" title="Not yet ingested">
                <p>No elections are on file for this office.</p>
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <CycleShareChart
                  points={model.history.map((row) => ({
                    id: row.eventId,
                    label: row.cycle,
                    share: row.winnerShare,
                    shareUnit: row.winnerShareUnit,
                  }))}
                />
              </div>
              <div className="mt-6">
                <SeatHistoryTable rows={model.history} />
              </div>
            </>
          )}
          <div className="mt-4 space-y-4">
            {model.provenance.map((source) => (
              <ProvenanceFooter
                key={source.eventId ?? source.recordId}
                publisher={source.publisher}
                title={source.title}
                url={source.url}
                snapshotLabel={source.snapshotLabel}
                evidenceGrade={source.evidenceGrade}
                recordId={source.recordId}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="font-atlas-heading text-xl text-atlas-ink">Officeholders</h2>
            {model.timeline.length === 0 ? (
              <p className="mt-3 text-sm text-atlas-ink-2">No officeholder is on file.</p>
            ) : (
              <ol className="mt-3 space-y-3 border-l border-atlas-line pl-4">
                {model.timeline.map((entry) => (
                  <li key={entry.eventId} data-timeline={entry.kind} data-timeline-event={entry.eventId}>
                    <p className="text-sm text-atlas-ink-2">{entry.cycle}</p>
                    {entry.kind === "holder" ? (
                      <p className="text-atlas-ink">
                        {entry.holder ?? "not supplied"}
                        {entry.party ? <span className="text-atlas-ink-2"> · {entry.party}</span> : null}
                      </p>
                    ) : (
                      <p className="text-atlas-ink-2">Gap · holder not supplied</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h2 className="font-atlas-heading text-xl text-atlas-ink">Related</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">Parent jurisdiction</dt>
                <dd className="mt-0.5">
                  {model.related.parent ? (
                    <Link href={model.related.parent.href} className="font-semibold text-atlas-accent hover:underline">
                      {model.related.parent.label}
                    </Link>
                  ) : (
                    "not supplied"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">Sibling seats</dt>
                <dd className="mt-0.5">
                  {model.related.siblings.length === 0 ? (
                    "not supplied"
                  ) : (
                    <ul className="space-y-1">
                      {model.related.siblings.map((seat) => (
                        <li key={seat.href}>
                          <Link href={seat.href} className="font-semibold text-atlas-accent hover:underline">
                            {seat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">Previous cycle</dt>
                <dd className="mt-0.5">
                  {model.related.previous ? (
                    <Link href={model.related.previous.href} className="font-semibold text-atlas-accent hover:underline">
                      {model.related.previous.label}
                    </Link>
                  ) : (
                    "not supplied"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">Next cycle</dt>
                <dd className="mt-0.5">
                  {model.related.next ? (
                    <Link href={model.related.next.href} className="font-semibold text-atlas-accent hover:underline">
                      {model.related.next.label}
                    </Link>
                  ) : (
                    "not supplied"
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <RecordDetails
        officeId={model.officeId}
        idNamespace={model.idNamespace}
        lineageId={model.lineageId}
        releaseId={model.releaseId}
        historyKey={model.historyKeys.length === 1 ? model.historyKeys[0] : null}
      >
        {model.historyKeys.length > 1 ? (
          <p>History keys: {model.historyKeys.join(", ")}</p>
        ) : null}
      </RecordDetails>
    </>
  );
}
