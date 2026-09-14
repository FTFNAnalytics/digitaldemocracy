import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfficeBriefing } from "@/components/observatory/office-briefing";
import { getOffice, getOffices } from "@/lib/observatory/load";

type Props = { params: Promise<{ officeId: string }> };

export function generateStaticParams() {
  return getOffices().map((office) => ({ officeId: office.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { officeId } = await params;
  const office = getOffice(officeId);
  return { title: office?.names.official ?? "Office" };
}

export default async function OfficePage({ params }: Props) {
  const { officeId } = await params;
  const office = getOffice(officeId);
  if (!office) notFound();
  return <OfficeBriefing office={office} />;
}
