import { foldSlug } from "../derive/slug";

export type PersonSlugInput = {
  personId: string;
  canonicalLabel: string;
  countryId: string;
};

/** Deterministic slug. A collision across countries keeps the first person_id and suffixes the rest. */
export function assignPersonSlugs(persons: PersonSlugInput[]): Map<string, string> {
  const ordered = [...persons].sort((a, b) => a.personId.localeCompare(b.personId));
  const used = new Set<string>();
  const slugs = new Map<string, string>();
  for (const person of ordered) {
    const base = foldSlug(person.canonicalLabel);
    const country = foldSlug(person.countryId);
    let slug = base;
    if (used.has(slug)) slug = `${base}-${country}`;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${country}-${n}`;
      n += 1;
    }
    used.add(slug);
    slugs.set(person.personId, slug);
  }
  return slugs;
}

export function personIdFor(countryId: string, canonicalLabel: string): string {
  return `person:${countryId}:${foldSlug(canonicalLabel)}`;
}
