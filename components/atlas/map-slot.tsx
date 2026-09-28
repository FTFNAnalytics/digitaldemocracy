import { ShowMap } from "./map/show-map";

/**
 * Map mount for a jurisdiction. With approved shapes, the list twin sits beside
 * the map. Without them, the list is full width and the map is not drawn.
 */
export function MapSlot({ children, map }: { children?: React.ReactNode; map?: React.ReactNode }) {
  if (!map) {
    return (
      <div
        id="atlas-map-slot"
        data-atlas-map-slot="true"
        data-atlas-map-state="pending"
        className="min-h-48 rounded-2xl border border-dashed border-atlas-line bg-atlas-map p-4"
      >
        <p className="text-sm font-semibold text-atlas-ink">Map pending boundary review</p>
        <div id="atlas-map-mount" data-atlas-map-mount="" />
        {children ? (
          <div data-atlas-list-twin="full" className="mt-4">
            {children}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div id="atlas-map-slot" data-atlas-map-slot="true" data-atlas-map-state="ready">
      <ShowMap map={map}>{children}</ShowMap>
    </div>
  );
}
