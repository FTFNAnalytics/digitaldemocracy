import { missingOrStatus, NOT_SUPPLIED, shareLabel, statusPhrase } from "@/components/atlas/labels";

export type CycleCsvResult = {
  label: string | null;
  partyLabel: string | null;
  votes: number | null;
  votesStatus: string;
  share: number | null;
  shareStatus: string;
  shareUnit: string;
  seats: number | null;
  seatsStatus: string;
  evidenceStatus: string;
};

export type CycleCsvContest = {
  officeName: string;
  results: CycleCsvResult[];
};

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

/** Same strings the results table renders, one row per visible result. */
export function cycleCsv(contests: CycleCsvContest[]): string {
  const header = ["contest", "candidate_or_list", "party", "votes", "share", "seats", "evidence"];
  const lines = [header.join(",")];
  for (const contest of contests) {
    for (const row of contest.results) {
      lines.push(
        [
          contest.officeName,
          row.label ?? NOT_SUPPLIED,
          row.partyLabel ?? NOT_SUPPLIED,
          missingOrStatus(row.votes, row.votesStatus),
          shareLabel(row.share, row.shareStatus, row.shareUnit),
          missingOrStatus(row.seats, row.seatsStatus),
          statusPhrase(row.evidenceStatus),
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
