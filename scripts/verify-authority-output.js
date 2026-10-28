import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadArticles } from "./lib/load-articles.js";
import { routeInventory, parseRoute, routeRobots } from "../src/lib/routes.js";
import { canonicalUrl, articleSchema } from "../src/lib/authority.js";
import {
  ArticleDocument,
  MarkdownBody,
} from "../src/components/ArticleDocument.js";
import { createStaticServer } from "./serve-static.js";
import { SITE_URL } from "../src/lib/socialImage.js";
import archiveIntegrity from "../src/data/archive-integrity.json" with { type: "json" };
import { generateArticleContent } from "./generate-mock-content.js";
const articles = loadArticles(),
  inventory = routeInventory(articles);
assert.deepEqual(
  JSON.parse(fs.readFileSync("src/data/articles.json", "utf8")),
  articles,
  "browser snapshot matches build normalization",
);
const manifest = JSON.parse(
  fs.readFileSync("dist/route-manifest.json", "utf8"),
);
assert.deepEqual(
  Object.keys(manifest).sort(),
  Object.keys(inventory).sort(),
  "exact route manifest",
);
let links = 0;
const unsupportedMockInterview = renderToStaticMarkup(React.createElement(MarkdownBody, {
  content: generateArticleContent({}, "us", 6).split("\n\n")[1],
}));
for (const [route, page] of Object.entries(inventory)) {
  const target =
    route === "/"
      ? "dist/index.html"
      : path.join("dist", decodeURIComponent(route.slice(1)), "index.html");
  const html = fs.readFileSync(target, "utf8");
  assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, route);
  assert.ok(
    html.includes(`href="${SITE_URL}${route.replaceAll("&", "&amp;")}"`),
    `${route}: self canonical`,
  );
  assert.equal(
    (html.match(/name="description"/g) || []).length,
    1,
    `${route}: description`,
  );
  assert.ok(html.includes("<h1"), `${route}: full page`);
  assert.ok(!html.includes(unsupportedMockInterview), `${route}: no live unsupported mock interview paragraph`);
  assert.equal(manifest[route].indexable, page.indexable, `${route}: manifest indexability`);
  assert.deepEqual(
    [...html.matchAll(/name="robots" content="([^"]*)"/g)].map(m => m[1]),
    [routeRobots(page)], `${route}: shared robots directive`,
  );
  if (page.type !== "article")
    assert.doesNotMatch(
      html,
      /<script[^>]*type="application\/ld\+json"/,
      `${route}: no stale article schema`,
    );
  // Validate every local anchor in every prerendered document, including body links.
  for (const match of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    const url = new URL(href, SITE_URL);
    const p = url.pathname;
    if (parseRoute(p, inventory).type === "notFound") {
      const asset = path.join("dist", decodeURIComponent(p));
      assert.ok(
        fs.existsSync(asset) && fs.statSync(asset).isFile(),
        `${route}: broken local anchor ${href}`,
      );
    }
    links++;
  }
}
for (const a of articles) {
  const html = fs.readFileSync(
    path.join("dist", a.categoryPath, a.slug, "index.html"),
    "utf8",
  );
  const schema = JSON.parse(
    html.match(/id="prerender-article-schema"[^>]*>(.*?)<\/script>/s)[1],
  );
  assert.deepEqual(schema, articleSchema(a), "shared schema parity");
  assert.equal(schema.url, canonicalUrl(a));
  assert.ok(
    html.includes(
      renderToStaticMarkup(
        React.createElement(MarkdownBody, { content: a.content }),
      ),
    ),
    `${a.slug}: complete shared markdown including ending`,
  );
  assert.match(html, /Evidence and limits/);
  assert.match(html, /Corrections and review notes/);
  for (const correction of a.corrections) {
    assert.ok(html.includes(renderToStaticMarkup(React.createElement(React.Fragment, null, correction.note))), `${a.slug}: complete correction note`);
  }
  if (a.indexable === false) assert.match(html, /name="robots" content="noindex,follow"/);
  if (a.status === "review-hold") assert.match(html, /PUBLICATION REVIEW HOLD/);
  if (a.is_satire) {
    assert.equal(schema["@type"], "BlogPosting");
    assert.match(html, /SATIRE \/ FICTION/);
  }
  if (a.evidence.status === "partial") {
    assert.match(html, /Partial source review/);
    const register = fs.readFileSync("dist/source-reviews/index.html", "utf8");
    assert.ok(register.includes(`id="${a.slug}"`), `${a.slug}: reachable review anchor`);
  }
  if (a.authorProfile.kind === "legacy")
    assert.notEqual(schema.author?.["@type"], "Person");
  if (a.affiliated) {
    assert.match(html, /Affiliated coverage/);
    assert.match(html, /not substantiated/);
  }
  // The complete shared article document is tested separately from contextual next reads.
  assert.ok(
    renderToStaticMarkup(
      React.createElement(ArticleDocument, { article: a }),
    ).includes("RSS"),
  );
}
const integrityHTML = fs.readFileSync("dist/archive-integrity/index.html", "utf8");
for (const record of archiveIntegrity.records) {
  assert.ok(integrityHTML.includes(`href="${record.path}"`), `integrity link: ${record.path}`);
  assert.ok(integrityHTML.includes(record.original_body_sha256), `provenance hash: ${record.path}`);
  assert.ok(integrityHTML.includes(record.published), `original date: ${record.path}`);
  assert.ok(integrityHTML.includes(`href="${record.original_source}"`), `Git original: ${record.path}`);
}
// Parse every XML file with a real XML parser, not a regex approximation.
const xmlResult = execFileSync(
  "python3",
  [
    "-c",
    `
import json, pathlib, xml.etree.ElementTree as ET
files = list(pathlib.Path('dist').glob('*.xml'))
for file in files:
    ET.parse(file)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[]
for name in ['post','section','page']:
    urls += [node.text for node in ET.parse('dist/'+name+'-sitemap.xml').findall('.//s:loc',ns)]
assert len(urls)==len(set(urls)), 'Duplicate sitemap locations'
manifest=json.loads(pathlib.Path('dist/route-manifest.json').read_text())
assert set(urls)=={item['url'] for item in manifest.values() if item['indexable']}, 'Sitemap/manifest parity'
print(str(len(files))+' XML files parsed; '+str(len(urls))+' unique sitemap URLs match manifest.')
`,
  ],
  { encoding: "utf8" },
);
console.log(xmlResult.trim());
const server = createStaticServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  for (const route of Object.keys(inventory)) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type"), /text\/html/);
    await response.text();
  }
  for (const route of [
    "/does-not-exist",
    "/tech/missing",
    "/author/missing",
    "/tag/missing",
    "/topics/missing",
    "/unknown/deep/path",
  ]) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 404, route);
    assert.match(await response.text(), /Page not found/);
  }
  for (const route of ["/rss.xml", "/atom.xml", "/sitemap.xml"]) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/xml/);
    assert.ok((await response.text()).startsWith("<?xml"));
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  `Verified ${articles.length} complete articles, all ${Object.keys(inventory).length} static route HTTP responses, ${links} local anchors, schema/JSON parity, raw feeds and six invalid-route HTTP 404s.`,
);
