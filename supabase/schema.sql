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
  distance          TEXT NOT NULL,     -- '42.2K', '21.1K', '10K', '5K', etc.
  distance_meters   INTEGER,           -- for sorting (42200, 21100, 10000, 5000)

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

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- We use the service role key on the server so RLS is a safety net only.

ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_races ENABLE ROW LEVEL SECURITY;

-- Anyone can read public passports
CREATE POLICY "Public profiles are viewable" ON users
  FOR SELECT USING (true);

CREATE POLICY "Public race entries are viewable" ON user_races
  FOR SELECT USING (true);
