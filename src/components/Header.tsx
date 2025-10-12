import { useState } from 'react';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { Logo } from './Logo';

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
  const { theme, toggleTheme } = useTheme();
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-dark-700 shadow-xl transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
              <Logo size="lg" showText={false} />
              <span className="ml-3 text-xl md:text-2xl font-serif font-bold tracking-tight text-gray-900 dark:text-gray-50">
                The Northstar Ledger
              </span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-dark-800 dark:hover:bg-dark-800 hover:bg-gray-100 rounded text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-dark-800 dark:hover:bg-dark-800 hover:bg-gray-100 rounded text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-850 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurora-500 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 transition-colors duration-200"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}

      <nav className="hidden lg:block border-b border-gray-200 dark:border-dark-800 bg-gray-50/50 dark:bg-dark-900/50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-6 py-2">
            {CATEGORIES.map((category) => (
              <li key={category.path}>
                <a
                  href={`/${category.path}`}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-aurora-600 dark:hover:text-aurora-400 uppercase tracking-wide transition-colors"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-850 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ul className="space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category.path}>
                  <a
                    href={`/${category.path}`}
                    className="block text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-aurora-600 dark:hover:text-aurora-400 py-2 transition-colors"
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
