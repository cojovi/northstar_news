import { useEffect, useState } from 'react';
import { Eye, Share2, Heart } from 'lucide-react';
import { useArticleStats } from '../hooks/useArticleStats';

interface ArticleStatsProps {
  articleSlug: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value === displayValue) return;

    const duration = 1000;
    const steps = 30;
    const increment = (value - displayValue) / steps;
    const stepDuration = duration / steps;

    let current = displayValue;
    const interval = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value, displayValue]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function ArticleStats({ articleSlug }: ArticleStatsProps) {
  const { stats, loading } = useArticleStats(articleSlug);

  if (loading) {
    return (
      <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span>...</span>
        </div>
      </div>
    );
  }

  const totalReactions = stats.reactions_love + stats.reactions_insightful + stats.reactions_hmm + stats.reactions_laugh;

  return (
    <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <Eye size={16} />
        <AnimatedNumber value={stats.views} />
        <span>views</span>
      </div>
      {totalReactions > 0 && (
        <div className="flex items-center gap-2">
          <Heart size={16} />
          <AnimatedNumber value={totalReactions} />
          <span>reactions</span>
        </div>
      )}
      {stats.shares > 0 && (
        <div className="flex items-center gap-2">
          <Share2 size={16} />
          <AnimatedNumber value={stats.shares} />
          <span>shares</span>
        </div>
      )}
    </div>
  );
}
