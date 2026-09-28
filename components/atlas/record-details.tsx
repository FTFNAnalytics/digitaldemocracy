import { NOT_SUPPLIED, present } from "./labels";

function Detail({ term, value }: { term: string; value: string | null | undefined }) {
  return (
    <>
      <dt className="font-semibold text-atlas-ink">{term}</dt>
      <dd className="text-atlas-ink-2">{present(value) ?? NOT_SUPPLIED}</dd>
    </>
  );
}

export function RecordDetails({
  officeId,
  idNamespace,
  lineageId,
  releaseId,
  historyKey,
  children,
}: {
  officeId?: string | null;
  idNamespace?: string | null;
  lineageId?: string | null;
  releaseId?: string | null;
  historyKey?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <details data-atlas-record-details="true" className="atlas-record-details mt-6 rounded-xl border border-atlas-line bg-atlas-card px-4 py-3 text-sm">
      <summary className="cursor-pointer font-semibold text-atlas-ink">Record details</summary>
      <dl className="mt-3 grid gap-1 sm:grid-cols-[10rem_1fr]">
        <Detail term="office_id" value={officeId} />
        <Detail term="id_namespace" value={idNamespace} />
        <Detail term="lineage_id" value={lineageId} />
        <Detail term="release_id" value={releaseId} />
        <Detail term="history_key" value={historyKey} />
      </dl>
      {children ? <div className="mt-3 space-y-2 text-atlas-ink-2">{children}</div> : null}
    </details>
  );
}
