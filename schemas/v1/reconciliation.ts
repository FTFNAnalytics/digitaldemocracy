import type { InputDocumentType, InputDisposition } from "./input-manifest";

export const RECONCILIATION_REPORT_VERSION = "1.0.0";

export type InventoryRow = {
  path: string;
  sha256: string | null;
  bytes: number | null;
  documentType: InputDocumentType;
  disposition: InputDisposition;
  adapter: string;
};

export type LegacyDefect = {
  file: string;
  field: string;
  issue: string;
  handling: string;
};

export type TotalsBlock = {
  source: "recomputed" | "legacy_ignored" | "unavailable";
  currentOffices: number | null;
  historicalOffices: number | null;
  histories: number | null;
  resultRows: number | null;
  briefings: number | null;
  notes: string;
};

export type Discrepancy = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  recordIds?: string[];
};

export type UnimportedFile = {
  path: string;
  reason: string;
};

export type ReconciliationReport = {
  schemaVersion: string;
  generatedAt: string;
  releaseId: string | null;
  status: "blocked" | "partial" | "complete";
  blocker?: {
    missing: string[];
    message: string;
  };
  inventory: InventoryRow[];
  legacyDefects: LegacyDefect[];
  totals: TotalsBlock;
  discrepancies: Discrepancy[];
  unimportedFiles: UnimportedFile[];
  notes: string[];
};

export const KNOWN_LEGACY_DEFECTS: LegacyDefect[] = [
  {
    file: "release_summary.json",
    field: "totals",
    issue: "Malformed totals field containing a territory record.",
    handling: "Do not use to populate dashboard counters. Recompute from normalized records.",
  },
  {
    file: "Data/Build_Status.json",
    field: "briefing count (top-level)",
    issue: "Stale top-level briefing count of 18,528 reported in the handoff notes.",
    handling: "Reconcile against actual office records and briefing files after import.",
  },
];
