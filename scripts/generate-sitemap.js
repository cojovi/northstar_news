#!/usr/bin/env node
/**
 * Sitemap Generator
 * Automatically generates sitemap.xml from markdown files in the content directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://northstar-news.vercel.app'; // Update with your actual domain
const CONTENT_DIR = path.join(__dirname, '../content');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value;
    }
  }

  return frontmatter;
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
 * Calculate priority based on category and date
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
 * Generate sitemap XML
 */
function generateSitemap(articles) {
  const now = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${SITE_URL}/</loc>\n`;
  xml += `    <lastmod>${now}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';

  // Category pages
  const categories = [...new Set(articles.map(a => a.category))];
  categories.forEach(category => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/${category}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>0.9</priority>\n';
    xml += '  </url>\n';
  });

  // Article pages
  articles.forEach(article => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}/${article.category}/${article.slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(article.updated)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += `    <priority>${calculatePriority(article)}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

/**
 * Main function
 */
function main() {
  console.log('🗺️  Generating sitemap...\n');

  // Get all markdown files
  const markdownFiles = getMarkdownFiles(CONTENT_DIR);
  console.log(`📄 Found ${markdownFiles.length} markdown files`);

  // Extract article data
  const articles = markdownFiles
    .map(extractArticleData)
    .filter(Boolean) // Remove null entries
    .sort((a, b) => new Date(b.published) - new Date(a.published)); // Sort by date, newest first

  console.log(`✅ Processed ${articles.length} published articles`);

  if (articles.length === 0) {
    console.warn('⚠️  No published articles found!');
    return;
  }

  // Generate sitemap
  const sitemap = generateSitemap(articles);

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf-8');

  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${OUTPUT_FILE}`);
  console.log(`📊 Total URLs: ${articles.length + 1 + [...new Set(articles.map(a => a.category))].length}`);
  console.log(`   - 1 homepage`);
  console.log(`   - ${[...new Set(articles.map(a => a.category))].length} category pages`);
  console.log(`   - ${articles.length} article pages`);

  // Show recent articles
  console.log('\n📰 Most recent articles:');
  articles.slice(0, 5).forEach((article, index) => {
    console.log(`   ${index + 1}. ${article.category}/${article.slug}`);
  });

  console.log('\n🎉 Done!\n');
}

// Run the script
main();

