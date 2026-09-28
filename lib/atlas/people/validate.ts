import {
  PEOPLE_SCHEMA,
  PERSON_REVIEW_STATUSES,
  type PeopleProposalFile,
  type PersonAliasProposal,
  type PersonProposal,
  type PersonReviewStatus,
} from "./types";

export class PeopleProposalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PeopleProposalError";
  }
}

const REVIEW = new Set<string>(PERSON_REVIEW_STATUSES);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function asObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PeopleProposalError(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new PeopleProposalError(`${label} must be a non-empty string`);
  }
  return value;
}

function asStatus(value: unknown, label: string): PersonReviewStatus {
  if (typeof value !== "string" || !REVIEW.has(value)) {
    throw new PeopleProposalError(`${label} has an unknown review_status`);
  }
  return value as PersonReviewStatus;
}

function asOptionalDate(value: unknown, label: string): string | null {
  if (value == null) return null;
  if (typeof value !== "string" || !DATE.test(value)) {
    throw new PeopleProposalError(`${label} must be YYYY-MM-DD or null`);
  }
  return value;
}

function asBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new PeopleProposalError(`${label} must be a boolean`);
  return value;
}

function parseAlias(value: unknown, index: number): PersonAliasProposal {
  const row = asObject(value, `alias ${index}`);
  return {
    candidate_or_list_label: asString(row.candidate_or_list_label, `alias ${index} label`),
    country_id: asString(row.country_id, `alias ${index} country_id`),
    office_scope: asString(row.office_scope, `alias ${index} office_scope`),
    review_status: asStatus(row.review_status, `alias ${index}`),
    evidence_note: typeof row.evidence_note === "string" ? row.evidence_note : "",
    manual_cross_country: row.manual_cross_country == null ? false : asBoolean(row.manual_cross_country, `alias ${index} manual_cross_country`),
  };
}

function parsePerson(value: unknown, index: number): PersonProposal {
  const row = asObject(value, `person ${index}`);
  const evidence = asObject(row.evidence, `person ${index} evidence`);
  const offices = Array.isArray(evidence.offices) ? evidence.offices : [];
  const aliases = Array.isArray(row.aliases) ? row.aliases.map(parseAlias) : [];
  if (aliases.length === 0) throw new PeopleProposalError(`person ${index} needs at least one alias`);
  return {
    person_id: asString(row.person_id, `person ${index} person_id`),
    canonical_label: asString(row.canonical_label, `person ${index} canonical_label`),
    country_id: asString(row.country_id, `person ${index} country_id`),
    review_status: asStatus(row.review_status, `person ${index}`),
    created_from_release_id:
      row.created_from_release_id == null ? null : asString(row.created_from_release_id, `person ${index} release`),
    reviewed_on: asOptionalDate(row.reviewed_on, `person ${index} reviewed_on`),
    hold_reason: row.hold_reason == null ? null : asString(row.hold_reason, `person ${index} hold_reason`),
    evidence: {
      offices: offices.map((office, officeIndex) => {
        const item = asObject(office, `person ${index} office ${officeIndex}`);
        return {
          office_id: asString(item.office_id, `person ${index} office_id`),
          name: typeof item.name === "string" ? item.name : "",
          years: Array.isArray(item.years) ? item.years.map((year) => Number(year)).filter((year) => Number.isFinite(year)) : [],
          row_count: Number(item.row_count ?? 0),
        };
      }),
      years: Array.isArray(evidence.years)
        ? evidence.years.map((year) => Number(year)).filter((year) => Number.isFinite(year))
        : [],
      row_count: Number(evidence.row_count ?? 0),
    },
    aliases,
  };
}

