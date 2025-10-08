import type { Article, ArticleFrontMatter } from '../types/article';

const articleCache: Map<string, Article> = new Map();
let allArticles: Article[] | null = null;

function parseMarkdown(content: string): { frontMatter: ArticleFrontMatter; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    throw new Error('Invalid markdown format');
  }

  const [, frontMatterStr, body] = match;
  const frontMatter: Record<string, string | number | boolean | string[]> = {};

  frontMatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        frontMatter[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      } else if (value === 'true' || value === 'false') {
        frontMatter[key.trim()] = value === 'true';
      } else if (!isNaN(Number(value)) && value !== '') {
        frontMatter[key.trim()] = Number(value);
      } else {
        frontMatter[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });

  return { frontMatter: frontMatter as ArticleFrontMatter, body };
}

const modules = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

function loadAllArticles(): Article[] {
  const articles: Article[] = [];

  for (const [path, content] of Object.entries(modules)) {
    const categoryMatch = path.match(/content\/([^/]+)\//);
    if (!categoryMatch) continue;

    const category = categoryMatch[1];

    try {
      const { frontMatter, body } = parseMarkdown(content as string);

      if (frontMatter.status === 'published') {
        articles.push({
          ...frontMatter,
          content: body,
          categoryPath: category
        });
      }
    } catch (err) {
      console.error(`Failed to parse ${path}:`, err);
    }
  }

  articles.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  return articles;
}

export function getAllArticles(): Article[] {
  if (!allArticles) {
    allArticles = loadAllArticles();
  }
  return allArticles;
}

export function getArticleBySlug(category: string, slug: string): Article | null {
  const cacheKey = `${category}/${slug}`;

  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey)!;
  }

  const articles = getAllArticles();
  const article = articles.find(a => a.categoryPath === category && a.slug === slug);

  if (article) {
    articleCache.set(cacheKey, article);
  }

  return article || null;
}

export function getArticlesByCategory(category: string, limit?: number): Article[] {
  const articles = getAllArticles();
  const filtered = articles.filter(a => a.categoryPath === category);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getArticlesByTag(tag: string): Article[] {
  const articles = getAllArticles();
  return articles.filter(a => a.tags.includes(tag));
}

export function getArticlesByAuthor(authorSlug: string): Article[] {
  const articles = getAllArticles();
  return articles.filter(a => a.author_slug === authorSlug);
}

export function searchArticles(query: string): Article[] {
  const articles = getAllArticles();
  const lowerQuery = query.toLowerCase();

  return articles.filter(article => {
    return (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.dek.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      article.content.toLowerCase().includes(lowerQuery)
    );
  });
}

export function getTrendingArticles(limit: number = 8): Article[] {
  const articles = getAllArticles();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return articles
    .filter(a => new Date(a.published) > twoDaysAgo)
    .slice(0, limit);
}

export function getRelatedArticles(article: Article, limit: number = 4): Article[] {
  const articles = getAllArticles();

  const scored = articles
    .filter(a => a.slug !== article.slug)
    .map(a => {
      let score = 0;
      if (a.categoryPath === article.categoryPath) score += 3;
      const sharedTags = a.tags.filter(tag => article.tags.includes(tag)).length;
      score += sharedTags * 2;
      if (a.author_slug === article.author_slug) score += 1;
      return { article: a, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.article);
}

export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tagSet = new Set<string>();
  articles.forEach(article => {
    article.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export function getAllAuthors(): Set<string> {
  const articles = getAllArticles();
  const authorSet = new Set<string>();
  articles.forEach(article => {
    authorSet.add(article.author_slug);
  });
  return authorSet;
}
