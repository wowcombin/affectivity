import { Client } from 'pg'

async function recreateCardsTable() {
  const client = new Client({
    connectionString: "postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require",
    ssl: false
  })

  try {
    console.log('=== RECREATING CARDS TABLE ===')
    
    await client.connect()
    console.log('Connected to database')
    
    // Удаляем старую таблицу
    await client.query('DROP TABLE IF EXISTS cards CASCADE')
    console.log('Old cards table dropped')
    
    // Создаем новую таблицу
    await client.query(`
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
      )
    `)
    console.log('New cards table created')
    
    // Включаем RLS
    await client.query('ALTER TABLE cards ENABLE ROW LEVEL SECURITY')
    console.log('RLS enabled')
    
    // Создаем политики
    await client.query(`
      DROP POLICY IF EXISTS "CFO can manage cards" ON cards;
      CREATE POLICY "CFO can manage cards" ON cards
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
              AND role IN ('Admin', 'CFO', 'Manager')
          )
        )
    `)
    console.log('Policies created')
    
    console.log('=== CARDS TABLE RECREATED SUCCESSFULLY ===')
    
  } catch (error) {
    console.error('Error recreating cards table:', error)
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

recreateCardsTable()
