/**
 * Normalized research schema v1 for the Subnational Election Observatory.
 * Conceptual entities (no hosted database required). Unknown upstream fields
 * belong in `extensions.raw` and must survive a round-trip.
 */
export const NORMALIZED_SCHEMA_VERSION = "1.0.0";

export type CoverageStatus =
  | "available"
  | "partial"
  | "screened_out"
  | "not_supplied"
  | "fixture_only";

export type ProvenanceKind = "latin_america_release" | "synthetic_fixture";

export type DateCertainty =
  | "called"
  | "statutory"
  | "expected"
  | "conditional"
  | "unknown";

export type DatePrecision = "day" | "month" | "year" | "range" | "unknown";

export type ResearchDate = {
  precision: DatePrecision;
  certainty: DateCertainty;
  year?: number;
  month?: number;
  day?: number;
  rangeStart?: ResearchDate;
  rangeEnd?: ResearchDate;
  /** Display exactly as researched. Never invent a missing day. */
  label: string;
};

export type ValueStatus =
  | "recorded"
  | "zero"
  | "unknown"
  | "not_applicable"
  | "structurally_unavailable"
  | "preliminary"
  | "disputed"
  | "superseded";

export type NumericValue =
  | {
      status: "recorded" | "zero" | "preliminary" | "disputed" | "superseded";
      value: number;
    }
  | {
      status: "unknown" | "not_applicable" | "structurally_unavailable";
      value: null;
    };

export type ShareUnit = "percent_0_100" | "proportion_0_1";
export type BallotBasis =
  | "valid_votes"
  | "candidate_marks"
  | "list_votes"
  | "including_blank_invalid"
  | "electors"
  | "unknown";

export type EventKind = "ordinary" | "special" | "repeated" | "indirect";
export type LegalOutcome =
  | "certified"
  | "annulled"
  | "preliminary"
  | "disputed"
  | "superseded";
export type ProceedingKind =
  | "first_round"
  | "runoff"
  | "repeat"
  | "recount"
  | "annulment"
  | "certification";

export type MetricKind = "competition_index" | "pedersen_volatility";
export type MetricReviewStatus =
  | "cleared"
  | "provisional"
  | "withheld"
  | "ineligible";

export type OfficeStatus = "current" | "historical";
export type GovernmentTier =
  | "national_context"
  | "regional"
  | "municipal"
  | "council"
  | "other";
export type PolityKind = "sovereign_country" | "territory";

export type RosterRecordType =
  | "elected_person"
  | "directory_snapshot"
  | "electoral_register"
  | "unclassified";

export type PollQuestionType =
  | "vote_intention"
  | "presidential_approval"
  | "other";

export type IssueCategory =
  | "missing_returns"
  | "registry_gap"
  | "structural_exception"
  | "unresolved_event"
  | "other";

export type Extensions = {
  raw?: Record<string, unknown>;
};

export type DatasetRelease = {
  id: string;
  schemaVersion: string;
  methodVersion: string;
  provenance: {
    kind: ProvenanceKind;
    packageName: string | null;
    notes: string;
  };
  window: {
    startLabel: string;
    endLabel: string;
    inclusive: true;
    source: "imported_release" | "build_prompt_expectation" | "fixture";
  };
  snapshotLabel: string | null;
  retrievalRangeLabel: string | null;
  validatedCounts: {
    currentOffices: number;
    historicalOffices: number;
    histories: number;
    resultRows: number;
    briefings: number;
    /** True only after a real release import has been reconciled. */
    recomputedFromNormalizedRecords: boolean;
  };
  researchCoverageComplete: false;
  artifactRefs: string[];
};

export type RegionRecord = {
  id: string;
  name: string;
  status: CoverageStatus;
  isDefaultLanding: boolean;
  notes: string;
};

export type CountryRecord = {
  id: string;
  regionId: string;
  names: { official: string; short: string; aliases: string[] };
  kind: PolityKind;
  coverageStatus: CoverageStatus;
  screening?: {
    asOfLabel: string;
    reason: string;
    exceptionalElectionQualification: string;
  };
  notes: string;
  extensions?: Extensions;
};

export type GeographicUnit = {
  id: string;
  countryId: string;
  parentId: string | null;
  names: { official: string; aliases: string[] };
  sourceCodes: string[];
  effective?: { fromLabel?: string; toLabel?: string };
  geometryAvailable: false;
  extensions?: Extensions;
};

