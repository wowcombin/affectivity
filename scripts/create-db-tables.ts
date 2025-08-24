import { config } from 'dotenv'
import { Client } from 'pg'

// Загружаем переменные окружения из .env.local
config({ path: '.env.local' })

async function createDatabaseTables() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('=== CREATING DATABASE TABLES ===')
    
    await client.connect()
    console.log('Connected to database')
    
    // Создаем таблицу банков
    console.log('Creating banks table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS banks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('revolut', 'uk', 'other')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log('Banks table created successfully')
    
    // Создаем таблицу банковских аккаунтов
    console.log('Creating bank_accounts table...')
    await client.query(`
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
    `)
    console.log('Bank accounts table created successfully')
    
    // Добавляем тестовые данные
    console.log('Adding test data...')
    
    const { rows: existingBanks } = await client.query('SELECT * FROM banks LIMIT 1')
    
    if (existingBanks.length === 0) {
      await client.query(`
        INSERT INTO banks (name, type) VALUES
          ('Test Bank', 'uk'),
          ('Revolut Bank', 'revolut'),
          ('Other Bank', 'other')
      `)
      console.log('Test banks added successfully')
    } else {
      console.log('Banks already exist, skipping test data')
    }
    
    // Включаем RLS
    console.log('Enabling RLS...')
    await client.query('ALTER TABLE banks ENABLE ROW LEVEL SECURITY;')
    await client.query('ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;')
    
    // Создаем политики для банков
    console.log('Creating policies...')
    await client.query(`
      DROP POLICY IF EXISTS "CFO can manage banks" ON banks;
      CREATE POLICY "CFO can manage banks" ON banks
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
              AND role IN ('Admin', 'CFO')
          )
        );
    `)
    
    // Создаем политики для банковских аккаунтов
    await client.query(`
      DROP POLICY IF EXISTS "CFO can manage bank accounts" ON bank_accounts;
      CREATE POLICY "CFO can manage bank accounts" ON bank_accounts
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
              AND role IN ('Admin', 'CFO')
          )
        );
    `)
    
    console.log('Policies created successfully')
    
    // Проверяем результат
    const { rows: banks } = await client.query('SELECT * FROM banks')
    const { rows: accounts } = await client.query('SELECT * FROM bank_accounts')
    
    console.log('=== DATABASE SETUP COMPLETED ===')
    console.log('Banks count:', banks.length)
    console.log('Bank accounts count:', accounts.length)
    
  } catch (error) {
    console.error('Error creating database tables:', error)
  } finally {
    await client.end()
    console.log('Database connection closed')
  }
}

createDatabaseTables()
