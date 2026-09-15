import {
  paginate,
  Pagination,
  type Query,
} from "@/components/observatory/pagination";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CiteBlock, PageHeader } from "@/components/observatory/chrome";
import { CoveragePill } from "@/components/observatory/status";
import { DataTable } from "@/components/observatory/table";
import { formatResearchDate } from "@/lib/observatory/dates";
import {
  getCountry,
  getDataset,
  getGeography,
  getOffices,
  nationalPolls,
} from "@/lib/observatory/load";
import { obsRoutes } from "@/lib/observatory/routes";

type Props = {
  params: Promise<{ countryId: string }>;
  searchParams: Promise<Query>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryId } = await params;
  const country = getCountry(countryId);
  return { title: country?.names.official ?? "Country" };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const query = await searchParams;
  const { countryId } = await params;
  const country = getCountry(countryId);
  if (!country) notFound();

  const offices = getOffices().filter(
    (office) => office.countryId === country.id,
  );
  const current = offices.filter((office) => office.status === "current");
  const historical = offices.filter((office) => office.status === "historical");
  const polls = nationalPolls(country.id);
  const sources = getDataset().sources.filter((source) =>
    source.id.startsWith(`${country.id}--`),
  );
  const queue = getDataset().completionQueue.filter(
    (item) => item.countryId === country.id,
  );

  const paged = paginate(offices, query);
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
          <p className="mt-2 text-sm text-navy/75">
            As of {country.screening.asOfLabel}.
          </p>
          <p className="mt-2 text-sm text-navy/80">
            {country.screening.reason}
          </p>
          <p className="mt-2 text-sm text-navy/70">
            {country.screening.exceptionalElectionQualification}
          </p>
        </section>
      ) : null}

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Government tiers and offices</h2>
        <p className="mt-2 text-sm text-navy/70">
          {current.length} current · {historical.length} historical (historical
          offices stay out of current totals).
        </p>
        <Pagination result={paged} params={query} />
        <div className="mt-4">
          <DataTable
            caption={`Offices in ${country.names.official}`}
            columns={[
              "Office",
              "Tier",
              "Type",
              "Status",
              "Next election",
              "Area",
            ]}
            rows={paged.items.map((office) => [
              <Link
                key={office.id}
                href={obsRoutes.office(office.id)}
                className="obs-link"
              >
                {office.names.official}
              </Link>,
              office.tier,
              office.officeType,
              office.status,
              office.nextElection
                ? formatResearchDate(office.nextElection.date)
                : "—",
              getGeography(office.geographyId)?.names.official ?? "—",
            ])}
            empty="No offices imported for this country."
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Polling context</h2>
        {polls.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">
            No national poll supplied.
          </p>
        ) : (
          <ul className="mt-3 list-disc pl-5 text-sm">
            {polls.map((poll) => (
              <li key={poll.id}>
                {poll.pollster} · {poll.questionType.replaceAll("_", " ")} ·{" "}
                <Link
                  href={`${obsRoutes.polling}?country=${country.id}`}
                  className="obs-link"
                >
                  Open polling
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">Country-specific gaps</h2>
        <p className="mt-2 text-sm">
          First 20 of {queue.length} requirements.{" "}
          <Link
            href={`${obsRoutes.coverage}?country=${country.id}`}
            className="obs-link"
          >
            Browse all requirements
          </Link>
          .
        </p>
        {queue.length === 0 ? (
          <p className="mt-3 text-sm text-navy/70">
            No completion-queue rows for this country.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {queue.slice(0, 20).map((item) => (
              <li key={item.id} className="obs-card px-3 py-2">
                {item.requirement}{" "}
                <Link
                  href={obsRoutes.office(item.officeId)}
                  className="obs-link"
                >
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
          Original research data and evidence files are in the downloads
          catalogue. Data rights remain as stated by each source.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href={`${obsRoutes.sources}?q=${country.id}--`}
            className="obs-link"
          >
            Browse all {sources.length} sources
          </Link>
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {sources.slice(0, 30).map((source) => (
            <li key={source.id}>
              <Link
                href={`${obsRoutes.sources}?q=${encodeURIComponent(source.id)}#${source.id}`}
                className="obs-link"
              >
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

      <CiteBlock
        title={country.names.official}
        path={obsRoutes.country(country.id)}
      />
    </>
  );
}
