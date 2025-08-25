const { createClient } = require('@supabase/supabase-js')

// Используем реальные ключи
const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5lazFjYzFjYy1jYzFjLWNjMWMtY2MxYy1jYzFjYzFjY2NjMWMiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0OTY4MDAwLCJleHAiOjIwNTA1NDQwMDB9.test'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Проверка реальной базы данных Supabase...\n')

  const tables = [
    'users',
    'employees', 
    'banks',
    'bank_accounts',
    'cards',
    'casinos',
    'transactions',
    'test_sites',
    'work_files',
    'activity_logs',
    'salary_calculations'
  ]

  console.log('URL:', supabaseUrl)
  console.log('Использую service role key\n')

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: Существует (записей: ${count || 0})`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }

  // Проверяем конкретно таблицу cards
  console.log('\n📊 Детальная проверка таблицы cards:')
  try {
    const { data: cards, error, count } = await supabase
      .from('cards')
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (error) {
      console.log('❌ Ошибка:', error.message)
      console.log('Код ошибки:', error.code)
      console.log('Детали:', error.details)
    } else {
      console.log(`✅ Найдено ${count || 0} карт`)
      if (cards && cards.length > 0) {
        console.log('\nПримеры карт:')
        cards.forEach((card, i) => {
          console.log(`${i + 1}. ${card.card_number} - ${card.card_type} - ${card.status}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Критическая ошибка:', err.message)
  }
}

checkDatabase()
