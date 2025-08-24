import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INIT DB API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Создаем таблицу банков
    console.log('Creating banks table...')
    const { error: banksError } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (banksError && banksError.code === 'PGRST205') {
      // Таблица не существует, создаем её через SQL
      console.log('Banks table does not exist, creating...')
      
      // Создаем таблицу банков
      const createBanksSQL = `
        CREATE TABLE IF NOT EXISTS banks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('revolut', 'uk', 'other')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      
      // Выполняем SQL через прямые запросы к базе данных
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createBanksSQL })
      
      if (createError) {
        console.error('Error creating banks table:', createError)
        return NextResponse.json({ error: 'Failed to create banks table' }, { status: 500 })
      }
      
      console.log('Banks table created successfully')
    } else if (banksError) {
      console.error('Error checking banks table:', banksError)
      return NextResponse.json({ error: 'Error checking banks table' }, { status: 500 })
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
        return NextResponse.json({ error: 'Failed to create bank_accounts table' }, { status: 500 })
      }
      
      console.log('Bank accounts table created successfully')
    } else if (accountsError) {
      console.error('Error checking bank_accounts table:', accountsError)
      return NextResponse.json({ error: 'Error checking bank_accounts table' }, { status: 500 })
    } else {
      console.log('Bank accounts table already exists')
    }
    
    // Добавляем тестовые данные
    console.log('Adding test data...')
    
    const { data: existingBanks } = await supabase
      .from('banks')
      .select('*')
      .limit(1)
    
    if (!existingBanks || existingBanks.length === 0) {
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
      }
    }
    
    return NextResponse.json({ 
      message: 'Database initialized successfully',
      banks: await supabase.from('banks').select('*'),
      bank_accounts: await supabase.from('bank_accounts').select('*')
    })
    
  } catch (error) {
    console.error('Error in init-db:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
