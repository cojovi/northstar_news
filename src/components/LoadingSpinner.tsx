import { Logo } from './Logo';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-950 transition-colors duration-200'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="animate-pulse mb-4">
        <Logo size="xl" showText={false} />
      </div>
      <div className="text-xl text-gray-600 dark:text-gray-300">{message}</div>
    </div>
  );
}