export function parsePeopleProposal(value: unknown, source = "proposal"): PeopleProposalFile {
  const row = asObject(value, source);
  if (row.schema !== PEOPLE_SCHEMA) {
    throw new PeopleProposalError(`${source} schema must be ${PEOPLE_SCHEMA}`);
  }
  const persons = Array.isArray(row.persons) ? row.persons.map(parsePerson) : [];
  const excluded = Array.isArray(row.excluded_lists) ? row.excluded_lists : [];
  return {
    schema: PEOPLE_SCHEMA,
    country_id: asString(row.country_id, `${source} country_id`),
    review_status: asStatus(row.review_status, source),
    reviewed_on: asOptionalDate(row.reviewed_on, `${source} reviewed_on`),
    eligible_row_count: Number(row.eligible_row_count ?? 0),
    excluded_list_row_count: Number(row.excluded_list_row_count ?? 0),
    withheld_row_count: Number(row.withheld_row_count ?? 0),
    persons,
    excluded_lists: excluded.map((item, index) => {
      const entry = asObject(item, `${source} excluded ${index}`);
      return {
        candidate_or_list_label: asString(entry.candidate_or_list_label, `${source} excluded label`),
        office_id: asString(entry.office_id, `${source} excluded office`),
        office_type: typeof entry.office_type === "string" ? entry.office_type : "",
        ballot_basis: typeof entry.ballot_basis === "string" ? entry.ballot_basis : "",
        row_count: Number(entry.row_count ?? 0),
        reason: "list_label" as const,
      };
    }),
  };
}

function claimKey(countryId: string, label: string): string {
  return `${countryId}\u0000${label}`;
}

/** Reject duplicate labels, cross-country aliases without a manual flag, and duplicate person ids. */
export function validatePeopleProposal(file: PeopleProposalFile, source = file.country_id): void {
  const personIds = new Set<string>();
  const claims = new Map<string, string>();
  for (const person of file.persons) {
    if (personIds.has(person.person_id)) {
      throw new PeopleProposalError(`duplicate person_id ${person.person_id} in ${source}`);
    }
    personIds.add(person.person_id);
    if (person.country_id !== file.country_id) {
      throw new PeopleProposalError(`person ${person.person_id} country does not match ${file.country_id}`);
    }
    for (const alias of person.aliases) {
      const key = claimKey(alias.country_id, alias.candidate_or_list_label);
      const previous = claims.get(key);
      if (previous && previous !== person.person_id) {
        throw new PeopleProposalError(
          `alias claimed by two persons: ${alias.country_id} / ${alias.candidate_or_list_label} (${previous} and ${person.person_id})`,
        );
      }
      claims.set(key, person.person_id);
      if (alias.country_id !== person.country_id) {
        if (!alias.manual_cross_country || alias.evidence_note.trim() === "") {
          throw new PeopleProposalError(
            `cross-country alias requires a manual row: ${person.person_id} / ${alias.candidate_or_list_label}`,
          );
        }
      }
    }
  }
}

export function validatePeopleProposals(files: PeopleProposalFile[]): void {
  const claims = new Map<string, string>();
  for (const file of files) {
    validatePeopleProposal(file);
    for (const person of file.persons) {
      for (const alias of person.aliases) {
        const key = claimKey(alias.country_id, alias.candidate_or_list_label);
        const previous = claims.get(key);
        if (previous && previous !== person.person_id) {
          throw new PeopleProposalError(
            `alias claimed by two persons: ${alias.country_id} / ${alias.candidate_or_list_label} (${previous} and ${person.person_id})`,
          );
        }
        claims.set(key, person.person_id);
      }
    }
  }
}

/** An approved file may not carry a draft or rejected row. Draft files are not loadable. */
export function assertApprovedForLoad(file: PeopleProposalFile): void {
  if (file.review_status !== "approved") {
    throw new PeopleProposalError("refusing to load draft person proposals");
  }
  for (const person of file.persons) {
    if (person.review_status !== "approved") {
      throw new PeopleProposalError("refusing to load draft person proposals");
    }
    for (const alias of person.aliases) {
      if (alias.review_status !== "approved") {
        throw new PeopleProposalError("refusing to load draft person proposals");
      }
    }
  }
}
