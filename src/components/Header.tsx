import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';

const CATEGORIES = [
  { name: 'U.S.', path: 'us' },
  { name: 'World', path: 'world' },
  { name: 'Politics', path: 'politics' },
  { name: 'Business', path: 'business' },
  { name: 'Tech', path: 'tech' },
  { name: 'Health', path: 'health' },
  { name: 'Entertainment', path: 'entertainment' },
  { name: 'Sports', path: 'sports' },
  { name: 'Opinion', path: 'opinion' },
  { name: 'Lifestyle', path: 'lifestyle' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
              The Northstar Ledger
            </a>
          </div>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 rounded"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}

      <nav className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-6 py-2">
            {CATEGORIES.map((category) => (
              <li key={category.path}>
                <a
                  href={`/${category.path}`}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 uppercase tracking-wide"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ul className="space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category.path}>
                  <a
                    href={`/${category.path}`}
                    className="block text-lg font-medium text-gray-700 hover:text-primary-600 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
