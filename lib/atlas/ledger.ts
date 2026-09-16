import type { DatabaseSync } from "node:sqlite";
import { canonical, utcNow } from "./identity";
import { insertRow, openAtlasDatabase } from "./sqlite";

export type AttemptStart = {
  attemptId: string;
  lineageId: string;
  operator: string;
  scriptVersion: string;
  inputInventory: unknown;
};

export function startAttempt(attemptsPath: string, start: AttemptStart): void {
  const db = openAtlasDatabase(attemptsPath);
  try {
    insertRow(db, "ingest_attempt", {
      attempt_id: start.attemptId,
      lineage_id: start.lineageId,
      operator: start.operator,
      script_version: start.scriptVersion,
      started_at: utcNow(),
      finished_at: null,
      status: "started",
      input_inventory_json: canonical(start.inputInventory),
      successful_release_id: null,
      publication_set_json: null,
      row_counts_json: null,
      error_text: null,
    });
  } finally {
    db.close();
  }
}

export function failAttempt(attemptsPath: string, attemptId: string, errorText: string): void {
  const db = openAtlasDatabase(attemptsPath);
  try {
    const row = db.prepare("SELECT status FROM ingest_attempt WHERE attempt_id = ?").get(attemptId);
    if (!row) {
      throw new Error(`Cannot fail unknown attempt ${attemptId}`);
    }
    if (String(row.status) !== "started") return;
    db.prepare(
      "UPDATE ingest_attempt SET status = 'failed', finished_at = ?, error_text = ? WHERE attempt_id = ?",
    ).run(utcNow(), errorText.slice(0, 8000), attemptId);
  } finally {
    db.close();
  }
}

export function succeedAttempt(
  attemptsPath: string,
  attemptId: string,
  releaseId: string,
  publicationSet: { lineage_id: string; release_id: string }[],
  rowCounts: unknown,
): void {
  const db = openAtlasDatabase(attemptsPath);
  try {
    db.prepare(
      `UPDATE ingest_attempt
       SET status = 'succeeded', finished_at = ?, successful_release_id = ?,
           publication_set_json = ?, row_counts_json = ?
       WHERE attempt_id = ?`,
    ).run(utcNow(), releaseId, canonical(publicationSet), canonical(rowCounts), attemptId);
  } finally {
    db.close();
  }
}

export function reconcileStartedAttempts(
  attemptsPath: string,
  masterPath: string,
  existsPublished: boolean,
): void {
  const attempts = openAtlasDatabase(attemptsPath);
  let started: Record<string, unknown>[] = [];
  try {
    if (!attempts.prepare("SELECT name FROM sqlite_master WHERE name = 'ingest_attempt'").get()) {
      return;
    }
    started = attempts.prepare("SELECT * FROM ingest_attempt WHERE status = 'started'").all();
  } finally {
    attempts.close();
  }
  if (started.length === 0) return;

  let receipt: Record<string, unknown> | undefined;
  let publicationSet: { lineage_id: string; release_id: string }[] = [];
  let counts: unknown = {};
  if (existsPublished) {
    let master: DatabaseSync | undefined;
    try {
      master = openAtlasDatabase(masterPath, { readOnly: true });
      receipt = master.prepare("SELECT * FROM publication_receipt WHERE singleton = 1").get();
      publicationSet = master
        .prepare("SELECT lineage_id, release_id FROM publication_release ORDER BY lineage_id")
        .all()
        .map((row) => ({
          lineage_id: String(row.lineage_id),
          release_id: String(row.release_id),
        }));
      const release = master
        .prepare("SELECT validated_counts_json FROM dataset_release WHERE lineage_id = ? AND release_id = ?")
        .get(receipt?.attempted_lineage_id, receipt?.attempted_release_id);
      if (release?.validated_counts_json) {
        counts = JSON.parse(String(release.validated_counts_json));
      }
    } catch {
      receipt = undefined;
    } finally {
      master?.close();
    }
  }

  for (const row of started) {
    const attemptId = String(row.attempt_id);
    const matched =
      existsPublished &&
      receipt &&
      String(receipt.last_publish_attempt_id) === attemptId &&
      publicationSet.some(
        (item) =>
          item.lineage_id === String(row.lineage_id) &&
          item.release_id === String(receipt.attempted_release_id),
      );
    if (matched) {
      succeedAttempt(attemptsPath, attemptId, String(receipt!.attempted_release_id), publicationSet, counts);
    } else {
      failAttempt(
        attemptsPath,
        attemptId,
        "Interrupted before verified publication; staging discarded and last good master left serving.",
      );
    }
  }
}
