import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/components/atlas/database-state";
import { PersonPageView } from "@/components/atlas/person-page";
import { readPersonPage } from "@/lib/atlas/people/read";
import { loadAtlasCatalog } from "@/lib/atlas/read";
import { atlasRoutes } from "@/lib/atlas/routes";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ personSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { personSlug } = await params;
  const model = readPersonPage(decodeURIComponent(personSlug));
  if (!model) return { title: "Person not found", robots: { index: false, follow: true } };
  const description = `${model.canonicalLabel} · ${model.countryName}. Merged from ${model.sourceLabelCount} source labels in published election results.`;
  return {
    title: `${model.canonicalLabel} · Election Atlas`,
    description,
    alternates: { canonical: atlasRoutes.person(model.slug) },
  };
}

export default async function AtlasPersonPage({ params }: Props) {
  const { personSlug } = await params;
  const catalog = loadAtlasCatalog();
  if (catalog.status !== "ready") {
    return <DatabaseUnavailable message={catalog.message} sqlitePath={catalog.sqlitePath} />;
  }
  const model = readPersonPage(decodeURIComponent(personSlug));
  if (!model) notFound();
  return <PersonPageView model={model} />;
}