export type OfficeRecord = {
  id: string;
  countryId: string;
  geographyId: string;
  names: { official: string; short: string };
  tier: GovernmentTier;
  officeType: string;
  status: OfficeStatus;
  registryQualified: boolean | null;
  nextElection?: {
    date: ResearchDate;
    eventId: string | null;
  };
  selectedHistoryKeys: string[];
  allHistoryKeys: string[];
  structuralLimitation?: string;
  sourceIds: string[];
  extensions?: Extensions;
};

export type ResultRow = {
  id: string;
  label: string;
  partyCode: string;
  partyNamespace: string;
  votes: NumericValue;
  share: NumericValue;
  shareUnit: ShareUnit;
  seats: NumericValue;
  electedFlag: boolean | null;
  isSubstitute: boolean;
  evidenceStatus: ValueStatus;
};

export type ProceedingRecord = {
  id: string;
  eventId: string;
  kind: ProceedingKind;
  round: number | null;
  supersedesId: string | null;
  supersededById: string | null;
  legalOutcome: LegalOutcome;
  notes: string;
};

export type ElectionEvent = {
  id: string;
  officeId: string;
  countryId: string;
  historyKey: string;
  date: ResearchDate;
  kind: EventKind;
  selectedHistoryRole: "selected" | "other" | "none";
  electoralSystem: string;
  comparability: string;
  ballotBasis: BallotBasis;
  voteShareUnit: ShareUnit;
  legalOutcome: LegalOutcome;
  proceedingIds: string[];
  resultRows: ResultRow[];
  sourceIds: string[];
  extensions?: Extensions;
};

export type PartyMapping = {
  id: string;
  originalLabel: string;
  originalCode: string;
  countryId: string;
  sourceNamespace: string;
  mappedGroup: string;
  uncertainty: string;
  evidence: string;
};

export type OfficeholderObservation = {
  id: string;
  officeId: string;
  personLabel: string;
  role: string;
  principalOrSubstitute: "principal" | "substitute" | "unknown";
  asOf: ResearchDate;
  affiliationLabel: string | null;
  sourceIds: string[];
  /** Dated observation — not automatically current tenure. */
  impliesCurrentTenure: false;
};

export type RegisterObservation = {
  id: string;
  geographyId: string;
  officeId: string | null;
  asOf: ResearchDate;
  electorCount: NumericValue;
  sourceIds: string[];
  notes: string;
};

export type PollObservation = {
  id: string;
  pollster: string;
  population: string;
  scope: "national" | "local";
  countryId: string;
  officeId: string | null;
  questionType: PollQuestionType;
  questionText: string;
  fieldwork: ResearchDate;
  published: ResearchDate | null;
  sample: NumericValue;
  methodology: string;
  responses: Array<{ label: string; value: NumericValue; unit: ShareUnit }>;
  sourceIds: string[];
  supportsLocalConclusion: boolean;
  localConclusionNote: string;
};

export type MetricObservation = {
  id: string;
  officeId: string;
  kind: MetricKind;
  value: NumericValue;
  unit: string;
  methodVersion: string;
  inputs: Record<string, number | string | null>;
  selectedCycleKeys: string[];
  eligibility: string;
  reviewStatus: MetricReviewStatus;
  scoreGate: boolean | null;
  withholdingReason: string | null;
  comparisonStatus: string;
};

export type EvidenceSource = {
  id: string;
  publisher: string;
  title: string;
  url: string | null;
  datesLabel: string;
  fileHash: string | null;
  locator: string | null;
  supportedRecordIds: string[];
  dataRights: "unknown" | "public" | "restricted";
};

export type ResearchIssue = {
  id: string;
  affectedRecordIds: string[];
  category: IssueCategory;
  description: string;
  resolutionState: "open" | "resolved" | "deferred";
  requiredEvidence: string;
  sourceIds: string[];
};

export type CompletionQueueItem = {
  id: string;
  officeId: string;
  countryId: string;
  requirement: string;
  category: IssueCategory;
};

export type BriefingArtifact = {
  id: string;
  officeId: string | null;
  releaseId: string;
  format: string;
  path: string | null;
  checksum: string | null;
  available: boolean;
  notes: string;
};

export type NormalizedDataset = {
  release: DatasetRelease;
  regions: RegionRecord[];
  countries: CountryRecord[];
  geographies: GeographicUnit[];
  offices: OfficeRecord[];
  events: ElectionEvent[];
  proceedings: ProceedingRecord[];
  partyMappings: PartyMapping[];
  officeholders: OfficeholderObservation[];
  registers: RegisterObservation[];
  polls: PollObservation[];
  metrics: MetricObservation[];
  sources: EvidenceSource[];
  issues: ResearchIssue[];
  completionQueue: CompletionQueueItem[];
  artifacts: BriefingArtifact[];
};
