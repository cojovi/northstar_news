// Synthetic temporary fixtures exercise the actual build loader, not publication data.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadArticles } from "../scripts/lib/load-articles.js";
import registry from "../src/data/authors.json" with { type: "json" };

function fixture(author, authorSlug, slug = "synthetic-gate-probe") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "northstar-loader-gate-"));
  fs.mkdirSync(path.join(root, "content", "tech"), { recursive: true });
  fs.writeFileSync(path.join(root, "content", "tech", slug + ".md"), `---
title: "Synthetic build-loader test, not a published article"
slug: ${slug}
author: ${JSON.stringify(author)}
author_slug: ${authorSlug}
published: 2020-01-01T00:00:00Z
updated: 2020-01-01T00:00:00Z
status: published
content_type: analysis
tags: []
---
This is synthetic unit-test prose. No reporting or real article is claimed.
`);
  return root;
}

test("actual build loader blocks a new invented byline even when backdated", () => {
  const root = fixture("Dr. Fabricated Test Identity", "synthetic-reviewer");
  try {
    assert.throws(() => loadArticles(root), /Publication blocked.*registered nonlegacy/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("actual build loader blocks an unsourced new article credited to the registered desk", () => {
  const root = fixture(registry["northstar-desk"].name, "northstar-desk");
  try {
    assert.throws(() => loadArticles(root), /Publication blocked.*evidence/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("actual build loader retains a grandfathered URL with honest pending legacy attribution", () => {
  const root = fixture("Synthetic historical credit", "synthetic-historical-credit", "what-happens-after-you-swipe-right-on-tinder");
  try {
    const articles = loadArticles(root);
    assert.equal(articles.length, 1);
    assert.equal(articles[0].authorProfile.kind, "legacy");
    assert.equal(articles[0].evidence.status, "pending");
    assert.equal(articles[0].evidence.completed_full_factcheck, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
