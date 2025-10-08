import { useEffect, useState } from 'react';
import type { Article } from '../types/article';
import { getAllArticles, getArticlesByCategory, getTrendingArticles } from '../lib/content';
import { ArticleCard } from './ArticleCard';

export function HomePage() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const all = getAllArticles();
      setLatestArticles(all.slice(0, 10));

      const trendingList = getTrendingArticles(6);
      setTrending(trendingList);

      const categories = ['us', 'world', 'politics', 'business', 'tech', 'sports'];
      const categoryData: Record<string, Article[]> = {};

      for (const cat of categories) {
        const articles = getArticlesByCategory(cat, 5);
        categoryData[cat] = articles;
      }

      setCategoryArticles(categoryData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load content:', error);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const heroArticle = latestArticles[0];
  const secondaryArticles = latestArticles.slice(1, 3);
  const remainingLatest = latestArticles.slice(3);

  return (
    <div className="bg-white">
      {heroArticle && (
        <section className="border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ArticleCard article={heroArticle} variant="hero" />
              </div>
              <div className="space-y-6">
                {secondaryArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="featured" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-serif font-bold mb-6 pb-3 border-b-2 border-gray-900">
                Latest News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {remainingLatest.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="standard" />
                ))}
              </div>
            </div>

            <aside>
              <div className="sticky top-24">
                <h3 className="text-xl font-serif font-bold mb-4 pb-2 border-b-2 border-gray-900">
                  Trending
                </h3>
                <div className="space-y-4">
                  {trending.map((article) => (
                    <ArticleCard key={article.slug} article={article} variant="compact" showImage={false} />
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gray-50 border border-gray-200">
                  <h4 className="text-lg font-serif font-bold mb-3">Stay Informed</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Get the latest news delivered to your inbox.
                  </p>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded hover:bg-primary-700 transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {Object.entries(categoryArticles).map(([category, articles]) => {
        if (articles.length === 0) return null;

        const categoryLabels: Record<string, string> = {
          us: 'U.S. News',
          world: 'World',
          politics: 'Politics',
          business: 'Business',
          tech: 'Technology',
          sports: 'Sports'
        };

        return (
          <section key={category} className="py-8 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold pb-3 border-b-2 border-gray-900">
                  {categoryLabels[category]}
                </h2>
                <a
                  href={`/${category}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 uppercase tracking-wide"
                >
                  View All →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} variant="standard" />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
