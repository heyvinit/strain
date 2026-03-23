-- ─── Users ────────────────────────────────────────────────────────────────────
-- Created automatically on first Strava login

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strava_id    BIGINT UNIQUE NOT NULL,
  username     TEXT UNIQUE NOT NULL,  -- strava username → passport URL slug
  name         TEXT,
  avatar_url   TEXT,
  city         TEXT,
  country      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ─── User Race Passport Entries ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_races (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Race info
  race_name         TEXT NOT NULL,
  race_date         DATE,
  city              TEXT,
  country           TEXT,
  sport             TEXT NOT NULL DEFAULT 'running',  -- running, hyrox, triathlon, ocr, cycling, other
  distance          TEXT NOT NULL,     -- '42.2K', '21.1K', '10K', 'Singles', 'Full Ironman', etc.
  distance_meters   INTEGER,           -- for sorting (running only)

  -- Result
  net_time          TEXT,              -- 'H:MM:SS'
  gun_time          TEXT,
  pace              TEXT,
  bib_number        TEXT,
  overall_position  TEXT,
  category_position TEXT,
  category          TEXT,

  -- Meta
  result_url        TEXT,
  timing_platform   TEXT,
  status            TEXT DEFAULT 'completed' CHECK (status IN ('upcoming', 'completed')),
  is_pb             BOOLEAN DEFAULT FALSE,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_races_user_id ON user_races(user_id);
CREATE INDEX IF NOT EXISTS idx_user_races_status  ON user_races(status);

-- ─── Run Clubs ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS run_clubs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT,
  link        TEXT,
  slug        TEXT UNIQUE NOT NULL,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_run_clubs_slug ON run_clubs(slug);

CREATE TABLE IF NOT EXISTS run_club_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id    UUID REFERENCES run_clubs(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role       TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_run_club_members_user_id ON run_club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_run_club_members_club_id ON run_club_members(club_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- We use the service role key on the server so RLS is a safety net only.

ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_races ENABLE ROW LEVEL SECURITY;

-- Anyone can read public passports
CREATE POLICY "Public profiles are viewable" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public race entries are viewable" ON user_races
  FOR SELECT USING (true);
