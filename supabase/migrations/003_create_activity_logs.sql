-- Создание таблицы activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action);

-- Включение RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Создание политик RLS
-- Политика для чтения логов (только Admin)
CREATE POLICY IF NOT EXISTS "Admin can read all logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
      AND users.is_active = true
    )
  );

-- Политика для создания логов (все авторизованные пользователи)
CREATE POLICY IF NOT EXISTS "Users can create their own logs" ON activity_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Политика для обновления логов (только Admin)
CREATE POLICY IF NOT EXISTS "Admin can update all logs" ON activity_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
      AND users.is_active = true
    )
  );

-- Политика для удаления логов (только Admin)
CREATE POLICY IF NOT EXISTS "Admin can delete all logs" ON activity_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
      AND users.is_active = true
    )
  );

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_activity_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS trigger_update_activity_logs_updated_at ON activity_logs;
CREATE TRIGGER trigger_update_activity_logs_updated_at
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_logs_updated_at();

-- Вставка тестовых логов
INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) VALUES
  ((SELECT id FROM users WHERE role = 'Admin' LIMIT 1), 'login', '{"method": "password"}', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  ((SELECT id FROM users WHERE role = 'CFO' LIMIT 1), 'view', '{"page": "dashboard"}', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
  ((SELECT id FROM users WHERE role = 'Manager' LIMIT 1), 'create', '{"entity": "transaction", "amount": 1000}', '192.168.1.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');
