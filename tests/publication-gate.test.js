import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import yaml from "js-yaml";
import { assertPublicationReady } from "../scripts/lib/publication-gate.js";
import legacyIDs from "../scripts/lib/legacy-publication-ids.json" with { type: "json" };
import { normalizeArticle } from "../src/lib/authority.js";

const revision = "02c10cb932fcd1149987eec4c8d13b7c21eb36df";
const malformedTitleFile = "content/us/feasting-on-evidence-the-luigi-mangione-murder-case-takes-a-darkly-humorous-twist.md";
const git = (...args) => execFileSync("git", args, {
  cwd: new URL("..", import.meta.url), encoding: "utf8", maxBuffer: 8 * 1024 * 1024,
});
function baseline() {
  return git("ls-tree", "-r", "--name-only", revision, "content")
    .trim().split("\n").filter(file => /^content\/[^/]+\/[^/]+\.md$/.test(file))
    .map(file => {
      let source = git("show", `${revision}:${file}`);
      // Original title alone is malformed; it has no bearing on route or status.
      if (file === malformedTitleFile) {
        assert.match(source, /^---\ntitle: ""[^\n]+""\n/);
        source = source.replace(/^title: .*\n/m, "");
      }
      const { data, content } = matter(source, {
        engines: { yaml: value => yaml.load(value, { schema: yaml.JSON_SCHEMA }) },
      });
      return { id: `${file.split("/")[1]}/${data.slug}`, data, body: content };
    }).filter(record => record.data.status === "published");
}
const hash = body => createHash("sha256").update(body.trim(), "utf8").digest("hex");
// Entirely synthetic unit data. These URLs are identifiers only: no records are
// fetched, created or certified, and this fixture is never written to content/.
function readyFixture() {
  const source = "https://www.nasa.gov/synthetic-unit-source";
  const body = "Synthetic unit assertion [1].\n\n[1] " + source;
  return {
    id: "tech/synthetic-unit-only",
    data: {
      slug: "synthetic-unit-only", title: "Synthetic unit data only",
      status: "published", published: "2026-10-28", content_type: "analysis",
      author: "The Northstar Ledger Desk", author_slug: "northstar-desk",
    },
    body,
    review: {
      evidence: {
        status: "partial", reviewed_at: "2026-10-28",
        summary: "Synthetic unit metadata; no source was checked.",
        limits: "Synthetic fixture only; establishes no factual finding.",
        record_url: "https://thenorthstarledger.com/source-reviews#synthetic-unit-only",
        sources: [source],
      },
      publication: {
        status: "ready", source_sha256: hash(body),
        claim_ledger: [{
          claim: "Synthetic unit assertion.", source_url: source,
          supporting_excerpt: "Synthetic unit excerpt, not a quotation from NASA.",
          attribution: "source-statement",
        }],
      },
    },
  };
}
function rejected(fixture, pattern) {
  assert.throws(() => assertPublicationReady(fixture), pattern);
}

test("fixed legacy list equals all 136 published routes at the pinned git revision", () => {
  const derived = baseline().map(record => record.id).sort();
  assert.equal(derived.length, 136);
  assert.equal(new Set(legacyIDs).size, 136);
  assert.deepEqual(legacyIDs, derived);
});

test("known historical credit and pending evidence stay accessible without certification", () => {
  const historical = baseline().find(record => record.data.title && record.data.author.startsWith("Dr."));
  assert.ok(historical);
  assert.doesNotThrow(() => assertPublicationReady({ ...historical, review: {} }));
  const article = normalizeArticle(historical.data, historical.body, historical.id.split("/")[0]);
  assert.equal(article.authorProfile.kind, "legacy");
  assert.equal(article.evidence.status, "pending");
});

test("legacy partial sidecar without publication preserves limited review", () => {
  const fixture = readyFixture();
  fixture.id = legacyIDs[0];
  fixture.data.slug = fixture.id.split("/")[1];
  fixture.data.author = "Dr. Made Up Historical Credit";
  delete fixture.review.publication;
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  const article = normalizeArticle(fixture.data, fixture.body, fixture.id.split("/")[0], fixture.review);
  assert.equal(article.evidence.status, "partial");
  assert.equal(article.evidence.completed_full_factcheck, false);
  assert.equal(article.authorProfile.kind, "legacy");
});

test("brand-new invented reviewer, mismatched registered name and legacy author are blocked", () => {
  for (const [author, author_slug] of [
    ["Dr. Made Up Reviewer", "made-up-reviewer"],
    ["Dr. Made Up Reviewer", "northstar-desk"],
    ["Dr. Benjamin Jackson", "benjamin-jackson"],
    ["The Northstar Ledger Desk ", "northstar-desk"],
  ]) {
    const fixture = readyFixture();
    Object.assign(fixture.data, { author, author_slug });
    rejected(fixture, /author/i);
  }
});

test("registered desk without sources cannot publish, even if marked nonindexable", () => {
  const fixture = readyFixture();
  fixture.body = "Synthetic unsupported assertion.";
  fixture.data.indexable = false;
  fixture.review.evidence.sources = [];
  fixture.review.publication.source_sha256 = hash(fixture.body);
  rejected(fixture, /sources/i);
});

test("explicit type, evidence and body-bound synthetic ready record pass", () => {
  const fixture = readyFixture();
  const before = structuredClone(fixture);
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  assert.deepEqual(fixture, before, "assertion must not modify input");
  fixture.data.author = "Cody Viveiros";
  fixture.data.author_slug = "cody-viveiros";
  fixture.review.evidence.status = "reviewed";
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  for (const attribution of ["analysis", "uncertain", "independent-finding"]) {
    fixture.review.publication.claim_ledger[0].attribution = attribution;
    assert.doesNotThrow(() => assertPublicationReady(fixture));
  }
});

