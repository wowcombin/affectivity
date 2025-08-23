-- Migration v2: Новая система управления
-- Удаляем старые таблицы и создаем новые

-- Удаляем старые таблицы
DROP TABLE IF EXISTS role_earnings CASCADE;
DROP TABLE IF EXISTS salaries CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Обновляем таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hired_date DATE,
ADD COLUMN IF NOT EXISTS fired_date DATE,
ADD COLUMN IF NOT EXISTS hr_notes TEXT;

-- Создаем таблицу рабочих файлов
CREATE TABLE IF NOT EXISTS work_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  casino_name VARCHAR(255) NOT NULL,
  deposit_amount DECIMAL(15,2) NOT NULL,
  withdrawal_amount DECIMAL(15,2) NOT NULL,
  card_number VARCHAR(255) NOT NULL,
  card_expiry VARCHAR(5) NOT NULL,
  card_cvv VARCHAR(4) NOT NULL,
  account_username VARCHAR(255) NOT NULL,
  account_password VARCHAR(255) NOT NULL,
  card_type VARCHAR(10) NOT NULL CHECK (card_type IN ('pink', 'gray')),
  bank_name VARCHAR(255) NOT NULL,
  withdrawal_status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (withdrawal_status IN ('new', 'sent', 'received', 'problem', 'blocked')),
  withdrawal_question TEXT,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу тестовых сайтов
CREATE TABLE IF NOT EXISTS test_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_name VARCHAR(255) NOT NULL,
  promo_url TEXT NOT NULL,
  card_bins TEXT[] NOT NULL, -- первые 6 цифр карт
  currency VARCHAR(10) NOT NULL,
  withdrawal_time_type VARCHAR(20) NOT NULL CHECK (withdrawal_time_type IN ('instant', 'minutes', 'hours')),
  withdrawal_time_value INTEGER,
  manual_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'processing', 'checking')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Обновляем таблицу карт
DROP TABLE IF EXISTS cards CASCADE;
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  card_number VARCHAR(255) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  card_type VARCHAR(10) NOT NULL CHECK (card_type IN ('pink', 'gray')),
  status VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'assigned', 'in_process', 'completed')),
  assigned_employee_id UUID REFERENCES users(id),
  assigned_casino_id UUID REFERENCES casinos(id),
  deposit_amount DECIMAL(15,2),
  withdrawal_amount DECIMAL(15,2),
  profit DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу задач
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id),
  assigned_by UUID NOT NULL REFERENCES users(id),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  estimated_hours DECIMAL(5,2) NOT NULL,
  actual_hours DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу уведомлений задач
CREATE TABLE IF NOT EXISTS task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('assigned', 'updated', 'due_soon', 'overdue', 'completed')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу переводов CFO -> CEO
CREATE TABLE IF NOT EXISTS cfo_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(15,2) NOT NULL,
  usdt_address VARCHAR(255) NOT NULL,
  sent_by UUID NOT NULL REFERENCES users(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected'))
);

-- Создаем таблицу NDA документов
CREATE TABLE IF NOT EXISTS nda_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу расчетов зарплат
CREATE TABLE IF NOT EXISTS salary_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  base_salary DECIMAL(15,2) NOT NULL,
  bonus_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  leader_bonus DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_salary DECIMAL(15,2) NOT NULL,
  gross_profit DECIMAL(15,2) NOT NULL,
  expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_profit DECIMAL(15,2) NOT NULL,
  currency_conversion_rate DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- Создаем таблицу лидеров месяца
CREATE TABLE IF NOT EXISTS monthly_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_profit DECIMAL(15,2) NOT NULL,
  total_transactions INTEGER NOT NULL,
  max_single_transaction DECIMAL(15,2) NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, employee_id)
);

