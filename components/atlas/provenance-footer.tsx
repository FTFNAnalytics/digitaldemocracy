import { NOT_SUPPLIED, present } from "./labels";

const CORRECTION_ENDPOINT = "https://github.com/FTFNAnalytics/digitaldemocracy/issues/new";

export function correctionHref(recordId: string): string {
  const body = [
    "## Affected records",
    "",
    `- Office / event / source IDs: ${recordId}`,
    "",
    "## Claim that is wrong",
    "",
    "## Replacement claim",
    "",
    "## Source",
    "",
    "- Publisher:",
    "- Title:",
    "- URL or locator:",
    "- Date:",
    "- What the source actually supports:",
    "",
    "Do not invent missing values. Do not coerce partial dates to the first of a month.",
  ].join("\n");
  const params = new URLSearchParams({
    template: "research-correction.md",
    title: `[research] ${recordId}`,
    body,
  });
  return `${CORRECTION_ENDPOINT}?${params.toString()}`;
}

function SourceFact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-atlas-ink-2">{label}</dt>
      <dd className="mt-0.5 text-atlas-ink">{children}</dd>
    </div>
  );
}

export function ProvenanceFooter({
  publisher,
  title,
  url,
  snapshotLabel,
  evidenceGrade,
  recordId,
}: {
  publisher: string | null;
  title: string | null;
  url: string | null;
  snapshotLabel: string | null;
  evidenceGrade: string | null;
  recordId: string;
}) {
  const href = present(url);
  return (
    <footer className="mt-4 rounded-2xl border border-atlas-line bg-atlas-map-none px-4 py-3 text-sm">
      <h2 className="font-atlas-heading text-base text-atlas-ink">Source</h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <SourceFact label="Publisher">{present(publisher) ?? NOT_SUPPLIED}</SourceFact>
        <SourceFact label="Title">{present(title) ?? NOT_SUPPLIED}</SourceFact>
        <SourceFact label="URL">
          {href ? (
            <a href={href} className="text-atlas-accent hover:underline">
              {href}
            </a>
          ) : (
            NOT_SUPPLIED
          )}
        </SourceFact>
        <SourceFact label="Snapshot">{present(snapshotLabel) ?? NOT_SUPPLIED}</SourceFact>
        <SourceFact label="Evidence grade">{present(evidenceGrade) ?? NOT_SUPPLIED}</SourceFact>
      </dl>
      <p className="mt-3">
        <a href={correctionHref(recordId)} className="font-semibold text-atlas-accent hover:underline">
          Report a correction
        </a>
      </p>
    </footer>
  );
}
