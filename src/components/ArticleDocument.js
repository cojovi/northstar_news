import React from "react";
import ReactMarkdown from "react-markdown";
import {
  articlePath,
  tagPath,
  canonicalUrl,
  linkLiteralUrls,
} from "../lib/authority.js";
const h = React.createElement;
export const markdownPlugins = [linkLiteralUrls];
export function MarkdownBody({ content }) {
  return h(ReactMarkdown, { remarkPlugins: markdownPlugins }, content);
}
function ShareLinks({ article }) {
  const [copyMessage, setCopyMessage] = React.useState("Copy link");
  const url = canonicalUrl(article);
  return h(
    "div",
    {
      className: "flex flex-wrap items-center gap-4 mt-4 text-sm",
      "aria-label": "Share article",
    },
    h(
      "a",
      {
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "Share on Facebook",
    ),
    h(
      "a",
      {
        href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      "Share on X",
    ),
    h(
      "button",
      {
        type: "button",
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopyMessage("Link copied");
          } catch {
            setCopyMessage("Copy the URL from your address bar");
          }
        },
      },
      copyMessage,
    ),
  );
}
function displayDate(value) {
  return value
    ? new Date(value).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      })
    : "";
}
function EvidenceBox({ article: a }) {
  return h(
    "aside",
    {
      className:
        "my-8 p-5 border-l-4 border-aurora-500 bg-gray-50 dark:bg-dark-850 rounded text-gray-800 dark:text-gray-200",
      "aria-label": "Evidence and limits",
    },
    h(
      "h2",
      { className: "text-xl font-serif font-bold mb-3" },
      "Evidence and limits",
    ),
    h(
      "p",
      { className: "font-semibold" },
      a.evidence.status === "partial"
        ? "Partial source review — not a full fact-check"
        : a.evidence.status === "reviewed"
        ? "Documented source review — see limits"
        : "Legacy record / source review pending",
    ),
    h("p", { className: "mt-2" }, a.evidence.summary),
    a.evidence.reviewed_at ? h("p", null, "Review date: ", h("time", {dateTime: a.evidence.reviewed_at}, a.evidence.reviewed_at)) : null,
    h("p", { className: "mt-2" }, a.evidence.limits),
    a.review_notice ? h("p", { className: "mt-2" }, a.review_notice) : null,
    a.evidence.record_url
      ? h(
          "p",
          null,
          h(
            "a",
            { href: a.evidence.record_url },
            "Read the dated review record",
          ),
        )
      : null,
    a.evidence.sources.length
      ? h(
          React.Fragment,
          null,
          h(
            "h3",
            { className: "font-semibold mt-4" },
            "Links present in the source record — not independently verified",
          ),
          h(
            "ul",
            { className: "list-disc pl-5 break-words" },
            a.evidence.sources.map((url) =>
              h(
                "li",
                { key: url },
                h("a", { href: url, rel: "noopener noreferrer" }, url),
              ),
            ),
          ),
        )
      : h(
          "p",
          { className: "mt-3" },
          "No source URLs are recorded for this article. Named outlets or people are not substitutes for source links.",
        ),
    h(
      "p",
      { className: "mt-3" },
      h("a", { href: "/standards" }, "Standards"),
      " · ",
      h("a", { href: "/corrections" }, "Report a correction"),
    ),
  );
}
export function ArticleDocument({ article: a, related = [] }) {
  const profile = a.authorProfile || {
    kind: "legacy",
    bio: "Legacy attribution; identity and credentials have not been independently verified.",
  };
  const evidence = a.evidence
    ? a
    : {
        ...a,
        author_slug: a.author_slug || "northstar-desk",
        content_type: a.content_type || "news",
        tags: a.tags || [],
        corrections: [],
        hero_alt: a.title,
        evidence: {
          status: "pending",
          summary: "Legacy record / source review pending.",
          limits: "Claims have not been independently verified.",
          sources: [],
        },
      };
  return h(
    "article",
    {
      className:
        "bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-200 transition-colors duration-200",
    },
    h(
      "div",
      { className: "max-w-4xl mx-auto px-4 py-8" },
      h(
        "nav",
        { className: "mb-6 text-sm", "aria-label": "Breadcrumb" },
        h("a", { href: "/" }, "Home"),
        " / ",
        h("a", { href: `/${a.categoryPath || a.category}` }, a.category),
      ),
      h(
        "header",
        { className: "mb-8" },
        h(
          "p",
          {
            className:
              "text-sm font-semibold text-aurora-600 dark:text-aurora-400 uppercase tracking-wider",
          },
          `${evidence.content_type === "satire" ? "SATIRE / FICTION" : a.status === "review-hold" ? "PUBLICATION REVIEW HOLD" : a.status === "withdrawn" ? "WITHDRAWAL RECORD" : evidence.content_type} · ${a.category || ""}`,
        ),
        h(
          "h1",
          {
            className:
              "text-4xl md:text-5xl font-serif font-bold leading-tight mt-2 mb-4",
          },
          a.title,
        ),
        h(
          "p",
          {
            className:
              "text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6",
          },
          a.dek,
        ),
        h(
          "div",
          { className: "pb-6 border-b border-gray-200 dark:border-dark-700" },
          h(
            "p",
            null,
            evidence.content_type === "satire" ? "Satire / fiction · Historical credit: " : "By ",
            h(
              "a",
              {
                href: `/author/${evidence.author_slug}`,
                className: "font-medium",
              },
              a.author,
            ),
          ),
          h(
            "p",
            { className: "text-sm mt-2" },
            profile.kind === "legacy"
              ? "Legacy attribution; identity and credentials not independently verified."
              : profile.bio,
          ),
          h(
            "p",
            { className: "text-sm mt-2" },
            "Published ",
            h("time", { dateTime: a.published }, displayDate(a.published)),
            a.updated && a.updated !== a.published
              ? h(
                  React.Fragment,
                  null,
                  " · Updated ",
                  h("time", { dateTime: a.updated }, displayDate(a.updated)),
                )
              : null,
            " · ",
            `${a.reading_time || 1} min read`,
          ),
          h(ShareLinks, { article: a }),
        ),
      ),
      a.affiliated
        ? h(
            "aside",
            {
              className:
                "mb-6 p-5 border-2 border-amber-600 bg-amber-50 dark:bg-dark-850 rounded",
              "aria-label": "Affiliation disclosure",
            },
            h(
              "h2",
              { className: "text-xl font-bold mb-2" },
              "Affiliated coverage",
            ),
            h(
              "p",
              null,
              "Cody Viveiros owns The Northstar Ledger and PROTOCOL SENTINEL. This article involves the owner or affiliated Cojovi / CMAC coverage. Important claims are not substantiated in the existing source record, and source review is pending. Read the article’s dated review and correction notes for changes to unsupported claims. This disclosure supplies no independent corroboration.",
            ),
            h("a", { href: "/ownership" }, "Ownership and conflicts"),
          )
        : null,
      a.status === "withdrawn" ? h("aside", {className: "mb-6 p-5 border-2 border-amber-600 rounded", "aria-label": "Withdrawal notice"}, h("h2", null, "Withdrawn — retained for the public record"), h("p", null, "The unsupported news account has been withdrawn. Read the dated notice below.")) : null,
      a.status === "review-hold" || a.is_satire ? h("aside", {className: "mb-6 p-5 border-2 border-amber-600 rounded", "aria-label": "Archive classification notice"},
        h("h2", null, a.is_satire ? "SATIRE / FICTION" : "PUBLICATION REVIEW HOLD"),
        h("p", null, a.review_notice), h("a", {href: "/archive-integrity"}, "Dated archive integrity notices")) : null,
      h(EvidenceBox, { article: evidence }),
      h(
        "figure",
        { className: "mb-8" },
        h("img", {
          src: a.hero_image,
          alt: a.hero_alt || `Image accompanying: ${a.title}`,
          width: a.hero_width,
          height: a.hero_height,
          decoding: "async",
          className: "w-full h-auto rounded-lg",
        }),
        h(
          "figcaption",
          { className: "mt-2 text-sm text-gray-600 dark:text-gray-400" },
          a.hero_credit
            ? `Historical image credit: ${a.hero_credit}. `
            : "No image credit is recorded. ",
          "Origin, license and documentary accuracy have not been independently verified; do not treat this image as evidence of an event.",
        ),
      ),
      h(
        "div",
        {
          className:
            "article-content prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-a:text-aurora-600 dark:prose-a:text-aurora-400 break-words",
        },
        h(MarkdownBody, { content: a.content || "" }),
      ),
      h(
        "section",
        {
          className: "mt-8 border-t border-gray-200 dark:border-dark-700 pt-5",
          "aria-label": "Corrections and review notes",
        },
        h(
          "h2",
          { className: "text-xl font-serif font-bold mb-3" },
          "Corrections and review notes",
        ),
        evidence.corrections?.length
          ? h(
              "ul",
              { className: "list-disc pl-5" },
              evidence.corrections.map((c, i) =>
                h(
                  "li",
                  { key: i },
                  c.date
                    ? h("time", { dateTime: c.date }, c.date)
                    : "Undated note",
                  ": ",
                  c.note,
                  c.url
                    ? h(
                        React.Fragment,
                        null,
                        " ",
                        h("a", { href: c.url }, "Supporting record"),
                      )
                    : null,
                ),
              ),
            )
          : h(
              "p",
              null,
              "No dated correction note is recorded. This does not mean the claims have been reviewed.",
            ),
        h(
          "p",
          { className: "mt-2" },
          h(
            "a",
            { href: "/corrections" },
            "Report an issue using public evidence; do not send confidential material.",
          ),
        ),
      ),
      h(
        "footer",
        {
          className: "mt-10 pt-6 border-t border-gray-200 dark:border-dark-700",
        },
        h(
          "div",
          { className: "flex flex-wrap gap-2 mb-6" },
          evidence.tags.map((tag) =>
            h(
              "a",
              {
                key: tag,
                href: tagPath(tag),
                className:
                  "px-3 py-1 bg-gray-100 dark:bg-dark-800 rounded-full text-sm",
              },
              tag,
            ),
          ),
        ),
        h(
          "h2",
          { className: "text-2xl font-serif font-bold mb-3" },
          "Continue reading",
        ),
        related.length
          ? h(
              "ul",
              { className: "list-disc pl-5" },
              related.map((item) =>
                h(
                  "li",
                  { key: articlePath(item) },
                  h("a", { href: articlePath(item) }, item.title),
                ),
              ),
            )
          : h(
              "p",
              null,
              h(
                "a",
                { href: `/${a.categoryPath || a.category}` },
                "Browse this section’s archive",
              ),
            ),
        h(
          "p",
          { className: "mt-5" },
          "Follow published entries with ",
          h("a", { href: "/rss.xml" }, "RSS"),
          " or ",
          h("a", { href: "/atom.xml" }, "Atom"),
          ". No email signup is required.",
        ),
        h(
          "p",
          { className: "mt-2 text-sm" },
          "Our retention commitment is to keep article URLs and visible correction history where practicable. ",
          h("a", { href: "/corrections" }, "Read the retention commitment"),
          ".",
        ),
      ),
    ),
  );
}
