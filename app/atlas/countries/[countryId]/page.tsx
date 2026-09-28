import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/atlas/breadcrumb";
import { CoverageChip } from "@/components/atlas/coverage";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { EmptyState } from "@/components/atlas/empty-state";
import { storedCoverageLabel } from "@/components/atlas/labels";
import { PageHeader } from "@/components/atlas/page-header";
import { PlainTable } from "@/components/atlas/plain-table";
import { RecordDetails } from "@/components/atlas/record-details";
import { paginate, Pagination, type Query } from "@/components/observatory/pagination";
import {
  formatAtlasDate,
  formatAtlasRegion,
  formatAtlasTier,
  getAtlasCountry,
  listAtlasOffices,
  listAtlasRegionalCalendar,
  loadAtlasCatalog,
} from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

type Props = {
  params: Promise<{ countryId: string }>;
  searchParams: Promise<Query>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryId } = await params;
  const country = getAtlasCountry(countryId);
  if (!country) {
    return { title: "Atlas country not found", robots: { index: false, follow: true } };
  }
  return {
    title: `${country.name} · Election Atlas`,
    description: `${country.name} offices and elections in the Election Atlas. Coverage is ${storedCoverageLabel(country.coverageStatus)}.`,
  };
}

export default async function AtlasCountryPage({ params, searchParams }: Props) {
  const { countryId } = await params;
  const query = await searchParams;
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }

  const country = getAtlasCountry(countryId);
  if (!country) notFound();
  const offices = listAtlasOffices(countryId);
  const regional = listAtlasRegionalCalendar(countryId);
  const paged = paginate(offices, query, "page", 50);
  const publication = catalog.lineages.find((row) => row.lineageId === country.lineageId);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "World", href: atlasRoutes.home },
          { label: country.name },
        ]}
      />
      <PageHeader
        name={country.name}
        level={country.regionId === "europe" ? "Europe" : formatAtlasRegion(country.regionId)}
        facts={[
          { label: "Offices", value: country.officeCount.toLocaleString() },
          { label: "Elections", value: country.eventCount.toLocaleString() },
          { label: "Coverage", value: storedCoverageLabel(country.coverageStatus) },
        ]}
      />
      <p className="mb-6">
        <CoverageChip storedStatus={country.coverageStatus} />
      </p>
      <p className="mb-6 text-sm">
        <Link href={atlasRoutes.home} className="font-semibold text-atlas-accent hover:underline">
          All countries
        </Link>
        {" · "}
        <Link href={atlasRoutes.explorer} className="font-semibold text-atlas-accent hover:underline">
          Explorer
        </Link>
      </p>

      <section>
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Regional calendar</h2>
        <p className="mt-2 text-sm text-atlas-ink-2">
          Regional offices are only those stored with an approved regional level. An empty list is not a count of every possible region.
        </p>
        {regional.count === 0 ? (
          <div className="mt-4">
            <EmptyState variant="not_supplied" title="No regional offices">
              <p>{regional.label}</p>
              {regional.denominatorKnown ? null : <p className="mt-2">A full regional universe was not supplied.</p>}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <PlainTable
              caption={`Regional offices in ${country.name}`}
              columns={["Office", "Kind", "Status"]}
              empty="No regional offices."
              rows={regional.offices.map((office) => [
                <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="font-semibold text-atlas-accent hover:underline">
                  {office.name}
                </Link>,
                office.officeType.replaceAll("_", " "),
                office.officeStatus.replaceAll("_", " "),
              ])}
            />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-atlas-heading text-2xl text-atlas-ink">Offices</h2>
        <p className="mt-2 text-sm text-atlas-ink-2">Next-election labels keep the precision that was supplied.</p>
        <Pagination result={paged} params={query} />
        <div className="mt-4">
          <PlainTable
            caption={`Offices in ${country.name}`}
            columns={["Office", "Level", "Kind", "Status", "Next election"]}
            empty="No offices are loaded for this country."
            rows={paged.items.map((office) => [
              <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="font-semibold text-atlas-accent hover:underline">
                {office.name}
              </Link>,
              formatAtlasTier(office.tier),
              office.officeType.replaceAll("_", " "),
              office.officeStatus.replaceAll("_", " "),
              office.nextLabel
                ? `${formatAtlasDate(office)}${office.nextPrecision ? ` (${office.nextPrecision}${office.nextCertainty ? `, ${office.nextCertainty}` : ""})` : ""}`
                : "not supplied",
            ])}
          />
        </div>
      </section>

      <RecordDetails lineageId={country.lineageId} releaseId={publication?.releaseId}>
        {country.notes ? <p>{country.notes}</p> : null}
      </RecordDetails>
    </>
  );
}
