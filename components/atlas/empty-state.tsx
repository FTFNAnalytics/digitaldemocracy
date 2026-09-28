export type AtlasEmptyVariant = "not_supplied" | "queued" | "withheld" | "conflicting";

const VARIANT_COPY: Record<AtlasEmptyVariant, { title: string; body: string }> = {
  not_supplied: {
    title: "Not supplied",
    body: "This was not supplied. Missing is not shown as zero.",
  },
  queued: {
    title: "Not yet ingested",
    body: "These records are not in the Atlas yet.",
  },
  withheld: {
    title: "Withheld",
    body: "A source withheld this value. It is not shown as zero.",
  },
  conflicting: {
    title: "Conflicting records",
    body: "More than one record matches, so none is chosen automatically.",
  },
};

export function EmptyState({
  variant,
  title,
  children,
}: {
  variant: AtlasEmptyVariant;
  title?: string;
  children?: React.ReactNode;
}) {
  const copy = VARIANT_COPY[variant];
  return (
    <div
      className="rounded-2xl border border-dashed border-atlas-line bg-atlas-card px-5 py-8"
      data-atlas-empty={variant}
    >
      <p className="font-atlas-heading text-lg text-atlas-ink">{title ?? copy.title}</p>
      <div className="mt-2 text-sm leading-relaxed text-atlas-ink-2">{children ?? <p>{copy.body}</p>}</div>
    </div>
  );
}
