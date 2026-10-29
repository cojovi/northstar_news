import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import * as prerender from "../vite-plugin-prerender-og.js";
import { normalizeArticle, tagPath } from "../src/lib/authority.js";
import { routeInventory, parseRoute } from "../src/lib/routes.js";
import { loadArticles } from "../scripts/lib/load-articles.js";

const sample = { title: "Safety", slug: "safety", published: "2026-10-01", tags: [] };
test("shared normalization and tag paths reject unsafe identifiers without rewriting", () => {
  for (const tag of ["../..", "a/b", "a\\b", ".", "..", "", " ", " padded", "padded ", "a\0b", "a\nb", "a\u007fb", "a\u0085b"]) {
    assert.throws(() => normalizeArticle({ ...sample, tags: [tag] }, "Body.", "tech"), /Invalid tag/);
    assert.throws(() => tagPath(tag), /Invalid tag/);
  }
  assert.throws(() => normalizeArticle({ ...sample, tags: [null] }, "Body.", "tech"), /Invalid tag/);
});

test("legitimate tag encoding and all generated document routes retain their identity", () => {
  for (const tag of ["A & B", "Privacy", "C++", "café", "100%", "%2F", "%2e%2e"]) {
    const a = normalizeArticle({ ...sample, tags: [tag] }, "Body.", "tech");
    const route = `/tag/${encodeURIComponent(tag.toLowerCase())}`;
    assert.equal(tagPath(tag), route);
    assert.deepEqual(a.tags, [tag]);
    assert.equal(parseRoute(route, routeInventory([a])).type, "tag");
  }
  const inventory = routeInventory(loadArticles());
  const manifest = JSON.parse(fs.readFileSync(new URL("../public/route-manifest.json", import.meta.url), "utf8"));
  const retainedIds = JSON.parse(fs.readFileSync(new URL("../scripts/lib/legacy-publication-ids.json", import.meta.url), "utf8"));
  for (const id of retainedIds) assert.equal(inventory[`/${id}`]?.type, "article", `Historical article route retained: ${id}`);
  assert.deepEqual(Object.keys(inventory).sort(), Object.keys(manifest).sort());
});

test("route inventory rejects article collisions while retaining shared tag/author archives", () => {
  const a = normalizeArticle(sample, "Body.", "tech");
  for (const articles of [[a, a], [{ ...a, categoryPath: "author", slug: "northstar-desk" }], [{ ...a, categoryPath: "tag", slug: "privacy", tags: ["Privacy"] }]])
    assert.throws(() => routeInventory(articles), /Duplicate route/);
  assert.doesNotThrow(() => routeInventory([a, { ...a, slug: "other" }]));
});

function isolatedOutput(run) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "northstar-prerender-safety-"));
  const out = path.join(parent, "dist");
  fs.mkdirSync(out);
  const sentinel = path.join(parent, "index.html");
  fs.writeFileSync(sentinel, "SOURCE SENTINEL");
  fs.writeFileSync(path.join(out, "index.html"), "BUILD SENTINEL");
  try {
    run(out);
    assert.equal(fs.readFileSync(sentinel, "utf8"), "SOURCE SENTINEL");
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
}

test("writer rejects escapes and duplicate destinations before any write, including homepage and native 404", () => {
  assert.equal(typeof prerender.writePrerenderedRoutes, "function");
  for (const route of ["/tag/..%2F..", "/../dist-sibling", "/%2Fabsolute", "/tag/..", "/tech/story/../story", "/TECH/STORY", "/tag/a%20b", "/tag/cafe%CC%81", "/bad%ZZ", "/a\\b", "/404.html/child"]) {
    isolatedOutput(out => {
      const pages = [["/", "NEW HOME"], ["/tech/story", "ARTICLE"], ["/tag/a b", "TAG"], ["/tag/caf%C3%A9", "UNICODE"], [route, "ATTACK"]];
      assert.throws(() => prerender.writePrerenderedRoutes(out, pages, "NOT FOUND"), /outside output directory|Duplicate prerender destination|Invalid prerender route|Conflicting prerender destinations/);
      assert.equal(fs.readFileSync(path.join(out, "index.html"), "utf8"), "BUILD SENTINEL");
      assert.deepEqual(fs.readdirSync(out), ["index.html"]);
    });
  }
});

