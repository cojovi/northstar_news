/*
  # Article Engagement System

  1. New Tables
    - `article_stats`
      - `article_slug` (text, primary key) - Unique identifier for article
      - `views` (integer) - Total view count
      - `shares` (integer) - Total share count
      - `reactions_love` (integer) - Count of love reactions
      - `reactions_insightful` (integer) - Count of insightful reactions
      - `reactions_hmm` (integer) - Count of hmm reactions
      - `reactions_laugh` (integer) - Count of laugh reactions
      - `reactions_bookmark` (integer) - Count of bookmarks
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `user_reactions`
      - `id` (uuid, primary key) - Unique identifier
      - `article_slug` (text) - Reference to article
      - `user_id` (text) - Anonymous user identifier (browser fingerprint)
      - `reaction_type` (text) - Type of reaction (love, insightful, hmm, laugh, bookmark)
      - `created_at` (timestamptz) - Creation timestamp

    - `user_bookmarks`
      - `id` (uuid, primary key) - Unique identifier
      - `article_slug` (text) - Reference to article
      - `user_id` (text) - Anonymous user identifier
      - `created_at` (timestamptz) - Creation timestamp

    - `article_views`
      - `id` (uuid, primary key) - Unique identifier
      - `article_slug` (text) - Reference to article
      - `user_id` (text) - Anonymous user identifier (browser fingerprint)
      - `view_duration` (integer) - Time spent on article in seconds
      - `scroll_depth` (integer) - Percentage of article scrolled (0-100)
      - `created_at` (timestamptz) - View timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access for article_stats
    - Public insert/read for user engagement tables (anonymous users)

  3. Indexes
    - article_slug indexes for fast lookups
    - user_id indexes for user-specific queries
    - Composite indexes for common query patterns
*/

-- Create article_stats table
CREATE TABLE IF NOT EXISTS article_stats (
  article_slug text PRIMARY KEY,
  views integer DEFAULT 0,
  shares integer DEFAULT 0,
  reactions_love integer DEFAULT 0,
  reactions_insightful integer DEFAULT 0,
  reactions_hmm integer DEFAULT 0,
  reactions_laugh integer DEFAULT 0,
  reactions_bookmark integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_reactions table
CREATE TABLE IF NOT EXISTS user_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  user_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('love', 'insightful', 'hmm', 'laugh', 'bookmark')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_slug, user_id, reaction_type)
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  user_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_slug, user_id)
);

-- Create article_views table
CREATE TABLE IF NOT EXISTS article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  user_id text NOT NULL,
  view_duration integer DEFAULT 0,
  scroll_depth integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_article_stats_slug ON article_stats(article_slug);
CREATE INDEX IF NOT EXISTS idx_user_reactions_article ON user_reactions(article_slug);
CREATE INDEX IF NOT EXISTS idx_user_reactions_user ON user_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reactions_composite ON user_reactions(article_slug, user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_article ON user_bookmarks(article_slug);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_slug);
CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id);

-- Enable RLS
ALTER TABLE article_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for article_stats (public read)
CREATE POLICY "Anyone can read article stats"
  ON article_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert article stats"
  ON article_stats FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update article stats"
  ON article_stats FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_reactions (public insert/read)
CREATE POLICY "Anyone can read reactions"
  ON user_reactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert reactions"
  ON user_reactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete own reactions"
  ON user_reactions FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for user_bookmarks (public insert/read)
CREATE POLICY "Anyone can read bookmarks"
  ON user_bookmarks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert bookmarks"
  ON user_bookmarks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete bookmarks"
  ON user_bookmarks FOR DELETE
  TO anon, authenticated
  USING (true);

-- RLS Policies for article_views (public insert/read)
CREATE POLICY "Anyone can read views"
  ON article_views FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert views"
  ON article_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create function to update article stats updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_article_stats_timestamp ON article_stats;
CREATE TRIGGER update_article_stats_timestamp
  BEFORE UPDATE ON article_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_article_stats_updated_at();