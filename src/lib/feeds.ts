import { getAllArticles } from "./content";
import { rssFeed, atomFeed, sitemap } from "./discovery.js";
import { canonicalUrl, isDiscoverable } from "./authority.js";
import { routeInventory } from "./routes.js";
import { SITE_URL } from "./socialImage.js";
export async function generateRSSFeed(): Promise<string> {
  return rssFeed(getAllArticles());
}
export async function generateAtomFeed(): Promise<string> {
  return atomFeed(getAllArticles());
}
export async function generateSitemap(): Promise<string> {
  const articles = getAllArticles();
  return sitemap(
    Object.entries(routeInventory(articles)).filter(([, r]) => r.indexable).map(([p, r]) => ({
      url: SITE_URL + p,
      ...(r.type === "article"
        ? {
            updated: articles.find((a) => canonicalUrl(a) === SITE_URL + p)!
              .updated,
          }
        : {}),
    })),
  );
}
export async function generateNewsSitemap(): Promise<string> {
  // The normal sitemap covers the complete archive. No old story is presented as recent news.
  return sitemap(
    getAllArticles()
      .filter(
        (a) =>
          isDiscoverable(a) && Date.now() - Date.parse(a.published) >= 0 &&
          Date.now() - Date.parse(a.published) < 172800000 &&
          a.content_type === "news",
      )
      .map((a) => ({ url: canonicalUrl(a), updated: a.updated })),
  );
}
