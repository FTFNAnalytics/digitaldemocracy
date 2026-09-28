import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/container";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.centerMethodology);

export default function MethodologyPage() {
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Election Atlas" title="Methodology" />
      <div className="max-w-3xl space-y-10 text-[0.95rem] leading-relaxed text-muted">
        <section>
          <h2 className="text-2xl font-bold text-navy">What a page is showing</h2>
          <p className="mt-3">
            A page lists offices, election days, and result rows that have been ingested, with the
            source that supports them when a publisher, title, and locator were supplied. The counts
            on the homepage are those ingested records. They are not a claim that every office in a
            country is included.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Missing is not zero</h2>
          <p className="mt-3">
            A number that was not supplied stays blank and is labelled not supplied. A recorded zero
            stays zero. Unknown, not applicable, preliminary, disputed, withheld, and superseded
            values stay in those states. They are not coerced to zero, and they are not dropped so
            that a later average can ignore them.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Dates</h2>
          <p className="mt-3">
            A date keeps the precision it was given. A day, a month, a year, and a range are
            different. A month is not stored as the first day of that month. A range is not stored
            as a single day. If two dated claims conflict and neither is adopted, both claims stay
            and the single resolved date is not supplied. The two claims are not merged into a range.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Evidence</h2>
          <p className="mt-3">
            A preliminary or provisional figure stays labelled that way. It is not treated as a
            certified result. A withheld value stays withheld. Statistical completeness does not
            prove that a result was certified. A recount or another version of the same count is part
            of that count, not a second election. An annulled result remains evidence; it does not
            become a completed term.
          </p>
          <p className="mt-3">
            A note that names a person on a date does not mean that person holds the office now.
            The Atlas shows a current holder only when the ingested record supports one. Otherwise
            the holder is not supplied.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Sources</h2>
          <p className="mt-3">
            A source is identified by the publisher, title, and locator that were supplied. A public
            web address is not permission to republish the file, and it is not evidence that every
            number on the page is final. Rights stay unknown unless the source states them.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Holds, withholds, and corrections</h2>
          <p className="mt-3">
            A hold is a named gap. The record stays as supplied until a source fills it. A withhold
            is a value the Atlas will not present as settled. A correction replaces a claim only when
            a source supports the replacement.
          </p>
          <p className="mt-3">
            <Link href="/corrections" className="font-semibold text-navy hover:text-navy-600">
              How to report a correction
            </Link>
          </p>
        </section>
      </div>
    </Container>
  );
}
