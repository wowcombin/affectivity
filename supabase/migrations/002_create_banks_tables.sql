-- Создаем таблицу банков
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('revolut', 'uk', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу банковских аккаунтов
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  sort_code VARCHAR(20) NOT NULL,
  login_url TEXT NOT NULL,
  login_password VARCHAR(255) NOT NULL,
  pink_cards_daily_limit INTEGER DEFAULT 5,
  pink_cards_remaining INTEGER DEFAULT 5,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем тестовые данные
INSERT INTO banks (name, type) VALUES
  ('Test Bank', 'uk'),
  ('Revolut Bank', 'revolut'),
  ('Other Bank', 'other')
ON CONFLICT DO NOTHING;

-- Включаем RLS
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Создаем политики для банков
CREATE POLICY "CFO can manage banks" ON banks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'CFO')
    )
  );

-- Создаем политики для банковских аккаунтов
CREATE POLICY "CFO can manage bank accounts" ON bank_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'CFO')
    )
  );
