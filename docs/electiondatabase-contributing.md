# Source-backed corrections

The observatory does not yet have an admin UI. Research corrections should arrive as Git reviews.

1. Cite the source (publisher, title, URL or locator, date, and the claim it supports).
2. Describe the affected record IDs (`offices[].id`, `histories[]._key`, source IDs).
3. Do not invent missing values or coerce partial dates.
4. Put editorial overrides in `data/overrides/` with provenance — never edit immutable extracted source files silently.

Use `.github/ISSUE_TEMPLATE/research-correction.md` when filing.
