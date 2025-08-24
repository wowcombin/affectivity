// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET TRANSACTIONS API CALLED ===')
    
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
      
      // Только Admin, CFO и Manager могут видеть транзакции
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        console.log('User role not allowed for transactions access:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра транзакций. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра транзакций', details: authError.message },
        { status: 403 }
      )
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        cards (
          card_number,
          card_type
        ),
        casinos (
          name
        ),
        employees (
          user_id,
          users (
            username,
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error('Error in GET /api/transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST TRANSACTIONS API CALLED ===')
    
    // Создаем клиент Supabase в начале
    const supabase = createAdminClient()
    console.log('Supabase client created')
    
    const body = await request.json()
    console.log('Request body:', body)
    
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
      
      // Только Admin, CFO и Manager могут создавать транзакции
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        console.log('User role not allowed for transaction creation:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для создания транзакций. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания транзакций', details: authError.message },
        { status: 403 }
      )
    }

    const { employee_id, card_id, casino_id, transaction_type, amount, profit, status, notes } = body

    // Валидация
    if (!employee_id || !card_id || !casino_id || !transaction_type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['deposit', 'withdrawal'].includes(transaction_type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 })
    }

    const transactionData = {
      employee_id,
      card_id,
      casino_id,
      transaction_type,
      amount: parseFloat(amount),
      profit: profit ? parseFloat(profit) : 0,
      status: status || 'pending',
      transaction_date: new Date().toISOString(),
      notes: notes || null
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
    }

    return NextResponse.json({ transaction: data })
  } catch (error) {
    console.error('Error in POST /api/transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
