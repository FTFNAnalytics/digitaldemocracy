import Link from "next/link";
import { CiteBlock, PageHeader } from "@/components/observatory/chrome";
import { MetricPill, ValuePill } from "@/components/observatory/status";
import { DataTable, ShareBars } from "@/components/observatory/table";
import {
  dateCertaintyLabel,
  datePrecisionLabel,
  formatResearchDate,
} from "@/lib/observatory/dates";
import {
  eventKindLabel,
  formatNumeric,
  formatShare,
  legalOutcomeLabel,
  officeStatusLabel,
} from "@/lib/observatory/format";
import {
  getCountry,
  getDataset,
  getGeography,
  issuesForRecord,
  metricsForOffice,
  nationalPolls,
  officeholdersForOffice,
  otherEventsForOffice,
  pollsForOffice,
  registersForOffice,
  selectedEventsForOffice,
  sourcesByIds,
} from "@/lib/observatory/load";
import { toPercent } from "@/lib/observatory/metrics";
import { obsRoutes } from "@/lib/observatory/routes";
import type { OfficeRecord } from "@/schemas/v1/normalized";

export function OfficeBriefing({ office }: { office: OfficeRecord }) {
  const country = getCountry(office.countryId);
  const geo = getGeography(office.geographyId);
  const selected = selectedEventsForOffice(office.id);
  const other = otherEventsForOffice(office.id);
  const metrics = metricsForOffice(office.id);
  const holders = officeholdersForOffice(office.id);
  const localPolls = pollsForOffice(office.id);
  const national = nationalPolls(office.countryId);
  const issues = [
    ...issuesForRecord(office.id),
    ...issuesForRecord(office.countryId),
  ];
  const requirements = getDataset().completionQueue.filter(
    (r) => r.officeId === office.id,
  );
  const registers = registersForOffice(office.id);
  const sourceIds = [
    ...office.sourceIds,
    ...selected.flatMap((event) => event.sourceIds),
    ...holders.flatMap((row) => row.sourceIds),
    ...localPolls.flatMap((row) => row.sourceIds),
    ...registers.flatMap((row) => row.sourceIds),
    ...other.flatMap((event) => event.sourceIds),
    ...issues.flatMap((issue) => issue.sourceIds),
  ];
  const sources = sourcesByIds(sourceIds);
  const next = office.nextElection;

  return (
    <article>
      <PageHeader
        eyebrow="Office briefing"
        title={office.names.official}
        description={`${officeStatusLabel(office.status)}. Identifiers stay separate from display names.`}
      >
        <p className="mt-3 text-sm text-navy/70">
          <Link href={obsRoutes.country(office.countryId)} className="obs-link">
            {country?.names.official ?? office.countryId}
          </Link>
          {geo ? ` · ${geo.names.official}` : ""}
          {` · ${office.tier} · ${office.officeType}`}
          <span className="ml-2 font-mono text-xs">{office.id}</span>
        </p>
      </PageHeader>

      <p className="mb-6">
        <Link
          href={`${obsRoutes.office(office.id)}/original`}
          className="obs-link"
        >
          Read the complete original research briefing
        </Link>
      </p>
      {office.extensions?.raw?.note ? (
        <p className="mb-6 obs-card p-4 text-sm">
          {String(office.extensions.raw.note)}
        </p>
      ) : null}
      <section className="mb-8">
        <h2 className="obs-heading text-2xl">
          1. What office, where, and when is the next election?
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Fact label="Geography" value={geo?.names.official ?? "Unknown"} />
          <Fact
            label="Next election"
            value={next ? formatResearchDate(next.date) : "Not supplied"}
          />
          <Fact
            label="Linked upcoming event"
            value={
              next?.eventId ? (
                <Link href={obsRoutes.event(next.eventId)} className="obs-link">
                  {next.eventId}
                </Link>
              ) : (
                "None"
              )
            }
          />
          <Fact
            label="Registry qualification"
            value={
              office.registryQualified == null
                ? "Unknown"
                : office.registryQualified
                  ? "Qualified in source register"
                  : "Not qualified"
            }
          />
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">2. How certain is that date?</h2>
        {next ? (
          <p className="mt-3 text-navy/80">
            {formatResearchDate(next.date)} is{" "}
            <strong>
              {dateCertaintyLabel(next.date.certainty).toLowerCase()}
            </strong>
            . {datePrecisionLabel(next.date.precision)}. A date without a formal
            call is not confirmed.
          </p>
        ) : (
          <p className="mt-3 text-navy/80">
            No next-election date is supplied for this office.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">
          3. Who won earlier selected elections?
        </h2>
        {office.structuralLimitation ? (
          <p className="mt-3 rounded-2xl border border-amber-800/25 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {office.structuralLimitation}
          </p>
        ) : null}
        {selected.length === 0 ? (
          <p className="mt-3 text-navy/70">
            No selected historical cycles are supplied.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {selected.map((event) => (
              <div key={event.id} className="obs-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="obs-heading text-xl">
                    <Link
                      href={obsRoutes.event(event.id)}
                      className="hover:text-navy-600"
                    >
                      {formatResearchDate(event.date)}
                    </Link>
                  </h3>
                  <p className="text-sm text-navy/65">
                    {eventKindLabel(event.kind)} ·{" "}
                    {legalOutcomeLabel(event.legalOutcome)} ·{" "}
                    {event.ballotBasis.replaceAll("_", " ")}
                  </p>
                </div>
                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <ShareBars
                    rows={event.resultRows.map((row) => ({
                      label: row.label,
                      percent:
                        row.share.value == null
                          ? null
                          : toPercent(row.share.value, row.shareUnit),
                      note: row.share.status,
                    }))}
                  />
                  <DataTable
                    caption={`Results for ${event.id}`}
                    columns={[
                      "Label / candidate",
                      "Party code",
                      "Votes",
                      "Share",
                      "Seats",
                      "Status",
                    ]}
                    rows={event.resultRows.map((row) => [
                      [row.label, row.candidate].filter(Boolean).join(" · "),
                      <span
                        key={`${row.id}-code`}
                        className="font-mono text-xs"
                      >
                        {row.partyCode}
                        <span className="block text-[0.65rem] text-navy/50">
                          {row.partyNamespace}
                        </span>
                      </span>,
                      formatNumeric(row.votes),
                      formatShare(row.share, row.shareUnit),
                      formatNumeric(row.seats),
                      <ValuePill
                        key={`${row.id}-st`}
                        status={row.evidenceStatus}
                      />,
                    ])}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {other.length > 0 ? (
          <div className="mt-6">
            <h3 className="obs-heading text-xl">
              Other events (not selected cycles)
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {other.map((event) => (
                <li key={event.id}>
                  <Link href={obsRoutes.event(event.id)} className="obs-link">
                    {formatResearchDate(event.date)}
                  </Link>{" "}
                  · {eventKindLabel(event.kind)} ·{" "}
                  {legalOutcomeLabel(event.legalOutcome)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">4. Competition and volatility</h2>
        {metrics.length === 0 ? (
          <p className="mt-3 text-navy/70">No metric observations supplied.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="obs-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="obs-heading text-xl capitalize">
                    {metric.kind.replaceAll("_", " ")}
                  </h3>
                  <MetricPill
                    status={metric.reviewStatus}
                    kind={metric.kind}
                    scoreGate={metric.scoreGate}
                  />
                </div>
                <p className="mt-2 tabular-nums text-2xl text-navy">
                  {formatNumeric(metric.value)}
                  <span className="ml-2 text-sm font-normal text-navy/55">
                    {metric.unit}
                  </span>
                </p>
                <p className="mt-2 text-sm text-navy/75">
                  {metric.eligibility}
                </p>
                <p className="mt-1 text-sm text-navy/75">
                  Comparison status: {metric.comparisonStatus}
                  {metric.withholdingReason
                    ? ` · ${metric.withholdingReason}`
                    : ""}
                </p>
                <p className="mt-1 text-xs text-navy/55">
                  Method {metric.methodVersion}. Inputs:{" "}
                  {Object.entries(metric.inputs)
                    .map(([key, value]) => `${key}=${value ?? "null"}`)
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        {office.extensions?.raw?.current_government ? (
          <p className="mb-4 obs-card p-4 text-sm">
            Source-reported control:{" "}
            {String(office.extensions.raw.current_government)}.{" "}
            {String(
              office.extensions.raw.current_control_status ||
                "Current tenure requires separate dated evidence.",
            )}
          </p>
        ) : null}
        <h2 className="obs-heading text-2xl">5. Officeholder evidence</h2>
        <p className="mt-2 text-sm text-navy/65">
          Dated roster observations are not automatically current tenure.{" "}
          {office.status === "current"
            ? "The source current-office flag means this office is tracked now, not that the last winner still holds it."
            : null}
        </p>
        {holders.length === 0 ? (
          <p className="mt-3 text-navy/70">
            No officeholder observation supplied.
          </p>
        ) : (
          <DataTable
            caption="Officeholder observations"
            columns={["Person", "Role", "As of", "Affiliation", "Principal?"]}
            rows={holders.map((row) => [
              row.personLabel,
              row.role,
              formatResearchDate(row.asOf),
              row.affiliationLabel ?? "Unknown",
              row.principalOrSubstitute,
            ])}
          />
        )}
        {registers.length > 0 ? (
          <div className="mt-4">
            <h3 className="obs-heading text-lg">
              Electoral register observations
            </h3>
            <p className="mt-1 text-sm text-navy/65">
              Dated elector counts stay distinct from turnout and are not summed
              across overlapping contests.
            </p>
            <DataTable
              caption="Register observations"
              columns={["As of", "Electors", "Notes"]}
              rows={registers.map((row) => [
                formatResearchDate(row.asOf),
                formatNumeric(row.electorCount),
                <details key={row.id}>
                  <summary>{row.notes}</summary>
                  <pre className="max-w-xl overflow-auto whitespace-pre-wrap text-xs">
                    {JSON.stringify(row.extensions?.raw, null, 2)}
                  </pre>
                </details>,
              ])}
            />
          </div>
        ) : null}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">6. Polling context</h2>
        {localPolls.length === 0 ? (
          <p className="mt-3 text-navy/70">No local poll supplied.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {localPolls.map((poll) => (
              <li key={poll.id} className="obs-card p-4">
                <p className="font-medium text-navy">{poll.pollster}</p>
                <p className="text-sm text-navy/70">
                  {poll.questionType.replaceAll("_", " ")} · fieldwork{" "}
                  {formatResearchDate(poll.fieldwork)}
                </p>
                <p className="mt-2 text-sm">{poll.localConclusionNote}</p>
              </li>
            ))}
          </ul>
        )}
        {national.length > 0 ? (
          <p className="mt-3 text-sm text-navy/70">
            National context is listed on the{" "}
            <Link
              href={`${obsRoutes.polling}?country=${office.countryId}&scope=national`}
              className="obs-link"
            >
              polling page
            </Link>
            . It is not a local forecast.
          </p>
        ) : null}
      </section>

      <section className="mb-8">
        <h2 className="obs-heading text-2xl">
          7. Unresolved issues and sources
        </h2>
        {requirements.map((r) => (
          <p key={r.id} className="mt-3 obs-card p-3 text-sm">
            {r.requirement}
          </p>
        ))}
        {issues.length === 0 && requirements.length === 0 ? (
          <p className="mt-3 text-navy/70">
            No open research issues attached to this office.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {issues.map((issue) => (
              <li key={issue.id} className="obs-card p-3">
                <p className="font-medium text-navy">
                  {issue.category.replaceAll("_", " ")} ·{" "}
                  {issue.resolutionState}
                </p>
                <p className="mt-1 text-navy/75">{issue.description}</p>
              </li>
            ))}
          </ul>
        )}
        <h3 className="mt-6 obs-heading text-xl">Sources</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {sources.map((source) => (
            <li key={source.id}>
              <Link
                href={`${obsRoutes.sources}?q=${encodeURIComponent(source.id)}#${source.id}`}
                className="obs-link"
              >
                {source.publisher}: {source.title}
              </Link>
              <span className="text-navy/55">
                {" "}
                · rights {source.dataRights}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <CiteBlock
        title={office.names.official}
        path={obsRoutes.office(office.id)}
        extra={`Sources: ${sources.map((source) => source.id).join(", ") || "none"}.`}
      />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="obs-card px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-navy/55">
        {label}
      </dt>
      <dd className="mt-1 text-navy">{value}</dd>
    </div>
  );
}
