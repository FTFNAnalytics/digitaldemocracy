import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AmbiguousIdentifier } from "@/components/atlas/ambiguous";
import { Breadcrumb } from "@/components/atlas/breadcrumb";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { EmptyState } from "@/components/atlas/empty-state";
import { listingRoleLabel, present } from "@/components/atlas/labels";
import { PageHeader } from "@/components/atlas/page-header";
import { ProvenanceFooter } from "@/components/atlas/provenance-footer";
import { RecordDetails } from "@/components/atlas/record-details";
import { ResultsTable } from "@/components/atlas/results-table";
import type { ResultBarRow } from "@/components/atlas/types";
import {
  formatAtlasDate,
  formatAtlasTier,
  getAtlasCountry,
  listAtlasEvents,
  listAtlasResults,
  loadAtlasCatalog,
  lookupAtlasOffice,
  type AtlasResultRow,
} from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

type Props = {
  params: Promise<{ officeId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { officeId } = await params;
  const lookup = lookupAtlasOffice(decodeURIComponent(officeId));
  if (lookup.status !== "found") {
    return { title: "Atlas office not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${lookup.record.name} · Election Atlas`,
    description: `Elections and results on file for ${lookup.record.name}.`,
  };
}

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

export default async function AtlasOfficePage({ params }: Props) {
  const { officeId: rawId } = await params;
  const officeId = decodeURIComponent(rawId);
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const lookup = lookupAtlasOffice(officeId);
  if (lookup.status === "missing") notFound();
  if (lookup.status === "ambiguous") {
    return <AmbiguousIdentifier kind="office" namespaces={lookup.namespaces} />;
  }

  const office = lookup.record;
  const country = getAtlasCountry(office.countryId);
  const events = listAtlasEvents(officeId);
  const publication = catalog.lineages.find((row) => row.lineageId === office.lineageId);
  const nextLabel = present(office.nextLabel);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "World", href: atlasRoutes.home },
          { label: country?.name ?? office.countryId, href: atlasRoutes.country(office.countryId) },
          ...(office.geographyName ? [{ label: office.geographyName }] : []),
          { label: office.name },
        ]}
      />
      <PageHeader
        name={office.name}
        level={formatAtlasTier(office.tier)}
        facts={[
          { label: "Kind", value: office.officeType.replaceAll("_", " ") },
          { label: "Status", value: office.officeStatus.replaceAll("_", " ") },
        ]}
        nextElection={nextLabel ? { label: formatAtlasDate(office) } : null}
      />
      <p className="mb-6 text-sm">
        <Link href={atlasRoutes.country(office.countryId)} className="font-semibold text-atlas-accent hover:underline">
          {country?.name ?? office.countryId}
        </Link>
        {" · "}
        <Link href={atlasRoutes.home} className="font-semibold text-atlas-accent hover:underline">
          Atlas
        </Link>
        {" · "}
        <Link href={atlasRoutes.explorer} className="font-semibold text-atlas-accent hover:underline">
          Explorer
        </Link>
      </p>

      {events.length === 0 ? (
        <>
          <EmptyState variant="queued" title="Not yet ingested">
            <p>No elections are on file for this office.</p>
          </EmptyState>
          <ProvenanceFooter
            publisher={null}
            title={null}
            url={null}
            snapshotLabel={publication?.snapshotLabel ?? null}
            evidenceGrade={null}
            recordId={office.officeId}
          />
        </>
      ) : (
        events.map((event) => {
          const results = toResultRows(listAtlasResults(officeId, event.historyKey));
          return (
            <section key={event.eventId} className="mb-10">
              <h2 className="font-atlas-heading text-xl text-atlas-ink">
                {listingRoleLabel(event.selectedHistoryRole)} · {formatAtlasDate(event)}
              </h2>
              <p className="mt-2 text-sm text-atlas-ink-2">
                {event.eventKind.replaceAll("_", " ")} · legal outcome {event.legalOutcome.replaceAll("_", " ")}
                {event.electoralSystem ? ` · ${event.electoralSystem}` : ""} · ballot {event.ballotBasis.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-sm">
                <Link href={atlasRoutes.event(event.eventId)} className="font-semibold text-atlas-accent hover:underline">
                  Open this election
                </Link>
                {" · "}
                {event.resultCount.toLocaleString()} result rows
              </p>
              <div className="mt-4">
                {results.length === 0 ? (
                  <EmptyState variant="not_supplied" title="Results were not supplied">
                    <p>Missing results are not shown as zero.</p>
                  </EmptyState>
                ) : (
                  <ResultsTable caption={`Results · ${formatAtlasDate(event)}`} rows={results} />
                )}
              </div>
              <ProvenanceFooter
                publisher={null}
                title={null}
                url={null}
                snapshotLabel={publication?.snapshotLabel ?? null}
                evidenceGrade={null}
                recordId={event.eventId}
              />
              <RecordDetails
                officeId={office.officeId}
                idNamespace={office.idNamespace}
                lineageId={office.lineageId}
                releaseId={publication?.releaseId}
                historyKey={event.historyKey}
              />
            </section>
          );
        })
      )}

      {events.length === 0 ? (
        <RecordDetails
          officeId={office.officeId}
          idNamespace={office.idNamespace}
          lineageId={office.lineageId}
          releaseId={publication?.releaseId}
          historyKey={null}
        />
      ) : null}
    </>
  );
}
