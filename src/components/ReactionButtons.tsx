import { useState } from 'react';
import { Heart, Lightbulb, HelpCircle, Laugh } from 'lucide-react';
import { useReactions, ReactionType } from '../hooks/useReactions';
import { createParticle, updateParticle, Particle } from '../lib/particles';

interface ReactionButtonsProps {
  articleSlug: string;
}

const reactions = [
  { type: 'love' as ReactionType, icon: Heart, emoji: '❤️', label: 'Love', statKey: 'reactions_love' },
  { type: 'insightful' as ReactionType, icon: Lightbulb, emoji: '💡', label: 'Insightful', statKey: 'reactions_insightful' },
  { type: 'hmm' as ReactionType, icon: HelpCircle, emoji: '🤔', label: 'Hmm...', statKey: 'reactions_hmm' },
  { type: 'laugh' as ReactionType, icon: Laugh, emoji: '😂', label: 'Laugh', statKey: 'reactions_laugh' },
];

export function ReactionButtons({ articleSlug }: ReactionButtonsProps) {
  const { userReactions, toggleReaction } = useReactions(articleSlug);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);

  async function handleReaction(type: ReactionType, emoji: string, statKey: string, event: React.MouseEvent) {
    const added = await toggleReaction(type, statKey);

    if (added) {
      setAnimatingReaction(type);
      setTimeout(() => setAnimatingReaction(null), 300);

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        newParticles.push(createParticle(x, y, emoji));
      }
      setParticles(prev => [...prev, ...newParticles]);

      const animationInterval = setInterval(() => {
        setParticles(prev => {
          const updated = prev.map(updateParticle).filter(p => p.life > 0);
          if (updated.length === 0) {
            clearInterval(animationInterval);
          }
          return updated;
        });
      }, 16);
    }
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {reactions.map(({ type, icon: Icon, emoji, label, statKey }) => {
          const isActive = userReactions.has(type);
          const isAnimating = animatingReaction === type;

          return (
            <button
              key={type}
              onClick={(e) => handleReaction(type, emoji, statKey, e)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300
                ${isActive
                  ? 'bg-aurora-600 text-white border-aurora-600 scale-105'
                  : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-dark-600 hover:border-aurora-600 dark:hover:border-aurora-400'
                }
                ${isAnimating ? 'animate-bounce' : ''}
              `}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>

      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life,
            transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
            fontSize: '24px',
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </>
  );
}
