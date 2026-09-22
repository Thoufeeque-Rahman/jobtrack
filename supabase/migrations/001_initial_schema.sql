-- ============================================================
-- JobTrack — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE opportunity_status AS ENUM (
  'discovered',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'accepted',
  'withdrawn',
  'other'
);

CREATE TYPE opportunity_priority AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE interaction_direction AS ENUM (
  'outgoing',
  'incoming'
);

CREATE TYPE interaction_platform AS ENUM (
  'linkedin',
  'email',
  'phone',
  'whatsapp',
  'in_person',
  'other'
);

CREATE TYPE interaction_type AS ENUM (
  'dm',
  'email',
  'call',
  'meeting',
  'application',
  'follow_up',
  'recruiter_contact',
  'offer',
  'rejection',
  'other'
);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE companies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  website     text,
  industry    text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_user_id ON companies(user_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================

CREATE TABLE opportunities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id      uuid REFERENCES companies(id) ON DELETE SET NULL,
  title           text NOT NULL,
  status          opportunity_status NOT NULL DEFAULT 'discovered',
  custom_status   text,                          -- used when status = 'other'
  priority        opportunity_priority NOT NULL DEFAULT 'medium',
  url             text,
  salary_range    text,
  location        text,
  notes           text,
  next_action     text,
  follow_up_date  date,
  applied_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_follow_up_date ON opportunities(follow_up_date);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own opportunities"
  ON opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities"
  ON opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- CONTACTS
-- ============================================================

CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id    uuid REFERENCES companies(id) ON DELETE SET NULL,
  name          text NOT NULL,
  role          text,
  email         text,
  linkedin_url  text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- INTERACTIONS
-- ============================================================

CREATE TABLE interactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id  uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  platform        interaction_platform NOT NULL DEFAULT 'linkedin',
  interaction_type interaction_type NOT NULL DEFAULT 'dm',
  direction       interaction_direction NOT NULL DEFAULT 'outgoing',
  content         text,
  notes           text,
  interacted_at   timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_opportunity_id ON interactions(opportunity_id);
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_interacted_at ON interactions(interacted_at DESC);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger helper
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
