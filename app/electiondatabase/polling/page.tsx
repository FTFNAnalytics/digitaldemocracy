import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/observatory/chrome";
import { UrlFilterForm } from "@/components/observatory/filters";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import { parsePollingFilters } from "@/lib/observatory/filters";
import { formatNumeric, formatShare } from "@/lib/observatory/format";
import { getCountries, getDataset, getOffice } from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";

export const metadata: Metadata = { title: "Polling" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PollingPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parsePollingFilters(params);
  const countries = getCountries();
  const polls = getDataset().polls.filter((poll) => {
    if (filters.scope && poll.scope !== filters.scope) return false;
    if (filters.country && poll.countryId !== filters.country) return false;
    if (filters.q) {
      const blob = `${poll.pollster} ${poll.questionText} ${poll.population}`;
      if (!blob.toLowerCase().includes(filters.q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        eyebrow="Survey evidence"
        title="Polling"
        description="National context and local polls, with fieldwork dates, question type, pollster, sample, and methodology. Approval categories are not candidates. Local government-change risk is unassessed unless a calibrated model is supplied."
      />
      <UrlFilterForm
        fields={[
          { key: "q", label: "Search", placeholder: "Pollster or question" },
          {
            key: "scope",
            label: "Scope",
            type: "select",
            options: [
              { value: "national", label: "National context" },
              { value: "local", label: "Local (named office)" },
            ],
          },
          {
            key: "country",
            label: "Country",
            type: "select",
            options: countries.map((country) => ({
              value: country.id,
              label: country.names.official,
            })),
          },
        ]}
      />
      {polls.length === 0 ? (
        <p className="text-sm text-navy/70">No polls match these filters.</p>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const office = poll.officeId ? getOffice(poll.officeId) : null;
            return (
              <article key={poll.id} className="rounded-sm border border-obs-rule bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-obs-teal">
                  {poll.scope} · {poll.questionType.replaceAll("_", " ")}
                </p>
                <h2 className="mt-1 font-serif text-2xl text-navy">{poll.pollster}</h2>
                <p className="mt-2 text-sm text-navy/75">{poll.questionText}</p>
                <p className="mt-2 text-sm text-navy/65">
                  Population: {poll.population}. Fieldwork {formatResearchDate(poll.fieldwork)}
                  {poll.published ? ` · published ${formatResearchDate(poll.published)}` : ""}. Sample{" "}
                  {formatNumeric(poll.sample)}.
                </p>
                <p className="mt-2 text-sm text-navy/65">{poll.methodology}</p>
                {office ? (
                  <p className="mt-2 text-sm">
                    Attached only to{" "}
                    <Link href={obsRoutes.office(office.id)} className="text-obs-teal hover:underline">
                      {office.names.official}
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-navy/70">
                    National context — not a local forecast and not attached to a municipal office.
                  </p>
                )}
                <div className="mt-4">
                  <DataTable
                    caption={`Responses for ${poll.id}`}
                    columns={["Response", "Value"]}
                    rows={poll.responses.map((row) => [
                      row.label,
                      formatShare(row.value, row.unit),
                    ])}
                  />
                </div>
                <p className="mt-3 text-sm text-navy/70">{poll.localConclusionNote}</p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
