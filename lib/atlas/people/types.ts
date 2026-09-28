export const PEOPLE_SCHEMA = "atlas-person-proposals/1";

export const PERSON_REVIEW_STATUSES = ["approved", "draft_for_human_review", "rejected"] as const;
export type PersonReviewStatus = (typeof PERSON_REVIEW_STATUSES)[number];

export const INITIALS_HOLD_REASON = "initials-only label; left unmerged";

export type PersonOfficeEvidence = {
  office_id: string;
  name: string;
  years: number[];
  row_count: number;
};

export type PersonAliasProposal = {
  candidate_or_list_label: string;
  country_id: string;
  office_scope: string;
  review_status: PersonReviewStatus;
  evidence_note: string;
  manual_cross_country: boolean;
};

export type PersonProposal = {
  person_id: string;
  canonical_label: string;
  country_id: string;
  review_status: PersonReviewStatus;
  created_from_release_id: string | null;
  reviewed_on: string | null;
  hold_reason: string | null;
  evidence: {
    offices: PersonOfficeEvidence[];
    years: number[];
    row_count: number;
  };
  aliases: PersonAliasProposal[];
};

export type ExcludedListLabel = {
  candidate_or_list_label: string;
  office_id: string;
  office_type: string;
  ballot_basis: string;
  row_count: number;
  reason: "list_label";
};

export type PeopleProposalFile = {
  schema: typeof PEOPLE_SCHEMA;
  country_id: string;
  review_status: PersonReviewStatus;
  reviewed_on: string | null;
  eligible_row_count: number;
  excluded_list_row_count: number;
  withheld_row_count: number;
  persons: PersonProposal[];
  excluded_lists: ExcludedListLabel[];
};
