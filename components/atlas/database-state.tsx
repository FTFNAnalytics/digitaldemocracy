import { EmptyState } from "./empty-state";
import { RecordDetails } from "./record-details";

export function DatabaseUnavailable({
  message,
  sqlitePath,
}: {
  message: string;
  sqlitePath?: string | null;
}) {
  return (
    <EmptyState variant="queued" title="Atlas database is not loaded">
      <p>The Atlas cannot be read yet.</p>
      <RecordDetails>
        <p>{message}</p>
        {sqlitePath ? <p>Resolved path: {sqlitePath}</p> : null}
      </RecordDetails>
    </EmptyState>
  );
}
