import { useReadingProgress } from '../hooks/useReadingProgress';

interface ReadingProgressRingProps {
  wordsInArticle: number;
}

export function ReadingProgressRing({ wordsInArticle }: ReadingProgressRingProps) {
  const { progress, readingTime } = useReadingProgress();
  const estimatedReadTime = Math.ceil(wordsInArticle / 200);
  const remainingMinutes = Math.max(0, estimatedReadTime - Math.floor(readingTime / 60));

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative group">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-dark-700"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-aurora-600 dark:text-aurora-400 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 dark:bg-dark-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <div>{remainingMinutes} min left</div>
            <div className="text-gray-400 text-xs">{readingTime}s reading</div>
          </div>
        </div>
      </div>
    </div>
  );
}
