import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  paginate,
  Pagination,
  type Query,
} from "@/components/observatory/pagination";
import { AtlasPageHeader } from "@/components/atlas/chrome";
import { EmptyState } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatAtlasDate, formatAtlasRegion, formatAtlasTier, getAtlasCountry, listAtlasOffices, listAtlasRegionalCalendar, loadAtlasCatalog } from "@/lib/atlas/read";
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
    description: `Imported Atlas offices, tiers, and election listings for ${country.name}. Coverage is ${country.coverageStatus.replaceAll("_", " ")}.`,
  };
}

export default async function AtlasCountryPage({ params, searchParams }: Props) {
  const { countryId } = await params;
  const query = await searchParams;
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return (
      <EmptyState title="Atlas database is not loaded">
        <p>{catalog.message}</p>
      </EmptyState>
    );
  }

  const country = getAtlasCountry(countryId);
  if (!country) notFound();
  const offices = listAtlasOffices(countryId);
  const regional = listAtlasRegionalCalendar(countryId);
  const paged = paginate(offices, query, "page", 50);

  return (
    <>
      <AtlasPageHeader
        eyebrow={country.regionId === "europe" ? "Europe" : formatAtlasRegion(country.regionId)}
        title={country.name}
        description={country.notes ?? "Imported Atlas country record. Missing values are shown as missing; they are not treated as zero."}
      >
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-navy/70">
          <span>{country.officeCount.toLocaleString()} offices</span>
          <span>{country.eventCount.toLocaleString()} events</span>
          <span>coverage {country.coverageStatus.replaceAll("_", " ")}</span>
          <span>lineage {country.lineageId}</span>
        </div>
      </AtlasPageHeader>

      <p className="mb-6 text-sm">
        <Link href={atlasRoutes.home} className="obs-link">
          All Atlas countries
        </Link>
        {" · "}
        <Link href={atlasRoutes.explorer} className="obs-link">
          Explorer
        </Link>
      </p>

      <section>
        <h2 className="obs-heading text-2xl">Regional calendar</h2>
        <p className="mt-2 text-sm text-navy/70">
          Regional listings use stored approved tier=regional only. A zero numerator is not a
          sourced denominator. Conditional other-tier dates are not counted as regional.
        </p>
        {regional.count === 0 ? (
          <div className="mt-4">
            <EmptyState title="No regional-tier offices">
              <p>{regional.label}</p>
              {regional.denominatorKnown ? null : (
                <p className="mt-2">Regional universe denominator is unknown.</p>
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4">
            <DataTable
              caption={`Regional-tier offices in ${country.name}`}
              columns={["Office", "Type", "Status"]}
              empty="No regional-tier offices."
              rows={regional.offices.map((office) => [
                <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="obs-link">
                  {office.name}
                </Link>,
                office.officeType,
                office.officeStatus,
              ])}
            />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="obs-heading text-2xl">Offices and tiers</h2>
        <p className="mt-2 text-sm text-navy/70">
          Tiers come from approved classification files. Next-election labels keep their supplied
          precision.
        </p>
        <Pagination result={paged} params={query} />
        <div className="mt-4">
          <DataTable
            caption={`Offices in ${country.name}`}
            columns={["Office", "Tier", "Type", "Status", "Next election"]}
            empty="No offices imported for this country."
            rows={paged.items.map((office) => [
              <Link key={office.officeId} href={atlasRoutes.office(office.officeId)} className="obs-link">
                {office.name}
              </Link>,
              formatAtlasTier(office.tier),
              office.officeType,
              office.officeStatus,
              office.nextLabel
                ? `${formatAtlasDate(office)}${office.nextPrecision ? ` (${office.nextPrecision}${office.nextCertainty ? `, ${office.nextCertainty}` : ""})` : ""}`
                : "not supplied",
            ])}
          />
        </div>
      </section>
    </>
  );
}
