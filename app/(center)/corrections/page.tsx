import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/container";
import { github } from "@/lib/content";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.corrections);

export default function CorrectionsPage() {
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Election Atlas" title="Corrections" />
      <div className="max-w-3xl space-y-10 text-[0.95rem] leading-relaxed text-muted">
        <section>
          <h2 className="text-2xl font-bold text-navy">Holds</h2>
          <p className="mt-3">
            A hold is a named gap: a missing return, an unresolved date, a boundary that is still
            under review. The record stays as supplied. The gap is not filled with a plausible value,
            and it is not shown as zero.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Withholds</h2>
          <p className="mt-3">
            A withheld value is one the Atlas will not present as settled. It may be preliminary,
            disputed, or blocked because the sources do not agree. The page says the value is
            withheld or not supplied. It does not substitute a neighbouring figure.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">How to report a correction</h2>
          <p className="mt-3">
            Seat and election pages include a “Report a correction” link. It opens a GitHub issue
            with the record id filled in. You can also start from the issue template directly.
          </p>
          <p className="mt-3">
            <a href={github.correction} className="font-semibold text-navy hover:text-navy-600">
              Open a research-correction issue
            </a>
          </p>
          <p className="mt-3">The template asks for:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The office, event, or source ids that are wrong.</li>
            <li>The claim that is wrong.</li>
            <li>The replacement claim.</li>
            <li>The source: publisher, title, address or locator, date, and what that source supports.</li>
          </ul>
          <p className="mt-3">
            Do not invent a missing value in the issue. Do not turn a partial date into the first
            day of a month. A correction that lacks a source cannot replace the record.
          </p>
          <p className="mt-3">
            <Link href="/methodology" className="font-semibold text-navy hover:text-navy-600">
              Methodology
            </Link>
          </p>
        </section>
      </div>
    </Container>
  );
}
