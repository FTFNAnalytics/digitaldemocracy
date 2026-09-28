"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Logo href="/" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold tracking-wide text-white/80 transition hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/atlas/search"
          className="hidden rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition hover:bg-accent-soft lg:inline-flex"
        >
          Search
        </Link>
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
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base font-semibold text-white hover:bg-navy-800 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/atlas/search"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-accent px-4 py-3 text-center text-sm font-bold text-accent-ink"
            >
              Search
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
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
      href="#content"
      className="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-accent text-lg font-bold text-accent-ink shadow-lg transition hover:bg-accent-soft"
      aria-label="Back to top"
    >
      ↑
    </a>
  );
}
