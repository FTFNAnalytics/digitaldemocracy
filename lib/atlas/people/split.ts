const CORRECTION_ENDPOINT = "https://github.com/FTFNAnalytics/digitaldemocracy/issues/new";

/** Research-correction issue with the person id prefilled. */
export function personSplitHref(personId: string): string {
  const body = [
    "## Affected records",
    "",
    `- Office / event / source IDs: ${personId}`,
    "",
    "## Claim that is wrong",
    "",
    "These are two different people.",
    "",
    "## Replacement claim",
    "",
    "## Source",
    "",
    "- Publisher:",
    "- Title:",
    "- URL or locator:",
    "- Date:",
    "- What the source actually supports:",
    "",
    "Do not invent missing values. Do not coerce partial dates to the first of a month.",
  ].join("\n");
  const params = new URLSearchParams({
    template: "research-correction.md",
    title: `[research] ${personId}`,
    body,
  });
  return `${CORRECTION_ENDPOINT}?${params.toString()}`;
}
