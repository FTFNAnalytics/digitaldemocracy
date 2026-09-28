import Link from "next/link";
import { Breadcrumb } from "./breadcrumb";
import { ChildrenPanel } from "./children-panel";
import { EmptyState } from "./empty-state";
import { NOT_SUPPLIED } from "./labels";
import { PageHeader } from "./page-header";
import { PlainTable } from "./plain-table";
import type { Crumb, CycleChip, HeaderFact, JurisdictionChild, SeatRow } from "./types";

export function SeatsAtLevel({ seats }: { seats: SeatRow[] }) {
  if (seats.length === 0) {
    return (
      <EmptyState variant="not_supplied" title="No seats at this level">
        <p>No seats are listed here.</p>
      </EmptyState>
    );
  }
  return (
    <PlainTable
      caption="Seats at this level"
      columns={["Seat", "Held by", "Since", "Last result"]}
      rows={seats.map((seat) => [
        <Link key={seat.id} href={seat.href} className="font-semibold text-atlas-accent hover:underline">
          {seat.name}
        </Link>,
        seat.heldBy ?? NOT_SUPPLIED,
        seat.since ?? NOT_SUPPLIED,
        seat.lastResult ?? NOT_SUPPLIED,
      ])}
    />
  );
}

export function CyclesAtLevel({ cycles }: { cycles: CycleChip[] }) {
  if (cycles.length === 0) {
    return (
      <EmptyState variant="not_supplied" title="No election cycles">
        <p>No election cycles are listed here.</p>
      </EmptyState>
    );
  }
  return (
    <ul aria-label="Election cycles" className="flex flex-wrap gap-2">
      {cycles.map((cycle) => (
        <li key={cycle.id}>
          <Link
            href={cycle.href}
            data-atlas-cycle={cycle.hasResults ? "results" : "none"}
            className={
              cycle.hasResults
                ? "inline-flex flex-col rounded-2xl border border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink hover:bg-atlas-tint"
                : "inline-flex flex-col rounded-2xl border border-dashed border-atlas-line bg-atlas-card px-3 py-2 text-atlas-ink-2 hover:bg-atlas-tint"
            }
          >
            <span className="font-semibold">{cycle.year}</span>
            <span className="text-xs">{cycle.hasResults ? "Results on file" : "No results yet"}</span>
            <span className="sr-only">{cycle.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function JurisdictionTemplate({
  breadcrumb,
  name,
  level,
  facts,
  nextElection,
  places,
  seats,
  cycles,
}: {
  breadcrumb: Crumb[];
  name: string;
  level?: string | null;
  facts?: HeaderFact[];
  nextElection?: { label: string } | null;
  places: JurisdictionChild[];
  seats: SeatRow[];
  cycles: CycleChip[];
}) {
  return (
    <article>
      <Breadcrumb items={breadcrumb} />
      <PageHeader name={name} level={level} facts={facts} nextElection={nextElection} />
      <section className="mb-10" aria-labelledby="atlas-children-heading">
        <h2 id="atlas-children-heading" className="mb-3 font-atlas-heading text-2xl text-atlas-ink">
          Places
        </h2>
        {places.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div
              id="atlas-map-slot"
              data-atlas-map-slot="true"
              className="min-h-48 rounded-2xl border border-dashed border-atlas-line bg-atlas-map p-4"
            >
              <p className="text-sm font-semibold text-atlas-ink">Map pending boundary review</p>
              <div id="atlas-map-mount" data-atlas-map-mount="" />
            </div>
            <EmptyState variant="not_supplied" title="No places listed">
              <p>No child places are listed here.</p>
            </EmptyState>
          </div>
        ) : (
          <ChildrenPanel places={places} />
        )}
      </section>
      <section className="mb-10" aria-labelledby="atlas-seats-heading">
        <h2 id="atlas-seats-heading" className="mb-3 font-atlas-heading text-2xl text-atlas-ink">
          Seats
        </h2>
        <SeatsAtLevel seats={seats} />
      </section>
      <section aria-labelledby="atlas-cycles-heading">
        <h2 id="atlas-cycles-heading" className="mb-3 font-atlas-heading text-2xl text-atlas-ink">
          Election cycles
        </h2>
        <CyclesAtLevel cycles={cycles} />
      </section>
    </article>
  );
}
