import { useEffect, useState } from 'react';
import type { Article } from '../types/article';
import { searchArticles } from '../lib/content';
import { ArticleCard } from './ArticleCard';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, []);

  function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const searchResults = searchArticles(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-6">Search</h1>
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </header>

        {loading && (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Searching...</div>
          </div>
        )}

        {!loading && searched && (
          <section>
            <p className="text-lg text-gray-700 mb-8">
              {results.length > 0
                ? `Found ${results.length} ${results.length === 1 ? 'article' : 'articles'} for "${query}"`
                : `No articles found for "${query}"`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((article) => (
                <ArticleCard key={article.slug} article={article} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
