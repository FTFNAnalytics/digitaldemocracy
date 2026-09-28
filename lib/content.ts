export const org = {
  name: "Center for Digital Democracy",
  shortName: "CDD",
  headline: "Election Atlas",
  lede: "Search seats, election days, and candidate labels. Europe is listed first. The counts are the records that have been ingested.",
} as const;

/** Header: Atlas, Search, Data, Methodology, About. */
export const navLinks = [
  { href: "/atlas", label: "Atlas" },
  { href: "/atlas/search", label: "Search" },
  { href: "/data", label: "Data" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
] as const;

export const footerLinks = [
  ...navLinks,
  { href: "/corrections", label: "Corrections" },
  { href: "/atlas/explorer", label: "Explorer" },
] as const;

/** Facts that are not yet supplied. They stay visible until Justin replaces them. */
export const unconfirmed = {
  contactEmail: "[CONFIRM: contact email]",
  postalAddress: "[CONFIRM: postal address]",
  phone: "[CONFIRM: phone]",
  licence: "[CONFIRM: site and data licence]",
} as const;

export const github = {
  repository: "https://github.com/FTFNAnalytics/digitaldemocracy",
  newIssue: "https://github.com/FTFNAnalytics/digitaldemocracy/issues/new",
  correction:
    "https://github.com/FTFNAnalytics/digitaldemocracy/issues/new?template=research-correction.md",
} as const;
