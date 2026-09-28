const ASCII_FOLDS: Record<string, string> = {
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ø: "o",
  Ø: "o",
  ł: "l",
  Ł: "l",
  ß: "ss",
  đ: "d",
  Đ: "d",
  ð: "d",
  Ð: "d",
  þ: "th",
  Þ: "th",
  ı: "i",
  İ: "i",
  ŋ: "n",
  Ŋ: "n",
  ħ: "h",
  Ħ: "h",
};

export type FoldedText = {
  folded: string;
  /** Original string index where each folded character begins. */
  origin: number[];
};

/**
 * Case, diacritic, and punctuation folding. Letters and digits are kept;
 * everything else becomes a space. This is the only normalisation search uses.
 */
export function foldSearchText(value: string): string {
  return foldAligned(value).folded.trim().replace(/ +/g, " ");
}

export function foldAligned(value: string): FoldedText {
  let folded = "";
  const origin: number[] = [];
  for (let index = 0; index < value.length; ) {
    const code = value.codePointAt(index)!;
    const char = String.fromCodePoint(code);
    const next = index + char.length;
    const special = ASCII_FOLDS[char];
    const piece = (special ?? char.normalize("NFD").replace(/\p{M}/gu, "")).toLowerCase();
    const letters = piece.replace(/[^a-z0-9]+/g, "");
    if (letters.length === 0) {
      if (folded.length > 0 && !folded.endsWith(" ")) {
        folded += " ";
        origin.push(index);
      }
    } else {
      for (const letter of letters) {
        folded += letter;
        origin.push(index);
      }
    }
    index = next;
  }
  return { folded, origin };
}

export function searchTokens(folded: string): string[] {
  const trimmed = folded.trim();
  return trimmed ? trimmed.split(/ +/) : [];
}

export function trigramsForToken(token: string): string[] {
  if (token.length < 3) return [];
  const seen = new Set<string>();
  const grams: string[] = [];
  for (let index = 0; index <= token.length - 3; index += 1) {
    const gram = token.slice(index, index + 3);
    if (seen.has(gram)) continue;
    seen.add(gram);
    grams.push(gram);
  }
  return grams;
}

export function documentTrigrams(folded: string): string[] {
  const seen = new Set<string>();
  for (const token of searchTokens(folded)) {
    for (const gram of trigramsForToken(token)) seen.add(gram);
  }
  return [...seen];
}

export function tokenFrequencies(folded: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of searchTokens(folded)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

/** Every query token is a prefix of some document token. */
export function tokensMatch(docTokens: string[], queryTokens: string[]): boolean {
  return queryTokens.every((query) => docTokens.some((doc) => doc.startsWith(query)));
}

export function prefixUpperBound(token: string): string {
  const last = token.charCodeAt(token.length - 1);
  return token.slice(0, -1) + String.fromCharCode(last + 1);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Highlight query tokens in the original display string.
 * The result is escaped HTML with <mark> around each match.
 */
export function highlightSnippet(display: string, queryTokens: string[]): string {
  if (!display) return "";
  const aligned = foldAligned(display);
  const folded = aligned.folded;
  const ranges: Array<{ start: number; end: number }> = [];
  for (const token of queryTokens) {
    if (!token) continue;
    let from = 0;
    while (from <= folded.length - token.length) {
      const at = folded.indexOf(token, from);
      if (at < 0) break;
      const boundary = at === 0 || folded[at - 1] === " ";
      if (boundary) {
        const start = aligned.origin[at] ?? 0;
        const last = aligned.origin[at + token.length - 1] ?? start;
        const lastChar = String.fromCodePoint(display.codePointAt(last) ?? 0);
        ranges.push({ start, end: last + lastChar.length });
      }
      from = at + token.length;
    }
  }
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  let html = "";
  let cursor = 0;
  for (const range of merged) {
    html += escapeHtml(display.slice(cursor, range.start));
    html += `<mark class="bg-atlas-tint text-atlas-ink">${escapeHtml(display.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  }
  html += escapeHtml(display.slice(cursor));
  return html;
}
