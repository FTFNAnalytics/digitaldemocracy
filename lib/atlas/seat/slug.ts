import { foldSlug } from "../derive/slug";

export type OfficeSlugInput = {
  idNamespace: string;
  officeId: string;
  name: string;
  jurisdictionKey: string;
  jurisdictionSlugPath: string;
};

export type OfficeSlugRow = {
  id_namespace: string;
  office_id: string;
  jurisdiction_key: string;
  slug: string;
  slug_path: string;
};

export type OfficeSlugAlias = {
  slug_path: string;
  id_namespace: string;
  office_id: string;
  reason: string;
};

export type OfficeSlugMeanings = {
  /** Every published path, canonical and alias, and the office it must keep. */
  meaning: Map<string, string>;
  aliasReason: Map<string, string>;
};

export function emptyOfficeSlugMeanings(): OfficeSlugMeanings {
  return { meaning: new Map(), aliasReason: new Map() };
}

export function officeIdentity(idNamespace: string, officeId: string): string {
  return `${idNamespace}\n${officeId}`;
}

function nextSegment(base: string, used: Set<string>): string {
  const root = base || "unnamed";
  if (!used.has(root)) return root;
  let n = 2;
  while (used.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

function seatPath(jurisdictionSlugPath: string, segment: string): string {
  return `${jurisdictionSlugPath}/seats/${segment}`;
}

/**
 * Deterministic office slugs, unique within a jurisdiction.
 * A path that already means some office is never given to a different office.
 * When an office's path changes, the old path is returned as an alias.
 */
export function assignOfficeSlugs(offices: OfficeSlugInput[], prior: OfficeSlugMeanings): {
  rows: OfficeSlugRow[];
  aliases: OfficeSlugAlias[];
} {
  const groups = new Map<string, OfficeSlugInput[]>();
  for (const office of offices) {
    const list = groups.get(office.jurisdictionKey) ?? [];
    list.push(office);
    groups.set(office.jurisdictionKey, list);
  }

  const assigned = new Map<string, string>();
  const currentPath = new Map<string, string>();
  const rows: OfficeSlugRow[] = [];
  const groupKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  for (const groupKey of groupKeys) {
    const siblings = [...(groups.get(groupKey) ?? [])].sort(
      (a, b) => a.idNamespace.localeCompare(b.idNamespace) || a.officeId.localeCompare(b.officeId),
    );
    const used = new Set<string>();
    for (const office of siblings) {
      if (!office.jurisdictionSlugPath) {
        throw new Error(`Office ${office.officeId} is missing a jurisdiction slug`);
      }
      const identity = officeIdentity(office.idNamespace, office.officeId);
      const base = foldSlug(office.name);
      let segment = nextSegment(base, used);
      let path = seatPath(office.jurisdictionSlugPath, segment);
      while (assigned.has(path) || (prior.meaning.has(path) && prior.meaning.get(path) !== identity)) {
        used.add(segment);
        segment = nextSegment(base, used);
        path = seatPath(office.jurisdictionSlugPath, segment);
      }
      used.add(segment);
      assigned.set(path, identity);
      currentPath.set(identity, path);
      rows.push({
        id_namespace: office.idNamespace,
        office_id: office.officeId,
        jurisdiction_key: office.jurisdictionKey,
        slug: segment,
        slug_path: path,
      });
    }
  }

  const aliases: OfficeSlugAlias[] = [];
  const priorPaths = [...prior.meaning.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [path, identity] of priorPaths) {
    if (!currentPath.has(identity)) continue;
    if (currentPath.get(identity) === path) continue;
    if (assigned.has(path)) {
      throw new Error(`Published office slug ${path} changed meaning`);
    }
    const [idNamespace, officeId] = identity.split("\n");
    if (!idNamespace || !officeId) throw new Error(`Bad office identity ${identity}`);
    aliases.push({
      slug_path: path,
      id_namespace: idNamespace,
      office_id: officeId,
      reason: prior.aliasReason.get(path) ?? "rename",
    });
    assigned.set(path, identity);
  }

  rows.sort(
    (a, b) => a.id_namespace.localeCompare(b.id_namespace) || a.office_id.localeCompare(b.office_id),
  );
  aliases.sort((a, b) => a.slug_path.localeCompare(b.slug_path));
  return { rows, aliases };
}
