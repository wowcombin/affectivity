// @ts-nocheck
import 'dotenv/config'
import { createAdminClient } from '../lib/supabase/admin'
import { hashPassword } from '../lib/auth'

async function initDatabase() {
  const supabase = createAdminClient()
  
  console.log('🚀 Инициализация базы данных...')

  try {
    // Создаем тестовых пользователей
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
        full_name: 'HR Специалист',
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
        full_name: 'Сотрудник Тестовый',
        role: 'Employee',
        is_active: true
      })
      .select()
      .single()

    if (employeeError) {
      console.error('Error creating employee:', employeeError)
    } else {
      console.log('✅ Employee создан:', employee.username)
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
        is_active: true
      })
      .select()
      .single()

    if (testerError) {
      console.error('Error creating tester:', testerError)
    } else {
      console.log('✅ Tester создан:', tester.username)
    }

    // Создаем записи сотрудников
    const users = [admin, manager, hr, cfo, employee, tester].filter(Boolean)
    
    for (const user of users) {
      const { error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: user.id,
          hire_date: new Date().toISOString(),
          is_active: true
        })

      if (employeeError) {
        console.error(`Error creating employee record for ${user.username}:`, employeeError)
      } else {
        console.log(`✅ Employee record создан для ${user.username}`)
      }
    }

    // Создаем тестовые казино
    const { data: casinos, error: casinosError } = await supabase
      .from('casinos')
      .insert([
        { name: 'Casino A', url: 'https://casino-a.com', is_active: true },
        { name: 'Casino B', url: 'https://casino-b.com', is_active: true },
        { name: 'Casino C', url: 'https://casino-c.com', is_active: true }
      ])
      .select()

    if (casinosError) {
      console.error('Error creating casinos:', casinosError)
    } else {
      console.log('✅ Casinos созданы:', casinos.length)
    }

    // Создаем тестовые карты
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .insert([
        { 
          employee_id: employee.id, 
          card_number: '1234567890123456',
          card_type: 'Visa',
          status: 'active',
          issue_date: new Date().toISOString()
        },
        { 
          employee_id: tester.id, 
          card_number: '9876543210987654',
          card_type: 'MasterCard',
          status: 'active',
          issue_date: new Date().toISOString()
        }
      ])
      .select()

    if (cardsError) {
      console.error('Error creating cards:', cardsError)
    } else {
      console.log('✅ Cards созданы:', cards.length)
    }

    // Создаем тестовые транзакции
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .insert([
        {
          employee_id: employee.id,
          casino_id: casinos[0].id,
          transaction_date: new Date().toISOString(),
          amount: 1000,
          profit: 238.46,
          status: 'completed'
        },
        {
          employee_id: employee.id,
          casino_id: casinos[1].id,
          transaction_date: new Date().toISOString(),
          amount: 1500,
          profit: 357.69,
          status: 'completed'
        },
        {
          employee_id: tester.id,
          casino_id: casinos[2].id,
          transaction_date: new Date().toISOString(),
          amount: 800,
          profit: 190.77,
          status: 'completed'
        }
      ])
      .select()

    if (transactionsError) {
      console.error('Error creating transactions:', transactionsError)
    } else {
      console.log('✅ Transactions созданы:', transactions.length)
    }

    // Создаем тестовые расходы
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .insert([
        {
          description: 'Офисные расходы',
          amount_usd: 500,
          month: new Date().toISOString().slice(0, 7),
          category: 'office',
          added_by: cfo.id
        },
        {
          description: 'Маркетинг',
          amount_usd: 300,
          month: new Date().toISOString().slice(0, 7),
          category: 'marketing',
          added_by: cfo.id
        }
      ])
      .select()

    if (expensesError) {
      console.error('Error creating expenses:', expensesError)
    } else {
      console.log('✅ Expenses созданы:', expenses.length)
    }

    console.log('🎉 База данных успешно инициализирована!')
    console.log('\n📋 Тестовые аккаунты:')
    console.log('Admin: admin / admin123')
    console.log('Manager: manager / manager123')
    console.log('HR: hr / hr123')
    console.log('CFO: cfo / cfo123')
    console.log('Employee: employee / employee123')
    console.log('Tester: tester / tester123')

  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)
  }
}

initDatabase()
