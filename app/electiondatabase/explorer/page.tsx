import { paginate, Pagination } from "@/components/observatory/pagination";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { MetricPill } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import { parseExplorerFilters } from "@/lib/observatory/filters";
import {
  filterOffices,
  getCountries,
  getDataset,
  getGeography,
  metricsForOffice,
} from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.explorer);

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorerPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseExplorerFilters(params);
  const offices = filterOffices(filters);
  const countries = getCountries();
  const regions = getDataset().regions;

  const paged = paginate(offices, params);
  return (
    <>
      <PageHeader
        eyebrow="Search"
        title="Election explorer"
        description="Filter by region, country, area, tier, office type, date range, date certainty, evidence status, and metric review. Filters persist in the URL so a view can be shared."
      />
      <UrlFilterForm
        fields={[
          { key: "q", label: "Search", placeholder: "Office, id, or place" },
          {
            key: "region",
            label: "Region",
            type: "select",
            options: regions.map((region) => ({
              value: region.id,
              label: region.name,
            })),
          },
          {
            key: "country",
            label: "Country / territory",
            type: "select",
            options: countries.map((country) => ({
              value: country.id,
              label: country.names.official,
            })),
          },
          {
            key: "area",
            label: "Area",
            placeholder: "Geography ID (or search place above)",
          },
          {
            key: "tier",
            label: "Tier",
            type: "select",
            options: [
              { value: "regional", label: "Regional" },
              { value: "municipal", label: "Municipal" },
              { value: "council", label: "Council" },
            ],
          },
          {
            key: "officeType",
            label: "Office type",
            type: "select",
            options: [...new Set(getDataset().offices.map((o) => o.officeType))]
              .sort()
              .map((value) => ({ value, label: value })),
          },
          {
            key: "dateFrom",
            label: "Date from (year)",
            type: "number",
            placeholder: "2026",
          },
          {
            key: "dateTo",
            label: "Date to (year)",
            type: "number",
            placeholder: "2028",
          },
          {
            key: "dateCertainty",
            label: "Date certainty",
            type: "select",
            options: [
              { value: "called", label: "Formally called" },
              { value: "statutory", label: "Statutory" },
              { value: "expected", label: "Expected" },
              { value: "conditional", label: "Conditional" },
              { value: "unknown", label: "Unknown" },
            ],
          },
          {
            key: "evidenceStatus",
            label: "Evidence status",
            type: "select",
            options: [
              { value: "recorded", label: "Recorded" },
              { value: "zero", label: "Recorded zero" },
              { value: "unknown", label: "Unknown" },
              { value: "disputed", label: "Disputed" },
            ],
          },
          {
            key: "metricAvailability",
            label: "Metric availability",
            type: "select",
            options: [
              { value: "available", label: "Numeric value present" },
              { value: "unavailable", label: "No numeric value" },
            ],
          },
          {
            key: "metricReview",
            label: "Metric review",
            type: "select",
            options: [
              { value: "cleared", label: "Cleared" },
              { value: "provisional", label: "Provisional" },
              { value: "ineligible", label: "Ineligible" },
              { value: "withheld", label: "Withheld" },
            ],
          },
          {
            key: "officeStatus",
            label: "Office status",
            type: "select",
            options: [
              { value: "current", label: "Current" },
              { value: "historical", label: "Historical" },
            ],
            defaultValue: "current",
          },
        ]}
      />
      <p className="mb-3 text-sm text-navy/65">
        {offices.length} offices in this view.
      </p>
      <Pagination result={paged} params={params} />
      <DataTable
        caption="Filtered offices"
        columns={["Office", "Country", "Area", "Next date", "Metric"]}
        rows={paged.items.map((office) => {
          const metric = metricsForOffice(office.id)[0];
          return [
            <Link
              key={office.id}
              href={obsRoutes.office(office.id)}
              className="obs-link"
            >
              {office.names.official}
            </Link>,
            office.countryId,
            getGeography(office.geographyId)?.names.official ?? "—",
            office.nextElection
              ? formatResearchDate(office.nextElection.date)
              : "—",
            metric ? (
              <MetricPill
                key={`${office.id}-m`}
                status={metric.reviewStatus}
                kind={metric.kind}
                scoreGate={metric.scoreGate}
              />
            ) : (
              "None"
            ),
          ];
        })}
        empty="No offices match these filters."
      />
    </>
  );
}
