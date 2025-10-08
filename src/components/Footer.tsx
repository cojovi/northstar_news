export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-serif font-bold text-xl mb-4">The Northstar Ledger</h3>
            <p className="text-sm text-gray-400">
              Independent journalism dedicated to informing the public discourse.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Sections</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/us" className="hover:text-white">U.S.</a></li>
              <li><a href="/world" className="hover:text-white">World</a></li>
              <li><a href="/politics" className="hover:text-white">Politics</a></li>
              <li><a href="/business" className="hover:text-white">Business</a></li>
              <li><a href="/tech" className="hover:text-white">Tech</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/opinion" className="hover:text-white">Opinion</a></li>
              <li><a href="/sports" className="hover:text-white">Sports</a></li>
              <li><a href="/entertainment" className="hover:text-white">Entertainment</a></li>
              <li><a href="/lifestyle" className="hover:text-white">Lifestyle</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/standards" className="hover:text-white">Editorial Standards</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} The Northstar Ledger. All rights reserved.</p>
          <p className="mt-4 md:mt-0">A publication committed to rigorous commentary and analysis.</p>
        </div>
      </div>
    </footer>
  );
}
