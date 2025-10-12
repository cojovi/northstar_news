# Automatic Sitemap Generation

This project includes automatic sitemap generation that updates whenever markdown files are added or modified.

## Overview

The sitemap generator:
- ✅ Automatically scans all markdown files in the `content/` directory
- ✅ Generates `public/sitemap.xml` with all published articles
- ✅ Includes homepage, category pages, and article pages
- ✅ Uses proper priorities and change frequencies for SEO
- ✅ Updates automatically during development and build
- ✅ Only includes articles with `status: published`

## How It Works

### Automatic Generation

The sitemap is automatically generated in these scenarios:

1. **During Development** (`npm run dev`)
   - Generated when dev server starts
   - Regenerates automatically when markdown files are added/changed
   - Uses Vite plugin with file watching

2. **During Build** (`npm run build`)
   - Generated before the build process
   - Ensures production has latest sitemap

3. **Manual Generation** (`npm run sitemap`)
   - Can be run manually anytime
   - Useful for testing or troubleshooting

### File Structure

The sitemap includes:

```
homepage (priority: 1.0)
├── category pages (priority: 0.9)
│   ├── business
│   ├── tech
│   ├── sports
│   ├── etc.
└── article pages (priority: 0.5-1.0, based on recency)
    ├── business/article-slug
    ├── tech/article-slug
    └── etc.
```

### Priority Calculation

Article priorities are automatically calculated based on publish date:
- **1.0** - Published within last 7 days (fresh content)
- **0.8** - Published within last 30 days (recent content)
- **0.6** - Published within last 90 days (moderately recent)
- **0.5** - Older than 90 days (archived content)

## Configuration

### Update Site URL

Edit `scripts/generate-sitemap.js` and change the `SITE_URL`:

```javascript
const SITE_URL = 'https://your-domain.com'; // Update this
```

Current setting: `https://northstar-news.vercel.app`

### Change Frequencies

You can adjust how often pages change in `scripts/generate-sitemap.js`:

```javascript
// Homepage
'changefreq>daily</changefreq'

// Category pages
'changefreq>daily</changefreq'

// Article pages
'changefreq>weekly</changefreq'
```

## Usage

### Run Development Server
```bash
npm run dev
```
Sitemap is generated automatically and updates on markdown changes.

### Build for Production
```bash
npm run build
```
Sitemap is generated before build.

### Generate Sitemap Manually
```bash
npm run sitemap
```

### Watch for Changes (Development)
```bash
node scripts/watch-sitemap.js
```
Useful if you want a standalone watcher.

## Output

### Generated Files

**`public/sitemap.xml`**
- Standard XML sitemap format
- Compatible with all search engines
- Automatically served at `/sitemap.xml`

**`public/robots.txt`**
- Tells search engines where the sitemap is
- Allows all search engines to crawl
- Sets crawl delay to 1 second

### Example Output

```bash
🗺️  Generating sitemap...

📄 Found 72 markdown files
✅ Processed 69 published articles

✅ Sitemap generated successfully!
📍 Location: /path/to/public/sitemap.xml
📊 Total URLs: 81
   - 1 homepage
   - 11 category pages
   - 69 article pages

📰 Most recent articles:
   1. business/article-slug
   2. tech/article-slug
   3. sports/article-slug
```

## Article Requirements

For an article to be included in the sitemap, it must have:

1. **Valid frontmatter** with YAML format
2. **status: published** (drafts are excluded)
3. **Required fields:**
   - `slug` - URL-friendly identifier
   - `category` - Article category
   - `published` - Publication date
   - `updated` - Last update date (optional, falls back to published)

### Example Frontmatter

```yaml
---
title: Article Title
slug: article-title
category: business
status: published
published: 2025-10-12T09:00:00.000Z
updated: 2025-10-12T10:00:00.000Z
---
```

## SEO Benefits

### For Search Engines

- ✅ **Faster indexing** - Search engines find new content quickly
- ✅ **Better crawling** - Organized structure helps crawlers
- ✅ **Change detection** - `lastmod` dates help identify updates
- ✅ **Priority hints** - Important pages get crawled first

### For Users

- ✅ **Fresh content** - New articles appear in search faster
- ✅ **Better rankings** - Proper SEO structure improves visibility
- ✅ **Up-to-date results** - Search engines know when content changes

## Troubleshooting

### Sitemap Not Generated

```bash
# Manually generate to see errors
npm run sitemap
```

Common issues:
- Missing `content/` directory
- Invalid markdown frontmatter
- No published articles

### Articles Missing from Sitemap

Check that the article has:
1. `status: published` in frontmatter
2. Valid YAML frontmatter structure
3. All required fields (slug, category, published)

### Wrong URLs in Sitemap

Update the `SITE_URL` in `scripts/generate-sitemap.js`

### Sitemap Not Updating

```bash
# Force regeneration
npm run sitemap

# Check file timestamp
ls -la public/sitemap.xml
```

## Verifying Sitemap

### Local Testing

1. Run development server: `npm run dev`
2. Visit: `http://localhost:5173/sitemap.xml`
3. Should see XML with all URLs

### Production Testing

1. Deploy to production
2. Visit: `https://your-domain.com/sitemap.xml`
3. Should see generated sitemap

### Submit to Search Engines

**Google Search Console:**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your property
3. Submit sitemap: `https://your-domain.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add your site
3. Submit sitemap: `https://your-domain.com/sitemap.xml`

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Generate | `npm run sitemap` | Manually generate sitemap |
| Dev | `npm run dev` | Start dev server (auto-generates) |
| Build | `npm run build` | Build for production (auto-generates) |
| Watch | `node scripts/watch-sitemap.js` | Watch files and regenerate |

## Files

| File | Purpose |
|------|---------|
| `scripts/generate-sitemap.js` | Main sitemap generator |
| `scripts/watch-sitemap.js` | File watcher for development |
| `vite-plugin-sitemap.js` | Vite plugin integration |
| `public/sitemap.xml` | Generated sitemap (do not edit) |
| `public/robots.txt` | Search engine instructions |

## Advanced Configuration

### Custom Priority Rules

Edit the `calculatePriority()` function in `scripts/generate-sitemap.js`:

```javascript
function calculatePriority(article) {
  // Custom logic here
  if (article.category === 'breaking-news') return '1.0';
  if (article.featured) return '0.9';
  return '0.5';
}
```

### Add Additional URLs

Edit the `generateSitemap()` function to add custom pages:

```javascript
// Add about page
xml += '  <url>\n';
xml += `    <loc>${SITE_URL}/about</loc>\n`;
xml += `    <lastmod>${now}</lastmod>\n`;
xml += '    <changefreq>monthly</changefreq>\n';
xml += '    <priority>0.7</priority>\n';
xml += '  </url>\n';
```

### Exclude Categories

Modify the category loop in `scripts/generate-sitemap.js`:

```javascript
const categories = [...new Set(articles.map(a => a.category))]
  .filter(cat => cat !== 'draft' && cat !== 'internal');
```

## Best Practices

1. **Keep URLs clean** - Use descriptive slugs
2. **Update regularly** - Commit sitemap with content changes
3. **Monitor coverage** - Check Search Console regularly
4. **Test locally** - Verify sitemap before deploying
5. **Use valid dates** - Ensure published/updated dates are correct

## Support

If you encounter issues:
1. Check script output for errors
2. Verify markdown frontmatter format
3. Ensure all required fields are present
4. Test with `npm run sitemap` for detailed output

## Resources

- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Central](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)

