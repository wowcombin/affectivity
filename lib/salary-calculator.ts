// @ts-nocheck
import { createAdminClient } from '@/lib/supabase/admin'
import { CalculationBase, UserRole } from '@/types/database'

// Получение общего профита всех сотрудников за месяц
export async function getTotalEmployeesProfit(month: string): Promise<number> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('profit')
    .gte('transaction_date', `${month}-01`)
    .lt('transaction_date', `${month}-32`)
    .not('profit', 'is', null)

  if (error) {
    console.error('Error getting total profit:', error)
    return 0
  }

  return data.reduce((sum, transaction) => sum + (transaction.profit || 0), 0)
}

// Получение профита конкретного сотрудника за месяц
export async function getMonthlyProfit(employeeId: string, month: string): Promise<number> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('profit')
    .eq('employee_id', employeeId)
    .gte('transaction_date', `${month}-01`)
    .lt('transaction_date', `${month}-32`)
    .not('profit', 'is', null)

  if (error) {
    console.error('Error getting monthly profit:', error)
    return 0
  }

  return data.reduce((sum, transaction) => sum + (transaction.profit || 0), 0)
}

// Получение расходов за месяц
export async function getMonthlyExpenses(month: string): Promise<number> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('amount_usd')
    .eq('month', month)

  if (error) {
    console.error('Error getting monthly expenses:', error)
    return 0
  }

  return data.reduce((sum, expense) => sum + expense.amount_usd, 0)
}

// Получение активных сотрудников
export async function getActiveEmployees() {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('employees')
    .select(`
      id,
      user_id,
      users!inner (
        username,
        full_name,
        role
      )
    `)
    .eq('is_active', true)

  if (error) {
    console.error('Error getting active employees:', error)
    return []
  }

  return data
}

// Получение пользователей по роли
export async function getUsersByRole(role: UserRole) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)

  if (error) {
    console.error('Error getting users by role:', error)
    return []
  }

  return data
}

// Проверка является ли сотрудник лидером месяца
export async function isMonthLeader(employeeId: string, month: string): Promise<boolean> {
  const supabase = createAdminClient()
  
  // Получаем максимальный профит за месяц
  const { data: maxProfitData, error: maxError } = await supabase
    .from('transactions')
    .select('profit')
    .gte('transaction_date', `${month}-01`)
    .lt('transaction_date', `${month}-32`)
    .not('profit', 'is', null)
    .order('profit', { ascending: false })
    .limit(1)

  if (maxError || !maxProfitData.length) {
    return false
  }

  const maxProfit = maxProfitData[0].profit

  // Проверяем профит конкретного сотрудника
  const { data: employeeProfitData, error: employeeError } = await supabase
    .from('transactions')
    .select('profit')
    .eq('employee_id', employeeId)
    .gte('transaction_date', `${month}-01`)
    .lt('transaction_date', `${month}-32`)
    .not('profit', 'is', null)

  if (employeeError || !employeeProfitData.length) {
    return false
  }

  const employeeProfit = employeeProfitData.reduce((sum, t) => sum + (t.profit || 0), 0)

  return employeeProfit === maxProfit
}

// Сохранение зарплаты сотрудника
export async function saveSalary(salaryData: {
  employee_id: string
  month: string
  base_salary: number
  performance_bonus: number
  leader_bonus: number
  total_salary: number
}) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('salaries')
    .upsert(salaryData, { onConflict: 'employee_id,month' })

  if (error) {
    console.error('Error saving salary:', error)
    throw error
  }
}

// Сохранение заработка по роли
export async function saveRoleEarnings(earningsData: {
  user_id: string
  role: string
  month: string
  total_employees_profit: number
  percentage: number
  total_earnings: number
}) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('role_earnings')
    .upsert(earningsData, { onConflict: 'user_id,role,month' })

  if (error) {
    console.error('Error saving role earnings:', error)
    throw error
  }
}

// Сохранение расчета зарплат
export async function saveSalaryCalculation(calculationData: {
  month: string
  gross_profit: number
  total_expenses: number
  expense_percentage: number
  net_profit: number
  calculation_base: CalculationBase
}) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('salary_calculations')
    .upsert(calculationData, { onConflict: 'month' })

  if (error) {
    console.error('Error saving salary calculation:', error)
    throw error
  }
}

