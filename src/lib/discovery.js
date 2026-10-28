import { SITE_URL } from "./socialImage.js";
import { canonicalUrl, isDiscoverable } from "./authority.js";
export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
export function sitemap(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(({ url, updated }) => `\n<url><loc>${escapeXml(url)}</loc>${updated ? `<lastmod>${escapeXml(updated)}</lastmod>` : ""}</url>`).join("")}\n</urlset>`;
}
export function rssFeed(articles) {
  const latest = articles.filter((a) => a.status === "published" && isDiscoverable(a)).slice(0, 50);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>The Northstar Ledger</title><link>${SITE_URL}/</link><description>News summaries, analysis and commentary with visible evidence limits.</description><language>en-us</language><atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${latest.map((a) => `\n<item><title>${escapeXml(a.title)}</title><link>${escapeXml(canonicalUrl(a))}</link><guid isPermaLink="true">${escapeXml(canonicalUrl(a))}</guid><pubDate>${new Date(a.published).toUTCString()}</pubDate><description>${escapeXml(a.dek)} — ${a.evidence.status === "pending" ? "Source review pending." : "See dated source review and limits."}${a.affiliated ? " Affiliated coverage; important claims not substantiated in the existing source record." : ""}</description><category>${escapeXml(a.category)}</category><dc:creator>${escapeXml(a.author)}${a.authorProfile.kind === "legacy" ? " (legacy attribution; identity unverified)" : ""}</dc:creator></item>`).join("")}\n</channel></rss>`;
}
export function atomFeed(articles) {
  const latest = articles.filter((a) => a.status === "published" && isDiscoverable(a)).slice(0, 50);
  const updated = latest.reduce(
    (max, a) => (Date.parse(a.updated) > Date.parse(max) ? a.updated : max),
    latest[0]?.updated || "1970-01-01T00:00:00Z",
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>The Northstar Ledger</title><id>${SITE_URL}/</id><link href="${SITE_URL}/atom.xml" rel="self"/><link href="${SITE_URL}/"/><updated>${escapeXml(updated)}</updated>${latest.map((a) => `\n<entry><title>${escapeXml(a.title)}</title><id>${escapeXml(canonicalUrl(a))}</id><link href="${escapeXml(canonicalUrl(a))}"/><published>${escapeXml(a.published)}</published><updated>${escapeXml(a.updated)}</updated><summary>${escapeXml(a.dek)} — ${a.evidence.status === "pending" ? "Source review pending." : "See dated source review and limits."}${a.affiliated ? " Affiliated coverage; important claims not substantiated in the existing source record." : ""}</summary><author><name>${escapeXml(a.author)}${a.authorProfile.kind === "legacy" ? " (legacy attribution; identity unverified)" : ""}</name><uri>${SITE_URL}/author/${a.author_slug}</uri></author><category term="${escapeXml(a.category)}"/></entry>`).join("")}\n</feed>`;
}
