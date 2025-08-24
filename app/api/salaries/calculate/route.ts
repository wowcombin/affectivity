import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyToken, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const calculationSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format (YYYY-MM)')
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST SALARIES CALCULATE API CALLED ===')
    
    let authToken = request.cookies.get('auth-token')?.value
    
    if (!authToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.substring(7)
      }
    }

    if (!authToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const clientIP = getClientIP(request)
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Проверяем права доступа
    if (!['Admin', 'CFO', 'HR'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = calculationSchema.parse(body)

    // Получаем всех сотрудников
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        salary,
        user:users (
          role
        )
      `)
      .eq('is_active', true)

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    // Получаем рабочие записи за месяц
    const startDate = `${validatedData.month}-01`
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: workEntries, error: workEntriesError } = await supabase
      .from('work_entries')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (workEntriesError) {
      console.error('Error fetching work entries:', workEntriesError)
      return NextResponse.json({ error: 'Failed to fetch work entries' }, { status: 500 })
    }

    // Получаем курс USD (Google курс -5%)
    const usdRate = 0.95 // Примерный курс, в реальности нужно получать через API

    // Рассчитываем зарплаты
    const calculations = []
    const totalGross = workEntries.reduce((sum, entry) => sum + entry.withdrawal_amount, 0)

    for (const employee of employees) {
      // Получаем записи сотрудника за месяц
      const employeeEntries = workEntries.filter(entry => {
        const { data: entryUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', entry.user_id)
          .single()
        return entryUser?.id === employee.user.id
      })

      const employeeGross = employeeEntries.reduce((sum, entry) => sum + entry.withdrawal_amount, 0)
      
      let baseSalary = 0
      let bonusAmount = 0
      let leaderBonus = 0

      // Расчет по ролям
      if (employee.user.role === 'Employee') {
        // Сотрудники: 10% от брутто + $200 (если брутто > $200)
        baseSalary = employeeGross * 0.1
        if (employeeGross > 200) {
          bonusAmount = 200
        }

        // Лидер месяца: +10% от максимальной транзакции
        if (employeeEntries.length > 0) {
          const maxTransaction = Math.max(...employeeEntries.map(entry => entry.withdrawal_amount))
          leaderBonus = maxTransaction * 0.1
        }
      } else if (employee.user.role === 'Manager') {
        // Менеджеры: 10% от общего брутто
        baseSalary = totalGross * 0.1
      } else if (employee.user.role === 'CFO') {
        // CFO: 10% от общего брутто
        baseSalary = totalGross * 0.1
      } else if (employee.user.role === 'Admin') {
        // Admin: 10% от общего брутто
        baseSalary = totalGross * 0.1
      }

      const totalSalary = baseSalary + bonusAmount + leaderBonus
      const usdAmount = totalSalary * usdRate

      // Создаем запись расчета
      const { data: calculation, error: calculationError } = await supabase
        .from('salary_calculations')
        .insert({
          employee_id: employee.id,
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_role: employee.user.role,
          month: validatedData.month,
          year: new Date(validatedData.month + '-01').getFullYear(),
          base_salary: baseSalary,
          gross_amount: employeeGross,
          bonus_amount: bonusAmount,
          leader_bonus: leaderBonus,
          total_salary: totalSalary,
          currency: 'USD',
          usd_rate: usdRate,
          usd_amount: usdAmount,
          status: 'calculated',
          calculated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (calculationError) {
        console.error('Error creating salary calculation:', calculationError)
        continue
      }

      calculations.push(calculation)
    }

    // Логируем расчет зарплат
    await logActivity(
      currentUser.id,
      'salaries_calculated',
      {
        month: validatedData.month,
        employee_count: employees.length,
        total_gross: totalGross,
        calculations_count: calculations.length
      },
      clientIP || undefined,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({ 
      success: true,
      calculations: calculations,
      message: `Зарплаты рассчитаны для ${calculations.length} сотрудников` 
    })
  } catch (error) {
    console.error('Error in POST /api/salaries/calculate:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
