import type { DatabaseSync } from "node:sqlite";
import { isCollectiveOfficeType, WITHHELD_EVIDENCE } from "../derive/seat";
import { foldSearchText } from "../search/text";
import { personIdFor } from "./slug";
import {
  INITIALS_HOLD_REASON,
  PEOPLE_SCHEMA,
  type ExcludedListLabel,
  type PeopleProposalFile,
  type PersonAliasProposal,
  type PersonOfficeEvidence,
  type PersonProposal,
} from "./types";

type OfficeBucket = {
  name: string;
  years: Set<number>;
  count: number;
};

type LabelBucket = {
  count: number;
  offices: Map<string, OfficeBucket>;
  years: Set<number>;
  releases: Map<string, number>;
};

type Cluster = {
  folded: string;
  labels: Map<string, LabelBucket>;
  offices: Map<string, OfficeBucket>;
  years: Set<number>;
  releases: Map<string, number>;
  rowCount: number;
};

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isInitialsOnlyLabel(label: string): boolean {
  const tokens = foldSearchText(label).split(" ").filter((token) => token.length > 0);
  return tokens.length > 0 && tokens.every((token) => token.length === 1);
}

/** Party lists and slates are excluded by office type and ballot basis, not by guessing from the name. */
export function isListLabel(officeType: string, ballotBasis: string): boolean {
  if (ballotBasis === "list_votes") return true;
  if (isCollectiveOfficeType(officeType)) return true;
  const normalized = officeType.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalized.includes("list") || normalized.includes("slate");
}

function lowercaseCount(label: string): number {
  return [...label].filter((char) => /\p{Ll}/u.test(char)).length;
}

function punctuationCount(label: string): number {
  return [...label].filter((char) => /[^\p{L}\p{N}\s]/u.test(char)).length;
}

/** Most frequent surface form, then the form that still looks like a written name. */
export function chooseCanonicalLabel(counts: Map<string, number>): string {
  const labels = [...counts.keys()];
  if (labels.length === 0) throw new Error("person cluster has no label");
  labels.sort((left, right) => {
    const byCount = (counts.get(right) ?? 0) - (counts.get(left) ?? 0);
    if (byCount !== 0) return byCount;
    const byLower = lowercaseCount(right) - lowercaseCount(left);
    if (byLower !== 0) return byLower;
    const byPunct = punctuationCount(left) - punctuationCount(right);
    if (byPunct !== 0) return byPunct;
    const byLength = right.length - left.length;
    if (byLength !== 0) return byLength;
    return left.localeCompare(right);
  });
  return labels[0]!;
}

function mostCommon(counts: Map<string, number>): string | null {
  const entries = [...counts.entries()].filter(([key]) => key !== "");
  if (entries.length === 0) return null;
  entries.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  return entries[0]![0];
}

function touchOffice(offices: Map<string, OfficeBucket>, officeId: string, name: string, year: number | null): void {
  let bucket = offices.get(officeId);
  if (!bucket) {
    bucket = { name, years: new Set(), count: 0 };
    offices.set(officeId, bucket);
  }
  bucket.count += 1;
  if (year != null) bucket.years.add(year);
}

function evidenceNote(rowCount: number, years: number[], officeIds: string[], holdReason: string | null): string {
  const parts = [`rows=${rowCount}`, `years=${years.join(",")}`, `offices=${officeIds.join(",")}`];
  if (holdReason) parts.push(`hold=${holdReason}`);
  return parts.join("; ");
}

function officeEvidence(offices: Map<string, OfficeBucket>): PersonOfficeEvidence[] {
  return [...offices.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([officeId, bucket]) => ({
      office_id: officeId,
      name: bucket.name,
      years: [...bucket.years].sort((a, b) => a - b),
      row_count: bucket.count,
    }));
}

function yearsOf(years: Set<number>): number[] {
  return [...years].sort((a, b) => a - b);
}

function officeScope(offices: Map<string, OfficeBucket>): string {
  const ids = [...offices.keys()].sort((a, b) => a.localeCompare(b));
  return ids.length > 0 ? ids.join(",") : "unscoped";
}

/**
 * Cluster one country's candidate labels.
 * Same folded spelling is one proposal. A different surname is never merged.
 * Initials-only labels stay their own proposal with a hold reason.
 * List and slate rows are excluded.
 */
