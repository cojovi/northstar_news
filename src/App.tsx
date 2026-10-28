import { useState, useEffect } from "react";
import { ThemeProvider } from "./lib/ThemeContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { ArticlePage } from "./components/ArticlePage";
import { CategoryPage } from "./components/CategoryPage";
import { SearchPage } from "./components/SearchPage";
import { RoutePage } from "./components/RoutePage.js";
import { getAllArticles, getArticleBySlug } from "./lib/content";
import { routeInventory, parseRoute, shouldHandleLink } from "./lib/routes.js";
import { updateMetadata } from "./lib/metadata";
const articles = getAllArticles();
const inventory = routeInventory(articles);
function App() {
  const [location, setLocation] = useState(
    () => window.location.pathname + window.location.search,
  );
  const path = location.split("?")[0];
  const route = parseRoute(path, inventory);
  useEffect(() => {
    const sync = () =>
      setLocation(window.location.pathname + window.location.search);
    const handleClick = (e: MouseEvent) => {
      const anchor = e.target instanceof Element ? e.target.closest("a") : null;
      if (!anchor) return;
      const link = {
        origin: anchor.origin,
        pathname: anchor.pathname,
        hash: anchor.hash,
        target: anchor.target,
        download: anchor.hasAttribute("download"),
      };
      if (!shouldHandleLink(e, link, window.location.origin, inventory)) return;
      e.preventDefault();
      window.history.pushState({}, "", anchor.href);
      sync();
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", sync);
    document.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", handleClick);
    };
  }, []);
  useEffect(() => {
    updateMetadata(
      route,
      path,
      route.type === "article"
        ? getArticleBySlug(route.category!, route.slug!)
        : null,
    );
  }, [route, path]);
  const content =
    route.type === "home" ? (
      <HomePage />
    ) : route.type === "article" ? (
      <ArticlePage category={route.category!} slug={route.slug!} />
    ) : route.type === "category" ? (
      <CategoryPage category={route.category!} />
    ) : route.type === "search" ? (
      <SearchPage key={location} />
    ) : (
      <RoutePage route={route} articles={articles} />
    );
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors duration-200">
        <Header />
        <main>{content}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
export default App;
