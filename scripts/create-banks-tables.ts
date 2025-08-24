import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Загружаем переменные окружения из .env.local
config({ path: '.env.local' })

async function createBanksTables() {
  try {
    console.log('=== CREATING BANKS TABLES ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return
    }
    
    console.log('Environment variables loaded')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Создаем таблицу банков
    console.log('Creating banks table...')
    const { error: banksError } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (banksError && banksError.code === 'PGRST205') {
      // Таблица не существует, создаем её
      console.log('Banks table does not exist, creating...')
      
      // Создаем таблицу через SQL
      const createBanksSQL = `
        CREATE TABLE IF NOT EXISTS banks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('revolut', 'uk', 'other')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createBanksSQL })
      
      if (createError) {
        console.error('Error creating banks table:', createError)
        return
      }
      
      console.log('Banks table created successfully')
    } else if (banksError) {
      console.error('Error checking banks table:', banksError)
      return
    } else {
      console.log('Banks table already exists')
    }
    
    // Создаем таблицу банковских аккаунтов
    console.log('Creating bank_accounts table...')
    const { error: accountsError } = await supabase
      .from('bank_accounts')
      .select('*')
      .limit(1)
    
    if (accountsError && accountsError.code === 'PGRST205') {
      // Таблица не существует, создаем её
      console.log('Bank accounts table does not exist, creating...')
      
      const createAccountsSQL = `
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
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createAccountsSQL })
      
      if (createError) {
        console.error('Error creating bank_accounts table:', createError)
        return
      }
      
      console.log('Bank accounts table created successfully')
    } else if (accountsError) {
      console.error('Error checking bank_accounts table:', accountsError)
      return
    } else {
      console.log('Bank accounts table already exists')
    }
    
    // Добавляем тестовые данные
    console.log('Adding test data...')
    
    // Добавляем тестовый банк
    const { data: bank, error: bankInsertError } = await supabase
      .from('banks')
      .insert({
        name: 'Test Bank',
        type: 'uk'
      })
      .select()
      .single()
    
    if (bankInsertError) {
      console.error('Error inserting test bank:', bankInsertError)
    } else {
      console.log('Test bank created:', bank)
      
      // Добавляем тестовый аккаунт
      const { data: account, error: accountInsertError } = await supabase
        .from('bank_accounts')
        .insert({
          bank_id: bank.id,
          account_name: 'Test Account',
          account_number: '12345678',
          sort_code: '12-34-56',
          login_url: 'https://testbank.com/login',
          login_password: 'test123'
        })
        .select()
        .single()
      
      if (accountInsertError) {
        console.error('Error inserting test account:', accountInsertError)
      } else {
        console.log('Test account created:', account)
      }
    }
    
    console.log('Banks tables setup completed!')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

createBanksTables()
