-- Создание таблицы расчетов зарплат
CREATE TABLE IF NOT EXISTS salary_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_role TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  gross_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  leader_bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  usd_rate DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  usd_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'paid')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_salary_calculations_employee_id ON salary_calculations(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_month ON salary_calculations(month);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_status ON salary_calculations(status);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_calculated_at ON salary_calculations(calculated_at);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_salary_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_salary_calculations_updated_at
  BEFORE UPDATE ON salary_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_salary_calculations_updated_at();

-- Настройка Row Level Security (RLS)
ALTER TABLE salary_calculations ENABLE ROW LEVEL SECURITY;

-- Политики RLS для таблицы salary_calculations
-- Пользователи могут видеть только свои расчеты
CREATE POLICY "Users can view own salary calculations" ON salary_calculations
  FOR SELECT USING (auth.uid() = employee_id);

-- Admin, CFO, HR могут видеть все расчеты
CREATE POLICY "Admin CFO HR can view all salary calculations" ON salary_calculations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'CFO', 'HR')
      AND users.is_active = true
    )
  );

-- Admin, CFO, HR могут создавать расчеты
CREATE POLICY "Admin CFO HR can create salary calculations" ON salary_calculations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'CFO', 'HR')
      AND users.is_active = true
    )
  );

-- Admin, CFO могут обновлять расчеты
CREATE POLICY "Admin CFO can update salary calculations" ON salary_calculations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'CFO')
      AND users.is_active = true
    )
  );

-- Только Admin может удалять расчеты
CREATE POLICY "Only Admin can delete salary calculations" ON salary_calculations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
      AND users.is_active = true
    )
  );
