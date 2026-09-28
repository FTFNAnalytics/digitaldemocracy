import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AmbiguousIdentifier } from "@/components/atlas/ambiguous";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { SeatPageView } from "@/components/atlas/seat-page";
import { loadAtlasCatalog, lookupAtlasOffice } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { listOfficeCandidates, readSeatPage } from "@/lib/atlas/seat/read";

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
    alternates: { canonical: atlasRoutes.office(lookup.record.officeId) },
  };
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
    const candidates = listOfficeCandidates(officeId);
    return (
      <AmbiguousIdentifier
        kind="office"
        namespaces={lookup.namespaces}
        candidates={candidates.map((candidate) => ({
          id: `${candidate.idNamespace}:${candidate.officeId}`,
          name: candidate.name,
          jurisdiction: candidate.jurisdiction,
          href: candidate.href,
        }))}
      />
    );
  }

  const model = readSeatPage(lookup.record.idNamespace, lookup.record.officeId);
  if (!model) notFound();
  return <SeatPageView model={model} />;
}
