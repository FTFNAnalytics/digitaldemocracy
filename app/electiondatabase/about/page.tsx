import type { Metadata } from "next";
import { PageHeader } from "@/components/observatory/chrome";
import { org } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={org.name}
        title="About the observatory"
        description="The Subnational Election Observatory is a public research product of the Center for Digital Democracy. It makes subnational election research searchable, comparable, understandable, and downloadable."
      />
      <div className="max-w-3xl space-y-4 text-[1.02rem] leading-relaxed text-navy/85">
        <p>
          Users include researchers, journalists, public officials, and interested citizens. The
          first intended content is the Latin America and Caribbean research package, with South
          America as the default landing region.
        </p>
        <p>
          This website does not invent organizational history, staff, institutional partnerships,
          endorsements, or a Git hosting identity beyond the repository that already hosts the
          Center’s public site.
        </p>
        <p>
          English is the initial interface language. Original-language evidence is preserved. UI
          strings are structured so they can be localized later; translations are not fabricated
          here.
        </p>
        <p>
          Software delivery of this first slice (routes, schemas, import stubs, and labelled
          fixtures) is in progress. Research coverage is not complete.
        </p>
      </div>
    </>
  );
}
