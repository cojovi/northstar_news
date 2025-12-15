import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ArticleStats {
  views: number;
  shares: number;
  reactions_love: number;
  reactions_insightful: number;
  reactions_hmm: number;
  reactions_laugh: number;
  reactions_bookmark: number;
}

export function useArticleStats(articleSlug: string) {
  const [stats, setStats] = useState<ArticleStats>({
    views: 0,
    shares: 0,
    reactions_love: 0,
    reactions_insightful: 0,
    reactions_hmm: 0,
    reactions_laugh: 0,
    reactions_bookmark: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from('article_stats')
        .select('*')
        .eq('article_slug', articleSlug)
        .maybeSingle();

      if (!error && data) {
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();

    const channel = supabase
      .channel(`article_stats:${articleSlug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'article_stats',
          filter: `article_slug=eq.${articleSlug}`,
        },
        (payload) => {
          if (payload.new) {
            setStats(payload.new as ArticleStats);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleSlug]);

  async function incrementStat(statName: keyof ArticleStats) {
    const { data } = await supabase
      .from('article_stats')
      .select('*')
      .eq('article_slug', articleSlug)
      .maybeSingle();

    if (data) {
      await supabase
        .from('article_stats')
        .update({ [statName]: (data[statName] as number) + 1 })
        .eq('article_slug', articleSlug);
    } else {
      await supabase
        .from('article_stats')
        .insert({ article_slug: articleSlug, [statName]: 1 });
    }
  }

  return { stats, loading, incrementStat };
}
