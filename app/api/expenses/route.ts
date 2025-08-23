import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCFO, logActivity, getClientIP } from '@/lib/auth'
import { z } from 'zod'

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount_usd: z.number().positive('Amount must be positive'),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
})

export async function POST(request: NextRequest) {
  try {
    // Проверяем права CFO
    const currentUser = await requireCFO()
    const clientIP = getClientIP(request)
    
    const body = await request.json()
    const expenseData = expenseSchema.parse(body)
    
    const supabase = createAdminClient()
    
    // Извлекаем месяц из даты
    const month = expenseData.expense_date.slice(0, 7)
    
    // Создаем расход
    const { data: newExpense, error: createError } = await supabase
      .from('expenses')
      .insert({
        description: expenseData.description,
        amount_usd: expenseData.amount_usd,
        expense_date: expenseData.expense_date,
        month,
        created_by: currentUser.id
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating expense:', createError)
      return NextResponse.json(
        { error: 'Ошибка при создании расхода' },
        { status: 500 }
      )
    }

    // Логируем создание расхода
    await logActivity(
      currentUser.id,
      'expense_created',
      {
        expense_id: newExpense.id,
        amount: newExpense.amount_usd,
        description: newExpense.description,
        month
      },
      clientIP,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      success: true,
      expense: newExpense,
      message: 'Расход успешно добавлен'
    })

  } catch (error) {
    console.error('Create expense error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные расхода', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Получение списка расходов
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireCFO()
    const supabase = createAdminClient()
    
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let query = supabase
      .from('expenses')
      .select(`
        id,
        description,
        amount_usd,
        expense_date,
        month,
        created_at,
        created_by,
        users!expenses_created_by_fkey (
          username,
          full_name
        )
      `)
      .order('expense_date', { ascending: false })
      .limit(limit)

    if (month) {
      query = query.eq('month', month)
    }

    const { data: expenses, error } = await query

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении списка расходов' },
        { status: 500 }
      )
    }

    // Подсчитываем общую сумму
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount_usd, 0)

    return NextResponse.json({
      expenses,
      total_amount: totalAmount,
      count: expenses.length
    })

  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
