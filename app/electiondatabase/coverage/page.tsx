import { paginate, Pagination } from "@/components/observatory/pagination";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { CoveragePill } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { parseCoverageFilters } from "@/lib/observatory/filters";
import { getCountries, getDataset, getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.coverage);

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoveragePage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCoverageFilters(params);
  const countries = getCountries();
  const queue = getDataset().completionQueue.filter((item) => {
    if (filters.country && item.countryId !== filters.country) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.q) {
      const office = getOffice(item.officeId);
      const blob = `${item.requirement} ${item.officeId} ${office?.names.official ?? ""}`;
      if (!blob.toLowerCase().includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });

  const paged = paginate(queue, params);
  return (
    <>
      <PageHeader
        eyebrow="Research status"
        title="Coverage"
        description="Country table and searchable office-level completion queue. Coverage is shown as separate dimensions — not a single regional percent complete. Imported counts are validated separately from unresolved research requirements."
      />

      <section className="mb-10">
        <h2 className="obs-heading text-2xl">Countries and territories</h2>
        <DataTable
          caption="Country coverage"
          columns={["Polity", "Kind", "Status", "Notes"]}
          rows={countries.map((country) => [
            <Link
              key={country.id}
              href={obsRoutes.country(country.id)}
              className="obs-link"
            >
              {country.names.official}
            </Link>,
            country.kind.replaceAll("_", " "),
            <CoveragePill
              key={`${country.id}-st`}
              status={country.coverageStatus}
            />,
            country.notes,
          ])}
        />
      </section>

      <section>
        <h2 className="obs-heading text-2xl">Office-level completion queue</h2>
        <p className="mt-2 text-sm text-navy/70">
          Filters for missing returns, registry gaps, structural exceptions, and
          unresolved events.
        </p>
        <div className="mt-4">
          <UrlFilterForm
            fields={[
              {
                key: "q",
                label: "Search",
                placeholder: "Office or requirement",
              },
              {
                key: "country",
                label: "Country",
                type: "select",
                options: countries.map((country) => ({
                  value: country.id,
                  label: country.names.official,
                })),
              },
              {
                key: "category",
                label: "Category",
                type: "select",
                options: [
                  { value: "missing_returns", label: "Missing returns" },
                  { value: "registry_gap", label: "Registry gap" },
                  {
                    value: "structural_exception",
                    label: "Structural exception",
                  },
                  { value: "unresolved_event", label: "Unresolved event" },
                ],
              },
            ]}
          />
        </div>
        <Pagination result={paged} params={params} />
        <DataTable
          caption="Completion queue"
          columns={["Office", "Country", "Category", "Requirement"]}
          rows={paged.items.map((item) => {
            const office = getOffice(item.officeId);
            return [
              office ? (
                <Link
                  key={item.id}
                  href={obsRoutes.office(office.id)}
                  className="obs-link"
                >
                  {office.names.short}
                </Link>
              ) : (
                item.officeId
              ),
              item.countryId,
              item.category.replaceAll("_", " "),
              item.requirement,
            ];
          })}
          empty="No queue rows match these filters."
        />
      </section>
    </>
  );
}
