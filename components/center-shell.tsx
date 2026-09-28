import { BackToTop, Header } from "@/components/interactive";
import { Footer } from "@/components/sections";

export function CenterShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-accent-ink"
      >
        Skip to content
      </a>
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main id="content">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
