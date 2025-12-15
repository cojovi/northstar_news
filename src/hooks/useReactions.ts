import { useState, useEffect } from 'react';
import { supabase, getUserId } from '../lib/supabase';

export type ReactionType = 'love' | 'insightful' | 'hmm' | 'laugh' | 'bookmark';

export function useReactions(articleSlug: string) {
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserReactions() {
      const userId = getUserId();
      const { data } = await supabase
        .from('user_reactions')
        .select('reaction_type')
        .eq('article_slug', articleSlug)
        .eq('user_id', userId);

      if (data) {
        setUserReactions(new Set(data.map(r => r.reaction_type as ReactionType)));
      }
      setLoading(false);
    }

    fetchUserReactions();
  }, [articleSlug]);

  async function toggleReaction(reactionType: ReactionType, statKey: string) {
    const userId = getUserId();
    const hasReaction = userReactions.has(reactionType);

    if (hasReaction) {
      await supabase
        .from('user_reactions')
        .delete()
        .eq('article_slug', articleSlug)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType);

      const { data } = await supabase
        .from('article_stats')
        .select(statKey)
        .eq('article_slug', articleSlug)
        .maybeSingle();

      if (data) {
        await supabase
          .from('article_stats')
          .update({ [statKey]: Math.max(0, (data[statKey] as number) - 1) })
          .eq('article_slug', articleSlug);
      }

      setUserReactions(prev => {
        const next = new Set(prev);
        next.delete(reactionType);
        return next;
      });
    } else {
      await supabase
        .from('user_reactions')
        .insert({
          article_slug: articleSlug,
          user_id: userId,
          reaction_type: reactionType,
        });

      const { data } = await supabase
        .from('article_stats')
        .select('*')
        .eq('article_slug', articleSlug)
        .maybeSingle();

      if (data) {
        await supabase
          .from('article_stats')
          .update({ [statKey]: (data[statKey] as number) + 1 })
          .eq('article_slug', articleSlug);
      } else {
        await supabase
          .from('article_stats')
          .insert({ article_slug: articleSlug, [statKey]: 1 });
      }

      setUserReactions(prev => new Set([...prev, reactionType]));
    }

    return !hasReaction;
  }

  return { userReactions, toggleReaction, loading };
}