// Основная функция расчета всех зарплат
export async function calculateAllSalaries(month: string) {
  const supabase = createAdminClient()
  
  try {
    // 1. Получаем общий профит всех сотрудников
    const totalEmployeesProfit = await getTotalEmployeesProfit(month)
    
    // 2. Получаем расходы за месяц
    const totalExpenses = await getMonthlyExpenses(month)
    
    // 3. Рассчитываем процент расходов
    const expensePercentage = totalEmployeesProfit > 0 ? (totalExpenses / totalEmployeesProfit) * 100 : 0
    const netProfit = totalEmployeesProfit - totalExpenses
    
    // 4. Определяем базу для расчета
    const calculationBase: CalculationBase = expensePercentage > 20 ? 'net' : 'gross'
    const baseAmount = calculationBase === 'net' ? netProfit : totalEmployeesProfit

    // Сохраняем детали расчета
    await saveSalaryCalculation({
      month,
      gross_profit: totalEmployeesProfit,
      total_expenses: totalExpenses,
      expense_percentage: expensePercentage,
      net_profit: netProfit,
      calculation_base: calculationBase
    })

    // 5. Расчет для сотрудников (всегда от своего профита)
    const employees = await getActiveEmployees()
    for (const employee of employees) {
      const profit = await getMonthlyProfit(employee.id, month)
      const baseSalary = profit * 0.10 // 10% от своего профита
      const performanceBonus = profit >= 2000 ? 200 : 0
      const isLeader = await isMonthLeader(employee.id, month)
      const leaderBonus = isLeader ? profit * 0.10 : 0 // 10% от профита если лидер

      await saveSalary({
        employee_id: employee.id,
        month,
        base_salary: baseSalary,
        performance_bonus: performanceBonus,
        leader_bonus: leaderBonus,
        total_salary: baseSalary + performanceBonus + leaderBonus
      })
    }

    // 6. Расчет для Manager, HR, CFO (от общего профита)
    const roles = [
      { role: 'Manager' as UserRole, percentage: 0.10 },
      { role: 'HR' as UserRole, percentage: 0.05 },
      { role: 'CFO' as UserRole, percentage: 0.05 }
    ]

    for (const { role, percentage } of roles) {
      const users = await getUsersByRole(role)
      for (const user of users) {
        await saveRoleEarnings({
          user_id: user.id,
          role,
          month,
          total_employees_profit: totalEmployeesProfit,
          percentage,
          total_earnings: baseAmount * percentage
        })
      }
    }

    // 7. Расчет для Tester (10% от работающих по их сайтам)
    const testers = await getUsersByRole('Tester')
    for (const tester of testers) {
      // Здесь должна быть логика для определения казино тестера
      // и расчета от профита сотрудников, работающих с этими казино
      // Пока что используем базовый расчет
      await saveRoleEarnings({
        user_id: tester.id,
        role: 'Tester',
        month,
        total_employees_profit: totalEmployeesProfit,
        percentage: 0.10,
        total_earnings: baseAmount * 0.10
      })
    }

    return {
      success: true,
      month,
      gross_profit: totalEmployeesProfit,
      total_expenses: totalExpenses,
      expense_percentage: expensePercentage,
      net_profit: netProfit,
      calculation_base: calculationBase,
      employees_processed: employees.length
    }

  } catch (error) {
    console.error('Error calculating salaries:', error)
    throw error
  }
}

// Получение статистики для дашборда
export async function getDashboardStats(month: string) {
  const supabase = createAdminClient()
  
  try {
    // Общий профит
    const totalProfit = await getTotalEmployeesProfit(month)
    
    // Профит за месяц
    const monthlyProfit = totalProfit // для текущего месяца это то же самое
    
    // Расходы
    const totalExpenses = await getMonthlyExpenses(month)
    const expensePercentage = totalProfit > 0 ? (totalExpenses / totalProfit) * 100 : 0
    
    // Количество сотрудников
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeEmployees } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    // Невыплаченные зарплаты
    const { count: pendingSalaries } = await supabase
      .from('salaries')
      .select('*', { count: 'exact', head: true })
      .eq('month', month)
      .eq('is_paid', false)

    return {
      total_employees: totalEmployees || 0,
      active_employees: activeEmployees || 0,
      total_profit: totalProfit,
      monthly_profit: monthlyProfit,
      pending_salaries: pendingSalaries || 0,
      total_expenses: totalExpenses,
      expense_percentage: expensePercentage
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      total_employees: 0,
      active_employees: 0,
      total_profit: 0,
      monthly_profit: 0,
      pending_salaries: 0,
      total_expenses: 0,
      expense_percentage: 0
    }
  }
}
