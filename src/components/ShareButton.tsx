import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { useArticleStats } from '../hooks/useArticleStats';
import { showNotification } from '../lib/notifications';

interface ShareButtonProps {
  articleSlug: string;
  title: string;
  url: string;
}

export function ShareButton({ articleSlug, title, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { incrementStat } = useArticleStats(articleSlug);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-400 hover:text-white'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:bg-blue-700 hover:text-white'
    },
  ];

  async function handleShare(platform: string, shareUrl?: string) {
    await incrementStat('shares');

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    await handleShare('copy');
    showNotification('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-600 text-white hover:bg-aurora-700 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Share2 size={18} />
        <span className="font-medium">Share</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-200 dark:border-dark-700 p-2 z-50 min-w-[200px]">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Link2 size={18} />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy link'}</span>
            </button>

            <div className="border-t border-gray-200 dark:border-dark-700 my-2" />

            {shareLinks.map(({ name, icon: Icon, url: shareUrl, color }) => (
              <button
                key={name}
                onClick={() => handleShare(name.toLowerCase(), shareUrl)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${color}`}
              >
                <Icon size={18} />
                <span className="text-sm">{name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
