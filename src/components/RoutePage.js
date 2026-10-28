import React from "react";
import { MarkdownBody } from "./ArticleDocument.js";
import { TOPICS } from "../lib/pages.js";
import { routeArticles } from "../lib/routes.js";
import { articlePath } from "../lib/authority.js";
const h = React.createElement;
export function PublicLinks() {
  return h(
    "nav",
    {
      className: "flex flex-wrap gap-x-5 gap-y-2 text-sm",
      "aria-label": "Publication information",
    },
    ...[
      "about",
      "ownership",
      "standards",
      "corrections",
      "contact",
      "ai-media-policy",
      "privacy",
      "terms",
      "topics",
      "source-reviews",
      "archive-integrity",
    ].map((slug) =>
      h(
        "a",
        { key: slug, href: `/${slug}` },
        slug === "ai-media-policy"
          ? "AI and media policy"
          : slug.replaceAll("-", " "),
      ),
    ),
    h("a", { href: "/rss.xml" }, "RSS"),
    h("a", { href: "/atom.xml" }, "Atom"),
  );
}
export function RoutePage({ route, articles }) {
  const list = routeArticles(route, articles);
  return h(
    "div",
    {
      className:
        "max-w-7xl mx-auto px-4 py-10 text-gray-900 dark:text-gray-200",
    },
    h(
      "nav",
      { className: "mb-5", "aria-label": "Breadcrumb" },
      h("a", { href: "/" }, "Home"),
      " / ",
      h("a", { href: "/topics" }, "Topic guides"),
    ),
    h("h1", { className: "text-4xl font-serif font-bold mb-6" }, route.title),
    route.type === "page"
      ? h(
          "div",
          {
            className:
              "prose prose-lg dark:prose-invert max-w-3xl prose-a:text-aurora-600 dark:prose-a:text-aurora-400",
          },
          h(MarkdownBody, { content: route.body }),
        )
      : null,
    route.reviews ? h("div", {className: "max-w-3xl"}, route.reviews.map(review => h("section", {key: review.slug, id: review.slug, className: "my-8 border-t pt-6"},
      h("h2", {className: "text-2xl font-serif font-bold mb-3"}, review.title),
      h("p", {className: "font-semibold"}, "Partial source review · ", h("time", {dateTime: review.reviewed_at}, review.reviewed_at), " · Not a full fact-check"),
      h("p", {className: "mt-3"}, review.summary),
      h("p", {className: "mt-3"}, review.limits),
      h("p", {className: "mt-3"}, review.action),
      h("a", {href: review.path}, "Read the article or retained notice"),
      h("ul", {className: "list-disc pl-5 mt-3 break-words"}, review.sources.map(url => h("li", {key: url}, h("a", {href: url}, url))))))) : null,
    route.type === "author"
      ? h(
          "div",
          { className: "max-w-3xl mb-8" },
          h("p", { className: "text-lg mb-3" }, route.description),
          h(
            "p",
            null,
            route.profile.kind === "legacy"
              ? "This page preserves historical credits. It does not establish authorship, identity, qualifications or expertise."
              : "This profile describes a disclosed publication role; it does not establish review of each credited article.",
          ),
        )
      : null,
    ["topic", "topics"].includes(route.type)
      ? h(
          "div",
          { className: "max-w-3xl mb-8" },
          h(
            "p",
            { className: "text-lg mb-4" },
            route.intro ||
              "Browse connected archive entries by the public decisions they address. These guides curate existing articles; they do not establish original reporting or completed source review.",
          ),
          route.questions
            ? h(
                "ul",
                { className: "list-disc pl-5" },
                route.questions.map((q) => h("li", { key: q }, q)),
              )
            : null,
          h(
            "p",
            { className: "mt-4" },
            "Limits: the source and identity notices on each article still apply. Original dates are retained; these are not necessarily current developments.",
          ),
          h(
            "nav",
            { className: "mt-5 flex flex-wrap gap-4" },
            Object.entries(TOPICS).map(([slug, t]) =>
              h("a", { key: slug, href: `/topics/${slug}` }, t.title),
            ),
          ),
        )
      : null,
    ["category", "tag", "home"].includes(route.type)
      ? h("p", { className: "mb-6 max-w-3xl" }, route.description)
      : null,
    route.type === "home"
      ? h(
          "div",
          { className: "mb-8" },
          h(PublicLinks),
          h(
            "p",
            { className: "mt-4" },
            "Browse ",
            h("a", { href: "/topics" }, "topic guides"),
            " or follow the archive with ",
            h("a", { href: "/rss.xml" }, "RSS"),
            ". Legacy evidence limits remain visible on each entry.",
          ),
        )
      : null,
    route.type === "search"
      ? h(
          "form",
          { action: "/search", className: "my-8" },
          h("label", { htmlFor: "archive-search" }, "Search the archive"),
          h("input", {
            id: "archive-search",
            name: "q",
            type: "search",
            className: "border p-2 mx-3 text-gray-900",
          }),
          h("button", { type: "submit" }, "Search"),
        )
      : null,
    ["home", "category", "tag", "author", "topic"].includes(route.type)
      ? h(
          "section",
          { "aria-label": "Article archive" },
          list.length
            ? list.map((a) =>
                h(
                  "article",
                  {
                    key: articlePath(a),
                    className:
                      "py-5 border-b border-gray-200 dark:border-dark-700",
                  },
                  h(
                    "h2",
                    { className: "text-2xl font-serif font-bold mb-2" },
                    h("a", { href: articlePath(a) }, a.title),
                  ),
                  h("p", null, a.dek),
                  h(
                    "p",
                    { className: "text-sm mt-2" },
                    h("time", { dateTime: a.published }, a.published),
                    " · ",
                    a.evidence.status === "pending"
                      ? "Source review pending"
                      : "See dated review and limits",
                  ),
                ),
              )
            : h(
                "p",
                null,
                "No articles are currently available for promotion in this archive. Historic URLs remain accessible; see the archive integrity notices.",
                " ", h("a", {href: "/archive-integrity"}, "Read the dated notices"),
              ),
        )
      : null,
    route.type === "notFound"
      ? h(
          "p",
          null,
          "This URL is not in the published archive. ",
          h("a", { href: "/" }, "Return home"),
          " or ",
          h("a", { href: "/search" }, "search the archive"),
          ".",
        )
      : null,
    h("div", { className: "mt-10 border-t pt-6" }, h(PublicLinks)),
  );
}
