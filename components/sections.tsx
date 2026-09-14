import {
  about,
  events,
  focusAreas,
  org,
  pillars,
  publications,
  researchCards,
  social,
} from "@/lib/content";
import { Icon, Logo } from "@/components/brand";
import { Container, SectionHeading } from "@/components/container";
import { NetworkGlobe } from "@/components/network-globe";
import { ContactForm, NewsletterForm } from "@/components/interactive";

export function PrototypeBanner() {
  return (
    <div className="bg-navy-800 px-4 py-2 text-center text-xs text-white/80">
      <span className="mr-2 inline-flex rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-ink">
        Prototype
      </span>
      Design mockup of the Center for Digital Democracy. Forms validate locally and do not
      send email.
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-navy">
      <NetworkGlobe />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/88 to-navy/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />
      <Container className="relative z-10 flex min-h-[88vh] flex-col justify-center py-24">
        <div className="max-w-2xl">
          <div className="mb-5 h-1 w-12 rounded-full bg-accent" />
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {org.kicker}
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {org.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{org.lede}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#about"
              className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-ink transition hover:bg-accent-soft"
            >
              Explore the Center
            </a>
            <a
              href="#events"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-accent hover:text-accent"
            >
              Upcoming events
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function FocusStrip() {
  return (
    <section className="bg-paper py-16" aria-label="Focus areas">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {focusAreas.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-navy/8 bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-accent">
                <Icon name={item.icon} />
              </span>
              <h3 className="text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function About() {
  return (
    <section id="about" className="bg-white py-20">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who we are" title="About the Center" />
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-muted">
              {about.mission.map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Priorities" title="What we fight for" />
            <ul className="space-y-4">
              {about.priorities.map((item) => (
                <li key={item.title} className="flex gap-3 rounded-2xl border border-navy/8 p-4">
                  <Icon name="check" className="mt-0.5 h-6 w-6 shrink-0" />
                  <div>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Research() {
  return (
    <section id="research" className="bg-mist py-20">
      <Container>
        <div className="circuit-panel mb-12 overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="max-w-xl">
            <SectionHeading
              eyebrow="Library"
              title="Policy research and publications"
            />
            <p className="text-muted">
              Briefs, working papers, and datasets for lawmakers, journalists, and
              coalitions building the next generation of digital public-interest rules.
            </p>
            <a
              href="#connect"
              className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-ink hover:bg-accent-soft"
            >
              Request a briefing
            </a>
          </div>
          <ul className="mt-8 divide-y divide-navy/10 border-t border-navy/10">
            {publications.map((pub) => (
              <li key={pub.title} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
                <p className="font-semibold text-navy">{pub.title}</p>
                <p className="text-sm text-muted">
                  {pub.type} · {pub.date}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <SectionHeading eyebrow="Workstreams" title="Research" />
        <div className="grid gap-6 sm:grid-cols-2">
          {researchCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-accent">
                <Icon name={card.icon} />
              </span>
              <h3 className="text-xl font-bold text-navy">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Initiatives() {
  return (
    <section id="initiatives" className="bg-navy py-20">
      <Container>
        <SectionHeading
          eyebrow="How we work"
          title="Four pillars of the program"
          light
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <article key={pillar.title}>
              <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{pillar.body}</p>
              <a
                href="#research"
                className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent-soft"
              >
                More information →
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function EventsAndConnect() {
  return (
    <div className="bg-[#d7dee8]">
      <Container className="grid gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <section id="events">
          <SectionHeading eyebrow="Calendar" title="Events" />
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.title}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-600">
                  {event.type} · {event.date}
                </p>
                <h3 className="mt-2 text-lg font-bold text-navy">{event.title}</h3>
                <p className="mt-1 text-sm text-muted">{event.detail}</p>
                <a
                  href="#connect"
                  className="mt-4 text-sm font-semibold text-navy hover:text-navy-600"
                >
                  {event.cta} →
                </a>
              </article>
            ))}
          </div>
        </section>
        <section id="connect" className="rounded-3xl bg-navy p-6 sm:p-8">
          <SectionHeading eyebrow="Inbox" title="Contact" light />
          <p className="mb-6 text-sm text-white/70">
            Briefing requests, partnership ideas, and press inquiries. This is a
            front-end prototype — submissions stay in your browser.
          </p>
          <ContactForm />
        </section>
      </Container>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold">Events</h3>
          <p className="mt-3 text-sm text-white/65">
            Workshops, briefings, and the annual convening on platform power and
            democratic speech. RSVP through the prototype contact form.
          </p>
          <a href="#events" className="mt-3 inline-block text-sm font-semibold text-accent">
            View the calendar →
          </a>
        </div>
        <div>
          <h3 className="text-lg font-bold">Office</h3>
          <address className="mt-3 not-italic text-sm leading-relaxed text-white/65">
            {org.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </div>
        <div>
          <h3 className="text-lg font-bold">Connect</h3>
          <p className="mt-3 text-sm text-white/65">
            {org.email}
            <br />
            {org.phone}
          </p>
          <div className="mt-5">
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <ul className="flex flex-wrap gap-4 text-sm text-white/60">
            {social.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
        <Container className="pb-8 text-xs text-white/45">
          © {new Date().getFullYear()} {org.name}. Design prototype — not an official
          live organization site. Forms do not transmit data.
        </Container>
      </div>
    </footer>
  );
}
