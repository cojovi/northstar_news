import { createHash } from "node:crypto";
import registry from "../../src/data/authors.json" with { type: "json" };
import legacyIDs from "./legacy-publication-ids.json" with { type: "json" };
import { CONTENT_TYPES, cleanLiteralUrl } from "../../src/lib/authority.js";

// Pinned historical inventory, never extended from dates or current content.
const legacy = new Set(legacyIDs);
const attributions = new Set([
  "source-statement", "analysis", "uncertain", "independent-finding",
]);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" && value.trim().length > 0;

// Lexical checks only: no network lookup or assertion that a record exists.
function sourceUrl(value) {
  if (!text(value) || !/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.username || url.password ||
        /(^|\.)(example\.(com|net|org)|example|invalid|test|localhost|local)$/.test(host) ||
        /(^|[.-])(placeholder|your-domain|yourdomain|todo)([.-]|$)/.test(host) ||
        ["0.0.0.0", "[::1]"].includes(host) || /^127\./.test(host)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function dated(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) ||
      !Number.isFinite(Date.parse(value))) return false;
  // Date.parse alone permits impossible dates such as February 30.
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
}

export function assertPublicationReady({ id, data, body, review = {} }) {
  const require = (condition, message) => {
    if (!condition) throw new Error(`Publication blocked (${id}): ${message}`);
  };
  require(object(data), "article data must be an object");
  require(typeof id === "string" && /^[a-z0-9_-]+\/[a-z0-9][a-z0-9_-]*$/.test(id) &&
    id.split("/")[1] === data.slug, "id must be category/slug and match data.slug");
  require(object(review), "review sidecar must be an object");
  require(["published", "withdrawn", "review-hold", "draft"].includes(data.status),
    "status must be explicit and recognized");

  const newPublication = data.status === "published" && !legacy.has(id);
  const ready = review.publication?.status === "ready";
  if (!newPublication && !ready) return;

  if (newPublication) {
    const author = Object.hasOwn(registry, data.author_slug) ? registry[data.author_slug] : null;
    require(author && author.slug === data.author_slug && author.name === data.author &&
      ["person", "organization"].includes(author.kind),
    "author name and author_slug must exactly match a registered nonlegacy person or organization");
    require(CONTENT_TYPES.includes(data.content_type), "content_type must be explicit and valid");
  }
  require(text(body), "body must contain nonempty text");
  for (const evidence of [data.evidence, review.evidence]) {
    require(evidence === undefined || object(evidence), "evidence must be an object");
  }
  const evidence = { ...data.evidence, ...review.evidence };
  require(["reviewed", "partial"].includes(evidence.status) && dated(evidence.reviewed_at) &&
    text(evidence.summary) && text(evidence.limits) && sourceUrl(evidence.record_url),
  "evidence needs reviewed/partial status, valid reviewed_at, summary, limits and a safe non-placeholder record_url");

  // Match authority.js source conventions, but reject invalid sources instead
  // of dropping them and allowing normalization to downgrade a ready assertion.
  for (const sources of [data.sources, evidence.sources]) {
    require(sources === undefined || Array.isArray(sources), "evidence sources must be arrays");
  }
  const rawSources = [
    ...(data.sources || []), ...(evidence.sources || []),
    ...[...body.matchAll(/https?:\/\/[^\s<>"`]+/g)].map(match => cleanLiteralUrl(match[0])),
  ];
  const sources = new Set();
  for (const source of rawSources) {
    const url = sourceUrl(typeof source === "string" ? source : object(source) ? source.url : null);
    require(url, "evidence sources must contain only safe non-placeholder HTTP(S) URLs");
    sources.add(url);
  }
  require(sources.size > 0, "evidence sources must be nonempty");

  const publication = review.publication;
  require(object(publication) && publication.status === "ready", "review.publication.status must be ready");
  const actualHash = createHash("sha256").update(body.trim(), "utf8").digest("hex");
  require(publication.source_sha256 === actualHash, "publication.source_sha256 must match the actual trimmed body SHA256");
  require(Array.isArray(publication.claim_ledger) && publication.claim_ledger.length > 0,
    "publication.claim_ledger must be a nonempty array");
  for (const [index, record] of publication.claim_ledger.entries()) {
    const field = `publication.claim_ledger[${index}]`;
    require(object(record) && text(record.claim) && text(record.supporting_excerpt),
      `${field} needs nonempty claim and supporting_excerpt`);
    const url = sourceUrl(record.source_url);
    require(url && sources.has(url), `${field}.source_url must be present in evidence sources`);
    require(attributions.has(record.attribution), `${field}.attribution must be a supported label`);
  }
}
