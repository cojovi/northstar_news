import { PublicLinks } from './RoutePage.js';
import { Logo } from './Logo';
import { getDiscoverableArticles } from '../lib/content';
const activeCategories = new Set(getDiscoverableArticles().map(a => a.categoryPath));

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Logo size="md" showText={false} />
            </div>
            <h3 className="text-aurora-600 dark:text-aurora-400 font-serif font-bold text-lg mb-3">The Northstar Ledger</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              News summaries, analysis and commentary. Owned by Cody Viveiros; shared ownership with PROTOCOL SENTINEL.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">Sections</h4>
            <ul className="space-y-2 text-sm">
              {['us', 'world', 'politics', 'business', 'tech'].filter(category => activeCategories.has(category)).map(category =>
                <li key={category}><a href={`/${category}`} className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">{category === 'us' ? 'U.S.' : category.charAt(0).toUpperCase() + category.slice(1)}</a></li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              {['opinion', 'sports', 'entertainment', 'lifestyle', 'health', 'travel'].filter(category => activeCategories.has(category)).map(category =>
                <li key={category}><a href={`/${category}`} className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">{category.charAt(0).toUpperCase() + category.slice(1)}</a></li>)}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">About Us</a></li>
              <li><a href="/rss.xml" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">RSS Feed</a></li>
              <li><a href="/contact" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Contact</a></li>
              <li><a href="/standards" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Editorial Standards</a></li>
              <li><a href="/privacy" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mb-8"><PublicLinks /></div>
        <div className="border-t border-gray-300 dark:border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-500">
          <p>&copy; {currentYear} The Northstar Ledger. All rights reserved.</p>
          <p className="mt-4 md:mt-0">A publication committed to rigorous commentary and analysis.</p>
        </div>
      </div>
    </footer>
  );
}
