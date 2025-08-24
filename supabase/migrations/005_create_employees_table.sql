-- Создание таблицы сотрудников
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  bank_name TEXT NOT NULL,
  bank_country TEXT NOT NULL,
  account_number TEXT NOT NULL,
  sort_code TEXT NOT NULL,
  card_number TEXT NOT NULL,
  card_expiry TEXT NOT NULL,
  card_cvv TEXT NOT NULL,
  login_url TEXT NOT NULL,
  login_username TEXT NOT NULL,
  login_password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at();

-- Настройка Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Политики RLS для таблицы employees
-- Пользователи могут видеть только своих данных
CREATE POLICY "Users can view own employee data" ON employees
  FOR SELECT USING (auth.uid() = user_id);

-- Admin, HR, Manager могут видеть всех сотрудников
CREATE POLICY "Admin HR Manager can view all employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'HR', 'Manager')
      AND users.is_active = true
    )
  );

-- Admin, HR могут создавать сотрудников
CREATE POLICY "Admin HR can create employees" ON employees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'HR')
      AND users.is_active = true
    )
  );

-- Admin, HR, Manager могут обновлять сотрудников
CREATE POLICY "Admin HR Manager can update employees" ON employees
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'HR', 'Manager')
      AND users.is_active = true
    )
  );

-- Только Admin может удалять сотрудников
CREATE POLICY "Only Admin can delete employees" ON employees
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
      AND users.is_active = true
    )
  );

-- Вставка тестовых данных
INSERT INTO employees (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  position,
  salary,
  hire_date,
  bank_name,
  bank_country,
  account_number,
  sort_code,
  card_number,
  card_expiry,
  card_cvv,
  login_url,
  login_username,
  login_password
) VALUES 
(
  (SELECT id FROM users WHERE username = 'john.doe' LIMIT 1),
  'John',
  'Doe',
  'john.doe@example.com',
  '+1234567890',
  'Employee',
  2500.00,
  '2024-01-15',
  'Barclays Bank',
  'UK',
  '12345678',
  '20-00-00',
  '4111111111111111',
  '12/25',
  '123',
  'https://online.barclays.co.uk',
  'john.doe',
  'password123'
),
(
  (SELECT id FROM users WHERE username = 'jane.smith' LIMIT 1),
  'Jane',
  'Smith',
  'jane.smith@example.com',
  '+1234567891',
  'Employee',
  2800.00,
  '2024-02-01',
  'Deutsche Bank',
  'DE',
  '87654321',
  '30-00-00',
  '4222222222222222',
  '01/26',
  '456',
  'https://www.deutsche-bank.de',
  'jane.smith',
  'password456'
),
(
  (SELECT id FROM users WHERE username = 'mike.johnson' LIMIT 1),
  'Mike',
  'Johnson',
  'mike.johnson@example.com',
  '+1234567892',
  'Employee',
  2200.00,
  '2024-01-20',
  'Banco Santander',
  'ES',
  '11223344',
  '40-00-00',
  '4333333333333333',
  '06/25',
  '789',
  'https://www.santander.es',
  'mike.johnson',
  'password789'
)
ON CONFLICT (email) DO NOTHING;
