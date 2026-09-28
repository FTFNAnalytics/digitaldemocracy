import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { countryCanonicalPath } from "@/lib/atlas/jurisdiction";
import type { Query } from "@/components/observatory/pagination";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ countryId: string }>;
  searchParams: Promise<Query>;
};

function queryString(params: Query): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, Array.isArray(value) ? value[0] : value);
  }
  return search.toString();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryId } = await params;
  const canonical = countryCanonicalPath(countryId);
  if (!canonical) return { title: "Atlas country not found", robots: { index: false, follow: true } };
  return { alternates: { canonical }, robots: { index: false, follow: true } };
}

/** Permanent alias for the public /atlas/countries/[countryId] URL. */
export default async function AtlasCountryPage({ params, searchParams }: Props) {
  const { countryId } = await params;
  const query = await searchParams;
  const canonical = countryCanonicalPath(countryId);
  if (!canonical) notFound();
  const suffix = queryString(query);
  permanentRedirect(suffix ? `${canonical}?${suffix}` : canonical);
}
