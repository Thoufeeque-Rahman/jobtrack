-- ============================================================
-- Migration: 002_content_schema.sql
-- Adds the Content Studio tables to JobTrack
-- ============================================================

-- ─── ENUMs ───────────────────────────────────────────────────

CREATE TYPE content_type AS ENUM ('video', 'text', 'carousel', 'image');
CREATE TYPE content_platform AS ENUM ('linkedin', 'instagram', 'youtube', 'facebook', 'other');
CREATE TYPE content_status AS ENUM (
  'idea',
  'script',
  'recording',
  'editing',
  'ready',
  'scheduled',
  'published',
  'archived'
);

-- ─── TABLE ───────────────────────────────────────────────────

CREATE TABLE content_posts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,

  -- Core fields
  title           text        NOT NULL,
  description     text,
  content_type    content_type NOT NULL DEFAULT 'video',
  platform        content_platform NOT NULL DEFAULT 'linkedin',
  status          content_status   NOT NULL DEFAULT 'idea',

  -- Creative content
  idea            text,
  hook            text,
  script          text,
  caption         text,
  call_to_action  text,
  notes           text,

  -- Production checklist (9 explicit boolean columns — type-safe & queryable)
  checklist_idea_finalized    boolean NOT NULL DEFAULT false,
  checklist_hook_finalized    boolean NOT NULL DEFAULT false,
  checklist_script_completed  boolean NOT NULL DEFAULT false,
  checklist_video_recorded    boolean NOT NULL DEFAULT false,
  checklist_video_edited      boolean NOT NULL DEFAULT false,
  checklist_thumbnail_ready   boolean NOT NULL DEFAULT false,
  checklist_caption_ready     boolean NOT NULL DEFAULT false,
  checklist_cta_ready         boolean NOT NULL DEFAULT false,
  checklist_published         boolean NOT NULL DEFAULT false,

  -- Production assets
  recording_url   text,
  thumbnail_url   text,

  -- Publishing
  published_url   text,
  scheduled_at    timestamptz,
  published_at    timestamptz,

  -- Manual performance metrics
  views           integer     NOT NULL DEFAULT 0,
  likes           integer     NOT NULL DEFAULT 0,
  comments        integer     NOT NULL DEFAULT 0,
  shares          integer     NOT NULL DEFAULT 0,

  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────

CREATE INDEX idx_content_posts_user_id    ON content_posts(user_id);
CREATE INDEX idx_content_posts_status     ON content_posts(status);
CREATE INDEX idx_content_posts_platform   ON content_posts(platform);
CREATE INDEX idx_content_posts_created_at ON content_posts(created_at DESC);
CREATE INDEX idx_content_posts_scheduled  ON content_posts(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────

-- Reuses the set_updated_at() function already created in migration 001
CREATE TRIGGER set_content_posts_updated_at
  BEFORE UPDATE ON content_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own content posts
CREATE POLICY "content_posts: users own their rows"
  ON content_posts
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

