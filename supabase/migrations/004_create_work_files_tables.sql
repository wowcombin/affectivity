-- Создание таблицы рабочих записей
CREATE TABLE IF NOT EXISTS work_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  casino_name TEXT NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  withdrawal_amount DECIMAL(10,2) NOT NULL,
  card_number TEXT NOT NULL,
  card_expiry TEXT NOT NULL,
  card_cvv TEXT NOT NULL,
  account_username TEXT NOT NULL,
  account_password TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('pink', 'gray')),
  bank_name TEXT NOT NULL,
  withdrawal_status TEXT NOT NULL DEFAULT 'new' CHECK (withdrawal_status IN ('new', 'sent', 'received', 'problem', 'blocked')),
  issue_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы черновиков
CREATE TABLE IF NOT EXISTS draft_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('excel', 'google_sheets')),
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы тестовых сайтов
CREATE TABLE IF NOT EXISTS test_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  casino_name TEXT NOT NULL,
  promo_link TEXT NOT NULL,
  card_bins TEXT[] NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  withdrawal_time INTEGER NOT NULL DEFAULT 0,
  withdrawal_time_unit TEXT NOT NULL DEFAULT 'instant' CHECK (withdrawal_time_unit IN ('instant', 'minutes', 'hours')),
  manual TEXT,
  status TEXT NOT NULL DEFAULT 'testing' CHECK (status IN ('active', 'processing', 'testing')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы тестовых записей
CREATE TABLE IF NOT EXISTS test_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  casino_name TEXT NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  withdrawal_amount DECIMAL(10,2) NOT NULL,
  card_number TEXT NOT NULL,
  card_expiry TEXT NOT NULL,
  card_cvv TEXT NOT NULL,
  account_username TEXT NOT NULL,
  account_password TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('pink', 'gray')),
  bank_name TEXT NOT NULL,
  withdrawal_status TEXT NOT NULL DEFAULT 'new' CHECK (withdrawal_status IN ('new', 'sent', 'received', 'problem', 'blocked')),
  issue_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_work_entries_user_id ON work_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_work_entries_created_at ON work_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_work_entries_withdrawal_status ON work_entries(withdrawal_status);

CREATE INDEX IF NOT EXISTS idx_draft_files_user_id ON draft_files(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_files_created_at ON draft_files(created_at);

CREATE INDEX IF NOT EXISTS idx_test_sites_status ON test_sites(status);
CREATE INDEX IF NOT EXISTS idx_test_sites_created_at ON test_sites(created_at);

CREATE INDEX IF NOT EXISTS idx_test_entries_user_id ON test_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_test_entries_created_at ON test_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_test_entries_withdrawal_status ON test_entries(withdrawal_status);

-- Создание триггеров для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_work_entries_updated_at BEFORE UPDATE ON work_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draft_files_updated_at BEFORE UPDATE ON draft_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_sites_updated_at BEFORE UPDATE ON test_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_entries_updated_at BEFORE UPDATE ON test_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Настройка RLS (Row Level Security)
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_entries ENABLE ROW LEVEL SECURITY;

-- Политики для work_entries
CREATE POLICY "Users can view their own work entries" ON work_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work entries" ON work_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work entries" ON work_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Managers and HR can view all work entries" ON work_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Manager', 'HR', 'Admin')
    )
  );

CREATE POLICY "Managers and HR can update all work entries" ON work_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Manager', 'HR', 'Admin')
    )
  );

-- Политики для draft_files
CREATE POLICY "Users can view their own draft files" ON draft_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own draft files" ON draft_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft files" ON draft_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft files" ON draft_files
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для test_sites
CREATE POLICY "Testers can view all test sites" ON test_sites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Tester', 'Manager', 'Admin')
    )
  );

CREATE POLICY "Testers can insert test sites" ON test_sites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Tester', 'Manager', 'Admin')
    )
  );

CREATE POLICY "Testers can update test sites" ON test_sites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Tester', 'Manager', 'Admin')
    )
  );

-- Политики для test_entries
CREATE POLICY "Users can view their own test entries" ON test_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test entries" ON test_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test entries" ON test_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all test entries" ON test_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Manager', 'Admin')
    )
  );

-- Вставка тестовых данных
INSERT INTO test_sites (casino_name, promo_link, card_bins, currency, withdrawal_time, withdrawal_time_unit, status) VALUES
('Test Casino 1', 'https://testcasino1.com/promo', ARRAY['123456', '789012'], 'USD', 0, 'instant', 'active'),
('Test Casino 2', 'https://testcasino2.com/promo', ARRAY['345678', '901234'], 'EUR', 30, 'minutes', 'testing'),
('Test Casino 3', 'https://testcasino3.com/promo', ARRAY['567890', '123456'], 'RUB', 2, 'hours', 'processing');

-- Вставка тестовых рабочих записей
INSERT INTO work_entries (user_id, casino_name, deposit_amount, withdrawal_amount, card_number, card_expiry, card_cvv, account_username, account_password, card_type, bank_name, withdrawal_status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Test Casino', 100.00, 95.00, '1234 5678 9012 3456', '12/25', '123', 'testuser1', 'password123', 'pink', 'Test Bank', 'received'),
('550e8400-e29b-41d4-a716-446655440001', 'Test Casino 2', 200.00, 190.00, '9876 5432 1098 7654', '06/26', '456', 'testuser2', 'password456', 'gray', 'Test Bank 2', 'sent');

-- Вставка тестовых черновиков
INSERT INTO draft_files (user_id, name, type, url) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Мой рабочий файл', 'excel', 'https://docs.google.com/spreadsheets/d/test1'),
('550e8400-e29b-41d4-a716-446655440001', 'Тестовые данные', 'google_sheets', 'https://docs.google.com/spreadsheets/d/test2');
