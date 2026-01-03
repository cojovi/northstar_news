#!/usr/bin/env node
/**
 * OG Image Manifest Generator
 * Generates a JSON manifest mapping article routes to their metadata
 * for dynamic Open Graph image injection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONTENT_DIR = path.join(__dirname, '../content');
const PUBLIC_DIR = path.join(__dirname, '../public');
const INDEX_HTML = path.join(__dirname, '../index.html');
const MANIFEST_FILE = path.join(PUBLIC_DIR, 'og-manifest.json');

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate manifest from markdown files
 */
function generateManifest() {
  const manifest = {};
  const markdownFiles = getAllMarkdownFiles(CONTENT_DIR);

  for (const filePath of markdownFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);

      // Only include published articles
      if (data.status !== 'published') {
        continue;
      }

      // Extract category from path (e.g., content/politics/article.md -> politics)
      const relativePath = path.relative(CONTENT_DIR, filePath);
      const pathParts = relativePath.split(path.sep);
      const category = pathParts[0];
      const slug = path.basename(filePath, '.md');

      // Create route key (e.g., "politics/article-slug")
      const route = `${category}/${slug}`;

      // Extract needed metadata
      manifest[route] = {
        title: data.title || '',
        dek: data.dek || data.excerpt || '',
        hero_image: data.hero_image || '',
        thumbnail: data.thumbnail || data.hero_image || '',
        url: `https://thenorthstarledger.com/${route}`
      };
    } catch (error) {
      console.warn(`⚠️  Error processing ${filePath}: ${error.message}`);
    }
  }

  return manifest;
}

/**
 * Inject manifest into index.html as inline script
 */
function injectManifestIntoHTML(manifest) {
  if (!fs.existsSync(INDEX_HTML)) {
    console.warn('⚠️  index.html not found, skipping inline injection');
    return;
  }

  let html = fs.readFileSync(INDEX_HTML, 'utf-8');
  const manifestJson = JSON.stringify(manifest);
  const scriptTag = `<script id="og-manifest" type="application/json">${manifestJson}</script>`;

  // Remove existing manifest script if present
  html = html.replace(/<script id="og-manifest" type="application\/json">.*?<\/script>\s*/s, '');

  // Insert before closing </head> tag
  html = html.replace('</head>', `  ${scriptTag}\n  </head>`);

  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log('✓ Injected manifest into index.html');
}

/**
 * Main execution
 */
function main() {
  console.log('📝 Generating OG image manifest...');

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Generate manifest
  const manifest = generateManifest();

  // Write to file (for async loading fallback)
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Manifest saved to: ${MANIFEST_FILE}`);

  // Inject into index.html for synchronous access
  injectManifestIntoHTML(manifest);

  const articleCount = Object.keys(manifest).length;
  console.log(`✓ Generated manifest with ${articleCount} articles`);
}

main();

