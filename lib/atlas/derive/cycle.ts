export type EventPlacement =
  | { placed: true; isoDate: string }
  | { placed: false; year: number | null };

export function formatIsoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Resolved day-precision dates join a cycle. Every other precision or an
 * unresolved date stays unplaced. Year is kept only when that row supplies one.
 */
export function placeEvent(args: {
  dateResolution: string;
  precision: string | null;
  year: number | null;
  month: number | null;
  day: number | null;
}): EventPlacement {
  if (
    args.dateResolution === "resolved" &&
    args.precision === "day" &&
    args.year != null &&
    args.month != null &&
    args.day != null
  ) {
    return { placed: true, isoDate: formatIsoDate(args.year, args.month, args.day) };
  }
  const year =
    args.year != null && (args.precision === "day" || args.precision === "month" || args.precision === "year")
      ? args.year
      : null;
  return { placed: false, year };
}

export function cycleKey(countryId: string, isoDate: string): string {
  return `cycle:${countryId}:${isoDate}`;
}

function tierAdjective(tiers: string[]): string | null {
  if (tiers.length !== 1) return null;
  if (tiers[0] === "municipal") return "municipal";
  if (tiers[0] === "regional") return "regional";
  if (tiers[0] === "national_context") return "national";
  return null;
}

/** Fact label. No election name is introduced. */
export function cycleLabel(args: {
  isoDate: string;
  countryName: string;
  contestCount: number;
  tiers: string[];
}): string {
  const noun = args.contestCount === 1 ? "contest" : "contests";
  const adjective = tierAdjective(args.tiers);
  const contests = adjective
    ? `${args.contestCount} ${adjective} ${noun}`
    : `${args.contestCount} ${noun}`;
  return `${args.isoDate} · ${args.countryName} · ${contests}`;
}

export function lowestCommonAncestor(paths: string[][]): string {
  if (paths.length === 0) throw new Error("A cycle needs at least one contest");
  const first = paths[0]!;
  let shared = 0;
  while (shared < first.length && paths.every((path) => path[shared] === first[shared])) shared += 1;
  if (shared === 0) throw new Error("Contests do not share a jurisdiction");
  return first[shared - 1]!;
}
