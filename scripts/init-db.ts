import 'dotenv/config'
import { createAdminClient } from '../lib/supabase/admin'
import { hashPassword } from '../lib/auth'

async function initializeDatabase() {
  const supabase = createAdminClient()
  
  console.log('🚀 Инициализация базы данных...')

  try {
    // 1. Создаем тестовых пользователей
    console.log('📝 Создание тестовых пользователей...')
    
    const adminPassword = await hashPassword('admin123')
    const managerPassword = await hashPassword('manager123')
    const hrPassword = await hashPassword('hr123')
    const cfoPassword = await hashPassword('cfo123')
    const employeePassword = await hashPassword('employee123')
    const testerPassword = await hashPassword('tester123')

    // Admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        email: 'admin@affectivity.com',
        password_hash: adminPassword,
        full_name: 'Администратор Системы',
        role: 'Admin',
        is_active: true
      })
      .select()
      .single()

    if (adminError) {
      console.error('Error creating admin:', adminError)
    } else {
      console.log('✅ Admin создан:', admin.username)
    }

    // Manager
    const { data: manager, error: managerError } = await supabase
      .from('users')
      .insert({
        username: 'manager',
        email: 'manager@affectivity.com',
        password_hash: managerPassword,
        full_name: 'Менеджер Команды',
        role: 'Manager',
        is_active: true
      })
      .select()
      .single()

    if (managerError) {
      console.error('Error creating manager:', managerError)
    } else {
      console.log('✅ Manager создан:', manager.username)
    }

    // HR
    const { data: hr, error: hrError } = await supabase
      .from('users')
      .insert({
        username: 'hr',
        email: 'hr@affectivity.com',
        password_hash: hrPassword,
        full_name: 'HR Менеджер',
        role: 'HR',
        is_active: true
      })
      .select()
      .single()

    if (hrError) {
      console.error('Error creating HR:', hrError)
    } else {
      console.log('✅ HR создан:', hr.username)
    }

    // CFO
    const { data: cfo, error: cfoError } = await supabase
      .from('users')
      .insert({
        username: 'cfo',
        email: 'cfo@affectivity.com',
        password_hash: cfoPassword,
        full_name: 'Финансовый Директор',
        role: 'CFO',
        is_active: true
      })
      .select()
      .single()

    if (cfoError) {
      console.error('Error creating CFO:', cfoError)
    } else {
      console.log('✅ CFO создан:', cfo.username)
    }

    // Employee
    const { data: employee, error: employeeError } = await supabase
      .from('users')
      .insert({
        username: 'employee',
        email: 'employee@affectivity.com',
        password_hash: employeePassword,
        full_name: 'Тестовый Сотрудник',
        role: 'Employee',
        usdt_address: '0x742d35Cc6634C0532925a3b844Bc454e44348f44',
        usdt_network: 'BEP20',
        is_active: true
      })
      .select()
      .single()

    if (employeeError) {
      console.error('Error creating employee:', employeeError)
    } else {
      console.log('✅ Employee создан:', employee.username)
      
      // Создаем запись в employees
      const { error: employeeRecordError } = await supabase
        .from('employees')
        .insert({
          user_id: employee.id,
          percentage_rate: 10.00,
          is_active: true
        })

      if (employeeRecordError) {
        console.error('Error creating employee record:', employeeRecordError)
      }
    }

    // Tester
    const { data: tester, error: testerError } = await supabase
      .from('users')
      .insert({
        username: 'tester',
        email: 'tester@affectivity.com',
        password_hash: testerPassword,
        full_name: 'Тестировщик',
        role: 'Tester',
        usdt_address: '0x1234567890123456789012345678901234567890',
        usdt_network: 'BEP20',
        is_active: true
      })
      .select()
      .single()

    if (testerError) {
      console.error('Error creating tester:', testerError)
    } else {
      console.log('✅ Tester создан:', tester.username)
      
      // Создаем запись в employees
      const { error: testerRecordError } = await supabase
        .from('employees')
        .insert({
          user_id: tester.id,
          percentage_rate: 10.00,
          is_active: true
        })

      if (testerRecordError) {
        console.error('Error creating tester record:', testerRecordError)
      }
    }

    // 2. Создаем тестовые казино
    console.log('🎰 Создание тестовых казино...')
    
    const { data: casinos, error: casinosError } = await supabase
      .from('casinos')
      .insert([
        {
          name: 'Bet365',
          url: 'https://bet365.com',
          commission_rate: 5.00,
          is_active: true
        },
        {
          name: '888 Casino',
          url: 'https://888casino.com',
          commission_rate: 4.50,
          is_active: true
        },
        {
          name: 'William Hill',
          url: 'https://williamhill.com',
          commission_rate: 4.00,
          is_active: true
        }
      ])
      .select()

    if (casinosError) {
      console.error('Error creating casinos:', casinosError)
    } else {
      console.log('✅ Казино созданы:', casinos.length)
    }

    // 3. Создаем тестовые карты
    console.log('💳 Создание тестовых карт...')
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .insert([
        {
          card_number: '4242424242424242',
          card_bin: '424242',
          card_holder: 'Test User',
          expiry_date: '12/25',
          status: 'available'
        },
        {
          card_number: '4141414141414141',
          card_bin: '414141',
          card_holder: 'Test User 2',
          expiry_date: '11/25',
          status: 'available'
        },
        {
          card_number: '4000400040004000',
          card_bin: '400040',
          card_holder: 'Test User 3',
          expiry_date: '10/25',
          status: 'available'
        }
      ])
      .select()

    if (cardsError) {
      console.error('Error creating cards:', cardsError)
    } else {
      console.log('✅ Карты созданы:', cards.length)
    }

    // 4. Создаем тестовые транзакции
    console.log('💰 Создание тестовых транзакций...')
    
    if (employee && casinos && casinos.length > 0) {
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .insert([
          {
            employee_id: employee.id,
            casino_id: casinos[0].id,
            transaction_type: 'deposit',
            amount: 1000.00,
            profit: 238.46,
            status: 'completed',
            transaction_date: new Date().toISOString()
          },
          {
            employee_id: employee.id,
            casino_id: casinos[1].id,
            transaction_type: 'withdrawal',
            amount: 500.00,
            profit: 185.60,
            status: 'completed',
            transaction_date: new Date().toISOString()
          },
          {
            employee_id: employee.id,
            casino_id: casinos[2].id,
            transaction_type: 'bonus',
            amount: 200.00,
            profit: 324.50,
            status: 'completed',
            transaction_date: new Date().toISOString()
          }
        ])
        .select()

      if (transactionsError) {
        console.error('Error creating transactions:', transactionsError)
      } else {
        console.log('✅ Транзакции созданы:', transactions.length)
      }
    }

    // 5. Создаем тестовые расходы
    console.log('📊 Создание тестовых расходов...')
    
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .insert([
        {
          description: 'Комиссии банков',
          amount_usd: 1250.00,
          expense_date: '2025-01-22',
          month: currentMonth,
          created_by: cfo?.id
        },
        {
          description: 'Реклама казино',
          amount_usd: 2500.00,
          expense_date: '2025-01-20',
          month: currentMonth,
          created_by: cfo?.id
        },
        {
          description: 'Серверы и хостинг',
          amount_usd: 489.76,
          expense_date: '2025-01-15',
          month: currentMonth,
          created_by: cfo?.id
        }
      ])
      .select()

    if (expensesError) {
      console.error('Error creating expenses:', expensesError)
    } else {
      console.log('✅ Расходы созданы:', expenses.length)
    }

    console.log('🎉 Инициализация базы данных завершена!')
    console.log('\n📋 Тестовые аккаунты:')
    console.log('👑 Admin: admin / admin123')
    console.log('🎯 Manager: manager / manager123')
    console.log('👥 HR: hr / hr123')
    console.log('💼 CFO: cfo / cfo123')
    console.log('👤 Employee: employee / employee123')
    console.log('🧪 Tester: tester / tester123')

  } catch (error) {
    console.error('❌ Ошибка инициализации:', error)
  }
}

// Запускаем инициализацию
initializeDatabase()
