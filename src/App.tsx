import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ArticlePage } from './components/ArticlePage';
import { CategoryPage } from './components/CategoryPage';
import { SearchPage } from './components/SearchPage';

type Route =
  | { type: 'home' }
  | { type: 'article'; category: string; slug: string }
  | { type: 'category'; category: string }
  | { type: 'search' }
  | { type: 'about' };

function parseRoute(): Route {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    return { type: 'home' };
  }

  if (path === '/search') {
    return { type: 'search' };
  }

  if (path === '/about') {
    return { type: 'about' };
  }

  const parts = path.split('/').filter(Boolean);

  if (parts.length === 1) {
    return { type: 'category', category: parts[0] };
  }

  if (parts.length === 2) {
    return { type: 'article', category: parts[0], slug: parts[1] };
  }

  return { type: 'home' };
}

function App() {
  const [route, setRoute] = useState<Route>(parseRoute());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setRoute(parseRoute());
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href && anchor.origin === window.location.origin) {
        const url = new URL(anchor.href);
        if (!url.pathname.startsWith('/api') && !anchor.hasAttribute('download')) {
          e.preventDefault();
          window.history.pushState({}, '', anchor.href);
          setRoute(parseRoute());
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  let content;

  switch (route.type) {
    case 'home':
      content = <HomePage />;
      break;
    case 'article':
      content = <ArticlePage category={route.category} slug={route.slug} />;
      break;
    case 'category':
      content = <CategoryPage category={route.category} />;
      break;
    case 'search':
      content = <SearchPage />;
      break;
    case 'about':
      content = (
        <div className="bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-serif font-bold mb-6">About The Northstar Ledger</h1>
            <div className="max-w-3xl">
              <p className="text-xl text-gray-800 leading-relaxed mb-6">
                The Northstar Ledger is committed to rigorous commentary, parody, and analysis that
                illuminates public narratives and challenges conventional thinking.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Founded on principles of independent journalism, we strive to present news and opinion
                that encourages readers to think critically about the information they consume. Our
                approach combines traditional reporting values with modern skepticism about received wisdom.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                While we maintain high editorial standards and fact-checking protocols, we believe that
                satire and sharp analysis serve an important role in democratic discourse. Our coverage
                spans politics, business, technology, culture, and society with a perspective that questions
                assumptions and highlights absurdities.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We invite readers to engage thoughtfully with our content and draw their own conclusions
                about the issues that shape our world.
              </p>
            </div>
          </div>
        </div>
      );
      break;
    default:
      content = <HomePage />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{content}</main>
      <Footer />
    </div>
  );
}

export default App;
