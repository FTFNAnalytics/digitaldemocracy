import Link from "next/link";
import type { Crumb } from "./types";

export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-atlas-ink-2">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-atlas-line">
                  ›
                </span>
              ) : null}
              {item.href && !current ? (
                <Link href={item.href} className="text-atlas-accent hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={current ? "page" : undefined} className="text-atlas-ink">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
