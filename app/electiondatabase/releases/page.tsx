import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { getDataset } from "@/lib/observatory/load";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";

export const metadata: Metadata = { title: "Release history" };

export default function ReleasesPage() {
  const release = getDataset().release;

  return (
    <>
      <PageHeader
        eyebrow="Versions"
        title="Release history"
        description="Version, dates, changed records, added evidence, known gaps, and links to prior releases when those releases actually exist."
      />
      <article className="rounded-sm border border-obs-rule bg-white p-5">
        <h2 className="font-serif text-2xl text-navy">{release.id}</h2>
        <p className="mt-2 text-sm text-navy/70">
          Schema {release.schemaVersion} · methods {release.methodVersion} · provenance{" "}
          {release.provenance.kind}
        </p>
        <p className="mt-3 text-navy/80">{release.provenance.notes}</p>
        <p className="mt-3 text-sm text-navy/70">
          Research coverage complete: {String(release.researchCoverageComplete)}. Snapshot:{" "}
          {release.snapshotLabel ?? "none"}.
        </p>
      </article>
      <p className="mt-6 text-sm text-navy/70">
        No prior public research release is available in this repository. The next real row should
        appear after {RELEASE_PACKAGE_FILENAME} is imported. Importing a later release must produce
        a reviewable diff; that path is not active yet.
      </p>
    </>
  );
}
