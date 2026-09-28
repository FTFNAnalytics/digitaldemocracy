import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { RecordDetails } from "@/components/atlas/record-details";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: `Releases · Election Atlas · ${SITE_NAME}`,
  description: "Snapshots currently loaded in the Election Atlas.",
  path: atlasRoutes.releases,
  image: "atlas",
  absoluteTitle: true,
});

export default function AtlasReleasesPage() {
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  return (
    <>
      <PageHeader name="Releases" level="World" facts={[{ label: "Snapshots", value: catalog.lineages.length.toLocaleString() }]} />
      <p className="mb-6 text-sm text-atlas-ink-2">Snapshots currently loaded in the Election Atlas.</p>
      <p className="mb-6 text-sm">
        <Link href={atlasRoutes.home} className="font-semibold text-atlas-accent hover:underline">
          All countries
        </Link>
      </p>
      <ul className="grid gap-3">
        {catalog.lineages.map((row) => (
          <li key={row.releaseId} className="rounded-2xl border border-atlas-line bg-atlas-card px-4 py-3">
            <p className="font-semibold text-atlas-ink">{row.snapshotLabel ?? "Snapshot not supplied"}</p>
            <p className="mt-1 text-sm text-atlas-ink-2">{row.officeCount.toLocaleString()} offices</p>
          </li>
        ))}
      </ul>
      <RecordDetails>
        {catalog.lineages.map((row) => (
          <p key={row.lineageId}>
            lineage {row.lineageId}
            {row.releaseId ? ` · release ${row.releaseId}` : ""}
            {row.description ? ` · ${row.description}` : ""}
          </p>
        ))}
        <p>SQLite path: {catalog.sqlitePath}</p>
      </RecordDetails>
    </>
  );
}
