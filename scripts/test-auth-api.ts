import { config } from 'dotenv'
import { createAdminClient } from '../lib/supabase/admin'

// Загружаем переменные окружения
config({ path: '.env.local' })

async function testAuthAPI() {
  console.log('=== ТЕСТИРОВАНИЕ API АУТЕНТИФИКАЦИИ ===')
  
  try {
    const supabase = createAdminClient()
    
    // 1. Проверяем подключение к базе данных
    console.log('\n1. Проверка подключения к базе данных...')
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('id, username, role')
      .limit(1)
    
    if (testError) {
      console.error('❌ Ошибка подключения к базе данных:', testError)
      return
    }
    
    console.log('✅ Подключение к базе данных успешно')
    console.log('Найдено пользователей:', testUser?.length || 0)
    
    // 2. Проверяем наличие пользователей с разными ролями
    console.log('\n2. Проверка пользователей по ролям...')
    const roles = ['Admin', 'CFO', 'Manager', 'Employee', 'Tester', 'HR']
    
    for (const role of roles) {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, role, is_active')
        .eq('role', role)
        .eq('is_active', true)
      
      if (error) {
        console.error(`❌ Ошибка при получении пользователей с ролью ${role}:`, error)
      } else {
        console.log(`✅ ${role}: ${users?.length || 0} активных пользователей`)
        if (users && users.length > 0) {
          console.log(`   Примеры: ${users.slice(0, 3).map(u => u.username).join(', ')}`)
        }
      }
    }
    
    // 3. Проверяем структуру таблицы users
    console.log('\n3. Проверка структуры таблицы users...')
    const { data: userColumns, error: columnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (columnsError) {
      console.error('❌ Ошибка при получении структуры таблицы:', columnsError)
    } else if (userColumns && userColumns.length > 0) {
      const columns = Object.keys(userColumns[0])
      console.log('✅ Структура таблицы users:')
      console.log('   Колонки:', columns.join(', '))
      
      // Проверяем наличие обязательных полей
      const requiredFields = ['id', 'username', 'password_hash', 'role', 'is_active']
      const missingFields = requiredFields.filter(field => !columns.includes(field))
      
      if (missingFields.length > 0) {
        console.error('❌ Отсутствуют обязательные поля:', missingFields)
      } else {
        console.log('✅ Все обязательные поля присутствуют')
      }
    }
    
    // 4. Проверяем наличие тестового пользователя Admin
    console.log('\n4. Проверка тестового пользователя Admin...')
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, username, role, is_active, password_hash')
      .eq('role', 'Admin')
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (adminError) {
      console.error('❌ Ошибка при получении Admin пользователя:', adminError)
    } else if (adminUser) {
      console.log('✅ Admin пользователь найден:', adminUser.username)
      console.log('   ID:', adminUser.id)
      console.log('   Роль:', adminUser.role)
      console.log('   Активен:', adminUser.is_active)
      console.log('   Хеш пароля:', adminUser.password_hash ? 'Присутствует' : 'Отсутствует')
    } else {
      console.log('⚠️ Admin пользователь не найден')
    }
    
    console.log('\n=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===')
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

testAuthAPI()
