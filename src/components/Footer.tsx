import { Logo } from './Logo';

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
              Independent journalism dedicated to informing the public discourse.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">Sections</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/us" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">U.S.</a></li>
              <li><a href="/world" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">World</a></li>
              <li><a href="/politics" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Politics</a></li>
              <li><a href="/business" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Business</a></li>
              <li><a href="/tech" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Tech</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/opinion" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Opinion</a></li>
              <li><a href="/sports" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Sports</a></li>
              <li><a href="/entertainment" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Entertainment</a></li>
              <li><a href="/lifestyle" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Lifestyle</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Contact</a></li>
              <li><a href="/standards" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Editorial Standards</a></li>
              <li><a href="/privacy" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-aurora-600 dark:hover:text-aurora-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-500">
          <p>&copy; {currentYear} The Northstar Ledger. All rights reserved.</p>
          <p className="mt-4 md:mt-0">A publication committed to rigorous commentary and analysis.</p>
        </div>
      </div>
    </footer>
  );
}
