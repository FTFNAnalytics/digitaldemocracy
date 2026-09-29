import type { UpcomingElectionFamily, UpcomingElectionsModel } from "@/lib/atlas/upcoming-elections";

function KindMark({ family }: { family: UpcomingElectionFamily }) {
  if (family.kind === "conditional") {
    return (
      <p className="mt-2 text-sm leading-relaxed text-atlas-ink">
        <span className="mr-2 inline-flex rounded-full border border-atlas-amber bg-atlas-card px-2.5 py-0.5 text-xs font-semibold text-atlas-amber">
          Conditional
        </span>
        {family.condition}
      </p>
    );
  }
  if (family.kind === "indirect") {
    return (
      <p className="mt-2">
        <span className="inline-flex rounded-full border border-atlas-line bg-atlas-card px-2.5 py-0.5 text-xs font-semibold text-atlas-ink">
          Indirect selection / context only
        </span>
      </p>
    );
  }
  return null;
}

export function UpcomingElectionsCallout({ model }: { model: UpcomingElectionsModel }) {
  return (
    <section
      id="upcoming-elections"
      aria-labelledby="atlas-upcoming-elections-heading"
      data-atlas-upcoming-elections={model.countryId}
      className="mb-10 rounded-2xl border-2 border-atlas-accent bg-atlas-card px-5 py-5 sm:px-6"
    >
      <h2 id="atlas-upcoming-elections-heading" className="font-atlas-heading text-2xl text-atlas-ink">
        Upcoming elections
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">{model.intro}</p>
      <ul className="mt-4 divide-y divide-atlas-line border-t border-atlas-line">
        {model.families.map((family) => (
          <li key={family.id} data-atlas-upcoming-family={family.id} className="py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <p className="font-semibold text-atlas-ink">{family.label}</p>
              <p className="text-sm font-semibold text-atlas-accent" data-atlas-upcoming-when={family.id}>
                {family.when}
              </p>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">{family.basis}</p>
            <KindMark family={family} />
          </li>
        ))}
      </ul>
      {model.holds.length > 0 ? (
        <div className="mt-2 rounded-2xl border border-dashed border-atlas-line px-4 py-3" data-atlas-upcoming-hold="true">
          <p className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">Research hold</p>
          <ul className="mt-2 space-y-3">
            {model.holds.map((hold) => (
              <li key={hold.id} data-atlas-upcoming-hold-id={hold.id}>
                <p className="font-semibold text-atlas-ink">{hold.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-atlas-ink-2">{hold.note}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