test("writer rejects existing symlink destinations before any write", () => {
  for (const file of ["tag", "index.html", "404.html"]) {
    isolatedOutput(out => {
      const target = path.join(out, file);
      if (fs.existsSync(target)) fs.unlinkSync(target);
      fs.symlinkSync(file === "tag" ? path.dirname(out) : path.join(path.dirname(out), "index.html"), target);
      assert.throws(() => prerender.writePrerenderedRoutes(out, [["/", "HOME"], ["/tag/safety", "TAG"]], "404"), /symlink/);
      if (file !== "index.html") assert.equal(fs.readFileSync(path.join(out, "index.html"), "utf8"), "BUILD SENTINEL");
      assert.equal(fs.existsSync(path.join(path.dirname(out), "safety")), false);
    });
  }
});

// Include expansions, final sigma, Greek symbols and decomposed iota subscript.
const caselessPairs = [
  ["s", "ſ"], ["ss", "ß"], ["ss", "ẞ"], ["σ", "ς"], ["Σ", "ς"],
  ["θ", "ϑ"], ["ᾀ", "ἀι"], ["ΐ", "ι\u0308\u0301"], ["ffi", "ﬃ"],
  // Deliberately conservative: dotless i also shares the uppercase key.
  ["i", "ı"],
];

function assertCollisionBeforeWrite(routes, error) {
  isolatedOutput(out => {
    fs.writeFileSync(path.join(out, "404.html"), "404 SENTINEL");
    assert.throws(() => prerender.writePrerenderedRoutes(out,
      [["/", "NEW HOME"], ...routes.map(route => [route, "NEW PAGE"])], "NEW 404"), error);
    assert.equal(fs.readFileSync(path.join(out, "index.html"), "utf8"), "BUILD SENTINEL");
    assert.equal(fs.readFileSync(path.join(out, "404.html"), "utf8"), "404 SENTINEL");
    assert.deepEqual(fs.readdirSync(out).sort(), ["404.html", "index.html"]);
  });
}

test("writer rejects Unicode caseless destination pairs before any write", () => {
  for (const pair of caselessPairs) {
    for (const labels of [pair, [...pair].reverse()]) {
      assertCollisionBeforeWrite(labels.map(label => `/tag/${encodeURIComponent(label)}`),
        /Duplicate prerender destination/);
    }
  }
});

test("writer rejects Unicode caseless parent-directory/file conflicts before any write", () => {
  for (const [file, directory] of caselessPairs) {
    const routes = [`/tag/${encodeURIComponent(file)}`, `/tag/${encodeURIComponent(directory)}/index.html/child`];
    for (const ordered of [routes, [...routes].reverse()])
      assertCollisionBeforeWrite(ordered, /Conflicting prerender destinations/);
  }
});

test("caseless comparisons never rewrite individual Unicode labels, URLs or output paths", () => {
  for (const label of ["ſ", "ß", "ẞ", "ς", "ϑ", "ᾀ", "ΐ", "ﬃ", "ı"]) {
    const article = normalizeArticle({ ...sample, tags: [label] }, "Body.", "tech");
    assert.deepEqual(article.tags, [label]);
    const route = `/tag/${encodeURIComponent(label.toLowerCase())}`;
    assert.equal(tagPath(label), route);
    isolatedOutput(out => {
      prerender.writePrerenderedRoutes(out, [[route, "EXACT PATH"]], "404");
      assert.deepEqual(fs.readdirSync(path.join(out, "tag")), [label.toLowerCase()]);
      assert.equal(fs.readFileSync(path.join(out, "tag", label.toLowerCase(), "index.html"), "utf8"), "EXACT PATH");
    });
  }
});

test("writer decodes tag URLs exactly once and writes homepage, article, tag and native 404", () => {
  isolatedOutput(out => {
    prerender.writePrerenderedRoutes(out, [["/", "HOME"], ["/tech/story", "ARTICLE"], [tagPath("%2F"), "LITERAL PERCENT"], [tagPath("A & B"), "TAG"]], "NOT FOUND");
    for (const [file, html] of [["index.html", "HOME"], ["tech/story/index.html", "ARTICLE"], ["tag/%2f/index.html", "LITERAL PERCENT"], ["tag/a & b/index.html", "TAG"], ["404.html", "NOT FOUND"]])
      assert.equal(fs.readFileSync(path.join(out, file), "utf8"), html);
    assert.equal(fs.existsSync(path.join(out, "tag/%2F/index.html/index.html")), false);
  });
});