-- Обновляем таблицу транзакций
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casino_id UUID NOT NULL REFERENCES casinos(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  employee_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Обновляем таблицу расходов
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_work_files_employee_month ON work_files(employee_id, month);
CREATE INDEX IF NOT EXISTS idx_work_files_status ON work_files(withdrawal_status);
CREATE INDEX IF NOT EXISTS idx_test_sites_status ON test_sites(status);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_assigned ON cards(assigned_employee_id, assigned_casino_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_cfo_transfers_status ON cfo_transfers(status);
CREATE INDEX IF NOT EXISTS idx_salary_calculations_month ON salary_calculations(month);
CREATE INDEX IF NOT EXISTS idx_monthly_leaders_month ON monthly_leaders(month);
CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применяем триггеры к таблицам
CREATE TRIGGER update_work_files_updated_at BEFORE UPDATE ON work_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_sites_updated_at BEFORE UPDATE ON test_sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banks_updated_at BEFORE UPDATE ON banks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для сброса розовых карт каждый день
CREATE OR REPLACE FUNCTION reset_pink_cards_daily()
RETURNS void AS $$
BEGIN
  UPDATE bank_accounts 
  SET pink_cards_remaining = pink_cards_daily_limit,
      last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для расчета зарплат
CREATE OR REPLACE FUNCTION calculate_employee_salary(
  p_employee_id UUID,
  p_month VARCHAR(7)
)
RETURNS TABLE(
  base_salary DECIMAL(15,2),
  bonus_amount DECIMAL(15,2),
  leader_bonus DECIMAL(15,2),
  total_salary DECIMAL(15,2),
  gross_profit DECIMAL(15,2)
) AS $$
DECLARE
  v_gross_profit DECIMAL(15,2) := 0;
  v_base_salary DECIMAL(15,2) := 0;
  v_bonus_amount DECIMAL(15,2) := 0;
  v_leader_bonus DECIMAL(15,2) := 0;
  v_max_transaction DECIMAL(15,2) := 0;
  v_employee_role VARCHAR(20);
  v_is_leader BOOLEAN := false;
BEGIN
  -- Получаем роль сотрудника
  SELECT role INTO v_employee_role FROM users WHERE id = p_employee_id;
  
  -- Рассчитываем брутто прибыль за месяц
  SELECT COALESCE(SUM(profit), 0) INTO v_gross_profit
  FROM work_files 
  WHERE employee_id = p_employee_id 
    AND month = p_month 
    AND withdrawal_status = 'received'
    AND is_draft = false;
  
  -- Базовая зарплата: 10% от брутто
  v_base_salary := v_gross_profit * 0.10;
  
  -- Бонус: +$200 только если брутто > $200
  IF v_gross_profit > 200 THEN
    v_bonus_amount := 200;
  END IF;
  
  -- Проверяем, является ли сотрудник лидером месяца
  SELECT EXISTS(
    SELECT 1 FROM monthly_leaders 
    WHERE month = p_month 
      AND employee_id = p_employee_id 
      AND rank = 1
  ) INTO v_is_leader;
  
  -- Бонус лидера: +10% от максимальной транзакции
  IF v_is_leader THEN
    SELECT COALESCE(MAX(withdrawal_amount), 0) INTO v_max_transaction
    FROM work_files 
    WHERE employee_id = p_employee_id 
      AND month = p_month 
      AND withdrawal_status = 'received'
      AND is_draft = false;
    
    v_leader_bonus := v_max_transaction * 0.10;
  END IF;
  
  RETURN QUERY SELECT 
    v_base_salary,
    v_bonus_amount,
    v_leader_bonus,
    v_base_salary + v_bonus_amount + v_leader_bonus,
    v_gross_profit;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для обновления статуса карт
CREATE OR REPLACE FUNCTION update_card_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Если карта назначена сотруднику и казино
  IF NEW.assigned_employee_id IS NOT NULL AND NEW.assigned_casino_id IS NOT NULL THEN
    NEW.status := 'assigned';
  -- Если есть депозит, но нет вывода
  ELSIF NEW.deposit_amount IS NOT NULL AND NEW.withdrawal_amount IS NULL THEN
    NEW.status := 'in_process';
  -- Если есть депозит и вывод
  ELSIF NEW.deposit_amount IS NOT NULL AND NEW.withdrawal_amount IS NOT NULL THEN
    NEW.status := 'completed';
  -- Иначе свободна
  ELSE
    NEW.status := 'free';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер к таблице карт
CREATE TRIGGER update_card_status_trigger 
  BEFORE INSERT OR UPDATE ON cards 
  FOR EACH ROW EXECUTE FUNCTION update_card_status();

-- Создаем функцию для создания уведомлений о задачах
CREATE OR REPLACE FUNCTION create_task_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Уведомление о назначении задачи
  IF TG_OP = 'INSERT' THEN
    INSERT INTO task_notifications (task_id, user_id, type, message)
    VALUES (NEW.id, NEW.assigned_to, 'assigned', 
            'Вам назначена новая задача: ' || NEW.title);
  END IF;
  
  -- Уведомление об обновлении задачи
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO task_notifications (task_id, user_id, type, message)
      VALUES (NEW.id, NEW.assigned_to, 'updated', 
              'Статус задачи "' || NEW.title || '" изменен на: ' || NEW.status);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер к таблице задач
CREATE TRIGGER create_task_notification_trigger 
  AFTER INSERT OR UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION create_task_notification();

-- Вставляем тестовые данные
INSERT INTO banks (name, type) VALUES 
  ('Revolut UK', 'revolut'),
  ('Barclays UK', 'uk'),
  ('Monzo UK', 'uk')
ON CONFLICT DO NOTHING;

-- Создаем RLS политики
ALTER TABLE work_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfo_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nda_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_leaders ENABLE ROW LEVEL SECURITY;

-- Политики для рабочих файлов
CREATE POLICY "Employees can view their own work files" ON work_files
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can insert their own work files" ON work_files
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Employees can update their own work files" ON work_files
  FOR UPDATE USING (auth.uid() = employee_id);

CREATE POLICY "Managers can view all work files" ON work_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'Manager', 'HR')
    )
  );

-- Политики для задач
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE POLICY "Managers can manage all tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'Manager')
    )
  );

-- Политики для уведомлений
CREATE POLICY "Users can view their notifications" ON task_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON task_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Политики для карт
CREATE POLICY "Managers can manage cards" ON cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'Manager', 'CFO')
    )
  );

-- Политики для банков
CREATE POLICY "CFO can manage banks" ON banks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'CFO')
    )
  );

-- Политики для переводов CFO
CREATE POLICY "CFO can create transfers" ON cfo_transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'CFO')
    )
  );

CREATE POLICY "Admin can confirm transfers" ON cfo_transfers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role = 'Admin'
    )
  );

-- Политики для зарплат
CREATE POLICY "Users can view their own salary" ON salary_calculations
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Managers can view all salaries" ON salary_calculations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'Manager', 'CFO')
    )
  );
