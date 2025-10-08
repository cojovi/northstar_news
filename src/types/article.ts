export interface ArticleFrontMatter {
  title: string;
  dek: string;
  slug: string;
  category: string;
  tags: string[];
  author: string;
  author_slug: string;
  published: string;
  updated: string;
  hero_image: string;
  hero_credit: string;
  thumbnail: string;
  excerpt: string;
  reading_time: number;
  location?: string;
  status: 'draft' | 'published';
  is_satire: boolean;
  canonical_url?: string;
}

export interface Article extends ArticleFrontMatter {
  content: string;
  categoryPath: string;
}

export interface AuthorInfo {
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
  twitter?: string;
  email?: string;
}

export interface LiveUpdate {
  id: string;
  timestamp: string;
  content: string;
  tags?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  published: string;
}

export interface PhotoEssay {
  id: string;
  title: string;
  image: string;
  caption: string;
  credit: string;
}
