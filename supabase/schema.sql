-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (auto-created on auth signup)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'VND',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'e-wallet')),
  balance DECIMAL(15,2) DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT 'Circle',
  color TEXT DEFAULT '#6366f1',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL, -- for transfers
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  note TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('borrow', 'lend')),
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  note TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debt transactions (partial repayments)
CREATE TABLE IF NOT EXISTS debt_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  debt_id UUID REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Wallets policies
CREATE POLICY "Users can manage own wallets" ON wallets FOR ALL USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can view own and default categories" ON categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Debts policies
CREATE POLICY "Users can manage own debts" ON debts FOR ALL USING (auth.uid() = user_id);

-- Debt transactions policies
CREATE POLICY "Users can manage own debt transactions" ON debt_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM debts WHERE debts.id = debt_transactions.debt_id AND debts.user_id = auth.uid()
    )
  );

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, currency)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'VND'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle transaction and balance update atomically
CREATE OR REPLACE FUNCTION create_transaction(
  p_user_id UUID,
  p_wallet_id UUID,
  p_to_wallet_id UUID,
  p_amount DECIMAL,
  p_type TEXT,
  p_category_id UUID,
  p_note TEXT,
  p_date TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  INSERT INTO transactions (user_id, wallet_id, to_wallet_id, amount, type, category_id, note, date)
  VALUES (p_user_id, p_wallet_id, p_to_wallet_id, p_amount, p_type, p_category_id, p_note, p_date)
  RETURNING id INTO v_transaction_id;

  IF p_type = 'income' THEN
    UPDATE wallets SET balance = balance + p_amount WHERE id = p_wallet_id;
  ELSIF p_type = 'expense' THEN
    UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
  ELSIF p_type = 'transfer' THEN
    UPDATE wallets SET balance = balance - p_amount WHERE id = p_wallet_id;
    UPDATE wallets SET balance = balance + p_amount WHERE id = p_to_wallet_id;
  END IF;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete transaction and reverse balance
CREATE OR REPLACE FUNCTION delete_transaction(p_transaction_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tx transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id;

  IF v_tx.type = 'income' THEN
    UPDATE wallets SET balance = balance - v_tx.amount WHERE id = v_tx.wallet_id;
  ELSIF v_tx.type = 'expense' THEN
    UPDATE wallets SET balance = balance + v_tx.amount WHERE id = v_tx.wallet_id;
  ELSIF v_tx.type = 'transfer' THEN
    UPDATE wallets SET balance = balance + v_tx.amount WHERE id = v_tx.wallet_id;
    UPDATE wallets SET balance = balance - v_tx.amount WHERE id = v_tx.to_wallet_id;
  END IF;

  DELETE FROM transactions WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- DEFAULT CATEGORIES (icon = Lucide icon name string)
-- =====================
INSERT INTO categories (name, type, icon, color, is_default, user_id) VALUES
  ('Salary',        'income',  'Briefcase',   '#10b981', true, NULL),
  ('Freelance',     'income',  'Laptop',       '#6366f1', true, NULL),
  ('Investment',    'income',  'TrendingUp',   '#f59e0b', true, NULL),
  ('Gift',          'income',  'Gift',         '#ec4899', true, NULL),
  ('Other Income',  'income',  'DollarSign',   '#14b8a6', true, NULL),
  ('Food & Drink',  'expense', 'Utensils',     '#f97316', true, NULL),
  ('Transport',     'expense', 'Car',          '#3b82f6', true, NULL),
  ('Shopping',      'expense', 'ShoppingBag',  '#a855f7', true, NULL),
  ('Entertainment', 'expense', 'Gamepad2',     '#ec4899', true, NULL),
  ('Health',        'expense', 'HeartPulse',   '#ef4444', true, NULL),
  ('Education',     'expense', 'BookOpen',     '#6366f1', true, NULL),
  ('Utilities',     'expense', 'Zap',          '#f59e0b', true, NULL),
  ('Rent',          'expense', 'Home',         '#14b8a6', true, NULL),
  ('Other Expense', 'expense', 'CreditCard',   '#6b7280', true, NULL)
ON CONFLICT DO NOTHING;

-- =====================
-- SHOPEE INTEGRATION
-- =====================
CREATE TABLE IF NOT EXISTS shopee_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  partner_id TEXT NOT NULL,
  partner_key TEXT NOT NULL,
  shop_id BIGINT,
  shop_name TEXT,
  shop_logo TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_sandbox BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopee_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopee integration"
  ON shopee_integrations FOR ALL USING (auth.uid() = user_id);

-- =====================
-- MOMO INTEGRATION
-- =====================
CREATE TABLE IF NOT EXISTS momo_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  partner_code TEXT NOT NULL,
  access_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  phone TEXT NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  is_test BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE momo_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own momo integration"
  ON momo_integrations FOR ALL USING (auth.uid() = user_id);

-- =====================
-- SEPAY INTEGRATION
-- =====================
CREATE TABLE IF NOT EXISTS sepay_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  api_token TEXT NOT NULL,
  webhook_apikey TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sepay_bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sepay_account_id INTEGER NOT NULL,
  bank_short_name TEXT NOT NULL,
  bank_full_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder_name TEXT,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  since_id INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sepay_account_id)
);

ALTER TABLE sepay_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sepay_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sepay integration"
  ON sepay_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sepay bank accounts"
  ON sepay_bank_accounts FOR ALL USING (auth.uid() = user_id);
