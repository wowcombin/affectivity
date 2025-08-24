import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE TRANSACTIONS TABLE API CALLED ===')
    
    const supabase = createAdminClient()
    
    // SQL для создания таблицы transactions
    const createTableSQL = `
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
    `
    
    // Пытаемся выполнить SQL через RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.error('Error creating transactions table:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create transactions table',
        details: error.message
      }, { status: 500 })
    }
    
    // Проверяем, что таблица создана
    const { data: checkData, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('Error checking transactions table:', checkError)
      return NextResponse.json({ 
        success: false, 
        error: 'Table created but verification failed',
        details: checkError.message
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Transactions table created successfully',
      data: checkData
    })
  } catch (error) {
    console.error('Error in create transactions table:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
