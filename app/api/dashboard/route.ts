// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET DASHBOARD API CALLED ===')
    
    const supabase = createAdminClient()
    
    // Проверяем права доступа
    let currentUser
    try {
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

      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      currentUser = user
      
      // Только Admin, CFO и Manager могут видеть дашборд
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра дашборда. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра дашборда' },
        { status: 403 }
      )
    }

    // Получаем общую статистику
    const { data: banks } = await supabase
      .from('banks')
      .select('*', { count: 'exact' })

    const { data: cards } = await supabase
      .from('cards')
      .select('*', { count: 'exact' })

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })

    const { data: employees } = await supabase
      .from('employees')
      .select('*', { count: 'exact' })

    const { data: casinos } = await supabase
      .from('casinos')
      .select('*', { count: 'exact' })

    // Получаем общую прибыль
    const { data: profitData } = await supabase
      .from('transactions')
      .select('profit')

    const totalProfit = profitData?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0

    // Получаем статистику карт
    const { data: cardStats } = await supabase
      .from('cards')
      .select('status')

    const cardStatsCount = {
      free: cardStats?.filter(c => c.status === 'free').length || 0,
      assigned: cardStats?.filter(c => c.status === 'assigned').length || 0,
      in_process: cardStats?.filter(c => c.status === 'in_process').length || 0,
      completed: cardStats?.filter(c => c.status === 'completed').length || 0
    }

    // Получаем статистику транзакций
    const { data: transactionStats } = await supabase
      .from('transactions')
      .select('transaction_type, status')

    const transactionStatsCount = {
      deposits: transactionStats?.filter(t => t.transaction_type === 'deposit').length || 0,
      withdrawals: transactionStats?.filter(t => t.transaction_type === 'withdrawal').length || 0,
      pending: transactionStats?.filter(t => t.status === 'pending').length || 0,
      completed: transactionStats?.filter(t => t.status === 'completed').length || 0
    }

    // Получаем последние транзакции
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select(`
        *,
        cards (
          card_number,
          card_type
        ),
        casinos (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    const dashboardData = {
      summary: {
        total_banks: banks?.length || 0,
        total_cards: cards?.length || 0,
        total_transactions: transactions?.length || 0,
        total_employees: employees?.length || 0,
        total_casinos: casinos?.length || 0,
        total_profit: totalProfit
      },
      card_stats: cardStatsCount,
      transaction_stats: transactionStatsCount,
      recent_transactions: recentTransactions || []
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
