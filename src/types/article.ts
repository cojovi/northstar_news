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
  status: "draft" | "published" | "withdrawn" | "review-hold";
  indexable: boolean;
  is_satire: boolean;
  canonical_url?: string;
  editorial_notices?: boolean;
}

export interface AuthorProfile {
  name: string;
  slug: string;
  kind: "person" | "organization" | "legacy";
  bio: string;
  url?: string;
}
export interface Article extends ArticleFrontMatter {
  authorProfile: AuthorProfile;
  content_type: "news" | "analysis" | "opinion" | "satire" | "sponsored";
  evidence: {
    status: "pending" | "reviewed" | "partial";
    completed_full_factcheck: boolean;
    sources: string[];
    summary: string;
    limits: string;
    record_url: string | null;
    reviewed_at: string | null;
  };
  affiliated: boolean;
  review_kind: string;
  review_notice: string;
  corrections: { date: string; note: string; url: string | null }[];
  hero_alt: string;
  hero_width?: number;
  hero_height?: number;
  image_credit_status: string;
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
