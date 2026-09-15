import { brandedOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-image";
import { formatResearchDate } from "@/lib/observatory/dates";
import { eventKindLabel } from "@/lib/observatory/format";
import { getCountry, getEvent, getOffice } from "@/lib/observatory/load";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Election record — Subnational Election Observatory";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = { params: Promise<{ eventId: string }> };

export default async function Image({ params }: Props) {
  const { eventId } = await params;
  const event = getEvent(eventId);
  const office = event ? getOffice(event.officeId) : undefined;
  const country = event ? getCountry(event.countryId) : undefined;
  const officeName = office?.names.short ?? office?.names.official ?? "Election";
  const dateLabel = event ? formatResearchDate(event.date) : "Date unknown";
  const place = country?.names.official ?? event?.countryId ?? "Observatory";

  return brandedOgImage({
    badge: event ? eventKindLabel(event.kind).toUpperCase() : "ELECTION",
    title: `${officeName} — ${dateLabel}`,
    subtitle: `${place} · Subnational Election Observatory`,
  });
}
