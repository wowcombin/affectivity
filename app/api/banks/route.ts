// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET BANKS API CALLED ===')
    
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
      
      // Только CFO и Admin могут видеть банки
      if (!['Admin', 'CFO'].includes(currentUser.role)) {
        console.log('User role not allowed for banks access:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра банков. Требуется роль Admin или CFO.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра банков', details: authError.message },
        { status: 403 }
      )
    }

    // Проверяем существование таблицы banks
    const { data: tableCheck, error: tableError } = await supabase
      .from('banks')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('Banks table does not exist:', tableError)
      return NextResponse.json({ 
        banks: [],
        message: 'Таблица банков не существует или недоступна'
      })
    }

    // Получаем банки
    const { data: banks, error: banksError } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false })

    if (banksError) {
      console.error('Error fetching banks:', banksError)
      return NextResponse.json({ 
        banks: [],
        bankAccounts: [],
        error: 'Failed to fetch banks',
        details: banksError.message
      })
    }

    // Получаем банковские аккаунты с информацией о банках
    const { data: bankAccounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .select(`
        *,
        banks (
          id,
          name,
          country
        )
      `)
      .order('created_at', { ascending: false })

    if (accountsError) {
      console.error('Error fetching bank accounts:', accountsError)
      return NextResponse.json({ 
        banks: banks || [],
        bankAccounts: [],
        error: 'Failed to fetch bank accounts',
        details: accountsError.message
      })
    }

    return NextResponse.json({ 
      banks: banks || [], 
      bankAccounts: bankAccounts || [] 
    })
  } catch (error) {
    console.error('Error in GET /api/banks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST BANKS API CALLED ===')
    
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
      
      // Только CFO и Admin могут создавать банки
      if (!['Admin', 'CFO'].includes(currentUser.role)) {
        console.log('User role not allowed for banks creation:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для создания банков. Требуется роль Admin или CFO.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания банков', details: authError.message },
        { status: 403 }
      )
    }

    const { type, ...data } = body

    // Определяем тип запроса
    if (type === 'bank') {
      // Создание банка
      const { name, country } = data

      // Валидация
      if (!name || !country) {
        return NextResponse.json({ error: 'Name and country are required' }, { status: 400 })
      }

      const bankData = {
        name,
        country,
        currency: 'USD'
      }

      const { data: bank, error } = await supabase
        .from('banks')
        .insert(bankData as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating bank:', error)
        return NextResponse.json({ error: 'Failed to create bank' }, { status: 500 })
      }

      return NextResponse.json({ bank })
    } else if (type === 'account') {
      // Создание банковского аккаунта
      const { 
        bank_id, 
        account_name, 
        account_number, 
        sort_code, 
        login_url, 
        login_password, 
        bank_address 
      } = data

      // Валидация
      if (!bank_id || !account_name || !account_number || !sort_code || !login_url || !login_password) {
        return NextResponse.json({ error: 'Missing required fields for bank account' }, { status: 400 })
      }

      const accountData = {
        bank_id,
        account_name,
        account_number,
        sort_code,
        login_url,
        login_password,
        bank_address: bank_address || '',
        pink_cards_daily_limit: 5,
        pink_cards_remaining: 5,
        last_reset_date: new Date().toISOString()
      }

      const { data: account, error } = await supabase
        .from('bank_accounts')
        .insert(accountData as any)
        .select()
        .single()

      if (error) {
        console.error('Error creating bank account:', error)
        return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
      }

      return NextResponse.json({ account })
    } else {
      return NextResponse.json({ error: 'Invalid request type. Use "bank" or "account"' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST /api/banks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
