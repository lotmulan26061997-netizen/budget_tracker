-- =============================================
-- Budget Tracker — Clean Re-installation
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Clean up old tables (CASCADE automatically drops attached triggers and policies)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- 2. Profiles table (user settings)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  target      NUMERIC     NOT NULL DEFAULT 20,
  start_date  DATE        NOT NULL DEFAULT '2026-11-02',
  num_periods INTEGER    NOT NULL DEFAULT 14,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Transactions table (with tx_date)
CREATE TABLE transactions (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_date    DATE          NOT NULL,
  type       TEXT          NOT NULL CHECK (type IN ('in', 'out', 'sv')),
  category   TEXT          NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note       TEXT          NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(user_id, tx_date);

-- 4. Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- Transactions policies
CREATE POLICY "transactions_select" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "transactions_update" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "transactions_delete" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- 5. Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Auto-update timestamp on profile changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Backfill profiles for existing users who already signed up
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
