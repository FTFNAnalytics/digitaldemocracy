import { resolveAtlasSqlitePath } from "./paths";

/** Invalidated when derive:atlas rebuilds the reading tables. */
export const ATLAS_DERIVED_TAG = "atlas-derived";

export type AtlasRevalidateResult = {
  tag: string;
  status: string;
};

/**
 * Drop cached jurisdiction pages for the current publication.
 * In-process revalidateTag succeeds only inside the Next server.
 * A running server is flushed when ATLAS_REVALIDATE_URL and
 * ATLAS_REVALIDATE_SECRET are both set.
 */
export async function revalidateAtlasDerivedTag(): Promise<AtlasRevalidateResult> {
  let memory = "skipped";
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag(ATLAS_DERIVED_TAG, { expire: 0 });
    memory = "tagged";
  } catch {
    memory = "skipped";
  }

  const base = process.env.ATLAS_REVALIDATE_URL?.trim();
  const secret = process.env.ATLAS_REVALIDATE_SECRET?.trim();
  if (!base || !secret) return { tag: ATLAS_DERIVED_TAG, status: memory };

  try {
    const endpoint = new URL("/api/atlas/revalidate", base.endsWith("/") ? base : `${base}/`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
    });
    return { tag: ATLAS_DERIVED_TAG, status: `${memory}:${response.status}` };
  } catch {
    return { tag: ATLAS_DERIVED_TAG, status: `${memory}:unreachable` };
  }
}

/**
 * Memoize a derived read until derive:atlas revalidates ATLAS_DERIVED_TAG.
 * Tests call the loader directly so a temp database is never served from cache.
 */
export async function readAtlasDerived<T>(key: string, loader: () => T): Promise<T> {
  if (process.env.VITEST) return loader();
  const { unstable_cache } = await import("next/cache");
  const sqlitePath = resolveAtlasSqlitePath();
  const cached = unstable_cache(async () => loader(), [ATLAS_DERIVED_TAG, sqlitePath, key], {
    revalidate: false,
    tags: [ATLAS_DERIVED_TAG],
  });
  return cached();
}
