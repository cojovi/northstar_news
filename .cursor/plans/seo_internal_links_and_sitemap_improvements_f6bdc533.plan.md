---
name: SEO Internal Links and Sitemap Improvements
overview: Enhance SEO by adding internal links throughout the site and fixing sitemap lastmod to use actual file modification times instead of stale frontmatter dates.
todos:
  - id: sitemap-lastmod
    content: Fix sitemap lastmod to use file modification time (mtime) instead of stale frontmatter dates
    status: pending
  - id: internal-links-utility
    content: Create processInternalLinks() function in content.ts to auto-detect and link article mentions
    status: pending
  - id: article-content-links
    content: Apply internal link processing in ArticlePage component when rendering content
    status: pending
  - id: homepage-recent
    content: Add 'Recently Published' section to HomePage to ensure new articles are always linked
    status: pending
  - id: category-crosslinks
    content: Add related categories and cross-linking to CategoryPage component
    status: pending
  - id: article-script-links
    content: Update create_article.py prompts to instruct AI to include manual markdown links in generated content
    status: pending
---

# SEO Internal Links and Sitemap Improvements

## Problem Analysis

**Current State:**

- Articles are linked from homepage/category pages via ArticleCard components
- Article content is plain text with no internal links
- Sitemap uses frontmatter `updated` field which may never change, causing Google to see stale dates
- New articles may not always appear on homepage if they're not in the "latest 10" or "trending"

**Goals:**

1. Add internal links within article content (automatic + manual)
2. Ensure new articles are always discoverable via links
3. Fix sitemap lastmod to reflect actual file modification times

## Implementation Plan

### 1. Fix Sitemap lastmod (scripts/generate-sitemap.js)

**Current Issue:** Uses `article.updated` from frontmatter, which may be stale.

**Solution:** Use file system modification time (mtime) as source of truth:

- Use `fs.statSync(filePath).mtime` to get actual file modification time
- Compare mtime with frontmatter `updated` field
- Use the more recent date for lastmod
- This ensures Google sees updates when files are actually modified

**Changes:**

- Modify `extractArticleData()` to return file path
- Add `getFileModificationTime(filePath)` function
- Update `generateSitemap()` to use max(mtime, frontmatter.updated) for lastmod
- Update category page lastmod to use most recent article's lastmod in that category

### 2. Add Internal Links in Article Content (src/components/ArticlePage.tsx)

**Approach A - Automatic Detection:**

- Create utility function `addInternalLinks(content, articles)` in `src/lib/content.ts`
- Parse article content and detect mentions of other article titles
- Convert mentions to markdown links [`title`](/category/slug)
- Apply this transformation when rendering article content

**Approach B - Manual Links in Generation:**

- Update `create_article.py` prompts to instruct AI to include markdown links to related articles
- AI should naturally link to related topics when writing
- Example: "As discussed in [previous article](/tech/bitcoin-analysis), cryptocurrency..."

**Implementation:**

- Add `processInternalLinks(content: string): string` function in `content.ts`
- Use article title matching (fuzzy matching for variations)
- Limit to 3-5 internal links per article to avoid over-optimization
- Apply in ArticlePage component before rendering content

### 3. Enhance Homepage Linking (src/components/HomePage.tsx)

**Current:** Shows latest 10 articles, trending 6, category samples

**Enhancements:**

- Add "Recently Published" section that always shows newest articles (last 24-48 hours)
- Ensure all new articles appear somewhere on homepage within first 24 hours
- Add "More from [Category]" links that point to category pages
- Add "Related Topics" section linking to articles with shared tags

### 4. Improve Category Page Cross-Linking (src/components/CategoryPage.tsx)

**Enhancements:**

- Add "Related Categories" section at bottom
- Show articles from related categories (e.g., tech → business if they share tags)
- Add "See also" links to other category pages

### 5. Article Creation Script Updates (content/create_article.py)

**Add to prompts:**

- Instruct AI to include 2-3 internal markdown links to related articles when writing
- Format: [`link text`](/category/slug)
- Link to articles from same category or with shared tags when contextually relevant

## Files to Modify

1. **scripts/generate-sitemap.js**

- Add file mtime detection
- Update lastmod calculation logic
- Update category page lastmod

2. **src/lib/content.ts**

- Add `processInternalLinks()` function
- Add `getRecentArticles(hours: number)` helper

3. **src/components/ArticlePage.tsx**

- Apply internal link processing to article content
- Enhance related articles section

4. **src/components/HomePage.tsx**

- Add "Recently Published" section
- Improve cross-linking

5. **src/components/CategoryPage.tsx**

- Add related categories section
- Improve cross-linking

6. **content/create_article.py**

- Update article generation prompts to include internal link instructions

## Testing Considerations

- Verify sitemap lastmod updates when files are modified
- Test internal link detection accuracy
- Ensure links don't break with special characters in titles
- Verify homepage always shows new articles
- Check that internal links improve crawlability