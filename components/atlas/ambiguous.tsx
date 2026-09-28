import { EmptyState } from "./empty-state";
import { RecordDetails } from "./record-details";

export function AmbiguousIdentifier({
  kind,
  namespaces,
}: {
  kind: "office" | "election";
  namespaces: string[];
}) {
  return (
    <>
      <EmptyState variant="conflicting" title="More than one record matches">
        <p>
          This {kind} identifier matches {namespaces.length} records, so it is not opened as a single page.
        </p>
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
