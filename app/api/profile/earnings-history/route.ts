import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== EARNINGS HISTORY API CALLED ===')
    
    // Проверяем аутентификацию
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

    const supabase = createClient()
    
    // Получаем данные пользователя
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Получаем историю заработка из таблицы salary_calculations
    const { data: earnings, error } = await supabase
      .from('salary_calculations')
      .select(`
        id,
        month,
        total_salary,
        status,
        calculated_at,
        paid_at
      `)
      .eq('employee_id', decoded.userId)
      .order('month', { ascending: false })

    if (error) {
      console.error('Error fetching earnings history:', error)
      return NextResponse.json({ 
        earnings: [],
        error: 'Failed to fetch earnings history' 
      })
    }

    // Форматируем данные
    const formattedEarnings = (earnings || []).map((earning: any) => ({
      id: earning.id,
      month: earning.month,
      total_earnings: earning.total_salary || 0,
      transactions_count: 0, // TODO: Добавить подсчет транзакций
      average_per_transaction: earning.total_salary || 0,
      status: earning.status || 'pending',
      paid_at: earning.paid_at
    }))

    return NextResponse.json({ 
      earnings: formattedEarnings 
    })

  } catch (error) {
    console.error('Error in GET /api/profile/earnings-history:', error)
    return NextResponse.json({ 
      earnings: [],
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
