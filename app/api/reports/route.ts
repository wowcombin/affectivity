// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET REPORTS API CALLED ===')
    
    // Создаем клиент Supabase в начале
    const supabase = createAdminClient()
    console.log('Supabase client created')
    
    // Проверяем права доступа
    console.log('Checking permissions...')
    let currentUser
    try {
      // Простая проверка аутентификации прямо здесь
      let authToken = request.cookies.get('auth-token')?.value
      
      if (!authToken) {
        const authHeader = request.headers.get('authorization')
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authToken = authHeader.substring(7)
        }
      }

      if (!authToken) {
        return NextResponse.json(
          { error: 'No auth token' },
          { status: 401 }
        )
      }

      // Верифицируем токен
      const jwt = require('jsonwebtoken')
      const decoded = jwt.verify(authToken, process.env.SUPABASE_JWT_SECRET)
      
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Получаем пользователя из базы
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (error || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      currentUser = user
      console.log('Current user from API auth:', { id: currentUser.id, username: currentUser.username, role: currentUser.role })
      
      // Только Admin, CFO и Manager могут видеть отчеты
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        console.log('User role not allowed for reports access:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра отчетов. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра отчетов', details: authError.message },
        { status: 403 }
      )
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let reportData = {}

    switch (type) {
      case 'summary':
        // Общая статистика
        const { data: banksCount } = await supabase
          .from('banks')
          .select('*', { count: 'exact' })
        
        const { data: cardsCount } = await supabase
          .from('cards')
          .select('*', { count: 'exact' })
        
        const { data: transactionsCount } = await supabase
          .from('transactions')
          .select('*', { count: 'exact' })
        
        reportData = {
          banks: banksCount?.length || 0,
          cards: cardsCount?.length || 0,
          transactions: transactionsCount?.length || 0
        }
        break

      case 'transactions':
        // Отчет по транзакциям
        let query = supabase
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

        if (startDate) {
          query = query.gte('created_at', startDate)
        }
        if (endDate) {
          query = query.lte('created_at', endDate)
        }

        const { data: transactions } = await query
        reportData = { transactions: transactions || [] }
        break

      case 'cards':
        // Отчет по картам
        const { data: cards } = await supabase
          .from('cards')
          .select(`
            *,
            bank_accounts (
              account_name,
              banks (
                name
              )
            )
          `)
          .order('created_at', { ascending: false })

        reportData = { cards: cards || [] }
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({ report: reportData })
  } catch (error) {
    console.error('Error in GET /api/reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