test("type must be explicit, never inferred from category or satire flag", () => {
  for (const type of [undefined, "", "invented"]) {
    const fixture = readyFixture();
    fixture.data.content_type = type;
    fixture.data.is_satire = true;
    rejected(fixture, /content_type/i);
  }
});

test("body needs only nonempty text, and ready approval binds trimmed UTF8 bytes", () => {
  const fixture = readyFixture();
  fixture.body = "Å";
  fixture.review.publication.source_sha256 = hash(fixture.body);
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  fixture.body = " \nÅ\n ";
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  fixture.body += "Changed";
  rejected(fixture, /source_sha256.*body/i);
  fixture.body = " \n\t";
  fixture.review.publication.source_sha256 = hash(fixture.body);
  rejected(fixture, /body/i);
});

test("publication approval must be ready with a nonempty valid ledger", () => {
  for (const publication of [undefined, null, [], {}, { status: "pending" }]) {
    const fixture = readyFixture();
    fixture.review.publication = publication;
    rejected(fixture, /publication/i);
  }
  for (const ledger of [undefined, null, {}, [], Array(1), [null], ["claim"], [{}]]) {
    const fixture = readyFixture();
    fixture.review.publication.claim_ledger = ledger;
    rejected(fixture, /claim_ledger/i);
  }
  for (const field of ["claim", "source_url", "supporting_excerpt", "attribution"]) {
    for (const value of [undefined, " ", 17]) {
      const fixture = readyFixture();
      fixture.review.publication.claim_ledger[0][field] = value;
      rejected(fixture, /claim_ledger/i);
    }
  }
  const fixture = readyFixture();
  fixture.review.publication.claim_ledger[0].attribution = "human-verified";
  rejected(fixture, /attribution/i);
  fixture.review.publication.claim_ledger[0].attribution = "analysis";
  fixture.review.publication.claim_ledger[0].source_url = "https://www.nasa.gov/unlisted-unit-source";
  rejected(fixture, /source_url/i);
  fixture.review.publication.claim_ledger.push({});
  rejected(fixture, /claim_ledger/i);
});

test("dated reviewed/partial evidence needs summary, limits and record URL", () => {
  for (const [field, values] of Object.entries({
    status: [undefined, "pending"], summary: [undefined, " "], limits: [undefined, " "],
    reviewed_at: [undefined, "yesterday", "2026-02-30", "123"],
    record_url: [undefined, "", "javascript:bad", "https://example.com/review"],
  })) {
    for (const value of values) {
      const fixture = readyFixture();
      fixture.review.evidence[field] = value;
      rejected(fixture, /evidence/i);
    }
  }
});

test("unsafe and placeholder source URLs are rejected rather than filtered", () => {
  for (const source of [
    "javascript:alert(1)", "data:text/plain,source", "file:///tmp/source", "ftp://nasa.gov/source",
    "https://example.com/source", "https://sub.example.org/source", "https://source.invalid/",
    "https://source.test/", "http://localhost/source", "https://user:pass@www.nasa.gov/source", " ",
  ]) {
    const fixture = readyFixture();
    fixture.review.evidence.sources.push(source);
    rejected(fixture, /sources/i);
  }
  const fixture = readyFixture();
  fixture.data.sources = ["javascript:bad"];
  rejected(fixture, /sources/i);
  fixture.data.sources = { url: "https://www.nasa.gov/source" };
  rejected(fixture, /sources/i);
});

test("evidence uses existing frontmatter/sidecar merge and source object conventions", () => {
  const fixture = readyFixture();
  fixture.data.evidence = fixture.review.evidence;
  fixture.review.evidence = { summary: "Synthetic sidecar override only." };
  fixture.data.evidence.sources = fixture.data.evidence.sources.map(url => ({ url }));
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  fixture.review.evidence.status = "pending";
  rejected(fixture, /evidence/i);
});

test("backdating cannot make a brand-new ID legacy", () => {
  const fixture = readyFixture();
  fixture.data.published = "1990-01-01";
  fixture.data.author = "Dr. Made Up Reviewer";
  delete fixture.review.publication;
  rejected(fixture, /author/i);
});

test("retained nonpublication statuses stay nonindexable; returning to published needs gate", () => {
  for (const status of ["withdrawn", "review-hold", "draft"]) {
    const fixture = readyFixture();
    fixture.data.status = status;
    fixture.data.indexable = true;
    delete fixture.review;
    assert.doesNotThrow(() => assertPublicationReady(fixture));
    assert.equal(normalizeArticle(fixture.data, fixture.body, "tech").indexable, false);
    fixture.data.status = "published";
    rejected(fixture, /evidence|publication/i);
  }
  const fixture = readyFixture();
  delete fixture.data.status;
  rejected(fixture, /status/i);
});

test("legacy ready assertions fail closed on stale hash or malformed ledger", () => {
  const fixture = readyFixture();
  fixture.id = legacyIDs[0];
  fixture.data.slug = fixture.id.split("/")[1];
  fixture.data.author = "Historical credit only";
  assert.doesNotThrow(() => assertPublicationReady(fixture));
  fixture.body += " Changed since approval.";
  rejected(fixture, /source_sha256.*body/i);
  fixture.review.publication.source_sha256 = hash(fixture.body);
  fixture.review.publication.claim_ledger = [];
  rejected(fixture, /claim_ledger/i);
  fixture.data.status = "withdrawn";
  rejected(fixture, /claim_ledger/i);
});

test("ID must match the route slug", () => {
  const fixture = readyFixture();
  fixture.id = legacyIDs[0];
  rejected(fixture, /id.*slug/i);
});
