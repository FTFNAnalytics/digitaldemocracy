"use client";

import { useRef } from "react";

/** Arrow keys move through server-rendered results. Enter follows the focused link. */
export function SearchKeyboard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const root = ref.current;
    if (!root) return;
    const links = [...root.querySelectorAll<HTMLAnchorElement>("a[data-search-result]")];
    if (links.length === 0) return;
    const index = links.findIndex((link) => link === document.activeElement);
    event.preventDefault();
    if (event.key === "ArrowDown") {
      const next = links[index < 0 ? 0 : Math.min(index + 1, links.length - 1)];
      next?.focus();
      return;
    }
    const next = links[index <= 0 ? 0 : index - 1];
    next?.focus();
  }

  return (
    <div ref={ref} onKeyDown={onKeyDown} data-search-keyboard="true">
      {children}
    </div>
  );
}
