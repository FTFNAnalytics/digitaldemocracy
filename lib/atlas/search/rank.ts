export const BM25_K1 = 1.2;
export const BM25_B = 0.75;
/** Added when the folded query equals the folded primary name. */
export const EXACT_NAME_BOOST = 0.35;
/** Added per year after 1900. Small enough that it only separates equal BM25 scores. */
export const YEAR_BOOST_PER_YEAR = 0.00001;

export function regionRank(regionId: string): number {
  if (regionId === "europe") return 0;
  if (regionId === "americas") return 1;
  if (regionId === "oceania") return 2;
  return 3;
}

export function rankScore(bm25: number, exactName: boolean, year: number | null): number {
  const exact = exactName ? EXACT_NAME_BOOST : 0;
  const later = year == null ? 0 : Math.max(0, year - 1900) * YEAR_BOOST_PER_YEAR;
  return bm25 + exact + later;
}

export function bm25Score(
  termFrequency: Map<string, number>,
  tokenCount: number,
  queryTokens: string[],
  documentFrequencies: number[],
  docCount: number,
  avgTokens: number,
): number {
  if (docCount <= 0 || tokenCount <= 0) return 0;
  const average = avgTokens > 0 ? avgTokens : 1;
  let score = 0;
  for (let index = 0; index < queryTokens.length; index += 1) {
    const token = queryTokens[index]!;
    let freq = 0;
    for (const [term, tf] of termFrequency) {
      if (term.startsWith(token)) freq += tf;
    }
    if (freq <= 0) continue;
    const df = Math.min(docCount, Math.max(1, documentFrequencies[index] ?? 1));
    const idf = Math.log((docCount - df + 0.5) / (df + 0.5) + 1);
    const denom = freq + BM25_K1 * (1 - BM25_B + BM25_B * (tokenCount / average));
    score += idf * ((freq * (BM25_K1 + 1)) / denom);
  }
  return score;
}

export type RankedHit = {
  score: number;
  regionRank: number;
  year: number | null;
  title: string;
  searchId: number;
};

/** Higher score first. Equal scores put Europe ahead of other regions, then later years. */
export function compareRanked(left: RankedHit, right: RankedHit): number {
  if (left.score !== right.score) return right.score - left.score;
  if (left.regionRank !== right.regionRank) return left.regionRank - right.regionRank;
  const leftYear = left.year ?? -1;
  const rightYear = right.year ?? -1;
  if (leftYear !== rightYear) return rightYear - leftYear;
  const title = left.title.localeCompare(right.title);
  if (title !== 0) return title;
  return left.searchId - right.searchId;
}
