import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { EmptyState } from "@/components/observatory/status";
import { getDataset } from "@/lib/observatory/load";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";

export const metadata: Metadata = { title: "Downloads" };

export default function DownloadsPage() {
  const artifacts = getDataset().artifacts;

  return (
    <>
      <PageHeader
        eyebrow="Artifacts"
        title="Downloads"
        description="Country workbooks, briefings, structured exports, the release package, and a checksum manifest. Bulky archives stay out of Git; checksums and resolvable references stay in the repository."
      />
      <EmptyState title="Release package not supplied">
        <p>
          Place <code>{RELEASE_PACKAGE_FILENAME}</code> in <code>data/incoming/</code> (or pass{" "}
          <code>--zip</code>) and run <code>npm run import:data</code>. Public downloads will then
          list approved artifacts with file sizes and release labels.
        </p>
      </EmptyState>
      <ul className="mt-6 space-y-3 text-sm">
        {artifacts.map((artifact) => (
          <li key={artifact.id} className="obs-card px-4 py-3">
            <p className="font-medium text-navy">
              {artifact.format.toUpperCase()} · {artifact.available ? "Available" : "Unavailable"}
            </p>
            <p className="mt-1 text-navy/70">{artifact.notes}</p>
            <p className="mt-1 text-xs text-navy/50">
              Checksum: {artifact.checksum ?? "not supplied"} · path: {artifact.path ?? "—"}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
