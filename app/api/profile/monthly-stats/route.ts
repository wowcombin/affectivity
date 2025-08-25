import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== MONTHLY STATS API CALLED ===')
    
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

    // Получаем месячную статистику из таблицы salary_calculations
    const { data: monthlyStats, error } = await supabase
      .from('salary_calculations')
      .select(`
        month,
        total_salary,
        employee_name
      `)
      .order('month', { ascending: false })
      .limit(12) // Последние 12 месяцев

    if (error) {
      console.error('Error fetching monthly stats:', error)
      return NextResponse.json({ 
        stats: [],
        error: 'Failed to fetch monthly stats' 
      })
    }

    // Группируем по месяцам
    const statsMap = new Map()
    
    ;(monthlyStats || []).forEach((stat: any) => {
      if (statsMap.has(stat.month)) {
        const existing = statsMap.get(stat.month)
        existing.total_earnings += stat.total_salary || 0
        existing.transactions_count += 1
        
        // Обновляем топ заработавшего
        if ((stat.total_salary || 0) > existing.top_earner_amount) {
          existing.top_earner = stat.employee_name || 'Unknown'
          existing.top_earner_amount = stat.total_salary || 0
        }
      } else {
        statsMap.set(stat.month, {
          month: stat.month,
          total_earnings: stat.total_salary || 0,
          transactions_count: 1,
          average_per_transaction: stat.total_salary || 0,
          top_earner: stat.employee_name || 'Unknown',
          top_earner_amount: stat.total_salary || 0
        })
      }
    })

    // Вычисляем средние значения и форматируем
    const formattedStats = Array.from(statsMap.values()).map(stat => ({
      ...stat,
      average_per_transaction: stat.transactions_count > 0 
        ? stat.total_earnings / stat.transactions_count 
        : 0
    }))

    return NextResponse.json({ 
      stats: formattedStats 
    })

  } catch (error) {
    console.error('Error in GET /api/profile/monthly-stats:', error)
    return NextResponse.json({ 
      stats: [],
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
