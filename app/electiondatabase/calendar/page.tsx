import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { dateCertaintyLabel, formatResearchDate, isPartialDate, researchDateSortKey } from "@/lib/observatory/dates";
import { parseCalendarFilters } from "@/lib/observatory/filters";
import { getEvents, getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";

export const metadata: Metadata = { title: "Calendar" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseCalendarFilters(params);
  const events = getEvents()
    .slice()
    .sort((a, b) => researchDateSortKey(a.date) - researchDateSortKey(b.date));
  const dated = events.filter((event) => !isPartialDate(event.date) && event.date.certainty !== "conditional");
  const partial = events.filter((event) => isPartialDate(event.date) || event.date.certainty === "conditional");

  const monthKey = filters.month || "2027-10";
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr) || 2027;
  const month = Number(monthStr) || 10;

  const inMonth = dated.filter(
    (event) => event.date.year === year && event.date.month === month,
  );

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Election calendar"
        description="Agenda and month views. Partial or conditional dates stay in a labelled section and are never coerced to the first of the month."
      />
      <UrlFilterForm
        fields={[
          {
            key: "view",
            label: "View",
            type: "select",
            options: [
              { value: "agenda", label: "Agenda" },
              { value: "month", label: "Month" },
            ],
          },
          { key: "month", label: "Month (YYYY-MM)", placeholder: "2027-10" },
        ]}
      />

      {filters.view === "month" ? (
        <section>
          <h2 className="obs-heading text-2xl">
            Month view · {String(month).padStart(2, "0")}/{year}
          </h2>
          <MonthGrid year={year} month={month} eventDays={inMonth.map((event) => event.date.day ?? 0)} />
          <ul className="mt-4 space-y-2 text-sm">
            {inMonth.map((event) => {
              const office = getOffice(event.officeId);
              return (
                <li key={event.id}>
                  {formatResearchDate(event.date)} ·{" "}
                  <Link href={obsRoutes.event(event.id)} className="obs-link">
                    {office?.names.short ?? event.officeId}
                  </Link>
                </li>
              );
            })}
          </ul>
          {inMonth.length === 0 ? (
            <p className="mt-3 text-sm text-navy/70">No day-certain events in this month.</p>
          ) : null}
        </section>
      ) : (
        <section>
          <h2 className="obs-heading text-2xl">Agenda</h2>
          <ol className="mt-4 space-y-3">
            {dated.map((event) => {
              const office = getOffice(event.officeId);
              return (
                <li key={event.id} className="obs-card px-4 py-3">
                  <p className="tabular-nums text-sm text-navy/60">{formatResearchDate(event.date)}</p>
                  <p className="font-medium text-navy">
                    <Link href={obsRoutes.event(event.id)} className="hover:text-navy-600">
                      {office?.names.official ?? event.officeId}
                    </Link>
                  </p>
                  <p className="text-sm text-navy/65">{dateCertaintyLabel(event.date.certainty)}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mt-10">
        <h2 className="obs-heading text-2xl">Partial or conditional dates</h2>
        <p className="mt-2 text-sm text-navy/70">
          These dates do not have a confirmed calendar day, or are conditional. They are listed
          here instead of being pinned to a fabricated day.
        </p>
        <ul className="mt-4 space-y-2">
          {partial.map((event) => {
            const office = getOffice(event.officeId);
            return (
              <li key={event.id} className="rounded-2xl border border-dashed border-navy/20 bg-white px-4 py-3 text-sm">
                <span className="font-medium">{formatResearchDate(event.date)}</span>
                {" · "}
                {dateCertaintyLabel(event.date.certainty)}
                {" · "}
                <Link href={obsRoutes.event(event.id)} className="obs-link">
                  {office?.names.short ?? event.id}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function MonthGrid({
  year,
  month,
  eventDays,
}: {
  year: number;
  month: number;
  eventDays: number[];
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const marks = new Set(eventDays.filter(Boolean));

  return (
    <table className="obs-card mt-4 w-full border-collapse text-sm">
      <caption className="sr-only">Calendar month {month}/{year}</caption>
      <thead>
        <tr>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <th key={day} className="border border-navy/20 bg-navy px-1 py-2 text-white">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {chunk(cells, 7).map((row, index) => (
          <tr key={index}>
            {row.map((day, cellIndex) => (
              <td
                key={cellIndex}
                className={`h-14 border border-navy/10 px-1 align-top ${day && marks.has(day) ? "bg-accent/25" : "bg-white"}`}
              >
                {day ?? ""}
                {day && marks.has(day) ? (
                  <span className="block text-[0.65rem] font-bold text-navy">● event</span>
                ) : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  const last = rows[rows.length - 1];
  if (last && last.length < size) {
    last.push(...Array.from({ length: size - last.length }, () => null as T));
  }
  return rows;
}
