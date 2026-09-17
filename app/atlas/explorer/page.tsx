import type { Metadata } from "next";
import Link from "next/link";
import {
  paginate,
  Pagination,
  type Query,
} from "@/components/observatory/pagination";
import { UrlFilterForm } from "@/components/observatory/filters";
import { AtlasPageHeader } from "@/components/atlas/chrome";
import { EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { parseAtlasExplorerFilters } from "@/lib/atlas/filters";
import {
  formatAtlasDate,
  formatAtlasRegion,
  formatAtlasTier,
  listAtlasExplorerFacets,
  listAtlasExplorerOffices,
  loadAtlasCatalog,
} from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.atlasExplorer);

type Props = {
  searchParams: Promise<Query>;
};

export default async function AtlasExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return (
      <>
        <AtlasPageHeader
          eyebrow="Search"
          title="Election explorer"
          description="Filter Atlas SQLite offices by query, country, tier, and region. Europe is the launch vertical; Latin America is not."
        />
        <EmptyState title="Atlas database is not loaded">
          <p>{catalog.message}</p>
          <p className="mt-2">
            Resolved path: <code className="text-navy">{catalog.sqlitePath}</code>
          </p>
        </EmptyState>
      </>
    );
  }

  const filters = parseAtlasExplorerFilters(params);
  const facets = listAtlasExplorerFacets();
  const offices = listAtlasExplorerOffices(filters);
  const paged = paginate(offices, params);

  return (
    <>
      <AtlasPageHeader
        eyebrow="Search"
        title="Election explorer"
        description="Filter Atlas SQLite offices by query, country, tier, and region. Results sort Europe first. Filters persist in the URL so a view can be shared. This is not a cutover of /electiondatabase/explorer."
      />
      <UrlFilterForm
        fields={[
          { key: "q", label: "Search", placeholder: "Office, id, or place" },
          {
            key: "region",
            label: "Region",
            type: "select",
            options: facets.regions,
          },
          {
            key: "country",
            label: "Country / territory",
            type: "select",
            options: facets.countries,
          },
          {
            key: "tier",
            label: "Tier",
            type: "select",
            options: facets.tiers,
          },
        ]}
      />
      <p className="mb-3 text-sm text-navy/65">
        {offices.length.toLocaleString()} offices in this view.
      </p>
      <Pagination result={paged} params={params} />
      <DataTable
        caption="Filtered Atlas offices"
        columns={["Office", "Country", "Region", "Tier", "Next date"]}
        empty="No offices match these filters."
        rows={paged.items.map((office) => [
          <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="obs-link">
            {office.name}
          </Link>,
          <Link key={`${office.officeId}-c`} href={atlasRoutes.country(office.countryId)} className="obs-link">
            {office.countryName}
          </Link>,
          formatAtlasRegion(office.regionId),
          formatAtlasTier(office.tier),
          office.nextLabel ? formatAtlasDate(office) : "not supplied",
        ])}
      />
    </>
  );
}
