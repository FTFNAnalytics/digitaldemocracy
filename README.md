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

The **Subnational Election Observatory** lives at [`/electiondatabase`](/electiondatabase). It is an additional product area — the marketing homepage is unchanged. Research pages are awaiting `Latin_America_Races_and_Briefings.zip` and do not invent real elections. See `docs/electiondatabase-progress.md`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (must succeed) |
| `npm start` / `npm run preview` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit and smoke tests (fixtures + script stubs) |
| `npm run import:data` | Import the Latin America zip (fails clearly if missing) |
| `npm run validate:data` | Validate an imported release (fails clearly if missing) |
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

Without the zip those commands exit non-zero and print the missing dependency. That is intentional.

## License

Prototype code for this repository. Not affiliated with any similarly named real-world organization.
