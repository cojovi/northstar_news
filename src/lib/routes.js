import { PAGES, TOPICS } from "./pages.js";
import { registry, articlePath, tagPath, isDiscoverable } from "./authority.js";
export const CATEGORIES = [
  "us",
  "world",
  "politics",
  "business",
  "tech",
  "health",
  "entertainment",
  "sports",
  "opinion",
  "lifestyle",
  "travel",
];
// Indexability is editorial policy, not a reward for archive volume. Curated
// guides live under TOPICS; automatically derived tag pages remain navigable.
export function isRouteIndexable(route) {
  if (route.indexable === false) return false;
  if (["tag", "search", "notFound"].includes(route.type)) return false;
  if (route.type === "author") {
    const registered = registry[route.slug];
    return Boolean(
      registered && registered.kind !== "legacy" &&
      route.profile?.kind === registered.kind &&
      route.profile?.name === registered.name,
    );
  }
  if (route.type === "category") return route.articleCount > 0;
  return ["home", "article", "page", "topics", "topic"].includes(route.type);
}
export function routeRobots(route) {
  return isRouteIndexable(route)
    ? "index,follow,max-image-preview:large"
    : "noindex,follow";
}
export function routeInventory(articles) {
  const routes = {
    "/": {
      type: "home",
      title: "The Northstar Ledger",
      description:
        "News summaries, analysis and commentary with visible sources, ownership and evidence limits.",
    },
    "/search": {
      type: "search",
      title: "Search the archive",
      description: "Search The Northstar Ledger article archive.",
    },
    "/topics": {
      type: "topics",
      title: "Topic guides",
      description:
        "Connected coverage of public accountability, policy costs and institutional decisions.",
    },
  };
  function addRoute(path, page, shared = false) {
    if (Object.hasOwn(routes, path) && !(shared && routes[path].type === page.type))
      throw new Error(`Duplicate route ${path}: ${routes[path].type} conflicts with ${page.type}`);
    routes[path] = page;
  }
  for (const [slug, page] of Object.entries(PAGES))
    addRoute(`/${slug}`, { type: "page", slug, ...page });
  for (const category of CATEGORIES)
    addRoute(`/${category}`, {
      type: "category",
      category,
      title: `${category === "us" ? "U.S." : category.charAt(0).toUpperCase() + category.slice(1)} archive`,
      description: `Browse the ${category} archive. Historical records retain their original dates and evidence limits.`,
    });
  for (const [slug, topic] of Object.entries(TOPICS))
    addRoute(`/topics/${slug}`, { type: "topic", slug, ...topic });
  for (const a of articles) {
    addRoute(articlePath(a), {
      type: "article",
      indexable: isDiscoverable(a),
      category: a.categoryPath,
      slug: a.slug,
      title: a.title,
      description: a.dek,
    });
    addRoute(`/author/${a.author_slug}`, {
      type: "author",
      slug: a.author_slug,
      title: a.author,
      description: a.authorProfile.bio,
      profile: a.authorProfile,
    }, true);
    for (const tag of a.tags)
      addRoute(tagPath(tag), {
        type: "tag",
        tag,
        title: `${tag} archive`,
        description: `Articles tagged ${tag}. Historical records may have source review pending.`,
      }, true);
  }
  for (const p of Object.values(registry).filter((p) => p.kind !== "legacy"))
    addRoute(`/author/${p.slug}`, {
      type: "author",
      slug: p.slug,
      title: p.name,
      description: p.bio,
      profile: p,
    }, true);
  for (const [path, route] of Object.entries(routes)) {
    route.path = path;
    if (route.type === "category") route.articleCount = routeArticles(route, articles).length;
    route.indexable = isRouteIndexable(route);
  }
  return routes;
}
export function parseRoute(pathname, inventory) {
  try {
    // Normalize encoded tag paths and a single trailing slash, never collapse arbitrary paths.
    const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const normalized = path
      .split("/")
      .map((part) => encodeURIComponent(decodeURIComponent(part)))
      .join("/");
    return (
      inventory[normalized] || {
        type: "notFound",
        title: "Page not found",
        description: "The requested page is not in this publication’s archive.",
      }
    );
  } catch {
    return {
      type: "notFound",
      title: "Page not found",
      description: "The requested URL is invalid.",
    };
  }
}
export function shouldHandleLink(event, link, origin, inventory) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    link.origin === origin &&
    !link.target &&
    !link.download &&
    !link.hash &&
    parseRoute(link.pathname, inventory).type !== "notFound"
  );
}
export function routeArticles(route, articles) {
  articles = articles.filter(isDiscoverable);
  if (route.type === "author")
    return articles.filter((a) => a.author_slug === route.slug);
  if (route.type === "tag")
    return articles.filter((a) =>
      a.tags.some((tag) => tag.toLowerCase() === route.tag.toLowerCase()),
    );
  if (route.type === "topic")
    return route.slugs
      .map((slug) => articles.find((a) => a.slug === slug))
      .filter(Boolean);
  if (route.type === "category")
    return articles.filter((a) => a.categoryPath === route.category);
  return articles;
}
