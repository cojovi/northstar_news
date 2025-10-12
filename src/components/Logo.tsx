import { useTheme } from '../lib/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-16',
};

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const { theme } = useTheme();

  const logoSrc = theme === 'dark'
    ? '/northstar_logo_dark.png'
    : '/northstar_logo_light.png';

  const fallbackSrc = '/northstar_logo_dark.png';

  if (!showText) {
    return (
      <img
        src={logoSrc}
        alt="The Northstar Ledger"
        className={`${sizeClasses[size]} w-auto object-contain ${className}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="The Northstar Ledger Logo"
        className={`${sizeClasses[size]} w-auto object-contain transition-opacity duration-200`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
      <span className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-900 dark:text-gray-50">
        The Northstar Ledger
      </span>
    </div>
  );
}
