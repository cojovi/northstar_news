import { getArticleBySlug, getRelatedArticles } from "../lib/content";
import { ArticleDocument } from "./ArticleDocument.js";
export function ArticlePage({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  const article = getArticleBySlug(category, slug);
  if (!article)
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1>Article not found</h1>
        <a href="/">Return home</a>
      </div>
    );
  return (
    <ArticleDocument
      article={article}
      related={getRelatedArticles(article, 4)}
    />
  );
}
