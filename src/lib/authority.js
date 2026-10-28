// Browser-safe normalization. YAML and filesystem access live only in scripts/lib.
import registry from "../data/authors.json" with { type: "json" };
import { SITE_URL, resolveSocialImage } from "./socialImage.js";
export { registry };
export const CONTENT_TYPES = [
  "news",
  "analysis",
  "opinion",
  "satire",
  "sponsored",
];
export function cleanLiteralUrl(value) {
  let url = value.replace(/[.,;:!]+$/, "");
  for (const [open, close] of [
    ["(", ")"],
    ["[", "]"],
    ["{", "}"],
  ]) {
    while (
      url.endsWith(close) &&
      url.split(close).length > url.split(open).length
    )
      url = url.slice(0, -1);
  }
  return url;
}
const text = (value) => (typeof value === "string" ? value : "");
const date = (value) =>
  value instanceof Date ? value.toISOString() : text(value);
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}
export function tagPath(tag) {
  validateTag(tag);
  return `/tag/${encodeURIComponent(tag.toLowerCase())}`;
}
// Shared by browser routes and build normalization. Literal percent sequences
// are valid labels: encode once here and decode once at the filesystem boundary.
export function validateTag(tag) {
  if (
    typeof tag !== "string" || !tag || tag !== tag.trim() ||
    tag === "." || tag === ".." || /[/\\\u0000-\u001f\u007f-\u009f]/u.test(tag)
  )
    throw new Error(`Invalid tag ${JSON.stringify(tag)}: expected a nonempty label without path separators, dot segments, control characters or surrounding whitespace`);
  return tag;
}
export function articlePath(article) {
  return `/${article.categoryPath || article.category}/${article.slug}`;
}
export function canonicalUrl(article) {
  const own = `${SITE_URL}${articlePath(article)}`;
  // Self-canonical metadata is accepted; cross-article aliases need an explicit
  // redirect and are not a reason to erase a distinct article from discovery.
  return own;
}
export function isDiscoverable(article) {
  return !["withdrawn", "draft", "review-hold"].includes(article.status) && article.indexable !== false;
}
export function normalizeArticle(data, body, categoryPath, review = {}) {
  const slug = text(data.slug);
  const author = text(data.author) || registry["northstar-desk"].name;
  const author_slug = text(data.author_slug) || "northstar-desk";
  const known = registry[author_slug];
  const authorProfile =
    known && known.name === author
      ? known
      : {
          name: author,
          slug: author_slug,
          kind: "legacy",
          bio: "Legacy attribution; identity and credentials have not been independently verified.",
        };
  const published = date(data.published),
    updated = date(data.updated) || published;
  if (
    !/^[a-z0-9][a-z0-9_-]*$/.test(slug) ||
    !/^[a-z0-9_-]+$/.test(categoryPath) ||
    !/^[a-z0-9_-]+$/.test(author_slug)
  )
    throw new Error(`Invalid article route/author: ${slug}`);
  if (
    !text(data.title) ||
    !Number.isFinite(Date.parse(published)) ||
    !Number.isFinite(Date.parse(updated))
  )
    throw new Error(`Invalid title/date: ${slug}`);
  if (Date.parse(updated) < Date.parse(published))
    throw new Error(`Updated before publication: ${slug}`);
  const type = CONTENT_TYPES.includes(data.content_type)
    ? data.content_type
    : data.is_satire === true
      ? "satire"
      : categoryPath === "opinion"
        ? "opinion"
        : "news";
  const evidenceInput = {
    ...(data.evidence || {}),
    ...(review.evidence || {}),
  };
  const rawSources = [
    ...(Array.isArray(data.sources) ? data.sources : []),
    ...(Array.isArray(evidenceInput.sources) ? evidenceInput.sources : []),
    ...[...body.matchAll(/https?:\/\/[^\s<>"`]+/g)].map((m) =>
      cleanLiteralUrl(m[0]),
    ),
  ];
  const sources = [
    ...new Set(
      rawSources
        .map((s) => safeUrl(typeof s === "string" ? s : s?.url))
        .filter(Boolean),
    ),
  ];
  // A reviewed label requires a dated record explaining what was checked and its limits.
  const reviewed =
    ["reviewed", "partial"].includes(evidenceInput.status) &&
    safeUrl(evidenceInput.record_url) &&
    text(evidenceInput.summary) &&
    text(evidenceInput.limits) &&
    Number.isFinite(Date.parse(evidenceInput.reviewed_at)) &&
    sources.length;
  const affiliated =
    typeof review.affiliated === "boolean" ? review.affiliated :
    /\b(cody\s+viveiros|cojovi|cmac|christian\s+viveiros)\b/i.test(
      `${data.title}\n${data.dek}\n${body}`,
    );
  const corrections = [
    ...(Array.isArray(data.corrections) ? data.corrections : []),
    ...(Array.isArray(review.corrections) ? review.corrections : []),
  ]
    .map((c) => ({
      date: Number.isFinite(Date.parse(date(c.date))) ? date(c.date) : "",
      note: text(c.note),
      url: safeUrl(c.url),
    }))
    .filter((c) => c.note);
  return {
    ...data,
    status: data.status === "withdrawn" ? "withdrawn" : data.status || "published",
    indexable: !["withdrawn", "review-hold", "draft"].includes(data.status) && data.indexable !== false,
    title: text(data.title),
    slug,
    categoryPath,
    category: text(data.category) || categoryPath,
    author,
    author_slug,
    authorProfile,
    published,
    updated,
    content: body,
    dek: text(data.dek) || text(data.excerpt),
    excerpt: text(data.excerpt) || text(data.dek),
    tags: [
      ...new Set(
        (Array.isArray(data.tags) ? data.tags : []).map(validateTag),
      ),
    ],
    hero_image: resolveSocialImage(data.hero_image),
    thumbnail: resolveSocialImage(data.thumbnail || data.hero_image),
    hero_credit: text(data.hero_credit),
    hero_alt: text(data.hero_alt) || `Image accompanying: ${text(data.title)}`,
    reading_time:
      Number(data.reading_time) ||
      Math.max(1, Math.ceil(body.split(/\s+/).length / 220)),
    content_type: type,
    is_satire: type === "satire",
    evidence: {
      status: reviewed ? evidenceInput.status : "pending",
      completed_full_factcheck: Boolean(reviewed && evidenceInput.status === "reviewed" && evidenceInput.completed_full_factcheck === true),
      sources,
      summary: reviewed || text(evidenceInput.summary)
        ? text(evidenceInput.summary)
        : "Legacy record / source review pending. Existing citations are leads, not confirmation of the claims.",
      limits:
        text(evidenceInput.limits) ||
        "The existing source record does not establish independent verification, original interviews or human editorial review.",
      record_url: reviewed ? evidenceInput.record_url : null,
      reviewed_at: reviewed ? evidenceInput.reviewed_at : null,
    },
    affiliated,
    review_kind: text(review.kind) || (reviewed ? "documentary-source-review" : "pending-source-review"),
    review_notice: text(review.notice),
    corrections,
    image_credit_status: "legacy-unverified",
  };
}
export function articleSchema(article) {
  const profile = article.authorProfile;
  const author =
    profile?.kind === "person"
      ? {
          "@type": "Person",
          name: article.author,
          url: `${SITE_URL}/author/${article.author_slug}`,
        }
      : profile?.kind === "organization"
        ? { "@type": "Organization", name: profile.name, url: profile.url }
        : undefined;
  return {
    "@context": "https://schema.org",
    "@type":
      article.content_type === "satire" ? "BlogPosting" :
      article.content_type === "news" || !article.content_type
        ? "NewsArticle"
        : "Article",
    headline: article.title,
    description: article.dek,
    image: resolveSocialImage(article.hero_image),
    url: canonicalUrl(article),
    mainEntityOfPage: canonicalUrl(article),
    datePublished: article.published,
    dateModified: article.updated || article.published,
    genre: article.content_type || "news",
    ...(author
      ? { author }
      : {
          creditText: `Historical credit: ${article.author || "Unspecified"}; identity and credentials not independently verified.`,
        }),
    publisher: {
      "@type": "Organization",
      name: "The Northstar Ledger",
      url: SITE_URL,
    },
    articleSection: article.category,
  };
}
export function linkLiteralUrls() {
  return (tree) => {
    const numbered = new Map();
    function collect(node) {
      if (
        ["link", "linkReference", "code", "inlineCode", "html"].includes(
          node.type,
        )
      )
        return;
      if (node.type === "text")
        for (const match of node.value.matchAll(
          /(?:^|\n)\[(\d+)\]\s+(https?:\/\/[^\s<>]+)/g,
        )) {
          const url = cleanLiteralUrl(match[2]);
          if (safeUrl(url)) numbered.set(match[1], url);
        }
      node.children?.forEach(collect);
    }
    collect(tree);
    function walk(node) {
      if (
        !node.children ||
        ["link", "linkReference", "code", "inlineCode", "html"].includes(
          node.type,
        )
      )
        return;
      node.children = node.children.flatMap((child) => {
        if (child.type !== "text") {
          walk(child);
          return [child];
        }
        const result = [];
        let cursor = 0;
        for (const m of child.value.matchAll(
          /https?:\/\/[^\s<>]+|\[(\d+)\]/g,
        )) {
          const label = m[1] ? m[0] : cleanLiteralUrl(m[0]);
          const url = m[1] ? numbered.get(m[1]) : label;
          if (!safeUrl(url)) continue;
          if (m.index > cursor)
            result.push({
              type: "text",
              value: child.value.slice(cursor, m.index),
            });
          result.push({
            type: "link",
            url,
            children: [{ type: "text", value: label }],
          });
          cursor = m.index + label.length;
        }
        if (cursor < child.value.length)
          result.push({ type: "text", value: child.value.slice(cursor) });
        return result.length ? result : [child];
      });
    }
    walk(tree);
  };
}
