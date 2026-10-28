/** Static route output with the same article and policy renderers as the client. */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadArticles } from "./scripts/lib/load-articles.js";
import {
  SITE_URL,
  DEFAULT_IMAGE,
  resolveSocialImage,
} from "./src/lib/socialImage.js";
import { articleSchema, canonicalUrl, isDiscoverable } from "./src/lib/authority.js";
import { routeInventory, routeRobots, routeArticles } from "./src/lib/routes.js";
import { ArticleDocument } from "./src/components/ArticleDocument.js";
import { RoutePage, PublicLinks } from "./src/components/RoutePage.js";
const h = React.createElement;
export default function prerenderOGPlugin() {
  return {
    name: "vite-plugin-prerender-og",
    apply: "build",
    async writeBundle(options) {
      const outDir = options.dir || "dist";
      const base = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const articles = loadArticles();
      const inventory = routeInventory(articles);
      const pages = [];
      for (const [route, page] of Object.entries(inventory)) {
        const article =
          page.type === "article"
            ? articles.find(
                (a) => a.categoryPath === page.category && a.slug === page.slug,
              )
            : null;
        const html = article
          ? generateArticleHTML(base, article, route.slice(1), articles)
          : generatePageHTML(base, page, route, articles);
        pages.push([route, html]);
      }
      writePrerenderedRoutes(
        outDir,
        pages,
        generatePageHTML(
          base,
          {
            type: "notFound",
            title: "Page not found",
            description: "This URL is not in the published archive.",
          },
          "/404",
          articles,
        ),
      );
      console.log(
        `Prerendered ${articles.length} complete articles and ${Object.keys(inventory).length - articles.length} other routes; native 404 included.`,
      );
    },
  };
}
// Comparison only: canonical decomposition, lowercase, uppercase, decomposition.
// Lowering first also merges capital sharp S with ß/SS; uppercasing merges long s,
// final sigma and multi-character case expansions. This conservative caseless key
// also merges dotless i/I. It is not an OS filesystem table or an output-path rewrite.
function normalizedCaselessKey(value) {
  return value.normalize("NFD").toLowerCase().toUpperCase().normalize("NFD");
}
// Plan every destination, including home and the native 404, before any write.
// The HTTP server decodes URLs once; literal percent sequences must stay literal.
export function writePrerenderedRoutes(outDir, pages, notFoundHTML) {
  const root = path.resolve(outDir);
  const destinations = new Map();
  function plan(route, relativePath, html) {
    const target = path.resolve(root, relativePath);
    if (!target.startsWith(root + path.sep))
      throw new Error(`Prerender route ${JSON.stringify(route)} resolves outside output directory: ${target}`);
    const key = normalizedCaselessKey(target);
    if (destinations.has(key))
      throw new Error(`Duplicate prerender destination: ${JSON.stringify(route)} and ${JSON.stringify(destinations.get(key).route)} -> ${target}`);
    destinations.set(key, { route, target, html });
  }
  for (const [route, html] of pages) {
    let decoded;
    try {
      if (typeof route !== "string" || !route.startsWith("/")) throw new Error();
      decoded = decodeURIComponent(route.slice(1));
      if (/[\\\u0000-\u001f\u007f-\u009f]/u.test(decoded)) throw new Error();
    } catch {
      throw new Error(`Invalid prerender route: ${JSON.stringify(route)}`);
    }
    plan(route, route === "/" ? "index.html" : `${decoded}/index.html`, html);
  }
  plan("native 404", "404.html", notFoundHTML);
  for (const { target, route } of destinations.values()) {
    // Lexical containment alone cannot protect an existing symlink in dist.
    for (let entry = target; ; entry = path.dirname(entry)) {
      if (fs.lstatSync(entry, { throwIfNoEntry: false })?.isSymbolicLink())
        throw new Error(`Prerender route ${JSON.stringify(route)} has a symlink destination: ${entry}`);
      if (entry === root) break;
    }
    // A destination file cannot also be another destination's directory.
    for (let parent = path.dirname(target); parent !== root; parent = path.dirname(parent)) {
      if (destinations.has(normalizedCaselessKey(parent)))
        throw new Error(`Conflicting prerender destinations for ${JSON.stringify(route)}: ${parent}`);
    }
  }
  for (const { target, html } of destinations.values()) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
  }
}
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function metadataHTML(
  base,
  {
    title,
    description,
    url,
    image = DEFAULT_IMAGE,
    article = false,
    robots,
    schema,
  },
) {
  let html = base
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "")
    .replace(/<title>[^<]*<\/title>/i, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+name="(?:description|robots)"[^>]*>/gi, "")
    .replace(
      /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
  if (!html.includes("</head>"))
    throw new Error("Could not find </head> for metadata");
  const values = [
    ["property", "og:type", article ? "article" : "website"],
    ["property", "og:url", url],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:site_name", "The Northstar Ledger"],
    ["property", "og:image", image],
    ["property", "og:image:alt", title],
    ["property", "og:locale", "en_US"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:url", url],
    ["name", "twitter:image", image],
    ["name", "twitter:image:alt", title],
    ["name", "description", description],
    ["name", "robots", robots],
  ];
  if (image.startsWith("https:"))
    values.push(["property", "og:image:secure_url", image]);
  const tags = values
    .map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    )
    .join("\n");
  return html.replace(
    "</head>",
    `${tags}\n<link rel="canonical" href="${escapeHtml(url)}" /><title>${escapeHtml(title)}${title === "The Northstar Ledger" ? "" : " - The Northstar Ledger"}</title>${schema ? `<script id="prerender-article-schema" data-route-schema="true" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>` : ""}</head>`,
  );
}
function replaceRoot(html, body) {
  const root = /<div\s+id="root"\s*>\s*<\/div>/;
  if (!root.test(html))
    throw new Error("Expected empty React root in build template");
  const header =
    '<header class="border-b border-gray-200 dark:border-dark-700 max-w-7xl mx-auto px-4 py-5"><a class="text-2xl font-serif font-bold" href="/">The Northstar Ledger</a><nav class="flex flex-wrap gap-4 mt-4"><a href="/us">U.S.</a><a href="/world">World</a><a href="/politics">Politics</a><a href="/business">Business</a><a href="/tech">Tech</a><a href="/topics">Topic guides</a></nav></header>';
  const footer = renderToStaticMarkup(
    h(
      "footer",
      { className: "max-w-7xl mx-auto px-4 py-10 border-t" },
      h(PublicLinks),
    ),
  );
  return html.replace(
    root,
    () => `<div id="root">${header}<main>${body}</main>${footer}</div>`,
  );
}
export function generateArticleHTML(base, article, route, articles = []) {
  const a = {
    ...article,
    categoryPath: article.categoryPath || route.split("/")[0],
    slug: article.slug || route.split("/")[1],
  };
  const related = articles
    .filter(
      (other) =>
        isDiscoverable(other) && other.slug !== a.slug &&
        (other.categoryPath === a.categoryPath ||
          other.tags?.some((t) => a.tags?.includes(t))),
    )
    .slice(0, 4);
  return replaceRoot(
    metadataHTML(base, {
      title: a.title,
      description: a.dek,
      url: canonicalUrl(a),
      image: resolveSocialImage(a.hero_image),
      article: true,
      robots: routeRobots({ type: "article", indexable: isDiscoverable(a) }),
      schema: articleSchema(a),
    }),
    renderToStaticMarkup(h(ArticleDocument, { article: a, related })),
  );
}
export function generatePageHTML(base, page, route, articles) {
  return replaceRoot(
    metadataHTML(base, {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${route}`,
      robots: routeRobots(page),
    }),
    renderToStaticMarkup(h(RoutePage, { route: page, articles })),
  );
}
export function generateListingHTML(base, articles, category = "") {
  return generatePageHTML(
    base,
    {
      type: category ? "category" : "home",
      category,
      articleCount: routeArticles({type: "category", category}, articles.map(a => ({...a, categoryPath: a.categoryPath || a.category}))).length,
      title: category
        ? `${category} - The Northstar Ledger`
        : "The Northstar Ledger",
      description: category
        ? `Browse the ${category} archive.`
        : "News summaries, analysis and commentary with visible evidence limits.",
    },
    category ? `/${category}` : "/",
    articles.map((a) => ({
      ...a,
      categoryPath: a.categoryPath || a.category,
      evidence: a.evidence || { status: "pending" },
    })),
  );
}
