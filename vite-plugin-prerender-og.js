/**
 * Vite Plugin: Prerender OG Meta Tags
 * Generates static HTML files for each article with correct OG meta tags
 * so Facebook crawler can see them without executing JavaScript
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { SITE_URL, resolveSocialImage } from './src/lib/socialImage.js';

export default function prerenderOGPlugin() {
  return {
    name: 'vite-plugin-prerender-og',
    apply: 'build',
    
    async writeBundle(options) {
      const outDir = options.dir || 'dist';
      const contentDir = path.resolve(process.cwd(), 'content');
      const indexHtmlPath = path.join(outDir, 'index.html');
      
      if (!fs.existsSync(indexHtmlPath)) {
        throw new Error('index.html not found in build output; cannot prerender article metadata');
      }

      // Read the base index.html
      const baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      
      console.log('\n📄 Prerendering OG meta tags for articles...');
      
      // Get all markdown files
      const articles = getAllArticles(contentDir);
      let count = 0;
      
      for (const article of articles) {
        const route = `${article.category}/${article.slug}`;
        const htmlPath = path.join(outDir, route, 'index.html');
        
        // Create directory if it doesn't exist
        const htmlDir = path.dirname(htmlPath);
        if (!fs.existsSync(htmlDir)) {
          fs.mkdirSync(htmlDir, { recursive: true });
        }
        
        // Generate HTML with correct OG meta tags
        const articleHtml = generateArticleHTML(baseHtml, article, route);
        
        // Write the HTML file
        fs.writeFileSync(htmlPath, articleHtml, 'utf-8');
        count++;
      }
      
      fs.writeFileSync(indexHtmlPath, generateListingHTML(baseHtml, articles));
      for (const category of new Set(articles.map(article => article.category))) {
        const categoryDir = path.join(outDir, category);
        fs.mkdirSync(categoryDir, { recursive: true });
        fs.writeFileSync(path.join(categoryDir, 'index.html'), generateListingHTML(baseHtml, articles.filter(article => article.category === category), category));
      }
      console.log(`✓ Prerendered ${count} full articles, homepage and category indexes\n`);
    }
  };
}

/**
 * Get all published articles
 */
function getAllArticles(contentDir) {
  const articles = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const { data, content: body } = matter(content);
          
          if (data.status === 'published') {
            const relativePath = path.relative(contentDir, fullPath);
            const pathParts = relativePath.split(path.sep);
            const category = pathParts[0];
            const slug = data.slug || path.basename(fullPath, '.md');
            
            articles.push({
              ...data,
              content: body,
              category,
              slug,
              title: data.title || '',
              dek: data.dek || data.excerpt || '',
              hero_image: data.hero_image || '',
              thumbnail: data.thumbnail || data.hero_image || '',
            });
          }
        } catch (error) {
          throw new Error(`Error processing ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  scanDirectory(contentDir);
  return articles.sort((a, b) => new Date(b.published) - new Date(a.published));
}

/**
 * Generate HTML with article-specific OG meta tags
 */
export function generateArticleHTML(baseHtml, article, route) {
  const url = escapeHtml(`${SITE_URL}/${route}`);
  const image = escapeHtml(resolveSocialImage(article.hero_image));
  
  // Remove existing OG meta tags
  let html = baseHtml.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<title>[^<]*<\/title>/i, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  
  // Find the closing </head> tag
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    throw new Error('Could not find </head> for article metadata');
  }
  
  // Build new meta tags
  const ogTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(article.title)}" />
    <meta property="og:description" content="${escapeHtml(article.dek)}" />
    <meta property="og:site_name" content="The Northstar Ledger" />
    <meta property="og:image" content="${image}" />
    ${image.startsWith('https:') ? `<meta property="og:image:secure_url" content="${image}" />` : ''}
    <meta property="og:image:alt" content="${escapeHtml(article.title)}" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${escapeHtml(article.title)}" />
    <meta name="twitter:description" content="${escapeHtml(article.dek)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${escapeHtml(article.title)}" />
    
    <link rel="canonical" href="${url}" />
    <meta name="description" content="${escapeHtml(article.dek)}" />
    <title>${escapeHtml(article.title)} - The Northstar Ledger</title>
`;
  
  // Insert before </head>
  html = html.slice(0, headEndIndex) + ogTags + '    ' + html.slice(headEndIndex);
  
  const schema = {
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: article.title, description: article.dek,
    image: resolveSocialImage(article.hero_image),
    datePublished: article.published, dateModified: article.updated || article.published,
    author: { '@type': 'Person', name: article.author || 'The Northstar Ledger' },
    publisher: { '@type': 'Organization', name: 'The Northstar Ledger' },
    mainEntityOfPage: `${SITE_URL}/${route}`,
  };
  html = html.replace('</head>', `<script id="prerender-article-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script></head>`);
  const body = renderToStaticMarkup(React.createElement(ReactMarkdown, null, article.content || ''));
  return replaceRoot(html, `<main class="max-w-4xl mx-auto px-4 py-8"><article>
    <nav><a href="/">Home</a> / <a href="/${escapeHtml(article.category)}">${escapeHtml(article.category)}</a></nav>
    <header><h1 class="text-4xl font-serif font-bold mb-4">${escapeHtml(article.title)}</h1>
    <p class="text-xl mb-6">${escapeHtml(article.dek)}</p>
    <p>By ${escapeHtml(article.author)} <time datetime="${escapeHtml(article.published)}">${escapeHtml(article.published)}</time></p></header>
    <figure><img src="${image}" alt="${escapeHtml(article.title)}"/><figcaption>${escapeHtml(article.hero_credit)}</figcaption></figure>
    <div class="prose prose-lg max-w-none">${body}</div>
    </article></main>`);
}

function replaceRoot(html, body) {
  const root = /<div\s+id="root"\s*>\s*<\/div>/;
  if (!root.test(html)) throw new Error('Expected empty React root in build template');
  return html.replace(root, () => `<div id="root">${body}</div>`);
}

export function generateListingHTML(baseHtml, articles, category = '') {
  const title = category ? `${category} - The Northstar Ledger` : 'The Northstar Ledger';
  const url = `${SITE_URL}${category ? `/${category}` : '/'}`;
  let html = baseHtml.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace('</head>', `<link rel="canonical" href="${escapeHtml(url)}" /></head>`);
  return replaceRoot(html, `<main class="max-w-7xl mx-auto px-4 py-8"><nav><a href="/">Home</a></nav><h1 class="text-4xl font-serif font-bold">${escapeHtml(title)}</h1><section>${articles.map(article => `<article><h2><a href="/${escapeHtml(article.category)}/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.dek)}</p></article>`).join('\n')}</section></main>`);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
