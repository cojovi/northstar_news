#!/usr/bin/env node
/**
 * Sitemap Generator
 * Automatically generates multi-file sitemap structure from markdown files
 * Creates 4 files: sitemap index, post sitemap, section sitemap, page sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://thenorthstarledger.com'; // Canonical domain
const CONTENT_DIR = path.join(__dirname, '../content');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_INDEX_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const POST_SITEMAP_FILE = path.join(PUBLIC_DIR, 'post-sitemap.xml');
const SECTION_SITEMAP_FILE = path.join(PUBLIC_DIR, 'section-sitemap.xml');
const PAGE_SITEMAP_FILE = path.join(PUBLIC_DIR, 'page-sitemap.xml');
const RSS_FILE = path.join(PUBLIC_DIR, 'rss.xml');
const ATOM_FILE = path.join(PUBLIC_DIR, 'atom.xml');

// Category mapping from display names to URL paths
const CATEGORY_MAPPING = {
  'World News': 'world',
  'National News': 'us',
  'Politics': 'politics',
  'Business': 'business',
  'Technology': 'tech',
  'Sports': 'sports',
  'Entertainment': 'entertainment',
  'Health': 'health',
  'Lifestyle': 'lifestyle',
  'Travel': 'travel',
  'Opinion': 'opinion'
};

/**
 * Escape text for safe use in XML (RSS/Atom)
 */
function escapeXml(str) {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  try {
    const { data } = matter(content);
    return data;
  } catch (error) {
    console.warn(`⚠️  Error parsing frontmatter: ${error.message}`);
    return null;
  }
}

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract article data from markdown file
 */
function extractArticleData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(content);


    if (!frontmatter) {
      console.warn(`⚠️  No frontmatter found in: ${filePath}`);
      return null;
    }

    // Only include published articles
    if (frontmatter.status !== 'published') {
      return null;
    }

    return {
      slug: frontmatter.slug,
      category: frontmatter.category,
      updated: frontmatter.updated || frontmatter.published,
      published: frontmatter.published,
      title: frontmatter.title,
      dek: frontmatter.dek,
      author: frontmatter.author,
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Format date for sitemap
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Calculate priority based on article date
 */
function calculatePriority(article) {
  // Higher priority for recent articles
  const publishDate = new Date(article.published);
  const now = new Date();
  const daysSincePublished = (now - publishDate) / (1000 * 60 * 60 * 24);

  if (daysSincePublished < 7) return '1.0';
  if (daysSincePublished < 30) return '0.8';
  if (daysSincePublished < 90) return '0.6';
  return '0.5';
}

/**
 * Normalize category to URL path
 */
function normalizeCategoryPath(category) {
  return CATEGORY_MAPPING[category] || category.toLowerCase();
}

/**
 * Generate sitemap index (main sitemap.xml)
 */
function generateSitemapIndex(lastmod) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Post sitemap
  xml += '  <sitemap>\n';
  xml += `    <loc>${SITE_URL}/post-sitemap.xml</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // Section sitemap
  xml += '  <sitemap>\n';
  xml += `    <loc>${SITE_URL}/section-sitemap.xml</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '  </sitemap>\n';

  // Page sitemap
  xml += '  <sitemap>\n';
  xml += `    <loc>${SITE_URL}/page-sitemap.xml</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += '  </sitemap>\n';

  xml += '</sitemapindex>';

  return xml;
}

/**
 * Generate post sitemap (articles only)
 */
function generatePostSitemap(articles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  articles.forEach(article => {
    const categoryPath = normalizeCategoryPath(article.category);
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/${categoryPath}/${article.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(article.updated)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${calculatePriority(article)}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Generate section sitemap (category landing pages)
 */
function generateSectionSitemap(articles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Group articles by category and find most recent article in each
  const categoryMap = new Map();

  articles.forEach(article => {
    const categoryPath = normalizeCategoryPath(article.category);

    if (!categoryMap.has(categoryPath)) {
      categoryMap.set(categoryPath, article);
    } else {
      const existing = categoryMap.get(categoryPath);
      const existingDate = new Date(existing.updated);
      const currentDate = new Date(article.updated);

      if (currentDate > existingDate) {
        categoryMap.set(categoryPath, article);
      }
    }
  });

  // Generate URL entries for each category
  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  sortedCategories.forEach(([categoryPath, mostRecentArticle]) => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/${categoryPath}</loc>\n`;
    xml += `    <lastmod>${formatDate(mostRecentArticle.updated)}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Generate page sitemap (static pages)
 */
function generatePageSitemap() {
  const now = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <lastmod>${now}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';

  xml += '</urlset>';

  return xml;
}

/**
 * Generate RSS 2.0 feed (latest 50 articles)
 */
function generateRSSFeed(articles) {
  const latest = articles.slice(0, 50);
  const items = latest
    .map((article) => {
      const categoryPath = normalizeCategoryPath(article.category);
      const url = `${SITE_URL}/${categoryPath}/${article.slug}`;
      const pubDate = new Date(article.published).toUTCString();
      const title = escapeXml(article.title || '');
      const dek = escapeXml(article.dek || '');
      const category = escapeXml(article.category || '');
      const author = escapeXml(article.author || '');
      return `
    <item>
      <title><![CDATA[${article.title || ''}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.dek || ''}]]></description>
      <category>${category}</category>
      <author>${author}</author>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Northstar Ledger</title>
    <link>${SITE_URL}</link>
    <description>Independent journalism dedicated to informing public discourse</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

