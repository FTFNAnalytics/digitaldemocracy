import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { CI_METHOD_VERSION, PEDERSEN_METHOD_VERSION } from "@/lib/observatory/metrics";
import { RELEASE_PACKAGE_FILENAME } from "@/schemas/v1/input-manifest";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Definitions"
        title="Methodology and status language"
        description="Metric formulas, eligibility, ballot comparability, event selection, geographic bridges, polling limits, and status definitions. Official imported values are never overwritten by a user scenario."
      />

      <div className="prose-obs space-y-8 text-[1.02rem] leading-relaxed text-navy/85">
        <section>
          <h2 className="font-serif text-2xl text-navy">Coverage dimensions</h2>
          <p className="mt-2">
            There is no single regional “percent complete.” Report registry completeness, usable
            vote histories, seats, actual-event review, current-control evidence, and polling
            availability separately. Show denominators. Unknown totals stay unknown.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Missing is not zero</h2>
          <p className="mt-2">
            Recorded zeroes are preserved. Unknown, not applicable, structurally unavailable,
            preliminary, disputed, and superseded values are distinct. Null metrics sort
            separately from zero and do not enter rankings as zero.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Dates</h2>
          <p className="mt-2">
            A date without a formal call is not confirmed. Day, month, year, and range precision
            are retained. March 2028 is never turned into 1 March 2028. Date-only values stay free
            of timezone shifts. Uncertain overlap with the release window remains conditional.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Events and result versions</h2>
          <p className="mt-2">
            Ordinary, special, repeated, and indirect elections are separate. A recount is a
            result version, not an extra election. An annulled result remains evidence without
            becoming a valid completed cycle. Replacement events need an explicit relationship to
            the office history. Three source files or directory snapshots are not three completed
            cycles.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Shares and ballots</h2>
          <p className="mt-2">
            Votes, candidate marks, list votes, blank/invalid ballots, and electors have different
            denominators. Display the ballot basis and share unit. History party <code>share</code>{" "}
            values may be 0–100 while office <code>shares</code> inputs are 0–1; convert only by
            field contract.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Competition index</h2>
          <p className="mt-2">
            Method {CI_METHOD_VERSION}. Gaps are top-two gaps in percentage points, latest first:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-sm bg-navy px-4 py-3 text-sm text-white">
            {`weighted_gap = 0.6 × latest_gap + 0.3 × previous_gap + 0.1 × oldest_gap
CI = max(0, 100 × (1 − weighted_gap / 20))`}
          </pre>
          <p className="mt-3">
            Higher values mean closer historical competition under this formula, not a probability
            of a change in government. <code>score_gate: false</code> prevents a cleared-score
            claim even when a numeric CI exists. Cleared CI and provisional imported-series CI
            stay visually distinct.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Grouped Pedersen volatility</h2>
          <p className="mt-2">
            Method {PEDERSEN_METHOD_VERSION}:{" "}
            <code>0.5 × sum(|group_share_t − group_share_previous|)</code>, in percentage points,
            using stated fixed party groups. It is a lower bound where residual groups conceal
            internal change. It is not individual voter switching. Do not average whichever
            intervals happen to exist when the source requires both.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Polling</h2>
          <p className="mt-2">
            Vote intention, presidential approval, and other question types stay separate.
            Approval/disapproval categories are not candidates. Compare waves only when
            population, measure, and officeholder context support it. Local polls attach only to
            named offices. National polls are national context. No national-to-local swing model
            is invented. Where no calibrated local inference exists, local government-change risk
            is unassessed.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Officeholders and registers</h2>
          <p className="mt-2">
            Source <code>current: true</code> means a tracked current office, not proof the last
            winner still holds it. Rosters may contain elected people, dated directories, and
            electoral-register observations — classify by record type. A parish register row is
            not a person. Do not total overlapping elector observations across mayoral, council,
            and regional contests.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">Maps and identifiers</h2>
          <p className="mt-2">
            No invented municipal boundaries or coordinates. Tables remain fully functional
            without geometry. Names are not primary keys. Existing office IDs, history keys, and
            source IDs remain traceable.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-navy">This build</h2>
          <p className="mt-2">
            Software delivery for the observatory shell is in progress. Research coverage is not
            complete. The blocking input is <code>{RELEASE_PACKAGE_FILENAME}</code>.
          </p>
        </section>
      </div>
    </>
  );
}
