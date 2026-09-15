import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { getDataset } from "@/lib/observatory/load";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.releases);

export default function ReleasesPage() {
  const release = getDataset().release;

  return (
    <>
      <PageHeader
        eyebrow="Versions"
        title="Release history"
        description="Version, dates, changed records, added evidence, known gaps, and links to prior releases when those releases actually exist."
      />
      <article className="obs-card p-5">
        <h2 className="obs-heading text-2xl">{release.id}</h2>
        <p className="mt-2 text-sm text-navy/70">
          Schema {release.schemaVersion} · methods {release.methodVersion} ·
          provenance {release.provenance.kind}
        </p>
        <p className="mt-3 text-navy/80">{release.provenance.notes}</p>
        <p className="mt-3 text-sm text-navy/70">
          Research coverage complete: {String(release.researchCoverageComplete)}
          . Snapshot: {release.snapshotLabel ?? "none"}.
        </p>
      </article>
      <p className="mt-6 text-sm text-navy/70">
        This is the first imported research release. Its manifest records
        original file checksums, validated counts, and known source-summary
        discrepancies. Subsequent imports are reviewed through repository
        changes.
      </p>
    </>
  );
}
