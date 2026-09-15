# Center for Digital Democracy

Front-end design prototype for the **Center for Digital Democracy** — a think-tank presence focused on tech policy, civic AI, data rights, platform governance, and election integrity.

The visual system follows the attached mockups: deep navy (`#0a192f`) with bright lime (`#a2ff00`) accents, a tech-network globe hero, rounded calls to action, and a single-page information architecture.

> This is a **design prototype**. Contact and newsletter forms validate in the browser and show a success state. They do not send email or persist data.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The **Subnational Election Observatory** lives at [`/electiondatabase`](/electiondatabase). It is an additional product area — the marketing homepage is unchanged. Research pages load the versioned Latin America release plus standalone country packages under `data/countries/*` (Europe and New Zealand as supplied). Research coverage remains partial. See [integration status](docs/electiondatabase-progress.md) and [country-package mapping](docs/electiondatabase-country-packages.md). The original implementation brief is preserved in [`docs/implementation-brief.md`](docs/implementation-brief.md).

The observatory is being restructured as the **Election Atlas** at `/atlas`, with SQLite on the VPS as the master store, Europe as the first vertical, and regional calendars/indexes shipping before municipal completeness. `/electiondatabase` stays live until **cutover**, when working `/atlas` destinations exist and redirects plus SEO ship together; office and event URLs will not bounce to Atlas home. The plan (revised with review acceptance criteria, still pending further audit before implementation) is [`docs/atlas-plan.md`](docs/atlas-plan.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (must succeed) |
| `npm start` / `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Adapter and semantic tests; fixtures are test-only |
| `npm run import:data` | Import the Latin America zip (fails clearly if missing) |
| `npm run import:countries` | Inventory and validate `data/countries/*` standalone packages |
| `npm run import:data -- --countries` | Same country-package import when the Latin America zip is absent |
| `npm run validate:data` | Validate Latin America records, country packages, and the merged dataset |
| `npm run validate:evidence` | Compare every historical row and office selection against original source objects |
| `npm run import:data -- --fixtures` | Write a fixture reconciliation report only |
| `npm run validate:data -- --fixtures` | Validate the synthetic smoke-test dataset |

## Stack

- [Next.js](https://nextjs.org) App Router
- TypeScript
- Tailwind CSS
- React (client components for the header, forms, back-to-top, observatory nav, and URL filters)

## Site map

Marketing homepage with in-page anchors:

1. **Home** — hero, headline *Advancing Tech Policy for Better Democratic Outcomes*
2. **About** — mission copy and checkmark priorities
3. **Research** — publications strip and four research cards
4. **Initiatives** — four pillars on a dark band
5. **Events** — upcoming briefings and workshops
6. **Connect** — contact form and newsletter signup
7. **Election database** — `/electiondatabase` observatory (see docs)

Observatory routes (nested under `/electiondatabase`): home, regions, countries, explorer, offices, elections, compare, calendar, polling, coverage, sources, downloads, methodology, releases, about.

### Import the Latin America package

```bash
# place Latin_America_Races_and_Briefings.zip in data/incoming/ (not committed)
npm run import:data
npm run validate:data
```

Without the zip, `npm run import:data` still exits non-zero. Country folders use a separate path:

```bash
npm run import:countries
npm run validate:data
```

That is intentional: the Latin America importer will not invent elections, and the country adapter will not pretend Europe has Latin America completeness.

## License

Prototype code for this repository. Not affiliated with any similarly named real-world organization.
