import Link from "next/link";
import { EmptyState } from "./empty-state";
import { RecordDetails } from "./record-details";

export type AmbiguousCandidate = {
  id: string;
  name: string;
  jurisdiction: string;
  href: string | null;
};

export function AmbiguousIdentifier({
  kind,
  namespaces,
  candidates = [],
}: {
  kind: "office" | "election";
  namespaces: string[];
  candidates?: AmbiguousCandidate[];
}) {
  return (
    <>
      <EmptyState variant="conflicting" title="More than one record matches">
        <p>
          This {kind} identifier matches {namespaces.length} records, so it is not opened as a single page.
        </p>
        {candidates.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                {candidate.href ? (
                  <Link href={candidate.href} className="font-semibold text-atlas-accent hover:underline">
                    {candidate.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-atlas-ink">{candidate.name}</span>
                )}
                <span className="text-atlas-ink-2"> · {candidate.jurisdiction}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </EmptyState>
      <RecordDetails idNamespace={namespaces.join(", ")}>
        <p>
          Prompt B uniqueness for this public identifier is the pair of id namespace and record id.
          Matching namespaces are listed here and are not chosen automatically.
        </p>
      </RecordDetails>
    </>
  );
}
