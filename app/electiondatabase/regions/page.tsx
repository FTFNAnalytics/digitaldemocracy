import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { CoveragePill } from "@/components/observatory/status";
import { getCountries, getRegions } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.regions);

export default function RegionsPage() {
  const regions = getRegions();
  const countries = getCountries();

  return (
    <>
      <PageHeader
        eyebrow="Geography"
        title="Regions"
        description="Available datasets by region. Coverage is available, partial, screened-out, not-yet-supplied, or fixture-only. South America is the default landing region."
      />
      <div className="space-y-6">
        {regions.map((region) => {
          const regionCountries = countries.filter((country) => country.regionId === region.id);
          return (
            <section key={region.id} className="obs-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="obs-heading text-2xl">
                    {region.name}
                    {region.isDefaultLanding ? (
                      <span className="ml-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">
                        Default landing
                      </span>
                    ) : null}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm text-navy/75">{region.notes}</p>
                </div>
                <CoveragePill status={region.status} />
              </div>
              {regionCountries.length > 0 ? (
                <ul className="mt-4 divide-y divide-navy/10 border-t border-navy/10">
                  {regionCountries.map((country) => (
                    <li key={country.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <Link
                        href={obsRoutes.country(country.id)}
                        className="obs-link"
                      >
                        {country.names.official}
                      </Link>
                      <span className="text-xs text-navy/60">
                        {country.kind.replaceAll("_", " ")} · {country.id}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-navy/60">No country records supplied for this region.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
