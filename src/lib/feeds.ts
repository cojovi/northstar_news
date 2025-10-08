import type { Article } from '../types/article';
import { getAllArticles } from './content';

export async function generateRSSFeed(): Promise<string> {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 50);

  const items = latestArticles
    .map((article) => {
      const url = `https://thenorthstarledger.com/${article.categoryPath}/${article.slug}`;
      const pubDate = new Date(article.published).toUTCString();

      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.dek}]]></description>
      <category>${article.category}</category>
      <author>${article.author}</author>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Northstar Ledger</title>
    <link>https://thenorthstarledger.com</link>
    <description>Independent journalism dedicated to informing public discourse</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://thenorthstarledger.com/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export async function generateAtomFeed(): Promise<string> {
  const articles = await getAllArticles();
  const latestArticles = articles.slice(0, 50);

  const entries = latestArticles
    .map((article) => {
      const url = `https://thenorthstarledger.com/${article.categoryPath}/${article.slug}`;
      const published = new Date(article.published).toISOString();
      const updated = new Date(article.updated).toISOString();

      return `
  <entry>
    <title>${article.title}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${article.dek}</summary>
    <author>
      <name>${article.author}</name>
    </author>
    <category term="${article.category}" />
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Northstar Ledger</title>
  <link href="https://thenorthstarledger.com/atom.xml" rel="self" />
  <link href="https://thenorthstarledger.com" />
  <id>https://thenorthstarledger.com</id>
  <updated>${new Date().toISOString()}</updated>
  <subtitle>Independent journalism dedicated to informing public discourse</subtitle>
  ${entries}
</feed>`;
}

export async function generateSitemap(): Promise<string> {
  const articles = await getAllArticles();

  const urls = articles
    .map((article) => {
      const url = `https://thenorthstarledger.com/${article.categoryPath}/${article.slug}`;
      const lastmod = new Date(article.updated).toISOString().split('T')[0];

      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const staticPages = ['', '/about', '/us', '/world', '/politics', '/business', '/tech', '/health', '/entertainment', '/sports', '/opinion', '/lifestyle', '/travel'];
  const staticUrls = staticPages
    .map((page) => {
      return `
  <url>
    <loc>https://thenorthstarledger.com${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.9'}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${urls}
</urlset>`;
}

export async function generateNewsSitemap(): Promise<string> {
  const articles = await getAllArticles();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const recentArticles = articles.filter(
    (article) => new Date(article.published) > twoDaysAgo
  );

  const urls = recentArticles
    .map((article) => {
      const url = `https://thenorthstarledger.com/${article.categoryPath}/${article.slug}`;
      const pubDate = new Date(article.published).toISOString();

      return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>The Northstar Ledger</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${article.title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${urls}
</urlset>`;
}
