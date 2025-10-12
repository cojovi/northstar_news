import { useEffect, useState } from 'react';
import { Facebook, Twitter, Link as LinkIcon, Clock } from 'lucide-react';
import type { Article } from '../types/article';
import { getArticleBySlug, getRelatedArticles } from '../lib/content';
import { ArticleCard } from './ArticleCard';
import { LoadingSpinner } from './LoadingSpinner';

interface ArticlePageProps {
  category: string;
  slug: string;
}

export function ArticlePage({ category, slug }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const articleData = getArticleBySlug(category, slug);
      if (articleData) {
        setArticle(articleData);

        const relatedArticles = getRelatedArticles(articleData, 4);
        setRelated(relatedArticles);

          const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: articleData.title,
            description: articleData.dek,
            image: articleData.hero_image,
            author: {
              '@type': 'Person',
              name: articleData.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'The Northstar Ledger',
              logo: {
                '@type': 'ImageObject',
                url: window.location.origin + '/logo.png',
              },
            },
            datePublished: articleData.published,
            dateModified: articleData.updated,
            articleSection: articleData.category,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': window.location.href,
            },
          };

          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.text = JSON.stringify(structuredData);
          document.head.appendChild(script);

          document.title = `${articleData.title} - The Northstar Ledger`;

          const metaOg = [
            { property: 'og:title', content: articleData.title },
            { property: 'og:description', content: articleData.dek },
            { property: 'og:image', content: articleData.hero_image },
            { property: 'og:url', content: window.location.href },
            { property: 'og:type', content: 'article' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: articleData.title },
            { name: 'twitter:description', content: articleData.dek },
            { name: 'twitter:image', content: articleData.hero_image },
          ];

          metaOg.forEach((meta) => {
            const element = document.createElement('meta');
            if ('property' in meta && meta.property) {
              element.setAttribute('property', meta.property);
            } else if ('name' in meta && meta.name) {
              element.setAttribute('name', meta.name);
            }
            element.setAttribute('content', meta.content);
            document.head.appendChild(element);
          });

        setLoading(false);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      setLoading(false);
    }
  }, [category, slug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950 transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-4 text-gray-900 dark:text-gray-50">Article Not Found</h1>
          <a href="/" className="text-aurora-600 dark:text-aurora-400 hover:text-aurora-700 dark:hover:text-aurora-300 underline transition-colors">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(article.published);
  const updatedDate = new Date(article.updated);
  const showUpdated = updatedDate > publishedDate;

  const shareUrl = window.location.href;
  const shareText = article.title;

  return (
    <article className="bg-white dark:bg-dark-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm">
          <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">
            Home
          </a>
          <span className="mx-2 text-gray-500">/</span>
          <a href={`/${article.categoryPath}`} className="text-gray-600 dark:text-gray-400 hover:text-aurora-600 dark:hover:text-aurora-400 capitalize transition-colors">
            {article.category}
          </a>
        </nav>

        <header className="mb-8">
          <span className="text-sm font-semibold text-aurora-600 dark:text-aurora-400 uppercase tracking-wider">
            {article.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mt-2 mb-4 text-gray-900 dark:text-gray-50">
            {article.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{article.dek}</p>

          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex-1">
              <a
                href={`/author/${article.author_slug}`}
                className="font-medium text-gray-800 dark:text-gray-200 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              >
                {article.author}
              </a>
              {article.location && (
                <>
                  <span className="mx-2 text-gray-500">•</span>
                  <span className="text-gray-600 dark:text-gray-400">{article.location}</span>
                </>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                <time dateTime={article.published}>
                  {publishedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  })}
                </time>
                {showUpdated && (
                  <>
                    <span>•</span>
                    <span>
                      Updated{' '}
                      {updatedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {article.reading_time} min read
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    '_blank',
                    'width=600,height=400'
                  );
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400"
                aria-label="Share on Facebook"
              >
                <Facebook size={20} />
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
                    '_blank',
                    'width=600,height=400'
                  );
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400"
                aria-label="Share on Twitter"
              >
                <Twitter size={20} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded transition-colors text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400"
                aria-label="Copy link"
              >
                <LinkIcon size={20} />
              </button>
            </div>
          </div>
        </header>

        <figure className="mb-8">
          <img src={article.hero_image} alt={article.title} className="w-full rounded-lg" />
          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400">{article.hero_credit}</figcaption>
        </figure>

        <div className="article-content prose prose-lg max-w-none text-gray-900 dark:text-gray-300">
          {article.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-dark-700">
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <a
                key={tag}
                href={`/tag/${tag}`}
                className="px-3 py-1 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        </footer>
      </div>

      {related.length > 0 && (
        <section className="bg-gray-50 dark:bg-dark-900 py-12 border-t border-gray-200 dark:border-dark-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold mb-6 text-gray-900 dark:text-gray-50">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.slug} article={relatedArticle} variant="standard" />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
