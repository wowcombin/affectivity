-- Создание таблицы транзакций
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  casino_id UUID NOT NULL REFERENCES casinos(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_transactions_employee_id ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_casino_id ON transactions(casino_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Включение RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики RLS
-- SELECT: Пользователи могут видеть свои транзакции, Admin/CFO/Manager могут видеть все
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM employees WHERE id = employee_id
    ) OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO', 'Manager')
    )
  );

-- INSERT: Admin, CFO, Manager могут создавать транзакции
CREATE POLICY "Admin, CFO, Manager can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO', 'Manager')
    )
  );

-- UPDATE: Admin, CFO, Manager могут обновлять транзакции
CREATE POLICY "Admin, CFO, Manager can update transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'CFO', 'Manager')
    )
  );

-- DELETE: Только Admin может удалять транзакции
CREATE POLICY "Only Admin can delete transactions" ON transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'Admin'
    )
  );
