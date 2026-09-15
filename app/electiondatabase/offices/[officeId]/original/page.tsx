import Link from "next/link";
import { notFound } from "next/navigation";
import { getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";
import { PageHeader } from "@/components/observatory/chrome";
import { originalBriefing } from "@/lib/observatory/briefings";
export default async function OriginalBriefing({
  params,
}: {
  params: Promise<{ officeId: string }>;
}) {
  const { officeId } = await params;
  const office = getOffice(officeId);
  if (!office) notFound();
  const html = originalBriefing(office.countryId, officeId);
  if (!html) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Source publication"
        title={office.names.official}
        description="Original research briefing. Source qualifications and evidence gaps are retained; active scripts and styling have been removed for safe display."
      />
      <p className="mb-6">
        <Link href={obsRoutes.office(officeId)} className="obs-link">
          Back to structured office record
        </Link>
      </p>
      <article
        className="original-briefing"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
