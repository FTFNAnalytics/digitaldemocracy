import type { HeaderFact } from "./types";

export function PageHeader({
  name,
  level,
  facts = [],
  nextElection,
}: {
  name: string;
  level?: string | null;
  facts?: HeaderFact[];
  nextElection?: { label: string } | null;
}) {
  return (
    <header className="mb-8 border-b border-atlas-line pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-atlas-heading text-3xl tracking-tight text-atlas-ink sm:text-4xl">{name}</h1>
        {level ? (
          <span className="rounded-full border border-atlas-line bg-atlas-tint px-2.5 py-0.5 text-xs font-semibold text-atlas-ink">
            {level}
          </span>
        ) : null}
      </div>
      {facts.length > 0 ? (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">{fact.label}</dt>
              <dd className="mt-0.5 text-atlas-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {nextElection !== undefined ? (
        <p className="mt-4">
          {nextElection ? (
            <span className="inline-flex rounded-full border border-atlas-amber bg-atlas-card px-2.5 py-0.5 text-sm font-semibold text-atlas-amber">
              Next election {nextElection.label}
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-atlas-line bg-atlas-card px-2.5 py-0.5 text-sm text-atlas-ink-2">
              Next election not supplied
            </span>
          )}
        </p>
      ) : null}
    </header>
  );
}
