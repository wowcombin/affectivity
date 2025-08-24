const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL
});

const migrationSQL = `
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

DROP TRIGGER IF EXISTS trigger_update_employees_updated_at ON employees;
CREATE TRIGGER trigger_update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_employees_updated_at();

-- Настройка Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если они есть
DROP POLICY IF EXISTS "Users can view own employee data" ON employees;
DROP POLICY IF EXISTS "Admin HR Manager can view all employees" ON employees;
DROP POLICY IF EXISTS "Admin HR can create employees" ON employees;
DROP POLICY IF EXISTS "Admin HR Manager can update employees" ON employees;
DROP POLICY IF EXISTS "Only Admin can delete employees" ON employees;

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
`;

async function applyMigration() {
  try {
    console.log('Applying employees table migration...');
    
    const result = await pool.query(migrationSQL);
    console.log('Migration applied successfully!');
    
    // Проверяем, что таблица создана
    const checkResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'employees'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Employees table created successfully');
    } else {
      console.log('❌ Employees table not found');
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await pool.end();
  }
}

applyMigration();
