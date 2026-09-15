"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OBS_BASE, obsNav, obsSecondaryNav } from "@/lib/observatory/routes";
import { cn } from "@/lib/cn";

export function ObservatoryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Observatory" className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
      {obsNav.map((item) => {
        const active =
          item.href === OBS_BASE
            ? pathname === OBS_BASE
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 font-semibold tracking-wide transition",
              active ? "text-accent" : "text-white/80 hover:text-accent",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <span className="hidden px-1 text-white/25 sm:inline" aria-hidden>
        ·
      </span>
      {obsSecondaryNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-full px-3 py-1.5 text-white/65 transition hover:text-accent",
            pathname === item.href && "font-semibold text-accent",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
