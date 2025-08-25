-- Инициализация базы данных Affectivity
-- Выполните этот скрипт в Supabase SQL Editor

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'HR', 'CFO', 'Employee', 'Tester')),
  usdt_address VARCHAR(255),
  usdt_network VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы banks
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(10),
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  sort_code VARCHAR(20),
  login_url TEXT,
  login_password VARCHAR(255),
  bank_address TEXT,
  pink_cards_daily_limit INTEGER DEFAULT 5,
  pink_cards_remaining INTEGER DEFAULT 5,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы cards
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  card_number VARCHAR(20) NOT NULL,
  expiry_date VARCHAR(10) NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  card_type VARCHAR(10) CHECK (card_type IN ('pink', 'gray')),
  status VARCHAR(20) DEFAULT 'free' CHECK (status IN ('free', 'assigned', 'in_process', 'completed')),
  assigned_employee_id UUID REFERENCES users(id),
  assigned_casino_id UUID,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  withdrawal_amount DECIMAL(10, 2) DEFAULT 0,
  profit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  username VARCHAR(255),
  role VARCHAR(50) DEFAULT 'Employee',
  percentage_rate DECIMAL(5, 2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы casinos
CREATE TABLE IF NOT EXISTS casinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255),
  promo_code VARCHAR(100),
  supported_bins TEXT,
  currency VARCHAR(10),
  withdrawal_time VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id),
  casino_id UUID REFERENCES casinos(id),
  employee_id UUID REFERENCES users(id),
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы test_sites
CREATE TABLE IF NOT EXISTS test_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_id UUID REFERENCES casinos(id),
  tester_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'testing',
  test_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы work_files
CREATE TABLE IF NOT EXISTS work_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  data JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы salary_calculations
CREATE TABLE IF NOT EXISTS salary_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  gross_amount DECIMAL(10, 2),
  net_amount DECIMAL(10, 2),
  bonuses DECIMAL(10, 2),
  deductions DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_bank_account ON cards(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_work_files_employee_date ON work_files(employee_id, year, month);

-- Создание тестовых пользователей
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin', 'admin@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'Admin User', 'Admin'),
  ('manager', 'manager@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'Manager User', 'Manager'),
  ('hr', 'hr@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'HR User', 'HR'),
  ('cfo', 'cfo@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'CFO User', 'CFO'),
  ('employee', 'employee@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'Employee User', 'Employee'),
  ('tester', 'tester@affectivity.com', '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', 'Tester User', 'Tester')
ON CONFLICT (username) DO NOTHING;

-- Создание записей сотрудников
INSERT INTO employees (user_id, percentage_rate, is_active)
SELECT id, 10.00, true FROM users WHERE role IN ('Employee', 'Tester')
ON CONFLICT DO NOTHING;
