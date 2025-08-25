const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodnZnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDY3NiwiZXhwIjoyMDcxNTMwNjc2fQ.pB86kUf85lgLXmr0ZMaIxC4TOSAV3WjTuoAS69VNkss'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log('Создание таблиц через API...\n')

  // Создаем пустые записи в таблицах, чтобы инициировать их создание
  const tables = [
    {
      name: 'users',
      data: {
        username: 'admin',
        password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', // admin123
        full_name: 'Admin User',
        role: 'Admin',
        is_active: true
      }
    },
    {
      name: 'banks',
      data: {
        name: 'Test Bank',
        country: 'UK',
        currency: 'GBP'
      }
    },
    {
      name: 'employees',
      data: {
        first_name: 'Test',
        last_name: 'Employee',
        username: 'test_employee',
        role: 'Employee',
        is_active: true
      }
    }
  ]

  for (const table of tables) {
    try {
      console.log(`Проверка таблицы ${table.name}...`)
      
      // Пробуем вставить данные
      const { data, error } = await supabase
        .from(table.name)
        .insert(table.data)
        .select()
        .single()
      
      if (error) {
        console.log(`❌ ${table.name}: ${error.message}`)
      } else {
        console.log(`✅ ${table.name}: Создана и инициализирована`)
        console.log(`   Данные: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.log(`❌ ${table.name}: Ошибка - ${err.message}`)
    }
  }
}

createTables()
