"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { navLinks, productLinks } from "@/lib/content";
import { cn } from "@/lib/cn";
import { emailError, requiredText } from "@/lib/validation";

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-[#ff8b8b]" role="alert">
      {message}
    </p>
  );
}

export function ContactForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    const nameErr = requiredText(name, { min: 2, max: 120, label: "Name" });
    const mailErr = emailError(email);
    const msgErr = requiredText(message, { min: 20, max: 2000, label: "Message" });
    if (nameErr) next.name = nameErr;
    if (mailErr) next.email = mailErr;
    if (msgErr) next.message = msgErr;
    if (org.trim().length > 160) next.org = "Organization must be 160 characters or fewer.";
    return next;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl border border-accent/40 bg-navy-800 p-6 text-white"
        role="status"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
          Message validated
        </p>
        <p className="mt-2 text-lg font-semibold">Thank you — this prototype received your note locally.</p>
        <p className="mt-2 text-sm text-white/70">
          No email was sent. In a production site this form would route to the Center’s
          inbox. You can refresh to try another submission.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <p className="text-xs text-white/55">
        Prototype form — validates in the browser and does not send email.
      </p>
      <div>
        <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium text-white">
          Full name
        </label>
        <input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${formId}-name-err` : undefined}
          className="w-full rounded-xl border border-white/15 bg-navy px-4 py-3 text-white outline-none ring-accent/40 placeholder:text-white/35 focus:ring-2"
          placeholder="Jordan Lee"
        />
        <FieldError id={`${formId}-name-err`} message={errors.name} />
      </div>
      <div>
        <label htmlFor={`${formId}-email`} className="mb-1.5 block text-sm font-medium text-white">
          Email
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${formId}-email-err` : undefined}
          className="w-full rounded-xl border border-white/15 bg-navy px-4 py-3 text-white outline-none ring-accent/40 placeholder:text-white/35 focus:ring-2"
          placeholder="you@organization.org"
        />
        <FieldError id={`${formId}-email-err`} message={errors.email} />
      </div>
      <div>
        <label htmlFor={`${formId}-org`} className="mb-1.5 block text-sm font-medium text-white">
          Organization <span className="font-normal text-white/45">(optional)</span>
        </label>
        <input
          id={`${formId}-org`}
          name="organization"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          aria-invalid={Boolean(errors.org)}
          className="w-full rounded-xl border border-white/15 bg-navy px-4 py-3 text-white outline-none ring-accent/40 placeholder:text-white/35 focus:ring-2"
          placeholder="Newsroom, agency, or coalition"
        />
        <FieldError message={errors.org} />
      </div>
      <div>
        <label htmlFor={`${formId}-message`} className="mb-1.5 block text-sm font-medium text-white">
          Message
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${formId}-message-err` : undefined}
          className="w-full resize-y rounded-xl border border-white/15 bg-navy px-4 py-3 text-white outline-none ring-accent/40 placeholder:text-white/35 focus:ring-2"
          placeholder="How can the Center’s research or policy work help?"
        />
        <FieldError id={`${formId}-message-err`} message={errors.message} />
      </div>
      <button
        type="submit"
        className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-ink transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Send message
      </button>
    </form>
  );
}

export function NewsletterForm({ variant = "dark" }: { variant?: "dark" | "footer" }) {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = emailError(email);
    setError(next);
    if (!next) setSuccess(true);
  }

  if (success) {
    return (
      <p className="rounded-xl border border-accent/40 bg-navy-800 px-4 py-3 text-sm text-white" role="status">
        You are on the prototype list. No email was sent — this form does not connect to a
        mailing service.
      </p>
    );
  }

  const isFooter = variant === "footer";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor={`${formId}-news`} className="block text-sm font-medium text-white">
        Newsletter
      </label>
      <div className={cn("flex flex-col gap-2", isFooter ? "sm:flex-row" : "")}>
        <input
          id={`${formId}-news`}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${formId}-news-err` : `${formId}-news-hint`}
          placeholder="Email address"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-navy px-4 py-3 text-sm text-white outline-none ring-accent/40 placeholder:text-white/35 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-ink transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Subscribe
        </button>
      </div>
      <p id={`${formId}-news-hint`} className="text-xs text-white/50">
        Prototype only — we will not email you from this demo.
      </p>
      <FieldError id={`${formId}-news-err`} message={error ?? undefined} />
    </form>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const ids = navLinks
      .filter((l) => l.href.startsWith("#"))
      .map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <LogoLink />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold tracking-wide transition",
                active === link.href
                  ? "text-accent"
                  : "text-white/80 hover:text-accent",
              )}
            >
              {link.label}
            </a>
          ))}
          {productLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold tracking-wide text-accent transition hover:text-accent-soft"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href="#connect"
          className="hidden rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition hover:bg-accent-soft lg:inline-flex"
        >
          Get involved
        </a>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1.5">
            <span className={cn("block h-0.5 w-5 bg-accent transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-5 bg-white transition", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-5 bg-accent transition", open && "-translate-y-2 -rotate-45")} />
          </span>
        </button>
      </div>
      {open ? (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-40 min-h-[calc(100dvh-4.5rem)] border-t border-white/10 bg-navy px-5 py-6 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-white hover:bg-navy-800 hover:text-accent"
              >
                {link.label}
              </a>
            ))}
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-accent hover:bg-navy-800"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#connect"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-3 text-center text-sm font-bold text-accent-ink"
            >
              Get involved
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function LogoLink() {
  return (
    <a href="#home" className="group flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-items-center rounded-full border border-accent/70 bg-navy-800">
        <span className="absolute h-2 w-2 rounded-full bg-accent" />
        <span className="absolute left-1.5 top-2 h-1.5 w-1.5 rounded-full bg-accent/90" />
        <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent/90" />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent">
          Center for
        </span>
        <span className="block text-sm font-bold text-white group-hover:text-accent-soft">
          Digital Democracy
        </span>
      </span>
    </a>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <a
      href="#home"
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-accent text-lg font-bold text-accent-ink shadow-lg transition hover:bg-accent-soft"
      aria-label="Back to top"
    >
      ↑
    </a>
  );
}
