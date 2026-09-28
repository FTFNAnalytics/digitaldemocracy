import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbiguousIdentifier } from "@/components/atlas/ambiguous";
import { Breadcrumb } from "@/components/atlas/breadcrumb";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { EmptyState } from "@/components/atlas/empty-state";
import { listingRoleLabel, present, shareUnitLabel, statusPhrase } from "@/components/atlas/labels";
import { PageHeader } from "@/components/atlas/page-header";
import { PlainTable } from "@/components/atlas/plain-table";
import { ProvenanceFooter } from "@/components/atlas/provenance-footer";
import { RecordDetails } from "@/components/atlas/record-details";
import { ResultsTable } from "@/components/atlas/results-table";
import type { ResultBarRow } from "@/components/atlas/types";
import {
  formatAtlasDate,
  getAtlasCountry,
  listAtlasProceedings,
  listAtlasResults,
  loadAtlasCatalog,
  lookupAtlasEvent,
  lookupAtlasOffice,
  type AtlasEventDetail,
  type AtlasProceedingRow,
  type AtlasResultRow,
} from "@/lib/atlas/read";
import { cyclePathForEvent } from "@/lib/atlas/cycle/read";
import { atlasRoutes } from "@/lib/atlas/routes";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ eventId: string }>;
};

function toResultRows(rows: AtlasResultRow[]): ResultBarRow[] {
  return rows.map((row) => ({
    id: row.resultRowId,
    label: row.label,
    partyLabel: row.partyLabel,
    votes: row.votes,
    votesStatus: row.votesStatus,
    share: row.share,
    shareStatus: row.shareStatus,
    seats: row.seats,
    seatsStatus: row.seatsStatus,
    elected: row.electedFlag === 1,
    evidenceStatus: row.evidenceStatus,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const lookup = lookupAtlasEvent(decodeURIComponent(eventId));
  if (lookup.status !== "found") {
    return { title: "Atlas election not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${lookup.record.officeName} · ${formatAtlasDate(lookup.record)} · Election Atlas`,
    description: `Results on file for ${lookup.record.officeName}.`,
  };
}

export function FoundEventPage({
  event,
  results,
  proceedings,
  snapshotLabel,
  releaseId,
  lineageId,
  countryName,
  cycleHref = null,
}: {
  event: AtlasEventDetail;
  results: AtlasResultRow[];
  proceedings: AtlasProceedingRow[];
  snapshotLabel: string | null;
  releaseId: string | null;
  lineageId: string | null;
  countryName: string | null;
  cycleHref?: string | null;
}) {
  const bars = toResultRows(results);
  return (
    <>
      <Breadcrumb
        items={[
          { label: "World", href: atlasRoutes.home },
          {
            label: countryName ?? event.countryId,
            href: event.countryId ? atlasRoutes.country(event.countryId) : undefined,
          },
          { label: event.officeName, href: atlasRoutes.office(event.officeId) },
          { label: formatAtlasDate(event) },
        ]}
      />
      <PageHeader
        name={formatAtlasDate(event)}
        level={listingRoleLabel(event.selectedHistoryRole)}
        facts={[
          { label: "Office", value: event.officeName },
          { label: "Vote basis", value: statusPhrase(event.ballotBasis) },
          { label: "Share unit", value: shareUnitLabel(event.shareUnit) },
          { label: "Electoral system", value: present(event.electoralSystem) ?? "not supplied" },
          { label: "Comparability", value: present(event.comparability) ?? "not supplied" },
        ]}
      />

      <section className="mb-8">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Last result</h2>
        {bars.length === 0 ? (
          <div className="mt-4">
            <EmptyState variant="not_supplied" title="Results were not supplied">
              <p>Missing results are not shown as zero.</p>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <ResultsTable caption={`Results for ${event.officeName}`} rows={bars} shareUnit={event.shareUnit} />
          </div>
        )}
        <ProvenanceFooter
          publisher={null}
          title={null}
          url={null}
          snapshotLabel={snapshotLabel}
          evidenceGrade={null}
          recordId={event.eventId}
        />
      </section>

      <section className="mb-8">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Proceedings</h2>
        {proceedings.length === 0 ? (
          <div className="mt-4">
            <EmptyState variant="not_supplied" title="No proceedings on file">
              <p>No proceedings were supplied for this election.</p>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <PlainTable
              caption="Proceedings"
              columns={["Kind", "Sequence", "Legal outcome", "Supersedes"]}
              rows={proceedings.map((row) => [
                row.kind.replaceAll("_", " "),
                row.sequenceNo == null ? "not supplied" : String(row.sequenceNo),
                row.legalOutcome.replaceAll("_", " "),
                row.supersedesId ?? "not supplied",
              ])}
            />
          </div>
        )}
      </section>

      <p className="text-sm">
        <Link href={atlasRoutes.office(event.officeId)} className="font-semibold text-atlas-accent hover:underline">
          {event.officeName}
        </Link>
        {cycleHref ? (
          <>
            {" · "}
            <Link href={cycleHref} className="font-semibold text-atlas-accent hover:underline">
              All contests on this date
            </Link>
          </>
        ) : null}
        {" · "}
        <Link href={atlasRoutes.explorer} className="font-semibold text-atlas-accent hover:underline">
          Explorer
        </Link>
        {" · "}
        <Link href={atlasRoutes.home} className="font-semibold text-atlas-accent hover:underline">
          Atlas
        </Link>
      </p>
      <RecordDetails
        officeId={event.officeId}
        idNamespace={event.idNamespace}
        lineageId={lineageId}
        releaseId={releaseId}
        historyKey={event.historyKey}
      />
    </>
  );
}

export default async function AtlasEventPage({ params }: Props) {
  const { eventId: rawId } = await params;
  const eventId = decodeURIComponent(rawId);
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const lookup = lookupAtlasEvent(eventId);
  if (lookup.status === "missing") notFound();
  if (lookup.status === "ambiguous") {
    return <AmbiguousIdentifier kind="election" namespaces={lookup.namespaces} />;
  }

  const event = lookup.record;
  const office = lookupAtlasOffice(event.officeId);
  const lineageId = office.status === "found" ? office.record.lineageId : null;
  const publication = lineageId ? catalog.lineages.find((row) => row.lineageId === lineageId) : undefined;
  const country = event.countryId ? getAtlasCountry(event.countryId) : null;

  return (
    <FoundEventPage
      event={event}
      results={listAtlasResults(event.officeId, event.historyKey)}
      proceedings={listAtlasProceedings(event.officeId, event.historyKey)}
      snapshotLabel={publication?.snapshotLabel ?? null}
      releaseId={publication?.releaseId ?? null}
      lineageId={lineageId}
      countryName={country?.name ?? event.countryName}
      cycleHref={cyclePathForEvent(event.idNamespace, event.eventId)}
    />
  );
}
