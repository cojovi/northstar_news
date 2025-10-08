import type { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  variant?: 'hero' | 'featured' | 'standard' | 'compact';
  showImage?: boolean;
}

export function ArticleCard({ article, variant = 'standard', showImage = true }: ArticleCardProps) {
  const articleUrl = `/${article.categoryPath}/${article.slug}`;

  if (variant === 'hero') {
    return (
      <article className="group">
        <a href={articleUrl} className="block">
          {showImage && article.hero_image && (
            <div className="mb-4 overflow-hidden">
              <img
                src={article.hero_image}
                alt={article.title}
                className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
              {article.category}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight group-hover:text-primary-700 transition-colors">
              {article.title}
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{article.dek}</p>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="font-medium">{article.author}</span>
              <span>•</span>
              <time dateTime={article.published}>
                {new Date(article.published).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
          </div>
        </a>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="group flex gap-4 md:gap-6">
        {showImage && article.thumbnail && (
          <a href={articleUrl} className="flex-shrink-0">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-32 md:w-48 h-32 md:h-32 object-cover group-hover:opacity-90 transition-opacity"
            />
          </a>
        )}
        <div className="flex-1 space-y-2">
          <a href={articleUrl}>
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
              {article.category}
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-primary-700 transition-colors mt-1">
              {article.title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 line-clamp-2 mt-2">{article.dek}</p>
          </a>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{article.author}</span>
            <span>•</span>
            <time dateTime={article.published}>
              {new Date(article.published).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group border-b border-gray-200 pb-3 last:border-0">
        <a href={articleUrl} className="block space-y-1">
          <h4 className="text-base font-serif font-bold leading-snug group-hover:text-primary-700 transition-colors">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{article.author}</span>
            <span>•</span>
            <time dateTime={article.published}>
              {new Date(article.published).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
        </a>
      </article>
    );
  }

  return (
    <article className="group">
      <a href={articleUrl} className="block">
        {showImage && article.thumbnail && (
          <div className="mb-3 overflow-hidden">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
            {article.category}
          </span>
          <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-primary-700 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">{article.dek}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{article.author}</span>
            <span>•</span>
            <time dateTime={article.published}>
              {new Date(article.published).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </a>
    </article>
  );
}
