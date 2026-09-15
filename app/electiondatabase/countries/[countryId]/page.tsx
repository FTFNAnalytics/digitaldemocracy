import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiteBlock, PageHeader } from "@/components/observatory/chrome";
import { CoveragePill } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import {
  getCountry,
  getCountries,
  getDataset,
  getGeography,
  getOffices,
  nationalPolls,
} from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";

type Props = { params: Promise<{ countryId: string }> };

export function generateStaticParams() {
  return getCountries().map((country) => ({ countryId: country.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryId } = await params;
  const country = getCountry(countryId);
  return { title: country?.names.official ?? "Country" };
}

export default async function CountryPage({ params }: Props) {
  const { countryId } = await params;
  const country = getCountry(countryId);
  if (!country) notFound();

  const offices = getOffices().filter((office) => office.countryId === country.id);
  const current = offices.filter((office) => office.status === "current");
  const historical = offices.filter((office) => office.status === "historical");
  const polls = nationalPolls(country.id);
  const sources = getDataset().sources.filter((source) =>
    source.supportedRecordIds.some((id) => id.startsWith(country.id) || offices.some((office) => office.id === id)),
  );
  const queue = getDataset().completionQueue.filter((item) => item.countryId === country.id);

  return (
    <>
      <PageHeader
        eyebrow={country.kind === "territory" ? "Territory" : "Country"}
        title={country.names.official}
        description={country.notes}
      >
        <div className="mt-3 flex flex-wrap gap-2">
          <CoveragePill status={country.coverageStatus} />
          <span className="text-sm text-navy/60">ID {country.id}</span>
        </div>
      </PageHeader>

      {country.screening ? (
        <section className="mb-8 obs-card p-4">
          <h2 className="obs-heading text-xl">Screening evidence</h2>
          <p className="mt-2 text-sm text-navy/75">As of {country.screening.asOfLabel}.</p>
          <p className="mt-2 text-sm text-navy/80">{country.screening.reason}</p>
          <p className="mt-2 text-sm text-navy/70">
            {country.screening.exceptionalElectionQualification}
          </p>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Government tiers and offices</h2>
        <p className="mt-2 text-sm text-navy/70">
          {current.length} current · {historical.length} historical (historical offices stay out of
          current totals).
        </p>
        <div className="mt-4">
          <DataTable
            caption={`Offices in ${country.names.official}`}
            columns={["Office", "Tier", "Type", "Status", "Next election", "Area"]}
            rows={offices.map((office) => [
              <Link key={office.id} href={obsRoutes.office(office.id)} className="obs-link">
                {office.names.official}
              </Link>,
              office.tier,
              office.officeType,
              office.status,
              office.nextElection ? formatResearchDate(office.nextElection.date) : "—",
              getGeography(office.geographyId)?.names.official ?? "—",
            ])}
            empty="No offices imported for this country."
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Polling context</h2>
        {polls.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">No national poll supplied.</p>
        ) : (
          <ul className="mt-3 list-disc pl-5 text-sm">
            {polls.map((poll) => (
              <li key={poll.id}>
                {poll.pollster} · {poll.questionType.replaceAll("_", " ")} ·{" "}
                <Link href={`${obsRoutes.polling}?country=${country.id}`} className="obs-link">
                  Open polling
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Country-specific gaps</h2>
        {queue.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">No completion-queue rows for this country.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {queue.map((item) => (
              <li key={item.id} className="obs-card px-3 py-2">
                {item.requirement}{" "}
                <Link href={obsRoutes.office(item.officeId)} className="obs-link">
                  {item.officeId}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Sources and downloads</h2>
        <p className="mt-2 text-sm text-navy/70">
          Country workbooks and briefing packets will appear here after a real import. Data rights
          remain unknown unless the release says otherwise.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {sources.map((source) => (
            <li key={source.id}>
              <Link href={`${obsRoutes.sources}#${source.id}`} className="obs-link">
                {source.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <Link href={obsRoutes.downloads} className="obs-link">
            Downloads catalogue
          </Link>
        </p>
      </section>

      <CiteBlock title={country.names.official} path={obsRoutes.country(country.id)} />
    </>
  );
}
