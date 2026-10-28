import test from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  normalizeArticle,
  articleSchema,
  canonicalUrl,
} from "../src/lib/authority.js";
import {
  routeInventory,
  parseRoute,
  shouldHandleLink,
} from "../src/lib/routes.js";
import { loadArticles } from "../scripts/lib/load-articles.js";
const sample = {
  title: "Sample",
  slug: "sample",
  author: "Dr. Unknown",
  author_slug: "dr-unknown",
  published: "2025-01-01T00:00:00Z",
  status: "published",
  tags: ["A & B"],
};
test("legacy metadata does not confer expertise or completed source review", () => {
  const a = normalizeArticle(sample, "Ending.", "tech");
  assert.equal(a.evidence.status, "pending");
  assert.equal(a.authorProfile.kind, "legacy");
  assert.notEqual(articleSchema(a).author?.["@type"], "Person");
  assert.equal(a.updated, a.published);
  assert.match(a.content, /Ending\.$/);
  assert.equal(
    canonicalUrl({ ...a, canonical_url: "https://sister.example/different" }),
    "https://thenorthstarledger.com/tech/sample",
  );
});
test("exact routes and native link behavior", () => {
  const a = normalizeArticle(sample, "", "tech");
  const inventory = routeInventory([a]);
  for (const p of [
    "/standards",
    "/contact",
    "/privacy",
    "/terms",
    "/author/dr-unknown",
    "/tag/a%20%26%20b",
    "/topics/public-spending",
  ])
    assert.notEqual(parseRoute(p, inventory).type, "notFound", p);
  for (const p of [
    "/nonsense",
    "/tech/missing",
    "/author/missing",
    "/too/many/parts",
  ])
    assert.equal(parseRoute(p, inventory).type, "notFound");
  const link = {
    origin: "https://thenorthstarledger.com",
    pathname: "/standards",
    hash: "",
    target: "",
    download: false,
  };
  assert.equal(
    shouldHandleLink(
      { button: 0 },
      link,
      "https://thenorthstarledger.com",
      inventory,
    ),
    true,
  );
  for (const event of [
    { button: 1 },
    { button: 0, ctrlKey: true },
    { button: 0, metaKey: true },
    { button: 0, shiftKey: true },
    { button: 0, altKey: true },
    { button: 0, defaultPrevented: true },
  ])
    assert.equal(shouldHandleLink(event, link, link.origin, inventory), false);
  for (const changes of [
    { pathname: "/rss.xml" },
    { hash: "#section" },
    { target: "_blank" },
    { download: true },
  ])
    assert.equal(
      shouldHandleLink(
        { button: 0 },
        { ...link, ...changes },
        link.origin,
        inventory,
      ),
      false,
    );
});
test("full corpus has unique valid routes, preserved dates and honest identities", () => {
  const articles = loadArticles();
  assert.ok(articles.length > 100);
  assert.equal(
    new Set(articles.map((a) => a.categoryPath + "/" + a.slug)).size,
    articles.length,
  );
  for (const a of articles) {
    assert.ok(a.title);
    assert.ok(Number.isFinite(Date.parse(a.published)));
    assert.ok(Number.isFinite(Date.parse(a.updated)));
    assert.ok(a.authorProfile);
    assert.ok(["pending", "reviewed", "partial"].includes(a.evidence.status));
    assert.ok(a.content.trim().length);
  }
});
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleDocument } from "../src/components/ArticleDocument.js";
import { RoutePage } from "../src/components/RoutePage.js";
test("shared article renderer exposes evidence, affiliation and safe literal sources", () => {
  const a = normalizeArticle(
    { ...sample, title: "Cody Viveiros profile" },
    "Final paragraph.\n\nSources:\n1. https://example.com/record?a=1&b=2\n\n[bad](javascript:alert(1))",
    "tech",
  );
  const html = renderToStaticMarkup(
    React.createElement(ArticleDocument, { article: a, related: [] }),
  );
  for (const fragment of [
    "Affiliated coverage",
    "not substantiated",
    "source review pending",
    "identity and credentials",
    "Final paragraph.",
    'href="https://example.com/record?a=1&amp;b=2"',
    "/author/dr-unknown",
    "/rss.xml",
  ])
    assert.ok(html.includes(fragment), fragment);
  assert.doesNotMatch(html, /href="javascript:/);
});
test("all trust and topic pages have substantial shared renderable content", () => {
  const articles = loadArticles();
  const inventory = routeInventory(articles);
  for (const [path, route] of Object.entries(inventory).filter(([, r]) =>
    ["page", "topic", "author", "tag"].includes(r.type),
  )) {
    const html = renderToStaticMarkup(
      React.createElement(RoutePage, { route, articles }),
    );
    assert.ok(html.includes("<h1"), path);
    assert.ok(html.length > 300, path);
  }
});
import {
  bodySimilarity,
  duplicateMatches,
} from "../scripts/lib/duplicate-content.js";
import { rssFeed, atomFeed, sitemap } from "../src/lib/discovery.js";
test("duplicate gate detects identical and lightly edited sister bodies", () => {
  const body =
    "Public agencies spend money on contracts. The audit requires clear dates and supporting invoices. Readers can compare the record with the summary. Claims need direct evidence and disclosure.";
  assert.equal(bodySimilarity(body, body), 1);
  assert.ok(bodySimilarity(body, body + " Additional context.") > 0.8);
  assert.equal(
    duplicateMatches(body, [
      { url: "https://sister.example/another-title", content: body },
    ]).length,
    1,
  );
  assert.equal(
    duplicateMatches(body, [
      {
        url: "https://sister.example/different",
        content: "An unrelated article about an orchestra performance.",
      },
    ]).length,
    0,
  );
});
test("schema identity and content type honor the registry and explicit metadata", () => {
  const base = {
    ...sample,
    author: "The Northstar Ledger Desk",
    author_slug: "northstar-desk",
    content_type: "analysis",
  };
  const a = normalizeArticle(base, "Text.", "tech");
  const schema = articleSchema(a);
  assert.equal(schema["@type"], "Article");
  assert.equal(schema.genre, "analysis");
  assert.equal(schema.author["@type"], "Organization");
  assert.match(schema.author.url, /\/author\/northstar-desk$/);
  const owner = normalizeArticle(
    { ...base, author: "Cody Viveiros", author_slug: "cody-viveiros" },
    "Text.",
    "tech",
  );
  assert.equal(articleSchema(owner).author["@type"], "Person");
  assert.equal(articleSchema(owner).author.alumniOf, undefined);
  assert.equal(
    normalizeArticle(
      { ...base, content_type: "madeup", is_satire: true },
      "Text.",
      "tech",
    ).content_type,
    "satire",
  );
  const incomplete = normalizeArticle(base, "Text.", "tech", {
    evidence: { status: "reviewed" },
  });
  assert.equal(incomplete.evidence.status, "pending");
  const complete = normalizeArticle(base, "Text.", "tech", {
    evidence: {
      status: "reviewed",
      record_url: "https://example.com/review",
      summary: "Checked the named record only.",
      limits: "No independent interview.",
      reviewed_at: "2026-10-28",
      sources: ["https://example.com/source"],
    },
    corrections: [
      { date: "2026-10-28", note: "A visible note.", url: "javascript:bad" },
    ],
  });
  assert.equal(complete.evidence.status, "reviewed");
  assert.equal(complete.corrections[0].url, null);
});
test("XML generators escape content, preserve dates and filter unpublished records", () => {
  const a = normalizeArticle(
    { ...sample, title: 'A & B < C ]]> "quoted"' },
    "Text.",
    "tech",
  );
  for (const xml of [
    rssFeed([a, { ...a, title: "DRAFT DO NOT PUBLISH", status: "draft" }]),
    atomFeed([a, { ...a, title: "DRAFT DO NOT PUBLISH", status: "draft" }]),
    sitemap([{ url: "https://example.com/?a=1&b=2", updated: a.updated }]),
  ]) {
    assert.doesNotMatch(xml, /DRAFT DO NOT PUBLISH/);
    assert.doesNotMatch(xml, /A & B/);
    assert.doesNotMatch(xml, /< C/);
    assert.doesNotMatch(xml, /<author>Dr\./);
  }
  assert.ok(atomFeed([a]).includes(a.published));
  assert.ok(
    sitemap([{ url: "https://example.com/" }]).indexOf("lastmod") === -1,
  );
});

test("case variants of a tag share a single canonical archive on case-insensitive filesystems", () => {
  const a = normalizeArticle(
    { ...sample, tags: ["Privacy", "privacy"] },
    "Body.",
    "tech",
  );
  const inventory = routeInventory([a]);
  assert.deepEqual(
    Object.keys(inventory).filter((p) => p.startsWith("/tag/")),
    ["/tag/privacy"],
  );
});
import { MarkdownBody } from "../src/components/ArticleDocument.js";
test("literal and numbered citations link only to recorded safe URLs, retaining balanced URL parentheses", () => {
  const html = renderToStaticMarkup(
    React.createElement(MarkdownBody, {
      content:
        "A claim [1]. Unresolved [9].\n\n## Sources\n\n[1] https://example.com/record_(version) — source\n\n`https://example.com/code`\n\n[unsafe](javascript:bad)",
    }),
  );
  assert.ok(
    html.includes('href="https://example.com/record_(version)">[1]</a>'),
  );
  assert.ok(html.includes("Unresolved [9]"));
  assert.ok(html.includes("<code>https://example.com/code</code>"));
  assert.doesNotMatch(html, /href="javascript:/);
});
import { parseArticleSource } from "../scripts/lib/load-articles.js";
test("one Node YAML parser supports block tags, multiline text and exact original timestamps", () => {
  const timestamp = "2025-12-01T09:12:07.931418+00:00";
  const source = `---\ntitle: "A: title"\ndek: >-\n  A multiline summary\n  continued here.\nslug: precise\nauthor: The Northstar Ledger Desk\nauthor_slug: northstar-desk\ntags:\n  - Policy\n  - costs\npublished: ${timestamp}\nstatus: published\n---\n\nFirst paragraph.\n\nFinal ending.\n`;
  const { data, content } = parseArticleSource(source);
  const a = normalizeArticle(data, content, "tech");
  assert.deepEqual(a.tags, ["Policy", "costs"]);
  assert.equal(a.dek, "A multiline summary continued here.");
  assert.equal(a.published, timestamp);
  assert.equal(a.updated, timestamp);
  assert.ok(a.content.endsWith("Final ending.\n"));
});
test("notification implementation keeps Search Console discovery semantics", () => {
  const source = readFileSync(
    new URL("../scripts/notify-google.py", import.meta.url),
    "utf8",
  );
  assert.ok(source.includes("https://www.googleapis.com/webmasters/v3/sites/"));
  assert.ok(source.includes("session.put(target"));
  assert.ok(source.includes("session.get(target"));
  assert.doesNotMatch(
    source,
    /indexing\.googleapis\.com|urlNotifications:publish/,
  );
});
