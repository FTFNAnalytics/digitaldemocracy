/** Slugs reserved so later Atlas routes can own these segments. */
export const RESERVED_SLUG_SEGMENTS = new Set(["seats", "elections", "people", "search"]);

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

/**
 * Deterministic ASCII slug: compatibility fold, lower case, hyphenated.
 * Empty input becomes "unnamed".
 */
export function foldSlug(value: string): string {
  const replaced = value.replace(/[æÆœŒøØłŁßđĐðÐþÞıİŋŊħĦ]/g, (char) => ASCII_FOLDS[char] ?? "");
  const folded = replaced.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const slug = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "unnamed";
}

export type SlugNode = {
  jurisdictionKey: string;
  parentKey: string | null;
  depth: number;
  /** country_id for the country row; ignored for geographies. */
  countryId: string;
  name: string;
  slug: string;
  slugPath: string;
};

export type SlugAlias = {
  slugPath: string;
  jurisdictionKey: string;
  reason: string;
};

export type PublishedSlugMeanings = {
  /** Every published path, canonical and alias, and the key it must keep. */
  meaning: Map<string, string>;
  /** Reason already stored for an alias path. Canonical paths are absent. */
  aliasReason: Map<string, string>;
};

export function emptySlugMeanings(): PublishedSlugMeanings {
  return { meaning: new Map(), aliasReason: new Map() };
}

function nextSegment(base: string, used: Set<string>): string {
  const root = base || "unnamed";
  if (!used.has(root) && !RESERVED_SLUG_SEGMENTS.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`) || RESERVED_SLUG_SEGMENTS.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

function joinPath(parentPath: string | null, segment: string): string {
  return parentPath ? `${parentPath}/${segment}` : segment;
}

/**
 * Assign slug and slug_path. A path that already means some jurisdiction_key
 * is never given to a different key. When a key's path changes, the old path
 * is returned as an alias.
 */
export function assignSlugs(nodes: SlugNode[], prior: PublishedSlugMeanings): SlugAlias[] {
  const byKey = new Map(nodes.map((node) => [node.jurisdictionKey, node]));
  const assignedPath = new Map<string, string>();
  const depths = [...new Set(nodes.map((node) => node.depth))].sort((a, b) => a - b);

  for (const depth of depths) {
    const groups = new Map<string, SlugNode[]>();
    for (const node of nodes) {
      if (node.depth !== depth) continue;
      const groupKey = node.parentKey ?? "";
      const list = groups.get(groupKey) ?? [];
      list.push(node);
      groups.set(groupKey, list);
    }
    const groupKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));
    for (const groupKey of groupKeys) {
      const siblings = groups.get(groupKey) ?? [];
      siblings.sort((a, b) => a.jurisdictionKey.localeCompare(b.jurisdictionKey));
      const parentPath =
        groupKey === ""
          ? null
          : (() => {
              const parent = byKey.get(groupKey);
              if (!parent || !parent.slugPath) {
                throw new Error(`Jurisdiction ${groupKey} is missing a parent slug`);
              }
              return parent.slugPath;
            })();
      const used = new Set<string>();
      for (const node of siblings) {
        const base = depth === 0 ? foldSlug(node.countryId) : foldSlug(node.name);
        let segment = nextSegment(base, used);
        let path = joinPath(parentPath, segment);
        while (
          assignedPath.has(path) ||
          (prior.meaning.has(path) && prior.meaning.get(path) !== node.jurisdictionKey)
        ) {
          used.add(segment);
          segment = nextSegment(base, used);
          path = joinPath(parentPath, segment);
        }
        used.add(segment);
        node.slug = segment;
        node.slugPath = path;
        assignedPath.set(path, node.jurisdictionKey);
      }
    }
  }

  const aliases: SlugAlias[] = [];
  const priorPaths = [...prior.meaning.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [path, key] of priorPaths) {
    const node = byKey.get(key);
    if (!node) continue;
    if (node.slugPath === path) continue;
    if (assignedPath.has(path)) {
      throw new Error(`Published slug ${path} changed meaning`);
    }
    aliases.push({
      slugPath: path,
      jurisdictionKey: key,
      reason: prior.aliasReason.get(path) ?? "rename",
    });
    assignedPath.set(path, key);
  }
  aliases.sort((a, b) => a.slugPath.localeCompare(b.slugPath) || a.jurisdictionKey.localeCompare(b.jurisdictionKey));
  return aliases;
}
