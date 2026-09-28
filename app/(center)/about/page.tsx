import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/container";
import { github, org, unconfirmed } from "@/lib/content";
import { pageMeta, staticPageSeo } from "@/lib/seo";

export const metadata: Metadata = pageMeta(staticPageSeo.about);

export default function AboutPage() {
  return (
    <Container className="py-16">
      <SectionHeading eyebrow={org.name} title="About the Center" />
      <div className="max-w-3xl space-y-4 text-[0.95rem] leading-relaxed text-muted">
        <p>
          {org.name} publishes the Election Atlas on this website. The Atlas is a public reading of
          election records that have been ingested. Europe is listed first.
        </p>
        <p>
          Staff, funders, partners, and events are not published on this page. Nothing is filled in
          until it is supplied.
        </p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy/10 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">Email</dt>
            <dd className="mt-2 text-navy">{unconfirmed.contactEmail}</dd>
          </div>
          <div className="rounded-2xl border border-navy/10 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">Phone</dt>
            <dd className="mt-2 text-navy">{unconfirmed.phone}</dd>
          </div>
          <div className="rounded-2xl border border-navy/10 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
              Postal address
            </dt>
            <dd className="mt-2 text-navy">{unconfirmed.postalAddress}</dd>
          </div>
        </dl>
        <p>
          There is no contact form on this site. Write to the email above once it is confirmed, or{" "}
          <a href={github.newIssue} className="font-semibold text-navy hover:text-navy-600">
            open a GitHub issue
          </a>
          .
        </p>
        <p>
          <Link href="/atlas" className="font-semibold text-navy hover:text-navy-600">
            Open the Election Atlas
          </Link>
        </p>
      </div>
    </Container>
  );
}
