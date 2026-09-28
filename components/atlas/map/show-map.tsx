"use client";

import { useState } from "react";

/**
 * Below 768px the list twin stays on screen and the map waits behind this control.
 * At md and wider the map is visible and the control is not.
 */
export function ShowMap({ map, children }: { map: React.ReactNode; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-atlas-map-frame="true">
      <button
        type="button"
        className="mb-3 rounded-full border border-atlas-line bg-atlas-card px-3 py-2 text-sm font-semibold text-atlas-ink md:hidden"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide map" : "Show map"}
      </button>
      <div className="grid gap-4 md:grid-cols-2">
        <div data-atlas-map-panel className={open ? "block" : "hidden md:block"}>
          {map}
        </div>
        <div data-atlas-list-twin="companion">{children}</div>
      </div>
    </div>
  );
}
