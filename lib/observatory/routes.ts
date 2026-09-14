export const OBS_BASE = "/electiondatabase";

export const obsRoutes = {
  home: OBS_BASE,
  regions: `${OBS_BASE}/regions`,
  country: (id: string) => `${OBS_BASE}/countries/${encodeURIComponent(id)}`,
  explorer: `${OBS_BASE}/explorer`,
  office: (id: string) => `${OBS_BASE}/offices/${encodeURIComponent(id)}`,
  event: (id: string) => `${OBS_BASE}/elections/${encodeURIComponent(id)}`,
  compare: `${OBS_BASE}/compare`,
  calendar: `${OBS_BASE}/calendar`,
  polling: `${OBS_BASE}/polling`,
  coverage: `${OBS_BASE}/coverage`,
  sources: `${OBS_BASE}/sources`,
  downloads: `${OBS_BASE}/downloads`,
  methodology: `${OBS_BASE}/methodology`,
  releases: `${OBS_BASE}/releases`,
  about: `${OBS_BASE}/about`,
} as const;

export const obsNav = [
  { href: obsRoutes.home, label: "Observatory" },
  { href: obsRoutes.regions, label: "Regions" },
  { href: obsRoutes.explorer, label: "Explorer" },
  { href: obsRoutes.calendar, label: "Calendar" },
  { href: obsRoutes.polling, label: "Polling" },
  { href: obsRoutes.coverage, label: "Coverage" },
  { href: obsRoutes.methodology, label: "Methodology" },
] as const;

export const obsSecondaryNav = [
  { href: obsRoutes.compare, label: "Compare" },
  { href: obsRoutes.sources, label: "Sources" },
  { href: obsRoutes.downloads, label: "Downloads" },
  { href: obsRoutes.releases, label: "Releases" },
  { href: obsRoutes.about, label: "About" },
] as const;
