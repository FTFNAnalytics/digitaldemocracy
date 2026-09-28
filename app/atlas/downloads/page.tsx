import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { atlasDownloadsDir, listCountryBundles } from "@/lib/atlas/downloads";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { obsRoutes } from "@/lib/observatory/routes";
import { pageMeta, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: `Downloads · Election Atlas · ${SITE_NAME}`,
  description:
    "Per-country CSV bundles from the Election Atlas. Each zip includes a checksum and a LICENSE that names the data rights recorded on its sources.",
  path: atlasRoutes.downloads,
  image: "atlas",
  absoluteTitle: true,
});

export default function AtlasDownloadsPage() {
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const bundles = listCountryBundles(catalog.sqlitePath, atlasDownloadsDir());
  return (
    <>
      <PageHeader
        name="Downloads"
        level="World"
        facts={[{ label: "Countries", value: bundles.length.toLocaleString() }]}
      />
      <p className="mb-6 max-w-3xl text-sm text-atlas-ink-2">
        One CSV bundle per country. A new publication replaces the files. Each zip carries a checksum plus a LICENSE
        that copies the rights named on its sources. A bundle that has not been generated yet is listed without a
        file link.
      </p>
      <p className="mb-6 text-sm">
        <Link href={obsRoutes.downloads} className="font-semibold text-atlas-accent hover:underline">
          Observatory downloads
        </Link>
        {" remain available."}
      </p>
      <table className="w-full border-collapse text-sm">
        <caption className="mb-3 text-left font-semibold text-atlas-ink">Country CSV bundles</caption>
        <thead>
          <tr className="border-b border-atlas-line text-left text-atlas-ink-2">
            <th className="py-2 pr-4 font-semibold" scope="col">
              Country
            </th>
            <th className="py-2 pr-4 font-semibold" scope="col">
              Snapshot
            </th>
            <th className="py-2 pr-4 font-semibold" scope="col">
              Bundle
            </th>
            <th className="py-2 font-semibold" scope="col">
              SHA-256
            </th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle) => (
            <tr key={bundle.countryId} className="border-b border-atlas-line">
              <td className="py-3 pr-4 font-semibold text-atlas-ink">{bundle.name}</td>
              <td className="py-3 pr-4 text-atlas-ink-2">{bundle.snapshotLabel ?? "not supplied"}</td>
              <td className="py-3 pr-4">
                {bundle.href ? (
                  <a className="font-semibold text-atlas-accent hover:underline" href={bundle.href}>
                    {bundle.slug}.zip
                    {bundle.byteSize != null ? ` (${bundle.byteSize.toLocaleString()} bytes)` : ""}
                  </a>
                ) : (
                  "not generated"
                )}
              </td>
              <td className="py-3">
                {bundle.checksum && bundle.checksumHref ? (
                  <a className="font-mono text-xs text-atlas-accent hover:underline" href={bundle.checksumHref}>
                    {bundle.checksum}
                  </a>
                ) : (
                  "not supplied"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
