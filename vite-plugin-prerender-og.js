/**
 * Vite Plugin: Prerender OG Meta Tags
 * Generates static HTML files for each article with correct OG meta tags
 * so Facebook crawler can see them without executing JavaScript
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function prerenderOGPlugin() {
  return {
    name: 'vite-plugin-prerender-og',
    apply: 'build',
    
    async writeBundle(options, bundle) {
      const outDir = options.dir || 'dist';
      const contentDir = path.resolve(process.cwd(), 'content');
      const indexHtmlPath = path.join(outDir, 'index.html');
      
      if (!fs.existsSync(indexHtmlPath)) {
        console.warn('⚠️  index.html not found in dist, skipping OG prerender');
        return;
      }

      // Read the base index.html
      let baseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      
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
      
      console.log(`✓ Generated ${count} article HTML files with OG meta tags\n`);
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
          const { data } = matter(content);
          
          if (data.status === 'published') {
            const relativePath = path.relative(contentDir, fullPath);
            const pathParts = relativePath.split(path.sep);
            const category = pathParts[0];
            const slug = path.basename(fullPath, '.md');
            
            articles.push({
              category,
              slug,
              title: data.title || '',
              dek: data.dek || data.excerpt || '',
              hero_image: data.hero_image || '',
              thumbnail: data.thumbnail || data.hero_image || '',
            });
          }
        } catch (error) {
          console.warn(`⚠️  Error processing ${fullPath}: ${error.message}`);
        }
      }
    }
  }
  
  scanDirectory(contentDir);
  return articles;
}

/**
 * Generate HTML with article-specific OG meta tags
 */
function generateArticleHTML(baseHtml, article, route) {
  const url = `https://thenorthstarledger.com/${route}`;
  const image = article.hero_image || 'https://thenorthstarledger.com/og/default.jpg';
  
  // Remove existing OG meta tags
  let html = baseHtml.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<title>[^<]*<\/title>/i, '');
  
  // Find the closing </head> tag
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    console.warn('⚠️  Could not find </head> tag');
    return baseHtml;
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
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(article.title)}" />
    <meta property="og:locale" content="en_US" />
    
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${escapeHtml(article.title)}" />
    <meta name="twitter:description" content="${escapeHtml(article.dek)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${escapeHtml(article.title)}" />
    
    <title>${escapeHtml(article.title)} - The Northstar Ledger</title>
`;
  
  // Insert before </head>
  html = html.slice(0, headEndIndex) + ogTags + '    ' + html.slice(headEndIndex);
  
  return html;
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

