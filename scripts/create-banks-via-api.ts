import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Загружаем переменные окружения из .env.local
config({ path: '.env.local' })

async function createBanksViaAPI() {
  try {
    console.log('=== CREATING BANKS VIA API ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return
    }
    
    console.log('Environment variables loaded')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Попробуем создать таблицу через прямые SQL запросы
    console.log('Attempting to create tables via direct SQL...')
    
    // Создаем таблицу банков
    const createBanksQuery = `
      CREATE TABLE IF NOT EXISTS public.banks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('revolut', 'uk', 'other')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    
    // Попробуем выполнить SQL через REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createBanksQuery })
    })
    
    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response text:', responseText)
    
    if (response.ok) {
      console.log('Banks table created successfully')
    } else {
      console.log('Failed to create banks table via API')
      
      // Попробуем другой подход - создадим таблицу через вставку данных
      console.log('Trying alternative approach...')
      
      // Проверим, существует ли таблица
      const { data: existingBanks, error: checkError } = await supabase
        .from('banks')
        .select('*')
        .limit(1)
      
      if (checkError) {
        console.log('Table does not exist, cannot create via API')
        console.log('You need to create the tables manually in Supabase dashboard')
        console.log('Or use Supabase CLI to apply migrations')
        return
      }
      
      console.log('Table exists, adding test data...')
    }
    
    // Добавляем тестовые данные
    console.log('Adding test data...')
    
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
    
    console.log('Setup completed!')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

createBanksViaAPI()
