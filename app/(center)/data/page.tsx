import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/container";
import { atlasRoutes } from "@/lib/atlas/routes";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.data);

export default function DataPage() {
  return (
    <Container className="py-16">
      <SectionHeading eyebrow="Election Atlas" title="Data" />
      <div className="max-w-3xl space-y-10 text-[0.95rem] leading-relaxed text-muted">
        <section>
          <h2 className="text-2xl font-bold text-navy">Cite a page</h2>
          <p className="mt-3">
            Cite the Center for Digital Democracy, the Election Atlas, the page address, and the
            snapshot label printed on the record. If the snapshot label is not supplied, say that.
            Do not invent a publication date.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Search</h2>
          <p className="mt-3">
            The human search is at{" "}
            <Link href={atlasRoutes.search} className="font-semibold text-navy hover:text-navy-600">
              {atlasRoutes.search}
            </Link>
            . It has three modes: seats, election days, and candidate labels. The same query is
            available as JSON.
          </p>
          <p className="mt-3">
            <code className="break-all text-sm text-navy">GET /api/atlas/search?mode=seat&amp;q=</code>
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <code>mode</code> is <code>seat</code>, <code>cycle</code>, or <code>candidate</code>.
            </li>
            <li>
              <code>q</code> is limited to 200 characters.
            </li>
            <li>
              Optional filters: <code>country</code>, <code>level</code>, <code>from</code>, and{" "}
              <code>to</code> (years).
            </li>
            <li>Responses use a public cache of five minutes.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-navy">Downloads</h2>
          <p className="mt-3">
            A seat page links to a CSV of that seat. The file address is{" "}
            <code className="text-sm text-navy">/atlas/offices/</code> plus the office id, plus{" "}
            <code className="text-sm text-navy">.csv</code>.
          </p>
          <p className="mt-3">
            An election-day page links to a CSV of the contests on that day. The file address is{" "}
            <code className="text-sm text-navy">/atlas/</code>, the country,{" "}
            <code className="text-sm text-navy">/elections/</code>, the date, and{" "}
            <code className="text-sm text-navy">.csv</code>.
          </p>
          <p className="mt-3">
            Country bundles are not published on this page. The earlier observatory catalogue remains
            at{" "}
            <Link href="/electiondatabase/downloads" className="font-semibold text-navy hover:text-navy-600">
              /electiondatabase/downloads
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
