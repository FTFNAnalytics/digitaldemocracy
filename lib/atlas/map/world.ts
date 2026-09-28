import { existsSync } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { coverageState } from "@/components/atlas/labels";
import type { AtlasCoverageSnapshot } from "@/components/atlas/types";
import { openAtlasDatabase, tableExists } from "../sqlite";
import { coveragePaint } from "./model";
import worldLand from "./world-land.json";

export type WorldLand = {
  source: string;
  viewBox: string;
  width: number;
  height: number;
  land: string;
  points: Record<string, [number, number]>;
};

export const WORLD_LAND = worldLand as unknown as WorldLand;

export type WorldMarkerInput = {
  countryId: string;
  countryCode: string | null;
  name: string;
  href: string;
  resultRows: number;
  coverage: AtlasCoverageSnapshot | null;
};

export type WorldMarker = WorldMarkerInput & {
  x: number;
  y: number;
  radius: number;
  paint: ReturnType<typeof coveragePaint>;
  coverageState: ReturnType<typeof coverageState>;
};

const MIN_RADIUS = 3.5;
const MAX_RADIUS = 16;

/** Area grows with result rows. A zero count stays at the minimum radius. */
export function worldMarkerRadius(resultRows: number, maxResultRows: number): number {
  if (resultRows <= 0 || maxResultRows <= 0) return MIN_RADIUS;
  const t = Math.sqrt(resultRows) / Math.sqrt(maxResultRows);
  return Math.round((MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.min(1, t)) * 10) / 10;
}

export function buildWorldMarkers(rows: WorldMarkerInput[], land: WorldLand = WORLD_LAND): WorldMarker[] {
  const located = rows.flatMap((row) => {
    const iso = row.countryCode?.trim().toUpperCase() ?? "";
    const point = land.points[iso];
    if (!point) return [];
    return [{ row, x: point[0], y: point[1] }];
  });
  const maxRows = located.reduce((max, item) => Math.max(max, item.row.resultRows), 0);
  return located.map((item) => ({
    ...item.row,
    x: item.x,
    y: item.y,
    radius: worldMarkerRadius(item.row.resultRows, maxRows),
    paint: coveragePaint(item.row.coverage),
    coverageState: coverageState(item.row.coverage),
  }));
}

export function countResultRowsByCountry(sqlitePath: string): Map<string, number> {
  if (!existsSync(sqlitePath)) return new Map();
  let db: DatabaseSync | null = null;
  try {
    db = openAtlasDatabase(sqlitePath, { readOnly: true });
    if (!tableExists(db, "result_row")) return new Map();
    const counts = new Map<string, number>();
    for (const row of db.prepare("SELECT country_id, COUNT(*) AS n FROM result_row GROUP BY country_id").all() as Array<{
      country_id: string;
      n: number;
    }>) {
      counts.set(String(row.country_id), Number(row.n) || 0);
    }
    return counts;
  } catch {
    return new Map();
  } finally {
    db?.close();
  }
}
