const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodnZnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDY3NiwiZXhwIjoyMDcxNTMwNjc2fQ.pB86kUf85lgLXmr0ZMaIxC4TOSAV3WjTuoAS69VNkss'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  console.log('Проверка существующих таблиц...\n')

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

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table}: НЕ СУЩЕСТВУЕТ или ОШИБКА (${error.message})`)
      } else {
        console.log(`✅ ${table}: Существует (записей: ${count || 0})`)
      }
    } catch (err) {
      console.log(`❌ ${table}: Ошибка проверки`)
    }
  }
}

checkTables()
