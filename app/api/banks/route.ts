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

    const { data: banks, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching banks:', error)
      return NextResponse.json({ 
        banks: [],
        error: 'Failed to fetch banks',
        details: error.message
      })
    }

    return NextResponse.json({ banks: banks || [] })
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

    const { name, type } = body

    // Валидация
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    if (!['revolut', 'uk', 'other'].includes(type)) {
      return NextResponse.json({ error: 'Invalid bank type' }, { status: 400 })
    }

    const bankData = {
      name,
      type
    }

    const { data, error } = await supabase
      .from('banks')
      .insert(bankData)
      .select()
      .single()

    if (error) {
      console.error('Error creating bank:', error)
      return NextResponse.json({ error: 'Failed to create bank' }, { status: 500 })
    }

    return NextResponse.json({ bank: data })
  } catch (error) {
    console.error('Error in POST /api/banks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
