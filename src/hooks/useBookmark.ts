import { useState, useEffect } from 'react';
import { supabase, getUserId } from '../lib/supabase';

export function useBookmark(articleSlug: string) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkBookmark() {
      const userId = getUserId();
      const { data } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('article_slug', articleSlug)
        .eq('user_id', userId)
        .maybeSingle();

      setIsBookmarked(!!data);
      setLoading(false);
    }

    checkBookmark();
  }, [articleSlug]);

  async function toggleBookmark() {
    const userId = getUserId();

    if (isBookmarked) {
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('article_slug', articleSlug)
        .eq('user_id', userId);

      const { data } = await supabase
        .from('article_stats')
        .select('reactions_bookmark')
        .eq('article_slug', articleSlug)
        .maybeSingle();

      if (data) {
        await supabase
          .from('article_stats')
          .update({ reactions_bookmark: Math.max(0, data.reactions_bookmark - 1) })
          .eq('article_slug', articleSlug);
      }

      setIsBookmarked(false);
    } else {
      await supabase
        .from('user_bookmarks')
        .insert({
          article_slug: articleSlug,
          user_id: userId,
        });

      const { data } = await supabase
        .from('article_stats')
        .select('*')
        .eq('article_slug', articleSlug)
        .maybeSingle();

      if (data) {
        await supabase
          .from('article_stats')
          .update({ reactions_bookmark: data.reactions_bookmark + 1 })
          .eq('article_slug', articleSlug);
      } else {
        await supabase
          .from('article_stats')
          .insert({ article_slug: articleSlug, reactions_bookmark: 1 });
      }

      setIsBookmarked(true);
    }

    return !isBookmarked;
  }

  return { isBookmarked, toggleBookmark, loading };
}
