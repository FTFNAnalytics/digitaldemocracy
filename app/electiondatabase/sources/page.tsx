import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { DataTable } from "@/components/observatory/table";
import { getDataset } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";

export const metadata: Metadata = { title: "Sources" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SourcesPage({ searchParams }: Props) {
  const params = await searchParams;
  const qRaw = params.q;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw)?.toLowerCase() ?? "";
  const sources = getDataset().sources.filter((source) => {
    if (!q) return true;
    const blob = `${source.publisher} ${source.title} ${source.id}`.toLowerCase();
    return blob.includes(q);
  });

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Sources"
        description="Searchable evidence catalogue. File hashes, locators, and data-rights fields stay unknown when the release does not supply them. Access to a file is not permission to republish it."
      />
      <UrlFilterForm fields={[{ key: "q", label: "Search", placeholder: "Publisher or title" }]} />
      <DataTable
        caption="Evidence catalogue"
        columns={["ID", "Publisher", "Title", "Dates", "Hash / locator", "Rights", "Records"]}
        rows={sources.map((source) => [
          <span key={source.id} id={source.id} className="font-mono text-xs">
            {source.id}
          </span>,
          source.publisher,
          source.title,
          source.datesLabel,
          source.fileHash ?? source.locator ?? "Unknown",
          source.dataRights,
          source.supportedRecordIds.slice(0, 3).join(", "),
        ])}
        empty="No sources match."
      />
      <p className="mt-4 text-sm text-navy/60">
        Fixture sources only. Real catalogue rows appear after{" "}
        <Link href={obsRoutes.downloads} className="obs-link">
          a release import
        </Link>
        .
      </p>
    </>
  );
}
