/**
 * Explicit adapters for each supported document type in a Latin America
 * release package. Do not treat every JSON file as a country record.
 */
export const INPUT_MANIFEST_VERSION = "1.0.0";

export const RELEASE_PACKAGE_FILENAME = "Latin_America_Races_and_Briefings.zip";

export type InputDisposition =
  | "import"
  | "ancillary_download"
  | "report_only"
  | "ignore_with_reason";

export type InputDocumentType =
  | "country_record"
  | "supplementary_evidence"
  | "build_status"
  | "south_america_research_status"
  | "south_america_release_review"
  | "south_america_completion_queue"
  | "polling_context"
  | "country_screen_evidence"
  | "south_america_additional_evidence"
  | "territory_file"
  | "validation_summary"
  | "release_summary"
  | "office_briefing_html"
  | "start_here_html"
  | "methodology_html"
  | "country_workbook"
  | "regional_workbook"
  | "briefing_pdf"
  | "unknown";

export type InputManifestEntry = {
  documentType: InputDocumentType;
  adapter: string;
  glob: string[];
  disposition: InputDisposition;
  notes: string;
};

export const INPUT_MANIFEST: InputManifestEntry[] = [
  {
    documentType: "supplementary_evidence",
    adapter: "supplementary-evidence",
    glob: ["Data/*_Supplementary_Evidence.json"],
    disposition: "import",
    notes: "Often mirrored in country rosters; reconcile duplicates before counting.",
  },
  {
    documentType: "build_status",
    adapter: "build-status",
    glob: ["Data/Build_Status.json"],
    disposition: "report_only",
    notes:
      "Release context. Top-level briefing count may be stale; do not use as dashboard totals.",
  },
  {
    documentType: "south_america_research_status",
    adapter: "south-america-status",
    glob: ["Data/South_America_Research_Status.json"],
    disposition: "import",
    notes: "Overlaps with south_america_release_review; not additive.",
  },
  {
    documentType: "south_america_release_review",
    adapter: "south-america-review",
    glob: ["Data/south_america_release_review.json"],
    disposition: "import",
    notes: "Overlapping representation of South American coverage and qualifications.",
  },
  {
    documentType: "south_america_completion_queue",
    adapter: "completion-queue-csv",
    glob: ["South_America_Completion_Queue.csv"],
    disposition: "import",
    notes: "Office-level remaining requirements. UTF-8 BOM may be present.",
  },
  {
    documentType: "polling_context",
    adapter: "polling-context",
    glob: ["Data/polling_context.json"],
    disposition: "import",
    notes: "Overlaps country polling / office polling_context; deduplicate observations.",
  },
  {
    documentType: "country_screen_evidence",
    adapter: "country-screen",
    glob: ["Data/Country_Screen_Evidence.json"],
    disposition: "import",
    notes: "Reasons a country has no imported in-window ordinary races.",
  },
  {
    documentType: "south_america_additional_evidence",
    adapter: "additional-evidence",
    glob: ["Data/South_America_Additional_Evidence.json"],
    disposition: "import",
    notes: "Historical baselines, exceptional events, separately screened territories.",
  },
  {
    documentType: "territory_file",
    adapter: "territory-json",
    glob: ["Data/*territor*.json", "Data/*Territory*.json"],
    disposition: "import",
    notes: "Keep territory totals separate from sovereign-country totals.",
  },
  {
    documentType: "validation_summary",
    adapter: "prior-validation",
    glob: ["Data/Validation_Summary.json"],
    disposition: "report_only",
    notes: "Prior validation evidence; not a substitute for this pipeline's checks.",
  },
  {
    documentType: "country_record",
    adapter: "country-json",
    glob: ["Data/*.json"],
    disposition: "import",
    notes:
      "Main country records with country, coverage, offices, histories, rosters, issues, sources, polling. Exclude files matched by more specific adapters (those adapters are listed first).",
  },
  {
    documentType: "release_summary",
    adapter: "release-summary",
    glob: ["**/release_summary.json"],
    disposition: "report_only",
    notes:
      "Known defect: totals may contain a territory record. Do not populate dashboard counters from it.",
  },
  {
    documentType: "office_briefing_html",
    adapter: "briefing-html",
    glob: ["Briefings/**/*.html"],
    disposition: "import",
    notes: "Sanitize HTML; never execute scripts. Map filename to office via explicit manifest.",
  },
  {
    documentType: "start_here_html",
    adapter: "legacy-nav-html",
    glob: ["Start_Here.html"],
    disposition: "report_only",
    notes: "Preserve interpretation and links; do not scrape as election records.",
  },
  {
    documentType: "methodology_html",
    adapter: "legacy-methodology-html",
    glob: ["Methodology.html"],
    disposition: "report_only",
    notes: "Useful for metric definitions; not an additive dataset.",
  },
  {
    documentType: "country_workbook",
    adapter: "workbook",
    glob: ["**/*.{xlsx,xls}"],
    disposition: "ancillary_download",
    notes: "Expose as downloadable research artifacts with checksums; do not commit bulky files.",
  },
  {
    documentType: "briefing_pdf",
    adapter: "briefing-pdf",
    glob: ["**/*.pdf"],
    disposition: "ancillary_download",
    notes: "Downloadable artifacts; keep checksums in Git, files in a large-file store.",
  },
  {
    documentType: "unknown",
    adapter: "unknown",
    glob: ["**/*"],
    disposition: "ignore_with_reason",
    notes: "Every unmatched content-bearing file must appear in the import report.",
  },
];

export const ZIP_SEARCH_PATHS = [
  "Latin_America_Races_and_Briefings.zip",
  "data/incoming/Latin_America_Races_and_Briefings.zip",
  "incoming/Latin_America_Races_and_Briefings.zip",
  "research/Latin_America_Races_and_Briefings.zip",
];
