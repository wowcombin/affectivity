-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'HR', 'CFO', 'Employee', 'Tester')),
  usdt_address VARCHAR(255),
  usdt_network VARCHAR(20) DEFAULT 'BEP20',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id)
);

-- Employees table (extends users for Employee role)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  percentage_rate DECIMAL(5,2) DEFAULT 10.00,
  total_profit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  fired_at TIMESTAMP WITH TIME ZONE,
  fired_by UUID REFERENCES users(id),
  fire_reason TEXT,
  last_working_day DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Casinos table
CREATE TABLE casinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_number VARCHAR(16) NOT NULL,
  card_bin VARCHAR(6) NOT NULL,
  card_holder VARCHAR(255),
  expiry_date VARCHAR(7),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'blocked', 'expired')),
  assigned_to UUID REFERENCES employees(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  casino_id UUID REFERENCES casinos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  card_id UUID REFERENCES cards(id),
  casino_id UUID NOT NULL REFERENCES casinos(id),
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'bonus')),
  amount DECIMAL(12,2) NOT NULL,
  profit DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Salaries table
CREATE TABLE salaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  month VARCHAR(7) NOT NULL,
  base_salary DECIMAL(12,2) NOT NULL,
  performance_bonus DECIMAL(12,2) DEFAULT 0,
  leader_bonus DECIMAL(12,2) DEFAULT 0,
  total_salary DECIMAL(12,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_tx_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role earnings table (for HR, CFO, Manager)
CREATE TABLE role_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  month VARCHAR(7) NOT NULL,
  total_employees_profit DECIMAL(12,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  total_earnings DECIMAL(12,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NDA documents table
CREATE TABLE nda_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  document_content TEXT NOT NULL,
  signature_date TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  is_signed BOOLEAN DEFAULT false,
  signed_document_url VARCHAR(500),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  amount_usd DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Salary calculations table
CREATE TABLE salary_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL,
  gross_profit DECIMAL(12,2) NOT NULL,
  total_expenses DECIMAL(12,2) NOT NULL,
  expense_percentage DECIMAL(5,2) NOT NULL,
  net_profit DECIMAL(12,2) NOT NULL,
  calculation_base VARCHAR(10) NOT NULL CHECK (calculation_base IN ('gross', 'net')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fired employees archive
CREATE TABLE fired_employees_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL,
  username VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50),
  hire_date TIMESTAMP WITH TIME ZONE,
  fire_date TIMESTAMP WITH TIME ZONE,
  fire_reason TEXT,
  fired_by UUID REFERENCES users(id),
  total_earned DECIMAL(12,2),
  last_salary DECIMAL(12,2),
  documents_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blocked IPs table
CREATE TABLE blocked_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address VARCHAR(45) NOT NULL,
  blocked_reason TEXT,
  related_employee_id UUID,
  blocked_by UUID REFERENCES users(id),
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Session tracking
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_employee ON transactions(employee_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_salaries_month ON salaries(month);
CREATE INDEX idx_salaries_employee ON salaries(employee_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "HR can create users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'HR'
    )
  );

CREATE POLICY "Employees can view own transactions" ON transactions
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees 
      WHERE user_id::text = auth.uid()::text
    )
  );

-- Functions for automatic calculations
CREATE OR REPLACE FUNCTION calculate_monthly_profit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE employees
  SET total_profit = (
    SELECT COALESCE(SUM(profit), 0)
    FROM transactions
    WHERE employee_id = NEW.employee_id
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
  )
  WHERE id = NEW.employee_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_profit
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION calculate_monthly_profit();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
