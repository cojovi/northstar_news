import { useEffect, useState } from 'react';
import type { Article } from '../types/article';
import { getArticlesByCategory } from '../lib/content';
import { ArticleCard } from './ArticleCard';

interface CategoryPageProps {
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  us: 'U.S. News',
  world: 'World',
  politics: 'Politics',
  business: 'Business',
  tech: 'Technology',
  health: 'Health',
  entertainment: 'Entertainment',
  sports: 'Sports',
  opinion: 'Opinion',
  lifestyle: 'Lifestyle',
  travel: 'Travel',
};

export function CategoryPage({ category }: CategoryPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const categoryArticles = getArticlesByCategory(category);
      setArticles(categoryArticles);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load category articles:', error);
      setLoading(false);
    }
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const remainingArticles = articles.slice(1);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 pb-4 border-b-4 border-gray-900">
            {CATEGORY_LABELS[category] || category}
          </h1>
        </header>

        {featuredArticle && (
          <section className="mb-12 pb-12 border-b border-gray-200">
            <ArticleCard article={featuredArticle} variant="hero" />
          </section>
        )}

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="standard" />
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No articles found in this category.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
