// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET CASINOS API CALLED ===')
    
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
      
      // Только Admin и CFO могут видеть казино
      if (!['Admin', 'CFO'].includes(currentUser.role)) {
        console.log('User role not allowed for casinos access:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для просмотра казино. Требуется роль Admin или CFO.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра казино', details: authError.message },
        { status: 403 }
      )
    }

    const { data: casinos, error } = await supabase
      .from('casinos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching casinos:', error)
      return NextResponse.json({ error: 'Failed to fetch casinos' }, { status: 500 })
    }

    return NextResponse.json({ casinos: casinos || [] })
  } catch (error) {
    console.error('Error in GET /api/casinos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== POST CASINOS API CALLED ===')
    
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
      
      // Только Admin и CFO могут создавать казино
      if (!['Admin', 'CFO'].includes(currentUser.role)) {
        console.log('User role not allowed for casinos creation:', currentUser.role)
        return NextResponse.json(
          { error: 'Недостаточно прав для создания казино. Требуется роль Admin или CFO.' },
          { status: 403 }
        )
      }
    } catch (authError) {
      console.error('Auth check failed:', authError)
      return NextResponse.json(
        { error: 'Недостаточно прав для создания казино', details: authError.message },
        { status: 403 }
      )
    }

    const { name, url, commission_rate } = body

    // Валидация
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const casinoData = {
      name,
      url,
      commission_rate: commission_rate || 0
    }

    const { data, error } = await supabase
      .from('casinos')
      .insert(casinoData)
      .select()
      .single()

    if (error) {
      console.error('Error creating casino:', error)
      return NextResponse.json({ error: 'Failed to create casino' }, { status: 500 })
    }

    return NextResponse.json({ casino: data })
  } catch (error) {
    console.error('Error in POST /api/casinos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
