import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PageHeader } from "@/components/atlas/page-header";
import { PlainTable } from "@/components/atlas/plain-table";
import { paginate, Pagination, type Query } from "@/components/observatory/pagination";
import { UrlFilterForm } from "@/components/observatory/filters";
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
        <PageHeader
          name="Election explorer"
          level="Search"
          facts={[{ label: "Focus", value: "Europe first" }]}
        />
        <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />
      </>
    );
  }

  const filters = parseAtlasExplorerFilters(params);
  const facets = listAtlasExplorerFacets();
  const offices = listAtlasExplorerOffices(filters);
  const paged = paginate(offices, params);

  return (
    <>
      <PageHeader
        name="Election explorer"
        level="Search"
        facts={[{ label: "Offices in this view", value: offices.length.toLocaleString() }]}
      />
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-atlas-ink-2">
        Filter offices by name, country, level, and region. Europe is listed first. The address of this page keeps the filters. The observatory at /electiondatabase remains available.
      </p>
      <UrlFilterForm
        fields={[
          { key: "q", label: "Search", placeholder: "Office or place" },
          {
            key: "region",
            label: "Region",
            type: "select",
            options: facets.regions,
          },
          {
            key: "country",
            label: "Country",
            type: "select",
            options: facets.countries,
          },
          {
            key: "tier",
            label: "Level",
            type: "select",
            options: facets.tiers,
          },
        ]}
      />
      <Pagination result={paged} params={params} />
      <PlainTable
        caption="Filtered offices"
        columns={["Office", "Country", "Region", "Level", "Next election"]}
        empty="No offices match these filters."
        rows={paged.items.map((office) => [
          <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="font-semibold text-atlas-accent hover:underline">
            {office.name}
          </Link>,
          <Link key={`${office.officeId}-c`} href={atlasRoutes.country(office.countryId)} className="font-semibold text-atlas-accent hover:underline">
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
