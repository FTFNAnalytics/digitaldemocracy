import Link from "next/link";
import { cn } from "@/lib/cn";

type IconName =
  | "shield"
  | "docs"
  | "globe"
  | "nodes"
  | "ballot"
  | "scale"
  | "chip"
  | "check"
  | "arrow";

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const common = cn("h-6 w-6", className);

  switch (name) {
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M12 3.2 5.5 5.8v5.4c0 4.1 2.7 7.8 6.5 9.2 3.8-1.4 6.5-5.1 6.5-9.2V5.8L12 3.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="m9 12 2 2 4-4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "docs":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M8 4.5h6.2L18 8.3V19a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 19V6A1.5 1.5 0 0 1 8.5 4.5H8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M14.2 4.6V8H18" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M9.5 12h5M9.5 15.5h5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="3.4" ry="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.2 12h15.6M6.2 8.2h11.6M6.2 15.8h11.6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "nodes":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="6" cy="7" r="2.1" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="18" cy="6.5" r="2.1" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="17" r="2.3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 7.8 10.4 15.2M16.1 8.1 13.7 15.1M8.2 6.7h7.4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "ballot":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="m8.5 12 2.2 2.2 4.8-5.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path d="M12 4v14.5M6 19.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 7H7l-2.5 5.2A2.6 2.6 0 0 0 7 16.2 2.6 2.6 0 0 0 9.5 12.2L7 7h5Zm0 0h5l2.5 5.2a2.6 2.6 0 0 1-2.3 4 2.6 2.6 0 0 1-2.5-4L17 7h-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "chip":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="10" y="10" width="4" height="4" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M9 4.5v2.5M12 4.5v2.5M15 4.5v2.5M9 17v2.5M12 17v2.5M15 17v2.5M4.5 9h2.5M4.5 12h2.5M4.5 15h2.5M17 9h2.5M17 12h2.5M17 15h2.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <circle cx="12" cy="12" r="9" fill="currentColor" className="text-accent" />
          <path
            d="m8.2 12.3 2.5 2.5 5.2-5.6"
            stroke="#142200"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "arrow":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden>
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function Logo({
  compact = false,
  href = "#home",
}: {
  compact?: boolean;
  href?: string;
}) {
  const mark = (
    <>
      <span className="relative grid h-10 w-10 place-items-center rounded-full border border-accent/70 bg-navy-800 shadow-[0_0_0_3px_rgb(162_255_0_/_0.12)]">
        <span className="absolute h-2 w-2 rounded-full bg-accent" />
        <span className="absolute -left-0.5 top-2 h-1.5 w-1.5 rounded-full bg-accent/90" />
        <span className="absolute bottom-1.5 right-0 h-1.5 w-1.5 rounded-full bg-accent/90" />
      </span>
      <span className={cn(compact && "sr-only", "leading-tight")}>
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-accent">
          Center for
        </span>
        <span className="block text-sm font-bold text-white group-hover:text-accent-soft">
          Digital Democracy
        </span>
      </span>
    </>
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className="group flex items-center gap-3">
        {mark}
      </Link>
    );
  }

  return (
    <a href={href} className="group flex items-center gap-3">
      {mark}
    </a>
  );
}
