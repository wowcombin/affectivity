// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET CARDS API CALLED ===')
    
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
      
      // Только CFO, Admin и Manager могут видеть карты
      if (!['Admin', 'CFO', 'Manager'].includes(currentUser.role)) {
        console.log('User role not allowed for cards access:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра карт. Требуется роль Admin, CFO или Manager.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра карт', details: authError.message },
        { status: 403 }
      )
    }

    const { data: cards, error } = await supabase
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

    if (error) {
      console.error('Error fetching cards:', error)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    return NextResponse.json({ cards: cards || [] })
  } catch (error) {
    console.error('Error in GET /api/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST CARDS API CALLED ===')
    
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
      
      // Только CFO и Admin могут создавать карты
      if (!['Admin', 'CFO'].includes(currentUser.role)) {
        console.log('User role not allowed for cards creation:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для создания карт. Требуется роль Admin или CFO.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания карт', details: authError.message },
        { status: 403 }
      )
    }

    const {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type
    } = body

    // Валидация
    if (!bank_account_id || !card_number || !expiry_date || !cvv || !card_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['pink', 'gray'].includes(card_type)) {
      return NextResponse.json({ error: 'Invalid card type' }, { status: 400 })
    }

    // Проверяем лимит розовых карт
    if (card_type === 'pink') {
      const { data: account, error: accountError } = await supabase
        .from('bank_accounts')
        .select('pink_cards_remaining, pink_cards_daily_limit')
        .eq('id', bank_account_id)
        .single()

      if (accountError) {
        return NextResponse.json({ error: 'Bank account not found' }, { status: 404 })
      }

      if (account.pink_cards_remaining <= 0) {
        return NextResponse.json({ error: 'No pink cards remaining for today' }, { status: 400 })
      }

      // Уменьшаем количество розовых карт
      await supabase
        .from('bank_accounts')
        .update({ pink_cards_remaining: account.pink_cards_remaining - 1 })
        .eq('id', bank_account_id)
    }

    const cardData = {
      bank_account_id,
      card_number,
      expiry_date,
      cvv,
      card_type,
      status: 'free'
    }

    const { data, error } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
    }

    return NextResponse.json({ card: data })
  } catch (error) {
    console.error('Error in POST /api/cards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