export function proposePeopleForCountry(db: DatabaseSync, countryId: string): PeopleProposalFile {
  const rows = db
    .prepare(
      `SELECT r.candidate_or_list_label AS label, r.office_id, r.release_id, r.evidence_status,
              o.name AS office_name, o.office_type, e.ballot_basis, d.year
       FROM result_row r
       JOIN office o ON o.id_namespace = r.id_namespace AND o.office_id = r.office_id
       JOIN election_event e
         ON e.id_namespace = r.id_namespace AND e.office_id = r.office_id AND e.history_key = r.history_key
       LEFT JOIN research_date d ON d.date_id = e.date_id
       WHERE r.country_id = ?
         AND r.candidate_or_list_label IS NOT NULL
         AND length(trim(r.candidate_or_list_label)) > 0
       ORDER BY r.candidate_or_list_label, r.office_id, r.result_row_id`,
    )
    .all(countryId) as Array<Record<string, unknown>>;

  const clusters = new Map<string, Cluster>();
  const excluded = new Map<string, ExcludedListLabel>();
  let eligible = 0;
  let excludedCount = 0;
  let withheldCount = 0;

  for (const row of rows) {
    const label = text(row.label).trim();
    if (!label || foldSearchText(label) === "") continue;
    if (WITHHELD_EVIDENCE.has(text(row.evidence_status))) {
      withheldCount += 1;
      continue;
    }
    const officeType = text(row.office_type);
    const ballotBasis = text(row.ballot_basis);
    const officeId = text(row.office_id);
    if (isListLabel(officeType, ballotBasis)) {
      excludedCount += 1;
      const key = `${label}\u0000${officeId}\u0000${officeType}\u0000${ballotBasis}`;
      const existing = excluded.get(key);
      if (existing) existing.row_count += 1;
      else {
        excluded.set(key, {
          candidate_or_list_label: label,
          office_id: officeId,
          office_type: officeType,
          ballot_basis: ballotBasis,
          row_count: 1,
          reason: "list_label",
        });
      }
      continue;
    }

    eligible += 1;
    const folded = foldSearchText(label);
    let cluster = clusters.get(folded);
    if (!cluster) {
      cluster = {
        folded,
        labels: new Map(),
        offices: new Map(),
        years: new Set(),
        releases: new Map(),
        rowCount: 0,
      };
      clusters.set(folded, cluster);
    }
    const year = numOrNull(row.year);
    const officeName = text(row.office_name);
    const releaseId = text(row.release_id);
    cluster.rowCount += 1;
    if (year != null) cluster.years.add(year);
    if (releaseId) cluster.releases.set(releaseId, (cluster.releases.get(releaseId) ?? 0) + 1);
    touchOffice(cluster.offices, officeId, officeName, year);

    let labelBucket = cluster.labels.get(label);
    if (!labelBucket) {
      labelBucket = { count: 0, offices: new Map(), years: new Set(), releases: new Map() };
      cluster.labels.set(label, labelBucket);
    }
    labelBucket.count += 1;
    if (year != null) labelBucket.years.add(year);
    if (releaseId) labelBucket.releases.set(releaseId, (labelBucket.releases.get(releaseId) ?? 0) + 1);
    touchOffice(labelBucket.offices, officeId, officeName, year);
  }

  const ordered = [...clusters.values()].sort((left, right) => left.folded.localeCompare(right.folded));
  const usedIds = new Set<string>();
  const persons: PersonProposal[] = [];
  for (const cluster of ordered) {
    const counts = new Map([...cluster.labels.entries()].map(([label, bucket]) => [label, bucket.count]));
    const canonical = chooseCanonicalLabel(counts);
    let personId = personIdFor(countryId, canonical);
    if (usedIds.has(personId)) {
      let n = 2;
      while (usedIds.has(`${personId}-${n}`)) n += 1;
      personId = `${personId}-${n}`;
    }
    usedIds.add(personId);
    const holdReason = isInitialsOnlyLabel(cluster.folded) ? INITIALS_HOLD_REASON : null;
    const years = yearsOf(cluster.years);
    const aliases: PersonAliasProposal[] = [...cluster.labels.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([label, bucket]) => ({
        candidate_or_list_label: label,
        country_id: countryId,
        office_scope: officeScope(bucket.offices),
        review_status: "draft_for_human_review",
        evidence_note: evidenceNote(bucket.count, yearsOf(bucket.years), [...bucket.offices.keys()].sort(), holdReason),
        manual_cross_country: false,
      }));
    persons.push({
      person_id: personId,
      canonical_label: canonical,
      country_id: countryId,
      review_status: "draft_for_human_review",
      created_from_release_id: mostCommon(cluster.releases),
      reviewed_on: null,
      hold_reason: holdReason,
      evidence: {
        offices: officeEvidence(cluster.offices),
        years,
        row_count: cluster.rowCount,
      },
      aliases,
    });
  }

  persons.sort((left, right) => left.person_id.localeCompare(right.person_id));
  const excludedLists = [...excluded.values()].sort(
    (left, right) =>
      left.candidate_or_list_label.localeCompare(right.candidate_or_list_label) ||
      left.office_id.localeCompare(right.office_id) ||
      left.ballot_basis.localeCompare(right.ballot_basis),
  );

  return {
    schema: PEOPLE_SCHEMA,
    country_id: countryId,
    review_status: "draft_for_human_review",
    reviewed_on: null,
    eligible_row_count: eligible,
    excluded_list_row_count: excludedCount,
    withheld_row_count: withheldCount,
    persons,
    excluded_lists: excludedLists,
  };
}

export function serializePeopleProposal(file: PeopleProposalFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}