/**
 * Generate Atom feed (latest 50 articles)
 */
function generateAtomFeed(articles) {
  const latest = articles.slice(0, 50);
  const entries = latest
    .map((article) => {
      const categoryPath = normalizeCategoryPath(article.category);
      const url = `${SITE_URL}/${categoryPath}/${article.slug}`;
      const published = new Date(article.published).toISOString();
      const updated = new Date(article.updated).toISOString();
      const title = escapeXml(article.title || '');
      const dek = escapeXml(article.dek || '');
      const author = escapeXml(article.author || '');
      const category = escapeXml(article.category || '');
      return `
  <entry>
    <title>${title}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${published}</published>
    <updated>${updated}</updated>
    <summary>${dek}</summary>
    <author>
      <name>${author}</name>
    </author>
    <category term="${category}" />
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Northstar Ledger</title>
  <link href="${SITE_URL}/atom.xml" rel="self" />
  <link href="${SITE_URL}" />
  <id>${SITE_URL}</id>
  <updated>${new Date().toISOString()}</updated>
  <subtitle>Independent journalism dedicated to informing public discourse</subtitle>
  ${entries}
</feed>`;
}

/**
 * Main function
 */
function main() {
  console.log('🗺️  Generating sitemaps...\n');

  // Get all markdown files
  const markdownFiles = getMarkdownFiles(CONTENT_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown files`);

  // Extract article data
  const articles = markdownFiles
    .map(extractArticleData)
    .filter(Boolean) // Remove null entries
    .sort((a, b) => new Date(b.published) - new Date(a.published)); // Sort by date, newest first

  console.log(`✅ Processed ${articles.length} published articles\n`);


  if (articles.length === 0) {
    console.warn('⚠️  No published articles found!');
    return;
  }

  // Get most recent article date for sitemap index
  const mostRecentDate = formatDate(articles[0].updated);

  // Generate all sitemaps
  const sitemapIndex = generateSitemapIndex(mostRecentDate);
  const postSitemap = generatePostSitemap(articles);
  const sectionSitemap = generateSectionSitemap(articles);
  const pageSitemap = generatePageSitemap();

  // Write files
  fs.writeFileSync(SITEMAP_INDEX_FILE, sitemapIndex, 'utf-8');
  fs.writeFileSync(POST_SITEMAP_FILE, postSitemap, 'utf-8');
  fs.writeFileSync(SECTION_SITEMAP_FILE, sectionSitemap, 'utf-8');
  fs.writeFileSync(PAGE_SITEMAP_FILE, pageSitemap, 'utf-8');

  // Generate and write RSS and Atom feeds
  const rssXml = generateRSSFeed(articles);
  const atomXml = generateAtomFeed(articles);
  fs.writeFileSync(RSS_FILE, rssXml, 'utf-8');
  fs.writeFileSync(ATOM_FILE, atomXml, 'utf-8');

  // Calculate stats
  const categoryCount = new Set(articles.map(a => normalizeCategoryPath(a.category))).size;
  const pageCount = 1; // Currently only homepage
  const totalUrls = articles.length + categoryCount + pageCount;

  // Output results
  console.log('✅ Generated sitemap index: public/sitemap.xml');
  console.log(`✅ Generated post sitemap: public/post-sitemap.xml (${articles.length} articles)`);
  console.log(`✅ Generated section sitemap: public/section-sitemap.xml (${categoryCount} categories)`);
  console.log(`✅ Generated page sitemap: public/page-sitemap.xml (${pageCount} page)`);
  console.log('✅ Generated rss.xml');
  console.log('✅ Generated atom.xml');
  console.log(`\n📊 Total URLs: ${totalUrls}`);

  // Show recent articles
  console.log('\n📰 Most recent articles:');
  articles.slice(0, 5).forEach((article, index) => {
    const categoryPath = normalizeCategoryPath(article.category);
    console.log(`   ${index + 1}. ${categoryPath}/${article.slug}`);
  });

  console.log('\n🎉 Done!\n');
}

// Run the script
main();
