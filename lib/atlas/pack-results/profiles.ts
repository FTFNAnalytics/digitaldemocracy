/**
 * Full research ZIPs live outside git. Paths are pack-root relative, matching
 * each country's SHA256SUMS. A single top-level directory prefix is allowed.
 *
 * These pins are the accepted full packs (not the slim lands in git):
 * United Kingdom Prompt AU, Italy Prompt AT, Germany Prompt AS, France Prompt AR.
 * The loader refuses a production ZIP whose events/results bytes or counts.json
 * disagree with these pins. A CI fixture sets ATLAS_PACK_FIXTURE=1 and must not
 * point at /var/lib/cdd/atlas.sqlite.
 */

export type PackProfile = {
  scope: string;
  countryId: string;
  /** Fallback identity. Writes use the lineage and namespace already published for the country. */
  lineageId: string;
  idNamespace: string;
  prompt: string;
  /**
   * `data-dir` files live under `data/` (UK, Italy, France, Germany).
   * `pack-root` files sit next to validate.py (Peru Prompt BK), under an optional
   * single top directory such as `Peru_Prompt_BK_2026-10-31/`.
   */
  layout: "data-dir" | "pack-root";
  eventsPath: string;
  resultsPath: string;
  countsPath: string | null;
  reportingUnitsPath: string | null;
  officeRegisterPath: string | null;
  officeRegisterSha256: string | null;
  eventsSha256: string | null;
  resultsSha256: string | null;
  expectedEvents: number;
  expectedResults: number;
  /** Europe full packs carry SHA256SUMS. Peru verifies it when the ZIP includes one. */
  requireManifest: boolean;
  /** Peru/Chile-style shares are fractions in [0, 1]. Europe packs name the unit. */
  shareConvention: "explicit" | "proportion_0_1";
  reviewZipSha256: string | null;
};

export const PACK_PROFILES: readonly PackProfile[] = [
  {
    scope: "united_kingdom",
    countryId: "united-kingdom",
    lineageId: "country-package-united-kingdom",
    idNamespace: "cdd-atlas-gb-research-v1",
    prompt: "AU",
    layout: "data-dir",
    eventsPath: "data/events.jsonl",
    resultsPath: "data/results.jsonl.gz",
    countsPath: "data/counts.json",
    reportingUnitsPath: "data/reporting-units.jsonl",
    officeRegisterPath: "data/office-register.jsonl",
    officeRegisterSha256: "0a7583b5b220c293d7d307ab5fde325772a99e740468029343451f1ddcea12a9",
    requireManifest: true,
    shareConvention: "explicit",
    eventsSha256: "6eff64665b8d5565d80b6e3ebf836a5249fdf9d09c7c91469b726201a945335c",
    resultsSha256: "deefc4a25be0bfe9344f91b8b2d0b84e929cc54553e4458bb425266ba27547f4",
    expectedEvents: 899,
    expectedResults: 103648,
    reviewZipSha256: "57dc361fe4043f8a5cdc430f482864f0fcd51cea6ef90319c74c85ca7cba1303",
  },
  {
    scope: "italy",
    countryId: "italy",
    lineageId: "country-package-italy",
    idNamespace: "cdd-atlas-it-research-v1",
    prompt: "AT",
    layout: "data-dir",
    eventsPath: "data/events.jsonl",
    resultsPath: "data/results.jsonl.gz",
    countsPath: "data/counts.json",
    reportingUnitsPath: "data/reporting-units.jsonl",
    officeRegisterPath: "data/office-register.jsonl",
    officeRegisterSha256: "6eb39d5dde93ede9b1199d67bb123af8241de10c237c02d65cc3c17c7f6e1ff8",
    requireManifest: true,
    shareConvention: "explicit",
    eventsSha256: "b97a62ebc441cb9a4e2d28c6e9fb4676b9c92f0ca955ad7e74ee5373aab881cc",
    resultsSha256: "d2adb394c50ab95df305aa0d76643aec207160930f28a8aa940f77a93f2e7431",
    expectedEvents: 515,
    expectedResults: 606051,
    reviewZipSha256: "4e8a6b6d0006727e2af2b10fb4054679861656b94ef4147c8ff927c56396809d",
  },
  {
    scope: "germany",
    countryId: "germany",
    lineageId: "country-package-germany",
    idNamespace: "cdd-atlas-de-research-v1",
    prompt: "AS",
    layout: "data-dir",
    eventsPath: "data/events.jsonl",
    resultsPath: "data/results.jsonl",
    countsPath: "data/counts.json",
    reportingUnitsPath: "data/reporting-units.jsonl",
    officeRegisterPath: "data/office-register.jsonl",
    officeRegisterSha256: "99563c5ab6afa8b07c1e976a49576476fc94e808549eae6926700483cddd5dd1",
    requireManifest: true,
    shareConvention: "explicit",
    eventsSha256: "1555ea401c9be5de66d12fb85ec0e20f980968cd7705096d3dd7a3143a9d4a18",
    resultsSha256: "8940e617c7d92f61b86844e1ced7c9df090edca139cf943c16d7cd608e1451a8",
    expectedEvents: 13845,
    expectedResults: 1299670,
    reviewZipSha256: "c942da67e09e37b6d1eb914ec12ad6d1e2a1baae2671300e10e303e89dd13ea6",
  },
  {
    scope: "france",
    countryId: "france",
    lineageId: "country-package-france",
    idNamespace: "cdd-atlas-fr-research-v1",
    prompt: "AR",
    layout: "data-dir",
    eventsPath: "data/events.jsonl",
    resultsPath: "data/results.jsonl",
    countsPath: "data/counts.json",
    reportingUnitsPath: "data/reporting-units.jsonl",
    officeRegisterPath: "data/office-register.jsonl",
    officeRegisterSha256: "8801b85152572cb326750b04207e12559b4d0cea3ebb19e2769126f0892b7d58",
    requireManifest: true,
    shareConvention: "explicit",
    eventsSha256: "dbe0b194e990f5992766c436fd719d6ed33e573a6bc8bb9dcb2ab8fcbbdebc03",
    resultsSha256: "b344a2ec3dcc0a0e9bea00238759df7d8434231acf91980508753862d41640e9",
    expectedEvents: 119554,
    expectedResults: 1193657,
    reviewZipSha256: "c18df21fa6233e2b7536a23621d4a8aafcec76316d6d8f3921b3bed92753acf9",
  },
  {
    scope: "peru",
    countryId: "peru",
    lineageId: "country-package-peru",
    idNamespace: "cdd-atlas-pe-research-v1",
    prompt: "BK",
    layout: "pack-root",
    eventsPath: "events.jsonl",
    resultsPath: "results.jsonl",
    countsPath: null,
    reportingUnitsPath: null,
    officeRegisterPath: null,
    officeRegisterSha256: null,
    eventsSha256: null,
    resultsSha256: null,
    expectedEvents: 12460,
    expectedResults: 97260,
    requireManifest: false,
    shareConvention: "proportion_0_1",
    reviewZipSha256: null,
  },
] as const;

export function packProfileForScope(scope: string): PackProfile | null {
  const raw = scope.trim().toLowerCase();
  return PACK_PROFILES.find((profile) => profile.scope === raw) ?? null;
}
