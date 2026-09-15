import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import {
  paginate,
  Pagination,
  type Query,
} from "@/components/observatory/pagination";
import { getDataset } from "@/lib/observatory/load";
export const metadata: Metadata = { title: "Downloads" };
export default async function DownloadsPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const params = await searchParams;
  const q = String(params.q || "").toLowerCase();
  const artifacts = getDataset().artifacts.filter((a) =>
    `${a.originalPath} ${a.format}`.toLowerCase().includes(q),
  );
  const paged = paginate(artifacts, params);
  return (
    <>
      <PageHeader
        eyebrow="Artifacts"
        title="Downloads"
        description="Original structured research, supporting evidence, validation reports, and a checksum manifest. Individual office pages link to the full original briefing."
      />
      <p className="mb-4 text-sm">
        <a
          className="obs-link"
          href="/electiondatabase/artifacts/manifest"
          download
        >
          Download release manifest
        </a>
        . Workbooks and PDFs require the original artifact host; unavailable
        files are labelled below.
      </p>
      <UrlFilterForm
        fields={[
          {
            key: "q",
            label: "Find a file",
            placeholder: "Country, CSV, JSON, methodology…",
          },
        ]}
      />
      <Pagination result={paged} params={params} />
      <ul className="space-y-3 text-sm">
        {paged.items.map((a) => {
          const available =
            a.available || Boolean(process.env.ELECTION_ARTIFACT_BASE_URL);
          return (
            <li key={a.id} className="obs-card p-4">
              <p className="font-semibold">
                {available ? (
                  <a
                    className="obs-link"
                    href={`/electiondatabase/artifacts/${a.id}`}
                  >
                    {a.originalPath}
                  </a>
                ) : (
                  a.originalPath
                )}
              </p>
              <p>
                {a.format.toUpperCase()} · {a.bytes?.toLocaleString()} bytes ·{" "}
                {available ? "Available" : "Original binary not hosted"}
              </p>
              <details className="mt-2">
                <summary>SHA-256 checksum</summary>
                <code className="break-all text-xs">{a.checksum}</code>
              </details>
            </li>
          );
        })}
      </ul>
      <Pagination result={paged} params={params} />
    </>
  );
}
