import type { Article } from "../types/article";
import type { Route } from "./routes.js";
import { routeRobots } from "./routes.js";
import { articleSchema, canonicalUrl } from "./authority.js";
import { DEFAULT_IMAGE, SITE_URL, resolveSocialImage } from "./socialImage.js";
export function updateMetadata(
  route: Route,
  path: string,
  article?: Article | null,
) {
  // One owner of route metadata: no restoration of stale article tags on exit.
  document.head
    .querySelectorAll(
      'meta[property^="og:"],meta[name^="twitter:"],meta[name="description"],meta[name="robots"],link[rel="canonical"],script[data-route-schema],#prerender-article-schema',
    )
    .forEach((el) => el.remove());
  document.title =
    route.type === "home"
      ? route.title
      : `${route.title} - The Northstar Ledger`;
  const url = article
    ? canonicalUrl(article)
    : `${SITE_URL}${route.path || (path === "/" ? "/" : path.replace(/\/$/, ""))}`;
  const image = article
    ? resolveSocialImage(article.hero_image)
    : DEFAULT_IMAGE;
  const values = [
    ["name", "description", route.description],
    ["name", "robots", routeRobots(route)],
    ["property", "og:title", route.title],
    ["property", "og:description", route.description],
    ["property", "og:url", url],
    ["property", "og:type", article ? "article" : "website"],
    ["property", "og:image", image],
    ["property", "og:image:alt", route.title],
    ["property", "og:site_name", "The Northstar Ledger"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", route.title],
    ["name", "twitter:description", route.description],
    ["name", "twitter:url", url],
    ["name", "twitter:image", image],
    ["name", "twitter:image:alt", route.title],
  ];
  if (image.startsWith("https:"))
    values.push(["property", "og:image:secure_url", image]);
  for (const [attribute, key, value] of values) {
    const el = document.createElement("meta");
    el.setAttribute(attribute, key);
    el.content = value;
    document.head.appendChild(el);
  }
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = url;
  document.head.appendChild(canonical);
  if (article) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.routeSchema = "true";
    script.textContent = JSON.stringify(articleSchema(article));
    document.head.appendChild(script);
  }
}
