import sanitizeHtml from "sanitize-html";

/**
 * Sanitize original office briefings for safe embedding.
 * Scripts, event handlers and non-http(s) links are stripped. Relative
 * office filenames are rewritten to observatory office routes when mapped.
 */
export function cleanBriefing(
  html: string,
  links: Map<string, string>,
): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "details",
      "summary",
      "section",
      "article",
    ]),
    allowedAttributes: {
      a: ["href", "rel"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: (_tag, attrs) => {
        let href = attrs.href || "";
        const tail = href.split("/").pop() || "";
        if (links.has(tail))
          href = `/electiondatabase/offices/${encodeURIComponent(links.get(tail)!)}`;
        else if (
          href === "Start_Here.html" ||
          href.endsWith("/Start_Here.html")
        )
          href = "/electiondatabase";
        else if (href.endsWith("Methodology.html"))
          href = "/electiondatabase/methodology";
        else if (!/^https?:\/\//i.test(href) && !href.startsWith("#"))
          href = "";
        return { tagName: "a", attribs: { href, rel: "noreferrer noopener" } };
      },
    },
  });
}
