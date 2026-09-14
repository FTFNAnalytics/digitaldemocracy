export const org = {
  name: "Center for Digital Democracy",
  shortName: "CDD",
  headline: "Advancing Tech Policy for Better Democratic Outcomes",
  kicker: "Research · Policy · Civic AI",
  lede: "Independent research and policy design at the intersection of digital platforms, data rights, civic AI, and election integrity.",
  location: "Washington, DC",
  addressLines: [
    "Prototype office — not a live mail drop",
    "1200 18th Street NW, Suite 400",
    "Washington, DC 20036",
  ],
  email: "connect@digitaldemocracy.example",
  phone: "+1 (202) 555-0199",
};

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#research", label: "Research" },
  { href: "#initiatives", label: "Initiatives" },
  { href: "#events", label: "Events" },
  { href: "#connect", label: "Connect" },
] as const;

export const about = {
  mission: [
    "The Center for Digital Democracy is an independent research and policy institute dedicated to ensuring that digital technologies strengthen—rather than erode—democratic life. We study how platforms, data markets, and emerging AI systems shape public discourse, civic participation, and the integrity of elections.",
    "Our work translates technical complexity into rules the public can enforce: algorithmic accountability, platform transparency, privacy protections for communities most exposed to surveillance, and safeguards against synthetic media in civic processes.",
    "This website is a design prototype of the Center’s public presence. Contact and newsletter forms validate in the browser and do not send email.",
  ],
  priorities: [
    {
      title: "Election integrity in digital public squares",
      body: "Operational and legal safeguards against coordinated deception, synthetic media, and last-mile disruption of voter information.",
    },
    {
      title: "Accountable civic AI",
      body: "Transparency, auditability, and due-process limits when governments and campaigns deploy automated systems.",
    },
    {
      title: "Privacy and data rights",
      body: "Constraints on commercial surveillance, data brokerage, and the secondary use of civic and voter files.",
    },
    {
      title: "Checks on concentrated platform power",
      body: "Interoperability, due process in moderation, and structural remedies that rebalance power toward the public.",
    },
  ],
};

export const focusAreas = [
  {
    title: "Policy Initiatives",
    body: "Model rules, regulatory comments, and coalition briefs that turn evidence into enforceable public-interest standards.",
    icon: "shield" as const,
  },
  {
    title: "Research Program",
    body: "Investigations and public datasets on ranking systems, ad targeting, and automated influence operations.",
    icon: "docs" as const,
  },
  {
    title: "Mission in Practice",
    body: "Field partnerships with election officials, journalists, and community groups who live with platform risk first.",
    icon: "globe" as const,
  },
];

export const researchCards = [
  {
    title: "Algorithmic Accountability",
    body: "How ranking, recommendation, and targeting systems shape civic information—and the disclosure rules required to make them inspectable.",
    icon: "nodes" as const,
  },
  {
    title: "Election Integrity",
    body: "Synthetic media, coordinated inauthentic behavior, and the operational playbooks election administrators need before the next cycle.",
    icon: "ballot" as const,
  },
  {
    title: "Platform Governance",
    body: "Comparative analysis of interoperability, moderation due process, and structural remedies that rebalance platform power.",
    icon: "scale" as const,
  },
  {
    title: "Civic AI & Public Interest Compute",
    body: "Frameworks for using AI in government and campaigns without sacrificing equal protection or meaningful human oversight.",
    icon: "chip" as const,
  },
];

export const publications = [
  {
    title: "Synthetic Media and the 2026 Election Calendar",
    type: "Policy brief",
    date: "March 2026",
  },
  {
    title: "Auditing Civic AI: A Due Process Framework",
    type: "Working paper",
    date: "January 2026",
  },
  {
    title: "Data Brokers and Voter Files: Market Structure",
    type: "Report",
    date: "November 2025",
  },
];

export const pillars = [
  {
    title: "Policy Lab",
    body: "Drafting model legislation, agency comments, and international standards that put public-interest rules on a clock.",
  },
  {
    title: "Key Projects",
    body: "Multi-year investigations into commercial surveillance, political ad infrastructure, and automated influence markets.",
  },
  {
    title: "Civic Partnerships",
    body: "Working alongside election officials, newsrooms, and community organizations to convert research into field practice.",
  },
  {
    title: "Open Research",
    body: "Peer-reviewed analysis and reusable datasets so advocates, scholars, and policymakers can pressure-test the same evidence.",
  },
];

export const events = [
  {
    date: "Oct 8, 2026",
    type: "Workshop",
    title: "Civic AI Oversight Clinic",
    detail: "Washington, DC · In person",
    cta: "Register",
  },
  {
    date: "Nov 12, 2026",
    type: "Webinar",
    title: "Election Integrity Briefing: 2026 Cycle",
    detail: "Virtual · 90 minutes",
    cta: "Save a seat",
  },
  {
    date: "Dec 3, 2026",
    type: "Clinic",
    title: "Community Data Rights Workshop",
    detail: "Hybrid · Limited capacity",
    cta: "Express interest",
  },
  {
    date: "Jan 20, 2027",
    type: "Conference",
    title: "Platform Power & Democratic Speech",
    detail: "Annual convening · DC",
    cta: "View program",
  },
];

export const social = [
  { label: "LinkedIn", href: "#connect" },
  { label: "Bluesky", href: "#connect" },
  { label: "YouTube", href: "#connect" },
  { label: "RSS", href: "#connect" },
];
