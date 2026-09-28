"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { atlasRoutes } from "@/lib/atlas/routes";
import { SEARCH_MODES, searchModeLabel, type SearchMode } from "@/lib/atlas/search-params";

type PaletteHit = {
  title: string;
  snippet: string;
  disambiguation: string;
  href: string;
  countryName: string;
};

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<SearchMode>("seat");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PaletteHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (!query) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ mode, q: query });
      fetch(`/api/atlas/search?${params.toString()}`, { signal: controller.signal })
        .then(async (response) => {
          const body = (await response.json()) as { error?: string; results?: PaletteHit[] };
          if (!response.ok) {
            setHits([]);
            setError(body.error ?? "Search failed.");
            return;
          }
          setError(null);
          setHits(body.results ?? []);
          setActive(0);
        })
        .catch((cause: unknown) => {
          if (cause instanceof DOMException && cause.name === "AbortError") return;
          setError("Search failed.");
        });
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, mode, q]);

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && hits[active]) {
      event.preventDefault();
      window.location.assign(hits[active].href);
    }
  }

  return (
    <>
      <Link
        href={atlasRoutes.search}
        className="text-sm font-semibold text-atlas-accent hover:underline"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        Search
      </Link>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-atlas-ink/40 px-4 py-16" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-xl rounded-2xl border border-atlas-line bg-atlas-card p-4 text-atlas-ink shadow-none"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={onDialogKeyDown}
          >
            <h2 id={titleId} className="font-atlas-heading text-xl">
              Search the Atlas
            </h2>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Search mode">
              {SEARCH_MODES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                    item === mode ? "border-atlas-accent bg-atlas-tint text-atlas-accent" : "border-atlas-line text-atlas-ink"
                  }`}
                  aria-pressed={item === mode}
                  onClick={() => setMode(item)}
                >
                  {searchModeLabel(item)}
                </button>
              ))}
            </div>
            <label className="mt-3 block text-sm">
              <span className="sr-only">Query</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(event) => {
                  const next = event.target.value;
                  setQ(next);
                  if (!next.trim()) {
                    setHits([]);
                    setError(null);
                  }
                }}
                placeholder="Name, place, or date"
                className="obs-input w-full"
                maxLength={200}
              />
            </label>
            {error ? <p className="mt-3 text-sm text-atlas-ink-2">{error}</p> : null}
            <ul className="mt-3 max-h-80 overflow-auto" aria-label="Search suggestions">
              {hits.map((hit, index) => (
                <li key={`${hit.href}:${hit.title}:${index}`}>
                  <a
                    href={hit.href}
                    data-search-result
                    className={`block rounded-xl px-3 py-2 ${index === active ? "bg-atlas-tint" : ""}`}
                    onMouseEnter={() => setActive(index)}
                  >
                    <span className="font-semibold text-atlas-accent">{hit.title}</span>
                    <span className="mt-1 block text-sm text-atlas-ink-2" dangerouslySetInnerHTML={{ __html: hit.snippet }} />
                    <span className="mt-1 block text-xs text-atlas-ink-2">{hit.disambiguation}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-atlas-ink-2">
              <Link href={q ? `${atlasRoutes.search}?mode=${mode}&q=${encodeURIComponent(q)}` : atlasRoutes.search} className="font-semibold text-atlas-accent hover:underline">
                Open the search page
              </Link>
              {" · "}
              Ctrl/Cmd K
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
