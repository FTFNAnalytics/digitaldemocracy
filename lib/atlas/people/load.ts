import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { repoRoot } from "../paths";
import { tableExists } from "../sqlite";
import type { PeopleProposalFile, PersonProposal } from "./types";
import { assertApprovedForLoad, parsePeopleProposal, PeopleProposalError, validatePeopleProposals } from "./validate";

export function resolvePeopleDir(env: Record<string, string | undefined> = process.env, cwd = repoRoot()): string {
  const override = env.ATLAS_PEOPLE_DIR?.trim();
  if (override) return path.isAbsolute(override) ? override : path.resolve(cwd, override);
  return path.join(cwd, "schemas/atlas/people");
}

export function readPeopleProposalFile(filePath: string): PeopleProposalFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PeopleProposalError(`invalid person proposal JSON at ${filePath}: ${message}`);
  }
  return parsePeopleProposal(parsed, filePath);
}

export function listPeopleProposalFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(dir, name));
}

function reviewedOn(file: PeopleProposalFile, person: PersonProposal): string | null {
  return person.reviewed_on ?? file.reviewed_on;
}

/**
 * Replace person and person_alias from approved proposal files.
 * Draft and rejected files are not imported.
 * An approved file that still contains a draft row is refused.
 * Caller owns the transaction.
 */
export function loadApprovedPeople(
  db: DatabaseSync,
  dir = resolvePeopleDir(),
): { persons: number; aliases: number; skippedDrafts: number } {
  if (!tableExists(db, "person") || !tableExists(db, "person_alias")) {
    throw new Error("Person schema is missing. Run npm run migrate:atlas before derive:atlas.");
  }
  const paths = listPeopleProposalFiles(dir);
  const files = paths.map((filePath) => readPeopleProposalFile(filePath));
  validatePeopleProposals(files);

  const approved: PeopleProposalFile[] = [];
  let skippedDrafts = 0;
  for (const file of files) {
    if (file.review_status !== "approved") {
      skippedDrafts += 1;
      continue;
    }
    assertApprovedForLoad(file);
    approved.push(file);
  }

  const countries = new Set(
    db
      .prepare("SELECT country_id FROM country")
      .all()
      .map((row) => String(row.country_id)),
  );
  for (const file of approved) {
    for (const person of file.persons) {
      if (!countries.has(person.country_id)) {
        throw new PeopleProposalError(`person ${person.person_id} country ${person.country_id} is not in the master`);
      }
      for (const alias of person.aliases) {
        if (!countries.has(alias.country_id)) {
          throw new PeopleProposalError(
            `alias ${alias.candidate_or_list_label} country ${alias.country_id} is not in the master`,
          );
        }
      }
    }
  }

  db.exec("DELETE FROM person_alias; DELETE FROM person;");
  const insertPerson = db.prepare(
    `INSERT INTO person (
       person_id, canonical_label, country_id, review_status, created_from_release_id, reviewed_on
     ) VALUES (?, ?, ?, 'approved', ?, ?)`,
  );
  const insertAlias = db.prepare(
    `INSERT INTO person_alias (
       person_id, country_id, candidate_or_list_label, office_scope, review_status, evidence_note, manual_cross_country
     ) VALUES (?, ?, ?, ?, 'approved', ?, ?)`,
  );
  let persons = 0;
  let aliases = 0;
  for (const file of approved.sort((left, right) => left.country_id.localeCompare(right.country_id))) {
    for (const person of [...file.persons].sort((left, right) => left.person_id.localeCompare(right.person_id))) {
      insertPerson.run(
        person.person_id,
        person.canonical_label,
        person.country_id,
        person.created_from_release_id,
        reviewedOn(file, person),
      );
      persons += 1;
      for (const alias of person.aliases) {
        insertAlias.run(
          person.person_id,
          alias.country_id,
          alias.candidate_or_list_label,
          alias.office_scope,
          alias.evidence_note,
          alias.manual_cross_country ? 1 : 0,
        );
        aliases += 1;
      }
    }
  }
  return { persons, aliases, skippedDrafts };
}
