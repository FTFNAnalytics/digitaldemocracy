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

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build (must succeed) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Stack

- [Next.js](https://nextjs.org) App Router
- TypeScript
- Tailwind CSS
- React (client components only for the header, forms, and back-to-top control)

## Site map

Single page with in-page anchors:

1. **Home** — hero, headline *Advancing Tech Policy for Better Democratic Outcomes*
2. **About** — mission copy and checkmark priorities
3. **Research** — publications strip and four research cards
4. **Initiatives** — four pillars on a dark band
5. **Events** — upcoming briefings and workshops
6. **Connect** — contact form and newsletter signup

## License

Prototype code for this repository. Not affiliated with any similarly named real-world organization.
