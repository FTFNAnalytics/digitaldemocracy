import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfficeBriefing } from "@/components/observatory/office-briefing";
import { getCountry, getOffice } from "@/lib/observatory/load";
import { officePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ officeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { officeId } = await params;
  const office = getOffice(officeId);
  if (!office) {
    return { title: "Office not found", robots: { index: false, follow: true } };
  }
  return officePageMeta(office, getCountry(office.countryId));
}

export default async function OfficePage({ params }: Props) {
  const { officeId } = await params;
  const office = getOffice(officeId);
  if (!office) notFound();
  return <OfficeBriefing office={office} />;
}
