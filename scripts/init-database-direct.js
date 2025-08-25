const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://izjneklmbzgaihvwgwqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodndnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk2ODU2MSwiZXhwIjoyMDUwNTQ0NTYxfQ.b6Aeik_yJfz0K3_t9OZ1CPnUOLXNO6YKFo8dQs0lKsE'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function initDatabase() {
  console.log('🚀 Инициализация базы данных Affectivity...\n')

  try {
    // Шаг 1: Создаем тестовых пользователей
    console.log('👥 Создание пользователей...')
    const users = [
      { username: 'admin', email: 'admin@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'Admin User', role: 'Admin' },
      { username: 'manager', email: 'manager@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'Manager User', role: 'Manager' },
      { username: 'hr', email: 'hr@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'HR User', role: 'HR' },
      { username: 'cfo', email: 'cfo@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'CFO User', role: 'CFO' },
      { username: 'employee', email: 'employee@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'Employee User', role: 'Employee' },
      { username: 'tester', email: 'tester@affectivity.com', password_hash: '$2a$10$X3yXqAHPcfqyC1ZGKyK6OeXhVl.2X/X6y9RxeJzW7Tx8iWYGZWWKS', full_name: 'Tester User', role: 'Tester' }
    ]

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'username' })
        .select()
        .single()

      if (error) {
        console.log(`❌ Ошибка создания ${user.username}: ${error.message}`)
      } else {
        console.log(`✅ Пользователь ${user.username} создан`)
      }
    }

    // Шаг 2: Создаем банк
    console.log('\n🏦 Создание банка...')
    const { data: bank, error: bankError } = await supabase
      .from('banks')
      .insert({ name: 'UK Banks', country: 'UK', currency: 'GBP' })
      .select()
      .single()

    if (bankError) {
      console.log(`❌ Ошибка создания банка: ${bankError.message}`)
      return
    }
    console.log(`✅ Банк создан: ${bank.name}`)

    // Шаг 3: Создаем тестовый банковский аккаунт
    console.log('\n📁 Создание тестового банковского аккаунта...')
    const { data: account, error: accountError } = await supabase
      .from('bank_accounts')
      .insert({
        bank_id: bank.id,
        account_name: 'Test Account',
        account_number: '12345678',
        sort_code: '12-34-56',
        login_url: 'https://example.com',
        login_password: 'test123',
        bank_address: 'Test Address, UK',
        pink_cards_daily_limit: 5,
        pink_cards_remaining: 5,
        last_reset_date: new Date().toISOString()
      })
      .select()
      .single()

    if (accountError) {
      console.log(`❌ Ошибка создания аккаунта: ${accountError.message}`)
    } else {
      console.log(`✅ Банковский аккаунт создан`)
    }

    // Шаг 4: Создаем тестовые карты
    if (account) {
      console.log('\n💳 Создание тестовых карт...')
      const cards = [
        { bank_account_id: account.id, card_number: '4111111111111111', expiry_date: '12/25', cvv: '123', card_type: 'gray', status: 'free' },
        { bank_account_id: account.id, card_number: '4222222222222222', expiry_date: '12/25', cvv: '456', card_type: 'gray', status: 'free' },
        { bank_account_id: account.id, card_number: '5333333333333333', expiry_date: '12/25', cvv: '789', card_type: 'pink', status: 'free' }
      ]

      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .insert(cards)
        .select()

      if (cardsError) {
        console.log(`❌ Ошибка создания карт: ${cardsError.message}`)
      } else {
        console.log(`✅ Создано ${cardsData.length} тестовых карт`)
      }
    }

    // Шаг 5: Создаем записи сотрудников
    console.log('\n👤 Создание записей сотрудников...')
    const { data: employeeUsers } = await supabase
      .from('users')
      .select('id, role')
      .in('role', ['Employee', 'Tester'])

    if (employeeUsers && employeeUsers.length > 0) {
      const employees = employeeUsers.map(user => ({
        user_id: user.id,
        percentage_rate: 10.00,
        is_active: true
      }))

      const { error: empError } = await supabase
        .from('employees')
        .insert(employees)

      if (empError) {
        console.log(`❌ Ошибка создания сотрудников: ${empError.message}`)
      } else {
        console.log(`✅ Создано ${employees.length} записей сотрудников`)
      }
    }

    console.log('\n✅ Инициализация базы данных завершена!')
    console.log('\n📊 Статистика:')
    
    // Проверяем количество записей
    const tables = ['users', 'banks', 'bank_accounts', 'cards', 'employees']
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      console.log(`   ${table}: ${count || 0} записей`)
    }

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
  }
}

initDatabase()
