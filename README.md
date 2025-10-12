# The Northstar Ledger

npm run dev
https://github.com/cojovi/northstar_news/blob/main/public/ImplementNewCybersecurity.png?raw=true 

A professional, file-based news publication built with React, TypeScript, and Vite.

## Overview

The Northstar Ledger is a complete news website featuring:

- Professional, authoritative design inspired by major news outlets
- File-based content management (no database required)
- Full-text search functionality
- RSS/Atom feeds and sitemaps for SEO
- Structured data (NewsArticle schema) for Google News
- Responsive design optimized for all devices
- 60+ sample articles across 11 categories

## Content Model

### Article Front Matter

Every article is a Markdown file with YAML front matter containing these required fields:

```yaml
---
title: Article Title
dek: Short subheading or summary
slug: url-friendly-slug
category: us
tags: ['tag1', 'tag2', 'tag3']
author: Author Name
author_slug: author-name
published: 2025-10-01T10:00:00Z
updated: 2025-10-01T10:00:00Z
hero_image: https://example.com/image.jpg
hero_credit: Photo credit
thumbnail: https://example.com/thumbnail.jpg
excerpt: Brief excerpt for listings
reading_time: 5
location: City, State (optional)
status: published
is_satire: false
canonical_url: https://example.com/original (optional)
---

Article content goes here in Markdown format.
```

### Categories

Articles are organized in these directories under `/content`:

- `us` - U.S. News
- `world` - World News
- `politics` - Politics
- `business` - Business
- `tech` - Technology
- `health` - Health
- `entertainment` - Entertainment
- `sports` - Sports
- `opinion` - Opinion
- `lifestyle` - Lifestyle
- `travel` - Travel

## Adding a New Article

1. Navigate to the appropriate category folder in `/content`
2. Create a new `.md` file with a URL-friendly name (e.g., `my-article-title.md`)
3. Add the required front matter (see Content Model above)
4. Write your article content in Markdown below the front matter
5. Set `status: published` when ready to publish
6. Commit and push to deploy

### Example

```bash
# Create new article file
touch content/tech/ai-breakthrough-2025.md

# Edit the file with your editor
nano content/tech/ai-breakthrough-2025.md
```

## Images

You can use images in two ways:

1. **Remote URLs**: Link directly to images hosted elsewhere (Pexels, Unsplash, etc.)
2. **Local images**: Place images in `/public/images/` and reference as `/images/filename.jpg`

For remote images, ensure you have rights to use them. The mock content uses Pexels images which are free for commercial use.

## Running Locally

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Run type checking
npm run typecheck

# Lint code
npm run lint
```

## Building for Production

```bash
# Build the site
npm run build

# Preview production build
npm run preview
```

The build outputs to the `/dist` directory.

## Features

### Search

Full-text search across titles, descriptions, tags, and content. The search index is built at compile time for fast performance.

### RSS/Atom Feeds

Feed generation utilities are available in `/src/lib/feeds.ts`. In production, you would expose these as endpoints:

- `/rss.xml` - RSS 2.0 feed
- `/atom.xml` - Atom feed
- `/news-sitemap.xml` - Google News sitemap (last 48 hours)

### Automatic Sitemap Generation

The site automatically generates a sitemap that updates whenever markdown files are added or modified:

- **`/sitemap.xml`** - Automatically generated sitemap with all published articles
- **Auto-updates** - Regenerates during `npm run dev` and `npm run build`
- **SEO optimized** - Includes proper priorities and change frequencies
- **Real-time watching** - Detects new/modified articles during development

See [SITEMAP.md](SITEMAP.md) for detailed documentation.

**Quick commands:**
```bash
npm run sitemap    # Generate sitemap manually
npm run dev        # Auto-generates and watches for changes
npm run build      # Auto-generates before build
```

### SEO & Structured Data

Every article page includes:

- NewsArticle schema.org structured data
- Open Graph meta tags for social sharing
- Twitter Card meta tags
- Semantic HTML with proper heading hierarchy
- Sitemap generation for search engines

### Accessibility

- Semantic HTML5 elements
- Proper heading hierarchy
- Keyboard navigation support
- ARIA labels on interactive elements
- WCAG AA color contrast ratios

## Architecture

### File Structure

```
/content                 # Markdown content files
  /us, /world, etc.     # Category folders
/src
  /components           # React components
  /lib                  # Utilities and content loading
  /types                # TypeScript type definitions
  /data                 # Mock data and generators
/public                 # Static assets
/scripts                # Build scripts
```

### Key Files

- `src/lib/content.ts` - Content indexing and retrieval
- `src/lib/feeds.ts` - RSS/Atom/sitemap generation
- `src/App.tsx` - Client-side routing
- `scripts/generate-mock-content.js` - Mock article generator

## Deployment

This is a static site that can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Cloudflare Pages

### Build Configuration

The site uses Vite's static site generation. Content files are bundled at build time using Vite's `import.meta.glob` feature.

## Design Philosophy

The design prioritizes:

1. **Credibility**: Serif headlines, clean typography, professional layout
2. **Readability**: Generous spacing, optimal line lengths, clear hierarchy
3. **Performance**: Lazy loading, optimized images, minimal JavaScript
4. **Accessibility**: Semantic HTML, keyboard navigation, screen reader support

## Content Guidelines

### Writing Style

- Headlines: Clear, direct, newsworthy
- Dek: Expands on headline, provides context
- Body: Inverted pyramid structure, most important info first
- Length: 400-800 words for most articles
- Tone: Professional but engaging

### Satire Approach

The site is designed as satire but maintains a professional appearance. Satire should be:

- Subtle rather than obvious
- Detectable through close reading
- Not immediately apparent from design or presentation
- Marked with `is_satire: true` in front matter for internal tracking

## License

This project is provided as-is for demonstration purposes.

## Support

For questions or issues, please refer to the documentation in this README or examine the source code.
