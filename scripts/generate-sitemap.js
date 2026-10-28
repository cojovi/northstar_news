import fs from "node:fs";
import { loadArticles } from "./lib/load-articles.js";
import { routeInventory } from "../src/lib/routes.js";
import { canonicalUrl } from "../src/lib/authority.js";
import { SITE_URL } from "../src/lib/socialImage.js";
import { sitemap, rssFeed, atomFeed } from "../src/lib/discovery.js";
const articles = loadArticles();
const inventory = routeInventory(articles);
const pages = Object.entries(inventory).filter(([, r]) => r.indexable && r.type !== "article");
const post = articles.filter(a => inventory[new URL(canonicalUrl(a)).pathname].indexable).map((a) => ({
  url: canonicalUrl(a),
  updated: a.updated,
}));
const sections = pages
  .filter(([, r]) => ["category", "tag", "author", "topic"].includes(r.type))
  .map(([p]) => ({ url: SITE_URL + p }));
const staticPages = pages
  .filter(([, r]) => !["category", "tag", "author", "topic"].includes(r.type))
  .map(([p]) => ({ url: SITE_URL + p }));
// Static pages have no invented publication or last-modified dates.
fs.writeFileSync("public/post-sitemap.xml", sitemap(post));
fs.writeFileSync("public/section-sitemap.xml", sitemap(sections));
fs.writeFileSync("public/page-sitemap.xml", sitemap(staticPages));
fs.writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["post", "section", "page"].map((name) => `<sitemap><loc>${SITE_URL}/${name}-sitemap.xml</loc></sitemap>`).join("")}</sitemapindex>`,
);
fs.writeFileSync("public/rss.xml", rssFeed(articles));
fs.writeFileSync("public/atom.xml", atomFeed(articles));
fs.writeFileSync(
  "public/route-manifest.json",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(inventory).map(([p, r]) => [
        p,
        {
          type: r.type,
          title: r.title,
          description: r.description,
          url: SITE_URL + p,
          indexable: r.indexable,
        },
      ]),
    ),
    null,
    2,
  ) + "\n",
);
console.log(
  `Generated discovery files: ${post.length} articles, ${sections.length} archive/topic/profile routes, ${staticPages.length} pages. No notifications sent.`,
);
