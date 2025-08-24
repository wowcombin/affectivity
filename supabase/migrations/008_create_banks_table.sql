-- Создание таблицы банков
CREATE TABLE IF NOT EXISTS banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(name);
CREATE INDEX IF NOT EXISTS idx_banks_country ON banks(country);
CREATE INDEX IF NOT EXISTS idx_banks_is_active ON banks(is_active);
CREATE INDEX IF NOT EXISTS idx_banks_created_at ON banks(created_at);

-- Триггер для обновления updated_at
CREATE TRIGGER update_banks_updated_at 
    BEFORE UPDATE ON banks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Включение RLS
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Политики RLS
-- SELECT: Admin и CFO могут видеть все банки
CREATE POLICY "Admin and CFO can view banks" ON banks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO')
    )
  );

-- INSERT: Admin и CFO могут создавать банки
CREATE POLICY "Admin and CFO can create banks" ON banks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO')
    )
  );

-- UPDATE: Admin и CFO могут обновлять банки
CREATE POLICY "Admin and CFO can update banks" ON banks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO')
    )
  );

-- DELETE: Только Admin может удалять банки
CREATE POLICY "Only Admin can delete banks" ON banks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );
