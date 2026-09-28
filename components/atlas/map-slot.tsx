/**
 * Stable map mount for OV-08. Until boundary geometry is approved, the slot
 * shows the list twin (its children) and does not draw a shape.
 */
export function MapSlot({ children }: { children?: React.ReactNode }) {
  return (
    <div
      id="atlas-map-slot"
      data-atlas-map-slot="true"
      className="min-h-48 rounded-2xl border border-dashed border-atlas-line bg-atlas-map p-4"
    >
      <p className="text-sm font-semibold text-atlas-ink">Map pending boundary review</p>
      <div id="atlas-map-mount" data-atlas-map-mount="" />
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
