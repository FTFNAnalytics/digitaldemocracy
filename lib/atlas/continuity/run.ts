import { existsSync } from "node:fs";
import { DEFAULT_OPERATOR, SCRIPT_VERSION, newAttemptId } from "../identity";
import { failAttempt, reconcileStartedAttempts, startAttempt, succeedAttempt } from "../ledger";
import { migrateAttemptsDatabase, migrateMasterDatabase } from "../apply-migrations";
import {
  acquireWriterLock,
  backupPublishedToStaging,
  discardStaging,
  publishStaging,
  releaseWriterLock,
  stagingPathFor,
} from "../publish";
import { assertIntegrity, openAtlasDatabase } from "../sqlite";
import { writeContinuityProjection } from "./write";
import type { ContinuityProjection } from "./types";

export type ContinuityImportOptions = {
  root: string;
  sqlitePath: string;
  attemptsPath: string;
  operator?: string;
  allowFixtures?: boolean;
};

export type ContinuityImportResult = {
  attemptId: string;
  releaseId: string;
  fingerprint: string;
  reusedRelease: boolean;
  counts: Record<string, number>;
  skippedDraftCountries: string[];
};

function fixtureEnvEnabled(): boolean {
  return process.env.OBSERVATORY_FIXTURES === "1";
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function runContinuityImport(args: {
  options: ContinuityImportOptions;
  lineageId: string;
  scriptVersion?: string;
  scan: () => {
    fingerprint: string;
    releaseId: string;
    intendedInventory: Record<string, unknown>;
  };
  project: () => ContinuityProjection;
  assertFidelity?: (db: ReturnType<typeof openAtlasDatabase>, projection: ContinuityProjection) => void;
}): ContinuityImportResult {
  const operator =
    args.options.operator?.trim() || process.env.ATLAS_OPERATOR?.trim() || DEFAULT_OPERATOR;
  const attemptId = newAttemptId();
  let started = false;
  let lockFd: number | undefined;
  let inventoryJson: Record<string, unknown> = { lineage_id: args.lineageId };

  const finishFailure = (error: unknown): never => {
    if (lockFd != null) discardStaging(args.options.sqlitePath);
    if (started) {
      failAttempt(args.options.attemptsPath, attemptId, errorText(error));
    }
    throw error;
  };

  try {
    lockFd = acquireWriterLock(args.options.sqlitePath);
    migrateAttemptsDatabase(args.options.root, args.options.attemptsPath);
    reconcileStartedAttempts(
      args.options.attemptsPath,
      args.options.sqlitePath,
      existsSync(args.options.sqlitePath),
    );

    const scanned = args.scan();
    inventoryJson = scanned.intendedInventory;
    startAttempt(args.options.attemptsPath, {
      attemptId,
      lineageId: args.lineageId,
      operator,
      scriptVersion: args.scriptVersion ?? SCRIPT_VERSION,
      inputInventory: inventoryJson,
    });
    started = true;

    if (fixtureEnvEnabled() && !args.options.allowFixtures) {
      throw new Error("OBSERVATORY_FIXTURES=1 cannot inject production Atlas rows");
    }

    const projection = args.project();
    const publishedExists = existsSync(args.options.sqlitePath);
    let reusedRelease = false;
    if (publishedExists) {
      const published = openAtlasDatabase(args.options.sqlitePath, { readOnly: true });
      try {
        const existing = published
          .prepare("SELECT release_id FROM dataset_release WHERE lineage_id = ? AND fingerprint_sha256 = ?")
          .get(args.lineageId, scanned.fingerprint);
        reusedRelease = Boolean(existing && String(existing.release_id) === scanned.releaseId);
      } finally {
        published.close();
      }
      backupPublishedToStaging(args.options.sqlitePath);
    } else {
      discardStaging(args.options.sqlitePath);
      migrateMasterDatabase(args.options.root, stagingPathFor(args.options.sqlitePath));
    }

    const staging = openAtlasDatabase(stagingPathFor(args.options.sqlitePath));
    try {
      writeContinuityProjection(staging, projection, attemptId, { reuseRelease: reusedRelease });
      assertIntegrity(staging);
      args.assertFidelity?.(staging, projection);
    } finally {
      staging.close();
    }

    publishStaging(args.options.sqlitePath);

    const published = openAtlasDatabase(args.options.sqlitePath, { readOnly: true });
    let publicationSet: { lineage_id: string; release_id: string }[] = [];
    try {
      assertIntegrity(published);
      publicationSet = published
        .prepare("SELECT lineage_id, release_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => ({ lineage_id: String(row.lineage_id), release_id: String(row.release_id) }));
      const receipt = published
        .prepare("SELECT last_publish_attempt_id FROM publication_receipt WHERE singleton = 1")
        .get();
      if (String(receipt?.last_publish_attempt_id) !== attemptId) {
        throw new Error("Published receipt does not match this attempt");
      }
    } finally {
      published.close();
    }

    succeedAttempt(
      args.options.attemptsPath,
      attemptId,
      scanned.releaseId,
      publicationSet,
      projection.validatedCounts,
    );
    return {
      attemptId,
      releaseId: scanned.releaseId,
      fingerprint: scanned.fingerprint,
      reusedRelease,
      counts: projection.validatedCounts,
      skippedDraftCountries: projection.skippedDraftCountries,
    };
  } catch (error) {
    return finishFailure(error);
  } finally {
    releaseWriterLock(args.options.sqlitePath, lockFd);
  }
}
