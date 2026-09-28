export type JurisdictionLevel = "country" | "region" | "municipality" | "ward" | "area";

export type LevelDecision = {
  levelLabel: JurisdictionLevel;
  ambiguous: 0 | 1;
};

const KNOWN_TIERS = new Set(["national_context", "regional", "municipal", "other"]);

function knownTiers(tiers: Array<string | null>): string[] {
  const found = new Set<string>();
  for (const tier of tiers) {
    if (tier != null && KNOWN_TIERS.has(tier)) found.add(tier);
  }
  return [...found].sort();
}

function area(): LevelDecision {
  return { levelLabel: "area", ambiguous: 1 };
}

/** A descendant tier is allowed under this level. national_context never is. */
function descendantFits(level: JurisdictionLevel, tier: string): boolean {
  if (tier === "national_context") return false;
  if (level === "region") return tier === "regional" || tier === "municipal" || tier === "other";
  if (level === "municipality") return tier === "municipal" || tier === "other";
  if (level === "ward") return tier === "other";
  return false;
}

/**
 * Level from depth plus the tiers of offices at the node and under it.
 * A single regional or municipal tier is that level at any depth.
 * Mixed tiers, a national_context office on a geography row, or an "other"
 * tier above ward depth become "area" with ambiguous=1.
 */
export function classifyJurisdictionLevel(args: {
  isCountry: boolean;
  depth: number;
  directTiers: Array<string | null>;
  descendantTiers: Array<string | null>;
}): LevelDecision {
  if (args.isCountry) return { levelLabel: "country", ambiguous: 0 };

  const direct = knownTiers(args.directTiers);
  const under = knownTiers(args.descendantTiers);

  if (direct.length > 1) return area();
  if (direct.length === 1) {
    const tier = direct[0]!;
    if (tier === "national_context") return area();
    if (tier === "other") {
      if (args.depth >= 3 && under.every((item) => descendantFits("ward", item))) {
        return { levelLabel: "ward", ambiguous: 0 };
      }
      return area();
    }
    const level: JurisdictionLevel = tier === "regional" ? "region" : "municipality";
    if (!under.every((item) => descendantFits(level, item))) return area();
    return { levelLabel: level, ambiguous: 0 };
  }

  if (under.length === 0) {
    if (args.depth <= 1) return { levelLabel: "region", ambiguous: 0 };
    if (args.depth === 2) return { levelLabel: "municipality", ambiguous: 0 };
    return { levelLabel: "ward", ambiguous: 0 };
  }
  if (under.includes("national_context")) return area();
  if (under.includes("regional") && under.includes("municipal")) return area();
  if (under.every((item) => item === "regional")) return { levelLabel: "region", ambiguous: 0 };
  if (under.every((item) => item === "municipal" || item === "other") && under.includes("municipal")) {
    // A first-level container of municipal offices is a region.
    // Deeper containers without an office of their own are not given a guessed label.
    if (args.depth === 1) return { levelLabel: "region", ambiguous: 0 };
    return area();
  }
  return area();
}
