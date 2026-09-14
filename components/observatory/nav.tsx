"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OBS_BASE, obsNav, obsSecondaryNav } from "@/lib/observatory/routes";
import { cn } from "@/lib/cn";

export function ObservatoryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Observatory" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
              "border-b-2 py-1 font-medium",
              active ? "border-navy text-navy" : "border-transparent text-navy/70 hover:text-navy",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <span className="hidden text-navy/30 sm:inline" aria-hidden>
        ·
      </span>
      {obsSecondaryNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "py-1 text-navy/65 hover:text-navy",
            pathname === item.href && "font-semibold text-navy",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
